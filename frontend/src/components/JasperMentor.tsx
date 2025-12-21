'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, MessageCircle, Lightbulb, BookOpen, HelpCircle } from 'lucide-react';
import { assistantChat, AssistantChatMessage } from '@/services/api';
import { Course, Lesson } from '@/data/mockStore';

interface JasperMentorProps {
  course: Course;
  currentLesson: Lesson | null;
  currentModuleTitle: string;
  isOpen: boolean;
  onToggle: () => void;
}

interface MentorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function JasperMentor({ 
  course, 
  currentLesson, 
  currentModuleTitle,
  isOpen, 
  onToggle 
}: JasperMentorProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<MentorMessage[]>([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);

  // Генерируем предложенные вопросы на основе текущего урока
  useEffect(() => {
    if (currentLesson) {
      const questions = [
        `Объясни простыми словами: ${currentLesson.title}`,
        'Что самое важное в этом уроке?',
        'Можешь привести пример из реальной жизни?',
        'С чем это связано из предыдущих уроков?',
        'Какие типичные ошибки здесь делают?'
      ];
      setSuggestedQuestions(questions);
    }
  }, [currentLesson]);

  // Автоматическое приветствие при открытии
  useEffect(() => {
    if (isOpen && currentLesson && history.length === 0) {
      const welcomeMessage: MentorMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Привет! Я Джаспер, твой ментор по курсу "${course.title}". Сейчас мы изучаем урок "${currentLesson.title}" из модуля "${currentModuleTitle}". Если что-то непонятно — спрашивай! Я помогу разобраться простыми словами.`,
        timestamp: new Date(),
      };
      setHistory([welcomeMessage]);
    }
  }, [isOpen, currentLesson, course.title, currentModuleTitle]);

  const sendMessage = useCallback(async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || loading) return;

    const userMsg: MentorMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setHistory(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Формируем контекст для Джаспера
      const lessonContext = currentLesson 
        ? `Текущий урок: "${currentLesson.title}". Содержание урока: ${currentLesson.content.substring(0, 500)}...`
        : '';

      const systemContext = `Ты Джаспер — дружелюбный и немного ироничный ментор по курсу "${course.title}". 
Твоя задача — помогать студенту понять материал простыми словами, приводить примеры из реальной жизни, 
объяснять сложные концепции доступным языком. Будь конкретным, но не слишком формальным.

${lessonContext}

Курс: ${course.title}
Модуль: ${currentModuleTitle}
Уровень сложности: ${course.level}`;

      const backendHistory: AssistantChatMessage[] = [
        { role: 'system', content: systemContext },
        ...history.map(m => ({
          role: m.role,
          content: m.content,
        })),
      ];

      const resp = await assistantChat({
        message: text,
        user_context: {
          name: 'Студент',
          goals: ['изучить курс', 'понять материал'],
          current_courses: [course.title],
        },
        history: backendHistory,
        language: 'ru',
      });

      const replyText =
        resp.success && resp.reply
          ? resp.reply
          : 'Кажется, у меня возникла небольшая техническая проблема. Попробуйте задать вопрос ещё раз.';

      const aiMsg: MentorMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: replyText,
        timestamp: new Date(),
      };
      setHistory(prev => [...prev, aiMsg]);
    } catch (e) {
      const aiMsg: MentorMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Не получилось связаться с сервером. Проверьте подключение и попробуйте ещё раз.',
        timestamp: new Date(),
      };
      setHistory(prev => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  }, [currentLesson, course.title, currentModuleTitle, history, loading]);

  // Слушаем события для автоматических вопросов
  useEffect(() => {
    const handleQuestion = (e: CustomEvent) => {
      if (e.detail && typeof e.detail === 'string' && !loading) {
        sendMessage(e.detail);
      }
    };

    window.addEventListener('jasper-question' as any, handleQuestion as EventListener);
    return () => {
      window.removeEventListener('jasper-question' as any, handleQuestion as EventListener);
    };
  }, [loading, sendMessage]);

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question);
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={onToggle}
        className={`fixed bottom-6 right-6 z-50 rounded-full shadow-xl px-6 py-5 flex items-center gap-3 transition-all ${
          isOpen 
            ? 'bg-sky-600 hover:bg-sky-500 text-white' 
            : 'bg-amber-600 hover:bg-amber-500 text-white'
        }`}
        whileHover={{ scale: 1.1, y: -3 }}
        whileTap={{ scale: 0.95 }}
        title="Джаспер - ментор курса"
      >
        <MessageCircle size={24} />
        <span className="hidden md:inline text-sm font-bold">
          {isOpen ? 'Скрыть ментора' : 'Джаспер-ментор'}
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-28 right-6 z-50 w-full max-w-md"
          >
            <div className="bg-[#1f1f1f] border border-[#3a3a3a] rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[600px]">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#3a3a3a] bg-gradient-to-r from-amber-600/20 to-amber-500/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/60 flex items-center justify-center text-amber-300">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      Джаспер
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] rounded-full">
                        Ментор
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400">
                      Помогаю понять курс
                    </div>
                  </div>
                </div>
                <button
                  onClick={onToggle}
                  className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Current Lesson Info */}
              {currentLesson && (
                <div className="px-4 py-2 bg-[#252525] border-b border-[#3a3a3a]">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <BookOpen size={12} />
                    <span className="truncate">{currentLesson.title}</span>
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 custom-scrollbar">
                {history.length === 0 && (
                  <div className="text-xs text-gray-500 space-y-2">
                    <div className="flex items-center gap-2 text-amber-400">
                      <Lightbulb size={14} />
                      <span className="font-semibold">Джаспер готов помочь!</span>
                    </div>
                    <p>Задайте вопрос о текущем уроке, и я объясню простыми словами.</p>
                  </div>
                )}
                
                {history.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-amber-600 text-white rounded-br-sm'
                          : 'bg-[#252525] text-gray-100 rounded-bl-sm border border-[#3a3a3a]'
                      } text-xs leading-relaxed`}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-[#252525] border border-[#3a3a3a] rounded-2xl rounded-bl-sm px-3 py-2 text-xs text-gray-400">
                      Джаспер думает...
                    </div>
                  </div>
                )}

                {/* Suggested Questions */}
                {history.length > 0 && suggestedQuestions.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <HelpCircle size={10} />
                      Быстрые вопросы:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {suggestedQuestions.slice(0, 3).map((question, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestedQuestion(question)}
                          disabled={loading}
                          className="px-3 py-1.5 bg-[#252525] border border-[#3a3a3a] rounded-lg text-[11px] text-gray-300 hover:bg-[#2d2d2d] hover:border-amber-500/50 transition-colors disabled:opacity-50"
                        >
                          {question.length > 40 ? question.substring(0, 40) + '...' : question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t border-[#3a3a3a] bg-[#252525] px-3 py-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder={loading ? 'Джаспер думает...' : 'Спроси что-то о уроке...'}
                    disabled={loading}
                    className="flex-1 bg-[#1a1a1a] border border-[#3a3a3a] rounded-2xl px-3 py-2 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500/60 disabled:opacity-60"
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={loading || !input.trim()}
                    className="p-2 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-60 transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

