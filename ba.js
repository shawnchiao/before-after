// Before/after comparison sliders. Pointer + keyboard, no dependencies.
// The handle travels the full frame (including the gutter), so it can park
// outside the screenshot; the reveal clip clamps at the image edges.
// On first scroll into view the handle nudges left and right once, as a
// quiet hint that it can be dragged.
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

document.querySelectorAll("[data-ba]").forEach((ba) => {
  const frame = ba.querySelector(".ba-frame");
  const stage = ba.querySelector(".ba-stage");
  const handle = ba.querySelector(".ba-handle");
  let pos = 50; // % across the frame
  let interacted = false;
  let nudgeRaf = null;

  const render = () => {
    frame.style.setProperty("--pos", pos + "%");
    const f = frame.getBoundingClientRect();
    const s = stage.getBoundingClientRect();
    const x = f.left + (pos / 100) * f.width;
    const clip = Math.min(100, Math.max(0, ((x - s.left) / s.width) * 100));
    stage.style.setProperty("--clip", clip + "%");
    handle.setAttribute("aria-valuenow", Math.round(pos));
  };

  const setFromClientX = (clientX) => {
    const f = frame.getBoundingClientRect();
    pos = Math.min(100, Math.max(0, ((clientX - f.left) / f.width) * 100));
    render();
  };

  const stopNudge = () => {
    if (nudgeRaf) {
      cancelAnimationFrame(nudgeRaf);
      nudgeRaf = null;
    }
  };

  // One damped left-right sway around the center, then settle.
  const nudge = () => {
    const duration = 1500;
    let start = null;
    const tick = (now) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / duration);
      pos = 50 - 5 * Math.sin(2 * Math.PI * t) * (1 - t);
      render();
      nudgeRaf = t < 1 ? requestAnimationFrame(tick) : null;
    };
    nudgeRaf = requestAnimationFrame(tick);
  };

  let dragging = false;
  frame.addEventListener("pointerdown", (e) => {
    interacted = true;
    stopNudge();
    dragging = true;
    frame.setPointerCapture(e.pointerId);
    setFromClientX(e.clientX);
  });
  frame.addEventListener("pointermove", (e) => {
    if (dragging) setFromClientX(e.clientX);
  });
  const stop = () => (dragging = false);
  frame.addEventListener("pointerup", stop);
  frame.addEventListener("pointercancel", stop);

  handle.addEventListener("keydown", (e) => {
    const step = e.shiftKey ? 10 : 4;
    if (e.key === "ArrowLeft") pos = Math.max(0, pos - step);
    else if (e.key === "ArrowRight") pos = Math.min(100, pos + step);
    else if (e.key === "Home") pos = 0;
    else if (e.key === "End") pos = 100;
    else return;
    interacted = true;
    stopNudge();
    e.preventDefault();
    render();
  });

  let nudged = false;
  const maybeNudge = () => {
    if (nudged || interacted || reducedMotion.matches) return;
    const r = frame.getBoundingClientRect();
    const visible = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
    if (visible > r.height * 0.5) {
      nudged = true;
      window.removeEventListener("scroll", maybeNudge);
      setTimeout(() => {
        if (!interacted) nudge();
      }, 350);
    }
  };
  window.addEventListener("scroll", maybeNudge, { passive: true });
  maybeNudge();

  render();
});
