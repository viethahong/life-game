// Main Application Orchestrator
const UI_HANDLERS = {
    // Initial App Load
    init: () => {
        const hasData = PERSISTENCE.load();
        
        if (!hasData || !GAME_STATE.character) {
            UI_HANDLERS.showOnboarding();
        } else {
            UI_HANDLERS.showDashboard();
        }
    },

    showOnboarding: () => {
        document.getElementById('dashboard').classList.add('hidden');
        document.getElementById('onboarding').classList.remove('hidden');
        COMPONENTS.renderClassGrid(CHARACTER_CLASSES, UI_HANDLERS.selectClass);
    },

    selectClass: (cls) => {
        GAME_STATE.character = {
            name: cls.name + ' Initiate',
            classId: cls.id,
            className: cls.name,
            level: 1,
            xp: 0,
            gold: 0,
            stats: { ...cls.baseStats }
        };
        PERSISTENCE.save();
        UI_HANDLERS.showDashboard();
    },

    showDashboard: () => {
        document.getElementById('onboarding').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        UI_HANDLERS.updateUI();
    },

    updateUI: () => {
        const char = GAME_STATE.character;
        if (!char) return;

        // Header info
        document.getElementById('char-name').textContent = char.name;
        document.getElementById('char-class-title').textContent = `${char.className} • Level ${char.level} (${PROGRESSION.getRankTitle(char.level)})`;
        
        // Nav stats
        document.getElementById('nav-level-badge').textContent = `LVL ${char.level}`;
        document.getElementById('nav-gold-display').textContent = `${char.gold.toLocaleString()} Gold`;
        
        // XP Progress
        const xpRequired = PROGRESSION.getXPRequired(char.level);
        const xpPercent = (char.xp / xpRequired) * 100;
        document.getElementById('nav-xp-progress').style.width = `${xpPercent}%`;

        // Stats
        document.querySelectorAll('.stat-card').forEach(card => {
            const statType = card.dataset.stat;
            const value = char.stats[statType] || 0;
            card.querySelector('.stat-value').textContent = value;
            card.querySelector('.stat-fill').style.width = `${Math.min(value * 2, 100)}%`;
        });

        // Lists
        COMPONENTS.renderQuests(GAME_STATE.quests, UI_HANDLERS.toggleQuest);
        COMPONENTS.renderIncome(GAME_STATE.income);
    },

    // Quest Logic
    addQuest: () => {
        const html = `
            <div class="form-group">
                <label>Tên nhiệm vụ</label>
                <input type="text" id="q-title" placeholder="VD: Gửi 5 email khách hàng..." class="premium-input">
            </div>
            <div class="form-group">
                <label>Độ khó (E-S)</label>
                <select id="q-diff" class="premium-select">
                    <option value="10">E - Dễ (10 XP)</option>
                    <option value="25" selected>C - Thường (25 XP)</option>
                    <option value="50">B - Khó (50 XP)</option>
                    <option value="100">A - Rất Khó (100 XP)</option>
                    <option value="250">S - Epic (250 XP)</option>
                </select>
            </div>
        `;

        COMPONENTS.showModal('THÊM NHIỆM VỤ', html, () => {
            const title = document.getElementById('q-title').value;
            const xp = parseInt(document.getElementById('q-diff').value);
            
            if (title) {
                GAME_STATE.quests.push({ title, xp, completed: false, created: Date.now() });
                PERSISTENCE.save();
                UI_HANDLERS.updateUI();
                UI_HANDLERS.closeModal();
            }
        });
    },

    toggleQuest: (index) => {
        const quest = GAME_STATE.quests[index];
        quest.completed = !quest.completed;
        
        if (quest.completed) {
            UI_HANDLERS.addXP(quest.xp);
        } else {
            UI_HANDLERS.addXP(-quest.xp);
        }
        
        PERSISTENCE.save();
        UI_HANDLERS.updateUI();
    },

    // Income Logic
    addIncome: () => {
        const html = `
            <div class="form-group">
                <label>Nguồn thu (Loot source)</label>
                <input type="text" id="i-source" placeholder="VD: Dự án A, Bán hàng..." class="premium-input">
            </div>
            <div class="form-group">
                <label>Số vàng (Gold)</label>
                <input type="number" id="i-amount" placeholder="Số tiền kiếm được..." class="premium-input">
            </div>
        `;

        COMPONENTS.showModal('GHI NHẬN LOOT', html, () => {
            const source = document.getElementById('i-source').value;
            const amount = parseInt(document.getElementById('i-amount').value);
            
            if (source && amount) {
                GAME_STATE.income.push({ source, amount, timestamp: Date.now() });
                GAME_STATE.character.gold += amount;
                
                // Bonus XP for earning money (1 XP for every 1000 gold, min 5)
                const bonusXP = Math.max(5, Math.floor(amount / 1000));
                UI_HANDLERS.addXP(bonusXP);
                
                PERSISTENCE.save();
                UI_HANDLERS.updateUI();
                UI_HANDLERS.closeModal();
            }
        });
    },

    addXP: (amount) => {
        const char = GAME_STATE.character;
        char.xp += amount;
        if (char.xp < 0) char.xp = 0;

        let xpRequired = PROGRESSION.getXPRequired(char.level);
        
        // Level up loop
        while (char.xp >= xpRequired) {
            char.xp -= xpRequired;
            char.level++;
            xpRequired = PROGRESSION.getXPRequired(char.level);
            
            // Stats gain on level up
            Object.keys(char.stats).forEach(s => char.stats[s] += 1);
            
            alert(`🎉 CHÚC MỪNG! Bạn đã đạt Cấp độ ${char.level}!`);
        }
    },

    closeModal: () => {
        document.getElementById('modal-overlay').classList.add('hidden');
    }
};

// Event Listeners
document.getElementById('add-quest-btn').onclick = UI_HANDLERS.addQuest;
document.getElementById('add-income-btn').onclick = UI_HANDLERS.addIncome;

// Boot
window.onload = UI_HANDLERS.init;
