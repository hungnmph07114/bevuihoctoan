import React, { useState, useEffect } from 'react';
import { PlayerProgress } from '../types';
import { getLeaderboardData } from '../services/leaderboardService';

interface LeaderboardProps {
  progress: PlayerProgress;
  onClose: () => void;
  isVisible: boolean;
}

// Function to get the next Sunday at midnight
const getNextSundayMidnight = () => {    
    const now = new Date();
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + (7 - now.getDay()) % 7);
    nextSunday.setHours(23, 59, 59, 999);
    // If it's Sunday already, get next Sunday
    if (now.getDay() === 0 && now.getHours() >= 0) {
        nextSunday.setDate(nextSunday.getDate() + 7);
    }
    return nextSunday;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ progress, onClose, isVisible }) => {
  if (!isVisible) return null;

  const leaderboardData = getLeaderboardData(progress);
  const playerEntry = leaderboardData.find(p => p.isPlayer);
  const topTen = leaderboardData.slice(0, 10);

  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const nextSunday = getNextSundayMidnight();
      const diff = nextSunday.getTime() - now.getTime();
      
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-400 text-yellow-900';
    if (rank === 2) return 'bg-slate-300 text-slate-800';
    if (rank === 3) return 'bg-yellow-600/70 text-yellow-900';
    return 'bg-slate-200 text-slate-600';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 animate-fade-in p-4">
      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 animate-scale-up">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 z-20 w-10 h-10 bg-slate-200/80 rounded-full flex items-center justify-center text-slate-600 text-2xl font-bold shadow-md hover:bg-red-500 hover:text-white transition-all"
          aria-label="Đóng"
        >
          &times;
        </button>
        <div className="text-center mb-4">
          <h1 className="text-3xl md:text-4xl font-black text-slate-800">🏆 Bảng Xếp Hạng Tuần</h1>
          <p className="text-slate-500 mt-1">Làm mới sau: <span className="font-bold font-mono text-indigo-600">{timeLeft}</span></p>
        </div>
        
        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
          {topTen.map(entry => (
            <div key={entry.rank} className={`flex items-center p-3 rounded-lg shadow-sm ${entry.isPlayer ? 'bg-blue-200 border-2 border-blue-500' : 'bg-white'}`}>
              <div className={`w-12 text-center font-black text-lg p-1 rounded-md ${getRankColor(entry.rank)}`}>
                {getRankIcon(entry.rank)}
              </div>
              <p className="flex-grow font-bold text-slate-700 ml-4">{entry.name}</p>
              <p className="font-black text-xl text-yellow-600">{entry.score}</p>
            </div>
          ))}
        </div>

        {playerEntry && playerEntry.rank > 10 && (
          <div className="mt-4 pt-4 border-t-2 border-dashed border-slate-300">
            <div className="flex items-center p-3 rounded-lg shadow-sm bg-blue-200 border-2 border-blue-500 animate-pulse">
                <div className={`w-12 text-center font-black text-lg p-1 rounded-md ${getRankColor(playerEntry.rank)}`}>
                    {getRankIcon(playerEntry.rank)}
                </div>
                <p className="flex-grow font-bold text-slate-700 ml-4">{playerEntry.name}</p>
                <p className="font-black text-xl text-yellow-600">{playerEntry.score}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
