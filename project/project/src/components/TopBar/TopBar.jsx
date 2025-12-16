import { Menu, HelpCircle, DollarSign } from 'lucide-react';

export default function TopBar() {
  return (
    <div className="w-full h-16 bg-dark-surface border-b border-dark-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Fill AI
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-dark-hover transition-colors text-gray-300 hover:text-white">
          <HelpCircle size={18} />
          <span>FAQ</span>
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-dark-hover transition-colors text-gray-300 hover:text-white">
          <DollarSign size={18} />
          <span>Pricing</span>
        </button>
      </div>
    </div>
  );
}

