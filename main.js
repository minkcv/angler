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

var greenMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00, side: THREE.DoubleSide});
var blueMaterial = new THREE.MeshBasicMaterial({color: 0x0000ff, side: THREE.DoubleSide});
var whiteMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, side: THREE.DoubleSide});

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

var axes = new THREE.AxesHelper(50);
scene.add(axes);

var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(width, height);
threediv.appendChild(renderer.domElement);

var worldSize = 40;
var gridHelper = new THREE.GridHelper(worldSize * 5, worldSize, 0x000000, 0x000000);
gridHelper.position.x = worldSize / 2;
gridHelper.position.z = worldSize / 2;
gridHelper.rotateX(Math.PI / 2);
//scene.add(gridHelper);

var gameOverMesh;
var loader = new THREE.FontLoader();
loader.load('three/droid_sans_mono_regular.typeface.json', function(font) {
    var textGeom = new THREE.TextGeometry('GAME OVER', {
        font: font,
        size: 20,
        height: 5,
        curveSegments: 12,
        bevelEnabled: false
    });
    gameOverMesh = new THREE.Mesh(textGeom, whiteMaterial);
    gameOverMesh.translateX(-75);
    gameOverMesh.rotateX(0.2);
    gameOverMesh.rotateY(0.2);
});

var triHolder = new THREE.Object3D();
// An insane amount of work to center a triangle.
// You'll need to draw pictures if you want to understand this.
var spacing = 30;
var length = 30;
var height = Math.sqrt((length * length) - ((length / 2) * (length / 2)));
var radius = length / Math.sqrt(3);
var centerY = height - radius;
var tri = new THREE.Shape();
tri.moveTo(-length / 2, -height / 2);
tri.lineTo(length / 2, -height / 2);
tri.lineTo(0, height / 2);
var geometry = new THREE.ShapeGeometry(tri);
geometry.applyMatrix( new THREE.Matrix4().makeTranslation(0, (height / 2) - centerY, 0) );

var meshTop = new THREE.Mesh(geometry, greenMaterial);
var meshRight = new THREE.Mesh(geometry, greenMaterial);
var meshLeft = new THREE.Mesh(geometry, greenMaterial);
meshTop.translateY(spacing);
meshRight.translateX(spacing);
meshRight.translateY(-height);
meshLeft.translateX(-spacing);
meshLeft.translateY(-height);
triHolder.add(meshTop);
triHolder.add(meshRight);
triHolder.add(meshLeft);


scene.add(triHolder);

var level = 0;

// Left, Top, Right
var state = [false, false, false];
var meshes = [meshLeft, meshTop, meshRight];
var score = 0;
var gameOver = false;

function setRandomState() {
    while (true) {
        var i = Math.floor(Math.random() * 3);
        if (state[i] == false) {
            state[i] = true;
            meshes[i].material = blueMaterial;
            break;
        }
    }
    if (state[0] && state[1] && state[2])
        gameOver = true;
}

var lastTime = Date.now();
var delay = 2000;
function update() {
    if (gameOver) {
        if (gameOverMesh)
            scene.add(gameOverMesh);

        return;
    }

    document.getElementById('score').innerHTML = score;
    var time = Date.now();
    if (time > lastTime + delay) {
        setRandomState();
        lastTime = Date.now();
    }
    if (keys.up in keysDown) {
        if (state[1] == true) {
            state[1] = false;
            score++;
            delete keysDown[keys.up];
            meshTop.material = greenMaterial;
        }
        else
            gameOver = true;
    }
    if (keys.left in keysDown) {
        if (state[0] == true) {
            state[0] = false;
            score++;
            delete keysDown[keys.left];
            meshLeft.material = greenMaterial;
        }
        else
            gameOver = true;
    }
    if (keys.right in keysDown) {
        if (state[2] == true) {
            state[2] = false;
            score++;
            delete keysDown[keys.right];
            meshRight.material = greenMaterial;
        }
        else
            gameOver = true;
    }
    if (level == 1)
        spinAllCenter();
    if (level == 2)
        spinEachCenter();
    if (level == 3)
        spinCamera();
    if (level == 4) {
        spinAllCenter();
        spinCamera();
    }
    if (level == 5) {
        spinAllCenter();
        spinEachCenter();
        spinCamera();
    }
}

function spinAllCenter() {
    triHolder.rotateZ(0.01);
}

function spinEachCenter() {
    meshTop.rotateZ(-0.01);
    meshLeft.rotateZ(-0.01);
    meshRight.rotateZ(-0.01);
}

function spinCamera() {
    cam.rotateX(0.01);
    cam.rotateY(0.01);
    cam.rotateZ(0.01);
}

function animate() {
	requestAnimationFrame( animate );
    update();
    
	renderer.render( scene, camera );
}
animate();

