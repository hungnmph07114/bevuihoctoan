import React, { useState } from 'react';
import { PlayerProgress, Badge as BadgeType } from '../types';
import { ALL_BADGES } from '../services/badgeService';
import { generateParentalAnalysis, QUOTA_EXCEEDED_ERROR } from '../services/geminiService';

interface ParentDashboardProps {
  progress: PlayerProgress;
  onGoToDashboard: () => void;
  onClearProgress: () => void;
  isApiRateLimited: boolean;
  onApiQuotaExceeded: () => void;
}

const StatCard: React.FC<{ label: string; value: string | number; icon: string; color: string }> = ({ label, value, icon, color }) => (
    <div className={`p-4 rounded-xl shadow-md ${color} text-white`}>
        <div className="flex items-center">
            <div className="text-3xl mr-4">{icon}</div>
            <div>
                <div className="text-sm font-bold opacity-80">{label}</div>
                <div className="text-2xl font-black">{value}</div>
            </div>
        </div>
    </div>
);


const ParentDashboard: React.FC<ParentDashboardProps> = ({ progress, onGoToDashboard, onClearProgress, isApiRateLimited, onApiQuotaExceeded }) => {
    const earnedBadges = ALL_BADGES.filter(b => progress.badges.includes(b.id));
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    const handleGetAnalysis = async () => {
        setIsAnalyzing(true);
        setAnalysis(null);
        try {
            const result = await generateParentalAnalysis(progress.grade, progress.incorrectlyAnsweredQuestions);
            setAnalysis(result);
        } catch (error: any) {
            if (error.message === QUOTA_EXCEEDED_ERROR) {
                onApiQuotaExceeded();
            } else {
                setAnalysis("Có lỗi xảy ra khi tạo phân tích. Vui lòng thử lại sau.");
            }
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen w-full p-4 animate-fade-in">
            <div className="w-full max-w-3xl bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 animate-scale-up">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-800">
                            Báo cáo học tập
                        </h1>
                        <p className="text-slate-600 mt-1 text-lg">
                            của bé <span className="font-bold text-blue-600">{progress.name}</span>
                        </p>
                    </div>
                    <button
                        onClick={onGoToDashboard}
                        className="text-sm bg-slate-500 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-slate-600 transition-all"
                    >
                        Về màn hình chính
                    </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    <StatCard label="Cấp độ" value={progress.level} icon="🌟" color="bg-blue-500" />
                    <StatCard label="Điểm số" value={progress.score} icon="🏆" color="bg-purple-500" />
                    <StatCard label="Huy hiệu" value={`${earnedBadges.length}/${ALL_BADGES.length}`} icon="🏅" color="bg-yellow-500" />
                    <StatCard label="Bài sai đã lưu" value={progress.incorrectlyAnsweredQuestions.length} icon="📚" color="bg-red-500" />
                </div>
                
                <div className="mt-8">
                    <h2 className="text-xl font-bold text-slate-700 mb-3">Phân tích các câu sai gần đây</h2>
                    <div className="max-h-60 overflow-y-auto bg-slate-50 p-4 rounded-lg space-y-4">
                        {progress.incorrectlyAnsweredQuestions.length > 0 ? (
                            [...progress.incorrectlyAnsweredQuestions].reverse().map((item, index) => (
                                <div key={index} className="bg-white p-4 rounded-md shadow-sm border-l-4 border-red-400">
                                    <p className="font-semibold text-slate-800">{item.question.question}</p>
                                    <p className="text-sm text-slate-600 mt-1">
                                        Bé chọn: <span className="font-bold text-red-600">{item.userAnswer}</span> | 
                                        Đáp án: <span className="font-bold text-green-600">{item.question.answer}</span>
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-slate-500 py-4">Tuyệt vời! Bé chưa làm sai câu nào.</p>
                        )}
                    </div>
                </div>

                <div className="mt-6">
                     <button 
                        onClick={handleGetAnalysis} 
                        disabled={isAnalyzing || progress.incorrectlyAnsweredQuestions.length === 0 || isApiRateLimited}
                        className="w-full bg-indigo-600 text-white font-bold py-3 px-5 rounded-lg shadow-md hover:bg-indigo-700 transition-all disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        {isAnalyzing ? "Thầy Hùng đang phân tích..." : "Nhận phân tích từ Thầy Hùng"}
                     </button>
                      {isApiRateLimited && (
                        <p className="text-center text-sm text-slate-500 mt-2">
                            Thầy Hùng cần nghỉ ngơi một chút. Vui lòng thử lại sau nhé.
                        </p>
                      )}
                     {analysis && !isAnalyzing && (
                        <div className="mt-4 bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-4 rounded-lg animate-fade-in">
                            <h3 className="font-bold text-lg mb-2">Thầy Hùng nhận xét:</h3>
                            <p className="whitespace-pre-wrap text-base">{analysis}</p>
                        </div>
                     )}
                </div>

                <div className="mt-8 border-t pt-6 text-center">
                    {!showConfirmDelete ? (
                        <button
                            onClick={() => setShowConfirmDelete(true)}
                            className="text-sm bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-red-700 transition-all"
                        >
                            Xoá và làm lại từ đầu
                        </button>
                    ) : (
                        <div className="bg-red-100 border border-red-300 p-4 rounded-lg animate-fade-in">
                            <p className="font-bold text-red-800">Phụ huynh có chắc chắn không?</p>
                            <p className="text-sm text-red-700 mt-1">Toàn bộ tiến trình của bé sẽ bị xoá vĩnh viễn.</p>
                            <div className="flex justify-center gap-4 mt-4">
                                <button
                                    onClick={() => setShowConfirmDelete(false)}
                                    className="text-sm bg-slate-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-600"
                                >
                                    Huỷ bỏ
                                </button>
                                <button
                                    onClick={onClearProgress}
                                    className="text-sm bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700"
                                >
                                    Có, xoá toàn bộ
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ParentDashboard;