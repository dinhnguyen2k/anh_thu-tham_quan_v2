// Mock data cho 10 câu hỏi của bài học.
const questions = [
  {
    id: 1,
    text: 'Đi nhẹ, nói khẽ, giữ trật tự.',
    answer: 'do',
    image: 'assets/images/cau-01-di-nhe-noi-khe.svg'
  },
  {
    id: 2,
    text: 'Chen lấn, xô đẩy, chạy nhảy.',
    answer: 'dont',
    image: 'assets/images/cau-02-chen-lan.svg'
  },
  {
    id: 3,
    text: 'Xếp hàng ngay ngắn, đi đúng lối.',
    answer: 'do',
    image: 'assets/images/cau-03-xep-hang.svg'
  },
  {
    id: 4,
    text: 'Vứt rác bừa bãi.',
    answer: 'dont',
    image: 'assets/images/cau-04-vut-rac.svg'
  },
  {
    id: 5,
    text: 'Chụp ảnh đúng nơi cho phép.',
    answer: 'do',
    image: 'assets/images/cau-05-chup-anh.svg'
  },
  {
    id: 6,
    text: 'Viết, vẽ bậy lên tường.',
    answer: 'dont',
    image: 'assets/images/cau-06-ve-bay.svg'
  },
  {
    id: 7,
    text: 'Bỏ rác đúng nơi quy định.',
    answer: 'do',
    image: 'assets/images/cau-07-bo-rac-dung-cho.svg'
  },
  {
    id: 8,
    text: 'Chạm vào hiện vật.',
    answer: 'dont',
    image: 'assets/images/cau-08-cham-hien-vat.svg'
  },
  {
    id: 9,
    text: 'Nghe theo cô hướng dẫn.',
    answer: 'do',
    image: 'assets/images/cau-09-nghe-co.svg'
  },
  {
    id: 10,
    text: 'Bẻ cành, hái hoa.',
    answer: 'dont',
    image: 'assets/images/cau-10-be-canh-hai-hoa.svg'
  }
];

const state = questions.map((question) => ({
  id: question.id,
  selected: null,
  locked: false,
  completed: false,
  isCorrect: false
}));

const questionList = document.getElementById('questionList');
const correctCountEl = document.getElementById('correctCount');
const completedCountEl = document.getElementById('completedCount');
const progressText = document.getElementById('progressText');
const progressFill = document.getElementById('progressFill');
const resultBanner = document.getElementById('resultBanner');
const confettiLayer = document.getElementById('confettiLayer');
const sparkleLayer = document.getElementById('sparkleLayer');
const retryWrongBtn = document.getElementById('retryWrongBtn');
const resetAllBtn = document.getElementById('resetAllBtn');

function renderQuestions() {
  questionList.innerHTML = questions.map((question, index) => `
    <article class="question-card" id="question-${question.id}" data-id="${question.id}">
      <div class="question-head">
        <div class="question-index">Câu ${index + 1}</div>
        <div class="card-status" id="status-${question.id}">🕓 Chưa làm</div>
      </div>

      <div class="card-image">
        <img src="${question.image}" alt="Hình minh họa cho câu ${index + 1}: ${question.text}" loading="lazy" />
      </div>

      <p class="question-text">${question.text}</p>

      <div class="choice-group">
        <button class="choice-btn" type="button" data-id="${question.id}" data-choice="do">✅ Nên làm</button>
        <button class="choice-btn" type="button" data-id="${question.id}" data-choice="dont">❌ Không nên làm</button>
      </div>

      <button class="check-btn" type="button" data-check="${question.id}">🔍 Kiểm tra câu này</button>
      <div class="feedback" id="feedback-${question.id}">👉 Con hãy nhìn tranh thật kỹ nhé!</div>
    </article>
  `).join('');
}

function getQuestionState(id) {
  return state.find((item) => item.id === Number(id));
}

function getQuestionData(id) {
  return questions.find((item) => item.id === Number(id));
}

function updateSummary() {
  const correctCount = state.filter((item) => item.isCorrect).length;
  const completedCount = state.filter((item) => item.completed).length;
  const progress = Math.round((correctCount / questions.length) * 100);

  correctCountEl.textContent = correctCount;
  completedCountEl.textContent = completedCount;
  progressText.textContent = `${progress}%`;
  progressFill.style.width = `${progress}%`;
  document.querySelector('.progress-bar').setAttribute('aria-valuenow', String(progress));

  checkOverallResult();
}

function setFeedback(id, message, type = '') {
  const feedback = document.getElementById(`feedback-${id}`);
  feedback.textContent = message;
  feedback.className = `feedback ${type}`.trim();
}

function setStatus(id, message, done = false) {
  const status = document.getElementById(`status-${id}`);
  status.textContent = message;
  status.classList.toggle('done', done);
}

function selectChoice(id, choice) {
  const currentState = getQuestionState(id);
  if (!currentState || currentState.locked) return;

  currentState.selected = choice;
  currentState.completed = false;
  currentState.isCorrect = false;

  const card = document.getElementById(`question-${id}`);
  const choiceButtons = card.querySelectorAll('.choice-btn');

  choiceButtons.forEach((button) => {
    const isSelected = button.dataset.choice === choice;
    button.classList.toggle('is-selected', isSelected);
  });

  card.classList.remove('is-correct', 'is-wrong');
  setFeedback(id, '👉 Con đã chọn đáp án này. Bây giờ bấm “Kiểm tra câu này” nhé!', 'selected');
  setStatus(id, '🟡 Đã chọn, chưa kiểm tra');
}

function checkAnswer(id) {
  const currentState = getQuestionState(id);
  const question = getQuestionData(id);
  const card = document.getElementById(`question-${id}`);

  if (!currentState.selected) {
    setFeedback(id, '👉 Con hãy chọn một đáp án trước nhé!', 'error');
    playSound('warning');
    card.classList.add('shake');
    setTimeout(() => card.classList.remove('shake'), 450);
    return;
  }

  if (currentState.selected === question.answer) {
    currentState.locked = true;
    currentState.completed = true;
    currentState.isCorrect = true;

    card.classList.remove('is-wrong');
    card.classList.add('is-correct');

    const buttons = card.querySelectorAll('.choice-btn, .check-btn');
    buttons.forEach((button) => button.disabled = true);

    setFeedback(id, '👉 Đúng rồi! Giỏi lắm! ⭐🎉', 'success');
    setStatus(id, '✅ Hoàn thành', true);
    playSound('success');
    createSparkles(card);
    createConfetti(card, 14);
  } else {
    currentState.completed = false;
    currentState.isCorrect = false;

    card.classList.remove('is-correct');
    card.classList.add('is-wrong', 'shake');

    setFeedback(id, '👉 Chưa đúng rồi, con thử lại nhé! 😢🥺', 'error');
    setStatus(id, '🔁 Hãy thử lại nào');
    playSound('fail');
    setTimeout(() => card.classList.remove('shake'), 450);
  }

  updateSummary();
}

function createConfetti(targetEl, amount = 28) {
  const rect = targetEl.getBoundingClientRect();
  const colors = ['#ffd54d', '#4fc3f7', '#ff8ea0', '#81e291', '#9d8cff'];

  for (let i = 0; i < amount; i += 1) {
    const confetti = document.createElement('span');
    confetti.className = 'confetti';
    confetti.style.left = `${rect.left + Math.random() * rect.width}px`;
    confetti.style.top = `${rect.top + Math.random() * 40}px`;
    confetti.style.background = colors[i % colors.length];
    confetti.style.animationDelay = `${Math.random() * 0.15}s`;
    confettiLayer.appendChild(confetti);
    setTimeout(() => confetti.remove(), 1900);
  }
}

function createSparkles(targetEl, amount = 7) {
  const rect = targetEl.getBoundingClientRect();
  const sparkles = ['⭐', '✨', '🌟'];

  for (let i = 0; i < amount; i += 1) {
    const sparkle = document.createElement('span');
    sparkle.className = 'sparkle';
    sparkle.textContent = sparkles[i % sparkles.length];
    sparkle.style.left = `${rect.left + rect.width / 2 + (Math.random() * 80 - 40)}px`;
    sparkle.style.top = `${rect.top + rect.height / 2 + (Math.random() * 50 - 25)}px`;
    sparkleLayer.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 1200);
  }
}

// Phát âm thanh nhẹ bằng Web Audio API để không cần file backend hay thư viện ngoài.
function playSound(type) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  const audioCtx = new AudioContextClass();
  const now = audioCtx.currentTime;
  const master = audioCtx.createGain();
  master.connect(audioCtx.destination);
  master.gain.setValueAtTime(0.001, now);
  master.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
  master.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

  const config = {
    success: { notes: [523.25, 659.25, 783.99], duration: 0.18, wave: 'triangle' },
    fail: { notes: [330, 294], duration: 0.22, wave: 'sine' },
    win: { notes: [523.25, 659.25, 783.99, 1046.5], duration: 0.2, wave: 'triangle' },
    warning: { notes: [392], duration: 0.14, wave: 'square' }
  };

  const preset = config[type] || config.success;

  preset.notes.forEach((freq, index) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = preset.wave;
    osc.frequency.setValueAtTime(freq, now + index * preset.duration);
    gain.gain.setValueAtTime(0.0001, now + index * preset.duration);
    gain.gain.exponentialRampToValueAtTime(0.18, now + index * preset.duration + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + index * preset.duration + preset.duration);

    osc.connect(gain);
    gain.connect(master);
    osc.start(now + index * preset.duration);
    osc.stop(now + index * preset.duration + preset.duration + 0.04);
  });

  setTimeout(() => audioCtx.close(), 1200);
}

function checkOverallResult() {
  const correctCount = state.filter((item) => item.isCorrect).length;
  const wrongSelectedCount = state.filter((item) => item.selected && !item.isCorrect && !item.locked).length;

  if (correctCount === questions.length) {
    resultBanner.classList.remove('hidden');
    resultBanner.innerHTML = `
      <h3>🏆 Xuất sắc! Con đã hoàn thành rất giỏi! 🌈</h3>
      <p>Con đã trả lời đúng cả 10 câu. Siêu bé ngoan hôm nay thật tuyệt! 😊</p>
    `;
    createConfetti(document.body, 120);
    createSparkles(document.body, 28);
    playSound('win');
    return;
  }

  if (wrongSelectedCount > 0) {
    resultBanner.classList.remove('hidden');
    resultBanner.innerHTML = `
      <h3>💪 Con làm tốt rồi! Mình thử lại nhé!</h3>
      <p>Những câu còn sai đã được giữ lại để con thử tiếp. Cố lên nào! ⭐</p>
    `;
    return;
  }

  resultBanner.classList.add('hidden');
  resultBanner.innerHTML = '';
}

function retryWrongQuestions() {
  state.forEach((item) => {
    if (!item.locked) {
      item.selected = null;
      item.completed = false;
      item.isCorrect = false;

      const card = document.getElementById(`question-${item.id}`);
      card.classList.remove('is-wrong');

      card.querySelectorAll('.choice-btn').forEach((button) => {
        button.disabled = false;
        button.classList.remove('is-selected');
      });
      card.querySelector('.check-btn').disabled = false;

      setFeedback(item.id, '👉 Cùng thử lại câu này nhé!', 'selected');
      setStatus(item.id, '🕓 Chưa làm');
    }
  });

  updateSummary();
  window.scrollTo({ top: document.querySelector('.game-panel').offsetTop - 10, behavior: 'smooth' });
}

function resetAll() {
  state.forEach((item) => {
    item.selected = null;
    item.locked = false;
    item.completed = false;
    item.isCorrect = false;

    const card = document.getElementById(`question-${item.id}`);
    card.classList.remove('is-correct', 'is-wrong');
    card.querySelectorAll('.choice-btn, .check-btn').forEach((button) => {
      button.disabled = false;
      button.classList.remove('is-selected');
    });

    setFeedback(item.id, '👉 Con hãy nhìn tranh thật kỹ nhé!');
    setStatus(item.id, '🕓 Chưa làm');
  });

  resultBanner.classList.add('hidden');
  resultBanner.innerHTML = '';
  updateSummary();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function bindEvents() {
  questionList.addEventListener('click', (event) => {
    const choiceButton = event.target.closest('.choice-btn');
    const checkButton = event.target.closest('.check-btn');

    if (choiceButton) {
      selectChoice(choiceButton.dataset.id, choiceButton.dataset.choice);
    }

    if (checkButton) {
      checkAnswer(checkButton.dataset.check);
    }
  });

  retryWrongBtn.addEventListener('click', retryWrongQuestions);
  resetAllBtn.addEventListener('click', resetAll);
}

renderQuestions();
bindEvents();
updateSummary();
