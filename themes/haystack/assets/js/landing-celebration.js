const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const rand = (min, max) => min + Math.random() * (max - min);
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const githubStarPath = new Path2D(
  "M14 6l-4.9-.64L7 1 4.9 5.36 0 6l3.6 3.26L2.67 14 7 11.67 11.33 14l-.93-4.74L14 6z"
);

const drawGithubStar = (ctx, x, y, sizePx, rot = 0) => {
  const scale = Math.max(0.01, sizePx / 16);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(scale, scale);
  ctx.translate(-7, -8);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.fillStyle = "#eac550";
  ctx.fill(githubStarPath);
  ctx.strokeStyle = "#2b2f55";
  ctx.lineWidth = 0.35 / scale;
  ctx.stroke(githubStarPath);
  ctx.restore();
};

const drawLabel = (ctx, text, x, y, fontPx, rot) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.font = `900 ${fontPx}px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.lineWidth = clamp(fontPx * 0.08, 1.25, 3);
  ctx.strokeStyle = "rgba(43, 47, 85, 0.55)";
  ctx.strokeText(text, 0, 0);
  ctx.fillStyle = "#eac550";
  ctx.fillText(text, 0, 0);
  ctx.restore();
};

export const landingCelebration = () => {
  if (prefersReducedMotion()) return;

  const canvas = document.querySelector("[data-landing-celebration-canvas]");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const EMISSION_DURATION_MS = 10000;
  const POST_EMISSION_FADE_MS = 9000;
  const STAR_EMIT_PER_SECOND = 24;
  const LABEL_EMIT_PER_SECOND = 1.8;

  /** @type {Array<any>} */
  let particles = [];
  let raf = null;
  let lastTs = 0;
  let wCss = 0;
  let hCss = 0;
  let dpr = 1;
  /** @type {number | null} */
  let emissionStartAt = null;
  /** @type {number | null} */
  let emissionEndAt = null;
  let pendingStarEmits = 0;
  let pendingLabelEmits = 0;
  let ro = null;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    dpr = clamp(window.devicePixelRatio || 1, 1, 2);
    wCss = Math.max(1, rect.width);
    hCss = Math.max(1, rect.height);

    canvas.width = Math.floor(wCss * dpr);
    canvas.height = Math.floor(hCss * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const spawnStar = ({ yMin, yMax } = {}) => ({
    kind: "star",
    x: rand(0, wCss),
    y: typeof yMin === "number" && typeof yMax === "number" ? rand(yMin, yMax) : rand(-72, -18),
    vx: rand(-0.12, 0.12),
    vy: rand(0.06, 0.14),
    r: rand(7.5, 12.5),
    rot: rand(-0.6, 0.6),
    vr: rand(-0.015, 0.015),
    fadeOutAt: rand(0.18, 1),
  });

  const spawnLabel = () => {
    const fontPx = clamp(Math.round(rand(24, 34)), 20, 44);
    return {
      kind: "label",
      text: "25k",
      x: rand(fontPx * 2, wCss - fontPx * 2),
      y: rand(-0.14 * hCss, -0.02 * hCss),
      vx: rand(-0.13, 0.13),
      vy: rand(0.1, 0.2),
      fontPx,
      rot: rand(-0.35, 0.35),
      vr: rand(-0.011, 0.011),
      fadeOutAt: rand(0.18, 1),
    };
  };

  const spawnFromTop = (dt) => {
    const frameScale = dt / 1000;
    pendingStarEmits += STAR_EMIT_PER_SECOND * frameScale;
    pendingLabelEmits += LABEL_EMIT_PER_SECOND * frameScale;

    while (pendingStarEmits >= 1) {
      particles.push(
        spawnStar({
          yMin: -0.16 * hCss,
          yMax: -0.02 * hCss,
        })
      );
      pendingStarEmits -= 1;
    }

    while (pendingLabelEmits >= 1) {
      particles.push(spawnLabel());
      pendingLabelEmits -= 1;
    }
  };

  const draw = (ts) => {
    const dt = lastTs ? ts - lastTs : 16;
    lastTs = ts;
    const now = performance.now();

    ctx.clearRect(0, 0, wCss, hCss);

    // Start emitting immediately from the top.
    if (emissionStartAt == null) {
      emissionStartAt = now;
    }

    const shouldEmit =
      emissionStartAt != null && now < emissionStartAt + EMISSION_DURATION_MS;

    if (shouldEmit) {
      spawnFromTop(dt);
    } else if (emissionStartAt != null && emissionEndAt == null) {
      emissionEndAt = emissionStartAt + EMISSION_DURATION_MS;
    }

    const postFadeProgress =
      emissionEndAt == null
        ? 0
        : clamp((now - emissionEndAt) / POST_EMISSION_FADE_MS, 0, 1);

    particles = particles.filter((p) => {
      const stillOnScreen = p.y <= hCss + 84;
      if (emissionEndAt == null) return stillOnScreen;
      return stillOnScreen && postFadeProgress <= p.fadeOutAt + 0.22;
    });

    for (const p of particles) {
      p.vy += 0.0003 * dt;
      p.vx *= Math.pow(0.9985, dt / 16);
      p.vy *= Math.pow(0.9996, dt / 16);
      const moveScale = dt / 18;
      p.x += p.vx * moveScale;
      p.y += p.vy * moveScale;
      p.rot += p.vr * moveScale;

      const fadeWindow = 0.22;
      const postFadeAlpha = clamp(
        (p.fadeOutAt - postFadeProgress + fadeWindow) / fadeWindow,
        0,
        1
      );
      ctx.globalAlpha = postFadeAlpha;
      if (p.kind === "label") {
        drawLabel(ctx, p.text, p.x, p.y, p.fontPx, p.rot);
      } else {
        drawGithubStar(ctx, p.x, p.y, p.r, p.rot);
      }
    }

    ctx.globalAlpha = 1;

    const fadeDone = emissionEndAt != null && postFadeProgress >= 1 && particles.length === 0;

    if (fadeDone) {
      particles = [];
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      if (ro) ro.disconnect();
    } else {
      raf = requestAnimationFrame(draw);
    }
  };

  resize();
  ro = new ResizeObserver(() => {
    resize();
  });
  ro.observe(canvas);

  window.addEventListener(
    "pageshow",
    () => {
      resize();
    },
    { passive: true }
  );

  raf = requestAnimationFrame(draw);

  // If hot-reloaded / navigated away, avoid leaking rAF in dev.
  window.addEventListener(
    "pagehide",
    () => {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      ro.disconnect();
    },
    { once: true }
  );
};
