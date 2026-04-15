// Main Application Orchestrator
const UI_HANDLERS = {
    charts: { xp: null, radar: null },

    // Initial App Load
    init: () => {
        const hasData = PERSISTENCE.load();
        
        if (!hasData || !GAME_STATE.character) {
            UI_HANDLERS.showOnboarding();
        } else {
            UI_HANDLERS.showDashboard();
        }
        
        UI_HANDLERS.setupTabs();
    },

    setupTabs: () => {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.tab-btn, .tab-pane').forEach(el => el.classList.remove('active'));
                btn.classList.add('active');
                const tabId = btn.dataset.tab + '-tab';
                document.getElementById(tabId).classList.add('active');
                
                if (btn.dataset.tab === 'analytics') {
                    UI_HANDLERS.initCharts();
                }
            };
        });
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
            sp: 1, // Start with 1 Skill Point
            stats: { ...cls.baseStats }
        };
        GAME_STATE.history = { xp: [], gold: [] };
        GAME_STATE.skills = [];
        GAME_STATE.achievements = [];
        
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
        const rankInfo = PROGRESSION.getRankInfo(char.level);
        document.getElementById('char-class-title').textContent = `${char.className} • Level ${char.level} (${rankInfo.currentRank.name})`;
        
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

        // Phase 2: Renders
        COMPONENTS.renderQuests(GAME_STATE.quests, UI_HANDLERS.toggleQuest);
        COMPONENTS.renderIncome(GAME_STATE.income);
        COMPONENTS.renderJourneyMap(char.level);
        COMPONENTS.renderSkills(SKILLS_DB, GAME_STATE.skills, char.sp);
        COMPONENTS.renderAchievements(ACHIEVEMENTS_DB, GAME_STATE.achievements);
        
        // Check for new achievements
        UI_HANDLERS.checkAchievements();
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
            let bonus = 0;
            // Apply skill buffs
            if (GAME_STATE.skills.includes('deep_work_1')) bonus += quest.xp * 0.1;
            if (GAME_STATE.skills.includes('flow_state') && quest.xp >= 100) bonus += 50;
            
            UI_HANDLERS.addXP(quest.xp + bonus);
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
            let amount = parseInt(document.getElementById('i-amount').value);
            
            if (source && amount) {
                // Skill buff: Gold Magnet
                if (GAME_STATE.skills.includes('gold_magnet_1')) {
                    amount = Math.floor(amount * 1.05);
                }

                GAME_STATE.income.push({ source, amount, timestamp: Date.now() });
                GAME_STATE.character.gold += amount;
                
                // Record history
                const date = new Date().toISOString().split('T')[0];
                GAME_STATE.history.gold.push({ date, amount });
                
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

        // Record history
        if (amount > 0) {
            const date = new Date().toISOString().split('T')[0];
            GAME_STATE.history.xp.push({ date, amount });
        }

        let xpRequired = PROGRESSION.getXPRequired(char.level);
        
        while (char.xp >= xpRequired) {
            char.xp -= xpRequired;
            char.level++;
            char.sp += 1; // Gain 1 Skill Point on level up
            xpRequired = PROGRESSION.getXPRequired(char.level);
            
            Object.keys(char.stats).forEach(s => char.stats[s] += 1);
            alert(`🎉 LEVEL UP! Bạn đã đạt Cấp độ ${char.level}. Nhận thêm 1 Skill Point!`);
        }
    },

    unlockSkill: (skillId) => {
        const skill = SKILLS_DB.find(s => s.id === skillId);
        if (GAME_STATE.character.sp >= skill.cost && !GAME_STATE.skills.includes(skillId)) {
            GAME_STATE.character.sp -= skill.cost;
            GAME_STATE.skills.push(skillId);
            
            // Apply immediate stat effects
            if (skill.type === 'stat') {
                GAME_STATE.character.stats[skill.effect.stat] += skill.effect.value;
            }
            
            PERSISTENCE.save();
            UI_HANDLERS.updateUI();
        }
    },

    checkAchievements: () => {
        ACHIEVEMENTS_DB.forEach(ach => {
            if (!GAME_STATE.achievements.includes(ach.id) && ach.criteria(GAME_STATE)) {
                GAME_STATE.achievements.push(ach.id);
                // Notification for new achievement could go here
                PERSISTENCE.save();
            }
        });
    },

    initCharts: () => {
        const char = GAME_STATE.character;
        if (!char) return;

        // Destroy old charts to clean re-render
        if (UI_HANDLERS.charts.xp) UI_HANDLERS.charts.xp.destroy();
        if (UI_HANDLERS.charts.radar) UI_HANDLERS.charts.radar.destroy();

        // XP Chart (Mocking last 7 days or real history)
        const xpCtx = document.getElementById('xp-chart').getContext('2d');
        UI_HANDLERS.charts.xp = new Chart(xpCtx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'XP Gained',
                    data: [12, 19, 3, 5, 2, 3, 0], // Sample data, real would be grouped from history
                    borderColor: '#4f46e5',
                    tension: 0.4,
                    fill: true,
                    backgroundColor: 'rgba(79, 70, 229, 0.1)'
                }]
            },
            options: { plugins: { legend: { display: false } }, scales: { y: { display: false }, x: { grid: { display: false } } } }
        });

        // Radar Chart for Stats
        const radarCtx = document.getElementById('radar-chart').getContext('2d');
        const statLabels = Object.keys(char.stats).map(s => s.toUpperCase());
        const statData = Object.values(char.stats);

        UI_HANDLERS.charts.radar = new Chart(radarCtx, {
            type: 'radar',
            data: {
                labels: statLabels,
                datasets: [{
                    label: 'Stats',
                    data: statData,
                    backgroundColor: 'rgba(79, 70, 229, 0.2)',
                    borderColor: '#4f46e5',
                    pointBackgroundColor: '#4f46e5'
                }]
            },
            options: { 
                plugins: { legend: { display: false } },
                scales: { 
                    r: { 
                        angleLines: { color: 'rgba(255,255,255,0.05)' },
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        pointLabels: { color: '#a1a1aa' },
                        ticks: { display: false }
                    } 
                } 
            }
        });
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
