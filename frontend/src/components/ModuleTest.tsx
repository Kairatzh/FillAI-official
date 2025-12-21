'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Trophy, Loader2, RefreshCw, Brain } from 'lucide-react';
import { generateModuleTest, ModuleTestRequest, TestQuestion } from '@/services/api';
import { Course, Module } from '@/data/mockStore';

interface ModuleTestProps {
  course: Course;
  module: Module;
  moduleIndex: number;
}

export default function ModuleTestComponent({ course, module, moduleIndex }: ModuleTestProps) {
  const [test, setTest] = useState<TestQuestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const generateTest = async () => {
    setLoading(true);
    setError(null);
    setTest(null);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);

    try {
      const request: ModuleTestRequest = {
        course_title: course.title,
        course_difficulty: course.level === 'Начинающий' ? 'beginner' : 
                           course.level === 'Продвинутый' ? 'advanced' : 'intermediate',
        module_title: module.title,
        module_description: module.description || '',
        lessons: module.lessons.map(lesson => ({
          title: lesson.title,
          content: lesson.content?.substring(0, 200) || '',
        })),
      };

      const response = await generateModuleTest(request);
      
      if (response.success && response.test) {
        setTest(response.test.tests);
      } else {
        setError(response.error || 'Не удалось сгенерировать тест');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при генерации теста');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Автоматически генерируем тест при монтировании или изменении модуля
    generateTest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleIndex, module.title]);

  const handleAnswer = (questionIndex: number, answerIndex: number) => {
    if (showResults) return;
    setSelectedAnswers(prev => ({ ...prev, [questionIndex]: answerIndex }));
  };

  const handleNext = () => {
    if (currentQuestion < (test?.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Подсчитываем результаты
      let correct = 0;
      test?.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correct) {
          correct++;
        }
      });
      setScore(correct);
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="my-6 p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl"
      >
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 size={24} className="text-purple-400 animate-spin" />
          <span className="text-gray-300">Генерирую тест для модуля...</span>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="my-6 p-6 bg-red-500/10 border border-red-500/30 rounded-xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-400 font-semibold mb-1">Ошибка генерации теста</p>
            <p className="text-gray-300 text-sm">{error}</p>
          </div>
          <button
            onClick={generateTest}
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg text-sm text-purple-300 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Попробовать снова
          </button>
        </div>
      </motion.div>
    );
  }

  if (!test || test.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="my-6 p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl"
      >
        <div className="text-center py-4">
          <p className="text-gray-300 mb-4">Тест не сгенерирован</p>
          <button
            onClick={generateTest}
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg text-sm text-purple-300 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={16} />
            Сгенерировать тест
          </button>
        </div>
      </motion.div>
    );
  }

  if (showResults) {
    const percentage = Math.round((score / test.length) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="my-6 p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl"
      >
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-block mb-4"
          >
            <Trophy size={48} className="text-yellow-400" />
          </motion.div>
          <h4 className="text-xl font-bold text-gray-100 mb-2">Тест завершен!</h4>
          <div className="text-3xl font-black text-green-400 mb-2">{percentage}%</div>
          <p className="text-sm text-gray-300">
            Правильных ответов: {score} из {test.length}
          </p>
        </div>

        <div className="space-y-4">
          {test.map((question, qIdx) => {
            const selected = selectedAnswers[qIdx];
            const isCorrect = selected === question.correct;

            return (
              <div
                key={qIdx}
                className={`p-4 rounded-lg border ${
                  isCorrect
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h5 className="text-sm font-semibold text-gray-200 flex-1">
                    {question.question}
                  </h5>
                  {isCorrect ? (
                    <CheckCircle2 size={20} className="text-green-400 flex-shrink-0 ml-2" />
                  ) : (
                    <XCircle size={20} className="text-red-400 flex-shrink-0 ml-2" />
                  )}
                </div>
                <div className="space-y-2 mb-3">
                  {question.options.map((option, oIdx) => {
                    const isSelected = selected === oIdx;
                    const isCorrectOption = oIdx === question.correct;
                    let bgClass = 'bg-[#2d2d2d] border-[#3a3a3a]';

                    if (isCorrectOption) {
                      bgClass = 'bg-green-500/20 border-green-500/50';
                    } else if (isSelected && !isCorrectOption) {
                      bgClass = 'bg-red-500/20 border-red-500/50';
                    }

                    return (
                      <div
                        key={oIdx}
                        className={`p-2 rounded border text-xs ${bgClass}`}
                      >
                        <span className="text-gray-200">{option}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{question.explanation}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleRestart}
            className="flex-1 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg text-sm font-semibold text-purple-300 transition-colors"
          >
            Пройти снова
          </button>
          <button
            onClick={generateTest}
            className="flex-1 px-4 py-2 bg-[#2d2d2d] hover:bg-[#353535] border border-[#3a3a3a] rounded-lg text-sm font-semibold text-gray-300 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} />
            Новый тест
          </button>
        </div>
      </motion.div>
    );
  }

  const currentQ = test[currentQuestion];
  const selected = selectedAnswers[currentQuestion];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-6 p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain size={20} className="text-purple-400" />
          <h4 className="text-sm font-bold text-purple-400">Тест по модулю: {module.title}</h4>
        </div>
        <span className="text-xs text-gray-400">
          Вопрос {currentQuestion + 1} из {test.length}
        </span>
      </div>

      <h5 className="text-lg font-bold text-gray-100 mb-4">{currentQ.question}</h5>

      <div className="space-y-2 mb-4">
        {currentQ.options.map((option, index) => {
          const isSelected = selected === index;
          let bgClass = 'bg-[#2d2d2d] border-[#3a3a3a] hover:border-purple-500/50';

          if (isSelected) {
            bgClass = 'bg-purple-500/20 border-purple-500/50';
          }

          return (
            <button
              key={index}
              onClick={() => handleAnswer(currentQuestion, index)}
              className={`w-full p-4 rounded-lg border text-left transition-all ${bgClass} cursor-pointer`}
            >
              <span className="text-gray-200">{option}</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={handleNext}
        disabled={selected === undefined}
        className="w-full px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg text-sm font-semibold text-purple-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {currentQuestion < test.length - 1 ? 'Следующий вопрос' : 'Завершить тест'}
      </button>
    </motion.div>
  );
}

