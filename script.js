(function () {
  const canvas = document.getElementById("heroCanvas");
  if (!canvas) return;

  const context = canvas.getContext("2d");
  if (!context) return;

  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const state = {
    width: 0,
    height: 0,
    pixelRatio: 1,
    frame: 0,
    raf: 0,
    points: []
  };

  function resize() {
    const rect = canvas.getBoundingClientRect();
    state.width = Math.max(1, Math.floor(rect.width));
    state.height = Math.max(1, Math.floor(rect.height));
    state.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(state.width * state.pixelRatio);
    canvas.height = Math.floor(state.height * state.pixelRatio);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    context.setTransform(state.pixelRatio, 0, 0, state.pixelRatio, 0, 0);

    const pointCount = Math.max(24, Math.min(72, Math.floor(state.width / 18)));
    state.points = Array.from({ length: pointCount }, (_, index) => ({
      x: (index * 137) % state.width,
      y: (index * 89) % state.height,
      speed: 0.16 + (index % 7) * 0.025,
      size: 1 + (index % 3) * 0.55,
      phase: index * 0.37
    }));
  }

  function drawGrid() {
    const grid = 58;
    context.lineWidth = 1;
    context.strokeStyle = "rgba(35, 139, 141, 0.08)";

    for (let x = (state.frame * 0.08) % grid; x < state.width; x += grid) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, state.height);
      context.stroke();
    }

    for (let y = 0; y < state.height; y += grid) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(state.width, y);
      context.stroke();
    }
  }

  function drawScanningBand() {
    const bandWidth = Math.max(120, state.width * 0.16);
    const x = ((state.frame * 1.15) % (state.width + bandWidth * 2)) - bandWidth;
    const gradient = context.createLinearGradient(x, 0, x + bandWidth, 0);
    gradient.addColorStop(0, "rgba(101, 200, 215, 0)");
    gradient.addColorStop(0.5, "rgba(101, 200, 215, 0.16)");
    gradient.addColorStop(1, "rgba(101, 200, 215, 0)");

    context.save();
    context.translate(x, 0);
    context.transform(1, 0, -0.16, 1, 0, 0);
    context.fillStyle = gradient;
    context.fillRect(0, 0, bandWidth, state.height);
    context.restore();
  }

  function drawPoints() {
    for (const point of state.points) {
      point.x += point.speed;
      point.y += Math.sin(state.frame * 0.012 + point.phase) * 0.045;

      if (point.x > state.width + 4) point.x = -4;

      const alpha = 0.16 + Math.sin(state.frame * 0.025 + point.phase) * 0.06;
      context.fillStyle = `rgba(9, 102, 107, ${alpha})`;
      context.fillRect(point.x, point.y, point.size, point.size);
    }
  }

  function drawTraceLines() {
    const midY = state.height * 0.48;
    const startX = state.width * 0.53;
    context.lineWidth = 1.2;
    context.strokeStyle = "rgba(198, 141, 86, 0.18)";

    for (let i = 0; i < 5; i += 1) {
      const offset = i * 42;
      context.beginPath();
      context.moveTo(startX - offset, midY + i * 16);
      context.lineTo(startX + 90 - offset, midY + i * 16);
      context.lineTo(startX + 124 - offset, midY + 34 + i * 10);
      context.stroke();
    }
  }

  function render() {
    context.clearRect(0, 0, state.width, state.height);
    drawGrid();
    drawTraceLines();
    drawScanningBand();
    drawPoints();
    state.frame += 1;

    if (!document.hidden && !reduceMotionQuery.matches) {
      state.raf = window.requestAnimationFrame(render);
    }
  }

  function start() {
    window.cancelAnimationFrame(state.raf);
    if (reduceMotionQuery.matches) {
      context.clearRect(0, 0, state.width, state.height);
      drawGrid();
      drawTraceLines();
      return;
    }
    state.raf = window.requestAnimationFrame(render);
  }

  resize();
  start();

  window.addEventListener("resize", () => {
    resize();
    start();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.cancelAnimationFrame(state.raf);
    } else {
      start();
    }
  });

  if (typeof reduceMotionQuery.addEventListener === "function") {
    reduceMotionQuery.addEventListener("change", start);
  }
})();
