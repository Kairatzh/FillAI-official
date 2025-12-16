import { Node, Link } from '@/types/graph';

const GRAVITY_STRENGTH = 0.0001;
const REPULSION_STRENGTH = 1000;
const SPRING_STRENGTH = 0.01;
const DAMPING = 0.92;
const MIN_DISTANCE = 80;
const CENTER_PULL = 0.00003;

/**
 * Physics engine for graph simulation
 * Handles forces: gravity, repulsion, spring forces, damping
 */
export class PhysicsEngine {
  private nodes: Node[];
  private links: Link[];
  private centerX: number;
  private centerY: number;

  constructor(nodes: Node[], links: Link[], centerX: number, centerY: number) {
    this.nodes = nodes;
    this.links = links;
    this.centerX = centerX;
    this.centerY = centerY;
  }

  /**
   * Apply gravity-like pull toward center (weaker for center node)
   */
  private applyGravity(node: Node): void {
    if (node.type === 'center') {
      // Центральный узел всегда остается в центре
      node.x = 0;
      node.y = 0;
      node.vx = 0;
      node.vy = 0;
      return;
    }

    const dx = 0 - node.x; // Центр координат - 0,0
    const dy = 0 - node.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const force = CENTER_PULL * distance;
      node.vx += (dx / distance) * force;
      node.vy += (dy / distance) * force;
    }
  }

  /**
   * Apply repulsion between nodes to prevent overlap
   */
  private applyRepulsion(node1: Node, node2: Node): void {
    const dx = node2.x - node1.x;
    const dy = node2.y - node1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0 && distance < MIN_DISTANCE * 2) {
      const force = REPULSION_STRENGTH / (distance * distance);
      const fx = (dx / distance) * force;
      const fy = (dy / distance) * force;

      node1.vx -= fx;
      node1.vy -= fy;
      node2.vx += fx;
      node2.vy += fy;
    }
  }

  /**
   * Apply spring forces along links
   */
  private applySprings(): void {
    this.links.forEach((link) => {
      const source = this.nodes.find((n) => n.id === link.source);
      const target = this.nodes.find((n) => n.id === link.target);

      if (!source || !target) return;

      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const idealDistance = this.getIdealDistance(source, target);

      if (distance > 0) {
        const displacement = distance - idealDistance;
        const force = SPRING_STRENGTH * displacement;

        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;

        source.vx += fx;
        source.vy += fy;
        target.vx -= fx;
        target.vy -= fy;
      }
    });
  }

  /**
   * Get ideal distance between two nodes based on their types
   */
  private getIdealDistance(source: Node, target: Node): number {
    if (source.type === 'center' || target.type === 'center') {
      return 200;
    }
    if (source.type === 'primary' && target.type === 'primary') {
      return 250;
    }
    return 150;
  }

  /**
   * Apply damping to reduce velocity over time
   */
  private applyDamping(node: Node): void {
    node.vx *= DAMPING;
    node.vy *= DAMPING;
  }

  /**
   * Update nodes and links references
   */
  public updateReferences(nodes: Node[], links: Link[]): void {
    this.nodes = nodes;
    this.links = links;
  }

  /**
   * Update physics simulation for one frame
   */
  public update(deltaTime: number = 16): void {
    // Reset velocities for non-dragged nodes
    this.nodes.forEach((node) => {
      if (!node.vx && !node.vy) {
        node.vx = 0;
        node.vy = 0;
      }
    });

    // Apply forces
    this.nodes.forEach((node) => {
      this.applyGravity(node);
    });

    // Repulsion between all pairs
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        this.applyRepulsion(this.nodes[i], this.nodes[j]);
      }
    }

    // Spring forces
    this.applySprings();

    // Update positions and apply damping
    this.nodes.forEach((node) => {
      node.x += node.vx * deltaTime;
      node.y += node.vy * deltaTime;
      this.applyDamping(node);

      // Clamp velocities to prevent explosion
      if (Math.abs(node.vx) < 0.01) node.vx = 0;
      if (Math.abs(node.vy) < 0.01) node.vy = 0;
    });
  }

  /**
   * Add cursor proximity repulsion effect
   */
  public applyCursorRepulsion(cursorX: number, cursorY: number, strength: number = 200): void {
    this.nodes.forEach((node) => {
      const dx = cursorX - node.x;
      const dy = cursorY - node.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0 && distance < 100) {
        const force = strength / (distance * distance);
        node.vx -= (dx / distance) * force * 0.005;
        node.vy -= (dy / distance) * force * 0.005;
      }
    });
  }
}

