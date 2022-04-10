import * as THREE from "https://cdn.skypack.dev/three@0.132.0/build/three.module.js";
import { particleObject } from "./particleObject.js";
import { ambientParticles } from "./ambientParticles.js";

class storyStage {
  sceneObjects = [];
  stageContainer = new THREE.Object3D();
  startPosition = new THREE.Vector3();
  targetPosition = new THREE.Vector3();
  startRotation = new THREE.Vector3();
  targetRotation = new THREE.Vector3();
  // moveForwardThreshold = 350;
  // moveBackThreshold = -250;
  // transitionSpeed = 6;
  animationProgress = 0;
  // flyRange = 500;
  parentContainer;
  dataUrl = "data/stage01.json";
  ready = false;
  loadedData;
  tCell;
  bars;
  barcode;
  ambParticles;

  colorPallete = [0x74d5a7, 0x92c846, 0x00916c, 0x4fcfae, 0x84d6cd, 0x9ce5f0, 0xe1e9f1];

  constructor(cont) {
    this.parentContainer = cont;
    this.loadJSON();
  }

  async getStageData(url) {
    let response = await fetch(url);
    let data = await response.json();
    return data;
  }

  loadJSON() {
    this.getStageData(this.dataUrl).then((data) => {
      this.loadedData = data;
      this.buildScene();
    });
  }

  buildScene() {
    this.ambParticles = new ambientParticles(this.stageContainer);

    this.startPosition.x = this.loadedData.stageContainer.startPosition[0];
    this.startPosition.y = this.loadedData.stageContainer.startPosition[1];
    this.startPosition.z = this.loadedData.stageContainer.startPosition[2];

    this.targetPosition.x = this.loadedData.stageContainer.targetPosition[0];
    this.targetPosition.y = this.loadedData.stageContainer.targetPosition[1];
    this.targetPosition.z = this.loadedData.stageContainer.targetPosition[2];

    this.startRotation.x = this.loadedData.stageContainer.startRotation[0];
    this.startRotation.y = this.loadedData.stageContainer.startRotation[1];
    this.startRotation.z = this.loadedData.stageContainer.startRotation[2];

    this.targetRotation.x = this.loadedData.stageContainer.targetRotation[0];
    this.targetRotation.y = this.loadedData.stageContainer.targetRotation[1];
    this.targetRotation.z = this.loadedData.stageContainer.targetRotation[2];

    this.stageContainer.position.set(this.startPosition.x, this.startPosition.y, this.startPosition.z);
    this.stageContainer.rotation.set(this.startRotation.x, this.startRotation.y, this.startRotation.z);

    console.log(this.stageContainer.position);

    // this.stageContainer.rotation.x = this.loadedData.stageContainer.startRotation[0];
    // this.stageContainer.rotation.y = this.loadedData.stageContainer.startRotation[1];
    // this.stageContainer.rotation.z = this.loadedData.stageContainer.startRotation[2];

    this.loadedData.sceneObjs.forEach(
      function (item) {
        let tmpParent = this.stageContainer;
        for (let i = 0; i < this.sceneObjects.length; i++) {
          if (this.sceneObjects[i].name == item.parent) tmpParent = this.sceneObjects[i].objectContainer;
        }

        const tmpObj = new particleObject(tmpParent, item.gltfFile, this.colorPallete[item.color]);
        tmpObj.name = item.name;
        tmpObj.particleParams.particleCount = item.particleCount;
        tmpObj.particleParams.particleSize = item.particleSize;
        tmpObj.particleParams.surfaceNoise = item.surfaceNoise;
        tmpObj.buildParticles();
        tmpParent.add(tmpObj.objectContainer);
        tmpObj.setScale(item.startScale);
        tmpObj.startScale = tmpObj.scale;
        tmpObj.targetScale = new THREE.Vector3(item.targetScale[0], item.targetScale[1], item.targetScale[2]);
        tmpObj.setPosition(new THREE.Vector3(item.startPosition[0], item.startPosition[1], item.startPosition[2]));
        tmpObj.startPosition = tmpObj.position;
        tmpObj.targetPosition = new THREE.Vector3(item.targetPosition[0], item.targetPosition[1], item.targetPosition[2]);
        tmpObj.setRotation(new THREE.Vector3(item.startRotation[0], item.startRotation[1], item.startRotation[2]));
        tmpObj.startRotation = tmpObj.rotation;
        tmpObj.targetRotation = new THREE.Vector3(item.targetRotation[0], item.targetRotation[1], item.targetRotation[2]);
        tmpObj.show = true;
        tmpObj.showRangeStrat = item.showRangeStrat;
        tmpObj.showRangeEnd = item.showRangeEnd;
        this.sceneObjects.push(tmpObj);
      }.bind(this)
    );

    this.parentContainer.add(this.stageContainer);

    this.ready = true;
  }

  update(animProgress) {
    this.ambParticles.update();

    if (animProgress >= 1) animProgress = 1;

    let posVec = new THREE.Vector3();
    posVec.lerpVectors(this.startPosition, this.targetPosition, animProgress);

    let rotVec = new THREE.Vector3();
    rotVec.lerpVectors(this.startRotation, this.targetRotation, animProgress);

    this.stageContainer.position.set(posVec.x, posVec.y, posVec.z);
    this.stageContainer.rotation.set(rotVec.x, rotVec.y, rotVec.z);

    if (animProgress == 1) {
      this.stageContainer.position.x = this.targetPosition.x;
      this.stageContainer.position.y = this.targetPosition.y;
      this.stageContainer.position.z = this.targetPosition.z;
    }

    for (let i = 0; i < this.sceneObjects.length; i++) {
      this.sceneObjects[i].update(animProgress);
    }
  }
}

export { storyStage };
