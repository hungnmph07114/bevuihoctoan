import React, { useState } from 'react';
import { PlayerProgress } from '../types';

interface WelcomeProps {
  onSetupComplete: (progress: PlayerProgress) => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onSetupComplete }) => {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSetupComplete({
        name: name.trim(),
        grade,
        level: 1,
        score: 0,
        // FIX: Initialize weeklyScore and lastWeeklyReset for new players.
        weeklyScore: 0,
        lastWeeklyReset: '2000-01-01',
        badges: [],
        perfectScoreStreak: 0,
        incorrectlyAnsweredQuestions: [],
        customization: { activeTheme: 'default', activePawn: 'default_pawn', activeAvatar: 'default_avatar' },
        unlockedThemes: ['default'],
        unlockedPawns: ['default_pawn'],
        unlockedAvatars: ['default_avatar'],
        dailyMissions: { missions: [], lastUpdated: '2000-01-01' },
        questionHistory: [],
        creativeQuestionsGenerated: 0,
        questionCache: {},
        inventory: { hint: 0, skip: 0, time_boost: 0 },
        claimedChests: [],
        completedEvents: [],
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-sky-200 to-indigo-200 p-4 animate-fade-in">
      <div className="w-full max-w-md text-center">
        <div className="text-8xl animate-float">🤖</div>
        <h1 className="text-4xl md:text-5xl font-black text-indigo-800 drop-shadow-lg mt-4">
          Chào mừng bạn nhỏ!
        </h1>
        <p className="text-slate-600 mt-2 text-lg">Tớ là Tí Nị, người bạn đồng hành của con trên chặng đường chinh phục toán học!</p>
        
        <div className="mt-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-2xl p-8 animate-scale-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-left text-sm font-bold text-slate-700 mb-2">Đầu tiên, cho tớ biết tên của con nhé?</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: An"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:ring-4 focus:ring-yellow-400 focus:border-yellow-500 transition-all duration-300"
                  required
                />
              </div>
              <div>
                <label htmlFor="grade" className="block text-left text-sm font-bold text-slate-700 mb-2">Con đang học lớp mấy rồi?</label>
                <select
                  id="grade"
                  value={grade}
                  onChange={(e) => setGrade(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:ring-4 focus:ring-yellow-400 focus:border-yellow-500 transition-all duration-300 bg-white"
                >
                  {[1, 2, 3, 4, 5].map(g => (
                    <option key={g} value={g}>Lớp {g}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={!name.trim()}
                className="w-full bg-orange-500 text-white font-bold py-4 px-6 rounded-xl text-xl shadow-lg hover:bg-orange-600 transform hover:-translate-y-1 transition-all duration-300 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:transform-none"
              >
                Bắt đầu hành trình!
              </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default Welcome;