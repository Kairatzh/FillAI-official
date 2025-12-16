import { Node } from '@/types/graph';

/**
 * Calculate distance between two points
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * Find nearest node to a point
 */
export function findNearestNode(
  nodes: Node[],
  x: number,
  y: number,
  maxDistance: number = Infinity
): Node | null {
  let nearest: Node | null = null;
  let minDist = maxDistance;

  nodes.forEach((node) => {
    const dist = distance(x, y, node.x, node.y);
    if (dist < minDist) {
      minDist = dist;
      nearest = node;
    }
  });

  return nearest;
}

/**
 * Calculate proximity glow intensity (0-1) based on distance
 */
export function getProximityGlow(
  nodeX: number,
  nodeY: number,
  cursorX: number,
  cursorY: number,
  maxDistance: number = 200
): number {
  const dist = distance(nodeX, nodeY, cursorX, cursorY);
  if (dist > maxDistance) return 0;
  return 1 - dist / maxDistance;
}

/**
 * Get nodes within radius of a point
 */
export function getNodesInRadius(
  nodes: Node[],
  x: number,
  y: number,
  radius: number
): Node[] {
  return nodes.filter((node) => distance(x, y, node.x, node.y) <= radius);
}

