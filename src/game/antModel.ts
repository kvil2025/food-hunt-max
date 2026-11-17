import * as THREE from 'three';

export interface AntEntity {
  group: THREE.Group;
  head: THREE.Mesh;
  antennaL: THREE.Group;
  antennaR: THREE.Group;
  abdomen: THREE.Mesh;
  legs: THREE.Group[];
  backpack: THREE.Group;
  carriedCubeMeshes: THREE.Mesh[];
  carriedData: Array<{ color: string; value: number }>;
  wobbleX: number;
  wobbleZ: number;
  walkCycle: number;
  baseColor: number;
  isPlayer: boolean;
  speed: number;
  capacity: number;
}

export function createAnt(colorHex: number = 0xffcc00, isPlayer: boolean = false): AntEntity {
  const group = new THREE.Group();

  // Materials
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: colorHex,
    roughness: 0.35,
    metalness: 0.1,
  });

  const eyeWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.1,
    metalness: 0.05,
  });

  const eyePupilMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.05,
    metalness: 0.2,
  });

  const eyeHighlightMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
  });

  // 1. Thorax (Center body)
  const thoraxGeo = new THREE.SphereGeometry(0.42, 16, 16);
  thoraxGeo.scale(1, 0.9, 1.2);
  const thorax = new THREE.Mesh(thoraxGeo, bodyMaterial);
  thorax.position.set(0, 0.55, 0);
  thorax.castShadow = true;
  group.add(thorax);

  // 2. Abdomen (Back bulb)
  const abdomenGeo = new THREE.SphereGeometry(0.55, 16, 16);
  abdomenGeo.scale(1, 0.9, 1.35);
  const abdomen = new THREE.Mesh(abdomenGeo, bodyMaterial);
  abdomen.position.set(0, 0.65, -0.75);
  abdomen.rotation.x = -0.2;
  abdomen.castShadow = true;
  group.add(abdomen);

  // 3. Head
  const headGeo = new THREE.SphereGeometry(0.52, 18, 18);
  const head = new THREE.Mesh(headGeo, bodyMaterial);
  head.position.set(0, 0.85, 0.65);
  head.castShadow = true;
  group.add(head);

  // 4. Eyes (Big cute cartoon eyes with specular dots)
  const eyeGroup = new THREE.Group();
  const createEye = (isRight: boolean) => {
    const singleEye = new THREE.Group();
    const eyeBall = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), eyeWhiteMat);
    eyeBall.scale.set(0.9, 1.1, 0.8);
    singleEye.add(eyeBall);

    // Pupil
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 14), eyePupilMat);
    pupil.position.set(0, 0, 0.12);
    pupil.scale.set(1, 1.1, 0.5);
    singleEye.add(pupil);

    // Specular highlight dot (sparkly anime/cute game eye)
    const highlight = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), eyeHighlightMat);
    highlight.position.set(0.04, 0.05, 0.17);
    singleEye.add(highlight);

    const xOffset = isRight ? 0.22 : -0.22;
    singleEye.position.set(xOffset, 0.1, 0.38);
    singleEye.rotation.y = isRight ? 0.25 : -0.25;
    return singleEye;
  };

  const leftEye = createEye(false);
  const rightEye = createEye(true);
  eyeGroup.add(leftEye);
  eyeGroup.add(rightEye);
  head.add(eyeGroup);

  // 5. Antennae
  const createAntenna = (isRight: boolean) => {
    const antGroup = new THREE.Group();
    // Stalk curve
    const stalkGeo = new THREE.CylinderGeometry(0.035, 0.04, 0.38, 8);
    const stalk = new THREE.Mesh(stalkGeo, bodyMaterial);
    stalk.position.set(0, 0.19, 0);
    stalk.rotation.x = -0.2;
    antGroup.add(stalk);

    // Tip sphere
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 10), bodyMaterial);
    tip.position.set(0, 0.38, -0.06);
    antGroup.add(tip);

    const xOffset = isRight ? 0.16 : -0.16;
    antGroup.position.set(xOffset, 0.45, 0.05);
    antGroup.rotation.z = isRight ? -0.35 : 0.35;
    antGroup.rotation.x = 0.2;
    return antGroup;
  };

  const antennaL = createAntenna(false);
  const antennaR = createAntenna(true);
  head.add(antennaL);
  head.add(antennaR);

  // 6. Cute Legs (6 legs total: 3 per side)
  const legs: THREE.Group[] = [];
  const legPositions = [
    { x: -0.38, z: 0.25, rotY: 0.4 },
    { x: -0.42, z: 0.0,  rotY: 0.0 },
    { x: -0.38, z: -0.35, rotY: -0.4 },
    { x: 0.38,  z: 0.25, rotY: -0.4 },
    { x: 0.42,  z: 0.0,  rotY: 0.0 },
    { x: 0.38,  z: -0.35, rotY: 0.4 },
  ];

  legPositions.forEach((pos, idx) => {
    const legGroup = new THREE.Group();
    legGroup.position.set(pos.x, 0.4, pos.z);

    const legUpper = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.04, 0.32, 8),
      bodyMaterial
    );
    legUpper.position.set(0, -0.15, 0);
    legUpper.rotation.z = pos.x > 0 ? -0.5 : 0.5;
    legGroup.add(legUpper);

    const foot = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 8, 8),
      bodyMaterial
    );
    foot.position.set(pos.x > 0 ? 0.12 : -0.12, -0.3, 0);
    legGroup.add(foot);

    group.add(legGroup);
    legs.push(legGroup);
  });

  // 7. Backpack anchor for carrying food cubes!
  const backpack = new THREE.Group();
  backpack.position.set(0, 0.95, -0.2); // Sits comfortably above thorax/abdomen
  group.add(backpack);

  return {
    group,
    head,
    antennaL,
    antennaR,
    abdomen,
    legs,
    backpack,
    carriedCubeMeshes: [],
    carriedData: [],
    wobbleX: 0,
    wobbleZ: 0,
    walkCycle: 0,
    baseColor: colorHex,
    isPlayer,
    speed: isPlayer ? 7.2 : 5.0,
    capacity: isPlayer ? 4 : 3,
  };
}

// Add a cube to the ant's back
export function addCubeToAnt(ant: AntEntity, color: string, value: number) {
  const index = ant.carriedCubeMeshes.length;
  const cubeGeo = new THREE.BoxGeometry(0.65, 0.65, 0.65);
  
  // Create rounded/smooth looking cube material
  const cubeMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: 0.2,
    metalness: 0.15,
  });

  const cubeMesh = new THREE.Mesh(cubeGeo, cubeMat);
  cubeMesh.castShadow = true;
  cubeMesh.receiveShadow = true;

  // Stacking vertically with slight charming offset
  cubeMesh.position.set(
    (Math.random() - 0.5) * 0.04,
    index * 0.7 + 0.35,
    (Math.random() - 0.5) * 0.04
  );

  // Tiny pop-in scale animation initial state
  cubeMesh.scale.set(0.1, 0.1, 0.1);

  ant.backpack.add(cubeMesh);
  ant.carriedCubeMeshes.push(cubeMesh);
  ant.carriedData.push({ color, value });
}

// Clear all cubes from ant's back
export function clearAntCubes(ant: AntEntity): Array<{ color: string; value: number }> {
  const removed = [...ant.carriedData];
  ant.carriedCubeMeshes.forEach(mesh => {
    ant.backpack.remove(mesh);
    mesh.geometry.dispose();
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach(m => m.dispose());
    } else {
      mesh.material.dispose();
    }
  });
  ant.carriedCubeMeshes = [];
  ant.carriedData = [];
  return removed;
}

// Animate the ant, legs, and stack wobble
export function updateAntAnimation(
  ant: AntEntity,
  delta: number,
  isMoving: boolean,
  velX: number,
  velZ: number
) {
  if (isMoving) {
    ant.walkCycle += delta * 18;

    // Scuttle legs in alternating tripod gait
    ant.legs.forEach((leg, i) => {
      const phase = (i % 2 === 0 ? 1 : -1) * (i >= 3 ? -1 : 1);
      leg.rotation.x = Math.sin(ant.walkCycle + (i * Math.PI) / 3) * 0.45;
      leg.position.y = 0.4 + Math.max(0, Math.sin(ant.walkCycle * 2 + i) * 0.08);
    });

    // Body bobbing
    ant.abdomen.rotation.x = -0.2 + Math.sin(ant.walkCycle * 1.5) * 0.12;
    ant.head.position.y = 0.85 + Math.sin(ant.walkCycle * 2) * 0.04;
    ant.antennaL.rotation.x = 0.2 + Math.sin(ant.walkCycle * 3) * 0.15;
    ant.antennaR.rotation.x = 0.2 + Math.cos(ant.walkCycle * 3) * 0.15;
  } else {
    // Idle breathing & gentle antenna sway
    ant.walkCycle += delta * 3;
    ant.legs.forEach(leg => {
      leg.rotation.x *= 0.85;
      leg.position.y = 0.4;
    });
    ant.abdomen.rotation.x = -0.2 + Math.sin(ant.walkCycle) * 0.04;
    ant.head.position.y = 0.85 + Math.sin(ant.walkCycle * 1.2) * 0.02;
    ant.antennaL.rotation.x = 0.2 + Math.sin(ant.walkCycle * 2) * 0.06;
    ant.antennaR.rotation.x = 0.2 + Math.cos(ant.walkCycle * 2) * 0.06;
  }

  // Animate pop-in of new cubes
  ant.carriedCubeMeshes.forEach(mesh => {
    if (mesh.scale.x < 1) {
      mesh.scale.addScalar(delta * 6);
      if (mesh.scale.x > 1) mesh.scale.set(1, 1, 1);
    }
  });

  // Dynamic Stack Wobble Physics!
  // Higher stacks sway more dramatically based on velocity changes
  const stackHeight = ant.carriedCubeMeshes.length;
  const targetWobbleX = -velZ * 0.035 * Math.min(stackHeight, 8);
  const targetWobbleZ = velX * 0.035 * Math.min(stackHeight, 8);

  ant.wobbleX += (targetWobbleX - ant.wobbleX) * delta * 8;
  ant.wobbleZ += (targetWobbleZ - ant.wobbleZ) * delta * 8;

  ant.backpack.rotation.x = ant.wobbleX + (isMoving ? Math.sin(ant.walkCycle * 2) * 0.04 : 0);
  ant.backpack.rotation.z = ant.wobbleZ;

  // Stacking cascade wobble for each individual cube in the tower
  ant.carriedCubeMeshes.forEach((mesh, idx) => {
    const factor = (idx + 1) * 0.03;
    mesh.rotation.z = ant.wobbleZ * factor;
    mesh.rotation.x = ant.wobbleX * factor;
  });
}

// Transform Ant into Golden Queen / King with 3D Crown
export function transformToGoldenQueen(ant: AntEntity) {
  const goldMaterial = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    metalness: 0.85,
    roughness: 0.2,
    emissive: 0x443300,
  });

  // Re-color head & abdomen
  ant.head.material = goldMaterial;
  ant.abdomen.material = goldMaterial;
  ant.group.children.forEach(child => {
    if (child instanceof THREE.Mesh && child !== ant.head && child !== ant.abdomen) {
      child.material = goldMaterial;
    }
  });

  // Add 3D Golden Crown on Head if not already present
  if (!ant.head.getObjectByName('golden_crown')) {
    const crownGroup = new THREE.Group();
    crownGroup.name = 'golden_crown';
    crownGroup.position.set(0, 0.52, 0.1);

    // Crown Ring Base
    const ringGeo = new THREE.CylinderGeometry(0.24, 0.22, 0.1, 16);
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.15,
      emissive: 0x886600,
    });
    const ring = new THREE.Mesh(ringGeo, crownMat);
    crownGroup.add(ring);

    // 5 Pointy Crown Spikes
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const spikeGeo = new THREE.ConeGeometry(0.06, 0.18, 6);
      const spike = new THREE.Mesh(spikeGeo, crownMat);
      spike.position.set(Math.cos(angle) * 0.2, 0.12, Math.sin(angle) * 0.2);
      crownGroup.add(spike);

      // Ruby / Emerald Jewels on spikes
      const gemGeo = new THREE.SphereGeometry(0.035, 6, 6);
      const gemMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0xff0044 : 0x00e5ff,
        emissive: i % 2 === 0 ? 0x660011 : 0x004466,
        roughness: 0.1,
      });
      const gem = new THREE.Mesh(gemGeo, gemMat);
      gem.position.set(Math.cos(angle) * 0.22, 0.05, Math.sin(angle) * 0.22);
      crownGroup.add(gem);
    }

    ant.head.add(crownGroup);
  }
}
