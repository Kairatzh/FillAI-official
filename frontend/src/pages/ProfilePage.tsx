'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Calendar, BookOpen, Trophy, Settings, Edit2, Save, Bell, 
  Shield, Moon, Globe, X, Star, Users as UsersIcon, Send, 
  Search, MessageSquare, Award, Zap, Heart, Target, TrendingUp,
  ChevronRight, Bookmark, Clock, Crown, Flame, Medal, Gem,
  BarChart3, Activity, PlayCircle, CheckCircle2, Sparkles,
  Gift, Coins, TrendingDown, ArrowUp, ArrowDown, Gamepad2
} from 'lucide-react';
import { getCourses, Course, getUsers, UserProfile, getUserEnrolledCourses, getUserCreatedCourses, getCategories, getSharedCourses } from '@/data/mockStore';
import { useUIStore } from '@/store/uiStore';
import CoursePreview from '@/components/CoursePreview';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'learning' | 'created' | 'achievements' | 'messages' | 'stats'>('overview');

  const [userData, setUserData] = useState({
    name: 'Иван Иванов',
    email: 'ivan@example.com',
    bio: 'Увлеченный изучатель. Люблю изучать новые технологии и языки. Всегда стремлюсь к новым знаниям!',
    joinDate: 'Январь 2024',
    level: 15,
    xp: 2450,
    nextLevelXp: 3000,
    rank: 'Золотой исследователь',
    streak: 12, // Дней подряд
    totalXp: 12500,
    rankPosition: 42, // Позиция в рейтинге
  });

  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: true,
    darkMode: true,
    language: 'ru',
    privacy: 'public',
  });

  // Чат с друзьями
  const [selectedFriend, setSelectedFriend] = useState<UserProfile | null>(null);
  const [messageText, setMessageText] = useState('');
  const [chats, setChats] = useState<Record<string, {text: string, sender: 'me' | 'them', time: string}[]>>({
    '1': [
      { text: 'Привет! Как успехи в изучении Python?', sender: 'them', time: '10:30' },
      { text: 'Привет! Идет отлично, разобрался с декораторами.', sender: 'me', time: '10:35' },
    ],
  });

  const users = getUsers().filter(u => u.id !== 'me');
  const allCourses = getCourses();
  const createdByMe = getUserCreatedCourses('me'); // Курсы, созданные пользователем
  const enrolledCourses = getUserEnrolledCourses('me'); // Курсы, на которые записан пользователь
  const publicCourses = allCourses.filter((c) => c.isPublic !== false);
  const categories = getCategories();

  const stats = [
    { label: 'Курсы пройдено', value: 8, icon: Trophy, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', change: '+2', trend: 'up' },
    { label: 'Часов обучения', value: 124, icon: Clock, color: 'text-sky-400', bgColor: 'bg-sky-500/10', change: '+15', trend: 'up' },
    { label: 'Друзей', value: 12, icon: UsersIcon, color: 'text-blue-400', bgColor: 'bg-blue-500/10', change: '+3', trend: 'up' },
    { label: 'Очков опыта', value: userData.xp, icon: Zap, color: 'text-orange-400', bgColor: 'bg-orange-500/10', change: '+250', trend: 'up' },
  ];

  const achievements = [
    { id: 1, title: 'Первый шаг', desc: 'Завершите свой первый урок', icon: Target, color: 'bg-emerald-500', unlocked: true, rarity: 'common', xp: 50 },
    { id: 2, title: 'Гуру Python', desc: 'Пройдите все курсы по Python', icon: Award, color: 'bg-blue-500', unlocked: true, rarity: 'rare', xp: 200 },
    { id: 3, title: 'Автор года', desc: 'Создайте 5 популярных курсов', icon: Trophy, color: 'bg-amber-500', unlocked: false, rarity: 'epic', xp: 500 },
    { id: 4, title: 'Помощник', desc: 'Ответьте на 10 вопросов в коммьюнити', icon: Heart, color: 'bg-rose-500', unlocked: true, rarity: 'common', xp: 100 },
    { id: 5, title: 'Мастер знаний', desc: 'Достигните 10 уровня', icon: Crown, color: 'bg-blue-500', unlocked: true, rarity: 'rare', xp: 300 },
    { id: 6, title: 'Огненная серия', desc: 'Учитесь 30 дней подряд', icon: Flame, color: 'bg-red-500', unlocked: false, rarity: 'legendary', xp: 1000 },
    { id: 7, title: 'Сокровище знаний', desc: 'Соберите 50 достижений', icon: Gem, color: 'bg-cyan-500', unlocked: false, rarity: 'epic', xp: 750 },
    { id: 8, title: 'Легенда', desc: 'Займите топ-10 в рейтинге', icon: Medal, color: 'bg-yellow-500', unlocked: false, rarity: 'legendary', xp: 1500 },
  ];

  const weeklyProgress = [
    { day: 'Пн', xp: 120, completed: true },
    { day: 'Вт', xp: 200, completed: true },
    { day: 'Ср', xp: 80, completed: true },
    { day: 'Чт', xp: 150, completed: true },
    { day: 'Пт', xp: 180, completed: true },
    { day: 'Сб', xp: 100, completed: true },
    { day: 'Вс', xp: 0, completed: false },
  ];

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedFriend) return;
    const friendId = selectedFriend.id;
    const newMessage = { text: messageText, sender: 'me' as const, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChats({
      ...chats,
      [friendId]: [...(chats[friendId] || []), newMessage]
    });
    setMessageText('');
  };

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const xpProgress = (userData.xp / userData.nextLevelXp) * 100;
  const levelProgress = ((userData.level - 1) / 50) * 100; // Предполагаем 50 уровней

  return (
    <div className="flex-1 overflow-auto bg-[#1a1a1a] text-white">
      {/* Hero Section with Gradient */}
      <div className="relative overflow-hidden bg-[#1a1a1a] border-b border-[#3a3a3a]">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="lg:col-span-2 bg-[#252525]/80 backdrop-blur-xl border border-[#3a3a3a] rounded-3xl p-8 relative overflow-hidden shadow-2xl"
            >
              <div className="absolute inset-0 bg-[#1a1a1a]/50"></div>
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                  {/* Avatar with Level Badge */}
                  <div className="relative group">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-sky-500 to-sky-600 p-1 shadow-2xl shadow-sky-500/30">
                        <div className="w-full h-full rounded-[20px] bg-[#1a1a1a] flex items-center justify-center text-4xl font-black text-white">
                          {userData.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      </div>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                        className="absolute -bottom-3 -right-3 w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 border-4 border-[#252525] flex items-center justify-center font-black text-white shadow-2xl"
                      >
                        <div className="text-center">
                          <div className="text-xs leading-tight">LVL</div>
                          <div className="text-2xl">{userData.level}</div>
                        </div>
                      </motion.div>
                    </div>
                    {userData.streak > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg"
                      >
                        <Flame size={12} className="fill-current" />
                        {userData.streak} дней
                      </motion.div>
                    )}
                  </div>

                  <div className="flex-1 w-full text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
                      <div>
                        <h2 className="text-4xl font-black mb-2 text-white">
                          {userData.name}
                        </h2>
                        <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                          <span className="px-3 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 rounded-lg text-xs font-bold uppercase tracking-widest border border-amber-500/30 flex items-center gap-1">
                            <Crown size={12} />
                            {userData.rank}
                          </span>
                          <span className="text-gray-400 text-sm font-medium flex items-center gap-1">
                            <Calendar size={14} />
                            С {userData.joinDate}
                          </span>
                          <span className="text-gray-400 text-sm font-medium flex items-center gap-1">
                            <TrendingUp size={14} className="text-green-400" />
                            #{userData.rankPosition} в рейтинге
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="px-6 py-2.5 bg-[#2d2d2d] hover:bg-[#353535] border border-[#3a3a3a] rounded-2xl transition-all flex items-center gap-2 text-sm font-bold text-gray-300"
                      >
                        <Edit2 size={16} />
                        {isEditing ? 'Закрыть' : 'Изменить'}
                      </button>
                    </div>

                    {/* XP Progress Bar */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Прогресс уровня</span>
                        <span className="text-xs font-bold text-sky-400">{userData.xp} / {userData.nextLevelXp} XP</span>
                      </div>
                      <div className="w-full h-4 bg-[#1a1a1a] rounded-full overflow-hidden border border-[#3a3a3a] relative">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${xpProgress}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-sky-500 to-sky-600 shadow-[0_0_20px_rgba(14,165,233,0.5)] relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                        </motion.div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        До следующего уровня: <span className="text-sky-400 font-bold">{userData.nextLevelXp - userData.xp} XP</span>
                      </div>
                    </div>

                    <p className="mt-6 text-gray-300 text-base leading-relaxed">
                      {userData.bio}
                    </p>
                  </div>
                </div>
              </div>
              {/* Background Decoration */}
              <Sparkles className="absolute -right-10 -top-10 text-white/5 w-64 h-64 pointer-events-none" />
            </motion.div>

            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Total XP Card */}
              <div className="bg-[#252525] border border-[#3a3a3a] rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-sky-500/20">
                    <Zap size={24} className="text-sky-400" />
                  </div>
                  <span className="text-xs font-bold text-sky-300 uppercase">Всего XP</span>
                </div>
                <div className="text-4xl font-black text-white mb-1">{userData.totalXp.toLocaleString()}</div>
                <div className="flex items-center gap-2 text-sm text-sky-300">
                  <TrendingUp size={14} />
                  <span>+{userData.xp} за этот уровень</span>
                </div>
              </div>

              {/* Streak Card */}
              <div className="bg-[#252525] border border-[#3a3a3a] rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-orange-500/20">
                    <Flame size={24} className="text-orange-400 fill-current" />
                  </div>
                  <span className="text-xs font-bold text-orange-300 uppercase">Серия</span>
                </div>
                <div className="text-4xl font-black text-white mb-1">{userData.streak}</div>
                <div className="text-sm text-orange-300">дней подряд</div>
              </div>

              {/* Rank Card */}
              <div className="bg-[#252525] border border-[#3a3a3a] rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-amber-500/20">
                    <Trophy size={24} className="text-amber-400" />
                  </div>
                  <span className="text-xs font-bold text-amber-300 uppercase">Рейтинг</span>
                </div>
                <div className="text-4xl font-black text-white mb-1">#{userData.rankPosition}</div>
                <div className="text-sm text-amber-300">в топ-100</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[#252525] border border-[#3a3a3a] rounded-2xl p-6 hover:border-sky-500/50 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                  <stat.icon size={20} className={stat.color} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold ${
                  stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.trend === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  {stat.change}
                </div>
              </div>
              <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          {[
            { id: 'overview', label: 'Обзор', icon: BarChart3 },
            { id: 'learning', label: 'Мое обучение', icon: BookOpen },
            { id: 'created', label: 'Созданные курсы', icon: Edit2 },
            { id: 'achievements', label: 'Достижения', icon: Award },
            { id: 'stats', label: 'Статистика', icon: Activity },
            { id: 'messages', label: 'Сообщения', icon: MessageSquare },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-xl flex items-center gap-2 font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-sky-600 text-white shadow-xl shadow-sky-900/40'
                  : 'bg-[#252525] text-gray-400 hover:text-white border border-[#3a3a3a] hover:border-sky-500/50'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="min-h-[400px]"
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Weekly Progress */}
              <div className="bg-[#252525] border border-[#3a3a3a] rounded-3xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black flex items-center gap-3">
                    <Activity size={24} className="text-sky-400" />
                    Недельный прогресс
                  </h3>
                  <span className="text-sm text-gray-400">Эта неделя</span>
                </div>
                <div className="grid grid-cols-7 gap-4">
                  {weeklyProgress.map((day, idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-xs text-gray-500 mb-2">{day.day}</div>
                      <div className="relative h-32 bg-[#1a1a1a] rounded-xl border border-[#3a3a3a] flex items-end justify-center p-2 group">
                        {day.completed && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(day.xp / 200) * 100}%` }}
                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                            className="w-full bg-gradient-to-t from-sky-500 to-sky-600 rounded-lg relative overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent"></div>
                          </motion.div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded">{day.xp} XP</span>
                        </div>
                      </div>
                      {day.completed && (
                        <CheckCircle2 size={16} className="text-green-400 mx-auto mt-2" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#252525] border border-[#3a3a3a] rounded-3xl p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <PlayCircle size={20} className="text-sky-400" />
                    Недавняя активность
                  </h3>
                  <div className="space-y-4">
                    {[
                      { action: 'Завершил урок', course: 'Основы React', time: '2 часа назад', icon: CheckCircle2, color: 'text-green-400' },
                      { action: 'Получил достижение', course: 'Первый шаг', time: '5 часов назад', icon: Award, color: 'text-yellow-400' },
                      { action: 'Начал курс', course: 'Python для начинающих', time: 'Вчера', icon: PlayCircle, color: 'text-blue-400' },
                    ].map((activity, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-3 bg-[#1a1a1a] rounded-xl border border-[#3a3a3a]">
                        <div className={`p-2 rounded-lg bg-[#2d2d2d] ${activity.color}`}>
                          <activity.icon size={18} />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-white">{activity.action}</div>
                          <div className="text-xs text-gray-400">{activity.course}</div>
                        </div>
                        <div className="text-xs text-gray-500">{activity.time}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#252525] border border-[#3a3a3a] rounded-3xl p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Gamepad2 size={20} className="text-blue-400" />
                    Геймификация
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-sky-500/10 border border-sky-500/20 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-sky-300">Ежедневная цель</span>
                        <span className="text-xs text-gray-400">150 XP</span>
                      </div>
                      <div className="w-full h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                        <div className="h-full w-[80%] bg-gradient-to-r from-sky-500 to-sky-600"></div>
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-amber-300">Бонус за серию</span>
                        <span className="text-xs text-gray-400">+{userData.streak * 10}% XP</span>
                      </div>
                      <div className="text-xs text-gray-400">Учитесь каждый день для максимального бонуса!</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'learning' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {publicCourses.map((course, idx) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setSelectedCourse(course)}
                  className="group bg-[#252525] border border-[#3a3a3a] rounded-3xl p-6 hover:border-sky-500/50 transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-400 border border-sky-500/30">
                        <Zap size={24} />
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-tighter px-2 py-1 bg-[#1a1a1a] rounded-lg text-gray-500 border border-[#3a3a3a]">
                        {course.level}
                      </div>
                    </div>
                    <h4 className="text-xl font-bold mb-4 line-clamp-2 group-hover:text-sky-400 transition-colors">{course.title}</h4>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                      <span className="flex items-center gap-1.5">
                        <Trophy size={14} className="text-yellow-500" /> 
                        80% пройден
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Bookmark size={14} /> 
                        {course.duration}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[#1a1a1a] rounded-full overflow-hidden border border-[#3a3a3a]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '80%' }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                        className="h-full bg-gradient-to-r from-sky-500 to-sky-600"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'created' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-black mb-2">Созданные курсы</h3>
                  <p className="text-gray-400">Курсы, которые вы создали в графе знаний или сообществе</p>
                </div>
                <button
                  onClick={() => setCurrentPage('community')}
                  className="px-6 py-3 bg-sky-600 hover:bg-sky-500 rounded-xl font-bold flex items-center gap-2 transition-colors"
                >
                  <Edit2 size={18} />
                  Создать новый
                </button>
              </div>

              {createdByMe.length === 0 ? (
                <div className="py-20 text-center bg-[#252525] rounded-3xl border border-dashed border-[#3a3a3a]">
                  <BookOpen size={64} className="mx-auto text-gray-600 mb-4" />
                  <div className="text-gray-400 text-lg mb-2">У вас пока нет созданных курсов</div>
                  <p className="text-gray-500 text-sm mb-4">Создайте курс в графе знаний или в сообществе</p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => setCurrentPage('graph')}
                      className="px-6 py-2 bg-sky-600 hover:bg-sky-500 rounded-lg font-semibold transition-colors"
                    >
                      Граф знаний
                    </button>
                    <button
                      onClick={() => setCurrentPage('community')}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors"
                    >
                      Сообщество
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {createdByMe.map((course, idx) => {
                    const category = categories.find(cat => cat.id === course.category);
                    const isPublished = getSharedCourses().some(sc => sc.courseId === course.id);
                    return (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => setSelectedCourse(course)}
                        className="group bg-[#252525] border border-[#3a3a3a] rounded-3xl p-6 hover:border-sky-500/50 transition-all cursor-pointer relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-400 border border-sky-500/30">
                              <Zap size={24} />
                            </div>
                            <div className="flex items-center gap-2">
                              {isPublished && (
                                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded border border-green-500/30">
                                  Опубликован
                                </span>
                              )}
                              <span className="text-[10px] font-black uppercase tracking-tighter px-2 py-1 bg-[#1a1a1a] rounded-lg text-gray-500 border border-[#3a3a3a]">
                                {course.level}
                              </span>
                            </div>
                          </div>
                          <h4 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-sky-400 transition-colors">{course.title}</h4>
                          <p className="text-sm text-gray-400 line-clamp-2 mb-4 h-10">{course.description}</p>
                          <div className="space-y-2 mb-4">
                            {category && (
                              <div className="text-xs text-gray-500">
                                Категория: <span className="text-sky-400">{category.label}</span>
                              </div>
                            )}
                            {course.tags && course.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {course.tags.slice(0, 3).map((tag, tagIdx) => (
                                  <span key={tagIdx} className="px-2 py-0.5 bg-[#1a1a1a] rounded text-[10px] text-gray-400 border border-[#3a3a3a]">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500 pt-4 border-t border-[#3a3a3a]">
                            <span className="flex items-center gap-1.5">
                              <UsersIcon size={14} />
                              <span>{course.enrolledStudents?.length || 0} студентов</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock size={14} />
                              <span>{course.duration}</span>
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'achievements' && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black mb-2">Достижения</h3>
                  <p className="text-gray-400">Разблокируйте все достижения и станьте легендой!</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-white">
                    {achievements.filter(a => a.unlocked).length} / {achievements.length}
                  </div>
                  <div className="text-sm text-gray-400">Разблокировано</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {achievements.map((ach, idx) => {
                  const rarityColors = {
                    common: 'from-gray-500 to-gray-600',
                    rare: 'from-blue-500 to-cyan-500',
                    epic: 'from-sky-500 to-blue-600',
                    legendary: 'from-amber-500 via-orange-500 to-red-500',
                  };
                  return (
                    <motion.div
                      key={ach.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`bg-[#252525] border-2 rounded-3xl p-8 flex flex-col items-center text-center transition-all relative overflow-hidden ${
                        ach.unlocked 
                          ? `border-${ach.color.split('-')[1]}-500/50 shadow-2xl shadow-${ach.color.split('-')[1]}-500/20` 
                          : 'border-[#3a3a3a] opacity-50 grayscale'
                      }`}
                    >
                      {ach.unlocked && (
                        <div className={`absolute inset-0 bg-gradient-to-br ${rarityColors[ach.rarity as keyof typeof rarityColors]}/10 opacity-50`}></div>
                      )}
                      <div className={`relative w-24 h-24 rounded-3xl ${ach.color} flex items-center justify-center text-white mb-6 shadow-2xl ${
                        ach.unlocked ? 'animate-pulse' : ''
                      }`}>
                        <ach.icon size={48} />
                        {ach.unlocked && (
                          <div className="absolute -top-2 -right-2">
                            <Sparkles size={20} className="text-yellow-400 fill-current animate-pulse" />
                          </div>
                        )}
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2 relative z-10">{ach.title}</h4>
                      <p className="text-sm text-gray-400 leading-relaxed mb-4 relative z-10">{ach.desc}</p>
                      <div className="flex items-center gap-2 relative z-10">
                        <Coins size={14} className="text-yellow-400" />
                        <span className="text-xs font-bold text-yellow-400">{ach.xp} XP</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className={`text-xs font-bold uppercase ${
                          ach.rarity === 'common' ? 'text-gray-400' :
                          ach.rarity === 'rare' ? 'text-blue-400' :
                          ach.rarity === 'epic' ? 'text-blue-400' :
                          'text-amber-400'
                        }`}>
                          {ach.rarity === 'common' ? 'Обычное' :
                           ach.rarity === 'rare' ? 'Редкое' :
                           ach.rarity === 'epic' ? 'Эпическое' :
                           'Легендарное'}
                        </span>
                      </div>
                      {!ach.unlocked && (
                        <div className="mt-4 px-3 py-1 bg-[#1a1a1a] rounded-lg text-[10px] font-bold text-gray-600 uppercase tracking-widest relative z-10">
                          Заблокировано
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#252525] border border-[#3a3a3a] rounded-3xl p-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <BarChart3 size={20} className="text-sky-400" />
                    Прогресс обучения
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Общий прогресс</span>
                        <span className="text-sm font-bold text-white">{Math.round(levelProgress)}%</span>
                      </div>
                      <div className="w-full h-3 bg-[#1a1a1a] rounded-full overflow-hidden border border-[#3a3a3a]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${levelProgress}%` }}
                          transition={{ duration: 1 }}
                          className="h-full bg-gradient-to-r from-sky-500 to-sky-600"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Курсы завершено</span>
                        <span className="text-sm font-bold text-white">8 / 12</span>
                      </div>
                      <div className="w-full h-3 bg-[#1a1a1a] rounded-full overflow-hidden border border-[#3a3a3a]">
                        <div className="h-full w-[66%] bg-gradient-to-r from-green-500 to-emerald-500" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-[#252525] border border-[#3a3a3a] rounded-3xl p-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <TrendingUp size={20} className="text-blue-400" />
                    Рост навыков
                  </h3>
                  <div className="space-y-4">
                    {['Python', 'React', 'JavaScript', 'TypeScript'].map((skill, idx) => (
                      <div key={skill}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-white">{skill}</span>
                          <span className="text-sm font-bold text-gray-400">{75 + idx * 5}%</span>
                        </div>
                        <div className="w-full h-2 bg-[#1a1a1a] rounded-full overflow-hidden border border-[#3a3a3a]">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${75 + idx * 5}%` }}
                            transition={{ delay: idx * 0.2, duration: 0.8 }}
                            className="h-full bg-gradient-to-r from-sky-500 to-blue-600"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="bg-[#252525] border border-[#3a3a3a] rounded-3xl overflow-hidden shadow-2xl flex h-[600px]">
              {/* Friends List */}
              <div className="w-80 border-r border-[#3a3a3a] flex flex-col bg-[#1f1f1f]">
                <div className="p-6 border-b border-[#3a3a3a] bg-[#252525]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input 
                      type="text" 
                      placeholder="Поиск друзей..."
                      className="w-full pl-10 pr-4 py-2 bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl text-sm focus:outline-none focus:border-sky-500/50 text-white"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => setSelectedFriend(user)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                        selectedFriend?.id === user.id ? 'bg-sky-500/10 border border-sky-500/30' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-sky-500/20 flex items-center justify-center text-xl shadow-lg border border-sky-500/30">
                        {user.avatar}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="font-bold text-white text-sm truncate">{user.name}</div>
                        <div className="text-[10px] text-gray-500 font-medium truncate">Был(а) недавно</div>
                      </div>
                      {user.id === '1' && (
                        <div className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.8)] animate-pulse" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Window */}
              <div className="flex-1 flex flex-col bg-[#1f1f1f]/50">
                {selectedFriend ? (
                  <>
                    <div className="p-6 border-b border-[#3a3a3a] flex items-center justify-between bg-[#252525]">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center text-lg border border-sky-500/30">
                          {selectedFriend.avatar}
                        </div>
                        <div>
                          <div className="font-bold text-white">{selectedFriend.name}</div>
                          <div className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">В сети</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400"><Settings size={20} /></button>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                      {(chats[selectedFriend.id] || []).map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] p-4 rounded-2xl text-sm ${
                            msg.sender === 'me' 
                              ? 'bg-sky-600 text-white rounded-br-none shadow-xl shadow-sky-900/20' 
                              : 'bg-[#2d2d2d] text-gray-100 rounded-bl-none border border-[#3a3a3a]'
                          }`}>
                            {msg.text}
                            <div className={`text-[10px] mt-2 opacity-50 ${msg.sender === 'me' ? 'text-right' : 'text-left'}`}>
                              {msg.time}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-6 bg-[#252525] border-t border-[#3a3a3a]">
                      <div className="relative flex items-center gap-4">
                        <input
                          type="text"
                          placeholder="Напишите сообщение..."
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          className="flex-1 px-6 py-4 bg-[#1a1a1a] border border-[#3a3a3a] rounded-2xl text-sm focus:outline-none focus:border-sky-500/50 transition-all text-white"
                        />
                        <button 
                          onClick={handleSendMessage}
                          className="p-4 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl shadow-xl transition-all transform active:scale-95"
                        >
                          <Send size={20} />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-500 opacity-50 p-12 text-center">
                    <MessageSquare size={80} className="mb-6" />
                    <h3 className="text-2xl font-bold mb-2">Ваши сообщения</h3>
                    <p>Выберите друга из списка слева, чтобы начать общение и делиться успехами в обучении.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Settings Button */}
        <div className="mt-8">
          <motion.button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-full px-6 py-4 bg-[#252525] hover:bg-[#2d2d2d] border border-[#3a3a3a] rounded-xl transition-colors flex items-center justify-center gap-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Settings size={20} />
            <span>Настройки аккаунта</span>
          </motion.button>
        </div>

        {/* Settings Modal */}
        <AnimatePresence>
          {isSettingsOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                onClick={() => setIsSettingsOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                <div 
                  className="bg-[#252525] border border-[#3a3a3a] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="sticky top-0 bg-[#252525] border-b border-[#3a3a3a] p-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Настройки</h2>
                    <button
                      onClick={() => setIsSettingsOpen(false)}
                      className="p-2 hover:bg-[#2d2d2d] rounded-lg transition-colors"
                    >
                      <X size={24} className="text-gray-400" />
                    </button>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Уведомления */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Bell size={20} />
                        Уведомления
                      </h3>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between p-4 bg-[#2d2d2d] rounded-lg border border-[#3a3a3a] cursor-pointer hover:bg-[#353535] transition-colors">
                          <span className="text-gray-300">Включить уведомления</span>
                          <input
                            type="checkbox"
                            checked={settings.notifications}
                            onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                            className="w-5 h-5 rounded bg-[#3a3a3a] border-[#4a4a4a]"
                          />
                        </label>
                        <label className="flex items-center justify-between p-4 bg-[#2d2d2d] rounded-lg border border-[#3a3a3a] cursor-pointer hover:bg-[#353535] transition-colors">
                          <span className="text-gray-300">Email уведомления</span>
                          <input
                            type="checkbox"
                            checked={settings.emailNotifications}
                            onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                            className="w-5 h-5 rounded bg-[#3a3a3a] border-[#4a4a4a]"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Внешний вид */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Moon size={20} />
                        Внешний вид
                      </h3>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between p-4 bg-[#2d2d2d] rounded-lg border border-[#3a3a3a] cursor-pointer hover:bg-[#353535] transition-colors">
                          <span className="text-gray-300">Темный режим</span>
                          <input
                            type="checkbox"
                            checked={settings.darkMode}
                            onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })}
                            className="w-5 h-5 rounded bg-[#3a3a3a] border-[#4a4a4a]"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Конфиденциальность */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Shield size={20} />
                        Конфиденциальность
                      </h3>
                      <div className="space-y-3">
                        <label className="block">
                          <span className="text-gray-300 mb-2 block">Видимость профиля</span>
                          <select
                            value={settings.privacy}
                            onChange={(e) => setSettings({ ...settings, privacy: e.target.value })}
                            className="w-full px-4 py-2 bg-[#2d2d2d] border border-[#3a3a3a] rounded-lg text-gray-300"
                          >
                            <option value="public">Публичный</option>
                            <option value="private">Приватный</option>
                            <option value="friends">Только друзья</option>
                          </select>
                        </label>
                      </div>
                    </div>

                    {/* Язык */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Globe size={20} />
                        Язык
                      </h3>
                      <div className="space-y-3">
                        <select
                          value={settings.language}
                          onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                          className="w-full px-4 py-2 bg-[#2d2d2d] border border-[#3a3a3a] rounded-lg text-gray-300"
                        >
                          <option value="ru">Русский</option>
                          <option value="en">English</option>
                          <option value="es">Español</option>
                        </select>
                      </div>
                    </div>

                    {/* Кнопка сохранения */}
                    <div className="pt-4 border-t border-[#3a3a3a]">
                      <button
                        onClick={() => setIsSettingsOpen(false)}
                        className="w-full px-6 py-3 bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors text-white font-semibold"
                      >
                        Сохранить изменения
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {selectedCourse && (
        <CoursePreview course={selectedCourse} onClose={() => setSelectedCourse(null)} />
      )}
    </div>
  );
}
