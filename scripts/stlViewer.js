import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';
import { STLLoader } from './STLLoader.js';

let scene, camera, renderer, curObj, grid, controls;

let x = 500, y = 500; // default stl viewer size
let gridOffsetX = 0;
let gridOffsetZ = 0;

const loader = new STLLoader();

init();
animate();

function init() {
    camera = new THREE.PerspectiveCamera(45, x / y, 1, 10000);
    camera.position.set(70, 70, 70);

    scene = new THREE.Scene();
    scene.background = new THREE.Color('rgb(200,200,200)');
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

    // ground
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }));
    ground.rotation.x = - Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    ground.geometry.computeBoundingBox();

    grid = new THREE.GridHelper(2000, 2000 / 8, 0x000000, 0x000000);
    grid.material.opacity = 0.3;
    grid.material.transparent = true;
    scene.add(grid);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(x / y);

    onWindowResize();
    renderer.shadowMap.enabled = true;
    document.getElementById("stlViewer").appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 25, 0);
    controls.update();

    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    camera.aspect = x / y;
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
    x = nx;
    y = ny;
    onWindowResize();
}

function meshLoadCB(geometry) {
    const material = new THREE.MeshPhongMaterial({ opacity: 1, color: "rgb(221,26,33)" });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    if (curObj) {
        curObj.geometry.dispose();
        curObj.material.dispose();
        scene.remove(curObj);
    }
    curObj = mesh;

    mesh.geometry.computeBoundingBox();
    mesh.translateY(-mesh.geometry.boundingBox.min.z);
    mesh.rotateX(-Math.PI / 2);
    setGridOffset(mesh.geometry.boundingBox.min);

    scene.add(mesh);
    controls.reset();
    animate();
}

function setGridOffset(v3) {
    grid.translateX(-gridOffsetX);
    gridOffsetX = 0;
    grid.translateZ(-gridOffsetZ);
    gridOffsetZ = 0;
    if ((Math.abs(Math.round(v3.x) % 8) > 2)) {
        gridOffsetX = 4;
        grid.translateX(4);
    } 
    if ((Math.abs(Math.round(v3.y) % 8) > 2)) {
        gridOffsetZ = 4;
        grid.translateZ(4);
    } 
}

function loadString(string) {
    loader.loadBlob(string, meshLoadCB);
}
function loadUrl(url) {
    loader.load(url, meshLoadCB);
}

export { loadString, loadUrl, setViewerSize };