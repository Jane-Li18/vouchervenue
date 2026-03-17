(function () {
  function runAfterPaint(callback) {
    requestAnimationFrame(function () {
      requestAnimationFrame(callback);
    });
  }

  function revealPage() {
    const loader = document.getElementById("global-loader");

    if (!loader || loader.dataset.state === "hiding") return;

    loader.dataset.state = "hiding";

    runAfterPaint(function () {
      loader.classList.add("is-hidden");
      document.body.classList.remove("is-loading");

      document.querySelectorAll(".fade-blocked").forEach(function (el) {
        el.classList.remove("fade-blocked");
      });

      if (typeof initScrollAnimations === "function") {
        initScrollAnimations();
      }

      loader.addEventListener(
        "transitionend",
        function () {
          loader.remove();
        },
        { once: true }
      );

      window.setTimeout(function () {
        if (document.body.contains(loader)) {
          loader.remove();
        }
      }, 1200);
    });
  }

  function initGlobalLoader() {
    document.body.classList.add("is-loading");

    if (document.readyState === "complete") {
      runAfterPaint(revealPage);
    } else {
      window.addEventListener(
        "load",
        function () {
          runAfterPaint(revealPage);
        },
        { once: true }
      );
    }

    window.addEventListener("pageshow", function () {
      runAfterPaint(revealPage);
    });
  }

  initGlobalLoader();
})();