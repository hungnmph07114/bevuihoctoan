import { Pawn } from '../types';

export const defaultPawn: Pawn = {
    id: 'default_pawn',
    name: 'Cờ Hiệu Mặc Định',
    description: 'Lá cờ tiêu chuẩn cho mọi nhà thám hiểm.',
    icon: '🚩',
    cost: 0,
};

export const ALL_PAWNS: Pawn[] = [
    defaultPawn,
    {
        id: 'pawn_rocket',
        name: 'Tên Lửa Tốc Độ',
        description: 'Cho thấy tốc độ học tập phi thường của con!',
        icon: '🚀',
        cost: 400,
    },
    {
        id: 'pawn_wizard_hat',
        name: 'Mũ Phù Thủy',
        description: 'Biến mỗi bước đi thành một phép màu tri thức.',
        icon: '🧙',
        cost: 600,
    },
    {
        id: 'pawn_robot',
        name: 'Robot Trí Tuệ',
        description: 'Một người bạn đồng hành công nghệ cao trên bản đồ.',
        icon: '🤖',
        cost: 800,
    },
];

export const getPawnById = (id: string): Pawn | undefined => {
    return ALL_PAWNS.find(pawn => pawn.id === id);
}