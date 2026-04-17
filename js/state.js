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
        icon: '⚖️',
        description: 'Tối ưu hóa nguồn lực và quan hệ khách hàng.',
        baseStats: { t1: 2, t2: 5, t3: 3 }
    },
    {
        id: 'sage',
        name: 'Sage (Hiền Triết)',
        icon: '📜',
        description: 'Sâu sắc về tư duy và chiến lược dài hạn.',
        baseStats: { t1: 4, t2: 4, t3: 2 }
    }
];

// --- 4T CONFIGURATION ---
const QUEST_CONFIG = {
    // Stat rewards based on difficulty
    REWARDS: { E: 0.1, D: 0.2, C: 0.5, B: 1.0, A: 2.0, S: 5.0 },

    // Keywords for auto-tagging
    KEYWORDS: {
        t1: ['học', 'đọc', 'nghiên cứu', 'kỹ năng', 'code', 'luyện', 'tập', 'bài', 'thực hành', 'course', 'khóa học', 'sách', 'tư duy', 'kiến thức'],
        t2: ['họp', 'gặp', 'cam kết', 'hứa', 'trả', 'đúng hạn', 'giúp', 'hỗ trợ', 'khách hàng', 'đối tác', 'uy tín', 'feedback', 'tín nhiệm'],
        t3: ['đăng', 'bài', 'video', 'tiktok', 'facebook', 'youtube', 'chia sẻ', 'cộng đồng', 'nói', 'thuyết trình', 'branding', 'marketing', 'tiếng tăm']
    }
};

// --- PRESET QUESTS BY CLASS ---
const PRESET_QUESTS = {
    creator: [
        { title: 'Quay 1 video ngắn chia sẻ giá trị', difficulty: 'B', types: ['t3'] },
        { title: 'Viết 1 bài post truyền cảm hứng lên MXH', difficulty: 'C', types: ['t3'] },
        { title: 'Thiết kế bộ nhận diện/hình ảnh mới', difficulty: 'C', types: ['t1'] },
        { title: 'Phản hồi 10 bình luận của cộng đồng', difficulty: 'D', types: ['t2'] },
        { title: 'Học 1 kỹ năng thiết kế/video mới', difficulty: 'C', types: ['t1'] }
    ],
    warrior: [
        { title: 'Hoàn thành 4 chu kỳ Pomodoro sâu', difficulty: 'B', types: ['t1'] },
        { title: 'Tập thể dục cường độ cao 30 phút', difficulty: 'C', types: ['t1'] },
        { title: 'Giải quyết 1 vấn đề tồn đọng > 1 tuần', difficulty: 'A', types: ['t1'] },
        { title: 'Xử lý sạch 100% email/tin nhắn đến', difficulty: 'C', types: ['t2'] },
        { title: 'Đọc 20 trang sách phát triển bản thân', difficulty: 'D', types: ['t1'] }
    ],
    merchant: [
        { title: 'Gửi báo giá cho 3 khách hàng tiềm năng', difficulty: 'B', types: ['t2'] },
        { title: 'Tư vấn chốt deal thành công 1 hợp đồng', difficulty: 'A', types: ['t2', 't3'] },
        { title: 'Kiểm tra dòng tiền & tối ưu chi tiết', difficulty: 'C', types: ['t1'] },
        { title: 'Hẹn gặp 1 đối tác mới mở rộng mạng lưới', difficulty: 'B', types: ['t2', 't3'] },
        { title: 'Đăng bài quảng bá dịch vụ/sản phẩm', difficulty: 'C', types: ['t3'] }
    ],
    sage: [
        { title: 'Nghiên cứu 1 chủ đề mới trong 2h', difficulty: 'B', types: ['t1'] },
        { title: 'Viết 1 bài phân tích chuyên sâu', difficulty: 'B', types: ['t1', 't3'] },
        { title: 'Tư vấn giải đáp thắc mắc khách hàng', difficulty: 'C', types: ['t2'] },
        { title: 'Dành 30p thiền & lập chiến lược', difficulty: 'D', types: ['t1'] },
        { title: 'Học thêm 1 chứng chỉ chuyên môn mới', difficulty: 'B', types: ['t1'] }
    ]
};


// Bộ câu hỏi xác định phong cách
const CHARACTER_QUIZ = [
    {
        question: 'Bạn thấy mình giỏi nhất ở điều gì khi kiếm tiền?',
        options: [
            { text: '🎨 Tạo nội dung, xây dựng thương hiệu cá nhân', classId: 'creator' },
            { text: '🤝 Bán hàng, thuyết phục và đàm phán trực tiếp', classId: 'warrior' },
            { text: '📊 Đầu tư, quản lý dòng tiền, xây hệ thống', classId: 'merchant' },
            { text: '📚 Tư vấn chuyên sâu, nghiên cứu, chia sẻ kiến thức', classId: 'sage' },
        ]
    },
    {
        question: 'Bạn làm việc hiệu quả nhất theo phong cách nào?',
        options: [
            { text: '🎵 Tự do sáng tạo, không bị ràng buộc quy trình', classId: 'creator' },
            { text: '🚀 Áp lực cao, mục tiêu rõ ràng, thấy kết quả ngay', classId: 'warrior' },
            { text: '📋 Có kế hoạch chi tiết, tracking số liệu thường xuyên', classId: 'merchant' },
            { text: '🔬 Đào sâu một vấn đề cho đến khi hiểu thấu đáo', classId: 'sage' },
        ]
    },
    {
        question: 'Nếu có 100 triệu nhàn rỗi, bạn sẽ làm gì đầu tiên?',
        options: [
            { text: '🖥️ Đầu tư vào bản thân: học, thiết bị, xây brand', classId: 'creator' },
            { text: '🏢 Mở rộng kinh doanh, tuyển người, chiếm thị phần', classId: 'warrior' },
            { text: '📈 Đầu tư sinh lời: cổ phiếu, bất động sản, thụ động', classId: 'merchant' },
            { text: '🎓 Học thêm chuyên môn sâu, nghiên cứu dài hạn', classId: 'sage' },
        ]
    },
    {
        question: 'Người xung quanh hay khen bạn điều gì nhất?',
        options: [
            { text: '✨ Sáng tạo, có gu, truyền cảm hứng tốt', classId: 'creator' },
            { text: '💪 Quyết đoán, bản lĩnh, không chịu bỏ cuộc', classId: 'warrior' },
            { text: '🧮 Tỉnh táo, nhạy bén với số, biết tính toán', classId: 'merchant' },
            { text: '🧠 Thông minh, hiểu sâu vấn đề, cho lời khuyên chất', classId: 'sage' },
        ]
    },
    {
        question: 'Mục tiêu lớn nhất trong 5 năm tới của bạn là gì?',
        options: [
            { text: '🌟 Xây dựng thương hiệu cá nhân, được biết đến rộng rãi', classId: 'creator' },
            { text: '🏆 Dẫn đầu thị trường, trở thành số 1 trong lĩnh vực', classId: 'warrior' },
            { text: '🏖️ Đạt tự do tài chính, có thu nhập thụ động ổn định', classId: 'merchant' },
            { text: '🎖️ Trở thành chuyên gia được kính trọng và tìm kiếm', classId: 'sage' },
        ]
    }
];

// Phase 2: Skills Definition
// Phase 2: Skills Definition
const SKILLS_DB = [
    // --- KỸ NĂNG CHUNG ---
    { id: 'deep_work', name: 'Tập Trung Sâu', icon: '🧠', requiredClass: null, description: 'Tăng 10% XP từ mọi nhiệm vụ.', cost: 1, type: 'passive', effect: { xp_mult: 0.1 }, lesson: 'Loại bỏ mọi thông báo trong 90 phút. Sức mạnh của bạn nằm ở sự tập trung không gián đoạn.' },
    { id: 'gold_magnet', name: 'Nam Châm Vàng', icon: '🧲', requiredClass: null, description: 'Tăng 10% VNĐ nhận được.', cost: 1, type: 'passive', effect: { gold_mult: 0.1 }, lesson: 'Tích lũy là gốc rễ của tài sản. Hãy trích ít nhất 10% thu nhập vào quỹ đầu tư trước khi tiêu xài.' },
    { id: 'consistency', name: 'Sự Kiên Trì', icon: '⏳', requiredClass: null, description: 'Nhận +5 mọi chỉ số ở Level 10.', cost: 2, type: 'stat_bonus', effect: { level_req: 10, value: 5 }, lesson: 'Kỉ luật nhỏ hằng ngày tạo nên kết quả khổng lồ sau 1 năm. Đừng bao giờ bỏ lỡ ngày thứ hai.' },
    { id: 'jack_of_all', name: 'Đa Di Năng', icon: '🛠️', requiredClass: null, description: 'Tăng vĩnh viễn +1 mọi chỉ số.', cost: 3, type: 'stat_all', effect: { value: 1 }, lesson: 'Hiểu biết đa ngành giúp bạn kết nối các ý tưởng độc đáo mà những người chuyên môn hẹp không thấy được.' },
    { id: 'time_aura', name: 'Thời Khắc Vàng', icon: '⏳', requiredClass: null, description: 'Giảm 5% XP yêu cầu để thăng cấp.', cost: 2, type: 'passive', effect: { xp_req_reduction: 0.05 }, lesson: 'Thời gian là tài sản công bằng nhất. Hãy quản lý nó thay vì để nó quản lý bạn.' },
    { id: 'networking_vibe', name: 'Rung Động Mạng Lưới', icon: '🤝', requiredClass: null, description: 'Tăng vĩnh viễn +2 T2 và +2 T3.', cost: 2, type: 'stat_multi', effect: { t2: 2, t3: 2 }, lesson: 'Giá trị của bạn nằm ở những mối quan hệ bạn xây dựng. Hãy kết nối bằng sự chân thành.' },

    // --- KỸ NĂNG CREATOR ---
    { id: 'influence_1', name: 'Sức Hút Viral', icon: '✨', requiredClass: 'creator', description: 'Tăng vĩnh viễn +3 chỉ số T3.', cost: 1, type: 'stat', effect: { stat: 't3', value: 3 }, lesson: 'Sự thu hút không đến từ vẻ ngoài, nó đến từ giá trị thực sự bạn mang lại cho cộng đồng.' },
    { id: 'content_master', name: 'Bậc Thầy Nội Dung', icon: '✍️', requiredClass: 'creator', description: 'Tăng 20% XP từ nhiệm vụ sáng tạo.', cost: 2, type: 'passive', effect: { xp_mult: 0.2 }, lesson: 'Content is King. Hãy kể những câu chuyện chạm đến cảm xúc, đó là cách nhanh nhất để xây dựng đế chế.' },
    { id: 'community_aura', name: 'Hào Quang Cộng Đồng', icon: '🌟', requiredClass: 'creator', description: 'Tăng vĩnh viễn +5 chỉ số T2.', cost: 3, type: 'stat', effect: { stat: 't2', value: 5 }, lesson: 'Cộng đồng là tài sản lớn nhất. Hãy bảo vệ và nuôi dưỡng nó như hơi thở của mình.' },
    { id: 'storyteller', name: 'Người Kể Chuyện', icon: '📖', requiredClass: 'creator', description: 'Tăng vĩnh viễn +4 chỉ số T3.', cost: 2, type: 'stat', effect: { stat: 't3', value: 4 }, lesson: 'Dữ liệu làm người ta nhớ, nhưng câu chuyện mới làm người ta tin. Hãy là một người kể chuyện vĩ đại.' },
    { id: 'personal_brand', name: 'Thương Hiệu Cá Nhân', icon: '🆔', requiredClass: 'creator', description: 'Tăng vĩnh viễn +8 chỉ số T3.', cost: 3, type: 'stat', effect: { stat: 't3', value: 8 }, lesson: 'Tên của bạn là tài sản quý giá nhất. Hãy xây dựng nó bằng sự uy tín và nhất quán.' },
    { id: 'viral_mastery', name: 'Ma Thuật Viral', icon: '🪄', requiredClass: 'creator', description: 'X2 XP từ các nhiệm vụ có độ khó A.', cost: 4, type: 'passive', effect: { high_diff_bonus_mult: 2 }, lesson: 'Sự lan tỏa không phải là ngẫu nhiên, nó là sự kết hợp giữa tâm lý học và thời điểm hoàn hảo.' },

    // --- KỸ NĂNG WARRIOR ---
    { id: 'grit_1', name: 'Kỷ Luật Thép', icon: '💪', requiredClass: 'warrior', description: 'Tăng vĩnh viễn +3 chỉ số T1.', cost: 1, type: 'stat', effect: { stat: 't1', value: 3 }, lesson: 'Thành công là cuộc chiến bền bỉ. Người thắng cuộc không phải là người nhanh nhất, mà là người cuối cùng còn trụ vững.' },
    { id: 'battle_focus', name: 'Trọng Tâm Chiến Đấu', icon: '🎯', requiredClass: 'warrior', description: 'Nhiệm vụ A/S tặng thêm 50 XP.', cost: 2, type: 'passive', effect: { high_diff_bonus: 50 }, lesson: 'Nguyên lý 80/20: 20% nhiệm vụ quan trọng mang lại 80% kết quả. Hãy tập trung vào những "cuộc chiến" đáng tiền.' },
    { id: 'unstoppable', name: 'Không Thể Cản Phá', icon: '🔥', requiredClass: 'warrior', description: 'Tăng vĩnh viễn +5 chỉ số T3.', cost: 3, type: 'stat', effect: { stat: 't3', value: 5 }, lesson: 'Năng lượng là thứ có thể lây lan. Khi bạn quyết tâm, cả thế giới sẽ nhường đường cho bạn.' },
    { id: 'leader_voice', name: 'Tiếng Nói Lãnh Đạo', icon: '🗣️', requiredClass: 'warrior', description: 'Tăng vĩnh viễn +4 chỉ số T2.', cost: 2, type: 'stat', effect: { stat: 't2', value: 4 }, lesson: 'Lãnh đạo không phải là ra lệnh, lãnh đạo là làm gương và truyền cảm hứng cho người khác.' },
    { id: 'strategic_mind', name: 'Tư Duy Chiến Lược', icon: '🗺️', requiredClass: 'warrior', description: 'Tăng vĩnh viễn +8 chỉ số T1.', cost: 3, type: 'stat', effect: { stat: 't1', value: 8 }, lesson: 'Chiến thuật là làm đúng việc, chiến lược là làm việc đúng. Hãy luôn nhìn xa trông rộng.' },
    { id: 'unshakable', name: 'Vững Như Bàn Thạch', icon: '🛡️', requiredClass: 'warrior', description: 'Tăng vĩnh viễn +15 chỉ số T1.', cost: 4, type: 'stat', effect: { stat: 't1', value: 15 }, lesson: 'Sự kiên định là chìa khóa của mọi thành tựu. Hãy mạnh mẽ trước mọi bão giông của cuộc đời.' },

    // --- KỸ NĂNG MERCHANT ---
    { id: 'trade_1', name: 'Đánh Hơi Cơ Hội', icon: '📈', requiredClass: 'merchant', description: 'Tăng vĩnh viễn +3 chỉ số T2.', cost: 1, type: 'stat', effect: { stat: 't2', value: 3 }, lesson: 'Cơ hội luôn ẩn mình dưới dạng khó khăn. Hãy rèn luyện đôi mắt để nhìn thấy giá trị nơi người khác bỏ qua.' },
    { id: 'compound_interest', name: 'Lãi Suất Kép', icon: '⏳', requiredClass: 'merchant', description: 'Tăng 15% VNĐ nhận được.', cost: 2, type: 'passive', effect: { gold_mult: 0.15 }, lesson: 'Lãi suất kép là kỳ quan thứ 8. Hãy tái đầu tư lợi nhuận để dòng tiền tự vận hành thay vì tiêu xài.' },
    { id: 'empire_builder', name: 'Xây Dựng Đế Chế', icon: '🏰', requiredClass: 'merchant', description: 'Tăng vĩnh viễn +5 chỉ số T1.', cost: 3, type: 'stat', effect: { stat: 't1', value: 5 }, lesson: 'Kinh doanh không phải là buôn bán, đó là xây dựng một hệ thống có thể tự vận hành khi bạn vắng mặt.' },
    { id: 'negotiator', name: 'Nhà Đàm Phán', icon: '🤝', requiredClass: 'merchant', description: 'Tăng vĩnh viễn +4 chỉ số T2.', cost: 2, type: 'stat', effect: { stat: 't2', value: 4 }, lesson: 'Đàm phán là nghệ thuật tạo ra sự đồng thuận mà đôi bên đều cảm thấy mình là người thắng cuộc.' },
    { id: 'investment_genius', name: 'Thiên Tài Đầu Tư', icon: '💎', requiredClass: 'merchant', description: 'Tăng vĩnh viễn +8 chỉ số T2.', cost: 3, type: 'stat', effect: { stat: 't2', value: 8 }, lesson: 'Đừng làm việc vì tiền, hãy để tiền làm việc cho bạn qua những quyết định đầu tư thông minh.' },
    { id: 'system_lord', name: 'Chủ Nhân Hệ Thống', icon: '⚙️', requiredClass: 'merchant', description: 'Tự động nhận 50.000 VNĐ mỗi khi thăng cấp.', cost: 4, type: 'passive', effect: { level_up_gold: 50000 }, lesson: 'Hệ thống là thứ giúp bạn kiếm tiền ngay cả khi bạn đang ngủ. Hãy ưu tiên xây dựng nó.' },

    // --- KỸ NĂNG SAGE ---
    { id: 'insight_1', name: 'Tư Duy Sâu', icon: '🧠', requiredClass: 'sage', description: 'Tăng vĩnh viễn +3 chỉ số T1.', cost: 1, type: 'stat', effect: { stat: 't1', value: 3 }, lesson: 'Suy nghĩ là lao động khó khăn nhất, đó là lý do tại sao rất ít người làm việc đó.' },
    { id: 'wisdom_seeker', name: 'Kẻ Tìm Kiếm Sự Thật', icon: '📜', requiredClass: 'sage', description: 'Thêm 5 XP cho mỗi Quest.', cost: 2, type: 'passive', effect: { flat_xp_bonus: 5 }, lesson: 'Học tập không bao giờ kết thúc. Mỗi nhiệm vụ là một bài học, mỗi sai lầm là một người thầy.' },
    { id: 'philosopher_mind', name: 'Tâm Thế Triết Gia', icon: '🏔️', requiredClass: 'sage', description: 'Tăng vĩnh viễn +5 chỉ số T2.', cost: 3, type: 'stat', effect: { stat: 't2', value: 5 }, lesson: 'Sự bình tĩnh trong tâm hồn là chìa khóa của trí tuệ. Đừng để cảm xúc điều khiển các quyết định quan trọng.' },
    { id: 'mentor', name: 'Người Hướng Dẫn', icon: '🎓', requiredClass: 'sage', description: 'Tăng vĩnh viễn +4 chỉ số T2.', cost: 2, type: 'stat', effect: { stat: 't2', value: 4 }, lesson: 'Cho đi là còn mãi. Khi bạn giúp người khác thành công, bạn cũng đang tự giúp mình vươn tới tầm cao mới.' },
    { id: 'master_learner', name: 'Bậc Thầy Tự Học', icon: '📘', requiredClass: 'sage', description: 'Tăng vĩnh viễn +8 chỉ số T1.', cost: 3, type: 'stat', effect: { stat: 't1', value: 8 }, lesson: 'Khả năng tự học là kỹ năng quan trọng nhất trong thế kỷ 21. Hãy luôn duy trì sự tò mò của bạn.' },
    { id: 'deep_insight', name: 'Tuệ Nhãn', icon: '👁️', requiredClass: 'sage', description: 'Thêm 20 XP cho mỗi kỹ năng đã MASTERED.', cost: 4, type: 'passive', effect: { mastered_skill_bonus: 20 }, lesson: 'Trí tuệ thực sự đến từ việc kết nối các điểm tri thức rời rạc thành một bức tranh toàn cảnh.' },

    // --- KỸ NĂNG ĐẶC BIỆT ---
    { id: 'momentum', name: 'Đà Thăng Tiến', icon: '🔥', requiredClass: null, description: 'Streak 7 ngày: +20% XP.', cost: 2, type: 'passive', effect: { streak_req: 7, xp_mult: 0.2 }, lesson: 'Đà (Momentum) là thứ khó tạo nhất nhưng lại mạnh mẽ nhất. Một khi đã có đà, đừng bao giờ để nó dừng lại.' },
    { id: 'hyper_focus', name: 'Siêu Tập Trung', icon: '⚡', requiredClass: null, description: 'Streak 30 ngày: +10 mọi chỉ số.', cost: 4, type: 'stat_all', effect: { streak_req: 30, value: 10 }, lesson: 'Sự khác biệt giữa người thành công và kẻ thất bại là khả năng duy trì sự tập trung dài hạn vào một mục tiêu duy nhất.' },
    { id: 'zen_master', name: 'Bậc Thầy Tĩnh Tại', icon: '🧘', requiredClass: null, description: 'Streak 10 ngày: +5 mọi chỉ số và X1.5 XP.', cost: 5, type: 'passive', effect: { streak_req: 10, stat_all: 5, xp_mult: 0.5 }, lesson: 'Sự bình yên nội tại mang lại sức mạnh vĩ đại nhất. Hãy làm việc trong sự tĩnh lặng.' },
    { id: 'financial_freedom', name: 'Tự Do Tài Chính', icon: '🕊️', requiredClass: null, description: 'Tăng 50% VNĐ nhận được từ mọi nguồn.', cost: 5, type: 'passive', effect: { gold_mult: 0.5 }, lesson: 'Tự do không phải là làm những gì bạn muốn, mà là không phải làm những gì bạn không muốn.' }
];

// Phase 2: Achievements Definition
const ACHIEVEMENTS_DB = [
    { id: 'first_step', name: 'Bước Chân Đầu Tiên', icon: '👣', description: 'Hoàn thành nhiệm vụ đầu tiên.', criteria: (state) => state.quests.some(q => q.completed) },
    { id: 'wealthy_1', name: 'Mầm Non Triệu Phú', icon: '🌱', description: 'Tích lũy 10.000.000 VNĐ.', criteria: (state) => state.character.gold >= 10000000 },
    { id: 'wealthy_2', name: 'Nhà Khởi Nghiệp Bản Lĩnh', icon: '🚀', description: 'Tích lũy 100.000.000 VNĐ.', criteria: (state) => state.character.gold >= 100000000 },
    { id: 'wealthy_3', name: 'Cỗ Máy In Tiền Tự Động', icon: '⚙️', description: 'Tích lũy 500.000.000 VNĐ.', criteria: (state) => state.character.gold >= 500000000 },
    { id: 'wealthy_freedom', name: 'BẬC THẦY TỰ DO TÀI CHÍNH', icon: '👑', description: 'Cột mốc Legend: 1 TỶ VNĐ.', criteria: (state) => state.character.gold >= 1000000000 },
    { id: 'streak_master', name: 'Kỷ Luật Thép', icon: '🔥', description: 'Duy trì chuỗi 7 ngày hoạt động.', criteria: (state) => state.character.streak >= 7 },
    { id: 'discipline_diamond', name: 'Kỷ Luật Kim Cương', icon: '💎', description: 'Đạt chuỗi 30 ngày kỷ luật.', criteria: (state) => state.character.streak >= 30 },
    
    // Level Milestones
    { id: 'lvl_10', name: 'Người Sẵn Sàng', icon: '🎖️', description: 'Đạt cấp độ 10.', criteria: (state) => state.character.level >= 10 },
    { id: 'lvl_50', name: 'Chiến Binh Thực Thụ', icon: '🛡️', description: 'Đạt cấp độ 50.', criteria: (state) => state.character.level >= 50 },
    { id: 'lvl_100', name: 'Huyền Thoại!', icon: '👑', description: 'Đạt cấp độ 100.', criteria: (state) => state.character.level >= 100 },
    
    // 4T Specialization
    { id: 'perfect_balance', name: 'Sự Cân Bằng Hoàn Hảo', icon: '⚖️', description: 'Tất cả T1, T2, T3 đều đạt mốc 10+.', criteria: (state) => (state.character.stats.t1 >= 10 && state.character.stats.t2 >= 10 && state.character.stats.t3 >= 10) },
    { id: 'stat_expert', name: 'Chuyên Gia Lĩnh Vực', icon: '🚩', description: 'Một chỉ số đạt mốc 50+.', criteria: (state) => (state.character.stats.t1 >= 50 || state.character.stats.t2 >= 50 || state.character.stats.t3 >= 50) },
    
    // Skills & Mastery
    { id: 'skill_collector', name: 'Học Giả Ham Học', icon: '📚', description: 'Mở khóa 10 kỹ năng khác nhau.', criteria: (state) => state.skills.length >= 10 },
    
    // Power Score
    { id: 'power_1k', name: 'Sức Mạnh Vượt Trội', icon: '⚡', description: 'Power Score đạt mốc 1.000.', criteria: (state) => ENGINE.calculatePowerScore() >= 1000 },
    { id: 'power_10k', name: 'Vị Thế Độc Tôn', icon: '🌌', description: 'Power Score đạt mốc 10.000.', criteria: (state) => ENGINE.calculatePowerScore() >= 10000 },

    // --- ADVANCED BEHAVIORAL ACHIEVEMENTS ---
    { 
        id: 'strategic_investor', 
        name: 'Nhà Đầu Tư Chiến Lược', 
        icon: '🐋', 
        description: 'Tổng số tiền tái đầu tư tích lũy đạt 100.000.000 VNĐ.', 
        criteria: (state) => (state.history.gold || []).reduce((sum, e) => e.note?.includes('Reinvest') ? sum + Math.abs(e.amount) : sum, 0) >= 100000000 
    },
    { 
        id: 'pioneer', 
        name: 'Người Tiên Phong', 
        icon: '🌊', 
        description: 'Thực hiện lần tái đầu tư đầu tiên.', 
        criteria: (state) => (state.history.gold || []).some(e => e.note?.includes('Reinvest')) 
    },
    { 
        id: 'income_streamer', 
        name: 'Dòng Tiền Đa Dạng', 
        icon: '🏢', 
        description: 'Có ít nhất 3 nguồn thu nhập khác nhau.', 
        criteria: (state) => new Set(state.income.map(i => i.source)).size >= 3 
    },
    { 
        id: 'big_loot', 
        name: 'Vụ Làm Ăn Lớn', 
        icon: '💰', 
        description: 'Ghi nhận một khoản Loot đơn lẻ trị giá trên 50.000.000 VNĐ.', 
        criteria: (state) => state.income.some(i => i.amount >= 50000000) 
    },
    { 
        id: 'peak_performance', 
        name: 'Đỉnh Cao Năng Suất', 
        icon: '🚅', 
        description: 'Kiếm được 1.000 XP trong một ngày duy nhất.', 
        criteria: (state) => {
            const today = new Date().toLocaleDateString('en-CA');
            return (state.history.xp || []).filter(e => e.date === today).reduce((sum, e) => sum + e.amount, 0) >= 1000;
        }
    },
    { 
        id: 'quest_overload', 
        name: 'Cỗ Máy Công Việc', 
        icon: '⚙️', 
        description: 'Duy trì cùng lúc 10 nhiệm vụ trong danh sách.', 
        criteria: (state) => state.quests.length >= 10 
    },
    { 
        id: 'all_rounder', 
        name: 'Người Đa Tài', 
        icon: '🌟', 
        description: 'Tất cả chỉ số T1, T2, T3 đều đạt mốc 25+.', 
        criteria: (state) => (state.character.stats.t1 >= 25 && state.character.stats.t2 >= 25 && state.character.stats.t3 >= 25) 
    },
    { 
        id: 'the_face', 
        name: 'Gương Mặt Thương Hiệu', 
        icon: '📢', 
        description: 'Tiếng tăm (T3) đạt mốc 75+ và vượt trên tổng Tài năng & Tín nhiệm.', 
        criteria: (state) => state.character.stats.t3 >= 75 && state.character.stats.t3 > (state.character.stats.t1 + state.character.stats.t2) 
    }
];

// Phase 2: Ranks for Journey Map
const RANKS = [
    { level: 1, name: 'Tập sự' },
    { level: 10, name: 'Thành thạo' },
    { level: 25, name: 'Chuyên gia' },
    { level: 50, name: 'Bậc thầy' },
    { level: 75, name: 'Đại sư' },
    { level: 100, name: 'Huyền thoại' }
];

// --- CENTRALIZED CONTENT CONFIG ---
// Bạn có thể chỉnh sửa toàn bộ văn bản của Game tại đây
const GAME_TEXT = {
    welcome: {
        title: "Chào mừng đến với <br><span style='color:var(--accent)'>LIFE GAME</span>",
        subtitle: "Nơi biến mọi nỗ lực hằng ngày của bạn thành các chỉ số rực rỡ. Hãy sẵn sàng để chinh phục những đỉnh cao mới!",
        features: [
            { icon: "🎯", label: "LÊN KẾ HOẠCH" },
            { icon: "📈", label: "PHÁT TRIỂN 4T" },
            { icon: "💎", label: "TÁI ĐẦU TƯ" },
            { icon: "👑", label: "XÂY HUYỀN THOẠI" }
        ],
        cta: "Bắt đầu ngay →"
    },
    homeGuide: {
        title: "🎮 CẨM NANG CHINH PHỤC LIFE GAME",
        items: [
            {
                title: "1. Triết lý 4T (Tài năng - Tín nhiệm - Tiếng tăm - Tài chính)",
                desc: "Cuộc đời bạn được vận hành bởi 4 bánh xe này. Bạn phát triển bản thân để tăng Tài năng, giữ lời hứa để tăng Tín nhiệm, truyền thông để có Tiếng tăm, và từ đó kiếm được Tài chính, rồi lại tiếp tục tái đầu tư phát triển 4T trong vòng lặp mới."
            },
            {
                title: "2. Nguyên lý Thùng gỗ (Cơ chế thăng cấp Rank)",
                desc: "Đẳng cấp (Rank) của bạn bị giới hạn bởi chỉ số thấp nhất trong 4T. <br>• <b>Cấp 10 (Thành thạo):</b> Khi tất cả chỉ số đạt 10+<br>• <b>Cấp 25 (Chuyên gia):</b> Khi tất cả chỉ số đạt 25+<br>• <b>Cấp 50 (Bậc thầy):</b> Khi tất cả chỉ số đạt 50+<br>• <b>Cấp 100 (Huyền thoại):</b> Khi tất cả chỉ số đạt 100+."
            },
            {
                title: "3. Vòng lặp Thành công",
                desc: "Hoàn thành Nhiệm vụ → Nhận XP & Vàng → Dùng Vàng để Tái đầu tư vào các chỉ số còn yếu → Thăng cấp và mở khóa Kỹ năng mới."
            }
        ],
        quote: "Biến công việc và cuộc sống thành một trò chơi, chơi cũng ra tiền, khiến cuộc sống nhẹ nhàng và thảnh thơi hơn."
    }
};

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
                nextRank = RANKS[i + 1] || null;
            }
        }
        return { currentRank, nextRank };
    },

    getRankInfoByStat: (statValue) => {
        let currentRank = RANKS[0];
        let nextRank = RANKS[1];

        for (let i = 0; i < RANKS.length; i++) {
            if (statValue >= RANKS[i].level) { // Sử dụng cùng ngưỡng level cho chỉ số
                currentRank = RANKS[i];
                nextRank = RANKS[i + 1] || null;
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
            try {
                const parsed = JSON.parse(data);
                Object.assign(GAME_STATE, parsed);
                return true;
            } catch (e) {
                console.error("Lỗi load dữ liệu:", e);
                return false;
            }
        }
        return false;
    },

    export: () => {
        const dataStr = JSON.stringify(GAME_STATE, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `life_game_backup_${new Date().toISOString().slice(0, 10)}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    },

    import: (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);
                if (json.character && json.quests) {
                    localStorage.setItem(PERSISTENCE.KEY, JSON.stringify(json));
                    window.location.reload();
                } else {
                    alert("File không hợp lệ!");
                }
            } catch (err) {
                alert("Lỗi đọc file!");
            }
        };
        reader.readAsText(file);
    },

    reset: () => {
        if (confirm('BẠN CÓ CHẮC CHẮN MUỐN RESET TOÀN BỘ? Hành động này không thể hoàn tác.')) {
            localStorage.removeItem(PERSISTENCE.KEY);
            window.location.reload();
        }
    }
};
