const GAME_STATE = {
    character: null,
    quests: [],
    income: [],
    skills: [], 
    achievements: [], 
    history: {
        xp: [], 
        gold: [] 
    },
    settings: {
        theme: 'dark'
    }
};

const CHARACTER_CLASSES = [
    {
        id: 'creator',
        name: 'Creator (Nhà Sáng Tạo)',
        icon: '🎨',
        description: 'Bậc thầy về truyền cảm hứng và xây dựng cộng đồng.',
        baseStats: { t1: 3, t2: 2, t3: 5 }
    },
    {
        id: 'warrior',
        name: 'Warrior (Chiến Binh)',
        icon: '⚔️',
        description: 'Kỷ luật thép, thực thi mạnh mẽ và kiên trì.',
        baseStats: { t1: 5, t2: 3, t3: 2 }
    },
    {
        id: 'merchant',
        name: 'Merchant (Thương Nhân)',
        icon: '📊',
        description: 'Nhạy bén với con số, quản lý tài chính và hệ thống.',
        baseStats: { t1: 2, t2: 5, t3: 3 }
    },
    {
        id: 'sage',
        name: 'Sage (Hiền Triết)',
        icon: '📚',
        description: 'Hiểu biết sâu sắc, tư duy chiến lược và cố vấn.',
        baseStats: { t1: 5, t2: 2, t3: 3 }
    }
];

const QUEST_CONFIG = {
    REWARDS: {
        'E': 0.1,
        'D': 0.2,
        'C': 0.5,
        'B': 1.0,
        'A': 2.5,
        'S': 10.0
    }
};

const PRESET_QUESTS = {
    creator: [
        { title: 'Quay và đăng 1 video ngắn', difficulty: 'C', types: ['t1', 't3'] },
        { title: 'Lên ý tưởng cho tuần tới', difficulty: 'D', types: ['t1'] }
    ],
    warrior: [
        { title: 'Tập thể dục 30 phút', difficulty: 'C', types: ['t1'] },
        { title: 'Hoàn thành to-do list ngày', difficulty: 'B', types: ['t1', 't2'] }
    ],
    merchant: [
        { title: 'Ghi chép chi tiêu trong ngày', difficulty: 'E', types: ['t2'] },
        { title: 'Lên kế hoạch đầu tư tháng', difficulty: 'B', types: ['t1', 't2'] }
    ],
    sage: [
        { title: 'Đọc 1 chương sách mới', difficulty: 'D', types: ['t1'] },
        { title: 'Viết nhật ký phản tư', difficulty: 'C', types: ['t1'] }
    ]
};

const SKILLS_DB = [
    { id: 'focus', name: 'Tập trung sâu', icon: '🧠', cost: 1, type: 'passive', description: 'Tăng 10% XP' }
];

const ACHIEVEMENTS_DB = [
    { id: 'first_step', name: 'Bước đầu tiên', icon: '👣', description: 'Hoàn thành 1 Quest', criteria: (s)=>s.quests.some(q=>q.completed) }
];

const RANKS = [
    { level: 1, name: 'Tập sự' },
    { level: 10, name: 'Thành thạo' },
    { level: 25, name: 'Chuyên gia' },
    { level: 50, name: 'Bậc thầy' },
    { level: 75, name: 'Đại sư' },
    { level: 100, name: 'Huyền thoại' }
];

const GAME_TEXT = {
    welcome: {
        title: "Chào mừng đến với <br><span style='color:var(--accent)'>LIFE GAME</span>",
        subtitle: "Biến nỗ lực thành chỉ số.",
        features: [{icon:"🎯",label:"KẾ HOẠCH"},{icon:"📈",label:"PHÁT TRIỂN"}],
        cta: "Bắt đầu ngay →"
    },
    homeGuide: {
        title: "🎮 CẨM NẠNG",
        items: [{title:"4T", desc:"Tài năng, Tín nhiệm, Tiếng tăm, Tài chính"}],
        quote: "Play your life."
    }
};

const PROGRESSION = {
    getXPRequired: (level) => Math.floor(100 * Math.pow(level, 1.5)),
    getRankInfo: (level) => {
        let currentRank = RANKS[0];
        let nextRank = RANKS[1];
        for (let i = 0; i < RANKS.length; i++) {
            if (level >= RANKS[i].level) {
                currentRank = RANKS[i];
                nextRank = RANKS[i + 1] || null;
            }
        }
        return { currentRank, nextRank };
    },
    getRankInfoByStat: (val) => PROGRESSION.getRankInfo(val)
};

const PERSISTENCE = {
    KEY: 'LIFE_GAME_DATA_P2',
    save: () => localStorage.setItem(PERSISTENCE.KEY, JSON.stringify(GAME_STATE)),
    load: () => {
        const data = localStorage.getItem(PERSISTENCE.KEY);
        if (data) {
            try {
                const parsed = JSON.parse(data);
                if (parsed.character) {
                    if (!parsed.character.stats) parsed.character.stats = { t1: 0, t2: 0, t3: 0 };
                    if (parsed.character.xp === undefined) parsed.character.xp = 0;
                    if (parsed.character.level === undefined) parsed.character.level = 1;
                }
                if (!parsed.quests) parsed.quests = [];
                if (!parsed.income) parsed.income = [];
                if (!parsed.history) parsed.history = { xp: [], gold: [] };
                Object.assign(GAME_STATE, parsed);
                return true;
            } catch (e) {
                return false;
            }
        }
        return false;
    },
    reset: () => {
        if(confirm('Reset toàn bộ?')) {
            localStorage.removeItem(PERSISTENCE.KEY);
            window.location.reload();
        }
    }
};
