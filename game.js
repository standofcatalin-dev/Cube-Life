// ============================================================
// CRA 3D — Этап 1 (оптимизированная версия)
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
scene.fog = new THREE.Fog(0x87CEEB, 40, 120); // ближе туман = меньше рендера

// ============ КАМЕРА ============
const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.5,
    300
);
camera.position.set(0, 8, 15);

// ============ РЕНДЕРЕР ============
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: false,          // ОТКЛЮЧЕНО — сильно ускоряет
    powerPreference: "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(1);     // ВАЖНО: 1 вместо 2 = x4 быстрее
renderer.shadowMap.enabled = false;  // ТЕНИ ОТКЛЮЧЕНЫ — главный ускоритель

// ============ ОСВЕЩЕНИЕ ============
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
sunLight.position.set(50, 100, 30);
scene.add(sunLight);

// ============ ЗЕМЛЯ ============
const groundGeometry = new THREE.PlaneGeometry(500, 500);
const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// ============ ДОРОГИ ============
const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x111111 });
const roadLineMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc00 });

const road1 = new THREE.Mesh(new THREE.PlaneGeometry(400, 10), roadMaterial);
road1.rotation.x = -Math.PI / 2;
road1.position.y = 0.02;
scene.add(road1);

const road2 = new THREE.Mesh(new THREE.PlaneGeometry(10, 400), roadMaterial);
road2.rotation.x = -Math.PI / 2;
road2.position.y = 0.02;
scene.add(road2);

// Разметка (минимум)
for (let i = -180; i <= 180; i += 30) {
    const l1 = new THREE.Mesh(new THREE.PlaneGeometry(6, 0.4), roadLineMaterial);
    l1.rotation.x = -Math.PI / 2;
    l1.position.set(i, 0.03, 0);
    scene.add(l1);

    const l2 = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 6), roadLineMaterial);
    l2.rotation.x = -Math.PI / 2;
    l2.position.set(0, 0.03, i);
    scene.add(l2);
}

// ============ ЗДАНИЯ (всего 6, без окон) ============
function createBuilding(x, z, width, height, depth, color) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshLambertMaterial({ color: color });
    const building = new THREE.Mesh(geometry, material);
    building.position.set(x, height / 2, z);
    scene.add(building);
}

const buildingsData = [
    { x: -25, z: -25, w: 12, h: 25, d: 12, color: 0x8B4513 },
    { x: -25, z:  20, w: 12, h: 20, d: 12, color: 0xA0522D },
    { x:  25, z: -25, w: 12, h: 30, d: 12, color: 0x696969 },
    { x:  25, z:  20, w: 12, h: 22, d: 12, color: 0x808080 },
    { x: -55, z:  0,  w: 15, h: 40, d: 15, color: 0x4B4B4B },
    { x:  55, z:  0,  w: 15, h: 35, d: 15, color: 0x555555 },
];

buildingsData.forEach(b => createBuilding(b.x, b.z, b.w, b.h, b.d, b.color));

// ============ МАШИНА ============
const car = new THREE.Group();

// Кузов
const bodyGeom = new THREE.BoxGeometry(2, 0.7, 4);
const bodyMat = new THREE.MeshLambertMaterial({ color: 0xffc800 });
const body = new THREE.Mesh(bodyGeom, bodyMat);
body.position.y = 0.6;
car.add(body);

// Крыша
const roofGeom = new THREE.BoxGeometry(1.6, 0.7, 2);
const roofMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
const roof = new THREE.Mesh(roofGeom, roofMat);
roof.position.y = 1.3;
roof.position.z = -0.2;
car.add(roof);

// Стёкла
const glassGeom = new THREE.BoxGeometry(1.5, 0.5, 0.1);
const glassMat = new THREE.MeshBasicMaterial({
    color: 0x88ccff,
    transparent: true,
    opacity: 0.6
});
const windshield = new THREE.Mesh(glassGeom, glassMat);
windshield.position.set(0, 1.1, 0.85);
car.add(windshield);

// Колёса
const wheelGeom = new THREE.CylinderGeometry(0.4, 0.4, 0.35, 8); // 8 сегментов вместо 16
const wheelMat = new THREE.MeshLambertMaterial({ color: 0x111111 });

const wheelPositions = [
    { x: -1.05, z: 1.3 },
    { x:  1.05, z: 1.3 },
    { x: -1.05, z: -1.3 },
    { x:  1.05, z: -1.3 }
];

const wheelMeshes = [];
wheelPositions.forEach(w => {
    const wheel = new THREE.Mesh(wheelGeom, wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(w.x, 0.4, w.z);
    car.add(wheel);
    wheelMeshes.push(wheel);
});

scene.add(car);

// ============ УПРАВЛЕНИЕ ============
const keys = {};
const carState = {
    speed: 0,
    angle: 0,
    maxSpeed: 0.5,
    accel: 0.02,
    brake: 0.04,
    friction: 0.96,
    turnSpeed: 0.04
};

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) {
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// === ФУНКЦИИ ДЛЯ КНОПОК (на мобильных) ===
function pressKey(key) {
    keys[key] = true;
}
function releaseKey(key) {
    keys[key] = false;
}

// Подключаем кнопки на экране
window.pressKey = pressKey;
window.releaseKey = releaseKey;

// ============ ОБНОВЛЕНИЕ ============
function update() {
    if (keys['w'] || keys['arrowup']) {
        carState.speed += carState.accel;
    } else if (keys['s'] || keys['arrowdown']) {
        carState.speed -= carState.brake;
    }

    carState.speed = Math.max(
        -carState.maxSpeed / 2,
        Math.min(carState.maxSpeed, carState.speed)
    );

    carState.speed *= carState.friction;

    if (Math.abs(carState.speed) > 0.01) {
        const direction = carState.speed > 0 ? 1 : -1;
        if (keys['a'] || keys['arrowleft']) {
            carState.angle += carState.turnSpeed * direction;
        }
        if (keys['d'] || keys['arrowright']) {
            carState.angle -= carState.turnSpeed * direction;
        }
    }

    car.position.x += Math.sin(carState.angle) * carState.speed;
    car.position.z += Math.cos(carState.angle) * carState.speed;
    car.rotation.y = carState.angle;

    wheelMeshes.forEach(w => {
        w.rotation.x += carState.speed * 2;
    });

    const camDist = 12;
    const camHeight = 6;
    const camTargetX = car.position.x - Math.sin(carState.angle) * camDist;
    const camTargetZ = car.position.z - Math.cos(carState.angle) * camDist;

    camera.position.x += (camTargetX - camera.position.x) * 0.1;
    camera.position.z += (camTargetZ - camera.position.z) * 0.1;
    camera.position.y += (camHeight - camera.position.y) * 0.1;

    camera.lookAt(
        car.position.x + Math.sin(carState.angle) * 5,
        car.position.y + 1,
        car.position.z + Math.cos(carState.angle) * 5
    );

    document.getElementById('speed').textContent = Math.round(Math.abs(carState.speed) * 200);
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
