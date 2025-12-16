'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Target, BarChart, Search, ChevronDown } from 'lucide-react';
import { getCourses, getCategories, Course } from '@/data/mockStore';
import CoursePreview from '@/components/CoursePreview';

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const categories = getCategories().filter((cat) => cat.courses.length > 0);
  
  // По умолчанию все категории развернуты
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categories.map(cat => cat.id))
  );
  const courses = getCourses();

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const filteredCategories = categories.filter((category) => {
    if (selectedCategory !== 'all' && category.id !== selectedCategory) return false;
    if (!searchQuery) return true;
    const categoryMatches = category.label.toLowerCase().includes(searchQuery.toLowerCase());
    const coursesMatch = category.courses.some((course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return categoryMatches || coursesMatch;
  });

  return (
    <div className="flex-1 overflow-auto bg-[#1a1a1a] text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Моя библиотека</h1>
          <p className="text-gray-400">Все ваши сохраненные и созданные курсы в одном месте</p>
        </div>

        {/* Search */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Поиск групп и курсов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#252525] border border-[#3a3a3a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4a4a4a] transition-colors"
            />
          </div>
        </div>

        {/* Filter by category */}
        {categories.length > 0 && (
          <div className="flex gap-3 mb-8">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-2 rounded-lg border transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-[#2d2d2d] border-[#4a4a4a] text-white'
                  : 'bg-[#252525] border-[#3a3a3a] hover:border-[#4a4a4a] text-gray-300'
              }`}
            >
              Все группы
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-2 rounded-lg border transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-[#2d2d2d] border-[#4a4a4a] text-white'
                    : 'bg-[#252525] border-[#3a3a3a] hover:border-[#4a4a4a] text-gray-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Categories with Courses */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-400 text-lg">Группы и курсы не найдены</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCategories.map((category) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#252525] border border-[#3a3a3a] rounded-xl overflow-hidden"
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#2d2d2d] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#2d2d2d] flex items-center justify-center">
                      <BookOpen className="text-gray-400" size={24} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-semibold text-white">{category.label}</h3>
                      <p className="text-sm text-gray-400">{category.courses.length} курсов</p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedCategories.has(category.id) ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="text-gray-400" size={20} />
                  </motion.div>
                </button>

                {/* Courses in Category */}
                <motion.div
                  initial={false}
                  animate={{
                    height: expandedCategories.has(category.id) ? 'auto' : 0,
                    opacity: expandedCategories.has(category.id) ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4 pt-2 space-y-2">
                    {category.courses.map((course) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-[#2d2d2d] border border-[#3a3a3a] rounded-lg p-4 cursor-pointer hover:border-[#4a4a4a] hover:bg-[#353535] transition-all"
                        onClick={() => setSelectedCourse(course)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-white mb-1">{course.title}</h4>
                            <p className="text-sm text-gray-400 mb-2 line-clamp-1">{course.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <BarChart size={14} />
                                {course.level}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock size={14} />
                                {course.duration}
                              </div>
                            </div>
                          </div>
                          <BookOpen className="text-gray-500 ml-4" size={20} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        )}

        {selectedCourse && (
          <CoursePreview
            course={selectedCourse}
            onClose={() => setSelectedCourse(null)}
          />
        )}
      </div>
    </div>
  );
}

