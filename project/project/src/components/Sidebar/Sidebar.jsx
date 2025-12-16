import { 
  User, 
  Users, 
  Settings, 
  History, 
  Info, 
  HelpCircle,
  BookOpen 
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

const menuItems = [
  { id: 'profile', label: 'Профиль', icon: User },
  { id: 'community', label: 'Сообщество', icon: Users },
  { id: 'settings', label: 'Настройки', icon: Settings },
  { id: 'history', label: 'История курсов', icon: History },
  { id: 'about', label: 'О проекте', icon: Info },
  { id: 'support', label: 'Поддержка', icon: HelpCircle },
];

export default function Sidebar({ onNavigate }) {
  const [activeItem, setActiveItem] = useState(null);

  const handleClick = (itemId) => {
    setActiveItem(itemId);
    if (onNavigate) {
      onNavigate(itemId);
    }
  };

  return (
    <div className="w-64 h-full bg-dark-surface border-r border-dark-border flex flex-col">
      <div className="p-4 border-b border-dark-border">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="text-blue-400" size={24} />
          <span className="text-lg font-semibold">Меню</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                'hover:bg-dark-hover text-gray-300 hover:text-white',
                activeItem === item.id && 'bg-dark-hover text-white border-l-2 border-blue-500'
              )}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

