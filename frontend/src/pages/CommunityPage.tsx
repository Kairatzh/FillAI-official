'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, BookOpen, Search, Filter, TrendingUp, Users as UsersIcon, Clock, Star } from 'lucide-react';
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
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [onlyPublic, setOnlyPublic] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const users = getUsers();
  const [userSearch, setUserSearch] = useState('');
  const filteredUsers: UserProfile[] = useMemo(
    () => findUserByNameOrId(userSearch),
    [userSearch]
  );

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
        {/* Header — маркетплейс знаний */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Коммьюнити & Маркетплейс знаний
          </h1>
          <p className="text-gray-400">
            Делитесь своими курсами, находите новые, как на Coursera, и обсуждайте их с сообществом
          </p>
        </motion.div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Поиск курсов по названию, описанию или тегам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#252525] border border-[#3a3a3a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#3a3a3a]"
            />
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <button
              onClick={() => setPaidFilter('all')}
              className={`px-4 py-2 rounded-lg border text-sm flex items-center gap-2 ${
                paidFilter === 'all'
                  ? 'bg-[#2d2d2d] border-[#4a4a4a] text-white'
                  : 'bg-[#252525] border-[#3a3a3a] text-gray-300 hover:border-[#4a4a4a]'
              }`}
            >
              <Filter size={16} />
              Все
            </button>
            <button
              onClick={() => setPaidFilter('free')}
              className={`px-4 py-2 rounded-lg border text-sm ${
                paidFilter === 'free'
                  ? 'bg-[#2d2d2d] border-[#4a4a4a] text-white'
                  : 'bg-[#252525] border-[#3a3a3a] text-gray-300 hover:border-[#4a4a4a]'
              }`}
            >
              Бесплатные
            </button>
            <button
              onClick={() => setPaidFilter('paid')}
              className={`px-4 py-2 rounded-lg border text-sm ${
                paidFilter === 'paid'
                  ? 'bg-[#2d2d2d] border-[#4a4a4a] text-white'
                  : 'bg-[#252525] border-[#3a3a3a] text-gray-300 hover:border-[#4a4a4a]'
              }`}
            >
              Платные
            </button>
            <label className="flex items-center gap-2 text-xs text-gray-300 ml-1">
              <input
                type="checkbox"
                checked={onlyPublic}
                onChange={(e) => setOnlyPublic(e.target.checked)}
                className="rounded bg-[#252525] border-[#3a3a3a]"
              />
              Только публичные
            </label>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as LevelFilter)}
              className="px-3 py-2 rounded-lg bg-[#252525] border border-[#3a3a3a] text-sm text-gray-200 focus:outline-none focus:border-[#4a4a4a]"
            >
              <option value="all">Все уровни</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="px-3 py-2 rounded-lg bg-[#252525] border border-[#3a3a3a] text-sm text-gray-200 focus:outline-none focus:border-[#4a4a4a]"
            >
              <option value="relevance">По релевантности</option>
              <option value="newest">Сначала новые</option>
              <option value="price_low">Цена: по возрастанию</option>
              <option value="price_high">Цена: по убыванию</option>
            </select>
          </div>
        </div>

        {/* Marketplace блок: похож на витрину Coursera */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
              <BookOpen size={22} />
              Маркетплейс курсов сообщества
            </h2>
            <span className="text-sm text-gray-400">
              Курсов: <span className="font-semibold text-white">{filteredCourses.length}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredCourses.length === 0 && (
              <div className="col-span-full text-gray-400 text-sm">
                Курсы по заданным критериям не найдены. Попробуйте изменить фильтры или добавить свой курс.
              </div>
            )}
            {filteredCourses.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * idx }}
                className="bg-[#252525] border border-[#3a3a3a] rounded-xl p-4 flex flex-col justify-between hover:border-[#4a4a4a] hover:bg-[#2d2d2d] transition-all cursor-pointer"
                whileHover={{ y: -4, scale: 1.02 }}
                onClick={() => setSelectedCourse(course)}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wide text-gray-400">
                      Курс сообщества
                    </span>
                    <div className="flex items-center gap-1 text-yellow-400 text-xs">
                      <Star size={14} className="fill-yellow-400" />
                      <span>4.8</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                    {course.description}
                  </p>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <UsersIcon size={14} />
                      <span>Сообщество</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{course.duration}</span>
                    </span>
                    {course.isPaid ? (
                      <span className="flex items-center gap-1 text-green-300 font-semibold">
                        {course.price ?? 0} ₽
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-blue-300 font-semibold">
                        Бесплатно
                      </span>
                    )}
                  </div>
                  <button className="px-3 py-1.5 rounded-lg bg-white/5 border border-[#3a3a3a] text-[11px] text-gray-100 hover:bg-white/10 transition-colors">
                    Подробнее
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Правая колонка: статистика, популярные курсы, создание курса, поиск пользователей */}
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
                  <span className="text-gray-400">Курсов в маркетплейсе</span>
                  <span className="text-white font-semibold">{filteredCourses.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Всего курсов</span>
                  <span className="text-white font-semibold">{allCourses.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Создатель</span>
                  <span className="text-white font-semibold flex items-center gap-1">
                    <UsersIcon size={16} />
                    Вы и сообщество
                  </span>
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
                {allCourses.slice(0, 3).map((course, idx) => (
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
                {allCourses.length === 0 && (
                  <p className="text-gray-400 text-sm">Пока нет курсов</p>
                )}
              </div>
            </motion.div>

            {/* Добавление собственного курса */}
            <motion.div 
              className="bg-[#252525] border border-[#3a3a3a] rounded-xl p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Share2 size={20} />
                Добавить свой курс
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Название курса"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#1f1f1f] border border-[#3a3a3a] text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#4a4a4a]"
                />
                <input
                  type="text"
                  placeholder="Группа / категория (например, Frontend, Английский)"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#1f1f1f] border border-[#3a3a3a] text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#4a4a4a]"
                />
                <textarea
                  placeholder="Краткое описание курса (как на витрине Coursera)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-[#1f1f1f] border border-[#3a3a3a] text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#4a4a4a] resize-none"
                />
                <input
                  type="text"
                  placeholder="Теги (через запятую: javascript, beginner, практика)"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#1f1f1f] border border-[#3a3a3a] text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#4a4a4a]"
                />
                <div className="flex gap-2">
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as LevelFilter)}
                    className="flex-1 px-3 py-2 rounded-lg bg-[#1f1f1f] border border-[#3a3a3a] text-sm text-gray-200 focus:outline-none focus:border-[#4a4a4a]"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Длительность (например, 4 недели)"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-[#1f1f1f] border border-[#3a3a3a] text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#4a4a4a]"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={isPaid}
                      onChange={(e) => setIsPaid(e.target.checked)}
                      className="rounded bg-[#1f1f1f] border-[#3a3a3a]"
                    />
                    Сделать курс платным
                  </label>
                  {isPaid && (
                    <input
                      type="number"
                      min={0}
                      placeholder="Цена, ₽"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-28 px-2 py-1.5 rounded-lg bg-[#1f1f1f] border border-[#3a3a3a] text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#4a4a4a]"
                    />
                  )}
                </div>
                <motion.button
                  onClick={handleCreateCourse}
                  className="w-full mt-2 px-4 py-3 bg-[#2d2d2d] hover:bg-[#353535] border border-[#3a3a3a] rounded-lg transition-colors text-white font-medium text-sm flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Share2 size={18} />
                  Опубликовать курс в коммьюнити
                </motion.button>
              </div>
            </motion.div>

            {/* Поиск пользователей и их курсов */}
            <motion.div
              className="bg-[#252525] border border-[#3a3a3a] rounded-xl p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <UsersIcon size={20} />
                Пользователи и друзья
              </h3>
              <div className="mb-3 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type="text"
                  placeholder="Поиск пользователей..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#1f1f1f] border border-[#3a3a3a] text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#4a4a4a]"
                />
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {filteredUsers.map((user) => {
                  const userCourses = filteredCourses.filter(
                    (c) => (c.createdBy || 'Вы') === user.name || (user.id === 'me' && !c.createdBy)
                  );
                  return (
                    <button
                      key={user.id}
                      className="w-full flex items-center justify-between gap-3 px-2 py-2 rounded-lg hover:bg-[#2a2a2a] transition-colors text-left"
                      type="button"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#2d2d2d] flex items-center justify-center text-xs font-semibold text-gray-100">
                          {user.avatar}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-100">
                            {user.name}
                          </div>
                          {user.bio && (
                            <div className="text-[10px] text-gray-400 line-clamp-1">{user.bio}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-[10px] text-gray-400 text-right">
                        <div>{userCourses.length} курсов</div>
                        <div className="text-blue-300">посмотреть</div>
                      </div>
                    </button>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <p className="text-xs text-gray-500">Пользователи не найдены.</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
        {selectedCourse && (
          <CoursePreview course={selectedCourse} onClose={() => setSelectedCourse(null)} />
        )}
      </div>
    </div>
  );
}

