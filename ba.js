// Before/after comparison sliders. Pointer + keyboard, no dependencies.
// The handle travels the full frame (including the gutter), so it can park
// outside the screenshot; the reveal clip clamps at the image edges.
document.querySelectorAll("[data-ba]").forEach((ba) => {
  const frame = ba.querySelector(".ba-frame");
  const stage = ba.querySelector(".ba-stage");
  const handle = ba.querySelector(".ba-handle");
  let pos = 50; // % across the frame

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

  let dragging = false;
  frame.addEventListener("pointerdown", (e) => {
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
    e.preventDefault();
    render();
  });

  render();
});
