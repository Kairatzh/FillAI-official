import { create } from 'zustand';
import { GraphState, Node, Link } from '@/types/graph';
import { initialNodes, initialLinks, generateNodes, generateLinks } from '@/lib/graphData';
import { PhysicsEngine } from '@/lib/physicsEngine';

interface GraphStore extends GraphState {
  setNodes: (nodes: Node[]) => void;
  setLinks: (links: Link[]) => void;
  updateNode: (id: string, updates: Partial<Node>) => void;
  selectNode: (id: string | null) => void;
  startDrag: (id: string) => void;
  stopDrag: () => void;
  updatePhysics: (engine: PhysicsEngine, cursorX?: number, cursorY?: number) => void;
  getNodes: () => Node[];
  resetGraph: () => void;
  regenerateGraph: () => void;
  centerGraph: () => void;
}

export const useGraphStore = create<GraphStore>((set, get) => ({
  nodes: initialNodes,
  links: initialLinks,
  selectedNodeId: null,
  isDragging: false,
  dragNodeId: null,

  setNodes: (nodes) => set({ nodes }),

  setLinks: (links) => set({ links }),

  updateNode: (id, updates) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, ...updates } : node
      ),
    })),

  selectNode: (id) => set({ selectedNodeId: id }),

  startDrag: (id) => set({ isDragging: true, dragNodeId: id }),

  stopDrag: () => set({ isDragging: false, dragNodeId: null }),

  // Статичный иерархический граф: отключаем физический движок,
  // позиции берутся из заранее рассчитанных координат в graphData.ts
  updatePhysics: () => {
    // Можно оставить на будущее, если понадобится анимация
    return;
  },

  resetGraph: () => set({ nodes: initialNodes, links: initialLinks }),

  regenerateGraph: () => {
    const newNodes = generateNodes();
    const newLinks = generateLinks(newNodes);
    set({ nodes: newNodes, links: newLinks });
  },

  centerGraph: () => {
    const state = get();
    // Сброс всех узлов к исходным позициям
    const newNodes = state.nodes.map((node) => {
      if (node.type === 'center') {
        return { ...node, x: 0, y: 0, vx: 0, vy: 0 };
      }
      // Пересчитываем позиции для категорий и курсов
      return { ...node, vx: 0, vy: 0 };
    });
    set({ nodes: newNodes });
    // Регенерируем граф для пересчета позиций
    const regeneratedNodes = generateNodes();
    const regeneratedLinks = generateLinks(regeneratedNodes);
    set({ nodes: regeneratedNodes, links: regeneratedLinks });
  },

  getNodes: () => get().nodes,
}));

