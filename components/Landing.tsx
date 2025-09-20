import React from 'react';

interface LandingProps {
  onStart: () => void;
}

// Re-usable decorative shape component
const FloatingShape: React.FC<{ shape: string; style: React.CSSProperties }> = ({ shape, style }) => (
    <div className="absolute text-5xl md:text-7xl font-black text-white/20 animate-float" style={style}>
        {shape}
    </div>
);

const Landing: React.FC<LandingProps> = ({ onStart }) => {
  const shapes = [
    { shape: '✨', top: '10%', left: '15%', animationDuration: '8s' },
    { shape: '➕', top: '20%', left: '80%', animationDuration: '12s' },
    { shape: '🧠', top: '70%', left: '10%', animationDuration: '10s' },
    { shape: '🚀', top: '80%', left: '75%', animationDuration: '7s' },
    { shape: '💡', top: '50%', left: '50%', animationDuration: '9s' },
    { shape: '🎨', top: '5%', left: '45%', animationDuration: '11s' },
  ];
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-purple-400 via-pink-400 to-rose-400 p-4 overflow-hidden animate-fade-in">
        {shapes.map((s, i) => (
            <FloatingShape key={i} shape={s.shape} style={{ top: s.top, left: s.left, animationDuration: s.animationDuration }} />
        ))}

      <div className="relative z-10 w-full max-w-lg text-center bg-white/20 backdrop-blur-md rounded-2xl shadow-2xl p-8 animate-scale-up">
        <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-lg leading-tight">
          Bé Yêu<br/>Học Toán
        </h1>
        <p className="text-white/80 mt-4 text-xl">
            Cuộc phiêu lưu toán học sắp bắt đầu!
        </p>

        <button
          onClick={onStart}
          className="mt-10 w-full max-w-sm bg-white text-rose-500 font-bold py-5 px-6 rounded-2xl text-2xl shadow-xl hover:bg-yellow-100 transform hover:-translate-y-2 transition-all duration-300 animate-bounce-slow"
        >
          Bắt đầu
        </button>
      </div>

      <footer className="absolute bottom-4 text-white/50 text-sm">
        Một sản phẩm sử dụng Gemini API
      </footer>
    </div>
  );
};

export default Landing;
