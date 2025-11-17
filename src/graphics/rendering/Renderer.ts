import * as THREE from 'three';

export class Renderer {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    
    // Initialize Three.js renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);

    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    // Set up top-down 2.5D camera position
    this.camera.position.set(0, 50, 0);
    this.camera.lookAt(0, 0, 0);
    this.camera.up.set(0, 0, 1);

    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));

    console.log('🎮 Renderer initialized');
  }

  private onWindowResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  public render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  public getScene(): THREE.Scene {
    return this.scene;
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  public dispose(): void {
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    
    this.renderer.dispose();
    this.scene.clear();
  }

  public setClearColor(color: THREE.Color): void {
    this.renderer.setClearColor(color);
  }

  public setSize(width: number, height: number): void {
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
}

export function initializeRendering(): Renderer {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  
  if (!canvas) {
    throw new Error('Game canvas element not found');
  }

  // Set canvas size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.tabIndex = 0; // Make canvas focusable

  // Initialize renderer
  const renderer = new Renderer(canvas);

  // Add basic lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  renderer.getScene().add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 10, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  renderer.getScene().add(directionalLight);

  // Add a simple ground plane for testing
  const groundGeometry = new THREE.PlaneGeometry(100, 100);
  const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x2d3748,
    roughness: 0.8,
    metalness: 0.2
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  renderer.getScene().add(ground);

  console.log('🎮 Rendering system initialized with basic scene');
  return renderer;
}