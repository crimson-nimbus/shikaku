// Results page - stats, charts, and history

import { getStats, getCategoryStats, getRecentHistory, clearHistory } from '../storage.js';
import { getQuestionById, CATEGORY_INFO } from '../data.js';
import { navigate } from '../main.js';

export function renderResults(container) {
    const stats = getStats();
    const catStats = {
        'テクノロジ系': getCategoryStats('テクノロジ系'),
        'ストラテジ系': getCategoryStats('ストラテジ系'),
        'マネジメント系': getCategoryStats('マネジメント系'),
    };
    const recent = getRecentHistory(30);

    const rateClass = stats.rate >= 80 ? 'good' : stats.rate >= 50 ? 'average' : 'poor';

    container.innerHTML = `
    <div class="results-page fade-in">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-xl);">
        <h1 class="section-title" style="margin-bottom: 0;">📊 学習成績</h1>
        <button class="reset-btn" id="reset-btn">履歴をリセット</button>
      </div>

      <div class="results-overview slide-up">
        <div class="result-card">
          <div class="result-card-value ${rateClass}">${stats.rate}%</div>
          <div class="result-card-label">総合正答率</div>
        </div>
        <div class="result-card">
          <div class="result-card-value" style="color: var(--accent-emerald)">${stats.correct}</div>
          <div class="result-card-label">正解数</div>
        </div>
        <div class="result-card">
          <div class="result-card-value" style="color: var(--accent-blue-light)">${stats.total}</div>
          <div class="result-card-label">解答数</div>
        </div>
        <div class="result-card">
          <div class="result-card-value" style="color: var(--accent-rose)">${stats.total - stats.correct}</div>
          <div class="result-card-label">不正解数</div>
        </div>
      </div>

      <div class="chart-section slide-up">
        <h2 class="section-title">📈 分野別正答率</h2>
        ${renderChartBars(catStats)}
      </div>

      <div class="history-section slide-up">
        <h2 class="section-title">📝 最近の回答履歴</h2>
        ${recent.length > 0 ? renderHistoryList(recent) : '<div class="empty-state"><div class="empty-state-icon">📭</div><p class="empty-state-text">まだ回答履歴がありません</p></div>'}
      </div>
    </div>
  `;

    container.querySelector('#reset-btn').addEventListener('click', () => {
        if (confirm('学習履歴をすべて削除しますか？\nこの操作は元に戻せません。')) {
            clearHistory();
            renderResults(container);
        }
    });
}

function renderChartBars(catStats) {
    const categories = [
        { name: 'テクノロジ系', cssClass: 'tech' },
        { name: 'ストラテジ系', cssClass: 'strategy' },
        { name: 'マネジメント系', cssClass: 'management' },
    ];

    return categories.map(cat => {
        const s = catStats[cat.name];
        const info = CATEGORY_INFO[cat.name];
        return `
      <div class="chart-bar-row">
        <span class="chart-label">${info.icon} ${cat.name}</span>
        <div class="chart-bar-bg">
          <div class="chart-bar-fill ${cat.cssClass}" style="width: ${s.rate}%">
            ${s.rate > 10 ? s.rate + '%' : ''}
          </div>
        </div>
        <span style="font-size: var(--font-size-sm); color: var(--text-secondary); width: 60px; text-align: right; flex-shrink: 0;">
          ${s.correct}/${s.total}
        </span>
      </div>
    `;
    }).join('');
}

function renderHistoryList(recent) {
    return `
    <div class="history-list">
      ${recent.map(h => {
        const q = getQuestionById(h.question_id);
        const questionText = q ? q.question : h.question_id;
        const shortQuestion = questionText.length > 50 ? questionText.slice(0, 50) + '…' : questionText;
        return `
          <div class="history-item">
            <span class="history-icon">${h.is_correct ? '✅' : '❌'}</span>
            <span class="history-question" title="${questionText}">${shortQuestion}</span>
            <span class="history-result ${h.is_correct ? 'correct' : 'incorrect'}">
              ${h.is_correct ? '正解' : '不正解'}
            </span>
          </div>
        `;
    }).join('')}
    </div>
  `;
}
