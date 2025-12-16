import { X, BookOpen, Clock, Target, BarChart } from 'lucide-react';

export default function CoursePreview({ course, onClose }) {
  if (!course) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-surface border border-dark-border rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-dark-surface border-b border-dark-border p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">{course.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <p className="text-gray-300">{course.description}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-dark-bg border border-dark-border rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <BookOpen size={18} />
                <span className="text-sm">Формат</span>
              </div>
              <p className="text-white font-medium">{course.format}</p>
            </div>
            <div className="bg-dark-bg border border-dark-border rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <BarChart size={18} />
                <span className="text-sm">Уровень</span>
              </div>
              <p className="text-white font-medium">{course.level}</p>
            </div>
            <div className="bg-dark-bg border border-dark-border rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Clock size={18} />
                <span className="text-sm">Длительность</span>
              </div>
              <p className="text-white font-medium">{course.duration}</p>
            </div>
            <div className="bg-dark-bg border border-dark-border rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Target size={18} />
                <span className="text-sm">Интенсивность</span>
              </div>
              <p className="text-white font-medium">{course.intensity}</p>
            </div>
          </div>

          {course.goal && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Цель обучения</h3>
              <p className="text-gray-300">{course.goal}</p>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Структура курса</h3>
            <div className="space-y-4">
              {course.modules.map((module, moduleIndex) => (
                <div
                  key={module.id}
                  className="bg-dark-bg border border-dark-border rounded-lg p-4"
                >
                  <h4 className="text-white font-semibold mb-3">
                    Модуль {moduleIndex + 1}: {module.title}
                  </h4>
                  <div className="space-y-2 ml-4">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lesson.id}
                        className="flex items-start gap-3 text-gray-300"
                      >
                        <span className="text-blue-400 font-medium">
                          {moduleIndex + 1}.{lessonIndex + 1}
                        </span>
                        <span>{lesson.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

