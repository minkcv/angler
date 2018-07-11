var keysDown = [];
var keys = { up: 38, down: 40, right: 39, left: 37, a: 65, s: 83, d: 68, w: 87, shift: 16, f: 70, space: 32}
addEventListener("keydown", function(e) {
    if (Object.values(keys).includes(e.keyCode))
        e.preventDefault();
    keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function(e) {
    delete keysDown[e.keyCode];
}, false);

var greenMaterial = new THREE.MeshPhongMaterial({color: 0x00ff00, side: THREE.DoubleSide});
var blueMaterial = new THREE.MeshBasicMaterial({color: 0x0000ff, side: THREE.DoubleSide});
var redMaterial = new THREE.MeshBasicMaterial({color: 0xff0000, side: THREE.DoubleSide});
var whiteMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, side: THREE.DoubleSide});

var threediv = document.getElementById('threediv');
var width = threediv.clientWidth;
var height = threediv.clientHeight;

var scene = new THREE.Scene();
scene.background = new THREE.Color('#cf6ffc');

var light1 = new THREE.PointLight(0xffffff, 1, 0);
light1.translateZ(100);
var light2 = new THREE.PointLight(0xffffff, 1, 0);
light2.translateY(-100);
var light3 = new THREE.PointLight(0xffffff, 1, 0);
light3.translateY(100);

var scale = 16;
var camera = new THREE.OrthographicCamera(width / -scale, width / scale, height / scale, height / -scale, 0, 4000);
camera.translateZ(500);
camera.zoom = 0.3;
camera.updateProjectionMatrix();

var cam = new THREE.Object3D(); // Parent for camera to rotate/pan easier
cam.add(camera);
cam.add(light1);
cam.add(light2);
cam.add(light3);
scene.add(cam);

var axes = new THREE.AxesHelper(50);
//scene.add(axes);

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
    gameOverMesh.name = "Game Over Mesh";
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
//var geometry = new THREE.ExtrudeGeometry(tri, {depth: 1, bevelEnabled: false});
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

var level;
var state;
var score;
var highScore = 0;

var meshes = [meshLeft, meshTop, meshRight];
var scoreAmount = 10;
var gameOver = true;
var paused = true;

function restart() {
    // Left, Top, Right
    state = [false, false, false];
    score = 0;
    setScore();
    level = 0;
    gameOver = false;
    paused = false;
    meshes.forEach(function(mesh) { mesh.material = greenMaterial;});
    triHolder.rotation.x = 0;
    triHolder.rotation.y = 0;
    triHolder.rotation.z = 0;
    cam.rotation.x = 0;
    cam.rotation.y = 0;
    cam.rotation.z = 0;
    meshes.forEach(function(mesh) {mesh.rotation.x = mesh.rotation.y = mesh.rotation.z = 0;});
    cam.remove(gameOverMesh);
}

function setScore() {
    document.getElementById('score').innerHTML = score.toString().padStart(10);
    if (score > highScore) {
        document.getElementById('high-score').innerHTML = score.toString().padStart(5);
        highScore = score;
    }
}

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
    {
        paused = true;
    }
}

var lastTime = Date.now();
var delay = 2000;
function update() {
    if (paused && !gameOver) {
        cam.add(gameOverMesh);
        gameOver = true;
        return;
    }

    if (keys.space in keysDown) {
        restart();
        return;
    }

    if (paused)
        return;

    if (score >= 10)
        level = 1;
    if (score >= 50)
        level = 2;
    if (score >= 90)
        level = 3;
    if (score >= 120)
        level = 4;
    if (score >= 160)
        level = 5;
    if (score >= 200)
        level = 6;
    if (score >= 240)
        level = 7;

    var time = Date.now();
    if (time > lastTime + delay) {
        setRandomState();
        lastTime = Date.now();
    }
    if (keys.up in keysDown) {
        if (state[1] == true) {
            state[1] = false;
            score+=scoreAmount;
            setScore();
            delete keysDown[keys.up];
            meshTop.material = greenMaterial;
        }
        else {
            meshTop.material = redMaterial;
            paused = true;
        }
    }
    if (keys.left in keysDown) {
        if (state[0] == true) {
            state[0] = false;
            score+=scoreAmount;
            setScore();
            delete keysDown[keys.left];
            meshLeft.material = greenMaterial;
        }
        else {
            meshLeft.material = redMaterial;
            paused = true;
        }
    }
    if (keys.right in keysDown) {
        if (state[2] == true) {
            state[2] = false;
            score+=scoreAmount;
            setScore();
            delete keysDown[keys.right];
            meshRight.material = greenMaterial;
        }
        else {
            meshRight.material = redMaterial;
            paused = true;
        }
    }
    if (level == 1) {
        spinAllCenter();
    }
    if (level == 2) {
        pulseEach();
        spinAllCenter();
    }
    if (level == 3) {
        pulseAll();
        spinAllCenter();
        spinEachCenter();
    }
    if (level == 4) {
        pulseAll();
        spinCamera();
    }
    if (level == 5) {
        spinAllCenter();
        spinEachCenter();
        spinCamera();
    }
    if (level == 6) {
        pulseEach();
        spinAllCenter();
        spinCamera();
    }
    if (level == 7) {
        pulseEach();
        spinEachCenter();
        spinCamera();
    }
}

function spinAllCenter() {
    triHolder.rotateZ(0.0001 * score);
}

function spinEachCenter() {
    meshTop.rotateZ(-0.01);
    meshLeft.rotateZ(-0.01);
    meshRight.rotateZ(-0.01);
}

function spinCamera() {
    cam.rotateX(0.01);
    cam.rotateY(0.01);
}

function pulseAll() {
    triHolder.scale.x += Math.sin(Date.now() / 100) * 0.01;
    triHolder.scale.y += Math.sin(Date.now() / 100) * 0.01;
}

function pulseEach() {
    meshes.forEach(function(mesh) {
        mesh.scale.x += Math.sin(Date.now() / 100) * 0.01;
        mesh.scale.y += Math.sin(Date.now() / 100) * 0.01;
    })
}

function animate() {
	requestAnimationFrame( animate );
    update();
    
	renderer.render( scene, camera );
}
animate();

