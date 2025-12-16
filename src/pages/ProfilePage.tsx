'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Calendar, BookOpen, Trophy, Settings, Edit2, Save, Bell, Shield, Moon, Globe, X } from 'lucide-react';
import { getCourses } from '@/data/mockStore';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userData, setUserData] = useState({
    name: 'Иван Иванов',
    email: 'ivan@example.com',
    bio: 'Увлеченный изучатель. Люблю изучать новые технологии и языки.',
    joinDate: 'Январь 2024',
  });
  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: true,
    darkMode: true,
    language: 'ru',
    privacy: 'public',
  });

  const courses = getCourses();
  const completedCourses = courses.filter(() => Math.random() > 0.7).length;
  const inProgressCourses = courses.length - completedCourses;

  const stats = [
    { label: 'Курсы пройдено', value: completedCourses, icon: Trophy, color: 'text-gray-300', bg: 'bg-[#2d2d2d]' },
    { label: 'Курсы в процессе', value: inProgressCourses, icon: BookOpen, color: 'text-gray-300', bg: 'bg-[#2d2d2d]' },
    { label: 'Всего курсов', value: courses.length, icon: Calendar, color: 'text-gray-300', bg: 'bg-[#2d2d2d]' },
  ];

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
            Профиль
          </h1>
          <p className="text-gray-400">Управляйте своим профилем и отслеживайте прогресс</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-[#252525] border border-[#3a3a3a] rounded-xl p-8 mb-8"
        >
          <div className="flex items-start gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center text-4xl font-bold text-gray-300">
                {userData.name.split(' ').map(n => n[0]).join('')}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <Edit2 size={18} />
                </button>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Имя</label>
                    <input
                      type="text"
                      value={userData.name}
                      onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Email</label>
                    <input
                      type="email"
                      value={userData.email}
                      onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">О себе</label>
                    <textarea
                      value={userData.bio}
                      onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-600"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Save size={18} />
                      Сохранить
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-3xl font-bold">{userData.name}</h2>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Edit2 size={18} />
                      Редактировать
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 mb-4">
                    <Mail size={18} />
                    <span>{userData.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 mb-4">
                    <Calendar size={18} />
                    <span>Участник с {userData.joinDate}</span>
                  </div>
                  <p className="text-gray-300">{userData.bio}</p>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.15, duration: 0.4 }}
              className="bg-[#252525] border border-[#3a3a3a] rounded-xl p-6 cursor-pointer"
              whileHover={{ scale: 1.05, y: -5, borderColor: '#4a4a4a' }}
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`${stat.color}`} size={32} />
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Recent Courses */}
        <motion.div 
          className="bg-[#252525] border border-[#3a3a3a] rounded-xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold">Недавние курсы</h3>
            <button className="text-gray-400 hover:text-white transition-colors">
              Посмотреть все
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.slice(0, 4).map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-[#2d2d2d] border border-[#3a3a3a] rounded-lg p-4 hover:border-[#4a4a4a] transition-all cursor-pointer"
                whileHover={{ scale: 1.03, x: 5 }}
              >
                <div className="flex items-start justify-between mb-2">
                  <BookOpen className="text-gray-400" size={20} />
                  <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
                    {course.category}
                  </span>
                </div>
                <h4 className="font-semibold mb-1">{course.title}</h4>
                <div className="text-sm text-gray-400">{course.level} • {course.duration}</div>
              </motion.div>
            ))}
          </div>
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
    </div>
  );
}

