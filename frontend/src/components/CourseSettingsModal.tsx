'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

interface CourseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (settings: any) => void;
  topic: string;
}

export default function CourseSettingsModal({ isOpen, onClose, onSubmit, topic }: CourseSettingsModalProps) {
  const [settings, setSettings] = useState({
    format: 'Смешанный',
    level: 'Средний',
    preferences: '',
    duration: '4 недели',
    intensity: 'Средняя',
    goal: '',
    category: '', // Теперь пользователь вводит название группы
    customCategory: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...settings, topic });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#252525] border border-[#3a3a3a] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#252525] border-b border-[#3a3a3a] p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-100">Настройки курса</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2d2d2d] rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Тема курса
            </label>
            <input
              type="text"
              value={topic}
              disabled
              className="w-full px-4 py-2 bg-[#2d2d2d] border border-[#3a3a3a] rounded-lg text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Формат курса
            </label>
            <select
              value={settings.format}
              onChange={(e) => setSettings({ ...settings, format: e.target.value })}
              className="w-full px-4 py-2 bg-[#2d2d2d] border border-[#3a3a3a] rounded-lg text-gray-100"
            >
              <option value="Видеоуроки">Видеоуроки</option>
              <option value="Текстовый">Текстовый</option>
              <option value="Смешанный">Смешанный</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Уровень сложности
            </label>
            <select
              value={settings.level}
              onChange={(e) => setSettings({ ...settings, level: e.target.value })}
              className="w-full px-4 py-2 bg-[#2d2d2d] border border-[#3a3a3a] rounded-lg text-gray-100"
            >
              <option value="Начинающий">Начинающий</option>
              <option value="Средний">Средний</option>
              <option value="Продвинутый">Продвинутый</option>
              <option value="Экспертный">Экспертный</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Длительность
            </label>
            <select
              value={settings.duration}
              onChange={(e) => setSettings({ ...settings, duration: e.target.value })}
              className="w-full px-4 py-2 bg-[#2d2d2d] border border-[#3a3a3a] rounded-lg text-gray-100"
            >
              <option value="1 неделя">1 неделя</option>
              <option value="2 недели">2 недели</option>
              <option value="4 недели">4 недели</option>
              <option value="8 недель">8 недель</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Интенсивность
            </label>
            <select
              value={settings.intensity}
              onChange={(e) => setSettings({ ...settings, intensity: e.target.value })}
              className="w-full px-4 py-2 bg-[#2d2d2d] border border-[#3a3a3a] rounded-lg text-gray-100"
            >
              <option value="Низкая">Низкая</option>
              <option value="Средняя">Средняя</option>
              <option value="Высокая">Высокая</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Предпочтения
            </label>
            <textarea
              value={settings.preferences}
              onChange={(e) => setSettings({ ...settings, preferences: e.target.value })}
              rows={3}
              placeholder="Опишите ваши предпочтения..."
              className="w-full px-4 py-2 bg-[#2d2d2d] border border-[#3a3a3a] rounded-lg text-gray-100 placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Цель обучения
            </label>
            <textarea
              value={settings.goal}
              onChange={(e) => setSettings({ ...settings, goal: e.target.value })}
              rows={3}
              placeholder="Опишите вашу цель обучения..."
              className="w-full px-4 py-2 bg-[#2d2d2d] border border-[#3a3a3a] rounded-lg text-gray-100 placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Название группы/категории
            </label>
            <input
              type="text"
              value={settings.customCategory}
              onChange={(e) => setSettings({ ...settings, customCategory: e.target.value, category: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              placeholder="Например: Презентации, Квантовая механика, Дизайн..."
              className="w-full px-4 py-2 bg-[#2d2d2d] border border-[#3a3a3a] rounded-lg text-gray-100 placeholder-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">Создайте или укажите название группы для вашего курса</p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-[#2d2d2d] border border-[#3a3a3a] rounded-lg hover:bg-[#353535] transition-colors text-gray-300"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-[#3a3a3a] hover:bg-[#454545] rounded-lg transition-colors text-gray-100 font-semibold"
            >
              Сгенерировать курс
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

