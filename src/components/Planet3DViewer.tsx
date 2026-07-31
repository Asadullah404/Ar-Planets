import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { TargetInfo } from "@/lib/planetData";

interface Props {
  target: TargetInfo;
  className?: string;
}

export default function Planet3DViewer({ target, className = "h-64 w-full" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene setup
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 3.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0x4466aa, 0.5);
    backLight.position.set(-5, -2, -3);
    scene.add(backLight);

    // Background Particle Starfield
    const starCount = 300;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 20;
      starPositions[i + 1] = (Math.random() - 0.5) * 20;
      starPositions[i + 2] = (Math.random() - 0.5) * 20 - 5;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.04,
      transparent: true,
      opacity: 0.7,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Dynamic Procedural Canvas Texture Generator
    const createProceduralTexture = (targetId: string, category: string): THREE.CanvasTexture => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext("2d")!;

      if (targetId === "sun") {
        const grad = ctx.createLinearGradient(0, 0, 0, 256);
        grad.addColorStop(0, "#ffcc00");
        grad.addColorStop(0.5, "#ff4500");
        grad.addColorStop(1, "#ffaa00");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 256);
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        for (let i = 0; i < 40; i++) {
          ctx.beginPath();
          ctx.arc(Math.random() * 512, Math.random() * 256, Math.random() * 20 + 5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (targetId === "jupiter") {
        ctx.fillStyle = "#d4a373";
        ctx.fillRect(0, 0, 512, 256);
        const bands = ["#bc6c25", "#dda15e", "#fefae0", "#947650", "#c68b59"];
        for (let y = 0; y < 256; y += 12) {
          ctx.fillStyle = bands[(y / 12) % bands.length];
          ctx.fillRect(0, y + (Math.sin(y * 0.1) * 3), 512, 10);
        }
        // Great Red Spot
        ctx.fillStyle = "#b91c1c";
        ctx.beginPath();
        ctx.ellipse(320, 160, 45, 25, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (targetId === "mars") {
        ctx.fillStyle = "#c05621";
        ctx.fillRect(0, 0, 512, 256);
        ctx.fillStyle = "#7b341e";
        for (let i = 0; i < 30; i++) {
          ctx.beginPath();
          ctx.arc(Math.random() * 512, Math.random() * 256, Math.random() * 30 + 10, 0, Math.PI * 2);
          ctx.fill();
        }
        // Polar caps
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 512, 15);
        ctx.fillRect(0, 241, 512, 15);
      } else if (targetId === "saturn") {
        ctx.fillStyle = "#e2d2a4";
        ctx.fillRect(0, 0, 512, 256);
        ctx.fillStyle = "#c4b183";
        for (let y = 0; y < 256; y += 16) {
          ctx.fillRect(0, y, 512, 6);
        }
      } else if (targetId === "neptune" || targetId === "uranus") {
        const color1 = targetId === "neptune" ? "#1e3a8a" : "#38bdf8";
        const color2 = targetId === "neptune" ? "#3b82f6" : "#7dd3fc";
        const grad = ctx.createLinearGradient(0, 0, 512, 256);
        grad.addColorStop(0, color1);
        grad.addColorStop(1, color2);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 256);
      } else if (category === "qibla") {
        ctx.fillStyle = "#111827";
        ctx.fillRect(0, 0, 512, 256);
        ctx.fillStyle = "#fbbf24";
        ctx.fillRect(0, 60, 512, 30);
      } else if (category === "deepspace" || category === "nebula") {
        const grad = ctx.createRadialGradient(256, 128, 10, 256, 128, 200);
        grad.addColorStop(0, "#a855f7");
        grad.addColorStop(0.5, "#3b82f6");
        grad.addColorStop(1, "#030712");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 256);
      } else {
        ctx.fillStyle = "#64748b";
        ctx.fillRect(0, 0, 512, 256);
        ctx.fillStyle = "#475569";
        for (let i = 0; i < 40; i++) {
          ctx.beginPath();
          ctx.arc(Math.random() * 512, Math.random() * 256, Math.random() * 15 + 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      return texture;
    };

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    let mainMesh: THREE.Object3D;

    if (target.id === "kaaba") {
      // Cube mesh for Kaaba
      const boxGeo = new THREE.BoxGeometry(1.4, 1.6, 1.4);
      const texture = createProceduralTexture(target.id, target.category);
      const boxMat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.4,
        metalness: 0.2,
      });
      mainMesh = new THREE.Mesh(boxGeo, boxMat);
      mainGroup.add(mainMesh);
    } else if (target.category === "constellation") {
      // Constellation 3D Star Nodes & Lines
      const constGroup = new THREE.Group();
      const nodeCount = 7;
      const positions: THREE.Vector3[] = [];

      for (let i = 0; i < nodeCount; i++) {
        const pos = new THREE.Vector3(
          (Math.sin(i * 1.2) * 1.1),
          (Math.cos(i * 0.9) * 1.1),
          (Math.sin(i * 2.1) * 0.4)
        );
        positions.push(pos);

        const starSphere = new THREE.Mesh(
          new THREE.SphereGeometry(0.08, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
        );
        starSphere.position.copy(pos);
        const glow = new THREE.Mesh(
          new THREE.SphereGeometry(0.14, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.3 })
        );
        starSphere.add(glow);
        constGroup.add(starSphere);
      }

      // Connecting lines
      const lineGeo = new THREE.BufferGeometry().setFromPoints(positions);
      const lineMat = new THREE.LineBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.8 });
      const lineMesh = new THREE.Line(lineGeo, lineMat);
      constGroup.add(lineMesh);

      mainMesh = constGroup;
      mainGroup.add(mainMesh);
    } else if (target.category === "comet") {
      // Comet nucleus + tail particles
      const cometGroup = new THREE.Group();
      const nucleus = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.5, 2),
        new THREE.MeshStandardMaterial({ color: 0x93c5fd, roughness: 0.8 })
      );
      cometGroup.add(nucleus);

      // Tail particles
      const tailCount = 150;
      const tailGeo = new THREE.BufferGeometry();
      const tailPos = new Float32Array(tailCount * 3);
      for (let i = 0; i < tailCount; i++) {
        const progress = i / tailCount;
        tailPos[i * 3] = -progress * 2.2 + (Math.random() - 0.5) * 0.3 * progress;
        tailPos[i * 3 + 1] = progress * 0.8 + (Math.random() - 0.5) * 0.3 * progress;
        tailPos[i * 3 + 2] = (Math.random() - 0.5) * 0.3 * progress;
      }
      tailGeo.setAttribute("position", new THREE.BufferAttribute(tailPos, 3));
      const tailMat = new THREE.PointsMaterial({ color: 0x60a5fa, size: 0.06, transparent: true, opacity: 0.7 });
      const tailPoints = new THREE.Points(tailGeo, tailMat);
      cometGroup.add(tailPoints);

      mainMesh = cometGroup;
      mainGroup.add(mainMesh);
    } else if (target.category === "satellite") {
      // Satellite 3D model
      const satGroup = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 0.8, 16),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 })
      );
      satGroup.add(body);

      // Solar panels
      const panelGeo = new THREE.BoxGeometry(1.8, 0.05, 0.4);
      const panelMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.9, roughness: 0.1 });
      const panel = new THREE.Mesh(panelGeo, panelMat);
      satGroup.add(panel);

      mainMesh = satGroup;
      mainGroup.add(mainMesh);
    } else {
      // Standard Sphere Planet / Star / Deepspace body
      const radius = target.id === "sun" ? 1.4 : target.id === "jupiter" ? 1.3 : 1.1;
      const sphereGeo = new THREE.SphereGeometry(radius, 64, 64);
      const texture = createProceduralTexture(target.id, target.category);

      const sphereMat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: target.id === "sun" ? 0.1 : 0.6,
        metalness: target.id === "sun" ? 0.0 : 0.1,
        emissive: target.id === "sun" ? new THREE.Color(0xff8800) : new THREE.Color(0x000000),
        emissiveIntensity: target.id === "sun" ? 0.6 : 0,
      });

      mainMesh = new THREE.Mesh(sphereGeo, sphereMat);
      mainGroup.add(mainMesh);

      // Atmosphere Glow Ring
      const atmosMat = new THREE.MeshBasicMaterial({
        color: target.id === "sun" ? 0xffaa00 : target.id === "earth" ? 0x38bdf8 : 0xa855f7,
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide,
      });
      const atmosMesh = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.12, 32, 32), atmosMat);
      mainGroup.add(atmosMesh);

      // Saturn / Uranus Ring
      if (target.id === "saturn" || target.id === "uranus") {
        const ringGeo = new THREE.RingGeometry(radius * 1.3, radius * 2.1, 64);
        const ringMat = new THREE.MeshStandardMaterial({
          color: target.id === "saturn" ? 0xe2d2a4 : 0x7dd3fc,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2.5;
        mainGroup.add(ringMesh);
      }
    }

    // Mouse / Touch Drag Rotation Logic
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      mainGroup.rotation.y += deltaX * 0.01;
      mainGroup.rotation.x += deltaY * 0.01;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    // Resize Observer
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isDragging) {
        mainGroup.rotation.y += 0.005;
      }
      starField.rotation.y -= 0.0005;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      domElement.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [target]);

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-black/40 border border-primary/20 ${className}`}>
      <div ref={containerRef} className="h-full w-full cursor-grab active:cursor-grabbing" />
      <div className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-0.5 font-display text-[9px] text-primary/80 backdrop-blur-sm border border-primary/30">
        🖱️ 3D Interactive WebGL (Drag to rotate)
      </div>
    </div>
  );
}
