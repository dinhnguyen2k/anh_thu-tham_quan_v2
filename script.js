// Dữ liệu cho 2 bài học
const LESSONS = {
  good: {
    expected: 'good',
    message: 'Con hãy chọn dấu tick ✅ cho những việc nên làm nhé!',
    successTitle: 'Giỏi lắm! Em làm đúng rồi!',
    failTitle: 'Chưa đúng rồi, em thử lại nhé!',
    questions: [
      { text: 'Đi nhẹ, nói khẽ, giữ trật tự.', image: 'assets/images/nen-1.svg', alt: 'Bạn nhỏ đi nhẹ và nói khẽ trong khu tham quan.' },
      { text: 'Xếp hàng ngay ngắn, đi đúng lối.', image: 'assets/images/nen-2.svg', alt: 'Các bạn nhỏ xếp hàng ngay ngắn.' },
      { text: 'Chụp ảnh đúng nơi cho phép.', image: 'assets/images/nen-3.svg', alt: 'Bạn nhỏ chụp ảnh ở khu vực được phép.' },
      { text: 'Bỏ rác đúng nơi quy định.', image: 'assets/images/nen-4.svg', alt: 'Bạn nhỏ bỏ rác vào thùng.' },
      { text: 'Nghe theo cô hướng dẫn và làm theo biển báo.', image: 'assets/images/nen-5.svg', alt: 'Bạn nhỏ nghe cô giáo hướng dẫn và nhìn biển báo.' }
    ]
  },
  bad: {
    expected: 'bad',
    message: 'Con hãy chọn dấu X ❌ cho những việc không nên làm nhé!',
    successTitle: 'Giỏi lắm! Em đã nhận ra việc không nên làm rồi!',
    failTitle: 'Chưa đúng rồi, em thử lại nhé!',
    questions: [
      { text: 'Chen lấn, xô đẩy, chạy nhảy.', image: 'assets/images/khong-1.svg', alt: 'Các bạn chen lấn và chạy nhảy.' },
      { text: 'Vứt rác bừa bãi.', image: 'assets/images/khong-2.svg', alt: 'Bạn nhỏ vứt rác bừa bãi xuống đất.' },
      { text: 'Viết, vẽ bậy lên tường, đá, di tích.', image: 'assets/images/khong-3.svg', alt: 'Bạn nhỏ vẽ bậy lên tường.' },
      { text: 'Tự ý chạm vào hiện vật hoặc đi vào khu vực cấm.', image: 'assets/images/khong-4.svg', alt: 'Bạn nhỏ chạm vào hiện vật ở khu vực cấm.' },
      { text: 'Bẻ cành, hái hoa, giẫm lên cỏ.', image: 'assets/images/khong-5.svg', alt: 'Bạn nhỏ hái hoa và giẫm lên cỏ.' }
    ]
  }
};

function buildQuiz(lessonKey) {
  const lesson = LESSONS[lessonKey];
  if (!lesson) return;

  const quizRoot = document.querySelector('[data-quiz]');
  const list = document.getElementById('questionList');
  const guide = document.getElementById('guideText');
  const resultBox = document.getElementById('resultBox');
  const resultTitle = document.getElementById('resultTitle');
  const resultText = document.getElementById('resultText');
  const scoreLine = document.getElementById('scoreLine');
  const retryBtn = document.getElementById('retryBtn');
  const checkBtn = document.getElementById('checkBtn');

  guide.textContent = lesson.message;
  list.innerHTML = '';

  lesson.questions.forEach((item, index) => {
    const card = document.createElement('article');
    card.className = 'question-card';
    card.dataset.index = index;

    card.innerHTML = `
      <div class="question-number">Câu ${index + 1}</div>
      <div class="illu-box">
        <img src="${item.image}" alt="${item.alt}">
      </div>
      <div>
        <p class="question-text">${item.text}</p>
        <div class="option-row">
          <button class="option-btn good" data-value="good" aria-label="Nên làm">✅ Nên làm</button>
          <button class="option-btn bad" data-value="bad" aria-label="Không nên làm">❌ Không nên làm</button>
        </div>
        <p class="helper-text">Chọn 1 đáp án thật chính xác nhé! ⭐</p>
      </div>
    `;

    list.appendChild(card);
  });

  list.addEventListener('click', (event) => {
    const button = event.target.closest('.option-btn');
    if (!button) return;

    const card = button.closest('.question-card');
    card.querySelectorAll('.option-btn').forEach((btn) => {
      btn.classList.remove('selected', 'correct-answer', 'wrong-answer');
    });
    button.classList.add('selected');
    card.dataset.selected = button.dataset.value;
    card.classList.remove('wrong', 'correct');
  });

  checkBtn.addEventListener('click', () => {
    let correctCount = 0;

    document.querySelectorAll('.question-card').forEach((card) => {
      const selected = card.dataset.selected;
      const isCorrect = selected === lesson.expected;
      const selectedBtn = card.querySelector(`.option-btn[data-value="${selected}"]`);
      const rightBtn = card.querySelector(`.option-btn[data-value="${lesson.expected}"]`);

      card.classList.remove('wrong', 'correct');
      card.querySelectorAll('.option-btn').forEach((btn) => {
        btn.classList.remove('correct-answer', 'wrong-answer');
      });

      if (selected === undefined) {
        card.classList.add('wrong');
        rightBtn.classList.add('correct-answer');
        return;
      }

      if (isCorrect) {
        correctCount += 1;
        card.classList.add('correct');
        selectedBtn.classList.add('correct-answer');
      } else {
        card.classList.add('wrong');
        selectedBtn.classList.add('wrong-answer');
        rightBtn.classList.add('correct-answer');
      }
    });

    scoreLine.textContent = `Con đúng ${correctCount}/${lesson.questions.length} câu.`;
    resultBox.classList.add('show');

    if (correctCount === lesson.questions.length) {
      resultTitle.textContent = lesson.successTitle;
      resultText.innerHTML = '🏆 😊 ⭐ Con thật tuyệt! Hãy tiếp tục giữ nội quy thật tốt nhé!';
      playSound('success');
      launchConfetti();
      launchStars();
    } else {
      resultTitle.textContent = lesson.failTitle;
      resultText.innerHTML = '😢 Đừng lo nhé! Con xem lại các câu tô màu đỏ rồi làm lại nào!';
      playSound('fail');
    }

    resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  retryBtn.addEventListener('click', () => {
    document.querySelectorAll('.question-card').forEach((card) => {
      delete card.dataset.selected;
      card.classList.remove('wrong', 'correct');
      card.querySelectorAll('.option-btn').forEach((btn) => {
        btn.classList.remove('selected', 'correct-answer', 'wrong-answer');
      });
    });
    resultBox.classList.remove('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  quizRoot.dataset.ready = 'true';
}

function playSound(type) {
  const fileMap = {
    success: 'assets/success.mp3',
    fail: 'assets/fail.mp3'
  };

  const audio = new Audio(fileMap[type]);
  audio.volume = 0.55;
  audio.play().catch(() => playSynthFallback(type));
}

function playSynthFallback(type) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  const ctx = new AudioContextClass();
  const notes = type === 'success' ? [523.25, 659.25, 783.99] : [349.23, 293.66];

  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.value = 0.0001;
    osc.connect(gain);
    gain.connect(ctx.destination);

    const start = ctx.currentTime + index * 0.14;
    gain.gain.exponentialRampToValueAtTime(0.18, start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);
    osc.start(start);
    osc.stop(start + 0.24);
  });
}

function launchConfetti() {
  const colors = ['#ff8fb8', '#7ed6ff', '#ffe36e', '#8be28b', '#8d7cff'];
  for (let i = 0; i < 70; i += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti';
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = `${Math.random() * 0.4}s`;
    piece.style.opacity = 0.95;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 3200);
  }
}

function launchStars() {
  for (let i = 0; i < 18; i += 1) {
    const star = document.createElement('span');
    star.className = 'star-burst';
    star.textContent = i % 2 === 0 ? '⭐' : '🌈';
    star.style.left = `${20 + Math.random() * 60}vw`;
    star.style.top = `${35 + Math.random() * 28}vh`;
    star.style.animationDelay = `${Math.random() * 0.35}s`;
    document.body.appendChild(star);
    setTimeout(() => star.remove(), 1700);
  }
}
