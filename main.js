const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('game-container').appendChild(renderer.domElement);

camera.position.z = 20;

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const carGeometry = new THREE.BoxGeometry(4, 1.5, 2);
const carMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const car = new THREE.Mesh(carGeometry, carMaterial);
car.position.set(0, 0, 0);
scene.add(car);

const createTree = () => {
    const treeGeometry = new THREE.ConeGeometry(1, 3, 8);
    const treeMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22 });
    const tree = new THREE.Mesh(treeGeometry, treeMaterial);

    tree.position.set(Math.random() * 100 - 50, 0, -Math.random() * 100 + 20);
    scene.add(tree);
};

for (let i = 0; i < 50; i++) {
    createTree();
}

const light = new THREE.AmbientLight(0x404040);
scene.add(light);

const animate = function () {
    requestAnimationFrame(animate);
    car.position.z -= 0.2;
    renderer.render(scene, camera);
};

animate();
