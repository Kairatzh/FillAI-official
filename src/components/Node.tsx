'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { User, BookOpen, Folder } from 'lucide-react';
import { Node as NodeType } from '@/types/graph';
import { useGraphStore } from '@/store/graphStore';
import { useUIStore } from '@/store/uiStore';
import { getProximityGlow } from '@/lib/proximityUtils';
import { idleOscillation, breathingValue } from '@/lib/animateUtils';

interface NodeProps {
  node: NodeType;
  graphCenterX: number;
  graphCenterY: number;
}

export default function NodeComponent({ node, graphCenterX, graphCenterY }: NodeProps) {
  const { selectNode, startDrag, stopDrag, isDragging, dragNodeId, updateNode } = useGraphStore();
  const { cursorPosition } = useUIStore();
  const [isHovered, setIsHovered] = useState(false);
  const [time, setTime] = useState(0);
  const [pulseTime, setPulseTime] = useState(Math.random() * 6);

  const isDraggingThis = dragNodeId === node.id;
  const isSelected = useGraphStore((state) => state.selectedNodeId === node.id);

  // Animate time for breathing and oscillation
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => t + 0.016);
      setPulseTime((t) => t + 0.016);
    }, 16);
    return () => clearInterval(interval);
  }, []);

  // Calculate proximity glow (теперь graphCenterX и graphCenterY всегда 0, так как граф уже отцентрирован)
  const proximityGlow = getProximityGlow(
    node.x,
    node.y,
    cursorPosition.x - (graphCenterX || 0),
    cursorPosition.y - (graphCenterY || 0)
  );

  // Idle oscillation (only when not dragging)
  const oscillation = isDraggingThis
    ? { x: 0, y: 0 }
    : idleOscillation(time, 0, 0, node.type === 'center' ? 2 : 1.5);

  // Breathing scale
  const breatheScale = breathingValue(time * 0.5, node.type === 'center' ? 0.05 : 0.03, 1);

  // Periodic pulse glow
  const pulseGlow = Math.sin(pulseTime * 0.7) * 0.5 + 0.5;

  const handleClick = (e: React.MouseEvent) => {
    // Предотвращаем обработку клика, если происходит перетаскивание
    if (isDragging || isDraggingThis) {
      return;
    }
    
    // Используем requestAnimationFrame для плавной обработки
    requestAnimationFrame(() => {
      try {
        selectNode(node.id);
        
        // Показываем панель с информацией о узле
        const graphCenter = {
          x: window.innerWidth / 2,
          y: window.innerHeight / 2
        };
        const panelX = Math.min(graphCenter.x + node.x + 150, window.innerWidth - 300);
        const panelY = Math.max(50, Math.min(graphCenter.y + node.y, window.innerHeight - 200));
        useUIStore.getState().showPanel(panelX, panelY);
      } catch (error) {
        console.error('Error handling node click:', error);
      }
    });
  };

  const handleDragStart = () => {
    startDrag(node.id);
  };

  const handleDragEnd = () => {
    stopDrag();
  };

  const handleDrag = (_: any, info: any) => {
    updateNode(node.id, {
      x: node.x + info.delta.x,
      y: node.y + info.delta.y,
      vx: info.delta.x * 0.1,
      vy: info.delta.y * 0.1,
    });
  };

  const glowIntensity = Math.max(
    (isHovered ? 0.6 : 0.3) + proximityGlow * 0.3,
    pulseGlow * 0.2
  );

  return (
    <motion.g
      transform={`translate(${node.x + oscillation.x}, ${node.y + oscillation.y})`}
      style={{ cursor: 'grab' }}
    >
      {/* Outer glow aura - более простой */}
      <motion.circle
        cx={0}
        cy={0}
        r={node.radius * 1.5}
        fill="none"
        stroke={node.glowColor || node.color || '#2d2d2d'}
        strokeWidth={1.5}
        opacity={glowIntensity * 0.2}
        animate={{
          r: node.radius * (1.5 + breatheScale * 0.15),
          opacity: glowIntensity * 0.3,
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Main node circle */}
      <motion.circle
        cx={0}
        cy={0}
        r={node.radius}
        fill={node.color || '#2d2d2d'}
        stroke={isHovered || isSelected ? '#4a4a4a' : '#3a3a3a'}
        strokeWidth={isHovered || isSelected ? 2 : 1}
        opacity={0.95}
        animate={{
          scale: breatheScale,
          opacity: isHovered ? 1 : 0.95,
        }}
        transition={{
          scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
          opacity: { duration: 0.2 },
        }}
        style={{
          filter: `drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))`,
        }}
      />

      {/* Иконка для центрального узла "Юзера" */}
      {node.type === 'center' && (
        <foreignObject x={-node.radius * 0.4} y={-node.radius * 0.4} width={node.radius * 0.8} height={node.radius * 0.8}>
          <div className="w-full h-full flex items-center justify-center">
            <User size={node.radius * 0.5} className="text-white/80" strokeWidth={2} />
          </div>
        </foreignObject>
      )}

      {/* Иконка/узор для категорий (групп) */}
      {node.type === 'primary' && (
        <foreignObject
          x={-node.radius * 0.4}
          y={-node.radius * 0.4}
          width={node.radius * 0.8}
          height={node.radius * 0.8}
        >
          <div className="w-full h-full flex items-center justify-center">
            <Folder
              size={node.radius * 0.5}
              className="text-white/80"
              strokeWidth={2}
            />
          </div>
        </foreignObject>
      )}

      {/* Иконка книги для курсов */}
      {node.type === 'sub' && (
        <foreignObject x={-node.radius * 0.35} y={-node.radius * 0.35} width={node.radius * 0.7} height={node.radius * 0.7}>
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen size={node.radius * 0.45} className="text-white/75" strokeWidth={2} />
          </div>
        </foreignObject>
      )}

      {/* Inner highlight - более мягкий */}
      <motion.circle
        cx={-node.radius * 0.25}
        cy={-node.radius * 0.25}
        r={node.radius * 0.3}
        fill="rgba(255, 255, 255, 0.15)"
        animate={{
          opacity: isHovered ? 0.3 : 0.1,
        }}
      />

      {/* Node label */}
      <motion.text
        x={0}
        y={node.radius + 20}
        textAnchor="middle"
        fill="#ffffff"
        fontSize={node.type === 'center' ? 16 : 12}
        fontWeight={node.type === 'center' ? 'bold' : 'normal'}
        className="pointer-events-none select-none"
        animate={{
          opacity: isHovered || isSelected ? 1 : 0.9,
          y: node.radius + (isHovered ? 22 : 20),
        }}
        style={{
          textShadow: '0 0 8px rgba(0, 0, 0, 0.8)',
        }}
      >
        {node.label}
      </motion.text>

      {/* Draggable area */}
      <motion.circle
        cx={0}
        cy={0}
        r={node.radius + 10}
        fill="transparent"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          e.preventDefault();
          handleClick(e);
        }}
        drag={!isDraggingThis}
        dragMomentum={false}
        dragElastic={0.1}
        onDragStart={(e) => {
          e.stopPropagation();
          handleDragStart();
        }}
        onDrag={handleDrag}
        onDragEnd={(e) => {
          e.stopPropagation();
          handleDragEnd();
        }}
        whileDrag={{ scale: 1.1, cursor: 'grabbing' }}
        animate={{
          scale: isHovered && !isDraggingThis ? 1.05 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 25,
        }}
      />
    </motion.g>
  );
}

