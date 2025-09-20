import { Avatar } from '../types';

export const defaultAvatar: Avatar = {
    id: 'default_avatar',
    name: 'Người Mới Bắt Đầu',
    description: 'Ảnh đại diện mặc định cho mọi nhà vô địch tương lai.',
    icon: '🌟',
    cost: 0,
};

export const ALL_AVATARS: Avatar[] = [
    defaultAvatar,
    {
        id: 'avatar_detective',
        name: 'Thám Tử Nhí',
        description: 'Luôn tìm ra đáp án đúng, dù câu hỏi có hóc búa đến đâu!',
        icon: '🕵️',
        cost: 500,
    },
    {
        id: 'avatar_ninja',
        name: 'Ninja Làng Lá',
        description: 'Nhanh nhẹn và chính xác trong mọi phép tính.',
        icon: '🥷',
        cost: 500,
    },
    {
        id: 'avatar_superhero',
        name: 'Nữ Siêu Anh Hùng',
        description: 'Sở hữu siêu năng lực giải toán thần sầu.',
        icon: '🦸‍♀️',
        cost: 750,
    },
    {
        id: 'avatar_wizard',
        name: 'Pháp Sư Tí Hon',
        description: 'Biến những con số khô khan thành phép thuật kỳ diệu.',
        icon: '🪄',
        cost: 750,
    },
];

export const getAvatarById = (id: string): Avatar | undefined => {
    return ALL_AVATARS.find(avatar => avatar.id === id);
}