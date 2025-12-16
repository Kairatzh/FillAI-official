export interface Node {
  id: string;
  label: string;
  type: 'center' | 'primary' | 'sub';
  x: number;
  y: number;
  vx: number; // velocity x
  vy: number; // velocity y
  radius: number;
  color?: string;
  glowColor?: string;
}

export interface Link {
  id: string;
  source: string;
  target: string;
  strength: number;
}

export interface GraphState {
  nodes: Node[];
  links: Link[];
  selectedNodeId: string | null;
  isDragging: boolean;
  dragNodeId: string | null;
}

export interface UIState {
  cursorPosition: { x: number; y: number };
  panelVisible: boolean;
  panelPosition: { x: number; y: number };
  searchQuery: string;
  sidebarCollapsed: boolean;
}

