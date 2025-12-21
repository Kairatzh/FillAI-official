'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, CheckCircle2, Lightbulb } from 'lucide-react';

interface InteractiveExampleProps {
  title: string;
  description: string;
  initialCode?: string;
  expectedOutput?: string;
  explanation?: string;
  type?: 'code' | 'visual' | 'concept';
}

export default function InteractiveExample({
  title,
  description,
  initialCode = '',
  expectedOutput,
  explanation,
  type = 'concept'
}: InteractiveExampleProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      setOutput(expectedOutput || 'Результат выполнения...');
      setIsRunning(false);
      if (explanation) {
        setShowExplanation(true);
      }
    }, 1000);
  };

  const handleReset = () => {
    setCode(initialCode);
    setOutput('');
    setShowExplanation(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-6 p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-indigo-500/20 rounded-lg">
          <Lightbulb size={20} className="text-indigo-400" />
        </div>
        <div className="flex-1">
          <h5 className="text-sm font-bold text-indigo-400 mb-1">{title}</h5>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      </div>

      {type === 'code' && initialCode && (
        <div className="space-y-3">
          <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 uppercase">Код</span>
              <button
                onClick={handleReset}
                className="text-xs text-gray-400 hover:text-gray-200 transition-colors flex items-center gap-1"
              >
                <RotateCcw size={12} />
                Сбросить
              </button>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-transparent text-sm text-gray-200 font-mono resize-none min-h-[120px] focus:outline-none"
              placeholder="Введите код здесь..."
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRun}
              disabled={isRunning || !code.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/50 rounded-lg text-sm font-semibold text-indigo-300 transition-colors disabled:opacity-50"
            >
              <Play size={16} />
              {isRunning ? 'Выполняется...' : 'Запустить'}
            </button>
          </div>

          {output && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-[#1a1a1a] border border-green-500/30 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={16} className="text-green-400" />
                <span className="text-xs text-gray-400 uppercase">Результат</span>
              </div>
              <pre className="text-sm text-gray-200 font-mono whitespace-pre-wrap">{output}</pre>
            </motion.div>
          )}

          {showExplanation && explanation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg"
            >
              <p className="text-xs text-gray-300 leading-relaxed">{explanation}</p>
            </motion.div>
          )}
        </div>
      )}

      {type === 'visual' && (
        <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg p-6">
          <div className="text-center text-gray-400 text-sm">
            Интерактивная визуализация
          </div>
          <div className="mt-4 h-32 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
            <span className="text-gray-300 text-sm">Визуализация концепции</span>
          </div>
        </div>
      )}

      {type === 'concept' && (
        <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg p-4">
          <p className="text-sm text-gray-300 leading-relaxed">{description}</p>
          {explanation && (
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {showExplanation ? 'Скрыть объяснение' : 'Показать подробное объяснение'}
            </button>
          )}
          {showExplanation && explanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg"
            >
              <p className="text-xs text-gray-300 leading-relaxed">{explanation}</p>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}

