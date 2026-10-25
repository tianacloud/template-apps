import * as THREE from "three";
import bean from "../public/karts/bean.png";
import nixie from "../public/karts/nixie.png";
import hammer from "../public/karts/hammer.png";
import zipray from "../public/karts/zipray.png";
import { installRules } from "./rules.js";
function mountEngine(personal) {
  const host = typeof window !== "undefined" ? window : globalThis;
  host.THREE = THREE;
  installRules();
  host.KART.personal = personal;
  host.KART.kartImages = { bean, nixie, hammer, zipray };
  (function(global) {
    var KART = global.KART;
    var CFG = KART.CFG;
    var T = global.THREE;
    function canvasTex(w, h, draw, repeatX, repeatY) {
      var c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      draw(c.getContext("2d"), w, h);
      var tex = new T.CanvasTexture(c);
      tex.wrapS = tex.wrapT = T.RepeatWrapping;
      tex.repeat.set(repeatX || 1, repeatY || 1);
      tex.anisotropy = 4;
      return tex;
    }
    function asphaltTexture(dark) {
      return canvasTex(128, 128, function(g) {
        g.fillStyle = dark ? "#33363D" : "#3D414A";
        g.fillRect(0, 0, 128, 128);
        for (var i = 0; i < 900; i++) {
          var v = 40 + Math.random() * 40;
          g.fillStyle = "rgba(" + v + "," + (v + 2) + "," + (v + 5) + "," + (0.15 + Math.random() * 0.3) + ")";
          g.fillRect(Math.random() * 128, Math.random() * 128, 1 + Math.random() * 2, 1 + Math.random() * 2);
        }
      }, 1, 1);
    }
    function checkerTexture() {
      return canvasTex(128, 32, function(g) {
        for (var y = 0; y < 4; y++) {
          for (var x = 0; x < 16; x++) {
            g.fillStyle = (x + y) % 2 ? "#FFFFFF" : "#1B1F27";
            g.fillRect(x * 8, y * 8, 8, 8);
          }
        }
      }, 2, 1);
    }
    function windowTexture(rx, ry) {
      return canvasTex(64, 128, function(g) {
        g.fillStyle = "#1A1F2B";
        g.fillRect(0, 0, 64, 128);
        for (var y = 4; y < 124; y += 12) {
          for (var x = 5; x < 60; x += 14) {
            var lit = Math.random();
            g.fillStyle = lit > 0.55 ? "rgba(255,225,150,0.95)" : lit > 0.3 ? "rgba(120,160,200,0.35)" : "rgba(40,50,70,0.6)";
            g.fillRect(x, y, 8, 7);
          }
        }
      }, rx || 1, ry || 1);
    }
    function questionTexture() {
      return canvasTex(128, 128, function(g) {
        g.fillStyle = "#FFD23F";
        g.fillRect(0, 0, 128, 128);
        g.fillStyle = "#FFFFFF";
        g.fillRect(10, 10, 108, 108);
        g.fillStyle = "#FFD23F";
        g.fillRect(20, 20, 88, 88);
        g.fillStyle = "#141821";
        g.font = "bold 84px system-ui, sans-serif";
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillText("?", 64, 68);
      }, 1, 1);
    }
    function envTexture(theme) {
      var top = theme === "city" ? "#2A1B4A" : "#8FCBF2";
      var bottom = theme === "city" ? "#0E0A18" : "#4E6B3C";
      var faces = [];
      for (var i = 0; i < 6; i++) {
        var c = document.createElement("canvas");
        c.width = c.height = 64;
        var g = c.getContext("2d");
        var grad = g.createLinearGradient(0, 0, 0, 64);
        var up = i === 2, down = i === 3;
        grad.addColorStop(0, up ? top : down ? bottom : top);
        grad.addColorStop(1, up ? top : down ? bottom : bottom);
        g.fillStyle = grad;
        g.fillRect(0, 0, 64, 64);
        faces.push(c);
      }
      var tex = new T.CubeTexture(faces);
      tex.needsUpdate = true;
      return tex;
    }
    var _blobTex = null;
    function blobShadowTexture() {
      if (_blobTex) return _blobTex;
      _blobTex = canvasTex(128, 128, function(g) {
        var grd = g.createRadialGradient(64, 64, 4, 64, 64, 62);
        grd.addColorStop(0, "rgba(255,255,255,1)");
        grd.addColorStop(0.5, "rgba(255,255,255,0.95)");
        grd.addColorStop(0.68, "rgba(255,255,255,0.82)");
        grd.addColorStop(0.82, "rgba(255,255,255,0.50)");
        grd.addColorStop(0.92, "rgba(255,255,255,0.18)");
        grd.addColorStop(1, "rgba(255,255,255,0)");
        g.fillStyle = grd;
        g.fillRect(0, 0, 128, 128);
      });
      _blobTex.wrapS = _blobTex.wrapT = T.ClampToEdgeWrapping;
      _blobTex.anisotropy = 2;
      return _blobTex;
    }
    function kartMat(color, opts) {
      opts = opts || {};
      return new T.MeshStandardMaterial({
        color: new T.Color(color),
        metalness: opts.metal != null ? opts.metal : 0.3,
        roughness: opts.rough != null ? opts.rough : 0.4,
        transparent: !!opts.opacity && opts.opacity < 1,
        opacity: opts.opacity != null ? opts.opacity : 1,
        emissive: opts.emissive ? new T.Color(opts.emissive) : new T.Color(0),
        emissiveIntensity: opts.emissiveIntensity || 1,
        flatShading: opts.flat !== false
      });
    }
    function put(parent, geo, mat, x, y, z, rx, ry, rz) {
      var m = new T.Mesh(geo, mat);
      m.position.set(x || 0, y || 0, z || 0);
      if (rx) m.rotation.x = rx;
      if (ry) m.rotation.y = ry;
      if (rz) m.rotation.z = rz;
      m.castShadow = true;
      parent.add(m);
      return m;
    }
    function makeWheel(r, w, rimStyle, colors, rimMat) {
      var g = new T.Group();
      var spin = new T.Group();
      g.add(spin);
      var tireGeo = new T.CylinderGeometry(r, r, w, 12);
      tireGeo.rotateZ(Math.PI / 2);
      var tire = new T.Mesh(tireGeo, kartMat(1316378, { rough: 0.92, metal: 0.05 }));
      tire.castShadow = true;
      spin.add(tire);
      if (rimStyle === "bean") {
        var disc = new T.CylinderGeometry(r * 0.62, r * 0.62, w * 1.06, 10);
        disc.rotateZ(Math.PI / 2);
        spin.add(new T.Mesh(disc, kartMat(15922423, { rough: 0.5 })));
        for (var i = 0; i < 3; i++) {
          var sGeo = new T.BoxGeometry(w * 1.1, r * 1.1, r * 0.34);
          var s = new T.Mesh(sGeo, kartMat(1316378, { rough: 0.8 }));
          s.rotation.x = i * Math.PI / 3;
          spin.add(s);
        }
      } else if (rimStyle === "flower") {
        for (var f = 0; f < 5; f++) {
          var pGeo = new T.BoxGeometry(w * 1.05, r * 1.15, r * 0.22);
          var petal = new T.Mesh(pGeo, rimMat);
          petal.rotation.x = f * Math.PI * 2 / 5;
          spin.add(petal);
        }
        var hub = new T.CylinderGeometry(r * 0.24, r * 0.24, w * 1.12, 8);
        hub.rotateZ(Math.PI / 2);
        spin.add(new T.Mesh(hub, rimMat));
      } else if (rimStyle === "gear") {
        for (var t = 0; t < 9; t++) {
          var tooth = new T.Mesh(new T.BoxGeometry(w * 0.96, r * 0.3, r * 0.34), kartMat(1316378, { rough: 0.9 }));
          var ang = t * Math.PI * 2 / 9;
          tooth.position.set(0, Math.sin(ang) * r * 0.98, Math.cos(ang) * r * 0.98);
          tooth.rotation.x = -ang;
          spin.add(tooth);
        }
        var disc2 = new T.CylinderGeometry(r * 0.6, r * 0.6, w * 1.02, 8);
        disc2.rotateZ(Math.PI / 2);
        spin.add(new T.Mesh(disc2, kartMat(colors.detail, { rough: 0.5, metal: 0.5 })));
      } else {
        for (var d = 0; d < 5; d++) {
          var spGeo = new T.BoxGeometry(w * 1.05, r * 1.05, r * 0.2);
          var spoke = new T.Mesh(spGeo, kartMat(1777447, { rough: 0.6 }));
          spoke.rotation.x = d * Math.PI * 2 / 5;
          spin.add(spoke);
        }
        var cap = new T.CylinderGeometry(r * 0.22, r * 0.22, w * 1.12, 8);
        cap.rotateZ(Math.PI / 2);
        spin.add(new T.Mesh(cap, kartMat(colors.primary, { rough: 0.4 })));
      }
      return { group: g, spin };
    }
    function makeDriver(style, colors) {
      var g = new T.Group();
      if (style === "robot") {
        put(g, new T.CylinderGeometry(0.14, 0.18, 0.3, 8), kartMat(colors.detail, { rough: 0.5 }), 0, 0.62, -0.12);
        put(g, new T.SphereGeometry(0.19, 10, 8), kartMat(colors.primary, { rough: 0.35 }), 0, 0.9, -0.12);
        put(g, new T.SphereGeometry(0.2, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), kartMat(colors.accent, { rough: 0.4 }), 0, 0.9, -0.12);
        put(g, new T.SphereGeometry(0.035, 6, 6), kartMat(16726832, { rough: 0.4 }), 0.12, 0.9, 0.02);
        put(g, new T.SphereGeometry(0.035, 6, 6), kartMat(16726832, { rough: 0.4 }), -0.12, 0.9, 0.02);
      } else if (style === "white") {
        put(g, new T.CylinderGeometry(0.13, 0.17, 0.3, 8), kartMat(colors.primary, { rough: 0.45 }), 0, 0.6, -0.12);
        put(g, new T.SphereGeometry(0.16, 10, 8), kartMat(16054008, { rough: 0.3, metal: 0.3 }), 0, 0.86, -0.12);
        put(g, new T.SphereGeometry(0.13, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), kartMat(colors.accent, { rough: 0.3, metal: 0.4 }), 0, 0.86, -0.12);
      } else if (style === "black") {
        put(g, new T.CylinderGeometry(0.15, 0.2, 0.32, 8), kartMat(2764602, { rough: 0.6 }), 0, 0.6, -0.1);
        put(g, new T.SphereGeometry(0.17, 10, 8), kartMat(1316895, { rough: 0.35, metal: 0.4 }), 0, 0.88, -0.1);
        put(g, new T.BoxGeometry(0.2, 0.07, 0.06), kartMat(colors.accent, { rough: 0.4 }), 0, 0.88, 0.05);
      } else {
        put(g, new T.CylinderGeometry(0.13, 0.17, 0.28, 8), kartMat(1777447, { rough: 0.6 }), 0, 0.6, -0.12);
        put(g, new T.SphereGeometry(0.16, 10, 8), kartMat(colors.primary, { rough: 0.3, metal: 0.35 }), 0, 0.86, -0.12);
        put(g, new T.ConeGeometry(0.05, 0.2, 4), kartMat(1316895, { rough: 0.4 }), 0, 1.02, -0.2, -0.5, 0, 0);
        put(g, new T.BoxGeometry(0.22, 0.06, 0.08), kartMat(1316895, { rough: 0.4 }), 0, 0.86, 0.03);
      }
      return g;
    }
    function buildBean(g, colors, W) {
      put(g, new T.BoxGeometry(W * 0.92, 0.1, 1.45), kartMat(colors.primary, { rough: 0.45 }), 0, 0.15, 0);
      var shell = put(g, new T.SphereGeometry(0.62, 10, 8), kartMat(colors.primary, { rough: 0.35 }), 0, 0.44, -0.05);
      shell.scale.set(W * 0.78, 0.55, 1.08);
      var cowl = put(g, new T.SphereGeometry(0.32, 9, 7, 0, Math.PI * 2, 0, Math.PI / 2), kartMat(colors.accent, { rough: 0.4 }), 0, 0.6, -0.3);
      cowl.scale.set(1.05, 0.75, 1.35);
      put(g, new T.CylinderGeometry(0.15, 0.15, 0.05, 10), kartMat(colors.accent, { rough: 0.4 }), W * 0.52, 0.42, 0.05, 0, 0, Math.PI / 2);
      put(g, new T.CylinderGeometry(0.15, 0.15, 0.05, 10), kartMat(colors.accent, { rough: 0.4 }), -W * 0.52, 0.42, 0.05, 0, 0, Math.PI / 2);
      var tail = put(g, new T.SphereGeometry(0.26, 9, 7), kartMat(colors.accent, { rough: 0.4 }), 0, 0.46, -0.68);
      tail.scale.set(1.1, 0.8, 0.9);
      put(g, new T.TorusGeometry(0.15, 0.045, 8, 14), kartMat(16777215, { rough: 0.3 }), 0, 0.44, 0.78);
      put(g, new T.SphereGeometry(0.085, 8, 8), kartMat(16777215, { rough: 0.25 }), W * 0.17, 0.46, 0.74);
      put(g, new T.SphereGeometry(0.085, 8, 8), kartMat(16777215, { rough: 0.25 }), -W * 0.17, 0.46, 0.74);
      put(g, new T.SphereGeometry(0.04, 6, 6), kartMat(colors.detail, { rough: 0.3 }), W * 0.17, 0.46, 0.81);
      put(g, new T.SphereGeometry(0.04, 6, 6), kartMat(colors.detail, { rough: 0.3 }), -W * 0.17, 0.46, 0.81);
      put(g, new T.TorusGeometry(0.08, 0.028, 6, 10, Math.PI), kartMat(1316378, { rough: 0.4 }), 0, 0.36, 0.8, 0, 0, Math.PI);
      put(g, new T.CylinderGeometry(0.014, 0.014, 0.3, 6), kartMat(1316378, { rough: 0.5 }), 0, 1.06, -0.35);
      put(g, new T.SphereGeometry(0.05, 6, 6), kartMat(colors.detail, { rough: 0.35 }), 0, 1.14, -0.35);
      put(g, new T.SphereGeometry(0.045, 6, 6), kartMat(16726832, { rough: 0.35 }), 0, 1.24, -0.35);
      return { driver: "robot", wheelR: 0.3, wheelW: 0.22, rim: "bean", wx: W * 0.6 };
    }
    function buildNixie(g, colors, W) {
      put(g, new T.BoxGeometry(W * 0.95, 0.09, 1.6), kartMat(16777215, { rough: 0.35 }), 0, 0.13, 0);
      var shell = put(g, new T.SphereGeometry(0.52, 12, 9), kartMat(colors.primary, { rough: 0.28, metal: 0.25 }), 0, 0.36, -0.05);
      shell.scale.set(W * 0.5, 0.56, 1.5);
      put(g, new T.ConeGeometry(W * 0.3, 0.62, 10), kartMat(colors.primary, { rough: 0.28, metal: 0.25 }), 0, 0.32, 0.86, Math.PI / 2, 0, 0);
      put(g, new T.BoxGeometry(0.025, 0.03, 1.45), kartMat(colors.accent, { rough: 0.2, metal: 0.85 }), W * 0.48, 0.38, -0.02);
      put(g, new T.BoxGeometry(0.025, 0.03, 1.45), kartMat(colors.accent, { rough: 0.2, metal: 0.85 }), -W * 0.48, 0.38, -0.02);
      put(g, new T.BoxGeometry(0.025, 0.03, 1.1), kartMat(colors.accent, { rough: 0.2, metal: 0.85 }), W * 0.46, 0.28, -0.1);
      put(g, new T.BoxGeometry(0.025, 0.03, 1.1), kartMat(colors.accent, { rough: 0.2, metal: 0.85 }), -W * 0.46, 0.28, -0.1);
      var bowL = put(g, new T.BoxGeometry(0.34, 0.06, 0.2), kartMat(colors.primary, { rough: 0.3 }), 0.24, 0.74, -0.82, 0, 0.55, 0.25);
      bowL.name = "bow";
      put(g, new T.BoxGeometry(0.34, 0.06, 0.2), kartMat(colors.primary, { rough: 0.3 }), -0.24, 0.74, -0.82, 0, -0.55, -0.25);
      put(g, new T.SphereGeometry(0.08, 8, 7), kartMat(colors.accent, { rough: 0.25, metal: 0.6 }), 0, 0.74, -0.78);
      put(g, new T.TorusGeometry(0.085, 0.018, 6, 12), kartMat(1777447, { rough: 0.4 }), 0, 0.6, 0.08, 1.1, 0, 0);
      put(g, new T.CylinderGeometry(0.02, 0.02, 0.24, 6), kartMat(9278886, { rough: 0.3, metal: 0.7 }), 0, 0.48, 0.14, 0.5, 0, 0);
      return { driver: "white", wheelR: 0.27, wheelW: 0.17, rim: "flower", wx: W * 0.58 };
    }
    function buildHammer(g, colors, W) {
      put(g, new T.BoxGeometry(W * 0.98, 0.16, 1.95), kartMat(colors.primary, { rough: 0.6 }), 0, 0.22, 0);
      put(g, new T.BoxGeometry(W * 0.97, 0.4, 1.85), kartMat(colors.primary, { rough: 0.55, metal: 0.35 }), 0, 0.5, -0.02);
      put(g, new T.BoxGeometry(W * 0.7, 0.3, 0.85), kartMat(colors.secondary, { rough: 0.55, metal: 0.35 }), 0, 0.82, -0.12);
      put(g, new T.BoxGeometry(0.045, 0.15, 1.55), kartMat(colors.accent, { rough: 0.4, emissive: 2230784 }), W * 0.51, 0.48, 0);
      put(g, new T.BoxGeometry(0.045, 0.15, 1.55), kartMat(colors.accent, { rough: 0.4, emissive: 2230784 }), -W * 0.51, 0.48, 0);
      put(g, new T.BoxGeometry(W * 0.5, 0.12, 0.06), kartMat(colors.accent, { rough: 0.4 }), 0, 0.4, 0.96);
      put(g, new T.BoxGeometry(W * 1.02, 0.14, 0.12), kartMat(1316378, { rough: 0.6 }), 0, 0.26, 1);
      put(g, new T.BoxGeometry(W * 1.04, 0.05, 0.38), kartMat(1316378, { rough: 0.45 }), 0, 1.02, -0.92);
      put(g, new T.BoxGeometry(W * 0.88, 0.05, 0.3), kartMat(colors.primary, { rough: 0.5 }), 0, 0.84, -0.88);
      [-1, 0, 1].forEach(function(s) {
        put(g, new T.CylinderGeometry(0.03, 0.03, 0.4, 6), kartMat(1316378, { rough: 0.5 }), s * W * 0.36, 0.86, -0.9);
      });
      put(g, new T.CylinderGeometry(0.032, 0.032, 0.62, 6), kartMat(1316378, { rough: 0.5 }), W * 0.34, 0.95, -0.34);
      put(g, new T.CylinderGeometry(0.032, 0.032, 0.62, 6), kartMat(1316378, { rough: 0.5 }), -W * 0.34, 0.95, -0.34);
      put(g, new T.CylinderGeometry(0.032, 0.032, W * 0.7, 6), kartMat(1316378, { rough: 0.5 }), 0, 1.24, -0.34, 0, 0, Math.PI / 2);
      put(g, new T.BoxGeometry(0.46, 0.1, 0.4), kartMat(1316378, { rough: 0.5 }), 0, 1, 0.18);
      put(g, new T.BoxGeometry(0.05, 0.16, 0.5), kartMat(colors.detail, { rough: 0.4, metal: 0.5 }), W * 0.5, 0.66, -0.4);
      put(g, new T.BoxGeometry(0.05, 0.16, 0.5), kartMat(colors.detail, { rough: 0.4, metal: 0.5 }), -W * 0.5, 0.66, -0.4);
      put(g, new T.CylinderGeometry(0.055, 0.06, 0.2, 8), kartMat(colors.accent, { rough: 0.35 }), W * 0.26, 0.36, -1.02, Math.PI / 2, 0, 0);
      put(g, new T.CylinderGeometry(0.055, 0.06, 0.2, 8), kartMat(colors.accent, { rough: 0.35 }), -W * 0.26, 0.36, -1.02, Math.PI / 2, 0, 0);
      return { driver: "black", wheelR: 0.3, wheelW: 0.34, rim: "gear", wx: W * 0.58 };
    }
    function buildZipray(g, colors, W) {
      put(g, new T.BoxGeometry(W * 0.9, 0.1, 1.85), kartMat(1316378, { rough: 0.55 }), 0, 0.14, 0);
      var sh = new T.Shape();
      sh.moveTo(-0.92, 0.1);
      sh.lineTo(-0.88, 0.44);
      sh.lineTo(-0.15, 0.4);
      sh.lineTo(0.55, 0.2);
      sh.lineTo(0.98, 0.13);
      sh.lineTo(0.98, 0.08);
      sh.lineTo(-0.9, 0.08);
      sh.closePath();
      var bodyGeo = new T.ExtrudeGeometry(sh, { depth: W * 0.94, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 1, curveSegments: 4 });
      bodyGeo.translate(0, 0, -W * 0.47);
      bodyGeo.rotateY(-Math.PI / 2);
      bodyGeo.computeVertexNormals();
      put(g, bodyGeo, kartMat(colors.primary, { rough: 0.25, metal: 0.35 }), 0, 0.1, 0.05);
      var canopy = put(g, new T.SphereGeometry(0.34, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), kartMat(colors.accent, { rough: 0.08, metal: 0.4, opacity: 0.55 }), 0, 0.5, -0.18);
      canopy.scale.set(0.9, 0.75, 1.5);
      put(g, new T.BoxGeometry(0.06, 0.09, 1.25), kartMat(colors.detail, { rough: 0.35 }), W * 0.5, 0.17, 0.05);
      put(g, new T.BoxGeometry(0.06, 0.09, 1.25), kartMat(colors.detail, { rough: 0.35 }), -W * 0.5, 0.17, 0.05);
      put(g, new T.BoxGeometry(0.025, 0.2, 0.5), kartMat(colors.detail, { rough: 0.35 }), W * 0.5, 0.34, 0.32, 0, 0, -0.35);
      put(g, new T.BoxGeometry(0.025, 0.2, 0.5), kartMat(colors.detail, { rough: 0.35 }), -W * 0.5, 0.34, 0.32, 0, 0, 0.35);
      put(g, new T.BoxGeometry(W * 1.06, 0.05, 0.34), kartMat(1316378, { rough: 0.4 }), 0, 0.8, -0.88);
      put(g, new T.BoxGeometry(0.07, 0.3, 0.1), kartMat(1316378, { rough: 0.4 }), 0, 0.62, -0.86);
      put(g, new T.BoxGeometry(0.035, 0.17, 0.32), kartMat(colors.detail, { rough: 0.35 }), W * 0.52, 0.8, -0.88);
      put(g, new T.BoxGeometry(0.035, 0.17, 0.32), kartMat(colors.detail, { rough: 0.35 }), -W * 0.52, 0.8, -0.88);
      put(g, new T.BoxGeometry(0.3, 0.025, 0.2), kartMat(colors.accent, { rough: 0.3, emissive: 9771 }), W * 0.4, 0.16, 0.86, 0, 0, 0.12);
      put(g, new T.BoxGeometry(0.3, 0.025, 0.2), kartMat(colors.accent, { rough: 0.3, emissive: 9771 }), -W * 0.4, 0.16, 0.86, 0, 0, -0.12);
      put(g, new T.CylinderGeometry(0.012, 0.012, 0.34, 6), kartMat(1316378, { rough: 0.5 }), 0, 1, -0.5, 0.18, 0, 0);
      put(g, new T.SphereGeometry(0.04, 6, 6), kartMat(16726832, { rough: 0.35 }), 0, 1.17, -0.53);
      return { driver: "fin", wheelR: 0.28, wheelW: 0.24, rim: "dark", wx: W * 0.58, rearWide: true };
    }
    var KART_BUILDERS = { bean: buildBean, nixie: buildNixie, hammer: buildHammer, zipray: buildZipray };
    function makeKartMesh(spec) {
      var c = spec.colors;
      var W = spec.id === "hammer" ? 1.28 : spec.id === "zipray" ? 1.08 : spec.id === "bean" ? 0.98 : 1;
      var g = new T.Group();
      var build = KART_BUILDERS[spec.id] || buildNixie;
      var dims = build(g, c, W);
      var driver = makeDriver(dims.driver, c);
      driver.position.set(0, 0, -0.05);
      g.add(driver);
      var wheels = [], rims = [], steerWheels = [];
      var wz = [0.68, -0.62], wr = dims.wheelR;
      wz.forEach(function(zz, zi) {
        [-1, 1].forEach(function(sx) {
          var ww = zi === 1 && dims.rearWide ? dims.wheelW * 1.3 : dims.wheelW;
          var wh = makeWheel(wr, ww, dims.rim, c, kartMat(c.accent, { rough: 0.25, metal: 0.85 }));
          wh.group.position.set(sx * dims.wx, wr, zz);
          if (zi === 0) {
            wh.group.rotation.order = "YXZ";
            steerWheels.push(wh.group);
          }
          g.add(wh.group);
          wheels.push(wh.spin);
          rims.push(wh.spin);
        });
      });
      var flame = new T.Mesh(
        new T.ConeGeometry(0.2, 0.85, 10),
        new T.MeshBasicMaterial({ color: 6742271, transparent: true, opacity: 0.85 })
      );
      flame.rotation.x = -Math.PI / 2;
      flame.position.set(0, 0.36, -1.3);
      flame.visible = false;
      g.add(flame);
      var starGroup = new T.Group();
      var starMat = new T.MeshBasicMaterial({ color: 16770142 });
      for (var i = 0; i < 3; i++) {
        var st = new T.Mesh(new T.OctahedronGeometry(0.16, 0), starMat);
        st.position.set(Math.cos(i * 2.1) * 0.9, 0.7, Math.sin(i * 2.1) * 0.9);
        starGroup.add(st);
      }
      starGroup.visible = false;
      g.add(starGroup);
      var sparkCount = 26;
      var sparkGeo = new T.BufferGeometry();
      var sparkPos = new Float32Array(sparkCount * 3);
      sparkGeo.setAttribute("position", new T.BufferAttribute(sparkPos, 3));
      var sparks = new T.Points(sparkGeo, new T.PointsMaterial({ color: 4572415, size: 0.22, transparent: true, opacity: 0.95, depthWrite: false }));
      sparks.visible = false;
      sparks.frustumCulled = false;
      var shadowGeo = new T.PlaneGeometry(1, 1);
      shadowGeo.rotateX(-Math.PI / 2);
      var shadowW = W * 1.45 + 0.5;
      var shadowL = 3 + (W - 1) * 0.5;
      var shadow = new T.Mesh(shadowGeo, new T.MeshBasicMaterial({
        map: blobShadowTexture(),
        color: 724501,
        transparent: true,
        opacity: 0.42,
        depthWrite: false
      }));
      shadow.rotation.order = "YXZ";
      shadow.renderOrder = 3;
      shadow.scale.set(shadowW, 1, shadowL);
      shadow.userData = { w: shadowW, l: shadowL };
      return {
        group: g,
        body: g,
        wheels,
        rims,
        steerWheels,
        flame,
        star: starGroup,
        sparks,
        sparkPos,
        sparkCount,
        lights: [],
        shadow,
        width: W,
        wheelR: wr
      };
    }
    function makeTrackMesh(track) {
      var pts = track.points, n = pts.length;
      var HW = track.halfWidth, RUM = 0.7, GROUND = 70;
      var isCity = track.theme === "city";
      var i, p, a, b;
      function right(heading) {
        return { x: -Math.cos(heading), z: Math.sin(heading) };
      }
      var pos = [], uv = [], idx = [], col = [];
      var cLight = new T.Color(isCity ? 4869720 : 6515318);
      var cDark = new T.Color(isCity ? 3882824 : 5660008);
      for (i = 0; i <= n; i++) {
        p = pts[i % n];
        var r = right(p.heading);
        pos.push(p.x - r.x * HW, p.y, p.z - r.z * HW);
        pos.push(p.x + r.x * HW, p.y, p.z + r.z * HW);
        uv.push(0, p.s / 8, 1, p.s / 8);
        var cc = Math.floor(p.s / 12) % 2 ? cLight : cDark;
        col.push(cc.r, cc.g, cc.b, cc.r, cc.g, cc.b);
      }
      for (i = 0; i < n; i++) {
        var o = i * 2;
        idx.push(o, o + 1, o + 2, o + 1, o + 3, o + 2);
      }
      var roadGeo = new T.BufferGeometry();
      roadGeo.setAttribute("position", new T.BufferAttribute(new Float32Array(pos), 3));
      roadGeo.setAttribute("uv", new T.BufferAttribute(new Float32Array(uv), 2));
      roadGeo.setAttribute("color", new T.BufferAttribute(new Float32Array(col), 3));
      roadGeo.setIndex(idx);
      roadGeo.computeVertexNormals();
      var road = new T.Mesh(roadGeo, new T.MeshStandardMaterial({
        map: asphaltTexture(isCity),
        vertexColors: true,
        roughness: 0.92,
        metalness: 0.02
      }));
      road.receiveShadow = true;
      var group = new T.Group();
      group.add(road);
      [-1, 1].forEach(function(side) {
        var p2 = [], u2 = [], i2 = [], c2 = [];
        for (i = 0; i <= n; i++) {
          p = pts[i % n];
          var r3 = right(p.heading);
          var inner = side * HW, outer = side * (HW + RUM);
          p2.push(p.x + r3.x * inner, p.y + 0.02, p.z + r3.z * inner);
          p2.push(p.x + r3.x * outer, p.y - 0.04, p.z + r3.z * outer);
          u2.push(0, p.s / 8, 1, p.s / 8);
          var alt = Math.floor(p.s / 6) % 2 === 0;
          var cA = isCity ? alt ? 58879 : 16723349 : alt ? 15922423 : 14043979;
          var cc2 = new T.Color(cA);
          c2.push(cc2.r, cc2.g, cc2.b, cc2.r, cc2.g, cc2.b);
        }
        for (i = 0; i < n; i++) {
          var o3 = i * 2;
          if (side > 0) i2.push(o3, o3 + 1, o3 + 2, o3 + 1, o3 + 3, o3 + 2);
          else i2.push(o3, o3 + 2, o3 + 1, o3 + 1, o3 + 2, o3 + 3);
        }
        var g2 = new T.BufferGeometry();
        g2.setAttribute("position", new T.BufferAttribute(new Float32Array(p2), 3));
        g2.setAttribute("uv", new T.BufferAttribute(new Float32Array(u2), 2));
        g2.setAttribute("color", new T.BufferAttribute(new Float32Array(c2), 3));
        g2.setIndex(i2);
        g2.computeVertexNormals();
        var m2 = new T.Mesh(g2, new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.7 }));
        m2.receiveShadow = true;
        group.add(m2);
      });
      function stripe(cOff, halfW, color, opt) {
        opt = opt || {};
        var dash = opt.dash || 0, gap = opt.gap || 0;
        var yOff = opt.y != null ? opt.y : 0.015;
        var sp2 = [], si = [], vi = 0;
        for (var k = 0; k < n; k++) {
          var aa = pts[k], bb = pts[(k + 1) % n];
          if (dash && aa.s % (dash + gap) >= dash) continue;
          var rA = right(aa.heading), rB = right(bb.heading);
          sp2.push(aa.x + rA.x * (cOff - halfW), aa.y + yOff, aa.z + rA.z * (cOff - halfW));
          sp2.push(aa.x + rA.x * (cOff + halfW), aa.y + yOff, aa.z + rA.z * (cOff + halfW));
          sp2.push(bb.x + rB.x * (cOff - halfW), bb.y + yOff, bb.z + rB.z * (cOff - halfW));
          sp2.push(bb.x + rB.x * (cOff + halfW), bb.y + yOff, bb.z + rB.z * (cOff + halfW));
          si.push(vi, vi + 1, vi + 2, vi + 1, vi + 3, vi + 2);
          vi += 4;
        }
        if (!vi) return;
        var sg = new T.BufferGeometry();
        sg.setAttribute("position", new T.BufferAttribute(new Float32Array(sp2), 3));
        sg.setIndex(si);
        sg.computeVertexNormals();
        var sm = new T.Mesh(sg, new T.MeshBasicMaterial({ color }));
        sm.userData.kind = "roadLine";
        group.add(sm);
      }
      var paint = 16777215;
      stripe(0, 0.14, paint, { dash: 12, gap: 8, y: 0.026 });
      stripe(-(HW - 0.62), 0.18, paint, { y: 0.028 });
      stripe(HW - 0.62, 0.18, paint, { y: 0.028 });
      if (isCity) {
        stripe(-(HW - 1.45), 0.07, 58879, { y: 0.03 });
        stripe(HW - 1.45, 0.07, 16723349, { y: 0.03 });
      }
      var sp = [], su = [];
      var s0 = pts[0], s1 = pts[3], rs = right(s0.heading);
      sp.push(s0.x - rs.x * HW, s0.y + 0.02, s0.z - rs.z * HW);
      sp.push(s0.x + rs.x * HW, s0.y + 0.02, s0.z + rs.z * HW);
      sp.push(s1.x - rs.x * HW, s1.y + 0.02, s1.z - rs.z * HW);
      sp.push(s1.x + rs.x * HW, s1.y + 0.02, s1.z + rs.z * HW);
      su.push(0, 0, 1, 0, 0, 1, 1, 1);
      var startGeo = new T.BufferGeometry();
      startGeo.setAttribute("position", new T.BufferAttribute(new Float32Array(sp), 3));
      startGeo.setAttribute("uv", new T.BufferAttribute(new Float32Array(su), 2));
      startGeo.setIndex([0, 1, 3, 0, 3, 2]);
      startGeo.computeVertexNormals();
      group.add(new T.Mesh(startGeo, new T.MeshBasicMaterial({ map: checkerTexture() })));
      var gp = [], gi = [], gc = [], gidx = 0;
      var gcolA = new T.Color(isCity ? 1316380 : 4098901);
      var gcolB = new T.Color(isCity ? 987414 : 3501893);
      for (i = 0; i <= n; i++) {
        p = pts[i % n];
        var r2 = right(p.heading);
        var wob = Math.sin(i * 0.7) * 0.6;
        gp.push(p.x + r2.x * (HW + RUM), p.y - 0.35, p.z + r2.z * (HW + RUM));
        gp.push(p.x + r2.x * (GROUND + wob), p.y - 1.6, p.z + r2.z * (GROUND + wob));
        gp.push(p.x - r2.x * (HW + RUM), p.y - 0.35, p.z - r2.z * (HW + RUM));
        gp.push(p.x - r2.x * (GROUND + wob), p.y - 1.6, p.z - r2.z * (GROUND + wob));
        var cg = Math.floor(i / 9) % 2 ? gcolA : gcolB;
        for (var kk = 0; kk < 4; kk++) gc.push(cg.r, cg.g, cg.b);
      }
      for (i = 0; i < n; i++) {
        var o2 = i * 4;
        gi.push(o2, o2 + 1, o2 + 4, o2 + 1, o2 + 5, o2 + 4);
        gi.push(o2 + 2, o2 + 6, o2 + 3, o2 + 3, o2 + 6, o2 + 7);
      }
      var groundGeo = new T.BufferGeometry();
      groundGeo.setAttribute("position", new T.BufferAttribute(new Float32Array(gp), 3));
      groundGeo.setAttribute("color", new T.BufferAttribute(new Float32Array(gc), 3));
      groundGeo.setIndex(gi);
      groundGeo.computeVertexNormals();
      var ground = new T.Mesh(groundGeo, new T.MeshStandardMaterial({
        vertexColors: true,
        roughness: 1,
        side: T.DoubleSide
      }));
      ground.receiveShadow = true;
      group.add(ground);
      var wallH = isCity ? 1.25 : 0.85;
      var wallT = 0.16;
      var wallOff = HW + RUM + 0.14;
      var postStep = 2;
      var wV = new T.Vector3(), wQ = new T.Quaternion(), wM = new T.Matrix4(), wS = new T.Vector3(1, 1, 1), wC = new T.Color();
      [-1, 1].forEach(function(side) {
        var body = new T.InstancedMesh(
          new T.BoxGeometry(wallT, wallH, 4),
          new T.MeshStandardMaterial({ color: 16777215, roughness: 0.75, metalness: 0.05 }),
          n
        );
        body.castShadow = true;
        body.receiveShadow = true;
        body.userData.kind = "guardrail";
        var cap = new T.InstancedMesh(
          new T.BoxGeometry(wallT + 0.12, 0.1, 4),
          new T.MeshStandardMaterial({ color: 16777215, roughness: 0.45, metalness: 0.2 }),
          n
        );
        cap.castShadow = true;
        var post = new T.InstancedMesh(
          new T.BoxGeometry(0.13, wallH + 0.16, 0.13),
          new T.MeshStandardMaterial({ color: 16777215, roughness: 0.85 }),
          Math.ceil(n / postStep)
        );
        post.castShadow = true;
        var pi = 0;
        for (var k = 0; k < n; k++) {
          var pa = pts[k], pb = pts[(k + 1) % n];
          var mx = (pa.x + pb.x) / 2, mz = (pa.z + pb.z) / 2, my = (pa.y + pb.y) / 2;
          var yaw = Math.atan2(pb.x - pa.x, pb.z - pa.z);
          var r3 = { x: -Math.cos(yaw), z: Math.sin(yaw) };
          var cx2 = mx + r3.x * side * wallOff, cz2 = mz + r3.z * side * wallOff;
          wQ.setFromEuler(new T.Euler(0, yaw, 0));
          wV.set(cx2, my + wallH / 2, cz2);
          wS.set(1, 1, 1);
          wM.compose(wV, wQ, wS);
          body.setMatrixAt(k, wM);
          wV.set(cx2, my + wallH + 0.05, cz2);
          wM.compose(wV, wQ, wS);
          cap.setMatrixAt(k, wM);
          var alt = Math.floor(pa.s / 8) % 2 === 0;
          var cBody = isCity ? alt ? 3752282 : 2304057 : alt ? 15791095 : 14043979;
          wC.set(cBody);
          body.setColorAt(k, wC);
          wC.set(isCity ? 58879 : 16777215);
          cap.setColorAt(k, wC);
          if (k % postStep === 0 && pi < post.count) {
            wV.set(cx2, my + (wallH + 0.16) / 2, cz2);
            wM.compose(wV, wQ, wS);
            post.setMatrixAt(pi, wM);
            wC.set(5266030);
            post.setColorAt(pi, wC);
            pi++;
          }
        }
        body.instanceMatrix.needsUpdate = true;
        cap.instanceMatrix.needsUpdate = true;
        post.instanceMatrix.needsUpdate = true;
        if (body.instanceColor) body.instanceColor.needsUpdate = true;
        if (cap.instanceColor) cap.instanceColor.needsUpdate = true;
        if (post.instanceColor) post.instanceColor.needsUpdate = true;
        group.add(body);
        group.add(cap);
        group.add(post);
      });
      var tunnelSlots = track.slots.filter(function(s) {
        return s.tunnel;
      });
      if (tunnelSlots.length) {
        let archHalfWidth = function(h) {
          var t2 = Math.min(1, Math.max(0, h / ARCH));
          return Math.sqrt(Math.max(0, 1 - t2 * t2)) * AW;
        }, tunnelStrip = function(side2, h0, h1, color) {
          var qp = [], qi = [], vi2 = 0;
          var l0 = side2 * archHalfWidth(h0), l1 = side2 * archHalfWidth(h1);
          for (var k3 = 0; k3 < rows.length - 1; k3++) {
            var u0 = rows[k3], u1 = rows[k3 + 1];
            if (u1.s < u0.s) break;
            var rA2 = right(u0.heading), rB2 = right(u1.heading);
            qp.push(u0.x + rA2.x * l0, u0.y + h0, u0.z + rA2.z * l0);
            qp.push(u0.x + rA2.x * l1, u0.y + h1, u0.z + rA2.z * l1);
            qp.push(u1.x + rB2.x * l0, u1.y + h0, u1.z + rB2.z * l0);
            qp.push(u1.x + rB2.x * l1, u1.y + h1, u1.z + rB2.z * l1);
            qi.push(vi2, vi2 + 2, vi2 + 1, vi2 + 1, vi2 + 2, vi2 + 3);
            vi2 += 4;
          }
          if (!vi2) return;
          var qg = new T.BufferGeometry();
          qg.setAttribute("position", new T.BufferAttribute(new Float32Array(qp), 3));
          qg.setIndex(qi);
          group.add(new T.Mesh(qg, new T.MeshBasicMaterial({ color, side: T.DoubleSide })));
        };
        var sStart = tunnelSlots[0].s, sEnd = tunnelSlots[tunnelSlots.length - 1].s + 8;
        var SEG = 9, ARCH = 6.2, AW = HW + 1.2;
        var rows = [];
        for (i = 0; i <= n; i++) {
          p = pts[i % n];
          if (p.s >= sStart && p.s <= sEnd) rows.push(p);
        }
        var tp = [], ti = [], tc = [];
        for (var ri = 0; ri < rows.length; ri++) {
          p = rows[ri];
          var r4 = right(p.heading);
          var rib = Math.floor(p.s / 6) % 2 === 0;
          for (var a2 = 0; a2 <= SEG; a2++) {
            var ang = Math.PI * (a2 / SEG);
            var hgt = Math.sin(ang) * ARCH, lat = Math.cos(ang) * AW;
            tp.push(p.x + r4.x * lat, p.y + hgt, p.z + r4.z * lat);
            var shade = (rib ? 1.16 : 0.84) * (0.7 + 0.52 * Math.sin(ang));
            var gm = shade * (isCity ? 0.6 : 0.86);
            tc.push(gm, gm * (isCity ? 1.05 : 1), gm * (isCity ? 1.24 : 1.04));
          }
        }
        var rowsN = tp.length / 3 / (SEG + 1);
        for (i = 0; i < rowsN - 1; i++) {
          for (var q = 0; q < SEG; q++) {
            var o4 = i * (SEG + 1) + q, o5 = (i + 1) * (SEG + 1) + q;
            ti.push(o4, o4 + 1, o5, o4 + 1, o5 + 1, o5);
          }
        }
        if (tp.length) {
          var tg = new T.BufferGeometry();
          tg.setAttribute("position", new T.BufferAttribute(new Float32Array(tp), 3));
          tg.setAttribute("color", new T.BufferAttribute(new Float32Array(tc), 3));
          tg.setIndex(ti);
          tg.computeVertexNormals();
          group.add(new T.Mesh(tg, new T.MeshStandardMaterial({
            vertexColors: true,
            roughness: 0.95,
            side: T.DoubleSide
          })));
        }
        var stripCol = isCity ? 58879 : 16761418;
        tunnelStrip(-1, 1.7, 2.15, stripCol);
        tunnelStrip(1, 1.7, 2.15, isCity ? 16723349 : stripCol);
        var lampList = [];
        for (i = 1; i < rows.length - 1; i += 3) lampList.push(rows[i]);
        if (lampList.length) {
          var lm = new T.InstancedMesh(
            new T.BoxGeometry(isCity ? 1 : 1.5, 0.12, isCity ? 0.5 : 0.7),
            new T.MeshBasicMaterial({ color: isCity ? 10286847 : 16771518 }),
            lampList.length
          );
          var mtx = new T.Matrix4(), qa = new T.Quaternion(), vv = new T.Vector3(), sv = new T.Vector3(1, 1, 1);
          lampList.forEach(function(lp3, k4) {
            vv.set(lp3.x, lp3.y + ARCH - 0.7, lp3.z);
            qa.setFromEuler(new T.Euler(0, lp3.heading, 0));
            mtx.compose(vv, qa, sv);
            lm.setMatrixAt(k4, mtx);
          });
          lm.instanceMatrix.needsUpdate = true;
          group.add(lm);
        }
      }
      return group;
    }
    var TRUNK_BROWNS = ["#6B4A2F", "#5A3E28", "#7A5636", "#63452E"];
    var TREE_GREENS = ["#2F7A46", "#3C8C4E", "#276A3E", "#4A9A57", "#357F44"];
    var BUILDING_TINTS = ["#9AA3B2", "#7E879A", "#B0B8C6", "#6E7688", "#8892A3"];
    var ROOF_COLORS = ["#FF4B4B", "#3A4050", "#5A6272", "#FFD23F", "#2E3442"];
    var SEAT_COLORS = ["#3B6EA8", "#DCE3EC", "#2F5C8C", "#F2F4F7", "#4E88C4"];
    var NEON_COLORS = ["#00E5FF", "#FF2D95", "#FFD23F", "#B56BFF", "#45FF9E"];
    var _pickCol = new T.Color();
    function pick(palette, bright) {
      return function(it, i) {
        var h = Math.abs(i * 31 + Math.round(it.d.off * 13) + Math.round((it.d.scale || 0) * 71) + Math.round((it.d.w || 0) * 17) + Math.round((it.d.hh || 0) * 7)) % palette.length;
        var c = palette[h];
        if (bright && bright !== 1) {
          _pickCol.set(c);
          return _pickCol.multiplyScalar(bright).getHex();
        }
        return c;
      };
    }
    function makeDecor(track) {
      var group = new T.Group();
      var tmpM = new T.Matrix4(), tmpQ = new T.Quaternion(), tmpV = new T.Vector3(), tmpS = new T.Vector3();
      var tmpC = new T.Color();
      var byType = {};
      track.slots.forEach(function(slot) {
        slot.decor.forEach(function(d) {
          (byType[d.type] || (byType[d.type] = [])).push({ slot, d });
        });
      });
      function place(items, geo, mat, opts) {
        if (!items.length) return;
        var mesh = new T.InstancedMesh(geo, mat, items.length);
        if (opts.name) mesh.name = opts.name;
        mesh.castShadow = !!opts.cast;
        mesh.receiveShadow = true;
        items.forEach(function(it, i) {
          var p = track.sample(it.slot.s);
          var r = { x: -Math.cos(p.heading), z: Math.sin(p.heading) };
          var off = it.d.side * it.d.off * track.halfWidth;
          var x = p.x + r.x * off, z = p.z + r.z * off;
          var yaw = p.heading + (opts.face ? 0 : it.d.side > 0 ? 0.2 : -0.2) + (it.d.rot || 0);
          var sc = it.d.scale;
          var yOff = typeof opts.y === "function" ? opts.y(it, i) : (opts.y || 0) * sc;
          var sy = opts.h ? typeof opts.hv === "function" ? opts.hv(it, i) : (opts.hv || 1) * sc : sc;
          var sx = typeof opts.sx === "function" ? opts.sx(it, i) : sc;
          var sz = typeof opts.sz === "function" ? opts.sz(it, i) : sc;
          tmpV.set(x, p.y + yOff, z);
          tmpQ.setFromEuler(new T.Euler(0, yaw, 0));
          tmpS.set(sx, sy, sz);
          tmpM.compose(tmpV, tmpQ, tmpS);
          mesh.setMatrixAt(i, tmpM);
          if (opts.color) {
            tmpC.set(opts.color(it, i));
            mesh.setColorAt(i, tmpC);
          }
        });
        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        group.add(mesh);
        return mesh;
      }
      var trees = byType.tree || [];
      if (trees.length) {
        var coneTrees = trees.filter(function(t, i) {
          return i % 3 !== 0;
        });
        var blobTrees = trees.filter(function(t, i) {
          return i % 3 === 0;
        });
        var trunkMat = new T.MeshStandardMaterial({ color: 16777215, roughness: 0.95 });
        var leafMat = new T.MeshStandardMaterial({ color: 16777215, roughness: 0.9, flatShading: true });
        place(
          coneTrees,
          new T.CylinderGeometry(0.13, 0.22, 1.5, 6),
          trunkMat,
          { y: 0.75, cast: true, color: pick(TRUNK_BROWNS) }
        );
        place(
          coneTrees,
          new T.ConeGeometry(1.45, 2, 8),
          leafMat,
          { y: 2, cast: true, color: pick(TREE_GREENS, 0.88) }
        );
        place(
          coneTrees,
          new T.ConeGeometry(1.14, 1.8, 8),
          leafMat,
          { y: 2.95, cast: true, color: pick(TREE_GREENS, 1) }
        );
        place(
          coneTrees,
          new T.ConeGeometry(0.82, 1.5, 8),
          leafMat,
          { y: 3.7, cast: true, color: pick(TREE_GREENS, 1.14) }
        );
        place(
          blobTrees,
          new T.CylinderGeometry(0.16, 0.24, 1.7, 6),
          trunkMat,
          { y: 0.85, cast: true, color: pick(TRUNK_BROWNS) }
        );
        place(
          blobTrees,
          new T.IcosahedronGeometry(1.55, 0),
          leafMat,
          { y: 2.5, cast: true, color: pick(TREE_GREENS, 0.94) }
        );
        place(
          blobTrees,
          new T.IcosahedronGeometry(1, 0),
          leafMat,
          { y: 3.9, cast: true, color: pick(TREE_GREENS, 1.12) }
        );
      }
      var tw = byType.tirewall || [];
      place(
        tw,
        new T.BoxGeometry(0.9, 0.7, 3.2),
        new T.MeshStandardMaterial({ color: 14043979, roughness: 0.85 }),
        { y: 0.35, cast: true }
      );
      place(
        tw,
        new T.BoxGeometry(0.95, 0.16, 3.25),
        new T.MeshStandardMaterial({ color: 15922423, roughness: 0.8 }),
        { y: 0.74, cast: true }
      );
      var stands = byType.grandstand || [];
      if (stands.length) {
        place(
          stands,
          new T.BoxGeometry(2.6, 4, 12),
          new T.MeshStandardMaterial({ color: 9278886, roughness: 0.9 }),
          { y: 2, cast: true }
        );
        place(
          stands,
          new T.BoxGeometry(2.75, 2.2, 12.4),
          new T.MeshStandardMaterial({ color: 16777215, roughness: 0.85 }),
          { y: 4.9, cast: true, color: pick(SEAT_COLORS) }
        );
        place(
          stands,
          new T.BoxGeometry(3.3, 0.28, 12.8),
          new T.MeshStandardMaterial({ color: 3817552, roughness: 0.8, metalness: 0.2 }),
          { y: 6.15, cast: true }
        );
      }
      function bldW(it) {
        return it.d.w || it.d.scale;
      }
      function bldD(it) {
        return it.d.dp || it.d.scale;
      }
      function bldH(it) {
        return it.d.hh || 9;
      }
      var buildings = byType.building || [];
      if (buildings.length) {
        var bldTiers = [[], [], []];
        buildings.forEach(function(it) {
          var hh = bldH(it);
          bldTiers[hh <= 8 ? 0 : hh <= 18 ? 1 : 2].push(it);
        });
        var tierTex = [windowTexture(1, 1), windowTexture(1, 2), windowTexture(1, 4)];
        bldTiers.forEach(function(list, t) {
          if (!list.length) return;
          place(
            list,
            new T.BoxGeometry(1, 1, 1),
            new T.MeshStandardMaterial({
              map: tierTex[t],
              roughness: 0.72,
              metalness: 0.12,
              emissive: 16767392,
              emissiveMap: tierTex[t],
              emissiveIntensity: 0.55
            }),
            {
              name: "building-body",
              y: function(it) {
                return bldH(it) / 2;
              },
              // 楼底贴地
              h: true,
              hv: function(it) {
                return bldH(it);
              },
              // 高度逐栋独立
              sx: function(it) {
                return bldW(it);
              },
              sz: function(it) {
                return bldD(it);
              },
              cast: true,
              face: true,
              color: pick(BUILDING_TINTS)
            }
          );
        });
        place(
          buildings,
          new T.BoxGeometry(1.06, 0.5, 1.06),
          new T.MeshStandardMaterial({ color: 16777215, roughness: 0.6, metalness: 0.25 }),
          {
            name: "building-roof",
            y: function(it) {
              return bldH(it) + 0.22;
            },
            // 压顶坐在楼顶
            sx: function(it) {
              return bldW(it) * 1.06;
            },
            sz: function(it) {
              return bldD(it) * 1.06;
            },
            cast: true,
            face: true,
            color: pick(ROOF_COLORS)
          }
        );
      }
      place(
        byType.neon || [],
        new T.BoxGeometry(0.35, 3.4, 1.6),
        new T.MeshBasicMaterial({ color: 16777215 }),
        { y: 1.9, cast: false, color: pick(NEON_COLORS) }
      );
      var cones = byType.cone || [];
      place(
        cones,
        new T.ConeGeometry(0.28, 0.8, 8),
        new T.MeshStandardMaterial({ color: 16738847, roughness: 0.7 }),
        { y: 0.4, cast: true }
      );
      place(
        cones,
        new T.BoxGeometry(0.52, 0.1, 0.52),
        new T.MeshStandardMaterial({ color: 15922423, roughness: 0.8 }),
        { y: 0.06, cast: true }
      );
      return group;
    }
    function makeItemBox() {
      var tex = questionTexture();
      var g = new T.Group();
      var cube = new T.Mesh(
        new T.BoxGeometry(1.5, 1.5, 1.5),
        new T.MeshStandardMaterial({ map: tex, emissive: 5587968, emissiveIntensity: 0.5, roughness: 0.4, metalness: 0.2 })
      );
      cube.castShadow = true;
      g.add(cube);
      var halo = new T.Mesh(
        new T.RingGeometry(1.3, 1.6, 20),
        new T.MeshBasicMaterial({ color: 16765503, transparent: true, opacity: 0.35, side: T.DoubleSide })
      );
      halo.rotation.x = -Math.PI / 2;
      halo.position.y = -0.7;
      g.add(halo);
      return g;
    }
    function makeBanana() {
      var g = new T.Group();
      var b = new T.Mesh(new T.SphereGeometry(0.45, 12, 8), new T.MeshStandardMaterial({ color: 16765503, roughness: 0.5 }));
      b.scale.set(1.25, 0.42, 0.7);
      b.castShadow = true;
      b.position.y = 0.16;
      g.add(b);
      var stem = new T.Mesh(new T.BoxGeometry(0.12, 0.1, 0.12), new T.MeshStandardMaterial({ color: 9133568 }));
      stem.position.set(-0.45, 0.2, 0);
      g.add(stem);
      return g;
    }
    function makeMissile() {
      var g = new T.Group();
      var body = new T.Mesh(new T.ConeGeometry(0.22, 0.9, 10), new T.MeshStandardMaterial({ color: 16730955, roughness: 0.4 }));
      body.rotation.x = Math.PI / 2;
      g.add(body);
      var fin = new T.Mesh(new T.BoxGeometry(0.5, 0.06, 0.2), new T.MeshStandardMaterial({ color: 16765503 }));
      fin.position.z = -0.35;
      g.add(fin);
      var glow = new T.Mesh(new T.SphereGeometry(0.3, 10, 8), new T.MeshBasicMaterial({ color: 16751164, transparent: true, opacity: 0.5 }));
      glow.position.z = -0.5;
      g.add(glow);
      return g;
    }
    function makeBomb() {
      var g = new T.Group();
      var b = new T.Mesh(new T.SphereGeometry(0.55, 14, 10), new T.MeshStandardMaterial({ color: 1777447, roughness: 0.5, metalness: 0.4 }));
      b.castShadow = true;
      b.position.y = 0.55;
      g.add(b);
      var cap = new T.Mesh(new T.CylinderGeometry(0.12, 0.12, 0.2, 8), new T.MeshStandardMaterial({ color: 16738847 }));
      cap.position.y = 1.15;
      g.add(cap);
      return g;
    }
    function makeExplosion() {
      var m = new T.Mesh(
        new T.SphereGeometry(1, 16, 12),
        new T.MeshBasicMaterial({ color: 16747051, transparent: true, opacity: 0.9, depthWrite: false })
      );
      m.visible = false;
      return m;
    }
    function makeSky(theme) {
      var geo = new T.SphereGeometry(700, 24, 16);
      var pos = geo.attributes.position, colors = [];
      var top = new T.Color(theme === "city" ? 1708088 : 5152726);
      var mid = new T.Color(theme === "city" ? 4857436 : 11131120);
      var bot = new T.Color(theme === "city" ? 722962 : 6060626);
      for (var i = 0; i < pos.count; i++) {
        var y = pos.getY(i) / 700;
        var c = y > 0 ? top.clone().lerp(mid, 1 - y) : mid.clone().lerp(bot, -y);
        colors.push(c.r, c.g, c.b);
      }
      geo.setAttribute("color", new T.BufferAttribute(new Float32Array(colors), 3));
      var m = new T.Mesh(geo, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide, fog: false }));
      return m;
    }
    function makeBoostPads(track) {
      var group = new T.Group();
      var tex = canvasTex(64, 64, function(g) {
        g.fillStyle = "#0A5C8A";
        g.fillRect(0, 0, 64, 64);
        g.fillStyle = "#66E0FF";
        for (var i = 0; i < 4; i++) {
          g.beginPath();
          g.moveTo(32, 6 + i * 16);
          g.lineTo(54, 22 + i * 16);
          g.lineTo(32, 30 + i * 16);
          g.lineTo(10, 22 + i * 16);
          g.closePath();
          g.fill();
        }
      }, 1, 1);
      var mat = new T.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.9, depthWrite: false });
      track.slots.forEach(function(slot) {
        if (!slot.boost) return;
        slot.boost.forEach(function(bx) {
          var p = track.sample(slot.s + 4);
          var r = { x: -Math.cos(p.heading), z: Math.sin(p.heading) };
          var m = new T.Mesh(new T.PlaneGeometry(2.6, 7), mat);
          m.rotation.x = -Math.PI / 2;
          m.rotation.z = -p.heading;
          m.position.set(p.x + r.x * bx * track.halfWidth, p.y + 0.03, p.z + r.z * bx * track.halfWidth);
          m.userData.tex = tex;
          group.add(m);
        });
      });
      return group;
    }
    KART.meshes = {
      makeKartMesh,
      makeTrackMesh,
      makeDecor,
      makeItemBox,
      makeBanana,
      makeMissile,
      makeBomb,
      makeExplosion,
      makeSky,
      makeBoostPads,
      envTexture
    };
  })(typeof window !== "undefined" ? window : globalThis);
  (function(global) {
    var KART = global.KART;
    var P = KART.physics;
    var CFG = KART.CFG;
    function roundRect(g, x, y, w, h, r) {
      r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
      g.beginPath();
      g.moveTo(x + r, y);
      g.lineTo(x + w - r, y);
      g.quadraticCurveTo(x + w, y, x + w, y + r);
      g.lineTo(x + w, y + h - r);
      g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      g.lineTo(x + r, y + h);
      g.quadraticCurveTo(x, y + h, x, y + h - r);
      g.lineTo(x, y + r);
      g.quadraticCurveTo(x, y, x + r, y);
      g.closePath();
    }
    function panel(g, x, y, w, h, r) {
      g.save();
      g.fillStyle = "rgba(9,11,16,0.62)";
      roundRect(g, x, y, w, h, r || 12);
      g.fill();
      g.strokeStyle = "rgba(255,255,255,0.10)";
      g.lineWidth = 1;
      g.stroke();
      g.restore();
    }
    function clamp(v, a, b) {
      return v < a ? a : v > b ? b : v;
    }
    function HUD(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.w = 0;
      this.h = 0;
      this.resize();
    }
    HUD.prototype.resize = function() {
      var dpr = Math.min(global.devicePixelRatio || 1, 2);
      var w = this.canvas.clientWidth || global.innerWidth;
      var h = this.canvas.clientHeight || global.innerHeight;
      this.canvas.width = Math.round(w * dpr);
      this.canvas.height = Math.round(h * dpr);
      this.w = w;
      this.h = h;
      this.dpr = dpr;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    HUD.prototype.clear = function() {
      this.ctx.clearRect(0, 0, this.w, this.h);
    };
    HUD.prototype.draw = function(race) {
      var g = this.ctx, w = this.w, h = this.h;
      var player = race.player;
      this.clear();
      g.textBaseline = "top";
      panel(g, 16, 16, 150, 82);
      g.textAlign = "left";
      g.fillStyle = "#FFFFFF";
      g.font = '800 40px system-ui, -apple-system, "Segoe UI", sans-serif';
      g.fillText(String(player.rank), 32, 24);
      g.font = "600 15px system-ui, sans-serif";
      g.fillStyle = "#8D95A6";
      g.fillText("/ " + race.cars.length, 74, 44);
      g.font = "700 16px system-ui, sans-serif";
      g.fillStyle = "#FFFFFF";
      g.fillText("LAP " + Math.min(player.lap + 1, race.totalLaps) + " / " + race.totalLaps, 32, 66);
      var ahead = null;
      for (var i = 0; i < race.cars.length; i++) if (race.cars[i].rank === player.rank - 1) ahead = race.cars[i];
      if (ahead) {
        var gapS = (ahead.progress - player.progress) / Math.max(8, player.speed);
        g.font = "600 13px system-ui, sans-serif";
        g.fillStyle = "#FFD23F";
        g.fillText("\u524D\u8F66 +" + gapS.toFixed(1) + "s", 32, 106);
      } else {
        g.font = "600 13px system-ui, sans-serif";
        g.fillStyle = "#45C4FF";
        g.fillText("\u9886\u5148\u4E2D", 32, 106);
      }
      panel(g, w - 190, 16, 174, 78);
      g.textAlign = "right";
      g.fillStyle = "#FFFFFF";
      g.font = "700 24px ui-monospace, Consolas, monospace";
      g.fillText(P.formatTime(race.time), w - 32, 26);
      g.font = "500 12px system-ui, sans-serif";
      g.fillStyle = "#8D95A6";
      g.fillText("\u672C\u5708 " + P.formatTime(race.time - player.lastLapAt), w - 32, 56);
      g.fillText("\u6700\u4F73 " + (player.bestLap ? P.formatTime(player.bestLap) : "--:--.---"), w - 32, 74);
      this.minimap(race, w - 148, 106, 128);
      var cx = w - 86, cy = h - 92, R = 56;
      g.save();
      g.lineCap = "round";
      g.beginPath();
      g.arc(cx, cy, R, Math.PI * 0.75, Math.PI * 2.25);
      g.strokeStyle = "rgba(255,255,255,0.16)";
      g.lineWidth = 9;
      g.stroke();
      var pct = clamp(player.speed / (player.spec.maxSpeed * 1.35), 0, 1);
      var boosting = P.activeBoost(player) > 1.02;
      var grad = g.createLinearGradient(cx - R, cy, cx + R, cy);
      grad.addColorStop(0, boosting ? "#FFD23F" : "#45C4FF");
      grad.addColorStop(1, boosting ? "#FF6A1F" : "#00E5FF");
      g.beginPath();
      g.arc(cx, cy, R, Math.PI * 0.75, Math.PI * 0.75 + Math.PI * 1.5 * pct);
      g.strokeStyle = grad;
      g.lineWidth = 9;
      g.stroke();
      g.restore();
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillStyle = "#FFFFFF";
      g.font = "800 30px ui-monospace, Consolas, monospace";
      g.fillText(String(Math.round(P.dispKmh(player))), cx, cy - 6);
      g.font = "600 11px system-ui, sans-serif";
      g.fillStyle = "#8D95A6";
      g.fillText("km/h", cx, cy + 20);
      if (player.drifting || player.driftTime > 0.05) {
        var bw = 240, bh = 14, bx = w / 2 - bw / 2, by = h - 52;
        panel(g, bx - 3, by - 3, bw + 6, bh + 6, 8);
        var dp = clamp(player.driftTime / 2.2, 0, 1);
        var col = dp >= 1 ? "#B56BFF" : dp >= 0.636 ? "#FF6A1F" : "#45C4FF";
        g.fillStyle = col;
        roundRect(g, bx, by, bw * dp, bh, 6);
        g.fill();
        if (dp >= 1) {
          g.save();
          g.globalAlpha = 0.5 + 0.5 * Math.sin(race.time * 20);
          g.fillStyle = "#FFFFFF";
          roundRect(g, bx, by, bw * dp, bh, 6);
          g.fill();
          g.restore();
        }
        g.font = "700 11px system-ui, sans-serif";
        g.fillStyle = "#FFFFFF";
        g.textAlign = "center";
        g.textBaseline = "bottom";
        g.fillText(dp >= 1 ? "\u8D85\u7EA7\u6DA1\u8F6E" : dp >= 0.636 ? "\u5F3A\u5316\u6DA1\u8F6E" : "\u8FF7\u4F60\u6DA1\u8F6E", w / 2, by - 6);
      }
      if (race.itemsEnabled) {
        var ix = w - 62, iy = h - 186;
        g.beginPath();
        g.arc(ix, iy, 34, 0, Math.PI * 2);
        g.fillStyle = "rgba(9,11,16,0.72)";
        g.fill();
        g.strokeStyle = "rgba(255,255,255,0.18)";
        g.lineWidth = 2;
        g.stroke();
        if (player.item) {
          var def = KART.ITEMS[player.item];
          g.beginPath();
          g.arc(ix, iy, 27, 0, Math.PI * 2);
          g.fillStyle = def.color;
          g.fill();
          g.fillStyle = player.item === "ink" || player.item === "banana" ? "#141821" : "#141821";
          g.font = "800 22px system-ui, sans-serif";
          g.textAlign = "center";
          g.textBaseline = "middle";
          g.fillText(def.short, ix, iy + 1);
        } else {
          g.fillStyle = "rgba(255,255,255,0.28)";
          g.font = "600 13px system-ui, sans-serif";
          g.textAlign = "center";
          g.textBaseline = "middle";
          g.fillText("\u7A7A", ix, iy);
        }
        if (player.itemRoll > 0) {
          g.save();
          g.globalAlpha = Math.min(1, player.itemRoll * 3);
          g.fillStyle = "rgba(9,11,16,0.85)";
          roundRect(g, ix - 46, iy - 76, 92, 34, 10);
          g.fill();
          g.fillStyle = "#FFFFFF";
          g.font = "700 15px system-ui, sans-serif";
          g.textAlign = "center";
          g.textBaseline = "middle";
          g.fillText(player.item ? KART.ITEMS[player.item].name : "", ix, iy - 59);
          g.restore();
        }
      }
      var listW = 118, listX = 16, listY = 132;
      panel(g, listX, listY, listW, 26 * Math.min(4, race.cars.length) + 10);
      g.textAlign = "left";
      g.textBaseline = "middle";
      for (var k = 0; k < Math.min(4, race.cars.length); k++) {
        var c2 = race.cars.filter(function(x) {
          return x.rank === k + 1;
        })[0];
        if (!c2) continue;
        var yy = listY + 13 + k * 26;
        g.fillStyle = c2.isPlayer ? "#E8FF47" : "#8D95A6";
        g.font = "700 12px system-ui, sans-serif";
        g.fillText(String(k + 1), listX + 12, yy);
        g.fillStyle = c2.isPlayer ? "#FFFFFF" : "#B9C2CE";
        g.font = c2.isPlayer ? "700 12px system-ui, sans-serif" : "500 12px system-ui, sans-serif";
        g.fillText(c2.name, listX + 28, yy);
        g.fillStyle = c2.spec.colors.primary;
        roundRect(g, listX + listW - 20, yy - 4, 10, 8, 3);
        g.fill();
      }
      var evs = player.events.slice(-3);
      g.textAlign = "center";
      g.textBaseline = "middle";
      for (var e2 = 0; e2 < evs.length; e2++) {
        var alpha = clamp(1.6 - evs[e2].t, 0, 1);
        g.save();
        g.globalAlpha = alpha;
        g.font = "800 22px system-ui, sans-serif";
        g.fillStyle = evs[e2].color || "#FFFFFF";
        g.shadowColor = "rgba(0,0,0,0.55)";
        g.shadowBlur = 10;
        g.fillText(evs[e2].text, w / 2, h * 0.2 + e2 * 28);
        g.restore();
      }
      var sx = w / 2 - 60, sy = 16;
      var badges = [];
      if (player.invincible > 0) badges.push({ t: "\u65E0\u654C", c: "#FFE45E" });
      if (player.shrinkTimer > 0) badges.push({ t: "\u7F29\u5C0F", c: "#B56BFF" });
      if (player.slipstream) badges.push({ t: "\u5C3E\u6D41", c: "#45C4FF" });
      if (player.slowTimer > 0) badges.push({ t: "\u51CF\u901F", c: "#FF6A1F" });
      badges.forEach(function(b, bi) {
        var bxp = sx + bi * 66;
        g.fillStyle = "rgba(9,11,16,0.7)";
        roundRect(g, bxp, sy, 60, 24, 12);
        g.fill();
        g.fillStyle = b.c;
        g.font = "700 12px system-ui, sans-serif";
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillText(b.t, bxp + 30, sy + 12);
      });
      if (player.inkTimer > 0) {
        g.save();
        g.globalAlpha = clamp(player.inkTimer / 5, 0, 1) * 0.93;
        g.fillStyle = "#080A0E";
        var seed = Math.floor(race.time * 2);
        for (var m = 0; m < 10; m++) {
          var ang = m * 0.9 + seed * 0.05;
          g.beginPath();
          g.ellipse(
            w / 2 + Math.cos(ang) * w * 0.3,
            h / 2 + Math.sin(ang) * h * 0.28,
            w * 0.17,
            h * 0.15,
            ang,
            0,
            Math.PI * 2
          );
          g.fill();
        }
        g.restore();
      }
      if (race.countdown > 0 || race.time < 0.8) {
        var txt = race.countdown > 0 ? String(Math.ceil(race.countdown)) : "GO!";
        g.save();
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.font = "900 " + (txt === "GO!" ? 96 : 84) + "px system-ui, sans-serif";
        g.fillStyle = txt === "GO!" ? "#FFD23F" : "#FFFFFF";
        g.shadowColor = "rgba(0,0,0,0.6)";
        g.shadowBlur = 20;
        g.fillText(txt, w / 2, h * 0.38);
        g.restore();
        if (race.countdown > 0) {
          g.save();
          g.textAlign = "center";
          g.textBaseline = "middle";
          g.font = "600 14px system-ui, sans-serif";
          g.fillStyle = "#FFFFFF";
          g.fillText("GO \u540E 0.25 \u79D2\u5185\u6309 \u2191 \u89E6\u53D1\u5B8C\u7F8E\u8D77\u6B65", w / 2, h * 0.38 + 62);
          g.restore();
        }
      }
      if (player.finished && race.state !== "finished") {
        g.save();
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.font = "800 26px system-ui, sans-serif";
        g.fillStyle = "#FFD23F";
        g.shadowColor = "rgba(0,0,0,0.6)";
        g.shadowBlur = 14;
        g.fillText("\u5B8C\u8D5B\uFF01\u7B49\u5F85\u5176\u4ED6\u8F66\u624B\u2026", w / 2, h * 0.28);
        g.restore();
      }
    };
    HUD.prototype.minimap = function(race, x, y, size) {
      var g = this.ctx, path = race.track.path2d;
      var pad = 12, iw = size - pad * 2;
      panel(g, x, y, size, size, 12);
      g.save();
      g.beginPath();
      for (var i = 0; i < path.length; i++) {
        var px = x + pad + path[i].x * iw, py = y + pad + path[i].y * iw;
        if (i === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.closePath();
      g.strokeStyle = "rgba(255,255,255,0.30)";
      g.lineWidth = Math.max(2.5, size / 24);
      g.lineJoin = "round";
      g.stroke();
      for (var c = 0; c < race.cars.length; c++) {
        var car = race.cars[c];
        var t = (car.z % race.track.length + race.track.length) % race.track.length / race.track.length;
        var idx = Math.floor(t * (path.length - 1));
        var p = path[idx];
        var px2 = x + pad + p.x * iw, py2 = y + pad + p.y * iw;
        g.beginPath();
        g.arc(px2, py2, car.isPlayer ? 5 : 3.5, 0, Math.PI * 2);
        g.fillStyle = car.isPlayer ? "#E8FF47" : car.spec.colors.primary;
        g.fill();
        if (car.isPlayer) {
          g.lineWidth = 2;
          g.strokeStyle = "#141821";
          g.stroke();
        }
      }
      g.restore();
    };
    KART.HUD = HUD;
  })(typeof window !== "undefined" ? window : globalThis);
  (function(global) {
    var KART = global.KART;
    var CFG = KART.CFG;
    var P = KART.physics;
    var T = global.THREE;
    var M = KART.meshes;
    var THEME = {
      circuit: { fog: 11126494, near: 90, far: 520, hemiSky: 10274798, hemiGround: 4086848, sun: 16774110, sunI: 0.72, amb: 0.14 },
      city: { fog: 2364982, near: 60, far: 420, hemiSky: 4862320, hemiGround: 1053208, sun: 16757370, sunI: 0.55, amb: 0.28 }
    };
    function Renderer3D(canvas, hudCanvas) {
      this.canvas = canvas;
      this.renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
      this.renderer.setPixelRatio(Math.min(global.devicePixelRatio || 1, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = T.PCFSoftShadowMap;
      this.scene = new T.Scene();
      this.camera = new T.PerspectiveCamera(62, 16 / 9, 0.1, 1600);
      this.hud = new KART.HUD(hudCanvas);
      this.carViews = [];
      this.itemBoxes = [];
      this.pools = { banana: [], missile: [], bomb: [], explosion: [] };
      this.camPos = new T.Vector3();
      this.camTarget = new T.Vector3();
      this.tmp = new T.Vector3();
      this.time = 0;
      this.lookBack = false;
      this.resize();
    }
    Renderer3D.prototype.resize = function() {
      var w = this.canvas.clientWidth || global.innerWidth;
      var h = this.canvas.clientHeight || global.innerHeight;
      this.renderer.setSize(w, h, false);
      this.camera.aspect = Math.max(0.4, w / h);
      this.camera.updateProjectionMatrix();
      this.hud.resize();
    };
    Renderer3D.prototype.dispose = function() {
      this.scene.traverse(function(o) {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          var mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach(function(m) {
            if (m.map) m.map.dispose();
            m.dispose();
          });
        }
      });
      if (this.scene.environment) {
        this.scene.environment.dispose();
        this.scene.environment = null;
      }
      while (this.scene.children.length) this.scene.remove(this.scene.children[0]);
    };
    Renderer3D.prototype.build = function(race) {
      var self = this, i;
      this.dispose();
      this.carViews = [];
      this.itemBoxes = [];
      this.pools = { banana: [], missile: [], bomb: [], explosion: [] };
      var track = race.track;
      var theme = THEME[track.theme] || THEME.circuit;
      this.track = track;
      this.itemsEnabled = !!race.itemsEnabled;
      this.scene.fog = new T.Fog(theme.fog, theme.near, theme.far);
      this.scene.environment = M.envTexture(track.theme);
      this.sky = M.makeSky(track.theme);
      this.scene.add(this.sky);
      var hemi = new T.HemisphereLight(theme.hemiSky, theme.hemiGround, 0.75);
      this.scene.add(hemi);
      var sun = new T.DirectionalLight(theme.sun, theme.sunI);
      sun.position.set(60, 120, 40);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      sun.shadow.camera.near = 1;
      sun.shadow.camera.far = 260;
      sun.shadow.camera.left = -46;
      sun.shadow.camera.right = 46;
      sun.shadow.camera.top = 46;
      sun.shadow.camera.bottom = -46;
      sun.shadow.camera.updateProjectionMatrix();
      sun.shadow.bias = -2e-4;
      sun.shadow.normalBias = 0.02;
      this.scene.add(sun);
      this.scene.add(sun.target);
      this.sun = sun;
      this.scene.add(new T.AmbientLight(16777215, theme.amb));
      this.scene.add(M.makeTrackMesh(track));
      this.scene.add(M.makeDecor(track));
      this.scene.add(M.makeBoostPads(track));
      if (this.itemsEnabled) {
        track.slots.forEach(function(slot) {
          if (!slot.itemBoxes || !slot.itemBoxes.length) return;
          slot.itemBoxes.forEach(function(box) {
            var g = M.makeItemBox();
            var p = track.sample(slot.s + 4);
            var r = { x: -Math.cos(p.heading), z: Math.sin(p.heading) };
            g.position.set(p.x + r.x * box.x * track.halfWidth, p.y + 1.1, p.z + r.z * box.x * track.halfWidth);
            g.userData = { slot, box, baseY: p.y + 1.1 };
            self.scene.add(g);
            self.itemBoxes.push(g);
          });
        });
      }
      race.cars.forEach(function(car) {
        var view = M.makeKartMesh(car.spec);
        self.scene.add(view.group);
        self.scene.add(view.shadow);
        if (view.sparks) self.scene.add(view.sparks);
        view.car = car;
        view.wheelSpin = 0;
        self.carViews.push(view);
      });
      for (i = 0; i < 16; i++) {
        var b = M.makeBanana();
        b.visible = false;
        this.scene.add(b);
        this.pools.banana.push(b);
      }
      for (i = 0; i < 8; i++) {
        var m = M.makeMissile();
        m.visible = false;
        this.scene.add(m);
        this.pools.missile.push(m);
      }
      for (i = 0; i < 8; i++) {
        var bo = M.makeBomb();
        bo.visible = false;
        this.scene.add(bo);
        this.pools.bomb.push(bo);
      }
      for (i = 0; i < 8; i++) {
        var e = M.makeExplosion();
        this.scene.add(e);
        this.pools.explosion.push(e);
      }
      this.camera.clearViewOffset();
      var p0 = track.worldPos(race.player.z, race.player.x, {});
      this.camPos.set(p0.x, p0.y + 4, p0.z - 10);
      this.camTarget.set(p0.x, p0.y + 1, p0.z);
      this.camera.position.copy(this.camPos);
      this.camera.lookAt(this.camTarget);
    };
    Renderer3D.prototype.update = function(race, dt) {
      this.time += dt;
      var track = race.track, i, v, car;
      var pos = this.tmp;
      for (i = 0; i < this.carViews.length; i++) {
        v = this.carViews[i];
        car = v.car;
        track.worldPos(car.z, car.x, pos);
        var g = v.group;
        var groundY = pos.y + car.jumpY;
        g.position.set(pos.x, groundY, pos.z);
        g.rotation.order = "YXZ";
        var yaw = pos.heading - car.steerVisual * (car.drifting ? 0.5 : 0.26) - car.driftVisual * 0.22;
        if (car.spinTimer > 0) yaw += this.time * 12;
        g.rotation.y = yaw;
        g.rotation.x = -Math.atan(pos.slope);
        g.rotation.z = -car.steerVisual * 0.05 - car.driftVisual * 0.08;
        var sc = car.shrinkTimer > 0 ? 0.62 : 1;
        g.scale.setScalar(sc);
        v.wheelSpin += car.speed / v.wheelR * dt;
        for (var w = 0; w < v.wheels.length; w++) {
          v.wheels[w].rotation.x = v.wheelSpin;
          v.rims[w].rotation.x = v.wheelSpin;
        }
        var steerAngle = -car.steerVisual * 0.42;
        for (var s3 = 0; s3 < v.steerWheels.length; s3++) {
          v.steerWheels[s3].rotation.y = steerAngle;
        }
        var air = Math.min(1, car.jumpY / 2.2);
        var sw = v.shadow.userData;
        var ss = sc * (1 - 0.3 * air);
        v.shadow.position.set(pos.x, pos.y + 0.06, pos.z);
        v.shadow.rotation.x = -Math.atan(pos.slope);
        v.shadow.rotation.y = yaw;
        v.shadow.scale.set(sw.w * ss, 1, sw.l * ss);
        v.shadow.material.opacity = 0.42 * (1 - 0.72 * air) * (car.offroad ? 0.7 : 1);
        var brake = car.braking || car.speed < 1;
        for (var l = 0; l < v.lights.length; l++) {
          v.lights[l].material.emissive.setHex(brake ? 10035746 : 3342336);
        }
        var mul = P.activeBoost(car);
        var boosting = mul > 1.02;
        v.flame.visible = boosting;
        if (boosting) {
          var kind = "pad";
          for (var b2 = 0; b2 < car.boosts.length; b2++) if (car.boosts[b2].mul === mul) kind = car.boosts[b2].kind;
          var col = kind === "super" ? 11889663 : kind === "star" ? 16770142 : kind === "rocket" ? 16738847 : 6742271;
          v.flame.material.color.setHex(col);
          var f = 0.7 + Math.random() * 0.6;
          v.flame.scale.set(1, f, 1);
          v.flame.position.z = -1.3 - f * 0.25;
        }
        v.star.visible = car.invincible > 0;
        if (v.star.visible) {
          v.star.rotation.y = this.time * 4;
          v.star.children.forEach(function(s, k) {
            s.position.y = 0.7 + Math.sin(self_time(k) + this.time * 5) * 0.18;
          }.bind(this));
          v.star.scale.setScalar(sc);
        }
        var drifting = car.drifting && car.driftTime > 0.25;
        v.sparks.visible = drifting;
        if (drifting) {
          var tier = car.driftTime >= 2.2 ? 11889663 : car.driftTime >= 1.4 ? 16738847 : 4572415;
          v.sparks.material.color.setHex(tier);
          var arr = v.sparkPos;
          var back = { x: -Math.sin(pos.heading), z: -Math.cos(pos.heading) };
          for (var s2 = 0; s2 < v.sparkCount; s2++) {
            var t = s2 / v.sparkCount;
            arr[s2 * 3] = pos.x + back.x * (0.6 + t * 2.2) + (Math.random() - 0.5) * 0.5;
            arr[s2 * 3 + 1] = pos.y + 0.12 + Math.random() * 0.55 * (1 - t);
            arr[s2 * 3 + 2] = pos.z + back.z * (0.6 + t * 2.2) + (Math.random() - 0.5) * 0.5;
          }
          v.sparks.geometry.attributes.position.needsUpdate = true;
        }
      }
      function self_time(k) {
        return k * 2.1;
      }
      for (i = 0; i < this.itemBoxes.length; i++) {
        var ib = this.itemBoxes[i];
        var alive = ib.userData.box.respawn <= 0;
        ib.visible = alive;
        if (alive) {
          ib.rotation.y = this.time * 1.6;
          ib.position.y = ib.userData.baseY + Math.sin(this.time * 2.5 + i) * 0.18;
        }
      }
      this.syncPool(this.pools.banana, race.bananas, function(obj, b) {
        track.worldPos(b.z, b.x, pos);
        obj.position.set(pos.x, pos.y + 0.16, pos.z);
        obj.rotation.y = this.time * 2;
        return true;
      });
      this.syncPool(this.pools.missile, race.projectiles, function(obj, pr) {
        track.worldPos(pr.z, pr.x, pos);
        obj.position.set(pos.x, pos.y + 1, pos.z);
        obj.rotation.y = pos.heading;
        return true;
      });
      this.syncPool(this.pools.bomb, race.bombs, function(obj, bo) {
        track.worldPos(bo.z, bo.x, pos);
        obj.position.set(pos.x, pos.y, pos.z);
        var k = bo.fuse < 1 ? Math.sin(this.time * 30) > 0 ? 1 : 0.2 : 1;
        obj.children[1].material.emissive = obj.children[1].material.emissive || new T.Color();
        obj.scale.setScalar(1 + (3 - bo.fuse) * 0.05);
        return true;
      });
      this.syncPool(this.pools.explosion, race.explosions, function(obj, ex) {
        track.worldPos(ex.z, ex.x, pos);
        obj.position.set(pos.x, pos.y + 1.2, pos.z);
        var t2 = ex.t / 0.8;
        obj.visible = true;
        obj.scale.setScalar(1 + t2 * 7);
        obj.material.opacity = Math.max(0, 0.9 * (1 - t2));
        return true;
      });
      this.updateCamera(race, dt);
      this.hud.draw(race);
    };
    Renderer3D.prototype.syncPool = function(pool, list, apply) {
      for (var i = 0; i < pool.length; i++) {
        var obj = pool[i];
        if (i < list.length) {
          var keep = apply.call(this, obj, list[i]);
          obj.visible = keep !== false;
        } else obj.visible = false;
      }
    };
    Renderer3D.prototype.updateCamera = function(race, dt) {
      var track = race.track, player = race.player;
      var p = track.worldPos(player.z, player.x, {});
      var speedPct = Math.min(1, player.speed / player.spec.maxSpeed);
      var dirX = Math.sin(p.heading), dirZ = Math.cos(p.heading);
      var wantX, wantY, wantZ, tx, ty, tz;
      if (race.countdown > 0) {
        var ang = this.time * 0.9;
        wantX = p.x + Math.sin(ang) * 9;
        wantZ = p.z + Math.cos(ang) * 9;
        wantY = p.y + 3.4;
        tx = p.x;
        ty = p.y + 0.8;
        tz = p.z;
      } else if (this.lookBack) {
        wantX = p.x + dirX * 7.5;
        wantZ = p.z + dirZ * 7.5;
        wantY = p.y + 2.8;
        tx = p.x - dirX * 6;
        ty = p.y + 1;
        tz = p.z - dirZ * 6;
      } else {
        var back = 7.4 + speedPct * 2.6;
        var side = -player.driftVisual * 1.8;
        var rx = -Math.cos(p.heading), rz = Math.sin(p.heading);
        wantX = p.x - dirX * back + rx * side;
        wantZ = p.z - dirZ * back + rz * side;
        wantY = p.y + 3.1 + player.jumpY * 0.6;
        tx = p.x + dirX * 7;
        ty = p.y + 1.3;
        tz = p.z + dirZ * 7;
      }
      var rate = race.countdown > 0 ? 4 : 9;
      var a = 1 - Math.exp(-rate * dt);
      this.camPos.lerp(this.tmp.set(wantX, wantY, wantZ), a);
      this.camTarget.lerp(this.tmp.set(tx, ty, tz), Math.min(1, a * 1.25));
      this.camera.position.copy(this.camPos);
      this.camera.lookAt(this.camTarget);
      var fov = 62 + speedPct * 13;
      if (Math.abs(this.camera.fov - fov) > 0.05) {
        this.camera.fov += (fov - this.camera.fov) * Math.min(1, dt * 3);
        this.camera.updateProjectionMatrix();
      }
      this.sky.position.set(this.camera.position.x, 0, this.camera.position.z);
      if (this.sun) {
        this.sun.position.set(p.x + 60, p.y + 120, p.z + 40);
        this.sun.target.position.set(p.x, p.y, p.z);
        this.sun.target.updateMatrixWorld();
      }
    };
    Renderer3D.prototype.render = function() {
      this.renderer.render(this.scene, this.camera);
    };
    Renderer3D.prototype.frame = function(race, dt) {
      this.update(race, dt);
      this.render();
    };
    Renderer3D.prototype.showcase = function(race, dt) {
      this.time += dt;
      var car = race.player;
      var p = race.track.worldPos(car.z, car.x, {});
      var ang = this.time * 0.35;
      var w = this.canvas.clientWidth || 1280, h = this.canvas.clientHeight || 800;
      this.camera.setViewOffset(w, h, -w * 0.22, h * 0.05, w, h);
      this.camera.position.set(p.x + Math.sin(ang) * 6.2, p.y + 2.3, p.z + Math.cos(ang) * 6.2);
      this.camera.lookAt(p.x, p.y + 0.6, p.z);
      this.camera.fov = 50;
      this.camera.updateProjectionMatrix();
      this.sky.position.set(this.camera.position.x, 0, this.camera.position.z);
      for (var i = 0; i < this.itemBoxes.length; i++) {
        this.itemBoxes[i].rotation.y = this.time * 1.6;
        this.itemBoxes[i].position.y = this.itemBoxes[i].userData.baseY + Math.sin(this.time * 2.5 + i) * 0.18;
      }
      this.render();
    };
    KART.Renderer3D = Renderer3D;
  })(typeof window !== "undefined" ? window : globalThis);
  (function(global) {
    var KART = global.KART;
    var CFG = KART && KART.CFG || {};
    function clamp(v, a, b) {
      return v < a ? a : v > b ? b : v;
    }
    function midi(m) {
      return 440 * Math.pow(2, (m - 69) / 12);
    }
    var audio = {
      ctx: null,
      master: null,
      musicBus: null,
      sfxBus: null,
      on: true,
      ready: false,
      _noise: null,
      _eng: null,
      _drift: null,
      _brake: null,
      _off: null,
      _boost: null,
      _snap: {},
      _driftCharge: 0,
      _music: null
    };
    audio.init = function() {
      if (this.ctx) {
        this._resume();
        return;
      }
      var AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return;
      try {
        this.ctx = new AC();
        var c = this.ctx;
        this.master = c.createGain();
        this.master.gain.value = this.on ? 0.9 : 0;
        var comp = c.createDynamicsCompressor();
        comp.threshold.value = -16;
        comp.knee.value = 24;
        comp.ratio.value = 6;
        comp.attack.value = 4e-3;
        comp.release.value = 0.18;
        this.master.connect(comp);
        comp.connect(c.destination);
        this.musicBus = c.createGain();
        this.musicBus.gain.value = 0.3;
        this.musicBus.connect(this.master);
        this.sfxBus = c.createGain();
        this.sfxBus.gain.value = 0.85;
        this.sfxBus.connect(this.master);
        this._noise = this._makeNoise();
        this._initEngine();
        this._initDrift();
        this._initBrake();
        this._initOffroad();
        this._initBoost();
        this.ready = true;
        this._resume();
      } catch (e) {
        this.ctx = null;
        this.ready = false;
      }
    };
    audio._resume = function() {
      try {
        if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
      } catch (e) {
      }
    };
    audio.suspend = function() {
      try {
        if (this.ctx) this.ctx.suspend();
      } catch (e) {
      }
    };
    audio.setEnabled = function(on) {
      this.on = !!on;
      if (!this.ctx) return;
      try {
        this.master.gain.setTargetAtTime(this.on ? 0.9 : 0, this.ctx.currentTime, 0.05);
      } catch (e) {
      }
    };
    audio._makeNoise = function() {
      var c = this.ctx, len = c.sampleRate * 2, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      return buf;
    };
    function noiseSrc(a) {
      var s = a.ctx.createBufferSource();
      s.buffer = a._noise;
      s.loop = true;
      return s;
    }
    audio._initEngine = function() {
      var c = this.ctx, e = this._eng = { gain: c.createGain(), filter: c.createBiquadFilter() };
      e.filter.type = "lowpass";
      e.filter.frequency.value = 420;
      e.filter.Q.value = 0.9;
      e.gain.gain.value = 0;
      e.osc1 = c.createOscillator();
      e.osc1.type = "sawtooth";
      e.osc2 = c.createOscillator();
      e.osc2.type = "square";
      e.osc2.detune.value = 9;
      e.osc3 = c.createOscillator();
      e.osc3.type = "sine";
      e.osc1.connect(e.filter);
      e.osc2.connect(e.filter);
      e.osc3.connect(e.filter);
      e.filter.connect(e.gain);
      e.gain.connect(this.sfxBus);
      e.osc1.start();
      e.osc2.start();
      e.osc3.start();
    };
    audio._updateEngine = function(car) {
      var e = this._eng, c = this.ctx;
      var spd = Math.max(0, car.speed), pct = clamp(spd / car.spec.maxSpeed, 0, 1.15);
      var gearPos = pct * 5, gi = Math.floor(gearPos), frac = gearPos - gi;
      var rpm = 0.28 + 0.72 * clamp(frac, 0, 1);
      var f = 40 + rpm * 128;
      var locked = car.spinTimer > 0 || car.stunTimer > 0;
      if (locked) f *= 0.55 + 0.25 * Math.sin(c.time * 37);
      var t = c.currentTime;
      e.osc1.frequency.setTargetAtTime(f, t, 0.035);
      e.osc2.frequency.setTargetAtTime(f * 1.5, t, 0.035);
      e.osc3.frequency.setTargetAtTime(f * 0.5, t, 0.035);
      e.filter.frequency.setTargetAtTime(300 + pct * 1900, t, 0.06);
      var g = car.finished ? 0.03 : 0.05 + pct * 0.13;
      if (locked) g *= 0.5;
      e.gain.gain.setTargetAtTime(g, t, 0.07);
    };
    audio._initDrift = function() {
      var c = this.ctx, d = this._drift = { gain: c.createGain(), bp: c.createBiquadFilter() };
      d.bp.type = "bandpass";
      d.bp.frequency.value = 1900;
      d.bp.Q.value = 5;
      d.gain.gain.value = 0;
      d.src = noiseSrc(this);
      d.src.connect(d.bp);
      d.bp.connect(d.gain);
      d.gain.connect(this.sfxBus);
      d.src.start();
    };
    audio._updateDrift = function(car) {
      var d = this._drift;
      var on = car.drifting && car.speed >= (CFG.driftMinSpeed || 10);
      var charge = clamp(car.driftTime / 1.1, 0, 1);
      if (on) this._driftCharge = car.driftTime;
      d.bp.frequency.setTargetAtTime(1900 + charge * 1600, this.ctx.currentTime, 0.08);
      d.gain.gain.setTargetAtTime(on ? 0.05 + charge * 0.08 : 0, this.ctx.currentTime, 0.09);
    };
    audio._initBrake = function() {
      var c = this.ctx, b = this._brake = { gain: c.createGain(), bp: c.createBiquadFilter() };
      b.bp.type = "bandpass";
      b.bp.frequency.value = 4600;
      b.bp.Q.value = 1.1;
      b.gain.gain.value = 0;
      b.src = noiseSrc(this);
      b.src.connect(b.bp);
      b.bp.connect(b.gain);
      b.gain.connect(this.sfxBus);
      b.src.start();
    };
    audio._updateBrake = function(car) {
      var b = this._brake;
      var on = car.braking && car.speed > 3 && !car.finished;
      b.gain.gain.setTargetAtTime(on ? 0.045 : 0, this.ctx.currentTime, 0.05);
    };
    audio._initOffroad = function() {
      var c = this.ctx, o = this._off = { gain: c.createGain(), lp: c.createBiquadFilter() };
      o.lp.type = "lowpass";
      o.lp.frequency.value = 260;
      o.lp.Q.value = 0.7;
      o.gain.gain.value = 0;
      o.src = noiseSrc(this);
      o.src.connect(o.lp);
      o.lp.connect(o.gain);
      o.gain.connect(this.sfxBus);
      o.src.start();
    };
    audio._updateOffroad = function(car) {
      var o = this._off;
      var on = car.offroad && car.speed > 2;
      var jitter = on ? 0.75 + Math.random() * 0.5 : 0;
      o.gain.gain.setTargetAtTime(on ? 0.09 * jitter : 0, this.ctx.currentTime, 0.06);
      o.lp.frequency.setTargetAtTime(200 + Math.random() * 160, this.ctx.currentTime, 0.05);
    };
    audio._initBoost = function() {
      var c = this.ctx, b = this._boost = { gain: c.createGain(), bp: c.createBiquadFilter() };
      b.bp.type = "bandpass";
      b.bp.frequency.value = 800;
      b.bp.Q.value = 1.4;
      b.gain.gain.value = 0;
      b.src = noiseSrc(this);
      b.src.connect(b.bp);
      b.bp.connect(b.gain);
      b.gain.connect(this.sfxBus);
      b.src.start();
    };
    audio._updateBoost = function(car) {
      var b = this._boost;
      var mul = 1;
      for (var i = 0; i < car.boosts.length; i++) mul = Math.max(mul, car.boosts[i].mul);
      var on = mul > 1.01 && car.speed > 5;
      b.bp.frequency.setTargetAtTime(on ? 700 + Math.min(1, mul - 1) * 2200 : 700, this.ctx.currentTime, 0.15);
      b.gain.gain.setTargetAtTime(on ? 0.055 : 0, this.ctx.currentTime, 0.12);
    };
    function tone(a, type, f0, f1, t0, dur, vol, filterF) {
      var c = a.ctx, o = c.createOscillator(), g = c.createGain(), node = o;
      o.type = type;
      o.frequency.setValueAtTime(f0, t0);
      if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + dur);
      g.gain.setValueAtTime(1e-4, t0);
      g.gain.exponentialRampToValueAtTime(vol, t0 + 8e-3);
      g.gain.exponentialRampToValueAtTime(1e-4, t0 + dur);
      if (filterF) {
        var lp = c.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = filterF;
        o.connect(lp);
        node = lp;
      }
      node.connect(g);
      g.connect(a.sfxBus);
      o.start(t0);
      o.stop(t0 + dur + 0.05);
    }
    function noiseHit(a, t0, dur, vol, fType, f0, f1, Q) {
      var c = a.ctx, s = c.createBufferSource(), g = c.createGain();
      s.buffer = a._noise;
      s.loop = true;
      var node = s;
      if (fType) {
        var bq = c.createBiquadFilter();
        bq.type = fType;
        bq.Q.value = Q || 1;
        bq.frequency.setValueAtTime(f0, t0);
        if (f1 && f1 !== f0) bq.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur);
        s.connect(bq);
        node = bq;
      }
      g.gain.setValueAtTime(1e-4, t0);
      g.gain.exponentialRampToValueAtTime(vol, t0 + 6e-3);
      g.gain.exponentialRampToValueAtTime(1e-4, t0 + dur);
      node.connect(g);
      g.connect(a.sfxBus);
      s.start(t0);
      s.stop(t0 + dur + 0.05);
    }
    var sfx = {
      /* 撞墙 / 撞车（重）：噪声碎裂 + 低频撞击 + 碎片 */
      crash: function(intensity) {
        if (!audio.ready || !audio.on) return;
        var c = audio.ctx, t = c.currentTime, k = clamp(intensity == null ? 0.8 : intensity, 0.2, 1);
        noiseHit(audio, t, 0.32, 0.5 * k, "lowpass", 2800, 240, 0.8);
        noiseHit(audio, t + 0.01, 0.12, 0.3 * k, "bandpass", 1100, 500, 2);
        tone(audio, "sine", 120, 42, t, 0.22, 0.55 * k);
        tone(audio, "square", 90, 38, t, 0.14, 0.18 * k, 900);
      },
      /* 车对车轻蹭：短促闷响 */
      bump: function() {
        if (!audio.ready || !audio.on) return;
        var c = audio.ctx, t = c.currentTime;
        noiseHit(audio, t, 0.1, 0.3, "bandpass", 1500, 700, 1.6);
        tone(audio, "sine", 150, 70, t, 0.1, 0.3);
      },
      /* 涡轮释放：级联上行音，档位越高音越多 */
      turbo: function(tier) {
        if (!audio.ready || !audio.on) return;
        var c = audio.ctx, t = c.currentTime;
        var n = tier >= 3 ? 4 : tier >= 2 ? 3 : 2;
        var base = 520 + (tier - 1) * 40;
        for (var i = 0; i < n; i++) {
          tone(audio, "square", base * (1 + i * 0.26), base * (1 + i * 0.26), t + i * 0.075, 0.09, 0.14);
        }
        if (tier >= 2) noiseHit(audio, t + n * 0.075, 0.22, 0.1, "bandpass", 900, 2600, 1.2);
      },
      /* 加速带 / 各类 Boost 触发 */
      boost: function() {
        if (!audio.ready || !audio.on) return;
        var c = audio.ctx, t = c.currentTime;
        tone(audio, "sawtooth", 220, 900, t, 0.34, 0.16, 2400);
        noiseHit(audio, t, 0.3, 0.12, "bandpass", 600, 2800, 1.1);
      },
      pad: function() {
        sfx.boost();
      },
      /* 道具箱 */
      pickup: function() {
        if (!audio.ready || !audio.on) return;
        var c = audio.ctx, t = c.currentTime;
        tone(audio, "triangle", 660, 660, t, 0.09, 0.16);
        tone(audio, "triangle", 990, 990, t + 0.09, 0.12, 0.16);
      },
      /* 道具使用 */
      item: function(kind) {
        if (!audio.ready || !audio.on) return;
        var c = audio.ctx, t = c.currentTime;
        switch (kind) {
          case "missile":
            noiseHit(audio, t, 0.4, 0.2, "bandpass", 500, 2200, 1.3);
            tone(audio, "square", 880, 220, t + 0.05, 0.3, 0.12);
            break;
          case "banana":
            tone(audio, "triangle", 320, 180, t, 0.16, 0.16);
            tone(audio, "triangle", 240, 140, t + 0.14, 0.18, 0.14);
            break;
          case "rocket":
            tone(audio, "sawtooth", 160, 1e3, t, 0.5, 0.18, 2600);
            noiseHit(audio, t, 0.5, 0.16, "bandpass", 400, 3e3, 1.1);
            break;
          case "star":
            [523, 659, 784, 1047].forEach(function(f, i) {
              tone(audio, "square", f, f, t + i * 0.05, 0.1, 0.11);
            }, this);
            break;
          case "bolt":
            tone(audio, "square", 1400, 300, t, 0.18, 0.14);
            tone(audio, "square", 1200, 200, t + 0.12, 0.2, 0.12);
            noiseHit(audio, t, 0.25, 0.1, "highpass", 3e3, 6e3, 0.7);
            break;
          case "ink":
            noiseHit(audio, t, 0.3, 0.22, "lowpass", 900, 180, 0.9);
            break;
          case "hook":
            tone(audio, "sine", 300, 980, t, 0.4, 0.14);
            tone(audio, "sine", 305, 990, t + 0.02, 0.4, 0.1);
            break;
          case "bomb":
            tone(audio, "sine", 220, 60, t, 0.35, 0.3);
            noiseHit(audio, t + 0.1, 0.5, 0.06, "highpass", 5e3, 3e3, 0.7);
            break;
          default:
            tone(audio, "triangle", 600, 900, t, 0.12, 0.14);
        }
      },
      /* 被道具击中 */
      hit: function() {
        if (!audio.ready || !audio.on) return;
        var c = audio.ctx, t = c.currentTime;
        tone(audio, "sawtooth", 520, 110, t, 0.34, 0.2, 1800);
        noiseHit(audio, t, 0.2, 0.16, "bandpass", 2200, 600, 1);
      },
      /* 打转（撞飞 / 香蕉皮） */
      spin: function() {
        if (!audio.ready || !audio.on) return;
        var c = audio.ctx, t = c.currentTime;
        tone(audio, "sine", 900, 180, t, 0.5, 0.12);
        noiseHit(audio, t, 0.4, 0.1, "bandpass", 1800, 400, 1.4);
      },
      /* 起跳 / 落地 */
      jump: function() {
        if (!audio.ready || !audio.on) return;
        var c = audio.ctx, t = c.currentTime;
        noiseHit(audio, t, 0.25, 0.1, "bandpass", 500, 1800, 1.2);
      },
      land: function() {
        if (!audio.ready || !audio.on) return;
        var c = audio.ctx, t = c.currentTime;
        tone(audio, "sine", 110, 45, t, 0.14, 0.4);
        noiseHit(audio, t, 0.12, 0.16, "lowpass", 1200, 300, 0.8);
      },
      /* 过圈（新最快圈音更高） */
      lap: function(best) {
        if (!audio.ready || !audio.on) return;
        var c = audio.ctx, t = c.currentTime;
        var a = best ? 784 : 587, b = best ? 1047 : 880;
        tone(audio, "triangle", a, a, t, 0.1, 0.15);
        tone(audio, "triangle", b, b, t + 0.1, 0.16, 0.15);
      },
      /* 倒计时 / GO */
      countdown: function(n) {
        if (!audio.ready || !audio.on) return;
        var c = audio.ctx, t = c.currentTime;
        if (n > 0) tone(audio, "square", 587, 587, t, 0.14, 0.16);
        else tone(audio, "square", 880, 880, t, 0.36, 0.2);
      },
      /* 结算号角 */
      finish: function(rank) {
        if (!audio.ready || !audio.on) return;
        var c = audio.ctx, t = c.currentTime;
        var notes = rank <= 3 ? [523, 659, 784, 1047] : [440, 554, 659];
        notes.forEach(function(f, i) {
          tone(audio, "square", f, f, t + i * 0.11, 0.22, 0.15);
        }, this);
      },
      /* UI 点击 */
      ui: function() {
        if (!audio.ready || !audio.on) return;
        tone(audio, "triangle", 1180, 1180, audio.ctx.currentTime, 0.045, 0.09);
      }
    };
    audio.sfx = sfx;
    audio.beep = function(f, d, type) {
      if (!this.ready || !this.on) return;
      tone(this, type || "square", f, f, this.ctx.currentTime, d || 0.12, 0.12);
    };
    audio.frame = function(race) {
      if (!this.ready || !this.on || !race) return;
      var car = race.player;
      if (!car) return;
      this._edges(car);
      this._updateEngine(car);
      this._updateDrift(car);
      this._updateBrake(car);
      this._updateOffroad(car);
      this._updateBoost(car);
    };
    audio._edges = function(car) {
      var s = this._snap;
      if (car.hitCount !== s.hitCount) {
        s.hitCount = car.hitCount;
        this.sfx.hit();
      }
      if (car.spinTimer > 0 !== !!s.spin) {
        s.spin = car.spinTimer > 0;
        if (s.spin) this.sfx.spin();
      }
      if (car.wallHits !== s.wallHits) {
        s.wallHits = car.wallHits;
        this.sfx.crash(0.75);
      }
      if (car.padsHit !== s.padsHit) {
        s.padsHit = car.padsHit;
        this.sfx.boost();
      }
      if (car.driftBoosts !== s.driftBoosts) {
        s.driftBoosts = car.driftBoosts;
        var ch = this._driftCharge;
        this.sfx.turbo(ch >= 2.2 ? 3 : ch >= 1.4 ? 2 : 1);
      }
      if (car.lap !== s.lap) {
        s.lap = car.lap;
        this.sfx.lap(car.bestLap > 0);
      }
      var col = car.collideCd > 0;
      if (col && !s.col) this.sfx.bump();
      s.col = col;
      var air = car.airTime > 0;
      if (air && !s.air) this.sfx.jump();
      if (!air && s.air) this.sfx.land();
      s.air = air;
    };
    audio.resetEdges = function() {
      this._snap = {};
      this._driftCharge = 0;
    };
    var MUSIC = {
      neon: {
        bpm: 132,
        bars: [
          { root: 45, notes: [57, 60, 64], kick: [0, 4, 8, 12, 15], snare: [4, 12], hatC: [3, 7, 11, 15], hatO: [14], pad: true },
          { root: 41, notes: [53, 57, 60], kick: [0, 4, 8, 12], snare: [4, 12, 10], hatC: [2, 6, 10, 14], hatO: [6], pad: true },
          { root: 48, notes: [52, 55, 60], kick: [0, 4, 8, 12, 15], snare: [4, 12], hatC: [3, 7, 11, 15], hatO: [14], pad: true },
          { root: 43, notes: [50, 55, 59], kick: [0, 4, 8, 12], snare: [4, 12, 14], hatC: [2, 6, 10, 14], hatO: [7], pad: true }
        ],
        bassSeq: [0, 0, 7, 0, 12, 0, 7, 0],
        arpSeq: [0, 1, 2, 1, 0, 2, 1, 0, 2, 1, 0, 1, 0, 1, 2, 2]
      },
      silverstone: {
        bpm: 126,
        bars: [
          { root: 36, notes: [48, 52, 55], kick: [0, 4, 8, 12], snare: [4, 12], hatC: [2, 6, 10, 14], hatO: [7, 15], pad: false },
          { root: 43, notes: [55, 59, 62], kick: [0, 4, 8, 12, 10], snare: [4, 12], hatC: [2, 6, 10, 14], hatO: [15], pad: false },
          { root: 45, notes: [57, 60, 64], kick: [0, 4, 8, 12], snare: [4, 12], hatC: [2, 6, 10, 14], hatO: [7], pad: false },
          { root: 41, notes: [53, 57, 60], kick: [0, 4, 8, 12, 14], snare: [4, 12], hatC: [2, 6, 10, 14], hatO: [7, 15], pad: false }
        ],
        bassSeq: [0, 12, 0, 7, 0, 12, 7, 0],
        arpSeq: [0, 2, 1, 2, 0, 2, 1, 2, 0, 2, 1, 2, 0, 1, 2, 1]
      }
    };
    audio.music = {
      start: function(trackId) {
        this.stop();
        if (!audio.ready || !audio.on) return;
        var def = MUSIC[trackId] || MUSIC.neon;
        var stepDur = 60 / def.bpm / 4;
        var m = audio._music = {
          def,
          step: 0,
          stepDur,
          next: audio.ctx.currentTime + 0.08,
          timer: null
        };
        var c = audio.ctx;
        m.delay = c.createDelay(1);
        m.delay.delayTime.value = stepDur * 3;
        m.fb = c.createGain();
        m.fb.gain.value = 0.3;
        m.wet = c.createGain();
        m.wet.gain.value = 0.32;
        m.delay.connect(m.fb);
        m.fb.connect(m.delay);
        m.delay.connect(m.wet);
        m.wet.connect(audio.musicBus);
        m.timer = setInterval(function() {
          audio._musicTick();
        }, 25);
      },
      stop: function() {
        var m = audio._music;
        if (m && m.timer) {
          clearInterval(m.timer);
          m.timer = null;
        }
        audio._music = null;
      },
      playing: function() {
        return !!audio._music;
      }
    };
    audio._musicTick = function() {
      var m = this._music, c = this.ctx;
      if (!m) return;
      while (m.next < c.currentTime + 0.12) {
        this._scheduleStep(m, m.step, m.next);
        m.next += m.stepDur;
        m.step = (m.step + 1) % 64;
      }
    };
    audio._scheduleStep = function(m, step, t) {
      var def = m.def, bar = def.bars[Math.floor(step / 16)], s = step % 16, c = this.ctx;
      if (bar.kick.indexOf(s) >= 0) this._kick(t);
      if (bar.snare.indexOf(s) >= 0) this._snare(t);
      if (bar.hatC.indexOf(s) >= 0) this._hat(t, false);
      if (bar.hatO.indexOf(s) >= 0) this._hat(t, true);
      if (s % 2 === 0) {
        var bOff = def.bassSeq[s / 2 % def.bassSeq.length] || 0;
        this._bass(t, midi(bar.root + bOff), m.stepDur * 1.8);
      }
      var ai = def.arpSeq[step % def.arpSeq.length] || 0;
      this._arp(t, midi(bar.notes[ai % bar.notes.length] + (ai >= 3 ? 12 : 0)), m.stepDur * 0.8);
      if (bar.pad && s === 0) this._pad(t, bar.notes, m.stepDur * 16);
    };
    audio._kick = function(t) {
      var c = this.ctx, o = c.createOscillator(), g = c.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(150, t);
      o.frequency.exponentialRampToValueAtTime(45, t + 0.11);
      g.gain.setValueAtTime(0.9, t);
      g.gain.exponentialRampToValueAtTime(1e-4, t + 0.16);
      o.connect(g);
      g.connect(this.musicBus);
      o.start(t);
      o.stop(t + 0.2);
    };
    audio._snare = function(t) {
      var c = this.ctx, s = c.createBufferSource(), g = c.createGain(), bp = c.createBiquadFilter();
      s.buffer = this._noise;
      bp.type = "bandpass";
      bp.frequency.value = 1900;
      bp.Q.value = 0.9;
      g.gain.setValueAtTime(0.5, t);
      g.gain.exponentialRampToValueAtTime(1e-4, t + 0.13);
      s.connect(bp);
      bp.connect(g);
      g.connect(this.musicBus);
      s.start(t);
      s.stop(t + 0.16);
    };
    audio._hat = function(t, open) {
      var c = this.ctx, s = c.createBufferSource(), g = c.createGain(), hp = c.createBiquadFilter();
      s.buffer = this._noise;
      hp.type = "highpass";
      hp.frequency.value = 7200;
      var d = open ? 0.18 : 0.045;
      g.gain.setValueAtTime(open ? 0.22 : 0.26, t);
      g.gain.exponentialRampToValueAtTime(1e-4, t + d);
      s.connect(hp);
      hp.connect(g);
      g.connect(this.musicBus);
      s.start(t);
      s.stop(t + d + 0.03);
    };
    audio._bass = function(t, f, dur) {
      var c = this.ctx, o = c.createOscillator(), g = c.createGain(), lp = c.createBiquadFilter();
      o.type = "sawtooth";
      o.frequency.value = f;
      lp.type = "lowpass";
      lp.frequency.value = 620;
      lp.Q.value = 2;
      g.gain.setValueAtTime(1e-4, t);
      g.gain.exponentialRampToValueAtTime(0.42, t + 0.01);
      g.gain.exponentialRampToValueAtTime(1e-4, t + dur);
      o.connect(lp);
      lp.connect(g);
      g.connect(this.musicBus);
      o.start(t);
      o.stop(t + dur + 0.03);
    };
    audio._arp = function(t, f, dur) {
      var c = this.ctx, o = c.createOscillator(), g = c.createGain();
      o.type = "triangle";
      o.frequency.value = f;
      g.gain.setValueAtTime(1e-4, t);
      g.gain.exponentialRampToValueAtTime(0.16, t + 8e-3);
      g.gain.exponentialRampToValueAtTime(1e-4, t + dur);
      o.connect(g);
      g.connect(this.musicBus);
      g.connect(this._music.delay);
      o.start(t);
      o.stop(t + dur + 0.03);
    };
    audio._pad = function(t, notes, dur) {
      var c = this.ctx, g = c.createGain(), lp = c.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 780;
      lp.Q.value = 0.6;
      g.gain.setValueAtTime(1e-4, t);
      g.gain.exponentialRampToValueAtTime(0.1, t + dur * 0.35);
      g.gain.exponentialRampToValueAtTime(1e-4, t + dur);
      lp.connect(g);
      g.connect(this.musicBus);
      notes.forEach(function(n, i) {
        var o = c.createOscillator();
        o.type = "sawtooth";
        o.frequency.value = midi(n);
        o.detune.value = i % 2 ? 7 : -7;
        o.connect(lp);
        o.start(t);
        o.stop(t + dur + 0.05);
      });
    };
    if (KART) KART.audio = audio;
  })(typeof window !== "undefined" ? window : globalThis);
  (function(global) {
    var KART = global.KART, CFG = KART.CFG, P = KART.physics, AI = KART.ai, createRace = KART.createRace, stepRace = KART.stepRace;
    if (typeof document === "undefined") return;
    var doc = document;
    var canvas, hudCanvas, renderer, race = null, showcase = null;
    var raf = null, last = 0, acc = 0;
    var STEP = 1 / 60;
    var state = "menu";
    var settings = { sound: true, mode: "race", kartId: "nixie", trackId: "silverstone" };
    var keys = {};
    var input = { steer: 0, throttle: true, brake: false, drift: false, useItem: false };
    var pendingStartBoost = false, pendingItem = false, pendingReset = false;
    KART.pendingItemSfx = null;
    var touchSteer = 0, touchDrift = false, touchItem = false;
    var audio = KART.audio || {
      init: function() {
      },
      beep: function() {
      },
      frame: function() {
      },
      setEnabled: function() {
      },
      suspend: function() {
      },
      resetEdges: function() {
      },
      sfx: { ui: function() {
      }, item: function() {
      }, finish: function() {
      }, countdown: function() {
      } },
      music: { start: function() {
      }, stop: function() {
      } }
    };
    function $(id) {
      return doc.getElementById(id);
    }
    var touchPointer = global.matchMedia("(pointer:coarse)");
    var touchStartX = null, touchIdentifier = null;
    function clearSteeringTouch() {
      touchIdentifier = null;
      touchStartX = null;
      touchSteer = 0;
      input.steer = 0;
    }
    function steeringContact(touches) {
      if (touchIdentifier == null || !touches) return null;
      for (var i = 0; i < touches.length; i++) {
        if (touches[i].identifier === touchIdentifier) return touches[i];
      }
      return null;
    }
    function clearTouchInput() {
      clearSteeringTouch();
      touchDrift = false;
      touchItem = false;
      pendingItem = false;
      input.steer = 0;
      input.drift = false;
      input.useItem = false;
    }
    function syncTouch() {
      var visible = state === "racing" && !doc.hidden && touchPointer.matches && global.navigator.maxTouchPoints > 0
        && ["menu", "result", "pause", "board"].every(function(id) { return $("screen-" + id).classList.contains("hidden"); });
      $("touch").classList.toggle("hidden", !visible);
      if (!visible) clearTouchInput();
    }
    function show(id) {
      ["menu", "result", "pause", "board"].forEach(function(s) {
        var el = $("screen-" + s);
        if (el) el.classList.toggle("hidden", s !== id);
      });
      if (id != null) clearTouchInput();
      syncTouch();
    }
    function bar(label, v, text) {
      return '<div class="bar-row"><span class="bar-label">' + label + '</span><span class="bar-track"><i style="width:' + Math.round(Math.max(4, Math.min(100, v * 100))) + '%"></i></span><span class="bar-val">' + text + "</span></div>";
    }
    function kartThumb(s) {
      return '<img class="kart-img" src="' + KART.kartImages[s.id] + '" alt="' + s.name + '" draggable="false">';
    }
    function bindMenu() {
      var wrap = $("kart-cards");
      wrap.innerHTML = "";
      KART.KART_SPECS.forEach(function(s) {
        var el = doc.createElement("button");
        el.className = "card kart-card" + (settings.kartId === s.id ? " active" : "");
        el.innerHTML = '<div class="kart-thumb">' + kartThumb(s) + '</div><div class="kart-name">' + s.name + '</div><div class="kart-tag">' + s.tag + '</div><div class="bars">' + bar("\u901F\u5EA6", s.maxSpeed / 46.7, s.topKmh + " km/h") + bar("\u52A0\u901F", s.accel / 7, s.zeroTo60 + " s") + bar("\u64CD\u63A7", s.handling, Math.round(s.handling * 100)) + bar("\u91CD\u91CF", s.weight / 236, s.weight + " kg") + '</div><div class="kart-desc">' + s.desc + "</div>";
        el.onclick = function() {
          settings.kartId = s.id;
          Array.prototype.forEach.call(wrap.children, function(c) {
            c.classList.remove("active");
          });
          el.classList.add("active");
          audio.init();
          audio.sfx.ui();
          buildShowcase();
        };
        wrap.appendChild(el);
      });
      var tw = $("track-cards");
      tw.innerHTML = "";
      KART.TRACK_LIST.forEach(function(t) {
        var tk = KART.buildTrack(t.id);
        var el = doc.createElement("button");
        el.className = "card track-card" + (settings.trackId === t.id ? " active" : "");
        el.innerHTML = '<div class="kart-name">' + t.name + '</div><div class="kart-desc">' + t.desc + '</div><div class="kart-tag">\u5355\u5708 ' + (tk.length / 1e3).toFixed(2) + " km \xB7 \u96BE\u5EA6 " + "\u2605".repeat(t.difficulty) + "</div>";
        el.onclick = function() {
          settings.trackId = t.id;
          Array.prototype.forEach.call(tw.children, function(c) {
            c.classList.remove("active");
          });
          el.classList.add("active");
          audio.init();
          audio.sfx.ui();
          buildShowcase();
        };
        tw.appendChild(el);
      });
      Array.prototype.forEach.call(doc.querySelectorAll(".mode-btn"), function(b) {
        b.onclick = function() {
          settings.mode = b.dataset.mode;
          Array.prototype.forEach.call(doc.querySelectorAll(".mode-btn"), function(x) {
            x.classList.remove("active");
          });
          b.classList.add("active");
          audio.init();
          audio.sfx.ui();
        };
      });
      $("btn-start").onclick = startRace;
      $("btn-board").onclick = function() {
        audio.init();
        audio.sfx.ui();
        show("board");
        if (KART.personal) KART.personal.openHistory();
      };
      $("btn-sound").onclick = function() {
        settings.sound = !settings.sound;
        audio.setEnabled(settings.sound);
        $("btn-sound").textContent = settings.sound ? "\u{1F50A} \u97F3\u6548\u5F00" : "\u{1F507} \u97F3\u6548\u5173";
      };
    }
    function buildShowcase() {
      showcase = createRace({ trackId: settings.trackId, kartId: settings.kartId, mode: "race" });
      showcase.player.z = 140;
      showcase.player.x = 0.2;
      showcase.player.speed = 22;
      renderer.build(showcase);
    }
    function updateShowcase(dt) {
      if (!showcase) return;
      showcase.time += dt;
      var p = showcase.player;
      p.speed += (24 - p.speed) * dt * 0.6;
      p.z += p.speed * dt;
      p.x = Math.sin(showcase.time * 0.5) * 0.45;
      p.driftVisual = Math.sin(showcase.time * 0.5 + 1.57) * 0.5;
      P.updateRanks(showcase.cars);
    }
    var lastCd = 4;
    function currentNick() {
      return "\u4F60";
    }
    function startRace() {
      audio.init();
      audio.resetEdges();
      lastCd = 4;
      if (KART.personal && KART.personal.isPending()) return;
      race = createRace({
        trackId: settings.trackId,
        kartId: settings.kartId,
        mode: settings.mode,
        aiLevel: 0.9,
        playerName: currentNick(),
        onEvent: function(evt, r) {
          if (evt === "finished") showResult(r);
        }
      });
      renderer.build(race);
      state = "racing";
      acc = 0;
      last = performance.now();
      if (doc.activeElement && doc.activeElement.blur) doc.activeElement.blur();
      show(null);
      $("hud-top").classList.remove("hidden");
      audio.sfx.ui();
    }
    function audioTick() {
      if (!settings.sound) return;
      if (race.countdown > 0) {
        var n = Math.ceil(race.countdown);
        if (n !== lastCd) {
          lastCd = n;
          audio.sfx.countdown(n);
        }
      } else if (lastCd !== 0) {
        lastCd = 0;
        audio.sfx.countdown(0);
        audio.music.start(settings.trackId);
      }
      audio.frame(race);
      if (KART.pendingItemSfx) {
        audio.sfx.item(KART.pendingItemSfx);
        KART.pendingItemSfx = null;
      }
    }
    function loop(ts) {
      raf = requestAnimationFrame(loop);
      var dt = Math.min(0.1, (ts - last) / 1e3);
      last = ts;
      if (!isFinite(dt) || dt <= 0) dt = STEP;
      if (state === "menu") {
        updateShowcase(dt);
        renderer.showcase(showcase, dt);
        return;
      }
      if (state === "paused" || state === "result") {
        renderer.render();
        return;
      }
      if (state !== "racing" || !race) return;
      acc += dt;
      var guard = 0;
      while (acc >= STEP && guard++ < 8) {
        buildInput();
        stepRace(race, STEP, input);
        acc -= STEP;
      }
      if (settings.sound) audioTick();
      renderer.frame(race, Math.min(dt, 0.05));
    }
    function buildInput() {
      var left = keys["ArrowLeft"] || keys["KeyA"];
      var right = keys["ArrowRight"] || keys["KeyD"];
      var up = keys["ArrowUp"] || keys["KeyW"];
      var down = keys["ArrowDown"] || keys["KeyS"];
      input.steer = Math.max(-1, Math.min(1, (left ? -1 : 0) + (right ? 1 : 0) + touchSteer));
      input.brake = !!down;
      input.drift = !!keys["Space"] || touchDrift;
      input.throttle = true;
      input.useItem = pendingItem;
      pendingItem = false;
      if (race && race.countdown > 0 && up && race.countdown < CFG.falseStartWindow) {
        race.player.stunTimer = 1.5;
        race.player.events.push({ text: "\u62A2\u8DD1\uFF01\u7184\u706B", t: 0, color: "#FF4B4B" });
        audio.beep(180, 0.25, "sawtooth");
      }
      if (pendingStartBoost) {
        pendingStartBoost = false;
        P.addBoost(race.player, "start");
        race.player.events.push({ text: "\u5B8C\u7F8E\u8D77\u6B65\uFF01", t: 0, color: "#FFD23F" });
        audio.beep(880, 0.2, "triangle");
      }
      if (pendingReset) {
        pendingReset = false;
        race.player.speed = 0;
        race.player.stunTimer = 1;
        P.resetToTrack(race.player, { track: race.track });
      }
    }
    function showResult(r) {
      state = "result";
      $("hud-top").classList.add("hidden");
      var me = r.playerResult;
      $("result-grade").textContent = me ? me.grade : "-";
      $("result-rank").textContent = me ? "\u7B2C " + me.rank + " \u540D" : "-";
      $("result-time").textContent = me && me.time != null ? P.formatTime(me.time) : "\u672A\u5B8C\u8D5B";
      $("result-best").textContent = me && me.bestLap ? P.formatTime(me.bestLap) : "--";
      $("result-points").textContent = me ? "+" + me.points : "+0";
      var tb = $("result-body");
      tb.innerHTML = "";
      r.results.forEach(function(row) {
        var tr = doc.createElement("tr");
        if (row.car.isPlayer) tr.className = "me";
        tr.innerHTML = "<td>" + row.rank + "</td><td>" + row.name + "</td><td>" + row.kart + "</td><td>" + (row.time != null ? P.formatTime(row.time) : "DNF") + "</td><td>" + (row.bestLap ? P.formatTime(row.bestLap) : "--") + "</td><td>" + row.grade + "</td><td>+" + row.points + "</td>";
        tb.appendChild(tr);
      });
      if (KART.personal) KART.personal.finished(r, Object.assign({}, settings));
      show("result");
      audio.music.stop();
      audio.sfx.finish(me ? me.rank : 8);
    }
    function togglePause() {
      if (state === "racing") {
        state = "paused";
        show("pause");
        audio.suspend();
      } else if (state === "paused") {
        state = "racing";
        show(null);
        last = performance.now();
        acc = 0;
        audio.init();
      }
    }
    function bindInput() {
      doc.addEventListener("touchcancel", clearTouchInput, { passive: true });
      doc.addEventListener("visibilitychange", syncTouch);
      global.addEventListener("blur", clearTouchInput);
      touchPointer.addEventListener("change", syncTouch);
      doc.addEventListener("keydown", function(e) {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].indexOf(e.code) >= 0) e.preventDefault();
        if (keys[e.code]) return;
        keys[e.code] = true;
        if (e.code === "ShiftLeft" || e.code === "ShiftRight" || e.code === "KeyE") pendingItem = true;
        if (e.code === "KeyR") pendingReset = true;
        if (e.code === "KeyB") renderer.lookBack = true;
        if (e.code === "Escape" || e.code === "KeyP") togglePause();
        if (race && race.countdown <= 0 && race.time < CFG.startBoostWindow && (e.code === "ArrowUp" || e.code === "KeyW")) pendingStartBoost = true;
      });
      doc.addEventListener("keyup", function(e) {
        keys[e.code] = false;
        if (e.code === "KeyB") renderer.lookBack = false;
      });
      var pad = $("touch-pad");
      if (pad) {
        pad.addEventListener("touchstart", function(e) {
          if (touchIdentifier != null) return;
          var contact = e.changedTouches && e.changedTouches[0] || e.targetTouches && e.targetTouches[0];
          if (!contact) return;
          touchIdentifier = contact.identifier;
          touchStartX = contact.clientX;
          e.preventDefault();
        }, { passive: false });
        pad.addEventListener("touchmove", function(e) {
          if (touchStartX == null) return;
          var contact = steeringContact(e.touches);
          if (!contact) { clearSteeringTouch(); return; }
          touchSteer = Math.max(-1, Math.min(1, (contact.clientX - touchStartX) / 60));
          e.preventDefault();
        }, { passive: false });
        pad.addEventListener("touchend", function(e) {
          if (steeringContact(e.changedTouches) || !steeringContact(e.touches)) clearSteeringTouch();
        });
      }
      var db = $("btn-drift"), ib = $("btn-item");
      if (db) {
        db.addEventListener("touchstart", function(e) {
          touchDrift = true;
          e.preventDefault();
        }, { passive: false });
        db.addEventListener("touchend", function() {
          touchDrift = false;
        });
      }
      if (ib) {
        ib.addEventListener("touchstart", function(e) {
          pendingItem = true;
          e.preventDefault();
        }, { passive: false });
      }
    }
    function init() {
      canvas = $("game");
      hudCanvas = $("hud");
      renderer = new KART.Renderer3D(canvas, hudCanvas);
      global.addEventListener("resize", function() {
        renderer.resize();
      });
      bindMenu();
      bindInput();
      buildShowcase();
      $("btn-pause").onclick = togglePause;
      $("btn-resume").onclick = togglePause;
      $("btn-quit").onclick = function() {
        state = "menu";
        show("menu");
        $("hud-top").classList.add("hidden");
        audio.music.stop();
        lastCd = 4;
        buildShowcase();
      };
      $("btn-again").onclick = startRace;
      $("btn-menu").onclick = function() {
        state = "menu";
        show("menu");
        audio.music.stop();
        lastCd = 4;
        buildShowcase();
      };
      show("menu");
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }
    if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init);
    else init();
    KART.game = {
      startRace,
      getRace: function() {
        return race;
      },
      getRenderer: function() {
        return renderer;
      },
      settings
    };
  })(typeof window !== "undefined" ? window : globalThis);
  return host.KART;
}
export {
  mountEngine
};
