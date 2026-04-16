const COMPONENTS = {
    // Escape HTML to prevent XSS
    escapeHTML: (str) => {
        if (!str) return '';
        const p = document.createElement('p');
        p.textContent = str;
        return p.innerHTML;
    },

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
            container.innerHTML = `
                <div class="empty-state-container" style="text-align:center; padding:20px;">
                    <div class="empty-state">Chưa có nhiệm vụ hôm nay...</div>
                    <div style="margin-top:24px;">
                        <p style="font-size:0.85rem; color:var(--text-dim); margin-bottom:12px;">Gợi ý nhiệm vụ cho class ${GAME_STATE.character.classIcon} ${GAME_STATE.character.className}:</p>
                        ${COMPONENTS.renderPresetPicker(GAME_STATE.character.classId)}
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        quests.forEach((q, index) => {
            const item = document.createElement('div');
            item.className = `quest-item ${q.completed ? 'completed' : ''}`;
            item.innerHTML = `
                <div class="item-info">
                    <div class="quest-types-icons" style="margin-right: 12px; display: flex; gap: 4px;">
                        ${(q.types || ['t1']).map(type => `
                            <span class="quest-type-icon" style="font-size: 1.1rem;">
                                ${type === 't1' ? '🧠' : type === 't2' ? '🤝' : type === 't3' ? '📢' : '⚡'}
                            </span>
                        `).join('')}
                    </div>
                    <span class="quest-title">${COMPONENTS.escapeHTML(q.title)}</span>
                    <span class="quest-reward" style="margin-left: 8px; font-size: 0.8rem; color: var(--accent);">+${q.xp} XP</span>
                </div>
                <div class="item-actions">
                    <button class="btn-check" onclick="UI_HANDLERS.toggleQuest(${index})">${q.completed ? '✓' : '○'}</button>
                    <button class="btn-action-mini" onclick="UI_HANDLERS.editQuest(${index})" title="Chỉnh sửa">✏️</button>
                    <button class="btn-action-mini btn-delete" onclick="UI_HANDLERS.deleteQuest(${index})" title="Xóa">🗑️</button>
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
        // Render from newest to oldest
        income.map((inc, idx) => ({ ...inc, idx })).reverse().forEach(itemData => {
            const inc = itemData;
            const index = itemData.idx;
            const item = document.createElement('div');
            item.className = 'income-item';
            item.innerHTML = `
                <div class="item-info">
                    <span class="income-source">${COMPONENTS.escapeHTML(inc.source)}</span>
                    <span class="income-date">${new Date(inc.timestamp).toLocaleDateString()}</span>
                </div>
                <div class="income-value-wrapper" style="display:flex; align-items:center; gap:12px;">
                    <div class="income-value">+${inc.amount.toLocaleString('vi-VN')} VNĐ</div>
                    <button class="btn-action-mini btn-delete" onclick="UI_HANDLERS.deleteIncome(${index})" title="Xóa">🗑️</button>
                </div>
            `;
            container.appendChild(item);
        });
    },

    // Phase 2: Render Journey Map
    renderJourneyMap: () => {
        const container = document.getElementById('journey-milestones');
        const progressBar = document.getElementById('journey-progress-bar');
        const char = GAME_STATE.character;
        
        // Use the rankName calculated by Engine Assessment
        document.getElementById('rank-name').textContent = char.rankName || 'Tập sự';
        
        // 1. Calculate lowest 4T stat (Excluding T4)
        const statsObj = [
            { id: 't1', val: char.stats.t1 || 0 },
            { id: 't2', val: char.stats.t2 || 0 },
            { id: 't3', val: char.stats.t3 || 0 }
        ];
        const lowestObj = statsObj.reduce((prev, curr) => (prev.val < curr.val) ? prev : curr);
        
        // 2. Calculate Granular XP Level
        const xpRequired = PROGRESSION.getXPRequired(char.level);
        const xpProgress = char.xp / xpRequired;
        const preciseLevel = char.level + xpProgress;
        
        // 3. Determine Effective Level (Bottleneck)
        // The bar "runs" with XP, but is capped by the lowest 4T stat
        const effectiveLevel = Math.min(preciseLevel, lowestObj.val);
        const progressPercent = Math.min(effectiveLevel, 100);
        
        progressBar.style.setProperty('--progress', `${progressPercent}%`);
        
        // 4. Render Milestones
        container.innerHTML = '';
        RANKS.forEach(rank => {
            const milestone = document.createElement('div');
            // FIX: Use Math.floor to ensure we only light up the milestone once the full level is reached
            const isReached = Math.floor(effectiveLevel) >= rank.level;
            milestone.className = `milestone ${isReached ? 'reached' : ''}`;
            milestone.style.left = `${rank.level}%`;
            milestone.innerHTML = `
                <div class="milestone-dot"></div>
                <span class="milestone-label">${rank.level}</span>
            `;
            container.appendChild(milestone);
        });

        // 5. Update Bottleneck Message
        const statLabels = { t1: 'Tài năng (T1)', t2: 'Tín nhiệm (T2)', t3: 'Tiếng tăm (T3)', t4: 'Tài chính (T4)' };
        let bottleneckMsg = document.getElementById('bottleneck-indicator');
        if (!bottleneckMsg) {
            bottleneckMsg = document.createElement('div');
            bottleneckMsg.id = 'bottleneck-indicator';
            bottleneckMsg.style.cssText = 'font-size: 0.65rem; color: var(--text-dim); margin-top: 45px; text-align: center; font-style: italic;';
            container.parentNode.appendChild(bottleneckMsg);
        }

        if (preciseLevel < lowestObj.val) {
            const remainingXP = Math.ceil(xpRequired - char.xp);
            bottleneckMsg.innerHTML = `⚠️ Nút thắt hiện tại: <span style="color:var(--accent)">Cấp độ (XP)</span>. Cần thêm <b>${remainingXP} XP</b> để tiếp tục hành trình.`;
        } else {
            const rankInfo = PROGRESSION.getRankInfoByStat(lowestObj.val);
            const nextThreshold = rankInfo.nextRank ? rankInfo.nextRank.level : 'MAX';
            bottleneckMsg.innerHTML = `⚠️ Nút thắt hiện tại: <span style="color:var(--accent)">${statLabels[lowestObj.id]}</span>. Cần đạt mốc <b>${nextThreshold}</b> để thăng cấp.`;
        }
    },

    // Phase 2: Render Skills Grid
    renderSkills: (skillsDB, unlockedIDs, skillPoints, charClassId) => {
        const container = document.getElementById('skills-grid');
        document.getElementById('skill-points-value').textContent = skillPoints;
        container.innerHTML = '';

        const commonSkills = skillsDB.filter(s => !s.requiredClass);
        const classSkills = skillsDB.filter(s => s.requiredClass === charClassId);

        const renderSection = (title, skills) => {
            if (skills.length === 0) return '';
            
            const skillsHTML = skills.map(skill => {
                const isUnlocked = unlockedIDs.includes(skill.id);
                const canAfford = skillPoints >= skill.cost;
                const clickHandler = isUnlocked ? `UI_HANDLERS.showKnowledgeCard('${skill.id}')` : (canAfford ? `UI_HANDLERS.unlockSkill('${skill.id}')` : '');
                
                return `
                    <div class="skill-card ${isUnlocked ? 'unlocked' : 'locked'}" onclick="${clickHandler}">
                        <div class="skill-icon">${skill.icon}</div>
                        <div class="skill-info">
                            <h4>${skill.name}</h4>
                            <p>${skill.description}</p>
                            ${isUnlocked ? 
                                '<span class="badge-unlocked">MASTERED</span>' : 
                                `<button class="btn-unlock" ${!canAfford ? 'disabled' : ''}>Học (${skill.cost} SP)</button>`
                            }
                        </div>
                    </div>
                `;
            }).join('');

            return `
                <div class="skill-category">
                    <h3 class="category-title">${title}</h3>
                    <div class="skills-subgrid">${skillsHTML}</div>
                </div>
            `;
        };

        const className = CHARACTER_CLASSES.find(c => c.id === charClassId)?.name || 'Nghề';
        container.innerHTML = `
            ${renderSection('KỸ NĂNG CHUNG', commonSkills)}
            ${renderSection(`KỸ NĂNG ${className.toUpperCase()}`, classSkills)}
        `;
    },

    // Phase 2: Render Achievements
    renderKnowledgeCard: (skill) => {
        return `
            <div class="knowledge-card-popup">
                <div class="knowledge-icon">${skill.icon}</div>
                <h3>${skill.name}</h3>
                <div class="knowledge-divider"></div>
                <div class="knowledge-lesson">
                    <p>${skill.lesson || 'Kiến thức đang được cập nhật...'}</p>
                </div>
                <div class="knowledge-footer">
                    <span>💡 Kỹ năng này đã giúp bạn mạnh mẽ hơn!</span>
                </div>
            </div>
        `;
    },

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

    // Phase 2: Render Preset Quest Picker
    renderPresetPicker: (classId) => {
        const presets = PRESET_QUESTS[classId] || [];
        if (presets.length === 0) return '<p>Không có nhiệm vụ mẫu cho Class này.</p>';

        return `
            <div class="preset-picker-container">
                <p style="font-size:0.85rem; color:var(--text-dim); margin-bottom:12px;">Gợi ý từ Hội đồng ${classId.toUpperCase()}:</p>
                <div class="preset-list">
                    ${presets.map((p, i) => `
                        <div class="preset-item" onclick="UI_HANDLERS.selectPresetQuest(${i})">
                            <div class="preset-info">
                                <span class="preset-title">${p.title}</span>
                                <div class="preset-meta">
                                    <span class="difficulty-badge ${p.difficulty}">${p.difficulty}</span>
                                    <span class="xp-badge">+${{E:10,D:20,C:50,B:100,A:250,S:1000}[p.difficulty]} XP</span>
                                </div>
                            </div>
                            <button class="btn-add-preset">+</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    // Modals
    showModal: (title, contentHTML, onSave) => {
        const overlay = document.getElementById('modal-overlay');
        const modal = document.getElementById('modal-content');
        
        modal.innerHTML = `
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="btn-close" onclick="UI_MANAGER.closeModal()">✕</button>
            </div>
            <div class="modal-footer" style="padding-bottom: 0; margin-bottom: -10px; border-bottom: none;">
                <button class="premium-btn" id="modal-save-btn">Lưu Lại</button>
            </div>
            <div class="modal-body">${contentHTML}</div>
        `;
        
        overlay.classList.remove('hidden');
        document.body.classList.add('modal-open');
        
        if (onSave) {
            document.getElementById('modal-save-btn').onclick = onSave;
        } else {
            document.getElementById('modal-save-btn').textContent = 'Đã Hiểu';
            document.getElementById('modal-save-btn').onclick = UI_MANAGER.closeModal;
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
                        <h4>2. THU THẬP "LOOT" (VNĐ)</h4>
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
                        <p>Ghi lại số tiền bạn kiếm được thực tế. 1,000 VNĐ sẽ mang lại cho bạn ít nhất 1 XP thưởng.</p>
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
    },

    renderSettings: () => {
        return `
            <div class="settings-modal" style="text-align: center;">
                <p style="margin-bottom: 24px; color: var(--text-dim);">Quản lý dữ liệu cuộc đời của bạn. Mọi dữ liệu hiện đang được lưu cục bộ trên trình duyệt này.</p>
                
                <div style="display: flex; flex-direction: column; gap: 16px;">
                    <div class="settings-group" style="background: rgba(255,255,255,0.03); padding: 16px; border-radius: 12px; border: 1px solid var(--border);">
                        <h4>📤 SAO LƯU (EXPORT)</h4>
                        <p style="font-size: 0.8rem; color: var(--text-dim); margin: 8px 0 16px;">Tải về file dự phòng để lưu trữ hoặc chuyển sang máy khác.</p>
                        <button class="premium-btn" onclick="PERSISTENCE.export()" style="background: var(--accent);">Tải file Backup (.json)</button>
                    </div>

                    <div class="settings-group" style="background: rgba(255,255,255,0.03); padding: 16px; border-radius: 12px; border: 1px solid var(--border);">
                        <h4>📥 KHÔI PHỤC (IMPORT)</h4>
                        <p style="font-size: 0.8rem; color: var(--text-dim); margin: 8px 0 16px;">Nạp lại dữ liệu từ file backup đã có.</p>
                        <input type="file" id="import-file" style="display:none" onchange="PERSISTENCE.import(this.files[0])">
                        <button class="premium-btn" onclick="document.getElementById('import-file').click()" style="background: var(--bg-elevated); border: 1px solid var(--border);">Chọn file Backup</button>
                    </div>
                </div>
            </div>
        `;
    },

    renderHomeGuide: () => {
        const guide = GAME_TEXT.homeGuide;
        const itemsHTML = guide.items.map(item => `
            <div class="guide-item">
                <h4 style="color: var(--gold); margin-bottom: 8px;">${item.title}</h4>
                <p style="font-size: 0.9rem; color: var(--text-dim); line-height: 1.6;">${item.desc}</p>
            </div>
        `).join('');

        return `
            <div class="home-guide-content">
                <h3 style="color: var(--accent); margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                    ${guide.title}
                </h3>
                <div class="guide-grid" style="display: grid; grid-template-columns: 1fr; gap: 20px;">
                    ${itemsHTML}
                    <div class="guide-item" style="background: rgba(79, 70, 229, 0.1); padding: 12px; border-radius: 8px; border-left: 4px solid var(--accent);">
                        <p style="font-size: 0.85rem; font-style: italic;">"${guide.quote}"</p>
                    </div>
                </div>
            </div>
        `;
    },

    renderWelcomeStep: () => {
        const welcome = GAME_TEXT.welcome;
        const featuresHTML = welcome.features.map(f => `
            <div style="background: var(--bg-card); padding: 12px; border-radius: 12px; border: 1px solid var(--border);">
                <div style="font-size: 1.5rem;">${f.icon}</div>
                <div style="font-size: 0.8rem; font-weight: bold; margin-top:4px;">${f.label}</div>
            </div>
        `).join('');

        return `
            <div class="welcome-step" style="text-align: center; animation: modalSlideUp 0.6s ease;">
                <div style="font-size: 4rem; margin-bottom: 20px;">🌟</div>
                <h1 class="onboarding-title">${welcome.title}</h1>
                <p class="onboarding-subtitle" style="margin-top: 20px; font-size: 1.1rem;">${welcome.subtitle}</p>
                <div class="welcome-features" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 32px 0;">
                    ${featuresHTML}
                </div>
                <button class="premium-btn" onclick="ONBOARDING.renderStep('name')">${welcome.cta}</button>
            </div>
        `;
    }
};
