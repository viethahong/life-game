/**
 * ENGINE.js
 * Chứa logic cốt lõi của game: XP, Stats, Level, 4T Reinvestment và Assessment.
 */
const ENGINE = {
    // --- XP & LEVEL LOGIC ---
    addXP: (amount) => {
        const char = GAME_STATE.character;
        if (!char) return;
        
        char.xp += amount;

        // Update Streak if completing quest for first time today
        if (amount > 0) {
            const today = new Date().toLocaleDateString('en-CA');
            if (char.streakLastDay !== today) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toLocaleDateString('en-CA');
                
                if (char.streakLastDay === yesterdayStr) {
                    char.streak++;
                } else {
                    char.streak = 1;
                }
                char.streakLastDay = today;
            }
        }
        
        // Level Down Logic (Refund)
        while (char.xp < 0 && char.level > 1) {
            char.level--;
            char.sp = Math.max(0, char.sp - 1);
            // Refund points from stats
            Object.keys(char.stats).forEach(s => char.stats[s] = Math.max(0, char.stats[s] - 1));
            char.xp += PROGRESSION.getXPRequired(char.level);
        }
        
        if (char.xp < 0 && char.level === 1) char.xp = 0;

        if (amount > 0) {
            const date = new Date().toLocaleDateString('en-CA');
            if (!GAME_STATE.history.xp) GAME_STATE.history.xp = [];
            GAME_STATE.history.xp.push({ date, amount });
        }

        // Level Up Logic
        let xpRequired = PROGRESSION.getXPRequired(char.level);
        while (char.xp >= xpRequired) {
            char.xp -= xpRequired;
            char.level++;
            char.sp += 1;
            xpRequired = PROGRESSION.getXPRequired(char.level);
            // Auto-boost stats on level up
            Object.keys(char.stats).forEach(s => char.stats[s] += 1);
            UI_MANAGER.showLevelUpToast(char.level);
        }

        // Auto-Assess Rank
        ENGINE.autoAssess();
    },

    // --- 4T REINVESTMENT LOGIC ---
    calculateReinvestCost: (level) => {
        // Level 1: 1,000,000 | Level 10: 10,000,000 | Level 100: 100,000,000
        return level * 1000000;
    },

    reinvest: (targetStat) => {
        const char = GAME_STATE.character;
        const cost = ENGINE.calculateReinvestCost(char.level);

        // Action-First Constraint: Money only catches up to your highest stat
        const t1 = char.stats.t1 || 0;
        const t2 = char.stats.t2 || 0;
        const t3 = char.stats.t3 || 0;
        const maxStat = Math.max(t1, t2, t3);

        if (char.stats[targetStat] >= maxStat) {
            return { success: false, reason: 'ceiling_reached', maxStat };
        }

        if (char.gold >= cost) {
            char.gold -= cost;
            char.stats[targetStat] = (char.stats[targetStat] || 0) + 1;
            
            // Record history
            const date = new Date().toLocaleDateString('en-CA');
            if (!GAME_STATE.history.gold) GAME_STATE.history.gold = [];
            GAME_STATE.history.gold.push({ date, amount: -cost, note: `Reinvest ${targetStat}` });

            // Award XP based on the cost of reinvestment (e.g., 1M -> 100 XP)
            const xpAward = Math.floor(cost / 10000);
            ENGINE.addXP(xpAward);

            PERSISTENCE.save();
            UI_MANAGER.updateUI();
            UI_MANAGER.showStatGainToast(targetStat, 1);
            
            // Re-assess after stat change
            ENGINE.autoAssess();
            return { success: true, xpAward, cost };
        } else {
            console.log(`Bạn không đủ tiền! Cần ${cost.toLocaleString('vi-VN')} VNĐ.`);
            return { success: false, cost };
        }
    },

    // --- AUTOMATIC ASSESSMENT (Theory of Constraints) ---
    autoAssess: () => {
        const char = GAME_STATE.character;
        if (!char) return;

        // T4 = gold / 1,000,000 (1M = 1 pt)
        const t4Value = char.gold / 1000000; 
        
        const stats = [
            { id: 't1', val: char.stats.t1 || 0 },
            { id: 't2', val: char.stats.t2 || 0 },
            { id: 't3', val: char.stats.t3 || 0 },
            { id: 't4', val: t4Value }
        ];

        // Rank is limited by the LOWEST of (XP Level OR lowest 4T stat - excluding T4 money)
        const coreStats = [
            char.stats.t1 || 0,
            char.stats.t2 || 0,
            char.stats.t3 || 0
        ];
        const lowestStatValue = Math.min(...coreStats);
        const effectiveRankLevel = Math.min(char.level, Math.floor(lowestStatValue));
        
        // Determine Rank based on effectiveRankLevel thresholds
        const rankInfo = PROGRESSION.getRankInfoByStat(effectiveRankLevel);
        const newRankName = rankInfo.currentRank.name;

        const oldRank = char.rankName;
        char.rankName = newRankName;

        if (oldRank && oldRank !== newRankName) {
            UI_MANAGER.showAnnouncement(`BẠN ĐẠT ĐẲNG CẤP MỚI: ${newRankName.toUpperCase()}!`);
        }
    },

    calculatePowerScore: () => {
        const stats = GAME_STATE.character.stats || {};
        // Formula: (T1 + T2) * T3
        const coreValue = (stats.t1 || 0) + (stats.t2 || 0);
        const reputation = (stats.t3 || 0);
        return Math.floor(coreValue * reputation);
    },

    applySkillEffect: (skill) => {
        const char = GAME_STATE.character;
        if (skill.type === 'stat') {
            char.stats[skill.effect.stat] += skill.effect.value;
        } else if (skill.type === 'stat_all') {
            Object.keys(char.stats).forEach(s => {
                char.stats[s] += skill.effect.value;
            });
        }
        ENGINE.autoAssess();
    }
};
