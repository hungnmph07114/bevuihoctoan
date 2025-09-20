import React, { useState } from 'react';
import { Question } from '../../types';
import { playCorrectSound, playIncorrectSound } from '../../services/soundService';

interface RiddleChallengeProps {
  question: Question;
  onComplete: (isCorrect: boolean) => void;
}

const RiddleChallenge: React.FC<RiddleChallengeProps> = ({ question, onComplete }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const processAnswer = (userAnswer: string) => {
    if (isAnswered) return;

    const isCorrect = userAnswer.trim().toLowerCase() === question.answer.trim().toLowerCase();
    setIsAnswered(true);
    setSelectedAnswer(userAnswer);

    if (isCorrect) {
      playCorrectSound();
    } else {
      playIncorrectSound();
    }

    // Wait a bit before completing so user sees the result
    setTimeout(() => {
      onComplete(isCorrect);
    }, 2000);
  };

  const getButtonClass = (option: string) => {
    if (!isAnswered) {
      return "bg-white/80 hover:bg-yellow-100 border-slate-300 hover:border-yellow-400";
    }
    if (option === question.answer) {
      return "bg-green-500 border-green-700 text-white animate-pulse";
    }
    if (option === selectedAnswer && option !== question.answer) {
      return "bg-red-500 border-red-700 text-white";
    }
    return "bg-slate-200/60 border-slate-300 text-slate-500 cursor-not-allowed opacity-70";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-4 animate-fade-in">
      <div className="w-full max-w-2xl text-center">
        <div className="text-8xl animate-float">🦉</div>
        <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-lg mt-4">
          Câu Đố của Nhà Thông Thái
        </h1>
        <p className="text-indigo-200 mt-2 text-lg">Hãy suy nghĩ thật kỹ nhé!</p>

        <div className="mt-8 bg-white/20 backdrop-blur-md p-6 rounded-2xl shadow-2xl animate-scale-up">
          <p className="text-2xl md:text-3xl font-bold text-white leading-tight">{question.question}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {(question.options || []).map((option, index) => (
              <button
                key={index}
                onClick={() => processAnswer(option)}
                disabled={isAnswered}
                className={`p-4 rounded-xl text-xl font-bold border-b-4 transition-all duration-200 transform hover:-translate-y-1 shadow-lg ${getButtonClass(option)}`}
              >
                {option}
              </button>
            ))}
          </div>

          {isAnswered && (
             <div className="mt-6 bg-black/30 p-4 rounded-lg text-white animate-fade-in">
                <p><span className="font-bold">Nhà thông thái giải thích:</span> {question.explanation}</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiddleChallenge;
