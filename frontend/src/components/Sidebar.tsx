'use client';

import { motion } from 'framer-motion';
import { BookOpen, Users, User, Network, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const sidebarItems: SidebarItem[] = [
  { id: 'library', label: 'Библиотека', icon: <BookOpen size={20} /> },
  { id: 'community', label: 'Коммьюнити', icon: <Users size={20} /> },
  { id: 'profile', label: 'Профиль', icon: <User size={20} /> },
];


export default function Sidebar() {
  const { currentPage, setCurrentPage, sidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <>
      {/* Кнопка когда панель закрыта */}
      {!sidebarOpen && (
        <motion.button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-20 left-4 z-50 p-2 bg-[#252525] border border-[#3a3a3a] rounded-lg text-gray-400 hover:text-white hover:bg-[#2d2d2d] transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronRight size={20} />
        </motion.button>
      )}

      <motion.aside
        className="bg-[#252525] backdrop-blur-glass border-r border-[#3a3a3a] z-30 flex flex-col relative"
        initial={{ x: -20, opacity: 0 }}
        animate={{
          width: sidebarOpen ? 256 : 0,
          opacity: sidebarOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{ overflow: 'hidden' }}
      >
        {/* Toggle Button - теперь внутри панели, двигается вместе с ней */}
        {sidebarOpen && (
          <motion.button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 left-4 z-50 p-2 bg-[#2d2d2d] border border-[#3a3a3a] rounded-lg text-gray-400 hover:text-white hover:bg-[#353535] transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <ChevronLeft size={20} />
          </motion.button>
        )}
        {sidebarOpen && (
          <>
            {/* Main navigation */}
            <nav className="flex-1 p-6 space-y-2 pt-16">
              <motion.button
                onClick={() => setCurrentPage('graph')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors relative group mb-2 ${
                  currentPage === 'graph'
                    ? 'text-white bg-[#2d2d2d]'
                    : 'text-gray-300 hover:text-white hover:bg-[#2d2d2d]/50'
                }`}
              >
                <Network size={20} />
                <span>Граф знаний</span>
              </motion.button>
              
              {sidebarItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id as 'library' | 'community' | 'profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors relative group ${
                    currentPage === item.id
                      ? 'text-white bg-[#2d2d2d]'
                      : 'text-gray-300 hover:text-white hover:bg-[#2d2d2d]/50'
                  }`}
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <span className={`relative z-10 ${currentPage === item.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>
                    {item.icon}
                  </span>
                  <span className="relative z-10 font-medium">{item.label}</span>
                </motion.button>
              ))}
            </nav>

            {/* Profile section */}
            <motion.div
              className="p-6 border-t border-[#3a3a3a]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-10 h-10 rounded-full bg-[#2d2d2d] flex items-center justify-center text-gray-200 font-semibold"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  ИИ
                </motion.div>
                <div>
                  <div className="text-gray-200 font-medium text-sm">Иван Иванов</div>
                  <div className="text-gray-400 text-xs">ivan@example.com</div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </motion.aside>
    </>
  );
}

