// Data module - loads and manages question data

const BASE = import.meta.env.BASE_URL || '/';

let allQuestions = [];
let loaded = false;

export async function loadQuestions() {
    if (loaded) return allQuestions;

    try {
        const [tech, strategy, management] = await Promise.all([
            fetch(`${BASE}questions_technology.json`).then(r => r.json()),
            fetch(`${BASE}questions_strategy.json`).then(r => r.json()),
            fetch(`${BASE}questions_management.json`).then(r => r.json()),
        ]);

        allQuestions = [...tech, ...strategy, ...management];
        loaded = true;
        return allQuestions;
    } catch (err) {
        console.error('Failed to load questions:', err);
        return [];
    }
}

export function getAllQuestions() {
    return allQuestions;
}

export function getQuestionById(id) {
    return allQuestions.find(q => q.id === id);
}

export function getQuestionsByCategory(category) {
    return allQuestions.filter(q => q.category === category);
}

export function getQuestionsBySubcategory(subcategory) {
    return allQuestions.filter(q => q.subcategory === subcategory);
}

export function getCategories() {
    const cats = new Map();
    allQuestions.forEach(q => {
        if (!cats.has(q.category)) {
            cats.set(q.category, new Set());
        }
        cats.get(q.category).add(q.subcategory);
    });

    return Array.from(cats.entries()).map(([category, subs]) => ({
        category,
        subcategories: Array.from(subs),
    }));
}

export function getSubcategoryCount(subcategory) {
    return allQuestions.filter(q => q.subcategory === subcategory).length;
}

export function shuffleArray(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export function getQuizQuestions(filter = {}) {
    let pool = [...allQuestions];

    if (filter.category) {
        pool = pool.filter(q => q.category === filter.category);
    }
    if (filter.subcategory) {
        pool = pool.filter(q => q.subcategory === filter.subcategory);
    }
    if (filter.ids) {
        pool = pool.filter(q => filter.ids.includes(q.id));
    }

    pool = shuffleArray(pool);

    const count = filter.count || Math.min(10, pool.length);
    return pool.slice(0, count);
}

export const CATEGORY_INFO = {
    'テクノロジ系': {
        icon: '💻',
        color: 'tech',
        cssClass: 'tech',
    },
    'ストラテジ系': {
        icon: '📊',
        color: 'strategy',
        cssClass: 'strategy',
    },
    'マネジメント系': {
        icon: '📋',
        color: 'management',
        cssClass: 'management',
    },
};
