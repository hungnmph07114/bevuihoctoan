import React, { useState } from 'react';
import { PlayerProgress, Badge as BadgeType } from '../types';
import { ALL_BADGES } from '../services/badgeService';
import History from './History';
import BadgeCollection from './BadgeCollection';

interface ProfileProps {
  progress: PlayerProgress;
  onClose: () => void;
  isVisible: boolean;
  activeAvatarIcon: string;
  onUpdateGrade: (newGrade: number) => void;
}

const XP_PER_LEVEL = 150;

const StatBox: React.FC<{ label: string; value: string | number; icon: string }> = ({ label, value, icon }) => (
    <div className="bg-white/60 p-4 rounded-xl text-center shadow-inner">
        <div className="text-4xl">{icon}</div>
        <div className="text-2xl font-black text-slate-800 mt-1">{value}</div>
        <div className="text-sm font-semibold text-slate-500">{label}</div>
    </div>
);

const Profile: React.FC<ProfileProps> = ({ progress, onClose, isVisible, activeAvatarIcon, onUpdateGrade }) => {
    if (!isVisible) return null;

    const [showHistory, setShowHistory] = useState(false);
    const [showBadges, setShowBadges] = useState(false);

    const earnedBadges = ALL_BADGES.filter(b => progress.badges.includes(b.id));
    const xpForCurrentLevel = (progress.level - 1) * XP_PER_LEVEL;
    const currentLevelProgress = progress.score - xpForCurrentLevel;
    const progressPercentage = Math.max(0, Math.min(100, (currentLevelProgress / XP_PER_LEVEL) * 100));

    return (
        <>
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 animate-fade-in p-4">
                <div className="relative w-full max-w-md bg-slate-100 bg-gradient-to-br from-slate-50 to-gray-200 rounded-2xl shadow-2xl p-6 animate-scale-up">
                    <button 
                        onClick={onClose} 
                        className="absolute top-3 right-3 z-20 w-10 h-10 bg-slate-200/80 rounded-full flex items-center justify-center text-slate-600 text-2xl font-bold shadow-md hover:bg-red-500 hover:text-white transition-all"
                        aria-label="Đóng"
                    >
                        &times;
                    </button>
                    
                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-5xl font-bold text-white shadow-lg -mt-16 border-4 border-white">
                            {activeAvatarIcon}
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 mt-3">{progress.name}</h2>
                        <div className="mt-1">
                            <label htmlFor="profile-grade-select" className="sr-only">Đổi lớp</label>
                            <select
                                id="profile-grade-select"
                                value={progress.grade}
                                onChange={(e) => onUpdateGrade(Number(e.target.value))}
                                className="font-semibold text-slate-500 bg-transparent border-0 rounded-md focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            >
                                {[1, 2, 3, 4, 5].map(g => (
                                    <option key={g} value={g}>Lớp {g}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="font-bold text-slate-700 text-center">Cấp độ {progress.level}</h3>
                        <div className="w-full bg-slate-200 rounded-full h-4 mt-2 shadow-inner">
                            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-4 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                        </div>
                         <p className="text-xs text-right mt-1 text-slate-500">{currentLevelProgress} / {XP_PER_LEVEL} XP</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                         <StatBox label="Tổng điểm" value={progress.score} icon="🌟" />
                         <StatBox label="Huy hiệu" value={`${earnedBadges.length}/${ALL_BADGES.length}`} icon="🏆" />
                    </div>

                    <div className="flex flex-col gap-3 mt-6">
                        <button onClick={() => setShowBadges(true)} className="w-full text-left p-4 rounded-xl bg-white shadow-md font-bold text-slate-700 hover:bg-yellow-100 transition-colors">
                            🏅 Xem Bộ Sưu Tập Huy Hiệu
                        </button>
                        <button onClick={() => setShowHistory(true)} className="w-full text-left p-4 rounded-xl bg-white shadow-md font-bold text-slate-700 hover:bg-yellow-100 transition-colors">
                            📚 Ôn Tập Bài Sai
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Modals within profile modal */}
            <History isVisible={showHistory} incorrectAnswers={progress.incorrectlyAnsweredQuestions} onClose={() => setShowHistory(false)} />
            <BadgeCollection isVisible={showBadges} progress={progress} onClose={() => setShowBadges(false)} />
        </>
    );
};

export default Profile;
