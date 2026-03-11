// Home page - dashboard with stats and mode selection

import { getStats, getCategoryStats } from '../storage.js';
import { getAllQuestions, CATEGORY_INFO } from '../data.js';
import { navigate } from '../main.js';

export function renderHome(container) {
    const stats = getStats();
    const questions = getAllQuestions();
    const catStats = {
        'テクノロジ系': getCategoryStats('テクノロジ系'),
        'ストラテジ系': getCategoryStats('ストラテジ系'),
        'マネジメント系': getCategoryStats('マネジメント系'),
    };

    container.innerHTML = `
    <div class="hero fade-in">
      <h1 class="hero-title">ITパスポート学習</h1>
      <p class="hero-subtitle">分野別・ランダム出題でITパスポート試験を効率的に対策しましょう</p>
    </div>

    <div class="stats-row slide-up">
      <div class="stat-card">
        <div class="stat-value">${questions.length}</div>
        <div class="stat-label">総問題数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.total}</div>
        <div class="stat-label">解答済み</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.rate}%</div>
        <div class="stat-label">正答率</div>
      </div>
    </div>

    <div class="mode-grid slide-up">
      <div class="mode-card" data-color="blue" id="mode-category">
        <span class="mode-card-icon">📚</span>
        <h3 class="mode-card-title">分野別に学習</h3>
        <p class="mode-card-desc">テクノロジ系・ストラテジ系・マネジメント系から分野を選んで集中的に学習</p>
      </div>
      <div class="mode-card" data-color="purple" id="mode-random">
        <span class="mode-card-icon">🎲</span>
        <h3 class="mode-card-title">ランダム出題</h3>
        <p class="mode-card-desc">全分野からランダムに10問を出題。実力チェックに最適</p>
      </div>
      <div class="mode-card" data-color="amber" id="mode-weak">
        <span class="mode-card-icon">🔥</span>
        <h3 class="mode-card-title">苦手問題</h3>
        <p class="mode-card-desc">過去に間違えた問題を重点的に復習</p>
      </div>
    </div>

    <div class="category-progress slide-up">
      <h2 class="section-title">📈 分野別正答率</h2>
      ${renderProgressBars(catStats)}
    </div>
  `;

    // Event listeners
    container.querySelector('#mode-category').addEventListener('click', () => {
        navigate('select');
    });

    container.querySelector('#mode-random').addEventListener('click', () => {
        navigate('quiz', { mode: 'random', count: 10 });
    });

    container.querySelector('#mode-weak').addEventListener('click', () => {
        navigate('quiz', { mode: 'weak' });
    });
}

function renderProgressBars(catStats) {
    const categories = [
        { name: 'テクノロジ系', cssClass: 'tech' },
        { name: 'ストラテジ系', cssClass: 'strategy' },
        { name: 'マネジメント系', cssClass: 'management' },
    ];

    return categories.map(cat => {
        const s = catStats[cat.name];
        return `
      <div class="progress-item">
        <span class="progress-label">${CATEGORY_INFO[cat.name].icon} ${cat.name}</span>
        <div class="progress-bar-container">
          <div class="progress-bar ${cat.cssClass}" style="width: ${s.rate}%"></div>
        </div>
        <span class="progress-percent">${s.rate}%</span>
      </div>
    `;
    }).join('');
}
