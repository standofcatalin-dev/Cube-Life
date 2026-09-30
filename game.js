// ============================================================
// CUBE LIFE — Этап 2.1: Управление мышью + 2 камеры
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
// ТЕКСТУРЫ
// ============================================================

function createTexture(color, noise = true) {
    const size = 64;
    const canvas2 = document.createElement('canvas');
    canvas2.width = size;
    canvas2.height = size;
    const ctx = canvas2.getContext('2d');

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size, size);

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

// ============ МАТЕРИАЛЫ ============

function createGrassMaterial() {
    const topTex = createTexture('#5aad3a');
    const sideTex = createTexture('#8B6535');
    const bottomTex = createTexture('#6B4513');

    const topMat = new THREE.MeshLambertMaterial({ map: topTex });
    const sideMat = new THREE.MeshLambertMaterial({ map: sideTex });
    const bottomMat = new THREE.MeshLambertMaterial({ map: bottomTex });

    return [sideMat, sideMat, topMat, bottomMat, sideMat, sideMat];
}

function createStoneMaterial() {
    const tex = createTexture('#808080');
    return new THREE.MeshLambertMaterial({ map: tex });
}

function createWoodMaterial() {
    const tex = createTexture('#6B4423');
    return new THREE.MeshLambertMaterial({ map: tex });
}

function createLeafMaterial() {
    const tex = createTexture('#2d5a1e');
    return new THREE.MeshLambertMaterial({ map: tex });
}

// ============ БЛОКИ ============

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
// ЧЕЛОВЕЧЕК
// ============================================================

function createHuman() {
    const human = new THREE.Group();

    const skinMat = new THREE.MeshLambertMaterial({ color: 0xffcc99 });
    const shirtMat = new THREE.MeshLambertMaterial({ color: 0x3366cc });
    const pantsMat = new THREE.MeshLambertMaterial({ color: 0x333366 });
    const shoeMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const hairMat = new THREE.MeshLambertMaterial({ color: 0x4a2c0a });

    // Голова
    const headGeom = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const head = new THREE.Mesh(headGeom, skinMat);
    head.position.y = 1.75;
    human.add(head);

    // Глаза
    const eyeGeom = new THREE.BoxGeometry(0.1, 0.1, 0.05);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

    const eyeLeft = new THREE.Mesh(eyeGeom, eyeMat);
    eyeLeft.position.set(-0.12, 1.8, 0.26);
    human.add(eyeLeft);

    const eyeRight = new THREE.Mesh(eyeGeom, eyeMat);
    eyeRight.position.set(0.12, 1.8, 0.26);
    human.add(eyeRight);

    // Волосы
    const hairGeom = new THREE.BoxGeometry(0.52, 0.15, 0.52);
    const hair = new THREE.Mesh(hairGeom, hairMat);
    hair.position.y = 1.98;
    human.add(hair);

    // Тело
    const bodyGeom = new THREE.BoxGeometry(0.55, 0.7, 0.3);
    const body = new THREE.Mesh(bodyGeom, shirtMat);
    body.position.y = 1.15;
    human.add(body);

    // Руки
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

    // Ноги
    const legGeom = new THREE.BoxGeometry(0.22, 0.6, 0.22);

    const legLeft = new THREE.Mesh(legGeom, pantsMat);
    legLeft.position.set(-0.15, 0.5, 0);
    human.add(legLeft);

    const legRight = new THREE.Mesh(legGeom, pantsMat);
    legRight.position.set(0.15, 0.5, 0);
    human.add(legRight);

    // Обувь
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

// Позиция человечка
const player = {
    x: 0,
    z: 0,
    angle: 0,
    speed: 0.08,
    turnSpeed: 0.05 
};

// Камера
let cameraMode = 3;              // 1 = от 1-го лица, 3 = от 3-го лица
let cameraFollowAngle = 0;       // угол камеры для 3-го лица
let cameraPitchAngle = 0;        // вертикальный наклон камеры

// ============ КЛАВИАТУРА ============
document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' '].includes(e.key.toLowerCase())) {
        e.preventDefault();
    }
    if (e.key.toLowerCase() === 'v') {
        toggleCamera();
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

function toggleCamera() {
    cameraMode = cameraMode === 3 ? 1 : 3;
    document.getElementById('camera-mode').textContent =
        cameraMode === 3 ? '3-е лицо' : '1-е лицо';
}
window.toggleCamera = toggleCamera;

// ============ МЫШЬ — вращение камеры ============
let isMouseDown = false;
let lastMouseX = 0;
let lastMouseY = 0;

canvas.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

document.addEventListener('mouseup', () => {
    isMouseDown = false;
});

document.addEventListener('mousemove', (e) => {
    if (!isMouseDown) return;

    const deltaX = e.clientX - lastMouseX;
    const deltaY = e.clientY - lastMouseY;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;

    if (cameraMode === 3) {
        // 3-е лицо: вращаем камеру вокруг человечка
        cameraFollowAngle -= deltaX * 0.01;
        cameraPitchAngle -= deltaY * 0.01;
        cameraPitchAngle = Math.max(-0.3, Math.min(0.8, cameraPitchAngle));
    } else {
        // 1-е лицо: поворачиваем самого человечка
        player.angle -= deltaX * 0.01;
    }
});

// ============ ТАЧ (телефон) ============
let lastTouchX = 0;
let lastTouchY = 0;

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
        cameraPitchAngle = Math.max(-0.3, Math.min(0.8, cameraPitchAngle));
    } else {
        player.angle -= deltaX * 0.01;
    }
}, { passive: true });

// ============ ОБНОВЛЕНИЕ ============
function update() {
    // Поворот человечка (A/D)
    if (keys['a'] || keys['arrowleft']) {
        player.angle += player.turnSpeed;
    }
    if (keys['d'] || keys['arrowright']) {
        player.angle -= player.turnSpeed;
    }

    // Движение вперёд/назад (W/S)
    if (keys['w'] || keys['arrowup']) {
        player.x += Math.sin(player.angle) * player.speed;
        player.z += Math.cos(player.angle) * player.speed;
    }
    if (keys['s'] || keys['arrowdown']) {
        player.x -= Math.sin(player.angle) * player.speed;
        player.z -= Math.cos(player.angle) * player.speed;
    }

    // Границы мира
    const limit = WORLD_SIZE / 2 - 0.5;
    player.x = Math.max(-limit, Math.min(limit, player.x));
    player.z = Math.max(-limit, Math.min(limit, player.z));

    // Применяем к человечку
    human.position.x = player.x;
    human.position.z = player.z;
    human.rotation.y = player.angle;

    // ============ КАМЕРА ============
    if (cameraMode === 3) {
        // === 3-Е ЛИЦО ===
        if (keys['left']) cameraFollowAngle += 0.03;
        if (keys['right']) cameraFollowAngle -= 0.03;

        const totalAngle = player.angle + cameraFollowAngle;
        const camDist = 6;
        const baseHeight = 4;
        const camHeight = baseHeight + cameraPitchAngle * 4;

        const targetX = player.x - Math.sin(totalAngle) * camDist;
        const targetZ = player.z - Math.cos(totalAngle) * camDist;
        const targetY = camHeight;

        camera.position.x += (targetX - camera.position.x) * 0.15;
        camera.position.z += (targetZ - camera.position.z) * 0.15;
        camera.position.y += (targetY - camera.position.y) * 0.15;

        camera.lookAt(player.x, 1.2, player.z);
        human.visible = true;
    } else {
        // === 1-Е ЛИЦО ===
        camera.position.x = player.x;
        camera.position.z = player.z;
        camera.position.y = 1.75;

        camera.lookAt(
            player.x + Math.sin(player.angle) * 5,
            1.75,
            player.z + Math.cos(player.angle) * 5
        );

        human.visible = false;
    }
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
