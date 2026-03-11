// Select page - choose category/subcategory for quiz

import { getCategories, getSubcategoryCount, CATEGORY_INFO } from '../data.js';
import { navigate } from '../main.js';

export function renderSelect(container) {
    const categories = getCategories();

    // Define display order
    const order = ['テクノロジ系', 'ストラテジ系', 'マネジメント系'];
    const sorted = order
        .map(name => categories.find(c => c.category === name))
        .filter(Boolean);

    container.innerHTML = `
    <div class="select-page fade-in">
      <h1 class="section-title">📚 分野を選択</h1>
      ${sorted.map(cat => renderCategorySection(cat)).join('')}
    </div>
  `;

    // Event: select all buttons
    container.querySelectorAll('.select-all-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            navigate('quiz', { mode: 'category', category, count: 10 });
        });
    });

    // Event: subcategory buttons
    container.querySelectorAll('.subcategory-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const subcategory = btn.dataset.subcategory;
            const category = btn.dataset.category;
            navigate('quiz', { mode: 'subcategory', category, subcategory });
        });
    });
}

function renderCategorySection(cat) {
    const info = CATEGORY_INFO[cat.category] || { icon: '📝', cssClass: 'tech' };

    return `
    <div class="category-section slide-up">
      <div class="category-header">
        <span class="category-badge ${info.cssClass}">${info.icon} ${cat.category}</span>
      </div>
      <button class="select-all-btn ${info.cssClass}" data-category="${cat.category}">
        ${cat.category}の問題をランダムに10問出題 →
      </button>
      <div class="subcategory-grid">
        ${cat.subcategories.map(sub => {
        const count = getSubcategoryCount(sub);
        return `
            <button class="subcategory-btn" data-subcategory="${sub}" data-category="${cat.category}">
              <span>${sub}</span>
              <span class="count">${count}問</span>
            </button>
          `;
    }).join('')}
      </div>
    </div>
  `;
}
