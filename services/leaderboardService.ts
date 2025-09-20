import { PlayerProgress, LeaderboardEntry } from '../types';

// Helper to get the date of the last Sunday
const getlastSunday = (date = new Date()) => {
    const today = new Date(date);
    const dayOfWeek = today.getDay(); // Sunday is 0, Monday is 1, etc.
    const diff = today.getDate() - dayOfWeek;
    return new Date(today.setDate(diff));
};

/**
 * Checks if the weekly score needs to be reset. This happens if the last reset
 * was before the most recent Sunday.
 * @param progress The player's current progress.
 * @returns Updated progress if a reset occurred, otherwise null.
 */
export const checkAndResetWeeklyScore = (progress: PlayerProgress): PlayerProgress | null => {
    const lastSunday = getlastSunday().toISOString().split('T')[0];
    const lastReset = progress.lastWeeklyReset || '2000-01-01';

    if (lastReset < lastSunday) {
        return {
            ...progress,
            weeklyScore: 0,
            lastWeeklyReset: lastSunday,
        };
    }
    return null; // No update needed
};

// --- Leaderboard Data Simulation ---
const LEADERBOARD_CACHE_KEY = 'beYeuHocToanLeaderboardCache';

interface SimulatedPlayer {
    name: string;
    score: number;
}

interface StoredLeaderboard {
    weekIdentifier: string; // YYYY-MM-DD of the last Sunday
    players: SimulatedPlayer[];
}


const SIMULATED_PLAYER_NAMES = [
    "Minh Anh", "Bảo Châu", "Gia Hân", "Khánh An", "Tùng Lâm",
    "Hoàng Bách", "Quốc Trung", "Phương Linh", "Đức Minh", "Nhật Mai",
    "Thành Long", "Bảo Ngọc", "Thùy Dương", "Gia Bảo", "Mạnh Hùng"
];

export const getLeaderboardData = (currentPlayer: PlayerProgress): LeaderboardEntry[] => {
    const currentWeekIdentifier = currentPlayer.lastWeeklyReset || '2000-01-01';
    let simulatedPlayers: SimulatedPlayer[] = [];

    try {
        const cachedData = localStorage.getItem(LEADERBOARD_CACHE_KEY);
        if (cachedData) {
            const parsedData: StoredLeaderboard = JSON.parse(cachedData);
            // Check if the cached data is for the current week
            if (parsedData.weekIdentifier === currentWeekIdentifier) {
                simulatedPlayers = parsedData.players;
            }
        }
    } catch (error) {
        console.error("Failed to read leaderboard cache:", error);
        localStorage.removeItem(LEADERBOARD_CACHE_KEY);
    }
    
    // If no valid cache for the current week, generate new data
    if (simulatedPlayers.length === 0) {
        // Create a plausible score distribution based on the player's level
        const baseScore = (currentPlayer.level * 40) + (currentPlayer.grade * 100);
        
        simulatedPlayers = SIMULATED_PLAYER_NAMES.map(name => {
            const randomFactor = (Math.random() - 0.4) * baseScore;
            const score = Math.max(0, Math.floor(baseScore + randomFactor + (Math.random() * 150)));
            return { name, score };
        });

        // Save the newly generated leaderboard for the current week
        try {
            const dataToStore: StoredLeaderboard = {
                weekIdentifier: currentWeekIdentifier,
                players: simulatedPlayers,
            };
            localStorage.setItem(LEADERBOARD_CACHE_KEY, JSON.stringify(dataToStore));
        } catch (error) {
            console.error("Failed to save leaderboard cache:", error);
        }
    }

    const allPlayers = [
        ...simulatedPlayers.map(p => ({ ...p, isPlayer: false })),
        {
            name: currentPlayer.name,
            score: currentPlayer.weeklyScore || 0,
            isPlayer: true,
        }
    ];

    // Sort players by score in descending order
    const sortedPlayers = allPlayers.sort((a, b) => b.score - a.score);

    // Assign ranks and return the final LeaderboardEntry array
    return sortedPlayers.map((player, index) => ({
        ...player,
        rank: index + 1,
    }));
};