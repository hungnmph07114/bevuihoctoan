import React, { useState, useEffect, useRef } from 'react';
import { Question, QuizResult, PlayerProgress, AnsweredQuestion, Topic, PowerUpType } from '../types';
import { playCorrectSound, playIncorrectSound } from '../services/soundService';
import { speak } from '../services/speechService';
import ProgressBar from './ProgressBar';
import { generateHint, generateTutorExplanation, QUOTA_EXCEEDED_ERROR } from '../services/geminiService';

// A simple component to render basic markdown-like syntax from AI responses.
// Supports **bold** text and lines starting with '*' as list items.
const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
  const elements = text.split('\n').map((line, index) => {
    if (line.trim() === '') return null; // Ignore empty lines for spacing

    const processBold = (textLine: string) => {
      return textLine.split(/(\*\*.*?\*\*)/g).filter(Boolean).map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });
    };

    if (line.trim().startsWith('* ')) {
      return <li key={index}>{processBold(line.trim().substring(2))}</li>;
    }

    return <p key={index}>{processBold(line)}</p>;
  });

  // Group consecutive list items into a single <ul> for proper rendering
  const groupedElements: React.ReactNode[] = [];
  let listItems: React.ReactElement[] = [];

  elements.forEach((el, index) => {
    if (el?.type === 'li') {
      listItems.push(el);
    } else {
      if (listItems.length > 0) {
        groupedElements.push(<ul key={`ul-${index}`} className="list-disc pl-5 space-y-1 my-2">{listItems}</ul>);
        listItems = [];
      }
      if (el) {
        groupedElements.push(el);
      }
    }
  });

  if (listItems.length > 0) {
    groupedElements.push(<ul key="ul-last" className="list-disc pl-5 space-y-1 my-2">{listItems}</ul>);
  }

  return <div className="space-y-2">{groupedElements}</div>;
};


const POSITIVE_FEEDBACKS = [
    "Chính xác! Con giỏi quá!",
    "Tuyệt vời! Tiếp tục phát huy nhé.",
    "Làm tốt lắm!",
    "Hoàn hảo! Con đã làm được.",
    "Đúng rồi! Con thật thông minh.",
    "Xuất sắc! Cứ như một nhà toán học vậy.",
    "Quá đỉnh! Một câu trả lời hoàn hảo.",
];

// START: Dynamic Background Components
const GearIcon = ({ className = '' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 10.5C11.1716 10.5 10.5 11.1716 10.5 12C10.5 12.8284 11.1716 13.5 12 13.5C12.8284 13.5 13.5 12.8284 13.5 12C13.5 11.1716 12.8284 10.5 12 10.5ZM8.5 12C8.5 10.067 10.067 8.5 12 8.5C13.933 8.5 15.5 10.067 15.5 12C15.5 13.933 13.933 15.5 12 15.5C10.067 15.5 8.5 13.933 8.5 12Z" />
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C12.5523 2 13 2.44772 13 3V4.25018C14.1132 4.41682 15.1637 4.88703 16.0355 5.5999L17.0426 4.59289C17.4331 4.20237 18.0663 4.20237 18.4568 4.59289L19.4062 5.54234C19.7967 5.93286 19.7967 6.56603 19.4062 6.95655L18.3991 7.96365C19.112 8.83547 19.5822 9.88599 19.7488 11H21C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13H19.7488C19.5822 14.114 19.112 15.1645 18.3991 16.0363L19.4062 17.0434C19.7967 17.434 19.7967 18.0671 19.4062 18.4577L18.4568 19.4071C18.0663 19.7976 17.4331 19.7976 17.0426 19.4071L16.0355 18.4C15.1637 19.1129 14.1132 19.5832 13 19.7498V21C13 21.5523 12.5523 22 12 22C11.4477 22 11 21.5523 11 21V19.7498C9.88683 19.5832 8.83631 19.1129 7.96449 18.4L6.95739 19.4071C6.56686 19.7976 5.9337 19.7976 5.54317 19.4071L4.59372 18.4577C4.2032 18.0671 4.2032 17.434 4.59372 17.0434L5.60082 16.0363C4.88796 15.1645 4.41775 14.114 4.25117 13H3C2.44772 13 2 12.5523 2 12C2 11.4477 2.44772 11 3 11H4.25117C4.41775 9.88599 4.88796 8.83547 5.60082 7.96365L4.59372 6.95655C4.2032 6.56603 4.2032 5.93286 4.59372 5.54234L5.54317 4.59289C5.9337 4.20237 6.56686 4.20237 6.95739 4.59289L7.96449 5.5999C8.83631 4.88703 9.88683 4.41682 11 4.25018V3C11 2.44772 11.4477 2 12 2Z" />
    </svg>
);
const BackgroundContainer: React.FC<{children: React.ReactNode}> = ({ children }) => (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-none" aria-hidden="true">{children}</div>
);
const AdditionSubtractionBackground = () => (<BackgroundContainer>{Array.from({ length: 10 }).map((_, i) => (<div key={i} className="absolute text-3xl opacity-20 animate-float-up" style={{left: `${Math.random() * 100}%`, animationDuration: `${10 + Math.random() * 10}s`, animationDelay: `${Math.random() * 10}s`,}}>🌱</div>))}</BackgroundContainer>);
const MultiplicationDivisionBackground = () => (<BackgroundContainer><GearIcon className="absolute -left-8 -top-8 w-40 h-40 text-slate-400/20 animate-spin-slow" /><GearIcon className="absolute -right-12 top-1/2 w-52 h-52 text-slate-400/20 animate-spin-medium" /><GearIcon className="absolute left-1/4 -bottom-10 w-32 h-32 text-slate-400/10 animate-spin-slow" /></BackgroundContainer>);
const ComparisonBackground = () => (<BackgroundContainer>{['<', '>', '='].flatMap(char => Array.from({ length: 4 }).map((_, i) => (<div key={`${char}-${i}`} className="absolute text-5xl font-black text-slate-400/20 animate-float" style={{left: `${Math.random() * 90}%`, top: `${Math.random() * 90}%`, animationDuration: `${5 + Math.random() * 5}s`,}}>{char}</div>)))}</BackgroundContainer>);
const WordProblemsBackground = () => (<BackgroundContainer>{Array.from({ length: 15 }).map((_, i) => (<div key={i} className="absolute text-5xl font-black text-slate-400/20 animate-fade-in-out" style={{left: `${Math.random() * 90}%`, top: `${Math.random() * 90}%`, animationDuration: `${3 + Math.random() * 4}s`, animationDelay: `${Math.random() * 5}s`,}}>?</div>))}</BackgroundContainer>);
const GeneralBackground = () => (<BackgroundContainer>{['+', '−', '×', '÷'].flatMap(char => Array.from({ length: 3 }).map((_, i) => (<div key={`${char}-${i}`} className="absolute text-5xl font-black text-slate-400/20 animate-float" style={{left: `${Math.random() * 90}%`, top: `${Math.random() * 90}%`, animationDuration: `${6 + Math.random() * 6}s`,}}>{char}</div>)))}</BackgroundContainer>);
const GeometryBackground = () => (<BackgroundContainer>{['△', '□', '○'].flatMap(char => Array.from({ length: 4 }).map((_, i) => (<div key={`${char}-${i}`} className="absolute text-5xl font-black text-slate-400/20 animate-float" style={{left: `${Math.random() * 90}%`, top: `${Math.random() * 90}%`, animationDuration: `${7 + Math.random() * 7}s`,}}>{char}</div>)))}</BackgroundContainer>);
const MeasurementBackground = () => (<BackgroundContainer>{['📏', '⏰', '⚖️'].flatMap(char => Array.from({ length: 4 }).map((_, i) => (<div key={`${char}-${i}`} className="absolute text-5xl text-slate-400/20 animate-float" style={{left: `${Math.random() * 90}%`, top: `${Math.random() * 90}%`, animationDuration: `${8 + Math.random() * 6}s`,}}>{char}</div>)))}</BackgroundContainer>);
const LogicBackground = () => (<BackgroundContainer>{['💡', '🧠', '?'].flatMap(char => Array.from({ length: 4 }).map((_, i) => (<div key={`${char}-${i}`} className="absolute text-5xl text-slate-400/20 animate-float" style={{left: `${Math.random() * 90}%`, top: `${Math.random() * 90}%`, animationDuration: `${5 + Math.random() * 8}s`,}}>{char}</div>)))}</BackgroundContainer>);
const FractionsBackground = () => (<BackgroundContainer>{['🍕', '🍰'].flatMap(char => Array.from({ length: 5 }).map((_, i) => (<div key={`${char}-${i}`} className="absolute text-5xl text-slate-400/20 animate-float" style={{left: `${Math.random() * 90}%`, top: `${Math.random() * 90}%`, animationDuration: `${8 + Math.random() * 8}s`,}}>{char}</div>)))}</BackgroundContainer>);
// END: Dynamic Background Components

// START: UI Icons
const SpeakerIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>);
const LightbulbIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm3.172 1.828a1 1 0 01.707 1.707l-.707.707a1 1 0 01-1.414-1.414l.707-.707zM5.121 5.536a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zM10 16a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1zm-3.879-2.121a1 1 0 010-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707a1 1 0 01-1.414 0zM15.464 12.879a1 1 0 01-1.414 0l-.707-.707a1 1 0 011.414-1.414l.707.707a1 1 0 010 1.414zM4 10a1 1 0 01-1-1H2a1 1 0 110-2h1a1 1 0 011 1zm12 0a1 1 0 01-1-1h-1a1 1 0 110-2h1a1 1 0 011 1z" clipRule="evenodd" /><path d="M9 16a1 1 0 10-2 0 1 1 0 002 0z" /><path d="M10 4C6.686 4 4 6.686 4 10s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 10a4 4 0 110-8 4 4 0 010 8z" /></svg>);
const CheckIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>);
const CrossIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>);
// END: UI Icons

interface QuestionProps {
  questions: Question[];
  onQuizComplete: (result: QuizResult, incorrectAnswers: AnsweredQuestion[]) => void;
  playerProgress: PlayerProgress;
  onUsePowerUp: (powerUp: PowerUpType) => void;
  topic: Topic;
  onGoToDashboard: () => void;
  isApiRateLimited: boolean;
  onApiQuotaExceeded: () => void;
}

const PowerUpButton: React.FC<{ icon: string; name: string; count: number; onClick: () => void; disabled?: boolean }> = ({ icon, name, count, onClick, disabled = false }) => (
    <button
        onClick={onClick}
        disabled={disabled || count === 0}
        className="relative flex flex-col items-center justify-center gap-1 bg-white/80 backdrop-blur-sm rounded-xl p-2 shadow-md hover:bg-yellow-100 transition-all duration-200 disabled:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
    >
        <div className="text-3xl">{icon}</div>
        <span className="text-xs font-bold text-slate-700">{name}</span>
        {count > 0 && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                {count}
            </div>
        )}
    </button>
);


const QuestionComponent: React.FC<QuestionProps> = ({ questions, onQuizComplete, playerProgress, onUsePowerUp, topic, onGoToDashboard, isApiRateLimited, onApiQuotaExceeded }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [fillInBlankAnswer, setFillInBlankAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [detailedExplanation, setDetailedExplanation] = useState<string | null>(null);
  const [isTutorLoading, setIsTutorLoading] = useState(false);
  const [currentIncorrectAnswer, setCurrentIncorrectAnswer] = useState<AnsweredQuestion | null>(null);
  const [incorrectAnswers, setIncorrectAnswers] = useState<AnsweredQuestion[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [isHintVisible, setIsHintVisible] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [combo, setCombo] = useState(0);
  const [bonusPoints, setBonusPoints] = useState<number | null>(null);
  const [bonusPointsKey, setBonusPointsKey] = useState(0);

  const quizTime = 900; // 15 phút
  const [timeLeft, setTimeLeft] = useState(quizTime);
  // Fix: The return type of setInterval in a browser environment is a number, not NodeJS.Timeout.
  // Using ReturnType<typeof setInterval> provides the correct cross-platform type.
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentQuestion = questions[currentQuestionIndex];

  // Timer logic
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      // End quiz when time is up
      onQuizComplete({ score, totalQuestions: questions.length, correctAnswers: correctCount }, incorrectAnswers);
    }
  }, [timeLeft, onQuizComplete, score, questions.length, correctCount, incorrectAnswers]);


  useEffect(() => {
    // Reset state for new quiz
    setCurrentQuestionIndex(0);
    setIsExiting(false);
    setSelectedAnswer(null);
    setFillInBlankAnswer('');
    setIsAnswered(false);
    setExplanation(null);
    setDetailedExplanation(null);
    setIsTutorLoading(false);
    setCurrentIncorrectAnswer(null);
    setFeedbackMessage(null);
    setIncorrectAnswers([]);
    setHint(null);
    setIsHintLoading(false);
    setIsHintVisible(false);
    setScore(0);
    setCorrectCount(0);
    setCombo(0);
    setBonusPoints(null);
    setTimeLeft(quizTime);
  }, [questions, quizTime]);

  const handleNext = () => {
    setIsExiting(true); // Trigger exit animation
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
          // Reset for next question
          setIsAnswered(false);
          setSelectedAnswer(null);
          setFillInBlankAnswer('');
          setExplanation(null);
          setDetailedExplanation(null);
          setIsTutorLoading(false);
          setCurrentIncorrectAnswer(null);
          setFeedbackMessage(null);
          setIsExiting(false); // Trigger enter animation for new question
          setHint(null);
          setIsHintLoading(false);
          setIsHintVisible(false);
          setBonusPoints(null);
      } else {
          onQuizComplete({ score, totalQuestions: questions.length, correctAnswers: correctCount }, incorrectAnswers);
      }
    }, 400); // Match animation duration
  }

  const handleExitQuiz = () => {
    setShowExitConfirm(true);
  };
  
  const handleGetHint = async () => {
    if (isHintLoading || hint || playerProgress.inventory.hint <= 0) return;
    setIsHintLoading(true);
    onUsePowerUp('hint');
    try {
        const generatedHint = await generateHint(currentQuestion.question, playerProgress.grade);
        setHint(generatedHint);
    } catch (error: any) {
        if (error.message === QUOTA_EXCEEDED_ERROR) {
            onApiQuotaExceeded();
        }
        setHint("Gợi ý không có sẵn lúc này.");
    } finally {
        setIsHintLoading(false);
        setIsHintVisible(true);
    }
  };

  const handleGetTutorExplanation = async () => {
    if (isTutorLoading || !currentIncorrectAnswer) return;

    setIsTutorLoading(true);
    try {
        const result = await generateTutorExplanation(currentIncorrectAnswer, playerProgress.grade);
        setDetailedExplanation(result);
    } catch (error: any) {
        if (error.message === QUOTA_EXCEEDED_ERROR) {
            onApiQuotaExceeded();
        } else {
            setDetailedExplanation("Có lỗi xảy ra khi tạo phân tích. Vui lòng thử lại sau.");
        }
    } finally {
        setIsTutorLoading(false);
    }
  };

  const handleSkipQuestion = () => {
      if (playerProgress.inventory.skip <= 0 || isAnswered) return;
      onUsePowerUp('skip');
      handleNext();
  }

  const handleAddTime = () => {
      if (playerProgress.inventory.time_boost <= 0) return;
      onUsePowerUp('time_boost');
      setTimeLeft(prev => prev + 30);
  }

  const processAnswer = (userAnswer: string) => {
    if (isAnswered) return;

    const isCorrect = userAnswer.trim().toLowerCase() === currentQuestion.answer.trim().toLowerCase();
    
    setIsAnswered(true);
    setSelectedAnswer(userAnswer);

    if (isCorrect) {
      const comboBonus = combo * 2; // Each combo point is worth 2 extra score
      const pointsAwarded = 10 + comboBonus;
      setScore(prev => prev + pointsAwarded);
      setBonusPoints(pointsAwarded); // Show the points pop-up
      setBonusPointsKey(k => k + 1); // Re-trigger animation
      setCorrectCount(prev => prev + 1);
      setCombo(prev => prev + 1);
      playCorrectSound();
      const randomFeedback = POSITIVE_FEEDBACKS[Math.floor(Math.random() * POSITIVE_FEEDBACKS.length)];
      setFeedbackMessage(randomFeedback);
    } else {
      setCombo(0); // Reset combo
      playIncorrectSound();
      const expl = currentQuestion.explanation; // Use pre-fetched explanation
      setExplanation(expl);
      const incorrectAnswerData = {
          question: currentQuestion,
          userAnswer: userAnswer,
          explanation: expl
      };
      setCurrentIncorrectAnswer(incorrectAnswerData);
      setIncorrectAnswers(prev => [...prev, incorrectAnswerData]);
    }
  }
  
  const getButtonClass = (option: string) => {
    if (!isAnswered) {
      return "bg-white/80 hover:bg-yellow-100 border-slate-300 hover:border-yellow-400";
    }
    if (option === currentQuestion.answer) {
      return "bg-green-500 border-green-700 text-white";
    }
    if (option === selectedAnswer && option !== currentQuestion.answer) {
      return "bg-red-500 border-red-700 text-white";
    }
    return "bg-slate-200/60 border-slate-300 text-slate-500 cursor-not-allowed opacity-70";
  };

  const renderAnswerArea = () => {
    switch (currentQuestion.type) {
      case 'fill_in_the_blank':
        return (
          <form onSubmit={(e) => { e.preventDefault(); processAnswer(fillInBlankAnswer); }} className="flex items-center justify-center gap-4">
            <input type="text" value={fillInBlankAnswer} onChange={(e) => setFillInBlankAnswer(e.target.value)} disabled={isAnswered} placeholder="Điền đáp án" className="px-4 py-3 text-2xl font-bold rounded-xl border-2 border-slate-300 focus:ring-4 focus:ring-yellow-400 focus:border-yellow-500 transition-all duration-300 w-48 text-center shadow-inner" autoFocus />
            <button type="submit" disabled={isAnswered || !fillInBlankAnswer.trim()} className="px-8 py-4 bg-blue-500 text-white font-black text-xl rounded-xl shadow-lg hover:bg-blue-600 transform hover-translate-y-1 transition-all duration-300 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:transform-none">Gửi</button>
          </form>
        );
      case 'true_false':
      case 'multiple_choice':
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(currentQuestion.options || []).map((option, index) => (
              <button key={index} onClick={() => processAnswer(option)} disabled={isAnswered} className={`relative p-4 rounded-xl text-xl font-bold border-b-8 transition-all duration-200 transform hover:-translate-y-1 flex items-center justify-center text-center shadow-lg ${getButtonClass(option)}`}>
                <span>{option}</span>
                {isAnswered && (
                  <div className="absolute -right-3 -top-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md">
                    {option === currentQuestion.answer && <div className="bg-green-600 rounded-full p-0"><CheckIcon/></div>}
                    {option === selectedAnswer && option !== currentQuestion.answer && <div className="bg-red-600 rounded-full p-0"><CrossIcon/></div>}
                  </div>
                )}
              </button>
            ))}
          </div>
        );
    }
  };

  if (!currentQuestion) return null;
  
  const renderDynamicBackground = () => {
    switch (topic) {
        case 'addition_subtraction': return <AdditionSubtractionBackground />;
        case 'multiplication_division': return <MultiplicationDivisionBackground />;
        case 'comparison': return <ComparisonBackground />;
        case 'word_problems': return <WordProblemsBackground />;
        case 'geometry': return <GeometryBackground />;
        case 'measurement': return <MeasurementBackground />;
        case 'logic': return <LogicBackground />;
        case 'fractions': return <FractionsBackground />;
        case 'general': default: return <GeneralBackground />;
    }
  };

  const isIncorrect = isAnswered && selectedAnswer?.trim().toLowerCase() !== currentQuestion.answer.trim().toLowerCase();
  const isCorrect = isAnswered && !isIncorrect;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeColor = timeLeft <= 15 ? 'text-red-500 animate-pulse' : 'text-white';

  return (
    <div className="relative flex flex-col items-center justify-start min-h-screen w-full p-4 pt-8 animate-fade-in overflow-hidden">
      {renderDynamicBackground()}
      
      <button 
        onClick={handleExitQuiz} 
        className="absolute top-4 left-4 z-20 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-600 text-2xl font-bold shadow-md hover:bg-white hover:text-red-500 transition-all"
        aria-label="Thoát thử thách"
      >
        &times;
      </button>

      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 m-4 max-w-sm w-full relative animate-scale-up text-center">
            <h3 className="text-2xl font-bold text-slate-800">
              Con có chắc muốn thoát không?
            </h3>
            <p className="mt-2 text-slate-600">
              Toàn bộ tiến trình trong thử thách này sẽ không được lưu lại.
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="px-8 py-3 bg-slate-400 text-white font-bold rounded-lg hover:bg-slate-500 transition-colors"
              >
                Không
              </button>
              <button
                onClick={onGoToDashboard}
                className="px-8 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors"
              >
                Thoát
              </button>
            </div>
          </div>
        </div>
      )}

      {isHintVisible && hint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-30 animate-fade-in" onClick={() => setIsHintVisible(false)}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 m-4 max-w-md w-full relative animate-scale-up" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-2xl font-bold text-yellow-600 flex items-center gap-2">
                    <LightbulbIcon />
                    Gợi ý từ Thầy Hùng
                </h3>
                <p className="mt-4 text-slate-700 text-lg whitespace-pre-wrap">{hint}</p>
                <button 
                    onClick={() => setIsHintVisible(false)} 
                    className="mt-6 w-full py-2 px-4 bg-yellow-500 text-white font-bold rounded-lg hover:bg-yellow-600 transition-colors"
                >
                    Đã hiểu
                </button>
            </div>
        </div>
      )}
      
      <div className={`w-full max-w-2xl z-10 transition-transform duration-300 ${isExiting ? 'animate-slide-out-left' : 'animate-slide-in-right'}`}>
          <div className="mb-4">
              <div className="flex justify-between items-center text-white font-bold mb-2 drop-shadow-md">
                  <span>Câu hỏi {currentQuestionIndex + 1}/{questions.length}</span>
                  <div className="flex items-center gap-4">
                    <span className={`font-mono text-xl p-1 rounded-md bg-black/30 ${timeColor}`}>{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
                    <span className="relative flex items-center gap-1 text-2xl">
                        <span>🌟</span>
                        <span>{score}</span>
                        {bonusPoints !== null && (
                            <span key={bonusPointsKey} className="absolute right-0 text-yellow-300 font-black animate-bonus-pop">
                                +{bonusPoints}
                            </span>
                        )}
                    </span>
                  </div>
              </div>
              <ProgressBar current={currentQuestionIndex + 1} total={questions.length} />
          </div>

           {combo >= 2 && (
                <div key={combo} className="absolute top-16 right-4 z-20 flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full shadow-lg animate-combo-pump">
                    <span className="text-2xl">🔥</span>
                    <span className="text-xl font-black">COMBO x{combo}</span>
                </div>
            )}

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-2xl min-h-[120px] md:min-h-[150px] flex items-center justify-center relative">
               <p className="text-2xl md:text-4xl font-black text-slate-800 text-center leading-tight">{currentQuestion.question}</p>
               <div className="absolute top-2 right-2 flex items-center gap-1">
                  <button onClick={() => speak(currentQuestion.question)} className="text-slate-400 hover:text-blue-500 transition-colors p-2 rounded-full hover:bg-slate-100">
                    <SpeakerIcon />
                  </button>
               </div>
          </div>
          
          <div className="mt-6">
            {renderAnswerArea()}
          </div>

          <div className="mt-8 pt-6 border-t-2 border-white/30">
            <div className="grid grid-cols-3 gap-4">
                <PowerUpButton icon="💡" name="Gợi ý" count={playerProgress.inventory.hint} onClick={handleGetHint} disabled={isAnswered || isHintLoading || !!hint || isApiRateLimited} />
                <PowerUpButton icon="⏩" name="Bỏ qua" count={playerProgress.inventory.skip} onClick={handleSkipQuestion} disabled={isAnswered} />
                <PowerUpButton icon="⏳" name="+30 giây" count={playerProgress.inventory.time_boost} onClick={handleAddTime} disabled={isAnswered} />
            </div>
          </div>
      </div>
        
      {isAnswered && (
         <div className={`fixed bottom-0 left-0 right-0 z-20 p-4 transition-transform duration-500 ${isExiting ? 'animate-slide-out-down' : 'animate-slide-in-up'}`}>
            <div className={`max-w-2xl mx-auto rounded-2xl shadow-2xl p-6 text-center ${isCorrect ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-rose-600'} text-white`}>
                <h2 className="text-3xl font-black mb-4 drop-shadow-md">
                  {isCorrect ? 'Tuyệt vời! ✅' : 'Ôi, chưa đúng rồi! ❌'}
                </h2>

                {isCorrect && feedbackMessage && <p className="text-lg">{feedbackMessage}</p>}
                
                {isIncorrect && (
                  <div>
                    <p className="mb-4">Đáp án đúng là: <span className="font-bold text-2xl">{currentQuestion.answer}</span></p>
                    
                    {detailedExplanation ? (
                        <div className="bg-white/20 p-4 rounded-lg mt-4 text-left backdrop-blur-sm animate-fade-in max-h-60 overflow-y-auto">
                            <p className="font-bold mb-2">Thầy Hùng giải thích chi tiết:</p>
                            <SimpleMarkdown text={detailedExplanation} />
                        </div>
                    ) : (
                      <>
                        {explanation && (
                          <div className="bg-white/20 p-4 rounded-lg mt-4 text-left backdrop-blur-sm">
                              <p><span className="font-bold">Thầy Hùng giải thích:</span> {explanation}</p>
                          </div>
                        )}
                        <button
                          onClick={handleGetTutorExplanation}
                          disabled={isTutorLoading || isApiRateLimited}
                          className="mt-4 w-full text-sm py-2 px-4 bg-white/30 text-white font-bold rounded-lg hover:bg-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isTutorLoading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-white"></div>
                              Thầy Hùng đang soạn bài...
                            </>
                          ) : "📖 Xem giải thích chi tiết"}
                        </button>
                        {isApiRateLimited && !isTutorLoading && (
                            <p className="text-xs text-white/80 mt-1">Tính năng này đang tạm nghỉ, vui lòng thử lại sau.</p>
                        )}
                      </>
                    )}
                  </div>
                )}
                
                <button onClick={handleNext} className="mt-6 w-full max-w-xs mx-auto py-4 px-6 bg-white text-slate-800 font-black text-xl rounded-xl shadow-lg hover:bg-yellow-200 transform hover:-translate-y-1 transition-all duration-300">
                    Tiếp tục
                </button>
            </div>
         </div>
      )}
    </div>
  );
};

export default QuestionComponent;