'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ChevronRight, Trophy, Brain } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

interface InteractiveQuizProps {
  questions: QuizQuestion[];
  title?: string;
}

export default function InteractiveQuiz({ questions, title = 'Проверь знания' }: InteractiveQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const handleAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);
    if (index === questions[currentQuestion].correct) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setCompleted(true);
    }
  };

  if (completed) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="my-6 p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-block mb-4"
          >
            <Trophy size={48} className="text-yellow-400" />
          </motion.div>
          <h4 className="text-xl font-bold text-gray-100 mb-2">Квиз завершен!</h4>
          <div className="text-3xl font-black text-green-400 mb-2">{percentage}%</div>
          <p className="text-sm text-gray-300">
            Правильных ответов: {score} из {questions.length}
          </p>
        </div>
      </motion.div>
    );
  }

  const question = questions[currentQuestion];
  const isCorrect = selectedAnswer === question.correct;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-6 p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain size={20} className="text-purple-400" />
          <h4 className="text-sm font-bold text-purple-400">{title}</h4>
        </div>
        <span className="text-xs text-gray-400">
          Вопрос {currentQuestion + 1} из {questions.length}
        </span>
      </div>

      <h5 className="text-lg font-bold text-gray-100 mb-4">{question.question}</h5>

      <div className="space-y-2 mb-4">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrectOption = index === question.correct;
          let bgClass = 'bg-[#2d2d2d] border-[#3a3a3a] hover:border-purple-500/50';
          
          if (showResult) {
            if (isCorrectOption) {
              bgClass = 'bg-green-500/20 border-green-500/50';
            } else if (isSelected && !isCorrectOption) {
              bgClass = 'bg-red-500/20 border-red-500/50';
            }
          }

          return (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={showResult}
              className={`w-full p-4 rounded-lg border text-left transition-all ${bgClass} ${
                showResult ? 'cursor-default' : 'cursor-pointer'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-200">{option}</span>
                {showResult && isCorrectOption && (
                  <CheckCircle2 size={20} className="text-green-400" />
                )}
                {showResult && isSelected && !isCorrectOption && (
                  <XCircle size={20} className="text-red-400" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {showResult && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-4"
        >
          {isCorrect ? (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-sm text-green-400 font-semibold mb-1">✓ Правильно!</p>
              {question.explanation && (
                <p className="text-xs text-gray-300">{question.explanation}</p>
              )}
            </div>
          ) : (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400 font-semibold mb-1">✗ Неправильно</p>
              {question.explanation && (
                <p className="text-xs text-gray-300">{question.explanation}</p>
              )}
            </div>
          )}
        </motion.div>
      )}

      {showResult && (
        <button
          onClick={handleNext}
          className="w-full px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg text-sm font-semibold text-purple-300 transition-colors flex items-center justify-center gap-2"
        >
          {currentQuestion < questions.length - 1 ? (
            <>
              Следующий вопрос
              <ChevronRight size={16} />
            </>
          ) : (
            <>
              Завершить квиз
              <Trophy size={16} />
            </>
          )}
        </button>
      )}
    </motion.div>
  );
}

