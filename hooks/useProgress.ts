import { useState, useCallback, useEffect } from 'react';
import { PlayerProgress } from '../types';

const PROGRESS_KEY = 'beYeuHocToanProgress';

export const useProgress = (): [PlayerProgress | null, (progress: PlayerProgress) => void, () => void] => {
  const [progress, setProgress] = useState<PlayerProgress | null>(null);

  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem(PROGRESS_KEY);
      if (savedProgress) {
        const parsedProgress = JSON.parse(savedProgress);
        // Ensure new fields exist for backward compatibility
        const completeProgress: PlayerProgress = {
          // --- Start of Fix ---
          // Provide a default grade for older save files that don't have this property.
          // This prevents 'grade' from being undefined, which caused the question
          // difficulty to always fall back to the easiest level.
          grade: 1, 
          // --- End of Fix ---
          badges: [],
          perfectScoreStreak: 0,
          incorrectlyAnsweredQuestions: [],
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
          weeklyScore: parsedProgress.score || 0, // Initialize weekly score from total score for old users
          lastWeeklyReset: '2000-01-01', // Default old date to trigger reset
          ...parsedProgress,
          // FIX: An object literal cannot have multiple properties with the same name.
          // The 'customization' property was defined twice. This version correctly
          // deep-merges the customization object to ensure backward compatibility
          // for new properties like 'activePawn'.
          customization: {
            activeTheme: 'default',
            activePawn: 'default_pawn',
            activeAvatar: 'default_avatar',
            ...(parsedProgress.customization || {}),
          },
        };
        setProgress(completeProgress);
      }
    } catch (error) {
      console.error("Failed to load progress from localStorage", error);
    }
  }, []);

  const saveProgress = useCallback((newProgress: PlayerProgress) => {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress));
      setProgress(newProgress);
    } catch (error) {
      console.error("Failed to save progress to localStorage", error);
    }
  }, []);

  const clearProgress = useCallback(() => {
    try {
      localStorage.removeItem(PROGRESS_KEY);
      setProgress(null);
    } catch (error) {
      console.error("Failed to clear progress from localStorage", error);
    }
  }, []);

  return [progress, saveProgress, clearProgress];
};
