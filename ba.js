// Before/after comparison sliders. Pointer + keyboard, no dependencies.
document.querySelectorAll("[data-ba]").forEach((ba) => {
  const handle = ba.querySelector(".ba-handle");
  let pos = 50;

  const render = () => {
    ba.style.setProperty("--pos", pos + "%");
    handle.setAttribute("aria-valuenow", Math.round(pos));
  };

  const setFromClientX = (clientX) => {
    const rect = ba.getBoundingClientRect();
    pos = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    render();
  };

  let dragging = false;
  ba.addEventListener("pointerdown", (e) => {
    dragging = true;
    ba.setPointerCapture(e.pointerId);
    setFromClientX(e.clientX);
  });
  ba.addEventListener("pointermove", (e) => {
    if (dragging) setFromClientX(e.clientX);
  });
  const stop = () => (dragging = false);
  ba.addEventListener("pointerup", stop);
  ba.addEventListener("pointercancel", stop);

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
