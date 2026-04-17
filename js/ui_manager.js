/**
 * UI_MANAGER.js
 * Chứa logic hiển thị, cập nhật UI và tương tác Modal.
 */
const UI_MANAGER = {
    // Current Screen Tracking
    currentScreen: 'home',
    charts: { xp: null, radar: null },

    // --- SCREEN NAVIGATION ---
    switchScreen: (screenId) => {
        UI_MANAGER.currentScreen = screenId;
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.screen === screenId);
        });
        document.querySelectorAll('.screen').forEach(screen => screen.classList.add('hidden'));
        document.getElementById(`${screenId}-screen`).classList.remove('hidden');
        if (screenId === 'analytics') UI_MANAGER.initCharts();
        UI_MANAGER.updateUI();
    },

    // --- UI FEEDBACK ---
    showFloatingText: (text, x, y, color) => {
        const el = document.createElement('div');
        el.className = 'floating-feedback';
        el.textContent = text;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.style.color = color || 'white';
        document.body.appendChild(el);
        
        // Remove after animation completes
        setTimeout(() => el.remove(), 1000);
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
        UI_MANAGER.switchScreen('home');
    },

    // --- UI UPDATES ---
    updateUI: () => {
        const char = GAME_STATE.character;
        if (!char) return;

        // Nav Stats
        document.getElementById('nav-level-badge').textContent = `LVL ${char.level}`;
        document.getElementById('nav-streak-display').textContent = `🔥 ${char.streak || 0}`;
        document.getElementById('nav-gold-display').textContent = `${char.gold.toLocaleString('vi-VN')} VNĐ`;
        const xpRequired = PROGRESSION.getXPRequired(char.level);
        const xpPercent = (char.xp / xpRequired) * 100;
        document.getElementById('nav-xp-progress').style.width = `${xpPercent}%`;

        if (UI_MANAGER.currentScreen === 'home') {
            document.getElementById('char-name').textContent = char.name;
            
            // Luôn tính toán Rank mới nhất theo tiếng Việt dựa trên chỉ số thấp nhất (T1, T2, T3)
            const stats = [char.stats.t1 || 0, char.stats.t2 || 0, char.stats.t3 || 0];
            const lowestStat = Math.min(...stats);
            const effectiveLevelCap = Math.min(char.level, Math.floor(lowestStat));
            const rankInfo = PROGRESSION.getRankInfoByStat(effectiveLevelCap);
            const rankName = rankInfo.currentRank.name;
            
            document.getElementById('char-class-title').textContent = `${char.classIcon || ''} ${char.className} • Cấp độ ${char.level} • ${rankName}`;
            document.getElementById('rank-name').textContent = rankName;

            document.querySelectorAll('.stat-card').forEach(card => {
                const statType = card.dataset.stat;
                let value = 0;
                if (statType === 'ps') {
                    value = ENGINE.calculatePowerScore();
                } else if (statType === 't4') {
                    value = (char.gold || 0) / 1000000;
                } else {
                    value = char.stats[statType] || 0;
                }
                
                // Round to 1 decimal place
                const displayValue = typeof value === 'number' ? value.toFixed(1) : value;
                card.querySelector('.stat-value').textContent = displayValue.toString().endsWith('.0') ? Math.floor(value) : displayValue;
                
                if (statType !== 'ps') {
                    // Progress bar fill based on value
                    card.querySelector('.stat-fill').style.width = `${Math.min(value * 2, 100)}%`;
                }
            });
            COMPONENTS.renderJourneyMap(char.level);
            
            // Render Home Guide
            const guideContainer = document.getElementById('home-guide');
            if (guideContainer) {
                guideContainer.innerHTML = COMPONENTS.renderHomeGuide();
            }
        }

        if (UI_MANAGER.currentScreen === 'quests') {
            COMPONENTS.renderQuests(GAME_STATE.quests);
            COMPONENTS.renderIncome(GAME_STATE.income);
        }

        if (UI_MANAGER.currentScreen === 'skills') {
            COMPONENTS.renderSkills(SKILLS_DB, GAME_STATE.skills, char.sp, char.classId);
        }

        if (UI_MANAGER.currentScreen === 'analytics') {
            COMPONENTS.renderAchievements(ACHIEVEMENTS_DB, GAME_STATE.achievements);
        }
    },

    // --- FEEDBACK & NOTIFICATIONS ---
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

    showStatGainToast: (types, amount) => {
        const labels = { t1: 'T1', t2: 'T2', t3: 'T3' };
        const isLoss = amount < 0;
        const absAmount = Math.abs(amount).toFixed(1);
        const prefix = isLoss ? '-' : '+';
        const msg = (Array.isArray(types) ? types : [types])
            .map(t => `${prefix}${absAmount} ${labels[t] || t.toUpperCase()}`)
            .join(' | ');

        const toast = document.createElement('div');
        toast.className = 'stat-toast';
        const bgColor = isLoss ? 'rgba(239, 68, 68, 0.9)' : 'rgba(16,185,129,0.9)';
        toast.style.cssText = `position:fixed; bottom:100px; left:50%; transform:translateX(-50%); background:${bgColor}; color:white; padding:8px 16px; border-radius:100px; font-size:12px; z-index:10000; transition: opacity 0.3s; pointer-events:none; font-weight:600;`;
        toast.innerHTML = msg;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    },

    showAnnouncement: (msg) => {
        const modalBody = `
            <div style="text-align:center; padding: 20px;">
                <span style="font-size: 3rem;">🏅</span>
                <h3 style="margin-top: 10px; color: var(--accent);">${msg}</h3>
                <p style="margin-top: 10px; color: var(--text-dim);">Tiếp tục duy trì kỉ luật và 4T cân bằng để vươn xa hơn nữa!</p>
            </div>
        `;
        COMPONENTS.showModal('THIẾT LẬP CỘT MỐC MỚI', modalBody);
    },

    // --- CHART INITIALIZATION ---
    initCharts: () => {
        if (UI_MANAGER.charts.xp) UI_MANAGER.charts.xp.destroy();
        if (UI_MANAGER.charts.radar) UI_MANAGER.charts.radar.destroy();

        // 1. Line Chart for XP
        const xpCtx = document.getElementById('xp-chart').getContext('2d');
        const chartData = API_LAYERS.getChartXPData(7);
        UI_MANAGER.charts.xp = new Chart(xpCtx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'XP Gained',
                    data: chartData.data,
                    borderColor: '#4f46e5',
                    tension: 0.4,
                    fill: true,
                    backgroundColor: 'rgba(79, 70, 229, 0.1)'
                }]
            },
            options: { 
                plugins: { legend: { display: false } },
                scales: { 
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { grid: { display: false } }
                }
            }
        });

        // 2. Radar Chart for 4T Stats
        const radarCtx = document.getElementById('radar-chart').getContext('2d');
        const char = GAME_STATE.character;
        const t4Value = (char.gold / 1000000); // 1M VNĐ = 1 Point

        UI_MANAGER.charts.radar = new Chart(radarCtx, {
            type: 'radar',
            data: {
                labels: ['🧠 T1 (Tài năng)', '🤝 T2 (Tín nhiệm)', '📢 T3 (Tiếng tăm)'],
                datasets: [{
                    label: 'Năng lực cốt lõi',
                    data: [char.stats.t1 || 0, char.stats.t2 || 0, char.stats.t3 || 0],
                    backgroundColor: 'rgba(79, 70, 229, 0.2)',
                    borderColor: '#4f46e5',
                    pointBackgroundColor: '#4f46e5',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#4f46e5'
                }]
            },
            options: {
                elements: { line: { borderWidth: 3 } },
                scales: {
                    r: {
                        angleLines: { color: 'rgba(255,255,255,0.1)' },
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        pointLabels: { color: '#a1a1aa', font: { size: 10 } },
                        ticks: { display: false },
                        suggestedMin: 0
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    },

    showScreenHelp: (screen) => {
        let title = 'HƯỚNG DẪN';
        let html = '';
        if (screen === 'quests') {
            title = '📜 QUESTS & LOOT HELP';
            html = COMPONENTS.renderQuestsHelp();
        } else if (screen === 'skills') {
            title = '🧠 SKILLS & BUFFS HELP';
            html = COMPONENTS.renderSkillsHelp();
        } else if (screen === 'analytics') {
            title = '📊 PROGRESS HELP';
            html = COMPONENTS.renderAnalyticsHelp();
        } else {
            title = '🎮 CÁCH CHƠI LIFE GAME';
            html = COMPONENTS.renderGuide();
        }
        COMPONENTS.showModal(title, html);
    },

    closeModal: () => {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) overlay.classList.add('hidden');
        document.body.classList.remove('modal-open');
    }
};

// --- DATA ADAPTERS (Used by UI_MANAGER) ---
const API_LAYERS = {
    getChartXPData: (daysCount = 7) => {
        const labels = [];
        const data = [];
        const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const now = new Date();
        for (let i = daysCount - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            const isoDate = d.toLocaleDateString('en-CA');
            labels.push(daysOfWeek[d.getDay()]);
            const dayTotal = GAME_STATE.history.xp
                .filter(entry => entry.date === isoDate)
                .reduce((sum, entry) => sum + entry.amount, 0);
            data.push(dayTotal);
        }
        return { labels, data };
    }
};
