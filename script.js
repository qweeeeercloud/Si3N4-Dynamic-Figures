import * as THREE from "./vendor/three.module.min.js";

const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

function initHeroCanvas() {
  const canvas = document.getElementById("heroCanvas");
  if (!canvas) return;

  const context = canvas.getContext("2d");
  if (!context) return;

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

    if (!reduceMotionQuery.matches) {
      drawScanningBand();
      drawPoints();
      state.frame += 1;
    }

    if (!document.hidden && !reduceMotionQuery.matches) {
      state.raf = window.requestAnimationFrame(render);
    }
  }

  function start() {
    window.cancelAnimationFrame(state.raf);
    render();
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

  reduceMotionQuery.addEventListener("change", start);
}

function createRoundedBoardGeometry(width, height, thickness, radius) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;

  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.032,
    bevelSegments: 7,
    curveSegments: 12
  });
  geometry.center();
  return geometry;
}

function addCopperPad(parent, radius, x, y) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, 0.012, 42),
    parent.userData.copperMaterial
  );
  mesh.position.set(x, y, 0.067);
  mesh.rotation.x = Math.PI / 2;
  parent.add(mesh);
  return mesh;
}

function initProductViewer() {
  const container = document.getElementById("productViewer");
  if (!container) return;

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
    powerPreference: "high-performance"
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0xffffff, 0);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(4.2, 3.75, 5.45);
  camera.lookAt(0, 0, 0);

  const ambient = new THREE.HemisphereLight(0xffffff, 0xd7e2e3, 2.4);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
  keyLight.position.set(4.2, 5.6, 6.5);
  scene.add(keyLight);

  const cyanLight = new THREE.PointLight(0x67c9d6, 4.5, 8);
  cyanLight.position.set(-3.8, 2.2, 2.6);
  scene.add(cyanLight);

  const board = new THREE.Group();
  board.userData.copperMaterial = new THREE.MeshStandardMaterial({
    color: 0xc9975d,
    metalness: 0.72,
    roughness: 0.28
  });

  const ceramicMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xf9fbfa,
    metalness: 0,
    roughness: 0.33,
    clearcoat: 0.42,
    clearcoatRoughness: 0.22
  });

  const boardGeometry = createRoundedBoardGeometry(5.45, 3.05, 0.085, 0.18);
  const ceramic = new THREE.Mesh(boardGeometry, ceramicMaterial);
  board.add(ceramic);

  const edgeGlow = new THREE.LineSegments(
    new THREE.EdgesGeometry(boardGeometry, 18),
    new THREE.LineBasicMaterial({
      color: 0x65c8d7,
      transparent: true,
      opacity: 0.5
    })
  );
  edgeGlow.scale.set(1.006, 1.006, 1.02);
  board.add(edgeGlow);

  [
    [-1.62, 0.82],
    [-0.54, 0.82],
    [0.54, 0.82],
    [1.62, 0.82],
    [-1.62, 0],
    [-0.54, 0],
    [0.54, 0],
    [1.62, 0],
    [-1.62, -0.82],
    [-0.54, -0.82],
    [0.54, -0.82],
    [1.62, -0.82]
  ].forEach(([x, y]) => addCopperPad(board, 0.145, x, y));

  board.rotation.set(-0.62, 0.22, -0.1);
  board.scale.setScalar(1.08);
  scene.add(board);

  const halo = new THREE.Mesh(
    new THREE.RingGeometry(2.85, 2.88, 96),
    new THREE.MeshBasicMaterial({
      color: 0x65c8d7,
      transparent: true,
      opacity: 0.24,
      side: THREE.DoubleSide
    })
  );
  halo.position.z = -0.34;
  scene.add(halo);

  const interaction = {
    dragging: false,
    pointerId: null,
    lastX: 0,
    lastY: 0,
    targetX: board.rotation.x,
    targetY: board.rotation.y,
    idleUntil: 0
  };

  function resize() {
    const { width, height } = container.getBoundingClientRect();
    const safeWidth = Math.max(1, Math.floor(width));
    const safeHeight = Math.max(1, Math.floor(height));
    renderer.setSize(safeWidth, safeHeight, false);
    camera.aspect = safeWidth / safeHeight;
    camera.updateProjectionMatrix();
  }

  function onPointerDown(event) {
    interaction.dragging = true;
    interaction.pointerId = event.pointerId;
    interaction.lastX = event.clientX;
    interaction.lastY = event.clientY;
    renderer.domElement.setPointerCapture(event.pointerId);
    container.classList.add("is-dragging");
  }

  function onPointerMove(event) {
    if (!interaction.dragging || event.pointerId !== interaction.pointerId) return;
    const deltaX = event.clientX - interaction.lastX;
    const deltaY = event.clientY - interaction.lastY;
    interaction.lastX = event.clientX;
    interaction.lastY = event.clientY;
    interaction.targetY += deltaX * 0.012;
    interaction.targetX += deltaY * 0.01;
    interaction.targetX = Math.max(-1.08, Math.min(0.92, interaction.targetX));
  }

  function stopDragging(event) {
    if (event.pointerId !== interaction.pointerId) return;
    interaction.dragging = false;
    interaction.pointerId = null;
    interaction.idleUntil = performance.now() + 1200;
    container.classList.remove("is-dragging");
  }

  renderer.domElement.addEventListener("pointerdown", onPointerDown);
  renderer.domElement.addEventListener("pointermove", onPointerMove);
  renderer.domElement.addEventListener("pointerup", stopDragging);
  renderer.domElement.addEventListener("pointercancel", stopDragging);

  resize();

  function animate(now) {
    if (!reduceMotionQuery.matches && !interaction.dragging && now > interaction.idleUntil) {
      interaction.targetY += 0.004;
      halo.rotation.z += 0.003;
    }

    board.rotation.x += (interaction.targetX - board.rotation.x) * 0.12;
    board.rotation.y += (interaction.targetY - board.rotation.y) * 0.12;
    board.rotation.z = -0.1 + Math.sin(now * 0.0012) * 0.025;
    board.position.y = reduceMotionQuery.matches ? 0 : Math.sin(now * 0.001) * 0.07;

    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resize);
  reduceMotionQuery.addEventListener("change", () => {
    interaction.idleUntil = performance.now() + 1200;
  });
  window.requestAnimationFrame(animate);
}

initHeroCanvas();
initProductViewer();
