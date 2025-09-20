import React, { useState } from 'react';
import { PlayerProgress, Theme, PowerUpType, Pawn, Avatar } from '../types';
import { ALL_THEMES } from '../services/themeService';
import { ALL_POWER_UPS } from '../services/powerUpService';
import { ALL_PAWNS } from '../services/decorationService';
import { ALL_AVATARS } from '../services/avatarService';

interface StoreProps {
  progress: PlayerProgress;
  onClose: () => void;
  onBuyTheme: (theme: Theme) => void;
  onEquipTheme: (theme: Theme) => void;
  onBuyPowerUp: (powerUp: PowerUpType) => void;
  onBuyPawn: (pawn: Pawn) => void;
  onEquipPawn: (pawn: Pawn) => void;
  onBuyAvatar: (avatar: Avatar) => void;
  onEquipAvatar: (avatar: Avatar) => void;
  isVisible: boolean;
}

const Store: React.FC<StoreProps> = ({ progress, onClose, onBuyTheme, onEquipTheme, onBuyPowerUp, onBuyPawn, onEquipPawn, onBuyAvatar, onEquipAvatar, isVisible }) => {
  const [activeTab, setActiveTab] = useState<'themes' | 'powerups' | 'pawns' | 'avatars'>('themes');

  if (!isVisible) return null;

  const getThemeButtonState = (theme: Theme) => {
    const isUnlocked = progress.unlockedThemes.includes(theme.id);
    const isActive = progress.customization.activeTheme === theme.id;
    const canAfford = progress.score >= theme.cost;

    if (isActive) {
      return <button disabled className="w-full py-2 px-4 rounded-lg bg-green-600 text-white font-bold cursor-not-allowed">Đã trang bị</button>;
    }
    if (isUnlocked) {
      return <button onClick={() => onEquipTheme(theme)} className="w-full py-2 px-4 rounded-lg bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors">Trang bị</button>;
    }
    if (canAfford) {
        return <button onClick={() => onBuyTheme(theme)} className="w-full py-2 px-4 rounded-lg bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors">Mua {theme.cost} điểm</button>;
    }
    return <button disabled className="w-full py-2 px-4 rounded-lg bg-slate-400 text-white font-bold cursor-not-allowed">Cần {theme.cost} điểm</button>;
  };

  const getPowerUpButtonState = (powerUp: typeof ALL_POWER_UPS[0]) => {
      const canAfford = progress.score >= powerUp.cost;
      if (canAfford) {
        return <button onClick={() => onBuyPowerUp(powerUp.id)} className="w-full py-2 px-4 rounded-lg bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors">Mua {powerUp.cost} điểm</button>;
      }
      return <button disabled className="w-full py-2 px-4 rounded-lg bg-slate-400 text-white font-bold cursor-not-allowed">Cần {powerUp.cost} điểm</button>;
  };

  const getPawnButtonState = (pawn: Pawn) => {
    const isUnlocked = progress.unlockedPawns.includes(pawn.id);
    const isActive = progress.customization.activePawn === pawn.id;
    const canAfford = progress.score >= pawn.cost;

    if (isActive) {
      return <button disabled className="w-full py-2 px-4 rounded-lg bg-green-600 text-white font-bold cursor-not-allowed">Đã trang bị</button>;
    }
    if (isUnlocked) {
      return <button onClick={() => onEquipPawn(pawn)} className="w-full py-2 px-4 rounded-lg bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors">Trang bị</button>;
    }
    if (canAfford) {
        return <button onClick={() => onBuyPawn(pawn)} className="w-full py-2 px-4 rounded-lg bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors">Mua {pawn.cost} điểm</button>;
    }
    return <button disabled className="w-full py-2 px-4 rounded-lg bg-slate-400 text-white font-bold cursor-not-allowed">Cần {pawn.cost} điểm</button>;
  };

  const getAvatarButtonState = (avatar: Avatar) => {
    const isUnlocked = progress.unlockedAvatars.includes(avatar.id);
    const isActive = progress.customization.activeAvatar === avatar.id;
    const canAfford = progress.score >= avatar.cost;

    if (isActive) {
      return <button disabled className="w-full py-2 px-4 rounded-lg bg-green-600 text-white font-bold cursor-not-allowed">Đã trang bị</button>;
    }
    if (isUnlocked) {
      return <button onClick={() => onEquipAvatar(avatar)} className="w-full py-2 px-4 rounded-lg bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors">Trang bị</button>;
    }
    if (canAfford) {
        return <button onClick={() => onBuyAvatar(avatar)} className="w-full py-2 px-4 rounded-lg bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors">Mua {avatar.cost} điểm</button>;
    }
    return <button disabled className="w-full py-2 px-4 rounded-lg bg-slate-400 text-white font-bold cursor-not-allowed">Cần {avatar.cost} điểm</button>;
  };

  return (
     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 animate-fade-in p-4">
      <div className="relative w-full max-w-3xl bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 animate-scale-up">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 z-20 w-10 h-10 bg-slate-200/80 rounded-full flex items-center justify-center text-slate-600 text-2xl font-bold shadow-md hover:bg-red-500 hover:text-white transition-all"
          aria-label="Đóng"
        >
          &times;
        </button>

        <div className="flex justify-between items-start mb-4">
            <div>
                 <h1 className="text-3xl md:text-4xl font-black text-slate-800">Cửa hàng</h1>
                 <p className="text-slate-600 mt-1">Điểm của con: <span className="font-bold text-yellow-600">{progress.score}</span></p>
            </div>
        </div>

        <div className="flex border-b-2 border-slate-200 mb-4 overflow-x-auto">
            <button onClick={() => setActiveTab('themes')} className={`py-2 px-4 font-bold whitespace-nowrap ${activeTab === 'themes' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-slate-500'}`}>Giao diện</button>
            <button onClick={() => setActiveTab('avatars')} className={`py-2 px-4 font-bold whitespace-nowrap ${activeTab === 'avatars' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-slate-500'}`}>Ảnh đại diện</button>
            <button onClick={() => setActiveTab('pawns')} className={`py-2 px-4 font-bold whitespace-nowrap ${activeTab === 'pawns' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-slate-500'}`}>Linh vật</button>
            <button onClick={() => setActiveTab('powerups')} className={`py-2 px-4 font-bold whitespace-nowrap ${activeTab === 'powerups' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-slate-500'}`}>Vật phẩm</button>
        </div>
        
        {activeTab === 'themes' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto pr-2 animate-fade-in">
            {ALL_THEMES.map((theme) => (
                <div key={theme.id} className="bg-white rounded-2xl shadow-lg p-4 flex flex-col justify-between items-center text-center transition-transform hover:scale-105">
                <div>
                    <div className={`w-24 h-16 rounded-lg bg-gradient-to-br ${theme.background.main} mx-auto mb-3 shadow-inner`}></div>
                    <div className="text-2xl">{theme.icon}</div>
                    <h2 className="text-lg font-bold text-slate-800 mt-1">{theme.name}</h2>
                </div>
                <div className="mt-4 w-full">
                    {getThemeButtonState(theme)}
                </div>
                </div>
            ))}
            </div>
        )}

        {activeTab === 'avatars' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto pr-2 animate-fade-in">
            {ALL_AVATARS.map((avatar) => (
                <div key={avatar.id} className="bg-white rounded-2xl shadow-lg p-4 flex flex-col justify-between items-center text-center transition-transform hover:scale-105">
                <div>
                    <div className="text-6xl flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-3">{avatar.icon}</div>
                    <h2 className="text-lg font-bold text-slate-800 mt-2">{avatar.name}</h2>
                    <p className="text-xs text-slate-500 mt-1 h-10">{avatar.description}</p>
                </div>
                <div className="mt-4 w-full">
                    {getAvatarButtonState(avatar)}
                </div>
                </div>
            ))}
            </div>
        )}

        {activeTab === 'pawns' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto pr-2 animate-fade-in">
            {ALL_PAWNS.map((pawn) => (
                <div key={pawn.id} className="bg-white rounded-2xl shadow-lg p-4 flex flex-col justify-between items-center text-center transition-transform hover:scale-105">
                <div>
                    <div className="text-6xl">{pawn.icon}</div>
                    <h2 className="text-lg font-bold text-slate-800 mt-2">{pawn.name}</h2>
                    <p className="text-xs text-slate-500 mt-1 h-10">{pawn.description}</p>
                </div>
                <div className="mt-4 w-full">
                    {getPawnButtonState(pawn)}
                </div>
                </div>
            ))}
            </div>
        )}

        {activeTab === 'powerups' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto pr-2 animate-fade-in">
                {ALL_POWER_UPS.map((powerUp) => (
                    <div key={powerUp.id} className="bg-white rounded-2xl shadow-lg p-4 flex flex-col justify-between items-center text-center transition-transform hover:scale-105">
                        <div>
                            <div className="text-5xl">{powerUp.icon}</div>
                            <h2 className="text-lg font-bold text-slate-800 mt-2">{powerUp.name}</h2>
                            <p className="text-xs text-slate-500 mt-1 h-10">{powerUp.description}</p>
                            <p className="text-sm font-semibold text-slate-600 mt-2">Đang có: <span className="font-bold text-blue-600">{progress.inventory[powerUp.id] || 0}</span></p>
                        </div>
                        <div className="mt-4 w-full">
                            {getPowerUpButtonState(powerUp)}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default Store;