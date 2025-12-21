'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Target, BarChart, Search, Share2, Network } from 'lucide-react';
import { getCourses, getCategories, Course, shareCourseToCommunity, getSharedCourses, enrollInCourse, getUserEnrolledCourses } from '@/data/mockStore';
import { useUIStore } from '@/store/uiStore';
import CoursePreview from '@/components/CoursePreview';
import { calculateCourseProgress } from '@/utils/courseProgress';

export default function LibraryPage() {
  const { setCurrentPage } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const categories = getCategories().filter((cat) => cat.courses.length > 0);
  const courses = getCourses();

  // Плоский список курсов с привязкой к категории
  const flattened = useMemo(
    () =>
      categories.flatMap((cat) =>
        cat.courses.map((course) => ({ course, category: cat }))
      ),
    [categories]
  );

  const filteredCourses = useMemo(
    () =>
      flattened.filter(({ course, category }) => {
        if (selectedCategory !== 'all' && category.id !== selectedCategory) return false;

        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();

        const inTitle = course.title.toLowerCase().includes(q);
        const inDesc = course.description.toLowerCase().includes(q);

        return inTitle || inDesc;
      }),
    [flattened, selectedCategory, searchQuery]
  );

  return (
    <div className="flex-1 overflow-auto bg-[#1a1a1a] text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero / Header */}
        <motion.div
          className="mb-10 rounded-3xl bg-gradient-to-r from-sky-600 via-indigo-700 to-violet-800 p-8 shadow-2xl relative overflow-hidden"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-3 leading-tight">
                Ваша личная библиотека
              </h1>
              <p className="text-sky-100/90 text-lg max-w-2xl">
                Все ваши курсы, аккуратно разложенные по полкам: продолжайте обучение или открывайте новые направления.
              </p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2 text-sm text-sky-100/80">
              <div className="flex items-center gap-2">
                <BookOpen size={18} />
                <span>{courses.length} курсов</span>
              </div>
              <div className="flex items-center gap-2">
                <Target size={18} />
                <span>Фокус на ваших целях обучения</span>
              </div>
            </div>
          </div>
          <BookOpen className="absolute -right-10 -bottom-10 w-56 h-56 text-white/10" />
        </motion.div>

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
          <div className="flex flex-wrap gap-3 mb-8">
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

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-400 text-lg">Группы и курсы не найдены</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCourses.map(({ course, category }, index) => (
              <motion.button
                key={course.id}
                type="button"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => setSelectedCourse(course)}
                className="group relative text-left bg-[#252525] border border-[#3a3a3a] rounded-3xl overflow-hidden hover:border-sky-500/60 hover:shadow-2xl hover:shadow-sky-900/30 transition-all"
              >
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-sky-500/30 via-indigo-500/20 to-purple-500/10 opacity-60 group-hover:opacity-90 transition-opacity" />
                <div className="relative p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-black/40 border border-white/10 text-sky-100 px-2 py-1 rounded-full">
                      {category.label}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-300 bg-[#1f1f1f]/80 px-2 py-1 rounded-full">
                      {course.level}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-snug line-clamp-2 group-hover:text-sky-300 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-2 min-h-[40px]">
                    {course.description}
                  </p>
                  
                  {/* Progress Bar */}
                  {(() => {
                    const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
                    const progress = calculateCourseProgress(course.id, totalLessons);
                    if (progress > 0) {
                      return (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>Прогресс</span>
                            <span className="text-sky-400 font-semibold">{progress}%</span>
                          </div>
                          <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-sky-500 to-indigo-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-[#3a3a3a]">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5">
                        <BarChart size={14} />
                        {course.level}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {course.duration}
                      </span>
                    </div>
                    <span className="flex items-center gap-1.5 text-sky-400 group-hover:text-sky-300">
                      Подробнее
                    </span>
                  </div>
                </div>
              </motion.button>
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

