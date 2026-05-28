import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as math from 'mathjs';

const Math3DChart = ({ expression, xMin = -5, xMax = 5, yMin = -5, yMax = 5, variableX = 'x', variableY = 'y' }) => {
  const canvasRef = useRef(null);
  
  // Rotation angles: Yaw (around Y axis) and Pitch (around X axis)
  const [yaw, setYaw] = useState(0.85); // Radians (~48 deg)
  const [pitch, setPitch] = useState(0.65); // Radians (~37 deg)
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Grid resolution (divisions)
  const gridResolution = 30;

  // Compile the expression once when it changes
  const compiledExpression = useMemo(() => {
    if (!expression) return null;
    try {
      // Validate variables exist in the expression (could be x, y or others)
      return math.compile(expression);
    } catch (e) {
      console.warn('Failed to compile 3D expression:', e);
      return null;
    }
  }, [expression]);

  // Handle canvas drawing and calculations
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !compiledExpression) return;

    const ctx = canvas.getContext('2d');
    // Set display resolution to match container size
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2 + 10;
    
    // Scale factor to map mathematical values to screen pixels
    const scale = Math.min(width, height) / 10;

    // Generate grid points and evaluate function
    const xStep = (xMax - xMin) / gridResolution;
    const yStep = (yMax - yMin) / gridResolution;

    const vertices = [];
    let minZ = Infinity;
    let maxZ = -Infinity;

    // 1. Generate 3D Vertices
    for (let i = 0; i <= gridResolution; i++) {
      const x = xMin + i * xStep;
      vertices[i] = [];
      for (let j = 0; j <= gridResolution; j++) {
        const y = yMin + j * yStep;
        
        let z = 0;
        try {
          const scope = {};
          scope[variableX] = x;
          scope[variableY] = y;
          z = compiledExpression.evaluate(scope);
          
          if (typeof z === 'object' && z.re !== undefined) {
            z = z.re; // Real part if complex output
          }
          if (isNaN(z) || !isFinite(z)) {
            z = 0;
          }
        } catch (e) {
          z = 0;
        }

        // Cap extreme values
        z = Math.max(-10, Math.min(10, z));
        
        if (z < minZ) minZ = z;
        if (z > maxZ) maxZ = z;

        vertices[i][j] = { x, y, z };
      }
    }

    // Protect division by zero for height shading
    if (minZ === maxZ) maxZ = minZ + 1;

    // 2. Project 3D points onto 2D viewport
    const projectedGrid = [];
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);
    const cosP = Math.cos(pitch);
    const sinP = Math.sin(pitch);

    for (let i = 0; i <= gridResolution; i++) {
      projectedGrid[i] = [];
      for (let j = 0; j <= gridResolution; j++) {
        const p = vertices[i][j];

        // Rotation around Y axis (Yaw)
        const x1 = p.x * cosY - p.y * sinY;
        const y1 = p.x * sinY + p.y * cosY;
        const z1 = p.z;

        // Rotation around X axis (Pitch)
        const x2 = x1;
        const y2 = y1 * cosP - z1 * sinP;
        const z2 = y1 * sinP + z1 * cosP; // This is the depth vector

        // Perspective/orthogonal projection onto 2D plane
        const screenX = centerX + x2 * scale;
        const screenY = centerY - y2 * scale;

        projectedGrid[i][j] = {
          x: screenX,
          y: screenY,
          depth: z2, // Depth coordinate for Painter's algorithm sorting
          originalZ: p.z // Height value for color mapping
        };
      }
    }

    // 3. Assemble Polygons (Quads)
    const polygons = [];
    for (let i = 0; i < gridResolution; i++) {
      for (let j = 0; j < gridResolution; j++) {
        const p0 = projectedGrid[i][j];
        const p1 = projectedGrid[i + 1][j];
        const p2 = projectedGrid[i + 1][j + 1];
        const p3 = projectedGrid[i][j + 1];

        // Painter's algorithm: depth is average depth of the 4 corner points
        const avgDepth = (p0.depth + p1.depth + p2.depth + p3.depth) / 4;
        const avgZ = (p0.originalZ + p1.originalZ + p2.originalZ + p3.originalZ) / 4;

        polygons.push({
          points: [p0, p1, p2, p3],
          depth: avgDepth,
          height: avgZ
        });
      }
    }

    // 4. Sort polygons by depth (ascending: farthest drawn first)
    polygons.sort((a, b) => a.depth - b.depth);

    // 5. Draw Polygons on Canvas
    ctx.clearRect(0, 0, width, height);

    // Subtle background grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < width; x += 40) {
      ctx.moveTo(x, 0); ctx.lineTo(x, height);
    }
    for (let y = 0; y < height; y += 40) {
      ctx.moveTo(0, y); ctx.lineTo(width, y);
    }
    ctx.stroke();

    polygons.forEach((poly) => {
      // Color mapping: map height (minZ to maxZ) to a HSL color (Blue 240 to Purple 290)
      const ratio = (poly.height - minZ) / (maxZ - minZ);
      const hue = 220 + ratio * 80; // HSL blue-purple range: 220 to 300
      
      // Wireframe glass panel styling
      ctx.fillStyle = `hsla(${hue}, 75%, 45%, 0.45)`;
      ctx.strokeStyle = `hsla(${hue}, 80%, 65%, 0.3)`;
      ctx.lineWidth = 0.6;

      ctx.beginPath();
      ctx.moveTo(poly.points[0].x, poly.points[0].y);
      for (let k = 1; k < 4; k++) {
        ctx.lineTo(poly.points[k].x, poly.points[k].y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });

    // Draw coordinate axes indicator
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)'; // Blue X axis
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(centerX - 40, height - 25);
    ctx.lineTo(centerX + 40, height - 25);
    ctx.stroke();
    ctx.fillStyle = 'rgba(59, 130, 246, 0.9)';
    ctx.font = '9px Outfit';
    ctx.fillText('X', centerX + 45, height - 22);

    ctx.strokeStyle = 'rgba(139, 92, 246, 0.6)'; // Purple Y axis
    ctx.beginPath();
    ctx.moveTo(centerX - 40, height - 25);
    ctx.lineTo(centerX - 40, height - 70);
    ctx.stroke();
    ctx.fillStyle = 'rgba(139, 92, 246, 0.9)';
    ctx.fillText('Y', centerX - 43, height - 75);

  }, [compiledExpression, yaw, pitch, xMin, xMax, yMin, yMax, gridResolution, variableX, variableY]);

  // Touch & Mouse Drag Rotation Handlers (Responsive controls)
  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    
    // Rotate Yaw (horizontal drag rotates around Y axis)
    setYaw(prev => prev + dx * 0.007);
    // Rotate Pitch (vertical drag rotates around X axis)
    setPitch(prev => Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, prev - dy * 0.007)));
    
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Mobile Touch support
  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStart.current.x;
    const dy = e.touches[0].clientY - dragStart.current.y;

    setYaw(prev => prev + dx * 0.009);
    setPitch(prev => Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, prev - dy * 0.009)));

    dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  if (!compiledExpression) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 bg-black/10 rounded-xl border border-white/5 border-dashed">
        <p className="text-xs">Cargando visualizador tridimensional...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[320px] relative select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing rounded-xl bg-zinc-950/20"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
      <div className="absolute bottom-2 right-3 text-[9px] text-zinc-500 bg-[#09090b]/80 border border-white/5 px-2 py-0.5 rounded backdrop-blur pointer-events-none">
        Arrastra para rotar 3D
      </div>
    </div>
  );
};

export default Math3DChart;
