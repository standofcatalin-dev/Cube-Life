// ============================================================
// CRA 3D — Этап 1: 3D-сцена, машина, город, камера
// ============================================================

// ============ ИНИЦИАЛИЗАЦИЯ TELEGRAM ============
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
}

// ============ CANVAS ============
const canvas = document.getElementById('game-canvas');

// ============ СЦЕНА ============
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.Fog(0x87CEEB, 60, 250);

// ============ КАМЕРА ============
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 8, 15);

// ============ РЕНДЕРЕР ============
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// ============ ОСВЕЩЕНИЕ ============
// Общий свет
const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
scene.add(ambientLight);

// Солнце
const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(50, 100, 30);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.left = -100;
sunLight.shadow.camera.right = 100;
sunLight.shadow.camera.top = 100;
sunLight.shadow.camera.bottom = -100;
sunLight.shadow.camera.near = 1;
sunLight.shadow.camera.far = 300;
scene.add(sunLight);

// ============ ЗЕМЛЯ ============
const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    roughness: 0.9
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// ============ ДОРОГИ ============
const roadMaterial = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.8
});
const roadLineMaterial = new THREE.MeshStandardMaterial({
    color: 0xffcc00
});

// Горизонтальная дорога
const road1 = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 10),
    roadMaterial
);
road1.rotation.x = -Math.PI / 2;
road1.position.y = 0.02;
road1.receiveShadow = true;
scene.add(road1);

// Вертикальная дорога
const road2 = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 500),
    roadMaterial
);
road2.rotation.x = -Math.PI / 2;
road2.position.y = 0.02;
road2.receiveShadow = true;
scene.add(road2);

// Разметка на дорогах
for (let i = -240; i <= 240; i += 20) {
    const line1 = new THREE.Mesh(
        new THREE.PlaneGeometry(6, 0.4),
        roadLineMaterial
    );
    line1.rotation.x = -Math.PI / 2;
    line1.position.set(i, 0.03, 0);
    scene.add(line1);

    const line2 = new THREE.Mesh(
        new THREE.PlaneGeometry(0.4, 6),
        roadLineMaterial
    );
    line2.rotation.x = -Math.PI / 2;
    line2.position.set(0, 0.03, i);
    scene.add(line2);
}

// ============ ЗДАНИЯ ============
function createBuilding(x, z, width, height, depth, color) {
    const geometry = new THREE.BoxGeometry(width, height, depth);

    // Основной цвет
    const material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.7,
        metalness: 0.1
    });

    const building = new THREE.Mesh(geometry, material);
    building.position.set(x, height / 2, z);
    building.castShadow = true;
    building.receiveShadow = true;
    scene.add(building);

    // Окна (эмиссия — светятся)
    const windowMaterial = new THREE.MeshStandardMaterial({
        color: 0xffff88,
        emissive: 0xffff44,
        emissiveIntensity: 0.6
    });

    const floorsCount = Math.floor(height / 3);
    const windowsPerFloor = Math.floor(width / 2.5);

    for (let floor = 1; floor < floorsCount; floor++) {
        for (let w = 0; w < windowsPerFloor; w++) {
            const window1 = new THREE.Mesh(
                new THREE.BoxGeometry(0.8, 1, 0.05),
                windowMaterial
            );
            window1.position.set(
                x - width / 2 + 1.5 + w * 2.5,
                floor * 3,
                z + depth / 2 + 0.03
            );
            scene.add(window1);
        }
    }

    return building;
}

// Данные зданий
const buildingsData = [
    // Квартал 1
    { x: -25, z: -25, w: 12, h: 25, d: 12, color: 0x8B4513 },
    { x: -25, z: -10, w: 10, h: 18, d: 10, color: 0xA0522D },
    { x: -25, z:  15, w: 12, h: 22, d: 12, color: 0x8B4513 },
    { x: -25, z:  30, w: 10, h: 15, d: 10, color: 0xA0522D },

    // Квартал 2
    { x:  25, z: -25, w: 12, h: 30, d: 12, color: 0x696969 },
    { x:  25, z: -10, w: 10, h: 20, d: 10, color: 0x808080 },
    { x:  25, z:  15, w: 12, h: 28, d: 12, color: 0x696969 },
    { x:  25, z:  30, w: 10, h: 16, d: 10, color: 0x808080 },

    // Дальние здания
    { x: -60, z: -50, w: 15, h: 40, d: 15, color: 0x4B4B4B },
    { x:  60, z: -50, w: 15, h: 35, d: 15, color: 0x555555 },
    { x: -60, z:  50, w: 15, h: 38, d: 15, color: 0x4B4B4B },
    { x:  60, z:  50, w: 15, h: 42, d: 15, color: 0x555555 },
];

buildingsData.forEach(b => createBuilding(b.x, b.z, b.w, b.h, b.d, b.color));

// ============ МАШИНА ============
const car = new THREE.Group();

// Кузов
const bodyGeom = new THREE.BoxGeometry(2, 0.7, 4);
const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xffc800,
    metalness: 0.5,
    roughness: 0.3
});
const body = new THREE.Mesh(bodyGeom, bodyMat);
body.position.y = 0.6;
body.castShadow = true;
car.add(body);

// Крыша
const roofGeom = new THREE.BoxGeometry(1.6, 0.7, 2);
const roofMat = new THREE.MeshStandardMaterial({
    color: 0x222222,
    metalness: 0.3,
    roughness: 0.5
});
const roof = new THREE.Mesh(roofGeom, roofMat);
roof.position.y = 1.3;
roof.position.z = -0.2;
roof.castShadow = true;
car.add(roof);

// Лобовое стекло
const glassGeom = new THREE.BoxGeometry(1.5, 0.5, 0.1);
const glassMat = new THREE.MeshStandardMaterial({
    color: 0x88ccff,
    transparent: true,
    opacity: 0.6,
    metalness: 0.8
});
const windshield = new THREE.Mesh(glassGeom, glassMat);
windshield.position.set(0, 1.1, 0.85);
car.add(windshield);

// Колёса
const wheelGeom = new THREE.CylinderGeometry(0.4, 0.4, 0.35, 16);
const wheelMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.9
});

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
    wheel.castShadow = true;
    car.add(wheel);
    wheelMeshes.push(wheel);
});

car.position.set(0, 0, 0);
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

// ============ ОБНОВЛЕНИЕ ============
function update() {
    // Газ / тормоз / назад
    if (keys['w'] || keys['arrowup']) {
        carState.speed += carState.accel;
    } else if (keys['s'] || keys['arrowdown']) {
        carState.speed -= carState.brake;
    }

    // Ограничение скорости
    carState.speed = Math.max(
        -carState.maxSpeed / 2,
        Math.min(carState.maxSpeed, carState.speed)
    );

    // Трение
    carState.speed *= carState.friction;

    // Поворот (только когда машина едет)
    if (Math.abs(carState.speed) > 0.01) {
        const direction = carState.speed > 0 ? 1 : -1;
        if (keys['a'] || keys['arrowleft']) {
            carState.angle += carState.turnSpeed * direction;
        }
        if (keys['d'] || keys['arrowright']) {
            carState.angle -= carState.turnSpeed * direction;
        }
    }

    // Движение
    car.position.x += Math.sin(carState.angle) * carState.speed;
    car.position.z += Math.cos(carState.angle) * carState.speed;
    car.rotation.y = carState.angle;

    // Вращение колёс
    wheelMeshes.forEach(w => {
        w.rotation.x += carState.speed * 2;
    });

    // Камера следует за машиной
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

    // HUD — скорость
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
