// ============================================================
// CUBE LIFE — Этап 13: Прыжок + Присед
// ============================================================

const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
}

const canvas = document.getElementById('game-canvas');
const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.Fog(0x87CEEB, 30, 80);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 500);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: false,
    powerPreference: "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(1);

scene.add(new THREE.AmbientLight(0xffffff, 0.75));
const sunLight = new THREE.DirectionalLight(0xffffff, 0.6);
sunLight.position.set(50, 100, 30);
scene.add(sunLight);

// ============================================================
// ХЕЛПЕРЫ
// ============================================================

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
    c.width = size;
    c.height = size;
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
    c.width = size;
    c.height = size;
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
    c.width = size;
    c.height = size;
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

function createStoneMaterial() {
    return new THREE.MeshLambertMaterial({ map: createTexture('#808080') });
}

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

function createLeafMaterial() {
    return new THREE.MeshLambertMaterial({ map: createTexture('#2D5A1E', 40) });
}

function createDirtMaterial() {
    return new THREE.MeshLambertMaterial({ map: createTexture('#5A3A1A', 40) });
}

function createPlankMaterial() {
    return new THREE.MeshLambertMaterial({ map: createPlankTexture() });
}

function createBrickMaterial() {
    const size = 64;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
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

function createSandMaterial() {
    return new THREE.MeshLambertMaterial({ map: createTexture('#E8D5A0', 15) });
}

function createCoalMaterial() {
    return new THREE.MeshLambertMaterial({ map: createTexture('#2A2A2A', 40) });
}

// ============================================================
// ВСЕ БЛОКИ
// ============================================================

const ALL_BLOCKS = [
    { id: 0, name: 'Трава',  material: createGrassMaterial(),  color: '#5AAD3A', secondaryColor: '#4A9D2A' },
    { id: 1, name: 'Камень', material: createStoneMaterial(),  color: '#808080', secondaryColor: '#6F6F6F' },
    { id: 2, name: 'Дерево', material: createWoodMaterial(),   color: '#6B4423', secondaryColor: '#5A3A1F' },
    { id: 3, name: 'Листва', material: createLeafMaterial(),   color: '#2D5A1E', secondaryColor: '#1D4A0E' },
    { id: 4, name: 'Земля',  material: createDirtMaterial(),   color: '#5A3A1A', secondaryColor: '#4A2F18' },
    { id: 5, name: 'Доски',  material: createPlankMaterial(),  color: '#A0703A', secondaryColor: '#8B6535' },
    { id: 6, name: 'Кирпич', material: createBrickMaterial(),  color: '#B03030', secondaryColor: '#8B2020' },
    { id: 7, name: 'Песок',  material: createSandMaterial(),   color: '#E8D5A0', secondaryColor: '#C8B580' },
    { id: 8, name: 'Уголь',  material: createCoalMaterial(),   color: '#2A2A2A', secondaryColor: '#000000' }
];

let unlockedBlocks = [0, 1, 2, 3, 4];

let selectedSlot = 0;
let inventoryOpen = false;
const ICON_CACHE = {};

// ============================================================
// БЛОКИ В МИРЕ
// ============================================================

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

const WORLD_SIZE = 8;
const grassMaterial = createGrassMaterial();

for (let x = -WORLD_SIZE / 2; x < WORLD_SIZE / 2; x++) {
    for (let z = -WORLD_SIZE / 2; z < WORLD_SIZE / 2; z++) {
        createBlock(x, 0, z, grassMaterial);
    }
}

const stoneMaterial = createStoneMaterial();

createBlock(2, 1, 2, stoneMaterial);
createBlock(3, 1, 2, stoneMaterial);
createBlock(2, 1, 3, stoneMaterial);
createBlock(3, 1, 3, stoneMaterial);
createBlock(2, 2, 2, stoneMaterial);
createBlock(3, 2, 2, stoneMaterial);

const woodMaterial = createWoodMaterial();
const leafMaterial = createLeafMaterial();

const treeX = -3;
const treeZ = -3;

createBlock(treeX, 1, treeZ, woodMaterial);
createBlock(treeX, 2, treeZ, woodMaterial);
createBlock(treeX, 3, treeZ, woodMaterial);
createBlock(treeX, 4, treeZ, woodMaterial);
createBlock(treeX, 5, treeZ, woodMaterial);

createBlock(treeX - 2, 5, treeZ, leafMaterial);
createBlock(treeX + 2, 5, treeZ, leafMaterial);
createBlock(treeX, 5, treeZ - 2, leafMaterial);
createBlock(treeX, 5, treeZ + 2, leafMaterial);

createBlock(treeX - 1, 5, treeZ - 2, leafMaterial);
createBlock(treeX + 1, 5, treeZ - 2, leafMaterial);
createBlock(treeX - 1, 5, treeZ + 2, leafMaterial);
createBlock(treeX + 1, 5, treeZ + 2, leafMaterial);

createBlock(treeX - 2, 5, treeZ - 1, leafMaterial);
createBlock(treeX + 2, 5, treeZ - 1, leafMaterial);
createBlock(treeX - 2, 5, treeZ + 1, leafMaterial);
createBlock(treeX + 2, 5, treeZ + 1, leafMaterial);

for (let dx = -2; dx <= 2; dx++) {
    for (let dz = -2; dz <= 2; dz++) {
        createBlock(treeX + dx, 6, treeZ + dz, leafMaterial);
    }
}

for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
        createBlock(treeX + dx, 7, treeZ + dz, leafMaterial);
    }
}

createBlock(treeX, 8, treeZ, leafMaterial);

const highlightBox = new THREE.Mesh(
    new THREE.BoxGeometry(BLOCK_SIZE + 0.02, BLOCK_SIZE + 0.02, BLOCK_SIZE + 0.02),
    new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.8
    })
);
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

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), skinMat);
    head.position.y = 1.75;
    human.add(head);

    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const eyeGeom = new THREE.BoxGeometry(0.1, 0.1, 0.05);

    const eyeLeft = new THREE.Mesh(eyeGeom, eyeMat);
    eyeLeft.position.set(-0.12, 1.8, 0.26);
    human.add(eyeLeft);

    const eyeRight = new THREE.Mesh(eyeGeom, eyeMat);
    eyeRight.position.set(0.12, 1.8, 0.26);
    human.add(eyeRight);

    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.15, 0.52), hairMat);
    hair.position.y = 1.98;
    human.add(hair);

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.7, 0.3), shirtMat);
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
human.position.set(0, 0, 0);
scene.add(human);

// ============================================================
// УПРАВЛЕНИЕ
// ============================================================

const keys = {};

const player = {
    x: 0,
    z: 0,
    y: 0,           // высота (для прыжка)
    vy: 0,          // вертикальная скорость
    angle: 0,
    speed: 0.08,
    turnSpeed: 0.05,
    isJumping: false,
    isCrouching: false
};

const GRAVITY = -0.015;
const JUMP_FORCE = 0.18;

let cameraMode = 3;
let cameraFollowAngle = 0;
let cameraPitchAngle = 0;

const KEY_MAP = { 'ц': 'w', 'ф': 'a', 'ы': 's', 'в': 'd', 'м': 'v', 'н': 'y' };

document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    const normalizedKey = KEY_MAP[key] || key;
    keys[normalizedKey] = true;

    if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' '].includes(key)) e.preventDefault();
    if (normalizedKey === 'v') toggleCamera();
    if (normalizedKey === 'y') toggleInventory();
    if (['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(key)) selectSlot(parseInt(key) - 1);
    if (key === 'escape' && inventoryOpen) toggleInventory();

    // Прыжок
    if (key === ' ' || normalizedKey === 'space') {
        jump();
    }
});

document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    const normalizedKey = KEY_MAP[key] || key;
    keys[normalizedKey] = false;
});

document.addEventListener('wheel', (e) => {
    if (isPointerLocked && !inventoryOpen) {
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

// ============ ПРЫЖОК ============

function jump() {
    if (inventoryOpen) return;
    if (player.isJumping) return; // уже в воздухе
    player.vy = JUMP_FORCE;
    player.isJumping = true;
}
window.jump = jump;

// ============ ПРИСЕД ============

// Присед — через ShiftLeft или ShiftRight
document.addEventListener('keydown', (e) => {
    if (e.key === 'Shift') {
        player.isCrouching = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'Shift') {
        player.isCrouching = false;
    }
});

// Для мобильных — кнопка
function crouchStart() {
    player.isCrouching = true;
}
function crouchEnd() {
    player.isCrouching = false;
}
window.crouchStart = crouchStart;
window.crouchEnd = crouchEnd;

let isPointerLocked = false;

if (!isMobile) {
    canvas.addEventListener('click', () => {
        if (!isPointerLocked && !inventoryOpen) {
            canvas.requestPointerLock().catch(err => console.log(err));
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
    const intersects = raycaster.intersectObjects(Array.from(blockMap.values()));
    if (intersects.length > 0) return intersects[0];
    return null;
}

function breakBlock() {
    if (inventoryOpen) return;
    const hit = getTargetBlock();
    if (!hit) return;
    const block = hit.object;

    const dx = Math.abs(block.position.x - player.x);
    const dz = Math.abs(block.position.z - player.z);
    if (dx < 0.6 && dz < 0.6 && block.position.y < 1) return;

    removeBlock(block);
}

function placeBlock() {
    if (inventoryOpen) return;
    const hit = getTargetBlock();
    if (!hit) return;

    const normal = hit.face.normal.clone();
    const newPos = hit.object.position.clone().add(normal);

    const key = blockKey(newPos.x, newPos.y, newPos.z);
    if (blockMap.has(key)) return;

    const dx = Math.abs(newPos.x - player.x);
    const dz = Math.abs(newPos.z - player.z);
    const dy = newPos.y - (player.y + 0.5);
    if (dx < 0.6 && dz < 0.6 && dy > -0.5 && dy < 1.5) return;
    if (newPos.y < 0) return;

    const blockId = unlockedBlocks[selectedSlot];
    createBlock(newPos.x, newPos.y, newPos.z, ALL_BLOCKS[blockId].material);
}

window.breakBlockBtn = breakBlock;
window.placeBlockBtn = placeBlock;

if (!isMobile) {
    document.addEventListener('mousedown', (e) => {
        if (inventoryOpen) return;
        if (e.button === 0) placeBlock();
        else if (e.button === 2) breakBlock();
    });

    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
}

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

// ============================================================
// ОБНОВЛЕНИЕ
// ============================================================

function update() {
    if (!inventoryOpen) {
        if (keys['a'] || keys['arrowleft']) player.angle += player.turnSpeed;
        if (keys['d'] || keys['arrowright']) player.angle -= player.turnSpeed;

        // Скорость зависит от приседа
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

    // ============ ФИЗИКА ПРЫЖКА ============
    player.vy += GRAVITY;
    player.y += player.vy;

    // Приземление
    if (player.y <= 0) {
        player.y = 0;
        player.vy = 0;
        player.isJumping = false;
    }

    const limit = WORLD_SIZE / 2 - 0.5;
    player.x = Math.max(-limit, Math.min(limit, player.x));
    player.z = Math.max(-limit, Math.min(limit, player.z));

    // Приседание уменьшает высоту
    const crouchOffset = player.isCrouching ? -0.3 : 0;

    human.position.x = player.x;
    human.position.z = player.z;
    human.position.y = player.y + 0.5 + crouchOffset;
    human.rotation.y = player.angle;

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

    if (!inventoryOpen) {
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
});

if (!isMobile) {
    const mobileOnly = document.querySelectorAll('.mobile-only');
    mobileOnly.forEach(el => el.style.display = 'none');
}

// ============================================================
// ИКОНКИ
// ============================================================

function makeInvIcon(color, secondaryColor) {
    const size = 64;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
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

// ============================================================
// ПРЕВЬЮ
// ============================================================

function drawPlayerPreview() {
    const c = document.getElementById('player-preview');
    if (!c) return;

    const ctx = c.getContext('2d');
    const W = c.width;
    const H = c.height;

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

    const cx = W / 2;
    const cy = H - 22;

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

    ctx.fillStyle = '#000000';
    ctx.fillRect(cx - 6, cy - 62, 3, 3);
    ctx.fillRect(cx + 3, cy - 62, 3, 3);

    ctx.fillStyle = '#cc6666';
    ctx.fillRect(cx - 4, cy - 54, 8, 2);

    ctx.fillStyle = '#4a2c0a';
    ctx.fillRect(cx - 11, cy - 72, 22, 6);
    ctx.fillRect(cx - 11, cy - 66, 3, 12);
    ctx.fillRect(cx + 8, cy - 66, 3, 12);
}

// ============================================================
// КРАФТ
// ============================================================

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
            if (counts[k] !== needed[k]) {
                ok = false;
                break;
            }
        }
        if (ok) {
            matched = recipe;
            break;
        }
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
            if (counts[k] !== needed[k]) {
                ok = false;
                break;
            }
        }
        if (ok) {
            matched = recipe;
            break;
        }
    }

    if (!matched) return;

    // Разблокируем блок, если его ещё нет
    if (!unlockedBlocks.includes(matched.output)) {
        unlockedBlocks.push(matched.output);
    }

    craftingGrid = {};
    renderCraftingGrid();
    initHotbar();
    checkRecipe();

    const notif = document.getElementById('craft-notification');
    if (notif) {
        notif.textContent = `✅ Создано: ${matched.name}`;
        notif.classList.add('show');
        setTimeout(() => notif.classList.remove('show'), 2000);
    }
}
window.craftItem = craftItem;

function resetCrafting() {
    craftingGrid = {};
    renderCraftingGrid();
    checkRecipe();
}
window.resetCrafting = resetCrafting;

// ============================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================

function initHotbar() {
    const invBar = document.getElementById('inventory-bar');
    if (!invBar) return;
    invBar.innerHTML = '';

    unlockedBlocks.forEach((blockId, index) => {
        const block = ALL_BLOCKS[blockId];
        const slot = document.createElement('div');
        slot.className = 'inv-slot';
        slot.setAttribute('data-hotbar', 'true');
        if (index === selectedSlot) slot.classList.add('active');

        const img = document.createElement('img');
        img.className = 'inv-icon-img';
        img.src = getIcon(blockId);
        slot.appendChild(img);

        const num = document.createElement('span');
        num.className = 'inv-num';
        num.textContent = (index + 1);
        slot.appendChild(num);

        slot.onclick = () => selectSlot(index);
        invBar.appendChild(slot);
    });
}

function initInventoryModal() {
    const modal = document.getElementById('inventory-modal-grid');
    if (!modal) return;
    modal.innerHTML = '';

    // Показываем только разблокированные блоки
    unlockedBlocks.forEach((blockId, index) => {
        const block = ALL_BLOCKS[blockId];
        const slot = document.createElement('div');
        slot.className = 'inv-modal-slot';
        if (index === selectedSlot) slot.classList.add('active');

        const img = document.createElement('img');
        img.className = 'inv-icon-img';
        img.src = getIcon(blockId);
        slot.appendChild(img);

        slot.title = block.name;

        slot.onclick = () => addToCraftingGrid(blockId);
        modal.appendChild(slot);
    });
}

initHotbar();
initInventoryModal();

const yBtn = document.createElement('button');
yBtn.id = 'inventory-toggle-btn';
yBtn.innerHTML = '🎒';
yBtn.onclick = toggleInventory;
document.body.appendChild(yBtn);

// Кнопка прыжка (мобильные)
const jumpBtn = document.createElement('button');
jumpBtn.id = 'jump-btn';
jumpBtn.innerHTML = '🔼';
jumpBtn.onclick = jump;
document.body.appendChild(jumpBtn);

// Кнопка приседа (мобильные)
const crouchBtn = document.createElement('button');
crouchBtn.id = 'crouch-btn';
crouchBtn.innerHTML = '🔽';
crouchBtn.ontouchstart = crouchStart;
crouchBtn.ontouchend = crouchEnd;
crouchBtn.onmousedown = crouchStart;
crouchBtn.onmouseup = crouchEnd;
document.body.appendChild(crouchBtn);

const closeBtn = document.querySelector('.inv-modal-close');
if (closeBtn) closeBtn.onclick = toggleInventory;

const craftBtn = document.getElementById('craft-btn');
if (craftBtn) craftBtn.onclick = craftItem;

const resetBtn = document.getElementById('craft-reset-btn');
if (resetBtn) resetBtn.onclick = resetCrafting;

selectSlot(0);
