
//THREEJS RELATED VARIABLES 

var scene, 
    camera,
    controls,
    fieldOfView,
  	aspectRatio,
  	nearPlane,
  	farPlane,
    shadowLight, 
    backLight,
    light, 
    renderer,
		container;

//SCENE
var floor, lion, fan,
    isBlowing = false;

//SCREEN VARIABLES

var HEIGHT,
  	WIDTH,
    windowHalfX,
  	windowHalfY,
    mousePos = {x:0,y:0};
    dist = 0;

//INIT THREE JS, SCREEN AND MOUSE EVENTS

function init(){
  scene = new THREE.Scene();
  HEIGHT = window.innerHeight*0.85;
  WIDTH = window.innerWidth*0.8;
  aspectRatio = WIDTH / HEIGHT;
  fieldOfView = 60;
  nearPlane = 1;
  farPlane = 2000; 
  camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane);
  camera.position.z = 800;  
  camera.position.y = 0;
  camera.lookAt(new THREE.Vector3(0,0,0));    
  renderer = new THREE.WebGLRenderer({alpha: true, antialias: true });
  renderer.setSize(WIDTH, HEIGHT);
  renderer.shadowMapEnabled = true;
  container = document.getElementById('world');
  container.appendChild(renderer.domElement);
  windowHalfX = WIDTH / 2;
  windowHalfY = HEIGHT / 2;
  window.addEventListener('resize', onWindowResize, false);
  document.addEventListener('mousemove', handleMouseMove, false);
  document.addEventListener('mousedown', handleMouseDown, false);
  document.addEventListener('mouseup', handleMouseUp, false);
  document.addEventListener('touchstart', handleTouchStart, false);
	document.addEventListener('touchend', handleTouchEnd, false);
	document.addEventListener('touchmove',handleTouchMove, false);
  /*
  controls = new THREE.OrbitControls( camera, renderer.domElement);
  //*/
}

function onWindowResize() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  windowHalfX = WIDTH / 2;
  windowHalfY = HEIGHT / 2;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
}

function handleMouseMove(event) {
  mousePos = {x:event.clientX, y:event.clientY};
}

function handleMouseDown(event) {
  isBlowing = true;
}
function handleMouseUp(event) {
  isBlowing = false;
}

function handleTouchStart(event) {
  if (event.touches.length > 1) {
    event.preventDefault();
		mousePos = {x:event.touches[0].pageX, y:event.touches[0].pageY};
    isBlowing = true;
  }
}

function handleTouchEnd(event) {
    mousePos = {x:windowHalfX, y:windowHalfY};
    isBlowing = false;
}

function handleTouchMove(event) {
  if (event.touches.length == 1) {
    event.preventDefault();
		mousePos = {x:event.touches[0].pageX, y:event.touches[0].pageY};
  }
}

function createLights() {
  light = new THREE.HemisphereLight(0xffffff, 0xffffff, .5)
  
  shadowLight = new THREE.DirectionalLight(0xffffff, .8);
  shadowLight.position.set(200, 200, 200);
  shadowLight.castShadow = true;
  shadowLight.shadowDarkness = .2;
 	
  backLight = new THREE.DirectionalLight(0xffffff, .4);
  backLight.position.set(-100, 200, 50);
  backLight.shadowDarkness = .1;
  backLight.castShadow = true;
 	
  scene.add(backLight);
  scene.add(light);
  scene.add(shadowLight);
}

function createFloor(){ 
  floor = new THREE.Mesh(new THREE.PlaneBufferGeometry(1000,500), new THREE.MeshBasicMaterial({color: 0xebe5e7}));
  floor.rotation.x = -Math.PI/2;
  floor.position.y = -100;
  floor.receiveShadow = true;
  scene.add(floor);
}

function createLion(){
  lion = new Lion();
  scene.add(lion.threegroup);
}

function createFan(){
  fan = new Fan();
  fan.threegroup.position.z = 350;
  scene.add(fan.threegroup);
}

Fan = function(){
  this.isBlowing = false;
  this.speed = 0;
  this.acc =0;
  this.redMat = new THREE.MeshLambertMaterial ({
    color: 0xad3525, 
    shading:THREE.FlatShading
  });
  this.greyMat = new THREE.MeshLambertMaterial ({
    color: 0x653f4c, 
    shading:THREE.FlatShading
  });
  
  this.yellowMat = new THREE.MeshLambertMaterial ({
    color: 0xfdd276, 
    shading:THREE.FlatShading
  });
  
  var coreGeom = new THREE.BoxGeometry(10,10,20);
  var sphereGeom = new THREE.BoxGeometry(10, 10, 3);
  var propGeom = new THREE.BoxGeometry(10,30,2);
  propGeom.applyMatrix( new THREE.Matrix4().makeTranslation( 0,25,0) );
  
  this.core = new THREE.Mesh(coreGeom,this.greyMat);
  
  // propellers
  var prop1 = new THREE.Mesh(propGeom, this.redMat);
  prop1.position.z = 15;
  var prop2 = prop1.clone();
  prop2.rotation.z = Math.PI/2;
  var prop3 = prop1.clone();
  prop3.rotation.z = Math.PI;
  var prop4 = prop1.clone();
  prop4.rotation.z = -Math.PI/2;
  
  this.sphere = new THREE.Mesh(sphereGeom, this.yellowMat);
  this.sphere.position.z = 15;
  
  this.propeller = new THREE.Group();
  this.propeller.add(prop1);
  this.propeller.add(prop2);
  this.propeller.add(prop3);
  this.propeller.add(prop4);
  
  this.threegroup = new THREE.Group();
  this.threegroup.add(this.core);
  this.threegroup.add(this.propeller);
  this.threegroup.add(this.sphere);
}

Fan.prototype.update = function(xTarget, yTarget){
  this.threegroup.lookAt(new THREE.Vector3(0,80,60));
  this.tPosX = rule3(xTarget, -200, 200, -250, 250);
  this.tPosY = rule3(yTarget, -200, 200, 250, -250);

  this.threegroup.position.x += (this.tPosX - this.threegroup.position.x) /10;
  this.threegroup.position.y += (this.tPosY - this.threegroup.position.y) /10;
  
  this.targetSpeed = (this.isBlowing) ? .3 : .01;
  if (this.isBlowing && this.speed < .5){
    this.acc +=.001;
    this.speed += this.acc;
  }else if (!this.isBlowing){
    this.acc = 0;
    this.speed *= .98;
  }
  this.propeller.rotation.z += this.speed; 
}

Lion = function(){
  this.windTime = 0;
  this.bodyInitPositions = [];
  this.maneParts = [];
  this.threegroup = new THREE.Group();
  this.yellowMat = new THREE.MeshLambertMaterial ({
    color: 0xfdd276, 
    shading:THREE.FlatShading
  });
  this.redMat = new THREE.MeshLambertMaterial ({
    color: 0xad3525, 
    shading:THREE.FlatShading
  });
  
  this.pinkMat = new THREE.MeshLambertMaterial ({
    color: 0xe55d2b, 
    shading:THREE.FlatShading
  });
  
  this.whiteMat = new THREE.MeshLambertMaterial ({
    color: 0xffffff, 
    shading:THREE.FlatShading
  });
  
  this.purpleMat = new THREE.MeshLambertMaterial ({
    color: 0x451954, 
    shading:THREE.FlatShading
  });
  
  this.greyMat = new THREE.MeshLambertMaterial ({
    color: 0x653f4c, 
    shading:THREE.FlatShading
  });
  
  this.blackMat = new THREE.MeshLambertMaterial ({
    color: 0x302925, 
    shading:THREE.FlatShading
  });
  
  
  var bodyGeom = new THREE.CylinderGeometry(30,80, 140, 4);
  var maneGeom = new THREE.BoxGeometry(40,40,15);
  var faceGeom = new THREE.BoxGeometry(80,80,80);
  var spotGeom = new THREE.BoxGeometry(4,4,4);
  var mustacheGeom = new THREE.BoxGeometry(30,2,1);
  mustacheGeom.applyMatrix( new THREE.Matrix4().makeTranslation( 15, 0, 0 ) );
  
  var earGeom = new THREE.BoxGeometry(20,20,20);
  var noseGeom = new THREE.BoxGeometry(40,40,20);
  var eyeGeom = new THREE.BoxGeometry(5,30,30);
  var irisGeom = new THREE.BoxGeometry(4,10,10);
  var mouthGeom = new THREE.BoxGeometry(20,20,10);
  var smileGeom = new THREE.TorusGeometry( 12, 4, 2, 10, Math.PI );
  var lipsGeom = new THREE.BoxGeometry(40,15,20);
  var kneeGeom = new THREE.BoxGeometry(25, 80, 80);
  kneeGeom.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 50, 0 ) );
  var footGeom = new THREE.BoxGeometry(40, 20, 20);
  
  // body
  this.body = new THREE.Mesh(bodyGeom, this.yellowMat);
  this.body.position.z = -60;
  this.body.position.y = -30;
  this.bodyVertices = [0,1,2,3,4,10];
  
  for (var i=0;i