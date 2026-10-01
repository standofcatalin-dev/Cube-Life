// ============================================================
// CUBE LIFE — Этап 4.1: Реалистичные текстуры (как в Minecraft)
// ============================================================

const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
}

const canvas = document.getElementById('game-canvas');
const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

// ============ СЦЕНА ============
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.Fog(0x87CEEB, 30, 80);

// ============ КАМЕРА ============
const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    500
);

// ============ РЕНДЕРЕР ============
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: false,
    powerPreference: "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(1);

// ============ ОСВЕЩЕНИЕ ============
const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 0.6);
sunLight.position.set(50, 100, 30);
scene.add(sunLight);

// ============================================================
// ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ — создание canvas-текстуры
// ============================================================

function makeCanvas(size = 128) {
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    return c;
}

function textureFromCanvas(c) {
    const texture = new THREE.CanvasTexture(c);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    return texture;
}

// ============================================================
// ТЕКСТУРЫ БЛОКОВ (как в Minecraft)
// ============================================================

// ---------- ТРАВА (верх) ----------
function makeGrassTopTexture() {
    const size = 128;
    const c = makeCanvas(size);
    const ctx = c.getContext('2d');

    // Базовый зелёный
    ctx.fillStyle = '#5AAD3A';
    ctx.fillRect(0, 0, size, size);

    // Травинки (мелкие вертикальные линии)
    for (let i = 0; i < 350; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const w = 1 + Math.random() * 2;
        const h = 2 + Math.random() * 4;

        const colors = ['#4A9D2A', '#6ABD4A', '#3A8D1A', '#7ACD5A'];
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillRect(x, y, w, h);
    }

    // Тёмные точки
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        ctx.fillStyle = '#2A6D0A';
        ctx.fillRect(x, y, 2, 2);
    }

    return c;
}

// ---------- ЗЕМЛЯ (низ травы и блок "земля") ----------
function makeDirtTexture() {
    const size = 128;
    const c = makeCanvas(size);
    const ctx = c.getContext('2d');

    // Базовый коричневый
    ctx.fillStyle = '#8B5A3C';
    ctx.fillRect(0, 0, size, size);

    // Крупинки
    for (let i = 0; i < 500; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const w = 2 + Math.random() * 4;
        const h = 2 + Math.random() * 4;

        const colors = ['#6B4528', '#9B6B4C', '#5A3A1F', '#A07050', '#7A4E30'];
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillRect(x, y, w, h);
    }

    // Тёмные камушки
    for (let i = 0; i < 40; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = 1 + Math.random() * 2;
        ctx.fillStyle = '#4A2F18';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    return c;
}

// ---------- ТРАВА (бока — верх зелёный, низ коричневый) ----------
function makeGrassSideTexture() {
    const size = 128;
    const c = makeCanvas(size);
    const ctx = c.getContext('2d');

    // Основа — земля
    ctx.fillStyle = '#8B5A3C';
    ctx.fillRect(0, 0, size, size);

    // Крупинки земли
    for (let i = 0; i < 400; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const w = 2 + Math.random() * 4;
        const h = 2 + Math.random() * 4;

        const colors = ['#6B4528', '#9B6B4C', '#5A3A1F', '#A07050'];
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillRect(x, y, w, h);
    }

    // Верхняя зелёная полоса (трава свисает)
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * size;
        const h = 8 + Math.random() * 12;
        const w = 3 + Math.random() * 4;

        const colors = ['#5AAD3A', '#4A9D2A', '#6ABD4A'];
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillRect(x, 0, w, h);
    }

    // Основной зелёный слой сверху
    ctx.fillStyle = '#5AAD3A';
    ctx.fillRect(0, 0, size, 6);

    return c;
}

// ---------- КАМЕНЬ ----------
function makeStoneTexture() {
    const size = 128;
    const c = makeCanvas(size);
    const ctx = c.getContext('2d');

    // Базовый серый
    ctx.fillStyle = '#7F7F7F';
    ctx.fillRect(0, 0, size, size);

    // Пятна разных оттенков
    for (let i = 0; i < 300; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const w = 3 + Math.random() * 8;
        const h = 3 + Math.random() * 8;

        const colors = ['#6F6F6F', '#8F8F8F', '#5F5F5F', '#9F9F9F', '#7A7A7A'];
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillRect(x, y, w, h);
    }

    // Тёмные трещины
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = 1 + Math.random() * 2;
        ctx.fillStyle = '#4F4F4F';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    return c;
}

// ---------- ДЕРЕВО (ствол) ----------
function makeWoodSideTexture() {
    const size = 128;
    const c = makeCanvas(size);
    const ctx = c.getContext('2d');

    // Базовый цвет коры
    ctx.fillStyle = '#6B4A2A';
    ctx.fillRect(0, 0, size, size);

    // Вертикальные полосы
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * size;
        const w = 1 + Math.random() * 3;
        const color = Math.random() > 0.5 ? '#4F351A' : '#8B6535';
        ctx.fillStyle = color;
        ctx.fillRect(x, 0, w, size);
    }

    // Шум
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const variance = (Math.random() - 0.5) * 30;
        data[i] = Math.max(0, Math.min(255, data[i] + variance));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + variance));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + variance));
    }
    ctx.putImageData(imageData, 0, 0);

    return c;
}

// ---------- ДЕРЕВО (спил сверху — кольца) ----------
function makeWoodTopTexture() {
    const size = 128;
    const c = makeCanvas(size);
    const ctx = c.getContext('2d');

    // База
    ctx.fillStyle = '#A0703A';
    ctx.fillRect(0, 0, size, size);

    // Концентрические кольца
    const cx = size / 2;
    const cy = size / 2;
    for (let r = 5; r < 65; r += 5) {
        ctx.strokeStyle = '#6B4423';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Центральная точка
    ctx.fillStyle = '#4F351A';
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();

    // Шум
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const variance = (Math.random() - 0.5) * 20;
        data[i] = Math.max(0, Math.min(255, data[i] + variance));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + variance));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + variance));
    }
    ctx.putImageData(imageData, 0, 0);

    return c;
}

// ---------- ЛИСТВА ----------
function makeLeafTexture() {
    const size = 128;
    const c = makeCanvas(size);
    const ctx = c.getContext('2d');

    // База
    ctx.fillStyle = '#2D5A1E';
    ctx.fillRect(0, 0, size, size);

    // Пятна листвы
    for (let i = 0; i < 300; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const w = 2 + Math.random() * 5;
        const h = 2 + Math.random() * 5;

        const colors = ['#1D4A0E', '#3D6A2E', '#4D7A3E', '#2A5A18'];
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillRect(x, y, w, h);
    }

    // Прозрачные "дырки" (чёрные точки)
    for (let i = 0; i < 80; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        ctx.fillStyle = '#0A2A05';
        ctx.fillRect(x, y, 2, 2);
    }

    return c;
}

// ============================================================
// МАТЕРИАЛЫ
// ============================================================

function createGrassMaterial() {
    const topMat = new THREE.MeshLambertMaterial({ map: textureFromCanvas(makeGrassTopTexture()) });
    const sideMat = new THREE.MeshLambertMaterial({ map: textureFromCanvas(makeGrassSideTexture()) });
    const bottomMat = new THREE.MeshLambertMaterial({ map: textureFromCanvas(makeDirtTexture()) });

    return [sideMat, sideMat, topMat, bottomMat, sideMat, sideMat];
}

function createStoneMaterial() {
    return new THREE.MeshLambertMaterial({ map: textureFromCanvas(makeStoneTexture()) });
}

function createWoodMaterial() {
    const sideMat = new THREE.MeshLambertMaterial({ map: textureFromCanvas(makeWoodSideTexture()) });
    const topMat = new THREE.MeshLambertMaterial({ map: textureFromCanvas(makeWoodTopTexture()) });

    // Для дерева: бока — кора, верх/низ — кольца
    return [sideMat, sideMat, topMat, topMat, sideMat, sideMat];
}

function createLeafMaterial() {
    return new THREE.MeshLambertMaterial({ map: textureFromCanvas(makeLeafTexture()) });
}

function createDirtMaterial() {
    return new THREE.MeshLambertMaterial({ map: textureFromCanvas(makeDirtTexture()) });
}

// ============================================================
// ИНВЕНТАРЬ
// ============================================================

const INVENTORY = [
    { name: 'Трава',  material: createGrassMaterial(),  icon: '🟩' },
    { name: 'Камень', material: createStoneMaterial(),  icon: '⬜' },
    { name: 'Дерево', material: createWoodMaterial(),   icon: '🟫' },
    { name: 'Листва', material: createLeafMaterial(),   icon: '🌿' },
    { name: 'Земля',  material: createDirtMaterial(),   icon: '🟤' }
];

let selectedSlot = 0;

// ============ БЛОКИ ============

const BLOCK_SIZE = 1;
const blockMap = new Map();

function blockKey(x, y, z) {
    return `${Math.round(x)},${Math.round(y)},${Math.round(z)}`;
}

function createBlock(x, y, z, material) {
    const geometry = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    const block = new THREE.Mesh(geometry, material);
    block.position.set(x, y, z);
    block.userData.isBlock = true;
    scene.add(block);
    blockMap.set(blockKey(x, y, z), block);
    return block;
}

function removeBlock(block) {
    const key = blockKey(block.position.x, block.position.y, block.position.z);
    blockMap.delete(key);
    scene.remove(block);
    block.geometry.dispose();
}

// ============ МИР 8×8 ============
const WORLD_SIZE = 8;
const grassMaterial = createGrassMaterial();

for (let x = -WORLD_SIZE / 2; x < WORLD_SIZE / 2; x++) {
    for (let z = -WORLD_SIZE / 2; z < WORLD_SIZE / 2; z++) {
        createBlock(x, 0, z, grassMaterial);
    }
}

// ============ ПОСТРОЙКИ ============
const stoneMaterial = createStoneMaterial();

createBlock(2, 1, 2, stoneMaterial);
createBlock(3, 1, 2, stoneMaterial);
createBlock(2, 1, 3, stoneMaterial);
createBlock(3, 1, 3, stoneMaterial);
createBlock(2, 2, 2, stoneMaterial);
createBlock(3, 2, 2, stoneMaterial);

const woodMaterial = createWoodMaterial();
const leafMaterial = createLeafMaterial();

createBlock(-2, 1, -2, woodMaterial);
createBlock(-2, 2, -2, woodMaterial);
createBlock(-2, 3, -2, woodMaterial);

createBlock(-2, 4, -2, leafMaterial);
createBlock(-1, 4, -2, leafMaterial);
createBlock(-3, 4, -2, leafMaterial);
createBlock(-2, 4, -1, leafMaterial);
createBlock(-2, 4, -3, leafMaterial);
createBlock(-2, 5, -2, leafMaterial);

// ============================================================
// ПОДСВЕТКА БЛОКА
// ============================================================

const highlightGeometry = new THREE.BoxGeometry(
    BLOCK_SIZE + 0.02,
    BLOCK_SIZE + 0.02,
    BLOCK_SIZE + 0.02
);
const highlightMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    transparent: true,
    opacity: 0.8
});
const highlightBox = new THREE.Mesh(highlightGeometry, highlightMaterial);
highlightBox.visible = false;
scene.add(highlightBox);

// ============================================================
// ЧЕЛОВЕЧЕК
// ============================================================

function createHuman() {
    const human = new THREE.Group();

    const skinMat = new THREE.MeshLambertMaterial({ color: 0xffcc99 });
    const shirtMat = new THREE.MeshLambertMaterial({ color: 0x3366cc });
    const pantsMat = new THREE.MeshLambertMaterial({ color: 0x333366 });
    const shoeMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const hairMat = new THREE.MeshLambertMaterial({ color: 0x4a2c0a });

    const headGeom = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const head = new THREE.Mesh(headGeom, skinMat);
    head.position.y = 1.75;
    human.add(head);

    const eyeGeom = new THREE.BoxGeometry(0.1, 0.1, 0.05);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

    const eyeLeft = new THREE.Mesh(eyeGeom, eyeMat);
    eyeLeft.position.set(-0.12, 1.8, 0.26);
    human.add(eyeLeft);

    const eyeRight = new THREE.Mesh(eyeGeom, eyeMat);
    eyeRight.position.set(0.12, 1.8, 0.26);
    human.add(eyeRight);

    const hairGeom = new THREE.BoxGeometry(0.52, 0.15, 0.52);
    const hair = new THREE.Mesh(hairGeom, hairMat);
    hair.position.y = 1.98;
    human.add(hair);

    const bodyGeom = new THREE.BoxGeometry(0.55, 0.7, 0.3);
    const body = new THREE.Mesh(bodyGeom, shirtMat);
    body.position.y = 1.15;
    human.add(body);

    const armGeom = new THREE.BoxGeometry(0.2, 0.65, 0.2);

    const armLeft = new THREE.Mesh(armGeom, shirtMat);
    armLeft.position.set(-0.4, 1.15, 0);
    human.add(armLeft);

    const handGeom = new THREE.BoxGeometry(0.2, 0.15, 0.2);
    const handLeft = new THREE.Mesh(handGeom, skinMat);
    handLeft.position.set(-0.4, 0.75, 0);
    human.add(handLeft);

    const armRight = new THREE.Mesh(armGeom, shirtMat);
    armRight.position.set(0.4, 1.15, 0);
    human.add(armRight);

    const handRight = new THREE.Mesh(handGeom, skinMat);
    handRight.position.set(0.4, 0.75, 0);
    human.add(handRight);

    const legGeom = new THREE.BoxGeometry(0.22, 0.6, 0.22);

    const legLeft = new THREE.Mesh(legGeom, pantsMat);
    legLeft.position.set(-0.15, 0.5, 0);
    human.add(legLeft);

    const legRight = new THREE.Mesh(legGeom, pantsMat);
    legRight.position.set(0.15, 0.5, 0);
    human.add(legRight);

    const shoeGeom = new THREE.BoxGeometry(0.24, 0.12, 0.28);

    const shoeLeft = new THREE.Mesh(shoeGeom, shoeMat);
    shoeLeft.position.set(-0.15, 0.14, 0.02);
    human.add(shoeLeft);

    const shoeRight = new THREE.Mesh(shoeGeom, shoeMat);
    shoeRight.position.set(0.15, 0.14, 0.02);
    human.add(shoeRight);

    return human;
}

const human = createHuman();
human.position.set(0, 0.5, 0);
scene.add(human);

// ============================================================
// УПРАВЛЕНИЕ
// ============================================================

const keys = {};

const player = {
    x: 0,
    z: 0,
    angle: 0,
    speed: 0.08,
    turnSpeed: 0.05
};

let cameraMode = 3;
let cameraFollowAngle = 0;
let cameraPitchAngle = 0;

const KEY_MAP = {
    'ц': 'w', 'ф': 'a', 'ы': 's', 'в': 'd', 'м': 'v'
};

document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    const normalizedKey = KEY_MAP[key] || key;
    keys[normalizedKey] = true;

    if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' '].includes(key)) {
        e.preventDefault();
    }
    if (normalizedKey === 'v') {
        toggleCamera();
    }
    if (['1', '2', '3', '4', '5'].includes(key)) {
        selectSlot(parseInt(key) - 1);
    }
});

document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    const normalizedKey = KEY_MAP[key] || key;
    keys[normalizedKey] = false;
});

document.addEventListener('wheel', (e) => {
    if (isPointerLocked) {
        if (e.deltaY > 0) {
            selectSlot((selectedSlot + 1) % INVENTORY.length);
        } else {
            selectSlot((selectedSlot - 1 + INVENTORY.length) % INVENTORY.length);
        }
    }
});

function pressKey(key) {
    keys[key] = true;
}
function releaseKey(key) {
    keys[key] = false;
}
window.pressKey = pressKey;
window.releaseKey = releaseKey;

function toggleCamera() {
    cameraMode = cameraMode === 3 ? 1 : 3;
    document.getElementById('camera-mode').textContent =
        cameraMode === 3 ? '3-е лицо' : '1-е лицо';
}
window.toggleCamera = toggleCamera;

// ============ ВЫБОР БЛОКА ============

function selectSlot(index) {
    if (index < 0 || index >= INVENTORY.length) return;
    selectedSlot = index;

    document.querySelectorAll('.inv-slot').forEach((el, i) => {
        if (i === index) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });

    const item = INVENTORY[index];
    document.getElementById('selected-block').textContent = item.name;
}
window.selectSlot = selectSlot;

// ============ POINTER LOCK ============
let isPointerLocked = false;

if (!isMobile) {
    canvas.addEventListener('click', () => {
        if (!isPointerLocked) {
            canvas.requestPointerLock().catch(err => {
                console.log('Pointer lock error:', err);
            });
        }
    });

    document.addEventListener('pointerlockchange', () => {
        isPointerLocked = document.pointerLockElement === canvas;
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

// ============================================================
// РАЗРУШЕНИЕ / УСТАНОВКА
// ============================================================

const raycaster = new THREE.Raycaster();
const screenCenter = new THREE.Vector2(0, 0);

function getTargetBlock() {
    raycaster.setFromCamera(screenCenter, camera);
    const allBlocks = Array.from(blockMap.values());
    const intersects = raycaster.intersectObjects(allBlocks);
    if (intersects.length > 0) return intersects[0];
    return null;
}

function breakBlock() {
    const hit = getTargetBlock();
    if (!hit) return;
    const block = hit.object;

    const dx = Math.abs(block.position.x - player.x);
    const dz = Math.abs(block.position.z - player.z);
    if (dx < 0.6 && dz < 0.6 && block.position.y < 1) return;

    removeBlock(block);
}

function placeBlock() {
    const hit = getTargetBlock();
    if (!hit) return;

    const normal = hit.face.normal.clone();
    const newPos = hit.object.position.clone().add(normal);

    const key = blockKey(newPos.x, newPos.y, newPos.z);
    if (blockMap.has(key)) return;

    const dx = Math.abs(newPos.x - player.x);
    const dy = newPos.y - 0.5;
    const dz = Math.abs(newPos.z - player.z);
    if (dx < 0.6 && dz < 0.6 && dy > -0.5 && dy < 1.5) return;

    if (newPos.y < 0) return;

    createBlock(newPos.x, newPos.y, newPos.z, INVENTORY[selectedSlot].material);
}

window.breakBlockBtn = breakBlock;
window.placeBlockBtn = placeBlock;

// ============ МЫШЬ (ПК) ============
if (!isMobile) {
    document.addEventListener('mousedown', (e) => {
        if (e.button === 0) {
            placeBlock();
        } else if (e.button === 2) {
            breakBlock();
        }
    });

    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
}

// ============ ТАЧ (телефон) ============
let lastTouchX = 0;
let lastTouchY = 0;

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

// ============ ОБНОВЛЕНИЕ ============
function update() {
    if (keys['a'] || keys['arrowleft']) {
        player.angle += player.turnSpeed;
    }
    if (keys['d'] || keys['arrowright']) {
        player.angle -= player.turnSpeed;
    }

    if (keys['w'] || keys['arrowup']) {
        player.x += Math.sin(player.angle) * player.speed;
        player.z += Math.cos(player.angle) * player.speed;
    }
    if (keys['s'] || keys['arrowdown']) {
        player.x -= Math.sin(player.angle) * player.speed;
        player.z -= Math.cos(player.angle) * player.speed;
    }

    const limit = WORLD_SIZE / 2 - 0.5;
    player.x = Math.max(-limit, Math.min(limit, player.x));
    player.z = Math.max(-limit, Math.min(limit, player.z));

    human.position.x = player.x;
    human.position.z = player.z;
    human.rotation.y = player.angle;

    // ============ КАМЕРА ============
    if (cameraMode === 3) {
        if (keys['left']) cameraFollowAngle += 0.03;
        if (keys['right']) cameraFollowAngle -= 0.03;

        const totalAngle = player.angle + cameraFollowAngle;
        const camDist = 6;
        const baseHeight = 4 + cameraPitchAngle * 3;
        const camHeight = Math.max(0.5, baseHeight);

        const targetX = player.x - Math.sin(totalAngle) * camDist;
        const targetZ = player.z - Math.cos(totalAngle) * camDist;
        const targetY = camHeight;

        camera.position.x += (targetX - camera.position.x) * 0.15;
        camera.position.z += (targetZ - camera.position.z) * 0.15;
        camera.position.y += (targetY - camera.position.y) * 0.15;

        camera.lookAt(player.x, 1.2, player.z);
        human.visible = true;
    } else {
        camera.position.x = player.x;
        camera.position.z = player.z;
        camera.position.y = 1.75;

        const lookX = player.x + Math.sin(player.angle) * 5;
        const lookZ = player.z + Math.cos(player.angle) * 5;
        const lookY = 1.75 + cameraPitchAngle * 4;

        camera.lookAt(lookX, lookY, lookZ);
        human.visible = false;
    }

    // ============ ПОДСВЕТКА ============
    const hit = getTargetBlock();
    if (hit) {
        highlightBox.position.copy(hit.object.position);
        highlightBox.visible = true;
    } else {
        highlightBox.visible = false;
    }

    // ============ HUD ============
    document.getElementById('world-info').textContent = blockMap.size + ' блоков';
}

// ============ ЦИКЛ ============
function animate() {
    requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);
}

animate();

// ============ РЕСАЙЗ ============
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ============ СКРЫТЬ КНОПКИ НА ПК ============
if (!isMobile) {
    const mobileOnly = document.querySelectorAll('.mobile-only');
    mobileOnly.forEach(el => el.style.display = 'none');
}

// ============ ИНИЦИАЛИЗАЦИЯ ============
selectSlot(0);
