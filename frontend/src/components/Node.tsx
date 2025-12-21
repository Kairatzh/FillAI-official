'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { User, BookOpen, Folder, Sparkles } from 'lucide-react';
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

  // Статичное дерево: лёгкое "дыхание" только у центрального узла,
  // без раскачивания позиционирования для остальных.
  const oscillation =
    node.type === 'center' && !isDraggingThis
      ? idleOscillation(time, 0, 0, 2)
      : { x: 0, y: 0 };

  const breatheScale =
    node.type === 'center'
      ? breathingValue(time * 0.5, 0.06, 1)
      : 1;

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
    // Используем правильные координаты относительно графа
    const newX = node.x + info.delta.x;
    const newY = node.y + info.delta.y;
    updateNode(node.id, {
      x: newX,
      y: newY,
      vx: 0, // Сбрасываем скорость при перетаскивании
      vy: 0,
    });
  };

  const glowIntensity = Math.max(
    (isHovered ? 0.6 : 0.3) + proximityGlow * 0.3,
    pulseGlow * 0.2
  );

  return (
    <motion.g
      transform={`translate(${node.x + oscillation.x}, ${node.y + oscillation.y})`}
      style={{ cursor: node.type === 'center' ? 'default' : 'grab' }}
    >
      {/* Outer glow aura - более живой */}
      <motion.circle
        cx={0}
        cy={0}
        r={node.radius * 1.6}
        fill="none"
        stroke={node.glowColor || node.color || '#2d2d2d'}
        strokeWidth={2}
        opacity={glowIntensity * 0.3}
        animate={
          node.type === 'center'
            ? {
                r: node.radius * (1.6 + breatheScale * 0.2),
                opacity: glowIntensity * 0.4,
              }
            : isHovered 
              ? {
                  r: node.radius * 1.8,
                  opacity: glowIntensity * 0.4,
                }
              : { 
                  r: node.radius * 1.6,
                  opacity: glowIntensity * 0.25 
                }
        }
        transition={{
          duration: node.type === 'center' ? 3 : 0.4,
          repeat: node.type === 'center' ? Infinity : 0,
          ease: 'easeInOut',
        }}
      />
      
      {/* Дополнительное свечение при наведении */}
      {isHovered && (
        <motion.circle
          cx={0}
          cy={0}
          r={node.radius * 2}
          fill="none"
          stroke={node.glowColor || node.color || '#2d2d2d'}
          strokeWidth={1}
          opacity={0.2}
          initial={{ opacity: 0, r: node.radius * 1.5 }}
          animate={{ 
            opacity: [0.2, 0.1, 0.2],
            r: [node.radius * 2, node.radius * 2.2, node.radius * 2],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Main node circle */}
      <motion.circle
        cx={0}
        cy={0}
        r={node.radius}
        fill={node.color || '#2d2d2d'}
        stroke={isHovered || isSelected ? (node.type === 'center' ? '#5a5a5a' : node.type === 'primary' ? '#78aaff' : '#90ee90') : '#3a3a3a'}
        strokeWidth={isHovered || isSelected ? 2.5 : 1.5}
        opacity={0.95}
        animate={{
          scale: breatheScale * (isHovered && !isDraggingThis ? 1.05 : 1),
          opacity: isHovered || isSelected ? 1 : 0.92,
          strokeWidth: isHovered || isSelected ? 2.5 : 1.5,
        }}
        transition={{
          scale: { 
            duration: node.type === 'center' ? 4 : 0.3, 
            repeat: node.type === 'center' ? Infinity : 0, 
            ease: 'easeInOut' 
          },
          opacity: { duration: 0.2 },
          strokeWidth: { duration: 0.2 },
        }}
        style={{
          filter: isHovered || isSelected 
            ? `drop-shadow(0 4px 12px ${node.glowColor || 'rgba(255, 255, 255, 0.3)'})` 
            : `drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))`,
        }}
      />

      {/* Иконка для центрального узла "Юзера" */}
      {node.type === 'center' && (
        <foreignObject x={-node.radius * 0.4} y={-node.radius * 0.4} width={node.radius * 0.8} height={node.radius * 0.8}>
          <motion.div 
            className="w-full h-full flex items-center justify-center"
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <User size={node.radius * 0.5} className="text-white/90" strokeWidth={2} />
          </motion.div>
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
          <motion.div 
            className="w-full h-full flex items-center justify-center"
            animate={isHovered ? {
              scale: [1, 1.1, 1],
              rotate: [0, 10, -10, 0],
            } : {
              scale: 1,
              rotate: 0,
            }}
            transition={{
              duration: 2,
              repeat: isHovered ? Infinity : 0,
              ease: 'easeInOut',
            }}
          >
            <Folder
              size={node.radius * 0.5}
              className={isHovered ? "text-blue-300/90" : "text-white/80"}
              strokeWidth={2}
            />
          </motion.div>
        </foreignObject>
      )}

      {/* Иконка книги для курсов */}
      {node.type === 'sub' && (
        <foreignObject x={-node.radius * 0.35} y={-node.radius * 0.35} width={node.radius * 0.7} height={node.radius * 0.7}>
          <motion.div 
            className="w-full h-full flex items-center justify-center"
            animate={isHovered ? {
              scale: [1, 1.15, 1],
              y: [0, -2, 0],
            } : {
              scale: 1,
              y: 0,
            }}
            transition={{
              duration: 1.5,
              repeat: isHovered ? Infinity : 0,
              ease: 'easeInOut',
            }}
          >
            <BookOpen 
              size={node.radius * 0.45} 
              className={isHovered ? "text-green-300/90" : "text-white/75"} 
              strokeWidth={2} 
            />
          </motion.div>
        </foreignObject>
      )}

      {/* Inner highlight - более живой */}
      <motion.circle
        cx={-node.radius * 0.25}
        cy={-node.radius * 0.25}
        r={node.radius * 0.35}
        fill="rgba(255, 255, 255, 0.2)"
        animate={{
          opacity: isHovered ? 0.4 : 0.15,
          r: isHovered ? node.radius * 0.4 : node.radius * 0.35,
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Дополнительные эффекты при наведении */}
      {isHovered && (
        <>
          {/* Блики */}
          <motion.circle
            cx={node.radius * 0.3}
            cy={-node.radius * 0.3}
            r={node.radius * 0.15}
            fill="rgba(255, 255, 255, 0.3)"
            animate={{
              opacity: [0.3, 0.1, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          {/* Иконка эффекта для курсов */}
          {node.type === 'sub' && (
            <foreignObject 
              x={-node.radius * 0.2} 
              y={-node.radius * 0.2} 
              width={node.radius * 0.4} 
              height={node.radius * 0.4}
            >
              <motion.div
                className="w-full h-full flex items-center justify-center"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
                }}
              >
                <Sparkles size={node.radius * 0.3} className="text-yellow-300/60" />
              </motion.div>
            </foreignObject>
          )}
        </>
      )}

      {/* Node label - привязан к узлу */}
      <motion.text
        x={0}
        y={node.radius + 18}
        textAnchor="middle"
        fill="#ffffff"
        fontSize={node.type === 'center' ? 16 : node.type === 'primary' ? 13 : 11}
        fontWeight={node.type === 'center' ? 'bold' : node.type === 'primary' ? '600' : 'normal'}
        className="pointer-events-none select-none"
        animate={{
          opacity: isHovered || isSelected ? 1 : 0.85,
          y: node.radius + (isHovered ? 20 : 18),
        }}
        style={{
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.9), 0 0 2px rgba(0, 0, 0, 0.5)',
        }}
      >
        {node.label}
      </motion.text>

      {/* Draggable area - только для самого узла, не для текста */}
      <motion.circle
        cx={0}
        cy={0}
        r={node.radius + 15}
        fill="transparent"
        stroke="transparent"
        strokeWidth={10}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e: React.MouseEvent) => {
          // Не обрабатываем клик во время перетаскивания
          if (isDragging || isDraggingThis) {
            e.stopPropagation();
            return;
          }
          e.stopPropagation();
          e.preventDefault();
          handleClick(e);
        }}
        drag={!isDraggingThis && node.type !== 'center'}
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={false}
        onDragStart={(e) => {
          e.stopPropagation();
          handleDragStart();
        }}
        onDrag={handleDrag}
        onDragEnd={(e) => {
          e.stopPropagation();
          handleDragEnd();
          // Сохраняем позицию после перетаскивания
          const state = useGraphStore.getState();
          if (state.saveNodePositions) {
            state.saveNodePositions();
          }
        }}
        whileDrag={{ 
          scale: 1.15, 
          cursor: 'grabbing',
          filter: 'brightness(1.2)',
        }}
        animate={{
          scale: isHovered && !isDraggingThis ? 1.08 : 1,
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

