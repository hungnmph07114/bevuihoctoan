import React, { useRef, useMemo } from 'react';
import { PlayerProgress } from '../types';

interface AdventureMapProps {
    progress: PlayerProgress;
    onClaimChest: (chestLevel: number) => void;
    activePawnIcon: string;
}

const TOTAL_LEVELS = 20;

// --- Map Data ---
const decorations = [
    { content: '🌳', x: '10%', y: '65%', size: 'text-4xl' }, { content: '🌸', x: '18%', y: '80%', size: 'text-2xl' }, { content: '🌳', x: '25%', y: '50%', size: 'text-4xl' },
    { content: '🌲', x: '35%', y: '20%', size: 'text-4xl' }, { content: '🌲', x: '48%', y: '35%', size: 'text-5xl' }, { content: '🌲', x: '55%', y: '15%', size: 'text-4xl' },
    { content: '⛰️', x: '68%', y: '65%', size: 'text-5xl' }, { content: '⛰️', x: '75%', y: '50%', size: 'text-6xl' },
    { content: '🌅', x: '85%', y: '20%', size: 'text-6xl' }, { content: '🏰', x: '92%', y: '35%', size: 'text-7xl' },
];

const specialNodes: Record<number, { type: 'chest' | 'gate'; content: string; claimedContent?: string }> = {
    5: { type: 'gate', content: '⛩️' },
    10: { type: 'chest', content: '🎁', claimedContent: '⭐' },
    15: { type: 'gate', content: '⛩️' },
    20: { type: 'chest', content: '🎁', claimedContent: '⭐' },
};

const LIGHTNING_LEVELS = [8, 13, 18];
const RIDDLE_LEVELS = [3, 7, 12, 17];


const AdventureMap: React.FC<AdventureMapProps> = ({ progress, onClaimChest, activePawnIcon }) => {
    const pathRef = useRef<SVGPathElement>(null);
    const { level, claimedChests, completedEvents } = progress;

    const pathData = "M 50 350 C 150 300, 200 150, 300 150 S 450 150, 550 250 S 700 400, 800 350 S 950 250, 1050 200";

    const getPathPoints = (pathElement: SVGPathElement | null): { x: number; y: number }[] => {
        if (!pathElement) return [];
        const totalLength = pathElement.getTotalLength();
        const points = [];
        for (let i = 0; i <= TOTAL_LEVELS; i++) {
            const distance = (i / TOTAL_LEVELS) * totalLength;
            points.push(pathElement.getPointAtLength(distance));
        }
        return points;
    };
    
    const pathPoints = useMemo(() => {
        if (typeof document === 'undefined') return [];
        const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        tempPath.setAttribute('d', pathData);
        return getPathPoints(tempPath);
    }, [pathData]);


    const playerPosition = pathPoints[Math.min(level, TOTAL_LEVELS)] || pathPoints[0];
    
    const pathLength = useMemo(() => {
        if (typeof document === 'undefined') return 0;
        const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        tempPath.setAttribute('d', pathData);
        return tempPath.getTotalLength();
    }, [pathData]);

    const completedPathPercentage = Math.min(level, TOTAL_LEVELS) / TOTAL_LEVELS;
    const strokeDashoffset = pathLength * (1 - completedPathPercentage);

    const handleChestClick = (chestLevel: number) => {
        if (level >= chestLevel && !claimedChests.includes(chestLevel)) {
            onClaimChest(chestLevel);
        }
    };

    return (
        <div className="relative w-full aspect-[2/1] overflow-hidden">
             {/* Animated Clouds */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute text-7xl opacity-30 animate-drift" style={{ top: '5%', animationDuration: '50s' }}>☁️</div>
                <div className="absolute text-8xl opacity-20 animate-drift" style={{ top: '15%', left: '-10%', animationDuration: '70s', animationDelay: '-10s' }}>☁️</div>
            </div>

            <svg viewBox="0 0 1100 400" className="w-full h-full">
                <path d={pathData} fill="none" stroke="#d1d5db" strokeWidth="15" strokeLinecap="round" />
                <path
                    ref={pathRef}
                    d={pathData}
                    fill="none"
                    stroke="url(#path-gradient)"
                    strokeWidth="15"
                    strokeLinecap="round"
                    strokeDasharray={pathLength}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-in-out"
                />
                <defs>
                    <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6ee7b7" />
                        <stop offset="50%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#fbbf24" />
                    </linearGradient>
                </defs>

                {/* Level Nodes */}
                {pathPoints.map((point, i) => {
                    if (i === 0) return null; // Skip start point
                    const isUnlocked = i <= level;
                    const isCompletedEvent = completedEvents.includes(i);
                    const specialNode = specialNodes[i];

                    // Event nodes
                    if (RIDDLE_LEVELS.includes(i)) {
                        return (
                             <g key={i} transform={`translate(${point.x}, ${point.y})`} className={isCompletedEvent ? 'opacity-50' : ''}>
                                <text x="0" y="15" fontSize="40" textAnchor="middle" className={isUnlocked && !isCompletedEvent ? 'animate-pulse-glow animate-pawn-bob' : ''}>❓</text>
                                <title>{`Cấp ${i}: Câu Đố Nhà Thông Thái ${isCompletedEvent ? '(Đã hoàn thành)' : ''}`}</title>
                            </g>
                        );
                    }
                     if (LIGHTNING_LEVELS.includes(i)) {
                        return (
                             <g key={i} transform={`translate(${point.x}, ${point.y})`} className={isCompletedEvent ? 'opacity-50' : ''}>
                                <text x="0" y="15" fontSize="40" textAnchor="middle" className={isUnlocked && !isCompletedEvent ? 'animate-pulse-glow animate-pawn-bob' : ''}>⚡</text>
                                <title>{`Cấp ${i}: Thử Thách Chớp Nhoáng ${isCompletedEvent ? '(Đã hoàn thành)' : ''}`}</title>
                            </g>
                        );
                    }

                    // Chest and Gate nodes
                    if (specialNode) {
                        const isClaimed = specialNode.type === 'chest' && claimedChests.includes(i);
                        const canClaim = isUnlocked && !isClaimed;
                        
                        let animationClass = '';
                        if (specialNode.type === 'chest' && canClaim) {
                            animationClass = 'animate-gentle-pulse';
                        } else if (specialNode.type === 'gate' && isUnlocked) {
                            animationClass = 'animate-crystal-glow';
                        }

                        return (
                            <g key={i} transform={`translate(${point.x}, ${point.y})`} className={canClaim ? 'cursor-pointer' : ''} onClick={() => specialNode.type === 'chest' && handleChestClick(i)}>
                                <text x="0" y="15" fontSize="40" textAnchor="middle" className={animationClass}>
                                    {isClaimed ? specialNode.claimedContent : specialNode.content}
                                </text>
                                <title>{`Cấp ${i}: ${specialNode.type === 'chest' ? (isClaimed ? 'Đã nhận thưởng' : 'Rương Báu') : 'Cổng Thử Thách'}`}</title>
                            </g>
                        );
                    }

                    // Regular nodes
                    return (
                        <circle
                            key={i}
                            cx={point.x}
                            cy={point.y}
                            r="12"
                            fill={isUnlocked ? '#ffffff' : '#9ca3af'}
                            stroke={isUnlocked ? '#fbbf24' : '#6b7281'}
                            strokeWidth="4"
                            className="transition-all duration-500"
                        >
                             <title>Cấp {i}</title>
                        </circle>
                    );
                })}

                {/* Player Pawn */}
                {playerPosition && (
                    <text 
                        x={playerPosition.x} 
                        y={playerPosition.y - 15} 
                        fontSize="40" 
                        textAnchor="middle"
                        className="animate-pawn-bob"
                        style={{ transition: 'x 1s ease-in-out, y 1s ease-in-out' }}
                    >
                        {activePawnIcon}
                    </text>
                )}
            </svg>
            
            <div className="absolute inset-0 pointer-events-none">
                 {decorations.map((deco, i) => (
                     <span key={i} className={`absolute ${deco.size}`} style={{ left: deco.x, top: deco.y, transform: 'translate(-50%, -50%)' }}>
                         {deco.content}
                     </span>
                 ))}
            </div>
        </div>
    );
};

export default AdventureMap;