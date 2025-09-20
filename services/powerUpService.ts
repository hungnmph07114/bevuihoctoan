import { PowerUpType } from '../types';

interface PowerUp {
    id: PowerUpType;
    name: string;
    description: string;
    icon: string;
    cost: number;
    quantity: number; // Amount given per purchase
}

export const ALL_POWER_UPS: PowerUp[] = [
    {
        id: 'time_boost',
        name: 'Thời gian+',
        description: 'Cộng thêm 30 giây vào đồng hồ đếm ngược.',
        icon: '⏳',
        cost: 50,
        quantity: 1,
    },
    {
        id: 'hint',
        name: 'Gói Gợi ý',
        description: 'Nhận 2 lượt sử dụng gợi ý từ Gia sư AI.',
        icon: '💡',
        cost: 100,
        quantity: 2,
    },
    {
        id: 'skip',
        name: 'Bỏ qua Câu hỏi',
        description: 'Bỏ qua một câu hỏi mà không bị tính là sai.',
        icon: '⏩',
        cost: 150,
        quantity: 1,
    }
];
