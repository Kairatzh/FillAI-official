import { useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { getCategories, getCourses } from '../../data/mockStore';

export default function KnowledgeGraph({ onCourseClick }) {
  const categories = getCategories();
  const courses = getCourses();

  const createNodes = useCallback(() => {
    const nodes = [];
    
    // Создаём узлы категорий
    categories.forEach((category, index) => {
      nodes.push({
        id: category.id,
        type: 'default',
        position: category.position || { 
          x: 200 + index * 300, 
          y: 100 
        },
        data: { 
          label: (
            <div className="px-4 py-2 text-center">
              <div className="text-lg font-bold text-white">{category.label}</div>
              <div className="text-xs text-gray-400 mt-1">
                {category.courses.length} курсов
              </div>
            </div>
          )
        },
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: '2px solid #764ba2',
          borderRadius: '12px',
          color: 'white',
          width: 180,
          height: 80,
        },
      });

      // Создаём узлы курсов для каждой категории
      category.courses.forEach((course, courseIndex) => {
        const angle = (courseIndex * (2 * Math.PI)) / Math.max(category.courses.length, 1);
        const radius = 200;
        const x = (category.position?.x || 200 + index * 300) + Math.cos(angle) * radius;
        const y = (category.position?.y || 100) + Math.sin(angle) * radius + 150;

        nodes.push({
          id: course.id,
          type: 'default',
          position: { x, y },
          data: {
            label: (
              <div 
                className="px-3 py-2 text-center cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onCourseClick && onCourseClick(course)}
              >
                <div className="text-sm font-semibold text-white line-clamp-2">
                  {course.title.length > 30 ? course.title.substring(0, 30) + '...' : course.title}
                </div>
              </div>
            )
          },
          style: {
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            border: '2px solid #3b82f6',
            borderRadius: '8px',
            color: 'white',
            width: 160,
            height: 60,
          },
        });
      });
    });

    return nodes;
  }, [categories, onCourseClick]);

  const createEdges = useCallback(() => {
    const edges = [];
    
    categories.forEach((category) => {
      category.courses.forEach((course) => {
        edges.push({
          id: `${category.id}-${course.id}`,
          source: category.id,
          target: course.id,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#3b82f6', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#3b82f6',
          },
        });
      });
    });

    return edges;
  }, [categories]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    setNodes(createNodes());
    setEdges(createEdges());
  }, [categories.length, courses.length, createNodes, createEdges, setNodes, setEdges]);

  const onNodeClick = useCallback((event, node) => {
    const course = courses.find(c => c.id === node.id);
    if (course && onCourseClick) {
      onCourseClick(course);
    }
  }, [courses, onCourseClick]);

  return (
    <div className="w-full h-full bg-dark-bg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
        attributionPosition="bottom-left"
      >
        <Background color="#1a1a1a" gap={16} />
        <Controls 
          style={{ 
            button: { 
              backgroundColor: '#151515', 
              color: '#fff',
              border: '1px solid #2a2a2a'
            } 
          }} 
        />
        <MiniMap 
          nodeColor="#3b82f6"
          style={{ backgroundColor: '#151515' }}
        />
      </ReactFlow>
    </div>
  );
}

