'use client';

import { useState } from 'react';
import { X, BookOpen, Clock, Target, BarChart, Play, ExternalLink, FileText, Youtube, Share2, Eye, CheckCircle2, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { Course, PracticeExercise, VideoMaterial, AdditionalMaterial, shareCourseToCommunity, getSharedCourses, TermExplanation } from '@/data/mockStore';
import { gradeExercise } from '@/services/api';

interface CoursePreviewProps {
  course: Course | null;
  onClose: () => void;
}

export default function CoursePreview({ course, onClose }: CoursePreviewProps) {
  if (!course) return null;

  const alreadyShared = getSharedCourses().some((sc) => sc.courseId === course.id);
  const isPublic = course.isPublic !== false;

  // Состояние навигации: текущий модуль и урок
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  
  // Состояние для геймификации практики
  const [exerciseAnswers, setExerciseAnswer] = useState<Record<string, string>>({});
  const [exerciseResults, setExerciseResult] = useState<Record<string, 'idle' | 'success' | 'error'>>({});
  const [exerciseLoading, setExerciseLoading] = useState<Record<string, boolean>>({});
  const [exerciseFeedback, setExerciseFeedback] = useState<Record<string, string>>({});

  // Состояние для Wiki-style объяснений терминов
  const [activeTerm, setActiveTerm] = useState<TermExplanation | null>(null);

  const currentModule = course.modules[activeModuleIdx];
  const currentLesson = currentModule?.lessons[activeLessonIdx];

  const handleToggleVisibility = () => {
    course.isPublic = !isPublic;
    alert(course.isPublic ? 'Курс стал доступен в коммьюнити.' : 'Курс скрыт из коммьюнити.');
  };

  const handleShare = () => {
    try {
      shareCourseToCommunity(course);
      alert('Курс добавлен в коммьюнити. Откройте вкладку «Коммьюнити», чтобы увидеть его в маркетплейсе знаний.');
    } catch (e) {
      console.error('Error sharing course to community', e);
    }
  };

  const handleCheckExercise = async (exerciseIdx: number) => {
    const key = `${activeModuleIdx}-${activeLessonIdx}-${exerciseIdx}`;
    const answer = (exerciseAnswers[key] || '').trim();
    
    if (!answer) {
      setExerciseResult({ ...exerciseResults, [key]: 'error' });
      return;
    }

    const exercise = currentLesson?.practice_exercises?.[exerciseIdx];
    if (!exercise || !currentLesson) return;

    try {
      setExerciseLoading(prev => ({ ...prev, [key]: true }));
      setExerciseFeedback(prev => ({ ...prev, [key]: '' }));

      const result = await gradeExercise({
        course_title: course.title,
        lesson_title: currentLesson.title,
        exercise_title: exercise.title,
        exercise_description: exercise.description,
        user_answer: answer,
        language: 'ru',
      });

      setExerciseResult(prev => ({ ...prev, [key]: result.score >= 60 ? 'success' : 'error' }));
      setExerciseFeedback(prev => ({ ...prev, [key]: result.ai_feedback }));
    } catch (e) {
      console.error('Ошибка при проверке задания', e);
      setExerciseResult(prev => ({ ...prev, [key]: 'error' }));
    } finally {
      setExerciseLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const goToNext = () => {
    if (!currentModule) return;

    if (activeLessonIdx < currentModule.lessons.length - 1) {
      setActiveLessonIdx(activeLessonIdx + 1);
    } else if (activeModuleIdx < course.modules.length - 1) {
      setActiveModuleIdx(activeModuleIdx + 1);
      setActiveLessonIdx(0);
    }
  };

  const goToPrev = () => {
    if (activeLessonIdx > 0) {
      setActiveLessonIdx(activeLessonIdx - 1);
    } else if (activeModuleIdx > 0) {
      const prevModuleIdx = activeModuleIdx - 1;
      setActiveModuleIdx(prevModuleIdx);
      setActiveLessonIdx(course.modules[prevModuleIdx].lessons.length - 1);
    }
  };

  const hasNext = activeModuleIdx < course.modules.length - 1 || (currentModule && activeLessonIdx < currentModule.lessons.length - 1);
  const hasPrev = activeModuleIdx > 0 || activeLessonIdx > 0;

  // Функция для рендеринга контента с Wiki-ссылками
  const renderContentWithWikiLinks = (content: string, terms: TermExplanation[] = []) => {
    if (!terms.length) return content;

    let parts: (string | JSX.Element)[] = [content];

    terms.forEach((termObj) => {
      const newParts: (string | JSX.Element)[] = [];
      const term = termObj.term;

      parts.forEach((part) => {
        if (typeof part !== 'string') {
          newParts.push(part);
          return;
        }

        const regex = new RegExp(`(${term})`, 'gi');
        const chunks = part.split(regex);

        chunks.forEach((chunk, i) => {
          if (chunk.toLowerCase() === term.toLowerCase()) {
            newParts.push(
              <span 
                key={`${term}-${i}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTerm(termObj);
                }}
                className="text-sky-400 border-b border-sky-400/30 cursor-help hover:bg-sky-400/10 px-0.5 rounded transition-colors"
              >
                {chunk}
              </span>
            );
          } else if (chunk) {
            newParts.push(chunk);
          }
        });
      });
      parts = newParts;
    });

    return parts;
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#252525] border border-[#3a3a3a] rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#252525] border-b border-[#3a3a3a] p-6 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-100 flex-1">{course.title}</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleVisibility}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-medium transition-colors border ${
                isPublic
                  ? 'bg-green-900/30 border-green-600/60 text-green-200'
                  : 'bg-[#1f1f1f] border-[#3a3a3a] text-gray-300'
              }`}
            >
              <Eye size={16} />
              {isPublic ? 'Публичный' : 'Скрытый'}
            </button>
            <button
              onClick={handleShare}
              disabled={alreadyShared}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors border ${
                alreadyShared
                  ? 'bg-[#1f1f1f] border-[#3a3a3a] text-gray-400 cursor-default'
                  : 'bg-[#2d2d2d] border-[#3a3a3a] text-white hover:bg-[#353535]'
              }`}
            >
              <Share2 size={18} />
              {alreadyShared ? 'Уже в коммьюнити' : 'Поделиться в коммьюнити'}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={24} className="text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Header Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#2d2d2d] border border-[#3a3a3a] rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <BookOpen size={18} />
                <span className="text-sm">Формат</span>
              </div>
              <p className="text-gray-100 font-medium">{course.format}</p>
            </div>
            <div className="bg-[#2d2d2d] border border-[#3a3a3a] rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <BarChart size={18} />
                <span className="text-sm">Уровень</span>
              </div>
              <p className="text-gray-100 font-medium">{course.level}</p>
            </div>
            <div className="bg-[#2d2d2d] border border-[#3a3a3a] rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Clock size={18} />
                <span className="text-sm">Длительность</span>
              </div>
              <p className="text-gray-100 font-medium">{course.duration}</p>
            </div>
            <div className="bg-[#2d2d2d] border border-[#3a3a3a] rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Target size={18} />
                <span className="text-sm">Интенсивность</span>
              </div>
              <p className="text-gray-100 font-medium">{course.intensity}</p>
            </div>
          </div>

          {/* Current Lesson Area */}
          <div className="relative">
            {currentLesson ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between border-b border-[#3a3a3a] pb-4">
                  <div>
                    <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                      Модуль {activeModuleIdx + 1} / Урок {activeLessonIdx + 1}
                    </span>
                    <h3 className="text-2xl font-bold text-gray-100 mt-1">
                      {currentLesson.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={!hasPrev}
                      onClick={goToPrev}
                      className="p-2 bg-[#2d2d2d] border border-[#3a3a3a] rounded-lg text-gray-300 hover:text-white disabled:opacity-30 transition-all"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      disabled={!hasNext}
                      onClick={goToNext}
                      className="p-2 bg-[#2d2d2d] border border-[#3a3a3a] rounded-lg text-gray-300 hover:text-white disabled:opacity-30 transition-all"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>

                {/* Lesson Content with Wiki Links */}
                <div className="bg-[#2d2d2d]/30 border border-[#3a3a3a]/50 rounded-xl p-6 relative">
                  <div className="prose prose-invert max-w-none">
                    <div className="text-gray-300 whitespace-pre-wrap leading-relaxed text-lg">
                      {renderContentWithWikiLinks(currentLesson.content, currentLesson.terms || [])}
                    </div>
                  </div>

                  {/* Term Popup Overlay */}
                  {activeTerm && (
                    <div 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-[#1f1f1f] border border-sky-500/50 rounded-xl shadow-2xl p-5 z-20 animate-in zoom-in duration-200"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sky-400 font-bold text-sm uppercase">{activeTerm.term}</h4>
                        <button onClick={() => setActiveTerm(null)}>
                          <X size={16} className="text-gray-500 hover:text-gray-300" />
                        </button>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {activeTerm.explanation}
                      </p>
                    </div>
                  )}
                </div>

                {/* Practice Exercises (Gamified) */}
                {currentLesson.practice_exercises && currentLesson.practice_exercises.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-gray-200 font-bold text-lg flex items-center gap-2">
                      <Target size={20} className="text-sky-400" />
                      Практические задания
                    </h4>
                    <div className="grid gap-4">
                      {currentLesson.practice_exercises.map((exercise, exIndex) => {
                        const key = `${activeModuleIdx}-${activeLessonIdx}-${exIndex}`;
                        const status = exerciseResults[key] || 'idle';
                        const isLoading = exerciseLoading[key];
                        
                        return (
                          <div
                            key={exIndex}
                            className={`bg-[#2d2d2d] border rounded-xl p-5 transition-all ${
                              status === 'success' ? 'border-green-500/50 bg-green-500/5' : 
                              status === 'error' ? 'border-red-500/50 bg-red-500/5' : 
                              'border-[#3a3a3a]'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="font-bold text-gray-100">{exercise.title}</div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                  exercise.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                                  exercise.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' :
                                  'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                  {exercise.difficulty === 'easy' ? 'Легко' :
                                   exercise.difficulty === 'hard' ? 'Сложно' : 'Средне'}
                                </span>
                              </div>
                            </div>
                            <p className="text-gray-300 text-sm mb-4 leading-relaxed">{exercise.description}</p>
                            
                            <div className="space-y-3">
                              <textarea
                                placeholder="Опишите ваше решение или ответ здесь..."
                                value={exerciseAnswers[key] || ''}
                                onChange={(e) => setExerciseAnswer({...exerciseAnswers, [key]: e.target.value})}
                                className="w-full bg-[#1f1f1f] border border-[#3a3a3a] rounded-lg p-3 text-sm text-gray-200 focus:outline-none focus:border-sky-500/50 transition-colors h-24 resize-none"
                              />
                              <div className="flex items-center justify-between">
                                {exercise.solution_hint && (
                                  <details className="group">
                                    <summary className="text-gray-500 text-xs cursor-pointer hover:text-gray-400 list-none flex items-center gap-1">
                                      <span>Показать подсказку</span>
                                      <ChevronRight size={12} className="group-open:rotate-90 transition-transform" />
                                    </summary>
                                    <p className="text-gray-500 text-xs mt-2 italic bg-[#252525] p-2 rounded">{exercise.solution_hint}</p>
                                  </details>
                                )}
                                <div className="flex-1" />
                                <button
                                  onClick={() => handleCheckExercise(exIndex)}
                                  disabled={isLoading}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                    status === 'success' ? 'bg-green-600 text-white' :
                                    status === 'error' ? 'bg-red-600 text-white' :
                                    'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-900/20'
                                  } ${isLoading ? 'opacity-60 cursor-wait' : ''}`}
                                >
                                  {isLoading
                                    ? 'ИИ проверяет...'
                                    : status === 'success'
                                      ? (<><CheckCircle2 size={16} /> Проверено ИИ</>)
                                      : status === 'error'
                                        ? (<><AlertCircle size={16} /> Нужна доработка</>)
                                        : 'Проверить с ИИ'}
                                </button>
                              </div>
                              {exerciseFeedback[key] && (
                                <div className="mt-3 text-xs text-gray-300 bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg p-3">
                                  {exerciseFeedback[key]}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Additional Materials */}
                {(currentLesson.videos?.length || 0) + (currentLesson.additional_materials?.length || 0) > 0 && (
                  <div className="pt-6 border-t border-[#3a3a3a]">
                    <h4 className="text-gray-200 font-bold text-lg mb-4 flex items-center gap-2">
                      <BookOpen size={20} className="text-sky-400" />
                      Материалы для изучения
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {currentLesson.videos?.map((video, idx) => (
                        <a
                          key={`vid-${idx}`}
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 p-4 bg-[#2d2d2d] border border-[#3a3a3a] rounded-xl hover:border-red-500/50 group transition-all"
                        >
                          <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                            <Youtube size={24} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-gray-100 font-medium text-sm truncate">{video.title}</div>
                            <div className="text-gray-500 text-xs mt-1">{video.channel || 'Видео-урок'}</div>
                          </div>
                        </a>
                      ))}
                      {currentLesson.additional_materials?.map((mat, idx) => (
                        <a
                          key={`mat-${idx}`}
                          href={mat.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 p-4 bg-[#2d2d2d] border border-[#3a3a3a] rounded-xl hover:border-sky-500/50 group transition-all"
                        >
                          <div className="w-12 h-12 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-500 group-hover:scale-110 transition-transform">
                            <FileText size={24} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-gray-100 font-medium text-sm truncate">{mat.title}</div>
                            <div className="text-gray-500 text-xs mt-1">{mat.type || 'Материал'}</div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Final Progression Button */}
                <div className="flex justify-center pt-8">
                  {hasNext ? (
                    <button
                      onClick={goToNext}
                      className="group flex items-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-sky-400 hover:text-white transition-all transform hover:scale-105 shadow-xl"
                    >
                      <span>Перейти к следующей теме</span>
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  ) : (
                    <div className="bg-green-500/10 border border-green-500/50 rounded-2xl p-6 text-center w-full">
                      <div className="text-green-400 font-bold text-xl mb-2 flex items-center justify-center gap-2">
                        <CheckCircle2 size={24} />
                        Курс завершен!
                      </div>
                      <p className="text-gray-300">Вы прошли все модули этого курса. Теперь вы можете закрепить знания на практике.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-gray-500">
                Контент урока не найден
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

