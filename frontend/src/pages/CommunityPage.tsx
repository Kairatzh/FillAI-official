'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Search, Filter, TrendingUp, Users as UsersIcon, Clock, Star, 
  Trophy, Award, Zap, ChevronDown, Check, X as CloseIcon, Plus, 
  Settings, BarChart3, Eye, EyeOff, Link as LinkIcon, Copy, 
  GraduationCap, Briefcase, Building, ShoppingCart, DollarSign,
  UserCheck, UserX, FileText, Edit2, Trash2, Share2, MessageSquare,
  Heart, Reply, Pin, Send, MoreVertical
} from 'lucide-react';
import { getCourses, Course, getSharedCourses, getCourseById, createUserCourse, getUsers, UserProfile, shareCourseToCommunity, getCourseStats, getUserCreatedCourses, enrollInCourse, getUserEnrolledCourses } from '@/data/mockStore';
import { getAllDiscussions, getCourseDiscussions, createDiscussion, addReplyToDiscussion, likeDiscussion, likeReply, Discussion, DiscussionReply } from '@/data/discussions';
import CoursePreview from '@/components/CoursePreview';

type Role = 'student' | 'teacher' | 'organization';
type Tab = 'marketplace' | 'my-courses' | 'create' | 'analytics' | 'discussions';
type PaidFilter = 'all' | 'free' | 'paid';
type LevelFilter = 'all' | 'Beginner' | 'Intermediate' | 'Advanced';
type SortOption = 'relevance' | 'newest' | 'price_low' | 'price_high';

export default function CommunityPage() {
  // Роль пользователя (можно будет получать из профиля)
  const [userRole, setUserRole] = useState<Role>('student');
  const [activeTab, setActiveTab] = useState<Tab>('marketplace');
  
  const allCourses = getCourses();
  const shared = getSharedCourses();
  const marketplaceCourses: Course[] = useMemo(() => {
    return shared
      .map((s) => getCourseById(s.courseId))
      .filter((c): c is Course => Boolean(c) && (c.isPublic !== false));
  }, [shared]);

  // Мои курсы (для учителей) - включая курсы из графа знаний
  const myCourses = useMemo(() => {
    return getUserCreatedCourses('me');
  }, [allCourses]);

  const [searchQuery, setSearchQuery] = useState('');
  const [paidFilter, setPaidFilter] = useState<PaidFilter>('all');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('relevance');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Фильтрация курсов
  const filteredCourses = useMemo(() => {
    const base = marketplaceCourses.filter((course) => {
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const inTitle = course.title.toLowerCase().includes(q);
        const inDesc = course.description.toLowerCase().includes(q);
        const inTags = (course.tags || []).some((t) => t.toLowerCase().includes(q));
        if (!inTitle && !inDesc && !inTags) return false;
      }
      if (paidFilter === 'free' && course.isPaid) return false;
      if (paidFilter === 'paid' && !course.isPaid) return false;
      if (levelFilter !== 'all' && course.level !== levelFilter) return false;
      return true;
    });

    const sorted = [...base];
    switch (sortOption) {
      case 'newest':
        sorted.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
        break;
      case 'price_low':
        sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_high':
        sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
    }
    return sorted;
  }, [marketplaceCourses, searchQuery, paidFilter, levelFilter, sortOption]);

  // Табы в зависимости от роли
  const tabs: { id: Tab; label: string; icon: any; roles: Role[] }[] = [
    { id: 'marketplace', label: 'Каталог курсов', icon: BookOpen, roles: ['student', 'teacher', 'organization'] },
    { id: 'discussions', label: 'Обсуждения', icon: MessageSquare, roles: ['student', 'teacher', 'organization'] },
    { id: 'my-courses', label: 'Мои курсы', icon: FileText, roles: ['teacher', 'organization'] },
    { id: 'create', label: 'Создать курс', icon: Plus, roles: ['teacher', 'organization'] },
    { id: 'analytics', label: 'Аналитика', icon: BarChart3, roles: ['teacher', 'organization'] },
  ];

  const visibleTabs = tabs.filter(tab => tab.roles.includes(userRole));

  // Автоматически переключаем на первый доступный таб при смене роли
  React.useEffect(() => {
    const availableTabIds = visibleTabs.map(tab => tab.id);
    if (!availableTabIds.includes(activeTab)) {
      setActiveTab(availableTabIds[0] || 'marketplace');
    }
  }, [userRole, visibleTabs, activeTab]);

  return (
    <div className="flex-1 overflow-auto bg-[#1a1a1a] text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-[#1a1a1a]/95 backdrop-blur-lg border-b border-[#3a3a3a]">
          <div className="px-6 py-4">
            <h1 className="text-3xl font-black">Сообщество</h1>
          </div>
        </div>

        {/* Content based on active tab */}
        <div className="p-6">
          {/* Role Selector - перемещен в начало контента */}
          <div className="mb-6 bg-[#252525] border border-[#3a3a3a] rounded-xl p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-lg font-bold mb-1">Выберите вашу роль</h2>
                <p className="text-sm text-gray-400">Выберите роль, чтобы увидеть соответствующие функции</p>
              </div>
              <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setUserRole('student')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all ${
                    userRole === 'student' 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-[#2d2d2d]'
                  }`}
                >
                  <GraduationCap size={16} />
                  Ученик
                </button>
                <button
                  type="button"
                  onClick={() => setUserRole('teacher')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all ${
                    userRole === 'teacher' 
                      ? 'bg-purple-500 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-[#2d2d2d]'
                  }`}
                >
                  <Briefcase size={16} />
                  Учитель
                </button>
                <button
                  type="button"
                  onClick={() => setUserRole('organization')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all ${
                    userRole === 'organization' 
                      ? 'bg-amber-500 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-[#2d2d2d]'
                  }`}
                >
                  <Building size={16} />
                  Организация
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#3a3a3a]">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-[#252525]'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
          <AnimatePresence mode="wait">
            {activeTab === 'marketplace' && (
              <MarketplaceView
                key={`marketplace-${userRole}`}
                courses={filteredCourses}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                paidFilter={paidFilter}
                setPaidFilter={setPaidFilter}
                levelFilter={levelFilter}
                setLevelFilter={setLevelFilter}
                sortOption={sortOption}
                setSortOption={setSortOption}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                onCourseSelect={setSelectedCourse}
              />
            )}
            {activeTab === 'discussions' && (
              <DiscussionsView
                key={`discussions-${userRole}`}
                courses={marketplaceCourses}
                onCourseSelect={setSelectedCourse}
              />
            )}
            {activeTab === 'my-courses' && (
              <MyCoursesView
                key={`my-courses-${userRole}`}
                courses={myCourses}
                onCourseSelect={setSelectedCourse}
                onCreateCourseClick={() => setActiveTab('create')}
              />
            )}
            {activeTab === 'create' && (
              <CreateCourseView
                key={`create-${userRole}`}
                onCourseCreated={(course) => {
                  setSelectedCourse(course);
                  setActiveTab('my-courses');
                }}
              />
            )}
            {activeTab === 'analytics' && (
              <AnalyticsView
                key={`analytics-${userRole}`}
                courses={myCourses}
                role={userRole}
              />
            )}
          </AnimatePresence>
        </div>

        {selectedCourse && (
          <CoursePreview course={selectedCourse} onClose={() => setSelectedCourse(null)} />
        )}
      </div>
    </div>
  );
}

// Marketplace View (для всех ролей)
function MarketplaceView({
  courses,
  searchQuery,
  setSearchQuery,
  paidFilter,
  setPaidFilter,
  levelFilter,
  setLevelFilter,
  sortOption,
  setSortOption,
  showFilters,
  setShowFilters,
  onCourseSelect,
}: {
  courses: Course[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  paidFilter: PaidFilter;
  setPaidFilter: (f: PaidFilter) => void;
  levelFilter: LevelFilter;
  setLevelFilter: (f: LevelFilter) => void;
  sortOption: SortOption;
  setSortOption: (s: SortOption) => void;
  showFilters: boolean;
  setShowFilters: (s: boolean) => void;
  onCourseSelect: (course: Course) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-900 p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            Найдите идеальный курс для себя
          </h2>
          <p className="text-blue-100 text-lg mb-8 opacity-90">
            Тысячи курсов от экспертов. Изучайте новые навыки и развивайтесь вместе с нами.
          </p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={22} />
          <input
            type="text"
            placeholder="Что вы хотите изучить сегодня?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-[#252525] border border-[#3a3a3a] rounded-2xl text-white text-lg placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-6 py-4 rounded-2xl border flex items-center gap-3 font-bold transition-all ${
            showFilters 
              ? 'bg-blue-600 border-blue-500 text-white' 
              : 'bg-[#252525] border-[#3a3a3a] text-gray-300 hover:border-[#4a4a4a]'
          }`}
        >
          <Filter size={20} />
          Фильтры
          <ChevronDown size={18} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-[#252525] border border-[#3a3a3a] rounded-2xl p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Тип доступа</h4>
                <div className="space-y-2">
                  {(['all', 'free', 'paid'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setPaidFilter(type)}
                      className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm transition-colors ${
                        paidFilter === type ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:bg-white/5'
                      }`}
                    >
                      <span>{type === 'all' ? 'Все' : type === 'free' ? 'Бесплатные' : 'Платные'}</span>
                      {paidFilter === type && <Check size={16} />}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Уровень</h4>
                <div className="space-y-2">
                  {(['all', 'Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setLevelFilter(lvl)}
                      className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm transition-colors ${
                        levelFilter === lvl ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:bg-white/5'
                      }`}
                    >
                      <span>{lvl === 'all' ? 'Любой уровень' : lvl}</span>
                      {levelFilter === lvl && <Check size={16} />}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Сортировка</h4>
                <div className="space-y-2">
                  {[
                    { id: 'relevance', label: 'Релевантность' },
                    { id: 'newest', label: 'Новинки' },
                    { id: 'price_low', label: 'Дешевле' },
                    { id: 'price_high', label: 'Дороже' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setSortOption(opt.id as SortOption)}
                      className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm transition-colors ${
                        sortOption === opt.id ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:bg-white/5'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {sortOption === opt.id && <Check size={16} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Courses Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <BookOpen size={24} className="text-blue-400" />
            Найдено курсов: {courses.length}
          </h3>
        </div>

        {courses.length === 0 ? (
          <div className="py-20 text-center bg-[#252525] rounded-3xl border border-dashed border-[#3a3a3a]">
            <div className="text-gray-500 text-lg mb-2">Ничего не найдено</div>
            <button 
              onClick={() => setSearchQuery('')}
              className="text-blue-500 hover:text-blue-400 font-bold"
            >
              Сбросить поиск
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="group bg-[#252525] border border-[#3a3a3a] rounded-3xl overflow-hidden hover:border-blue-500/50 hover:shadow-2xl transition-all cursor-pointer"
                onClick={() => onCourseSelect(course)}
              >
                <div className="h-48 w-full bg-gradient-to-br from-[#2d2d2d] to-[#1f1f1f] relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <BookOpen size={80} />
                  </div>
                  {course.isPaid && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-lg">
                      {course.price}₽
                    </div>
                  )}
                  {!course.isPaid && (
                    <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-lg">
                      Бесплатно
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-bold text-gray-200">4.9</span>
                    <span className="text-[10px] text-gray-500">(1.2k)</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-4 h-10">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-[#3a3a3a]">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <UsersIcon size={14} />
                        <span>{course.enrolledStudents?.length || 0}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} />
                        <span>{course.duration}</span>
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const enrolled = getUserEnrolledCourses('me');
                      if (enrolled.some(c => c.id === course.id)) {
                        alert('Вы уже записаны на этот курс!');
                        onCourseSelect(course);
                      } else {
                        enrollInCourse(course.id, 'me');
                        alert('Вы записались на курс! Теперь он доступен в вашей библиотеке.');
                        onCourseSelect(course);
                      }
                    }}
                    className="mt-4 w-full px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-lg text-white font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <BookOpen size={16} />
                    {getUserEnrolledCourses('me').some(c => c.id === course.id) ? 'Открыть курс' : 'Записаться'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// My Courses View (для учителей и организаций)
function MyCoursesView({
  courses,
  onCourseSelect,
  onCreateCourseClick,
}: {
  courses: Course[];
  onCourseSelect: (course: Course) => void;
  onCreateCourseClick: () => void;
}) {
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [showShareLink, setShowShareLink] = useState<string | null>(null);
  const [selectedCourseForTracking, setSelectedCourseForTracking] = useState<Course | null>(null);

  const handleTogglePrivacy = (course: Course) => {
    // Обновляем курс в localStorage или в store
    const updatedCourse = {
      ...course,
      isPrivate: !course.isPrivate,
      isPublic: course.isPrivate,
      shareLink: !course.isPrivate ? course.shareLink : undefined,
    };
    // Здесь можно добавить сохранение в store или API
    if (updatedCourse.isPublic && !updatedCourse.isPrivate) {
      shareCourseToCommunity(updatedCourse);
    }
    // Перезагружаем страницу для обновления
    window.location.reload();
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    alert('Ссылка скопирована!');
  };

  const generateShareLink = (course: Course): string => {
    if (course.shareLink) return course.shareLink;
    return `${window.location.origin}/course/${course.id}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black mb-2">Мои курсы</h2>
          <p className="text-gray-400">Управляйте своими курсами, отслеживайте студентов и аналитику</p>
        </div>
        <button 
          onClick={onCreateCourseClick}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-bold flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Создать курс
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="py-20 text-center bg-[#252525] rounded-3xl border border-dashed border-[#3a3a3a]">
          <BookOpen size={64} className="mx-auto text-gray-600 mb-4" />
          <div className="text-gray-400 text-lg mb-2">У вас пока нет курсов</div>
          <p className="text-gray-500 text-sm">Создайте свой первый курс и поделитесь знаниями</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-[#252525] border border-[#3a3a3a] rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all"
            >
              <div className="h-40 bg-gradient-to-br from-[#2d2d2d] to-[#1f1f1f] relative">
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  {course.isPublic !== false ? (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">Публичный</span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs font-bold rounded">Приватный</span>
                  )}
                  {course.isPaid && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded">
                      {course.price}₽
                    </span>
                  )}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{course.title}</h3>
                {(() => {
                  const stats = getCourseStats(course.id);
                  return (
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <UsersIcon size={14} />
                        <span>{stats?.enrolled || 0} записались</span>
                        <span>•</span>
                        <span className="text-green-400">{stats?.active || 0} активны</span>
                        <span>•</span>
                        <span className="text-blue-400">{stats?.completed || 0} завершили</span>
                      </div>
                      {stats && stats.enrolled > 0 && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Средний прогресс</span>
                            <span className="text-sky-400 font-bold">{stats.avgProgress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-sky-500 to-blue-600" style={{ width: `${stats.avgProgress}%` }} />
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock size={12} />
                        <span>{course.duration}</span>
                        {course.tags && course.tags.length > 0 && (
                          <>
                            <span>•</span>
                            <div className="flex flex-wrap gap-1">
                              {course.tags.slice(0, 2).map((tag, idx) => (
                                <span key={idx} className="px-1.5 py-0.5 bg-[#1a1a1a] rounded text-[10px]">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })()}
                <div className="flex items-center gap-2 pt-4 border-t border-[#3a3a3a]">
                  <button
                    onClick={() => onCourseSelect(course)}
                    className="flex-1 px-4 py-2 bg-[#2d2d2d] hover:bg-[#353535] rounded-lg text-sm font-semibold transition-colors"
                  >
                    Открыть
                  </button>
                  <button
                    onClick={() => setSelectedCourseForTracking(course)}
                    className="p-2 bg-[#2d2d2d] hover:bg-[#353535] rounded-lg transition-colors"
                    title="Трекинг студентов"
                  >
                    <BarChart3 size={16} className="text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleTogglePrivacy(course)}
                    className="p-2 bg-[#2d2d2d] hover:bg-[#353535] rounded-lg transition-colors"
                    title={course.isPublic !== false ? "Сделать приватным" : "Сделать публичным"}
                  >
                    {course.isPublic !== false ? <Eye size={16} className="text-gray-400" /> : <EyeOff size={16} className="text-gray-400" />}
                  </button>
                  <button
                    onClick={() => setShowShareLink(showShareLink === course.id ? null : course.id)}
                    className="p-2 bg-[#2d2d2d] hover:bg-[#353535] rounded-lg transition-colors"
                    title="Поделиться ссылкой"
                  >
                    <LinkIcon size={16} className="text-gray-400" />
                  </button>
                  <button
                    onClick={() => setEditingCourse(course)}
                    className="p-2 bg-[#2d2d2d] hover:bg-[#353535] rounded-lg transition-colors"
                    title="Настройки"
                  >
                    <Settings size={16} className="text-gray-400" />
                  </button>
                </div>
                {showShareLink === course.id && (
                  <div className="mt-4 p-3 bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg flex items-center gap-2">
                    <input
                      type="text"
                      value={generateShareLink(course)}
                      readOnly
                      className="flex-1 bg-transparent text-sm text-gray-300"
                    />
                    <button
                      onClick={() => handleCopyLink(generateShareLink(course))}
                      className="p-1.5 hover:bg-[#2d2d2d] rounded transition-colors"
                    >
                      <Copy size={16} className="text-gray-400" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Course Settings Modal */}
      {editingCourse && (
        <CourseSettingsModal
          course={editingCourse}
          onClose={() => setEditingCourse(null)}
          onSave={(updatedCourse) => {
            // Здесь будет логика сохранения
            setEditingCourse(null);
          }}
        />
      )}

      {/* Student Tracking Modal */}
      {selectedCourseForTracking && (
        <StudentTrackingModal
          course={selectedCourseForTracking}
          onClose={() => setSelectedCourseForTracking(null)}
        />
      )}
    </motion.div>
  );
}

// Student Tracking Modal
function StudentTrackingModal({
  course,
  onClose,
}: {
  course: Course;
  onClose: () => void;
}) {
  const stats = getCourseStats(course.id);
  const students = course.studentProgress || {};

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#252525] border border-[#3a3a3a] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-[#252525] border-b border-[#3a3a3a] p-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white">Трекинг студентов</h3>
            <p className="text-sm text-gray-400 mt-1">{course.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#2d2d2d] rounded-lg">
            <CloseIcon size={24} className="text-gray-400" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl p-4">
              <div className="text-2xl font-black text-white mb-1">{stats?.enrolled || 0}</div>
              <div className="text-xs text-gray-400">Записались</div>
            </div>
            <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl p-4">
              <div className="text-2xl font-black text-green-400 mb-1">{stats?.active || 0}</div>
              <div className="text-xs text-gray-400">Активны</div>
            </div>
            <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl p-4">
              <div className="text-2xl font-black text-blue-400 mb-1">{stats?.completed || 0}</div>
              <div className="text-xs text-gray-400">Завершили</div>
            </div>
            <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl p-4">
              <div className="text-2xl font-black text-sky-400 mb-1">{stats?.avgProgress || 0}%</div>
              <div className="text-xs text-gray-400">Средний прогресс</div>
            </div>
          </div>

          {/* Students List */}
          <div>
            <h4 className="text-lg font-bold mb-4">Список студентов</h4>
            {Object.keys(students).length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <UsersIcon size={48} className="mx-auto mb-4 opacity-50" />
                <p>Пока нет записавшихся студентов</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(students).map(([studentId, progress]: [string, any]) => (
                  <div key={studentId} className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 font-bold border border-sky-500/30">
                          {studentId === 'me' ? 'ВЫ' : studentId[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-white">
                            {studentId === 'me' ? 'Вы' : `Студент ${studentId}`}
                          </div>
                          <div className="text-xs text-gray-400">
                            Записался: {new Date(progress.enrolledAt).toLocaleDateString('ru-RU')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-sky-400">{progress.progress}%</div>
                        <div className="text-xs text-gray-400">Прогресс</div>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-[#252525] rounded-full overflow-hidden mb-2">
                      <div 
                        className="h-full bg-gradient-to-r from-sky-500 to-blue-600 transition-all"
                        style={{ width: `${progress.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Завершено уроков: {progress.completedLessons.length}</span>
                      {progress.lastAccessed && (
                        <span>Последний доступ: {new Date(progress.lastAccessed).toLocaleDateString('ru-RU')}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Create Course View
function CreateCourseView({
  onCourseCreated,
}: {
  onCourseCreated: (course: Course) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [level, setLevel] = useState<LevelFilter>('Beginner');
  const [duration, setDuration] = useState('4 недели');
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState('990');
  const [isPrivate, setIsPrivate] = useState(false);
  const [tags, setTags] = useState('');

  const handleCreateCourse = () => {
    if (!title.trim() || !description.trim()) {
      alert('Заполните название и описание курса.');
      return;
    }

    const newCourse = createUserCourse({
      title: title.trim(),
      description: description.trim(),
      categoryName: categoryName.trim() || 'Мой курс',
      level: level === 'all' ? 'Beginner' : level,
      duration: duration.trim() || '4 недели',
      isPaid,
      price: isPaid ? Number(price) || 0 : 0,
      tags,
      isPrivate,
    });

    onCourseCreated(newCourse);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-black mb-2">Создать новый курс</h2>
        <p className="text-gray-400">Заполните информацию о курсе и начните делиться знаниями</p>
      </div>

      <div className="bg-[#252525] border border-[#3a3a3a] rounded-2xl p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-400 uppercase mb-2 block">Название курса *</label>
              <input
                type="text"
                placeholder="Например: Основы дизайна интерфейсов"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-[#3a3a3a] text-white focus:outline-none focus:border-blue-500/50 transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-400 uppercase mb-2 block">Категория</label>
              <input
                type="text"
                placeholder="Дизайн, Разработка, Бизнес..."
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-[#3a3a3a] text-white focus:outline-none focus:border-blue-500/50 transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-400 uppercase mb-2 block">Описание *</label>
              <textarea
                placeholder="О чем этот курс? Какие навыки получит студент?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-[#3a3a3a] text-white focus:outline-none focus:border-blue-500/50 transition-all resize-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-400 uppercase mb-2 block">Теги</label>
              <input
                type="text"
                placeholder="ui, ux, figma, дизайн"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-[#3a3a3a] text-white focus:outline-none focus:border-blue-500/50 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-gray-400 uppercase mb-2 block">Уровень</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as LevelFilter)}
                  className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-[#3a3a3a] text-white focus:outline-none focus:border-blue-500/50 transition-all"
                >
                  <option value="Beginner">Начинающий</option>
                  <option value="Intermediate">Средний</option>
                  <option value="Advanced">Продвинутый</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-400 uppercase mb-2 block">Длительность</label>
                <input
                  type="text"
                  placeholder="4 недели"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-[#3a3a3a] text-white focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-10 h-6 rounded-full relative transition-colors ${isPrivate ? 'bg-purple-600' : 'bg-gray-700'}`}>
                    <input
                      type="checkbox"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isPrivate ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                  <span className="text-sm font-bold text-gray-300">Приватный курс</span>
                </label>
              </div>
              {isPrivate && (
                <p className="text-xs text-gray-500">
                  Приватный курс доступен только по ссылке. Вы сможете поделиться ссылкой с конкретными учениками.
                </p>
              )}
            </div>

            {/* Pricing Settings */}
            <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-10 h-6 rounded-full relative transition-colors ${isPaid ? 'bg-green-600' : 'bg-gray-700'}`}>
                    <input
                      type="checkbox"
                      checked={isPaid}
                      onChange={(e) => setIsPaid(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isPaid ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                  <span className="text-sm font-bold text-gray-300">Платный курс</span>
                </label>
                {isPaid && (
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-32 pl-4 pr-8 py-2 rounded-lg bg-[#252525] border border-[#3a3a3a] text-sm font-bold text-white focus:outline-none focus:border-green-500/50"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₽</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleCreateCourse}
              className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-lg shadow-xl flex items-center justify-center gap-3 transition-all"
            >
              <Plus size={20} />
              Создать курс
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Analytics View
function AnalyticsView({
  courses,
  role,
}: {
  courses: Course[];
  role: Role;
}) {
  const totalStudents = courses.reduce((sum, c) => sum + (c.enrolledStudents?.length || 0), 0);
  const totalRevenue = courses.reduce((sum, c) => sum + ((c.isPaid ? (c.price || 0) * (c.enrolledStudents?.length || 0) : 0)), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-3xl font-black mb-2">Аналитика</h2>
        <p className="text-gray-400">Отслеживайте прогресс ваших курсов и студентов</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#252525] border border-[#3a3a3a] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <BookOpen size={24} className="text-blue-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mb-1">{courses.length}</div>
          <div className="text-sm text-gray-400">Всего курсов</div>
        </div>
        <div className="bg-[#252525] border border-[#3a3a3a] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
              <UsersIcon size={24} className="text-green-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mb-1">{totalStudents}</div>
          <div className="text-sm text-gray-400">Всего студентов</div>
        </div>
        {role === 'teacher' && (
          <div className="bg-[#252525] border border-[#3a3a3a] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <DollarSign size={24} className="text-amber-400" />
              </div>
            </div>
            <div className="text-3xl font-black text-white mb-1">{totalRevenue}₽</div>
            <div className="text-sm text-gray-400">Общий доход</div>
          </div>
        )}
        <div className="bg-[#252525] border border-[#3a3a3a] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <TrendingUp size={24} className="text-purple-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mb-1">4.9</div>
          <div className="text-sm text-gray-400">Средний рейтинг</div>
        </div>
      </div>

      {/* Course Analytics Table */}
      <div className="bg-[#252525] border border-[#3a3a3a] rounded-xl overflow-hidden">
        <div className="p-6 border-b border-[#3a3a3a] flex items-center justify-between">
          <h3 className="text-xl font-bold">Детальная аналитика по курсам</h3>
          {role === 'organization' && (
            <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
              <FileText size={16} />
              Экспорт данных
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1a1a1a] border-b border-[#3a3a3a]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-400 uppercase">Курс</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-400 uppercase">Студенты</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-400 uppercase">Прогресс</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-400 uppercase">Рейтинг</th>
                {role === 'teacher' && (
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-400 uppercase">Доход</th>
                )}
                {role === 'organization' && (
                  <>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-400 uppercase">Группы</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-400 uppercase">Действия</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => {
                const enrolledCount = course.enrolledStudents?.length || 0;
                const avgProgress = enrolledCount > 0 ? Math.floor(Math.random() * 30 + 50) : 0;
                return (
                  <tr key={course.id} className="border-b border-[#3a3a3a] hover:bg-[#2d2d2d] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{course.title}</div>
                      <div className="text-xs text-gray-500">{course.duration}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-300 font-semibold">{enrolledCount}</div>
                      {role === 'organization' && enrolledCount > 0 && (
                        <button className="text-xs text-blue-400 hover:text-blue-300 mt-1">
                          Просмотреть список
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${avgProgress}%` }} />
                        </div>
                        <span className="text-sm text-gray-400">{avgProgress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-gray-300">4.9</span>
                      </div>
                    </td>
                    {role === 'teacher' && (
                      <td className="px-6 py-4 text-gray-300">
                        {course.isPaid ? `${(course.price || 0) * enrolledCount}₽` : '-'}
                      </td>
                    )}
                    {role === 'organization' && (
                      <>
                        <td className="px-6 py-4 text-gray-300">
                          <div className="flex items-center gap-2">
                            <span>{Math.ceil(enrolledCount / 10)} групп</span>
                            <button className="text-xs text-blue-400 hover:text-blue-300">
                              Управлять
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-[#353535] rounded-lg transition-colors" title="Массовая рассылка">
                              <Share2 size={16} className="text-gray-400" />
                            </button>
                            <button className="p-2 hover:bg-[#353535] rounded-lg transition-colors" title="Экспорт данных">
                              <FileText size={16} className="text-gray-400" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Tracking (для организаций) */}
      {role === 'organization' && (
        <div className="bg-[#252525] border border-[#3a3a3a] rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">Трекинг студентов</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg p-4">
              <div className="text-2xl font-black text-white mb-1">{totalStudents}</div>
              <div className="text-sm text-gray-400">Активных студентов</div>
            </div>
            <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg p-4">
              <div className="text-2xl font-black text-white mb-1">
                {Math.floor(totalStudents * 0.75)}
              </div>
              <div className="text-sm text-gray-400">Завершили курсы</div>
            </div>
            <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg p-4">
              <div className="text-2xl font-black text-white mb-1">
                {Math.floor(totalStudents * 0.85)}
              </div>
              <div className="text-sm text-gray-400">Средний прогресс</div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Course Settings Modal
function CourseSettingsModal({
  course,
  onClose,
  onSave,
}: {
  course: Course;
  onClose: () => void;
  onSave: (course: Course) => void;
}) {
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description);
  const [isPaid, setIsPaid] = useState(course.isPaid || false);
  const [price, setPrice] = useState(String(course.price || 0));
  const [isPrivate, setIsPrivate] = useState(course.isPrivate || false);
  const [isPublic, setIsPublic] = useState(course.isPublic !== false);

  const handleSave = () => {
    const updatedCourse = {
      ...course,
      title,
      description,
      isPaid,
      price: isPaid ? Number(price) : 0,
      isPrivate,
      isPublic: !isPrivate,
      shareLink: isPrivate ? course.shareLink || `${window.location.origin}/course/${course.id}` : undefined,
    };
    onSave(updatedCourse);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#252525] border border-[#3a3a3a] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-[#252525] border-b border-[#3a3a3a] p-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold">Настройки курса</h3>
          <button onClick={onClose} className="p-2 hover:bg-[#2d2d2d] rounded-lg">
            <CloseIcon size={24} />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="text-sm font-bold text-gray-400 uppercase mb-2 block">Название</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-[#3a3a3a] text-white focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-400 uppercase mb-2 block">Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-[#3a3a3a] text-white focus:outline-none focus:border-blue-500/50 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-3 cursor-pointer mb-4">
                <div className={`w-10 h-6 rounded-full relative transition-colors ${isPrivate ? 'bg-purple-600' : 'bg-gray-700'}`}>
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isPrivate ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
                <span className="text-sm font-bold text-gray-300">Приватный</span>
              </label>
            </div>
            <div>
              <label className="flex items-center gap-3 cursor-pointer mb-4">
                <div className={`w-10 h-6 rounded-full relative transition-colors ${isPaid ? 'bg-green-600' : 'bg-gray-700'}`}>
                  <input
                    type="checkbox"
                    checked={isPaid}
                    onChange={(e) => setIsPaid(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isPaid ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
                <span className="text-sm font-bold text-gray-300">Платный</span>
              </label>
              {isPaid && (
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-[#3a3a3a] text-white focus:outline-none focus:border-green-500/50"
                  placeholder="Цена в рублях"
                />
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-bold transition-colors"
            >
              Сохранить
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-[#2d2d2d] hover:bg-[#353535] rounded-xl font-semibold transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Discussions View (для всех ролей)
function DiscussionsView({
  courses,
  onCourseSelect,
}: {
  courses: Course[];
  onCourseSelect: (course: Course) => void;
}) {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [newDiscussionTitle, setNewDiscussionTitle] = useState('');
  const [newDiscussionContent, setNewDiscussionContent] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedDiscussion, setExpandedDiscussion] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  const currentUserId = 'me';

  const allDiscussions = getAllDiscussions();
  const courseDiscussions = selectedCourseId ? getCourseDiscussions(selectedCourseId) : allDiscussions;

  React.useEffect(() => {
    setDiscussions(courseDiscussions);
  }, [selectedCourseId, courseDiscussions]);

  const handleCreateDiscussion = () => {
    if (!newDiscussionTitle.trim() || !newDiscussionContent.trim() || !selectedCourseId) {
      alert('Заполните все поля и выберите курс');
      return;
    }

    const newDiscussion = createDiscussion({
      courseId: selectedCourseId,
      authorId: currentUserId,
      authorName: 'Вы',
      authorAvatar: 'ВЫ',
      title: newDiscussionTitle.trim(),
      content: newDiscussionContent.trim(),
      tags: [],
    });

    setDiscussions([newDiscussion, ...discussions]);
    setNewDiscussionTitle('');
    setNewDiscussionContent('');
    setShowCreateForm(false);
  };

  const handleAddReply = (discussionId: string) => {
    const content = replyContent[discussionId]?.trim();
    if (!content) return;

    addReplyToDiscussion(discussionId, {
      discussionId,
      authorId: currentUserId,
      authorName: 'Вы',
      authorAvatar: 'ВЫ',
      content,
    });

    setReplyContent({ ...replyContent, [discussionId]: '' });
    const updated = selectedCourseId ? getCourseDiscussions(selectedCourseId) : getAllDiscussions();
    setDiscussions(updated);
  };

  const handleLike = (discussionId: string) => {
    likeDiscussion(discussionId, currentUserId);
    const updated = selectedCourseId ? getCourseDiscussions(selectedCourseId) : getAllDiscussions();
    setDiscussions(updated);
  };

  const handleLikeReply = (replyId: string) => {
    likeReply(replyId, currentUserId);
    const updated = selectedCourseId ? getCourseDiscussions(selectedCourseId) : getAllDiscussions();
    setDiscussions(updated);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black mb-2">Обсуждения</h2>
          <p className="text-gray-400">Задавайте вопросы, делитесь опытом и обсуждайте курсы</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-bold flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Создать обсуждение
        </button>
      </div>

      <div className="bg-[#252525] border border-[#3a3a3a] rounded-xl p-4">
        <label className="text-sm font-bold text-gray-400 uppercase mb-2 block">Фильтр по курсу</label>
        <select
          value={selectedCourseId || ''}
          onChange={(e) => setSelectedCourseId(e.target.value || null)}
          className="w-full px-4 py-2 rounded-lg bg-[#1a1a1a] border border-[#3a3a3a] text-white focus:outline-none focus:border-blue-500/50"
        >
          <option value="">Все курсы</option>
          {courses.map(course => (
            <option key={course.id} value={course.id}>{course.title}</option>
          ))}
        </select>
      </div>

      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-[#252525] border border-[#3a3a3a] rounded-xl p-6 space-y-4"
        >
          <h3 className="text-xl font-bold">Создать новое обсуждение</h3>
          <div>
            <label className="text-sm font-bold text-gray-400 uppercase mb-2 block">Курс *</label>
            <select
              value={selectedCourseId || ''}
              onChange={(e) => setSelectedCourseId(e.target.value || null)}
              className="w-full px-4 py-2 rounded-lg bg-[#1a1a1a] border border-[#3a3a3a] text-white focus:outline-none focus:border-blue-500/50"
            >
              <option value="">Выберите курс</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-bold text-gray-400 uppercase mb-2 block">Заголовок *</label>
            <input
              type="text"
              value={newDiscussionTitle}
              onChange={(e) => setNewDiscussionTitle(e.target.value)}
              placeholder="О чем ваше обсуждение?"
              className="w-full px-4 py-2 rounded-lg bg-[#1a1a1a] border border-[#3a3a3a] text-white focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-400 uppercase mb-2 block">Содержание *</label>
            <textarea
              value={newDiscussionContent}
              onChange={(e) => setNewDiscussionContent(e.target.value)}
              placeholder="Опишите ваш вопрос или тему для обсуждения..."
              rows={4}
              className="w-full px-4 py-2 rounded-lg bg-[#1a1a1a] border border-[#3a3a3a] text-white focus:outline-none focus:border-blue-500/50 resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCreateDiscussion}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-bold transition-colors"
            >
              Создать
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-6 py-2 bg-[#2d2d2d] hover:bg-[#353535] rounded-lg font-semibold transition-colors"
            >
              Отмена
            </button>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        {discussions.length === 0 ? (
          <div className="py-20 text-center bg-[#252525] rounded-3xl border border-dashed border-[#3a3a3a]">
            <MessageSquare size={64} className="mx-auto text-gray-600 mb-4" />
            <div className="text-gray-400 text-lg mb-2">Нет обсуждений</div>
            <p className="text-gray-500 text-sm">Создайте первое обсуждение, чтобы начать общение</p>
          </div>
        ) : (
          discussions.map((discussion) => {
            const course = courses.find(c => c.id === discussion.courseId);
            const isLiked = discussion.likedBy.includes(currentUserId);
            const isExpanded = expandedDiscussion === discussion.id;

            return (
              <div
                key={discussion.id}
                className="bg-[#252525] border border-[#3a3a3a] rounded-xl p-6 hover:border-blue-500/50 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#2d2d2d] flex items-center justify-center text-lg font-bold border border-[#3a3a3a]">
                    {discussion.authorAvatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white">{discussion.title}</h3>
                      {discussion.isPinned && <Pin size={16} className="text-yellow-400" />}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                      <span>{discussion.authorName}</span>
                      {course && (
                        <>
                          <span>•</span>
                          <button
                            onClick={() => onCourseSelect(course)}
                            className="text-blue-400 hover:text-blue-300 hover:underline"
                          >
                            {course.title}
                          </button>
                        </>
                      )}
                      <span>•</span>
                      <span>{new Date(discussion.createdAt).toLocaleDateString('ru-RU')}</span>
                    </div>
                    <p className="text-gray-300 mb-4 whitespace-pre-wrap">{discussion.content}</p>
                    
                    {discussion.tags && discussion.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {discussion.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 pt-4 border-t border-[#3a3a3a]">
                      <button
                        onClick={() => handleLike(discussion.id)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${
                          isLiked
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-[#2d2d2d] text-gray-400 hover:bg-[#353535]'
                        }`}
                      >
                        <Heart size={16} className={isLiked ? 'fill-current' : ''} />
                        <span className="text-sm">{discussion.likes}</span>
                      </button>
                      <button
                        onClick={() => setExpandedDiscussion(isExpanded ? null : discussion.id)}
                        className="flex items-center gap-2 px-3 py-1 bg-[#2d2d2d] text-gray-400 hover:bg-[#353535] rounded-lg transition-colors"
                      >
                        <Reply size={16} />
                        <span className="text-sm">{discussion.replies.length} ответов</span>
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 space-y-4 pl-4 border-l-2 border-[#3a3a3a]">
                        {discussion.replies.map((reply) => {
                          const isReplyLiked = reply.likedBy.includes(currentUserId);
                          return (
                            <div key={reply.id} className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#2d2d2d] flex items-center justify-center text-sm font-bold border border-[#3a3a3a]">
                                {reply.authorAvatar}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                                  <span>{reply.authorName}</span>
                                  <span>•</span>
                                  <span>{new Date(reply.createdAt).toLocaleDateString('ru-RU')}</span>
                                </div>
                                <p className="text-gray-300 text-sm mb-2">{reply.content}</p>
                                <button
                                  onClick={() => handleLikeReply(reply.id)}
                                  className={`flex items-center gap-1 text-xs transition-colors ${
                                    isReplyLiked ? 'text-red-400' : 'text-gray-500 hover:text-gray-300'
                                  }`}
                                >
                                  <Heart size={12} className={isReplyLiked ? 'fill-current' : ''} />
                                  <span>{reply.likes}</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#2d2d2d] flex items-center justify-center text-sm font-bold border border-[#3a3a3a]">
                            ВЫ
                          </div>
                          <div className="flex-1">
                            <textarea
                              value={replyContent[discussion.id] || ''}
                              onChange={(e) => setReplyContent({ ...replyContent, [discussion.id]: e.target.value })}
                              placeholder="Напишите ответ..."
                              rows={2}
                              className="w-full px-3 py-2 rounded-lg bg-[#1a1a1a] border border-[#3a3a3a] text-white text-sm focus:outline-none focus:border-blue-500/50 resize-none"
                            />
                            <button
                              onClick={() => handleAddReply(discussion.id)}
                              className="mt-2 px-4 py-1.5 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                            >
                              <Send size={14} />
                              Отправить
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
