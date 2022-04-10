import * as THREE from "https://cdn.skypack.dev/three@0.132.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.132.0/examples/jsm/controls/OrbitControls.js";
import { GUI } from "https://cdn.skypack.dev/three@0.137.0/examples/jsm/libs/lil-gui.module.min.js";
import Stats from "https://cdn.skypack.dev/three@0.132.0/examples/jsm/libs/stats.module.js";
import { storyStage } from "./storyStage.js";

///////////////////////////// BROWSER CHECK

let isSafari = false;
let isMobile = false;

if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
  isMobile = true;
} else {
  isMobile = false;
}

let camera, scene, renderer, stats, controls;
let stage01;
let animationProgress = 0;

let plusZ = 0;
let scrollMoveDistance = 0;
let transitionAnim = false;
let flyDistance = 0;

let darkMode = false;
let freeCam = false;

let mouse = new THREE.Vector3(0, 0, 0.5);
let camTargetRotX = 0;
let camTargetRotY = 0;

const params = {
  camControl: function () {
    freeCam = !freeCam;
    controls.enabled = freeCam;
  },
  camRot: 0.1,
  sizeMult: 0.44,
  countMult: 65,
  backgroundColor: 0xdfe9f2,
  darkBackground: 0x000000,
  changeBG: function () {
    darkMode = !darkMode;
    if (darkMode) {
      for (let i = 0; i < stage01.sceneObjects.length; i++) {
        stage01.sceneObjects[i].changeRimColor(new THREE.Color(params.darkBackground));
      }
      renderer.setClearColor(params.darkBackground);
    } else {
      for (let i = 0; i < stage01.sceneObjects.length; i++) {
        stage01.sceneObjects[i].changeRimColor(new THREE.Color(0xffffff));
      }
      renderer.setClearColor(0, 0);
    }
  },
  animate: function () {
    startAnim();
  },
  animTween: 0,
};

function startAnim(e) {
  if (e.key == " ") {
    // freeCam = false;
    if (params.animTween == 1) {
      animateTween.to({ animTween: 0 }, 2500).start();
    }
    if (params.animTween == 0) {
      animateTween.to({ animTween: 1 }, 2500).start();
    }
  }
}

let animateTween = new TWEEN.Tween(params)
  .to({ animTween: 1 })
  .easing(TWEEN.Easing.Quadratic.InOut)
  .onComplete(() => {
    // freeCam = true;
  })
  .onUpdate(() => {
    animationProgress = params.animTween;
  });

/////////////////////// RAYCASTER

let raycaster = new THREE.Raycaster();

init();
animate();

function init() {
  scene = new THREE.Scene();

  stage01 = new storyStage(scene);

  //---------------- Camera --------------------------

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 3000);
  let c = new THREE.Vector3();
  camera.position.set(0, 0, 50);

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
  document.addEventListener("keydown", startAnim);

  //---------------- GUI --------------------------

  stats = new Stats();
  document.body.appendChild(stats.dom);

  const gui = new GUI();
  gui.add(params, "camControl");
  // const folder1 = gui.addFolder("Particles");
  // folder1
  //   .add(params, "sizeMult", 0, 2, 0.01)
  //   .onChange(() => {
  //     for (let i = 0; i < storyStd.sceneObjects.length; i++) {
  //       storyStd.sceneObjects[i].particleParams.particleSizeMult = params.sizeMult;
  //       storyStd.sceneObjects[i].changeParticleSize();
  //     }
  //   })
  //   .listen();
  // folder1.add(params, "countMult", 10, 100).onChange(() => {
  //   for (let i = 0; i < storyStd.sceneObjects.length; i++) {
  //     storyStd.sceneObjects[i].particleParams.particleCntMult = params.countMult;
  //     storyStd.sceneObjects[i].zoomResample(camera);
  //   }
  // });

  gui.add(params, "changeBG");
  // gui.add(params, "animate");
  gui.close();

  ///////////////////// Build scene, add objects
}

//---------------- Animate --------------------------

function animate(time) {
  if (!freeCam) {
    plusZ += (0 - plusZ) * 0.05;

    // let animx = animationProgress;
    // animationProgress += plusZ * (-(animx * animx) * 0.8 + 1);

    if (animationProgress > 1) {
      plusZ = 0;
      animationProgress = 1;
    }

    if (animationProgress < 0) {
      plusZ = 0;
      animationProgress = 0;
    }

    camera.rotation.x += (camTargetRotX - camera.rotation.x) * 0.03;
    camera.rotation.y += (camTargetRotY - camera.rotation.y) * 0.03;
  }
  // camera.lookAt(scene.position);

  // if (animationProgress >= 0 && animationProgress <= 1) {
  //   let c = new THREE.Vector3();
  //   c.lerpVectors(stage01.cameraStart, stage01.cameraEnd, animationProgress);
  //   camera.position.x = c.x;
  //   camera.position.y = c.x;
  //   camera.position.z = c.z;
  //   // camera.lookAt(scene.position);
  //   camera.updateMatrixWorld();
  // }
  // }
  // let cameraDirection = new THREE.Vector3();
  // camera.getWorldDirection(cameraDirection);

  // let direction = new THREE.Vector3();
  // direction.subVectors(scene.position, camera.position);

  // camera.rotation.x += (camTargetRotX - camera.rotation.x) * 0.03;
  // camera.rotation.y += (camTargetRotY - camera.rotation.y) * 0.03;

  if (stage01.ready) stage01.update(animationProgress);

  // if (freeCam) {

  //   camera.rotation.x += (camTargetRotX - camera.rotation.x) * 0.03;
  //   camera.rotation.y += (camTargetRotY - camera.rotation.y) * 0.03;
  // }

  // plusZ += (0 - plusZ) * 0.05;
  // if (!ambParticles.flying) {
  //   ambParticles.speed = plusZ;
  //   ambParticles.fly();
  // }
  // // scene object scroll move
  // for (let i = 0; i < storyStd.sceneObjects.length; i++) {
  //   if (!transitionAnim) {
  //     storyStd.sceneObjects[i].particles.position.z += ambParticles.speed;
  //     // ambParticles.particles.position.z += plusZ;
  //     scrollMoveDistance += plusZ;
  //   }
  // }
  // // ambient particles fly
  // if (scrollMoveDistance > storyStd.moveForwardThreshold) {
  //   transitionAnim = true;
  //   ambParticles.speed = storyStd.transitionSpeed;
  // } else if (scrollMoveDistance <= storyStd.moveBackThreshold) {
  //   transitionAnim = true;
  //   ambParticles.speed = -storyStd.transitionSpeed;
  // }
  // if (transitionAnim) {
  //   for (let i = 0; i < storyStd.sceneObjects.length; i++) {
  //     storyStd.sceneObjects[i].particles.position.z += ambParticles.speed;
  //     if (storyStd.sceneObjects[i].particles.position.z >= storyStd.flyRange)
  //       storyStd.sceneObjects[i].particles.position.z = -storyStd.flyRange;
  //     if (storyStd.sceneObjects[i].particles.position.z < -storyStd.flyRange)
  //       storyStd.sceneObjects[i].particles.position.z = storyStd.flyRange;
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
  // if (Math.abs(flyDistance) >= 2 * storyStd.flyRange) {
  //   scrollMoveDistance = 0;
  //   flyDistance = 0;
  //   transitionAnim = false;
  //   // console.log(storyStd.sceneObjects[0].particles.position.z, storyStd.sceneObjects[0].position.z);
  // }

  requestAnimationFrame(animate);
  render();
  if (freeCam) controls.update();
  stats.update();
  TWEEN.update(time);
}

//---------------- Render --------------------------

function render() {
  // ambParticles.rotation.y += 0.0002;
  // ambParticles.rotation.x += 0.0002;

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
  // const intersects = raycaster.intersectObjects(storyStd.stageCointainer.children);

  // if (intersects.length > 0) {
  //   if (intersects[0].object.visible) document.body.style.cursor = "pointer";
  //   for (let i = 0; i < storyStd.sceneObjects.length; i++) {
  //     if (storyStd.sceneObjects[i].uuid == intersects[0].object.uuid) {
  //       storyStd.sceneObjects[i].scale = 0.7;
  //     }
  //   }
  // } else {
  //   document.body.style.cursor = "default";
  //   for (let i = 0; i < storyStd.sceneObjects.length; i++) {
  //     storyStd.sceneObjects[i].scale = 0.5;
  //   }
  // }
}

function onDocumentClick(event) {
  // mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  // mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  // mouse.unproject(camera);
  // raycaster = new THREE.Raycaster(camera.position, mouse.sub(camera.position).normalize());
  // const intersects = raycaster.intersectObjects(storyStd.stageCointainer.children);
  // if (intersects.length > 0) {
  //   for (let i = 0; i < storyStd.sceneObjects.length; i++) {
  //     if (storyStd.sceneObjects[i].uuid == intersects[0].object.uuid) {
  //       storyStd.sceneObjects[i].changeColor(colorPallete[Math.floor(Math.random() * (colorPallete.length - 1))]);
  //     }
  //   }
  //   //console.log(intersects[0].object.uuid);
  //   // intersects[0].object.visible = false;
  // }
}

function onDocumentWheel(event) {
  // for (let i = 0; i < storyStd.sceneObjects.length; i++) {
  //   storyStd.sceneObjects[i].zoomResample(camera);
  // }

  if (!freeCam) plusZ += event.deltaY / 20000;
  // console.log(plusZ);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ----------------------------------------------
