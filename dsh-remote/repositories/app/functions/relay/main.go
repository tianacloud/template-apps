package main

import (
	"bufio"
	"bytes"
	"crypto/ed25519"
	"crypto/rand"
	"crypto/sha1"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"encoding/binary"
	"encoding/hex"
	"encoding/json"
	"errors"
	"io"
	"log"
	"net"
	"net/http"
	"net/url"
	"os"
	"strings"
	"sync"
	"sync/atomic"
	"time"
)

const (
	wsGUID                  = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
	maxFramePayload         = 1 << 20
	maxQueuedBytes          = 2 << 20
	maxHostQueuedBytes      = 4 << 20
	maxClientHostQueueBytes = 512 << 10
	maxPreAuthPayload       = 4 << 10
	maxPreAuthQueueBytes    = 8 << 10
	maxPreAuthFrames        = 12
	maxWaitingCtrlPerMin    = 12
	maxConfigFileBytes      = 256 << 10
	defaultUnauthTimeout    = 30 * time.Second
	maxPeers                = 24
	maxClients              = 8
	maxSessionAge           = 2 * time.Hour
	readTimeout             = 70 * time.Second
	pingInterval            = 25 * time.Second
	writeTimeout            = 15 * time.Second

	opCont   = 0x0
	opText   = 0x1
	opBinary = 0x2
	opClose  = 0x8
	opPing   = 0x9
	opPong   = 0xA

	msgControlJSON = 0x01
)

type wsFrame struct {
	opcode  byte
	payload []byte
	release func()
}

type wsConn struct {
	readWindow  time.Time
	readFrames  int
	readBytes   uint64
	maxQueued   int64
	netConn     net.Conn
	br          *bufio.Reader
	sendCh      chan wsFrame
	writeMu     sync.Mutex
	queuedBytes atomic.Int64
	lifetime    *time.Timer
	closed      atomic.Bool
	closeCh     chan struct{}
	once        sync.Once
}

func acceptWebSocket(w http.ResponseWriter, r *http.Request) (*wsConn, error) {
	return acceptWebSocketWithQueue(w, r, 24, maxQueuedBytes, maxSessionAge)
}

func isWebSocketUpgrade(r *http.Request) bool {
	return r.Method == http.MethodGet &&
		r.Header.Get("Sec-WebSocket-Version") == "13" &&
		headerContainsToken(r.Header, "Connection", "upgrade") &&
		strings.EqualFold(strings.TrimSpace(r.Header.Get("Upgrade")), "websocket")
}

func acceptWebSocketWithQueue(w http.ResponseWriter, r *http.Request, slots int, maxQueue int64, maxAge time.Duration) (*wsConn, error) {
	if !isWebSocketUpgrade(r) {
		http.Error(w, "websocket upgrade required", http.StatusUpgradeRequired)
		return nil, errors.New("not a websocket upgrade")
	}
	key := strings.TrimSpace(r.Header.Get("Sec-WebSocket-Key"))
	if decoded, err := base64.StdEncoding.DecodeString(key); err != nil || len(decoded) != 16 {
		http.Error(w, "invalid websocket key", http.StatusBadRequest)
		return nil, errors.New("missing websocket key")
	}
	hijacker, ok := w.(http.Hijacker)
	if !ok {
		http.Error(w, "hijack unsupported", http.StatusInternalServerError)
		return nil, errors.New("hijack unsupported")
	}
	conn, brw, err := hijacker.Hijack()
	if err != nil {
		return nil, err
	}

	h := sha1.Sum([]byte(key + wsGUID))
	accept := base64.StdEncoding.EncodeToString(h[:])

	var resp strings.Builder
	resp.WriteString("HTTP/1.1 101 Switching Protocols\r\n")
	resp.WriteString("Upgrade: websocket\r\n")
	resp.WriteString("Connection: Upgrade\r\n")
	resp.WriteString("Sec-WebSocket-Accept: ")
	resp.WriteString(accept)
	resp.WriteString("\r\n")
	if proto := strings.TrimSpace(r.Header.Get("Sec-WebSocket-Protocol")); proto != "" {
		first := strings.TrimSpace(strings.Split(proto, ",")[0])
		if first != "" && !strings.ContainsAny(first, "\r\n") {
			resp.WriteString("Sec-WebSocket-Protocol: ")
			resp.WriteString(first)
			resp.WriteString("\r\n")
		}
	}
	resp.WriteString("\r\n")

	_ = conn.SetWriteDeadline(time.Now().Add(writeTimeout))
	if _, err := io.WriteString(conn, resp.String()); err != nil {
		_ = conn.Close()
		return nil, err
	}

	wc := &wsConn{
		maxQueued: maxQueue,
		netConn:   conn,
		br:        brw.Reader,
		sendCh:    make(chan wsFrame, slots),
		closeCh:   make(chan struct{}),
	}
	_ = conn.SetReadDeadline(time.Now().Add(readTimeout))
	wc.lifetime = time.AfterFunc(maxAge, func() { wc.close(1001, "session expired") })
	go wc.writeLoop()
	return wc, nil
}

func headerContainsToken(h http.Header, key, token string) bool {
	for _, v := range h.Values(key) {
		for _, part := range strings.Split(v, ",") {
			if strings.EqualFold(strings.TrimSpace(part), token) {
				return true
			}
		}
	}
	return false
}

func (c *wsConn) close(code uint16, reason string) {
	c.once.Do(func() {
		c.closed.Store(true)
		close(c.closeCh)
		c.lifetime.Stop()
		if code != 0 && c.writeMu.TryLock() {
			payload := make([]byte, 2+len(reason))
			binary.BigEndian.PutUint16(payload[:2], code)
			copy(payload[2:], reason)
			_ = c.writeFrame(opClose, payload, 100*time.Millisecond)
			c.writeMu.Unlock()
		}
		_ = c.netConn.Close()
	})
}

func (c *wsConn) sendBinary(payload []byte) bool {
	return c.enqueue(wsFrame{opcode: opBinary, payload: payload}, true)
}

func (c *wsConn) tryEnqueueBinary(payload []byte, release func()) bool {
	return c.enqueue(wsFrame{opcode: opBinary, payload: payload, release: release}, false)
}

func (c *wsConn) enqueue(frame wsFrame, closeOnOverflow bool) bool {
	if c.closed.Load() {
		return false
	}
	size := int64(len(frame.payload))
	limit := c.maxQueued
	if limit <= 0 {
		limit = maxQueuedBytes
	}
	if c.queuedBytes.Add(size) <= limit {
		select {
		case c.sendCh <- frame:
			return true
		case <-c.closeCh:
		default:
		}
	}
	c.queuedBytes.Add(-size)
	if closeOnOverflow {
		c.close(0, "")
	}
	return false
}

func (c *wsConn) drainReleases() {
	for {
		select {
		case f := <-c.sendCh:
			c.queuedBytes.Add(-int64(len(f.payload)))
			if f.release != nil {
				f.release()
			}
		default:
			return
		}
	}
}

func (c *wsConn) writeLoop() {
	ticker := time.NewTicker(pingInterval)
	defer func() {
		ticker.Stop()
		c.drainReleases()
	}()
	for {
		select {
		case <-c.closeCh:
			return
		case f := <-c.sendCh:
			c.queuedBytes.Add(-int64(len(f.payload)))
			if f.release != nil {
				f.release()
			}
			if err := c.writeRawFrame(f.opcode, f.payload); err != nil {
				c.close(0, "")
				return
			}
		case <-ticker.C:
			if err := c.writeRawFrame(opPing, []byte("hb")); err != nil {
				c.close(0, "")
				return
			}
		}
	}
}

func (c *wsConn) writeRawFrame(opcode byte, payload []byte) error {
	c.writeMu.Lock()
	defer c.writeMu.Unlock()
	return c.writeFrame(opcode, payload, writeTimeout)
}

func (c *wsConn) writeFrame(opcode byte, payload []byte, timeout time.Duration) error {
	_ = c.netConn.SetWriteDeadline(time.Now().Add(timeout))
	var hdr [10]byte
	hdr[0] = 0x80 | (opcode & 0x0f)
	n := len(payload)
	hlen := 2
	switch {
	case n < 126:
		hdr[1] = byte(n)
	case n <= 65535:
		hdr[1] = 126
		binary.BigEndian.PutUint16(hdr[2:4], uint16(n))
		hlen = 4
	default:
		hdr[1] = 127
		binary.BigEndian.PutUint64(hdr[2:10], uint64(n))
		hlen = 10
	}
	if _, err := c.netConn.Write(hdr[:hlen]); err != nil {
		return err
	}
	if n > 0 {
		if _, err := c.netConn.Write(payload); err != nil {
			return err
		}
	}
	return nil
}

func (c *wsConn) readMessage() (byte, []byte, error) {
	var msgOpcode byte
	var buf bytes.Buffer
	for {
		var hdr [2]byte
		if _, err := io.ReadFull(c.br, hdr[:]); err != nil {
			return 0, nil, err
		}
		fin := (hdr[0] & 0x80) != 0
		opcode := hdr[0] & 0x0f
		masked := (hdr[1] & 0x80) != 0
		plen := uint64(hdr[1] & 0x7f)
		if !masked || hdr[0]&0x70 != 0 {
			return 0, nil, errors.New("invalid websocket frame flags")
		}
		if opcode >= 0x8 && (!fin || plen > 125 || opcode > opPong) {
			return 0, nil, errors.New("invalid websocket control frame")
		}
		if opcode < 0x8 && (opcode > opBinary || (opcode == opCont) != (msgOpcode != 0)) {
			return 0, nil, errors.New("invalid websocket fragmentation")
		}

		switch plen {
		case 126:
			var ext [2]byte
			if _, err := io.ReadFull(c.br, ext[:]); err != nil {
				return 0, nil, err
			}
			plen = uint64(binary.BigEndian.Uint16(ext[:]))
		case 127:
			var ext [8]byte
			if _, err := io.ReadFull(c.br, ext[:]); err != nil {
				return 0, nil, err
			}
			plen = binary.BigEndian.Uint64(ext[:])
		}

		if plen > maxFramePayload || uint64(buf.Len())+plen > maxFramePayload {
			return 0, nil, errors.New("frame exceeds max payload")
		}

		now := time.Now()
		if now.Sub(c.readWindow) >= time.Second {
			c.readWindow, c.readFrames, c.readBytes = now, 0, 0
		}
		c.readFrames++
		c.readBytes += plen
		if c.readFrames > 512 || c.readBytes > 32<<20 {
			return 0, nil, errors.New("websocket rate limit")
		}
		var maskKey [4]byte
		if masked {
			if _, err := io.ReadFull(c.br, maskKey[:]); err != nil {
				return 0, nil, err
			}
		}

		payload := make([]byte, plen)
		if plen > 0 {
			if _, err := io.ReadFull(c.br, payload); err != nil {
				return 0, nil, err
			}
			if masked {
				for i := range payload {
					payload[i] ^= maskKey[i%4]
				}
			}
		}

		// Control frames may be interleaved between fragments.
		if opcode >= 0x8 {
			switch opcode {
			case opClose:
				c.close(1000, "")
				return 0, nil, io.EOF
			case opPing:
				c.enqueue(wsFrame{opcode: opPong, payload: payload}, true)
			case opPong:
				if string(payload) == "hb" {
					_ = c.netConn.SetReadDeadline(time.Now().Add(readTimeout))
				}
			}
			continue
		}

		if opcode != opCont {
			msgOpcode = opcode
		}
		buf.Write(payload)
		if fin {
			return msgOpcode, buf.Bytes(), nil
		}
	}
}

type hostInfo struct {
	HostID      string `json:"hostId"`
	Name        string `json:"name"`
	TenantID    string `json:"tenantId,omitempty"`
	UserID      string `json:"userId,omitempty"`
	ConnectedAt int64  `json:"connectedAt"`
	Clients     int    `json:"clients"`
}

type hostEntry struct {
	id          string
	name        string
	tenantID    string
	userID      string
	webID       string
	policyEpoch uint64
	connectedAt int64
	conn        *wsConn
	mu          sync.Mutex
	sessions    map[uint32]*clientSession
}

type callerIdentity struct {
	UserID     string `json:"userId"`
	TenantID   string `json:"tenantId"`
	WebID      string `json:"webId,omitempty"`
	AppOwnerID string `json:"appOwnerId,omitempty"`
}

func (c callerIdentity) IsAppOwner() bool {
	return c.AppOwnerID != "" && c.UserID == c.AppOwnerID
}

func validCallerID(s string) bool {
	if len(s) == 0 || len(s) > 128 {
		return false
	}
	for i := 0; i < len(s); i++ {
		ch := s[i]
		alnum := (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9')
		if i == 0 {
			if !alnum {
				return false
			}
			continue
		}
		if !alnum && ch != '.' && ch != '_' && ch != ':' && ch != '-' {
			return false
		}
	}
	return true
}

func validHostID(s string) bool {
	if len(s) == 0 || len(s) > 48 {
		return false
	}
	for i := 0; i < len(s); i++ {
		ch := s[i]
		if !((ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9') || ch == '_' || ch == '-') {
			return false
		}
	}
	return true
}

func validOrigin(raw string) bool {
	if raw == "" || strings.TrimSpace(raw) != raw {
		return false
	}
	u, err := url.Parse(raw)
	if err != nil || u.User != nil || u.Host == "" || u.RawQuery != "" || u.Fragment != "" {
		return false
	}
	if u.Path != "" && u.Path != "/" {
		return false
	}
	if u.Path == "/" {
		return false
	}
	if u.Scheme == "https" {
		return true
	}
	if u.Scheme == "http" {
		host := u.Hostname()
		return host == "127.0.0.1" || host == "::1" || host == "localhost"
	}
	return false
}

func singleHeaderExact(h http.Header, target string) (string, int) {
	count := 0
	var val string
	for k, vals := range h {
		if strings.EqualFold(k, target) {
			count += len(vals)
			if len(vals) == 1 {
				val = vals[0]
			}
		}
	}
	return val, count
}

func callerFromRequest(r *http.Request) (callerIdentity, bool) {
	uid, uidCount := singleHeaderExact(r.Header, "Tiana-Caller-User-Id")
	tid, tidCount := singleHeaderExact(r.Header, "Tiana-Caller-Tenant-Id")
	ownerID, ownerCount := singleHeaderExact(r.Header, "Tiana-Caller-App-Owner-Id")
	webID, webCount := singleHeaderExact(r.Header, "Tiana-Caller-Web-Id")
	if uidCount != 1 || tidCount != 1 || ownerCount > 1 || webCount > 1 {
		return callerIdentity{}, false
	}
	if !validCallerID(uid) || !validCallerID(tid) {
		return callerIdentity{}, false
	}
	if ownerCount == 1 && !validCallerID(ownerID) {
		return callerIdentity{}, false
	}
	if webCount == 1 && !validCallerID(webID) {
		return callerIdentity{}, false
	}
	return callerIdentity{
		UserID:     uid,
		TenantID:   tid,
		WebID:      webID,
		AppOwnerID: ownerID,
	}, true
}

func hasAnyCallerHeader(h http.Header) bool {
	for k := range h {
		if strings.HasPrefix(strings.ToLower(k), "tiana-caller-") {
			return true
		}
	}
	return false
}

type clientSession struct {
	id             uint32
	conn           *wsConn
	identity       callerIdentity
	origin         string
	challenge      string
	admittedAt     time.Time
	maxAge         time.Duration
	unauthTimer    *time.Timer
	authenticated  atomic.Bool
	preAuthFrames  atomic.Int32
	inflightToHost atomic.Int64
	waitCtrlWindow time.Time
	waitCtrlCount  int
	mu             sync.Mutex
	host           *hostEntry
}

func (s *clientSession) armUnauthTimer(timeout time.Duration) {
	if timeout <= 0 {
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.unauthTimer != nil || s.authenticated.Load() {
		return
	}
	s.unauthTimer = time.AfterFunc(timeout, func() {
		if !s.authenticated.Load() {
			s.conn.close(1008, "authentication timeout")
		}
	})
}

func (s *clientSession) stopUnauthTimer() {
	s.mu.Lock()
	t := s.unauthTimer
	s.unauthTimer = nil
	s.mu.Unlock()
	if t != nil {
		t.Stop()
	}
}

func (s *clientSession) markAuthenticated() {
	if s.authenticated.CompareAndSwap(false, true) {
		s.stopUnauthTimer()
	}
}

func (s *clientSession) forwardToHost(host *hostEntry, payload []byte) bool {
	authed := s.authenticated.Load()
	if !authed {
		if len(payload) > maxPreAuthPayload || s.preAuthFrames.Add(1) > maxPreAuthFrames {
			return false
		}
	}
	fwd := make([]byte, 4+len(payload))
	binary.BigEndian.PutUint32(fwd[0:4], s.id)
	copy(fwd[4:], payload)

	size := int64(len(fwd))
	quota := int64(maxClientHostQueueBytes)
	if !authed {
		quota = maxPreAuthQueueBytes
	}
	if s.inflightToHost.Add(size) > quota {
		s.inflightToHost.Add(-size)
		return false
	}
	released := atomic.Bool{}
	release := func() {
		if released.CompareAndSwap(false, true) {
			s.inflightToHost.Add(-size)
		}
	}
	if !host.conn.tryEnqueueBinary(fwd, release) {
		release()
		return false
	}
	return true
}

type relayAccess struct {
	Version       int    `json:"version,omitempty"`
	HostID        string `json:"hostId"`
	HostName      string `json:"hostName,omitempty"`
	HostDigest    string `json:"hostDigest"`
	HostPublicKey string `json:"hostPublicKey,omitempty"`
	OwnerUserID   string `json:"ownerUserId"`
	OwnerTenantID string `json:"ownerTenantId"`
	WebID         string `json:"webId"`
	Origin        string `json:"origin"`
	UpdatedAt     string `json:"updatedAt,omitempty"`
}

// Provisioning or template installation may set these compile-time defaults.
// Neither contains any registration key, E2EE key or platform credential.
var relayConfigJSON = ""
var defaultWebID = "__TIANA_WEB_ID_5f3b9d02__"

func effectiveDefaultWebID(raw string) string {
	v := strings.TrimSpace(raw)
	if v == "" || strings.HasPrefix(v, "__TIANA_WEB_ID_") {
		return ""
	}
	return v
}

type resolvedPolicy struct {
	Paired bool
	Access relayAccess
	Key    string
}

func policyComparisonKey(paired bool, a relayAccess) string {
	if !paired {
		return "unpaired:" + a.WebID
	}
	return strings.Join([]string{
		"paired", a.HostID, a.HostDigest, a.HostPublicKey, a.OwnerUserID, a.OwnerTenantID, a.WebID, a.Origin,
	}, "|")
}

func validatePairedAccess(a relayAccess, requireVersion bool, pinnedWebID string) error {
	if requireVersion && a.Version != 1 {
		return errors.New("unsupported policy version")
	}
	if !validHostID(a.HostID) {
		return errors.New("invalid hostId")
	}
	if len(a.HostName) > 128 {
		return errors.New("invalid hostName")
	}
	if !validCallerID(a.OwnerUserID) || !validCallerID(a.OwnerTenantID) || !validCallerID(a.WebID) {
		return errors.New("invalid owner or webId")
	}
	if pinnedWebID != "" && a.WebID != pinnedWebID {
		return errors.New("policy webId mismatch")
	}
	if !validOrigin(a.Origin) {
		return errors.New("invalid policy origin")
	}
	if a.HostDigest == "" {
		return errors.New("missing hostDigest")
	}
	if len(a.HostDigest) != sha256.Size*2 {
		return errors.New("invalid hostDigest length")
	}
	if _, err := hex.DecodeString(a.HostDigest); err != nil {
		return errors.New("invalid hostDigest hex")
	}
	if a.HostPublicKey != "" {
		pub, err := base64.RawURLEncoding.DecodeString(a.HostPublicKey)
		if err != nil || len(pub) != ed25519.PublicKeySize {
			return errors.New("invalid hostPublicKey")
		}
	}
	return nil
}

type policySource struct {
	mu           sync.Mutex
	configFile   string
	fallbackJSON string
	defaultWebID string
	staticPolicy *resolvedPolicy
	cachedPath   string
	cachedMod    time.Time
	cachedSize   int64
	lastGood     resolvedPolicy
	hasLastGood  bool
}

func (ps *policySource) resolve() (resolvedPolicy, error) {
	ps.mu.Lock()
	defer ps.mu.Unlock()

	if ps.staticPolicy != nil {
		return *ps.staticPolicy, nil
	}

	pinnedWeb := effectiveDefaultWebID(ps.defaultWebID)
	cfgPath := ps.configFile
	if cfgPath == "" {
		cfgPath = strings.TrimSpace(os.Getenv("FUNCTION_CONFIG_FILE"))
	}

	if cfgPath != "" {
		info, err := os.Stat(cfgPath)
		if err == nil {
			if ps.hasLastGood && ps.cachedPath == cfgPath && ps.cachedMod.Equal(info.ModTime()) && ps.cachedSize == info.Size() {
				return ps.lastGood, nil
			}
			f, openErr := os.Open(cfgPath)
			if openErr != nil {
				if ps.hasLastGood {
					return ps.lastGood, nil
				}
				return resolvedPolicy{}, openErr
			}
			raw, readErr := io.ReadAll(io.LimitReader(f, maxConfigFileBytes+1))
			_ = f.Close()
			if readErr != nil || len(raw) > maxConfigFileBytes {
				if ps.hasLastGood {
					return ps.lastGood, nil
				}
				return resolvedPolicy{}, errors.New("failed to read function config")
			}
			var cfgMap map[string]struct {
				Kind  string `json:"kind"`
				Value string `json:"value"`
			}
			if unmarshalErr := json.Unmarshal(raw, &cfgMap); unmarshalErr != nil {
				if ps.hasLastGood {
					return ps.lastGood, nil
				}
				return resolvedPolicy{}, errors.New("invalid function config json")
			}
			if entry, ok := cfgMap["DSH_REMOTE_POLICY"]; ok && strings.TrimSpace(entry.Value) != "" {
				if entry.Kind != "plain" {
					return resolvedPolicy{}, errors.New("DSH_REMOTE_POLICY must be plain")
				}
				var access relayAccess
				if err := json.Unmarshal([]byte(entry.Value), &access); err != nil {
					return resolvedPolicy{}, errors.New("invalid DSH_REMOTE_POLICY json")
				}
				if err := validatePairedAccess(access, true, pinnedWeb); err != nil {
					return resolvedPolicy{}, err
				}
				pol := resolvedPolicy{
					Paired: true,
					Access: access,
					Key:    policyComparisonKey(true, access),
				}
				ps.cachedPath = cfgPath
				ps.cachedMod = info.ModTime()
				ps.cachedSize = info.Size()
				ps.lastGood = pol
				ps.hasLastGood = true
				return pol, nil
			}
			// Config file exists without DSH_REMOTE_POLICY; fall through to fallback/unpaired.
			pol, err := ps.resolveFallbackLocked(pinnedWeb)
			if err == nil {
				ps.cachedPath = cfgPath
				ps.cachedMod = info.ModTime()
				ps.cachedSize = info.Size()
				ps.lastGood = pol
				ps.hasLastGood = true
			}
			return pol, err
		} else if os.IsNotExist(err) {
			// Preserve lastGood across transient ENOENT during atomic config replacement.
			if ps.hasLastGood && ps.cachedPath == cfgPath {
				return ps.lastGood, nil
			}
		} else {
			if ps.hasLastGood {
				return ps.lastGood, nil
			}
			return resolvedPolicy{}, err
		}
	}

	return ps.resolveFallbackLocked(pinnedWeb)
}

func (ps *policySource) resolveFallbackLocked(pinnedWeb string) (resolvedPolicy, error) {
	if strings.TrimSpace(ps.fallbackJSON) != "" {
		var access relayAccess
		if err := json.Unmarshal([]byte(ps.fallbackJSON), &access); err != nil {
			return resolvedPolicy{}, errors.New("invalid relayConfigJSON")
		}
		if err := validatePairedAccess(access, false, pinnedWeb); err != nil {
			return resolvedPolicy{}, err
		}
		return resolvedPolicy{
			Paired: true,
			Access: access,
			Key:    policyComparisonKey(true, access),
		}, nil
	}
	if envHost := strings.TrimSpace(os.Getenv("DSH_REMOTE_EXPECTED_HOST_ID")); envHost != "" {
		access := relayAccess{
			HostID:        envHost,
			HostName:      strings.TrimSpace(os.Getenv("DSH_REMOTE_HOST_NAME")),
			HostDigest:    strings.TrimSpace(os.Getenv("DSH_REMOTE_HOST_DIGEST")),
			HostPublicKey: strings.TrimSpace(os.Getenv("DSH_REMOTE_HOST_PUBLIC_KEY")),
			OwnerUserID:   strings.TrimSpace(os.Getenv("DSH_REMOTE_OWNER_USER_ID")),
			OwnerTenantID: strings.TrimSpace(os.Getenv("DSH_REMOTE_OWNER_TENANT_ID")),
			WebID:         strings.TrimSpace(os.Getenv("DSH_REMOTE_WEB_ID")),
			Origin:        strings.TrimSpace(os.Getenv("DSH_REMOTE_ORIGIN")),
		}
		if err := validatePairedAccess(access, false, pinnedWeb); err != nil {
			return resolvedPolicy{}, err
		}
		return resolvedPolicy{
			Paired: true,
			Access: access,
			Key:    policyComparisonKey(true, access),
		}, nil
	}
	unpaired := relayAccess{WebID: pinnedWeb}
	return resolvedPolicy{
		Paired: false,
		Access: unpaired,
		Key:    policyComparisonKey(false, unpaired),
	}, nil
}

type relayHub struct {
	syncMu        sync.Mutex
	policy        policySource
	policyEpoch   uint64
	paired        bool
	access        relayAccess
	policyKey     string
	sessionMaxAge time.Duration
	unauthTimeout time.Duration
	peers         chan struct{}
	clients       chan struct{}
	mu            sync.RWMutex
	hosts         map[string]*hostEntry
	allClients    map[uint32]*clientSession
	nextSID       atomic.Uint64
}

func newRelayHub(access relayAccess) *relayHub {
	paired := access.HostID != ""
	pol := resolvedPolicy{
		Paired: paired,
		Access: access,
		Key:    policyComparisonKey(paired, access),
	}
	return &relayHub{
		policy:        policySource{staticPolicy: &pol},
		policyEpoch:   1,
		paired:        paired,
		access:        access,
		policyKey:     pol.Key,
		hosts:         make(map[string]*hostEntry),
		allClients:    make(map[uint32]*clientSession),
		sessionMaxAge: maxSessionAge,
		unauthTimeout: defaultUnauthTimeout,
		peers:         make(chan struct{}, maxPeers),
		clients:       make(chan struct{}, maxClients),
	}
}

func newDynamicRelayHub(configFile, fallbackJSON, pinnedWebID string) *relayHub {
	h := &relayHub{
		policy: policySource{
			configFile:   configFile,
			fallbackJSON: fallbackJSON,
			defaultWebID: pinnedWebID,
		},
		policyEpoch:   1,
		hosts:         make(map[string]*hostEntry),
		allClients:    make(map[uint32]*clientSession),
		sessionMaxAge: maxSessionAge,
		unauthTimeout: defaultUnauthTimeout,
		peers:         make(chan struct{}, maxPeers),
		clients:       make(chan struct{}, maxClients),
	}
	if pol, err := h.policy.resolve(); err == nil {
		h.paired = pol.Paired
		h.access = pol.Access
		h.policyKey = pol.Key
	}
	return h
}

func (h *relayHub) syncPolicy() (resolvedPolicy, uint64, error) {
	h.syncMu.Lock()
	defer h.syncMu.Unlock()

	pol, err := h.policy.resolve()
	if err != nil {
		return resolvedPolicy{}, 0, err
	}
	epoch := h.applyPolicy(pol)
	return pol, epoch, nil
}

func (h *relayHub) applyPolicy(pol resolvedPolicy) uint64 {
	var evictHosts []*hostEntry
	var evictClients []*clientSession

	h.mu.Lock()
	if h.policyKey == pol.Key {
		epoch := h.policyEpoch
		h.mu.Unlock()
		return epoch
	}
	wasPaired := h.paired
	h.policyEpoch++
	epoch := h.policyEpoch
	h.paired = pol.Paired
	h.access = pol.Access
	h.policyKey = pol.Key

	if wasPaired {
		for id, entry := range h.hosts {
			evictHosts = append(evictHosts, entry)
			delete(h.hosts, id)
		}
		for _, s := range h.allClients {
			evictClients = append(evictClients, s)
		}
	} else if pol.Paired {
		// Unpaired -> Paired transition: keep waiting Owner clients matching the new policy
		// so they receive host_online seamlessly; evict any non-matching sessions.
		for _, s := range h.allClients {
			if s.identity.UserID != pol.Access.OwnerUserID ||
				s.identity.TenantID != pol.Access.OwnerTenantID ||
				s.identity.WebID != pol.Access.WebID ||
				s.origin != pol.Access.Origin {
				evictClients = append(evictClients, s)
			}
		}
	}
	h.mu.Unlock()

	for _, entry := range evictHosts {
		entry.disconnectClients("policy updated")
		entry.conn.close(1012, "policy updated")
	}
	for _, s := range evictClients {
		s.conn.close(1012, "policy updated")
	}
	return epoch
}

func (h *relayHub) isHostConnected(hostID string) bool {
	if hostID == "" {
		return false
	}
	h.mu.RLock()
	defer h.mu.RUnlock()
	return h.hosts[hostID] != nil
}

func (h *relayHub) listHosts() []hostInfo {
	h.mu.RLock()
	defer h.mu.RUnlock()
	out := make([]hostInfo, 0, len(h.hosts))
	for _, entry := range h.hosts {
		entry.mu.Lock()
		clients := len(entry.sessions)
		entry.mu.Unlock()
		out = append(out, hostInfo{
			HostID:      entry.id,
			Name:        entry.name,
			TenantID:    entry.tenantID,
			UserID:      entry.userID,
			ConnectedAt: entry.connectedAt,
			Clients:     clients,
		})
	}
	return out
}

func marshalClientControlFrame(obj any) ([]byte, bool) {
	body, err := json.Marshal(obj)
	if err != nil {
		return nil, false
	}
	frame := make([]byte, 5+len(body))
	binary.BigEndian.PutUint32(frame[0:4], 0)
	frame[4] = msgControlJSON
	copy(frame[5:], body)
	return frame, true
}

func (h *relayHub) enqueueHostOnlineLocked(entry *hostEntry, hostDigest string) []*wsConn {
	if !h.paired || h.policyEpoch != entry.policyEpoch || h.hosts[entry.id] != entry {
		return nil
	}
	if len(h.allClients) == 0 {
		return nil
	}
	frame, ok := marshalClientControlFrame(map[string]any{
		"type":          "host_online",
		"paired":        true,
		"hostConnected": true,
		"hostId":        entry.id,
		"hostName":      entry.name,
		"hostDigest":    hostDigest,
		"ts":            time.Now().UnixMilli(),
	})
	if !ok {
		return nil
	}
	var overflowed []*wsConn
	for _, s := range h.allClients {
		if s.identity.UserID != entry.userID ||
			s.identity.TenantID != entry.tenantID ||
			s.identity.WebID != entry.webID {
			continue
		}
		if s.conn == nil || s.conn.closed.Load() {
			continue
		}
		frameCopy := append([]byte(nil), frame...)
		if !s.conn.tryEnqueueBinary(frameCopy, nil) && !s.conn.closed.Load() {
			overflowed = append(overflowed, s.conn)
		}
	}
	return overflowed
}

func (h *relayHub) broadcastHostOnline(entry *hostEntry, hostDigest string) {
	h.mu.RLock()
	overflowed := h.enqueueHostOnlineLocked(entry, hostDigest)
	h.mu.RUnlock()

	for _, c := range overflowed {
		c.close(1008, "control queue overflow")
	}
}

func (h *relayHub) registerHost(id, name, tenantID, userID string, conn *wsConn, expectedEpoch uint64, expectedPolicyKey string) (*hostEntry, bool) {
	if id == "" {
		id = "default"
	}
	if name == "" {
		name = id
	}
	entry := &hostEntry{
		id:          id,
		name:        name,
		tenantID:    tenantID,
		userID:      userID,
		connectedAt: time.Now().UnixMilli(),
		conn:        conn,
		sessions:    make(map[uint32]*clientSession),
	}

	h.mu.Lock()
	if h.policyEpoch != expectedEpoch || !h.paired || h.policyKey != expectedPolicyKey ||
		h.access.HostID != id || h.access.OwnerUserID != userID || h.access.OwnerTenantID != tenantID {
		h.mu.Unlock()
		return nil, false
	}
	entry.webID = h.access.WebID
	entry.policyEpoch = h.policyEpoch
	hostDigest := h.access.HostDigest
	prev := h.hosts[id]
	h.hosts[id] = entry
	overflowed := h.enqueueHostOnlineLocked(entry, hostDigest)
	h.mu.Unlock()

	if prev != nil {
		prev.disconnectClients("host reconnected")
		prev.conn.close(1000, "replaced by newer host connection")
	}
	for _, c := range overflowed {
		c.close(1008, "control queue overflow")
	}
	return entry, true
}

func (h *relayHub) registerClient(session *clientSession, expectedEpoch uint64, expectedPolicyKey string, expectedPaired bool) bool {
	h.mu.Lock()
	defer h.mu.Unlock()
	if h.policyEpoch != expectedEpoch || h.policyKey != expectedPolicyKey || h.paired != expectedPaired {
		return false
	}
	if h.paired {
		if session.identity.UserID != h.access.OwnerUserID ||
			session.identity.TenantID != h.access.OwnerTenantID ||
			session.identity.WebID != h.access.WebID ||
			session.origin != h.access.Origin {
			return false
		}
	}
	h.allClients[session.id] = session
	return true
}

func (h *relayHub) unregisterHost(entry *hostEntry) {
	h.mu.Lock()
	if h.hosts[entry.id] == entry {
		delete(h.hosts, entry.id)
	}
	h.mu.Unlock()
	entry.disconnectClients("host disconnected")
}

func (e *hostEntry) disconnectClients(reason string) {
	e.mu.Lock()
	sessions := make([]*clientSession, 0, len(e.sessions))
	for _, s := range e.sessions {
		sessions = append(sessions, s)
	}
	e.sessions = make(map[uint32]*clientSession)
	e.mu.Unlock()

	for _, s := range sessions {
		s.mu.Lock()
		if s.host == e {
			s.host = nil
		}
		s.mu.Unlock()
		sendClientControl(s.conn, map[string]any{
			"type":   "host_disconnected",
			"hostId": e.id,
			"reason": reason,
		})
		s.conn.close(1012, reason)
	}
}

func (h *relayHub) bindSession(s *clientSession, hostID string, expectedEpoch uint64) (*hostEntry, error) {
	h.mu.RLock()
	if expectedEpoch > 0 && h.policyEpoch != expectedEpoch {
		h.mu.RUnlock()
		return nil, errors.New("policy updated")
	}
	paired := h.paired
	configuredHostID := h.access.HostID
	if !paired || configuredHostID == "" {
		h.mu.RUnlock()
		return nil, errors.New("relay is not paired")
	}
	if s.identity.UserID != h.access.OwnerUserID ||
		s.identity.TenantID != h.access.OwnerTenantID ||
		s.identity.WebID != h.access.WebID ||
		s.origin != h.access.Origin {
		h.mu.RUnlock()
		return nil, errors.New("policy identity mismatch")
	}
	if hostID != "" && hostID != configuredHostID {
		h.mu.RUnlock()
		return nil, errors.New("host unavailable")
	}
	target := h.hosts[configuredHostID]
	if target == nil {
		h.mu.RUnlock()
		return nil, errors.New("host is offline")
	}
	s.mu.Lock()
	if s.host == target {
		s.mu.Unlock()
		h.mu.RUnlock()
		return target, nil
	}
	// A disconnected or replaced host closes its clients. Only a new
	// WebSocket can bind to the replacement.
	if s.host != nil {
		s.mu.Unlock()
		h.mu.RUnlock()
		return nil, errors.New("client must reconnect")
	}
	s.host = target
	target.mu.Lock()
	target.sessions[s.id] = s
	target.mu.Unlock()
	s.mu.Unlock()
	h.mu.RUnlock()

	remainingMs := (s.maxAge - time.Since(s.admittedAt)).Milliseconds()
	if remainingMs <= 0 {
		h.closeSession(s)
		return nil, errors.New("client session expired")
	}

	s.armUnauthTimer(h.unauthTimeout)

	if !sendHostControl(target.conn, map[string]any{
		"type": "open_session", "sessionId": s.id, "hostId": target.id,
		"userId": s.identity.UserID, "tenantId": s.identity.TenantID, "webId": s.identity.WebID,
		"challenge": s.challenge, "admittedAt": s.admittedAt.UnixMilli(), "remainingMs": remainingMs,
	}) {
		h.closeSession(s)
		return nil, errors.New("host is disconnected")
	}
	return target, nil
}

func (h *relayHub) closeSession(s *clientSession) {
	s.mu.Lock()
	host := s.host
	s.host = nil
	s.mu.Unlock()
	if host != nil {
		host.mu.Lock()
		delete(host.sessions, s.id)
		host.mu.Unlock()
		sendHostControl(host.conn, map[string]any{
			"type":      "close_session",
			"sessionId": s.id,
		})
	}
}

// Client wire frame: [4B streamId][1B msgType][payload]
func sendClientControl(conn *wsConn, obj any) {
	body, err := json.Marshal(obj)
	if err != nil {
		return
	}
	frame := make([]byte, 5+len(body))
	binary.BigEndian.PutUint32(frame[0:4], 0)
	frame[4] = msgControlJSON
	copy(frame[5:], body)
	conn.sendBinary(frame)
}

// Host wire frame: [4B sessionId][4B streamId][1B msgType][payload]
func sendHostControl(conn *wsConn, obj any) bool {
	body, err := json.Marshal(obj)
	if err != nil {
		return false
	}
	frame := make([]byte, 9+len(body))
	binary.BigEndian.PutUint32(frame[0:4], 0)
	binary.BigEndian.PutUint32(frame[4:8], 0)
	frame[8] = msgControlJSON
	copy(frame[9:], body)
	return conn.tryEnqueueBinary(frame, nil)
}

func acquire(slot chan struct{}) bool {
	select {
	case slot <- struct{}{}:
		return true
	default:
		return false
	}
}

func verifyHostAuth(r *http.Request, hostID string, access relayAccess) bool {
	if hostID == "" || hostID != access.HostID {
		return false
	}
	if len(r.Header.Values("Origin")) != 0 || hasAnyCallerHeader(r.Header) {
		return false
	}
	if access.HostDigest != "" {
		want, err := hex.DecodeString(access.HostDigest)
		key, keyCount := singleHeaderExact(r.Header, "Dsh-Host-Registration")
		if err != nil || len(want) != sha256.Size || keyCount != 1 || len(key) != 43 {
			return false
		}
		actual := sha256.Sum256([]byte(key))
		if subtle.ConstantTimeCompare(want, actual[:]) != 1 {
			return false
		}
	}
	if access.HostPublicKey != "" {
		pubBytes, err := base64.RawURLEncoding.DecodeString(access.HostPublicKey)
		if err != nil || len(pubBytes) != ed25519.PublicKeySize {
			return false
		}
		sigHeader, sigCount := singleHeaderExact(r.Header, "Dsh-Host-Signature")
		tsHeader, tsCount := singleHeaderExact(r.Header, "Dsh-Host-Timestamp")
		if sigCount != 1 || tsCount != 1 {
			return false
		}
		sigBytes, err := base64.RawURLEncoding.DecodeString(sigHeader)
		if err != nil || len(sigBytes) != ed25519.SignatureSize {
			return false
		}
		msg := []byte("dsh-remote-host:" + hostID + ":" + tsHeader)
		if !ed25519.Verify(ed25519.PublicKey(pubBytes), msg, sigBytes) {
			return false
		}
	}
	return true
}

func (h *relayHub) handleHostWS(w http.ResponseWriter, r *http.Request) {
	pol, epoch, err := h.syncPolicy()
	if err != nil {
		http.Error(w, "invalid relay policy", http.StatusServiceUnavailable)
		return
	}
	if !pol.Paired {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}
	hostID := r.URL.Query().Get("host_id")
	if !verifyHostAuth(r, hostID, pol.Access) {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}
	if !acquire(h.peers) {
		http.Error(w, "relay at capacity", http.StatusTooManyRequests)
		return
	}
	defer func() { <-h.peers }()
	conn, err := acceptWebSocketWithQueue(w, r, 256, maxHostQueuedBytes, h.sessionMaxAge)
	if err != nil {
		return
	}
	name := strings.TrimSpace(r.URL.Query().Get("name"))
	if name == "" {
		name = pol.Access.HostName
	}
	if len(name) > 128 {
		name = hostID
	}
	tenantID, userID := pol.Access.OwnerTenantID, pol.Access.OwnerUserID

	entry, ok := h.registerHost(hostID, name, tenantID, userID, conn, epoch, pol.Key)
	if !ok {
		conn.close(1012, "policy updated")
		return
	}
	defer func() {
		h.unregisterHost(entry)
		conn.close(1000, "")
	}()

	sendHostControl(conn, map[string]any{
		"type":     "host_registered",
		"version":  2,
		"hostId":   entry.id,
		"name":     entry.name,
		"tenantId": entry.tenantID,
		"userId":   entry.userID,
	})

	for {
		opcode, payload, err := conn.readMessage()
		if err != nil {
			return
		}
		if opcode != opBinary || len(payload) < 9 {
			continue
		}
		sid := binary.BigEndian.Uint32(payload[0:4])
		if sid == 0 {
			streamID := binary.BigEndian.Uint32(payload[4:8])
			if streamID == 0 && payload[8] == msgControlJSON && len(payload) <= 1024 {
				var ctrl struct {
					Type      string `json:"type"`
					SessionID uint32 `json:"sessionId"`
				}
				if json.Unmarshal(payload[9:], &ctrl) == nil && ctrl.Type == "session_authenticated" && ctrl.SessionID > 0 {
					entry.mu.Lock()
					s := entry.sessions[ctrl.SessionID]
					entry.mu.Unlock()
					if s != nil {
						s.markAuthenticated()
					}
				}
			}
			continue
		}
		entry.mu.Lock()
		session := entry.sessions[sid]
		entry.mu.Unlock()
		if session != nil {
			session.conn.sendBinary(payload[4:])
		}
	}
}

func (h *relayHub) handleClientWS(w http.ResponseWriter, r *http.Request) {
	pol, epoch, err := h.syncPolicy()
	if err != nil {
		http.Error(w, "invalid relay policy", http.StatusServiceUnavailable)
		return
	}
	caller, ok := callerFromRequest(r)
	origin, originCount := singleHeaderExact(r.Header, "Origin")
	if !ok || originCount != 1 || !validOrigin(origin) {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	if !pol.Paired {
		if !caller.IsAppOwner() || caller.WebID == "" {
			http.Error(w, "forbidden", http.StatusForbidden)
			return
		}
		if pol.Access.WebID != "" && caller.WebID != pol.Access.WebID {
			http.Error(w, "forbidden", http.StatusForbidden)
			return
		}
		// Non-WebSocket probes to /ws/client when unpaired receive 409 Conflict;
		// authenticated Owner WebSocket connections enter waiting mode for host_online.
		if !isWebSocketUpgrade(r) {
			http.Error(w, "relay not paired", http.StatusConflict)
			return
		}
	} else {
		if origin != pol.Access.Origin ||
			caller.UserID != pol.Access.OwnerUserID ||
			caller.TenantID != pol.Access.OwnerTenantID ||
			caller.WebID != pol.Access.WebID ||
			(caller.AppOwnerID != "" && !caller.IsAppOwner()) {
			http.Error(w, "forbidden", http.StatusForbidden)
			return
		}
	}

	if !acquire(h.clients) {
		http.Error(w, "relay at capacity", http.StatusTooManyRequests)
		return
	}
	defer func() { <-h.clients }()
	conn, err := acceptWebSocketWithQueue(w, r, 24, maxQueuedBytes, h.sessionMaxAge)
	if err != nil {
		return
	}

	sid := h.nextSID.Add(1)
	if sid > uint64(^uint32(0)) {
		conn.close(1008, "relay session exhausted")
		return
	}

	var challenge [16]byte
	if _, err := rand.Read(challenge[:]); err != nil {
		conn.close(1011, "session unavailable")
		return
	}
	session := &clientSession{
		challenge:  base64.RawURLEncoding.EncodeToString(challenge[:]),
		id:         uint32(sid),
		conn:       conn,
		identity:   caller,
		origin:     origin,
		admittedAt: time.Now(),
		maxAge:     h.sessionMaxAge,
	}

	if !h.registerClient(session, epoch, pol.Key, pol.Paired) {
		conn.close(1012, "policy updated")
		return
	}

	defer func() {
		session.stopUnauthTimer()
		h.mu.Lock()
		delete(h.allClients, session.id)
		h.mu.Unlock()
		h.closeSession(session)
		conn.close(1000, "")
	}()

	if !pol.Paired {
		sendClientControl(conn, map[string]any{
			"type":          "welcome",
			"version":       2,
			"paired":        false,
			"hostConnected": false,
			"webId":         caller.WebID,
			"sessionId":     sid,
			"challenge":     session.challenge,
			"user":          caller,
			"hosts":         []hostInfo{},
		})
	} else {
		reqHostID := strings.TrimSpace(r.URL.Query().Get("host_id"))
		hosts := h.listHosts()
		var selectedHostID string
		var bindErr string

		if reqHostID != "" || len(hosts) == 1 {
			target, bErr := h.bindSession(session, reqHostID, epoch)
			if bErr != nil {
				bindErr = bErr.Error()
			} else {
				selectedHostID = target.id
			}
		}

		hostName := pol.Access.HostName
		if hostName == "" {
			hostName = pol.Access.HostID
		}
		sendClientControl(conn, map[string]any{
			"type":          "welcome",
			"version":       2,
			"paired":        true,
			"hostConnected": selectedHostID != "" || h.isHostConnected(pol.Access.HostID),
			"webId":         pol.Access.WebID,
			"configuredHost": map[string]string{
				"hostId":     pol.Access.HostID,
				"hostName":   hostName,
				"hostDigest": pol.Access.HostDigest,
			},
			"sessionId":      sid,
			"challenge":      session.challenge,
			"user":           caller,
			"hosts":          hosts,
			"selectedHostId": selectedHostID,
			"error":          bindErr,
		})
	}

	for {
		opcode, payload, err := conn.readMessage()
		if err != nil {
			return
		}
		if opcode != opBinary || len(payload) < 5 {
			continue
		}
		streamID := binary.BigEndian.Uint32(payload[0:4])
		msgType := payload[4]
		if streamID == 0 && msgType == msgControlJSON {
			if len(payload) > 1024 {
				return
			}
			session.mu.Lock()
			bound := session.host != nil
			session.mu.Unlock()
			if !bound {
				now := time.Now()
				if now.Sub(session.waitCtrlWindow) >= time.Minute {
					session.waitCtrlWindow = now
					session.waitCtrlCount = 0
				}
				session.waitCtrlCount++
				if session.waitCtrlCount > maxWaitingCtrlPerMin {
					conn.close(1008, "control rate limit exceeded")
					return
				}
			}
			var cmd struct {
				Type   string `json:"type"`
				HostID string `json:"hostId"`
			}
			if json.Unmarshal(payload[5:], &cmd) != nil {
				continue
			}
			switch cmd.Type {
			case "list_hosts":
				curPol, _, pErr := h.syncPolicy()
				if pErr != nil {
					continue
				}
				sendClientControl(conn, map[string]any{
					"type":   "hosts_list",
					"paired": curPol.Paired,
					"hosts":  h.listHosts(),
				})
			case "select_host":
				curPol, curEpoch, pErr := h.syncPolicy()
				if pErr != nil || !curPol.Paired {
					sendClientControl(conn, map[string]any{
						"type":    "error",
						"code":    "HOST_UNAVAILABLE",
						"message": "relay is not paired",
					})
					continue
				}
				target, bErr := h.bindSession(session, strings.TrimSpace(cmd.HostID), curEpoch)
				if bErr != nil {
					sendClientControl(conn, map[string]any{
						"type":    "error",
						"code":    "HOST_UNAVAILABLE",
						"message": bErr.Error(),
					})
				} else {
					sendClientControl(conn, map[string]any{
						"type":           "host_selected",
						"selectedHostId": target.id,
						"hostName":       target.name,
					})
				}
			}
			continue
		}

		session.mu.Lock()
		host := session.host
		session.mu.Unlock()
		if host == nil {
			sendClientControl(conn, map[string]any{
				"type":    "error",
				"code":    "NO_HOST_BOUND",
				"message": "no host selected or host offline",
			})
			continue
		}

		if !session.forwardToHost(host, payload) {
			conn.close(1008, "relay send limit exceeded")
			return
		}
	}
}

func (h *relayHub) handleHealth(w http.ResponseWriter, _ *http.Request) {
	pol, _, err := h.syncPolicy()
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	if err != nil {
		w.WriteHeader(http.StatusServiceUnavailable)
		_ = json.NewEncoder(w).Encode(map[string]any{"ok": false, "error": "invalid policy"})
		return
	}
	_ = json.NewEncoder(w).Encode(map[string]any{
		"ok":     true,
		"paired": pol.Paired,
	})
}

func (h *relayHub) handleStatus(w http.ResponseWriter, r *http.Request) {
	pol, _, err := h.syncPolicy()
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	if err != nil {
		w.WriteHeader(http.StatusServiceUnavailable)
		_ = json.NewEncoder(w).Encode(map[string]any{"ok": false, "error": "invalid policy"})
		return
	}
	caller, ok := callerFromRequest(r)
	if !ok || !caller.IsAppOwner() {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}
	if pol.Paired {
		if caller.UserID != pol.Access.OwnerUserID ||
			caller.TenantID != pol.Access.OwnerTenantID ||
			(pol.Access.WebID != "" && caller.WebID != pol.Access.WebID) {
			http.Error(w, "forbidden", http.StatusForbidden)
			return
		}
		hostName := pol.Access.HostName
		if hostName == "" {
			hostName = pol.Access.HostID
		}
		_ = json.NewEncoder(w).Encode(map[string]any{
			"ok":            true,
			"paired":        true,
			"hostConnected": h.isHostConnected(pol.Access.HostID),
			"hostId":        pol.Access.HostID,
			"hostName":      hostName,
			"hostDigest":    pol.Access.HostDigest,
			"webId":         pol.Access.WebID,
			"updatedAt":     pol.Access.UpdatedAt,
		})
		return
	}
	if pol.Access.WebID != "" && caller.WebID != "" && caller.WebID != pol.Access.WebID {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}
	_ = json.NewEncoder(w).Encode(map[string]any{
		"ok":            true,
		"paired":        false,
		"hostConnected": false,
		"webId":         caller.WebID,
	})
}

func newMux(hub *relayHub) *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("/health", hub.handleHealth)
	mux.HandleFunc("/healthz", hub.handleHealth)
	mux.HandleFunc("/status", hub.handleStatus)
	mux.HandleFunc("/info", hub.handleStatus)
	mux.HandleFunc("/host", hub.handleHostWS)
	mux.HandleFunc("/ws/host", hub.handleHostWS)
	mux.HandleFunc("/client", hub.handleClientWS)
	mux.HandleFunc("/ws/client", hub.handleClientWS)
	return mux
}

func main() {
	port := strings.TrimSpace(os.Getenv("PORT"))
	if port == "" {
		port = "8080"
	}
	hub := newDynamicRelayHub(
		strings.TrimSpace(os.Getenv("FUNCTION_CONFIG_FILE")),
		relayConfigJSON,
		defaultWebID,
	)
	if pol, _, err := hub.syncPolicy(); err != nil {
		log.Printf("[dsh-remote-relay] warning: initial policy invalid (fail-closed): %v", err)
	} else if !pol.Paired {
		log.Printf("[dsh-remote-relay] starting in unpaired standby mode (awaiting DSH_REMOTE_POLICY)")
	}
	srv := &http.Server{
		Addr:              ":" + port,
		Handler:           newMux(hub),
		ReadHeaderTimeout: 10 * time.Second,
		IdleTimeout:       15 * time.Second,
		MaxHeaderBytes:    16 * 1024,
	}
	log.Printf("[dsh-remote-relay] listening on :%s", port)
	if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatalf("relay server failed: %v", err)
	}
}
