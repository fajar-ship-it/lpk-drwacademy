/* LPK DRW Academy — main.js */

(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var navToggle = document.querySelector(".nav-toggle");
  var mainNav = document.querySelector(".main-nav");

  if (header) {
    var onScroll = function () {
      if (window.scrollY > 10) {
        header.classList.add("is-scrolled");
        header.classList.remove("is-transparent");
      } else if (header.dataset.transparent === "true") {
        header.classList.remove("is-scrolled");
        header.classList.add("is-transparent");
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      mainNav.classList.toggle("is-open");
    });

    mainNav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        mainNav.classList.remove("is-open");
      }
    });
  }

  var filterBar = document.querySelector(".filter-bar");
  if (filterBar) {
    var buttons = filterBar.querySelectorAll(".filter-btn");
    var cards = document.querySelectorAll("[data-category]");

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) {
          b.classList.remove("is-active");
        });
        btn.classList.add("is-active");

        var filter = btn.dataset.filter;
        cards.forEach(function (card) {
          var show = filter === "all" || card.dataset.category === filter;
          card.style.display = show ? "" : "none";
        });
      });
    });
  }

  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    var question = item.querySelector(".faq-question");
    if (!question) return;
    question.addEventListener("click", function () {
      var isOpen = item.classList.contains("is-open");
      faqItems.forEach(function (i) {
        i.classList.remove("is-open");
        var a = i.querySelector(".faq-answer");
        if (a) a.style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add("is-open");
        var answer = item.querySelector(".faq-answer");
        if (answer) answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });

  var backToTop = document.querySelector(".back-to-top");
  if (backToTop) {
    window.addEventListener(
      "scroll",
      function () {
        if (window.scrollY > 500) {
          backToTop.classList.add("is-visible");
        } else {
          backToTop.classList.remove("is-visible");
        }
      },
      { passive: true }
    );
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  if (window.AOS) {
    AOS.init({ once: true, duration: 700, offset: 80, easing: "ease-out-cubic" });
  }

  var formPendaftaran = document.getElementById("form-pendaftaran");
  if (formPendaftaran) {
    var statusEl = document.getElementById("form-status");
    var submitBtn = formPendaftaran.querySelector('button[type="submit"]');
    var labelBtn = submitBtn ? submitBtn.textContent : "Kirim";

    formPendaftaran.addEventListener("submit", function (e) {
      e.preventDefault();

      var nama = formPendaftaran.elements.nama;
      var whatsapp = formPendaftaran.elements.whatsapp;
      var program = formPendaftaran.elements.program;

      if (!nama || !nama.value.trim() || !whatsapp || !whatsapp.value.trim() || !program || !program.value) {
        statusEl.className = "form-status is-error";
        statusEl.textContent = "Mohon lengkapi Nama, No. WhatsApp, dan Program terlebih dahulu.";
        return;
      }

      var payload = {};
      new FormData(formPendaftaran).forEach(function (v, k) {
        payload[k] = v;
      });

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Mengirim...";
      }

      fetch("/api/pendaftaran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (r) {
          return r.json();
        })
        .then(function (res) {
          if (res.berhasil) {
            statusEl.className = "form-status is-success";
            statusEl.textContent = res.pesan;
            formPendaftaran.reset();
          } else {
            statusEl.className = "form-status is-error";
            statusEl.textContent = res.pesan || "Gagal mengirim pendaftaran.";
          }
        })
        .catch(function () {
          statusEl.className = "form-status is-error";
          statusEl.textContent =
            "Server tidak terjangkau. Silakan daftar via WhatsApp 0811-2649-051.";
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = labelBtn;
          }
        });
    });
  }

  var counters = document.querySelectorAll(".count");
  if (counters.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          io.unobserve(entry.target);
          var el = entry.target;
          var target = parseFloat(el.dataset.count);
          var decimals = parseInt(el.dataset.decimals || "0", 10);
          var start = null;
          var duration = 1600;
          function step(ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / duration, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            var val = target * eased;
            el.textContent = decimals
              ? val.toFixed(decimals)
              : Math.round(val).toLocaleString("id-ID");
            if (p < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (c) {
      io.observe(c);
    });
  }
})();
