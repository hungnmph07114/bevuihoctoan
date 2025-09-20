import { PlayerProgress, QuizResult, DailyMission, MissionsState, MissionType } from '../types';

// Simple way to get today's date as YYYY-MM-DD
const getTodayDateString = () => new Date().toISOString().split('T')[0];

interface MissionTemplate {
    type: MissionType;
    description: (goal: number) => string;
    getGoal: (level: number) => number;
    getReward: (level: number) => number;
}

const MISSION_TEMPLATES: MissionTemplate[] = [
    {
        type: 'correct_answers',
        description: (goal) => `Trả lời đúng ${goal} câu hỏi.`,
        getGoal: (level) => 5 + Math.floor(level / 2) * 5, // 5, 5, 10, 10, 15...
        getReward: (level) => 20 + Math.floor(level / 2) * 10,
    },
    {
        type: 'complete_quiz',
        description: (goal) => `Hoàn thành ${goal} thử thách.`,
        getGoal: (level) => level < 5 ? 2 : 3, // 2 quizzes for levels < 5, then 3
        getReward: (level) => 30 + Math.floor(level / 5) * 15,
    },
    {
        type: 'perfect_quiz',
        description: (goal) => `Đạt điểm tuyệt đối trong ${goal} thử thách.`,
        getGoal: () => 1, // Always 1 for simplicity
        getReward: (level) => 50 + level * 5,
    },
];

const generateNewMissions = (level: number): DailyMission[] => {
    // Shuffle templates and pick 3
    const shuffledTemplates = [...MISSION_TEMPLATES].sort(() => 0.5 - Math.random());
    const selectedTemplates = shuffledTemplates.slice(0, 3);

    return selectedTemplates.map((template, index): DailyMission => {
        const goal = template.getGoal(level);
        return {
            id: `${template.type}_${index}`,
            type: template.type,
            description: template.description(goal),
            goal: goal,
            currentProgress: 0,
            reward: template.getReward(level),
            isCompleted: false,
        };
    });
};


export const checkAndRefreshMissions = (progress: PlayerProgress): PlayerProgress | null => {
    const today = getTodayDateString();
    if (progress.dailyMissions?.lastUpdated !== today) {
        const newMissions = generateNewMissions(progress.level);
        return {
            ...progress,
            dailyMissions: {
                missions: newMissions,
                lastUpdated: today,
            },
        };
    }
    return null; // No update needed
};

export const updateMissionsProgress = (
    currentProgress: PlayerProgress,
    result: QuizResult
): { updatedProgress: PlayerProgress, completedMissions: DailyMission[] } => {
    
    if (!currentProgress.dailyMissions || currentProgress.dailyMissions.lastUpdated !== getTodayDateString()) {
        // Should not happen if checkAndRefreshMissions is called, but a good safeguard.
        return { updatedProgress: currentProgress, completedMissions: [] };
    }

    const completedMissions: DailyMission[] = [];
    let scoreFromRewards = 0;

    const updatedMissions = currentProgress.dailyMissions.missions.map(mission => {
        if (mission.isCompleted) {
            return mission; // Don't update completed missions
        }

        let newProgress = mission.currentProgress;

        switch (mission.type) {
            case 'correct_answers':
                newProgress += result.correctAnswers;
                break;
            case 'complete_quiz':
                newProgress += 1;
                break;
            case 'perfect_quiz':
                if (result.correctAnswers === result.totalQuestions) {
                    newProgress += 1;
                }
                break;
        }

        // Clamp progress to goal
        newProgress = Math.min(newProgress, mission.goal);
        
        const wasCompletedThisTurn = !mission.isCompleted && newProgress >= mission.goal;

        if (wasCompletedThisTurn) {
            const completedMission = { ...mission, currentProgress: newProgress, isCompleted: true };
            completedMissions.push(completedMission);
            scoreFromRewards += mission.reward;
            return completedMission;
        }

        return { ...mission, currentProgress: newProgress };
    });

    const updatedProgress: PlayerProgress = {
        ...currentProgress,
        score: currentProgress.score + scoreFromRewards,
        dailyMissions: {
            ...currentProgress.dailyMissions,
            missions: updatedMissions,
        },
    };

    return { updatedProgress, completedMissions };
};