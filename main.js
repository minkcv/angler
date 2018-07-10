var keysDown = [];
var keys = { up: 38, down: 40, right: 39, left: 37, a: 65, s: 83, d: 68, w: 87, shift: 16, r: 82, f: 70 }
addEventListener("keydown", function(e) {
    if (Object.values(keys).includes(e.keyCode))
        e.preventDefault();
    keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function(e) {
    delete keysDown[e.keyCode];
}, false);

var threediv = document.getElementById('threediv');
var width = threediv.clientWidth;
var height = threediv.clientHeight;

var scene = new THREE.Scene();
scene.background = new THREE.Color('#cf6ffc');

var scale = 16;
var camera = new THREE.OrthographicCamera(width / -scale, width / scale, height / scale, height / -scale, 0, 4000);
camera.translateZ(500);
camera.zoom = 0.3;
camera.updateProjectionMatrix();

var cam = new THREE.Object3D(); // Parent for camera to rotate/pan easier
cam.add(camera);
scene.add(cam);

var axes = new THREE.AxesHelper(3);
//cam.add(axes);

var worldSize = 40;

cam.position.x = worldSize / 2;
cam.position.z = worldSize / 2;

var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(width, height);
threediv.appendChild(renderer.domElement);

var gridHelper = new THREE.GridHelper(worldSize * 5, worldSize, 0x000000, 0x000000);
gridHelper.position.x = worldSize / 2;
gridHelper.position.z = worldSize / 2;
//scene.add(gridHelper);

var triHolder = new THREE.Object3D();

var tri = new THREE.Shape();
tri.moveTo(0, 0);
tri.lineTo(0, 100);
tri.lineTo(100, 0);

var geometry = new THREE.ShapeGeometry(tri);
var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
var mesh = new THREE.Mesh(geometry, material);
var mesh1 = new THREE.Mesh(geometry, material);
var mesh2 = new THREE.Mesh(geometry, material);
mesh1.rotateZ(Math.PI * 2/ 3);
mesh2.rotateZ(Math.PI * 2/ 3 * 2);
scene.add(mesh);
scene.add(mesh1);
scene.add(mesh2);


scene.add(triHolder);


function update() {
    if (keys.shift in keysDown)
        sprintFactor = 4;
    else
        sprintFactor = 1;

	if (keys.a in keysDown) {
        
    }
}

function animate() {
	requestAnimationFrame( animate );
    update();
    mesh.rotateZ(0.01);
    mesh1.rotateZ(0.01);
    mesh2.rotateZ(0.01);
    
    //mesh.rotateZ(0.01);
	renderer.render( scene, camera );
}
animate();

