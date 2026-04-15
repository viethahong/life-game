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
        document.getElementById('modal-save-btn').onclick = onSave;
    }
};
