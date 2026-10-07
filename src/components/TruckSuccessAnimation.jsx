import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Navigation, MapPin, Compass, RotateCcw } from 'lucide-react';

export default function TruckSuccessAnimation({ 
  fromCity = '', 
  toCity = '', 
  lrNo = '', 
  vehicleNo = '' 
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [isInteractingState, setIsInteractingState] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x09090b);
    scene.fog = new THREE.FogExp2(0x09090b, 0.038);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      80
    );

    // Initial cinematic starting position: dramatic low front 3/4 angle
    const frontPos = new THREE.Vector3(1.2, 1.35, 6.0);
    const frontTarget = new THREE.Vector3(0, 1.15, 1.6);

    // Canonical sideview profile: pure side profile of the container truck
    const sidePos = new THREE.Vector3(6.8, 1.95, 0.0);
    const sideTarget = new THREE.Vector3(0, 1.35, 0.0);

    camera.position.copy(frontPos);
    camera.lookAt(frontTarget);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0x334155, 1.2);
    scene.add(ambientLight);

    // Main moonlight / overhead highway light
    const dirLight = new THREE.DirectionalLight(0xe2e8f0, 2.2);
    dirLight.position.set(7, 12, 6);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // Subtle cyan rim light from opposite side
    const rimLight = new THREE.DirectionalLight(0x0284c7, 0.9);
    rimLight.position.set(-8, 5, -5);
    scene.add(rimLight);

    // 5. Build Detailed Procedural 3D Truck
    const truckGroup = new THREE.Group();
    scene.add(truckGroup);

    // Materials
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      metalness: 0.85,
      roughness: 0.35
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe4e4e7,
      metalness: 0.92,
      roughness: 0.15
    });

    const cabPaintMat = new THREE.MeshStandardMaterial({
      color: 0x047857, // Deep rich fleet emerald
      metalness: 0.55,
      roughness: 0.28
    });

    const containerMat = new THREE.MeshStandardMaterial({
      color: 0x065f46, // Container fleet green
      metalness: 0.45,
      roughness: 0.4
    });

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.95,
      roughness: 0.08,
      transparent: true,
      opacity: 0.85
    });

    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.92,
      metalness: 0.1
    });

    const wheelRimMat = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8,
      metalness: 0.85,
      roughness: 0.2
    });

    const headlightMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfef08a,
      emissiveIntensity: 2.5
    });

    const taillightMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: 2.0
    });

    // 5a. Chassis Beams
    const leftBeam = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, 6.2), chassisMat);
    leftBeam.position.set(-0.45, 0.65, 0);
    leftBeam.castShadow = true;
    truckGroup.add(leftBeam);

    const rightBeam = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, 6.2), chassisMat);
    rightBeam.position.set(0.45, 0.65, 0);
    rightBeam.castShadow = true;
    truckGroup.add(rightBeam);

    // Cross members
    for (let z = -2.6; z <= 2.6; z += 1.0) {
      const cross = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.12, 0.1), chassisMat);
      cross.position.set(0, 0.65, z);
      truckGroup.add(cross);
    }

    // Fuel tanks (cylindrical, left and right)
    const tankGeo = new THREE.CylinderGeometry(0.24, 0.24, 1.4, 16);
    tankGeo.rotateX(Math.PI / 2);
    const leftTank = new THREE.Mesh(tankGeo, chromeMat);
    leftTank.position.set(-0.75, 0.55, 0.2);
    leftTank.castShadow = true;
    truckGroup.add(leftTank);

    const rightTank = new THREE.Mesh(tankGeo, chromeMat);
    rightTank.position.set(0.75, 0.55, 0.2);
    rightTank.castShadow = true;
    truckGroup.add(rightTank);

    // Battery / Tool box
    const toolBox = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.7), chassisMat);
    toolBox.position.set(-0.72, 0.55, -1.1);
    truckGroup.add(toolBox);

    // Rear bumper bar
    const rearBumper = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.12, 0.1), chromeMat);
    rearBumper.position.set(0, 0.45, -3.1);
    truckGroup.add(rearBumper);

    // 5b. Cabin Tractor Body
    const cabinGroup = new THREE.Group();
    cabinGroup.position.set(0, 0.75, 1.95);
    truckGroup.add(cabinGroup);

    // Main cab lower block
    const cabLower = new THREE.Mesh(new THREE.BoxGeometry(1.85, 1.0, 1.6), cabPaintMat);
    cabLower.position.set(0, 0.5, 0);
    cabLower.castShadow = true;
    cabinGroup.add(cabLower);

    // Cab upper block with angled roof
    const cabUpper = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.8, 1.45), cabPaintMat);
    cabUpper.position.set(0, 1.35, -0.05);
    cabUpper.castShadow = true;
    cabinGroup.add(cabUpper);

    // Wind deflector / roof aerodynamic spoiler
    const spoiler = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.3, 0.9), cabPaintMat);
    spoiler.position.set(0, 1.85, -0.25);
    spoiler.rotation.x = -0.15;
    cabinGroup.add(spoiler);

    // Front Windshield
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.62, 0.06), glassMat);
    windshield.position.set(0, 1.35, 0.7);
    windshield.rotation.x = -0.12;
    cabinGroup.add(windshield);

    // Side windows
    const leftWin = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.48, 0.75), glassMat);
    leftWin.position.set(-0.92, 1.35, 0.05);
    cabinGroup.add(leftWin);

    const rightWin = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.48, 0.75), glassMat);
    rightWin.position.set(0.92, 1.35, 0.05);
    cabinGroup.add(rightWin);

    // Front Grille
    const grille = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.55, 0.06), chromeMat);
    grille.position.set(0, 0.45, 0.81);
    cabinGroup.add(grille);

    // Grille slats
    for (let y = 0.28; y <= 0.62; y += 0.1) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.03, 0.08), chassisMat);
      slat.position.set(0, y, 0.82);
      cabinGroup.add(slat);
    }

    // Front bumper
    const bumper = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.28, 0.25), chassisMat);
    bumper.position.set(0, 0.12, 0.8);
    bumper.castShadow = true;
    cabinGroup.add(bumper);

    // Headlights
    const leftHeadlight = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.14, 0.08), headlightMat);
    leftHeadlight.position.set(-0.68, 0.15, 0.93);
    cabinGroup.add(leftHeadlight);

    const rightHeadlight = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.14, 0.08), headlightMat);
    rightHeadlight.position.set(0.68, 0.15, 0.93);
    cabinGroup.add(rightHeadlight);

    // Spotlights shining forward from headlights
    const spotL = new THREE.SpotLight(0xfef08a, 4.0, 18, Math.PI / 5, 0.4, 1.2);
    spotL.position.set(-0.68, 0.9, 2.9);
    spotL.target.position.set(-0.68, 0, 10);
    scene.add(spotL);
    scene.add(spotL.target);

    const spotR = new THREE.SpotLight(0xfef08a, 4.0, 18, Math.PI / 5, 0.4, 1.2);
    spotR.position.set(0.68, 0.9, 2.9);
    spotR.target.position.set(0.68, 0, 10);
    scene.add(spotR);
    scene.add(spotR.target);

    // Side mirrors
    const mirrorStemGeo = new THREE.BoxGeometry(0.04, 0.04, 0.25);
    const mirrorGlassGeo = new THREE.BoxGeometry(0.08, 0.32, 0.15);

    const leftStem = new THREE.Mesh(mirrorStemGeo, chassisMat);
    leftStem.position.set(-1.02, 1.35, 0.55);
    cabinGroup.add(leftStem);
    const leftMirror = new THREE.Mesh(mirrorGlassGeo, chromeMat);
    leftMirror.position.set(-1.14, 1.35, 0.65);
    cabinGroup.add(leftMirror);

    const rightStem = new THREE.Mesh(mirrorStemGeo, chassisMat);
    rightStem.position.set(1.02, 1.35, 0.55);
    cabinGroup.add(rightStem);
    const rightMirror = new THREE.Mesh(mirrorGlassGeo, chromeMat);
    rightMirror.position.set(1.14, 1.35, 0.65);
    cabinGroup.add(rightMirror);

    // Chrome vertical exhaust stack behind cabin
    const exhaustGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.8, 12);
    const exhaust = new THREE.Mesh(exhaustGeo, chromeMat);
    exhaust.position.set(-0.7, 1.5, -0.85);
    cabinGroup.add(exhaust);

    // 5c. Cargo Container Trailer Body
    const containerGroup = new THREE.Group();
    containerGroup.position.set(0, 1.8, -1.05);
    truckGroup.add(containerGroup);

    // Main container body box
    const containerMain = new THREE.Mesh(new THREE.BoxGeometry(1.95, 2.05, 4.3), containerMat);
    containerMain.castShadow = true;
    containerGroup.add(containerMain);

    // Container corrugation vertical ribs along both sides
    for (let z = -1.95; z <= 1.95; z += 0.3) {
      const ribL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.95, 0.08), chassisMat);
      ribL.position.set(-0.99, 0, z);
      containerGroup.add(ribL);

      const ribR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.95, 0.08), chassisMat);
      ribR.position.set(0.99, 0, z);
      containerGroup.add(ribR);
    }

    // Rear container door lock bars
    const lockBarL = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.8, 8), chromeMat);
    lockBarL.position.set(-0.35, 0, -2.17);
    containerGroup.add(lockBarL);

    const lockBarR = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.8, 8), chromeMat);
    lockBarR.position.set(0.35, 0, -2.17);
    containerGroup.add(lockBarR);

    // Rear Tail lights
    const tailL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.05), taillightMat);
    tailL.position.set(-0.68, -0.9, -2.17);
    containerGroup.add(tailL);

    const tailR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.05), taillightMat);
    tailR.position.set(0.68, -0.9, -2.17);
    containerGroup.add(tailR);

    // 5d. Rotating Wheels & Axles
    const wheels = [];
    const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.28, 20);
    wheelGeo.rotateZ(Math.PI / 2);

    const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.29, 16);
    rimGeo.rotateZ(Math.PI / 2);

    const capGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.31, 10);
    capGeo.rotateZ(Math.PI / 2);

    function createWheel(x, y, z) {
      const wGroup = new THREE.Group();
      wGroup.position.set(x, y, z);

      const tire = new THREE.Mesh(wheelGeo, tireMat);
      tire.castShadow = true;
      wGroup.add(tire);

      const rim = new THREE.Mesh(rimGeo, wheelRimMat);
      wGroup.add(rim);

      const cap = new THREE.Mesh(capGeo, chromeMat);
      wGroup.add(cap);

      truckGroup.add(wGroup);
      wheels.push(wGroup);
    }

    // Front Steer Axle (single wheels)
    createWheel(-0.95, 0.42, 2.15);
    createWheel(0.95, 0.42, 2.15);

    // Drive Axle 1 (dual wheels)
    createWheel(-0.95, 0.42, 0.35);
    createWheel(0.95, 0.42, 0.35);

    // Drive Axle 2
    createWheel(-0.95, 0.42, -0.65);
    createWheel(0.95, 0.42, -0.65);

    // Trailer Rear Axles
    createWheel(-0.95, 0.42, -2.1);
    createWheel(0.95, 0.42, -2.1);
    createWheel(-0.95, 0.42, -2.85);
    createWheel(0.95, 0.42, -2.85);

    // 6. Realistic Moving Highway Road
    const roadGroup = new THREE.Group();
    scene.add(roadGroup);

    // Main asphalt highway plane
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.95,
      metalness: 0.05
    });
    const roadPlane = new THREE.Mesh(new THREE.PlaneGeometry(16, 70), roadMat);
    roadPlane.rotation.x = -Math.PI / 2;
    roadPlane.position.y = 0;
    roadPlane.receiveShadow = true;
    roadGroup.add(roadPlane);

    // White shoulder lines on road borders
    const shoulderMat = new THREE.MeshBasicMaterial({ color: 0xe4e4e7 });
    const shoulderL = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 70), shoulderMat);
    shoulderL.rotation.x = -Math.PI / 2;
    shoulderL.position.set(-2.8, 0.005, 0);
    roadGroup.add(shoulderL);

    const shoulderR = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 70), shoulderMat);
    shoulderR.rotation.x = -Math.PI / 2;
    shoulderR.position.set(2.8, 0.005, 0);
    roadGroup.add(shoulderR);

    // Yellow moving dashed divider stripes
    const dashMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const dashGeo = new THREE.PlaneGeometry(0.18, 2.8);
    dashGeo.rotateX(-Math.PI / 2);

    const roadDashes = [];
    for (let z = -32; z <= 32; z += 5.5) {
      const dash = new THREE.Mesh(dashGeo, dashMat);
      dash.position.set(0, 0.006, z);
      roadGroup.add(dash);
      roadDashes.push(dash);
    }

    // 7. Wind / Speed Lines Moving Past
    const windStreaks = [];
    const windMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35
    });
    const windGeo = new THREE.CylinderGeometry(0.012, 0.012, 2.2, 4);
    windGeo.rotateX(Math.PI / 2);

    for (let i = 0; i < 28; i++) {
      const streak = new THREE.Mesh(windGeo, windMat);
      streak.position.set(
        (Math.random() - 0.5) * 6.5,
        0.4 + Math.random() * 2.8,
        (Math.random() - 0.5) * 24
      );
      streak.speed = 22 + Math.random() * 16;
      scene.add(streak);
      windStreaks.push(streak);
    }

    // 8. Animation & Camera Choreography State
    let startTime = performance.now();
    let isInteracting = false;
    let yaw = 0;
    let pitch = 0.22;
    let distance = 6.8;

    // Sideview target spherical coordinates
    const targetYaw = 0;
    const targetPitch = 0.20;
    const targetDistance = 6.8;

    // 9. Interactive Touch / Mouse Orbit Controls
    let isPointerDown = false;
    let prevPointerX = 0;
    let prevPointerY = 0;
    let pinchStartDist = 0;
    let isPinching = false;

    const onPointerDown = (e) => {
      isPointerDown = true;
      isInteracting = true;
      setIsInteractingState(true);
      setHasInteracted(true);
      prevPointerX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      prevPointerY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    };

    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        isPinching = true;
        isInteracting = true;
        setIsInteractingState(true);
        setHasInteracted(true);
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchStartDist = Math.hypot(dx, dy);
      } else if (e.touches.length === 1) {
        onPointerDown(e.touches[0]);
      }
    };

    const onPointerMove = (e) => {
      if (!isPointerDown) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

      const deltaX = clientX - prevPointerX;
      const deltaY = clientY - prevPointerY;
      prevPointerX = clientX;
      prevPointerY = clientY;

      yaw += deltaX * 0.009;
      pitch = Math.max(-0.25, Math.min(1.1, pitch + deltaY * 0.007));
    };

    const onTouchMove = (e) => {
      if (isPinching && e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDist = Math.hypot(dx, dy);
        if (pinchStartDist > 0) {
          const ratio = pinchStartDist / currentDist;
          distance = Math.max(3.8, Math.min(11.5, distance * ratio));
          pinchStartDist = currentDist;
        }
      } else if (e.touches.length === 1) {
        onPointerMove(e.touches[0]);
      }
    };

    const onPointerUp = () => {
      isPointerDown = false;
      isPinching = false;
      isInteracting = false;
      setIsInteractingState(false);
    };

    const onWheel = (e) => {
      e.preventDefault();
      isInteracting = true;
      setIsInteractingState(true);
      setHasInteracted(true);
      distance = Math.max(3.8, Math.min(11.5, distance + e.deltaY * 0.006));
      clearTimeout(window._wheelResetTimer);
      window._wheelResetTimer = setTimeout(() => {
        isInteracting = false;
        setIsInteractingState(false);
      }, 700);
    };

    canvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    // 10. Render Loop
    let animId;
    const roadSpeed = 14.0; // Units per second forward
    let prevTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const now = performance.now();
      const dt = Math.min(0.08, (now - prevTime) / 1000);
      prevTime = now;
      const elapsed = (now - startTime) / 1000;

      // 10a. Truck engine suspension vibration
      truckGroup.position.y = Math.sin(elapsed * 18) * 0.018;
      truckGroup.rotation.z = Math.sin(elapsed * 9) * 0.004;

      // 10b. Rotate all wheels continuously proportional to road speed
      const wheelAngularSpeed = roadSpeed / 0.42;
      wheels.forEach((w) => {
        w.rotation.x += wheelAngularSpeed * dt;
      });

      // 10c. Stream yellow road dashes backward along -Z to simulate forward speed
      roadDashes.forEach((dash) => {
        dash.position.z -= roadSpeed * dt;
        if (dash.position.z < -30) {
          dash.position.z += 60;
        }
      });

      // 10d. Stream wind streaks backward
      windStreaks.forEach((streak) => {
        streak.position.z -= streak.speed * dt;
        if (streak.position.z < -18) {
          streak.position.z = 18 + Math.random() * 6;
          streak.position.y = 0.4 + Math.random() * 2.8;
          streak.position.x = (Math.random() - 0.5) * 6.5;
        }
      });

      // 10e. Camera Movement Choreography:
      // Starts from the front of the truck (low dramatic 3/4 front angle)
      // Rolls around to side profile by ~2.6 seconds, and stays in side profile!
      // If user drags/pinches, it follows user; on leave, smoothly lerps back to side profile.
      if (!isInteracting) {
        if (elapsed < 2.6) {
          // Cinematic Intro: Front -> Sideview smooth cubic arc
          const progress = Math.min(1, elapsed / 2.6);
          // Ease in-out cubic
          const t = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;

          camera.position.lerpVectors(frontPos, sidePos, t);
          const currentTarget = new THREE.Vector3().lerpVectors(frontTarget, sideTarget, t);
          camera.lookAt(currentTarget);

          // Sync user orbit variables with current camera arc
          yaw = 0;
          pitch = THREE.MathUtils.lerp(0.26, targetPitch, t);
          distance = THREE.MathUtils.lerp(6.0, targetDistance, t);
        } else {
          // Stay in sideview & smoothly spring back when user leaves
          yaw = THREE.MathUtils.lerp(yaw, targetYaw, 0.06);
          pitch = THREE.MathUtils.lerp(pitch, targetPitch, 0.06);
          distance = THREE.MathUtils.lerp(distance, targetDistance, 0.06);

          // Calculate spherical camera position looking from sideview at truck center
          const cx = sideTarget.x + distance * Math.cos(pitch) * Math.cos(yaw);
          const cy = sideTarget.y + distance * Math.sin(pitch);
          const cz = sideTarget.z + distance * Math.cos(pitch) * Math.sin(yaw);

          camera.position.set(cx, cy, cz);
          camera.lookAt(sideTarget);
        }
      } else {
        // User is interacting: calculate orbit around truck
        const cx = sideTarget.x + distance * Math.cos(pitch) * Math.cos(yaw);
        const cy = sideTarget.y + distance * Math.sin(pitch);
        const cz = sideTarget.z + distance * Math.cos(pitch) * Math.sin(yaw);

        camera.position.set(cx, cy, cz);
        camera.lookAt(sideTarget);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 11. Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    resizeObserver.observe(container);

    // 12. Cleanup
    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      canvas.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);

      renderer.dispose();
      scene.clear();
    };
  }, []);

  return (
    <div className="w-full relative overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl select-none">
      
      {/* 3D WebGL Canvas Container */}
      <div 
        ref={containerRef} 
        className="w-full h-64 sm:h-72 relative cursor-grab active:cursor-grabbing touch-none"
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Cinematic Route Badge Overlay (Top Left) */}
        {(fromCity || toCity) && (
          <div className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-xl bg-zinc-900/85 backdrop-blur-md border border-zinc-800/80 shadow-lg flex items-center gap-2 text-xs font-bold text-white pointer-events-none">
            <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Navigation className="w-3.5 h-3.5" />
            </span>
            <span>{fromCity || 'Origin'}</span>
            <span className="text-emerald-400 font-bold">➔</span>
            <span>{toCity || 'Destination'}</span>
          </div>
        )}

        {/* Vehicle & LR Badge (Top Right) */}
        {(vehicleNo || lrNo) && (
          <div className="absolute top-3 right-3 z-10 px-3 py-1.5 rounded-xl bg-zinc-900/85 backdrop-blur-md border border-zinc-800/80 shadow-lg flex items-center gap-2 text-xs font-mono font-bold text-zinc-200 pointer-events-none">
            {vehicleNo && <span className="text-white">{vehicleNo}</span>}
            {lrNo && (
              <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 text-[10px]">
                {lrNo}
              </span>
            )}
          </div>
        )}

        {/* Interactive 3D Orbit Helper Pill (Bottom Center) */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-zinc-900/90 backdrop-blur-md border border-zinc-800 text-[11px] font-medium text-zinc-300 shadow-lg flex items-center gap-1.5 pointer-events-none transition-opacity duration-200">
          <Compass className={`w-3.5 h-3.5 ${isInteractingState ? 'text-emerald-400 animate-spin' : 'text-zinc-400'}`} />
          <span>
            {isInteractingState 
              ? 'Orbiting in 3D... release to return to side profile' 
              : '⇄ Drag or pinch to rotate 3D truck • Releases to sideview'}
          </span>
        </div>
      </div>
    </div>
  );
}
