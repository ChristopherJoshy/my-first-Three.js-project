let scene, camera, renderer, car, headlights, chunks = {};
let carSpeed = 0, maxSpeed = 2, turnSpeed = 0.03;
let moveForward = false, moveBackward = false, turnLeft = false, turnRight = false;
let acceleration = 0.05, deceleration = 0.08, friction = 0.02, chunkSize = 200;
let score = 0, health = 100;
let lastRenderTime = 0;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);
    car = createCar();
    car.position.set(0, 1, 0);
    scene.add(car);
    createHeadlights();
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);
    setupMobileControls();
    window.addEventListener('resize', onWindowResize, false);
    updateChunks(car.position);
    requestAnimationFrame(animate);
}

function createCar() {
    const carGroup = new THREE.Group();
    const bodyGeometry = new THREE.BoxGeometry(2, 1, 4);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.set(0, 0.5, 0);
    carGroup.add(body);
    const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.5, 16);
    const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    const positions = [[-1, 0.25, -1.5], [1, 0.25, -1.5], [-1, 0.25, 1.5], [1, 0.25, 1.5]];
    positions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(...pos);
        carGroup.add(wheel);
    });
    return carGroup;
}

function createHeadlights() {
    const headlightGeometry = new THREE.ConeGeometry(0.2, 0.5, 16);
    const headlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    leftHeadlight.position.set(-0.7, 0.25, -2);
    leftHeadlight.rotation.x = Math.PI / 2;
    car.add(leftHeadlight);
    const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    rightHeadlight.position.set(0.7, 0.25, -2);
    rightHeadlight.rotation.x = Math.PI / 2;
    car.add(rightHeadlight);
}

function onKeyDown(event) {
    switch (event.code) {
        case 'ArrowUp': moveForward = true; break;
        case 'ArrowDown': moveBackward = true; break;
        case 'ArrowLeft': turnLeft = true; break;
        case 'ArrowRight': turnRight = true; break;
    }
}

function onKeyUp(event) {
    switch (event.code) {
        case 'ArrowUp': moveForward = false; break;
        case 'ArrowDown': moveBackward = false; break;
        case 'ArrowLeft': turnLeft = false; break;
        case 'ArrowRight': turnRight = false; break;
    }
}

function setupMobileControls() {
    document.getElementById('forward').addEventListener('mousedown', () => moveForward = true);
    document.getElementById('forward').addEventListener('mouseup', () => moveForward = false);
    document.getElementById('backward').addEventListener('mousedown', () => moveBackward = true);
    document.getElementById('backward').addEventListener('mouseup', () => moveBackward = false);
    document.getElementById('left').addEventListener('mousedown', () => turnLeft = true);
    document.getElementById('left').addEventListener('mouseup', () => turnLeft = false);
    document.getElementById('right').addEventListener('mousedown', () => turnRight = true);
    document.getElementById('right').addEventListener('mouseup', () => turnRight = false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateChunks(position) {
    const currentChunk = `${Math.floor(position.x / chunkSize)},${Math.floor(position.z / chunkSize)}`;
    if (!chunks[currentChunk]) {
        const chunk = createChunk(currentChunk);
        scene.add(chunk);
        chunks[currentChunk] = chunk;
    }
}

function createChunk(key) {
    const chunk = new THREE.Group();
    const [chunkX, chunkZ] = key.split(',').map(Number);
    for (let i = 0; i < 10; i++) {
        const tree = createTree();
        tree.position.set(
            chunkX * chunkSize + (Math.random() - 0.5) * chunkSize,
            0,
            chunkZ * chunkSize + (Math.random() - 0.5) * chunkSize
        );
        chunk.add(tree);
    }
    return chunk;
}

function createTree() {
    const tree = new THREE.Group();
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2);
    const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1;
    tree.add(trunk);
    const foliageGeometry = new THREE.ConeGeometry(1, 2, 8);
    const foliageMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = 3;
    tree.add(foliage);
    return tree;
}

function animate(timestamp) {
    const deltaTime = timestamp - lastRenderTime;
    lastRenderTime = timestamp;

    if (moveForward) carSpeed = Math.min(carSpeed + acceleration, maxSpeed);
    if (moveBackward) carSpeed = Math.max(carSpeed - deceleration, -maxSpeed);
    if (!moveForward && !moveBackward) carSpeed *= (1 - friction);

    if (turnLeft) car.rotation.y += turnSpeed;
    if (turnRight) car.rotation.y -= turnSpeed;

    const direction = new THREE.Vector3(Math.sin(car.rotation.y), 0, Math.cos(car.rotation.y));
    car.position.addScaledVector(direction, carSpeed);

    camera.position.lerp(car.position.clone().add(new THREE.Vector3(0, 5, 10)), 0.1);
    camera.lookAt(car.position);

    updateChunks(car.position);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

init();
