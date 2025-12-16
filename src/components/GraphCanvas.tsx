'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useGraphStore } from '@/store/graphStore';
import { useUIStore } from '@/store/uiStore';
import { PhysicsEngine } from '@/lib/physicsEngine';
import NodeComponent from './Node';
import NodeLink from './NodeLink';
import { Maximize2 } from 'lucide-react';

export default function GraphCanvas() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { nodes, links, updatePhysics, isDragging, centerGraph } = useGraphStore();
  const { setCursorPosition } = useUIStore();
  const [graphCenter, setGraphCenter] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const engineRef = useRef<PhysicsEngine | null>(null);
  const animationFrameRef = useRef<number>();

  // Initialize physics engine and calculate center
  useEffect(() => {
    const updateCenter = () => {
      if (containerRef.current && svgRef.current) {
        // Используем реальные размеры контейнера
        const containerRect = containerRef.current.getBoundingClientRect();
        const svgRect = svgRef.current.getBoundingClientRect();
        
        // Центр видимой области контейнера
        const centerX = containerRect.width / 2;
        const centerY = containerRect.height / 2;
        
        setGraphCenter({ x: centerX, y: centerY });

        if (!engineRef.current) {
          engineRef.current = new PhysicsEngine(nodes, links, 0, 0); // Граф использует относительные координаты (0,0) как центр
        }
      }
    };
    
    // Задержка для правильного расчета размеров после рендера
    const timer = setTimeout(updateCenter, 100);
    updateCenter();
    
    window.addEventListener('resize', updateCenter);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateCenter);
    };
  }, []);

  // Update engine references when nodes/links change
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateReferences(nodes, links);
    }
  }, [nodes, links]);

  // Physics animation loop
  useEffect(() => {
    const animate = () => {
      if (engineRef.current && !isDragging) {
        const { cursorPosition } = useUIStore.getState();
        // Convert cursor position to graph coordinate system (относительно центра графа)
        const cursorX = cursorPosition.x - graphCenter.x;
        const cursorY = cursorPosition.y - graphCenter.y;
        updatePhysics(engineRef.current, cursorX, cursorY);
      }
      
      // Минимальная ротация - почти статично
      if (!isDragging) {
        setRotation((r) => r + 0.0001);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDragging, updatePhysics, graphCenter]);

  // Handle mouse movement for cursor sensing
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || !containerRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    
    // Координаты мыши относительно SVG (центр графа находится в graphCenter)
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCursorPosition(x, y);
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setGraphCenter({ x: rect.width / 2, y: rect.height / 2 });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden flex items-center justify-center"
      style={{ background: 'transparent' }}
    >
      {/* Center Graph Button */}
      <motion.button
        onClick={centerGraph}
        className="absolute bottom-24 right-6 z-50 p-3 bg-[#252525] border border-[#3a3a3a] rounded-lg text-gray-300 hover:text-white hover:bg-[#2d2d2d] transition-colors shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Центрировать граф"
      >
        <Maximize2 size={20} />
      </motion.button>
      <motion.svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        style={{
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
        }}
        onMouseMove={handleMouseMove}
      >
        <g
          transform={`translate(${graphCenter.x}, ${graphCenter.y}) rotate(${rotation * (180 / Math.PI)})`}
        >
          {/* Links */}
          <g>
            {links.map((link) => {
              const sourceNode = nodes.find((n) => n.id === link.source);
              const targetNode = nodes.find((n) => n.id === link.target);
              if (!sourceNode || !targetNode) return null;
              return (
                <NodeLink
                  key={link.id}
                  link={link}
                  sourceNode={sourceNode}
                  targetNode={targetNode}
                  graphCenterX={0}
                  graphCenterY={0}
                />
              );
            })}
          </g>

          {/* Nodes */}
          <g>
            {nodes.map((node) => (
              <NodeComponent
                key={node.id}
                node={node}
                graphCenterX={0}
                graphCenterY={0}
              />
            ))}
          </g>
        </g>
      </motion.svg>
    </div>
  );
}

