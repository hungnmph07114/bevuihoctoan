import React, { useState } from 'react';
import { QuizResult, Badge, DailyMission } from '../types';

interface ReviewProps {
  result: QuizResult;
  onPlayAgain: () => void;
  onGoToDashboard: () => void;
  leveledUp: boolean;
  newlyAwardedBadges: Badge[];
  newlyCompletedMissions: DailyMission[];
}

const Review: React.FC<ReviewProps> = ({ result, onPlayAgain, onGoToDashboard, leveledUp, newlyAwardedBadges, newlyCompletedMissions }) => {
  const { correctAnswers, totalQuestions, score } = result;
  const [showResults, setShowResults] = useState(false);
  
  let message = "Cố gắng hơn lần sau con nhé!";
  if (correctAnswers === totalQuestions) {
    message = "Xuất sắc! Con đã trả lời đúng tất cả!";
  } else if (correctAnswers >= totalQuestions / 2) {
    message = "Làm tốt lắm con!";
  }

  const handleShowResults = () => {
    setShowResults(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-4 animate-fade-in">
      <div className="w-full max-w-md text-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 animate-scale-up">
        <h1 className="text-4xl font-black text-orange-600 drop-shadow-lg">
          Hoàn Thành!
        </h1>
        
        {!showResults ? (
          <div className="my-8 flex flex-col items-center animate-fade-in">
            <p className="text-slate-600 text-xl">Con đã làm rất tốt!</p>
            <button
              onClick={handleShowResults}
              className="mt-6 w-full max-w-xs bg-yellow-500 text-white font-bold py-4 px-6 rounded-xl text-xl shadow-lg hover:bg-yellow-600 transform hover:-translate-y-1 transition-all duration-300"
            >
              Xem kết quả & nhận thưởng!
            </button>
          </div>
        ) : (
          <div className="animate-fade-in">
            <p className="text-slate-600 mt-4 text-xl">{message}</p>
        
            <div className="my-8 bg-white p-6 rounded-xl shadow-inner">
              <p className="text-2xl text-slate-700">Con đã trả lời đúng</p>
              <p className="text-6xl font-black text-green-600 my-2">
                {correctAnswers}/{totalQuestions}
              </p>
              <p className="text-2xl text-slate-700">và nhận được <span className="font-bold text-yellow-500">{score}</span> điểm!</p>
            </div>

            {leveledUp && (
              <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-lg mb-6 text-left animate-fade-in">
                <p className="font-bold">🎉 Chúc mừng lên cấp! 🎉</p>
                <p>Con đã mở khóa các thử thách khó hơn!</p>
              </div>
            )}
            
            {newlyAwardedBadges.length > 0 && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-lg mb-6 text-left animate-fade-in">
                    <p className="font-bold">🏆 Đạt thành tích mới! 🏆</p>
                    {newlyAwardedBadges.map(badge => (
                        <div key={badge.id} className="flex items-center mt-2">
                            <span className="text-2xl mr-2">{badge.icon}</span>
                            <span>{badge.name}</span>
                        </div>
                    ))}
                </div>
            )}
            
            {newlyCompletedMissions.length > 0 && (
                <div className="bg-purple-100 border-l-4 border-purple-500 text-purple-800 p-4 rounded-lg mb-6 text-left animate-fade-in">
                    <p className="font-bold">✨ Hoàn thành nhiệm vụ! ✨</p>
                    {newlyCompletedMissions.map(mission => (
                        <div key={mission.id} className="flex items-center justify-between mt-2">
                            <span>{mission.description}</span>
                            <span className="font-bold whitespace-nowrap">+{mission.reward} điểm</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-4">
              <button
                onClick={onPlayAgain}
                className="w-full bg-green-500 text-white font-bold py-3 px-6 rounded-xl text-lg shadow-lg hover:bg-green-600 transform hover:-translate-y-1 transition-all duration-300"
              >
                Thử thách mới
              </button>
              <button
                onClick={onGoToDashboard}
                className="w-full bg-slate-500 text-white font-bold py-3 px-6 rounded-xl text-lg shadow-lg hover:bg-slate-600 transform hover:-translate-y-1 transition-all duration-300"
              >
                Quay về
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Review;