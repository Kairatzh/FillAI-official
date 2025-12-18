'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, BookOpen, Search, Filter, TrendingUp, Users as UsersIcon, Clock, Star, Trophy, Award, Zap, ChevronDown, Check, X as CloseIcon } from 'lucide-react';
import { getCourses, Course, getSharedCourses, getCourseById, createUserCourse, getUsers, findUserByNameOrId, UserProfile } from '@/data/mockStore';
import CoursePreview from '@/components/CoursePreview';

type PaidFilter = 'all' | 'free' | 'paid';
type LevelFilter = 'all' | 'Beginner' | 'Intermediate' | 'Advanced';
type SortOption = 'relevance' | 'newest' | 'price_low' | 'price_high';

export default function CommunityPage() {
  const allCourses = getCourses();
  const shared = getSharedCourses();

  const marketplaceCourses: Course[] =
    shared.length > 0
      ? shared
          .map((s) => getCourseById(s.courseId))
          .filter((c): c is Course => Boolean(c))
      : allCourses;

  const [searchQuery, setSearchQuery] = useState('');
  const [paidFilter, setPaidFilter] = useState<PaidFilter>('all');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('relevance');
  const [onlyPublic, setOnlyPublic] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const users = getUsers();
  const [userSearch, setUserSearch] = useState('');
  const filteredUsers: UserProfile[] = useMemo(
    () => findUserByNameOrId(userSearch),
    [userSearch]
  );

  // Имитация лидеров сообщества (геймификация)
  const topContributors = useMemo(() => {
    return users.slice(0, 3).map((u, i) => ({
      ...u,
      xp: 1500 - i * 300,
      level: 12 - i * 2,
      rank: i + 1
    }));
  }, [users]);

  // Форма добавления собственного курса
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryName, setCategoryName] = useState('Мой курс');
  const [level, setLevel] = useState<LevelFilter>('Beginner');
  const [duration, setDuration] = useState('4 недели');
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState('990');
  const [tags, setTags] = useState('');

  const handleCreateCourse = () => {
    if (!title.trim() || !description.trim()) {
      alert('Заполните хотя бы название и описание курса.');
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
    });

    // Открываем превью сразу после создания
    setSelectedCourse(newCourse);

    // Очищаем форму
    setTitle('');
    setDescription('');
    setTags('');
  };

  // Реальные фильтры и поиск по маркетплейсу
  const filteredCourses = useMemo(() => {
    const base = marketplaceCourses.filter((course) => {
      if (onlyPublic && course.isPublic === false) return false;
      // Поиск по названию / описанию / тегам
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const inTitle = course.title.toLowerCase().includes(q);
        const inDesc = course.description.toLowerCase().includes(q);
        const inTags = (course.tags || []).some((t) => t.toLowerCase().includes(q));
        if (!inTitle && !inDesc && !inTags) return false;
      }

      // Фильтр по оплате
      if (paidFilter === 'free' && course.isPaid) return false;
      if (paidFilter === 'paid' && !course.isPaid) return false;

      // Фильтр по уровню
      if (levelFilter !== 'all' && course.level !== levelFilter) return false;

      return true;
    });

    // Сортировка
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
      default:
        break;
    }

    return sorted;
  }, [marketplaceCourses, searchQuery, paidFilter, levelFilter, sortOption, onlyPublic]);

  return (
    <div className="flex-1 overflow-auto bg-[#1a1a1a] text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Banner — Coursera Style */}
        <motion.div 
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 to-indigo-900 p-8 mb-10 shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
              Ваш путь к успеху начинается здесь
            </h1>
            <p className="text-sky-100 text-lg mb-8 opacity-90">
              Откройте для себя тысячи курсов от экспертов со всего мира. Обучайтесь, делитесь знаниями и становитесь частью глобального сообщества.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="px-6 py-3 bg-white text-indigo-900 font-bold rounded-xl hover:bg-sky-50 transition-colors shadow-lg">
                Начать обучение
              </button>
              <button className="px-6 py-3 bg-indigo-800/40 backdrop-blur-md border border-indigo-400/30 text-white font-bold rounded-xl hover:bg-indigo-800/60 transition-colors">
                Стать автором
              </button>
            </div>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
          <Zap className="absolute -right-8 -bottom-8 text-white/10 w-64 h-64" />
        </motion.div>

        {/* Search and Filters Logic */}
        <div className="flex flex-col gap-6 mb-10">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-sky-400 transition-colors" size={22} />
              <input
                type="text"
                placeholder="Что вы хотите изучить сегодня?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-[#252525] border border-[#3a3a3a] rounded-2xl text-white text-lg placeholder-gray-500 focus:outline-none focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/10 transition-all shadow-inner"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-4 rounded-2xl border flex items-center gap-3 font-bold transition-all shadow-lg ${
                showFilters 
                  ? 'bg-sky-600 border-sky-500 text-white' 
                  : 'bg-[#252525] border-[#3a3a3a] text-gray-300 hover:border-[#4a4a4a]'
              }`}
            >
              <Filter size={20} />
              Фильтры
              <ChevronDown size={18} className={`transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                className="overflow-hidden bg-[#252525] border border-[#3a3a3a] rounded-2xl p-6 shadow-2xl"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {/* Paid Filter */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Тип доступа</h4>
                    <div className="space-y-2">
                      {(['all', 'free', 'paid'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setPaidFilter(type)}
                          className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm transition-colors ${
                            paidFilter === type ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30' : 'text-gray-400 hover:bg-white/5'
                          }`}
                        >
                          <span className="capitalize">{type === 'all' ? 'Все' : type === 'free' ? 'Бесплатные' : 'Платные'}</span>
                          {paidFilter === type && <Check size={16} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Level Filter */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Уровень</h4>
                    <div className="space-y-2">
                      {(['all', 'Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setLevelFilter(lvl)}
                          className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm transition-colors ${
                            levelFilter === lvl ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30' : 'text-gray-400 hover:bg-white/5'
                          }`}
                        >
                          <span>{lvl === 'all' ? 'Любой уровень' : lvl}</span>
                          {levelFilter === lvl && <Check size={16} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort Order */}
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
                            sortOption === opt.id ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30' : 'text-gray-400 hover:bg-white/5'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {sortOption === opt.id && <Check size={16} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Other Settings */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Дополнительно</h4>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-10 h-6 rounded-full relative transition-colors ${onlyPublic ? 'bg-sky-600' : 'bg-gray-600'}`}>
                          <input
                            type="checkbox"
                            checked={onlyPublic}
                            onChange={(e) => setOnlyPublic(e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${onlyPublic ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                        <span className="text-sm text-gray-300 font-medium">Только публичные</span>
                      </label>
                    </div>
                    <button 
                      onClick={() => {
                        setPaidFilter('all');
                        setLevelFilter('all');
                        setSortOption('relevance');
                        setSearchQuery('');
                      }}
                      className="mt-6 text-xs text-sky-500 hover:text-sky-400 font-bold underline decoration-sky-500/30 underline-offset-4"
                    >
                      Сбросить все фильтры
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Marketplace блок: похож на витрину Coursera */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8 border-b border-[#3a3a3a] pb-4">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <BookOpen size={28} className="text-sky-400" />
              Каталог курсов
            </h2>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-400">Найдено курсов:</span>
              <span className="bg-sky-500/20 text-sky-400 px-3 py-1 rounded-full font-bold">
                {filteredCourses.length}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.length === 0 && (
              <div className="col-span-full py-20 text-center bg-[#252525] rounded-3xl border border-dashed border-[#3a3a3a]">
                <div className="text-gray-500 text-lg mb-2">Ничего не найдено</div>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-sky-500 hover:text-sky-400 font-bold"
                >
                  Сбросить поиск
                </button>
              </div>
            )}
            {filteredCourses.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx, duration: 0.5 }}
                className="group bg-[#252525] border border-[#3a3a3a] rounded-3xl overflow-hidden hover:border-sky-500/50 hover:shadow-2xl hover:shadow-sky-500/5 transition-all cursor-pointer relative"
                onClick={() => setSelectedCourse(course)}
              >
                {/* Course Image Placeholder */}
                <div className="h-48 w-full bg-gradient-to-br from-[#2d2d2d] to-[#1f1f1f] relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:scale-110 transition-transform duration-700">
                    <BookOpen size={80} />
                  </div>
                  {/* Bestseller Badge */}
                  {idx === 0 && (
                    <div className="absolute top-4 left-4 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg shadow-lg">
                      Бестселлер
                    </div>
                  )}
                  {/* Level Badge */}
                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md border border-white/10">
                    {course.level}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5 text-yellow-400">
                      <Star size={14} className="fill-yellow-400" />
                      <span className="text-xs font-bold text-gray-200">4.9</span>
                      <span className="text-[10px] text-gray-500 font-medium">(1.2k отзывов)</span>
                    </div>
                    {course.isPaid ? (
                      <div className="text-sky-400 font-black text-lg">
                        {course.price} ₽
                      </div>
                    ) : (
                      <div className="text-green-400 font-black text-lg uppercase text-[12px] tracking-widest">
                        Бесплатно
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-sky-400 transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  
                  <p className="text-sm text-gray-400 line-clamp-2 mb-6 h-10">
                    {course.description}
                  </p>

                  <div className="pt-6 border-t border-[#3a3a3a] flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <UsersIcon size={14} className="text-sky-500/70" />
                        <span>245 учеников</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} className="text-sky-500/70" />
                        <span>{course.duration}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Левая часть: Рейтинг и пользователи (Геймификация) */}
          <div className="lg:col-span-4 space-y-8">
            <motion.div 
              className="bg-[#252525] border border-[#3a3a3a] rounded-3xl p-8 relative overflow-hidden shadow-xl"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Trophy size={24} className="text-yellow-500" />
                  Лидеры недели
                </h3>
                <div className="space-y-6">
                  {topContributors.map((user) => (
                    <div key={user.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-2xl bg-[#2d2d2d] border border-[#3a3a3a] flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform">
                            {user.avatar}
                          </div>
                          <div className={`absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-[#252525] shadow-md ${
                            user.rank === 1 ? 'bg-yellow-500 text-white' : 
                            user.rank === 2 ? 'bg-gray-400 text-white' : 
                            'bg-orange-600 text-white'
                          }`}>
                            {user.rank}
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-gray-100 group-hover:text-sky-400 transition-colors">{user.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                              LVL {user.level}
                            </span>
                            <span className="text-[10px] text-gray-500 font-bold">{user.xp} XP</span>
                          </div>
                        </div>
                      </div>
                      <Award size={20} className={user.rank === 1 ? 'text-yellow-500' : 'text-gray-600'} />
                    </div>
                  ))}
                </div>
                <button className="w-full mt-8 py-3 bg-[#2d2d2d] hover:bg-[#353535] rounded-xl text-sm font-bold text-gray-300 transition-all border border-[#3a3a3a]">
                  Посмотреть весь рейтинг
                </button>
              </div>
              <div className="absolute -right-4 -top-4 text-white/5 pointer-events-none">
                <Trophy size={120} />
              </div>
            </motion.div>

            <motion.div
              className="bg-[#252525] border border-[#3a3a3a] rounded-3xl p-8 shadow-xl"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <UsersIcon size={24} className="text-sky-500" />
                Сообщество
              </h3>
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder="Найти единомышленников..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#1f1f1f] border border-[#3a3a3a] text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-sky-500/50 transition-all"
                />
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {filteredUsers.map((user) => {
                  const userCourses = filteredCourses.filter(
                    (c) => (c.createdBy || 'Вы') === user.name || (user.id === 'me' && !c.createdBy)
                  );
                  return (
                    <button
                      key={user.id}
                      className="w-full flex items-center justify-between gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all text-left group"
                      type="button"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#2d2d2d] flex items-center justify-center text-lg shadow-inner group-hover:scale-110 transition-transform">
                          {user.avatar}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-100 group-hover:text-sky-400 transition-colors">
                            {user.name}
                          </div>
                          <div className="text-[10px] text-gray-500 font-medium">
                            {userCourses.length} курсов опубликовано
                          </div>
                        </div>
                      </div>
                      <ChevronDown size={16} className="-rotate-90 text-gray-600 group-hover:text-sky-500 transition-colors" />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Правая часть: Создание курса и Статистика */}
          <div className="lg:col-span-8 space-y-8">
            <motion.div 
              className="bg-gradient-to-br from-[#252525] to-[#1f1f1f] border border-[#3a3a3a] rounded-3xl p-8 shadow-2xl relative overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold flex items-center gap-3 text-white">
                    <Share2 size={24} className="text-sky-400" />
                    Создать новый курс
                  </h3>
                  <div className="flex gap-2">
                    <div className="px-3 py-1 bg-sky-500/10 text-sky-400 rounded-lg text-[10px] font-black uppercase tracking-widest">
                      Черновик
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Название курса</label>
                      <input
                        type="text"
                        placeholder="Например: Основы дизайна интерфейсов"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-[#3a3a3a] text-sm text-gray-100 focus:outline-none focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/5 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Категория</label>
                      <input
                        type="text"
                        placeholder="Дизайн, Разработка, Бизнес..."
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-[#3a3a3a] text-sm text-gray-100 focus:outline-none focus:border-sky-500/50 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Описание</label>
                      <textarea
                        placeholder="О чем этот курс? Какие навыки получит студент?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-[#3a3a3a] text-sm text-gray-100 focus:outline-none focus:border-sky-500/50 transition-all resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Теги</label>
                      <input
                        type="text"
                        placeholder="ui, ux, figma, дизайн"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-[#3a3a3a] text-sm text-gray-100 focus:outline-none focus:border-sky-500/50 transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Уровень</label>
                        <select
                          value={level}
                          onChange={(e) => setLevel(e.target.value as LevelFilter)}
                          className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-[#3a3a3a] text-sm text-gray-200 focus:outline-none focus:border-sky-500/50 transition-all appearance-none"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Длительность</label>
                        <input
                          type="text"
                          placeholder="4 недели"
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-[#3a3a3a] text-sm text-gray-100 focus:outline-none focus:border-sky-500/50 transition-all"
                        />
                      </div>
                    </div>

                    <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-2xl p-4 mt-2">
                      <div className="flex items-center justify-between mb-4">
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
                          <span className="text-sm font-bold text-gray-300">Сделать платным</span>
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
                      <p className="text-[10px] text-gray-500 leading-relaxed italic">
                        * Вы сможете изменить настройки приватности и цены в любое время после публикации курса в вашем профиле.
                      </p>
                    </div>

                    <motion.button
                      onClick={handleCreateCourse}
                      className="w-full mt-4 py-4 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-sky-900/40 flex items-center justify-center gap-3 transition-all"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Award size={20} />
                      ОПУБЛИКОВАТЬ КУРС
                    </motion.button>
                  </div>
                </div>
              </div>
              <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none translate-x-1/4 translate-y-1/4">
                <Share2 size={300} />
              </div>
            </motion.div>

            {/* Popular and Statistics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div 
                className="bg-[#252525] border border-[#3a3a3a] rounded-3xl p-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <TrendingUp size={22} className="text-sky-400" />
                  Статистика платформы
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1f1f1f] p-4 rounded-2xl border border-[#3a3a3a]">
                    <div className="text-2xl font-black text-white">{marketplaceCourses.length}</div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Курсов</div>
                  </div>
                  <div className="bg-[#1f1f1f] p-4 rounded-2xl border border-[#3a3a3a]">
                    <div className="text-2xl font-black text-white">{users.length}k+</div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Учеников</div>
                  </div>
                  <div className="bg-[#1f1f1f] p-4 rounded-2xl border border-[#3a3a3a]">
                    <div className="text-2xl font-black text-white">4.9</div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Рейтинг</div>
                  </div>
                  <div className="bg-[#1f1f1f] p-4 rounded-2xl border border-[#3a3a3a]">
                    <div className="text-2xl font-black text-white">12</div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Новых сегодня</div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-[#252525] border border-[#3a3a3a] rounded-3xl p-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <Award size={22} className="text-sky-400" />
                  Рекомендуем изучить
                </h3>
                <div className="space-y-4">
                  {allCourses.slice(0, 3).map((course, idx) => (
                    <div
                      key={course.id}
                      className="group flex items-center gap-4 cursor-pointer"
                      onClick={() => setSelectedCourse(course)}
                    >
                      <div className="w-12 h-12 rounded-xl bg-[#1f1f1f] border border-[#3a3a3a] flex items-center justify-center text-gray-500 group-hover:text-sky-400 group-hover:border-sky-500/50 transition-all shadow-lg">
                        <Zap size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-200 text-sm truncate group-hover:text-sky-400 transition-colors">{course.title}</div>
                        <div className="text-[10px] text-gray-500 font-bold uppercase">{course.level} • {course.duration}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
        {selectedCourse && (
          <CoursePreview course={selectedCourse} onClose={() => setSelectedCourse(null)} />
        )}
      </div>
    </div>
  );
}

