'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, BookOpen, Clock, Target, BarChart, Play, ExternalLink, FileText, Youtube, Share2, Eye, 
  CheckCircle2, AlertCircle, ChevronRight, ChevronLeft, Search, Bookmark, BookmarkCheck, 
  Menu, X as CloseIcon, Download, Printer, Star, TrendingUp, Zap, List, Grid, 
  ChevronDown, ChevronUp, Edit3, Save, Trash2, Plus, Code, Brain, Puzzle, 
  Image as ImageIcon, Video, Music, Layers, Lightbulb, HelpCircle
} from 'lucide-react';
import { Course, PracticeExercise, VideoMaterial, AdditionalMaterial, shareCourseToCommunity, getSharedCourses, TermExplanation, Lesson } from '@/data/mockStore';
import { gradeExercise } from '@/services/api';
import JasperMentor from './JasperMentor';
import InteractiveExample from './InteractiveExample';
import ModuleTestComponent from './ModuleTest';
import YouTubePlayer from './YouTubePlayer';

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

  // Новые состояния для улучшенного функционала
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedLessons, setBookmarkedLessons] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([0]));
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [jasperOpen, setJasperOpen] = useState(false);
  const [interactiveElements, setInteractiveElements] = useState<Record<string, any>>({});

  const currentModule = course.modules[activeModuleIdx];
  const currentLesson = currentModule?.lessons[activeLessonIdx];

  // Ключ для localStorage
  const STORAGE_KEY = `course_progress_${course.id}`;
  const NOTES_STORAGE_KEY = `course_notes_${course.id}`;
  const BOOKMARKS_STORAGE_KEY = `course_bookmarks_${course.id}`;

  // Загрузка прогресса из localStorage при монтировании
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storageKey = `course_progress_${course.id}`;
      const notesKey = `course_notes_${course.id}`;
      const bookmarksKey = `course_bookmarks_${course.id}`;

      // Загружаем завершенные уроки
      const savedProgress = localStorage.getItem(storageKey);
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        if (Array.isArray(parsed)) {
          setCompletedLessons(new Set(parsed));
        }
      }

      // Загружаем заметки
      const savedNotes = localStorage.getItem(notesKey);
      if (savedNotes) {
        const parsed = JSON.parse(savedNotes);
        if (parsed && typeof parsed === 'object') {
          setNotes(parsed);
        }
      }

      // Загружаем закладки
      const savedBookmarks = localStorage.getItem(bookmarksKey);
      if (savedBookmarks) {
        const parsed = JSON.parse(savedBookmarks);
        if (Array.isArray(parsed)) {
          setBookmarkedLessons(new Set(parsed));
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки прогресса:', error);
    }
  }, [course.id]);

  // Сохранение прогресса в localStorage при изменении
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storageKey = `course_progress_${course.id}`;
      localStorage.setItem(storageKey, JSON.stringify(Array.from(completedLessons)));
    } catch (error) {
      console.error('Ошибка сохранения прогресса:', error);
    }
  }, [completedLessons, course.id]);

  // Сохранение заметок
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storageKey = `course_notes_${course.id}`;
      localStorage.setItem(storageKey, JSON.stringify(notes));
    } catch (error) {
      console.error('Ошибка сохранения заметок:', error);
    }
  }, [notes, course.id]);

  // Сохранение закладок
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storageKey = `course_bookmarks_${course.id}`;
      localStorage.setItem(storageKey, JSON.stringify(Array.from(bookmarkedLessons)));
    } catch (error) {
      console.error('Ошибка сохранения закладок:', error);
    }
  }, [bookmarkedLessons, course.id]);

  // Вычисляем прогресс курса
  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedCount = completedLessons.size;
  const progressPercentage = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  // Поиск по курсу
  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return course.modules;
    
    const query = searchQuery.toLowerCase();
    return course.modules
      .map(module => ({
        ...module,
        lessons: module.lessons.filter(lesson => 
          lesson.title.toLowerCase().includes(query) ||
          lesson.content.toLowerCase().includes(query)
        )
      }))
      .filter(module => module.lessons.length > 0);
  }, [course.modules, searchQuery]);

  // Переключение закладки
  const toggleBookmark = (lessonId: string) => {
    setBookmarkedLessons(prev => {
      const newSet = new Set(prev);
      if (newSet.has(lessonId)) {
        newSet.delete(lessonId);
      } else {
        newSet.add(lessonId);
      }
      return newSet;
    });
  };

  // Переключение завершения урока
  const toggleLessonComplete = (moduleIdx: number, lessonIdx: number) => {
    const lessonId = `${moduleIdx}-${lessonIdx}`;
    setCompletedLessons(prev => {
      const newSet = new Set(prev);
      if (newSet.has(lessonId)) {
        newSet.delete(lessonId);
      } else {
        newSet.add(lessonId);
      }
      return newSet;
    });
  };

  // Переключение раскрытия модуля
  const toggleModule = (moduleIdx: number) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleIdx)) {
        newSet.delete(moduleIdx);
      } else {
        newSet.add(moduleIdx);
      }
      return newSet;
    });
  };

  // Переход к уроку
  const goToLesson = (moduleIdx: number, lessonIdx: number) => {
    setActiveModuleIdx(moduleIdx);
    setActiveLessonIdx(lessonIdx);
    setExpandedModules(prev => new Set([...prev, moduleIdx]));
  };

  // Сохранение заметки
  const saveNote = (lessonId: string, note: string) => {
    setNotes(prev => ({ ...prev, [lessonId]: note }));
  };

  // Экспорт курса
  const handleExport = () => {
    const courseData = {
      title: course.title,
      description: course.description,
      modules: course.modules,
      progress: progressPercentage,
      completedLessons: Array.from(completedLessons),
      notes: notes
    };
    const blob = new Blob([JSON.stringify(courseData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${course.title.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Печать курса
  const handlePrint = () => {
    window.print();
  };

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

  const currentLessonId = `${activeModuleIdx}-${activeLessonIdx}`;
  const currentNote = notes[currentLessonId] || '';

  // Функция для рендеринга интерактивного контента
  const renderInteractiveContent = (content: string): (string | JSX.Element)[] => {
    const parts: (string | JSX.Element)[] = [];
    let remainingContent = content;
    let elementIndex = 0;

    // Обработка блоков кода
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let codeMatch;
    const codeBlocks: Array<{ lang: string; code: string; index: number }> = [];
    
    while ((codeMatch = codeBlockRegex.exec(content)) !== null) {
      codeBlocks.push({
        lang: codeMatch[1] || 'text',
        code: codeMatch[2],
        index: codeMatch.index,
      });
    }

    // Обработка специальных блоков
    const exampleRegex = /💡\s*Пример:\s*([^\n]+)/g;
    const tipRegex = /💡\s*Совет:\s*([^\n]+)/g;
    const warningRegex = /⚠️\s*Внимание:\s*([^\n]+)/g;
    const quizRegex = /❓\s*Вопрос:\s*([^\n]+)/g;

    // Простое разбиение на параграфы с обработкой специальных элементов
    const paragraphs = content.split('\n\n');
    
    paragraphs.forEach((paragraph, pIdx) => {
      // Проверяем на код
      if (paragraph.includes('```')) {
        const codeMatch = paragraph.match(/```(\w+)?\n([\s\S]*?)```/);
        if (codeMatch) {
          const lang = codeMatch[1] || 'text';
          const code = codeMatch[2];
          parts.push(
            <motion.div
              key={`code-${pIdx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="my-4 bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-2 bg-[#252525] border-b border-[#3a3a3a]">
                <div className="flex items-center gap-2">
                  <Code size={16} className="text-sky-400" />
                  <span className="text-xs text-gray-400 uppercase">{lang}</span>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(code)}
                  className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
                >
                  Копировать
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-sm text-gray-200 font-mono">
                <code>{code}</code>
              </pre>
            </motion.div>
          );
          const rest = paragraph.replace(/```[\s\S]*?```/, '').trim();
          if (rest) parts.push(rest);
          return;
        }
      }

      // Проверяем на пример
      if (paragraph.includes('💡') && paragraph.includes('Пример:')) {
        const text = paragraph.replace(/💡\s*Пример:\s*/, '').trim();
        parts.push(
          <motion.div
            key={`example-${pIdx}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="my-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg flex-shrink-0">
                <Brain size={18} className="text-amber-400" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-amber-400 uppercase mb-1">Пример из жизни</div>
                <div className="text-sm text-gray-200 leading-relaxed">{text}</div>
              </div>
            </div>
          </motion.div>
        );
        return;
      }

      // Проверяем на совет
      if (paragraph.includes('💡') && paragraph.includes('Совет:')) {
        const text = paragraph.replace(/💡\s*Совет:\s*/, '').trim();
        parts.push(
          <motion.div
            key={`tip-${pIdx}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="my-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
                <Zap size={18} className="text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-blue-400 uppercase mb-1">Полезный совет</div>
                <div className="text-sm text-gray-200 leading-relaxed">{text}</div>
              </div>
            </div>
          </motion.div>
        );
        return;
      }

      // Проверяем на предупреждение
      if (paragraph.includes('⚠️')) {
        const text = paragraph.replace(/⚠️\s*Внимание:\s*/, '').trim();
        parts.push(
          <motion.div
            key={`warning-${pIdx}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="my-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg flex-shrink-0">
                <AlertCircle size={18} className="text-red-400" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-red-400 uppercase mb-1">Важно помнить</div>
                <div className="text-sm text-gray-200 leading-relaxed">{text}</div>
              </div>
            </div>
          </motion.div>
        );
        return;
      }

      // Обычный текст
      if (paragraph.trim()) {
        parts.push(paragraph.trim());
      }
    });

    return parts.length > 0 ? parts : [content];
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-0">
      <div className="bg-[#252525] w-full h-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-[#252525] border-b border-[#3a3a3a] p-6 flex items-center justify-between gap-4 z-20 shadow-lg">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-[#2d2d2d] rounded-lg transition-colors"
            >
              <Menu size={20} className="text-gray-400" />
            </button>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-100">{course.title}</h2>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <TrendingUp size={14} />
                  <span>Прогресс: {Math.round(progressPercentage)}%</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <CheckCircle2 size={14} />
                  <span>{completedCount}/{totalLessons} уроков</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-48 hidden md:block">
            <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-sky-500 to-indigo-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="p-2 hover:bg-[#2d2d2d] rounded-lg transition-colors"
              title="Экспорт курса"
            >
              <Download size={18} className="text-gray-400" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 hover:bg-[#2d2d2d] rounded-lg transition-colors"
              title="Печать"
            >
              <Printer size={18} className="text-gray-400" />
            </button>
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
              {alreadyShared ? 'В коммьюнити' : 'Поделиться'}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#2d2d2d] rounded-lg transition-colors"
            >
              <X size={24} className="text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Navigation */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-[#1f1f1f] border-r border-[#3a3a3a] overflow-y-auto flex-shrink-0"
              >
                <div className="p-4 space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="text"
                      placeholder="Поиск по курсу..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-[#252525] border border-[#3a3a3a] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-sky-500/50"
                    />
                  </div>

                  {/* Statistics */}
                  <div className="bg-[#252525] rounded-lg p-4 space-y-3">
                    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Статистика</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Прогресс</span>
                        <span className="text-gray-100 font-bold">{Math.round(progressPercentage)}%</span>
                      </div>
                      <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-sky-500 to-indigo-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercentage}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Завершено</span>
                        <span className="text-gray-100 font-bold">{completedCount}/{totalLessons}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Закладок</span>
                        <span className="text-gray-100 font-bold">{bookmarkedLessons.size}</span>
                      </div>
                    </div>
                  </div>

                  {/* Modules List */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Содержание</h3>
                      <button
                        onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                        className="p-1 hover:bg-[#252525] rounded transition-colors"
                      >
                        {viewMode === 'list' ? <Grid size={16} className="text-gray-400" /> : <List size={16} className="text-gray-400" />}
                      </button>
                    </div>
                    
                    <div className="space-y-1">
                      {filteredModules.map((module, moduleIdx) => {
                        const isExpanded = expandedModules.has(moduleIdx);
                        const moduleLessons = module.lessons;
                        const completedInModule = moduleLessons.filter((_, lessonIdx) => 
                          completedLessons.has(`${moduleIdx}-${lessonIdx}`)
                        ).length;
                        const moduleProgress = moduleLessons.length > 0 
                          ? (completedInModule / moduleLessons.length) * 100 
                          : 0;

                        return (
                          <div key={module.id} className="bg-[#252525] rounded-lg overflow-hidden">
                            <button
                              onClick={() => toggleModule(moduleIdx)}
                              className="w-full p-3 flex items-center justify-between hover:bg-[#2d2d2d] transition-colors"
                            >
                              <div className="flex items-center gap-3 flex-1 text-left">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                                  moduleIdx === activeModuleIdx 
                                    ? 'bg-sky-500 text-white' 
                                    : 'bg-[#1a1a1a] text-gray-400'
                                }`}>
                                  {moduleIdx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-semibold text-gray-100 truncate">
                                    {module.title}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {completedInModule}/{moduleLessons.length} уроков
                                  </div>
                                </div>
                              </div>
                              {isExpanded ? (
                                <ChevronUp size={16} className="text-gray-400" />
                              ) : (
                                <ChevronDown size={16} className="text-gray-400" />
                              )}
                            </button>
                            
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-[#3a3a3a]"
                              >
                                {moduleLessons.map((lesson, lessonIdx) => {
                                  const lessonId = `${moduleIdx}-${lessonIdx}`;
                                  const isActive = activeModuleIdx === moduleIdx && activeLessonIdx === lessonIdx;
                                  const isCompleted = completedLessons.has(lessonId);
                                  const isBookmarked = bookmarkedLessons.has(lessonId);

                                  return (
                                    <button
                                      key={lesson.id}
                                      onClick={() => goToLesson(moduleIdx, lessonIdx)}
                                      className={`w-full p-3 pl-12 flex items-center justify-between hover:bg-[#2d2d2d] transition-colors border-l-2 ${
                                        isActive 
                                          ? 'bg-[#2d2d2d] border-sky-500' 
                                          : 'border-transparent'
                                      }`}
                                    >
                                      <div className="flex items-center gap-3 flex-1 text-left min-w-0">
                                        {isCompleted ? (
                                          <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
                                        ) : (
                                          <div className="w-4 h-4 rounded-full border-2 border-gray-600 flex-shrink-0" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <div className={`text-sm truncate ${
                                            isActive ? 'text-sky-400 font-semibold' : 'text-gray-300'
                                          }`}>
                                            {lesson.title}
                                          </div>
                                          {notes[lessonId] && (
                                            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                              <Edit3 size={10} />
                                              Заметка
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {isBookmarked && (
                                          <BookmarkCheck size={14} className="text-yellow-400" />
                                        )}
                                        {lesson.duration_minutes && (
                                          <span className="text-xs text-gray-500">
                                            {lesson.duration_minutes}м
                                          </span>
                                        )}
                                      </div>
                                    </button>
                                  );
                                })}
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-8 space-y-8 max-w-6xl mx-auto">
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
                  <motion.div
                    key={`${activeModuleIdx}-${activeLessonIdx}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Lesson Header */}
                    <div className="flex items-start justify-between border-b border-[#3a3a3a] pb-4 gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                      Модуль {activeModuleIdx + 1} / Урок {activeLessonIdx + 1}
                    </span>
                          {completedLessons.has(currentLessonId) && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-bold rounded">
                              Завершено
                            </span>
                          )}
                        </div>
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="text-3xl font-bold text-gray-100">
                      {currentLesson.title}
                    </h3>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => toggleBookmark(currentLessonId)}
                              className={`p-2 rounded-lg transition-colors ${
                                bookmarkedLessons.has(currentLessonId)
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-[#2d2d2d] text-gray-400 hover:text-yellow-400'
                              }`}
                              title="Добавить в закладки"
                            >
                              {bookmarkedLessons.has(currentLessonId) ? (
                                <BookmarkCheck size={20} />
                              ) : (
                                <Bookmark size={20} />
                              )}
                            </button>
                            <button
                              onClick={() => toggleLessonComplete(activeModuleIdx, activeLessonIdx)}
                              className={`p-2 rounded-lg transition-colors ${
                                completedLessons.has(currentLessonId)
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-[#2d2d2d] text-gray-400 hover:text-green-400'
                              }`}
                              title="Отметить как завершенное"
                            >
                              <CheckCircle2 size={20} />
                            </button>
                          </div>
                        </div>
                        {currentLesson.duration_minutes && (
                          <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                            <Clock size={14} />
                            <span>~{currentLesson.duration_minutes} минут</span>
                          </div>
                        )}
                      </div>
                  </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between">
                    <button
                      disabled={!hasPrev}
                      onClick={goToPrev}
                        className="flex items-center gap-2 px-4 py-2 bg-[#2d2d2d] border border-[#3a3a3a] rounded-lg text-gray-300 hover:text-white hover:bg-[#353535] disabled:opacity-30 transition-all"
                    >
                        <ChevronLeft size={18} />
                        <span>Предыдущий</span>
                    </button>
                    <button
                      disabled={!hasNext}
                      onClick={goToNext}
                        className="flex items-center gap-2 px-4 py-2 bg-[#2d2d2d] border border-[#3a3a3a] rounded-lg text-gray-300 hover:text-white hover:bg-[#353535] disabled:opacity-30 transition-all"
                    >
                        <span>Следующий</span>
                        <ChevronRight size={18} />
                    </button>
                  </div>

                    {/* Notes Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#2d2d2d] border border-[#3a3a3a] rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                          <Edit3 size={16} />
                          Мои заметки
                        </h4>
                        {currentNote && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-1 text-xs text-green-400"
                          >
                            <CheckCircle2 size={12} />
                            Сохранено
                          </motion.div>
                        )}
                      </div>
                      <textarea
                        value={currentNote}
                        onChange={(e) => saveNote(currentLessonId, e.target.value)}
                        placeholder="Добавьте заметки к этому уроку... 💡 Записывайте важные моменты, вопросы для Джаспера или свои мысли"
                        className="w-full bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg p-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-sky-500/50 transition-colors min-h-[120px] resize-none"
                      />
                    </motion.div>

                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setJasperOpen(true);
                          setTimeout(() => {
                            const event = new CustomEvent('jasper-question', { 
                              detail: `Объясни урок "${currentLesson.title}" простыми словами` 
                            });
                            window.dispatchEvent(event);
                          }, 500);
                        }}
                        className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-sm text-amber-300 transition-colors flex items-center gap-2"
                      >
                        <Brain size={16} />
                        Объясни простыми словами
                      </button>
                      <button
                        onClick={() => {
                          setJasperOpen(true);
                          setTimeout(() => {
                            const event = new CustomEvent('jasper-question', { 
                              detail: 'Приведи пример из реальной жизни для этого урока' 
                            });
                            window.dispatchEvent(event);
                          }, 500);
                        }}
                        className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-sm text-blue-300 transition-colors flex items-center gap-2"
                      >
                        <Lightbulb size={16} />
                        Пример из жизни
                      </button>
                      <button
                        onClick={() => toggleBookmark(currentLessonId)}
                        className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                          bookmarkedLessons.has(currentLessonId)
                            ? 'bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-300'
                            : 'bg-[#2d2d2d] hover:bg-[#353535] border border-[#3a3a3a] text-gray-300'
                        }`}
                      >
                        {bookmarkedLessons.has(currentLessonId) ? (
                          <>
                            <BookmarkCheck size={16} />
                            В закладках
                          </>
                        ) : (
                          <>
                            <Bookmark size={16} />
                            В закладки
                          </>
                        )}
                      </button>
                    </div>

                {/* Lesson Content with Wiki Links and Interactive Elements */}
                <div className="bg-[#2d2d2d]/30 border border-[#3a3a3a]/50 rounded-xl p-8 relative">
                  <div className="prose prose-invert max-w-none">
                    <div className="text-gray-300 leading-relaxed text-lg">
                      {(() => {
                        const wikiContent = renderContentWithWikiLinks(currentLesson.content, currentLesson.terms || []);
                        
                        // Если это массив, обрабатываем каждый элемент
                        if (Array.isArray(wikiContent)) {
                          return wikiContent.map((item, idx) => {
                            if (typeof item === 'string') {
                              const interactive = renderInteractiveContent(item);
                              return (
                                <div key={idx} className="space-y-4">
                                  {interactive.map((part, partIdx) => (
                                    <div key={partIdx}>
                                      {typeof part === 'string' ? (
                                        <p className="mb-4 whitespace-pre-wrap leading-relaxed">{part}</p>
                                      ) : (
                                        part
                                      )}
                                    </div>
                                  ))}
                                </div>
                              );
                            }
                            return <div key={idx}>{item}</div>;
                          });
                        }
                        
                        // Если это строка
                        if (typeof wikiContent === 'string') {
                          const interactive = renderInteractiveContent(wikiContent);
                          return interactive.map((item, idx) => (
                            <div key={idx}>
                              {typeof item === 'string' ? (
                                <p className="mb-4 whitespace-pre-wrap leading-relaxed">{item}</p>
                              ) : (
                                item
                              )}
                            </div>
                          ));
                        }
                        
                        return wikiContent;
                      })()}
                    </div>
                  </div>

                  {/* Interactive Knowledge Check */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Puzzle size={20} className="text-purple-400" />
                      </div>
                      <h5 className="text-sm font-bold text-purple-400">Проверь понимание</h5>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">
                      Попробуй объяснить основную идею этого урока своими словами. Это поможет лучше запомнить материал.
                    </p>
                    <button
                      onClick={() => {
                        const question = `Объясни основную идею урока "${currentLesson.title}" простыми словами`;
                        setJasperOpen(true);
                        setTimeout(() => {
                          const event = new CustomEvent('jasper-question', { detail: question });
                          window.dispatchEvent(event);
                        }, 500);
                      }}
                      className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg text-sm text-purple-300 transition-colors"
                    >
                      Спросить Джаспера
                    </button>
                  </motion.div>

                  {/* Interactive Example */}
                  {currentLesson.content.length > 300 && (
                    <InteractiveExample
                      title="Попробуй сам"
                      description="Экспериментируй с концепцией из урока"
                      type="concept"
                      explanation="Это интерактивный пример, который поможет лучше понять материал. Попробуй изменить параметры и посмотри, как это влияет на результат."
                    />
                  )}


                  {/* Interactive Learning Cards */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Key Concepts */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="p-4 bg-gradient-to-br from-sky-500/10 to-indigo-500/10 border border-sky-500/30 rounded-xl cursor-pointer"
                      onClick={() => {
                        setJasperOpen(true);
                        setTimeout(() => {
                          const event = new CustomEvent('jasper-question', { 
                            detail: 'Какие ключевые концепции этого урока?' 
                          });
                          window.dispatchEvent(event);
                        }, 500);
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Layers size={18} className="text-sky-400" />
                        <h5 className="text-sm font-bold text-sky-400">Ключевые концепции</h5>
                      </div>
                      <p className="text-xs text-gray-300">
                        Основные идеи этого урока
                      </p>
                    </motion.div>

                    {/* Practice Time */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Puzzle size={18} className="text-amber-400" />
                        <h5 className="text-sm font-bold text-amber-400">Время практики</h5>
                      </div>
                      <p className="text-xs text-gray-300">
                        Примените знания на практике
                      </p>
                    </motion.div>

                    {/* Quick Help */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl cursor-pointer"
                      onClick={() => setJasperOpen(true)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <HelpCircle size={18} className="text-green-400" />
                        <h5 className="text-sm font-bold text-green-400">Нужна помощь?</h5>
                      </div>
                      <p className="text-xs text-gray-300">
                        Джаспер готов помочь
                      </p>
                    </motion.div>
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
                    <div className="space-y-4">
                      {currentLesson.videos?.map((video, idx) => (
                        <YouTubePlayer key={`vid-${idx}`} video={video} />
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
                
                    {/* Module Test - показываем в конце модуля */}
                    {currentModule && activeLessonIdx === currentModule.lessons.length - 1 && (
                      <ModuleTestComponent
                        course={course}
                        module={currentModule}
                        moduleIndex={activeModuleIdx}
                      />
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
                        <motion.div
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="bg-green-500/10 border border-green-500/50 rounded-2xl p-8 text-center w-full"
                        >
                          <div className="text-green-400 font-bold text-2xl mb-3 flex items-center justify-center gap-2">
                            <CheckCircle2 size={28} />
                        Курс завершен!
                      </div>
                          <p className="text-gray-300 text-lg mb-4">
                            Вы прошли все модули этого курса. Теперь вы можете закрепить знания на практике.
                          </p>
                          <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                              <Star size={16} className="text-yellow-400" />
                              <span>Оцените курс</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Share2 size={16} />
                              <span>Поделитесь достижением</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
            ) : (
              <div className="text-center py-20 text-gray-500">
                Контент урока не найден
              </div>
            )}
              </div>
            </div>
          </div>
        </div>

        {/* Jasper Mentor */}
        <JasperMentor
          course={course}
          currentLesson={currentLesson}
          currentModuleTitle={currentModule?.title || ''}
          isOpen={jasperOpen}
          onToggle={() => setJasperOpen(!jasperOpen)}
        />
      </div>
    </div>
  );
}

