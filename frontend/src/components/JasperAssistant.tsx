'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { assistantChat, AssistantChatMessage } from '@/services/api';

interface JasperMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const STORAGE_KEY = 'jasper_simple_memory_v1';

function loadInitialHistory(): JasperMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(-20); // простая "мини-память"
  } catch {
    return [];
  }
}

export default function JasperAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<JasperMessage[]>([]);

  useEffect(() => {
    setHistory(loadInitialHistory());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-20)));
  }, [history]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: JasperMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    };

    setHistory(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const backendHistory: AssistantChatMessage[] = history.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const resp = await assistantChat({
        message: text,
        user_context: {
          name: 'Пользователь',
          goals: ['развиваться', 'изучать новые навыки'],
        },
        history: backendHistory,
        language: 'ru',
      });

      const replyText =
        resp.success && resp.reply
          ? resp.reply
          : 'Кажется, у меня возникла небольшая техническая проблема. Попробуйте задать вопрос ещё раз.';

      const aiMsg: JasperMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: replyText,
      };
      setHistory(prev => [...prev, aiMsg]);
    } catch (e) {
      const aiMsg: JasperMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Не получилось связаться с сервером. Проверьте подключение и попробуйте ещё раз.',
      };
      setHistory(prev => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 rounded-full bg-sky-600 hover:bg-sky-500 text-white shadow-xl shadow-sky-900/40 px-6 py-5 flex items-center gap-3"
        whileHover={{ scale: 1.1, y: -3 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle size={28} />
        <span className="hidden md:inline text-sm font-bold">Спросить Джаспера</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-28 right-6 z-50 w-full max-w-xl"
          >
            <div className="bg-[#1f1f1f] border border-[#3a3a3a] rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[600px]">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#3a3a3a] bg-[#252525]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/60 flex items-center justify-center text-sky-300">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Джаспер</div>
                    <div className="text-[11px] text-gray-400">
                      Ваш личный ИИ-наставник по обучению
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 custom-scrollbar text-sm">
                {history.length === 0 && (
                  <div className="text-xs text-gray-500">
                    Привет! Я Джаспер — немного ироничный, но на вашей стороне. Помогу собрать учебный маршрут,
                    объясню сложные темы по-человечески и иногда подскажу, когда пора сделать паузу.
                  </div>
                )}
                {history.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-sky-600 text-white rounded-br-sm'
                          : 'bg-[#252525] text-gray-100 rounded-bl-sm border border-[#3a3a3a]'
                      } text-xs leading-relaxed`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#3a3a3a] bg-[#252525] px-3 py-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder={loading ? 'Джаспер думает...' : 'Задайте вопрос Джасперу...'}
                    className="flex-1 bg-[#1a1a1a] border border-[#3a3a3a] rounded-2xl px-3 py-2 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-sky-500/60"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={loading}
                    className="p-2 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-60"
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


