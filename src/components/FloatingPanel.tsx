'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useUIStore } from '@/store/uiStore';
import { useGraphStore } from '@/store/graphStore';
import { getCategories } from '@/data/mockStore';
import CoursePreview from './CoursePreview';
import { Course } from '@/data/mockStore';

export default function FloatingPanel() {
  const { panelVisible, panelPosition, hidePanel, setCurrentPage } = useUIStore();
  const { selectedNodeId, nodes } = useGraphStore();
  const panelRef = useRef<HTMLDivElement>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  
  // Проверяем, является ли узел курсом
  const categories = getCategories();
  const allCourses = categories.flatMap(cat => cat.courses);
  const courseForNode = selectedNode ? allCourses.find(c => c.id === selectedNode.id) : null;

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
            // Optional: hide on mouse leave after delay
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
            <h3 className="text-xl font-bold text-gray-100 mb-2">{selectedNode.label}</h3>
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
              {!courseForNode && selectedNode.type !== 'center' && (
                <div className="mt-4 pt-4 border-t border-gray-600/50">
                  <p className="text-gray-200">
                    Это категория знаний. Создайте курсы, чтобы увидеть их здесь.
                  </p>
                </div>
              )}
              {selectedNode.type === 'center' && (
                <div className="mt-4 pt-4 border-t border-gray-600/50">
                  <p className="text-gray-200">
                    Вы в центре вашей сети знаний. Изучайте категории и создавайте курсы.
                  </p>
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

