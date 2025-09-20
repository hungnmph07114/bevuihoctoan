import { Theme } from '../types';

export const defaultTheme: Theme = {
    id: 'default',
    name: 'Mặc định',
    icon: '🎨',
    cost: 0,
    background: {
        main: 'from-green-200 to-teal-200',
        playing: 'from-purple-200 to-indigo-200',
    },
};

export const ALL_THEMES: Theme[] = [
    defaultTheme,
    {
        id: 'ocean',
        name: 'Đại Dương',
        icon: '🌊',
        cost: 250,
        background: {
            main: 'from-sky-400 to-blue-500',
            playing: 'from-indigo-400 to-blue-600',
        },
    },
    {
        id: 'jungle',
        name: 'Rừng Xanh',
        icon: '🌳',
        cost: 300,
        background: {
            main: 'from-green-500 to-emerald-600',
            playing: 'from-teal-500 to-green-700',
        },
    },
    {
        id: 'space',
        name: 'Vũ Trụ',
        icon: '🚀',
        cost: 500,
        background: {
            main: 'from-slate-800 to-gray-900',
            playing: 'from-purple-900 to-slate-900',
        },
    }
];

export const getThemeById = (id: string): Theme | undefined => {
    return ALL_THEMES.find(theme => theme.id === id);
}
