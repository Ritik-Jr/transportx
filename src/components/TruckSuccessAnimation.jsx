import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Navigation, Compass } from 'lucide-react';

/**
 * Procedural Canvas Texture Helpers:
 * Generates exact details matching the sprite sheet blueprint (media_1791401046039.png):
 * - Red & White 45° diagonal safety chevron hazard stripes on rear DOT bumper
 * - 10-hole steel/chrome ventilation rim with lug nuts and raised hub
 * - Brushed aluminum lower trailer rub-rail with rivet fastener line
 * - Rear cargo doors with rubber gasket split seam and inner borders
 */

function createChevronTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  
  // Clean white base
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 256, 64);
  
  // 45-degree diagonal red hazard stripes
  ctx.fillStyle = '#dc2626';
  const stripeWidth = 24;
  for (let x = -64; x < 256 + 64; x += stripeWidth * 2) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + stripeWidth, 0);
    ctx.lineTo(x + stripeWidth + 64, 64);
    ctx.lineTo(x + 64, 64);
    ctx.closePath();
    ctx.fill();
  }
  
  // Dark top & bottom borders
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 256, 3);
  ctx.fillRect(0, 61, 256, 3);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

function createRimTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const cx = 128;
  const cy = 128;

  // Metallic gradient disc
  const grad = ctx.createRadialGradient(cx, cy, 18, cx, cy, 126);
  grad.addColorStop(0, '#f8fafc');
  grad.addColorStop(0.45, '#e2e8f0');
  grad.addColorStop(0.85, '#cbd5e1');
  grad.addColorStop(1, '#94a3b8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Outer beveled lip
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(cx, cy, 120, 0, Math.PI * 2);
  ctx.stroke();

  // 10 Round Bolt / Ventilation Holes matching sprite sheet wheels
  const holeRadius = 11;
  const ringRadius = 82;
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI * 2) / 10;
    const hx = cx + Math.cos(angle) * ringRadius;
    const hy = cy + Math.sin(angle) * ringRadius;

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(hx, hy, holeRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  // 10 Chrome Lug Nuts
  const nutRingRadius = 52;
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI * 2) / 10 + Math.PI / 10;
    const nx = cx + Math.cos(angle) * nutRingRadius;
    const ny = cy + Math.sin(angle) * nutRingRadius;

    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(nx, ny, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(nx - 1, ny - 1, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Raised Center Hub Cap
  const hubGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 34);
  hubGrad.addColorStop(0, '#f8fafc');
  hubGrad.addColorStop(0.6, '#cbd5e1');
  hubGrad.addColorStop(0.9, '#64748b');
  hubGrad.addColorStop(1, '#334155');
  ctx.fillStyle = hubGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 34, 0, Math.PI * 2);
  ctx.fill();

  // Dark central axle cap
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(cx, cy, 12, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function createTrailerRailTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  // Brushed aluminum rub rail band
  const grad = ctx.createLinearGradient(0, 0, 0, 64);
  grad.addColorStop(0, '#f1f5f9');
  grad.addColorStop(0.2, '#e2e8f0');
  grad.addColorStop(0.7, '#cbd5e1');
  grad.addColorStop(1, '#94a3b8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 64);

  // Top highlight
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 512, 3);

  // Horizontal rivet line along the bottom edge
  for (let x = 8; x < 512; x += 16) {
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(x, 48, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(x - 0.8, 47.2, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.set(6, 1);
  return texture;
}

function createRearDoorsTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // White base
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 256, 256);

  // Outer black rubber gasket
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, 248, 248);

  // Center vertical door split seam
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(125, 0, 6, 256);

  // Door inner bevel shadows
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, 112, 236);
  ctx.strokeRect(134, 10, 112, 236);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export default function TruckSuccessAnimation({ 
  fromCity = '', 
  toCity = '', 
  lrNo = '', 
  vehicleNo = '' 
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [isInteractingState, setIsInteractingState] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  // Keep theme state reactive if class on html changes
  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Detect theme
    const isDark = document.documentElement.classList.contains('dark');

    // 1. Scene Setup
    const scene = new THREE.Scene();
    
    // Theme Atmosphere:
    // Light: Clean bright daylight highway sky
    // Dark: Luminous full-moon twilight highway (never overly dark, crisp visibility)
    const skyColor = isDark ? 0x0f172a : 0xf1f5f9;
    const fogColor = isDark ? 0x0f172a : 0xe2e8f0;
    scene.background = new THREE.Color(skyColor);
    scene.fog = new THREE.FogExp2(fogColor, 0.015);

    // 2. Camera Setup (Increased distance framing with generous breathing room)
    const camera = new THREE.PerspectiveCamera(
      35,
      container.clientWidth / container.clientHeight,
      0.1,
      150
    );

    // Rig geometric center:
    // Tractor front bumper: Z = +4.15m, Trailer rear bumper: Z = -10.48m
    // True Center of Mass: X = 0, Y = 1.65, Z = -3.15
    const sideTarget = new THREE.Vector3(0, 1.65, -3.15);
    
    // Canonical sideview camera: Distance increased to 18.5m for a generous, spacious cinematic vista
    const targetDistance = 18.5;
    const targetPitch = 0.14;
    const targetYaw = 0;

    const sidePos = new THREE.Vector3(
      sideTarget.x + targetDistance * Math.cos(targetPitch),
      sideTarget.y + targetDistance * Math.sin(targetPitch),
      sideTarget.z
    );

    // Front start camera: Dramatic wide 3/4 front entry view from a distance
    const frontPos = new THREE.Vector3(6.2, 2.5, 14.5);
    const frontTarget = new THREE.Vector3(0, 1.65, 1.5);

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
    renderer.toneMappingExposure = isDark ? 1.25 : 1.15;

    // 4. Lighting Setup
    if (!isDark) {
      // Day Theme: Warm golden sun & sky ambient
      const dayAmbient = new THREE.AmbientLight(0xe2e8f0, 1.35);
      scene.add(dayAmbient);

      const sunLight = new THREE.DirectionalLight(0xfffbeb, 2.5);
      sunLight.position.set(14, 22, 10);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 1024;
      sunLight.shadow.mapSize.height = 1024;
      sunLight.shadow.bias = -0.0004;
      scene.add(sunLight);

      const skyFill = new THREE.DirectionalLight(0xbae6fd, 0.85);
      skyFill.position.set(-12, 10, -8);
      scene.add(skyFill);
    } else {
      // Dark Theme: Luminous full-moon & sunset twilight (clear, crisp details)
      const nightAmbient = new THREE.AmbientLight(0x334155, 1.45);
      scene.add(nightAmbient);

      const moonLight = new THREE.DirectionalLight(0x93c5fd, 2.2);
      moonLight.position.set(12, 18, 9);
      moonLight.castShadow = true;
      moonLight.shadow.mapSize.width = 1024;
      moonLight.shadow.mapSize.height = 1024;
      moonLight.shadow.bias = -0.0004;
      scene.add(moonLight);

      const sunsetRim = new THREE.DirectionalLight(0xf59e0b, 0.75);
      sunsetRim.position.set(-14, 6, -10);
      scene.add(sunsetRim);
    }

    // 5. Build Rig Matching Reference Blueprint (media_1791401046039.png)
    const truckRig = new THREE.Group();
    scene.add(truckRig);

    // Procedural Textures
    const chevronTex = createChevronTexture();
    const rimTex = createRimTexture();
    const trailerRailTex = createTrailerRailTexture();
    const rearDoorsTex = createRearDoorsTexture();

    // High-Detail Shared Materials
    const truckBodyMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.22,
      roughness: 0.2
    });

    const darkTrimMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.5,
      roughness: 0.4
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.12
    });

    const tintedGlassMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      metalness: 0.9,
      roughness: 0.05,
      transparent: true,
      opacity: 0.92
    });

    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.94,
      metalness: 0.08
    });

    const rimMat = new THREE.MeshStandardMaterial({
      map: rimTex,
      metalness: 0.85,
      roughness: 0.25
    });

    const trailerRailMat = new THREE.MeshStandardMaterial({
      map: trailerRailTex,
      metalness: 0.7,
      roughness: 0.3
    });

    const rearDoorsMat = new THREE.MeshStandardMaterial({
      map: rearDoorsTex,
      metalness: 0.2,
      roughness: 0.25
    });

    const chevronBumperMat = new THREE.MeshStandardMaterial({
      map: chevronTex,
      metalness: 0.3,
      roughness: 0.35
    });

    const amberLightMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 2.8
    });

    const headlightMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfef08a,
      emissiveIntensity: isDark ? 3.6 : 2.0
    });

    const taillightMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: isDark ? 3.2 : 1.8
    });

    const reverseLightMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 2.0
    });

    // -------------------------------------------------------------
    // 5A. TRACTOR CABIN (Aerodynamic Conventional Sleeper Unit)
    // -------------------------------------------------------------
    const tractorGroup = new THREE.Group();
    tractorGroup.position.set(0, 0, 0);
    truckRig.add(tractorGroup);

    // 5A.1 Chassis Steel Beams
    const chassisBeams = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.24, 5.4), darkTrimMat);
    chassisBeams.position.set(0, 0.65, 0.95);
    chassisBeams.castShadow = true;
    tractorGroup.add(chassisBeams);

    // Fifth Wheel Coupling Plate (Couples with trailer kingpin at Z = -1.0)
    const fifthWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.08, 16), darkTrimMat);
    fifthWheel.position.set(0, 0.84, -1.0);
    tractorGroup.add(fifthWheel);

    // 5A.2 Aerodynamic Sloped Hood
    const hoodGroup = new THREE.Group();
    hoodGroup.position.set(0, 1.15, 2.45);
    tractorGroup.add(hoodGroup);

    // Main hood body
    const hoodMain = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.85, 1.8), truckBodyMat);
    hoodMain.position.set(0, 0, 0);
    hoodMain.castShadow = true;
    hoodGroup.add(hoodMain);

    // Sloped hood nose tapering down forward
    const hoodNose = new THREE.Mesh(new THREE.BoxGeometry(1.84, 0.65, 0.72), truckBodyMat);
    hoodNose.position.set(0, -0.1, 1.05);
    hoodNose.rotation.x = 0.2;
    hoodNose.castShadow = true;
    hoodGroup.add(hoodNose);

    // Side Hood Teardrop Chrome Vents (Matching Cascadia/T680 emblem in sprite sheet)
    const sideVentGeo = new THREE.BoxGeometry(0.04, 0.12, 0.32);
    const leftVent = new THREE.Mesh(sideVentGeo, chromeMat);
    leftVent.position.set(-0.95, 0.08, 0.1);
    hoodGroup.add(leftVent);

    const rightVent = new THREE.Mesh(sideVentGeo, chromeMat);
    rightVent.position.set(0.95, 0.08, 0.1);
    hoodGroup.add(rightVent);

    // Amber Front Fender Turn Indicators (Forward of wheel arch)
    const fenderLightGeo = new THREE.BoxGeometry(0.04, 0.08, 0.18);
    const leftFenderLight = new THREE.Mesh(fenderLightGeo, amberLightMat);
    leftFenderLight.position.set(-0.95, -0.28, 1.1);
    hoodGroup.add(leftFenderLight);

    const rightFenderLight = new THREE.Mesh(fenderLightGeo, amberLightMat);
    rightFenderLight.position.set(0.95, -0.28, 1.1);
    hoodGroup.add(rightFenderLight);

    // Large Chrome Vertical Radiator Grille (Curved surround matching front view)
    const grilleSurround = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.92, 0.08), chromeMat);
    grilleSurround.position.set(0, 0.05, 1.42);
    hoodGroup.add(grilleSurround);

    const grilleMesh = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.82, 0.02), darkTrimMat);
    grilleMesh.position.set(0, 0.05, 1.44);
    hoodGroup.add(grilleMesh);

    // 14 Vertical chrome slats
    for (let x = -0.45; x <= 0.45; x += 0.07) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.8, 0.04), chromeMat);
      slat.position.set(x, 0.05, 1.45);
      hoodGroup.add(slat);
    }

    // Front Aerodynamic Bumper
    const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(2.14, 0.38, 0.36), truckBodyMat);
    frontBumper.position.set(0, -0.44, 1.4);
    frontBumper.castShadow = true;
    hoodGroup.add(frontBumper);

    // Bumper center lower air intake slot
    const bumperIntake = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.1, 0.05), darkTrimMat);
    bumperIntake.position.set(0, -0.5, 1.58);
    hoodGroup.add(bumperIntake);

    // Integrated Projector Headlight Pods
    const headlightGeo = new THREE.BoxGeometry(0.34, 0.16, 0.08);
    const leftHeadlight = new THREE.Mesh(headlightGeo, headlightMat);
    leftHeadlight.position.set(-0.76, -0.38, 1.56);
    hoodGroup.add(leftHeadlight);

    const rightHeadlight = new THREE.Mesh(headlightGeo, headlightMat);
    rightHeadlight.position.set(0.76, -0.38, 1.56);
    hoodGroup.add(rightHeadlight);

    // Lower amber turn strips under headlights
    const turnGeo = new THREE.BoxGeometry(0.34, 0.04, 0.08);
    const leftTurn = new THREE.Mesh(turnGeo, amberLightMat);
    leftTurn.position.set(-0.76, -0.48, 1.56);
    hoodGroup.add(leftTurn);

    const rightTurn = new THREE.Mesh(turnGeo, amberLightMat);
    rightTurn.position.set(0.76, -0.48, 1.56);
    hoodGroup.add(rightTurn);

    // Real Headlight Spotlights illuminating the road forward
    const spotL = new THREE.SpotLight(0xfef08a, isDark ? 4.5 : 2.2, 28, Math.PI / 5, 0.4, 1.2);
    spotL.position.set(-0.76, 0.8, 4.2);
    spotL.target.position.set(-0.76, 0, 18);
    scene.add(spotL);
    scene.add(spotL.target);

    const spotR = new THREE.SpotLight(0xfef08a, isDark ? 4.5 : 2.2, 28, Math.PI / 5, 0.4, 1.2);
    spotR.position.set(0.76, 0.8, 4.2);
    spotR.target.position.set(0.76, 0, 18);
    scene.add(spotR);
    scene.add(spotR.target);

    // 5A.3 High-Roof Sleeper Cabin
    const cabGroup = new THREE.Group();
    cabGroup.position.set(0, 1.68, 0.75);
    tractorGroup.add(cabGroup);

    // Main Sleeper Compartment Box
    const sleeperBox = new THREE.Mesh(new THREE.BoxGeometry(2.05, 1.7, 1.95), truckBodyMat);
    sleeperBox.position.set(0, 0, 0);
    sleeperBox.castShadow = true;
    cabGroup.add(sleeperBox);

    // Aerodynamic Curved High-Roof Cap (Smooth slope down to windshield)
    const roofCap = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.78, 1.75), truckBodyMat);
    roofCap.position.set(0, 1.15, -0.1);
    roofCap.rotation.x = -0.16;
    roofCap.castShadow = true;
    cabGroup.add(roofCap);

    // Roof Top Air Scoop Indent Channels (Matching front view in sprite sheet)
    const leftRoofScoop = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.16, 1.1), darkTrimMat);
    leftRoofScoop.position.set(-0.5, 1.52, -0.15);
    leftRoofScoop.rotation.x = -0.18;
    cabGroup.add(leftRoofScoop);

    const rightRoofScoop = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.16, 1.1), darkTrimMat);
    rightRoofScoop.position.set(0.5, 1.52, -0.15);
    rightRoofScoop.rotation.x = -0.18;
    cabGroup.add(rightRoofScoop);

    // Sloped Panoramic Windshield
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.86, 0.74, 0.08), tintedGlassMat);
    windshield.position.set(0, 0.36, 0.98);
    windshield.rotation.x = -0.2;
    cabGroup.add(windshield);

    // Aerodynamic Sun Visor with Integrated Amber Roof Clearance Lights
    const sunVisor = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.14, 0.26), truckBodyMat);
    sunVisor.position.set(0, 0.78, 0.98);
    sunVisor.rotation.x = 0.22;
    cabGroup.add(sunVisor);

    // 5 Amber Cab-Roof Marker Lights
    for (let x = -0.65; x <= 0.65; x += 0.325) {
      const marker = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.06), amberLightMat);
      marker.position.set(x, 0.88, 0.95);
      cabGroup.add(marker);
    }

    // Side Door Windows
    const leftDoorWin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.54, 0.78), tintedGlassMat);
    leftDoorWin.position.set(-1.03, 0.36, 0.46);
    cabGroup.add(leftDoorWin);

    const rightDoorWin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.54, 0.78), tintedGlassMat);
    rightDoorWin.position.set(1.03, 0.36, 0.46);
    cabGroup.add(rightDoorWin);

    // Sleeper Bunk Side Windows with Chrome Border (Visible in sprite sheet side views)
    const sleeperWinGeo = new THREE.BoxGeometry(0.06, 0.34, 0.3);
    const leftSleeperWin = new THREE.Mesh(sleeperWinGeo, tintedGlassMat);
    leftSleeperWin.position.set(-1.03, 0.36, -0.35);
    cabGroup.add(leftSleeperWin);

    const rightSleeperWin = new THREE.Mesh(sleeperWinGeo, tintedGlassMat);
    rightSleeperWin.position.set(1.03, 0.36, -0.35);
    cabGroup.add(rightSleeperWin);

    // Dual Chrome Side Aerodynamic Mirrors
    const mirrorStemGeo = new THREE.BoxGeometry(0.04, 0.04, 0.3);
    const mirrorBodyGeo = new THREE.BoxGeometry(0.08, 0.45, 0.18);
    const spotterGeo = new THREE.BoxGeometry(0.08, 0.12, 0.16);

    const leftStem = new THREE.Mesh(mirrorStemGeo, darkTrimMat);
    leftStem.position.set(-1.16, 0.36, 0.86);
    cabGroup.add(leftStem);
    const leftMirror = new THREE.Mesh(mirrorBodyGeo, chromeMat);
    leftMirror.position.set(-1.3, 0.36, 0.96);
    cabGroup.add(leftMirror);
    const leftSpotter = new THREE.Mesh(spotterGeo, chromeMat);
    leftSpotter.position.set(-1.3, 0.1, 0.96);
    cabGroup.add(leftSpotter);

    const rightStem = new THREE.Mesh(mirrorStemGeo, darkTrimMat);
    rightStem.position.set(1.16, 0.36, 0.86);
    cabGroup.add(rightStem);
    const rightMirror = new THREE.Mesh(mirrorBodyGeo, chromeMat);
    rightMirror.position.set(1.3, 0.36, 0.96);
    cabGroup.add(rightMirror);
    const rightSpotter = new THREE.Mesh(spotterGeo, chromeMat);
    rightSpotter.position.set(1.3, 0.1, 0.96);
    cabGroup.add(rightSpotter);

    // Cab Rear Side Extenders (Aerodynamic fairing closing tractor-trailer gap)
    const extenderGeo = new THREE.BoxGeometry(0.08, 1.7, 0.42);
    const leftExtender = new THREE.Mesh(extenderGeo, darkTrimMat);
    leftExtender.position.set(-1.01, 0, -1.08);
    cabGroup.add(leftExtender);

    const rightExtender = new THREE.Mesh(extenderGeo, darkTrimMat);
    rightExtender.position.set(1.01, 0, -1.08);
    cabGroup.add(rightExtender);

    // 5A.4 Chassis Aerodynamic Skirts, Fuel Tank Caps & Entry Steps
    const leftSkirt = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.55, 2.35), truckBodyMat);
    leftSkirt.position.set(-1.02, 0.52, 0.85);
    leftSkirt.castShadow = true;
    tractorGroup.add(leftSkirt);

    const rightSkirt = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.55, 2.35), truckBodyMat);
    rightSkirt.position.set(1.02, 0.52, 0.85);
    rightSkirt.castShadow = true;
    tractorGroup.add(rightSkirt);

    // Cab Entry Steps under the door
    const stepGeo = new THREE.BoxGeometry(0.26, 0.08, 0.48);
    const leftStep = new THREE.Mesh(stepGeo, darkTrimMat);
    leftStep.position.set(-1.04, 0.42, 1.45);
    tractorGroup.add(leftStep);

    const rightStep = new THREE.Mesh(stepGeo, darkTrimMat);
    rightStep.position.set(1.04, 0.42, 1.45);
    tractorGroup.add(rightStep);

    // Chrome Fuel Cap & Blue DEF Filler Cap (Visible on side skirts in sprite sheet)
    const fuelCapGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.04, 12);
    fuelCapGeo.rotateZ(Math.PI / 2);
    const leftFuelCap = new THREE.Mesh(fuelCapGeo, chromeMat);
    leftFuelCap.position.set(-1.15, 0.55, 0.35);
    tractorGroup.add(leftFuelCap);

    const defCapGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.04, 12);
    defCapGeo.rotateZ(Math.PI / 2);
    const leftDefCap = new THREE.Mesh(defCapGeo, new THREE.MeshStandardMaterial({ color: 0x0284c7 }));
    leftDefCap.position.set(-1.15, 0.55, 0.15);
    tractorGroup.add(leftDefCap);

    // Tandem Drive Axle Curved Mudguards / Fenders
    const fenderDriveGeo = new THREE.BoxGeometry(0.32, 0.12, 1.9);
    const leftDriveFender = new THREE.Mesh(fenderDriveGeo, darkTrimMat);
    leftDriveFender.position.set(-1.05, 0.95, -1.0);
    tractorGroup.add(leftDriveFender);

    const rightDriveFender = new THREE.Mesh(fenderDriveGeo, darkTrimMat);
    rightDriveFender.position.set(1.05, 0.95, -1.0);
    tractorGroup.add(rightDriveFender);

    // -------------------------------------------------------------
    // 5B. SEMI-TRAILER UNIT (53-Ft Tri-Axle Van Semi-Trailer)
    // -------------------------------------------------------------
    const trailerGroup = new THREE.Group();
    trailerGroup.position.set(0, 0, 0);
    truckRig.add(trailerGroup);

    // Proportions matching sprite sheet:
    // Length: 9.8m, Height: 2.20m, Width: 2.12m
    // Trailer Front at Z = -0.65m, Trailer Rear at Z = -10.45m
    // Center at Z = -5.55m, Y = 2.25m
    const trailerBox = new THREE.Mesh(new THREE.BoxGeometry(2.12, 2.2, 9.8), truckBodyMat);
    trailerBox.position.set(0, 2.25, -5.55);
    trailerBox.castShadow = true;
    trailerGroup.add(trailerBox);

    // Top Full-Length Aluminum Extrusion Rails
    const topRailGeo = new THREE.BoxGeometry(0.06, 0.1, 9.84);
    const topRailL = new THREE.Mesh(topRailGeo, chromeMat);
    topRailL.position.set(-1.07, 3.35, -5.55);
    trailerGroup.add(topRailL);

    const topRailR = new THREE.Mesh(topRailGeo, chromeMat);
    topRailR.position.set(1.07, 3.35, -5.55);
    trailerGroup.add(topRailR);

    // Bottom Full-Length Aluminum Rub Rail with Rivet Pattern (Matching sprite sheet)
    const bottomRailGeo = new THREE.BoxGeometry(0.06, 0.22, 9.84);
    const bottomRailL = new THREE.Mesh(bottomRailGeo, trailerRailMat);
    bottomRailL.position.set(-1.07, 1.25, -5.55);
    trailerGroup.add(bottomRailL);

    const bottomRailR = new THREE.Mesh(bottomRailGeo, trailerRailMat);
    bottomRailR.position.set(1.07, 1.25, -5.55);
    trailerGroup.add(bottomRailR);

    // Front & Rear Aluminum Corner Posts
    const postGeo = new THREE.BoxGeometry(0.08, 2.24, 0.08);
    const postFL = new THREE.Mesh(postGeo, chromeMat);
    postFL.position.set(-1.07, 2.25, -0.65);
    trailerGroup.add(postFL);
    const postFR = new THREE.Mesh(postGeo, chromeMat);
    postFR.position.set(1.07, 2.25, -0.65);
    trailerGroup.add(postFR);
    const postRL = new THREE.Mesh(postGeo, chromeMat);
    postRL.position.set(-1.07, 2.25, -10.45);
    trailerGroup.add(postRL);
    const postRR = new THREE.Mesh(postGeo, chromeMat);
    postRR.position.set(1.07, 2.25, -10.45);
    trailerGroup.add(postRR);

    // Underbody Dark Chassis Frame I-Beams
    const trailerUnderframe = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.22, 9.8), darkTrimMat);
    trailerUnderframe.position.set(0, 1.05, -5.55);
    trailerUnderframe.castShadow = true;
    trailerGroup.add(trailerUnderframe);

    // Trailer Landing Gear (Dollies) positioned at 1/3 trailer length (Z = -2.85)
    const legGeo = new THREE.BoxGeometry(0.12, 0.85, 0.12);
    const leftLeg = new THREE.Mesh(legGeo, darkTrimMat);
    leftLeg.position.set(-0.82, 0.58, -2.85);
    trailerGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, darkTrimMat);
    rightLeg.position.set(0.82, 0.58, -2.85);
    trailerGroup.add(rightLeg);

    // Landing gear cross-brace shaft & foot pads
    const crossShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.6, 8), darkTrimMat);
    crossShaft.position.set(0, 0.65, -2.85);
    crossShaft.rotateZ(Math.PI / 2);
    trailerGroup.add(crossShaft);

    const footGeo = new THREE.BoxGeometry(0.28, 0.08, 0.28);
    const leftFoot = new THREE.Mesh(footGeo, darkTrimMat);
    leftFoot.position.set(-0.82, 0.16, -2.85);
    trailerGroup.add(leftFoot);

    const rightFoot = new THREE.Mesh(footGeo, darkTrimMat);
    rightFoot.position.set(0.82, 0.16, -2.85);
    trailerGroup.add(rightFoot);

    // Lateral Underrun Protection Guard Rails (Cycle Guards)
    // As in sprite sheet: 2 horizontal open silver rails spanning from landing gear to tri-axle
    const guardBarGeo = new THREE.BoxGeometry(0.05, 0.08, 2.6);
    const guardStanchionGeo = new THREE.BoxGeometry(0.04, 0.42, 0.06);

    // Left Underrun Rails
    const leftGuardTop = new THREE.Mesh(guardBarGeo, chromeMat);
    leftGuardTop.position.set(-1.04, 0.62, -4.5);
    trailerGroup.add(leftGuardTop);

    const leftGuardBottom = new THREE.Mesh(guardBarGeo, chromeMat);
    leftGuardBottom.position.set(-1.04, 0.42, -4.5);
    trailerGroup.add(leftGuardBottom);

    for (let z = -5.6; z <= -3.4; z += 1.1) {
      const stanchion = new THREE.Mesh(guardStanchionGeo, darkTrimMat);
      stanchion.position.set(-1.02, 0.52, z);
      trailerGroup.add(stanchion);
    }

    // Right Underrun Rails
    const rightGuardTop = new THREE.Mesh(guardBarGeo, chromeMat);
    rightGuardTop.position.set(1.04, 0.62, -4.5);
    trailerGroup.add(rightGuardTop);

    const rightGuardBottom = new THREE.Mesh(guardBarGeo, chromeMat);
    rightGuardBottom.position.set(1.04, 0.42, -4.5);
    trailerGroup.add(rightGuardBottom);

    for (let z = -5.6; z <= -3.4; z += 1.1) {
      const stanchion = new THREE.Mesh(guardStanchionGeo, darkTrimMat);
      stanchion.position.set(1.02, 0.52, z);
      trailerGroup.add(stanchion);
    }

    // Rear Double Swing Doors (Matching Rear Blueprint View)
    const rearDoorsPanel = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 2.18), rearDoorsMat);
    rearDoorsPanel.position.set(0, 2.25, -10.46);
    rearDoorsPanel.rotation.y = Math.PI;
    trailerGroup.add(rearDoorsPanel);

    // 8 Chrome Door Hinges (4 on left, 4 on right)
    const hingeGeo = new THREE.BoxGeometry(0.08, 0.1, 0.04);
    for (let y = 1.4; y <= 3.1; y += 0.56) {
      const hingeL = new THREE.Mesh(hingeGeo, chromeMat);
      hingeL.position.set(-1.05, y, -10.46);
      trailerGroup.add(hingeL);

      const hingeR = new THREE.Mesh(hingeGeo, chromeMat);
      hingeR.position.set(1.05, y, -10.46);
      trailerGroup.add(hingeR);
    }

    // 4 Full-Height Vertical Chrome Locking Cam Rods
    const camRodGeo = new THREE.CylinderGeometry(0.02, 0.02, 2.15, 8);
    const rodPos = [-0.62, -0.16, 0.16, 0.62];
    rodPos.forEach((xPos) => {
      const rod = new THREE.Mesh(camRodGeo, chromeMat);
      rod.position.set(xPos, 2.25, -10.48);
      trailerGroup.add(rod);

      // Central Door Handle
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 0.06), chromeMat);
      handle.position.set(xPos + (xPos < 0 ? -0.05 : 0.05), 2.05, -10.5);
      trailerGroup.add(handle);
    });

    // Rear DOT Underrun Bumper with Diagonal Red & White Safety Chevron Stripes
    const dotBumper = new THREE.Mesh(new THREE.BoxGeometry(2.14, 0.22, 0.12), chevronBumperMat);
    dotBumper.position.set(0, 0.44, -10.48);
    trailerGroup.add(dotBumper);

    // Bumper vertical drop stanchions connecting to chassis
    const bumperDropGeo = new THREE.BoxGeometry(0.12, 0.5, 0.08);
    const dropL = new THREE.Mesh(bumperDropGeo, darkTrimMat);
    dropL.position.set(-0.7, 0.65, -10.46);
    trailerGroup.add(dropL);

    const dropR = new THREE.Mesh(bumperDropGeo, darkTrimMat);
    dropR.position.set(0.7, 0.65, -10.46);
    trailerGroup.add(dropR);

    // Rear Tail Light Clusters (Horizontal 3-lamp clusters: Amber turn, Red brake, White reverse)
    const lampWidth = 0.14;
    const lampHeight = 0.09;
    const lampDepth = 0.04;
    const lampGeo = new THREE.BoxGeometry(lampWidth, lampHeight, lampDepth);

    // Left cluster
    const tLightL1 = new THREE.Mesh(lampGeo, taillightMat);
    tLightL1.position.set(-0.88, 0.68, -10.48);
    trailerGroup.add(tLightL1);
    const tLightL2 = new THREE.Mesh(lampGeo, amberLightMat);
    tLightL2.position.set(-0.72, 0.68, -10.48);
    trailerGroup.add(tLightL2);
    const tLightL3 = new THREE.Mesh(lampGeo, reverseLightMat);
    tLightL3.position.set(-0.56, 0.68, -10.48);
    trailerGroup.add(tLightL3);

    // Right cluster
    const tLightR1 = new THREE.Mesh(lampGeo, reverseLightMat);
    tLightR1.position.set(0.56, 0.68, -10.48);
    trailerGroup.add(tLightR1);
    const tLightR2 = new THREE.Mesh(lampGeo, amberLightMat);
    tLightR2.position.set(0.72, 0.68, -10.48);
    trailerGroup.add(tLightR2);
    const tLightR3 = new THREE.Mesh(lampGeo, taillightMat);
    tLightR3.position.set(0.88, 0.68, -10.48);
    trailerGroup.add(tLightR3);

    // Rear Black Mudflaps hanging below the bumper
    const mudflapGeo = new THREE.BoxGeometry(0.32, 0.38, 0.03);
    const mudflapL = new THREE.Mesh(mudflapGeo, darkTrimMat);
    mudflapL.position.set(-0.85, 0.22, -10.48);
    trailerGroup.add(mudflapL);

    const mudflapR = new THREE.Mesh(mudflapGeo, darkTrimMat);
    mudflapR.position.set(0.85, 0.22, -10.48);
    trailerGroup.add(mudflapR);

    // -------------------------------------------------------------
    // 5C. HIGH-PRECISION ROTATING WHEELS (12 Wheels Matching Blueprint)
    // -------------------------------------------------------------
    // Blueprint Configuration:
    // Tractor: 1 Steer Axle + 2 Drive Tandem Axles
    // Trailer: 3 Rear Axles (Tri-Axle Bogie!)
    const allWheels = [];
    const wheelRadius = 0.45;
    const wheelWidth = 0.28;

    const tireGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 28);
    tireGeo.rotateZ(Math.PI / 2);

    const rimDiscGeo = new THREE.CircleGeometry(wheelRadius * 0.72, 24);
    const innerRimGeo = new THREE.CylinderGeometry(wheelRadius * 0.68, wheelRadius * 0.68, wheelWidth - 0.02, 20);
    innerRimGeo.rotateZ(Math.PI / 2);

    const hubCapGeo = new THREE.CylinderGeometry(0.12, 0.12, wheelWidth + 0.05, 14);
    hubCapGeo.rotateZ(Math.PI / 2);

    function addWheel(parent, x, y, z, isLeftSide) {
      const wGroup = new THREE.Group();
      wGroup.position.set(x, y, z);

      // Rubber Tire
      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.castShadow = true;
      wGroup.add(tire);

      // Inner Metallic Rim Shell
      const innerRim = new THREE.Mesh(innerRimGeo, darkTrimMat);
      wGroup.add(innerRim);

      // Outer Face with 10-Hole Ventilated Rim Texture
      const outerRimDisc = new THREE.Mesh(rimDiscGeo, rimMat);
      outerRimDisc.position.set(isLeftSide ? -wheelWidth / 2 - 0.002 : wheelWidth / 2 + 0.002, 0, 0);
      outerRimDisc.rotation.y = isLeftSide ? -Math.PI / 2 : Math.PI / 2;
      wGroup.add(outerRimDisc);

      // Raised Center Hub Cap
      const hub = new THREE.Mesh(hubCapGeo, chromeMat);
      wGroup.add(hub);

      parent.add(wGroup);
      allWheels.push(wGroup);
    }

    // 1. Tractor Steer Axle (Z = +3.2m)
    addWheel(tractorGroup, -1.06, wheelRadius, 3.2, true);
    addWheel(tractorGroup, 1.06, wheelRadius, 3.2, false);

    // 2. Tractor Tandem Drive Axles (Z = -0.45m and Z = -1.55m)
    addWheel(tractorGroup, -1.06, wheelRadius, -0.45, true);
    addWheel(tractorGroup, 1.06, wheelRadius, -0.45, false);
    addWheel(tractorGroup, -1.06, wheelRadius, -1.55, true);
    addWheel(tractorGroup, 1.06, wheelRadius, -1.55, false);

    // 3. Trailer Tri-Axle Bogie (Z = -6.4m, Z = -7.5m, Z = -8.6m)
    addWheel(trailerGroup, -1.08, wheelRadius, -6.4, true);
    addWheel(trailerGroup, 1.08, wheelRadius, -6.4, false);
    addWheel(trailerGroup, -1.08, wheelRadius, -7.5, true);
    addWheel(trailerGroup, 1.08, wheelRadius, -7.5, false);
    addWheel(trailerGroup, -1.08, wheelRadius, -8.6, true);
    addWheel(trailerGroup, 1.08, wheelRadius, -8.6, false);

    // -------------------------------------------------------------
    // 6. HIGHWAY ROAD & STRIPES
    // -------------------------------------------------------------
    const roadGroup = new THREE.Group();
    scene.add(roadGroup);

    // Asphalt Surface
    const asphaltMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x18181b : 0x27272a,
      roughness: 0.94,
      metalness: 0.06
    });
    const asphaltPlane = new THREE.Mesh(new THREE.PlaneGeometry(28, 120), asphaltMat);
    asphaltPlane.rotation.x = -Math.PI / 2;
    asphaltPlane.position.set(0, 0, -3.0);
    asphaltPlane.receiveShadow = true;
    roadGroup.add(asphaltPlane);

    // Shoulder Lines
    const whiteLineMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    const shoulderL = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 120), whiteLineMat);
    shoulderL.rotation.x = -Math.PI / 2;
    shoulderL.position.set(-5.0, 0.005, -3.0);
    roadGroup.add(shoulderL);

    const shoulderR = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 120), whiteLineMat);
    shoulderR.rotation.x = -Math.PI / 2;
    shoulderR.position.set(5.0, 0.005, -3.0);
    roadGroup.add(shoulderR);

    // Yellow Dashed Divider Stripes (Stream backward)
    const yellowStripeMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const dashGeometry = new THREE.PlaneGeometry(0.26, 4.2);
    dashGeometry.rotateX(-Math.PI / 2);

    const roadDashes = [];
    for (let z = -60; z <= 50; z += 8.5) {
      const dash = new THREE.Mesh(dashGeometry, yellowStripeMat);
      dash.position.set(0, 0.006, z);
      roadGroup.add(dash);
      roadDashes.push(dash);
    }

    // -------------------------------------------------------------
    // 7. HIGHWAY SPEED / WIND STREAKS
    // -------------------------------------------------------------
    const windStreaks = [];
    const windMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x93c5fd : 0x0284c7,
      transparent: true,
      opacity: isDark ? 0.35 : 0.22
    });
    const windGeo = new THREE.CylinderGeometry(0.015, 0.015, 3.8, 4);
    windGeo.rotateX(Math.PI / 2);

    for (let i = 0; i < 34; i++) {
      const streak = new THREE.Mesh(windGeo, windMat);
      streak.position.set(
        (Math.random() - 0.5) * 9.5,
        0.5 + Math.random() * 4.0,
        (Math.random() - 0.5) * 45
      );
      streak.speed = 28 + Math.random() * 18;
      scene.add(streak);
      windStreaks.push(streak);
    }

    // -------------------------------------------------------------
    // 8. CAMERA CHOREOGRAPHY & INTERACTIVE ORBIT CONTROLS
    // -------------------------------------------------------------
    let startTime = performance.now();
    let isInteracting = false;
    let yaw = 0;
    let pitch = targetPitch;
    let distance = targetDistance;

    let isPointerDown = false;
    let prevPointerX = 0;
    let prevPointerY = 0;
    let pinchStartDist = 0;
    let isPinching = false;

    const onPointerDown = (e) => {
      isPointerDown = true;
      isInteracting = true;
      setIsInteractingState(true);
      prevPointerX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      prevPointerY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    };

    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        isPinching = true;
        isInteracting = true;
        setIsInteractingState(true);
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

      yaw += deltaX * 0.006;
      pitch = Math.max(-0.25, Math.min(0.9, pitch + deltaY * 0.004));
    };

    const onTouchMove = (e) => {
      if (isPinching && e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDist = Math.hypot(dx, dy);
        if (pinchStartDist > 0) {
          const ratio = pinchStartDist / currentDist;
          distance = Math.max(11.0, Math.min(28.0, distance * ratio));
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
      distance = Math.max(11.0, Math.min(28.0, distance + e.deltaY * 0.009));
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

    // -------------------------------------------------------------
    // 9. ANIMATION LOOP
    // -------------------------------------------------------------
    let animId;
    const cruiseSpeed = 16.5; // Units per second forward
    let prevTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const now = performance.now();
      const dt = Math.min(0.08, (now - prevTime) / 1000);
      prevTime = now;
      const elapsed = (now - startTime) / 1000;

      // 9a. Subtle Truck Suspension Sway & Engine Vibration
      truckRig.position.y = Math.sin(elapsed * 16) * 0.012;
      truckRig.rotation.z = Math.sin(elapsed * 7) * 0.0025;

      // 9b. Rotate All 12 Wheels proportional to road speed
      const wheelAngularSpeed = cruiseSpeed / wheelRadius;
      allWheels.forEach((w) => {
        w.rotation.x += wheelAngularSpeed * dt;
      });

      // 9c. Stream Road Stripes Backward
      roadDashes.forEach((dash) => {
        dash.position.z -= cruiseSpeed * dt;
        if (dash.position.z < -55) {
          dash.position.z += 105;
        }
      });

      // 9d. Stream Wind Streaks Backward
      windStreaks.forEach((streak) => {
        streak.position.z -= streak.speed * dt;
        if (streak.position.z < -32) {
          streak.position.z = 32 + Math.random() * 8;
          streak.position.y = 0.5 + Math.random() * 4.0;
          streak.position.x = (Math.random() - 0.5) * 9.5;
        }
      });

      // 9e. Camera Cinematic Choreography:
      // Starts from the 3/4 front entry rolling smoothly around to the canonical sideview by ~2.8s.
      // Stays locked in the sideview with comfortable breathing room.
      if (!isInteracting) {
        if (elapsed < 2.8) {
          // Front to Sideview smooth arc transition
          const progress = Math.min(1, elapsed / 2.8);
          // Cubic ease-in-out
          const t = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;

          camera.position.lerpVectors(frontPos, sidePos, t);
          const currentTarget = new THREE.Vector3().lerpVectors(frontTarget, sideTarget, t);
          camera.lookAt(currentTarget);

          yaw = 0;
          pitch = THREE.MathUtils.lerp(0.18, targetPitch, t);
          distance = THREE.MathUtils.lerp(14.0, targetDistance, t);
        } else {
          // Smoothly spring / lerp back to canonical sideview
          yaw = THREE.MathUtils.lerp(yaw, targetYaw, 0.055);
          pitch = THREE.MathUtils.lerp(pitch, targetPitch, 0.055);
          distance = THREE.MathUtils.lerp(distance, targetDistance, 0.055);

          const cx = sideTarget.x + distance * Math.cos(pitch) * Math.cos(yaw);
          const cy = sideTarget.y + distance * Math.sin(pitch);
          const cz = sideTarget.z + distance * Math.cos(pitch) * Math.sin(yaw);

          camera.position.set(cx, cy, cz);
          camera.lookAt(sideTarget);
        }
      } else {
        // User orbiting: calculate position around rig center
        const cx = sideTarget.x + distance * Math.cos(pitch) * Math.cos(yaw);
        const cy = sideTarget.y + distance * Math.sin(pitch);
        const cz = sideTarget.z + distance * Math.cos(pitch) * Math.sin(yaw);

        camera.position.set(cx, cy, cz);
        camera.lookAt(sideTarget);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 10. Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    resizeObserver.observe(container);

    // 11. Cleanup
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
  }, [isDarkMode]);

  return (
    <div className="w-full relative overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl select-none">
      
      {/* 
        Aspect Ratio Container:
        Mobile view: 16:9 aspect ratio
        Desktop view: 21:9 ultra-wide cinematic aspect ratio
      */}
      <div 
        ref={containerRef} 
        className="w-full aspect-[16/9] sm:aspect-[21/9] relative cursor-grab active:cursor-grabbing touch-none"
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Route Badge Overlay (Top Left) */}
        {(fromCity || toCity) && (
          <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 z-10 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-white/90 dark:bg-zinc-900/85 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-md flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold text-zinc-900 dark:text-white pointer-events-none">
            <span className="p-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Navigation className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            </span>
            <span>{fromCity || 'Origin'}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">➔</span>
            <span>{toCity || 'Destination'}</span>
          </div>
        )}

        {/* Vehicle & LR Badge (Top Right) */}
        {(vehicleNo || lrNo) && (
          <div className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 z-10 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-white/90 dark:bg-zinc-900/85 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-md flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 pointer-events-none">
            {vehicleNo && <span className="text-zinc-900 dark:text-white">{vehicleNo}</span>}
            {lrNo && (
              <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 text-[10px]">
                {lrNo}
              </span>
            )}
          </div>
        )}

        {/* 3D Orbit Helper Pill (Bottom Center) */}
        <div className="absolute bottom-2.5 sm:bottom-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 text-[10px] sm:text-[11px] font-medium text-zinc-600 dark:text-zinc-300 shadow-md flex items-center gap-1.5 pointer-events-none transition-opacity duration-200">
          <Compass className={`w-3.5 h-3.5 ${isInteractingState ? 'text-emerald-500 animate-spin' : 'text-zinc-400'}`} />
          <span className="hidden sm:inline">
            {isInteractingState 
              ? 'Orbiting in 3D... release to return to side profile' 
              : '⇄ Drag to orbit • Pinch to zoom • Auto-returns to side profile'}
          </span>
          <span className="sm:hidden">
            {isInteractingState ? 'Orbiting 3D...' : '⇄ Drag to rotate in 3D'}
          </span>
        </div>
      </div>
    </div>
  );
}
