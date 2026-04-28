const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const createCanvas = (hostEl) => {
  const canvas = document.createElement("canvas");
  canvas.className = "github-stars-fireworks-canvas";
  canvas.setAttribute("aria-hidden", "true");
  hostEl.appendChild(canvas);
  return canvas;
};

const resizeCanvasToHost = (canvas, hostEl) => {
  const rect = canvas.getBoundingClientRect();
  const dpr = clamp(window.devicePixelRatio || 1, 1, 2);

  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));

  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width: rect.width, height: rect.height };
};

const burst = ({
  x,
  y,
  particleCount = 28,
  speedScale = 1,
  lifeScale = 1,
  radiusScale = 1,
}) => {
  const colors = ["#eac550"];
  const parts = [];
  for (let i = 0; i < particleCount; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (0.55 + Math.random() * 1.25) * speedScale;
    parts.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (0.7 + Math.random() * 1.0) * speedScale,
      r: (1.1 + Math.random() * 2.2) * radiusScale,
      life: (1200 + Math.random() * 900) * lifeScale,
      born: performance.now(),
      color: colors[(Math.random() * colors.length) | 0],
    });
  }
  return parts;
};

const githubStarPath = new Path2D(
  "M14 6l-4.9-.64L7 1 4.9 5.36 0 6l3.6 3.26L2.67 14 7 11.67 11.33 14l-.93-4.74L14 6z"
);

const drawGithubStar = (ctx, x, y, sizePx) => {
  // Octicon `star-16` path uses a 14x16 viewBox; we scale uniformly.
  const scale = Math.max(0.01, sizePx / 16);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  // Center the viewBox around (0,0)
  ctx.translate(-7, -8);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.fill(githubStarPath);
  ctx.strokeStyle = "#2b2f55";
  // Keep stroke visually thin in CSS pixels even after `ctx.scale(scale, scale)`.
  ctx.lineWidth = 0.35 / scale;
  ctx.stroke(githubStarPath);
  ctx.restore();
};

export const githubStarsFireworks = () => {
  if (prefersReducedMotion()) return;

  const hero = document.querySelector(".index-hero");
  if (!hero) return;

  const attach = ({ hostEl, triggerEl }) => {
    if (!hostEl || !triggerEl) return;

    let raf = null;
    let canvas = null;
    let ctx = null;
    let particles = [];
    let lastTs = 0;
    let lastPointer = null;
    let isHovering = false;
    let lastEmitAt = 0;
    let lastEmitPointer = null;

    const cleanup = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      particles = [];
      ctx = null;
      isHovering = false;
      lastEmitAt = 0;
      lastEmitPointer = null;
      if (canvas) canvas.remove();
      canvas = null;
    };

    const ensureCanvas = () => {
      if (canvas && ctx) return;
      canvas = createCanvas(hostEl);
      const res = resizeCanvasToHost(canvas, hostEl);
      ctx = res.ctx;
      lastTs = 0;
    };

    const draw = (ts) => {
      if (!ctx || !canvas) return;
      const dt = lastTs ? ts - lastTs : 16;
      lastTs = ts;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const gravity = 0.0032 * dt;
      const drag = Math.pow(0.993, dt / 16);

      const now = performance.now();
      particles = particles.filter((p) => now - p.born < p.life);

      for (const p of particles) {
        p.vx *= drag;
        p.vy = p.vy * drag + gravity;
        p.x += p.vx * (dt / 16);
        p.y += p.vy * (dt / 16);

        const age = now - p.born;
        const t = clamp(age / p.life, 0, 1);
        const lifeAlpha = 1 - t;

        // Fade out earlier near the canvas edges so stars don't "hit" the rectangle bounds.
        const fadeMargin = Math.min(56, Math.min(w, h) * 0.22);
        const distToEdge = Math.min(p.x, p.y, w - p.x, h - p.y);
        const edgeAlpha = clamp(distToEdge / fadeMargin, 0, 1);

        ctx.globalAlpha = lifeAlpha * edgeAlpha;
        ctx.fillStyle = p.color;
        drawGithubStar(ctx, p.x, p.y, p.r * 4.4);
      }

      ctx.globalAlpha = 1;

      if (particles.length > 0) {
        raf = requestAnimationFrame(draw);
      } else {
        cleanup();
      }
    };

    const emitAtPointer = () => {
      ensureCanvas();
      if (!canvas || !ctx) return;

      const canvasRect = canvas.getBoundingClientRect();
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      const x = lastPointer
        ? clamp(lastPointer.x - canvasRect.left, 8, w - 8)
        : clamp(w * 0.5, 8, w - 8);
      const y = lastPointer
        ? clamp(lastPointer.y - canvasRect.top, 8, h - 8)
        : clamp(h * 0.5, 8, h - 8);

      particles.push(
        ...burst({
          x,
          y,
          particleCount: 10,
          speedScale: 0.85,
          lifeScale: 0.85,
          radiusScale: 0.9,
        })
      );

      if (!raf) {
        raf = requestAnimationFrame(draw);
      }
    };

    const onPointerMove = (e) => {
      lastPointer = { x: e.clientX, y: e.clientY };
      if (!isHovering) return;

      const now = performance.now();
      if (now - lastEmitAt < 130) return;

      if (lastEmitPointer) {
        const dx = lastPointer.x - lastEmitPointer.x;
        const dy = lastPointer.y - lastEmitPointer.y;
        if (dx * dx + dy * dy < 36) return; // ~6px movement
      }

      lastEmitAt = now;
      lastEmitPointer = { x: lastPointer.x, y: lastPointer.y };
      emitAtPointer();
    };

    const onPointerEnter = (e) => {
      lastPointer = { x: e.clientX, y: e.clientY };
      isHovering = true;
      lastEmitAt = 0;
      lastEmitPointer = { x: lastPointer.x, y: lastPointer.y };
      emitAtPointer();
    };

    const onPointerLeave = () => {
      isHovering = false;
      // Let remaining particles finish animating, then auto-cleanup.
    };

    triggerEl.addEventListener("mousemove", onPointerMove);
    triggerEl.addEventListener("mouseenter", onPointerEnter);
    triggerEl.addEventListener("mouseleave", onPointerLeave);
    hostEl.addEventListener("click", cleanup);
    window.addEventListener("blur", cleanup);
  };

  const githubBtn = hero.querySelector(
    'a.github-stars-btn[href*="github.com/deepset-ai/haystack"]'
  );
  if (githubBtn) {
    attach({
      hostEl: githubBtn,
      // Whole link: icon, "Stars", separator, and count share the same hover target.
      triggerEl: githubBtn,
    });
  }

};

