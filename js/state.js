const GAME_STATE = {
    character: null,
    quests: [],
    income: [],
    skills: [], // Mảng chứa ID các skill đã unlock
    achievements: [], // Mảng chứa ID các achievement đã đạt
    history: {
        xp: [], // { date: 'YYYY-MM-DD', amount: 100 }
        gold: [] // { date: 'YYYY-MM-DD', amount: 5000 }
    },
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

// Phase 2: Skills Definition
const SKILLS_DB = [
    { id: 'deep_work_1', name: 'Deep Work I', icon: '🧠', description: '+10% XP từ mọi Quest.', cost: 1, type: 'passive', effect: { xp_mult: 0.1 } },
    { id: 'gold_magnet_1', name: 'Gold Magnet I', icon: '🧲', description: '+5% Gold từ mọi Loot.', cost: 1, type: 'passive', effect: { gold_mult: 0.05 } },
    { id: 'charisma_boost_1', name: 'Charisma Boost', icon: '✨', description: '+2 chỉ số CHA vĩnh viễn.', cost: 2, type: 'stat', effect: { stat: 'cha', value: 2 } },
    { id: 'flow_state', name: 'Flow State', icon: '🌊', description: 'Hoàn thành Quest độ khó A trở lên nhận thêm 50 XP.', cost: 3, type: 'passive', effect: { high_diff_bonus: 50 } }
];

// Phase 2: Achievements Definition
const ACHIEVEMENTS_DB = [
    { id: 'first_step', name: 'First Step', icon: '👣', description: 'Hoàn thành nhiệm vụ đầu tiên.', criteria: (state) => state.quests.some(q => q.completed) },
    { id: 'wealthy_1', name: 'Gold Miner', icon: '⛏️', description: 'Tích lũy 10,000 Gold.', criteria: (state) => state.character.gold >= 10000 },
    { id: 'stat_master_1', name: 'Focused Specialist', icon: '🎯', description: 'Một chỉ số đạt 20 điểm.', criteria: (state) => Object.values(state.character.stats).some(v => v >= 20) }
];

// Phase 2: Ranks for Journey Map
const RANKS = [
    { level: 1, name: 'Apprentice' },
    { level: 10, name: 'Journeyman' },
    { level: 25, name: 'Expert' },
    { level: 50, name: 'Master' },
    { level: 75, name: 'Grand Master' },
    { level: 100, name: 'Legend' }
];

// Logic for progression
const PROGRESSION = {
    getXPRequired: (level) => {
        return Math.floor(100 * Math.pow(level, 1.5));
    },
    
    getRankInfo: (level) => {
        let currentRank = RANKS[0];
        let nextRank = RANKS[1];
        
        for (let i = 0; i < RANKS.length; i++) {
            if (level >= RANKS[i].level) {
                currentRank = RANKS[i];
                nextRank = RANKS[i+1] || null;
            }
        }
        return { currentRank, nextRank };
    }
};

// Persistence
const PERSISTENCE = {
    KEY: 'LIFE_GAME_DATA_P2', // Change key for Phase 2 to avoid structure conflicts
    
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
