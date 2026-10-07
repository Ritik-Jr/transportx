import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Navigation, Compass, Sun, Moon } from 'lucide-react';

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
    
    // Theme-dependent Colors & Atmosphere
    // Light: Clean daytime highway sky
    // Dark: Luminous full-moon twilight / sunset view (visible & not over-dark)
    const skyColor = isDark ? 0x0f172a : 0xf1f5f9;
    const fogColor = isDark ? 0x0f172a : 0xe2e8f0;
    scene.background = new THREE.Color(skyColor);
    scene.fog = new THREE.FogExp2(fogColor, 0.022);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(
      38,
      container.clientWidth / container.clientHeight,
      0.1,
      120
    );

    // Camera Framing (With increased distance as requested to frame the entire long rig)
    // Front view: Dramatic low 3/4 front angle looking at the sloped hood, chrome grille and headlights
    const frontPos = new THREE.Vector3(3.2, 1.8, 10.5);
    const frontTarget = new THREE.Vector3(0, 1.6, 2.5);

    // Sideview: Generous distance framing the full aerodynamic cab + 53ft trailer
    const sidePos = new THREE.Vector3(13.2, 2.2, -1.2);
    const sideTarget = new THREE.Vector3(0, 1.6, -1.2);

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

    // 4. Lighting Setup (Carefully balanced for day and twilight/moonlight)
    if (!isDark) {
      // Day Theme: Crisp golden sunlight & clear sky ambient
      const dayAmbient = new THREE.AmbientLight(0xe2e8f0, 1.3);
      scene.add(dayAmbient);

      const sunLight = new THREE.DirectionalLight(0xfffbeb, 2.4);
      sunLight.position.set(12, 18, 8);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 1024;
      sunLight.shadow.mapSize.height = 1024;
      sunLight.shadow.bias = -0.0004;
      scene.add(sunLight);

      const skyFill = new THREE.DirectionalLight(0xbae6fd, 0.8);
      skyFill.position.set(-10, 8, -6);
      scene.add(skyFill);
    } else {
      // Dark Theme: Sunset twilight / luminous whole moon light (NOT over dark!)
      const nightAmbient = new THREE.AmbientLight(0x334155, 1.4);
      scene.add(nightAmbient);

      // Luminous moon & sunset horizon key light
      const moonLight = new THREE.DirectionalLight(0x93c5fd, 2.1);
      moonLight.position.set(10, 15, 7);
      moonLight.castShadow = true;
      moonLight.shadow.mapSize.width = 1024;
      moonLight.shadow.mapSize.height = 1024;
      moonLight.shadow.bias = -0.0004;
      scene.add(moonLight);

      // Warm sunset horizon rim light
      const sunsetRim = new THREE.DirectionalLight(0xf59e0b, 0.7);
      sunsetRim.position.set(-12, 5, -8);
      scene.add(sunsetRim);
    }

    // 5. Build Detailed Conventional Semi-Truck & Trailer (Matching Reference Image)
    const truckRig = new THREE.Group();
    scene.add(truckRig);

    // Shared High-Detail Materials
    // Body Paint: Crisp pure white / silver-white with high clearcoat (as in user reference photo)
    const truckBodyMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.25,
      roughness: 0.22
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
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.05,
      transparent: true,
      opacity: 0.88
    });

    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.94,
      metalness: 0.08
    });

    const wheelRimMat = new THREE.MeshStandardMaterial({
      color: 0xe4e4e7,
      metalness: 0.9,
      roughness: 0.18
    });

    const amberLightMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 2.5
    });

    const headlightMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfef08a,
      emissiveIntensity: isDark ? 3.5 : 2.0
    });

    const taillightMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: isDark ? 3.0 : 1.8
    });

    // -------------------------------------------------------------
    // 5A. TRACTOR UNIT (Conventional Aerodynamic Sleeper Cab)
    // -------------------------------------------------------------
    const tractorGroup = new THREE.Group();
    tractorGroup.position.set(0, 0, 1.4);
    truckRig.add(tractorGroup);

    // 5A.1 Chassis Steel Beams
    const chassisBeams = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.22, 5.0), darkTrimMat);
    chassisBeams.position.set(0, 0.65, 0.3);
    chassisBeams.castShadow = true;
    tractorGroup.add(chassisBeams);

    // Fifth Wheel Coupling Plate (connects to trailer kingpin)
    const fifthWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.08, 16), darkTrimMat);
    fifthWheel.position.set(0, 0.85, -0.9);
    tractorGroup.add(fifthWheel);

    // 5A.2 Aerodynamic Hood (Sloped front hood with curved fenders)
    const hoodGroup = new THREE.Group();
    hoodGroup.position.set(0, 1.15, 2.3);
    tractorGroup.add(hoodGroup);

    // Main hood box with slope
    const hoodMain = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.85, 1.7), truckBodyMat);
    hoodMain.position.set(0, 0, 0);
    hoodMain.castShadow = true;
    hoodGroup.add(hoodMain);

    // Sloped hood nose taper
    const hoodNose = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.65, 0.6), truckBodyMat);
    hoodNose.position.set(0, -0.1, 0.95);
    hoodNose.rotation.x = 0.18;
    hoodNose.castShadow = true;
    hoodGroup.add(hoodNose);

    // Large Chrome Vertical Grille (Rounded top as in reference)
    const grille = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.88, 0.08), chromeMat);
    grille.position.set(0, 0.05, 1.26);
    hoodGroup.add(grille);

    // Grille vertical slats
    for (let x = -0.42; x <= 0.42; x += 0.12) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.82, 0.1), darkTrimMat);
      slat.position.set(x, 0.05, 1.27);
      hoodGroup.add(slat);
    }

    // Front Bumper (Integrated aerodynamic bumper)
    const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.36, 0.35), truckBodyMat);
    frontBumper.position.set(0, -0.42, 1.25);
    frontBumper.castShadow = true;
    hoodGroup.add(frontBumper);

    // Aerodynamic Headlight Pods
    const leftHeadlight = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.16, 0.1), headlightMat);
    leftHeadlight.position.set(-0.75, -0.36, 1.4);
    hoodGroup.add(leftHeadlight);

    const rightHeadlight = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.16, 0.1), headlightMat);
    rightHeadlight.position.set(0.75, -0.36, 1.4);
    hoodGroup.add(rightHeadlight);

    // Real Headlight Spotlights
    const spotL = new THREE.SpotLight(0xfef08a, isDark ? 4.8 : 2.5, 24, Math.PI / 5, 0.4, 1.2);
    spotL.position.set(-0.75, 0.8, 4.0);
    spotL.target.position.set(-0.75, 0, 16);
    scene.add(spotL);
    scene.add(spotL.target);

    const spotR = new THREE.SpotLight(0xfef08a, isDark ? 4.8 : 2.5, 24, Math.PI / 5, 0.4, 1.2);
    spotR.position.set(0.75, 0.8, 4.0);
    spotR.target.position.set(0.75, 0, 16);
    scene.add(spotR);
    scene.add(spotR.target);

    // 5A.3 High-Roof Sleeper Cabin
    const cabGroup = new THREE.Group();
    cabGroup.position.set(0, 1.7, 0.7);
    tractorGroup.add(cabGroup);

    // Main Sleeper Compartment Box
    const sleeperBox = new THREE.Mesh(new THREE.BoxGeometry(2.05, 1.75, 1.9), truckBodyMat);
    sleeperBox.position.set(0, 0, 0);
    sleeperBox.castShadow = true;
    cabGroup.add(sleeperBox);

    // Aerodynamic Curved High-Roof Cap
    const roofCap = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.75, 1.7), truckBodyMat);
    roofCap.position.set(0, 1.15, -0.1);
    roofCap.rotation.x = -0.15;
    roofCap.castShadow = true;
    cabGroup.add(roofCap);

    // Roof Top Air Deflector Scoop
    const roofScoop = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.35, 1.1), truckBodyMat);
    roofScoop.position.set(0, 1.55, -0.3);
    roofScoop.rotation.x = -0.22;
    cabGroup.add(roofScoop);

    // Sloped Panoramic Windshield
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.72, 0.08), tintedGlassMat);
    windshield.position.set(0, 0.35, 0.95);
    windshield.rotation.x = -0.18;
    cabGroup.add(windshield);

    // Windshield Sun Visor
    const sunVisor = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.12, 0.22), truckBodyMat);
    sunVisor.position.set(0, 0.75, 0.95);
    sunVisor.rotation.x = 0.2;
    cabGroup.add(sunVisor);

    // Amber Roof Clearance Marker Lights (5 small lights across cab brow)
    for (let x = -0.6; x <= 0.6; x += 0.3) {
      const marker = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.06), amberLightMat);
      marker.position.set(x, 0.85, 0.92);
      cabGroup.add(marker);
    }

    // Driver & Passenger Side Door Windows
    const leftDoorWin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.52, 0.75), tintedGlassMat);
    leftDoorWin.position.set(-1.03, 0.35, 0.45);
    cabGroup.add(leftDoorWin);

    const rightDoorWin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.52, 0.75), tintedGlassMat);
    rightDoorWin.position.set(1.03, 0.35, 0.45);
    cabGroup.add(rightDoorWin);

    // Sleeper Side Windows (as in user reference image)
    const leftSleeperWin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.32, 0.28), tintedGlassMat);
    leftSleeperWin.position.set(-1.03, 0.35, -0.35);
    cabGroup.add(leftSleeperWin);

    const rightSleeperWin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.32, 0.28), tintedGlassMat);
    rightSleeperWin.position.set(1.03, 0.35, -0.35);
    cabGroup.add(rightSleeperWin);

    // Dual Chrome Side Mirrors with spotter glasses
    const mirrorStem = new THREE.BoxGeometry(0.04, 0.04, 0.28);
    const mirrorBody = new THREE.BoxGeometry(0.08, 0.42, 0.18);

    const leftStem = new THREE.Mesh(mirrorStem, darkTrimMat);
    leftStem.position.set(-1.15, 0.35, 0.85);
    cabGroup.add(leftStem);
    const leftMirror = new THREE.Mesh(mirrorBody, chromeMat);
    leftMirror.position.set(-1.28, 0.35, 0.95);
    cabGroup.add(leftMirror);

    const rightStem = new THREE.Mesh(mirrorStem, darkTrimMat);
    rightStem.position.set(1.15, 0.35, 0.85);
    cabGroup.add(rightStem);
    const rightMirror = new THREE.Mesh(mirrorBody, chromeMat);
    rightMirror.position.set(1.28, 0.35, 0.95);
    cabGroup.add(rightMirror);

    // Cab Rear Side Extenders (Aero fairings that close the gap to trailer)
    const leftExtender = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.7, 0.35), darkTrimMat);
    leftExtender.position.set(-1.01, 0, -1.05);
    cabGroup.add(leftExtender);

    const rightExtender = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.7, 0.35), darkTrimMat);
    rightExtender.position.set(1.01, 0, -1.05);
    cabGroup.add(rightExtender);

    // 5A.4 Chassis Aerodynamic Side Skirts
    const leftSkirt = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.52, 2.2), truckBodyMat);
    leftSkirt.position.set(-1.02, 0.52, 0.85);
    leftSkirt.castShadow = true;
    tractorGroup.add(leftSkirt);

    const rightSkirt = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.52, 2.2), truckBodyMat);
    rightSkirt.position.set(1.02, 0.52, 0.85);
    rightSkirt.castShadow = true;
    tractorGroup.add(rightSkirt);

    // Tandem Drive Quarter Fenders over rear tractor wheels
    const leftFender = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 1.8), darkTrimMat);
    leftFender.position.set(-1.05, 0.95, -1.0);
    tractorGroup.add(leftFender);

    const rightFender = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 1.8), darkTrimMat);
    rightFender.position.set(1.05, 0.95, -1.0);
    tractorGroup.add(rightFender);

    // -------------------------------------------------------------
    // 5B. SEMI-TRAILER UNIT (53-Foot Long Box Trailer)
    // -------------------------------------------------------------
    const trailerGroup = new THREE.Group();
    trailerGroup.position.set(0, 0, -2.4);
    truckRig.add(trailerGroup);

    // Main White Box Body (Length 8.4m, Width 2.3m, Height 2.7m - authentic proportions!)
    const trailerBox = new THREE.Mesh(new THREE.BoxGeometry(2.32, 2.7, 8.4), truckBodyMat);
    trailerBox.position.set(0, 2.25, -2.0);
    trailerBox.castShadow = true;
    trailerGroup.add(trailerBox);

    // Top and Bottom Aluminum Extrusion Rails along the trailer
    const railGeo = new THREE.BoxGeometry(0.06, 0.12, 8.42);
    const topRailL = new THREE.Mesh(railGeo, chromeMat);
    topRailL.position.set(-1.17, 3.55, -2.0);
    trailerGroup.add(topRailL);
    const topRailR = new THREE.Mesh(railGeo, chromeMat);
    topRailR.position.set(1.17, 3.55, -2.0);
    trailerGroup.add(topRailR);

    const bottomRailL = new THREE.Mesh(railGeo, chromeMat);
    bottomRailL.position.set(-1.17, 0.95, -2.0);
    trailerGroup.add(bottomRailL);
    const bottomRailR = new THREE.Mesh(railGeo, chromeMat);
    bottomRailR.position.set(1.17, 0.95, -2.0);
    trailerGroup.add(bottomRailR);

    // Trailer Landing Gear (support legs halfway along trailer)
    const legGeo = new THREE.BoxGeometry(0.12, 0.85, 0.12);
    const leftLeg = new THREE.Mesh(legGeo, darkTrimMat);
    leftLeg.position.set(-0.85, 0.5, 0.6);
    trailerGroup.add(leftLeg);
    const rightLeg = new THREE.Mesh(legGeo, darkTrimMat);
    rightLeg.position.set(0.85, 0.5, 0.6);
    trailerGroup.add(rightLeg);

    // Landing gear foot pads
    const footGeo = new THREE.BoxGeometry(0.3, 0.08, 0.3);
    const leftFoot = new THREE.Mesh(footGeo, darkTrimMat);
    leftFoot.position.set(-0.85, 0.12, 0.6);
    trailerGroup.add(leftFoot);
    const rightFoot = new THREE.Mesh(footGeo, darkTrimMat);
    rightFoot.position.set(0.85, 0.12, 0.6);
    trailerGroup.add(rightFoot);

    // Side Underrun Protection Guard Rail
    const guardRailGeo = new THREE.BoxGeometry(0.06, 0.25, 2.8);
    const leftGuard = new THREE.Mesh(guardRailGeo, chromeMat);
    leftGuard.position.set(-1.12, 0.55, -1.2);
    trailerGroup.add(leftGuard);
    const rightGuard = new THREE.Mesh(guardRailGeo, chromeMat);
    rightGuard.position.set(1.12, 0.55, -1.2);
    trailerGroup.add(rightGuard);

    // Rear Double Doors with Locking Bars (as in rear view of reference image)
    const doorLockBarGeo = new THREE.CylinderGeometry(0.025, 0.025, 2.5, 8);
    const leftDoorBar1 = new THREE.Mesh(doorLockBarGeo, chromeMat);
    leftDoorBar1.position.set(-0.6, 2.25, -6.22);
    trailerGroup.add(leftDoorBar1);

    const leftDoorBar2 = new THREE.Mesh(doorLockBarGeo, chromeMat);
    leftDoorBar2.position.set(-0.15, 2.25, -6.22);
    trailerGroup.add(leftDoorBar2);

    const rightDoorBar1 = new THREE.Mesh(doorLockBarGeo, chromeMat);
    rightDoorBar1.position.set(0.15, 2.25, -6.22);
    trailerGroup.add(rightDoorBar1);

    const rightDoorBar2 = new THREE.Mesh(doorLockBarGeo, chromeMat);
    rightDoorBar2.position.set(0.6, 2.25, -6.22);
    trailerGroup.add(rightDoorBar2);

    // Rear DOT Underrun Bumper with safety stripes
    const rearBumper = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.25, 0.12), darkTrimMat);
    rearBumper.position.set(0, 0.42, -6.22);
    trailerGroup.add(rearBumper);

    // Rear Tail / Brake Lights
    const rearLightL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.1, 0.06), taillightMat);
    rearLightL.position.set(-0.85, 0.72, -6.22);
    trailerGroup.add(rearLightL);

    const rearLightR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.1, 0.06), taillightMat);
    rearLightR.position.set(0.85, 0.72, -6.22);
    trailerGroup.add(rearLightR);

    // -------------------------------------------------------------
    // 5C. ROTATING WHEELS (12 Wheels Total, Matching Reference)
    // -------------------------------------------------------------
    // Reference image shows:
    // Tractor: 1 Steer Axle + 2 Drive Tandem Axles
    // Trailer: 3 Rear Axles (Tri-Axle Trailer!)
    const allWheels = [];
    const wheelRadius = 0.48;
    const wheelWidth = 0.28;

    const tireGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 24);
    tireGeo.rotateZ(Math.PI / 2);

    const rimGeo = new THREE.CylinderGeometry(wheelRadius * 0.65, wheelRadius * 0.65, wheelWidth + 0.02, 16);
    rimGeo.rotateZ(Math.PI / 2);

    const hubGeo = new THREE.CylinderGeometry(wheelRadius * 0.25, wheelRadius * 0.25, wheelWidth + 0.04, 12);
    hubGeo.rotateZ(Math.PI / 2);

    function addWheel(parent, x, y, z) {
      const wGroup = new THREE.Group();
      wGroup.position.set(x, y, z);

      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.castShadow = true;
      wGroup.add(tire);

      const rim = new THREE.Mesh(rimGeo, wheelRimMat);
      wGroup.add(rim);

      const hub = new THREE.Mesh(hubGeo, chromeMat);
      wGroup.add(hub);

      parent.add(wGroup);
      allWheels.push(wGroup);
    }

    // Tractor Steer Axle (Single wheels)
    addWheel(tractorGroup, -1.06, wheelRadius, 2.3);
    addWheel(tractorGroup, 1.06, wheelRadius, 2.3);

    // Tractor Tandem Drive Axles (Dual wheels on left and right)
    addWheel(tractorGroup, -1.06, wheelRadius, -0.4);
    addWheel(tractorGroup, 1.06, wheelRadius, -0.4);
    addWheel(tractorGroup, -1.06, wheelRadius, -1.55);
    addWheel(tractorGroup, 1.06, wheelRadius, -1.55);

    // Trailer Tri-Axle Bogie (3 Axles at rear of trailer!)
    addWheel(trailerGroup, -1.08, wheelRadius, -3.7);
    addWheel(trailerGroup, 1.08, wheelRadius, -3.7);
    addWheel(trailerGroup, -1.08, wheelRadius, -4.8);
    addWheel(trailerGroup, 1.08, wheelRadius, -4.8);
    addWheel(trailerGroup, -1.08, wheelRadius, -5.9);
    addWheel(trailerGroup, 1.08, wheelRadius, -5.9);

    // -------------------------------------------------------------
    // 6. REALISTIC HIGHWAY ROAD (Moving Backwards to Create Speed)
    // -------------------------------------------------------------
    const roadGroup = new THREE.Group();
    scene.add(roadGroup);

    // Asphalt Highway Surface
    const asphaltMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x18181b : 0x27272a,
      roughness: 0.94,
      metalness: 0.06
    });
    const asphaltPlane = new THREE.Mesh(new THREE.PlaneGeometry(24, 100), asphaltMat);
    asphaltPlane.rotation.x = -Math.PI / 2;
    asphaltPlane.position.set(0, 0, -2.0);
    asphaltPlane.receiveShadow = true;
    roadGroup.add(asphaltPlane);

    // Highway Shoulder Lines (Left & Right boundary markers)
    const whiteLineMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    const shoulderL = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 100), whiteLineMat);
    shoulderL.rotation.x = -Math.PI / 2;
    shoulderL.position.set(-4.5, 0.005, -2.0);
    roadGroup.add(shoulderL);

    const shoulderR = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 100), whiteLineMat);
    shoulderR.rotation.x = -Math.PI / 2;
    shoulderR.position.set(4.5, 0.005, -2.0);
    roadGroup.add(shoulderR);

    // Center Yellow Dashed Divider Stripes (Moving backward)
    const yellowStripeMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const dashGeometry = new THREE.PlaneGeometry(0.24, 3.8);
    dashGeometry.rotateX(-Math.PI / 2);

    const roadDashes = [];
    for (let z = -50; z <= 40; z += 7.5) {
      const dash = new THREE.Mesh(dashGeometry, yellowStripeMat);
      dash.position.set(0, 0.006, z);
      roadGroup.add(dash);
      roadDashes.push(dash);
    }

    // -------------------------------------------------------------
    // 7. WIND / SPEED STREAKS (Slight air streaks flowing backward)
    // -------------------------------------------------------------
    const windStreaks = [];
    const windMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x93c5fd : 0x0284c7,
      transparent: true,
      opacity: isDark ? 0.35 : 0.22
    });
    const windGeo = new THREE.CylinderGeometry(0.015, 0.015, 3.2, 4);
    windGeo.rotateX(Math.PI / 2);

    for (let i = 0; i < 32; i++) {
      const streak = new THREE.Mesh(windGeo, windMat);
      streak.position.set(
        (Math.random() - 0.5) * 8.5,
        0.5 + Math.random() * 3.6,
        (Math.random() - 0.5) * 35
      );
      streak.speed = 26 + Math.random() * 18;
      scene.add(streak);
      windStreaks.push(streak);
    }

    // -------------------------------------------------------------
    // 8. CAMERA CHOREOGRAPHY & INTERACTIVE ORBIT CONTROLS
    // -------------------------------------------------------------
    let startTime = performance.now();
    let isInteracting = false;
    let yaw = 0;
    let pitch = 0.18;
    let distance = 13.2;

    const targetYaw = 0;
    const targetPitch = 0.16;
    const targetDistance = 13.2;

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

      yaw += deltaX * 0.007;
      pitch = Math.max(-0.25, Math.min(1.0, pitch + deltaY * 0.005));
    };

    const onTouchMove = (e) => {
      if (isPinching && e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDist = Math.hypot(dx, dy);
        if (pinchStartDist > 0) {
          const ratio = pinchStartDist / currentDist;
          distance = Math.max(7.5, Math.min(22.0, distance * ratio));
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
      distance = Math.max(7.5, Math.min(22.0, distance + e.deltaY * 0.008));
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
    const cruiseSpeed = 16.0; // Units per second forward
    let prevTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const now = performance.now();
      const dt = Math.min(0.08, (now - prevTime) / 1000);
      prevTime = now;
      const elapsed = (now - startTime) / 1000;

      // 9a. Subtle Truck Suspension Sway & Engine Vibration
      truckRig.position.y = Math.sin(elapsed * 16) * 0.015;
      truckRig.rotation.z = Math.sin(elapsed * 7) * 0.003;

      // 9b. Rotate All 12 Wheels proportional to road speed
      const wheelAngularSpeed = cruiseSpeed / wheelRadius;
      allWheels.forEach((w) => {
        w.rotation.x += wheelAngularSpeed * dt;
      });

      // 9c. Stream Road Stripes Backward
      roadDashes.forEach((dash) => {
        dash.position.z -= cruiseSpeed * dt;
        if (dash.position.z < -45) {
          dash.position.z += 90;
        }
      });

      // 9d. Stream Wind Streaks Backward
      windStreaks.forEach((streak) => {
        streak.position.z -= streak.speed * dt;
        if (streak.position.z < -26) {
          streak.position.z = 26 + Math.random() * 8;
          streak.position.y = 0.5 + Math.random() * 3.6;
          streak.position.x = (Math.random() - 0.5) * 8.5;
        }
      });

      // 9e. Camera Cinematic Choreography:
      // Starts from the front rolling around to the full sideview profile by ~2.8s
      // Then stays in the sideview profile. On user interaction / release, springs back to sideview.
      if (!isInteracting) {
        if (elapsed < 2.8) {
          // Front to Sideview smooth arc transition
          const progress = Math.min(1, elapsed / 2.8);
          // Cubic ease-in-out
          const t = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;

          camera.position.lerpVectors(frontPos, sidePos, t);
          const currentTarget = new THREE.Vector3().lerpVectors(frontTarget, sideTarget, t);
          camera.lookAt(currentTarget);

          // Keep user variables in sync
          yaw = 0;
          pitch = THREE.MathUtils.lerp(0.22, targetPitch, t);
          distance = THREE.MathUtils.lerp(10.5, targetDistance, t);
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
