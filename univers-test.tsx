import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDownIcon, SparklesIcon } from "lucide-react";

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  speed: number;
  opacity: number;
  angle: number;
  distance: number;
}

interface MousePosition {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
}

interface Node {
  x: number;
  y: number;
  z: number;
  pulse: number;
  angle: number;
  radius: number;
}

export function UniverseIntro() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const mousePos = useRef<MousePosition>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });
  const progressRef = useRef(0); // Ref for latest scrollProgress without restarting animation

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const containerHeight = containerRef.current.offsetHeight;
      const viewportHeight = window.innerHeight;

      const scrollableHeight = containerHeight - viewportHeight;
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / scrollableHeight));

      setScrollProgress(progress);

      if (progress >= 0.95) {
        setIsComplete(true);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      mousePos.current.targetX = ((e.clientX - centerX) / centerX) * 1.5;
      mousePos.current.targetY = ((e.clientY - centerY) / centerY) * 1.5;
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Update ref with latest scrollProgress (runs on every change, but doesn't affect animation loop)
  useEffect(() => {
    progressRef.current = scrollProgress;
  }, [scrollProgress]);

  // Animation setup (runs only once on mount)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // 3D Star field with depth
    const stars: Star[] = [];
    for (let i = 0; i < 500; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 1000;
      stars.push({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        z: Math.random() * 2000 - 1000,
        size: Math.random() * 2.5 + 0.5,
        speed: Math.random() * 0.3 + 0.1,
        opacity: Math.random() * 0.7 + 0.3,
        angle,
        distance,
      });
    }

    // 3D People nodes in sphere formation
    const nodes: Node[] = [];
    for (let i = 0; i < 50; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 300 + Math.random() * 100;
      nodes.push({
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi),
        pulse: Math.random() * Math.PI * 2,
        angle: theta,
        radius,
      });
    }

    let animationFrame: number;
    let time = 0;

    const animate = () => {
      time += 0.008; // Slower animation

      // Smooth mouse position interpolation with faster response
      mousePos.current.x +=
        (mousePos.current.targetX - mousePos.current.x) * 0.08;
      mousePos.current.y +=
        (mousePos.current.targetY - mousePos.current.y) * 0.08;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const currentProgress = progressRef.current; // Use latest from ref

      // Phase 1: Universe with 3D rotating stars (0 - 0.25)
      if (currentProgress < 0.25) {
        const phase1Progress = currentProgress / 0.25;
        const rotationSpeed = time * 0.3; // Slower rotation

        // Apply 3D mouse parallax effect with increased range
        const mouseOffsetX = mousePos.current.x * 100;
        const mouseOffsetY = mousePos.current.y * 100;

        // Draw 3D stars with perspective and rotation
        const sortedStars = [...stars].sort((a, b) => b.z - a.z);
        sortedStars.forEach((star) => {
          // Rotate stars in 3D space
          const rotatedX =
            star.x * Math.cos(rotationSpeed) - star.z * Math.sin(rotationSpeed);
          const rotatedZ =
            star.x * Math.sin(rotationSpeed) + star.z * Math.cos(rotationSpeed);

          // Apply perspective projection with enhanced mouse parallax
          const perspective = 1000;
          const scale = perspective / (perspective + rotatedZ);
          const parallaxFactor = (rotatedZ + 1000) / 2000; // Depth-based parallax
          // Closer stars move more, distant stars move less (enhanced 3D effect)
          const depthMultiplier = 0.3 + parallaxFactor * 1.4;
          const screenX =
            centerX +
            rotatedX * scale +
            mouseOffsetX * parallaxFactor * depthMultiplier;
          const screenY =
            centerY +
            star.y * scale +
            mouseOffsetY * parallaxFactor * depthMultiplier;

          // Only draw stars in front of camera
          if (rotatedZ > -perspective && scale > 0) {
            const twinkle = Math.sin(time * 3 + star.angle * 10) * 0.3 + 0.7;
            const depth = (rotatedZ + 1000) / 2000; // 0 to 1, closer = brighter
            const brightness =
              star.opacity * twinkle * depth * (1 - phase1Progress * 0.3);

            // Draw star glow
            const glowSize = star.size * scale * 4;
            const glowGradient = ctx.createRadialGradient(
              screenX,
              screenY,
              0,
              screenX,
              screenY,
              glowSize
            );
            glowGradient.addColorStop(
              0,
              `rgba(255, 255, 255, ${brightness * 0.8})`
            );
            glowGradient.addColorStop(
              0.5,
              `rgba(200, 220, 255, ${brightness * 0.3})`
            );
            glowGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(screenX, screenY, glowSize, 0, Math.PI * 2);
            ctx.fill();

            // Draw star core
            ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
            ctx.beginPath();
            ctx.arc(screenX, screenY, star.size * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // Animated nebula clouds with movement - Blue/Cyan with subtle purple haze
        const nebulaOffset1 = Math.sin(time * 0.3) * 100;
        const nebulaOffset2 = Math.cos(time * 0.4) * 80;

        // Main blue/cyan nebula
        const gradient1 = ctx.createRadialGradient(
          centerX + nebulaOffset1,
          centerY - 100,
          0,
          centerX + nebulaOffset1,
          centerY - 100,
          canvas.width * 0.6
        );
        gradient1.addColorStop(
          0,
          `rgba(59, 130, 246, ${0.35 * (1 - phase1Progress * 0.5)})`
        );
        gradient1.addColorStop(
          0.3,
          `rgba(14, 165, 233, ${0.25 * (1 - phase1Progress * 0.5)})`
        );
        gradient1.addColorStop(
          0.7,
          `rgba(6, 182, 212, ${0.15 * (1 - phase1Progress * 0.5)})`
        );
        gradient1.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = gradient1;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const gradient2 = ctx.createRadialGradient(
          centerX - nebulaOffset2,
          centerY + 150,
          0,
          centerX - nebulaOffset2,
          centerY + 150,
          canvas.width * 0.5
        );
        gradient2.addColorStop(
          0,
          `rgba(56, 189, 248, ${0.25 * (1 - phase1Progress * 0.5)})`
        );
        gradient2.addColorStop(
          0.5,
          `rgba(14, 165, 233, ${0.18 * (1 - phase1Progress * 0.5)})`
        );
        gradient2.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = gradient2;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Subtle purple haze circle (left side)
        const purpleHaze = ctx.createRadialGradient(
          centerX - 250,
          centerY - 50,
          0,
          centerX - 250,
          centerY - 50,
          canvas.width * 0.35
        );
        purpleHaze.addColorStop(
          0,
          `rgba(147, 51, 234, ${0.25 * (1 - phase1Progress * 0.5)})`
        );
        purpleHaze.addColorStop(
          0.4,
          `rgba(126, 34, 206, ${0.15 * (1 - phase1Progress * 0.5)})`
        );
        purpleHaze.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = purpleHaze;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Phase 2: Black Hole Warp to Earth (0.25 - 0.5)
      if (currentProgress >= 0.25 && currentProgress < 0.5) {
        const phase2Progress = (currentProgress - 0.25) / 0.25;
        const warpIntensity = Math.pow(phase2Progress, 1.5);

        // Black hole effect - warp stars into spiral
        const sortedStars = [...stars].sort((a, b) => b.z - a.z);
        sortedStars.forEach((star) => {
          const rotationSpeed = time * 0.5;
          const rotatedX =
            star.x * Math.cos(rotationSpeed) - star.z * Math.sin(rotationSpeed);
          const rotatedZ =
            star.x * Math.sin(rotationSpeed) + star.z * Math.cos(rotationSpeed);

          const perspective = 1000;
          const scale = perspective / (perspective + rotatedZ);
          let screenX = centerX + rotatedX * scale;
          let screenY = centerY + star.y * scale;

          // Apply black hole warp effect
          const dx = screenX - centerX;
          const dy = screenY - centerY;
          const distFromCenter = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);

          // Spiral warp
          const warpAngle =
            angle + warpIntensity * 3 * (1 - distFromCenter / canvas.width);
          const warpDist = distFromCenter * (1 - warpIntensity * 0.7);

          screenX = centerX + Math.cos(warpAngle) * warpDist;
          screenY = centerY + Math.sin(warpAngle) * warpDist;

          if (rotatedZ > -perspective && scale > 0 && warpDist > 20) {
            const brightness = star.opacity * (1 - warpIntensity) * 0.5;

            // Motion blur trail
            ctx.strokeStyle = `rgba(255, 255, 255, ${brightness * 0.3})`;
            ctx.lineWidth = star.size * scale * 0.5;
            ctx.beginPath();
            const trailLength = warpIntensity * 30;
            const trailAngle = warpAngle + Math.PI;
            ctx.moveTo(screenX, screenY);
            ctx.lineTo(
              screenX + Math.cos(trailAngle) * trailLength,
              screenY + Math.sin(trailAngle) * trailLength
            );
            ctx.stroke();

            // Star core
            ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
            ctx.beginPath();
            ctx.arc(screenX, screenY, star.size * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // Black hole center with event horizon
        const blackHoleSize = 30 + warpIntensity * 150;
        const blackHoleGradient = ctx.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          blackHoleSize * 3
        );
        blackHoleGradient.addColorStop(0, `rgba(0, 0, 0, ${warpIntensity})`);
        blackHoleGradient.addColorStop(
          0.3,
          `rgba(59, 130, 246, ${warpIntensity * 0.6})`
        );
        blackHoleGradient.addColorStop(
          0.6,
          `rgba(14, 165, 233, ${warpIntensity * 0.3})`
        );
        blackHoleGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = blackHoleGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, blackHoleSize * 3, 0, Math.PI * 2);
        ctx.fill();

        // Accretion disk rings - Blue/Cyan tones
        for (let i = 0; i < 5; i++) {
          const ringRadius = blackHoleSize * (1.5 + i * 0.4);
          const ringRotation = time * (2 + i * 0.5) + (i * Math.PI) / 3;
          ctx.strokeStyle = `rgba(56, 189, 248, ${warpIntensity * (0.6 - i * 0.1)})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.ellipse(
            centerX,
            centerY,
            ringRadius,
            ringRadius * 0.3,
            ringRotation,
            0,
            Math.PI * 2
          );
          ctx.stroke();
        }

        // Earth emerging from black hole
        if (phase2Progress > 0.4) {
          const earthProgress = (phase2Progress - 0.4) / 0.6;
          const earthRadius = 80 + earthProgress * 220;

          // Earth with more realistic and distinguishable gradient
          const earthGradient = ctx.createRadialGradient(
            centerX - earthRadius * 0.3,
            centerY - earthRadius * 0.3,
            0,
            centerX,
            centerY,
            earthRadius
          );
          // Bright blue oceans
          earthGradient.addColorStop(
            0,
            `rgba(135, 206, 250, ${earthProgress})`
          );
          earthGradient.addColorStop(
            0.2,
            `rgba(70, 130, 180, ${earthProgress * 0.95})`
          );
          // Green continents
          earthGradient.addColorStop(
            0.4,
            `rgba(34, 139, 34, ${earthProgress * 0.9})`
          );
          earthGradient.addColorStop(
            0.6,
            `rgba(46, 125, 50, ${earthProgress * 0.8})`
          );
          // Darker edges
          earthGradient.addColorStop(
            0.8,
            `rgba(25, 77, 51, ${earthProgress * 0.6})`
          );
          earthGradient.addColorStop(
            1,
            `rgba(15, 52, 35, ${earthProgress * 0.4})`
          );

          ctx.fillStyle = earthGradient;
          ctx.beginPath();
          ctx.arc(centerX, centerY, earthRadius, 0, Math.PI * 2);
          ctx.fill();

          // Atmospheric glow with multiple layers
          for (let i = 0; i < 5; i++) {
            const glowRadius = earthRadius + 10 + i * 8;
            ctx.strokeStyle = `rgba(100, 180, 255, ${earthProgress * (0.4 - i * 0.07)})`;
            ctx.lineWidth = 3 - i * 0.4;
            ctx.beginPath();
            ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
            ctx.stroke();
          }

          // Cloud patterns with more detail
          const cloudCount = 12;
          for (let i = 0; i < cloudCount; i++) {
            const cloudAngle = (i / cloudCount) * Math.PI * 2 + time * 0.5;
            const cloudDist = earthRadius * (0.4 + (i % 3) * 0.15);
            const cloudX = centerX + Math.cos(cloudAngle) * cloudDist;
            const cloudY = centerY + Math.sin(cloudAngle) * cloudDist;
            const cloudSize = earthRadius * (0.1 + (i % 2) * 0.05);

            // Cloud with soft gradient
            const cloudGradient = ctx.createRadialGradient(
              cloudX,
              cloudY,
              0,
              cloudX,
              cloudY,
              cloudSize
            );
            cloudGradient.addColorStop(
              0,
              `rgba(255, 255, 255, ${earthProgress * 0.5})`
            );
            cloudGradient.addColorStop(
              0.5,
              `rgba(255, 255, 255, ${earthProgress * 0.3})`
            );
            cloudGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
            ctx.fillStyle = cloudGradient;
            ctx.beginPath();
            ctx.arc(cloudX, cloudY, cloudSize, 0, Math.PI * 2);
            ctx.fill();
          }

          // Add visible continents as darker green patches
          const continentCount = 5;
          for (let i = 0; i < continentCount; i++) {
            const contAngle = (i / continentCount) * Math.PI * 2 + Math.PI / 4;
            const contDist = earthRadius * 0.5;
            const contX = centerX + Math.cos(contAngle) * contDist;
            const contY = centerY + Math.sin(contAngle) * contDist;
            const contSize = earthRadius * 0.2;

            ctx.fillStyle = `rgba(34, 139, 34, ${earthProgress * 0.6})`;
            ctx.beginPath();
            ctx.arc(contX, contY, contSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Phase 3: 3D Rotating Sphere of AI-Empowered People (0.5 - 0.75)
      if (currentProgress >= 0.5 && currentProgress < 0.75) {
        const phase3Progress = (currentProgress - 0.5) / 0.25;
        // Add mouse-controlled rotation for interactive 3D feel
        const baseRotationY = time * 0.8;
        const baseRotationX = Math.sin(time * 0.3) * 0.3;
        const rotationY = baseRotationY + mousePos.current.x * 0.5;
        const rotationX = baseRotationX + mousePos.current.y * 0.5;

        // Earth fading in background
        const earthGradient = ctx.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          500
        );
        earthGradient.addColorStop(
          0,
          `rgba(59, 130, 246, ${0.3 * (1 - phase3Progress * 0.6)})`
        );
        earthGradient.addColorStop(
          0.4,
          `rgba(34, 197, 94, ${0.2 * (1 - phase3Progress * 0.6)})`
        );
        earthGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = earthGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Sort nodes by z-depth for proper rendering
        const rotatedNodes = nodes
          .map((node, i) => {
            // Rotate in 3D space
            const x1 =
              node.x * Math.cos(rotationY) - node.z * Math.sin(rotationY);
            const z1 =
              node.x * Math.sin(rotationY) + node.z * Math.cos(rotationY);
            const y1 = node.y * Math.cos(rotationX) - z1 * Math.sin(rotationX);
            const z2 = node.y * Math.sin(rotationX) + z1 * Math.cos(rotationX);

            const perspective = 800;
            const scale = perspective / (perspective + z2);
            const screenX = centerX + x1 * scale;
            const screenY = centerY + y1 * scale;

            const delay = i * 0.015;
            const nodeProgress = Math.max(
              0,
              Math.min(1, (phase3Progress - delay) / 0.3)
            );

            return {
              ...node,
              screenX,
              screenY,
              z: z2,
              scale,
              nodeProgress,
              index: i,
            };
          })
          .sort((a, b) => a.z - b.z);

        // Draw connections first (behind nodes)
        rotatedNodes.forEach((node1, i) => {
          rotatedNodes.forEach((node2, j) => {
            if (i < j && node1.nodeProgress > 0 && node2.nodeProgress > 0) {
              const dx = node1.screenX - node2.screenX;
              const dy = node1.screenY - node2.screenY;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < 150) {
                const connectionProgress = Math.min(
                  node1.nodeProgress,
                  node2.nodeProgress
                );
                const avgZ = (node1.z + node2.z) / 2;
                const depthFade = Math.max(0, (avgZ + 400) / 800);

                // Animated energy flow along connection
                const flowPos = (time * 2 + node1.index + node2.index) % 1;
                const flowX =
                  node1.screenX + (node2.screenX - node1.screenX) * flowPos;
                const flowY =
                  node1.screenY + (node2.screenY - node1.screenY) * flowPos;

                // Connection line
                ctx.strokeStyle = `rgba(234, 179, 8, ${0.4 * connectionProgress * depthFade * (1 - distance / 150)})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(node1.screenX, node1.screenY);
                ctx.lineTo(node2.screenX, node2.screenY);
                ctx.stroke();

                // Energy flow particle
                ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * connectionProgress * depthFade})`;
                ctx.beginPath();
                ctx.arc(flowX, flowY, 3, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          });
        });

        // Draw nodes with 3D depth
        rotatedNodes.forEach((node) => {
          if (node.nodeProgress > 0 && node.z > -800) {
            const depthFade = Math.max(0, (node.z + 400) / 800);
            const pulseSize =
              (8 + Math.sin(node.pulse + time * 5) * 3) * node.scale;

            // Outer glow - larger and more dramatic
            const glowGradient = ctx.createRadialGradient(
              node.screenX,
              node.screenY,
              0,
              node.screenX,
              node.screenY,
              pulseSize * 5
            );
            glowGradient.addColorStop(
              0,
              `rgba(234, 179, 8, ${0.9 * node.nodeProgress * depthFade})`
            );
            glowGradient.addColorStop(
              0.2,
              `rgba(234, 179, 8, ${0.6 * node.nodeProgress * depthFade})`
            );
            glowGradient.addColorStop(
              0.5,
              `rgba(234, 179, 8, ${0.3 * node.nodeProgress * depthFade})`
            );
            glowGradient.addColorStop(1, "rgba(234, 179, 8, 0)");
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(node.screenX, node.screenY, pulseSize * 5, 0, Math.PI * 2);
            ctx.fill();

            // Middle glow ring
            ctx.strokeStyle = `rgba(255, 215, 0, ${0.6 * node.nodeProgress * depthFade})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(node.screenX, node.screenY, pulseSize * 2, 0, Math.PI * 2);
            ctx.stroke();

            // Core node
            ctx.fillStyle = `rgba(234, 179, 8, ${node.nodeProgress * depthFade})`;
            ctx.beginPath();
            ctx.arc(node.screenX, node.screenY, pulseSize, 0, Math.PI * 2);
            ctx.fill();

            // Bright center
            ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * node.nodeProgress * depthFade})`;
            ctx.beginPath();
            ctx.arc(
              node.screenX,
              node.screenY,
              pulseSize * 0.5,
              0,
              Math.PI * 2
            );
            ctx.fill();

            // Sparkle effect
            if (Math.random() > 0.95) {
              const sparkleSize = pulseSize * 1.5;
              ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 * node.nodeProgress * depthFade})`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(node.screenX - sparkleSize, node.screenY);
              ctx.lineTo(node.screenX + sparkleSize, node.screenY);
              ctx.moveTo(node.screenX, node.screenY - sparkleSize);
              ctx.lineTo(node.screenX, node.screenY + sparkleSize);
              ctx.stroke();
            }
          }
        });

        // Global energy field effect
        const fieldGradient = ctx.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          400
        );
        fieldGradient.addColorStop(0, "rgba(234, 179, 8, 0)");
        fieldGradient.addColorStop(
          0.5,
          `rgba(234, 179, 8, ${0.05 * phase3Progress})`
        );
        fieldGradient.addColorStop(1, "rgba(234, 179, 8, 0)");
        ctx.fillStyle = fieldGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Phase 4: Explosive Burst - Universe at Fingertips (0.75 - 1.0)
      if (currentProgress >= 0.75) {
        const phase4Progress = (currentProgress - 0.75) / 0.25;
        const explosionProgress = Math.pow(phase4Progress, 1.2);

        // Keep rotating nodes briefly
        if (phase4Progress < 0.4) {
          const rotationY = time * 0.8;
          const rotationX = Math.sin(time * 0.3) * 0.3;
          const fadeOut = 1 - phase4Progress / 0.4;

          nodes.forEach((node) => {
            const x1 =
              node.x * Math.cos(rotationY) - node.z * Math.sin(rotationY);
            const z1 =
              node.x * Math.sin(rotationY) + node.z * Math.cos(rotationY);
            const y1 = node.y * Math.cos(rotationX) - z1 * Math.sin(rotationX);
            const z2 = node.y * Math.sin(rotationX) + z1 * Math.cos(rotationX);

            const perspective = 800;
            const scale = perspective / (perspective + z2);
            const screenX = centerX + x1 * scale;
            const screenY = centerY + y1 * scale;

            if (z2 > -800) {
              const pulseSize =
                (8 + Math.sin(node.pulse + time * 5) * 3) * scale;
              const glowGradient = ctx.createRadialGradient(
                screenX,
                screenY,
                0,
                screenX,
                screenY,
                pulseSize * 4
              );
              glowGradient.addColorStop(
                0,
                `rgba(234, 179, 8, ${0.8 * fadeOut})`
              );
              glowGradient.addColorStop(
                0.5,
                `rgba(234, 179, 8, ${0.4 * fadeOut})`
              );
              glowGradient.addColorStop(1, "rgba(234, 179, 8, 0)");
              ctx.fillStyle = glowGradient;
              ctx.beginPath();
              ctx.arc(screenX, screenY, pulseSize * 4, 0, Math.PI * 2);
              ctx.fill();
            }
          });
        }

        // Massive particle explosion with multiple layers
        const particleCount = 200;
        for (let i = 0; i < particleCount; i++) {
          const angle = (i / particleCount) * Math.PI * 2;
          const spiralOffset = (i / particleCount) * Math.PI * 4;
          const burstProgress = Math.min(1, explosionProgress * 1.3);

          // Multiple explosion waves
          for (let wave = 0; wave < 3; wave++) {
            const waveDelay = wave * 0.15;
            const waveProgress = Math.max(
              0,
              Math.min(1, (explosionProgress - waveDelay) / 0.7)
            );

            if (waveProgress > 0) {
              const distance = waveProgress * (600 + wave * 200);
              const waveAngle = angle + spiralOffset + wave * 0.3;
              const x = centerX + Math.cos(waveAngle) * distance;
              const y = centerY + Math.sin(waveAngle) * distance;
              const size = (5 - wave * 1.5) * (1 - waveProgress);

              if (size > 0.3) {
                // Particle trail
                const trailLength = 20 + waveProgress * 40;
                const gradient = ctx.createLinearGradient(
                  x,
                  y,
                  x - Math.cos(waveAngle) * trailLength,
                  y - Math.sin(waveAngle) * trailLength
                );
                gradient.addColorStop(
                  0,
                  `rgba(234, 179, 8, ${(1 - waveProgress) * 0.8})`
                );
                gradient.addColorStop(
                  0.5,
                  `rgba(255, 215, 0, ${(1 - waveProgress) * 0.4})`
                );
                gradient.addColorStop(1, "rgba(234, 179, 8, 0)");

                ctx.strokeStyle = gradient;
                ctx.lineWidth = size;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(
                  x - Math.cos(waveAngle) * trailLength,
                  y - Math.sin(waveAngle) * trailLength
                );
                ctx.stroke();

                // Particle glow
                const glowGradient = ctx.createRadialGradient(
                  x,
                  y,
                  0,
                  x,
                  y,
                  size * 4
                );
                glowGradient.addColorStop(
                  0,
                  `rgba(255, 255, 255, ${(1 - waveProgress) * 0.9})`
                );
                glowGradient.addColorStop(
                  0.3,
                  `rgba(234, 179, 8, ${(1 - waveProgress) * 0.7})`
                );
                glowGradient.addColorStop(1, "rgba(234, 179, 8, 0)");
                ctx.fillStyle = glowGradient;
                ctx.beginPath();
                ctx.arc(x, y, size * 4, 0, Math.PI * 2);
                ctx.fill();

                // Particle core
                ctx.fillStyle = `rgba(255, 255, 255, ${(1 - waveProgress) * 0.9})`;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }
        }

        // Central flash effect
        if (phase4Progress < 0.3) {
          const flashIntensity = Math.sin((phase4Progress * Math.PI) / 0.3);
          const flashGradient = ctx.createRadialGradient(
            centerX,
            centerY,
            0,
            centerX,
            centerY,
            300
          );
          flashGradient.addColorStop(
            0,
            `rgba(255, 255, 255, ${flashIntensity * 0.9})`
          );
          flashGradient.addColorStop(
            0.3,
            `rgba(234, 179, 8, ${flashIntensity * 0.6})`
          );
          flashGradient.addColorStop(
            0.6,
            `rgba(147, 51, 234, ${flashIntensity * 0.3})`
          );
          flashGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = flashGradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Shockwave rings
        for (let i = 0; i < 5; i++) {
          const ringDelay = i * 0.08;
          const ringProgress = Math.max(
            0,
            Math.min(1, (phase4Progress - ringDelay) / 0.5)
          );

          if (ringProgress > 0 && ringProgress < 0.8) {
            const ringRadius = ringProgress * 800;
            ctx.strokeStyle = `rgba(234, 179, 8, ${(1 - ringProgress) * 0.6})`;
            ctx.lineWidth = 4 * (1 - ringProgress);
            ctx.beginPath();
            ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        // Smooth morphing fade to background with gradient transition
        const isDark = document.documentElement.classList.contains("dark");
        const fadeColor = isDark ? "10, 10, 10" : "255, 255, 255";
        const fadeIntensity = Math.pow(
          Math.max(0, phase4Progress - 0.2) / 0.8,
          2
        );

        // Create radial gradient for smooth morph effect
        const morphGradient = ctx.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          Math.max(canvas.width, canvas.height) * 0.8
        );
        morphGradient.addColorStop(0, `rgba(${fadeColor}, ${fadeIntensity})`);
        morphGradient.addColorStop(
          0.5,
          `rgba(${fadeColor}, ${fadeIntensity * 0.9})`
        );
        morphGradient.addColorStop(
          1,
          `rgba(${fadeColor}, ${fadeIntensity * 0.7})`
        );
        ctx.fillStyle = morphGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []); // Empty dependency: setup once

  const scrollToNext = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: "400vh" }}
    >
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-black">
        <div
          className="absolute inset-0"
          style={{
            transform: `scale(${1 - scrollProgress * 0.15})`,
            filter: `blur(${scrollProgress * 12}px)`,
            opacity: 1 - scrollProgress * 0.8,
            transition:
              "transform 0.05s ease-out, filter 0.05s ease-out, opacity 0.05s ease-out",
          }}
        >
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

          {/* Text overlays */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center space-y-6 px-4 max-w-4xl">
              {/* Phase 1: Universe - Only bgrand.ai */}
              {scrollProgress < 0.25 && (
                <div
                  className="space-y-4 transition-all duration-500"
                  style={{
                    opacity: 1 - (scrollProgress / 0.25) * 0.7,
                    transform: `scale(${1 - (scrollProgress / 0.25) * 0.15}) translateY(${(scrollProgress / 0.25) * -30}px)`,
                  }}
                >
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white drop-shadow-2xl">
                    bgrand.ai
                  </h1>
                </div>
              )}

              {/* Phase 2: Zoom to Earth */}
              {scrollProgress >= 0.25 && scrollProgress < 0.5 && (
                <div
                  className="space-y-4 transition-all duration-500"
                  style={{
                    opacity:
                      Math.min(1, (scrollProgress - 0.25) / 0.08) *
                      (1 - ((scrollProgress - 0.25) / 0.25) * 0.7),
                    transform: `scale(${0.9 + Math.min(1, (scrollProgress - 0.25) / 0.08) * 0.1})`,
                  }}
                >
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white drop-shadow-2xl">
                    Our Planet
                  </h1>
                  <p className="text-lg md:text-xl lg:text-2xl text-white/90 drop-shadow-lg">
                    Where transformation begins
                  </p>
                </div>
              )}

              {/* Phase 3: People with AI */}
              {scrollProgress >= 0.5 && scrollProgress < 0.75 && (
                <div
                  className="space-y-6 transition-all duration-500"
                  style={{
                    opacity:
                      Math.min(1, (scrollProgress - 0.5) / 0.08) *
                      (1 - ((scrollProgress - 0.5) / 0.25) * 0.7),
                    transform: `scale(${0.9 + Math.min(1, (scrollProgress - 0.5) / 0.08) * 0.1})`,
                  }}
                >
                  <SparklesIcon className="w-12 h-12 md:w-16 md:h-16 text-yellow-400 mx-auto animate-pulse drop-shadow-2xl" />

                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white drop-shadow-2xl">
                    AI Empowered
                  </h1>
                  <p className="text-lg md:text-xl lg:text-2xl text-yellow-100 drop-shadow-lg">
                    Every person, infinite capability
                  </p>
                </div>
              )}

              {/* Phase 4: At Your Fingertips */}
              {scrollProgress >= 0.75 && (
                <div
                  className="space-y-6 transition-all duration-700"
                  style={{
                    opacity: Math.min(1, (scrollProgress - 0.75) / 0.1),
                    transform: `scale(${0.95 + Math.min(1, (scrollProgress - 0.75) / 0.1) * 0.05})`,
                  }}
                >
                  <h1
                    className="text-5xl md:text-7xl lg:text-9xl font-bold bg-gradient-to-r from-yellow-400 via-purple-500 to-blue-500 bg-clip-text text-transparent drop-shadow-2xl"
                    style={{
                      WebkitTextStroke: "1px rgba(255, 255, 255, 0.3)",
                    }}
                  >
                    At Your Fingertips
                  </h1>
                  <p className="text-lg md:text-xl lg:text-2xl text-foreground/90 font-medium drop-shadow-lg">
                    The universe responds to your command
                  </p>
                  {scrollProgress >= 0.85 && (
                    <div className="pointer-events-auto pt-4 animate-in fade-in duration-500">
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold text-lg px-8 py-6 shadow-2xl"
                        onClick={() => {
                          const workshopSection =
                            document.getElementById("workshop");
                          if (workshopSection) {
                            workshopSection.scrollIntoView({
                              behavior: "smooth",
                            });
                          }
                        }}
                      >
                        Start Building
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        {scrollProgress < 0.9 && (
          <button
            onClick={scrollToNext}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 hover:text-white transition-colors pointer-events-auto animate-bounce"
            style={{ opacity: 1 - scrollProgress }}
          >
            <ArrowDownIcon className="w-8 h-8" />
          </button>
        )}

        {/* Progress indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-white/30 transition-all"
              style={{
                backgroundColor:
                  scrollProgress >= i * 0.25 && scrollProgress < (i + 1) * 0.25
                    ? "rgba(234, 179, 8, 1)"
                    : "rgba(255, 255, 255, 0.3)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
