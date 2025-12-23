'use client';

import { useEffect, useState } from 'react';
import { X, Plus, ArrowLeft, Sparkles, Send } from 'lucide-react';
import { CourseStructureModule, CourseStructurePlan } from '@/services/api';
import { assistantChat, AssistantChatMessage } from '@/services/api';

type EditableLesson = {
  id: string;
  title: string;
  content?: string;
  duration_minutes?: number;
};

type EditableModule = Omit<CourseStructureModule, 'lessons'> & {
  id: string;
  lessons: EditableLesson[];
};

interface CourseStructureEditorModalProps {
  isOpen: boolean;
  topic: string;
  modules: EditableModule[];
  onChange: (modules: EditableModule[]) => void;
  onBackToSettings: () => void;
  onClose: () => void;
  onGenerate: (plan: CourseStructurePlan) => void;
  isGenerating: boolean;
}

export default function CourseStructureEditorModal({
  isOpen,
  topic,
  modules,
  onChange,
  onBackToSettings,
  onClose,
  onGenerate,
  isGenerating,
}: CourseStructureEditorModalProps) {
  const [localModules, setLocalModules] = useState<EditableModule[]>(modules);
  const [assistantHistory, setAssistantHistory] = useState<AssistantChatMessage[]>([]);
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantLoading, setAssistantLoading] = useState(false);

  useEffect(() => {
    setLocalModules(modules);
  }, [modules]);

  if (!isOpen) return null;

  const updateModule = (moduleId: string, updater: (mod: EditableModule) => EditableModule) => {
    const updated = localModules.map((mod) => (mod.id === moduleId ? updater(mod) : mod));
    setLocalModules(updated);
    onChange(updated);
  };

  const updateLesson = (
    moduleId: string,
    lessonId: string,
    updater: (lesson: EditableLesson) => EditableLesson
  ) => {
    updateModule(moduleId, (mod) => ({
      ...mod,
      lessons: mod.lessons.map((lesson) => (lesson.id === lessonId ? updater(lesson) : lesson)),
    }));
  };

  const addModule = () => {
    const newModule: EditableModule = {
      id: crypto.randomUUID(),
      title: 'Новый модуль',
      description: '',
      lessons: [
        {
          id: crypto.randomUUID(),
          title: 'Новый урок',
          content: '',
          duration_minutes: 30,
        },
      ],
    };
    const updated = [...localModules, newModule];
    setLocalModules(updated);
    onChange(updated);
  };

  const addLesson = (moduleId: string) => {
    updateModule(moduleId, (mod) => ({
      ...mod,
      lessons: [
        ...mod.lessons,
        { id: crypto.randomUUID(), title: 'Новый урок', content: '', duration_minutes: 30 },
      ],
    }));
  };

  const removeLesson = (moduleId: string, lessonId: string) => {
    updateModule(moduleId, (mod) => ({
      ...mod,
      lessons: mod.lessons.filter((lesson) => lesson.id !== lessonId),
    }));
  };

  const handleGenerate = () => {
    const plan: CourseStructurePlan = {
      modules: localModules.map((mod) => ({
        title: mod.title,
        description: mod.description,
        lessons: mod.lessons.map((lesson) => ({
          title: lesson.title,
          content: lesson.content,
          duration_minutes: lesson.duration_minutes || 30,
        })),
      })),
    };
    onGenerate(plan);
  };

  const handleAssistantAsk = async () => {
    const text = assistantInput.trim();
    if (!text || assistantLoading) return;
    setAssistantLoading(true);
    setAssistantInput('');

    const history = assistantHistory.map((m) => ({ role: m.role, content: m.content }));
    const userMsg: AssistantChatMessage = { role: 'user', content: text };
    setAssistantHistory((prev) => [...prev, userMsg]);

    const structurePreview = localModules
      .map((m, i) => `${i + 1}. ${m.title} (${m.lessons.length} уроков)`)
      .join('\n');

    try {
      const resp = await assistantChat({
        message: `Помоги улучшить структуру курса "${topic}". Текущее содержание:\n${structurePreview}\nВопрос: ${text}`,
        language: 'ru',
        history,
        user_context: {
          name: 'Создатель курса',
          goals: ['сделать понятный и цельный курс'],
        },
      });

      const replyText =
        resp.success && resp.reply
          ? resp.reply
          : 'Не получилось получить ответ. Попробуйте ещё раз.';

      setAssistantHistory((prev) => [...prev, { role: 'assistant', content: replyText }]);
    } catch (e) {
      setAssistantHistory((prev) => [
        ...prev,
        { role: 'assistant', content: 'Связь с ассистентом не удалась. Повторите позже.' },
      ]);
    } finally {
      setAssistantLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1f1f1f] border border-[#3a3a3a] rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="sticky top-0 bg-[#1f1f1f] border-b border-[#3a3a3a] p-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-100">Черновик от ИИ</h2>
            <p className="text-sm text-gray-400">
              ИИ собрал план курса по теме <span className="text-gray-200 font-medium">{topic}</span>. Проверьте, поправьте вручную или через Джаспера справа, затем запустите финальную генерацию.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToSettings}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2d2d2d] hover:bg-[#353535] text-gray-200 border border-[#3a3a3a]"
            >
              <ArrowLeft size={16} />
              Настройки
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[#2d2d2d] text-gray-400"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[70vh] px-5 py-4 custom-scrollbar">
          <div className="grid lg:grid-cols-[2fr_1fr] gap-4">
            <div className="space-y-4">
              {localModules.map((module) => (
                <div
                  key={module.id}
                  className="border border-[#3a3a3a] rounded-xl p-4 bg-[#252525] shadow-sm"
                >
                  <div className="flex flex-col gap-3">
                    <input
                      value={module.title}
                      onChange={(e) =>
                        updateModule(module.id, (mod) => ({ ...mod, title: e.target.value }))
                      }
                      className="w-full bg-[#1f1f1f] border border-[#3a3a3a] rounded-lg px-3 py-2 text-gray-100 text-sm"
                      placeholder="Название модуля"
                    />
                    <textarea
                      value={module.description || ''}
                      onChange={(e) =>
                        updateModule(module.id, (mod) => ({ ...mod, description: e.target.value }))
                      }
                      className="w-full bg-[#1f1f1f] border border-[#3a3a3a] rounded-lg px-3 py-2 text-gray-100 text-sm"
                      placeholder="Краткое описание модуля"
                      rows={2}
                    />

                    <div className="space-y-3">
                      {module.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="border border-[#3a3a3a] rounded-lg p-3 bg-[#1a1a1a]"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              value={lesson.title}
                              onChange={(e) =>
                                updateLesson(module.id, lesson.id, (l) => ({
                                  ...l,
                                  title: e.target.value,
                                }))
                              }
                              className="flex-1 bg-[#111] border border-[#2f2f2f] rounded-lg px-3 py-2 text-gray-100 text-sm"
                              placeholder="Название урока"
                            />
                            <input
                              type="number"
                              min={10}
                              max={120}
                              value={lesson.duration_minutes || 30}
                              onChange={(e) =>
                                updateLesson(module.id, lesson.id, (l) => ({
                                  ...l,
                                  duration_minutes: Number(e.target.value),
                                }))
                              }
                              className="w-24 bg-[#111] border border-[#2f2f2f] rounded-lg px-3 py-2 text-gray-100 text-sm"
                              placeholder="Минут"
                            />
                            <button
                              onClick={() => removeLesson(module.id, lesson.id)}
                              className="text-gray-500 hover:text-red-400 text-xs"
                            >
                              Удалить
                            </button>
                          </div>
                          <textarea
                            value={lesson.content || ''}
                            onChange={(e) =>
                              updateLesson(module.id, lesson.id, (l) => ({
                                ...l,
                                content: e.target.value,
                              }))
                            }
                            className="mt-2 w-full bg-[#111] border border-[#2f2f2f] rounded-lg px-3 py-2 text-gray-100 text-sm"
                            placeholder="Что внутри урока? (1–2 предложения)"
                            rows={2}
                          />
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => addLesson(module.id)}
                      className="inline-flex items-center gap-2 text-sm text-sky-300 hover:text-sky-200"
                    >
                      <Plus size={16} />
                      Добавить урок
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={addModule}
                className="w-full border border-dashed border-[#3a3a3a] rounded-xl py-4 text-gray-300 hover:border-sky-500 hover:text-sky-300"
              >
                Добавить модуль
              </button>
            </div>

            <div className="h-full bg-[#1c1c1c] border border-[#2f2f2f] rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-sky-400" />
                <div className="text-sm text-gray-100 font-semibold">Джаспер-помощник</div>
              </div>
              <p className="text-xs text-gray-500">
                Спросите, как улучшить логику модулей, порядок тем или объём уроков.
              </p>
              <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar border border-[#2f2f2f] rounded-lg p-3 bg-[#151515]">
                {assistantHistory.length === 0 && (
                  <div className="text-xs text-gray-500">
                    Пример: «Сделай вводный модуль короче» или «Добавь практику в модуль 2».
                  </div>
                )}
                {assistantHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg text-xs ${
                      msg.role === 'user'
                        ? 'bg-sky-900/40 border border-sky-800 text-sky-50'
                        : 'bg-[#222] border border-[#2f2f2f] text-gray-100'
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={assistantInput}
                  onChange={(e) => setAssistantInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAssistantAsk()}
                  placeholder={assistantLoading ? 'Джаспер думает...' : 'Спросить Джаспера...'}
                  className="flex-1 bg-[#111] border border-[#2f2f2f] rounded-lg px-3 py-2 text-sm text-gray-100"
                />
                <button
                  onClick={handleAssistantAsk}
                  disabled={assistantLoading}
                  className="p-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-60"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#3a3a3a] bg-[#1f1f1f] p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Sparkles size={16} className="text-sky-400" />
            Проверьте формулировки — ИИ сгенерирует контент по этой структуре.
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#2d2d2d] hover:bg-[#353535] text-gray-200 border border-[#3a3a3a]"
            >
              Отмена
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold disabled:opacity-60 flex items-center gap-2"
            >
              <Sparkles size={18} />
              {isGenerating ? 'Генерация...' : 'Сгенерировать курс'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

