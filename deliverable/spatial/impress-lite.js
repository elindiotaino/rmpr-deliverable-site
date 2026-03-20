(function () {
  function parseNumber(value, fallback) {
    var parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  window.impress = function () {
    var root = document.getElementById("impress");
    var steps = Array.prototype.slice.call(root.querySelectorAll(".step"));
    var index = 0;

    function findStepIndex(stepRef) {
      if (typeof stepRef === "number") {
        return stepRef;
      }

      if (typeof stepRef === "string") {
        var normalizedId = stepRef.replace(/^#/, "");
        return steps.findIndex(function (step) {
          return step.id === normalizedId;
        });
      }

      return steps.indexOf(stepRef);
    }

    function positionStep(step) {
      var x = parseNumber(step.dataset.x, 0);
      var y = parseNumber(step.dataset.y, 0);
      var scale = parseNumber(step.dataset.scale, 1);
      var rotate = parseNumber(step.dataset.rotate, 0);
      step.style.transform =
        "translate(-50%, -50%) translate3d(" +
        x +
        "px," +
        y +
        "px,0) rotate(" +
        rotate +
        "deg) scale(" +
        scale +
        ")";
    }

    function activate(nextIndex, options) {
      var settings = options || {};
      index = (nextIndex + steps.length) % steps.length;
      var active = steps[index];
      var x = parseNumber(active.dataset.x, 0);
      var y = parseNumber(active.dataset.y, 0);
      var scale = parseNumber(active.dataset.scale, 1);

      steps.forEach(function (step, stepIndex) {
        step.classList.toggle("active", stepIndex === index);
      });

      root.style.transform =
        "translate3d(" +
        -x +
        "px," +
        -y +
        "px,0) scale(" +
        (1 / scale) +
        ")";

      if (settings.updateHash !== false && active.id) {
        history.replaceState(null, "", "#" + active.id);
      }

      document.dispatchEvent(
        new CustomEvent("impress:stepenter", {
          detail: {
            index: index,
            step: active,
          },
        })
      );
    }

    function onKeydown(event) {
      if (["ArrowRight", "ArrowDown", " ", "PageDown"].indexOf(event.key) !== -1) {
        event.preventDefault();
        activate(index + 1);
      } else if (
        ["ArrowLeft", "ArrowUp", "PageUp", "Backspace"].indexOf(event.key) !== -1
      ) {
        event.preventDefault();
        activate(index - 1);
      } else if (event.key === "Home") {
        event.preventDefault();
        activate(0);
      }
    }

    return {
      init: function () {
        var initialIndex = findStepIndex(window.location.hash);
        document.body.classList.add("impress-enabled");
        steps.forEach(positionStep);
        steps.forEach(function (step, stepIndex) {
          step.addEventListener("click", function () {
            activate(stepIndex);
          });
        });
        window.addEventListener("keydown", onKeydown);
        window.addEventListener("hashchange", function () {
          var hashedIndex = findStepIndex(window.location.hash);
          if (hashedIndex >= 0 && hashedIndex !== index) {
            activate(hashedIndex, { updateHash: false });
          }
        });
        activate(initialIndex >= 0 ? initialIndex : 0);
      },
      goto: function (stepRef) {
        var nextIndex = findStepIndex(stepRef);
        if (nextIndex >= 0) {
          activate(nextIndex);
        }
      },
      getActiveStep: function () {
        return steps[index];
      },
    };
  };
})();
