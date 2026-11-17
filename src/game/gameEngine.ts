import * as THREE from 'three';
import { createAnt, addCubeToAnt, clearAntCubes, updateAntAnimation, transformToGoldenQueen, AntEntity } from './antModel';
import { createSpider, updateSpiderAnimation, SpiderEntity } from './spiderModel';
import { soundManager } from '../audio/soundManager';

export interface FoodCubeItem {
  id: string;
  mesh: THREE.Mesh;
  color: string;
  value: number;
  originalPos: THREE.Vector3;
  isHarvested: boolean;
  respawnTimer: number;
}

export interface FlyingCube {
  mesh: THREE.Mesh;
  startPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  progress: number;
  speed: number;
  onComplete: () => void;
}

export interface GameEngineCallbacks {
  onScoreGained: (amount: number, x: number, y: number, label?: string) => void;
  onStackChanged: (current: number, max: number) => void;
  onOpenUpgradeShop: () => void;
  onLevelUp: (level: number) => void;
  onSpiderChase?: (isChasing: boolean) => void;
}

export class GameEngine {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private container: HTMLElement;

  // Entities
  public playerAnt: AntEntity;
  public workerAnts: AntEntity[] = [];
  public spider: SpiderEntity;
  public playerInvincibleTimer: number = 0;
  public foodCubes: FoodCubeItem[] = [];
  public flyingCubes: FlyingCube[] = [];

  // Locations & Geometry
  public holePosition = new THREE.Vector3(-5, 0, 0);
  public upgradePadPosition = new THREE.Vector3(-5, 0, 5);
  private holeMesh!: THREE.Group;
  private upgradePadMesh!: THREE.Group;
  private vortexParticles!: THREE.Points;

  // State
  public coins: number = 0;
  public level: number = 1;
  public totalDelivered: number = 0;
  public sweetnessMultiplier: number = 1;
  public magnetRadius: number = 2.0;
  public upgradePadCooldown: number = 0;

  // Controls
  public inputVector = new THREE.Vector2(0, 0);
  private isTouchingPad: boolean = false;
  private callbacks: GameEngineCallbacks;

  // Animation Loop
  private clock = new THREE.Clock();
  private reqId: number | null = null;
  private isRunning: boolean = false;

  constructor(container: HTMLElement, callbacks: GameEngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xdbeafe); // Soft sky warm glow
    this.scene.fog = new THREE.FogExp2(0xdbeafe, 0.015);

    // 2. Camera setup (Top-down isometric angle adapted for portrait mobile & desktop)
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    const aspect = w / h;
    this.camera = new THREE.PerspectiveCamera(aspect < 1 ? 52 : 45, aspect, 0.1, 1000);
    const camY = aspect < 1 ? 26 : 22;
    const camZ = aspect < 1 ? 20 : 18;
    this.camera.position.set(0, camY, camZ);
    this.camera.lookAt(0, 0, 0);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // 4. Lighting (Warm cartoon studio vibe)
    this.setupLighting();

    // 5. Environment (Wooden floor & Giant Toy Blocks background)
    this.buildEnvironment();

    // 6. Nest Hole & Upgrade Station
    this.buildNestHole();
    this.buildUpgradePad();

    // 7. Food Piles
    this.spawnFoodPiles();

    // 8. Player Ant (Yellow like the reference image!)
    this.playerAnt = createAnt(0xffc107, true);
    this.playerAnt.group.position.set(-1, 0, 0);
    this.scene.add(this.playerAnt.group);

    // 9. Predator Spider (Floor hazard & hunter!)
    this.spider = createSpider();
    this.spider.group.position.set(8, 0, 8);
    this.scene.add(this.spider.group);

    // 10. Resize & Events
    window.addEventListener('resize', this.onWindowResize);

    this.start();
  }

  private setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xfff1e6, 0.95);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.4);
    sunLight.position.set(15, 30, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 120;
    const d = 25;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);

    // Secondary soft blue rim light
    const rimLight = new THREE.DirectionalLight(0x93c5fd, 0.5);
    rimLight.position.set(-15, 10, -15);
    this.scene.add(rimLight);
  }

  private buildEnvironment() {
    // Stylized Wooden Floor
    const floorSize = 70;
    const floorGeo = new THREE.PlaneGeometry(floorSize, floorSize, 32, 32);
    
    // Procedural warm wood plank canvas texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#b47b48';
    ctx.fillRect(0, 0, 512, 512);

    // Draw wood planks
    const plankHeight = 64;
    for (let y = 0; y < 512; y += plankHeight) {
      ctx.fillStyle = y % 128 === 0 ? '#ba8350' : '#ad7542';
      ctx.fillRect(0, y, 512, plankHeight - 2);
      ctx.fillStyle = '#82532a';
      ctx.fillRect(0, y + plankHeight - 2, 512, 2); // Plank seam
      
      // Plank rivets / subtle grain
      for (let x = 64; x < 512; x += 128) {
        ctx.fillStyle = '#8f5d30';
        ctx.fillRect(x, y + 2, 2, plankHeight - 4);
      }
    }

    const floorTexture = new THREE.CanvasTexture(canvas);
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(12, 12);

    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.65,
      metalness: 0.05,
    });

    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Surrounding Giant Toy Cubes (as in the screenshot loading screen!)
    const toyColors = [0x3b82f6, 0xa855f7, 0xf97316, 0xeab308, 0x22c55e, 0xec4899];
    const borderStackGroup = new THREE.Group();

    const spawnToyCubeStack = (x: number, z: number, height: number) => {
      for (let h = 0; h < height; h++) {
        const size = 2.4;
        const geo = new THREE.BoxGeometry(size, size, size);
        const color = toyColors[(h + Math.floor(Math.abs(x + z))) % toyColors.length];
        const mat = new THREE.MeshStandardMaterial({
          color,
          roughness: 0.25,
          metalness: 0.1,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x + (Math.random() - 0.5) * 0.1, h * size + size / 2, z + (Math.random() - 0.5) * 0.1);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        borderStackGroup.add(mesh);
      }
    };

    // Stacks at the boundaries
    for (let i = -24; i <= 24; i += 3.2) {
      spawnToyCubeStack(i, -22, Math.floor(2 + Math.random() * 3));
      spawnToyCubeStack(i, 22, Math.floor(2 + Math.random() * 3));
      spawnToyCubeStack(-22, i, Math.floor(2 + Math.random() * 3));
      spawnToyCubeStack(22, i, Math.floor(2 + Math.random() * 3));
    }
    this.scene.add(borderStackGroup);
  }

  private buildNestHole() {
    this.holeMesh = new THREE.Group();
    this.holeMesh.position.copy(this.holePosition);

    // 1. Dark Hole Interior (Void cylinder)
    const holeInnerGeo = new THREE.CylinderGeometry(2.0, 1.6, 2.5, 32);
    const holeInnerMat = new THREE.MeshBasicMaterial({ color: 0x110d22 });
    const holeInner = new THREE.Mesh(holeInnerGeo, holeInnerMat);
    holeInner.position.y = -1.2;
    this.holeMesh.add(holeInner);

    // 2. Beveled Wooden Rim
    const rimGeo = new THREE.TorusGeometry(2.1, 0.22, 16, 40);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x5c381c,
      roughness: 0.7,
      metalness: 0.1,
    });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.08;
    this.holeMesh.add(rim);

    // 3. Glowing Suction Ring
    const glowGeo = new THREE.RingGeometry(1.6, 2.0, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    });
    const glowRing = new THREE.Mesh(glowGeo, glowMat);
    glowRing.rotation.x = -Math.PI / 2;
    glowRing.position.y = 0.05;
    this.holeMesh.add(glowRing);

    // 4. Vortex Swirl Particles
    const pCount = 80;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.3 + Math.random() * 1.5;
      pPos[i * 3] = Math.cos(angle) * radius;
      pPos[i * 3 + 1] = -Math.random() * 1.8;
      pPos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.18,
      transparent: true,
      opacity: 0.8,
    });
    this.vortexParticles = new THREE.Points(pGeo, pMat);
    this.holeMesh.add(this.vortexParticles);

    // 5. Floating Delivery Marker
    const markerGroup = new THREE.Group();
    markerGroup.position.set(0, 3.2, 0);

    const arrowGeo = new THREE.ConeGeometry(0.5, 0.9, 16);
    const arrowMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      roughness: 0.2,
    });
    const arrow = new THREE.Mesh(arrowGeo, arrowMat);
    arrow.rotation.x = Math.PI; // pointing down
    markerGroup.add(arrow);

    this.holeMesh.add(markerGroup);
    this.scene.add(this.holeMesh);
  }

  private buildUpgradePad() {
    this.upgradePadMesh = new THREE.Group();
    this.upgradePadMesh.position.copy(this.upgradePadPosition);

    // Circular Pad
    const padGeo = new THREE.CylinderGeometry(2.2, 2.2, 0.15, 32);
    const padMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x4c1d95,
      roughness: 0.3,
    });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.y = 0.08;
    pad.receiveShadow = true;
    this.upgradePadMesh.add(pad);

    // Outer Glowing Ring
    const ringGeo = new THREE.TorusGeometry(2.35, 0.12, 16, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.1;
    this.upgradePadMesh.add(ring);

    // Floating Wrench / Upgrades Icon
    const iconGeo = new THREE.TorusGeometry(0.65, 0.18, 16, 24);
    const iconMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xca8a04,
      metalness: 0.5,
      roughness: 0.2,
    });
    const icon = new THREE.Mesh(iconGeo, iconMat);
    icon.position.set(0, 2.8, 0);
    this.upgradePadMesh.add(icon);

    this.scene.add(this.upgradePadMesh);
  }

  private spawnFoodPiles() {
    // 3 Main Food Zones
    const zones = [
      { center: new THREE.Vector3(7, 0, 0), radius: 4, name: 'Sugar Hill', colorPalette: ['#06b6d4', '#84cc16', '#eab308'] },
      { center: new THREE.Vector3(8, 0, -8), radius: 3.5, name: 'Berry Candy', colorPalette: ['#ec4899', '#a855f7', '#f43f5e'] },
      { center: new THREE.Vector3(8, 0, 8), radius: 3.5, name: 'Sweet Tangerine', colorPalette: ['#f97316', '#eab308', '#22c55e'] },
    ];

    zones.forEach(zone => {
      // Pyramid / Grid formation of cubes
      const count = 18;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const dist = 0.8 + Math.sqrt(Math.random()) * zone.radius;
        const x = zone.center.x + Math.cos(angle) * dist;
        const z = zone.center.z + Math.sin(angle) * dist;
        const y = 0.35 + (i % 3) * 0.45;

        const color = zone.colorPalette[i % zone.colorPalette.length];
        const isGolden = Math.random() < 0.1; // 10% chance of golden block!
        const finalColor = isGolden ? '#ffd700' : color;
        const value = isGolden ? 50 : 10;

        const cubeGeo = new THREE.BoxGeometry(0.7, 0.7, 0.7);
        const cubeMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(finalColor),
          roughness: 0.25,
          metalness: isGolden ? 0.6 : 0.1,
          emissive: isGolden ? 0x664400 : 0x000000,
        });

        const mesh = new THREE.Mesh(cubeGeo, cubeMat);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh);

        this.foodCubes.push({
          id: `food_${zone.name}_${i}`,
          mesh,
          color: finalColor,
          value,
          originalPos: new THREE.Vector3(x, y, z),
          isHarvested: false,
          respawnTimer: 0,
        });
      }
    });
  }

  // Hire a new Worker Ant (Blue like in screenshot, or Purple/Green)
  public addWorkerAnt() {
    const colors = [0x00a6ff, 0xa855f7, 0x10b981, 0xf43f5e];
    const color = colors[this.workerAnts.length % colors.length];
    const worker = createAnt(color, false);
    
    // Spawn near the nest hole
    const spawnAngle = Math.random() * Math.PI * 2;
    worker.group.position.set(
      this.holePosition.x + Math.cos(spawnAngle) * 3,
      0,
      this.holePosition.z + Math.sin(spawnAngle) * 3
    );

    this.scene.add(worker.group);
    this.workerAnts.push(worker);
    soundManager.playUpgrade();
  }

  // Apply Prestige: Queen Ant Transformation & Golden Era
  public applyPrestige() {
    transformToGoldenQueen(this.playerAnt);
    this.sweetnessMultiplier *= 2;
    this.coins += 250;

    // Spawn Golden Sugar blocks around the nest hole
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = this.holePosition.x + Math.cos(angle) * 4.5;
      const z = this.holePosition.z + Math.sin(angle) * 4.5;
      const cubeGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
      const cubeMat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.85,
        roughness: 0.15,
        emissive: 0x553300,
      });
      const mesh = new THREE.Mesh(cubeGeo, cubeMat);
      mesh.position.set(x, 0.45, z);
      mesh.castShadow = true;
      this.scene.add(mesh);

      this.foodCubes.push({
        id: `food_prestige_gold_${Date.now()}_${i}`,
        mesh,
        color: '#ffd700',
        value: 100,
        originalPos: new THREE.Vector3(x, 0.45, z),
        isHarvested: false,
        respawnTimer: 0,
      });
    }
  }

  public setInput(x: number, y: number) {
    this.inputVector.set(x, y);
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.clock.start();
    this.animate();
  }

  public stop() {
    this.isRunning = false;
    if (this.reqId) cancelAnimationFrame(this.reqId);
  }

  private animate = () => {
    if (!this.isRunning) return;
    this.reqId = requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    this.update(delta);
    this.renderer.render(this.scene, this.camera);
  };

  private update(delta: number) {
    // 1. Update Player Movement
    const isMoving = this.inputVector.lengthSq() > 0.01;
    let velX = 0;
    let velZ = 0;

    if (isMoving) {
      const moveSpeed = this.playerAnt.speed * delta;
      velX = this.inputVector.x * moveSpeed;
      velZ = this.inputVector.y * moveSpeed;

      this.playerAnt.group.position.x += velX;
      this.playerAnt.group.position.z += velZ;

      // Rotate player towards movement direction
      const angle = Math.atan2(this.inputVector.x, this.inputVector.y);
      this.playerAnt.group.rotation.y = angle;

      soundManager.playFootstep();
    }

    // Keep player within bounds
    this.playerAnt.group.position.x = THREE.MathUtils.clamp(this.playerAnt.group.position.x, -21, 21);
    this.playerAnt.group.position.z = THREE.MathUtils.clamp(this.playerAnt.group.position.z, -21, 21);

    // Update Player Animation & Stack Wobble
    updateAntAnimation(this.playerAnt, delta, isMoving, velX / delta, velZ / delta);

    // Player invincibility flashing effect when hit by spider
    if (this.playerInvincibleTimer > 0) {
      this.playerInvincibleTimer -= delta;
      this.playerAnt.group.visible = Math.sin(this.playerInvincibleTimer * 25) > -0.2;
      if (this.playerInvincibleTimer <= 0) {
        this.playerAnt.group.visible = true;
      }
    }

    // Smooth Camera Follow adapted to portrait / landscape
    const camDistZ = this.camera.aspect < 1 ? 20 : 16;
    const targetCamX = this.playerAnt.group.position.x;
    const targetCamZ = this.playerAnt.group.position.z + camDistZ;
    this.camera.position.x += (targetCamX - this.camera.position.x) * delta * 4;
    this.camera.position.z += (targetCamZ - this.camera.position.z) * delta * 4;
    this.camera.lookAt(this.playerAnt.group.position.x, 0.8, this.playerAnt.group.position.z);

    // 2. Food Collection by Player
    if (this.playerAnt.carriedCubeMeshes.length < this.playerAnt.capacity) {
      for (const food of this.foodCubes) {
        if (food.isHarvested) continue;
        const dist = this.playerAnt.group.position.distanceTo(food.mesh.position);
        if (dist < this.magnetRadius) {
          food.isHarvested = true;
          food.respawnTimer = 4.0; // Respawns in 4s
          food.mesh.visible = false;

          addCubeToAnt(this.playerAnt, food.color, food.value);
          soundManager.playPop(this.playerAnt.carriedCubeMeshes.length);
          this.callbacks.onStackChanged(this.playerAnt.carriedCubeMeshes.length, this.playerAnt.capacity);
          break;
        }
      }
    }

    // 3. Player Delivery at Nest Hole
    const distToHole = this.playerAnt.group.position.distanceTo(this.holePosition);
    if (distToHole < 2.5 && this.playerAnt.carriedCubeMeshes.length > 0) {
      this.triggerAntDelivery(this.playerAnt, true);
    }

    // 4. Upgrade Pad Check
    if (this.upgradePadCooldown > 0) {
      this.upgradePadCooldown -= delta;
    }
    const distToUpgrade = this.playerAnt.group.position.distanceTo(this.upgradePadPosition);
    if (distToUpgrade < 2.2) {
      if (!this.isTouchingPad && this.upgradePadCooldown <= 0) {
        this.isTouchingPad = true;
        this.upgradePadCooldown = 3.0; // Cooldown to avoid re-triggering immediately
        this.callbacks.onOpenUpgradeShop();
      }
    } else {
      this.isTouchingPad = false;
    }

    // 5. Update Worker Ants (Autonomous Bots)
    this.updateWorkers(delta);

    // 6. Update Predator Spider (Floor hazard & chaser!)
    this.updateSpider(delta);

    // 7. Food Cube Respawning
    for (const food of this.foodCubes) {
      if (food.isHarvested) {
        food.respawnTimer -= delta;
        if (food.respawnTimer <= 0) {
          food.isHarvested = false;
          food.mesh.visible = true;
          food.mesh.scale.set(0.1, 0.1, 0.1);
        }
      } else if (food.mesh.scale.x < 1) {
        food.mesh.scale.addScalar(delta * 4);
        if (food.mesh.scale.x > 1) food.mesh.scale.set(1, 1, 1);
      }
    }

    // 7. Animate Nest Hole vortex & markers
    if (this.vortexParticles) {
      this.vortexParticles.rotation.y += delta * 3.5;
    }
    if (this.holeMesh) {
      const marker = this.holeMesh.children[3];
      if (marker) {
        marker.position.y = 3.0 + Math.sin(this.clock.getElapsedTime() * 4) * 0.35;
        marker.rotation.y += delta * 2;
      }
    }
    if (this.upgradePadMesh) {
      const icon = this.upgradePadMesh.children[2];
      if (icon) {
        icon.position.y = 2.8 + Math.sin(this.clock.getElapsedTime() * 3) * 0.25;
        icon.rotation.y += delta * 2.5;
      }
    }

    // 8. Update Flying Cubes (Delivery Arcs into Hole)
    for (let i = this.flyingCubes.length - 1; i >= 0; i--) {
      const fc = this.flyingCubes[i];
      fc.progress += delta * fc.speed;
      if (fc.progress >= 1) {
        fc.onComplete();
        this.scene.remove(fc.mesh);
        fc.mesh.geometry.dispose();
        this.flyingCubes.splice(i, 1);
      } else {
        // Parabolic arc interpolation
        fc.mesh.position.lerpVectors(fc.startPos, fc.targetPos, fc.progress);
        fc.mesh.position.y += Math.sin(fc.progress * Math.PI) * 2.5;
        fc.mesh.scale.setScalar(1 - fc.progress * 0.5);
        fc.mesh.rotation.x += delta * 10;
        fc.mesh.rotation.y += delta * 12;
      }
    }
  }

  // Trigger Ant dropping cubes into the Hole
  private triggerAntDelivery(ant: AntEntity, isPlayer: boolean) {
    const dropped = clearAntCubes(ant);
    if (isPlayer) {
      this.callbacks.onStackChanged(0, ant.capacity);
    }

    dropped.forEach((cubeData, idx) => {
      // Create flying cube
      const flyingGeo = new THREE.BoxGeometry(0.65, 0.65, 0.65);
      const flyingMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(cubeData.color),
        roughness: 0.2,
      });
      const flyingMesh = new THREE.Mesh(flyingGeo, flyingMat);
      flyingMesh.position.copy(ant.group.position).add(new THREE.Vector3(0, 1.2 + idx * 0.3, 0));
      this.scene.add(flyingMesh);

      const target = this.holePosition.clone().add(new THREE.Vector3(
        (Math.random() - 0.5) * 0.8,
        -1.0,
        (Math.random() - 0.5) * 0.8
      ));

      this.flyingCubes.push({
        mesh: flyingMesh,
        startPos: flyingMesh.position.clone(),
        targetPos: target,
        progress: 0,
        speed: 2.2 + idx * 0.3,
        onComplete: () => {
          soundManager.playDeposit(idx);
          const earned = Math.round(cubeData.value * this.sweetnessMultiplier);
          this.coins += earned;
          this.totalDelivered++;

          if (isPlayer) {
            this.callbacks.onScoreGained(earned, ant.group.position.x, ant.group.position.z, `+$${earned}`);
          } else {
            this.callbacks.onScoreGained(earned, this.holePosition.x, this.holePosition.z, `+$${earned} 🐜`);
          }

          // Check Level Up every 20 cubes
          if (this.totalDelivered > 0 && this.totalDelivered % 20 === 0) {
            this.level++;
            soundManager.playUpgrade();
            this.callbacks.onLevelUp(this.level);
          }
        },
      });
    });
  }

  // Update AI Worker Ants
  private updateWorkers(delta: number) {
    this.workerAnts.forEach(worker => {
      const isFull = worker.carriedCubeMeshes.length >= worker.capacity;
      let targetPos: THREE.Vector3;

      if (isFull) {
        // Go to nest hole to drop off
        targetPos = this.holePosition;
      } else {
        // Find nearest active food cube
        let nearestFood: FoodCubeItem | null = null;
        let minDist = Infinity;
        for (const food of this.foodCubes) {
          if (food.isHarvested) continue;
          const dist = worker.group.position.distanceTo(food.mesh.position);
          if (dist < minDist) {
            minDist = dist;
            nearestFood = food;
          }
        }
        targetPos = nearestFood ? nearestFood.mesh.position : this.holePosition;
      }

      // Move toward target
      const dir = targetPos.clone().sub(worker.group.position);
      dir.y = 0;
      const dist = dir.length();

      if (dist > 0.4) {
        dir.normalize();
        const moveDist = worker.speed * delta;
        worker.group.position.addScaledVector(dir, moveDist);

        const angle = Math.atan2(dir.x, dir.z);
        worker.group.rotation.y = angle;

        updateAntAnimation(worker, delta, true, dir.x * worker.speed, dir.z * worker.speed);
      } else {
        // Reached destination!
        updateAntAnimation(worker, delta, false, 0, 0);

        if (isFull) {
          // Drop into hole!
          this.triggerAntDelivery(worker, false);
        } else {
          // Harvest cube
          for (const food of this.foodCubes) {
            if (!food.isHarvested && worker.group.position.distanceTo(food.mesh.position) < 2.0) {
              food.isHarvested = true;
              food.respawnTimer = 4.0;
              food.mesh.visible = false;
              addCubeToAnt(worker, food.color, food.value);
              break;
            }
          }
        }
      }
    });
  }

  // Update Predator Spider logic (Floor patrol, player tracking & backpack attack!)
  private updateSpider(delta: number) {
    const spider = this.spider;
    if (!spider) return;

    const distToPlayer = spider.group.position.distanceTo(this.playerAnt.group.position);

    // 1. Detection & State Switch
    if (distToPlayer < 8.0) {
      if (spider.state === 'PATROL') {
        spider.state = 'CHASE';
        spider.speed = spider.chaseSpeed;
        spider.alertIcon.visible = true;
        soundManager.playSpiderAlert();
        this.callbacks.onSpiderChase?.(true);
      }
      spider.targetPos.copy(this.playerAnt.group.position);
    } else if (distToPlayer > 13.0 && spider.state === 'CHASE') {
      spider.state = 'PATROL';
      spider.speed = spider.patrolSpeed;
      spider.alertIcon.visible = false;
      this.callbacks.onSpiderChase?.(false);
      spider.targetPos.copy(spider.patrolPoints[spider.currentPatrolIdx]);
    } else if (spider.state === 'PATROL') {
      // Check if reached current waypoint
      const distToWp = spider.group.position.distanceTo(spider.targetPos);
      if (distToWp < 1.4) {
        spider.currentPatrolIdx = (spider.currentPatrolIdx + 1) % spider.patrolPoints.length;
        spider.targetPos.copy(spider.patrolPoints[spider.currentPatrolIdx]);
      }
    }

    // 2. Move Spider towards target
    const dir = spider.targetPos.clone().sub(spider.group.position);
    dir.y = 0;
    const len = dir.length();
    let isMoving = false;

    if (len > 0.3) {
      isMoving = true;
      dir.normalize();
      const moveAmount = spider.speed * delta;
      spider.group.position.addScaledVector(dir, moveAmount);

      const targetAngle = Math.atan2(dir.x, dir.z);
      // Smooth turning towards direction
      let diff = targetAngle - spider.group.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      spider.group.rotation.y += diff * delta * 7;
    }

    // Keep spider within arena
    spider.group.position.x = THREE.MathUtils.clamp(spider.group.position.x, -20, 20);
    spider.group.position.z = THREE.MathUtils.clamp(spider.group.position.z, -20, 20);

    // Update Spider Crawl Animation
    updateSpiderAnimation(spider, delta, isMoving);

    // 3. Collision with Player Ant!
    if (distToPlayer < 1.4 && this.playerInvincibleTimer <= 0) {
      this.handleSpiderCatchPlayer();
    }
  }

  // Spider strikes! Collapse backpack and scatter cubes
  private handleSpiderCatchPlayer() {
    this.playerInvincibleTimer = 3.0; // 3 seconds grace period

    const dropped = clearAntCubes(this.playerAnt);
    this.callbacks.onStackChanged(0, this.playerAnt.capacity);

    soundManager.playBackpackCrash();

    // Haptic buzz on mobile
    if ('vibrate' in navigator) {
      try { navigator.vibrate([100, 60, 150]); } catch {}
    }

    if (dropped.length > 0) {
      // Scatter dropped cubes in physics explosion around the ant
      dropped.forEach((cubeData, idx) => {
        const scatterAngle = (idx / dropped.length) * Math.PI * 2 + (Math.random() - 0.5);
        const dist = 2.0 + Math.random() * 3.5;
        const x = this.playerAnt.group.position.x + Math.cos(scatterAngle) * dist;
        const z = this.playerAnt.group.position.z + Math.sin(scatterAngle) * dist;

        const cubeGeo = new THREE.BoxGeometry(0.7, 0.7, 0.7);
        const cubeMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(cubeData.color),
          roughness: 0.25,
        });
        const mesh = new THREE.Mesh(cubeGeo, cubeMat);
        mesh.position.set(x, 0.35, z);
        mesh.castShadow = true;
        this.scene.add(mesh);

        this.foodCubes.push({
          id: `food_scatter_${Date.now()}_${idx}`,
          mesh,
          color: cubeData.color,
          value: cubeData.value,
          originalPos: new THREE.Vector3(x, 0.35, z),
          isHarvested: false,
          respawnTimer: 0,
        });
      });

      this.callbacks.onScoreGained(0, this.playerAnt.group.position.x, this.playerAnt.group.position.z, '💥 ¡LA ARAÑA TE DESMORONÓ LA MOCHILA!');
    } else {
      this.callbacks.onScoreGained(0, this.playerAnt.group.position.x, this.playerAnt.group.position.z, '😱 ¡CUIDADO CON LA ARAÑA!');
    }
  }

  public onWindowResize = () => {
    if (!this.container || !this.renderer) return;
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    const aspect = w / h;
    this.camera.aspect = aspect;
    this.camera.fov = aspect < 1 ? 52 : 45;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  };

  public destroy() {
    this.stop();
    window.removeEventListener('resize', this.onWindowResize);
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
