// tslint:disable: prefer-for-of
// tslint:disable: typedef
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { ElementRef, Injectable, NgZone, OnDestroy } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EngineService implements OnDestroy {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private light: THREE.AmbientLight;
  private cube: THREE.Mesh;
  private frameId: number = null;
  public constructor(private ngZone: NgZone) {}
  public ngOnDestroy(): void {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }
  public createScene(canvas: ElementRef<HTMLCanvasElement>): void {
    this.canvas = canvas.nativeElement;
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x222222);
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 0;
    this.camera.position.x = 20;
    this.camera.position.y = 0;
    this.scene.add(this.camera);

    this.light = new THREE.AmbientLight(0x404040);
    this.light.position.z = 10;
    this.scene.add(this.light);
    // const geometry = new THREE.BoxGeometry(1, 1, 1);
    // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    // this.cube = new THREE.Mesh(geometry, material);
    // this.scene.add(this.cube);
    const geo = new THREE.PlaneGeometry(100, 100, 100);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xefefef,
      side: THREE.DoubleSide,
    });
    const floor = new THREE.Mesh(geo, mat);
    floor.rotation.x -= Math.PI / 2;
    // Fix shadow later
    floor.receiveShadow = true;
    floor.position.y = -9;
    // this.scene.add(floor);
  }

  public resetCamera(): void {
    // Load controls and reset function
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.update();
    const reset = document.getElementsByClassName('reset');
    for (let i = 0; i < reset.length; i++) {
      reset[i].addEventListener('click', onButtonClick, false);
    }

    function onButtonClick(event) {
      console.log('Resetting camera');
      controls.reset();
    }
  }

  public createLights(): void {
    const hemiLight = new THREE.HemisphereLight(0xfea735, 0xfea735, 1);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHex(0xfea735);
    hemiLight.position.set(0, 25, 0);
    this.scene.add(hemiLight);

    const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
    this.scene.add(hemiLightHelper);
    const dirLight = new THREE.DirectionalLight(0xfea735, 1);
    dirLight.color.setHSL(0.1, 1, 0.95);
    dirLight.position.set(1, 1.75, 1);
    dirLight.position.multiplyScalar(30);
    // Shadow Test
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 512;
    dirLight.shadow.mapSize.height = 512;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 500;

    this.scene.add(dirLight);

    // Fix shadows later
    // dirLight.castShadow = true;
    // dirLight.shadow.mapSize.width = 2048;
    // dirLight.shadow.mapSize.height = 2048;

    // const d = 50;
    // dirLight.shadow.camera.left = -d;
    // dirLight.shadow.camera.right = d;
    // dirLight.shadow.camera.top = d;
    // dirLight.shadow.camera.bottom = -d;
    // dirLight.shadow.camera.far = 3500;
    // dirLight.shadow.bias = -0.0001;

    const dirLightHeper = new THREE.DirectionalLightHelper(dirLight, 10);
    this.scene.add(dirLightHeper);
  }

  public createModel(): void {
    let mesh;
    const objLoader = new OBJLoader();
    const mtlLoader = new MTLLoader();
    mtlLoader.setPath('../../assets/models/ak/').load('ak.mtl', (materials) => {
      materials.preload();

      objLoader
        .setPath('../../assets/models/ak/')
        .setMaterials(materials)
        .load('ak.obj', (loadedMesh) => {
          mesh = loadedMesh;
          const model = loadedMesh;
          model.children[0].castShadow = true;
          model.children[0].receiveShadow = true;
          model.name = 'model';
          console.log(model);
          this.scene.add(model);
        });
    });
    // const loader = new GLTFLoader();
    // // Decode compressed mesh data
    // const dracoLoader = new DRACOLoader();
    // dracoLoader.setDecoderPath('/node_modules/three/examples/js/libs/draco/');
    // loader.setDRACOLoader(dracoLoader);
    // loader.load(
    //   '../../assets/models/ak/cartel.gltf',
    //   (gltf) => {
    //     gltf.scene.traverse((object) => {
    //       if (object instanceof THREE.Group) {
    //         object.castShadow = true;
    //         object.receiveShadow = true;
    //       }
    //     });
    //     this.scene.add(gltf.scene);
    //     console.log(gltf.scene);
    //   },
    //   (xhr) => {
    //     console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    //   },
    //   (error) => {
    //     console.log('An error happened');
    //   }
    // );
  }

  public removeModel(): void {
    const swap = document.getElementsByClassName('swap');
    for (let i = 0; i < swap.length; i++) {
      swap[i].addEventListener('click', onButtonClick, false);
    }
    const model = this.scene;
    function onButtonClick(event) {
      console.log('dispose renderer!');
      model.remove(model.getObjectByName('model'));
    }
  }

  public swapTexture(): void {
    const texture = document.getElementsByClassName('texture');
    for (let i = 0; i < texture.length; i++) {
      texture[i].addEventListener('click', onButtonClick, false);
    }
    function onButtonClick(event) {
      console.log('Swapping textures');
    }
  }

  public animate(): void {
    // Run outside of Angular or it'll cause changeDetection to cycle
    this.ngZone.runOutsideAngular(() => {
      if (document.readyState !== 'loading') {
        this.render();
      } else {
        window.addEventListener('DOMContentLoaded', () => {
          this.render();
        });
      }
      window.addEventListener('resize', () => {
        this.resize();
      });
    });
  }

  public render(): void {
    this.frameId = requestAnimationFrame(() => {
      this.render();
    });
    this.renderer.render(this.scene, this.camera);
  }
  public resize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}
