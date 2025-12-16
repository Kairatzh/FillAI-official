'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, CreditCard, Info, X, ChevronDown } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

export default function TopBar() {
  const [showFAQ, setShowFAQ] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);

  const faqItems = [
    {
      question: 'Как создать курс?',
      answer: 'Введите тему в поисковую строку внизу экрана, нажмите "Сформулировать запрос", заполните параметры и нажмите "Сгенерировать курс".',
    },
    {
      question: 'Как работают подписки?',
      answer: 'Подписки позволяют создавать неограниченное количество курсов и получать доступ к премиум функциям.',
    },
    {
      question: 'Где хранятся мои курсы?',
      answer: 'Все ваши курсы хранятся в разделе "Библиотека" и отображаются в графе знаний.',
    },
    {
      question: 'Можно ли делиться курсами?',
      answer: 'Да, в разделе "Коммьюнити" вы можете делиться своими курсами и обсуждать их с другими пользователями.',
    },
  ];

  return (
    <>
      <div className="absolute top-0 left-0 right-0 z-40">
        <div className="flex items-center justify-between px-6 py-3">
          <motion.div 
            className="flex items-center gap-4"
            animate={{
              x: sidebarOpen ? 280 : 0,
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <h1 className="text-xl font-bold text-white">Fill AI</h1>
          </motion.div>

          <div className="flex items-center gap-2">
            {/* FAQ */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowFAQ(!showFAQ);
                  setActiveDropdown(activeDropdown === 'faq' ? null : 'faq');
                }}
                className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-[#2d2d2d] rounded-lg transition-colors"
              >
                <HelpCircle size={18} />
                <span>FAQ</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${activeDropdown === 'faq' ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {activeDropdown === 'faq' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-96 bg-[#252525] border border-[#3a3a3a] rounded-xl shadow-2xl p-4 z-50"
                  >
                    <div className="space-y-3">
                      {faqItems.map((item, index) => (
                        <div key={index} className="border-b border-[#3a3a3a] last:border-0 pb-3 last:pb-0">
                          <h4 className="font-semibold text-white mb-1">{item.question}</h4>
                          <p className="text-sm text-gray-400">{item.answer}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Подписки */}
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'subscription' ? null : 'subscription')}
              className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-[#2d2d2d] rounded-lg transition-colors"
            >
              <CreditCard size={18} />
              <span>Подписки</span>
              <ChevronDown
                size={16}
                className={`transition-transform ${activeDropdown === 'subscription' ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Информация */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'info' ? null : 'info')}
                className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-[#2d2d2d] rounded-lg transition-colors"
              >
                <Info size={18} />
                <span>О нас</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${activeDropdown === 'info' ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {activeDropdown === 'info' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-96 bg-[#252525] border border-[#3a3a3a] rounded-xl shadow-2xl p-6 z-50"
                  >
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">О Fill AI</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                          Fill AI — это инновационная платформа для создания персонализированных образовательных курсов с использованием искусственного интеллекта. 
                          Мы помогаем пользователям быстро создавать качественные курсы на любые темы, от языков до технических навыков.
                        </p>
                      </div>
                      <div className="border-t border-[#3a3a3a] pt-4">
                        <h4 className="font-semibold text-white mb-2">Наши возможности:</h4>
                        <ul className="text-sm text-gray-400 space-y-1">
                          <li>• Автоматическая генерация курсов</li>
                          <li>• Персонализация под ваши нужды</li>
                          <li>• Интерактивный граф знаний</li>
                          <li>• Сообщество для обмена опытом</li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Dropdown для подписок */}
      <AnimatePresence>
        {activeDropdown === 'subscription' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 right-32 z-50 w-80 bg-[#252525] border border-[#3a3a3a] rounded-xl shadow-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Подписки</h3>
              <button
                onClick={() => setActiveDropdown(null)}
                className="text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div className="bg-[#2d2d2d] border border-[#3a3a3a] rounded-lg p-4">
                <h4 className="font-semibold text-white mb-1">Базовый</h4>
                <p className="text-sm text-gray-400 mb-2">Бесплатно</p>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• До 5 курсов</li>
                  <li>• Базовые функции</li>
                </ul>
              </div>
              <div className="bg-[#2d2d2d] border border-[#3a3a3a] rounded-lg p-4">
                <h4 className="font-semibold text-white mb-1">Премиум</h4>
                <p className="text-sm text-gray-400 mb-2">990₽/мес</p>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Неограниченное количество курсов</li>
                  <li>• Все функции</li>
                  <li>• Приоритетная поддержка</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Click outside to close */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </>
  );
}
