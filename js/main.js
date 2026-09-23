/* =========================================================
   Odontologia Rodrigues ATA — main.js
   Motion system · vanilla JS · zero dependências
   Estratégia: IntersectionObserver + um único loop rAF.
   Só transform/opacity são animados (amigável à GPU).
   ========================================================= */
(function () {
  "use strict";

  const doc = document;
  const html = doc.documentElement;

  /* ---------- Capabilities ---------- */
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Elements ---------- */
  const header = doc.getElementById("header");
  const navToggle = doc.getElementById("navToggle");
  const nav = doc.getElementById("nav");
  const backToTop = doc.getElementById("backToTop");
  const topRing = doc.getElementById("topRing");
  const scrollProgress = doc.getElementById("scrollProgress");
  const navLinks = Array.from(doc.querySelectorAll(".nav__link"));
  const sections = Array.from(doc.querySelectorAll("main section[id]"));

  const hero = doc.getElementById("inicio");
  const heroDecor = doc.querySelector(".hero__decor");
  const heroContent = doc.querySelector(".hero__content");

  // Seção "Nossos Serviços" (animação de scroll)
  const svcSection = doc.getElementById("servicos");
  const svcTrack = doc.getElementById("servicesTrack");
  const svcSticky = doc.getElementById("servicesSticky");
  const svcTooth = doc.getElementById("servicesTooth");
  const svcCards = Array.from(doc.querySelectorAll(".service-card[data-svc]"));

  const RING_C = 125.66; // 2πr, r=20

  /* ---------- Math helpers ---------- */
  const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2); // easeInOutCubic
  const easeOut = (t) => 1 - Math.pow(1 - t, 3); // easeOutCubic

  /* Cached layout metrics — medidos no load/resize para o loop de scroll
     nunca ler layout a cada frame (evita reflow/thrash). */
  const metrics = { heroH: 0, headerH: 78, max: 0, sectionTops: [], svcTop: 0, svcScroll: 1, svcStickyH: 0 };
  function measure() {
    metrics.heroH = hero ? hero.offsetHeight : 0;
    metrics.headerH = header ? header.offsetHeight : 78;
    metrics.max = html.scrollHeight - window.innerHeight;
    metrics.sectionTops = sections.map((s) => ({ id: s.id, top: s.offsetTop }));
    if (svcTrack) {
      metrics.svcTop = svcTrack.getBoundingClientRect().top + (window.scrollY || 0);
      metrics.svcStickyH = svcSticky ? svcSticky.offsetHeight : window.innerHeight;
      metrics.svcScroll = Math.max(1, svcTrack.offsetHeight - metrics.svcStickyH);
    }
  }

  /* =========================================================
     1. SCROLL REVEAL (variantes + stagger)
     ========================================================= */
  (function initReveal() {
    const revealEls = doc.querySelectorAll(".reveal");
    if (!revealEls.length) return;

    // stagger: atraso conforme a ordem entre irmãos com o mesmo pai
    const counters = new Map();
    revealEls.forEach((el) => {
      const p = el.parentElement;
      const i = counters.get(p) || 0;
      el.style.setProperty("--reveal-delay", Math.min(i * 80, 400) + "ms");
      counters.set(p, i + 1);
    });

    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  })();

  /* =========================================================
     2. COUNT-UP (estatísticas)
     ========================================================= */
  (function initCounters() {
    const counters = doc.querySelectorAll(".stat__number[data-count]");
    if (!counters.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) return; // mantém o texto estático

    function setZero(el) {
      const prefix = (el.getAttribute("data-suffix") || "").includes("+") ? "+" : "";
      el.textContent = prefix + "0";
    }
    // começa do zero para não "piscar" o valor final antes de subir
    counters.forEach(setZero);

    // dispara toda vez que entra na tela (rola pra fora e volta → conta de novo)
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          if (entry.isIntersecting) {
            if (!el.dataset.counting) {
              el.dataset.counting = "1"; // evita reiniciar durante a mesma exibição
              animateCount(el);
            }
          } else {
            delete el.dataset.counting; // saiu da tela → prepara nova contagem
            el._ct = (el._ct || 0) + 1; // cancela loop em andamento
            setZero(el);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => obs.observe(c));
  })();

  function animateCount(el) {
    const target = parseInt(el.getAttribute("data-count"), 10) || 0;
    const prefix = (el.getAttribute("data-suffix") || "").includes("+") ? "+" : "";
    const duration = 2600;
    const start = performance.now();
    const token = (el._ct || 0) + 1; // invalida qualquer loop anterior
    el._ct = token;

    function tick(now) {
      if (el._ct !== token) return; // cancelado (saiu da tela ou reiniciou)
      const p = Math.min((now - start) / duration, 1);
      // smootherstep: sobe devagar, acelera e assenta suave — dá pra ver os números subindo
      const eased = p * p * p * (p * (p * 6 - 15) + 10);
      el.textContent = prefix + Math.round(eased * target).toLocaleString("pt-BR");
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* =========================================================
     3. MOBILE MENU
     ========================================================= */
  function toggleMenu(forceClose) {
    const isOpen = forceClose ? false : !nav.classList.contains("open");
    nav.classList.toggle("open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
    if (isOpen) header.classList.remove("header--hidden");
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => toggleMenu());
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) toggleMenu(true);
    });
    doc.addEventListener("click", (e) => {
      if (nav.classList.contains("open") && !nav.contains(e.target) && !navToggle.contains(e.target)) {
        toggleMenu(true);
      }
    });
    doc.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("open")) toggleMenu(true);
    });
  }

  if (backToTop) {
    backToTop.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" })
    );
  }

  /* =========================================================
     4. SCROLL LOOP (único rAF, passive)
     progresso · header dinâmico · anel · parallax do hero
     ========================================================= */
  let currentY = window.scrollY || 0;
  let lastY = currentY;
  const heroMouse = { x: 0, y: 0 };
  let scrollTicking = false;

  function onScroll() {
    currentY = window.scrollY || 0;
    requestFrame();
  }

  function requestFrame() {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(scrollFrame);
    }
  }

  function scrollFrame() {
    scrollTicking = false;
    const y = currentY;
    const max = metrics.max;
    const progress = max > 0 ? Math.min(Math.max(y / max, 0), 1) : 0;

    // progress bar
    if (scrollProgress) scrollProgress.style.transform = "scaleX(" + progress + ")";

    // back-to-top ring + visibility
    if (backToTop) backToTop.classList.toggle("show", y > 450);
    if (topRing) topRing.style.strokeDashoffset = RING_C * (1 - progress);

    // header: sombra + comportamento smart (esconde ao descer, volta ao subir)
    if (header) {
      header.classList.toggle("scrolled", y > 40);
      if (!nav.classList.contains("open")) {
        if (y > lastY && y > 320) header.classList.add("header--hidden");
        else header.classList.remove("header--hidden");
      }
    }
    lastY = y;

    updateActiveLink(y);
    applyHeroParallax();
    applyServicesAnim();
  }

  /* Scrollspy */
  function updateActiveLink(scrollY) {
    const pos = scrollY + metrics.headerH + 40;
    let currentId = "";
    for (const s of metrics.sectionTops) {
      if (s.top <= pos) currentId = s.id;
    }
    const map = { destaques: "inicio", resultados: "servicos", depoimentos: "equipe" };
    if (map[currentId]) currentId = map[currentId];
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href").slice(1) === currentId);
    });
  }

  /* =========================================================
     5. HERO PARALLAX (scroll + mouse) — combinados numa transform
     ========================================================= */
  function applyHeroParallax() {
    if (reduceMotion || !hero) return;
    const h = metrics.heroH;
    const y = currentY;

    if (heroDecor) {
      const dx = heroMouse.x * 24;
      const dy = y * 0.15 + heroMouse.y * 24;
      heroDecor.style.transform = "translate3d(" + dx + "px," + dy + "px,0)";
    }
    if (heroContent && y < h) {
      const p = Math.min(y / (h * 0.8), 1);
      heroContent.style.transform = "translate3d(0," + y * 0.16 + "px,0)";
      heroContent.style.opacity = String(1 - p * 0.85);
    }
  }

  if (finePointer && !reduceMotion && hero) {
    let mouseTicking = false;
    hero.addEventListener(
      "mousemove",
      (e) => {
        heroMouse.x = e.clientX / window.innerWidth - 0.5;
        heroMouse.y = e.clientY / window.innerHeight - 0.5;
        if (!mouseTicking) {
          mouseTicking = true;
          requestAnimationFrame(() => {
            applyHeroParallax();
            mouseTicking = false;
          });
        }
      },
      { passive: true }
    );
    hero.addEventListener("mouseleave", () => {
      heroMouse.x = 0;
      heroMouse.y = 0;
      requestAnimationFrame(applyHeroParallax);
    });
  }

  /* =========================================================
     6. TILT 3D (elementos [data-tilt], só desktop)
     ========================================================= */
  if (finePointer && !reduceMotion) {
    doc.querySelectorAll("[data-tilt]").forEach((el) => {
      let ticking = false,
        lx = 0,
        ly = 0;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        lx = (e.clientX - r.left) / r.width - 0.5;
        ly = (e.clientY - r.top) / r.height - 0.5;
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(() => {
            el.classList.add("is-tilting");
            el.style.transform =
              "perspective(820px) rotateX(" +
              (-ly * 6).toFixed(2) +
              "deg) rotateY(" +
              (lx * 6).toFixed(2) +
              "deg) translateY(-4px)";
            ticking = false;
          });
        }
      });
      el.addEventListener("mouseleave", () => {
        el.classList.remove("is-tilting");
        el.style.transform = "";
      });
    });

    /* =======================================================
       7. SPOTLIGHT (glow que segue o cursor nos cards)
       ======================================================= */
    doc.querySelectorAll(".service-card, .team-card, .testimonial").forEach((el) => {
      let ticking = false,
        mx = 50,
        my = 0;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        mx = ((e.clientX - r.left) / r.width) * 100;
        my = ((e.clientY - r.top) / r.height) * 100;
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(() => {
            el.style.setProperty("--mx", mx.toFixed(1) + "%");
            el.style.setProperty("--my", my.toFixed(1) + "%");
            ticking = false;
          });
        }
      });
    });
  }

  /* =========================================================
     8. RIPPLE nos botões (feedback ao clique/toque)
     ========================================================= */
  if (!reduceMotion) {
    doc.addEventListener(
      "pointerdown",
      (e) => {
        const btn = e.target.closest(".btn");
        if (!btn) return;
        const r = btn.getBoundingClientRect();
        const size = Math.max(r.width, r.height);
        const span = doc.createElement("span");
        span.className = "ripple";
        span.style.width = span.style.height = size + "px";
        span.style.left = e.clientX - r.left - size / 2 + "px";
        span.style.top = e.clientY - r.top - size / 2 + "px";
        btn.appendChild(span);
        span.addEventListener("animationend", () => span.remove());
      },
      { passive: true }
    );
  }

  /* =========================================================
     9. VÍDEO / TOUR DA CLÍNICA
        - detecta proporção (portrait/landscape) e adapta o palco
        - autoplay mudo só quando visível; pausa fora da viewport
        - backdrop desfocado só no desktop e sob demanda (lazy)
        - respeita prefers-reduced-motion
     ========================================================= */
  (function initClinicVideo() {
    const player = doc.getElementById("clinicVideo");
    const frame = doc.getElementById("videoFrame");
    if (!player || !frame) return;

    const backdrop = frame.querySelector(".video-stage__backdrop");
    const soundBtn = doc.getElementById("videoSound");
    const playBtn = frame.querySelector(".video-stage__play");
    const wideMQ = window.matchMedia("(min-width: 768px)");
    let backdropReady = false;
    let inView = false;

    function applyAspect() {
      const w = player.videoWidth,
        h = player.videoHeight;
      if (!w || !h) return;
      const ar = w / h;
      frame.style.setProperty("--video-ar", ar.toFixed(4));
      frame.classList.toggle("is-portrait", ar < 1);
      frame.classList.toggle("is-landscape", ar >= 1);
    }
    player.addEventListener("loadedmetadata", applyAspect);
    player.addEventListener("resize", applyAspect); // caso o vídeo mude de dimensão
    player.addEventListener("loadeddata", () => frame.classList.add("is-playing"));
    player.addEventListener("playing", () => frame.classList.add("is-playing"));

    function enableBackdrop() {
      if (backdropReady || !backdrop) return;
      if (!wideMQ.matches || reduceMotion) return; // sem backdrop no mobile / reduced-motion
      backdrop.src = backdrop.dataset.src;
      backdrop.load();
      backdropReady = true;
      frame.classList.add("backdrop-on");
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          inView = e.isIntersecting;
          if (e.isIntersecting && !reduceMotion) {
            enableBackdrop();
            player
              .play()
              .then(() => {
                if (backdropReady) backdrop.play().catch(() => {});
              })
              .catch(() => {});
          } else {
            player.pause();
            if (backdropReady) backdrop.pause();
          }
        });
      },
      { threshold: 0.25 }
    );
    io.observe(frame);

    let userPaused = false;
    player.addEventListener("pause", () => {
      // pausa "de verdade" (usuário) mostra o play; travadas de buffer se auto-recuperam em viewport
      if (userPaused || reduceMotion) {
        frame.classList.add("is-paused");
      } else if (inView) {
        setTimeout(() => {
          if (inView && player.paused && !userPaused) player.play().catch(() => {});
        }, 250);
      }
    });
    player.addEventListener("play", () => frame.classList.remove("is-paused"));
    if (reduceMotion) frame.classList.add("is-paused"); // não faz autoplay: mostra o play

    function toggle() {
      if (player.paused) {
        userPaused = false;
        player.play().catch(() => {});
      } else {
        userPaused = true;
        player.pause();
      }
    }
    player.addEventListener("click", toggle);
    if (playBtn)
      playBtn.addEventListener("click", () => {
        userPaused = false;
        player.play().catch(() => {});
      });

    if (soundBtn) {
      soundBtn.addEventListener("click", () => {
        player.muted = !player.muted;
        frame.classList.toggle("is-muted", player.muted);
        soundBtn.setAttribute("aria-label", player.muted ? "Ativar som" : "Desativar som");
        if (!player.muted) player.play().catch(() => {});
      });
    }

    if (player.readyState >= 1) applyAspect();
  })();

  /* =========================================================
     10. COMPARADOR ANTES/DEPOIS (linha arrastável)
     ========================================================= */
  (function initBeforeAfter() {
    doc.querySelectorAll(".ba").forEach((ba) => {
      const handle = ba.querySelector(".ba__handle");
      let active = false,
        decided = false,
        startX = 0,
        startY = 0;

      function setPos(clientX) {
        const r = ba.getBoundingClientRect();
        let p = ((clientX - r.left) / r.width) * 100;
        p = Math.max(0, Math.min(100, p));
        ba.style.setProperty("--pos", p + "%");
        if (handle) handle.setAttribute("aria-valuenow", Math.round(p));
      }

      ba.addEventListener("pointerdown", (e) => {
        active = true;
        decided = false;
        startX = e.clientX;
        startY = e.clientY;
        ba.classList.add("is-touched");
        // pegar direto na alça = arrasto imediato
        if (e.target.closest(".ba__handle")) {
          decided = true;
          try { ba.setPointerCapture(e.pointerId); } catch (_) {}
          setPos(e.clientX);
          e.preventDefault();
        }
      });

      ba.addEventListener("pointermove", (e) => {
        if (!active) return;
        if (!decided) {
          const dx = Math.abs(e.clientX - startX),
            dy = Math.abs(e.clientY - startY);
          if (dx < 6 && dy < 6) return; // ainda decidindo
          if (dx > dy) {
            decided = true;
            try { ba.setPointerCapture(e.pointerId); } catch (_) {}
          } else {
            active = false; // gesto vertical → deixa rolar a página
            return;
          }
        }
        setPos(e.clientX);
        e.preventDefault();
      });

      function endDrag(e) {
        if (active && !decided && e) setPos(e.clientX); // toque simples = pula para o ponto
        active = false;
        decided = false;
      }
      ba.addEventListener("pointerup", endDrag);
      ba.addEventListener("pointercancel", () => {
        active = false;
        decided = false;
      });

      if (handle) {
        handle.addEventListener("keydown", (e) => {
          const cur = parseFloat(ba.style.getPropertyValue("--pos")) || 50;
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            const next = e.key === "ArrowLeft" ? Math.max(0, cur - 4) : Math.min(100, cur + 4);
            ba.style.setProperty("--pos", next + "%");
            handle.setAttribute("aria-valuenow", Math.round(next));
            ba.classList.add("is-touched");
            e.preventDefault();
          }
        });
      }
    });
  })();

  /* =========================================================
     11. SERVIÇOS — dente encolhe e os serviços surgem com o scroll
        Seção "presa" (sticky) + scroll controla o progresso, no
        desktop E no mobile (grade compacta). reduced-motion: estático.
     ========================================================= */
  let svcActive = false;

  function applyServicesAnim() {
    if (!svcActive || !svcTrack || !svcTooth) return;
    const p = clamp01((currentY - metrics.svcTop) / metrics.svcScroll);

    // dente: do centro grande para o topo pequeno
    const e = easeInOut(p);
    const stickyH = metrics.svcStickyH || window.innerHeight;
    const scale = lerp(1.12, 0.34, e);
    const ty = lerp(0.05, -0.4, e) * stickyH;
    svcTooth.style.transform =
      "translate(-50%,-50%) translateY(" + ty.toFixed(1) + "px) scale(" + scale.toFixed(3) + ")";

    // cards: um a um, conforme o progresso
    for (let i = 0; i < svcCards.length; i++) {
      const card = svcCards[i];
      const cp = clamp01((p - (0.16 + i * 0.108)) / 0.14);
      if (cp >= 1) {
        if (!card.classList.contains("svc-done")) {
          card.classList.add("svc-done");
          card.style.opacity = "";
          card.style.transform = "";
        }
      } else {
        if (card.classList.contains("svc-done")) card.classList.remove("svc-done");
        const ce = easeOut(cp);
        card.style.opacity = ce.toFixed(3);
        card.style.transform =
          "translateY(" + ((1 - ce) * 52).toFixed(1) + "px) scale(" + (0.9 + 0.1 * ce).toFixed(3) + ")";
      }
    }
  }

  function evaluateServicesMode() {
    if (!svcSection || !svcTrack) return;
    // fixa em telas com altura suficiente; em telas muito baixas volta ao scroll normal
    const wantScrub = !reduceMotion && window.innerHeight >= 600;
    if (wantScrub && !svcActive) {
      svcActive = true;
      svcSection.classList.add("is-anim");
      measure(); // recalcula com o trilho já na altura animada
      applyServicesAnim();
    } else if (!wantScrub && svcActive) {
      svcActive = false;
      svcSection.classList.remove("is-anim");
      if (svcTooth) svcTooth.style.transform = "";
      svcCards.forEach((c) => {
        c.style.opacity = "";
        c.style.transform = "";
        c.classList.remove("svc-done");
      });
      measure();
    }
  }

  /* =========================================================
     INIT
     ========================================================= */
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener(
    "resize",
    () => {
      evaluateServicesMode();
      measure();
      requestFrame();
    },
    { passive: true }
  );
  window.addEventListener("load", () => {
    measure();
    requestFrame();
  });
  evaluateServicesMode();
  measure();
  scrollFrame();
})();
