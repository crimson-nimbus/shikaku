// Main entry point - router and app shell

import './index.css';
import { loadQuestions } from './data.js';
import { renderHome } from './pages/home.js';
import { renderSelect } from './pages/select.js';
import { renderQuiz } from './pages/quiz.js';
import { renderResults } from './pages/results.js';

let currentPage = 'home';
let currentParams = {};

export function navigate(page, params = {}) {
    currentPage = page;
    currentParams = params;
    render();
}

function render() {
    const app = document.getElementById('app');

    app.innerHTML = `
    <header class="header">
      <div class="header-logo" id="logo">
        <span class="logo-icon">🎓</span>
        <span>ITパスポート学習</span>
      </div>
      <nav class="header-nav">
        <button class="nav-btn ${currentPage === 'home' ? 'active' : ''}" data-page="home">
          <span>🏠</span>
          <span class="nav-text">ホーム</span>
        </button>
        <button class="nav-btn ${currentPage === 'select' ? 'active' : ''}" data-page="select">
          <span>📚</span>
          <span class="nav-text">分野別</span>
        </button>
        <button class="nav-btn ${currentPage === 'results' ? 'active' : ''}" data-page="results">
          <span>📊</span>
          <span class="nav-text">成績</span>
        </button>
      </nav>
    </header>
    <main class="main-content" id="page-content"></main>
  `;

    const content = app.querySelector('#page-content');

    switch (currentPage) {
        case 'home':
            renderHome(content);
            break;
        case 'select':
            renderSelect(content);
            break;
        case 'quiz':
            renderQuiz(content, currentParams);
            break;
        case 'results':
            renderResults(content);
            break;
        default:
            renderHome(content);
    }

    // Navigation event listeners
    app.querySelector('#logo').addEventListener('click', () => navigate('home'));
    app.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            navigate(btn.dataset.page);
        });
    });

    // Scroll to top on page change
    window.scrollTo(0, 0);
}

// Initialize
async function init() {
    const app = document.getElementById('app');
    app.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; flex-direction: column; gap: 1rem;">
      <div class="logo-icon" style="font-size: 3rem;">🎓</div>
      <div style="color: var(--text-secondary); font-size: 1.125rem;">読み込み中...</div>
    </div>
  `;

    await loadQuestions();
    render();
}

init();
