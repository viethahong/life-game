const COMPONENTS = {
    // Render the Class Selection Grid
    renderClassGrid: (classes, onSelect) => {
        const container = document.getElementById('class-grid');
        container.innerHTML = '';
        
        classes.forEach(cls => {
            const card = document.createElement('div');
            card.className = 'class-card';
            card.innerHTML = `
                <span class="class-icon">${cls.icon}</span>
                <h3>${cls.name}</h3>
                <p>${cls.description}</p>
            `;
            card.onclick = () => onSelect(cls);
            container.appendChild(card);
        });
    },

    // Render Quest List
    renderQuests: (quests, onToggle) => {
        const container = document.getElementById('quest-list');
        if (quests.length === 0) {
            container.innerHTML = '<div class="quest-item empty-state">Chưa có nhiệm vụ hôm nay...</div>';
            return;
        }

        container.innerHTML = '';
        quests.forEach((q, index) => {
            const item = document.createElement('div');
            item.className = `quest-item ${q.completed ? 'completed' : ''}`;
            item.innerHTML = `
                <div class="item-info">
                    <span class="quest-title">${q.title}</span>
                    <span class="quest-reward">+${q.xp} XP</span>
                </div>
                <div class="item-actions">
                    <button class="btn-check" onclick="UI_HANDLERS.toggleQuest(${index})">${q.completed ? '✓' : '○'}</button>
                </div>
            `;
            container.appendChild(item);
        });
    },

    // Render Income List
    renderIncome: (income) => {
        const container = document.getElementById('income-list');
        if (income.length === 0) {
            container.innerHTML = '<div class="income-item empty-state">Chưa thu được loot nào...</div>';
            return;
        }

        container.innerHTML = '';
        [...income].reverse().forEach(inc => {
            const item = document.createElement('div');
            item.className = 'income-item';
            item.innerHTML = `
                <div class="item-info">
                    <span class="income-source">${inc.source}</span>
                    <span class="income-date">${new Date(inc.timestamp).toLocaleDateString()}</span>
                </div>
                <div class="income-value">+${inc.amount} Gold</div>
            `;
            container.appendChild(item);
        });
    },

    // Phase 2: Render Journey Map
    renderJourneyMap: (level) => {
        const container = document.getElementById('journey-milestones');
        const progressBar = document.getElementById('journey-progress-bar');
        const rankInfo = PROGRESSION.getRankInfo(level);
        
        document.getElementById('rank-name').textContent = rankInfo.currentRank.name;
        
        // Calculate total progress (0-100%) based on level 1-100
        const progress = Math.min((level / 100) * 100, 100);
        progressBar.style.setProperty('--progress', `${progress}%`);
        
        container.innerHTML = '';
        RANKS.forEach(rank => {
            const milestone = document.createElement('div');
            milestone.className = `milestone ${level >= rank.level ? 'reached' : ''}`;
            milestone.innerHTML = `
                <div class="milestone-dot"></div>
                <span class="milestone-label">LVL ${rank.level}</span>
            `;
            container.appendChild(milestone);
        });
    },

    // Phase 2: Render Skills Grid
    renderSkills: (skillsDB, unlockedIDs, skillPoints, onUnlock) => {
        const container = document.getElementById('skills-grid');
        document.getElementById('skill-points-value').textContent = skillPoints;
        
        container.innerHTML = '';
        skillsDB.forEach(skill => {
            const isUnlocked = unlockedIDs.includes(skill.id);
            const canAfford = skillPoints >= skill.cost;
            const card = document.createElement('div');
            card.className = `skill-card ${isUnlocked ? 'unlocked' : 'locked'}`;
            card.innerHTML = `
                <div class="skill-icon">${skill.icon}</div>
                <div class="skill-info">
                    <h4>${skill.name}</h4>
                    <p>${skill.description}</p>
                    ${isUnlocked ? 
                        '<span class="badge-unlocked">MASTERED</span>' : 
                        `<button class="btn-unlock" ${!canAfford ? 'disabled' : ''} onclick="UI_HANDLERS.unlockSkill('${skill.id}')">Unlock (${skill.cost} SP)</button>`
                    }
                </div>
            `;
            container.appendChild(card);
        });
    },

    // Phase 2: Render Achievements
    renderAchievements: (achievementsDB, unlockedIDs) => {
        const container = document.getElementById('achievements-grid');
        container.innerHTML = '';
        achievementsDB.forEach(ach => {
            const isUnlocked = unlockedIDs.includes(ach.id);
            const card = document.createElement('div');
            card.className = `achievement-card ${isUnlocked ? 'unlocked' : ''}`;
            card.innerHTML = `
                <span class="achievement-icon">${isUnlocked ? ach.icon : '🔒'}</span>
                <h4>${ach.name}</h4>
                <p>${ach.description}</p>
            `;
            container.appendChild(card);
        });
    },

    // Modals
    showModal: (title, contentHTML, onSave) => {
        const overlay = document.getElementById('modal-overlay');
        const modal = document.getElementById('modal-content');
        
        modal.innerHTML = `
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="btn-close" onclick="UI_HANDLERS.closeModal()">✕</button>
            </div>
            <div class="modal-body">${contentHTML}</div>
            <div class="modal-footer">
                <button class="premium-btn" id="modal-save-btn">Lưu Lại</button>
            </div>
        `;
        
        overlay.classList.remove('hidden');
        if (onSave) {
            document.getElementById('modal-save-btn').onclick = onSave;
        } else {
            document.getElementById('modal-save-btn').textContent = 'Đã Hiểu';
            document.getElementById('modal-save-btn').onclick = UI_HANDLERS.closeModal;
        }
    },

    // Phase 3: Render Guide Content
    renderGuide: () => {
        return `
            <div class="guide-content">
                <div class="guide-step">
                    <div class="icon">📜</div>
                    <div class="info">
                        <h4>1. LÀM NHIỆM VỤ (QUESTS)</h4>
                        <p>Tự tạo các thử thách thực tế trong ngày. Mỗi nhiệm vụ hoàn thành sẽ mang lại XP và Vàng.</p>
                    </div>
                </div>
                <div class="guide-step">
                    <div class="icon">💰</div>
                    <div class="info">
                        <h4>2. THU THẬP "LOOT" (GOLD)</h4>
                        <p>Ghi nhận thu nhập thực tế của bạn. Càng kiếm nhiều vàng, bạn càng nhận thêm nhiều XP thưởng.</p>
                    </div>
                </div>
                <div class="guide-step">
                    <div class="icon">📈</div>
                    <div class="info">
                        <h4>3. LÊN CẤP & TĂNG CHỈ SỐ</h4>
                        <p>Khi đủ XP, bạn sẽ lên cấp. Các chỉ số (STR, INT, CHA...) sẽ tăng lên giúp bạn mạnh mẽ hơn.</p>
                    </div>
                </div>
                <div class="guide-step">
                    <div class="icon">🧠</div>
                    <div class="info">
                        <h4>4. MỞ KHÓA KỸ NĂNG</h4>
                        <p>Sử dụng Skill Points (nhận được khi lên cấp) để mở khóa các Buff vĩnh viễn trong Cây kỹ năng.</p>
                    </div>
                </div>
            </div>
        `;
    },

    // Onboarding Step 1: Enter Name
    renderNameStep: () => {
        return `
            <div class="step-dots">
                <div class="step-dot active"></div>
                <div class="step-dot"></div>
                <div class="step-dot"></div>
            </div>
            <p class="step-label">BƯỚC 1 / 3</p>
            <h1 class="onboarding-title">Bạn tên gì? 👋</h1>
            <p class="onboarding-subtitle">Đây sẽ là tên nhân vật của bạn trong thế giới Life Game</p>
            <input type="text" id="player-name-input" class="name-input-large"
                placeholder="Nhập tên của bạn..."
                maxlength="20"
                onkeydown="if(event.key==='Enter') ONBOARDING.submitName()">
            <button class="premium-btn" style="margin-top:24px" onclick="ONBOARDING.submitName()">Tiếp theo →</button>
        `;
    },

    // Onboarding Step 2: Quiz (one question per render)
    renderQuizStep: (questionIndex, question, total) => {
        const dotsHTML = Array.from({ length: 3 }, (_, i) =>
            `<div class="step-dot ${i === 1 ? 'active' : ''}"></div>`
        ).join('');

        const optionsHTML = question.options.map(opt => `
            <button class="quiz-option" onclick="ONBOARDING.answerQuiz('${opt.classId}')">
                ${opt.text}
            </button>
        `).join('');

        return `
            <div class="step-dots">${dotsHTML}</div>
            <p class="step-label">BƯỚC 2 / 3 &nbsp;•&nbsp; Câu ${questionIndex + 1} / ${total}</p>
            <h2 class="onboarding-title" style="font-size:1.4rem;line-height:1.4">${question.question}</h2>
            <div class="quiz-options">${optionsHTML}</div>
            <button class="btn-back-quiz" onclick="ONBOARDING.prevQuestion()">← Quay lại</button>
        `;
    },

    // Onboarding Step 3: Class selection with recommendation
    renderClassSelect: (classes, recommendedId) => {
        const recommendedClass = classes.find(c => c.id === recommendedId);
        const dotsHTML = Array.from({ length: 3 }, (_, i) =>
            `<div class="step-dot ${i === 2 ? 'active' : ''}"></div>`
        ).join('');

        const cardsHTML = classes.map(cls => `
            <div class="class-card ${cls.id === recommendedId ? 'recommended' : ''}"
                 onclick="ONBOARDING.finalizeClass('${cls.id}')">
                <span class="class-icon">${cls.icon}</span>
                <h3>${cls.name}</h3>
                <p>${cls.description}</p>
            </div>
        `).join('');

        return `
            <div class="step-dots">${dotsHTML}</div>
            <p class="step-label">BƯỚC 3 / 3</p>
            <h1 class="onboarding-title">Chọn Class của bạn 🎭</h1>
            <p class="onboarding-subtitle">
                Dựa trên bài test, chúng tôi gợi ý <strong style="color:var(--accent)">${recommendedClass.icon} ${recommendedClass.name}</strong>
                — nhưng bạn hoàn toàn có thể chọn class khác!
            </p>
            <div class="class-selection-grid">${cardsHTML}</div>
        `;
    },

    // Detailed Help per Screen
    renderQuestsHelp: () => {
        return `
            <div class="guide-content">
                <div class="guide-step">
                    <div class="icon">📜</div>
                    <div class="info">
                        <h4>NHIỆM VỤ (QUESTS)</h4>
                        <p>Đây là danh sách các việc bạn cần làm trong ngày. Mỗi nhiệm vụ có độ khó từ E đến S.</p>
                    </div>
                </div>
                <div class="guide-step">
                    <div class="icon">💰</div>
                    <div class="info">
                        <h4>THU NHẬP (LOOT)</h4>
                        <p>Ghi lại số tiền bạn kiếm được thực tế. 1,000 Gold sẽ mang lại cho bạn khoảng 1-5 XP thưởng.</p>
                    </div>
                </div>
                <p style="margin-top:20px; font-size:0.9rem; color:var(--text-dim)">
                    Mẹo: Hãy chia nhỏ các nhiệm vụ lớn thành nhiều nhiệm vụ nhỏ để dễ dàng tích lũy XP hơn.
                </p>
            </div>
        `;
    },

    renderSkillsHelp: () => {
        return `
            <div class="guide-content">
                <div class="guide-step">
                    <div class="icon">🧠</div>
                    <div class="info">
                        <h4>KỸ NĂNG (SKILLS)</h4>
                        <p>Mỗi khi lên cấp, bạn nhận được 1 Skill Point (SP). Dùng SP để mở khóa các thẻ kỹ năng.</p>
                    </div>
                </div>
                <div class="guide-step">
                    <div class="icon">⚡</div>
                    <div class="info">
                        <h4>BUFF CHỈ SỐ</h4>
                        <p>Có 2 loại kỹ năng: Tăng chỉ số vĩnh viễn (STR, INT...) hoặc Tăng % XP/Vàng nhận được.</p>
                    </div>
                </div>
            </div>
        `;
    },

    renderAnalyticsHelp: () => {
        return `
            <div class="guide-content">
                <div class="guide-step">
                    <div class="icon">📊</div>
                    <div class="info">
                        <h4>BIỂU ĐỒ XP</h4>
                        <p>Theo dõi sự nỗ lực của bạn qua từng ngày. Đừng để biểu đồ đi xuống quá lâu!</p>
                    </div>
                </div>
                <div class="guide-step">
                    <div class="icon">🕸️</div>
                    <div class="info">
                        <h4>RADAR CHỈ SỐ</h4>
                        <p>Giúp bạn thấy mình đang phát triển lệch về hướng nào để cân bằng lại cuộc sống.</p>
                    </div>
                </div>
            </div>
        `;
    }
};
