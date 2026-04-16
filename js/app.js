// =============================================
// ONBOARDING FLOW
// =============================================
const ONBOARDING = {
    playerName: '',
    quizScores: { creator: 0, warrior: 0, merchant: 0, sage: 0 },
    currentQuestion: 0,
    answers: [],

    start: () => {
        ONBOARDING.playerName = '';
        ONBOARDING.quizScores = { creator: 0, warrior: 0, merchant: 0, sage: 0 };
        ONBOARDING.currentQuestion = 0;
        ONBOARDING.renderStep('welcome');
    },

    renderStep: (step) => {
        const container = document.getElementById('onboarding-step-container');
        if (step === 'welcome') {
            container.innerHTML = COMPONENTS.renderWelcomeStep();
        } else if (step === 'name') {
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
        if (!name) return;
        ONBOARDING.playerName = name;
        ONBOARDING.renderStep('quiz');
    },

    answerQuiz: (classId) => {
        ONBOARDING.quizScores[classId]++;
        ONBOARDING.answers.push(classId);
        ONBOARDING.currentQuestion++;
        if (ONBOARDING.currentQuestion >= CHARACTER_QUIZ.length) ONBOARDING.renderStep('class');
        else ONBOARDING.renderStep('quiz');
    },

    prevQuestion: () => {
        if (ONBOARDING.currentQuestion > 0) {
            const last = ONBOARDING.answers.pop();
            ONBOARDING.quizScores[last]--;
            ONBOARDING.currentQuestion--;
            ONBOARDING.renderStep('quiz');
        } else ONBOARDING.renderStep('name');
    },

    getRecommendedClass: () => Object.entries(ONBOARDING.quizScores).sort((a,b)=>b[1]-a[1])[0][0],

    finalizeClass: (classId) => {
        const cls = CHARACTER_CLASSES.find(c => c.id === classId);
        GAME_STATE.character = {
            name: ONBOARDING.playerName || 'Hero',
            classId: cls.id,
            className: cls.name,
            classIcon: cls.icon,
            level: 1,
            xp: 0,
            gold: 0,
            sp: 1,
            stats: { ...cls.baseStats },
            streak: 0,
            streakLastDay: '',
            rankName: 'Apprentice'
        };
        ENGINE.autoAssess();
        PERSISTENCE.save();
        UI_MANAGER.showDashboard();
    }
};

// =============================================
// MAIN UI HANDLERS (Bridge between UI and Engine)
// =============================================
const UI_HANDLERS = {
    init: () => {
        const hasData = PERSISTENCE.load();
        if (!hasData || !GAME_STATE.character) {
            UI_MANAGER.showOnboarding();
        } else {
            ENGINE.autoAssess(); // Đảm bảo Rank luôn là tiếng Việt mới nhất
            UI_MANAGER.showDashboard();
        }
        UI_HANDLERS.setupGlobalEvents();
        UI_MANAGER.updateUI();
        
        // Loader finish
        setTimeout(() => {
            const l = document.getElementById('app-loading-screen');
            if(l) { l.style.opacity = '0'; setTimeout(() => l.remove(), 500); }
        }, 500);

        // PWA Service Worker Registration
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW reg failed:', err));
            });
        }
    },

    setupGlobalEvents: () => {
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.onclick = () => UI_MANAGER.switchScreen(btn.dataset.screen);
        });
        document.getElementById('add-quest-btn').onclick = UI_HANDLERS.addQuest;
        document.getElementById('add-income-btn').onclick = UI_HANDLERS.addIncome;
        document.getElementById('reset-btn').onclick = PERSISTENCE.reset;
    },

    // Quests & Income
    toggleQuest: (index) => {
        const q = GAME_STATE.quests[index];
        q.completed = !q.completed;
        if (q.completed) {
            ENGINE.addXP(q.xp);
            const reward = (QUEST_CONFIG.REWARDS[q.difficulty] || 0.5) / q.types.length;
            q.types.forEach(t => GAME_STATE.character.stats[t] += reward);
            UI_MANAGER.showStatGainToast(q.types, reward);
        } else {
            ENGINE.addXP(-q.xp);
            const reward = (QUEST_CONFIG.REWARDS[q.difficulty] || 0.5) / q.types.length;
            q.types.forEach(t => GAME_STATE.character.stats[t] = Math.max(0, GAME_STATE.character.stats[t] - reward));
        }
        PERSISTENCE.save();
        UI_MANAGER.updateUI();
    },

    editQuest: (index) => {
        const q = GAME_STATE.quests[index];
        const html = `<div class="form-group"><label>Tên nhiệm vụ</label><input type="text" id="q-title" value="${q.title}" class="premium-input"></div>`;
        COMPONENTS.showModal('SỬA NHIỆM VỤ', html, () => {
            q.title = document.getElementById('q-title').value;
            PERSISTENCE.save();
            UI_MANAGER.updateUI();
            UI_MANAGER.closeModal();
        });
    },

    deleteQuest: (index) => {
        if(confirm('Xóa nhiệm vụ này?')) {
            GAME_STATE.quests.splice(index, 1);
            PERSISTENCE.save();
            UI_MANAGER.updateUI();
        }
    },

    deleteIncome: (index) => {
        if(confirm('Xóa thu nhập này?')) {
            const inc = GAME_STATE.income[index];
            GAME_STATE.character.gold -= inc.amount;
            GAME_STATE.income.splice(index, 1);
            PERSISTENCE.save();
            UI_MANAGER.updateUI();
        }
    },

    addIncome: () => {
        const html = `<div class="form-group"><label>Nguồn thu</label><input type="text" id="i-source" class="premium-input"></div>
                      <div class="form-group"><label>Số tiền (VNĐ)</label><input type="number" id="i-amount" class="premium-input"></div>`;
        COMPONENTS.showModal('GHI NHẬN LOOT (T4)', html, () => {
            const s = document.getElementById('i-source').value;
            const a = parseInt(document.getElementById('i-amount').value);
            if (s && a > 0) {
                GAME_STATE.income.push({ source: s, amount: a, timestamp: Date.now() });
                GAME_STATE.character.gold += a;
                ENGINE.addXP(Math.floor(a / 10000));
                PERSISTENCE.save();
                UI_MANAGER.updateUI();
                UI_MANAGER.closeModal();
            }
        });
    },

    addQuest: () => {
        const html = `
            <div class="form-group">
                <label>Tên nhiệm vụ</label>
                <input type="text" id="q-title" class="premium-input" placeholder="Ví dụ: Đọc sách 30p, Code 2h...">
            </div>
            <div class="form-group">
                <label>Độ khó</label>
                <select id="q-diff" class="premium-select">
                    <option value="E">E (Dễ - 10 XP)</option>
                    <option value="D">D (20 XP)</option>
                    <option value="C" selected>C (Trung bình - 50 XP)</option>
                    <option value="B">B (100 XP)</option>
                    <option value="A">A (Khó - 250 XP)</option>
                    <option value="S">S (Siêu khó - 1000 XP)</option>
                </select>
            </div>
            <div class="form-group">
                <label>Chỉ số phát triển (Chọn 1 hoặc nhiều)</label>
                <div class="stat-toggle-group">
                    <div class="stat-toggle-btn active" data-type="t1" onclick="this.classList.toggle('active')">
                        <span class="icon">🧠</span>
                        <span class="label">TÀI NĂNG (T1)</span>
                    </div>
                    <div class="stat-toggle-btn" data-type="t2" onclick="this.classList.toggle('active')">
                        <span class="icon">🤝</span>
                        <span class="label">TÍN NHIỆM (T2)</span>
                    </div>
                    <div class="stat-toggle-btn" data-type="t3" onclick="this.classList.toggle('active')">
                        <span class="icon">📢</span>
                        <span class="label">TIẾNG TĂM (T3)</span>
                    </div>
                </div>
            </div>
            
            <div class="modal-primary-actions" style="margin-top: 24px;">
                <button class="premium-btn w-full" id="inner-save-btn" style="width: 100%; padding: 18px; font-size: 1.1rem; background: var(--accent); color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 700;">
                    💾 LƯU NHIỆM VỤ
                </button>
            </div>

            <div class="preset-section" style="margin-top: 32px; border-top: 1px solid var(--border); padding-top: 24px;">
                <p style="font-size: 0.8rem; color: var(--text-dim); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Gợi ý từ Hội đồng SAGE:</p>
                ${COMPONENTS.renderPresetPicker(GAME_STATE.character.classId)}
            </div>
        `;
            
        COMPONENTS.showModal('THÊM NHIỆM VỤ', html, null);
        
        // Hide default footer button to avoid confusion
        const footer = document.getElementById('modal-footer');
        if (footer) footer.style.display = 'none';

        // Bind the inner save button
        document.getElementById('inner-save-btn').onclick = () => {
            const title = document.getElementById('q-title').value;
            const diff = document.getElementById('q-diff').value;
            const types = Array.from(document.querySelectorAll('.stat-toggle-btn.active')).map(btn => btn.dataset.type);
            
            if (title) {
                GAME_STATE.quests.push({ 
                    title, 
                    difficulty: diff, 
                    xp: {E:10,D:20,C:50,B:100,A:250,S:1000}[diff], 
                    types: types.length ? types : ['t1'], 
                    completed: false 
                });
                PERSISTENCE.save();
                UI_MANAGER.updateUI();
                UI_MANAGER.closeModal();
            } else {
                alert("Vui lòng nhập tên nhiệm vụ!");
            }
        };
    },

    selectPresetQuest: (index) => {
        const char = GAME_STATE.character;
        const preset = PRESET_QUESTS[char.classId][index];
        if (!preset) return;

        const titleInput = document.getElementById('q-title');
        if (titleInput) {
            // Modal is open, fill it
            titleInput.value = preset.title;
            document.getElementById('q-diff').value = preset.difficulty;
            
            // Update Stat Toggles
            const presetTypes = preset.types || ['t1'];
            document.querySelectorAll('.stat-toggle-btn').forEach(btn => {
                btn.classList.toggle('active', presetTypes.includes(btn.dataset.type));
            });
        } else {
            // Modal not open, direct add
            GAME_STATE.quests.push({ 
                title: preset.title, 
                difficulty: preset.difficulty, 
                xp: {E:10,D:20,C:50,B:100,A:250,S:1000}[preset.difficulty], 
                types: preset.types || ['t1'], 
                completed: false 
            });
            PERSISTENCE.save();
            UI_MANAGER.updateUI();
        }
    },

    // 4T REINVESTMENT MENU
    showReinvestMenu: () => {
        const char = GAME_STATE.character;
        const cost = ENGINE.calculateReinvestCost(char.level);
        const html = `
            <div style="text-align:center">
                <p style="margin-bottom:20px">Sử dụng T4 (Tài chính) để tái đầu tư vào bản thân. <br> Chi phí hiện tại: <strong style="color:var(--gold)">${cost.toLocaleString('vi-VN')} VNĐ / +1 điểm</strong></p>
                <div class="reinvest-options" style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                    <button class="premium-btn" onclick="ENGINE.reinvest('t1')">🧠 T1</button>
                    <button class="premium-btn" onclick="ENGINE.reinvest('t2')">🤝 T2</button>
                    <button class="premium-btn" onclick="ENGINE.reinvest('t3')">📢 T3</button>
                </div>
            </div>
        `;
        COMPONENTS.showModal('💎 TÁI ĐẦU TƯ 4T', html);
    },

    showSettings: () => {
        const html = COMPONENTS.renderSettings();
        COMPONENTS.showModal('⚙️ CÀI ĐẶT HỆ THỐNG', html);
    },

    showScreenHelp: (screen) => {
        UI_MANAGER.showScreenHelp(screen);
    },

    changeClass: () => {
        if (confirm('Bạn muốn đổi Class nhân vật? (Tên và XP của bạn vẫn được giữ nguyên)')) {
            UI_MANAGER.showOnboarding();
        }
    }
};

// Bootstrap
window.onload = UI_HANDLERS.init;
