import React from 'react';
import { Topic } from '../types';

interface TopicSelectionProps {
  onSelectTopic: (topic: Topic) => void;
  onClose: () => void;
  grade: number;
  isVisible: boolean;
}

const allTopics: { id: Topic; name: string; icon: string; color: string }[] = [
  { id: 'general', name: 'Tổng hợp', icon: '🎲', color: 'from-purple-500 to-indigo-600' },
  { id: 'addition_subtraction', name: 'Cộng & Trừ', icon: '➕', color: 'from-blue-500 to-cyan-600' },
  { id: 'multiplication_division', name: 'Nhân & Chia', icon: '✖️', color: 'from-green-500 to-emerald-600' },
  { id: 'comparison', name: 'So sánh', icon: '⚖️', color: 'from-yellow-500 to-amber-600' },
  { id: 'word_problems', name: 'Toán đố', icon: '📝', color: 'from-orange-500 to-red-600' },
  { id: 'geometry', name: 'Hình học', icon: '🔺', color: 'from-rose-500 to-pink-600' },
  { id: 'measurement', name: 'Đo lường', icon: '📏', color: 'from-sky-500 to-blue-600' },
  { id: 'logic', name: 'Logic', icon: '💡', color: 'from-indigo-500 to-violet-600' },
  { id: 'fractions', name: 'Phân số', icon: '🍕', color: 'from-amber-500 to-orange-600' },
];

const gradeTopicMap: Record<number, Topic[]> = {
    1: ['general', 'addition_subtraction', 'comparison', 'word_problems', 'geometry'],
    2: ['general', 'addition_subtraction', 'multiplication_division', 'comparison', 'word_problems', 'geometry', 'measurement', 'logic'],
    3: ['general', 'addition_subtraction', 'multiplication_division', 'comparison', 'word_problems', 'geometry', 'measurement', 'logic', 'fractions'],
    4: ['general', 'addition_subtraction', 'multiplication_division', 'comparison', 'word_problems', 'geometry', 'measurement', 'logic', 'fractions'],
    5: ['general', 'addition_subtraction', 'multiplication_division', 'comparison', 'word_problems', 'geometry', 'measurement', 'logic', 'fractions'],
};

const getAvailableTopicsForGrade = (grade: number): typeof allTopics => {
    const availableTopicIds = gradeTopicMap[grade] || allTopics.map(t => t.id);
    return allTopics.filter(topic => availableTopicIds.includes(topic.id));
};

const TopicSelection: React.FC<TopicSelectionProps> = ({ onSelectTopic, onClose, grade, isVisible }) => {
  const availableTopics = getAvailableTopicsForGrade(grade);
  
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 animate-fade-in p-4">
      <div className="relative w-full max-w-2xl text-center bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 animate-scale-up">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 z-20 w-10 h-10 bg-slate-200/80 rounded-full flex items-center justify-center text-slate-600 text-2xl font-bold shadow-md hover:bg-red-500 hover:text-white transition-all"
          aria-label="Đóng"
        >
          &times;
        </button>
        <h1 className="text-3xl md:text-4xl font-black text-blue-800 drop-shadow-lg">
          Chọn một chủ đề
        </h1>
        <p className="text-slate-600 mt-2 text-lg">Con muốn luyện tập về phần nào hôm nay?</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8 max-h-[60vh] overflow-y-auto pr-2">
          {availableTopics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => onSelectTopic(topic.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl shadow-lg text-white font-bold transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br ${topic.color}`}
            >
              <div className="text-4xl drop-shadow-md">{topic.icon}</div>
              <div className="mt-2 text-base md:text-lg text-center">{topic.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopicSelection;