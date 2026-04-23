const API_URL = '/polls';

// DOM Elements
const form = document.getElementById('create-poll-form');
const optionsContainer = document.getElementById('options-container');
const addOptionBtn = document.getElementById('add-option-btn');
const formError = document.getElementById('form-error');
const pollsList = document.getElementById('polls-list');
const refreshBtn = document.getElementById('refresh-polls-btn');
const template = document.getElementById('poll-card-template');

// State
let maxOptions = 4;
let minOptions = 2;

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Set dynamic year in footer
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Page-aware initialization
    if (pollsList) {
        fetchPolls();
    }
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', fetchPolls);
    }
    
    if (addOptionBtn) {
        addOptionBtn.addEventListener('click', handleAddOption);
    }
    
    if (form) {
        form.addEventListener('submit', handleCreatePoll);
    }
});

// --- Dynamic Form Logic ---
function handleAddOption() {
    const currentOptions = optionsContainer.querySelectorAll('.option-group').length;
    
    if (currentOptions >= maxOptions) {
        showError(`Maximum ${maxOptions} options allowed.`);
        return;
    }

    const optionGroup = document.createElement('div');
    optionGroup.className = 'form-group option-group';
    
    optionGroup.innerHTML = `
        <input type="text" class="option-input" placeholder="Option ${currentOptions + 1}" required>
        <button type="button" class="btn-outline" style="border:none; color:var(--danger); cursor:pointer; padding:0.5rem;" title="Remove">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
    `;

    const removeBtn = optionGroup.querySelector('button');
    removeBtn.addEventListener('click', () => {
        optionGroup.remove();
        updateOptionPlaceholders();
        hideError();
    });

    optionsContainer.appendChild(optionGroup);
    hideError();
}

function updateOptionPlaceholders() {
    const inputs = optionsContainer.querySelectorAll('.option-input');
    inputs.forEach((input, index) => {
        input.placeholder = `Option ${index + 1}`;
    });
}

function showError(msg) {
    if (!formError) return;
    formError.textContent = msg;
    formError.classList.remove('hidden');
}

function hideError() {
    if (!formError) return;
    formError.classList.add('hidden');
}

// --- API Interactions ---

async function handleCreatePoll(e) {
    e.preventDefault();
    hideError();

    const createBtn = document.getElementById('create-poll-btn');
    const originalBtnContent = createBtn.innerHTML;
    
    const questionInput = document.getElementById('question');
    const optionInputs = optionsContainer.querySelectorAll('.option-input');
    
    const question = questionInput.value.trim();
    const options = Array.from(optionInputs)
        .map(input => input.value.trim())
        .filter(val => val !== '');

    if (!question) {
        showError('Please enter a question.');
        return;
    }

    if (options.length < minOptions) {
        showError(`Please provide at least ${minOptions} options.`);
        return;
    }

    try {
        createBtn.disabled = true;
        createBtn.innerHTML = 'Launching...';

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question, options })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to create poll');
        }

        // Redirect to browsing page after success
        window.location.href = 'polls.html';
    } catch (err) {
        showError(err.message);
    } finally {
        if (createBtn) {
            createBtn.disabled = false;
            createBtn.innerHTML = originalBtnContent;
        }
    }
}

async function fetchPolls() {
    if (!pollsList) return;
    
    try {
        pollsList.innerHTML = '<div style="text-align: center; grid-column: 1/-1; padding: 4rem;"><p style="color: var(--text-dim);">Fetching live polls...</p></div>';
        
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch polls');
        
        const polls = await response.json();
        renderPolls(polls);
    } catch (err) {
        pollsList.innerHTML = `<div class="error-msg" style="grid-column: 1/-1; text-align: center; padding: 2rem;">Error: ${err.message}. Please check if the backend is running.</div>`;
    }
}

async function fetchPollResults(id) {
    try {
        const response = await fetch(`${API_URL}/${id}/results`);
        if (!response.ok) throw new Error('Failed to fetch results');
        return await response.json();
    } catch (err) {
        console.error(err);
        return null;
    }
}

async function deletePoll(id) {
    if (!confirm('Are you sure you want to delete this poll?')) return;
    
    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete poll');
        
        localStorage.removeItem(`voted_poll_${id}`);
        fetchPolls();
    } catch (err) {
        alert(err.message);
    }
}

async function votePoll(pollId, optionIndex) {
    try {
        const response = await fetch(`${API_URL}/${pollId}/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ optionIndex })
        });

        if (!response.ok) throw new Error('Failed to cast vote');
        
        // Save vote to local storage to prevent duplicates
        localStorage.setItem(`voted_poll_${pollId}`, 'true');
        
        // Fetch new results and update the UI
        const resultsData = await fetchPollResults(pollId);
        if (resultsData) {
            updatePollCardUI(pollId, resultsData);
        }
    } catch (err) {
        alert(err.message);
    }
}

// --- UI Rendering ---

function renderPolls(polls) {
    if (!pollsList) return;
    pollsList.innerHTML = '';
    
    if (polls.length === 0) {
        pollsList.innerHTML = '<div style="text-align: center; grid-column: 1/-1; padding: 4rem;"><p style="color: var(--text-dim);">No active polls. Why not <a href="create.html" style="color:var(--primary); font-weight:700;">create one?</a></p></div>';
        return;
    }

    const pollsToRender = [...polls].reverse();
    
    pollsToRender.forEach(poll => {
        const clone = template.content.cloneNode(true);
        const card = clone.querySelector('.poll-card');
        card.dataset.pollId = poll.id;
        
        const questionEl = card.querySelector('.poll-question');
        questionEl.textContent = poll.question;
        
        const deleteBtn = card.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deletePoll(poll.id));
        
        const optionsContainer = card.querySelector('.poll-options');
        const totalVotesEl = card.querySelector('.total-votes');
        const badge = card.querySelector('.voted-badge');
        
        const hasVoted = localStorage.getItem(`voted_poll_${poll.id}`);
        
        const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
        totalVotesEl.textContent = `${totalVotes} vote${totalVotes !== 1 ? 's' : ''}`;

        if (hasVoted) {
            badge.classList.remove('hidden');
            renderResultsView(optionsContainer, poll.options, totalVotes);
        } else {
            renderVotingView(optionsContainer, poll);
        }

        pollsList.appendChild(clone);
    });
}

function renderVotingView(container, poll) {
    container.innerHTML = '';
    poll.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'vote-btn';
        btn.innerHTML = `<span>${opt.text}</span>`;
        btn.addEventListener('click', () => {
            const allBtns = container.querySelectorAll('.vote-btn');
            allBtns.forEach(b => b.disabled = true);
            votePoll(poll.id, index);
        });
        container.appendChild(btn);
    });
}

function renderResultsView(container, optionsData, totalVotes) {
    container.innerHTML = '';
    
    const results = optionsData.map(opt => {
        const percentage = totalVotes === 0 ? 0 : Math.round((opt.votes || 0) / totalVotes * 100);
        return { text: opt.text, votes: opt.votes || 0, percentage };
    });

    const maxVotes = Math.max(...results.map(r => r.votes));

    results.forEach(res => {
        const row = document.createElement('div');
        const isWinner = res.votes === maxVotes && maxVotes > 0;
        row.className = `result-row ${isWinner ? 'winner' : ''}`;
        
        row.innerHTML = `
            <div class="result-label">
                <span>${res.text}</span>
                <span>${res.percentage}%</span>
            </div>
            <div class="progress-container">
                <div class="progress-bar" style="width: ${res.percentage}%"></div>
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem; text-align: right;">
                ${res.votes} votes
            </div>
        `;
        container.appendChild(row);
    });
}

function updatePollCardUI(pollId, resultsData) {
    const card = document.querySelector(`.poll-card[data-poll-id="${pollId}"]`);
    if (!card) return;

    const optionsContainer = card.querySelector('.poll-options');
    const totalVotesEl = card.querySelector('.total-votes');
    const badge = card.querySelector('.voted-badge');

    badge.classList.remove('hidden');
    totalVotesEl.textContent = `${resultsData.totalVotes} vote${resultsData.totalVotes !== 1 ? 's' : ''}`;
    
    renderResultsView(optionsContainer, resultsData.results, resultsData.totalVotes);
}


