import * as THREE from "https://cdn.skypack.dev/three@0.132.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.132.0/examples/jsm/controls/OrbitControls.js";
import { GUI } from "https://cdn.skypack.dev/three@0.137.0/examples/jsm/libs/lil-gui.module.min.js";
import Stats from "https://cdn.skypack.dev/three@0.132.0/examples/jsm/libs/stats.module.js";
import { particleObject } from "./particleObject.js";
import { ambientParticles } from "./ambientParticles.js";

///////////////////////////// BROWSER CHECK

let isSafari = false;
let isMobile = false;

if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
  isMobile = true;
} else {
  isMobile = false;
}

let camera, scene, renderer, stats, controls;
let ambParticles;

let tCell = new particleObject();
let bars = new particleObject();
let barcode = new particleObject();

let plusZ = 0;
let scrollMoveDistance = 0;
let transitionAnim = false;
let flyDistance = 0;

const storyStage = {
  cameraStart: new THREE.Vector3(-20, -10, 40),
  cameraEnd: new THREE.Vector3(2, -3, 15),
  sceneObjects: [],
  stageCointainer: new THREE.Object3D(),
  moveForwardThreshold: 350,
  moveBackThreshold: -250,
  transitionSpeed: 6,
  animationProgress: 0,
  flyRange: 500,
};

let darkMode = false;
let freeCam = false;

let mouse = new THREE.Vector3(0, 0, 0.5);
let camTargetRotX = 0;
let camTargetRotY = 0;

const colorPallete = [0x74d5a7, 0x92c846, 0x00916c, 0x4fcfae, 0x84d6cd, 0x9ce5f0, 0xe1e9f1];

const params = {
  camControl: function () {
    freeCam = !freeCam;
    controls.enabled = freeCam;
  },
  camRot: 0.4,
  sizeMult: 0.44,
  countMult: 65,
  backgroundColor: 0xdfe9f2,
  darkBackground: 0x000000,
  changeBG: function () {
    darkMode = !darkMode;
    if (darkMode) {
      for (let i = 0; i < storyStage.sceneObjects.length; i++) {
        storyStage.sceneObjects[i].changeRimColor(new THREE.Color(params.darkBackground));
      }
      renderer.setClearColor(params.darkBackground);
    } else {
      for (let i = 0; i < storyStage.sceneObjects.length; i++) {
        storyStage.sceneObjects[i].changeRimColor(new THREE.Color(0xffffff));
      }
      renderer.setClearColor(0, 0);
    }
  },
};

/////////////////////// RAYCASTER

let raycaster = new THREE.Raycaster();

init();
animate();

function init() {
  scene = new THREE.Scene();

  //---------------- Camera --------------------------

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 3000);
  camera.position.set(storyStage.cameraStart.x, storyStage.cameraStart.y, storyStage.cameraStart.z);
  camera.rotation.z = -Math.PI;

  //---------------- Lights --------------------------

  const light1 = new THREE.DirectionalLight(0xffffff, 0.5);
  light1.position.set(0, 100, 250);
  scene.add(light1);

  const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
  light2.position.set(0, -100, -250);
  scene.add(light2);

  scene.add(new THREE.AmbientLight(0x999999));

  //---------------- Render --------------------------

  renderer = new THREE.WebGLRenderer({ antyalias: true, alpha: true });

  // renderer.setClearAlpha(0,0);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  //---------------- Controls --------------------------

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enabled = freeCam;
  // controls.target = new THREE.Vector3(0, 18, 0);
  controls.enableDamping = true;
  // controls.addEventListener("change", () => {
  //   for (let i = 0; i < sceneObjects.length; i++) {
  //     const pos = sceneObjects[i].position;
  //     let d = pos.distanceTo(camera.position);
  //     sceneObjects[i].zoomResample(d);
  //   }
  // });

  // controls.autoRotate = true;
  // controls.autoRotateSpeed = 0.5;

  //---------------------- Listeners -----------------

  window.addEventListener("resize", onWindowResize);
  document.addEventListener("mousemove", onDocumentMouseMove, false);
  document.addEventListener("wheel", onDocumentWheel, false);
  document.addEventListener("click", onDocumentClick, false);

  //---------------- GUI --------------------------

  // stats = new Stats();
  // document.body.appendChild(stats.dom);

  const gui = new GUI();
  gui.add(params, "camControl");
  // const folder1 = gui.addFolder("Particles");
  // folder1
  //   .add(params, "sizeMult", 0, 2, 0.01)
  //   .onChange(() => {
  //     for (let i = 0; i < storyStage.sceneObjects.length; i++) {
  //       storyStage.sceneObjects[i].particleParams.particleSizeMult = params.sizeMult;
  //       storyStage.sceneObjects[i].changeParticleSize();
  //     }
  //   })
  //   .listen();
  // folder1.add(params, "countMult", 10, 100).onChange(() => {
  //   for (let i = 0; i < storyStage.sceneObjects.length; i++) {
  //     storyStage.sceneObjects[i].particleParams.particleCntMult = params.countMult;
  //     storyStage.sceneObjects[i].zoomResample(camera);
  //   }
  // });

  gui.add(params, "changeBG");
  // gui.close();

  ///////////////////// Build scene, add objects

  scene.add(storyStage.stageCointainer);

  // buildSpaceParticles();
  buildScene();
  ambParticles = new ambientParticles(scene);
}

//---------------- Animate --------------------------

function animate(time) {
  plusZ += (0 - plusZ) * 0.05;

  if (storyStage.animationProgress > 2) {
    plusZ = 0;
    storyStage.animationProgress = 2;
  }

  if (storyStage.animationProgress < 0) {
    plusZ = 0;
    storyStage.animationProgress = 0;
  }
  // console.log(storyStage.animationProgress);
  storyStage.animationProgress += plusZ;
  if (!freeCam) {
    if (storyStage.animationProgress > 0 && storyStage.animationProgress <= 1) {
      let v = new THREE.Vector3();
      v.lerpVectors(tCell.startPosition, tCell.targetPosition, storyStage.animationProgress);
      tCell.setPosition(v);

      let c = new THREE.Vector3();
      c.lerpVectors(storyStage.cameraStart, storyStage.cameraEnd, storyStage.animationProgress);
      camera.position.x = c.x;
      camera.position.y = c.x;
      camera.position.z = c.z;
      camera.lookAt(scene.position);
      camera.updateMatrixWorld();
    }
    if (storyStage.animationProgress > 1 && storyStage.animationProgress <= 2) {
      let b = new THREE.Vector3();
      b.lerpVectors(bars.startPosition, bars.targetPosition, storyStage.animationProgress - 1);
      bars.setPosition(b);
    }
  }

  if (storyStage.animationProgress > 1.9) barcode.particles.visible = true;
  else barcode.particles.visible = false;

  if (storyStage.animationProgress > 1) bars.particles.visible = true;
  else bars.particles.visible = false;

  // camera.rotation.x += (camTargetRotX - camera.rotation.x) * 0.03;
  // camera.rotation.y += (camTargetRotY - camera.rotation.y) * 0.03;
  // plusZ += (0 - plusZ) * 0.05;
  // if (!ambParticles.flying) {
  //   ambParticles.speed = plusZ;
  //   ambParticles.fly();
  // }
  // // scene object scroll move
  // for (let i = 0; i < storyStage.sceneObjects.length; i++) {
  //   if (!transitionAnim) {
  //     storyStage.sceneObjects[i].particles.position.z += ambParticles.speed;
  //     // ambParticles.particles.position.z += plusZ;
  //     scrollMoveDistance += plusZ;
  //   }
  // }
  // // ambient particles fly
  // if (scrollMoveDistance > storyStage.moveForwardThreshold) {
  //   transitionAnim = true;
  //   ambParticles.speed = storyStage.transitionSpeed;
  // } else if (scrollMoveDistance <= storyStage.moveBackThreshold) {
  //   transitionAnim = true;
  //   ambParticles.speed = -storyStage.transitionSpeed;
  // }
  // if (transitionAnim) {
  //   for (let i = 0; i < storyStage.sceneObjects.length; i++) {
  //     storyStage.sceneObjects[i].particles.position.z += ambParticles.speed;
  //     if (storyStage.sceneObjects[i].particles.position.z >= storyStage.flyRange)
  //       storyStage.sceneObjects[i].particles.position.z = -storyStage.flyRange;
  //     if (storyStage.sceneObjects[i].particles.position.z < -storyStage.flyRange)
  //       storyStage.sceneObjects[i].particles.position.z = storyStage.flyRange;
  //   }
  // }
  // if (transitionAnim) {
  //   ambParticles.particles.geometry.setDrawRange(0, 5000);
  //   ambParticles.fly();
  //   flyDistance += ambParticles.speed;
  // } else {
  //   ambParticles.particles.geometry.setDrawRange(0, 2000);
  //   ambParticles.stop();
  // }
  // if (Math.abs(flyDistance) >= 2 * storyStage.flyRange) {
  //   scrollMoveDistance = 0;
  //   flyDistance = 0;
  //   transitionAnim = false;
  //   // console.log(storyStage.sceneObjects[0].particles.position.z, storyStage.sceneObjects[0].position.z);
  // }

  requestAnimationFrame(animate);
  render();
  if (freeCam) controls.update();
  // stats.update();
  TWEEN.update(time);
}

//---------------- Render --------------------------

function render() {
  // spaceParticles.rotation.y += 0.0002;
  // spaceParticles.rotation.x += 0.0002;

  for (let i = 0; i < storyStage.sceneObjects.length; i++) {
    storyStage.sceneObjects[i].update();
  }

  renderer.render(scene, camera);
}
// ----------------------Event handlers----------------------------

function onDocumentMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  camTargetRotX = mouse.y * params.camRot;
  camTargetRotY = -mouse.x * params.camRot;

  // mouse.unproject(camera);
  // raycaster = new THREE.Raycaster(camera.position, mouse.sub(camera.position).normalize());
  // const intersects = raycaster.intersectObjects(storyStage.stageCointainer.children);

  // if (intersects.length > 0) {
  //   if (intersects[0].object.visible) document.body.style.cursor = "pointer";
  //   for (let i = 0; i < storyStage.sceneObjects.length; i++) {
  //     if (storyStage.sceneObjects[i].uuid == intersects[0].object.uuid) {
  //       storyStage.sceneObjects[i].scale = 0.7;
  //     }
  //   }
  // } else {
  //   document.body.style.cursor = "default";
  //   for (let i = 0; i < storyStage.sceneObjects.length; i++) {
  //     storyStage.sceneObjects[i].scale = 0.5;
  //   }
  // }
}

function onDocumentClick(event) {
  // mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  // mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  // mouse.unproject(camera);
  // raycaster = new THREE.Raycaster(camera.position, mouse.sub(camera.position).normalize());
  // const intersects = raycaster.intersectObjects(storyStage.stageCointainer.children);
  // if (intersects.length > 0) {
  //   for (let i = 0; i < storyStage.sceneObjects.length; i++) {
  //     if (storyStage.sceneObjects[i].uuid == intersects[0].object.uuid) {
  //       storyStage.sceneObjects[i].changeColor(colorPallete[Math.floor(Math.random() * (colorPallete.length - 1))]);
  //     }
  //   }
  //   //console.log(intersects[0].object.uuid);
  //   // intersects[0].object.visible = false;
  // }
}

function onDocumentWheel(event) {
  // for (let i = 0; i < storyStage.sceneObjects.length; i++) {
  //   storyStage.sceneObjects[i].zoomResample(camera);
  // }

  plusZ += event.deltaY / 20000;
  // console.log(plusZ);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ----------------------------------------------

function buildScene() {
  storyStage.stageCointainer.rotation.z = -Math.PI / 12;
  const cancer = new particleObject(storyStage.stageCointainer, "gltf/scene01/cancer.glb", colorPallete[3]);
  cancer.particleParams.particleCount = 200000;
  cancer.particleParams.particleSize = 0.2;
  cancer.buildParticles();
  cancer.setScale(0.5);
  cancer.setPosition(new THREE.Vector3(17, 0, 0));
  cancer.setRotation(new THREE.Vector3(Math.PI / 2, 0, Math.PI / 2));
  storyStage.sceneObjects.push(cancer);

  tCell = new particleObject(storyStage.stageCointainer, "gltf/scene01/tCellOuterPart.glb", colorPallete[5]);
  tCell.particleParams.particleCount = 50000;
  tCell.particleParams.particleSize = 0.2;
  tCell.buildParticles();
  tCell.setScale(0.5);
  tCell.setPosition(new THREE.Vector3(-44, 0, 0));
  tCell.startPosition = tCell.position;
  tCell.targetPosition = new THREE.Vector3(-14, 0, 0);
  storyStage.sceneObjects.push(tCell);

  const tCellNucleus = new particleObject(storyStage.stageCointainer, "gltf/scene01/tCellNucleus.glb", colorPallete[3]);
  tCellNucleus.particleParams.particleCount = 10000;
  tCellNucleus.particleParams.particleSize = 0.2;
  tCellNucleus.buildParticles();
  tCell.objectContainer.add(tCellNucleus.objectContainer);
  tCellNucleus.setScale(1);
  tCellNucleus.setPosition(new THREE.Vector3(0, 0, 0));

  const tCellReceptor = new particleObject(storyStage.stageCointainer, "gltf/scene01/receptorTcell.glb", colorPallete[5]);
  tCellReceptor.particleParams.particleCount = 4000;
  tCellReceptor.particleParams.particleSize = 0.2;
  tCellReceptor.buildParticles();
  tCell.objectContainer.add(tCellReceptor.objectContainer);
  tCellReceptor.setScale(1);
  tCellReceptor.setPosition(new THREE.Vector3(18, 0, 0));
  tCellReceptor.setRotation(new THREE.Vector3(Math.PI / 2, 0, Math.PI / 2));

  const cancerReceptor = new particleObject(storyStage.stageCointainer, "gltf/scene01/receptorCancer.glb", colorPallete[3]);
  cancerReceptor.particleParams.particleCount = 4000;
  cancerReceptor.particleParams.particleSize = 0.2;
  cancerReceptor.buildParticles();
  cancerReceptor.setScale(0.5);
  cancerReceptor.setPosition(new THREE.Vector3(1, 0, 0));
  cancerReceptor.setRotation(new THREE.Vector3(Math.PI / 2, 0, Math.PI / 2));
  storyStage.sceneObjects.push(cancerReceptor);

  bars = new particleObject(storyStage.stageCointainer, "gltf/scene01/bars.glb", colorPallete[0]);
  bars.particleParams.particleCount = 5000;
  bars.particleParams.particleSize = 0.2;
  bars.buildParticles();
  bars.setScale(0.5);
  bars.setPosition(new THREE.Vector3(20, 0, 0));
  bars.startPosition = bars.position;
  bars.targetPosition = new THREE.Vector3(-3, 0, 0);
  bars.setRotation(new THREE.Vector3(Math.PI / 2, 0, Math.PI / 2));
  bars.particles.visible = false;
  storyStage.sceneObjects.push(bars);

  barcode = new particleObject(storyStage.stageCointainer, "gltf/scene01/barcode.glb", colorPallete[0]);
  barcode.particleParams.particleCount = 1000;
  barcode.particleParams.particleSize = 0.2;
  barcode.buildParticles();
  barcode.setScale(0.5);
  barcode.setPosition(new THREE.Vector3(-2.4, 0, 0));
  barcode.startPosition = bars.position;
  barcode.targetPosition = new THREE.Vector3(0, 0, 0);
  barcode.setRotation(new THREE.Vector3(Math.PI / 2, 0, Math.PI / 2));
  barcode.particles.visible = false;
  storyStage.sceneObjects.push(bars);
}
