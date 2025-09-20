import { PlayerProgress, QuizResult, Badge } from '../types';
import { ALL_THEMES } from './themeService';

export const ALL_BADGES: Badge[] = [
    // Common Badges
    { id: 'first_quiz', name: 'Khởi Đầu Vui Vẻ', description: 'Hoàn thành thử thách đầu tiên!', icon: '🔰', rarity: 'common', hint: 'Hãy hoàn thành bất kỳ thử thách nào để bắt đầu cuộc hành trình.' },
    { id: 'perfect_score', name: 'Tuyệt Vời!', description: 'Đạt điểm tuyệt đối trong một thử thách!', icon: '🎯', rarity: 'common', hint: 'Trả lời đúng tất cả các câu hỏi trong một thử thách.' },
    { id: 'creative_spark', name: 'Tia Sáng Sáng Tạo', description: 'Sử dụng chế độ Sáng Tạo lần đầu tiên.', icon: '🎨', rarity: 'common', hint: 'Hãy thử tạo một bài toán của riêng con trong chế độ Sáng Tạo.' },
    { id: 'first_purchase', name: 'Nhà Sưu Tầm Tí Hon', description: 'Mua giao diện đầu tiên trong cửa hàng.', icon: '🛍️', rarity: 'common', hint: 'Dùng điểm của con để mua một giao diện mới trong cửa hàng.' },

    // Uncommon Badges
    { id: 'streak_3', name: 'Chuỗi 3 Chiến Thắng', description: 'Đạt điểm tuyệt đối 3 lần liên tiếp!', icon: '🔥', rarity: 'uncommon', hint: 'Đạt điểm tuyệt đối trong 3 thử thách liên tiếp mà không bị ngắt quãng.' },
    { id: 'level_5', name: 'Nhà Thám Hiểm', description: 'Đạt đến cấp độ 5!', icon: '🗺️', rarity: 'uncommon', hint: 'Hãy tiếp tục học và lên cấp, con sẽ sớm đạt được thôi!' },
    { id: 'score_1000', name: 'Nghìn Điểm Đầu Tiên', description: 'Đạt 1000 điểm!', icon: '💰', rarity: 'uncommon', hint: 'Tích cực hoàn thành thử thách và nhiệm vụ để tích lũy điểm số.' },
    { id: 'quiz_master_add_sub', name: 'Chuyên Gia Cộng Trừ', description: 'Đạt điểm tuyệt đối 5 lần ở chủ đề Cộng & Trừ.', icon: '➕', rarity: 'uncommon', hint: 'Trở thành bậc thầy bằng cách hoàn hảo các thử thách về Cộng & Trừ.' },

    // Rare Badges
    { id: 'level_10', name: 'Chuyên Gia Toán Học', description: 'Đạt đến cấp độ 10!', icon: '🧠', rarity: 'rare', hint: 'Chỉ những học sinh kiên trì nhất mới đạt được cấp độ này.' },
    { id: 'streak_5', name: 'Ngọn Lửa Bất Diệt', description: 'Đạt điểm tuyệt đối 5 lần liên tiếp!', icon: '☄️', rarity: 'rare', hint: 'Duy trì sự tập trung cao độ để có một chuỗi chiến thắng hoàn hảo thật dài.' },
    { id: 'theme_collector', name: 'Nhà Sưu Tầm Giao Diện', description: 'Mở khóa tất cả các giao diện trong cửa hàng.', icon: '🖼️', rarity: 'rare', hint: 'Tiết kiệm điểm và mua mọi giao diện có sẵn.' },
    { id: 'ai_collaborator', name: 'Nhà Sáng Tạo AI', description: 'Tạo 10 bài toán bằng chế độ Sáng Tạo.', icon: '🤖', rarity: 'rare', hint: 'Thường xuyên sử dụng tính năng Sáng Tạo để rèn luyện trí tưởng tượng của con.' },

    // Epic Badge
    { id: 'math_master', name: 'Bậc Thầy Toán Học', description: 'Sưu tầm tất cả các huy hiệu khác!', icon: '👑', rarity: 'epic', hint: 'Đây là thử thách cuối cùng. Hãy chinh phục mọi thành tích khác để nhận được vinh quang này.' },
];

// Helper to add a badge if it's not already owned
const awardBadge = (badgeId: string, progress: PlayerProgress, newlyAwarded: Badge[]) => {
    if (!progress.badges.includes(badgeId)) {
        const badge = ALL_BADGES.find(b => b.id === badgeId);
        if (badge) {
            progress.badges.push(badgeId);
            newlyAwarded.push(badge);
        }
    }
};

export const checkAndAwardBadges = (
    currentProgress: PlayerProgress, 
    eventType: 'quiz_complete' | 'theme_bought' | 'creative_mode_used',
    quizResult?: QuizResult
): { updatedProgress: PlayerProgress, newlyAwarded: Badge[] } => {

    const newlyAwarded: Badge[] = [];
    const progressCopy = { ...currentProgress, badges: [...currentProgress.badges] };
    
    // --- Event: Quiz Complete ---
    if (eventType === 'quiz_complete' && quizResult) {
        awardBadge('first_quiz', progressCopy, newlyAwarded);
        
        const isPerfect = quizResult.correctAnswers === quizResult.totalQuestions;
        if (isPerfect) {
            progressCopy.perfectScoreStreak++;
            awardBadge('perfect_score', progressCopy, newlyAwarded);
        } else {
            progressCopy.perfectScoreStreak = 0;
        }

        if (progressCopy.perfectScoreStreak >= 3) awardBadge('streak_3', progressCopy, newlyAwarded);
        if (progressCopy.perfectScoreStreak >= 5) awardBadge('streak_5', progressCopy, newlyAwarded);
    }
    
    // --- Event: Theme Bought ---
    if (eventType === 'theme_bought') {
        awardBadge('first_purchase', progressCopy, newlyAwarded);
        // Check if all themes are unlocked dynamically
        if (progressCopy.unlockedThemes.length >= ALL_THEMES.length) {
             awardBadge('theme_collector', progressCopy, newlyAwarded);
        }
    }
    
    // --- Event: Creative Mode Used ---
    if (eventType === 'creative_mode_used') {
        awardBadge('creative_spark', progressCopy, newlyAwarded);
        if (progressCopy.creativeQuestionsGenerated >= 10) {
            awardBadge('ai_collaborator', progressCopy, newlyAwarded);
        }
    }

    // --- General Checks (Score, Level) - run after quiz completion ---
    if (eventType === 'quiz_complete') {
        if (progressCopy.level >= 5) awardBadge('level_5', progressCopy, newlyAwarded);
        if (progressCopy.level >= 10) awardBadge('level_10', progressCopy, newlyAwarded);
        if (progressCopy.score >= 1000) awardBadge('score_1000', progressCopy, newlyAwarded);
    }

    // --- Ultimate Badge Check ---
    const allOtherBadges = ALL_BADGES.filter(b => b.id !== 'math_master');
    const hasAllOtherBadges = allOtherBadges.every(b => progressCopy.badges.includes(b.id));
    if (hasAllOtherBadges) {
        awardBadge('math_master', progressCopy, newlyAwarded);
    }

    return { updatedProgress: progressCopy, newlyAwarded };
};