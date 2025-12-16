'use client';

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
  const sourceX = sourceNode.x + graphCenterX;
  const sourceY = sourceNode.y + graphCenterY;
  const targetX = targetNode.x + graphCenterX;
  const targetY = targetNode.y + graphCenterY;

  // Прямые или слегка кривые линии
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Используем hash от link.id для детерминированного выбора кривизны
  const linkHash = link.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const isCurved = linkHash % 10 < 3; // 30% линий будут слегка кривыми
  const curveAmount = isCurved ? distance * 0.05 : 0; // Очень небольшое смещение
  const perpX = distance > 0 ? (-dy / distance * curveAmount) : 0;
  const perpY = distance > 0 ? (dx / distance * curveAmount) : 0;
  const midX = (sourceX + targetX) / 2 + perpX;
  const midY = (sourceY + targetY) / 2 + perpY;

  // Если кривая - используем квадратичную кривую, иначе прямую линию
  const pathData = isCurved 
    ? `M ${sourceX} ${sourceY} Q ${midX} ${midY} ${targetX} ${targetY}`
    : `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;

  return (
    <path
      d={pathData}
      fill="none"
      stroke="rgba(255, 255, 255, 0.7)"
      strokeWidth={1.5}
      opacity={0.8}
      style={{
        filter: 'drop-shadow(0 0 1px rgba(255, 255, 255, 0.3))',
      }}
    />
  );
}

