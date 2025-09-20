import React from 'react';

interface LoadingSpinnerProps {
    title: string;
    subtitle: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ title, subtitle }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-slate-100 p-4">
      <div className="w-full max-w-sm">
          {/* SVG Illustration of Teacher Hùng */}
          <svg viewBox="0 0 300 250" xmlns="http://www.w3.org/2000/svg">
              <g id="teacher-and-board">
                  {/* Chalkboard */}
                  <rect x="5" y="5" width="290" height="200" rx="10" fill="#2d3748" stroke="#718096" strokeWidth="4" />
                  <rect x="15" y="185" width="60" height="15" rx="3" fill="#a0aec0" />
                  
                  {/* Animated Chalk Writing */}
                  <g stroke="#ffffff" strokeWidth="5" strokeLinecap="round" fill="none">
                      <path d="M 40 50 C 60 20, 80 80, 100 50" strokeDasharray="150" strokeDashoffset="0" className="animate-draw-path" style={{ animationIterationCount: 'infinite', animationDuration: '2s' }} />
                  </g>

                  {/* Animated Math Symbols */}
                  <g fontFamily="Nunito, sans-serif" fontWeight="bold" fill="#ffffff" textAnchor="middle">
                      <text x="150" y="80" fontSize="30" className="animate-symbol-pulse">?</text>
                      <text x="220" y="60" fontSize="30" className="animate-symbol-pulse" style={{ animationDelay: '0.5s' }}>+</text>
                      <text x="180" y="130" fontSize="30" className="animate-symbol-pulse" style={{ animationDelay: '1s' }}>x</text>
                  </g>

                  {/* Teacher "Hùng" */}
                  <g id="teacher">
                      <circle cx="150" cy="220" r="25" fill="#f6ad55" />
                      <path d="M 140 215 C 145 220, 155 220, 160 215" stroke="#4a5568" strokeWidth="2" fill="none" />
                      <circle cx="145" cy="212" r="2" fill="#4a5568" />
                      <circle cx="155" cy="212" r="2" fill="#4a5568" />
                      <rect x="125" y="245" width="50" height="5" fill="#4a5568" />
                  </g>
              </g>
          </svg>
      </div>

      <h1 className="mt-6 text-2xl text-slate-800 font-black text-center">{title}</h1>
      <p className="mt-2 text-slate-600 text-center">{subtitle}</p>
    </div>
  );
};

export default LoadingSpinner;