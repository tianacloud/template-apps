
/* 文书档案工作台 · 扫码（jsQR，本地解码，不联网） */
(function (global) {
  'use strict';
  var U = global.U, S = global.Store;

  var video = null, stream = null, raf = null, running = false;
  var onResult = null, onFrameError = null;
  var torchOn = false, track = null;

  function start(opts) {
    video = opts.video;
    onResult = opts.onResult;
    running = true;

    return navigator.mediaDevices.getUserMedia({
      video: { facingMode: opts.facing || 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    }).then(function (s) {
      stream = s;
      video.srcObject = s;
      video.setAttribute('playsinline', '');
      return video.play();
    }).then(function () {
      track = stream.getVideoTracks()[0] || null;
      tick();
    }).catch(function (e) {
      running = false;
      throw e;
    });
  }

  function tick() {
    if (!running) return;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      var c = document.createElement('canvas');
      var W = 480, H = Math.round(video.videoHeight * (W / video.videoWidth)) || 640;
      c.width = W; c.height = H;
      var ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(video, 0, 0, W, H);
      var img = ctx.getImageData(0, 0, W, H);
      var code = jsQR(img.data, W, H, { inversionAttempts: 'dontInvert' });
      if (code && code.data) {
        stop();
        if (onResult) onResult(code.data);
        return;
      }
    }
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
    if (video) video.srcObject = null;
    torchOn = false;
  }

  function toggleTorch() {
    if (!track) return Promise.resolve(false);
    try {
      var cap = track.getCapabilities ? track.getCapabilities() : {};
      if (!cap.torch) return Promise.resolve(false);
      torchOn = !torchOn;
      return track.applyConstraints({ advanced: [{ torch: torchOn }] }).then(function () { return torchOn; })
        .catch(function () { torchOn = false; return false; });
    } catch (e) { return Promise.resolve(false); }
  }

  /* 从相册里的图片解码二维码 */
  function decodeFromFile(file) {
    return new Promise(function (res, rej) {
      var fr = new FileReader();
      fr.onload = function () {
        var img = new Image();
        img.onload = function () {
          var c = document.createElement('canvas');
          var max = 900;
          var sc = Math.min(1, max / Math.max(img.width, img.height));
          c.width = Math.round(img.width * sc);
          c.height = Math.round(img.height * sc);
          var ctx = c.getContext('2d', { willReadFrequently: true });
          ctx.drawImage(img, 0, 0, c.width, c.height);
          var d = ctx.getImageData(0, 0, c.width, c.height);
          var code = jsQR(d.data, c.width, c.height, { inversionAttempts: 'dontInvert' });
          if (code && code.data) res(code.data);
          else rej(new Error('没识别到二维码'));
        };
        img.onerror = function () { rej(new Error('图片读取失败')); };
        img.src = fr.result;
      };
      fr.onerror = function () { rej(new Error('文件读取失败')); };
      fr.readAsDataURL(file);
    });
  }

  /* 处理扫到的内容：可能是匣 ID，也可能是导入用的 JSON */
  function handleRaw(text) {
    text = (text || '').trim();
    // 1) 匣 ID
    if (/^HJ-[A-Z0-9]{4}-\d{2}$/i.test(text)) {
      var b = S.getBox(text.toUpperCase());
      if (b) return { type: 'box', box: b };
      return { type: 'unknownBox', id: text.toUpperCase() };
    }
    // 2) 导入 JSON
    if (text.charAt(0) === '{') {
      try {
        var data = JSON.parse(text);
        if (data && data.boxes) return { type: 'import', data: data };
      } catch (e) { /* 不是合法 JSON */ }
    }
    return { type: 'unknown', text: text };
  }

  global.Scan = {
    start: start, stop: stop, toggleTorch: toggleTorch,
    decodeFromFile: decodeFromFile, handleRaw: handleRaw,
    isRunning: function () { return running; }
  };
})(window);

