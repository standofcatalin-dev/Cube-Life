// ============================================================
// CRA 3D — Этап 2: Реалистичная физика + детализация
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
scene.fog = new THREE.Fog(0x87CEEB, 60, 200);

// ============ КАМЕРА ============
const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.5,
    500
);
camera.position.set(0, 15, 20);

// ============ РЕНДЕРЕР ============
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: false,
    powerPreference: "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(1);
renderer.shadowMap.enabled = false;

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

// ============ ЗДАНИЯ ============
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

// ============================================================
// МАШИНА — РЕАЛИСТИЧНАЯ
// ============================================================

const car = new THREE.Group();

// Внутренняя группа для визуальных наклонов
const carBody = new THREE.Group();
car.add(carBody);

// ---- Основной кузов ----
const bodyGeom = new THREE.BoxGeometry(2, 0.5, 4.2);
const bodyMat = new THREE.MeshLambertMaterial({ color: 0xffc800 });
const body = new THREE.Mesh(bodyGeom, bodyMat);
body.position.y = 0.55;
carBody.add(body);

// ---- Капот ----
const hoodGeom = new THREE.BoxGeometry(1.9, 0.3, 1.2);
const hoodMat = new THREE.MeshLambertMaterial({ color: 0xffc800 });
const hood = new THREE.Mesh(hoodGeom, hoodMat);
hood.position.set(0, 0.65, 1.55);
carBody.add(hood);

// ---- Багажник ----
const trunkGeom = new THREE.BoxGeometry(1.9, 0.35, 1.0);
const trunkMat = new THREE.MeshLambertMaterial({ color: 0xffc800 });
const trunk = new THREE.Mesh(trunkGeom, trunkMat);
trunk.position.set(0, 0.68, -1.65);
carBody.add(trunk);

// ---- Крыша (кабина) ----
const cabinGeom = new THREE.BoxGeometry(1.7, 0.7, 2.0);
const cabinMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
const cabin = new THREE.Mesh(cabinGeom, cabinMat);
cabin.position.set(0, 1.15, -0.15);
carBody.add(cabin);

// ---- Стёкла ----
const glassMat = new THREE.MeshBasicMaterial({
    color: 0x88ccff,
    transparent: true,
    opacity: 0.7
});

const windshieldGeom = new THREE.BoxGeometry(1.6, 0.55, 0.05);
const windshield = new THREE.Mesh(windshieldGeom, glassMat);
windshield.position.set(0, 1.15, 0.9);
windshield.rotation.x = -0.35;
carBody.add(windshield);

const rearGlassGeom = new THREE.BoxGeometry(1.6, 0.5, 0.05);
const rearGlass = new THREE.Mesh(rearGlassGeom, glassMat);
rearGlass.position.set(0, 1.15, -1.2);
rearGlass.rotation.x = 0.3;
carBody.add(rearGlass);

const sideGlassGeom = new THREE.BoxGeometry(0.05, 0.45, 1.6);
const sideGlassLeft = new THREE.Mesh(sideGlassGeom, glassMat);
sideGlassLeft.position.set(-0.88, 1.15, -0.15);
carBody.add(sideGlassLeft);

const sideGlassRight = new THREE.Mesh(sideGlassGeom, glassMat);
sideGlassRight.position.set(0.88, 1.15, -0.15);
carBody.add(sideGlassRight);

// ---- Фары передние ----
const headlightMat = new THREE.MeshBasicMaterial({ color: 0xffffcc });
const headlight1Geom = new THREE.BoxGeometry(0.4, 0.2, 0.1);

const headlight1 = new THREE.Mesh(headlight1Geom, headlightMat);
headlight1.position.set(-0.65, 0.65, 2.16);
carBody.add(headlight1);

const headlight2 = new THREE.Mesh(headlight1Geom, headlightMat);
headlight2.position.set(0.65, 0.65, 2.16);
carBody.add(headlight2);

// ---- Фонари задние ----
const taillightMat = new THREE.MeshBasicMaterial({ color: 0xff3333 });
const taillight1Geom = new THREE.BoxGeometry(0.4, 0.2, 0.1);

const taillight1 = new THREE.Mesh(taillight1Geom, taillightMat);
taillight1.position.set(-0.65, 0.68, -2.16);
carBody.add(taillight1);

const taillight2 = new THREE.Mesh(taillight1Geom, taillightMat);
taillight2.position.set(0.65, 0.68, -2.16);
carBody.add(taillight2);

// ---- Зеркала ----
const mirrorMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
const mirrorGeom = new THREE.BoxGeometry(0.2, 0.15, 0.15);

const mirrorLeft = new THREE.Mesh(mirrorGeom, mirrorMat);
mirrorLeft.position.set(-1.0, 1.05, 0.85);
carBody.add(mirrorLeft);

const mirrorRight = new THREE.Mesh(mirrorGeom, mirrorMat);
mirrorRight.position.set(1.0, 1.05, 0.85);
carBody.add(mirrorRight);

// ---- Бамперы ----
const bumperMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
const frontBumperGeom = new THREE.BoxGeometry(2.1, 0.25, 0.15);

const frontBumper = new THREE.Mesh(frontBumperGeom, bumperMat);
frontBumper.position.set(0, 0.4, 2.15);
carBody.add(frontBumper);

const rearBumper = new THREE.Mesh(frontBumperGeom, bumperMat);
rearBumper.position.set(0, 0.4, -2.15);
carBody.add(rearBumper);

// ---- Номера ----
const plateMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
const plateGeom = new THREE.BoxGeometry(0.6, 0.15, 0.03);

const plateFront = new THREE.Mesh(plateGeom, plateMat);
plateFront.position.set(0, 0.35, 2.24);
carBody.add(plateFront);

const plateRear = new THREE.Mesh(plateGeom, plateMat);
plateRear.position.set(0, 0.35, -2.24);
carBody.add(plateRear);

// ---- Колёса ----
const wheelGeom = new THREE.CylinderGeometry(0.42, 0.42, 0.35, 12);
const wheelMat = new THREE.MeshLambertMaterial({ color: 0x111111 });

const rimGeom = new THREE.CylinderGeometry(0.22, 0.22, 0.37, 8);
const rimMat = new THREE.MeshLambertMaterial({ color: 0xcccccc });

const wheelFL = new THREE.Group();
const wheelFR = new THREE.Group();
const wheelRL = new THREE.Group();
const wheelRR = new THREE.Group();

wheelFL.position.set(-1.05, 0.42, 1.35);
wheelFR.position.set( 1.05, 0.42, 1.35);
wheelRL.position.set(-1.05, 0.42, -1.35);
wheelRR.position.set( 1.05, 0.42, -1.35);

function createWheel() {
    const wheelGroup = new THREE.Group();
    
    const wheel = new THREE.Mesh(wheelGeom, wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheelGroup.add(wheel);
    
    const rim = new THREE.Mesh(rimGeom, rimMat);
    rim.rotation.z = Math.PI / 2;
    wheelGroup.add(rim);
    
    return wheelGroup;
}

wheelFL.add(createWheel());
wheelFR.add(createWheel());
wheelRL.add(createWheel());
wheelRR.add(createWheel());

car.add(wheelFL);
car.add(wheelFR);
car.add(wheelRL);
car.add(wheelRR);

// ---- Тень под машиной ----
const shadowGeom = new THREE.CircleGeometry(2.2, 16);
const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.3
});
const carShadow = new THREE.Mesh(shadowGeom, shadowMat);
carShadow.rotation.x = -Math.PI / 2;
carShadow.position.y = 0.05;
car.add(carShadow);

car.position.set(0, 0, 0);
scene.add(car);

// ============================================================
// УПРАВЛЕНИЕ И ФИЗИКА
// ============================================================

const keys = {};

const carState = {
    speed: 0,
    angle: 0,
    maxSpeed: 0.4,
    maxReverse: -0.15,
    accel: 0.012,
    brakeDecel: 0.03,
    friction: 0.92,
    turnSpeed: 0.028,
    bodyRoll: 0,
    bodyPitch: 0,
    wheelRotation: 0,
    steerAngle: 0
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

function pressKey(key) {
    keys[key] = true;
}
function releaseKey(key) {
    keys[key] = false;
}
window.pressKey = pressKey;
window.releaseKey = releaseKey;

// ============ ОБНОВЛЕНИЕ ============
function update() {
    // Газ / тормоз / реверс
    if (keys['w'] || keys['arrowup']) {
        carState.speed += carState.accel;
    } else if (keys['s'] || keys['arrowdown']) {
        carState.speed -= carState.brakeDecel;
    }

    carState.speed = Math.max(
        carState.maxReverse,
        Math.min(carState.maxSpeed, carState.speed)
    );

    carState.speed *= carState.friction;

    if (Math.abs(carState.speed) < 0.002) {
        carState.speed = 0;
    }

    // Поворот
    let targetSteer = 0;
    if (Math.abs(carState.speed) > 0.005) {
        const direction = carState.speed > 0 ? 1 : -1;
        if (keys['a'] || keys['arrowleft']) {
            carState.angle += carState.turnSpeed * direction;
            targetSteer = 0.5;
        }
        if (keys['d'] || keys['arrowright']) {
            carState.angle -= carState.turnSpeed * direction;
            targetSteer = -0.5;
        }
    }
    
    carState.steerAngle += (targetSteer - carState.steerAngle) * 0.15;
    wheelFL.rotation.y = carState.steerAngle;
    wheelFR.rotation.y = carState.steerAngle;

    // Движение
    car.position.x += Math.sin(carState.angle) * carState.speed;
    car.position.z += Math.cos(carState.angle) * carState.speed;
    car.rotation.y = carState.angle;

    // Крен кузова
    const targetRoll = -carState.steerAngle * Math.abs(carState.speed) * 1.2;
    carState.bodyRoll += (targetRoll - carState.bodyRoll) * 0.1;
    carBody.rotation.z = carState.bodyRoll;

    // Наклон носа
    let targetPitch = 0;
    if (keys['w'] || keys['arrowup']) {
        targetPitch = -0.04;
    }
    if (keys['s'] || keys['arrowdown']) {
        targetPitch = 0.05;
    }
    carState.bodyPitch += (targetPitch - carState.bodyPitch) * 0.1;
    carBody.rotation.x = carState.bodyPitch;

    // Вращение колёс
    const speedForWheels = carState.speed * 4;
    carState.wheelRotation += speedForWheels;
    
    [wheelFL, wheelFR, wheelRL, wheelRR].forEach(w => {
        w.children[0].rotation.x = carState.wheelRotation;
        w.children[1].rotation.x = carState.wheelRotation;
    });

    // ============================================================
    // КАМЕРА — ОБНОВЛЕНО
    // ============================================================
    const camDist = 16;
    const camHeight = 10;
    const camTargetX = car.position.x - Math.sin(carState.angle) * camDist;
    const camTargetZ = car.position.z - Math.cos(carState.angle) * camDist;

    camera.position.x += (camTargetX - camera.position.x) * 0.08;
    camera.position.z += (camTargetZ - camera.position.z) * 0.08;
    camera.position.y += (camHeight - camera.position.y) * 0.08;

    // Смотрим ВПЕРЁД (перед машиной), а не на неё
    camera.lookAt(
        car.position.x + Math.sin(carState.angle) * 10,
        car.position.y + 1,
        car.position.z + Math.cos(carState.angle) * 10
    );

    // HUD
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
