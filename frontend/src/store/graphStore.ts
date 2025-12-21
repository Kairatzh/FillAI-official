import { create } from 'zustand';
import { GraphState, Node, Link } from '@/types/graph';
import { initialNodes, initialLinks, generateNodes, generateLinks } from '@/lib/graphData';
import { PhysicsEngine } from '@/lib/physicsEngine';
import { getCategories } from '@/data/mockStore';

interface GraphStore extends GraphState {
  setNodes: (nodes: Node[]) => void;
  setLinks: (links: Link[]) => void;
  updateNode: (id: string, updates: Partial<Node>) => void;
  renameNode: (id: string, newLabel: string) => void;
  selectNode: (id: string | null) => void;
  startDrag: (id: string) => void;
  stopDrag: () => void;
  updatePhysics: (engine: PhysicsEngine, cursorX?: number, cursorY?: number) => void;
  getNodes: () => Node[];
  resetGraph: () => void;
  regenerateGraph: () => void;
  centerGraph: () => void;
  saveNodePositions: () => void;
  loadNodePositions: () => void;
  expandedCategories: Set<string>;
  toggleCategory: (categoryId: string) => void;
  isCategoryExpanded: (categoryId: string) => boolean;
}

// Загружаем сохраненные позиции и переименования при инициализации
const loadInitialNodes = (): Node[] => {
  if (typeof window === 'undefined') return initialNodes;
  try {
    let nodes = [...initialNodes];
    
    // Загружаем позиции
    const savedPositions = localStorage.getItem('graph_node_positions');
    if (savedPositions) {
      const positions = JSON.parse(savedPositions) as Record<string, { x: number; y: number }>;
      nodes = nodes.map(node => {
        if (node.type === 'center') return node;
        const savedPos = positions[node.id];
        if (savedPos) {
          return { ...node, x: savedPos.x, y: savedPos.y };
        }
        return node;
      });
    }
    
    // Загружаем переименования
    const savedRenames = localStorage.getItem('graph_node_renames');
    if (savedRenames) {
      const renames = JSON.parse(savedRenames) as Record<string, string>;
      nodes = nodes.map(node => {
        if (renames[node.id]) {
          return { ...node, label: renames[node.id] };
        }
        return node;
      });
    }
    
    return nodes;
  } catch (error) {
    console.error('Ошибка загрузки данных графа:', error);
  }
  return initialNodes;
};

export const useGraphStore = create<GraphStore>((set, get) => ({
  nodes: loadInitialNodes(),
  links: initialLinks,
  selectedNodeId: null,
  isDragging: false,
  dragNodeId: null,
  expandedCategories: new Set<string>(), // По умолчанию все категории свернуты

  setNodes: (nodes) => set({ nodes }),

  setLinks: (links) => set({ links }),

  updateNode: (id, updates) =>
    set((state) => {
      const newNodes = state.nodes.map((node) =>
        node.id === id ? { ...node, ...updates } : node
      );
      // Автоматически сохраняем позиции при изменении
      if (updates.x !== undefined || updates.y !== undefined) {
        if (typeof window !== 'undefined') {
          try {
            const positions: Record<string, { x: number; y: number }> = {};
            newNodes.forEach(node => {
              if (node.type !== 'center') {
                positions[node.id] = { x: node.x, y: node.y };
              }
            });
            localStorage.setItem('graph_node_positions', JSON.stringify(positions));
          } catch (error) {
            console.error('Ошибка сохранения позиций:', error);
          }
        }
      }
      return { nodes: newNodes };
    }),

  renameNode: (id, newLabel) =>
    set((state) => {
      const newNodes = state.nodes.map((node) =>
        node.id === id ? { ...node, label: newLabel } : node
      );
      // Сохраняем переименования в localStorage
      if (typeof window !== 'undefined') {
        try {
          const renames: Record<string, string> = {};
          newNodes.forEach(node => {
            if (node.type !== 'center') {
              // Проверяем, отличается ли название от исходного
              const categories = getCategories();
              const allCourses = categories.flatMap(cat => cat.courses);
              const originalCourse = allCourses.find(c => c.id === node.id);
              const originalCategory = categories.find(cat => cat.id === node.id);
              const originalLabel = originalCourse?.title || originalCategory?.label;
              if (originalLabel && node.label !== originalLabel) {
                renames[node.id] = node.label;
              }
            }
          });
          localStorage.setItem('graph_node_renames', JSON.stringify(renames));
        } catch (error) {
          console.error('Ошибка сохранения переименований:', error);
        }
      }
      return { nodes: newNodes };
    }),

  selectNode: (id) => set({ selectedNodeId: id }),

  startDrag: (id) => set({ isDragging: true, dragNodeId: id }),

  stopDrag: () => set({ isDragging: false, dragNodeId: null }),

  // Статичный иерархический граф: отключаем физический движок,
  // позиции берутся из заранее рассчитанных координат в graphData.ts
  updatePhysics: () => {
    // Можно оставить на будущее, если понадобится анимация
    return;
  },

  resetGraph: () => set({ nodes: initialNodes, links: initialLinks, expandedCategories: new Set() }),

  regenerateGraph: () => {
    const state = get();
    const newNodes = generateNodes();
    // Загружаем сохраненные позиции
    const savedPositions = get().loadNodePositions();
    const nodesWithPositions = newNodes.map(node => {
      if (node.type === 'center') return node;
      const saved = savedPositions[node.id];
      if (saved) {
        return { ...node, x: saved.x, y: saved.y };
      }
      return node;
    });
    const newLinks = generateLinks(nodesWithPositions, state.expandedCategories);
    set({ nodes: nodesWithPositions, links: newLinks });
  },

  saveNodePositions: () => {
    if (typeof window === 'undefined') return;
    const state = get();
    try {
      const positions: Record<string, { x: number; y: number }> = {};
      state.nodes.forEach(node => {
        if (node.type !== 'center') {
          positions[node.id] = { x: node.x, y: node.y };
        }
      });
      localStorage.setItem('graph_node_positions', JSON.stringify(positions));
    } catch (error) {
      console.error('Ошибка сохранения позиций:', error);
    }
  },

  loadNodePositions: () => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem('graph_node_positions');
      if (saved) {
        return JSON.parse(saved) as Record<string, { x: number; y: number }>;
      }
    } catch (error) {
      console.error('Ошибка загрузки позиций:', error);
    }
    return {};
  },

  centerGraph: () => {
    const state = get();
    // Регенерируем граф для пересчета позиций, но сохраняем пользовательские позиции
    const regeneratedNodes = generateNodes();
    const savedPositions = get().loadNodePositions();
    const nodesWithPositions = regeneratedNodes.map(node => {
      if (node.type === 'center') return node;
      const saved = savedPositions[node.id];
      if (saved) {
        return { ...node, x: saved.x, y: saved.y };
      }
      return node;
    });
    const regeneratedLinks = generateLinks(nodesWithPositions, state.expandedCategories);
    set({ nodes: nodesWithPositions, links: regeneratedLinks });
  },

  toggleCategory: (categoryId: string) => {
    set((state) => {
      const newExpanded = new Set(state.expandedCategories);
      if (newExpanded.has(categoryId)) {
        newExpanded.delete(categoryId);
      } else {
        newExpanded.add(categoryId);
      }
      // Регенерируем связи с учетом нового состояния раскрытия
      const newLinks = generateLinks(state.nodes, newExpanded);
      return { expandedCategories: newExpanded, links: newLinks };
    });
  },

  isCategoryExpanded: (categoryId: string) => {
    return get().expandedCategories.has(categoryId);
  },

  getNodes: () => get().nodes,
}));

