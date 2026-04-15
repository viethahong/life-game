// =============================================
// ONBOARDING FLOW (3 steps)
// =============================================
const ONBOARDING = {
    playerName: '',
    quizScores: { creator: 0, warrior: 0, merchant: 0, sage: 0 },
    currentQuestion: 0,

    start: () => {
        ONBOARDING.playerName = '';
        ONBOARDING.quizScores = { creator: 0, warrior: 0, merchant: 0, sage: 0 };
        ONBOARDING.currentQuestion = 0;
        ONBOARDING.renderStep('name');
    },

    renderStep: (step) => {
        const container = document.getElementById('onboarding-step-container');
        if (step === 'name') {
            container.innerHTML = COMPONENTS.renderNameStep();
            document.getElementById('player-name-input').focus();
        } else if (step === 'quiz') {
            const q = CHARACTER_QUIZ[ONBOARDING.currentQuestion];
            container.innerHTML = COMPONENTS.renderQuizStep(ONBOARDING.currentQuestion, q, CHARACTER_QUIZ.length);
        } else if (step === 'class') {
            const recommended = ONBOARDING.getRecommendedClass();
            container.innerHTML = COMPONENTS.renderClassSelect(CHARACTER_CLASSES, recommended);
        }
    },

    submitName: () => {
        const input = document.getElementById('player-name-input');
        const name = input ? input.value.trim() : '';
        if (!name) {
            input.style.borderColor = '#ef4444';
            return;
        }
        ONBOARDING.playerName = name;
        ONBOARDING.renderStep('quiz');
    },

    answerQuiz: (classId) => {
        ONBOARDING.quizScores[classId] = (ONBOARDING.quizScores[classId] || 0) + 1;
        ONBOARDING.currentQuestion++;
        if (ONBOARDING.currentQuestion >= CHARACTER_QUIZ.length) {
            ONBOARDING.renderStep('class');
        } else {
            ONBOARDING.renderStep('quiz');
        }
    },

    getRecommendedClass: () => {
        return Object.entries(ONBOARDING.quizScores)
            .sort((a, b) => b[1] - a[1])[0][0];
    },

    finalizeClass: (classId) => {
        const cls = CHARACTER_CLASSES.find(c => c.id === classId);
        const displayName = ONBOARDING.playerName || 'Hero';

        GAME_STATE.character = {
            name: displayName,
            classId: cls.id,
            className: cls.name,
            classIcon: cls.icon,
            level: 1,
            xp: 0,
            gold: 0,
            sp: 1,
            stats: { ...cls.baseStats }
        };
        GAME_STATE.history = { xp: [], gold: [] };
        GAME_STATE.skills = [];
        GAME_STATE.achievements = [];

        PERSISTENCE.save();
        UI_HANDLERS.showDashboard();
        UI_HANDLERS.showGuide();
    }
};

// =============================================
// MAIN APPLICATION ORCHESTRATOR
// =============================================
const UI_HANDLERS = {
    charts: { xp: null, radar: null },
    currentScreen: 'home',

    // Initial App Load
    init: () => {
        const hasData = PERSISTENCE.load();
        
        if (!hasData || !GAME_STATE.character) {
            UI_HANDLERS.showOnboarding();
        } else {
            UI_HANDLERS.showDashboard();
            if (!localStorage.getItem('LIFE_GAME_GUIDE_SEEN')) {
                UI_HANDLERS.showGuide();
                localStorage.setItem('LIFE_GAME_GUIDE_SEEN', 'true');
            }
        }
        
        UI_HANDLERS.setupBottomNav();
        UI_HANDLERS.setupGlobalEvents();
    },

    setupBottomNav: () => {
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.onclick = () => UI_HANDLERS.switchScreen(btn.dataset.screen);
        });
    },

    setupGlobalEvents: () => {
        document.getElementById('help-btn').onclick = UI_HANDLERS.showGuide;
        document.getElementById('add-quest-btn').onclick = UI_HANDLERS.addQuest;
        document.getElementById('add-income-btn').onclick = UI_HANDLERS.addIncome;
    },

    switchScreen: (screenId) => {
        UI_HANDLERS.currentScreen = screenId;
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.screen === screenId);
        });
        document.querySelectorAll('.screen').forEach(screen => screen.classList.add('hidden'));
        document.getElementById(`${screenId}-screen`).classList.remove('hidden');
        if (screenId === 'analytics') UI_HANDLERS.initCharts();
        UI_HANDLERS.updateUI();
    },

    showOnboarding: () => {
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        document.getElementById('onboarding').classList.remove('hidden');
        document.getElementById('bottom-nav').classList.add('hidden');
        ONBOARDING.start();
    },

    showDashboard: () => {
        document.getElementById('onboarding').classList.add('hidden');
        document.getElementById('bottom-nav').classList.remove('hidden');
        UI_HANDLERS.switchScreen('home');
    },

    showGuide: () => {
        COMPONENTS.showModal('CÁCH CHƠI LIFE GAME', COMPONENTS.renderGuide());
    },

    // Free class change (no cost) — user can revert class anytime
    changeClass: () => {
        const cardsHTML = CHARACTER_CLASSES.map(cls => `
            <div class="class-card ${GAME_STATE.character.classId === cls.id ? 'recommended' : ''}"
                 onclick="UI_HANDLERS.doChangeClass('${cls.id}')"
                 style="cursor:pointer">
                <span class="class-icon">${cls.icon}</span>
                <h3>${cls.name}</h3>
                <p>${cls.description}</p>
            </div>
        `).join('');

        COMPONENTS.showModal('ĐỔI CLASS NHÂN VẬT', `
            <p style="color:var(--text-dim);margin-bottom:20px;font-size:0.9rem">
                Class hiện tại của bạn được đánh dấu. Level và Gold sẽ được giữ nguyên khi đổi.
            </p>
            <div class="class-selection-grid">${cardsHTML}</div>
        `);
    },

    doChangeClass: (classId) => {
        const cls = CHARACTER_CLASSES.find(c => c.id === classId);
        if (!cls || !GAME_STATE.character) return;
        GAME_STATE.character.classId = cls.id;
        GAME_STATE.character.className = cls.name;
        GAME_STATE.character.classIcon = cls.icon;
        GAME_STATE.character.stats = { ...cls.baseStats };
        PERSISTENCE.save();
        UI_HANDLERS.closeModal();
        UI_HANDLERS.updateUI();
    },

    updateUI: () => {
        const char = GAME_STATE.character;
        if (!char) return;

        // Permanent Nav Stats
        document.getElementById('nav-level-badge').textContent = `LVL ${char.level}`;
        document.getElementById('nav-gold-display').textContent = `${char.gold.toLocaleString()} Gold`;
        const xpRequired = PROGRESSION.getXPRequired(char.level);
        const xpPercent = (char.xp / xpRequired) * 100;
        document.getElementById('nav-xp-progress').style.width = `${xpPercent}%`;

        if (UI_HANDLERS.currentScreen === 'home') {
            document.getElementById('char-name').textContent = char.name;
            const rankInfo = PROGRESSION.getRankInfo(char.level);
            document.getElementById('char-class-title').textContent = `${char.classIcon || ''} ${char.className} • Level ${char.level} (${rankInfo.currentRank.name})`;
            document.querySelectorAll('.stat-card').forEach(card => {
                const statType = card.dataset.stat;
                const value = char.stats[statType] || 0;
                card.querySelector('.stat-value').textContent = value;
                card.querySelector('.stat-fill').style.width = `${Math.min(value * 2, 100)}%`;
            });
            COMPONENTS.renderJourneyMap(char.level);
        }

        if (UI_HANDLERS.currentScreen === 'quests') {
            COMPONENTS.renderQuests(GAME_STATE.quests, UI_HANDLERS.toggleQuest);
            COMPONENTS.renderIncome(GAME_STATE.income);
        }

        if (UI_HANDLERS.currentScreen === 'skills') {
            COMPONENTS.renderSkills(SKILLS_DB, GAME_STATE.skills, char.sp);
        }

        if (UI_HANDLERS.currentScreen === 'analytics') {
            COMPONENTS.renderAchievements(ACHIEVEMENTS_DB, GAME_STATE.achievements);
        }

        UI_HANDLERS.checkAchievements();
    },

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
            if (GAME_STATE.skills.includes('deep_work_1')) bonus += quest.xp * 0.1;
            if (GAME_STATE.skills.includes('flow_state') && quest.xp >= 100) bonus += 50;
            UI_HANDLERS.addXP(quest.xp + bonus);
        } else {
            UI_HANDLERS.addXP(-quest.xp);
        }
        PERSISTENCE.save();
        UI_HANDLERS.updateUI();
    },

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
                if (GAME_STATE.skills.includes('gold_magnet_1')) amount = Math.floor(amount * 1.05);
                GAME_STATE.income.push({ source, amount, timestamp: Date.now() });
                GAME_STATE.character.gold += amount;
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
        if (amount > 0) {
            const date = new Date().toISOString().split('T')[0];
            GAME_STATE.history.xp.push({ date, amount });
        }
        let xpRequired = PROGRESSION.getXPRequired(char.level);
        while (char.xp >= xpRequired) {
            char.xp -= xpRequired;
            char.level++;
            char.sp += 1;
            xpRequired = PROGRESSION.getXPRequired(char.level);
            Object.keys(char.stats).forEach(s => char.stats[s] += 1);
            UI_HANDLERS.showLevelUpToast(char.level);
        }
    },

    showLevelUpToast: (level) => {
        const toast = document.createElement('div');
        toast.className = 'level-up-toast';
        toast.innerHTML = `🎉 LEVEL UP! <strong>Level ${level}</strong> đạt được! +1 Skill Point`;
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    },

    unlockSkill: (skillId) => {
        const skill = SKILLS_DB.find(s => s.id === skillId);
        if (GAME_STATE.character.sp >= skill.cost && !GAME_STATE.skills.includes(skillId)) {
            GAME_STATE.character.sp -= skill.cost;
            GAME_STATE.skills.push(skillId);
            if (skill.type === 'stat') GAME_STATE.character.stats[skill.effect.stat] += skill.effect.value;
            PERSISTENCE.save();
            UI_HANDLERS.updateUI();
        }
    },

    checkAchievements: () => {
        ACHIEVEMENTS_DB.forEach(ach => {
            if (!GAME_STATE.achievements.includes(ach.id) && ach.criteria(GAME_STATE)) {
                GAME_STATE.achievements.push(ach.id);
                PERSISTENCE.save();
            }
        });
    },

    initCharts: () => {
        const char = GAME_STATE.character;
        if (!char) return;
        if (UI_HANDLERS.charts.xp) UI_HANDLERS.charts.xp.destroy();
        if (UI_HANDLERS.charts.radar) UI_HANDLERS.charts.radar.destroy();

        const xpCtx = document.getElementById('xp-chart').getContext('2d');
        UI_HANDLERS.charts.xp = new Chart(xpCtx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'XP Gained',
                    data: [12, 19, 3, 5, 2, 3, 0],
                    borderColor: '#4f46e5',
                    tension: 0.4,
                    fill: true,
                    backgroundColor: 'rgba(79, 70, 229, 0.1)'
                }]
            },
            options: { plugins: { legend: { display: false } }, scales: { y: { display: false }, x: { grid: { display: false } } } }
        });

        const radarCtx = document.getElementById('radar-chart').getContext('2d');
        UI_HANDLERS.charts.radar = new Chart(radarCtx, {
            type: 'radar',
            data: {
                labels: Object.keys(char.stats).map(s => s.toUpperCase()),
                datasets: [{
                    label: 'Stats',
                    data: Object.values(char.stats),
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

    resetGame: () => {
        if (confirm('Bạn có chắc chắn muốn XÓA TOÀN BỘ dữ liệu và bắt đầu lại từ đầu không?')) {
            localStorage.clear();
            window.location.reload();
        }
    },

    closeModal: () => {
        document.getElementById('modal-overlay').classList.add('hidden');
    }
};

// Boot
window.onload = UI_HANDLERS.init;


