export type GameState = 'landing' | 'setup' | 'main_hub' | 'playing' | 'review' | 'parent_dashboard' | 'lightning_round' | 'riddle_challenge';

export type Topic = 'general' | 'addition_subtraction' | 'multiplication_division' | 'comparison' | 'word_problems' | 'geometry' | 'measurement' | 'logic' | 'fractions';

export type QuestionType = 'multiple_choice' | 'fill_in_the_blank' | 'true_false';

// New Mission Types
export type MissionType = 'correct_answers' | 'complete_quiz' | 'perfect_quiz';

export interface DailyMission {
  id: string;
  type: MissionType;
  description: string;
  goal: number;
  currentProgress: number;
  reward: number;
  isCompleted: boolean;
}

export interface MissionsState {
  missions: DailyMission[];
  lastUpdated: string; // YYYY-MM-DD
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
  hint: string; // Hint on how to get the badge
}

export interface Theme {
  id:string;
  name: string;
  icon: string;
  cost: number;
  background: {
    // Simplified as the main hub will be the primary view
    main: string;
    playing: string;
  };
}

export interface Pawn {
    id: string;
    name: string;
    description: string;
    icon: string;
    cost: number;
}

export interface Avatar {
    id: string;
    name: string;
    description: string;
    icon: string;
    cost: number;
}


export type PowerUpType = 'hint' | 'skip' | 'time_boost';

export interface PlayerCustomization {
  activeTheme: string; // theme id
  activePawn: string; // pawn id
  activeAvatar: string; // avatar id
}

export interface PlayerProgress {
  name: string;
  grade: number;
  level: number;
  score: number; // Total lifetime score
  weeklyScore: number; // Score for the current week's leaderboard
  lastWeeklyReset: string; // YYYY-MM-DD format for the last Sunday
  badges: string[];
  perfectScoreStreak: number;
  incorrectlyAnsweredQuestions: AnsweredQuestion[];
  customization: PlayerCustomization;
  unlockedThemes: string[];
  unlockedPawns: string[]; // New
  unlockedAvatars: string[]; // New
  dailyMissions: MissionsState;
  questionHistory: Question[];
  creativeQuestionsGenerated: number; // For new badge
  questionCache?: Partial<Record<Topic, Question[]>>;
  inventory: Record<PowerUpType, number>;
  claimedChests: number[]; // To track claimed treasure chests on the map
  completedEvents: number[]; // To track completed map events
}

export interface Question {
  question: string;
  type: QuestionType;
  options?: string[]; // Optional: only for multiple_choice and true_false
  answer: string;
  explanation: string; // Explanation is now fetched with the question
}

export interface AnsweredQuestion {
  question: Question;
  userAnswer: string;
  explanation: string;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  isPlayer: boolean;
}