// ============================================================
// CUBE LIFE — Этап 1: 3D-сцена с блоками
// ============================================================

const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
}

const canvas = document.getElementById('game-canvas');

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
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 0.7);
sunLight.position.set(50, 100, 30);
scene.add(sunLight);

// ============================================================
// ТЕКСТУРЫ (процедурные — через canvas)
// ============================================================

function createTexture(color, noise = true) {
    const size = 64;
    const canvas2 = document.createElement('canvas');
    canvas2.width = size;
    canvas2.height = size;
    const ctx = canvas2.getContext('2d');

    // Базовый цвет
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size, size);

    // Шум для текстуры
    if (noise) {
        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const variance = (Math.random() - 0.5) * 30;
            data[i] = Math.max(0, Math.min(255, data[i] + variance));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + variance));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + variance));
        }
        ctx.putImageData(imageData, 0, 0);
    }

    const texture = new THREE.CanvasTexture(canvas2);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    return texture;
}

// ============ МАТЕРИАЛЫ БЛОКОВ ============

// Трава (верх — зелёный, бока — коричневый)
function createGrassMaterial() {
    const topTex = createTexture('#5aad3a');
    const sideTex = createTexture('#8B6535');
    const bottomTex = createTexture('#6B4513');

    const topMat = new THREE.MeshLambertMaterial({ map: topTex });
    const sideMat = new THREE.MeshLambertMaterial({ map: sideTex });
    const bottomMat = new THREE.MeshLambertMaterial({ map: bottomTex });

    // Порядок: +X, -X, +Y, -Y, +Z, -Z
    return [sideMat, sideMat, topMat, bottomMat, sideMat, sideMat];
}

// Земля (коричневая)
function createDirtMaterial() {
    const tex = createTexture('#6B4513');
    return new THREE.MeshLambertMaterial({ map: tex });
}

// Камень (серый)
function createStoneMaterial() {
    const tex = createTexture('#808080');
    return new THREE.MeshLambertMaterial({ map: tex });
}

// Дерево (ствол)
function createWoodMaterial() {
    const tex = createTexture('#6B4423');
    return new THREE.MeshLambertMaterial({ map: tex });
}

// Листья (тёмно-зелёные)
function createLeafMaterial() {
    const tex = createTexture('#2d5a1e');
    return new THREE.MeshLambertMaterial({ map: tex });
}

// ============ СОЗДАНИЕ БЛОКОВ ============

const BLOCK_SIZE = 1;
const blocks = [];

function createBlock(x, y, z, material) {
    const geometry = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    const block = new THREE.Mesh(geometry, material);
    block.position.set(x, y, z);
    scene.add(block);
    blocks.push(block);
    return block;
}

// ============================================================
// МИР — пол 8×8 блоков
// ============================================================

const WORLD_SIZE = 8;
const grassMaterial = createGrassMaterial();

for (let x = -WORLD_SIZE / 2; x < WORLD_SIZE / 2; x++) {
    for (let z = -WORLD_SIZE / 2; z < WORLD_SIZE / 2; z++) {
        createBlock(x, 0, z, grassMaterial);
    }
}

// ============================================================
// ПОСТРОЙКИ
// ============================================================

// ---- Небольшой холм из камня ----
const stoneMaterial = createStoneMaterial();
createBlock(2, 1, 2, stoneMaterial);
createBlock(3, 1, 2, stoneMaterial);
createBlock(2, 1, 3, stoneMaterial);
createBlock(3, 1, 3, stoneMaterial);
createBlock(2, 2, 2, stoneMaterial);
createBlock(3, 2, 2, stoneMaterial);

// ---- Дерево ----
const woodMaterial = createWoodMaterial();
const leafMaterial = createLeafMaterial();

// Ствол
createBlock(-2, 1, -2, woodMaterial);
createBlock(-2, 2, -2, woodMaterial);
createBlock(-2, 3, -2, woodMaterial);

// Листва (крест из блоков)
createBlock(-2, 4, -2, leafMaterial);
createBlock(-1, 4, -2, leafMaterial);
createBlock(-3, 4, -2, leafMaterial);
createBlock(-2, 4, -1, leafMaterial);
createBlock(-2, 4, -3, leafMaterial);
createBlock(-2, 5, -2, leafMaterial);

// ---- Каменная пирамидка ----
createBlock(0, 1, 4, stoneMaterial);
createBlock(1, 1, 4, stoneMaterial);
createBlock(-1, 1, 4, stoneMaterial);
createBlock(0, 2, 4, stoneMaterial);

// ============================================================
// УПРАВЛЕНИЕ — вращение камеры
// ============================================================

const keys = {};
let cameraAngle = 0;         // горизонтальное вращение
let cameraDistance = 12;     // расстояние от центра
let cameraHeight = 8;        // высота
let cameraPitch = -0.6;      // наклон вниз

const ROTATION_SPEED = 0.03;

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' '].includes(e.key.toLowerCase())) {
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

function pressKey(key) {
    keys[key] = true;
}
function releaseKey(key) {
    keys[key] = false;
}
window.pressKey = pressKey;
window.releaseKey = releaseKey;

// ============ ОБНОВЛЕНИЕ КАМЕРЫ ============
function update() {
    // Вращение камеры
    if (keys['left'] || keys['arrowleft']) {
        cameraAngle += ROTATION_SPEED;
    }
    if (keys['right'] || keys['arrowright']) {
        cameraAngle -= ROTATION_SPEED;
    }

    // Позиция камеры — круг вокруг центра мира
    camera.position.x = Math.sin(cameraAngle) * cameraDistance;
    camera.position.z = Math.cos(cameraAngle) * cameraDistance;
    camera.position.y = cameraHeight;

    // Камера смотрит в центр мира (примерно)
    camera.lookAt(0, 1, 0);
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

// ============ HUD ============
document.getElementById('world-info').textContent = blocks.length + ' блоков';
