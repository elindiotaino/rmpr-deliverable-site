(function () {
  var config = window.PRESENTATION_SPATIAL_COMPANION || {
    mapPath: "./nav-map.json",
    revealPath: "../index.html"
  };

  function normalizeHash(hash, fallback) {
    if (!hash || hash === "#") {
      return fallback || "#/1";
    }

    if (hash.indexOf("#/") === 0) {
      return hash;
    }

    if (hash.charAt(0) === "#") {
      return "#/" + hash.slice(1);
    }

    return "#/" + hash.replace(/^\/+/, "");
  }

  function resolveRevealHash(map, nodeId) {
    return (map.spatialToReveal && map.spatialToReveal[nodeId]) || map.defaultRevealHash;
  }

  function buildRevealUrl(hash) {
    var url = new URL(config.revealPath, window.location.href);
    url.hash = normalizeHash(hash);
    return url.toString();
  }

  function currentNodeId(map) {
    var params = new URLSearchParams(window.location.search);
    if (params.get("node")) {
      return params.get("node");
    }

    if (window.location.hash) {
      return window.location.hash.slice(1);
    }

    if (params.get("slide")) {
      return map.revealToSpatial[normalizeHash(params.get("slide"), map.defaultRevealHash)];
    }

    return map.defaultSpatialNode;
  }

  function updateLinks(map, activeNode) {
    var returnTarget = document.querySelector("[data-role='return-to-deck']");
    var returnHash = resolveRevealHash(map, activeNode);

    if (returnTarget) {
      returnTarget.href = buildRevealUrl(returnHash);
    }

    Array.prototype.forEach.call(document.querySelectorAll(".jump"), function (link) {
      var nodeId = link.getAttribute("data-node");
      var revealHash = resolveRevealHash(map, nodeId || activeNode);
      link.href = buildRevealUrl(revealHash);
    });
  }

  function init(map) {
    var api = window.impressApi;
    var nodeId = currentNodeId(map);

    updateLinks(map, nodeId);

    if (api && typeof api.goto === "function" && nodeId) {
      api.goto(nodeId);
    }

    document.addEventListener("impress:stepenter", function (event) {
      var activeStep = event.detail && event.detail.step;
      if (!activeStep || !activeStep.id) {
        return;
      }

      updateLinks(map, activeStep.id);
    });
  }

  fetch(config.mapPath)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("navigation map not available");
      }

      return response.json();
    })
    .then(init)
    .catch(function () {
      return null;
    });
})();
