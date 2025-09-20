import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../types';
import ProgressBar from './ProgressBar';
import { playCorrectSound, playIncorrectSound } from '../services/soundService';

interface LightningRoundProps {
  questions: Question[];
  onComplete: (correctAnswers: number) => void;
}

const LightningRound: React.FC<LightningRoundProps> = ({ questions, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      onComplete(correctCount);
    }
  }, [timeLeft, correctCount, onComplete]);

  const handleAnswer = (answer: string) => {
    if (isAnswered) return;
    setIsAnswered(true);

    if (answer.trim().toLowerCase() === currentQuestion.answer.trim().toLowerCase()) {
      setCorrectCount(prev => prev + 1);
      playCorrectSound();
    } else {
      playIncorrectSound();
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setIsAnswered(false);
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        onComplete(correctCount);
      }
    }, 1000);
  };
  
  const getButtonClass = (option: string) => {
    if (!isAnswered) {
      return "bg-slate-700/80 hover:bg-slate-600 border-slate-500";
    }
    if (option === currentQuestion.answer) {
      return "bg-green-500 border-green-700";
    }
    return "bg-red-500 border-red-700";
  };

  if (!currentQuestion) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-4 animate-fade-in text-white">
      <div className="w-full max-w-2xl text-center">
        <div className="text-8xl animate-bounce-slow">⚡️</div>
        <h1 className="text-4xl md:text-5xl font-black drop-shadow-lg mt-4">
          Thử Thách Chớp Nhoáng!
        </h1>
        <p className="text-slate-300 mt-2 text-lg">Trả lời nhanh nhất có thể!</p>

        <div className="mt-8">
            <div className="flex justify-between items-center font-bold mb-2">
                <span>Câu {currentQuestionIndex + 1}/{questions.length}</span>
                <span className={`font-mono text-2xl p-1 rounded-md ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                    00:{timeLeft.toString().padStart(2, '0')}
                </span>
            </div>
            <ProgressBar current={currentQuestionIndex + 1} total={questions.length} />
        </div>

        <div className="mt-6 bg-black/30 backdrop-blur-md p-6 rounded-2xl shadow-2xl min-h-[150px] flex items-center justify-center">
          <p className="text-2xl md:text-4xl font-bold leading-tight">{currentQuestion.question}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {(currentQuestion.options || []).map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              disabled={isAnswered}
              className={`p-4 rounded-xl text-xl font-bold border-b-4 transition-all duration-200 shadow-lg ${getButtonClass(option)}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LightningRound;
