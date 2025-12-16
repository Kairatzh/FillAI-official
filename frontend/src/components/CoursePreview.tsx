'use client';

import { X, BookOpen, Clock, Target, BarChart, Play, ExternalLink, FileText, Youtube } from 'lucide-react';
import { Course, PracticeExercise, VideoMaterial, AdditionalMaterial } from '@/data/mockStore';

interface CoursePreviewProps {
  course: Course | null;
  onClose: () => void;
}

export default function CoursePreview({ course, onClose }: CoursePreviewProps) {
  if (!course) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#252525] border border-[#3a3a3a] rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#252525] border-b border-[#3a3a3a] p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-100">{course.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <p className="text-gray-300">{course.description}</p>
          </div>

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

          {course.goal && (
            <div>
              <h3 className="text-lg font-semibold text-gray-100 mb-2">Цель обучения</h3>
              <p className="text-gray-300">{course.goal}</p>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Содержание курса</h3>
            <div className="space-y-6">
              {course.modules.map((module, moduleIndex) => (
                <div
                  key={module.id}
                  className="bg-[#2d2d2d] border border-[#3a3a3a] rounded-lg p-5"
                >
                  <h4 className="text-gray-100 font-semibold text-lg mb-1">
                    Модуль {moduleIndex + 1}: {module.title}
                  </h4>
                  {module.description && (
                    <p className="text-gray-400 text-sm mb-4">{module.description}</p>
                  )}
                  <div className="space-y-4 mt-4">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lesson.id}
                        className="bg-[#1f1f1f] border border-[#2a2a2a] rounded-lg p-5 hover:border-[#3a3a3a] transition-colors"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-gray-500 font-medium text-sm bg-[#2d2d2d] px-2 py-1 rounded">
                            {moduleIndex + 1}.{lessonIndex + 1}
                          </span>
                          <h5 className="text-gray-100 font-semibold text-base flex-1">{lesson.title}</h5>
                          {lesson.duration_minutes && (
                            <span className="text-gray-500 text-xs flex items-center gap-1">
                              <Clock size={12} />
                              {lesson.duration_minutes} мин
                            </span>
                          )}
                        </div>
                        {lesson.content && (
                          <div className="ml-10 mt-3">
                            <div className="text-gray-300 whitespace-pre-wrap leading-relaxed text-sm">
                              {lesson.content}
                            </div>
                          </div>
                        )}

                        {/* Практические упражнения */}
                        {lesson.practice_exercises && lesson.practice_exercises.length > 0 && (
                          <div className="ml-10 mt-4 pt-4 border-t border-[#2a2a2a]">
                            <h6 className="text-gray-200 font-semibold text-sm mb-3 flex items-center gap-2">
                              <Target size={16} />
                              Практические задания
                            </h6>
                            <div className="space-y-3">
                              {lesson.practice_exercises.map((exercise, exIndex) => (
                                <div
                                  key={exIndex}
                                  className="bg-[#252525] border border-[#2a2a2a] rounded-lg p-4"
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="text-gray-200 font-medium text-sm">{exercise.title}</div>
                                    <div className="flex items-center gap-2">
                                      {exercise.difficulty && (
                                        <span className={`text-xs px-2 py-1 rounded ${
                                          exercise.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                                          exercise.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' :
                                          'bg-yellow-500/20 text-yellow-400'
                                        }`}>
                                          {exercise.difficulty === 'easy' ? 'Легко' :
                                           exercise.difficulty === 'hard' ? 'Сложно' : 'Средне'}
                                        </span>
                                      )}
                                      {exercise.estimated_time && (
                                        <span className="text-gray-500 text-xs flex items-center gap-1">
                                          <Clock size={12} />
                                          {exercise.estimated_time}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-gray-300 text-sm mb-2">{exercise.description}</p>
                                  {exercise.solution_hint && (
                                    <details className="mt-2">
                                      <summary className="text-gray-400 text-xs cursor-pointer hover:text-gray-300">
                                        💡 Подсказка
                                      </summary>
                                      <p className="text-gray-400 text-xs mt-1 ml-4">{exercise.solution_hint}</p>
                                    </details>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* YouTube видео */}
                        {lesson.videos && lesson.videos.length > 0 && (
                          <div className="ml-10 mt-4 pt-4 border-t border-[#2a2a2a]">
                            <h6 className="text-gray-200 font-semibold text-sm mb-3 flex items-center gap-2">
                              <Youtube size={16} className="text-red-500" />
                              Рекомендуемые видео
                            </h6>
                            <div className="space-y-2">
                              {lesson.videos.map((video, vidIndex) => (
                                <a
                                  key={vidIndex}
                                  href={video.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-start gap-3 p-3 bg-[#252525] border border-[#2a2a2a] rounded-lg hover:border-[#3a3a3a] hover:bg-[#2a2a2a] transition-colors group"
                                >
                                  <Play size={20} className="text-gray-400 group-hover:text-red-500 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-gray-200 font-medium text-sm block truncate group-hover:text-white">
                                      {video.title}
                                    </div>
                                    {video.channel && (
                                      <p className="text-gray-500 text-xs mt-1">{video.channel}</p>
                                    )}
                                    {video.duration && (
                                      <p className="text-gray-500 text-xs">{video.duration}</p>
                                    )}
                                  </div>
                                  <ExternalLink size={14} className="text-gray-500 group-hover:text-gray-400 flex-shrink-0 mt-1" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Дополнительные материалы */}
                        {lesson.additional_materials && lesson.additional_materials.length > 0 && (
                          <div className="ml-10 mt-4 pt-4 border-t border-[#2a2a2a]">
                            <h6 className="text-gray-200 font-semibold text-sm mb-3 flex items-center gap-2">
                              <FileText size={16} />
                              Дополнительные материалы
                            </h6>
                            <div className="space-y-2">
                              {lesson.additional_materials.map((material, matIndex) => (
                                <div
                                  key={matIndex}
                                  className="flex items-start gap-3 p-3 bg-[#252525] border border-[#2a2a2a] rounded-lg"
                                >
                                  <FileText size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-gray-200 font-medium text-sm">
                                      {material.title}
                                    </div>
                                    <p className="text-gray-500 text-xs mt-1 capitalize">{material.type}</p>
                                    {material.description && (
                                      <p className="text-gray-400 text-xs mt-1">{material.description}</p>
                                    )}
                                    {material.url && (
                                      <a
                                        href={material.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 text-xs mt-1 hover:text-blue-300 flex items-center gap-1"
                                      >
                                        Открыть <ExternalLink size={12} />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
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

