import * as THREE from "https://cdn.skypack.dev/three@0.132.0/build/three.module.js";
import { particleObject } from "./particleObject.js";
import { ambientParticles } from "./ambientParticles.js";

class storyStage {
  cameraStart = new THREE.Vector3(-20, -10, 40);
  cameraEnd = new THREE.Vector3(2, -3, 15);
  sceneObjects = [];
  stageCointainer = new THREE.Object3D();
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
    this.stageCointainer.rotation.z = this.loadedData.stageContainer.startRotation[2];

    this.loadedData.sceneObjs.forEach(
      function (item) {
        let tmpParent = this.stageCointainer;
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
        this.sceneObjects.push(tmpObj);
      }.bind(this)
    );

    this.parentContainer.add(this.stageCointainer);
    this.ready = true;
  }

  update(animProgress) {
    // if (animProgress > 1.2) this.barcode.show = true;
    // else this.barcode.show = false;

    // if (animProgress > 1) this.bars.show = true;
    // else this.bars.show = false;

    for (let i = 0; i < this.sceneObjects.length; i++) {
      let v = new THREE.Vector3();
      v.lerpVectors(this.sceneObjects[i].startPosition, this.sceneObjects[i].targetPosition, animProgress);
      this.sceneObjects[i].setPosition(v);
      if (animProgress == 1) this.sceneObjects[i].setPosition(this.sceneObjects[i].targetPosition);

      this.sceneObjects[i].update();
    }
  }
}

export { storyStage };
