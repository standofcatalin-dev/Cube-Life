// ============================================================
// CUBE LIFE — Этап 17: Перемещаемые кнопки для телефона
// ============================================================

const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

const canvas = document.getElementById('game-canvas');
const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.Fog(0x87CEEB, 40, 100);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 500);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x5AAD3A, 0.4);
scene.add(hemiLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 0.9);
sunLight.position.set(30, 60, 20);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 1024;
sunLight.shadow.mapSize.height = 1024;
sunLight.shadow.camera.left = -30;
sunLight.shadow.camera.right = 30;
sunLight.shadow.camera.top = 30;
sunLight.shadow.camera.bottom = -30;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 100;
sunLight.shadow.bias = -0.0005;
scene.add(sunLight);

function lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + percent);
    const g = Math.min(255, ((num >> 8) & 0x00FF) + percent);
    const b = Math.min(255, (num & 0x0000FF) + percent);
    return `rgb(${r}, ${g}, ${b})`;
}
function darkenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) - percent);
    const g = Math.max(0, ((num >> 8) & 0x00FF) - percent);
    const b = Math.max(0, (num & 0x0000FF) - percent);
    return `rgb(${r}, ${g}, ${b})`;
}

function createTexture(baseColor, noiseAmount = 30, size = 64) {
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, size, size);
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const v = (Math.random() - 0.5) * noiseAmount;
        data[i] = Math.max(0, Math.min(255, data[i] + v));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + v));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + v));
    }
    ctx.putImageData(imageData, 0, 0);
    const tex = new THREE.CanvasTexture(c);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    return tex;
}

function createWoodTexture() {
    const size = 64;
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#6B4423';
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 12; i++) {
        const x = Math.random() * size;
        ctx.fillStyle = Math.random() > 0.5 ? '#5A3A1F' : '#8B6535';
        ctx.fillRect(x, 0, 1 + Math.random() * 2, size);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    return tex;
}

function createPlankTexture() {
    const size = 64;
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#A0703A';
    ctx.fillRect(0, 0, size, size);
    for (let y = 0; y < size; y += 16) {
        ctx.fillStyle = '#5A3A1F';
        ctx.fillRect(0, y, size, 2);
        ctx.fillStyle = '#8B6535';
        ctx.fillRect(0, y + 2, size, 14);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    return tex;
}

function createGrassMaterial() {
    return [
        new THREE.MeshLambertMaterial({ map: createTexture('#8B6535') }),
        new THREE.MeshLambertMaterial({ map: createTexture('#8B6535') }),
        new THREE.MeshLambertMaterial({ map: createTexture('#5AAD3A') }),
        new THREE.MeshLambertMaterial({ map: createTexture('#6B4513') }),
        new THREE.MeshLambertMaterial({ map: createTexture('#8B6535') }),
        new THREE.MeshLambertMaterial({ map: createTexture('#8B6535') })
    ];
}
function createStoneMaterial() { return new THREE.MeshLambertMaterial({ map: createTexture('#808080') }); }
function createWoodMaterial() {
    return [
        new THREE.MeshLambertMaterial({ map: createWoodTexture() }),
        new THREE.MeshLambertMaterial({ map: createWoodTexture() }),
        new THREE.MeshLambertMaterial({ map: createTexture('#A0703A') }),
        new THREE.MeshLambertMaterial({ map: createTexture('#A0703A') }),
        new THREE.MeshLambertMaterial({ map: createWoodTexture() }),
        new THREE.MeshLambertMaterial({ map: createWoodTexture() })
    ];
}
function createLeafMaterial() { return new THREE.MeshLambertMaterial({ map: createTexture('#2D5A1E', 40) }); }
function createDirtMaterial() { return new THREE.MeshLambertMaterial({ map: createTexture('#5A3A1A', 40) }); }
function createPlankMaterial() { return new THREE.MeshLambertMaterial({ map: createPlankTexture() }); }
function createBrickMaterial() {
    const size = 64;
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#B03030';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#EEEEEE';
    for (let y = 0; y < size; y += 16) {
        ctx.fillRect(0, y, size, 2);
        for (let x = (y % 32 === 0 ? 0 : 16); x < size; x += 32) {
            ctx.fillRect(x, y, 2, 16);
        }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    return new THREE.MeshLambertMaterial({ map: tex });
}
function createSandMaterial() { return new THREE.MeshLambertMaterial({ map: createTexture('#E8D5A0', 15) }); }
function createCoalMaterial() { return new THREE.MeshLambertMaterial({ map: createTexture('#2A2A2A', 40) }); }

const ALL_BLOCKS = [
    { id: 0, name: 'Трава',  material: createGrassMaterial(),  color: '#5AAD3A', secondaryColor: '#4A9D2A', physics: false },
    { id: 1, name: 'Камень', material: createStoneMaterial(),  color: '#808080', secondaryColor: '#6F6F6F', physics: false },
    { id: 2, name: 'Дерево', material: createWoodMaterial(),   color: '#6B4423', secondaryColor: '#5A3A1F', physics: false },
    { id: 3, name: 'Листва', material: createLeafMaterial(),   color: '#2D5A1E', secondaryColor: '#1D4A0E', physics: false },
    { id: 4, name: 'Земля',  material: createDirtMaterial(),   color: '#5A3A1A', secondaryColor: '#4A2F18', physics: false },
    { id: 5, name: 'Доски',  material: createPlankMaterial(),  color: '#A0703A', secondaryColor: '#8B6535', physics: false },
    { id: 6, name: 'Кирпич', material: createBrickMaterial(),  color: '#B03030', secondaryColor: '#8B2020', physics: false },
    { id: 7, name: 'Песок',  material: createSandMaterial(),   color: '#E8D5A0', secondaryColor: '#C8B580', physics: true },
    { id: 8, name: 'Уголь',  material: createCoalMaterial(),   color: '#2A2A2A', secondaryColor: '#000000', physics: false }
];

let unlockedBlocks = [0, 1, 2, 3, 4, 7];
let blockCounts = {};
let selectedSlot = 0;
let inventoryOpen = false;
let pauseOpen = false;
let gameStarted = false;
let editingButtons = false;

const ICON_CACHE = {};
const fallingBlocks = [];

const BLOCK_SIZE = 1;
const blockMap = new Map();

function blockKey(x, y, z) {
    return `${Math.round(x)},${Math.round(y)},${Math.round(z)}`;
}

function createBlock(x, y, z, blockId) {
    const block = ALL_BLOCKS[blockId];
    const geometry = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    const mesh = new THREE.Mesh(geometry, block.material);
    mesh.position.set(x, y, z);
    mesh.userData.isBlock = true;
    mesh.userData.blockId = blockId;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    blockMap.set(blockKey(x, y, z), mesh);
    return mesh;
}

function removeBlock(mesh) {
    const key = blockKey(mesh.position.x, mesh.position.y, mesh.position.z);
    blockMap.delete(key);
    scene.remove(mesh);
    mesh.geometry.dispose();
}

function checkPhysics(x, y, z) {
    const under = blockMap.get(blockKey(x, y - 1, z));
    if (!under && y > 0) startFalling(x, y, z);
}

function startFalling(x, y, z) {
    const mesh = blockMap.get(blockKey(x, y, z));
    if (!mesh) return;
    const blockId = mesh.userData.blockId;
    if (!ALL_BLOCKS[blockId].physics) return;
    const key = blockKey(x, y, z);
    blockMap.delete(key);
    fallingBlocks.push({ mesh, blockId, vy: 0 });
}

const WORLD_SIZE = 8;

function buildWorld() {
    blockMap.forEach(mesh => scene.remove(mesh));
    blockMap.clear();
    fallingBlocks.length = 0;

    for (let x = -WORLD_SIZE / 2; x < WORLD_SIZE / 2; x++) {
        for (let z = -WORLD_SIZE / 2; z < WORLD_SIZE / 2; z++) {
            createBlock(x, 0, z, 0);
        }
    }

    createBlock(2, 1, 2, 1);
    createBlock(3, 1, 2, 1);
    createBlock(2, 1, 3, 1);
    createBlock(3, 1, 3, 1);
    createBlock(2, 2, 2, 1);
    createBlock(3, 2, 2, 1);

    const treeX = -3, treeZ = -3;
    createBlock(treeX, 1, treeZ, 2);
    createBlock(treeX, 2, treeZ, 2);
    createBlock(treeX, 3, treeZ, 2);
    createBlock(treeX, 4, treeZ, 2);
    createBlock(treeX, 5, treeZ, 2);

    createBlock(treeX - 2, 5, treeZ, 3);
    createBlock(treeX + 2, 5, treeZ, 3);
    createBlock(treeX, 5, treeZ - 2, 3);
    createBlock(treeX, 5, treeZ + 2, 3);
    createBlock(treeX - 1, 5, treeZ - 2, 3);
    createBlock(treeX + 1, 5, treeZ - 2, 3);
    createBlock(treeX - 1, 5, treeZ + 2, 3);
    createBlock(treeX + 1, 5, treeZ + 2, 3);
    createBlock(treeX - 2, 5, treeZ - 1, 3);
    createBlock(treeX + 2, 5, treeZ - 1, 3);
    createBlock(treeX - 2, 5, treeZ + 1, 3);
    createBlock(treeX + 2, 5, treeZ + 1, 3);

    for (let dx = -2; dx <= 2; dx++) {
        for (let dz = -2; dz <= 2; dz++) {
            createBlock(treeX + dx, 6, treeZ + dz, 3);
        }
    }
    for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
            createBlock(treeX + dx, 7, treeZ + dz, 3);
        }
    }
    createBlock(treeX, 8, treeZ, 3);

    createBlock(-4, 1, 3, 7);
    createBlock(-4, 2, 3, 7);
    createBlock(-4, 3, 3, 7);
}

buildWorld();

const highlightBox = new THREE.Mesh(
    new THREE.BoxGeometry(BLOCK_SIZE + 0.02, BLOCK_SIZE + 0.02, BLOCK_SIZE + 0.02),
    new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.8 })
);
highlightBox.visible = false;
scene.add(highlightBox);

// ============================================================
// ЧЕЛОВЕЧЕК
// ============================================================

const human = new THREE.Group();
const humanParts = { head: null, body: null, leftArm: null, rightArm: null, leftLeg: null, rightLeg: null };

function buildHuman() {
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xffcc99 });
    const shirtMat = new THREE.MeshLambertMaterial({ color: 0x3366cc });
    const pantsMat = new THREE.MeshLambertMaterial({ color: 0x333366 });
    const shoeMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const hairMat = new THREE.MeshLambertMaterial({ color: 0x4a2c0a });

    const bodyGroup = new THREE.Group();
    bodyGroup.position.y = 1.15;
    const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.7, 0.3), shirtMat);
    bodyMesh.castShadow = true;
    bodyGroup.add(bodyMesh);
    const shirtStripe = new THREE.Mesh(
        new THREE.BoxGeometry(0.56, 0.1, 0.31),
        new THREE.MeshLambertMaterial({ color: 0x2244aa })
    );
    shirtStripe.position.y = -0.3;
    bodyGroup.add(shirtStripe);
    human.add(bodyGroup);
    humanParts.body = bodyGroup;

    const headGroup = new THREE.Group();
    headGroup.position.y = 1.75;
    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), skinMat);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.15, 0.52), hairMat);
    hairTop.position.y = 0.25;
    headGroup.add(hairTop);
    const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.4, 0.08), hairMat);
    hairBack.position.set(0, 0.05, -0.25);
    headGroup.add(hairBack);
    const hairLeft = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 0.52), hairMat);
    hairLeft.position.set(-0.25, 0.05, 0);
    headGroup.add(hairLeft);
    const hairRight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 0.52), hairMat);
    hairRight.position.set(0.25, 0.05, 0);
    headGroup.add(hairRight);

    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const eyePupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const eyeWhiteGeom = new THREE.BoxGeometry(0.14, 0.14, 0.02);
    const eyePupilGeom = new THREE.BoxGeometry(0.08, 0.08, 0.03);

    const eyeLeftWhite = new THREE.Mesh(eyeWhiteGeom, eyeWhiteMat);
    eyeLeftWhite.position.set(-0.12, 0.05, 0.26);
    headGroup.add(eyeLeftWhite);
    const eyeRightWhite = new THREE.Mesh(eyeWhiteGeom, eyeWhiteMat);
    eyeRightWhite.position.set(0.12, 0.05, 0.26);
    headGroup.add(eyeRightWhite);
    const eyeLeftPupil = new THREE.Mesh(eyePupilGeom, eyePupilMat);
    eyeLeftPupil.position.set(-0.12, 0.05, 0.27);
    headGroup.add(eyeLeftPupil);
    const eyeRightPupil = new THREE.Mesh(eyePupilGeom, eyePupilMat);
    eyeRightPupil.position.set(0.12, 0.05, 0.27);
    headGroup.add(eyeRightPupil);

    const mouth = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.02, 0.02),
        new THREE.MeshBasicMaterial({ color: 0xcc6666 })
    );
    mouth.position.set(0, -0.15, 0.26);
    headGroup.add(mouth);

    human.add(headGroup);
    humanParts.head = headGroup;

    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.4, 1.5, 0);
    const leftArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.65, 0.2), shirtMat);
    leftArmMesh.position.y = -0.32;
    leftArmMesh.castShadow = true;
    leftArmGroup.add(leftArmMesh);
    const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 0.2), skinMat);
    leftHand.position.y = -0.72;
    leftArmGroup.add(leftHand);
    human.add(leftArmGroup);
    humanParts.leftArm = leftArmGroup;

    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.4, 1.5, 0);
    const rightArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.65, 0.2), shirtMat);
    rightArmMesh.position.y = -0.32;
    rightArmMesh.castShadow = true;
    rightArmGroup.add(rightArmMesh);
    const rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 0.2), skinMat);
    rightHand.position.y = -0.72;
    rightArmGroup.add(rightHand);
    human.add(rightArmGroup);
    humanParts.rightArm = rightArmGroup;

    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.15, 0.8, 0);
    const leftLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.6, 0.22), pantsMat);
    leftLegMesh.position.y = -0.3;
    leftLegMesh.castShadow = true;
    leftLegGroup.add(leftLegMesh);
    const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.28), shoeMat);
    leftShoe.position.set(0, -0.65, 0.02);
    leftLegGroup.add(leftShoe);
    human.add(leftLegGroup);
    humanParts.leftLeg = leftLegGroup;

    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.15, 0.8, 0);
    const rightLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.6, 0.22), pantsMat);
    rightLegMesh.position.y = -0.3;
    rightLegMesh.castShadow = true;
    rightLegGroup.add(rightLegMesh);
    const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.28), shoeMat);
    rightShoe.position.set(0, -0.65, 0.02);
    rightLegGroup.add(rightShoe);
    human.add(rightLegGroup);
    humanParts.rightLeg = rightLegGroup;

    human.position.set(0, 0, 0);
    scene.add(human);
}

buildHuman();

function drawMenuPlayer() {
    const c = document.getElementById('menu-player-canvas');
    if (!c) return;
    const ctx = c.getContext('2d');
    const W = c.width, H = c.height;

    const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, '#87CEEB');
    skyGrad.addColorStop(1, '#B0E0F5');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(30, 40, 12, 0, Math.PI * 2);
    ctx.arc(45, 42, 15, 0, Math.PI * 2);
    ctx.arc(120, 50, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#5AAD3A';
    ctx.fillRect(0, H - 40, W, 40);
    ctx.fillStyle = '#8B6535';
    ctx.fillRect(0, H - 20, W, 20);

    const cx = W / 2, cy = H - 40;

    ctx.fillStyle = '#333366';
    ctx.fillRect(cx - 22, cy - 40, 18, 40);
    ctx.fillRect(cx + 4, cy - 40, 18, 40);
    ctx.fillStyle = '#222222';
    ctx.fillRect(cx - 24, cy - 10, 22, 10);
    ctx.fillRect(cx + 2, cy - 10, 22, 10);

    ctx.fillStyle = '#3366cc';
    ctx.fillRect(cx - 24, cy - 100, 48, 60);
    ctx.fillRect(cx - 36, cy - 96, 12, 56);
    ctx.fillRect(cx + 24, cy - 96, 12, 56);

    ctx.fillStyle = '#ffcc99';
    ctx.fillRect(cx - 36, cy - 44, 12, 12);
    ctx.fillRect(cx + 24, cy - 44, 12, 12);
    ctx.fillRect(cx - 20, cy - 140, 40, 40);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 14, cy - 128, 8, 8);
    ctx.fillRect(cx + 6, cy - 128, 8, 8);
    ctx.fillStyle = '#000000';
    ctx.fillRect(cx - 12, cy - 126, 4, 4);
    ctx.fillRect(cx + 8, cy - 126, 4, 4);

    ctx.fillStyle = '#cc6666';
    ctx.fillRect(cx - 8, cy - 108, 16, 4);

    ctx.fillStyle = '#4a2c0a';
    ctx.fillRect(cx - 22, cy - 144, 44, 12);
    ctx.fillRect(cx - 22, cy - 132, 6, 24);
    ctx.fillRect(cx + 16, cy - 132, 6, 24);
}

drawMenuPlayer();

// ============================================================
// ПЕРЕМЕЩАЕМЫЕ КНОПКИ (Draggable Buttons)
// ============================================================

const BUTTON_POSITIONS_KEY = 'cubeLifeBtnPositions';

// Дефолтные позиции (в процентах от размера экрана)
const DEFAULT_POSITIONS = {
    'a': { x: 10, y: 80 },
    'd': { x: 25, y: 80 },
    'w': { x: 82, y: 70 },
    's': { x: 82, y: 85 },
    'jump': { x: 88, y: 50 },
    'crouch': { x: 12, y: 50 },
    'break': { x: 30, y: 65 },
    'place': { x: 70, y: 65 },
    'inventory': { x: 92, y: 20 },
    'camera': { x: 92, y: 12 }
};

let buttonPositions = {};

function loadButtonPositions() {
    try {
        const saved = localStorage.getItem(BUTTON_POSITIONS_KEY);
        if (saved) {
            buttonPositions = JSON.parse(saved);
        } else {
            buttonPositions = { ...DEFAULT_POSITIONS };
        }
    } catch (e) {
        buttonPositions = { ...DEFAULT_POSITIONS };
    }
}

function saveButtonPositions() {
    try {
        localStorage.setItem(BUTTON_POSITIONS_KEY, JSON.stringify(buttonPositions));
    } catch (e) {}
}

function applyButtonPosition(btnId, xPercent, yPercent) {
    const btn = document.getElementById(`btn-${btnId}`);
    if (!btn) return;
    btn.style.left = xPercent + '%';
    btn.style.top = yPercent + '%';
    btn.style.transform = 'translate(-50%, -50%)';
}

function applyAllPositions() {
    for (const id in buttonPositions) {
        applyButtonPosition(id, buttonPositions[id].x, buttonPositions[id].y);
    }
}

function resetButtonPositions() {
    buttonPositions = { ...DEFAULT_POSITIONS };
    saveButtonPositions();
    applyAllPositions();
}
window.resetButtonPositions = resetButtonPositions;

// Drag & Drop
function setupDraggableButtons() {
    const buttons = document.querySelectorAll('.mobile-btn');

    buttons.forEach(btn => {
        let isDragging = false;
        let startX, startY;

        const startDrag = (e) => {
            if (!editingButtons) return;
            isDragging = true;
            const touch = e.touches ? e.touches[0] : e;
            startX = touch.clientX;
            startY = touch.clientY;
            btn.style.zIndex = 999;
            e.preventDefault();
        };

        const moveDrag = (e) => {
            if (!isDragging || !editingButtons) return;
            const touch = e.touches ? e.touches[0] : e;
            const x = touch.clientX;
            const y = touch.clientY;

            const xPercent = (x / window.innerWidth) * 100;
            const yPercent = (y / window.innerHeight) * 100;

            const clampedX = Math.max(5, Math.min(95, xPercent));
            const clampedY = Math.max(5, Math.min(95, yPercent));

            btn.style.left = clampedX + '%';
            btn.style.top = clampedY + '%';

            const btnId = btn.getAttribute('data-btn');
            buttonPositions[btnId] = { x: clampedX, y: clampedY };
            e.preventDefault();
        };

        const endDrag = (e) => {
            if (!isDragging) return;
            isDragging = false;
            btn.style.zIndex = 10;
            saveButtonPositions();
        };

        btn.addEventListener('touchstart', startDrag, { passive: false });
        btn.addEventListener('touchmove', moveDrag, { passive: false });
        btn.addEventListener('touchend', endDrag);
        btn.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', moveDrag);
        document.addEventListener('mouseup', endDrag);
    });
}

function toggleEditMode() {
    editingButtons = !editingButtons;
    const hint = document.getElementById('edit-hint');
    const editBtn = document.getElementById('edit-toggle-btn');

    if (editingButtons) {
        document.body.classList.add('editing');
        if (hint) hint.classList.add('show');
        if (editBtn) editBtn.classList.add('active');
        // Закрываем паузу
        if (pauseOpen) closePause();
    } else {
        document.body.classList.remove('editing');
        if (hint) hint.classList.remove('show');
        if (editBtn) editBtn.classList.remove('active');
    }
}
window.toggleEditMode = toggleEditMode;

loadButtonPositions();
applyAllPositions();
setupDraggableButtons();

const editToggleBtn = document.getElementById('edit-toggle-btn');
if (editToggleBtn) editToggleBtn.onclick = toggleEditMode;

// ============================================================
// НАЗНАЧЕНИЕ ДЕЙСТВИЙ КНОПКАМ
// ============================================================

function setupButtonActions() {
    // Движение
    const btnA = document.getElementById('btn-a');
    const btnD = document.getElementById('btn-d');
    const btnW = document.getElementById('btn-w');
    const btnS = document.getElementById('btn-s');

    if (btnA) {
        btnA.addEventListener('touchstart', (e) => { if (!editingButtons) pressKey('a'); e.preventDefault(); }, { passive: false });
        btnA.addEventListener('touchend', () => { if (!editingButtons) releaseKey('a'); });
        btnA.addEventListener('mousedown', () => { if (!editingButtons) pressKey('a'); });
        btnA.addEventListener('mouseup', () => { if (!editingButtons) releaseKey('a'); });
    }
    if (btnD) {
        btnD.addEventListener('touchstart', (e) => { if (!editingButtons) pressKey('d'); e.preventDefault(); }, { passive: false });
        btnD.addEventListener('touchend', () => { if (!editingButtons) releaseKey('d'); });
        btnD.addEventListener('mousedown', () => { if (!editingButtons) pressKey('d'); });
        btnD.addEventListener('mouseup', () => { if (!editingButtons) releaseKey('d'); });
    }
    if (btnW) {
        btnW.addEventListener('touchstart', (e) => { if (!editingButtons) pressKey('w'); e.preventDefault(); }, { passive: false });
        btnW.addEventListener('touchend', () => { if (!editingButtons) releaseKey('w'); });
        btnW.addEventListener('mousedown', () => { if (!editingButtons) pressKey('w'); });
        btnW.addEventListener('mouseup', () => { if (!editingButtons) releaseKey('w'); });
    }
    if (btnS) {
        btnS.addEventListener('touchstart', (e) => { if (!editingButtons) pressKey('s'); e.preventDefault(); }, { passive: false });
        btnS.addEventListener('touchend', () => { if (!editingButtons) releaseKey('s'); });
        btnS.addEventListener('mousedown', () => { if (!editingButtons) pressKey('s'); });
        btnS.addEventListener('mouseup', () => { if (!editingButtons) releaseKey('s'); });
    }

    // Прыжок
    const btnJump = document.getElementById('btn-jump');
    if (btnJump) {
        btnJump.addEventListener('click', (e) => {
            if (editingButtons) return;
            jump();
        });
    }

    // Присед
    const btnCrouch = document.getElementById('btn-crouch');
    if (btnCrouch) {
        btnCrouch.addEventListener('touchstart', (e) => { if (!editingButtons) { crouchStart(); e.preventDefault(); } }, { passive: false });
        btnCrouch.addEventListener('touchend', () => { if (!editingButtons) crouchEnd(); });
        btnCrouch.addEventListener('mousedown', () => { if (!editingButtons) crouchStart(); });
        btnCrouch.addEventListener('mouseup', () => { if (!editingButtons) crouchEnd(); });
    }

    // Ломать
    const btnBreak = document.getElementById('btn-break');
    if (btnBreak) {
        btnBreak.addEventListener('click', () => {
            if (editingButtons) return;
            breakBlock();
        });
    }

    // Ставить
    const btnPlace = document.getElementById('btn-place');
    if (btnPlace) {
        btnPlace.addEventListener('click', () => {
            if (editingButtons) return;
            placeBlock();
        });
    }

    // Инвентарь
    const btnInv = document.getElementById('btn-inventory');
    if (btnInv) {
        btnInv.addEventListener('click', () => {
            if (editingButtons) return;
            toggleInventory();
        });
    }

    // Камера
    const btnCam = document.getElementById('btn-camera');
    if (btnCam) {
        btnCam.addEventListener('click', () => {
            if (editingButtons) return;
            toggleCamera();
        });
    }
}

setupButtonActions();

// ============================================================
// СТАРТ ИГРЫ
// ============================================================

function startGame(mode) {
    gameStarted = true;
    pauseOpen = false;

    const startEl = document.getElementById('start-menu');
    if (startEl) startEl.classList.add('hidden');
    const pauseEl = document.getElementById('pause-menu');
    if (pauseEl) pauseEl.classList.remove('open');

    buildWorld();

    if (mode === 'survival0') {
        blockCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 7: 0 };
        unlockedBlocks = [0, 1, 2, 3, 4, 7];
    } else if (mode === 'creative') {
        blockCounts = { 0: 999, 1: 999, 2: 999, 3: 999, 4: 999, 5: 999, 6: 999, 7: 999, 8: 999 };
        unlockedBlocks = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    } else {
        blockCounts = { 0: 64, 1: 64, 2: 64, 3: 64, 4: 64, 7: 64 };
        unlockedBlocks = [0, 1, 2, 3, 4, 7];
    }

    player.x = 0;
    player.z = 0;
    player.y = 0;
    player.vy = 0;
    player.angle = 0;

    localStorage.setItem('cubeLifeMode', mode);

    initHotbar();
    initInventoryModal();
    selectSlot(0);
}
window.startGame = startGame;

function openPause() {
    if (!gameStarted) return;
    if (inventoryOpen) return;
    if (editingButtons) return;
    pauseOpen = true;
    const el = document.getElementById('pause-menu');
    if (el) el.classList.add('open');
    if (isPointerLocked) document.exitPointerLock();
}
window.openPause = openPause;

function closePause() {
    pauseOpen = false;
    const el = document.getElementById('pause-menu');
    if (el) el.classList.remove('open');
}
window.closePause = closePause;

function exitToMenu() {
    pauseOpen = false;
    gameStarted = false;

    const pauseEl = document.getElementById('pause-menu');
    if (pauseEl) pauseEl.classList.remove('open');
    const invEl = document.getElementById('inventory-modal');
    if (invEl) invEl.classList.remove('open');
    inventoryOpen = false;

    if (isPointerLocked) document.exitPointerLock();

    localStorage.removeItem('cubeLifeMode');

    blockMap.forEach(mesh => scene.remove(mesh));
    blockMap.clear();
    fallingBlocks.length = 0;

    const startEl = document.getElementById('start-menu');
    if (startEl) startEl.classList.remove('hidden');
    drawMenuPlayer();
}
window.exitToMenu = exitToMenu;

const keys = {};
const player = { x: 0, z: 0, y: 0, vy: 0, angle: 0, speed: 0.08, turnSpeed: 0.05, isJumping: false, isCrouching: false };
const GRAVITY = -0.015;
const JUMP_FORCE = 0.18;

let cameraMode = 3;
let cameraFollowAngle = 0;
let cameraPitchAngle = 0;
let walkAnimation = 0;
let isWalking = false;

const KEY_MAP = { 'ц': 'w', 'ф': 'a', 'ы': 's', 'в': 'd', 'м': 'v', 'н': 'y' };

document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    const normalizedKey = KEY_MAP[key] || key;

    if (key === 'escape') {
        if (editingButtons) { toggleEditMode(); return; }
        if (inventoryOpen) { toggleInventory(); return; }
        if (pauseOpen) { closePause(); return; }
        if (gameStarted) { openPause(); return; }
    }

    if (!gameStarted) return;

    keys[normalizedKey] = true;

    if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' '].includes(key)) e.preventDefault();
    if (normalizedKey === 'v') toggleCamera();
    if (normalizedKey === 'y') toggleInventory();
    if (['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(key)) selectSlot(parseInt(key) - 1);
    if (key === ' ' || normalizedKey === 'space') jump();
});

document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    const normalizedKey = KEY_MAP[key] || key;
    keys[normalizedKey] = false;
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Shift' && gameStarted) player.isCrouching = true;
});
document.addEventListener('keyup', (e) => {
    if (e.key === 'Shift') player.isCrouching = false;
});

document.addEventListener('wheel', (e) => {
    if (isPointerLocked && !inventoryOpen && !pauseOpen && gameStarted) {
        if (e.deltaY > 0) selectSlot((selectedSlot + 1) % unlockedBlocks.length);
        else selectSlot((selectedSlot - 1 + unlockedBlocks.length) % unlockedBlocks.length);
    }
});

function pressKey(key) { keys[key] = true; }
function releaseKey(key) { keys[key] = false; }
window.pressKey = pressKey;
window.releaseKey = releaseKey;

function toggleCamera() {
    cameraMode = cameraMode === 3 ? 1 : 3;
    const el = document.getElementById('camera-mode');
    if (el) el.textContent = cameraMode === 3 ? '3-е лицо' : '1-е лицо';
}
window.toggleCamera = toggleCamera;

function toggleInventory() {
    if (pauseOpen) return;
    inventoryOpen = !inventoryOpen;
    const modal = document.getElementById('inventory-modal');
    if (!modal) return;

    if (inventoryOpen) {
        modal.classList.add('open');
        if (isPointerLocked) document.exitPointerLock();
        drawPlayerPreview();
        renderCraftingGrid();
        checkRecipe();
        initInventoryModal();
    } else {
        modal.classList.remove('open');
    }
}
window.toggleInventory = toggleInventory;

function selectSlot(slotIndex) {
    if (slotIndex < 0 || slotIndex >= unlockedBlocks.length) return;
    selectedSlot = slotIndex;

    document.querySelectorAll('.inv-slot[data-hotbar]').forEach((el, i) => {
        if (i === slotIndex) el.classList.add('active');
        else el.classList.remove('active');
    });

    const blockId = unlockedBlocks[selectedSlot];
    const block = ALL_BLOCKS[blockId];
    const selectedEl = document.getElementById('selected-block');
    if (selectedEl) selectedEl.textContent = block.name;
}
window.selectSlot = selectSlot;

function jump() {
    if (inventoryOpen || pauseOpen) return;
    if (player.isJumping) return;
    player.vy = JUMP_FORCE;
    player.isJumping = true;
}
window.jump = jump;

function crouchStart() { player.isCrouching = true; }
function crouchEnd() { player.isCrouching = false; }
window.crouchStart = crouchStart;
window.crouchEnd = crouchEnd;

let isPointerLocked = false;

if (!isMobile) {
    canvas.addEventListener('click', () => {
        if (!isPointerLocked && !inventoryOpen && !pauseOpen && !editingButtons && gameStarted) {
            canvas.requestPointerLock().catch(err => console.log(err));
        }
    });

    document.addEventListener('pointerlockchange', () => {
        const wasLocked = isPointerLocked;
        isPointerLocked = document.pointerLockElement === canvas;
        if (wasLocked && !isPointerLocked && gameStarted && !inventoryOpen && !pauseOpen && !editingButtons) {
            openPause();
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (!isPointerLocked) return;
        const deltaX = e.movementX;
        const deltaY = e.movementY;

        if (cameraMode === 3) {
            cameraFollowAngle -= deltaX * 0.003;
            cameraPitchAngle -= deltaY * 0.003;
            cameraPitchAngle = Math.max(-0.3, Math.min(1.2, cameraPitchAngle));
        } else {
            player.angle -= deltaX * 0.003;
            cameraPitchAngle -= deltaY * 0.003;
            cameraPitchAngle = Math.max(-0.8, Math.min(0.8, cameraPitchAngle));
        }
    });
}

const raycaster = new THREE.Raycaster();
const screenCenter = new THREE.Vector2(0, 0);

function getTargetBlock() {
    raycaster.setFromCamera(screenCenter, camera);
    const intersects = raycaster.intersectObjects(Array.from(blockMap.values()));
    if (intersects.length > 0) return intersects[0];
    return null;
}

function breakBlock() {
    if (inventoryOpen || pauseOpen || !gameStarted) return;
    const hit = getTargetBlock();
    if (!hit) return;
    const mesh = hit.object;
    const blockId = mesh.userData.blockId;

    const dx = Math.abs(mesh.position.x - player.x);
    const dz = Math.abs(mesh.position.z - player.z);
    if (dx < 0.6 && dz < 0.6 && mesh.position.y < 1) return;

    const x = Math.round(mesh.position.x);
    const y = Math.round(mesh.position.y);
    const z = Math.round(mesh.position.z);

    removeBlock(mesh);

    if (blockCounts[blockId] === undefined) blockCounts[blockId] = 0;
    blockCounts[blockId]++;

    if (!unlockedBlocks.includes(blockId)) unlockedBlocks.push(blockId);

    initHotbar();

    checkPhysics(x + 1, y, z);
    checkPhysics(x - 1, y, z);
    checkPhysics(x, y, z + 1);
    checkPhysics(x, y, z - 1);
    checkPhysics(x, y + 1, z);
}

function placeBlock() {
    if (inventoryOpen || pauseOpen || !gameStarted) return;
    const hit = getTargetBlock();
    if (!hit) return;

    const blockId = unlockedBlocks[selectedSlot];

    if (blockCounts[blockId] !== undefined && blockCounts[blockId] <= 0) {
        showNotification('❌ Нет блоков ' + ALL_BLOCKS[blockId].name);
        return;
    }

    const normal = hit.face.normal.clone();
    const newPos = hit.object.position.clone().add(normal);

    const key = blockKey(newPos.x, newPos.y, newPos.z);
    if (blockMap.has(key)) return;

    const dx = Math.abs(newPos.x - player.x);
    const dz = Math.abs(newPos.z - player.z);
    const dy = newPos.y - (player.y + 0.5);
    if (dx < 0.6 && dz < 0.6 && dy > -0.5 && dy < 1.5) return;
    if (newPos.y < 0) return;

    createBlock(newPos.x, newPos.y, newPos.z, blockId);

    if (blockCounts[blockId] !== undefined) blockCounts[blockId]--;

    initHotbar();

    checkPhysics(Math.round(newPos.x), Math.round(newPos.y), Math.round(newPos.z));
}

window.breakBlockBtn = breakBlock;
window.placeBlockBtn = placeBlock;

if (!isMobile) {
    document.addEventListener('mousedown', (e) => {
        if (inventoryOpen || pauseOpen || !gameStarted) return;
        if (e.button === 0) placeBlock();
        else if (e.button === 2) breakBlock();
    });

    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
}

let lastTouchX = 0, lastTouchY = 0;

if (isMobile) {
    canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            lastTouchX = e.touches[0].clientX;
            lastTouchY = e.touches[0].clientY;
        }
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
        if (e.touches.length !== 1) return;
        const deltaX = e.touches[0].clientX - lastTouchX;
        const deltaY = e.touches[0].clientY - lastTouchY;
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;

        if (cameraMode === 3) {
            cameraFollowAngle -= deltaX * 0.01;
            cameraPitchAngle -= deltaY * 0.01;
            cameraPitchAngle = Math.max(-0.3, Math.min(1.2, cameraPitchAngle));
        } else {
            player.angle -= deltaX * 0.01;
        }
    }, { passive: true });
}

function updateWalkAnimation() {
    const moving = (keys['w'] || keys['s'] || keys['arrowup'] || keys['arrowdown']) && gameStarted && !pauseOpen && !inventoryOpen;

    if (moving) {
        isWalking = true;
        const speedMultiplier = player.isCrouching ? 0.5 : 1;
        walkAnimation += 0.15 * speedMultiplier;
    } else {
        isWalking = false;
    }

    const swing = isWalking ? Math.sin(walkAnimation) * 0.7 : 0;
    const targetSwing = isWalking ? swing : 0;

    if (humanParts.leftArm) humanParts.leftArm.rotation.x += (targetSwing - humanParts.leftArm.rotation.x) * 0.3;
    if (humanParts.rightArm) humanParts.rightArm.rotation.x += (-targetSwing - humanParts.rightArm.rotation.x) * 0.3;
    if (humanParts.leftLeg) humanParts.leftLeg.rotation.x += (-targetSwing * 0.8 - humanParts.leftLeg.rotation.x) * 0.3;
    if (humanParts.rightLeg) humanParts.rightLeg.rotation.x += (targetSwing * 0.8 - humanParts.rightLeg.rotation.x) * 0.3;

    if (humanParts.body) {
        const bob = isWalking ? Math.abs(Math.sin(walkAnimation * 2)) * 0.05 : 0;
        humanParts.body.position.y = 1.15 + bob;
    }
    if (humanParts.head) {
        const headBob = isWalking ? Math.abs(Math.sin(walkAnimation * 2)) * 0.03 : 0;
        humanParts.head.position.y = 1.75 + headBob;
    }

    if (player.isCrouching && humanParts.head) {
        humanParts.head.rotation.x = 0.3;
    } else if (humanParts.head) {
        humanParts.head.rotation.x += (0 - humanParts.head.rotation.x) * 0.2;
    }
}

function update() {
    if (!inventoryOpen && !pauseOpen && gameStarted) {
        if (keys['a'] || keys['arrowleft']) player.angle += player.turnSpeed;
        if (keys['d'] || keys['arrowright']) player.angle -= player.turnSpeed;

        const speed = player.isCrouching ? player.speed * 0.4 : player.speed;

        if (keys['w'] || keys['arrowup']) {
            player.x += Math.sin(player.angle) * speed;
            player.z += Math.cos(player.angle) * speed;
        }
        if (keys['s'] || keys['arrowdown']) {
            player.x -= Math.sin(player.angle) * speed;
            player.z -= Math.cos(player.angle) * speed;
        }
    }

    player.vy += GRAVITY;
    player.y += player.vy;
    if (player.y <= 0) { player.y = 0; player.vy = 0; player.isJumping = false; }

    const limit = WORLD_SIZE / 2 - 0.5;
    player.x = Math.max(-limit, Math.min(limit, player.x));
    player.z = Math.max(-limit, Math.min(limit, player.z));

    const crouchOffset = player.isCrouching ? -0.3 : 0;

    human.position.x = player.x;
    human.position.z = player.z;
    human.position.y = player.y + 0.5 + crouchOffset;
    human.rotation.y = player.angle;

    updateWalkAnimation();

    if (cameraMode === 3) {
        if (keys['left']) cameraFollowAngle += 0.03;
        if (keys['right']) cameraFollowAngle -= 0.03;

        const totalAngle = player.angle + cameraFollowAngle;
        const camDist = 6;
        const baseHeight = 4 + cameraPitchAngle * 3;
        const camHeight = Math.max(0.5, baseHeight + player.y);

        const targetX = player.x - Math.sin(totalAngle) * camDist;
        const targetZ = player.z - Math.cos(totalAngle) * camDist;

        camera.position.x += (targetX - camera.position.x) * 0.15;
        camera.position.z += (targetZ - camera.position.z) * 0.15;
        camera.position.y += (camHeight - camera.position.y) * 0.15;

        camera.lookAt(player.x, 1.2 + player.y, player.z);
        human.visible = true;
    } else {
        camera.position.x = player.x;
        camera.position.z = player.z;
        camera.position.y = 1.75 + player.y + crouchOffset;

        const lookX = player.x + Math.sin(player.angle) * 5;
        const lookZ = player.z + Math.cos(player.angle) * 5;
        const lookY = 1.75 + cameraPitchAngle * 4 + player.y + crouchOffset;

        camera.lookAt(lookX, lookY, lookZ);
        human.visible = false;
    }

    for (let i = fallingBlocks.length - 1; i >= 0; i--) {
        const fb = fallingBlocks[i];
        fb.vy += GRAVITY * 0.5;
        fb.mesh.position.y += fb.vy;

        const x = Math.round(fb.mesh.position.x);
        const y = Math.round(fb.mesh.position.y);
        const z = Math.round(fb.mesh.position.z);

        const under = blockMap.get(blockKey(x, y - 1, z));
        const atLevel = blockMap.get(blockKey(x, y, z));

        if (under || y <= 0 || atLevel) {
            fb.mesh.position.y = Math.round(fb.mesh.position.y);
            fb.mesh.position.x = Math.round(fb.mesh.position.x);
            fb.mesh.position.z = Math.round(fb.mesh.position.z);

            blockMap.set(blockKey(fb.mesh.position.x, fb.mesh.position.y, fb.mesh.position.z), fb.mesh);
            fallingBlocks.splice(i, 1);

            const above = blockMap.get(blockKey(x, y + 1, z));
            if (above) {
                const aboveId = above.userData.blockId;
                if (ALL_BLOCKS[aboveId].physics) startFalling(x, y + 1, z);
            }
        }
    }

    if (!inventoryOpen && !pauseOpen && gameStarted) {
        const hit = getTargetBlock();
        if (hit) {
            highlightBox.position.copy(hit.object.position);
            highlightBox.visible = true;
        } else {
            highlightBox.visible = false;
        }
    } else {
        highlightBox.visible = false;
    }

    const worldInfoEl = document.getElementById('world-info');
    if (worldInfoEl) worldInfoEl.textContent = blockMap.size + ' блоков';
}

function animate() {
    requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    applyAllPositions();
});

function makeInvIcon(color, secondaryColor) {
    const size = 64;
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 0, size);
    gradient.addColorStop(0, lightenColor(color, 40));
    gradient.addColorStop(1, darkenColor(color, 40));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 80; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const w = 3 + Math.random() * 6;
        const h = 3 + Math.random() * 6;
        ctx.fillStyle = secondaryColor;
        ctx.globalAlpha = 0.5;
        ctx.fillRect(x, y, w, h);
    }
    ctx.globalAlpha = 1;

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, size - 3, size - 3);

    return c.toDataURL();
}

function getIcon(blockId) {
    if (ICON_CACHE[blockId]) return ICON_CACHE[blockId];
    const block = ALL_BLOCKS[blockId];
    ICON_CACHE[blockId] = makeInvIcon(block.color, block.secondaryColor);
    return ICON_CACHE[blockId];
}

function drawPlayerPreview() {
    const c = document.getElementById('player-preview');
    if (!c) return;
    const ctx = c.getContext('2d');
    const W = c.width, H = c.height;

    const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, '#87CEEB');
    skyGrad.addColorStop(1, '#B0E0F5');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(15, 18, 7, 0, Math.PI * 2);
    ctx.arc(24, 20, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#5AAD3A';
    ctx.fillRect(0, H - 22, W, 22);
    ctx.fillStyle = '#8B6535';
    ctx.fillRect(0, H - 10, W, 10);

    const cx = W / 2, cy = H - 22;

    ctx.fillStyle = '#333366';
    ctx.fillRect(cx - 11, cy - 20, 9, 20);
    ctx.fillRect(cx + 2, cy - 20, 9, 20);

    ctx.fillStyle = '#222222';
    ctx.fillRect(cx - 12, cy - 5, 11, 5);
    ctx.fillRect(cx + 1, cy - 5, 11, 5);

    ctx.fillStyle = '#3366cc';
    ctx.fillRect(cx - 12, cy - 50, 24, 30);
    ctx.fillRect(cx - 18, cy - 48, 6, 28);
    ctx.fillRect(cx + 12, cy - 48, 6, 28);

    ctx.fillStyle = '#ffcc99';
    ctx.fillRect(cx - 18, cy - 22, 6, 6);
    ctx.fillRect(cx + 12, cy - 22, 6, 6);
    ctx.fillRect(cx - 10, cy - 70, 20, 20);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 7, cy - 64, 5, 5);
    ctx.fillRect(cx + 2, cy - 64, 5, 5);
    ctx.fillStyle = '#000000';
    ctx.fillRect(cx - 6, cy - 63, 3, 3);
    ctx.fillRect(cx + 3, cy - 63, 3, 3);

    ctx.fillStyle = '#cc6666';
    ctx.fillRect(cx - 4, cy - 54, 8, 2);

    ctx.fillStyle = '#4a2c0a';
    ctx.fillRect(cx - 11, cy - 72, 22, 6);
    ctx.fillRect(cx - 11, cy - 66, 3, 12);
    ctx.fillRect(cx + 8, cy - 66, 3, 12);
}

const RECIPES = [
    { inputs: { 2: 1 }, output: 5, name: 'Доски' },
    { inputs: { 2: 2 }, output: 8, name: 'Уголь' },
    { inputs: { 1: 3 }, output: 6, name: 'Кирпич' },
    { inputs: { 1: 1, 7: 1 }, output: 7, name: 'Песок' }
];

let craftingGrid = {};

function renderCraftingGrid() {
    const grid = document.getElementById('crafting-grid');
    if (!grid) return;
    grid.innerHTML = '';

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'craft-cell';

        if (craftingGrid[i] !== undefined) {
            const blockIndex = craftingGrid[i];
            const img = document.createElement('img');
            img.className = 'inv-icon-img';
            img.src = getIcon(blockIndex);
            cell.appendChild(img);

            cell.onclick = () => {
                delete craftingGrid[i];
                renderCraftingGrid();
                checkRecipe();
            };
        } else {
            cell.classList.add('empty');
        }

        grid.appendChild(cell);
    }
}

function addToCraftingGrid(blockIndex) {
    for (let i = 0; i < 9; i++) {
        if (craftingGrid[i] === undefined) {
            craftingGrid[i] = blockIndex;
            renderCraftingGrid();
            checkRecipe();
            return;
        }
    }
}
window.addToCraftingGrid = addToCraftingGrid;

function checkRecipe() {
    const resultEl = document.getElementById('crafting-result');
    const resultImg = document.getElementById('crafting-result-img');
    const resultName = document.getElementById('crafting-result-name');
    if (!resultEl) return;

    const counts = {};
    for (let i = 0; i < 9; i++) {
        if (craftingGrid[i] !== undefined) {
            const b = craftingGrid[i];
            counts[b] = (counts[b] || 0) + 1;
        }
    }

    let matched = null;
    for (const recipe of RECIPES) {
        const needed = recipe.inputs;
        const neededKeys = Object.keys(needed).map(Number);
        const haveKeys = Object.keys(counts).map(Number);
        if (haveKeys.length !== neededKeys.length) continue;

        let ok = true;
        for (const k of neededKeys) {
            if (counts[k] !== needed[k]) { ok = false; break; }
        }
        if (ok) { matched = recipe; break; }
    }

    if (matched) {
        resultEl.classList.add('active');
        resultImg.src = getIcon(matched.output);
        resultImg.style.display = 'block';
        resultName.textContent = matched.name;
    } else {
        resultEl.classList.remove('active');
        resultImg.removeAttribute('src');
        resultImg.style.display = 'none';
        resultName.textContent = '...';
    }
}

function craftItem() {
    const resultEl = document.getElementById('crafting-result');
    if (!resultEl || !resultEl.classList.contains('active')) return;

    const counts = {};
    for (let i = 0; i < 9; i++) {
        if (craftingGrid[i] !== undefined) {
            const b = craftingGrid[i];
            counts[b] = (counts[b] || 0) + 1;
        }
    }

    let matched = null;
    for (const recipe of RECIPES) {
        const needed = recipe.inputs;
        const neededKeys = Object.keys(needed).map(Number);
        const haveKeys = Object.keys(counts).map(Number);
        if (haveKeys.length !== neededKeys.length) continue;

        let ok = true;
        for (const k of neededKeys) {
            if (counts[k] !== needed[k]) { ok = false; break; }
        }
        if (ok) { matched = recipe; break; }
    }

    if (!matched) return;

    for (const k of Object.keys(matched.inputs)) {
        const blockId = Number(k);
        const needed = matched.inputs[blockId];
        if ((blockCounts[blockId] || 0) < needed) {
            showNotification('❌ Не хватает: ' + ALL_BLOCKS[blockId].name);
            return;
        }
    }

    for (const k of Object.keys(matched.inputs)) {
        const blockId = Number(k);
        blockCounts[blockId] -= matched.inputs[blockId];
    }

    if (blockCounts[matched.output] === undefined) blockCounts[matched.output] = 0;
    blockCounts[matched.output]++;

    if (!unlockedBlocks.includes(matched.output)) unlockedBlocks.push(matched.output);

    craftingGrid = {};
    renderCraftingGrid();
    initHotbar();
    checkRecipe();

    showNotification('✅ Создано: ' + matched.name);
}
window.craftItem = craftItem;

function resetCrafting() {
    craftingGrid = {};
    renderCraftingGrid();
    checkRecipe();
}
window.resetCrafting = resetCrafting;

function showNotification(text) {
    const notif = document.getElementById('craft-notification');
    if (!notif) return;
    notif.textContent = text;
    notif.classList.add('show');
    setTimeout(() => notif.classList.remove('show'), 2000);
}

function initHotbar() {
    const invBar = document.getElementById('inventory-bar');
    if (!invBar) return;
    invBar.innerHTML = '';

    unlockedBlocks.forEach((blockId, index) => {
        const block = ALL_BLOCKS[blockId];
        const count = blockCounts[blockId] || 0;

        const slot = document.createElement('div');
        slot.className = 'inv-slot';
        slot.setAttribute('data-hotbar', 'true');
        if (index === selectedSlot) slot.classList.add('active');
        if (count <= 0) slot.classList.add('empty');

        const img = document.createElement('img');
        img.className = 'inv-icon-img';
        img.src = getIcon(blockId);
        slot.appendChild(img);

        const num = document.createElement('span');
        num.className = 'inv-num';
        num.textContent = (index + 1);
        slot.appendChild(num);

        const cnt = document.createElement('span');
        cnt.className = 'inv-count';
        if (count >= 999) { cnt.textContent = '∞'; cnt.classList.add('inf'); }
        else cnt.textContent = count;
        slot.appendChild(cnt);

        slot.onclick = () => selectSlot(index);
        invBar.appendChild(slot);
    });
}

function initInventoryModal() {
    const modal = document.getElementById('inventory-modal-grid');
    if (!modal) return;
    modal.innerHTML = '';

    unlockedBlocks.forEach((blockId, index) => {
        const block = ALL_BLOCKS[blockId];
        const count = blockCounts[blockId] || 0;

        const slot = document.createElement('div');
        slot.className = 'inv-modal-slot';
        if (index === selectedSlot) slot.classList.add('active');
        if (count <= 0) slot.classList.add('empty');

        const img = document.createElement('img');
        img.className = 'inv-icon-img';
        img.src = getIcon(blockId);
        slot.appendChild(img);

        const cnt = document.createElement('span');
        cnt.className = 'inv-count';
        if (count >= 999) { cnt.textContent = '∞'; cnt.classList.add('inf'); }
        else cnt.textContent = count;
        slot.appendChild(cnt);

        slot.title = block.name;
        slot.onclick = () => addToCraftingGrid(blockId);
        modal.appendChild(slot);
    });
}

const closeBtn = document.querySelector('.inv-modal-close');
if (closeBtn) closeBtn.onclick = toggleInventory;

const craftBtn = document.getElementById('craft-btn');
if (craftBtn) craftBtn.onclick = craftItem;

const resetBtn = document.getElementById('craft-reset-btn');
if (resetBtn) resetBtn.onclick = resetCrafting;

const pauseResumeBtn = document.getElementById('pause-resume-btn');
if (pauseResumeBtn) pauseResumeBtn.onclick = closePause;

const pauseEditBtn = document.getElementById('pause-edit-btn');
if (pauseEditBtn) {
    pauseEditBtn.onclick = () => {
        closePause();
        toggleEditMode();
    };
}

const pauseExitBtn = document.getElementById('pause-exit-btn');
if (pauseExitBtn) pauseExitBtn.onclick = exitToMenu;

const savedMode = localStorage.getItem('cubeLifeMode');
if (savedMode) {
    startGame(savedMode);
} else {
    const startEl = document.getElementById('start-menu');
    if (startEl) startEl.classList.remove('hidden');
}
