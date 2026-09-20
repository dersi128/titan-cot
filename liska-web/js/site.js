(function () {
  "use strict";

  var year = document.getElementById("year");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  var nav = document.getElementById("site-nav");
  var toggle = document.querySelector(".nav-toggle");

  function setNav(open) {
    if (!nav || !toggle) {
      return;
    }
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setNav(!nav.classList.contains("is-open"));
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setNav(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        setNav(false);
      }
    });
  }

  var items = Array.prototype.slice.call(document.querySelectorAll(".gallery-item"));
  var lightbox = document.getElementById("lightbox");
  var lightboxImage = document.getElementById("lightbox-image");
  var lightboxCaption = document.getElementById("lightbox-caption");
  var lightboxCount = document.getElementById("lightbox-count");
  var current = 0;

  function showSlide(index) {
    if (!items.length) {
      return;
    }
    current = (index + items.length) % items.length;
    var item = items[current];
    var image = item.querySelector("img");
    lightboxImage.src = image.getAttribute("src");
    lightboxImage.alt = image.getAttribute("alt") || "";
    lightboxCaption.textContent = item.getAttribute("data-caption") || lightboxImage.alt;
    lightboxCount.textContent = current + 1 + " / " + items.length;
  }

  function openLightbox(index) {
    if (!lightbox) {
      return;
    }
    showSlide(index);
    if (typeof lightbox.showModal === "function") {
      lightbox.showModal();
    }
    var closeBtn = document.querySelector(".lightbox-close");
    if (closeBtn) {
      closeBtn.focus();
    }
  }

  function closeLightbox() {
    if (lightbox && lightbox.open) {
      lightbox.close();
    }
  }

  items.forEach(function (item, index) {
    item.addEventListener("click", function () {
      openLightbox(index);
    });
    item.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(index);
      }
    });
  });

  if (lightbox) {
    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    var closeControl = document.querySelector("[data-lightbox-close]");
    var prevControl = document.querySelector("[data-lightbox-prev]");
    var nextControl = document.querySelector("[data-lightbox-next]");
    if (closeControl) {
      closeControl.addEventListener("click", closeLightbox);
    }
    if (prevControl) {
      prevControl.addEventListener("click", function () {
        showSlide(current - 1);
      });
    }
    if (nextControl) {
      nextControl.addEventListener("click", function () {
        showSlide(current + 1);
      });
    }

    lightbox.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") {
        showSlide(current - 1);
      }
      if (event.key === "ArrowRight") {
        showSlide(current + 1);
      }
    });
  }

  var form = document.getElementById("poptavka-formular");
  var statusEl = document.getElementById("form-status");
  var tokenInput = document.getElementById("form-token");
  var submitBtn = form ? form.querySelector("[type=submit]") : null;
  var tokenReady = false;

  function setStatus(message, type) {
    if (!statusEl) {
      return;
    }
    statusEl.textContent = message;
    statusEl.classList.remove("is-ok", "is-error");
    if (type) {
      statusEl.classList.add(type === "ok" ? "is-ok" : "is-error");
    }
  }

  function clearFieldErrors() {
    document.querySelectorAll(".field-error").forEach(function (el) {
      el.hidden = true;
      el.textContent = "";
    });
    document.querySelectorAll(".field.is-invalid").forEach(function (el) {
      el.classList.remove("is-invalid");
    });
  }

  function showFieldErrors(errors) {
    Object.keys(errors || {}).forEach(function (name) {
      var box = document.querySelector('[data-error-for="' + name + '"]');
      var field = box ? box.closest(".field") : null;
      if (!box) {
        return;
      }
      box.hidden = false;
      box.textContent = errors[name];
      if (field) {
        field.classList.add("is-invalid");
      }
    });
  }

  function loadToken() {
    return fetch("token.php", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("token");
        }
        return response.json();
      })
      .then(function (data) {
        if (!data || !data.token) {
          throw new Error("token");
        }
        tokenInput.value = data.token;
        tokenReady = true;
      })
      .catch(function () {
        tokenReady = false;
        setStatus(
          "V tomto náhledu se poptávka neodesílá.",
          "error"
        );
      });
  }

  if (form && tokenInput) {
    loadToken();

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      clearFieldErrors();

      if (!tokenReady) {
        setStatus(
          "V tomto náhledu se poptávka neodesílá. Použijte e-mail nebo telefon v sekci Kontakt.",
          "error"
        );
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
      }
      setStatus("Odesílám…");

      fetch(form.getAttribute("action"), {
        method: "POST",
        body: new FormData(form),
        headers: {
          Accept: "application/json",
          "X-Requested-With": "fetch",
        },
      })
        .then(function (response) {
          return response.json().then(function (data) {
            return { okHttp: response.ok, data: data || {} };
          });
        })
        .then(function (result) {
          var data = result.data;
          if (data.ok === true) {
            form.reset();
            setStatus(data.message || "Poptávka je odeslaná.", "ok");
            loadToken();
            return;
          }
          showFieldErrors(data.errors);
          setStatus(data.message || "Odeslání se nepodařilo.", "error");
          loadToken();
        })
        .catch(function () {
          setStatus(
            "Spojení se serverem selhalo. Zkuste to znovu, nebo napište e-mail.",
            "error"
          );
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
          }
        });
    });
  }
})();
