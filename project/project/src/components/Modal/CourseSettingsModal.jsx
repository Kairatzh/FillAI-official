import { X } from 'lucide-react';
import { useState } from 'react';

export default function CourseSettingsModal({ isOpen, onClose, onSubmit, topic }) {
  const [settings, setSettings] = useState({
    format: 'Смешанный',
    level: 'B1',
    preferences: '',
    duration: '4 недели',
    intensity: 'Средняя',
    goal: '',
    category: 'english'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...settings, topic });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-surface border border-dark-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-dark-surface border-b border-dark-border p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Настройки курса</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
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
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Формат курса
            </label>
            <select
              value={settings.format}
              onChange={(e) => setSettings({ ...settings, format: e.target.value })}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white"
            >
              <option value="Видеоуроки">Видеоуроки</option>
              <option value="Текстовый">Текстовый</option>
              <option value="Смешанный">Смешанный</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Уровень
            </label>
            <select
              value={settings.level}
              onChange={(e) => setSettings({ ...settings, level: e.target.value })}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white"
            >
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
              <option value="C1">C1</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Длительность
            </label>
            <select
              value={settings.duration}
              onChange={(e) => setSettings({ ...settings, duration: e.target.value })}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white"
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
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white"
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
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500"
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
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Категория
            </label>
            <select
              value={settings.category}
              onChange={(e) => setSettings({ ...settings, category: e.target.value })}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white"
            >
              <option value="english">English</option>
              <option value="programming">Programming</option>
              <option value="design">Design</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-dark-hover border border-dark-border rounded-lg hover:bg-dark-border transition-colors text-gray-300"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all text-white font-semibold"
            >
              Сгенерировать курс
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

