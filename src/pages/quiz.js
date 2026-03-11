// Quiz page - question display, answer selection, explanation

import { getQuizQuestions, getQuestionById, CATEGORY_INFO, shuffleArray } from '../data.js';
import { saveAnswer, getWeakQuestionIds } from '../storage.js';
import { navigate } from '../main.js';

let currentQuestions = [];
let currentIndex = 0;
let sessionCorrect = 0;
let sessionTotal = 0;
let answered = false;

export function renderQuiz(container, params = {}) {
    // Build question pool based on mode
    currentIndex = 0;
    sessionCorrect = 0;
    sessionTotal = 0;
    answered = false;

    if (params.mode === 'random') {
        currentQuestions = getQuizQuestions({ count: params.count || 10 });
    } else if (params.mode === 'category') {
        currentQuestions = getQuizQuestions({ category: params.category, count: params.count || 10 });
    } else if (params.mode === 'subcategory') {
        currentQuestions = getQuizQuestions({ subcategory: params.subcategory, count: 999 });
    } else if (params.mode === 'weak') {
        const weakIds = getWeakQuestionIds();
        if (weakIds.length === 0) {
            renderEmptyWeak(container);
            return;
        }
        currentQuestions = getQuizQuestions({ ids: weakIds, count: Math.min(10, weakIds.length) });
    } else {
        currentQuestions = getQuizQuestions({ count: 10 });
    }

    if (currentQuestions.length === 0) {
        renderEmptyWeak(container);
        return;
    }

    renderQuestion(container);
}

function renderEmptyWeak(container) {
    container.innerHTML = `
    <div class="quiz-page fade-in">
      <div class="empty-state">
        <div class="empty-state-icon">✨</div>
        <p class="empty-state-text">苦手問題はありません！<br/>まずは問題を解いてみましょう。</p>
        <div style="margin-top: var(--space-xl);">
          <button class="btn-primary" id="go-home">ホームに戻る</button>
        </div>
      </div>
    </div>
  `;
    container.querySelector('#go-home').addEventListener('click', () => navigate('home'));
}

function renderQuestion(container) {
    const q = currentQuestions[currentIndex];
    const info = CATEGORY_INFO[q.category] || { icon: '📝', cssClass: 'tech' };
    const progress = ((currentIndex) / currentQuestions.length) * 100;
    answered = false;

    container.innerHTML = `
    <div class="quiz-page fade-in">
      <div class="quiz-header">
        <span class="quiz-progress-text">${currentIndex + 1} / ${currentQuestions.length}</span>
        <div class="quiz-progress-bar">
          <div class="quiz-progress-fill" style="width: ${progress}%"></div>
        </div>
        <span class="quiz-category-tag category-badge ${info.cssClass}">${info.icon} ${q.category}</span>
      </div>

      <div class="quiz-question-area slide-up">
        <div class="quiz-topic">${q.subcategory} › ${q.topic}</div>
        <p class="quiz-question-text">${q.question}</p>
      </div>

      <div class="quiz-choices" id="choices-area">
        ${Object.entries(q.choices).map(([key, value]) => `
          <button class="choice-btn" data-key="${key}" id="choice-${key}">
            <span class="choice-label">${key}</span>
            <span class="choice-text">${value}</span>
          </button>
        `).join('')}
      </div>

      <div id="explanation-area"></div>
      <div id="next-area"></div>
    </div>
  `;

    // Set up click handlers
    container.querySelectorAll('.choice-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (answered) return;
            handleAnswer(container, btn.dataset.key);
        });
    });
}

function handleAnswer(container, selectedKey) {
    answered = true;
    const q = currentQuestions[currentIndex];
    const isCorrect = selectedKey === q.answer;

    sessionTotal++;
    if (isCorrect) sessionCorrect++;

    // Save to storage
    saveAnswer({
        question_id: q.id,
        category: q.category,
        subcategory: q.subcategory,
        user_answer: selectedKey,
        correct_answer: q.answer,
        is_correct: isCorrect,
    });

    // Update button styles
    container.querySelectorAll('.choice-btn').forEach(btn => {
        btn.classList.add('disabled');
        if (btn.dataset.key === q.answer) {
            btn.classList.add('correct');
        } else if (btn.dataset.key === selectedKey && !isCorrect) {
            btn.classList.add('incorrect');
        }
    });

    // Show explanation
    const explanationArea = container.querySelector('#explanation-area');
    explanationArea.innerHTML = `
    <div class="quiz-explanation">
      <div class="explanation-header ${isCorrect ? 'correct' : 'incorrect'}">
        ${isCorrect ? '✅ 正解！' : `❌ 不正解（正解: ${q.answer}）`}
      </div>
      <p class="explanation-text">${q.explanation}</p>
    </div>
  `;

    // Show next button
    const nextArea = container.querySelector('#next-area');
    const isLast = currentIndex >= currentQuestions.length - 1;
    nextArea.innerHTML = `
    <button class="quiz-next-btn" id="next-btn">
      ${isLast ? '結果を見る →' : '次の問題 →'}
    </button>
  `;

    container.querySelector('#next-btn').addEventListener('click', () => {
        if (isLast) {
            renderComplete(container);
        } else {
            currentIndex++;
            renderQuestion(container);
        }
    });
}

function renderComplete(container) {
    const rate = sessionTotal > 0 ? Math.round((sessionCorrect / sessionTotal) * 100) : 0;
    let emoji = '🎉';
    let message = '素晴らしい！';
    if (rate < 50) {
        emoji = '💪';
        message = '次はもっと良くなる！';
    } else if (rate < 80) {
        emoji = '👍';
        message = 'いい調子です！';
    }

    container.innerHTML = `
    <div class="quiz-page">
      <div class="quiz-complete fade-in">
        <div class="quiz-complete-icon">${emoji}</div>
        <h2 class="quiz-complete-title">${message}</h2>
        <div class="quiz-complete-stats">
          <div class="complete-stat">
            <div class="complete-stat-value" style="color: var(--accent-emerald)">${sessionCorrect}</div>
            <div class="complete-stat-label">正解数</div>
          </div>
          <div class="complete-stat">
            <div class="complete-stat-value" style="color: var(--accent-blue-light)">${sessionTotal}</div>
            <div class="complete-stat-label">出題数</div>
          </div>
          <div class="complete-stat">
            <div class="complete-stat-value" style="color: ${rate >= 80 ? 'var(--accent-emerald)' : rate >= 50 ? 'var(--accent-amber)' : 'var(--accent-rose)'}">${rate}%</div>
            <div class="complete-stat-label">正答率</div>
          </div>
          <div class="complete-stat">
            <div class="complete-stat-value" style="color: var(--accent-purple-light)">${sessionTotal - sessionCorrect}</div>
            <div class="complete-stat-label">不正解数</div>
          </div>
        </div>
        <div class="complete-actions">
          <button class="btn-primary" id="retry-btn">もう一度挑戦</button>
          <button class="btn-secondary" id="home-btn">ホームに戻る</button>
        </div>
      </div>
    </div>
  `;

    container.querySelector('#retry-btn').addEventListener('click', () => {
        // Re-shuffle and restart
        currentQuestions = shuffleArray(currentQuestions);
        currentIndex = 0;
        sessionCorrect = 0;
        sessionTotal = 0;
        renderQuestion(container);
    });

    container.querySelector('#home-btn').addEventListener('click', () => navigate('home'));
}
