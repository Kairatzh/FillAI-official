'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link as LinkType, Node } from '@/types/graph';

interface NodeLinkProps {
  link: LinkType;
  sourceNode: Node;
  targetNode: Node;
  graphCenterX: number;
  graphCenterY: number;
}

export default function NodeLink({
  link,
  sourceNode,
  targetNode,
  graphCenterX,
  graphCenterY,
}: NodeLinkProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const sourceX = sourceNode.x + graphCenterX;
  const sourceY = sourceNode.y + graphCenterY;
  const targetX = targetNode.x + graphCenterX;
  const targetY = targetNode.y + graphCenterY;

  // Вычисляем параметры связи
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Используем hash от link.id для детерминированного выбора кривизны
  const linkHash = link.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const isCurved = linkHash % 10 < 4; // 40% линий будут кривыми
  const curveAmount = isCurved ? distance * 0.15 : 0;
  const perpX = distance > 0 ? (-dy / distance * curveAmount) : 0;
  const perpY = distance > 0 ? (dx / distance * curveAmount) : 0;
  const midX = (sourceX + targetX) / 2 + perpX;
  const midY = (sourceY + targetY) / 2 + perpY;

  // Определяем тип связи для разных цветов
  const linkType = sourceNode.type === 'center' ? 'center' : 
                   sourceNode.type === 'primary' ? 'category' : 'course';
  
  const linkColors = {
    center: { stroke: 'rgba(120, 174, 255, 0.6)', glow: 'rgba(120, 174, 255, 0.3)' },
    category: { stroke: 'rgba(144, 238, 144, 0.5)', glow: 'rgba(144, 238, 144, 0.2)' },
    course: { stroke: 'rgba(255, 200, 100, 0.4)', glow: 'rgba(255, 200, 100, 0.15)' },
  };
  
  const colors = linkColors[linkType];

  // Если кривая - используем квадратичную кривую, иначе прямую линию
  const pathData = isCurved 
    ? `M ${sourceX} ${sourceY} Q ${midX} ${midY} ${targetX} ${targetY}`
    : `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;

  // Позиция для узла-связи (если расстояние достаточно большое)
  const showConnectionNode = distance > 150;
  const connectionNodeX = midX;
  const connectionNodeY = midY;

  return (
    <g>
      {/* Градиент для связи */}
      <defs>
        <linearGradient id={`link-gradient-${link.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={colors.stroke} stopOpacity={0.8} />
          <stop offset="50%" stopColor={colors.stroke} stopOpacity={isHovered ? 1 : 0.6} />
          <stop offset="100%" stopColor={colors.stroke} stopOpacity={0.8} />
        </linearGradient>
      </defs>

      {/* Основная линия связи */}
      <motion.path
        d={pathData}
        fill="none"
        stroke={`url(#link-gradient-${link.id})`}
        strokeWidth={isHovered ? 2.5 : 1.5}
        opacity={isHovered ? 1 : 0.7}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={{
          strokeWidth: isHovered ? 2.5 : 1.5,
          opacity: isHovered ? 1 : 0.7,
        }}
        transition={{ duration: 0.2 }}
        style={{
          filter: isHovered 
            ? `drop-shadow(0 0 4px ${colors.glow})` 
            : 'drop-shadow(0 0 1px rgba(255, 255, 255, 0.2))',
          cursor: 'pointer',
        }}
      />

      {/* Узел-связь в середине (для длинных связей) */}
      {showConnectionNode && (
        <motion.circle
          cx={connectionNodeX}
          cy={connectionNodeY}
          r={isHovered ? 4 : 3}
          fill={colors.stroke}
          opacity={isHovered ? 0.9 : 0.6}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          animate={{
            r: isHovered ? 4 : 3,
            opacity: isHovered ? 0.9 : 0.6,
          }}
          transition={{ duration: 0.2 }}
          style={{
            filter: `drop-shadow(0 0 3px ${colors.glow})`,
            cursor: 'pointer',
          }}
        />
      )}

      {/* Анимированные частицы вдоль связи */}
      {isHovered && (
        <>
          {[0, 0.3, 0.6].map((delay, i) => (
            <motion.circle
              key={i}
              cx={sourceX}
              cy={sourceY}
              r={2.5}
              fill={colors.stroke}
              opacity={0.9}
              initial={{ opacity: 0 }}
              animate={{
                cx: [sourceX, targetX],
                cy: [sourceY, targetY],
                opacity: [0.9, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
                delay: delay,
              }}
            />
          ))}
        </>
      )}
    </g>
  );
}

