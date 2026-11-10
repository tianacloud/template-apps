/**
 * 宿主地图适配器：接入 Google Maps JavaScript API（官方 SDK，非原始瓦片端点）。
 * 注册 window.TRAVEL_MAP_ADAPTER，供 app.mjs 在「可缩放地图」模式下调用。
 *
 * 密钥解析顺序：
 *   1. 链接参数 ?gmk=<key> —— 手机端一次设置即写入 localStorage，之后不用再带
 *   2. cloud-config.js 的 window.TRAVEL_CLOUD_CONFIG.map.googleMapsKey（正式部署用）
 *   3. localStorage 中已保存的密钥
 * 三者都没有时：不注册适配器 → app.mjs 按原逻辑回落到 OpenStreetMap 底图。
 */
(function () {
  "use strict";

  var STORAGE_KEY = "travel.googleMapsKey";
  var RASTER_STORAGE_KEY = "travel.rasterKey";
  var READY_CALLBACK = "__travelGmapsReady";
  var LOAD_TIMEOUT_MS = 12000;
  var AUTH_GRACE_MS = 1500;
  var DEMO_MAP_ID = "DEMO_MAP_ID";
  var DAY_COLORS = ["#1766e3", "#8a58c7", "#0f8f6f", "#c2571b"];

  var authFailed = false;
  var authNotice = "";

  /* ---------------------------------------------------------------- 密钥解析 */

  function configValue() {
    var config = window.TRAVEL_CLOUD_CONFIG || {};
    var map = config.map || {};
    var value = map.googleMapsKey;
    return typeof value === "string" ? value.trim() : "";
  }

  function storedValue(storageKey) {
    try {
      return (window.localStorage.getItem(storageKey) || "").trim();
    } catch (error) {
      return "";
    }
  }

  function urlParam(name, storageKey) {
    var value = "";
    try {
      value = (new URLSearchParams(window.location.search).get(name) || "").trim();
    } catch (error) {
      value = "";
    }
    if (value && storageKey) {
      try {
        window.localStorage.setItem(storageKey, value);
      } catch (error) {
        /* 隐私模式下写不进去，本次仍然可用 */
      }
    }
    return value;
  }

  function mapConfig() {
    return (window.TRAVEL_CLOUD_CONFIG || {}).map || {};
  }

  function resolveKey() {
    return urlParam("gmk", STORAGE_KEY) || configValue() || storedValue(STORAGE_KEY);
  }

  /**
   * 可选的栅格底图（任何官方文档化的 XYZ 瓦片服务：MapTiler / Mapbox / Thunderforest…）。
   * 只接受配置里显式给出的 urlTemplate，或由 ?rtk= 密钥生成的 MapTiler 官方地址，
   * 不使用任何未公开的原始瓦片端点。
   */
  function resolveRaster() {
    var config = mapConfig();
    var preset = config.raster || {};
    if (preset.enabled && typeof preset.urlTemplate === "string" && preset.urlTemplate) {
      return {
        label: preset.label || "自定义底图",
        urlTemplate: preset.urlTemplate,
        attribution: preset.attribution || "",
        maxZoom: preset.maxZoom || 19,
      };
    }
    var key = urlParam("rtk", RASTER_STORAGE_KEY) || (typeof config.rasterKey === "string" ? config.rasterKey.trim() : "") || storedValue(RASTER_STORAGE_KEY);
    if (!key) return null;
    return {
      label: "MapTiler",
      urlTemplate: "https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=" + encodeURIComponent(key),
      attribution: '© <a href="https://www.maptiler.com/copyright/" target="_blank" rel="noopener">MapTiler</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
      maxZoom: 20,
    };
  }

  /* ---------------------------------------------------------------- 状态提示 */

  function statusElement() {
    return document.getElementById("mapStatus");
  }

  function appendNotice(message) {
    var status = statusElement();
    if (!status) return;
    if (status.textContent.indexOf(message) !== -1) return;
    window.setTimeout(function () {
      var target = statusElement();
      if (!target) return;
      if (target.textContent.indexOf(message) !== -1) return;
      target.textContent = target.textContent.replace(/\s*$/, "") + " " + message;
    }, 0);
  }

  window.gm_authFailure = function () {
    authFailed = true;
    authNotice = "Google 地图密钥被拒绝：请在 Google Cloud 中启用「Maps JavaScript API」，并把 HTTP 引荐来源限制设为本页域名。";
    var status = statusElement();
    if (status) status.textContent = authNotice;
  };

  /* ---------------------------------------------------------------- SDK 加载 */

  var loading = null;

  function loadMaps(key) {
    if (window.google && window.google.maps) return Promise.resolve(window.google.maps);
    if (loading) return loading;

    loading = new Promise(function (resolve, reject) {
      var settled = false;
      var finish = function (fn, value) {
        if (settled) return;
        settled = true;
        fn(value);
      };

      window[READY_CALLBACK] = function () {
        finish(resolve, window.google && window.google.maps);
      };

      var script = document.createElement("script");
      script.src = "https://maps.googleapis.com/maps/api/js"
        + "?key=" + encodeURIComponent(key)
        + "&v=weekly"
        + "&loading=async"
        + "&libraries=marker"
        + "&language=zh-CN"
        + "&region=MY"
        + "&callback=" + READY_CALLBACK;
      script.async = true;
      script.onerror = function () {
        finish(reject, new Error("google_maps_script_failed"));
      };
      document.head.appendChild(script);

      window.setTimeout(function () {
        finish(reject, new Error("google_maps_timeout"));
      }, LOAD_TIMEOUT_MS);
    });

    loading = loading.catch(function (error) {
      loading = null;
      throw error;
    });
    return loading;
  }

  /* ---------------------------------------------------------------- 样式 */

  function ensureStyles() {
    if (document.getElementById("travel-gmap-styles")) return;
    var style = document.createElement("style");
    style.id = "travel-gmap-styles";
    style.textContent = [
      ".travel-gmap-pin{display:grid;place-items:center;width:26px;height:26px;border-radius:50%;",
      "border:2px solid #fff;background:#1766e3;color:#fff;font:700 11px/1 system-ui,-apple-system,'Segoe UI',sans-serif;",
      "box-shadow:0 2px 7px rgba(0,0,0,.38);cursor:pointer}",
      ".travel-gmap-info{max-width:210px;font:400 12px/1.5 system-ui,-apple-system,'Segoe UI',sans-serif;color:#1c1c1e}",
      ".travel-gmap-info b{display:block;margin-bottom:3px;font-size:13px}",
      ".travel-gmap-info span{color:#6b6b70}",
    ].join("");
    document.head.appendChild(style);
  }

  /* ---------------------------------------------------------------- 地图挂载 */

  function isDrawable(location) {
    return !!location
      && location.coordinateSystem === "WGS84"
      && typeof location.latitude === "number"
      && typeof location.longitude === "number";
  }

  function buildController(maps, element, payload) {
    ensureStyles();

    var useAdvanced = !!(maps.marker && maps.marker.AdvancedMarkerElement);
    var options = {
      center: { lat: 3.139, lng: 101.6869 },
      zoom: 11,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      clickableIcons: true,
    };
    if (useAdvanced) options.mapId = DEMO_MAP_ID;

    element.innerHTML = "";
    var map = new maps.Map(element, options);
    var bounds = new maps.LatLngBounds();
    var info = new maps.InfoWindow();
    var overlays = [];
    var missing = 0;
    var placed = 0;
    var order = 0;

    function addMarker(point, label, title, onClick) {
      var marker;
      if (useAdvanced) {
        var pin = document.createElement("div");
        pin.className = "travel-gmap-pin";
        pin.textContent = String(label);
        marker = new maps.marker.AdvancedMarkerElement({
          position: point,
          map: map,
          content: pin,
          title: title,
          zIndex: 1000 + label,
        });
        marker.addListener("gmp-click", onClick);
      } else {
        marker = new maps.Marker({
          position: point,
          map: map,
          title: title,
          zIndex: 1000 + label,
          label: { text: String(label), color: "#ffffff", fontSize: "11px", fontWeight: "700" },
        });
        marker.addListener("click", onClick);
      }
      return marker;
    }

    (payload.days || []).forEach(function (day, dayIndex) {
      var previous = null;
      var color = DAY_COLORS[dayIndex % DAY_COLORS.length];

      (day.stops || []).forEach(function (stop) {
        order += 1;
        if (!isDrawable(stop.location)) {
          missing += 1;
          previous = null;
          return;
        }
        var point = { lat: stop.location.latitude, lng: stop.location.longitude };
        bounds.extend(point);
        placed += 1;

        var html = '<div class="travel-gmap-info"><b>' + escapeHtml(stop.name || "行程地点") + "</b>"
          + "<span>" + escapeHtml(day.date || "") + " · 第 " + order + " 站</span></div>";
        var marker = addMarker(point, order, (day.date || "") + " · " + (stop.name || ""), function () {
          info.setContent(html);
          info.open({ map: map, anchor: marker });
          if (typeof payload.onSelect === "function") {
            try {
              payload.onSelect(stop.id);
            } catch (error) {
              /* 选择回调失败不影响地图 */
            }
          }
        });
        overlays.push(marker);

        if (previous) {
          overlays.push(new maps.Polyline({
            path: [previous, point],
            map: map,
            strokeColor: color,
            strokeOpacity: 0.85,
            strokeWeight: 3,
            icons: [{ icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 3 }, offset: "0", repeat: "14px" }],
          }));
        }
        previous = point;
      });
    });

    if (placed) map.fitBounds(bounds, 46);
    if (missing) appendNotice(missing + " 个节点缺少可绘制坐标。");
    window.setTimeout(function () {
      maps.event.trigger(map, "resize");
    }, 40);

    return {
      remove: function () {
        overlays.forEach(function (overlay) {
          if (overlay.setMap) overlay.setMap(null);
        });
        overlays = [];
        info.close();
        map = null;
        element.innerHTML = "";
      },
    };
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function mount(payload) {
    var key = resolveKey();
    if (!key) return Promise.reject(new Error("google_maps_key_missing"));

    return loadMaps(key).then(function (maps) {
      if (!maps) throw new Error("google_maps_script_failed");
      var controller = buildController(maps, payload.element, payload);

      // 给鉴权失败留一个短暂观察窗口：密钥被拒时让 app.mjs 回落到 OSM，并保留原因说明。
      return new Promise(function (resolve, reject) {
        window.setTimeout(function () {
          if (authFailed) {
            controller.remove();
            reject(new Error("google_maps_auth_failed"));
            appendNotice(authNotice);
            return;
          }
          resolve(controller);
        }, AUTH_GRACE_MS);
      });
    });
  }

  /* ---------------------------------------------------------------- 注册 */

  var googleKey = resolveKey();
  var raster = resolveRaster();

  /* 配好底图密钥后，首次打开默认落在「可缩放地图」；用户手动切过就尊重其选择。
     app.mjs 在模块求值时读这个 key，而本脚本是经典脚本、先于它执行，所以顺序成立。 */
  if (googleKey || raster) {
    try {
      if (!window.localStorage.getItem("travel-wallet-map-mode")) {
        window.localStorage.setItem("travel-wallet-map-mode", "basemap");
      }
    } catch (error) {
      /* 隐私模式写不进去，退回 app.mjs 的默认值 */
    }
  }

  window.TRAVEL_MAP_TILES = raster;
  window.TRAVEL_MAP_STATE = {
    hasGoogleKey: !!googleKey,
    googleKeySource: urlParam("gmk", null) ? "url" : configValue() ? "config" : googleKey ? "storage" : "none",
    hasRasterKey: !!raster,
    rasterLabel: raster ? raster.label : "街道图",
  };

  if (googleKey) {
    window.TRAVEL_MAP_ADAPTER = {
      provider: "Google",
      mount: mount,
      destroy: function (host) {
        if (host) host.innerHTML = "";
      },
    };
  }
})();
