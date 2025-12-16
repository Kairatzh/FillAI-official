'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import CourseSettingsModal from './CourseSettingsModal';
import { generateMockCourse, addCourseFromAPI } from '@/data/mockStore';
import { useGraphStore } from '@/store/graphStore';
import { generateCourse, checkApiHealth } from '@/services/api';

export default function SearchBar() {
  const [isFocused, setIsFocused] = useState(false);
  const [topic, setTopic] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { regenerateGraph } = useGraphStore();

  // Проверяем доступность API при загрузке
  useEffect(() => {
    checkApiHealth().then(setApiAvailable);
  }, []);

  const handleTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      setIsModalOpen(true);
      setError(null);
    }
  };

  const handleGenerateCourse = async (settings: any) => {
    setIsModalOpen(false);
    setIsGenerating(true);
    setError(null);

    try {
      let course;
      
      if (apiAvailable) {
        // Используем API бэкенда
        try {
          course = await generateCourse(topic, settings);
          addCourseFromAPI(course);
        } catch (apiError: any) {
          console.error('API error, falling back to mock:', apiError);
          // Fallback на мок если API недоступен
          course = generateMockCourse(topic, settings);
          setError('API недоступен, использован демо-режим');
        }
      } else {
        // Используем мок если API недоступен
        course = generateMockCourse(topic, settings);
      }

      setTopic('');

      // Обновляем граф с новыми данными
      regenerateGraph();

    } catch (err: any) {
      console.error('Error generating course:', err);
      setError(err.message || 'Ошибка при генерации курса');
      // В случае ошибки все равно создаем мок-курс
      generateMockCourse(topic, settings);
      regenerateGraph();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <motion.form
          onSubmit={handleTopicSubmit}
          className="relative"
          animate={{
            scale: isFocused ? 1.05 : 1,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {/* Input */}
          <motion.input
            type="text"
            placeholder="Введите тему для создания курса"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={isGenerating}
            className="relative w-96 px-6 py-4 pr-12 bg-[#252525] backdrop-blur-glass border border-[#3a3a3a] rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-[#4a4a4a] transition-all"
            whileFocus={{
              borderColor: 'rgba(107, 114, 128, 0.7)',
              boxShadow: '0 0 20px rgba(107, 114, 128, 0.2)',
            }}
          />

          {/* Icon */}
          <motion.div
            className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400"
            animate={{
              opacity: isFocused ? 1 : 0.6,
            }}
          >
            {isGenerating ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles size={20} />
              </motion.div>
            ) : (
              <Sparkles size={20} />
            )}
          </motion.div>
        </motion.form>

        {/* Status indicator */}
        {apiAvailable && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-green-400 flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            API подключен
          </div>
        )}

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20"
          >
            {error}
          </motion.div>
        )}
      </div>

      <CourseSettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleGenerateCourse}
        topic={topic}
      />
    </>
  );
}

