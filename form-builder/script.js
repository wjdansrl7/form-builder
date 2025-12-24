// ============================================
// State Management
// ============================================
let questions = [];
let questionIdCounter = 0;

// ============================================
// DOM Elements
// ============================================
const builderMode = document.getElementById('builderMode');
const previewMode = document.getElementById('previewMode');
const resultsMode = document.getElementById('resultsMode');

const questionsContainer = document.getElementById('questionsContainer');
const previewBtn = document.getElementById('previewBtn');
const resetBtn = document.getElementById('resetBtn');
const backToEditBtn = document.getElementById('backToEditBtn');
const backToBuilderBtn = document.getElementById('backToBuilderBtn');
const newResponseBtn = document.getElementById('newResponseBtn');

const formTitle = document.getElementById('formTitle');
const formDescription = document.getElementById('formDescription');

// Settings Modal Elements
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const sheetsUrlInput = document.getElementById('sheetsUrl');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const clearUrlBtn = document.getElementById('clearUrlBtn');
const setupGuideLink = document.getElementById('setupGuideLink');
const connectionStatus = document.getElementById('connectionStatus');

// Google Sheets URL (stored in localStorage)
let googleSheetsUrl = localStorage.getItem('googleSheetsUrl') || '';

// ============================================
// Question Type Handlers
// ============================================
document.querySelectorAll('.question-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        addQuestion(type);
    });
});

function addQuestion(type) {
    const question = {
        id: questionIdCounter++,
        type: type,
        title: '',
        options: type === 'multiple' || type === 'checkbox' ? ['옵션 1'] : null,
        maxSelections: type === 'checkbox' ? null : null, // null = unlimited for checkboxes
        sum100Items: type === 'sum100' ? [
            { label: '항목 1', value: 0 },
            { label: '항목 2', value: 0 },
            { label: '항목 3', value: 0 },
            { label: '항목 4', value: 0 }
        ] : null
    };

    questions.push(question);
    renderQuestions();
}

function deleteQuestion(id) {
    questions = questions.filter(q => q.id !== id);
    renderQuestions();
}

// ============================================
// Render Builder Questions
// ============================================
function renderQuestions() {
    questionsContainer.innerHTML = '';

    questions.forEach(question => {
        const card = document.createElement('div');
        card.className = 'question-card card';

        const typeLabels = {
            'short': '단답형',
            'paragraph': '주관식',
            'multiple': '객관식',
            'checkbox': '체크박스',
            'sum100': '합계 100점'
        };

        card.innerHTML = `
            <div class="question-header">
                <input 
                    type="text" 
                    class="question-title-input" 
                    placeholder="질문을 입력하세요"
                    value="${question.title}"
                    data-id="${question.id}"
                >
                <div style="display: flex; align-items: center;">
                    <span class="question-type-badge">${typeLabels[question.type]}</span>
                    <button class="delete-question-btn" data-id="${question.id}">×</button>
                </div>
            </div>
            <div class="question-content" data-id="${question.id}">
                ${renderQuestionContent(question)}
            </div>
        `;

        questionsContainer.appendChild(card);
    });

    // Event listeners
    document.querySelectorAll('.question-title-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const id = parseInt(e.target.dataset.id);
            const question = questions.find(q => q.id === id);
            if (question) question.title = e.target.value;
        });
    });

    document.querySelectorAll('.delete-question-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            deleteQuestion(id);
        });
    });

    setupQuestionTypeEventListeners();
}

function renderQuestionContent(question) {
    switch (question.type) {
        case 'short':
            return '<p style="color: var(--text-secondary); font-style: italic;">단답형 텍스트 입력</p>';

        case 'paragraph':
            return '<p style="color: var(--text-secondary); font-style: italic;">주관식 장문 입력 (여러 줄)</p>';

        case 'multiple':
        case 'checkbox':
            return renderOptionsEditor(question);

        case 'sum100':
            return renderSum100Editor(question);

        default:
            return '';
    }
}

function renderOptionsEditor(question) {
    let html = '<div class="options-container">';

    question.options.forEach((option, index) => {
        html += `
            <div class="option-item">
                <input 
                    type="text" 
                    value="${option}" 
                    data-id="${question.id}" 
                    data-index="${index}"
                    class="option-input"
                    placeholder="옵션 ${index + 1}"
                >
                ${question.options.length > 1 ? `
                    <button class="remove-option-btn" data-id="${question.id}" data-index="${index}">×</button>
                ` : ''}
            </div>
        `;
    });

    html += `
        <button class="btn btn-outline btn-small add-option-btn" data-id="${question.id}">
            + 옵션 추가
        </button>
    `;

    // Add max selections input for checkbox questions
    if (question.type === 'checkbox') {
        html += `
            <div style="margin-top: var(--space-lg); padding-top: var(--space-lg); border-top: 1px solid var(--border);">
                <label style="color: var(--text-primary); font-weight: 600; display: block; margin-bottom: var(--space-sm);">
                    최대 선택 가능 개수 (선택사항)
                </label>
                <input 
                    type="number" 
                    min="1" 
                    max="${question.options.length}" 
                    value="${question.maxSelections || ''}" 
                    placeholder="제한 없음" 
                    class="max-selections-input" 
                    data-id="${question.id}"
                    style="width: 150px; padding: var(--space-sm) var(--space-md); background: var(--bg-tertiary); border: 2px solid var(--border); border-radius: var(--radius-sm); color: var(--text-primary); font-family: inherit;"
                >
                <small style="display: block; color: var(--text-secondary); margin-top: var(--space-xs);">
                    빈 칸으로 두면 제한 없음
                </small>
            </div>
        `;
    }

    html += '</div>';

    return html;
}

function renderSum100Editor(question) {
    return `
        <div class="sum100-container">
            <div class="sum100-items">
                ${question.sum100Items.map((item, index) => `
                    <div class="sum100-item">
                        <input 
                            type="text" 
                            value="${item.label}" 
                            data-id="${question.id}" 
                            data-index="${index}"
                            class="sum100-label-input"
                            placeholder="항목 이름"
                        >
                        <input 
                            type="number" 
                            value="${item.value}" 
                            min="0" 
                            max="100"
                            data-id="${question.id}" 
                            data-index="${index}"
                            class="sum100-value-input"
                            placeholder="0"
                        >
                    </div>
                `).join('')}
            </div>
            <div class="sum100-status" data-id="${question.id}">
                <div class="sum-display">0 / 100</div>
                <div class="sum-label">합계가 100이 되어야 합니다</div>
            </div>
        </div>
    `;
}

// ============================================
// Event Listeners for Question Content
// ============================================
function setupQuestionTypeEventListeners() {
    // Option inputs
    document.querySelectorAll('.option-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const id = parseInt(e.target.dataset.id);
            const index = parseInt(e.target.dataset.index);
            const question = questions.find(q => q.id === id);
            if (question) question.options[index] = e.target.value;
        });
    });

    // Remove option buttons
    document.querySelectorAll('.remove-option-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            const index = parseInt(e.target.dataset.index);
            const question = questions.find(q => q.id === id);
            if (question && question.options.length > 1) {
                question.options.splice(index, 1);
                renderQuestions();
            }
        });
    });

    // Add option buttons
    document.querySelectorAll('.add-option-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            const question = questions.find(q => q.id === id);
            if (question) {
                question.options.push(`옵션 ${question.options.length + 1}`);
                renderQuestions();
            }
        });
    });

    // Max selections input for checkbox questions
    document.querySelectorAll('.max-selections-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const id = parseInt(e.target.dataset.id);
            const question = questions.find(q => q.id === id);
            if (question) {
                const value = parseInt(e.target.value);
                question.maxSelections = value > 0 ? value : null;
            }
        });
    });

    // Sum100 label inputs
    document.querySelectorAll('.sum100-label-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const id = parseInt(e.target.dataset.id);
            const index = parseInt(e.target.dataset.index);
            const question = questions.find(q => q.id === id);
            if (question) question.sum100Items[index].label = e.target.value;
        });
    });

    // Sum100 value inputs
    document.querySelectorAll('.sum100-value-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const id = parseInt(e.target.dataset.id);
            const index = parseInt(e.target.dataset.index);
            const question = questions.find(q => q.id === id);
            if (question) {
                question.sum100Items[index].value = parseInt(e.target.value) || 0;
                updateSum100Status(id);
            }
        });
    });
}

function updateSum100Status(questionId) {
    const question = questions.find(q => q.id === questionId);
    if (!question || question.type !== 'sum100') return;

    const sum = question.sum100Items.reduce((total, item) => total + item.value, 0);
    const statusDiv = document.querySelector(`.sum100-status[data-id="${questionId}"]`);

    if (statusDiv) {
        statusDiv.querySelector('.sum-display').textContent = `${sum} / 100`;

        if (sum === 100) {
            statusDiv.classList.add('valid');
            statusDiv.classList.remove('invalid');
            statusDiv.querySelector('.sum-label').textContent = '✓ 완료!';
        } else {
            statusDiv.classList.remove('valid');
            statusDiv.classList.add('invalid');
            statusDiv.querySelector('.sum-label').textContent = '합계가 100이 되어야 합니다';
        }
    }
}

// ============================================
// Preview Mode
// ============================================
previewBtn.addEventListener('click', () => {
    if (questions.length === 0) {
        alert('질문을 먼저 추가해주세요!');
        return;
    }

    showPreview();
});

function showPreview() {
    builderMode.style.display = 'none';
    previewMode.style.display = 'block';
    resultsMode.style.display = 'none';

    document.getElementById('previewTitle').textContent = formTitle.value || '새로운 설문';
    document.getElementById('previewDescription').textContent = formDescription.value;

    const container = document.getElementById('previewQuestionsContainer');
    container.innerHTML = '';

    questions.forEach((question, qIndex) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="preview-question">
                <div class="preview-question-title">${qIndex + 1}. ${question.title || '제목 없음'}${question.type === 'checkbox' && question.maxSelections ? ` <span style="color: var(--warning);">(최대 ${question.maxSelections}개 선택)</span>` : ''}</div>
                ${renderPreviewQuestionContent(question)}
            </div>
        `;
        container.appendChild(card);
    });

    setupPreviewEventListeners();
}

function renderPreviewQuestionContent(question) {
    switch (question.type) {
        case 'short':
            return `<input type="text" class="preview-answer" data-id="${question.id}" placeholder="답변을 입력하세요">`;

        case 'paragraph':
            return `<textarea class="preview-answer" data-id="${question.id}" placeholder="답변을 입력하세요" rows="5" style="width: 100%; min-height: 120px; resize: vertical;"></textarea>`;

        case 'multiple':
            return question.options.map((option, index) => `
                <div class="preview-option">
                    <input type="radio" name="q${question.id}" value="${option}" id="q${question.id}_${index}">
                    <label for="q${question.id}_${index}">${option}</label>
                </div>
            `).join('');

        case 'checkbox':
            return question.options.map((option, index) => `
                <div class="preview-option">
                    <input type="checkbox" name="q${question.id}" value="${option}" id="q${question.id}_${index}" class="preview-checkbox" data-question-id="${question.id}">
                    <label for="q${question.id}_${index}">${option}</label>
                </div>
            `).join('');

        case 'sum100':
            return `
                <div class="sum100-container">
                    <div class="sum100-items">
                        ${question.sum100Items.map((item, index) => `
                            <div class="sum100-item">
                                <span style="color: var(--text-primary); font-weight: 500;">${item.label}</span>
                                <input 
                                    type="number" 
                                    min="0" 
                                    max="100" 
                                    value="0"
                                    class="preview-sum100-input"
                                    data-id="${question.id}"
                                    data-index="${index}"
                                >
                            </div>
                        `).join('')}
                    </div>
                    <div class="sum100-status preview-sum100-status" data-id="${question.id}">
                        <div class="sum-display">0 / 100</div>
                        <div class="sum-label">합계가 100이 되어야 합니다</div>
                    </div>
                </div>
            `;

        default:
            return '';
    }
}

function setupPreviewEventListeners() {
    // Sum100 inputs
    document.querySelectorAll('.preview-sum100-input').forEach(input => {
        input.addEventListener('input', () => {
            const questionId = parseInt(input.dataset.id);
            updatePreviewSum100Status(questionId);
        });
    });

    // Checkbox limit validation
    document.querySelectorAll('.preview-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const questionId = parseInt(e.target.dataset.questionId);
            const question = questions.find(q => q.id === questionId);

            if (question && question.maxSelections) {
                const checked = document.querySelectorAll(`.preview-checkbox[data-question-id="${questionId}"]:checked`);
                if (checked.length > question.maxSelections) {
                    e.target.checked = false;
                    alert(`최대 ${question.maxSelections}개까지만 선택할 수 있습니다.`);
                }
            }
        });
    });
}

function updatePreviewSum100Status(questionId) {
    const inputs = document.querySelectorAll(`.preview-sum100-input[data-id="${questionId}"]`);
    const sum = Array.from(inputs).reduce((total, input) => total + (parseInt(input.value) || 0), 0);
    const statusDiv = document.querySelector(`.preview-sum100-status[data-id="${questionId}"]`);

    if (statusDiv) {
        statusDiv.querySelector('.sum-display').textContent = `${sum} / 100`;

        if (sum === 100) {
            statusDiv.classList.add('valid');
            statusDiv.classList.remove('invalid');
            statusDiv.querySelector('.sum-label').textContent = '✓ 완료!';
        } else {
            statusDiv.classList.remove('valid');
            statusDiv.classList.add('invalid');
            statusDiv.querySelector('.sum-label').textContent = '합계가 100이 되어야 합니다';
        }
    }
}

// ============================================
// Form Submission
// ============================================
document.getElementById('previewForm').addEventListener('submit', (e) => {
    e.preventDefault();

    // Validate sum100 questions
    const sum100Questions = questions.filter(q => q.type === 'sum100');
    for (const question of sum100Questions) {
        const inputs = document.querySelectorAll(`.preview-sum100-input[data-id="${question.id}"]`);
        const sum = Array.from(inputs).reduce((total, input) => total + (parseInt(input.value) || 0), 0);

        if (sum !== 100) {
            alert(`"${question.title || '제목 없음'}" 질문의 합계가 100이 되어야 합니다. (현재: ${sum})`);
            return;
        }
    }

    // Validate checkbox max selections
    const checkboxQuestions = questions.filter(q => q.type === 'checkbox' && q.maxSelections);
    for (const question of checkboxQuestions) {
        const checked = document.querySelectorAll(`input[name="q${question.id}"]:checked`);
        if (checked.length > question.maxSelections) {
            alert(`"${question.title || '제목 없음'}" 질문은 최대 ${question.maxSelections}개까지만 선택할 수 있습니다.`);
            return;
        }
        if (checked.length === 0 && question.maxSelections > 0) {
            alert(`"${question.title || '제목 없음'}" 질문에 최소 1개 이상 선택해주세요.`);
            return;
        }
    }

    // Collect answers
    const answers = {};

    questions.forEach(question => {
        switch (question.type) {
            case 'short':
            case 'paragraph':
                const textInput = document.querySelector(`.preview-answer[data-id="${question.id}"]`);
                answers[question.id] = textInput ? textInput.value : '';
                break;

            case 'multiple':
                const radioInput = document.querySelector(`input[name="q${question.id}"]:checked`);
                answers[question.id] = radioInput ? radioInput.value : '';
                break;

            case 'checkbox':
                const checkboxInputs = document.querySelectorAll(`input[name="q${question.id}"]:checked`);
                answers[question.id] = Array.from(checkboxInputs).map(input => input.value);
                break;

            case 'sum100':
                const sum100Inputs = document.querySelectorAll(`.preview-sum100-input[data-id="${question.id}"]`);
                answers[question.id] = Array.from(sum100Inputs).map((input, index) => ({
                    label: question.sum100Items[index].label,
                    value: parseInt(input.value) || 0
                }));
                break;
        }
    });

    // Submit to Google Sheets if URL is configured
    submitToGoogleSheets(answers);

    showResults(answers);
});

// ============================================
// Results Mode
// ============================================
function showResults(answers) {
    builderMode.style.display = 'none';
    previewMode.style.display = 'none';
    resultsMode.style.display = 'block';

    const container = document.getElementById('resultsContainer');
    container.innerHTML = '<h3 style="margin-bottom: var(--space-lg);">응답 내용</h3>';

    questions.forEach((question, index) => {
        const answer = answers[question.id];
        let answerDisplay = '';

        switch (question.type) {
            case 'short':
            case 'paragraph':
                answerDisplay = answer || '(답변 없음)';
                break;

            case 'multiple':
                answerDisplay = answer || '(선택 없음)';
                break;

            case 'checkbox':
                answerDisplay = answer && answer.length > 0 ? answer.join(', ') : '(선택 없음)';
                break;

            case 'sum100':
                answerDisplay = `
                    <div style="margin-top: var(--space-sm);">
                        ${answer.map(item => `
                            <div style="display: flex; justify-content: space-between; padding: var(--space-xs) 0;">
                                <span>${item.label}:</span>
                                <span class="result-answer highlight">${item.value}점</span>
                            </div>
                        `).join('')}
                        <div style="margin-top: var(--space-sm); padding-top: var(--space-sm); border-top: 1px solid var(--border); font-weight: 600;">
                            <div style="display: flex; justify-content: space-between;">
                                <span>합계:</span>
                                <span class="result-answer highlight">100점 ✓</span>
                            </div>
                        </div>
                    </div>
                `;
                break;
        }

        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.innerHTML = `
            <div class="result-question">${index + 1}. ${question.title || '제목 없음'}</div>
            <div class="result-answer">${answerDisplay}</div>
        `;
        container.appendChild(resultItem);
    });
}

// ============================================
// Navigation
// ============================================
backToEditBtn.addEventListener('click', () => {
    builderMode.style.display = 'block';
    previewMode.style.display = 'none';
    resultsMode.style.display = 'none';
});

backToBuilderBtn.addEventListener('click', () => {
    builderMode.style.display = 'block';
    previewMode.style.display = 'none';
    resultsMode.style.display = 'none';
});

newResponseBtn.addEventListener('click', () => {
    showPreview();
});

resetBtn.addEventListener('click', () => {
    if (confirm('모든 질문을 삭제하고 처음부터 시작하시겠습니까?')) {
        questions = [];
        questionIdCounter = 0;
        formTitle.value = '새로운 설문';
        formDescription.value = '';
        renderQuestions();
    }
});

// ============================================
// Google Sheets Integration
// ============================================

// Settings Modal Management
settingsBtn.addEventListener('click', () => {
    sheetsUrlInput.value = googleSheetsUrl;
    settingsModal.style.display = 'flex';
    connectionStatus.style.display = 'none';
});

closeSettingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'none';
});

settingsModal.querySelector('.modal-overlay').addEventListener('click', () => {
    settingsModal.style.display = 'none';
});

saveSettingsBtn.addEventListener('click', () => {
    const url = sheetsUrlInput.value.trim();
    googleSheetsUrl = url;
    localStorage.setItem('googleSheetsUrl', url);

    // Show success message
    connectionStatus.style.display = 'flex';
    connectionStatus.className = 'connection-status success';
    connectionStatus.querySelector('.status-text').textContent = 'URL이 저장되었습니다!';

    setTimeout(() => {
        settingsModal.style.display = 'none';
    }, 1500);
});

clearUrlBtn.addEventListener('click', () => {
    sheetsUrlInput.value = '';
    googleSheetsUrl = '';
    localStorage.removeItem('googleSheetsUrl');

    connectionStatus.style.display = 'flex';
    connectionStatus.className = 'connection-status success';
    connectionStatus.querySelector('.status-text').textContent = 'URL이 삭제되었습니다';
});

setupGuideLink.addEventListener('click', (e) => {
    e.preventDefault();
    // Open setup guide in new window
    const guideUrl = 'google-sheets-setup.md';
    window.open(guideUrl, '_blank');
});

// Submit form data to Google Sheets
async function submitToGoogleSheets(answers) {
    if (!googleSheetsUrl) {
        console.log('Google Sheets URL not configured. Skipping submission.');
        return;
    }

    try {
        // Prepare data for submission
        const submissionData = {
            timestamp: new Date().toISOString(),
            formTitle: formTitle.value || '새로운 설문',
            formDescription: formDescription.value || '',
            questions: questions.map(q => ({
                id: q.id,
                title: q.title,
                type: q.type
            })),
            answers: answers
        };

        // Send POST request to Google Apps Script
        const response = await fetch(googleSheetsUrl, {
            method: 'POST',
            mode: 'no-cors', // Required for Google Apps Script
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(submissionData)
        });

        console.log('Form submitted to Google Sheets successfully!');

    } catch (error) {
        console.error('Error submitting to Google Sheets:', error);
        // Don't show error to user - submission still works locally
    }
}

// ============================================
// Initialize with sample questions
// ============================================
function initializeSampleForm() {
    // Add a sum100 question as an example
    const sum100Question = {
        id: questionIdCounter++,
        type: 'sum100',
        title: '다음 항목에 총 100점을 배분해주세요',
        sum100Items: [
            { label: '항목 1', value: 30 },
            { label: '항목 2', value: 40 },
            { label: '항목 3', value: 25 },
            { label: '항목 4', value: 5 }
        ]
    };

    const checkboxQuestion = {
        id: questionIdCounter++,
        type: 'checkbox',
        title: '선호하는 색상을 선택하세요 (최대 2개)',
        options: ['빨강', '파랑', '초록', '노랑'],
        maxSelections: 2
    };

    const shortQuestion = {
        id: questionIdCounter++,
        type: 'short',
        title: '이름을 입력하세요'
    };

    questions.push(sum100Question, checkboxQuestion, shortQuestion);
    renderQuestions();

    // Update the sum100 status display
    setTimeout(() => updateSum100Status(sum100Question.id), 100);
}

// Initialize on load
initializeSampleForm();
