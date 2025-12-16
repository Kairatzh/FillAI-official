import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import CourseSettingsModal from '../components/Modal/CourseSettingsModal';
import CoursePreview from '../components/CoursePreview/CoursePreview';
import { generateMockCourse } from '../data/mockStore';

export default function Home({ onCourseGenerated }) {
  const [topic, setTopic] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCourse, setGeneratedCourse] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleTopicSubmit = (e) => {
    e.preventDefault();
    if (topic.trim()) {
      setIsModalOpen(true);
    }
  };

  const handleGenerateCourse = async (settings) => {
    setIsModalOpen(false);
    setIsGenerating(true);

    // Симуляция генерации курса
    await new Promise(resolve => setTimeout(resolve, 2000));

    const course = generateMockCourse(topic, settings);
    setGeneratedCourse(course);
    setIsGenerating(false);
    setTopic('');

    if (onCourseGenerated) {
      onCourseGenerated(course);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      {isGenerating ? (
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-dark-border border-t-blue-500 rounded-full animate-spin"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-400" size={32} />
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-2">Генерация курса...</h3>
            <p className="text-gray-400">Искусственный интеллект создаёт персонализированный курс для вас</p>
          </div>
        </div>
      ) : (
        <>
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Fill AI
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Создайте персонализированный курс за несколько секунд
            </p>
          </div>

          <form onSubmit={handleTopicSubmit} className="w-full max-w-2xl">
            <div className="relative">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Введите тему для создания курса"
                className="w-full px-6 py-4 bg-dark-surface border-2 border-dark-border rounded-xl text-white text-lg placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Sparkles className="text-gray-400" size={24} />
              </div>
            </div>

            <button
              type="submit"
              disabled={!topic.trim()}
              className="mt-6 w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all text-white font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>Сформулировать запрос</span>
              <Sparkles size={20} />
            </button>
          </form>

          {generatedCourse && (
            <div className="mt-8 p-4 bg-dark-surface border border-dark-border rounded-xl">
              <p className="text-gray-400 mb-2">Последний сгенерированный курс:</p>
              <button
                onClick={() => setShowPreview(true)}
                className="text-blue-400 hover:text-blue-300 font-semibold"
              >
                {generatedCourse.title}
              </button>
            </div>
          )}
        </>
      )}

      <CourseSettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleGenerateCourse}
        topic={topic}
      />

      {showPreview && generatedCourse && (
        <CoursePreview
          course={generatedCourse}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}

