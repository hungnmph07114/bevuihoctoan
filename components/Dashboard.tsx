import React from 'react';
import { PlayerProgress, DailyMission } from '../types';
import AdventureMap from './AdventureMap'; // Import the map component

interface MainHubProps {
  progress: PlayerProgress;
  onStartChallenge: () => void;
  onGoToStore: () => void;
  onGoToCreativeMode: () => void;
  onGoToProfile: () => void;
  onGoToParentDashboard: () => void;
  onGoToLeaderboard: () => void; // New prop for leaderboard
  justCompletedMission: boolean;
  onClaimChestReward: (chestLevel: number) => void;
  activePawnIcon: string;
  activeAvatarIcon: string;
}

const XP_PER_LEVEL = 150;

const MissionDisplay: React.FC<{ mission: DailyMission }> = ({ mission }) => {
    const percentage = mission.goal > 0 ? (mission.currentProgress / mission.goal) * 100 : 0;
    const isCompleted = mission.isCompleted;

    return (
        <div className={`p-3 rounded-xl shadow-md transition-all duration-300 ${isCompleted ? 'bg-gradient-to-br from-green-200 to-emerald-300 border-l-4 border-green-600' : 'bg-white'}`}>
            <div className="flex justify-between items-center">
                <p className={`text-sm font-semibold ${isCompleted ? 'text-green-900 line-through opacity-70' : 'text-slate-700'}`}>{mission.description}</p>
                <div className={`font-bold text-xs px-2 py-1 rounded-full flex items-center gap-1 ${isCompleted ? 'bg-white text-green-700' : 'bg-yellow-400 text-yellow-900'}`}>
                    {isCompleted ? <>✅ Đã nhận</> : `+${mission.reward} ✨`}
                </div>
            </div>
            {!isCompleted && (
                <div className="mt-2">
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full transition-all duration-300" style={{ width: `${percentage}%` }}></div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Top User Profile Bar ---
const UserProfileBar: React.FC<{ progress: PlayerProgress, onGoToProfile: () => void, activeAvatarIcon: string }> = ({ progress, onGoToProfile, activeAvatarIcon }) => {
    const xpForCurrentLevel = (progress.level - 1) * XP_PER_LEVEL;
    const currentLevelProgress = progress.score - xpForCurrentLevel;
    const progressPercentage = Math.max(0, Math.min(100, (currentLevelProgress / XP_PER_LEVEL) * 100));

    return (
        <div className="fixed top-0 left-0 right-0 p-3 bg-white/60 backdrop-blur-md shadow-md z-30 md:ml-64">
            <div className="flex items-center justify-between max-w-6xl mx-auto">
                <button onClick={onGoToProfile} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                        {activeAvatarIcon}
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-800 text-lg">{progress.name}</h2>
                        <div className="w-24 bg-slate-200 rounded-full h-2 mt-1">
                            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                        </div>
                    </div>
                </button>
                 <div className="flex items-center gap-4">
                    <div className="text-center">
                        <div className="font-black text-xl text-blue-600">{progress.level}</div>
                        <div className="text-xs font-bold text-slate-500">CẤP ĐỘ</div>
                    </div>
                     <div className="text-center">
                        <div className="font-black text-xl text-yellow-600">{progress.score}</div>
                        <div className="text-xs font-bold text-slate-500">ĐIỂM</div>
                    </div>
                 </div>
            </div>
        </div>
    );
}

const SidebarButton: React.FC<{ icon: string; label: string; onClick: () => void; }> = ({ icon, label, onClick }) => (
    <button 
        onClick={onClick} 
        className="flex items-center w-full p-3 rounded-lg text-left text-slate-700 font-bold hover:bg-slate-200/70 transition-colors duration-200"
    >
        <span className="text-2xl mr-4">{icon}</span>
        <span>{label}</span>
    </button>
);


const MainHub: React.FC<MainHubProps> = ({ progress, onStartChallenge, onGoToStore, onGoToCreativeMode, onGoToProfile, onGoToParentDashboard, onGoToLeaderboard, justCompletedMission, onClaimChestReward, activePawnIcon, activeAvatarIcon }) => {
    const activeMissions = progress.dailyMissions?.missions.filter(m => !m.isCompleted) || [];
    const completedMissions = progress.dailyMissions?.missions.filter(m => m.isCompleted) || [];
    
    return (
        <div className="relative flex flex-col min-h-screen w-full animate-fade-in">

            {/* --- Desktop Sidebar --- */}
            <aside className="hidden md:flex flex-col fixed top-0 left-0 w-64 h-full bg-slate-50/80 backdrop-blur-md p-4 z-40 border-r border-slate-200/80">
                 <div className="text-center mb-6">
                    <h2 className="text-xl font-black text-rose-500">Bé Yêu Học Toán</h2>
                </div>

                {/* Daily Missions for Desktop */}
                {(progress.dailyMissions?.missions?.length > 0) && (
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">Nhiệm vụ hàng ngày</h3>
                        <div className="space-y-2">
                            {[...activeMissions, ...completedMissions].map(mission => (
                                <MissionDisplay key={mission.id} mission={mission} />
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Action Buttons for Desktop */}
                <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">Hành động</h3>
                    <nav className="space-y-1">
                        <SidebarButton icon="🏆" label="Xếp hạng" onClick={onGoToLeaderboard} />
                        <SidebarButton icon="🛍️" label="Cửa hàng" onClick={onGoToStore} />
                        <SidebarButton icon="🎨" label="Sáng tạo" onClick={onGoToCreativeMode} />
                        <SidebarButton icon="👨‍👩‍👧" label="Phụ huynh" onClick={onGoToParentDashboard} />
                    </nav>
                </div>
            </aside>
            
            <UserProfileBar progress={progress} onGoToProfile={onGoToProfile} activeAvatarIcon={activeAvatarIcon} />
            
            {/* --- Main Content Area --- */}
            <main className="flex-grow p-4 pt-24 pb-32 md:ml-64">
                 <div className="w-full max-w-6xl mx-auto">
                    {/* Adventure Map */}
                    <div className="bg-white/50 backdrop-blur-md p-2 md:p-4 rounded-2xl shadow-lg">
                      <AdventureMap progress={progress} onClaimChest={onClaimChestReward} activePawnIcon={activePawnIcon} />
                    </div>
                 </div>
                
                {/* --- Mobile & Tablet Layout: In-flow content --- */}
                <div className="w-full max-w-4xl mx-auto mt-6 md:hidden">
                    {/* Daily Missions for Mobile */}
                    {(progress.dailyMissions?.missions?.length > 0) && (
                        <div className="mb-6 px-2">
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Nhiệm vụ hàng ngày</h3>
                            <div className="space-y-2">
                                {[...activeMissions, ...completedMissions].map(mission => (
                                    <MissionDisplay key={mission.id} mission={mission} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* --- Start Challenge Button (Bottom Floating) --- */}
            <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent z-20 md:ml-64 md:bottom-4">
                 <div className="max-w-2xl mx-auto">
                     <button 
                         onClick={onStartChallenge}
                         className="w-full bg-orange-500 text-white font-black py-4 px-6 rounded-2xl text-2xl shadow-lg hover:bg-orange-600 transform hover:-translate-y-1 transition-all duration-300 animate-bounce-slow"
                     >
                         Bắt đầu Thử thách!
                     </button>
                 </div>
             </div>

            {/* Bottom Nav for Mobile */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 flex justify-around p-1 z-30">
                 <button onClick={onGoToLeaderboard} className="flex flex-col items-center justify-center p-1 rounded-lg text-slate-700 font-bold hover:bg-slate-200/70 transition-colors duration-200 flex-1">
                    <span className="text-2xl">🏆</span>
                    <span className="text-[10px] uppercase tracking-wider mt-1">Xếp hạng</span>
                </button>
                 <button onClick={onGoToStore} className="flex flex-col items-center justify-center p-1 rounded-lg text-slate-700 font-bold hover:bg-slate-200/70 transition-colors duration-200 flex-1">
                    <span className="text-2xl">🛍️</span>
                    <span className="text-[10px] uppercase tracking-wider mt-1">Cửa hàng</span>
                </button>
                <button onClick={onGoToCreativeMode} className="flex flex-col items-center justify-center p-1 rounded-lg text-slate-700 font-bold hover:bg-slate-200/70 transition-colors duration-200 flex-1">
                    <span className="text-2xl">🎨</span>
                    <span className="text-[10px] uppercase tracking-wider mt-1">Sáng tạo</span>
                </button>
                <button onClick={onGoToParentDashboard} className="flex flex-col items-center justify-center p-1 rounded-lg text-slate-700 font-bold hover:bg-slate-200/70 transition-colors duration-200 flex-1">
                    <span className="text-2xl">👨‍👩‍👧</span>
                    <span className="text-[10px] uppercase tracking-wider mt-1">Phụ huynh</span>
                </button>
            </nav>
        </div>
    );
};

// FIX: Add default export for the MainHub component.
export default MainHub;
