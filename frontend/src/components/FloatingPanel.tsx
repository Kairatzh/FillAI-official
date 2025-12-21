'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Edit2, Save, X, Trash2, Pin, PinOff, RotateCcw } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useGraphStore } from '@/store/graphStore';
import { getCategories } from '@/data/mockStore';
import CoursePreview from './CoursePreview';
import { Course } from '@/data/mockStore';

export default function FloatingPanel() {
  const { panelVisible, panelPosition, hidePanel, setCurrentPage } = useUIStore();
  const { selectedNodeId, nodes, toggleCategory, isCategoryExpanded, renameNode, updateNode, saveNodePositions, centerGraph } = useGraphStore();
  const panelRef = useRef<HTMLDivElement>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  
  // Проверяем, является ли узел курсом
  const categories = getCategories();
  const allCourses = categories.flatMap(cat => cat.courses);
  const courseForNode = selectedNode ? allCourses.find(c => c.id === selectedNode.id) : null;
  
  // Проверяем, является ли узел категорией
  const isCategory = selectedNode?.type === 'primary';
  const categoryExpanded = isCategory && selectedNode ? isCategoryExpanded(selectedNode.id) : false;
  const categoryCourses = isCategory && selectedNode 
    ? categories.find(cat => cat.id === selectedNode.id)?.courses || []
    : [];

  // Инициализация значения переименования
  useEffect(() => {
    if (selectedNode && isRenaming) {
      setRenameValue(selectedNode.label);
    }
  }, [selectedNode, isRenaming]);

  const handleRename = () => {
    if (selectedNode && renameValue.trim()) {
      renameNode(selectedNode.id, renameValue.trim());
      setIsRenaming(false);
      saveNodePositions();
    }
  };

  const handleResetPosition = () => {
    if (selectedNode && selectedNode.type !== 'center') {
      // Сбрасываем позицию к исходной (из generateNodes)
      const categories = getCategories().filter(cat => cat.courses.length > 0);
      if (selectedNode.type === 'primary') {
        // Находим индекс категории
        const catIndex = categories.findIndex(cat => cat.id === selectedNode.id);
        if (catIndex !== -1) {
          const categoryRadius = 200;
          const categoryAngleStep = (2 * Math.PI) / categories.length;
          const categoryAngle = catIndex * categoryAngleStep;
          const categoryX = Math.cos(categoryAngle) * categoryRadius;
          const categoryY = Math.sin(categoryAngle) * categoryRadius;
          updateNode(selectedNode.id, { x: categoryX, y: categoryY, vx: 0, vy: 0 });
        }
      } else if (selectedNode.type === 'sub') {
        // Для курса нужно найти его категорию и позицию
        const category = categories.find(cat => cat.courses.some(c => c.id === selectedNode.id));
        if (category) {
          const catIndex = categories.findIndex(cat => cat.id === category.id);
          const categoryRadius = 200;
          const courseRadius = 120;
          const categoryAngleStep = (2 * Math.PI) / categories.length;
          const categoryAngle = catIndex * categoryAngleStep;
          const categoryX = Math.cos(categoryAngle) * categoryRadius;
          const categoryY = Math.sin(categoryAngle) * categoryRadius;
          
          const courseIndex = category.courses.findIndex(c => c.id === selectedNode.id);
          const courseCount = category.courses.length;
          const courseAngleStep = (2 * Math.PI) / courseCount;
          const courseAngle = courseIndex * courseAngleStep;
          const courseX = categoryX + Math.cos(courseAngle) * courseRadius;
          const courseY = categoryY + Math.sin(courseAngle) * courseRadius;
          
          updateNode(selectedNode.id, { x: courseX, y: courseY, vx: 0, vy: 0 });
        }
      }
      saveNodePositions();
    }
  };

  // Auto-position panel to avoid graph overlap
  useEffect(() => {
    if (!panelVisible || !panelRef.current) return;

    const panel = panelRef.current;
    const rect = panel.getBoundingClientRect();
    const graphCenterX = window.innerWidth / 2;
    const graphCenterY = window.innerHeight / 2;

    // Check if panel overlaps graph center area
    const panelCenterX = rect.left + rect.width / 2;
    const panelCenterY = rect.top + rect.height / 2;
    const distanceToCenter = Math.sqrt(
      Math.pow(panelCenterX - graphCenterX, 2) + Math.pow(panelCenterY - graphCenterY, 2)
    );

    if (distanceToCenter < 300) {
      // Reposition to right side
      const newX = graphCenterX + 250;
      const newY = panelPosition.y;
      useUIStore.getState().updatePanelPosition(newX, newY);
    }
  }, [panelVisible, panelPosition]);

  if (!selectedNode) {
    return selectedCourse ? (
      <CoursePreview
        course={selectedCourse}
        onClose={() => setSelectedCourse(null)}
      />
    ) : null;
  }

  return (
    <>
      <AnimatePresence>
        {panelVisible && (
          <motion.div
          ref={panelRef}
          className="fixed z-50 w-80 rounded-2xl bg-[#252525] backdrop-blur-glass border border-[#3a3a3a] p-6 shadow-2xl"
          style={{
            left: panelPosition.x,
            top: panelPosition.y,
          }}
          initial={{
            opacity: 0,
            x: 40,
            scale: 0.97,
            filter: 'blur(20px)',
          }}
          animate={{
            opacity: 1,
            x: 0,
            scale: 1,
            filter: 'blur(0px)',
            y: [0, -5, 0],
          }}
          exit={{
            opacity: 0,
            x: 40,
            scale: 0.97,
            filter: 'blur(20px)',
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
            y: {
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
          onMouseLeave={() => {
            // Не скрываем панель, если она закреплена
            if (!isPinned) {
              // Optional: hide on mouse leave after delay
            }
          }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 rounded-2xl opacity-20"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
            }}
            animate={{
              backgroundPosition: ['-200% 0', '200% 0'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Close button */}
          <button
            onClick={hidePanel}
            className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center rounded-full bg-gray-600/50 hover:bg-gray-600 text-gray-300 hover:text-gray-100 transition-colors"
          >
            ×
          </button>

          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              {isRenaming ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename();
                      if (e.key === 'Escape') setIsRenaming(false);
                    }}
                    autoFocus
                    className="flex-1 px-2 py-1 bg-[#1a1a1a] border border-[#3a3a3a] rounded text-gray-100 text-lg font-bold focus:outline-none focus:border-sky-500"
                  />
                  <button
                    onClick={handleRename}
                    className="p-1.5 hover:bg-[#2d2d2d] rounded transition-colors"
                    title="Сохранить"
                  >
                    <Save size={16} className="text-green-400" />
                  </button>
                  <button
                    onClick={() => setIsRenaming(false)}
                    className="p-1.5 hover:bg-[#2d2d2d] rounded transition-colors"
                    title="Отмена"
                  >
                    <X size={16} className="text-gray-400" />
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-gray-100 flex-1">{selectedNode.label}</h3>
                  <div className="flex items-center gap-1">
                    {selectedNode.type !== 'center' && (
                      <>
                        <button
                          onClick={() => setIsRenaming(true)}
                          className="p-1.5 hover:bg-[#2d2d2d] rounded transition-colors"
                          title="Переименовать"
                        >
                          <Edit2 size={16} className="text-gray-400 hover:text-sky-400" />
                        </button>
                        <button
                          onClick={handleResetPosition}
                          className="p-1.5 hover:bg-[#2d2d2d] rounded transition-colors"
                          title="Сбросить позицию"
                        >
                          <RotateCcw size={16} className="text-gray-400 hover:text-amber-400" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setIsPinned(!isPinned)}
                      className="p-1.5 hover:bg-[#2d2d2d] rounded transition-colors"
                      title={isPinned ? "Открепить" : "Закрепить"}
                    >
                      {isPinned ? (
                        <Pin size={16} className="text-amber-400" />
                      ) : (
                        <PinOff size={16} className="text-gray-400 hover:text-amber-400" />
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
            <div className="space-y-2 text-sm text-gray-300">
              <div>
                <span className="text-gray-400">Тип:</span> {
                  selectedNode.type === 'center' ? 'Центр' :
                  selectedNode.type === 'primary' ? 'Категория' :
                  selectedNode.type === 'sub' ? 'Курс' : selectedNode.type
                }
              </div>
              {courseForNode && (
                <>
                  <div className="mt-4 pt-4 border-t border-gray-600/50 space-y-2">
                    <div>
                      <span className="text-gray-400">Формат:</span> {courseForNode.format}
                    </div>
                    <div>
                      <span className="text-gray-400">Уровень:</span> {courseForNode.level}
                    </div>
                    <div>
                      <span className="text-gray-400">Длительность:</span> {courseForNode.duration}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCourse(courseForNode);
                      hidePanel();
                      // Переходим на страницу библиотеки при просмотре курса
                      setCurrentPage('library');
                    }}
                    className="mt-4 w-full px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors text-gray-100 font-medium"
                  >
                    Просмотреть курс
                  </button>
                </>
              )}
              {isCategory && (
                <div className="mt-4 pt-4 border-t border-gray-600/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-200">
                      Курсов в категории: {categoryCourses.length}
                    </p>
                    <button
                      onClick={() => {
                        if (selectedNode) {
                          toggleCategory(selectedNode.id);
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors text-gray-100 font-medium"
                    >
                      {categoryExpanded ? (
                        <>
                          <ChevronUp size={16} />
                          Скрыть курсы
                        </>
                      ) : (
                        <>
                          <ChevronDown size={16} />
                          Показать курсы
                        </>
                      )}
                    </button>
                  </div>
                  {categoryExpanded && categoryCourses.length > 0 && (
                    <div className="mt-2 space-y-2">
                      <p className="text-xs text-gray-400">Курсы в этой категории:</p>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {categoryCourses.map((course) => (
                          <div
                            key={course.id}
                            className="text-xs text-gray-300 bg-gray-700/30 px-2 py-1 rounded"
                          >
                            {course.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {!courseForNode && !isCategory && selectedNode?.type !== 'center' && (
                <div className="mt-4 pt-4 border-t border-gray-600/50">
                  <p className="text-gray-200">
                    Это категория знаний. Создайте курсы, чтобы увидеть их здесь.
                  </p>
                </div>
              )}
              {selectedNode.type === 'center' && (
                <div className="mt-4 pt-4 border-t border-gray-600/50 space-y-3">
                  <p className="text-gray-200">
                    Вы в центре вашей сети знаний. Изучайте категории и создавайте курсы.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        centerGraph();
                        hidePanel();
                      }}
                      className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors text-gray-100 text-xs font-medium flex items-center gap-2"
                    >
                      <RotateCcw size={12} />
                      Центрировать граф
                    </button>
                  </div>
                </div>
              )}
              
              {/* Дополнительные действия для всех узлов */}
              {selectedNode.type !== 'center' && (
                <div className="mt-4 pt-4 border-t border-gray-600/50 space-y-2">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Действия</p>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        saveNodePositions();
                        hidePanel();
                      }}
                      className="w-full px-3 py-2 bg-gray-600/50 hover:bg-gray-600 rounded-lg transition-colors text-gray-200 text-sm text-left flex items-center gap-2"
                    >
                      <Pin size={14} />
                      Сохранить позицию
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
      {selectedCourse && (
        <CoursePreview
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </>
  );
}

