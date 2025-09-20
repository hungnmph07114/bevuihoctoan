import React from 'react';
import { AnsweredQuestion } from '../types';

interface HistoryProps {
  incorrectAnswers: AnsweredQuestion[];
  onClose: () => void;
  isVisible: boolean;
}

const History: React.FC<HistoryProps> = ({ incorrectAnswers, onClose, isVisible }) => {
  if (!isVisible) return null;

  // Hiển thị câu hỏi gần nhất lên đầu
  const reversedHistory = [...incorrectAnswers].reverse();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 animate-fade-in p-4">
      <div className="relative w-full max-w-2xl bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 animate-scale-up">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 z-20 w-10 h-10 bg-slate-200/80 rounded-full flex items-center justify-center text-slate-600 text-2xl font-bold shadow-md hover:bg-red-500 hover:text-white transition-all"
          aria-label="Đóng"
        >
          &times;
        </button>
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 drop-shadow-lg text-center">
          Ôn tập lại
        </h1>
        <p className="text-slate-600 mt-2 text-lg text-center">Cùng xem lại những câu con đã làm sai nhé!</p>

        <div className="mt-8 max-h-[60vh] overflow-y-auto pr-4 space-y-6 text-left">
          {reversedHistory.length > 0 ? (
            reversedHistory.map((item, index) => (
              <div key={index} className="bg-white p-5 rounded-xl shadow-md animate-fade-in">
                <p className="text-lg font-bold text-slate-800">{item.question.question}</p>
                <div className="mt-3 space-y-2">
                  <p>
                    <span className="font-semibold">Con đã chọn: </span>
                    <span className="font-bold text-red-500">{item.userAnswer}</span>
                  </p>
                  <p>
                    <span className="font-semibold">Đáp án đúng: </span>
                    <span className="font-bold text-green-600">{item.question.answer}</span>
                  </p>
                </div>
                <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-800 p-3 rounded-md mt-4">
                  <p><span className="font-bold">Gia sư AI giải thích:</span> {item.explanation}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-slate-500">Chưa có câu trả lời sai nào. Làm tốt lắm!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
