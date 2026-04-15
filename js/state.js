const GAME_STATE = {
    character: null,
    quests: [],
    income: [],
    settings: {
        theme: 'dark'
    }
};

const CHARACTER_CLASSES = [
    {
        id: 'creator',
        name: 'Creator',
        icon: '🧙',
        description: 'Tập trung vào sự sáng tạo, nội dung và gây ảnh hưởng.',
        baseStats: { str: 5, int: 12, cha: 15, wis: 8, dex: 10, con: 5 }
    },
    {
        id: 'warrior',
        name: 'Warrior',
        icon: '⚔️',
        description: 'Bản lĩnh thực chiến, khả năng đàm phán và bán hàng đỉnh cao.',
        baseStats: { str: 12, int: 8, cha: 10, wis: 10, dex: 8, con: 12 }
    },
    {
        id: 'merchant',
        name: 'Merchant',
        icon: '💰',
        description: 'Tối ưu hóa dòng tiền, đầu tư và xây dựng hệ thống bền vững.',
        baseStats: { str: 6, int: 10, cha: 12, wis: 15, dex: 7, con: 5 }
    },
    {
        id: 'sage',
        name: 'Sage',
        icon: '🔮',
        description: 'Chuyên gia tư vấn, huấn luyện và phát triển trí tuệ chuyên sâu.',
        baseStats: { str: 4, int: 18, cha: 8, wis: 12, dex: 5, con: 8 }
    }
];

// Logic for progression
const PROGRESSION = {
    getXPRequired: (level) => {
        // Simple formula: base 100 * (level ^ 1.5)
        return Math.floor(100 * Math.pow(level, 1.5));
    },
    
    getRankTitle: (level) => {
        if (level < 10) return 'Apprentice';
        if (level < 25) return 'Journeyman';
        if (level < 50) return 'Expert';
        if (level < 75) return 'Master';
        if (level < 100) return 'Grand Master';
        return 'Legend';
    }
};

// Persistence
const PERSISTENCE = {
    KEY: 'LIFE_GAME_DATA',
    
    save: () => {
        localStorage.setItem(PERSISTENCE.KEY, JSON.stringify(GAME_STATE));
    },
    
    load: () => {
        const data = localStorage.getItem(PERSISTENCE.KEY);
        if (data) {
            const parsed = JSON.parse(data);
            Object.assign(GAME_STATE, parsed);
            return true;
        }
        return false;
    },
    
    reset: () => {
        localStorage.removeItem(PERSISTENCE.KEY);
        window.location.reload();
    }
};
