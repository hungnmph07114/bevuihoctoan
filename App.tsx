import React, { useState, useEffect, useCallback } from 'react';
import { GameState, PlayerProgress, Question, QuizResult, Badge, AnsweredQuestion, Topic, Theme, DailyMission, PowerUpType, Pawn, Avatar } from './types';
import { useProgress } from './hooks/useProgress';
import { generateMathQuestions, generateLightningRoundQuestions, generateRiddleQuestion } from './services/geminiService';
import { checkAndAwardBadges } from './services/badgeService';
import { getThemeById, defaultTheme } from './services/themeService';
import { checkAndRefreshMissions, updateMissionsProgress } from './services/missionService';
import { checkAndResetWeeklyScore } from './services/leaderboardService';
import { unlockAudio, playAchievementSound } from './services/soundService';
import { playMusic, toggleMusic } from './services/musicService';
import { ALL_POWER_UPS } from './services/powerUpService';
import { getPawnById, defaultPawn } from './services/decorationService';
import { getAvatarById, defaultAvatar } from './services/avatarService';


import Welcome from './components/Welcome';
import MainHub from './components/Dashboard';
import QuestionComponent from './components/Question';
import Review from './components/Review';
import LoadingSpinner from './components/LoadingSpinner';
import ParentDashboard from './components/ParentDashboard';
import Landing from './components/Landing';
import TopicSelection from './components/TopicSelection';
import Store from './components/Store';
import CreativeMode from './components/CreativeMode';
import Profile from './components/Profile';
import LightningRound from './components/LightningRound';
import RiddleChallenge from './components/RiddleChallenge';
import Leaderboard from './components/Leaderboard'; // New import

// Event Levels
const LIGHTNING_LEVELS = [8, 13, 18];
const RIDDLE_LEVELS = [3, 7, 12, 17];
const XP_PER_LEVEL = 150;

interface PendingReviewData {
    result: QuizResult;
    leveledUp: boolean;
    newlyAwardedBadges: Badge[];
    newlyCompletedMissions: DailyMission[];
}

// A friendly, non-disruptive notification for API limits.
const ApiLimitNotification: React.FC<{ isVisible: boolean; onClose: () => void }> = ({ isVisible, onClose }) => {
    if (!isVisible) return null;
    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-4 rounded-xl shadow-2xl z-50 animate-fade-in flex justify-between items-center">
            <span className="font-semibold">🌙 Một số tính năng AI đang tạm nghỉ ngơi và sẽ quay lại vào ngày mai. Trò chơi vẫn hoạt động bình thường!</span>
            <button onClick={onClose} className="ml-4 font-bold text-2xl leading-none hover:text-yellow-300 transition-colors">&times;</button>
        </div>
    );
};


const App: React.FC = () => {
  const [gameState, _setGameState] = useState<GameState>('landing');
  const [progress, saveProgress, clearProgress] = useProgress();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [leveledUp, setLeveledUp] = useState(false);
  const [newlyAwardedBadges, setNewlyAwardedBadges] = useState<Badge[]>([]);
  const [newlyCompletedMissions, setNewlyCompletedMissions] = useState<DailyMission[]>([]);
  const [activeTheme, setActiveTheme] = useState<Theme>(defaultTheme);
  const [currentTopic, setCurrentTopic] = useState<Topic>('general');
  const [isApiRateLimited, setIsApiRateLimited] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [justCompletedMission, setJustCompletedMission] = useState(false);
  
  // States for events
  const [eventQuestions, setEventQuestions] = useState<Question[]>([]);
  const [pendingReviewData, setPendingReviewData] = useState<PendingReviewData | null>(null);
  
  // States to control modals
  const [isTopicSelectionVisible, setIsTopicSelectionVisible] = useState(false);
  const [isStoreVisible, setIsStoreVisible] = useState(false);
  const [isCreativeModeVisible, setIsCreativeModeVisible] = useState(false);
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [isLeaderboardVisible, setIsLeaderboardVisible] = useState(false); // New state for leaderboard
  
  // State for screen transitions
  const [isTransitioningOut, setIsTransitioningOut] = useState(false);
  const [targetGameState, setTargetGameState] = useState<GameState | null>(null);

  const transitionToState = useCallback((newState: GameState) => {
    if (newState !== gameState && !isTransitioningOut) {
      setTargetGameState(newState);
      setIsTransitioningOut(true);
    }
  }, [gameState, isTransitioningOut]);

  useEffect(() => {
    if (isTransitioningOut && targetGameState) {
      // After the exit animation, switch the component
      const timer = setTimeout(() => {
        _setGameState(targetGameState);
        setIsTransitioningOut(false);
        setTargetGameState(null);
      }, 400); // Match slide-out animation duration
      return () => clearTimeout(timer);
    }
  }, [isTransitioningOut, targetGameState]);


  const handleApiQuotaExceeded = useCallback(() => {
      console.warn("API quota exceeded. AI features will be limited.");
      setIsApiRateLimited(true);
  }, []);

  useEffect(() => {
    if (progress) {
      const currentTheme = getThemeById(progress.customization.activeTheme) || defaultTheme;
      setActiveTheme(currentTheme);

      const progressAfterMissionCheck = checkAndRefreshMissions(progress);
      const progressAfterWeeklyCheck = checkAndResetWeeklyScore(progressAfterMissionCheck || progress);
      
      const finalProgress = progressAfterWeeklyCheck || progressAfterMissionCheck;

      if (finalProgress) {
        saveProgress(finalProgress);
      }
    } else {
      setActiveTheme(defaultTheme);
    }
    setIsLoading(false);
  }, [progress, saveProgress]);

  const handleStart = async () => {
    await unlockAudio();
    playMusic();
    setIsMusicPlaying(true);
    if (progress) {
        transitionToState('main_hub');
    } else {
        transitionToState('setup');
    }
  };

  const handleSetupComplete = (newProgress: PlayerProgress) => {
    const progressWithCreativeCount = {
        ...newProgress,
        creativeQuestionsGenerated: 0,
        weeklyScore: 0, // Initialize weekly score
        lastWeeklyReset: new Date(0).toISOString().split('T')[0], // Set to epoch to trigger immediate reset check
    };
    saveProgress(progressWithCreativeCount);
    transitionToState('main_hub');
  };

  const handleStartChallenge = useCallback(async (topic: Topic) => {
    if (!progress) return;
    
    setJustCompletedMission(false);
    setIsTopicSelectionVisible(false);
    setCurrentTopic(topic);
    setIsLoading(true);
    transitionToState('playing');

    const questionsPerQuiz = progress.grade === 1 ? 5 : 10;

    const cache = progress.questionCache || {};
    const cachedQuestions = cache[topic] || [];

    if (cachedQuestions.length >= questionsPerQuiz) {
      const newQuizQuestions = cachedQuestions.slice(0, questionsPerQuiz);
      const remainingCachedQuestions = cachedQuestions.slice(questionsPerQuiz);
      
      saveProgress({
        ...progress,
        questionCache: { ...cache, [topic]: remainingCachedQuestions },
      });

      setQuestions(newQuizQuestions);
      setIsLoading(false);
    } else {
      const BATCH_SIZE = 20;
      const fetchedQuestions = await generateMathQuestions(progress.grade, progress.level, topic, progress.questionHistory || [], progress.incorrectlyAnsweredQuestions || [], BATCH_SIZE);
      
      const newQuizQuestions = fetchedQuestions.slice(0, questionsPerQuiz);
      const remainingToCache = fetchedQuestions.slice(questionsPerQuiz);
      
      const updatedCache = [...cachedQuestions, ...remainingToCache];

      saveProgress({
        ...progress,
        questionCache: { ...cache, [topic]: updatedCache },
      });
      
      setQuestions(newQuizQuestions);
      setIsLoading(false);
    }
  }, [progress, saveProgress, transitionToState]);

  const handleQuizComplete = async (result: QuizResult, incorrectAnswers: AnsweredQuestion[]) => {
    if (!progress) return;

    const oldLevel = progress.level;
    const newScore = progress.score + result.score;
    const newWeeklyScore = (progress.weeklyScore || 0) + result.score; // Add to weekly score
    
    // Leveling up is now based on score (XP)
    const newLevel = Math.floor(newScore / XP_PER_LEVEL) + 1;
    const leveledUp = newLevel > oldLevel;

    // Base progress update with new score and level
    const progressAfterQuiz: PlayerProgress = {
        ...progress,
        score: newScore,
        weeklyScore: newWeeklyScore, // Save new weekly score
        level: newLevel,
    };
    
    // Chain the progress updates: Badge check first, then mission progress
    const { updatedProgress: progressAfterBadges, newlyAwarded } = checkAndAwardBadges(progressAfterQuiz, 'quiz_complete', result);
    const { updatedProgress: progressAfterMissions, completedMissions } = updateMissionsProgress(progressAfterBadges, result);

    if (completedMissions.length > 0) {
      setJustCompletedMission(true);
    }
    
    const updatedHistory = [...(progress.incorrectlyAnsweredQuestions || []), ...incorrectAnswers].slice(-20);
    const updatedQuestionHistory = [...(progress.questionHistory || []), ...questions].slice(-30);

    // The final progress object has everything chained together
    const finalProgress: PlayerProgress = {
      ...progressAfterMissions,
      incorrectlyAnsweredQuestions: updatedHistory,
      questionHistory: updatedQuestionHistory,
    };
    
    saveProgress(finalProgress);

    // Prepare review data
    const reviewData: PendingReviewData = {
        result,
        leveledUp,
        newlyAwardedBadges: newlyAwarded,
        newlyCompletedMissions: completedMissions,
    };

    // Check for map events
    if (oldLevel < newLevel) { // Event only triggers on level up
        if (RIDDLE_LEVELS.includes(newLevel) && !finalProgress.completedEvents.includes(newLevel)) {
            setPendingReviewData(reviewData);
            setIsLoading(true);
            const riddle = await generateRiddleQuestion(finalProgress.grade);
            if (riddle) {
                setEventQuestions([riddle]);
                transitionToState('riddle_challenge');
            } else {
                // API failed, just go to review
                handleGoToReview(reviewData);
            }
            setIsLoading(false);
            return;
        }

        if (LIGHTNING_LEVELS.includes(newLevel) && !finalProgress.completedEvents.includes(newLevel)) {
            setPendingReviewData(reviewData);
            setIsLoading(true);
            const lightningQuestions = await generateLightningRoundQuestions(finalProgress.grade, finalProgress.level);
            setEventQuestions(lightningQuestions);
            transitionToState('lightning_round');
            setIsLoading(false);
            return;
        }
    }
    
    // If no event, go directly to review
    handleGoToReview(reviewData);
  };

  const handleGoToReview = (data: PendingReviewData) => {
      setQuizResult(data.result);
      setLeveledUp(data.leveledUp);
      setNewlyAwardedBadges(data.newlyAwardedBadges);
      setNewlyCompletedMissions(data.newlyCompletedMissions);
      transitionToState('review');
  }

  const handleLightningRoundComplete = (correctAnswers: number) => {
    if (!progress || !pendingReviewData) return;
    
    const bonus = correctAnswers * 10;
    playAchievementSound();

    const newProgress: PlayerProgress = {
        ...progress,
        score: progress.score + bonus,
        weeklyScore: (progress.weeklyScore || 0) + bonus,
        completedEvents: [...progress.completedEvents, progress.level],
    };
    saveProgress(newProgress);
    
    // Add bonus to pending result for display
    const updatedResult = { ...pendingReviewData.result, score: pendingReviewData.result.score + bonus };
    handleGoToReview({ ...pendingReviewData, result: updatedResult });
    setPendingReviewData(null);
    setEventQuestions([]);
  };

  const handleRiddleComplete = (isCorrect: boolean) => {
      if (!progress || !pendingReviewData) return;

      let bonus = 0;
      if (isCorrect) {
          bonus = 75;
          playAchievementSound();
      }

      const newProgress: PlayerProgress = {
          ...progress,
          score: progress.score + bonus,
          weeklyScore: (progress.weeklyScore || 0) + bonus,
          completedEvents: [...progress.completedEvents, progress.level],
      };
      saveProgress(newProgress);

      const updatedResult = { ...pendingReviewData.result, score: pendingReviewData.result.score + bonus };
      handleGoToReview({ ...pendingReviewData, result: updatedResult });
      setPendingReviewData(null);
      setEventQuestions([]);
  };
  
  const handleGoToHub = () => {
    setQuizResult(null);
    setLeveledUp(false);
    setNewlyAwardedBadges([]);
    setNewlyCompletedMissions([]);
    transitionToState('main_hub');
    setIsProfileVisible(false);
  };
  
  const handleLeaveCreativeMode = () => {
      if (!progress) {
          setIsCreativeModeVisible(false);
          return;
      }
      
      const updatedProgress: PlayerProgress = {
          ...progress,
          creativeQuestionsGenerated: (progress.creativeQuestionsGenerated || 0) + 1,
      };

      const { updatedProgress: progressAfterBadges, newlyAwarded } = checkAndAwardBadges(updatedProgress, 'creative_mode_used');
      
      if(newlyAwarded.length > 0) {
          console.log("Awarded badges:", newlyAwarded.map(b => b.name).join(', '));
      }
      
      saveProgress(progressAfterBadges);
      setIsCreativeModeVisible(false);
  };

  const handleClearProgress = () => {
      clearProgress();
      transitionToState('setup');
  }

  const handleBuyTheme = (theme: Theme) => {
    if (!progress || progress.score < theme.cost) {
        alert("Con không đủ điểm để mua giao diện này!");
        return;
    }
    let newProgress: PlayerProgress = {
        ...progress,
        score: progress.score - theme.cost,
        unlockedThemes: [...progress.unlockedThemes, theme.id],
    };

    const { updatedProgress: progressAfterBadges } = checkAndAwardBadges(newProgress, 'theme_bought');
    saveProgress(progressAfterBadges);
  };

  const handleEquipTheme = (theme: Theme) => {
    if (!progress) return;
    const newProgress: PlayerProgress = {
        ...progress,
        customization: { ...progress.customization, activeTheme: theme.id },
    };
    saveProgress(newProgress);
    setActiveTheme(theme);
  };
  
  const handleBuyPowerUp = (powerUpId: PowerUpType) => {
      if (!progress) return;
      const powerUp = ALL_POWER_UPS.find(p => p.id === powerUpId);
      if (!powerUp || progress.score < powerUp.cost) {
          alert("Con không đủ điểm để mua vật phẩm này!");
          return;
      }

      const newProgress: PlayerProgress = {
          ...progress,
          score: progress.score - powerUp.cost,
          inventory: {
              ...progress.inventory,
              [powerUpId]: (progress.inventory[powerUpId] || 0) + powerUp.quantity,
          },
      };
      saveProgress(newProgress);
  };

  const handleUsePowerUp = (powerUpId: PowerUpType) => {
      if (!progress || progress.inventory[powerUpId] <= 0) return;

      const newProgress: PlayerProgress = {
          ...progress,
          inventory: {
              ...progress.inventory,
              [powerUpId]: progress.inventory[powerUpId] - 1,
          },
      };
      saveProgress(newProgress);
  };

    const handleBuyPawn = (pawn: Pawn) => {
        if (!progress || progress.score < pawn.cost) {
            alert("Con không đủ điểm để mua linh vật này!");
            return;
        }
        const newProgress: PlayerProgress = {
            ...progress,
            score: progress.score - pawn.cost,
            unlockedPawns: [...progress.unlockedPawns, pawn.id],
        };
        saveProgress(newProgress);
    };

    const handleEquipPawn = (pawn: Pawn) => {
        if (!progress) return;
        const newProgress: PlayerProgress = {
            ...progress,
            customization: { ...progress.customization, activePawn: pawn.id },
        };
        saveProgress(newProgress);
    };

    const handleBuyAvatar = (avatar: Avatar) => {
        if (!progress || progress.score < avatar.cost) {
            alert("Con không đủ điểm để mua ảnh đại diện này!");
            return;
        }
        const newProgress: PlayerProgress = {
            ...progress,
            score: progress.score - avatar.cost,
            unlockedAvatars: [...progress.unlockedAvatars, avatar.id],
        };
        saveProgress(newProgress);
    };

    const handleEquipAvatar = (avatar: Avatar) => {
        if (!progress) return;
        const newProgress: PlayerProgress = {
            ...progress,
            customization: { ...progress.customization, activeAvatar: avatar.id },
        };
        saveProgress(newProgress);
    };

  const handleClaimChestReward = (chestLevel: number) => {
      if (!progress || progress.claimedChests.includes(chestLevel)) {
          return;
      }
      
      playAchievementSound();
      const reward = 25 + Math.floor(Math.random() * 26); // Random reward between 25 and 50

      const newProgress: PlayerProgress = {
          ...progress,
          score: progress.score + reward,
          weeklyScore: (progress.weeklyScore || 0) + reward,
          claimedChests: [...progress.claimedChests, chestLevel],
      };
      saveProgress(newProgress);
  }

  const handleToggleMusic = () => {
    const isPlaying = toggleMusic();
    setIsMusicPlaying(isPlaying);
  };

  const handleUpdateGrade = (newGrade: number) => {
      if (!progress) return;
      // When changing grade, it's best to reset the level to 1
      // to ensure the difficulty curve starts appropriately for the new grade.
      saveProgress({ ...progress, grade: newGrade, level: 1 });
  };

  const getBackgroundClass = useCallback(() => {
    switch (gameState) {
        case 'landing': return 'from-purple-400 via-pink-400 to-rose-400';
        case 'main_hub': return activeTheme.background.main;
        case 'playing': return activeTheme.background.playing;
        case 'review': return 'from-yellow-200 to-orange-200';
        case 'parent_dashboard': return 'from-slate-100 to-gray-200';
        case 'lightning_round': return 'from-slate-700 via-gray-800 to-slate-900';
        case 'riddle_challenge': return 'from-indigo-400 to-purple-500';
        default: return 'from-sky-200 to-indigo-200'; // Welcome/Setup default
    }
  }, [gameState, activeTheme]);
  
  const activePawnIcon = progress ? (getPawnById(progress.customization.activePawn) || defaultPawn).icon : defaultPawn.icon;
  const activeAvatarIcon = progress ? (getAvatarById(progress.customization.activeAvatar) || defaultAvatar).icon : defaultAvatar.icon;


  const renderModals = () => {
    if (!progress) return null;
    return (
        <>
            <TopicSelection isVisible={isTopicSelectionVisible} onSelectTopic={handleStartChallenge} onClose={() => setIsTopicSelectionVisible(false)} grade={progress.grade} />
            <Store isVisible={isStoreVisible} progress={progress} onClose={() => setIsStoreVisible(false)} onBuyTheme={handleBuyTheme} onEquipTheme={handleEquipTheme} onBuyPowerUp={handleBuyPowerUp} onBuyPawn={handleBuyPawn} onEquipPawn={handleEquipPawn} onBuyAvatar={handleBuyAvatar} onEquipAvatar={handleEquipAvatar} />
            {/* FIX: Corrected typo from isApirateLimited to isApiRateLimited */}
            <CreativeMode isVisible={isCreativeModeVisible} playerProgress={progress} onClose={handleLeaveCreativeMode} isApiRateLimited={isApiRateLimited} onApiQuotaExceeded={handleApiQuotaExceeded} />
            <Profile isVisible={isProfileVisible} progress={progress} onClose={() => setIsProfileVisible(false)} activeAvatarIcon={activeAvatarIcon} onUpdateGrade={handleUpdateGrade} />
            <Leaderboard isVisible={isLeaderboardVisible} progress={progress} onClose={() => setIsLeaderboardVisible(false)} />
        </>
    );
  }

  const renderGameState = () => {
    if (isLoading) {
        const title = gameState === 'playing' ? "Thầy Hùng đang chuẩn bị bài..." : "Đang tải dữ liệu...";
        const subtitle = gameState === 'playing' ? "Sẵn sàng chinh phục thử thách nào!" : "Chờ một chút nhé...";
        return <LoadingSpinner title={title} subtitle={subtitle} />;
    }

    switch (gameState) {
      case 'landing':
        return <Landing onStart={handleStart} />;
      case 'setup':
        return <Welcome onSetupComplete={handleSetupComplete} />;
      case 'main_hub':
        return progress && <MainHub 
            progress={progress} 
            onStartChallenge={() => setIsTopicSelectionVisible(true)}
            onGoToStore={() => setIsStoreVisible(true)}
            onGoToCreativeMode={() => setIsCreativeModeVisible(true)}
            onGoToProfile={() => setIsProfileVisible(true)}
            onGoToParentDashboard={() => transitionToState('parent_dashboard')}
            onGoToLeaderboard={() => setIsLeaderboardVisible(true)} // New handler
            justCompletedMission={justCompletedMission}
            onClaimChestReward={handleClaimChestReward}
            activePawnIcon={activePawnIcon}
            activeAvatarIcon={activeAvatarIcon}
        />;
      case 'playing':
        return questions.length > 0 && progress ? <QuestionComponent questions={questions} onQuizComplete={handleQuizComplete} playerProgress={progress} onUsePowerUp={handleUsePowerUp} topic={currentTopic} onGoToDashboard={handleGoToHub} isApiRateLimited={isApiRateLimited} onApiQuotaExceeded={handleApiQuotaExceeded} /> : <LoadingSpinner title="Thầy Hùng đang chuẩn bị bài..." subtitle="Sẵn sàng chinh phục thử thách nào!" />;
      case 'review':
        return quizResult && <Review result={quizResult} onPlayAgain={() => { handleGoToHub(); setIsTopicSelectionVisible(true); }} onGoToDashboard={handleGoToHub} leveledUp={leveledUp} newlyAwardedBadges={newlyAwardedBadges} newlyCompletedMissions={newlyCompletedMissions} />;
      case 'parent_dashboard':
        return progress && <ParentDashboard progress={progress} onGoToDashboard={handleGoToHub} onClearProgress={handleClearProgress} isApiRateLimited={isApiRateLimited} onApiQuotaExceeded={handleApiQuotaExceeded}/>;
      case 'lightning_round':
        return <LightningRound questions={eventQuestions} onComplete={handleLightningRoundComplete} />;
      case 'riddle_challenge':
        return eventQuestions.length > 0 && <RiddleChallenge question={eventQuestions[0]} onComplete={handleRiddleComplete} />;
      default:
        return <Welcome onSetupComplete={handleSetupComplete} />;
    }
  };
  
  const animationClass = isTransitioningOut ? 'animate-slide-out-left' : 'animate-slide-in-right';

  return (
    <div className={`font-sans antialiased text-slate-800 min-h-screen w-full bg-gradient-to-br transition-all duration-500 ${getBackgroundClass()} overflow-hidden`}>
      {gameState !== 'landing' && gameState !== 'setup' && (
        <button
          onClick={handleToggleMusic}
          className="fixed bottom-20 md:bottom-4 right-4 z-50 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-600 text-2xl font-bold shadow-md hover:bg-white transition-all"
          aria-label={isMusicPlaying ? "Tắt nhạc" : "Bật nhạc"}
        >
          {isMusicPlaying ? '🎵' : '🔇'}
        </button>
      )}
      <ApiLimitNotification isVisible={isApiRateLimited} onClose={() => setIsApiRateLimited(false)} />
      <div className={animationClass}>
        {renderGameState()}
      </div>
      {/* Render modals on top of the current game state */}
      {renderModals()}
    </div>
  );
};

export default App;