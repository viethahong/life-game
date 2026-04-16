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

        if (char.gold >= cost) {
            char.gold -= cost;
            char.stats[targetStat] = (char.stats[targetStat] || 0) + 1;
            
            // Record history
            const date = new Date().toLocaleDateString('en-CA');
            if (!GAME_STATE.history.gold) GAME_STATE.history.gold = [];
            GAME_STATE.history.gold.push({ date, amount: -cost, note: `Reinvest ${targetStat}` });

            PERSISTENCE.save();
            UI_MANAGER.updateUI();
            UI_MANAGER.showStatGainToast(targetStat, 1);
            
            // Re-assess after stat change
            ENGINE.autoAssess();
            return true;
        } else {
            alert(`Bạn không đủ tiền! Cần ${cost.toLocaleString('vi-VN')} VNĐ.`);
            return false;
        }
    },

    // --- AUTOMATIC ASSESSMENT (Theory of Constraints) ---
    autoAssess: () => {
        const char = GAME_STATE.character;
        if (!char) return;

        // 4T values: T1, T2, T3 and T4 (derived from Gold)
        // T4 Level logic: 10M = 10 pts, 100M = 20 pts, 1B = 30 pts (Logarithmic scale for finance weight)
        // Or simple: T4 = gold / 1,000,000 (1M = 1 pt)
        const t4Value = char.gold / 1000000; 
        
        const stats = [
            { id: 't1', val: char.stats.t1 || 0 },
            { id: 't2', val: char.stats.t2 || 0 },
            { id: 't3', val: char.stats.t3 || 0 },
            { id: 't4', val: t4Value }
        ];

        // Rank is limited by the LOWEST stat (Theory of Constraints)
        const lowestStat = Math.min(...stats.map(s => s.val));
        
        // Determine Rank Name based on lowestStat thresholds
        let newRankName = 'Apprentice';
        if (lowestStat >= 100) newRankName = 'Legend';
        else if (lowestStat >= 75) newRankName = 'Grand Master';
        else if (lowestStat >= 50) newRankName = 'Master';
        else if (lowestStat >= 25) newRankName = 'Expert';
        else if (lowestStat >= 10) newRankName = 'Journeyman';

        const oldRank = char.rankName;
        char.rankName = newRankName;

        if (oldRank && oldRank !== newRankName) {
            UI_MANAGER.showAnnouncement(`BẠN ĐẠT CẤP ĐỘ MỚI: ${newRankName.toUpperCase()}!`);
        }
    },

    calculatePowerScore: () => {
        const stats = GAME_STATE.character.stats;
        const gold = GAME_STATE.character.gold;
        // Formula: (T1 + T2 + T3) * log10(Gold/100k + 1)
        const financeMultiplier = Math.log10(gold / 100000 + 1) + 1;
        return Math.floor((stats.t1 + stats.t2 + stats.t3) * financeMultiplier);
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
