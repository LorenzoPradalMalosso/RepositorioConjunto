(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGSAP = typeof window.gsap !== "undefined";
  const hasScrollTrigger = typeof window.ScrollTrigger !== "undefined";
  const hasLenis = typeof window.Lenis !== "undefined" && !reducedMotion;
  const canTrackPointer = window.matchMedia("(pointer: fine)").matches && !reducedMotion;

  const docEl = document.documentElement;
  const body = document.body;

  if (!body) {
    return;
  }

  body.classList.add("has-js");

  const nodes = {
    header: document.querySelector("header"),
    title: document.querySelector("#recipe-title"),
    subtitle: document.querySelector("#recipe-subtitle"),
    imageSection: document.querySelector("#image-section"),
    image: document.querySelector("#recipe-image"),
    content: document.querySelector(".recipe-content"),
    printButton: document.querySelector("#print-button"),
    infoCards: Array.from(document.querySelectorAll(".info-card")),
    contentSections: Array.from(document.querySelectorAll(".recipe-content section")),
    ingredients: Array.from(document.querySelectorAll(".ingredients-list li")),
    steps: Array.from(document.querySelectorAll(".instructions-list li")),
    tips: Array.from(document.querySelectorAll("#tips-list li")),
    footer: document.querySelector("footer"),
  };

  const progressBar = createProgressBar();
  const scrollTopButton = createScrollTopButton();
  const lenis = createLenis();

  setInitialSpotlight();
  bindScrollState();
  bindSpotlight();
  initMotion();
  refreshTriggersOnAssetLoad();

  function setInitialSpotlight() {
    docEl.style.setProperty("--spot-x", "50%");
    docEl.style.setProperty("--spot-y", "12%");
  }

  function createProgressBar() {
    const bar = document.createElement("div");
    bar.id = "scroll-progress";
    bar.setAttribute("aria-hidden", "true");
    body.prepend(bar);
    return bar;
  }

  function createScrollTopButton() {
    const button = document.createElement("button");
    button.id = "scroll-to-top";
    button.type = "button";
    button.title = "Voltar ao topo";
    button.setAttribute("aria-label", "Voltar ao topo");
    button.textContent = "↑";

    button.addEventListener("click", () => {
      if (lenis && typeof lenis.scrollTo === "function") {
        lenis.scrollTo(0, { duration: 1.15 });
        return;
      }

      window.scrollTo({
        top: 0,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    });

    body.appendChild(button);
    return button;
  }

  function createLenis() {
    if (!hasLenis) {
      return null;
    }

    const instance = new window.Lenis({
      duration: 1.15,
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.4,
    });

    if (hasScrollTrigger) {
      instance.on("scroll", window.ScrollTrigger.update);
    }

    if (hasGSAP) {
      window.gsap.ticker.add((time) => {
        instance.raf(time * 1000);
      });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (time) => {
        instance.raf(time);
        requestAnimationFrame(raf);
      };

      requestAnimationFrame(raf);
    }

    return instance;
  }

  function bindScrollState() {
    const update = () => {
      const maxScroll = Math.max(docEl.scrollHeight - window.innerHeight, 0);
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;

      progressBar.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
      scrollTopButton.classList.toggle("is-visible", window.scrollY > 650);
    };

    if (lenis) {
      lenis.on("scroll", update);
    } else {
      window.addEventListener("scroll", update, { passive: true });
    }

    window.addEventListener("resize", update, { passive: true });
    update();
  }

  function bindSpotlight() {
    if (!canTrackPointer) {
      return;
    }

    const updateSpotlight = (event) => {
      docEl.style.setProperty("--spot-x", `${event.clientX}px`);
      docEl.style.setProperty("--spot-y", `${event.clientY}px`);
    };

    window.addEventListener("pointermove", updateSpotlight, { passive: true });
    window.addEventListener("pointerleave", setInitialSpotlight);
  }

  function initMotion() {
    if (reducedMotion || !hasGSAP) {
      return;
    }

    const { gsap } = window;
    const ScrollTrigger = window.ScrollTrigger;

    if (ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }

    const intro = gsap.timeline({
      defaults: {
        ease: "power3.out",
      },
    });

    if (nodes.header) {
      intro.from(nodes.header, {
        y: -48,
        opacity: 0,
        filter: "blur(12px)",
        duration: 0.95,
      });
    }

    if (nodes.title) {
      intro.from(nodes.title, {
        y: 22,
        opacity: 0,
        filter: "blur(10px)",
        duration: 0.8,
      }, "-=0.72");
    }

    if (nodes.subtitle) {
      intro.from(nodes.subtitle, {
        y: 18,
        opacity: 0,
        filter: "blur(8px)",
        duration: 0.7,
      }, "-=0.6");
    }

    if (nodes.infoCards.length) {
      intro.from(nodes.infoCards, {
        y: 34,
        opacity: 0,
        scale: 0.97,
        filter: "blur(10px)",
        duration: 0.75,
        stagger: 0.11,
      }, "-=0.45");
    }

    if (nodes.imageSection) {
      intro.from(nodes.imageSection, {
        y: 46,
        opacity: 0,
        scale: 0.985,
        duration: 0.9,
      }, "-=0.44");
    }

    if (nodes.image) {
      intro.from(nodes.image, {
        scale: 1.1,
        filter: "blur(12px)",
        duration: 1,
      }, "-=0.75");
    }

    if (nodes.content) {
      intro.from(nodes.content, {
        y: 36,
        opacity: 0,
        filter: "blur(10px)",
        duration: 0.85,
      }, "-=0.45");
    }

    if (nodes.printButton) {
      intro.from(nodes.printButton, {
        y: 16,
        opacity: 0,
        scale: 0.98,
        duration: 0.6,
      }, "-=0.35");
    }

    if (!ScrollTrigger) {
      return;
    }

    if (nodes.contentSections.length) {
      ScrollTrigger.batch(nodes.contentSections, {
        start: "top 82%",
        once: true,
        onEnter: (batch) => {
          gsap.from(batch, {
            y: 28,
            opacity: 0,
            filter: "blur(8px)",
            duration: 0.75,
            stagger: 0.12,
            ease: "power3.out",
          });
        },
      });
    }

    if (nodes.ingredients.length) {
      ScrollTrigger.batch(nodes.ingredients, {
        start: "top 90%",
        once: true,
        onEnter: (batch) => {
          gsap.from(batch, {
            x: -18,
            opacity: 0,
            filter: "blur(6px)",
            duration: 0.5,
            stagger: 0.045,
            ease: "power2.out",
          });
        },
      });
    }

    if (nodes.steps.length) {
      ScrollTrigger.batch(nodes.steps, {
        start: "top 90%",
        once: true,
        onEnter: (batch) => {
          gsap.from(batch, {
            x: -24,
            opacity: 0,
            filter: "blur(6px)",
            duration: 0.52,
            stagger: 0.055,
            ease: "power2.out",
          });
        },
      });

      nodes.steps.forEach((step) => {
        ScrollTrigger.create({
          trigger: step,
          start: "top 72%",
          end: "bottom 40%",
          toggleClass: { targets: step, className: "is-active-step" },
        });
      });
    }

    if (nodes.tips.length) {
      ScrollTrigger.batch(nodes.tips, {
        start: "top 90%",
        once: true,
        onEnter: (batch) => {
          gsap.from(batch, {
            y: 16,
            opacity: 0,
            filter: "blur(6px)",
            duration: 0.5,
            stagger: 0.05,
            ease: "power2.out",
          });
        },
      });
    }

    if (nodes.image && nodes.imageSection) {
      gsap.to(nodes.image, {
        yPercent: 8,
        scale: 1.08,
        ease: "none",
        scrollTrigger: {
          trigger: nodes.imageSection,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }

    if (nodes.footer) {
      ScrollTrigger.create({
        trigger: nodes.footer,
        start: "top 95%",
        once: true,
        onEnter: () => {
          gsap.fromTo(nodes.footer, {
            y: 24,
            opacity: 0,
          }, {
            y: 0,
            opacity: 1,
            duration: 0.75,
            ease: "power3.out",
          });
        },
      });
    }
  }

  function refreshTriggersOnAssetLoad() {
    const refresh = () => {
      if (hasScrollTrigger && window.ScrollTrigger) {
        window.ScrollTrigger.refresh();
      }
    };

    window.addEventListener("load", refresh, { once: true });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(refresh).catch(() => {});
    }

    if (nodes.image && !nodes.image.complete) {
      nodes.image.addEventListener("load", refresh, { once: true });
    }
  }
})();
