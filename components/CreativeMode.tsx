import React, { useState } from 'react';
import { generateCreativeQuestion, QUOTA_EXCEEDED_ERROR } from '../services/geminiService';
import { Question, PlayerProgress } from '../types';

interface CreativeModeProps {
  onClose: () => void;
  playerProgress: PlayerProgress;
  isApiRateLimited: boolean;
  onApiQuotaExceeded: () => void;
  isVisible: boolean;
}

const CreativeMode: React.FC<CreativeModeProps> = ({ onClose, playerProgress, isApiRateLimited, onApiQuotaExceeded, isVisible }) => {
  const [idea, setIdea] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedQuestion, setGeneratedQuestion] = useState<Question | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  if (!isVisible) return null;

  const handleGenerate = async () => {
    if (!idea.trim()) return;
    setIsLoading(true);
    setGeneratedQuestion(null);
    setError(null);
    setShowAnswer(false);
    
    try {
        const question = await generateCreativeQuestion(idea, playerProgress.grade);
        if (question) {
            setGeneratedQuestion(question);
        } else {
            setError('Ôi, Thầy Hùng không thể tạo câu hỏi lúc này. Con hãy thử một ý tưởng khác hoặc quay lại sau nhé!');
        }
    } catch (error: any) {
        if (error.message === QUOTA_EXCEEDED_ERROR) {
            onApiQuotaExceeded();
        } else {
            setError('Ôi, Thầy Hùng không thể tạo câu hỏi lúc này. Con hãy thử một ý tưởng khác hoặc quay lại sau nhé!');
        }
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleReset = () => {
      setIdea('');
      setGeneratedQuestion(null);
      setError(null);
      setShowAnswer(false);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-40 animate-fade-in p-4 pt-10 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 animate-scale-up relative mb-10">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-10 h-10 bg-slate-200/80 rounded-full flex items-center justify-center text-slate-600 text-2xl font-bold shadow-md hover:bg-red-500 hover:text-white transition-all"
          aria-label="Đóng"
        >
          &times;
        </button>
        
        <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-black text-purple-700 drop-shadow-lg">
                🎨 Bé Sáng Tạo Bài Toán
            </h1>
            <p className="text-slate-600 mt-2 text-lg">Hãy cho Thầy Hùng một ý tưởng, và xem điều kỳ diệu xảy ra!</p>
        </div>

        {!generatedQuestion && (
            <div className="mt-8 space-y-4">
                <textarea
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="Ví dụ: Một bài toán về công chúa và những viên kim cương..."
                    className="w-full px-4 py-3 h-28 rounded-xl border-2 border-slate-300 focus:ring-4 focus:ring-pink-400 focus:border-pink-500 transition-all duration-300 text-lg disabled:bg-slate-100"
                    disabled={isLoading || isApiRateLimited}
                />
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !idea.trim() || isApiRateLimited}
                    className="w-full bg-pink-500 text-white font-bold py-4 px-6 rounded-xl text-xl shadow-lg hover:bg-pink-600 transform hover:-translate-y-1 transition-all duration-300 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                >
                    {isLoading ? (
                        <>
                           <div className="w-6 h-6 border-4 border-dashed rounded-full animate-spin border-white mr-3"></div>
                           Đang sáng tạo...
                        </>
                    ) : 'Tạo bài toán! ✨'}
                </button>
                 {isApiRateLimited && (
                    <p className="text-center text-sm text-slate-500 mt-2">
                        Thầy Hùng cần nghỉ ngơi một chút để có thêm ý tưởng hay. Vui lòng thử lại sau nhé.
                    </p>
                )}
            </div>
        )}
        
        {error && <p className="mt-6 text-center text-red-600 font-semibold">{error}</p>}
        
        {generatedQuestion && (
            <div className="mt-8 text-left animate-fade-in">
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <p className="text-2xl font-bold text-slate-800">{generatedQuestion.question}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        {generatedQuestion.options?.map((option, index) => (
                            <div key={index} className={`p-4 rounded-xl text-lg font-semibold border-2 transition-all duration-300 ${showAnswer && option === generatedQuestion.answer ? 'bg-green-100 border-green-400 text-green-800' : 'bg-slate-100 border-slate-300'}`}>
                                {option}
                            </div>
                        ))}
                    </div>
                </div>
                
                {showAnswer ? (
                    <div className="mt-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-lg animate-fade-in">
                        <p><span className="font-bold">Đáp án đúng là:</span> {generatedQuestion.answer}</p>
                        <p className="mt-2"><span className="font-bold">Thầy Hùng giải thích:</span> {generatedQuestion.explanation}</p>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowAnswer(true)}
                        className="mt-6 w-full py-3 bg-yellow-500 text-white font-bold rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                        Xem đáp án
                    </button>
                )}
                
                 <button
                    onClick={handleReset}
                    className="mt-4 w-full py-3 bg-slate-500 text-white font-bold rounded-lg hover:bg-slate-600 transition-colors"
                >
                    Tạo bài toán khác
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default CreativeMode;