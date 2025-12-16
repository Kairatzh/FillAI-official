'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import CourseSettingsModal from './CourseSettingsModal';
import { generateMockCourse } from '@/data/mockStore';
import { useGraphStore } from '@/store/graphStore';

export default function SearchBar() {
  const [isFocused, setIsFocused] = useState(false);
  const [topic, setTopic] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { regenerateGraph } = useGraphStore();

  const handleTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      setIsModalOpen(true);
    }
  };

  const handleGenerateCourse = async (settings: any) => {
    setIsModalOpen(false);
    setIsGenerating(true);

    // Симуляция генерации курса
    await new Promise(resolve => setTimeout(resolve, 2000));

    generateMockCourse(topic, settings);
    setTopic('');

    // Обновляем граф с новыми данными
    regenerateGraph();

    setIsGenerating(false);
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

