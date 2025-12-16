'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Heart, MessageCircle, BookOpen, Search, Filter, Tag, TrendingUp, Users as UsersIcon, Clock } from 'lucide-react';
import { getCourses, Course } from '@/data/mockStore';
import CoursePreview from '@/components/CoursePreview';

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [hoveredPost, setHoveredPost] = useState<string | null>(null);
  const courses = getCourses();

  // Моковые данные для обсуждений
  const discussions = [
    {
      id: '1',
      author: 'Алексей П.',
      avatar: 'АП',
      title: 'Отличный курс по React!',
      content: 'Недавно прошел курс по React. Очень рекомендую всем начинающим разработчикам. Материал изложен понятно, много практических примеров.',
      likes: 24,
      comments: 8,
      course: courses.length > 0 ? courses[0] : null,
      time: '2 часа назад',
      tags: ['Программирование', 'React', 'Frontend'],
    },
    {
      id: '2',
      author: 'Мария С.',
      avatar: 'МС',
      title: 'Советы по изучению английского',
      content: 'Поделюсь эффективными техниками запоминания новых слов из курса. Использую метод интервальных повторений - очень помогает!',
      likes: 18,
      comments: 12,
      course: courses.length > 1 ? courses[1] : null,
      time: '5 часов назад',
      tags: ['Английский', 'Языки', 'Обучение'],
    },
    {
      id: '3',
      author: 'Дмитрий К.',
      avatar: 'ДК',
      title: 'Квантовая механика для начинающих',
      content: 'Только начал изучать квантовую механику. Курс очень хорошо структурирован, сложные концепции объясняются простым языком.',
      likes: 31,
      comments: 15,
      course: null,
      time: '1 день назад',
      tags: ['Физика', 'Квантовая механика', 'Наука'],
    },
  ];

  return (
    <div className="flex-1 overflow-auto bg-[#1a1a1a] text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Коммьюнити
          </h1>
          <p className="text-gray-400">Обсуждайте курсы, делитесь опытом и находите единомышленников</p>
        </motion.div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Поиск обсуждений..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#252525] border border-[#3a3a3a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#3a3a3a]"
            />
          </div>
          <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-[#3a3a3a] rounded-lg flex items-center gap-2 transition-colors">
            <Filter size={20} />
            Фильтры
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {discussions.map((discussion, index) => (
              <motion.div
                key={discussion.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                onMouseEnter={() => setHoveredPost(discussion.id)}
                onMouseLeave={() => setHoveredPost(null)}
                className="bg-[#252525] border border-[#3a3a3a] rounded-xl p-6 hover:border-[#4a4a4a] transition-all cursor-pointer"
                whileHover={{ scale: 1.02, y: -2 }}
              >
                {/* Author */}
                <div className="flex items-center gap-4 mb-4">
                  <motion.div 
                    className="w-12 h-12 rounded-full bg-[#2d2d2d] flex items-center justify-center text-gray-300 font-semibold border border-[#3a3a3a]"
                    whileHover={{ scale: 1.1 }}
                  >
                    {discussion.avatar}
                  </motion.div>
                  <div className="flex-1">
                    <div className="font-semibold text-white">{discussion.author}</div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock size={14} />
                      {discussion.time}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-3 text-white">{discussion.title}</h3>
                <p className="text-gray-300 mb-4 leading-relaxed">{discussion.content}</p>
                
                {/* Tags */}
                {discussion.tags && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {discussion.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-[#2d2d2d] border border-[#3a3a3a] rounded-full text-xs text-gray-400 flex items-center gap-1"
                      >
                        <Tag size={12} />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Course Reference */}
                {discussion.course && (
                  <div className="bg-gray-800 border border-[#3a3a3a] rounded-lg p-4 mb-4 flex items-center gap-3">
                    <BookOpen className="text-gray-400" size={20} />
                    <div>
                      <div className="font-medium">{discussion.course.title}</div>
                      <div className="text-sm text-gray-400">{discussion.course.category}</div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <motion.div 
                  className="flex items-center gap-6 pt-4 border-t border-[#3a3a3a]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredPost === discussion.id ? 1 : 0.7 }}
                >
                  <motion.button 
                    className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Heart size={18} />
                    <span>{discussion.likes}</span>
                  </motion.button>
                  <motion.button 
                    className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <MessageCircle size={18} />
                    <span>{discussion.comments}</span>
                  </motion.button>
                  <motion.button 
                    className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors ml-auto"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Share2 size={18} />
                    Поделиться
                  </motion.button>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <motion.div 
              className="bg-[#252525] border border-[#3a3a3a] rounded-xl p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp size={20} />
                Статистика
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Активных обсуждений</span>
                  <span className="text-white font-semibold">{discussions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Участников</span>
                  <span className="text-white font-semibold">1.2K</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Курсов</span>
                  <span className="text-white font-semibold">{courses.length}</span>
                </div>
              </div>
            </motion.div>

            {/* Popular Courses */}
            <motion.div 
              className="bg-[#252525] border border-[#3a3a3a] rounded-xl p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BookOpen size={20} />
                Популярные курсы
              </h3>
              <div className="space-y-3">
                {courses.slice(0, 3).map((course, idx) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    className="bg-[#2d2d2d] border border-[#3a3a3a] rounded-lg p-4 cursor-pointer hover:border-[#4a4a4a] hover:bg-[#353535] transition-all"
                    onClick={() => setSelectedCourse(course)}
                    whileHover={{ scale: 1.02, x: 5 }}
                  >
                    <div className="font-medium mb-1 text-white">{course.title}</div>
                    <div className="text-sm text-gray-400">{course.level} • {course.duration}</div>
                  </motion.div>
                ))}
                {courses.length === 0 && (
                  <p className="text-gray-400 text-sm">Пока нет курсов</p>
                )}
              </div>
            </motion.div>

            {/* Share Course */}
            <motion.div 
              className="bg-[#252525] border border-[#3a3a3a] rounded-xl p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Share2 size={20} />
                Поделиться
              </h3>
              <motion.button 
                className="w-full px-4 py-3 bg-[#2d2d2d] hover:bg-[#353535] border border-[#3a3a3a] rounded-lg transition-colors text-white font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Создать обсуждение
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

