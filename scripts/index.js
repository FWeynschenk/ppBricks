import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';
import { STLLoader } from './STLLoader.js';

let scene, camera, renderer, mesh;

let x = 500, y = 500;

init();
animate();

setViewerSize(700, 700);

function init() {
    camera = new THREE.PerspectiveCamera(45, x/y, 1, 1000);
    camera.position.set(200, 100, 200);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0a0a0);
    scene.fog = new THREE.Fog(0xa0a0a0, 200, 1000);


    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 200, 0);
    scene.add(hemiLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(0, 200, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.top = 180;
    directionalLight.shadow.camera.bottom = - 100;
    directionalLight.shadow.camera.left = - 120;
    directionalLight.shadow.camera.right = 120;
    scene.add(directionalLight);

    // loading file
    const loader = new STLLoader();
    loader.load('./out.stl', function (geometry) {
        const material = new THREE.MeshPhongMaterial({ opacity: 1, color: "rgb(255, 0, 0)", specular: "rgb(255, 255, 255)", shininess: 0 });
        mesh = new THREE.Mesh(geometry, material);
        mesh.rotateX(-Math.PI / 2);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
    });

    // ground
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }));
    ground.rotation.x = - Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const grid = new THREE.GridHelper(2000, 20, 0x000000, 0x000000);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add(grid);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    
    onWindowResize();
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 25, 0);
    controls.update();

    //

    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    camera.aspect = x/y;
    camera.updateProjectionMatrix();
    renderer.setSize(x, y);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

const link = document.createElement('a');
link.style.display = 'none';
document.body.appendChild(link);

function setViewerSize(nx, ny) {
    x=nx;
    y=ny;
    onWindowResize();
}

