// ═══════════════════════════════════════════════════════════════
//  Memristor 3D Schematic — script.js v2.0
//  MoO₃ / ZnO Resistive Switching Stack
//  Three.js r128 · Theme-aware · Billboard labels · PPT export
// ═══════════════════════════════════════════════════════════════

'use strict';

/* ──────────────────────────────────────────────────────────────
   STATIC DATA
────────────────────────────────────────────────────────────── */

const STACK_W = 5.8;   // stack width  (X)
const STACK_D = 4.6;   // stack depth  (Z)

/** Layer definitions — bottom to top */
const LAYER_DEFS = [
  {
    name: 'Si',
    full: 'Silicon Substrate',
    desc: 'Mechanical base — 525 µm, p-type, 1–20 Ω·cm',
    process: 'Substrate (as-received)',
    color: 0x78909C, accent: '#78909C',
    metalness: 0.14, roughness: 0.82, height: 0.62,
  },
  {
    name: 'SiO₂',
    full: 'Silicon Dioxide',
    desc: 'Thermal oxide insulation — 300 nm',
    process: 'Thermal Oxidation',
    color: 0x90CAF9, accent: '#90CAF9',
    metalness: 0.04, roughness: 0.88, height: 0.22,
  },
  {
    name: 'Ti',
    full: 'Titanium Adhesion Layer',
    desc: 'Bonds Pt to SiO₂, prevents delamination — 10 nm',
    process: 'DC Magnetron Sputtering',
    color: 0x4A90D9, accent: '#4A90D9',
    metalness: 0.82, roughness: 0.35, height: 0.18,
  },
  {
    name: 'Pt',
    full: 'Platinum — Bottom Electrode',
    desc: 'Inert conductive base contact — 100 nm',
    process: 'DC Sputtered on Ti / 150 W / Ar',
    color: 0xC0CDD8, accent: '#C0CDD8',
    metalness: 0.97, roughness: 0.09, height: 0.13,
  },
  {
    name: 'ZnO',
    full: 'Zinc Oxide',
    desc: 'Intermediate n-type oxide — 200 nm',
    process: 'DC Sputtered on Pt / O₂+Ar',
    color: 0x00C9A7, accent: '#00C9A7',
    metalness: 0.18, roughness: 0.54, height: 0.28,
  },
  {
    name: 'MoO₃',
    full: 'Molybdenum Trioxide',
    desc: 'Active switching layer — O²⁻ vacancy drift — 150 nm',
    process: 'RF Sputtered on ZnO / 60 W / Ar+O₂',
    color: 0x7C3AED, accent: '#7C3AED',
    metalness: 0.28, roughness: 0.46, height: 0.58,
  },
];

/** Theme definitions — each controls 3D scene + CSS data-theme */
const THEMES = {
  'dark-neon': {
    label: 'Dark Blue / Neon',
    sceneBg: 0x07090f, fogColor: 0x07090f, fogDensity: 0.027,
    gridA: 0x1a2a4a,  gridB: 0x0c1525,
    ambient: 0.45, key: 1.80, keyColor: 0xffffff,
    fill: 0x4488ff,  fillInt: 0.50,
    rim:  0x6d28d9,  rimInt:  2.50,
    bounce: 0x1e3a8a, bounceInt: 1.20,
  },
  'pure-black': {
    label: 'Pure Black',
    sceneBg: 0x000000, fogColor: 0x000000, fogDensity: 0.020,
    gridA: 0x181818,  gridB: 0x080808,
    ambient: 0.40, key: 2.00, keyColor: 0xffffff,
    fill: 0x22cc88,  fillInt: 0.45,
    rim:  0x00aa55,  rimInt:  2.00,
    bounce: 0x001a0d, bounceInt: 0.80,
  },
  'gradient': {
    label: 'Deep Space Gradient',
    sceneBg: null,      fogColor: 0x0c0a24, fogDensity: 0.020,
    gridA: 0x1a1445,  gridB: 0x0b0922,
    ambient: 0.40, key: 1.60, keyColor: 0xddeeff,
    fill: 0x8844ff,  fillInt: 0.55,
    rim:  0xa855f7,  rimInt:  2.80,
    bounce: 0x200a44, bounceInt: 1.00,
  },
  'light-gray': {
    label: 'Light Gray',
    sceneBg: 0xe8ecf0, fogColor: 0xe8ecf0, fogDensity: 0.022,
    gridA: 0xaaaaaa,  gridB: 0xcccccc,
    ambient: 0.80, key: 1.20, keyColor: 0xffffff,
    fill: 0x88aadd,  fillInt: 0.40,
    rim:  0x4466aa,  rimInt:  0.90,
    bounce: 0xbbbbee, bounceInt: 0.60,
  },
  'white': {
    label: 'White / Presentation',
    sceneBg: 0xfafafa, fogColor: 0xfafafa, fogDensity: 0.018,
    gridA: 0xbbbbbb,  gridB: 0xdddddd,
    ambient: 0.92, key: 1.00, keyColor: 0xffffff,
    fill: 0x99aabb,  fillInt: 0.35,
    rim:  0x4488cc,  rimInt:  0.70,
    bounce: 0xddeeff, bounceInt: 0.50,
  },
};

/** Named camera presets */
const PRESETS = {
  iso:   { pos: [8,  6,    9],    target: [0, 1.1, 0] },
  front: { pos: [0,  2.5, 13],    target: [0, 1.1, 0] },
  side:  { pos: [13, 2.5,  0],    target: [0, 1.1, 0] },
  top:   { pos: [0, 17,    0.01], target: [0, 1.1, 0] },
};

/* ──────────────────────────────────────────────────────────────
   RENDERER
────────────────────────────────────────────────────────────── */
const canvas = document.getElementById('canvas');

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  preserveDrawingBuffer: true,  // required for canvas.toDataURL()
  alpha: true,                  // required for transparent PNG export
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;

/* ──────────────────────────────────────────────────────────────
   SCENE & CAMERA
────────────────────────────────────────────────────────────── */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07090f);
scene.fog = new THREE.FogExp2(0x07090f, 0.027);

const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
camera.position.set(...PRESETS.iso.pos);

/* ──────────────────────────────────────────────────────────────
   ORBIT CONTROLS
────────────────────────────────────────────────────────────── */
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target.set(...PRESETS.iso.target);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.55;
controls.minDistance = 3;
controls.maxDistance = 30;
controls.update();

/* ──────────────────────────────────────────────────────────────
   LIGHTS
────────────────────────────────────────────────────────────── */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
keyLight.position.set(8, 14, 8);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.near   = 0.5;
keyLight.shadow.camera.far    = 40;
keyLight.shadow.camera.left   = keyLight.shadow.camera.bottom = -10;
keyLight.shadow.camera.right  = keyLight.shadow.camera.top   = 10;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x4488ff, 0.5);
fillLight.position.set(-8, 5, -5);
scene.add(fillLight);

const rimLight = new THREE.PointLight(0x6d28d9, 2.5, 20);
rimLight.position.set(-5, 6, -6);
scene.add(rimLight);

const bounceLight = new THREE.PointLight(0x1e3a8a, 1.2, 14);
bounceLight.position.set(0, -2, 0);
scene.add(bounceLight);

/* ──────────────────────────────────────────────────────────────
   BUILD LAYER STACK
────────────────────────────────────────────────────────────── */
let yAccum = 0;
const layerMeshes = [];   // for raycasting
const labelData   = [];   // { el, rightPos, leftPos, mesh, index }

LAYER_DEFS.forEach((lyr, i) => {
  const geo = new THREE.BoxGeometry(STACK_W, lyr.height, STACK_D);
  const mat = new THREE.MeshStandardMaterial({
    color:     lyr.color,
    metalness: lyr.metalness,
    roughness: lyr.roughness,
    envMapIntensity: 0.6,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(0, yAccum + lyr.height / 2, 0);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData = { ...lyr, layerIndex: i };
  scene.add(mesh);
  layerMeshes.push(mesh);

  // Label anchor points: right side (+X) and left side (-X)
  const midY       = yAccum + lyr.height / 2;
  const OFFSET     = STACK_W / 2 + 0.55;
  const rightPos   = new THREE.Vector3( OFFSET, midY, 0);
  const leftPos    = new THREE.Vector3(-OFFSET, midY, 0);

  // HTML label element (color-coded to layer accent)
  const el = document.createElement('div');
  el.className = 'lbl';
  el.innerHTML =
    `<div class="lbl-dot" style="background:${lyr.accent}"></div>` +
    `<div class="lbl-box" style="border-color:${lyr.accent}55;color:${lyr.accent}">${lyr.name}</div>`;
  document.getElementById('labels-container').appendChild(el);

  labelData.push({ el, rightPos, leftPos, mesh, index: i });
  yAccum += lyr.height;
});

/* ──────────────────────────────────────────────────────────────
   PT TOP ELECTRODES — 5×4 cylindrical grid
────────────────────────────────────────────────────────────── */
const ptTopY    = yAccum;
const COLS = 5, ROWS = 4;
const xSpan     = STACK_W - 1.4;
const zSpan     = STACK_D - 1.2;
const xStep     = xSpan / (COLS - 1);
const zStep     = zSpan / (ROWS - 1);

const cylGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.30, 40);
const cylMat = new THREE.MeshStandardMaterial({ color: 0xd8e0ea, metalness: 0.97, roughness: 0.09 });

const topGroup = new THREE.Group();
topGroup.position.y = ptTopY;
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    const cyl = new THREE.Mesh(cylGeo, cylMat);
    cyl.position.set(-xSpan / 2 + c * xStep, 0.15, -zSpan / 2 + r * zStep);
    cyl.castShadow = false;   // no shadow on MoO₃ surface
    cyl.receiveShadow = false;
    topGroup.add(cyl);
  }
}
scene.add(topGroup);

// Label for top electrodes
{
  const topMidY  = ptTopY + 0.15;
  const OFFSET   = STACK_W / 2 + 0.55;
  const el       = document.createElement('div');
  el.className   = 'lbl';
  el.innerHTML   =
    `<div class="lbl-dot" style="background:#C8D5E5"></div>` +
    `<div class="lbl-box" style="border-color:#C8D5E555;color:#C8D5E5">Pt (Top)</div>`;
  document.getElementById('labels-container').appendChild(el);
  labelData.push({
    el,
    rightPos: new THREE.Vector3( OFFSET, topMidY, 0),
    leftPos:  new THREE.Vector3(-OFFSET, topMidY, 0),
    mesh: null,
    index: LAYER_DEFS.length,
  });
}

/* ──────────────────────────────────────────────────────────────
   FLOOR GRID & GLOW PLANE
────────────────────────────────────────────────────────────── */
let floorGrid = buildGrid(0x1a2a4a, 0x0c1525);
scene.add(floorGrid);

function buildGrid(c1, c2) {
  const g = new THREE.GridHelper(40, 40, c1, c2);
  g.position.y = -0.01;
  return g;
}

const glowGeo = new THREE.PlaneGeometry(STACK_W + 2, STACK_D + 2);
const glowMat = new THREE.MeshBasicMaterial({ color: 0x3b4fd4, transparent: true, opacity: 0.07 });
const glowPlane = new THREE.Mesh(glowGeo, glowMat);
glowPlane.rotation.x = -Math.PI / 2;
glowPlane.position.y = 0.005;
scene.add(glowPlane);

/* ──────────────────────────────────────────────────────────────
   FABRICATION PANEL — dynamic step list
────────────────────────────────────────────────────────────── */
const fabStepsEl = document.getElementById('fab-steps');

function buildFabPanel() {
  fabStepsEl.innerHTML = '';

  LAYER_DEFS.forEach((lyr, i) => {
    const step = document.createElement('div');
    step.className = 'step';
    step.dataset.index = i;
    step.innerHTML =
      `<div class="step-dot" style="background:${lyr.accent};color:${lyr.accent}"></div>` +
      `<div class="step-text"><b>${lyr.full}</b><span>${lyr.process}</span></div>`;
    step.addEventListener('click', () => pulseLayer(i));
    fabStepsEl.appendChild(step);
  });

  // Pt top electrodes row
  const stepTop = document.createElement('div');
  stepTop.className = 'step';
  stepTop.dataset.index = LAYER_DEFS.length;
  stepTop.innerHTML =
    `<div class="step-dot" style="background:#C8D5E5;color:#C8D5E5"></div>` +
    `<div class="step-text"><b>Pt — Top Electrodes</b><span>DC Sputtered · 5×4 grid array</span></div>`;
  fabStepsEl.appendChild(stepTop);
}

buildFabPanel();

/* ──────────────────────────────────────────────────────────────
   RAYCASTING / HOVER INTERACTION
────────────────────────────────────────────────────────────── */
const raycaster    = new THREE.Raycaster();
const mouseNDC     = new THREE.Vector2();
const tooltipEl    = document.getElementById('tooltip');
let   hoveredMesh  = null;
let   autoTimer    = null;
let   autoEnabled  = true;   // user's preference for auto-rotate

window.addEventListener('mousemove', onMouseMove);

function onMouseMove(e) {
  mouseNDC.x =  (e.clientX / innerWidth)  * 2 - 1;
  mouseNDC.y = -(e.clientY / innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouseNDC, camera);
  const hits = raycaster.intersectObjects(layerMeshes);

  if (hits.length > 0) {
    const hit = hits[0];
    const lyr = hit.object.userData;

    if (hoveredMesh !== hit.object) {
      if (hoveredMesh) hoveredMesh.material.emissive.setHex(0x000000);
      hoveredMesh = hit.object;
      hoveredMesh.material.emissive.setHex(0x181830);
      highlightFabStep(lyr.layerIndex);
    }

    tooltipEl.style.display = 'block';
    tooltipEl.style.left    = (e.clientX + 16) + 'px';
    tooltipEl.style.top     = (e.clientY - 12) + 'px';
    tooltipEl.innerHTML     =
      `<div class="tt-name">${lyr.full}</div>` +
      `<div class="tt-desc">${lyr.desc}</div>` +
      `<div class="tt-badge">${lyr.process}</div>`;

    // Pause rotation while inspecting
    controls.autoRotate = false;
    clearTimeout(autoTimer);

  } else {
    if (hoveredMesh) {
      hoveredMesh.material.emissive.setHex(0x000000);
      hoveredMesh = null;
      highlightFabStep(null);
    }
    tooltipEl.style.display = 'none';
    clearTimeout(autoTimer);
    autoTimer = setTimeout(() => { if (autoEnabled) controls.autoRotate = true; }, 2500);
  }
}

renderer.domElement.addEventListener('pointerdown', () => {
  controls.autoRotate = false;
  clearTimeout(autoTimer);
});
renderer.domElement.addEventListener('pointerup', () => {
  autoTimer = setTimeout(() => { if (autoEnabled) controls.autoRotate = true; }, 3000);
});

function highlightFabStep(index) {
  document.querySelectorAll('.step').forEach((s, i) => {
    s.classList.toggle('active', i === index);
  });
}

/** Brief emissive pulse on a layer when clicked in fab panel */
function pulseLayer(index) {
  const mesh = layerMeshes[index];
  if (!mesh) return;
  mesh.material.emissive.setHex(0x2a2060);
  setTimeout(() => mesh.material.emissive.setHex(0x000000), 550);
  highlightFabStep(index);
}

/* ──────────────────────────────────────────────────────────────
   LABEL SYSTEM
   ──
   Strategy:
   1. Project each label's 3D anchor (right or left side, chosen
      by camera X position) to 2D screen coordinates.
   2. Run a 1-D collision avoidance pass in Y to separate overlapping
      labels (common when viewed from top or steep angle).
   3. Place the HTML label box at the adjusted position.
   4. Draw an SVG dashed connector from the raw 3D projected point
      to the displaced label position whenever they differ.
   5. Hide labels that are behind the camera or far off-screen.
────────────────────────────────────────────────────────────── */
const _v3          = new THREE.Vector3();
const labelSvgEl   = document.getElementById('label-svg');
const MIN_SPACING  = 24;   // px minimum vertical gap between labels
const SIDE_MARGIN  = 55;   // px — hide labels too close to viewport edge
let   labelsVisible = true;

function updateLabels() {
  if (!labelsVisible) { labelSvgEl.innerHTML = ''; return; }

  // Which side labels appear: match the visible edge of the stack
  const side = camera.position.x >= 0 ? 1 : -1;  // 1 = right, -1 = left
  const GAP  = 8;   // px gap between anchor dot and label box

  const proj = [];   // { el, origX, origY, adjY, side, visible }

  // ── Step 1: Project each anchor to screen ───────────────────
  labelData.forEach(({ el, rightPos, leftPos }) => {
    const anchor = side === 1 ? rightPos : leftPos;
    _v3.copy(anchor).project(camera);

    const sx = ((_v3.x + 1) * 0.5) * window.innerWidth;
    const sy = ((-_v3.y + 1) * 0.5) * window.innerHeight;

    const behind  = _v3.z > 1.0;
    const offEdge = sx < SIDE_MARGIN || sx > window.innerWidth - SIDE_MARGIN
                 || sy < 54 || sy > window.innerHeight - 48;

    proj.push({ el, origX: sx, origY: sy, adjY: sy, side, visible: !behind && !offEdge });
  });

  // ── Step 2: Collision avoidance — sort by Y, push apart ─────
  const vis = proj.filter(p => p.visible);
  vis.sort((a, b) => a.origY - b.origY);
  for (let i = 1; i < vis.length; i++) {
    const prev = vis[i - 1];
    const curr = vis[i];
    if (curr.adjY - prev.adjY < MIN_SPACING) curr.adjY = prev.adjY + MIN_SPACING;
  }

  // ── Step 3: Apply positions + always-visible SVG connectors ─
  const svgContent = [];

  proj.forEach(p => {
    if (!p.visible) { p.el.style.opacity = '0'; return; }

    p.el.style.opacity = '1';

    const lx  = p.origX.toFixed(1);
    const ly  = p.origY.toFixed(1);

    if (p.side === 1) {
      // Label to the right of anchor
      p.el.style.left      = (p.origX + GAP) + 'px';
      p.el.style.top       = p.adjY + 'px';
      p.el.style.transform = 'translateY(-50%)';
      p.el.classList.remove('lbl-left');

      // Connector: dot at 3D anchor → diagonal to label
      const lx2 = (p.origX + GAP).toFixed(1);
      const ly2 = p.adjY.toFixed(1);
      svgContent.push(
        `<circle cx="${lx}" cy="${ly}" r="2.5" style="fill:var(--connector);opacity:0.85"/>`,
        `<line x1="${lx}" y1="${ly}" x2="${lx2}" y2="${ly2}" ` +
          `style="stroke:var(--connector);stroke-width:1.2;stroke-dasharray:3,2;opacity:0.65"/>`
      );
    } else {
      // Label to the left of anchor
      p.el.style.left      = (p.origX - GAP) + 'px';
      p.el.style.top       = p.adjY + 'px';
      p.el.style.transform = 'translateX(-100%) translateY(-50%)';
      p.el.classList.add('lbl-left');

      const lx2 = (p.origX - GAP).toFixed(1);
      const ly2 = p.adjY.toFixed(1);
      svgContent.push(
        `<circle cx="${lx}" cy="${ly}" r="2.5" style="fill:var(--connector);opacity:0.85"/>`,
        `<line x1="${lx}" y1="${ly}" x2="${lx2}" y2="${ly2}" ` +
          `style="stroke:var(--connector);stroke-width:1.2;stroke-dasharray:3,2;opacity:0.65"/>`
      );
    }
  });

  labelSvgEl.innerHTML = svgContent.join('');
}

/* ──────────────────────────────────────────────────────────────
   THEME SYSTEM
────────────────────────────────────────────────────────────── */
let currentThemeKey = 'dark-neon';

function applyTheme(key) {
  const T = THEMES[key];
  if (!T) return;
  currentThemeKey = key;

  // CSS custom-property theme
  document.documentElement.setAttribute('data-theme', key);

  // 3D scene background (null = transparent for gradient theme)
  if (T.sceneBg === null) {
    scene.background = null;
    renderer.setClearColor(0x000000, 0);
  } else {
    scene.background = new THREE.Color(T.sceneBg);
    renderer.setClearColor(T.sceneBg, 1);
  }
  scene.fog.color.setHex(T.fogColor);
  scene.fog.density = T.fogDensity;

  // Lights
  ambientLight.intensity  = T.ambient;
  keyLight.color.setHex(T.keyColor);
  keyLight.intensity      = T.key;
  fillLight.color.setHex(T.fill);
  fillLight.intensity     = T.fillInt;
  rimLight.color.setHex(T.rim);
  rimLight.intensity      = T.rimInt;
  bounceLight.color.setHex(T.bounce);
  bounceLight.intensity   = T.bounceInt;

  // Rebuild floor grid with theme colors
  scene.remove(floorGrid);
  floorGrid = buildGrid(T.gridA, T.gridB);
  scene.add(floorGrid);

  // Glow plane color for light themes
  const isLight = key === 'white' || key === 'light-gray';
  glowMat.color.setHex(isLight ? 0x6688cc : 0x3b4fd4);
  glowMat.opacity = isLight ? 0.04 : 0.07;

  // Update active state on dropdown buttons
  document.querySelectorAll('.theme-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === key);
  });
}

// Theme dropdown
const themeBtn  = document.getElementById('theme-btn');
const themeMenu = document.getElementById('theme-menu');

themeBtn.addEventListener('click', e => {
  e.stopPropagation();
  const wasOpen = themeMenu.classList.contains('open');
  closeAllMenus();
  if (!wasOpen) openMenu(themeMenu, themeBtn);
});

document.querySelectorAll('.theme-item').forEach(btn => {
  btn.addEventListener('click', () => {
    applyTheme(btn.dataset.theme);
    closeAllMenus();
    showToast('Theme: ' + (THEMES[btn.dataset.theme]?.label || btn.dataset.theme));
  });
});

/* ──────────────────────────────────────────────────────────────
   EXPORT SYSTEM
────────────────────────────────────────────────────────────── */
const exportBtn  = document.getElementById('export-btn');
const exportMenu = document.getElementById('export-menu');

exportBtn.addEventListener('click', e => {
  e.stopPropagation();
  const wasOpen = exportMenu.classList.contains('open');
  closeAllMenus();
  if (!wasOpen) openMenu(exportMenu, exportBtn);
});

document.querySelectorAll('.dl-item').forEach(btn => {
  btn.addEventListener('click', () => {
    closeAllMenus();
    handleExport(btn.dataset.type);
  });
});

function handleExport(type) {
  switch (type) {
    case 'png':        captureImage(false, 1); break;
    case 'png-hd':     captureImage(false, 2); break;
    case 'png-transp': captureImage(true,  1); break;
    case 'webm':       startVideoCapture();    break;
  }
}

/**
 * Capture the current 3D view as PNG.
 * @param {boolean} transparent — use transparent background
 * @param {number}  scale       — pixel multiplier (1 = normal, 2 = HD)
 */
function captureImage(transparent, scale) {
  const W = Math.round(window.innerWidth  * scale);
  const H = Math.round(window.innerHeight * scale);

  // Upscale renderer pixel buffer without changing CSS layout
  renderer.setSize(W, H, false);
  camera.aspect = W / H;
  camera.updateProjectionMatrix();

  // Save current background state
  const savedBg    = scene.background;
  const savedFog   = scene.fog.density;

  if (transparent) {
    scene.background = null;
    renderer.setClearColor(0x000000, 0);
  } else if (scene.background === null) {
    // Gradient theme: provide solid fallback for non-transparent export
    scene.background = new THREE.Color(0x0c0a24);
    renderer.setClearColor(0x0c0a24, 1);
  }

  renderer.render(scene, camera);
  const dataURL = canvas.toDataURL('image/png');

  // Restore scene state
  scene.background = savedBg;
  if (savedBg === null) {
    renderer.setClearColor(0x000000, 0);
  } else {
    renderer.setClearColor(savedBg.getHex(), 1);
  }

  // Restore renderer size
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  const suffix = transparent ? '-transparent' : scale > 1 ? '-hd' : '';
  triggerDownload(dataURL, `memristor${suffix}.png`);
  showToast(transparent ? 'Transparent PNG saved!' : scale > 1 ? 'HD PNG saved!' : 'PNG saved!');
}

/** WebM video capture — 5s auto-rotating clip */
let mediaRecorder   = null;
let recordedChunks  = [];
const recIndicator  = document.getElementById('rec-indicator');

function startVideoCapture() {
  if (mediaRecorder?.state === 'recording') return;

  try {
    const stream   = canvas.captureStream(30);
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';

    mediaRecorder  = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000 });
    recordedChunks = [];

    mediaRecorder.ondataavailable = e => { if (e.data.size > 0) recordedChunks.push(e.data); };
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = 'memristor-rotation.webm';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      recIndicator.classList.remove('active');
      controls.autoRotate = autoEnabled ? true : false;
      showToast('WebM video saved!');
    };

    // Ensure auto-rotate is on during recording
    const wasAuto = controls.autoRotate;
    controls.autoRotate = true;

    mediaRecorder.start();
    recIndicator.classList.add('active');

    setTimeout(() => {
      if (mediaRecorder?.state === 'recording') mediaRecorder.stop();
    }, 5000);

  } catch (err) {
    showToast('Video download not supported in this browser');
  }
}

function triggerDownload(url, filename) {
  const a       = document.createElement('a');
  a.href        = url;
  a.download    = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/* ──────────────────────────────────────────────────────────────
   PRESENTATION MODE
────────────────────────────────────────────────────────────── */
const pptBtn   = document.getElementById('ppt-btn');
const pptLabel = document.getElementById('ppt-label');
let   pptMode  = false;

pptBtn.addEventListener('click', () => {
  pptMode = !pptMode;
  document.body.classList.toggle('ppt-mode', pptMode);
  pptBtn.classList.toggle('active', pptMode);
  pptLabel.textContent = pptMode ? 'Exit' : 'Present';
  showToast(pptMode ? 'Presentation Mode — panel hidden' : 'Normal Mode');
});

/* ──────────────────────────────────────────────────────────────
   SIDEBAR TOGGLE
────────────────────────────────────────────────────────────── */
const sidebarBtn = document.getElementById('sidebar-toggle');
const fabPanel   = document.getElementById('fab-panel');
let   panelVisible = true;

sidebarBtn.addEventListener('click', () => {
  panelVisible = !panelVisible;
  fabPanel.classList.toggle('hidden', !panelVisible);
  sidebarBtn.textContent = panelVisible ? 'Hide Panel' : 'Show Panel';
  sidebarBtn.classList.toggle('active', !panelVisible);
  updateCameraViewOffset();
});

/* ──────────────────────────────────────────────────────────────
   CAMERA VIEW OFFSET — center scene in visible area (right of panel)
────────────────────────────────────────────────────────────── */
const FAB_PANEL_RIGHT = 237; // px: left(17) + width(220)

function updateCameraViewOffset() {
  const W = window.innerWidth;
  const H = window.innerHeight;
  if (panelVisible) {
    camera.setViewOffset(W, H, -FAB_PANEL_RIGHT / 2, 0, W, H);
  } else {
    camera.aspect = W / H;
    camera.clearViewOffset();
  }
}

updateCameraViewOffset();

/* ──────────────────────────────────────────────────────────────
   LABELS TOGGLE
────────────────────────────────────────────────────────────── */
const labelsToggleBtn = document.getElementById('labels-toggle');

labelsToggleBtn.addEventListener('click', () => {
  labelsVisible = !labelsVisible;
  const labelsContainer = document.getElementById('labels-container');
  labelsContainer.style.opacity = labelsVisible ? '1' : '0';
  if (!labelsVisible) labelSvgEl.innerHTML = '';   // clear SVG lines too
  labelsToggleBtn.textContent = `Labels: ${labelsVisible ? 'ON' : 'OFF'}`;
  labelsToggleBtn.classList.toggle('active', labelsVisible);
});

/* ──────────────────────────────────────────────────────────────
   GRID TOGGLE
────────────────────────────────────────────────────────────── */
const gridToggleBtn = document.getElementById('grid-toggle');
let   gridVisible   = true;

gridToggleBtn.addEventListener('click', () => {
  gridVisible = !gridVisible;
  floorGrid.visible = gridVisible;
  gridToggleBtn.textContent = `Grid: ${gridVisible ? 'ON' : 'OFF'}`;
  gridToggleBtn.classList.toggle('active', gridVisible);
});

/* ──────────────────────────────────────────────────────────────
   LAYER COLOR PICKER
────────────────────────────────────────────────────────────── */
const colorsBtn  = document.getElementById('colors-btn');
const colorsMenu = document.getElementById('colors-menu');

/** All 7 picker entries: 6 standard layers + Pt top */
const COLOR_ENTRIES = [
  ...LAYER_DEFS.map((l, i) => ({ name: l.name, accent: l.accent, idx: i })),
  { name: 'Pt (Top)', accent: '#C8D5E5', idx: LAYER_DEFS.length },
];

function buildColorMenu() {
  colorsMenu.innerHTML = '';
  COLOR_ENTRIES.forEach(entry => {
    const row = document.createElement('div');
    row.className = 'color-row';
    row.dataset.idx = entry.idx;
    row.innerHTML =
      `<div class="color-indicator" style="background:${entry.accent}"></div>` +
      `<span class="color-name">${entry.name}</span>` +
      `<input type="color" class="color-input" value="${entry.accent}">`;

    row.querySelector('.color-input').addEventListener('input', e => {
      const hex = e.target.value;
      updateLayerColor(entry.idx, hex);
      row.querySelector('.color-indicator').style.background = hex;
      entry.accent = hex;   // keep entry in sync for re-renders
    });

    colorsMenu.appendChild(row);
  });
}

buildColorMenu();

/**
 * Apply a new color to a layer: updates 3D material, label, fab dot.
 * idx < LAYER_DEFS.length → standard layer mesh
 * idx === LAYER_DEFS.length → Pt top cylinders
 */
function updateLayerColor(idx, hexStr) {
  const threeHex = parseInt(hexStr.replace('#', ''), 16);

  if (idx < LAYER_DEFS.length) {
    // Standard layer
    layerMeshes[idx].material.color.setHex(threeHex);
    LAYER_DEFS[idx].accent = hexStr;

    // Update HTML label
    const ld = labelData[idx];
    if (ld) {
      const dot = ld.el.querySelector('.lbl-dot');
      const box = ld.el.querySelector('.lbl-box');
      if (dot) dot.style.background = hexStr;
      if (box) { box.style.color = hexStr; box.style.borderColor = hexStr + '55'; }
    }

    // Update fab panel step dot
    const steps = fabStepsEl.querySelectorAll('.step');
    if (steps[idx]) steps[idx].querySelector('.step-dot').style.background = hexStr;

  } else {
    // Pt top electrodes
    cylMat.color.setHex(threeHex);
    const ld = labelData[LAYER_DEFS.length];
    if (ld) {
      const dot = ld.el.querySelector('.lbl-dot');
      const box = ld.el.querySelector('.lbl-box');
      if (dot) dot.style.background = hexStr;
      if (box) { box.style.color = hexStr; box.style.borderColor = hexStr + '55'; }
    }
  }
}

colorsBtn.addEventListener('click', e => {
  e.stopPropagation();
  const wasOpen = colorsMenu.classList.contains('open');
  closeAllMenus();
  if (!wasOpen) openMenu(colorsMenu, colorsBtn);
});

/* ──────────────────────────────────────────────────────────────
   PRESET CAMERA VIEWS — smooth animated transitions
────────────────────────────────────────────────────────────── */
document.querySelectorAll('.view-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const p = PRESETS[btn.dataset.preset];
    if (p) animateCameraTo(p.pos, p.target);
  });
});

document.getElementById('reset-btn').addEventListener('click', () => {
  animateCameraTo(PRESETS.iso.pos, PRESETS.iso.target);
});

function animateCameraTo(targetPos, targetLook, duration = 950) {
  const startPos    = camera.position.clone();
  const startTarget = controls.target.clone();
  const endPos      = new THREE.Vector3(...targetPos);
  const endTarget   = new THREE.Vector3(...targetLook);
  const t0          = performance.now();

  controls.autoRotate = false;
  clearTimeout(autoTimer);

  function tick(now) {
    const t    = Math.min((now - t0) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);   // cubic ease-out

    camera.position.lerpVectors(startPos, endPos, ease);
    controls.target.lerpVectors(startTarget, endTarget, ease);
    controls.update();

    if (t < 1) {
      requestAnimationFrame(tick);
    } else if (autoEnabled) {
      autoTimer = setTimeout(() => { controls.autoRotate = true; }, 2000);
    }
  }
  requestAnimationFrame(tick);
}

/* ──────────────────────────────────────────────────────────────
   AUTO-ROTATE TOGGLE
────────────────────────────────────────────────────────────── */
const autoRotateBtn = document.getElementById('autorotate-toggle');

autoRotateBtn.addEventListener('click', () => {
  autoEnabled = !autoEnabled;
  controls.autoRotate = autoEnabled;
  clearTimeout(autoTimer);
  autoRotateBtn.textContent = `Auto-rotate: ${autoEnabled ? 'ON' : 'OFF'}`;
  autoRotateBtn.classList.toggle('active', autoEnabled);
});

/* ──────────────────────────────────────────────────────────────
   DROPDOWN UTILITIES
────────────────────────────────────────────────────────────── */
function openMenu(menuEl, btnEl) {
  menuEl.classList.add('open');
  btnEl.setAttribute('aria-expanded', 'true');
}

function closeAllMenus() {
  document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('open'));
  document.querySelectorAll('[aria-expanded]').forEach(b => b.setAttribute('aria-expanded', 'false'));
}

document.addEventListener('click', closeAllMenus);

/* ──────────────────────────────────────────────────────────────
   TOAST NOTIFICATION
────────────────────────────────────────────────────────────── */
const toastEl   = document.getElementById('toast');
let   toastTimer;

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
}

/* ──────────────────────────────────────────────────────────────
   RENDER LOOP
────────────────────────────────────────────────────────────── */
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  // Subtle rim-light pulse (uses current theme's rimInt as base)
  const T = THEMES[currentThemeKey];
  rimLight.intensity = T.rimInt * (1 + Math.sin(t * 0.85) * 0.11);

  controls.update();
  renderer.render(scene, camera);
  updateLabels();
}

animate();

/* ──────────────────────────────────────────────────────────────
   RESIZE HANDLER
────────────────────────────────────────────────────────────── */
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  updateCameraViewOffset();
});
