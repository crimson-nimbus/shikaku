// Storage module - manages localStorage for quiz history and stats

const STORAGE_KEY = 'it-passport-history';

export function getHistory() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export function saveAnswer(record) {
    const history = getHistory();
    history.push({
        ...record,
        timestamp: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function clearHistory() {
    localStorage.removeItem(STORAGE_KEY);
}

export function getStats() {
    const history = getHistory();
    const total = history.length;
    const correct = history.filter(h => h.is_correct).length;
    const rate = total > 0 ? Math.round((correct / total) * 100) : 0;

    return { total, correct, rate };
}

export function getCategoryStats(category) {
    const history = getHistory();
    const filtered = history.filter(h => h.category === category);
    const total = filtered.length;
    const correct = filtered.filter(h => h.is_correct).length;
    const rate = total > 0 ? Math.round((correct / total) * 100) : 0;

    return { total, correct, rate };
}

export function getSubcategoryStats(subcategory) {
    const history = getHistory();
    const filtered = history.filter(h => h.subcategory === subcategory);
    const total = filtered.length;
    const correct = filtered.filter(h => h.is_correct).length;
    const rate = total > 0 ? Math.round((correct / total) * 100) : 0;

    return { total, correct, rate };
}

export function getWeakQuestionIds() {
    const history = getHistory();
    const questionMap = {};

    // Build a map of question ID -> results
    history.forEach(h => {
        if (!questionMap[h.question_id]) {
            questionMap[h.question_id] = { correct: 0, incorrect: 0 };
        }
        if (h.is_correct) {
            questionMap[h.question_id].correct++;
        } else {
            questionMap[h.question_id].incorrect++;
        }
    });

    // Return IDs where incorrect >= correct
    return Object.entries(questionMap)
        .filter(([, stats]) => stats.incorrect >= stats.correct)
        .map(([id]) => id);
}

export function getRecentHistory(count = 20) {
    const history = getHistory();
    return history.slice(-count).reverse();
}
