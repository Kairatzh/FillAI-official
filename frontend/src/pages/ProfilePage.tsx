'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Calendar, BookOpen, Trophy, Settings, Edit2, Save, Bell, 
  Shield, Moon, Globe, X, Star, Users as UsersIcon, Send, 
  Search, MessageSquare, Award, Zap, Heart, Target, TrendingUp,
  ChevronRight, Bookmark, Clock
} from 'lucide-react';
import { getCourses, Course, getUsers, UserProfile } from '@/data/mockStore';
import CoursePreview from '@/components/CoursePreview';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'learning' | 'created' | 'achievements' | 'messages'>('learning');

  const [userData, setUserData] = useState({
    name: 'Иван Иванов',
    email: 'ivan@example.com',
    bio: 'Увлеченный изучатель. Люблю изучать новые технологии и языки.',
    joinDate: 'Январь 2024',
    level: 15,
    xp: 2450,
    nextLevelXp: 3000,
    rank: 'Золотой исследователь',
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
  const courses = getCourses();
  const createdByMe = courses.filter((c) => (c.createdBy || 'Вы') === 'Вы');
  const publicCourses = courses.filter((c) => c.isPublic !== false);

  const stats = [
    { label: 'Курсы пройдено', value: 8, icon: Trophy, color: 'text-yellow-400' },
    { label: 'Часов обучения', value: 124, icon: Clock, color: 'text-sky-400' },
    { label: 'Друзей', value: 12, icon: UsersIcon, color: 'text-purple-400' },
    { label: 'Очков опыта', value: userData.xp, icon: Zap, color: 'text-orange-400' },
  ];

  const achievements = [
    { id: 1, title: 'Первый шаг', desc: 'Завершите свой первый урок', icon: Target, color: 'bg-emerald-500', unlocked: true },
    { id: 2, title: 'Гуру Python', desc: 'Пройдите все курсы по Python', icon: Award, color: 'bg-blue-500', unlocked: true },
    { id: 3, title: 'Автор года', desc: 'Создайте 5 популярных курсов', icon: Trophy, color: 'bg-amber-500', unlocked: false },
    { id: 4, title: 'Помощник', desc: 'Ответьте на 10 вопросов в коммьюнити', icon: Heart, color: 'bg-rose-500', unlocked: true },
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

  return (
    <div className="flex-1 overflow-auto bg-[#1a1a1a] text-white p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Личный кабинет
          </h1>
          <p className="text-gray-400">Ваша обучающая страница: прогресс, созданные курсы и настройки аккаунта</p>
        </motion.div>

        {/* Profile Card & XP Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 bg-[#252525] border border-[#3a3a3a] rounded-3xl p-8 relative overflow-hidden shadow-2xl"
          >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
              {/* Avatar with Ring */}
              <div className="relative">
                <div className="w-40 h-40 rounded-3xl bg-gradient-to-br from-sky-500 to-indigo-600 p-1">
                  <div className="w-full h-full rounded-[20px] bg-[#1a1a1a] flex items-center justify-center text-5xl font-black text-white">
                    {userData.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-2xl bg-[#252525] border-2 border-sky-500 flex items-center justify-center font-bold text-sky-400 shadow-xl">
                  {userData.level}
                </div>
              </div>

              <div className="flex-1 w-full text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
                  <div>
                    <h2 className="text-4xl font-black mb-2">{userData.name}</h2>
                    <div className="flex items-center justify-center md:justify-start gap-3">
                      <span className="px-3 py-1 bg-sky-500/10 text-sky-400 rounded-lg text-xs font-bold uppercase tracking-widest border border-sky-500/20">
                        {userData.rank}
                      </span>
                      <span className="text-gray-500 text-sm font-medium flex items-center gap-1">
                        <Calendar size={14} />
                        С {userData.joinDate}
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

                <div className="mt-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Прогресс уровня</span>
                    <span className="text-xs font-bold text-sky-400">{userData.xp} / {userData.nextLevelXp} XP</span>
                  </div>
                  <div className="w-full h-3 bg-[#1a1a1a] rounded-full overflow-hidden border border-[#3a3a3a]">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(userData.xp / userData.nextLevelXp) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 shadow-[0_0_20px_rgba(14,165,233,0.3)]"
                    />
                  </div>
                </div>

                <p className="mt-6 text-gray-400 text-lg leading-relaxed italic">
                  "{userData.bio}"
                </p>
              </div>
            </div>
            {/* Background Decoration */}
            <Zap className="absolute -right-10 -top-10 text-white/5 w-64 h-64 pointer-events-none" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#252525] border border-[#3a3a3a] rounded-3xl p-8 flex flex-col justify-between shadow-xl"
          >
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
              <TrendingUp size={22} className="text-sky-400" />
              Активность
            </h3>
            <div className="space-y-6">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl bg-[#1a1a1a] border border-[#3a3a3a] ${stat.color} group-hover:scale-110 transition-transform`}>
                      <stat.icon size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">{stat.label}</div>
                      <div className="text-2xl font-black text-white">{stat.value}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-2xl shadow-xl shadow-sky-900/20 transition-all">
              Стать экспертом
            </button>
          </motion.div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-4 mb-8">
          {[
            { id: 'learning', label: 'Мое обучение', icon: BookOpen },
            { id: 'created', label: 'Созданные курсы', icon: Edit2 },
            { id: 'achievements', label: 'Достижения', icon: Award },
            { id: 'messages', label: 'Сообщения', icon: MessageSquare },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-4 rounded-2xl flex items-center gap-3 font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-sky-600 text-white shadow-xl shadow-sky-900/40'
                  : 'bg-[#252525] text-gray-400 hover:text-white border border-[#3a3a3a]'
              }`}
            >
              <tab.icon size={20} />
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
          {activeTab === 'learning' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {publicCourses.map((course) => (
                <div 
                  key={course.id}
                  onClick={() => setSelectedCourse(course)}
                  className="group bg-[#252525] border border-[#3a3a3a] rounded-3xl p-6 hover:border-sky-500/50 transition-all cursor-pointer relative"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500">
                      <Zap size={20} />
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-tighter px-2 py-1 bg-[#1a1a1a] rounded-lg text-gray-500">
                      {course.level}
                    </div>
                  </div>
                  <h4 className="text-xl font-bold mb-4 line-clamp-2 group-hover:text-sky-400 transition-colors">{course.title}</h4>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5"><Trophy size={14} className="text-yellow-500" /> 80% пройден</span>
                    <span className="flex items-center gap-1.5"><Bookmark size={14} /> {course.duration}</span>
                  </div>
                  <div className="mt-6 h-1.5 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div className="h-full w-[80%] bg-sky-500" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {achievements.map((ach) => (
                <div 
                  key={ach.id}
                  className={`bg-[#252525] border border-[#3a3a3a] rounded-3xl p-8 flex flex-col items-center text-center transition-all ${
                    !ach.unlocked && 'opacity-40 grayscale'
                  }`}
                >
                  <div className={`w-20 h-20 rounded-3xl ${ach.color} flex items-center justify-center text-white mb-6 shadow-2xl`}>
                    <ach.icon size={40} />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">{ach.title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{ach.desc}</p>
                  {!ach.unlocked && (
                    <div className="mt-4 px-3 py-1 bg-[#1a1a1a] rounded-lg text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                      Заблокировано
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="bg-[#252525] border border-[#3a3a3a] rounded-3xl overflow-hidden shadow-2xl flex h-[600px]">
              {/* Friends List */}
              <div className="w-80 border-r border-[#3a3a3a] flex flex-col">
                <div className="p-6 border-b border-[#3a3a3a]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input 
                      type="text" 
                      placeholder="Поиск друзей..."
                      className="w-full pl-10 pr-4 py-2 bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl text-sm focus:outline-none focus:border-sky-500/50"
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
                      <div className="w-12 h-12 rounded-2xl bg-[#2d2d2d] flex items-center justify-center text-xl shadow-lg">
                        {user.avatar}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="font-bold text-white text-sm truncate">{user.name}</div>
                        <div className="text-[10px] text-gray-500 font-medium truncate">Был(а) недавно</div>
                      </div>
                      {user.id === '1' && (
                        <div className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.8)]" />
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
                        <div className="w-10 h-10 rounded-xl bg-[#2d2d2d] flex items-center justify-center text-lg">
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
                          className="flex-1 px-6 py-4 bg-[#1a1a1a] border border-[#3a3a3a] rounded-2xl text-sm focus:outline-none focus:border-sky-500/50 transition-all"
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
                        className="w-full px-6 py-3 bg-[#3a3a3a] hover:bg-[#454545] rounded-lg transition-colors text-white font-semibold"
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


