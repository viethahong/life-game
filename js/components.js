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
    renderQuests: (quests, onToggle, onDelete) => {
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
        income.reverse().forEach(inc => {
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
