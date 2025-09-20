import React from 'react';
import { PlayerProgress, Badge } from '../types';
import { ALL_BADGES } from '../services/badgeService';

interface BadgeCollectionProps {
  progress: PlayerProgress;
  onClose: () => void;
  isVisible: boolean;
}

const RARITY_COLORS = {
    common: 'border-slate-400 bg-slate-100',
    uncommon: 'border-blue-500 bg-blue-100',
    rare: 'border-purple-600 bg-purple-100',
    epic: 'border-yellow-500 bg-yellow-100',
};

const RARITY_TEXT = {
    common: 'Thường',
    uncommon: 'Hiếm',
    rare: 'Rất Hiếm',
    epic: 'Sử Thi',
}

const BadgeCard: React.FC<{ badge: Badge, isUnlocked: boolean }> = ({ badge, isUnlocked }) => {
    const rarityColor = RARITY_COLORS[badge.rarity];

    return (
        <div className={`p-4 rounded-2xl shadow-md flex flex-col items-center justify-between text-center border-b-8 transition-all duration-300 ${isUnlocked ? `${rarityColor} transform hover:-translate-y-1` : 'bg-slate-50 border-slate-200'}`}>
            <div>
                <div className={`text-6xl transition-all duration-500 ${isUnlocked ? '' : 'grayscale opacity-40'}`}>{isUnlocked ? badge.icon : '❓'}</div>
                <h3 className={`mt-3 font-bold text-lg ${isUnlocked ? 'text-slate-800' : 'text-slate-500'}`}>{isUnlocked ? badge.name : 'Chưa khám phá'}</h3>
                <p className={`mt-1 text-sm h-16 ${isUnlocked ? 'text-slate-600' : 'text-slate-400'}`}>
                    {isUnlocked ? badge.description : badge.hint}
                </p>
            </div>
            <div className={`mt-4 text-xs font-bold px-2 py-1 rounded-full ${isUnlocked ? 'bg-white' : 'bg-slate-200 text-slate-500'}`}>
                {RARITY_TEXT[badge.rarity]}
            </div>
        </div>
    );
}

const BadgeCollection: React.FC<BadgeCollectionProps> = ({ progress, onClose, isVisible }) => {
  if (!isVisible) return null;

  const unlockedCount = progress.badges.length;
  const totalCount = ALL_BADGES.length;

  // Sort badges: unlocked first, then by rarity
  const sortedBadges = [...ALL_BADGES].sort((a, b) => {
    const aUnlocked = progress.badges.includes(a.id);
    const bUnlocked = progress.badges.includes(b.id);
    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;
    const rarityOrder = ['common', 'uncommon', 'rare', 'epic'];
    return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 animate-fade-in p-4">
      <div className="relative w-full max-w-4xl bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 animate-scale-up">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 z-20 w-10 h-10 bg-slate-200/80 rounded-full flex items-center justify-center text-slate-600 text-2xl font-bold shadow-md hover:bg-red-500 hover:text-white transition-all"
          aria-label="Đóng"
        >
          &times;
        </button>
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-black text-slate-800">Bộ Sưu Tập Huy Hiệu</h1>
          <p className="text-slate-600 mt-1">Đã sưu tầm: <span className="font-bold">{unlockedCount} / {totalCount}</span></p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[70vh] overflow-y-auto pr-2">
          {sortedBadges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} isUnlocked={progress.badges.includes(badge.id)} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BadgeCollection;
