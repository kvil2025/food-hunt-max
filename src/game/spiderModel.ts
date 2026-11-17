import * as THREE from 'three';

export interface SpiderEntity {
  group: THREE.Group;
  head: THREE.Mesh;
  abdomen: THREE.Mesh;
  legs: THREE.Group[];
  eyes: THREE.Mesh[];
  alertIcon: THREE.Group;
  walkCycle: number;
  state: 'PATROL' | 'CHASE';
  targetPos: THREE.Vector3;
  patrolPoints: THREE.Vector3[];
  currentPatrolIdx: number;
  speed: number;
  patrolSpeed: number;
  chaseSpeed: number;
  alertTimer: number;
}

export function createSpider(): SpiderEntity {
  const group = new THREE.Group();

  // Materials
  const spiderBodyMat = new THREE.MeshStandardMaterial({
    color: 0x181324, // Very dark purple/black
    roughness: 0.4,
    metalness: 0.2,
  });

  const spiderRedMat = new THREE.MeshStandardMaterial({
    color: 0xff1744, // Glowing evil red
    emissive: 0xd50000,
    roughness: 0.1,
  });

  // 1. Cephalothorax (Front body/head)
  const headGeo = new THREE.SphereGeometry(0.5, 14, 14);
  headGeo.scale(1.1, 0.7, 1);
  const head = new THREE.Mesh(headGeo, spiderBodyMat);
  head.position.set(0, 0.45, 0.3);
  head.castShadow = true;
  group.add(head);

  // 2. Abdomen (Back bulb with menacing stripes)
  const abdomenGeo = new THREE.SphereGeometry(0.85, 16, 16);
  abdomenGeo.scale(1.1, 0.9, 1.4);
  const abdomen = new THREE.Mesh(abdomenGeo, spiderBodyMat);
  abdomen.position.set(0, 0.65, -0.9);
  abdomen.rotation.x = -0.15;
  abdomen.castShadow = true;
  group.add(abdomen);

  // Red hourglass / spider mark on back
  const markGeo = new THREE.ConeGeometry(0.25, 0.4, 4);
  const mark = new THREE.Mesh(markGeo, spiderRedMat);
  mark.position.set(0, 0.65, 0);
  mark.rotation.x = Math.PI / 2;
  abdomen.add(mark);

  // 3. Glowing Red Eyes (6 eyes in 2 rows)
  const eyes: THREE.Mesh[] = [];
  const eyeCoords = [
    { x: -0.18, y: 0.12, z: 0.45, r: 0.08 },
    { x: 0.18,  y: 0.12, z: 0.45, r: 0.08 },
    { x: -0.32, y: 0.08, z: 0.38, r: 0.06 },
    { x: 0.32,  y: 0.08, z: 0.38, r: 0.06 },
    { x: -0.12, y: 0.24, z: 0.42, r: 0.05 },
    { x: 0.12,  y: 0.24, z: 0.42, r: 0.05 },
  ];

  eyeCoords.forEach(c => {
    const eyeGeo = new THREE.SphereGeometry(c.r, 8, 8);
    const eye = new THREE.Mesh(eyeGeo, spiderRedMat);
    eye.position.set(c.x, c.y, c.z);
    head.add(eye);
    eyes.push(eye);
  });

  // 4. Mandibles / Fangs
  const fangMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.6,
    roughness: 0.2,
  });
  [-0.15, 0.15].forEach(x => {
    const fang = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.25, 6), fangMat);
    fang.position.set(x, -0.2, 0.48);
    fang.rotation.x = Math.PI * 0.8;
    fang.rotation.z = x > 0 ? -0.2 : 0.2;
    head.add(fang);
  });

  // 5. Eight Long Articulated Legs (4 per side)
  const legs: THREE.Group[] = [];
  const legAngles = [-0.6, -0.2, 0.2, 0.6]; // Front to back

  [-1, 1].forEach(side => {
    legAngles.forEach((angle, idx) => {
      const legRoot = new THREE.Group();
      legRoot.position.set(side * 0.4, 0.45, angle * 0.8);

      // Upper joint (goes up & out)
      const upperGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.7, 8);
      const upper = new THREE.Mesh(upperGeo, spiderBodyMat);
      upper.position.set(side * 0.35, 0.25, 0);
      upper.rotation.z = side * -0.9;
      upper.rotation.y = angle * 0.4;
      legRoot.add(upper);

      // Lower joint (points sharply down to the floor)
      const lowerGeo = new THREE.CylinderGeometry(0.035, 0.02, 0.9, 8);
      const lower = new THREE.Mesh(lowerGeo, spiderBodyMat);
      lower.position.set(side * 0.65, -0.3, 0);
      lower.rotation.z = side * 0.6;
      upper.add(lower);

      group.add(legRoot);
      legs.push(legRoot);
    });
  });

  // 6. Alert Exclamation Mark `!` above head (hidden when idling)
  const alertIcon = new THREE.Group();
  alertIcon.position.set(0, 2.2, 0);
  alertIcon.visible = false;

  const exclaimBar = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.06, 0.5, 8), spiderRedMat);
  alertIcon.add(exclaimBar);
  const exclaimDot = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), spiderRedMat);
  exclaimDot.position.y = -0.4;
  alertIcon.add(exclaimDot);
  group.add(alertIcon);

  // Waypoints for roaming the floor
  const patrolPoints = [
    new THREE.Vector3(5, 0, 8),
    new THREE.Vector3(12, 0, 0),
    new THREE.Vector3(5, 0, -8),
    new THREE.Vector3(-1, 0, -7),
    new THREE.Vector3(0, 0, 5),
  ];

  return {
    group,
    head,
    abdomen,
    legs,
    eyes,
    alertIcon,
    walkCycle: 0,
    state: 'PATROL',
    targetPos: patrolPoints[0].clone(),
    patrolPoints,
    currentPatrolIdx: 0,
    speed: 3.8,
    patrolSpeed: 3.6,
    chaseSpeed: 6.2,
    alertTimer: 0,
  };
}

export function updateSpiderAnimation(spider: SpiderEntity, delta: number, isMoving: boolean) {
  if (isMoving) {
    const cycleSpeed = spider.state === 'CHASE' ? 22 : 14;
    spider.walkCycle += delta * cycleSpeed;

    // Crawling arachnid ripple gait
    spider.legs.forEach((leg, idx) => {
      const phase = (idx % 2 === 0 ? 1 : -1) * (idx >= 4 ? -1 : 1);
      leg.rotation.y = Math.sin(spider.walkCycle + idx * 0.8) * 0.35 * phase;
      leg.position.y = 0.45 + Math.max(0, Math.sin(spider.walkCycle * 2 + idx) * 0.12);
    });

    // Menacing body bobbing & menacing abdomen pulsing
    spider.head.position.y = 0.45 + Math.sin(spider.walkCycle * 2) * 0.04;
    spider.abdomen.rotation.x = -0.15 + Math.sin(spider.walkCycle * 1.5) * 0.1;
  }

  // Animate Alert `!` icon floating and pulsing when chasing
  if (spider.alertIcon.visible) {
    spider.alertIcon.position.y = 2.0 + Math.sin(Date.now() * 0.008) * 0.2;
    spider.alertIcon.rotation.y += delta * 4;
  }
}
