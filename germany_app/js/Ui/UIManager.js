/**
 * مدیریت تمام عملیات مربوط به رابط کاربری (UI Manager)
 * User Interface Manager - Handles all DOM interactions
 */

export class UIManager {
  constructor(game) {
    this.game = game; // مرجع به instance اصلی بازی
     this.modalSource = null; // Track where the modal was opened from
  }

  /**
   * به‌روزرسانی کامل رابط کاربری
   * Update all UI elements
   */
  updateUI() {
    const levelWords = this.game.words.filter(
      (w) => (w.level || "A1") === this.game.currentNiveau,
    );

    let totalSureNeeded = levelWords.length * 2;
    let totalSureAchieved = levelWords.reduce(
      (sum, word) => sum + Math.min(2, word.sureCount || 0),
      0,
    );

    const percentage =
      totalSureNeeded > 0
        ? Math.round((totalSureAchieved / totalSureNeeded) * 100)
        : 0;
    const currentState = this.game.getCurrentState();

    // Debug logging
    console.log(`🔍 DEBUG updateUI - ${this.game.getCurrentKey()}:`, {
      activeNiveau: this.game.currentNiveau,
      activeMode: this.game.currentMode,
      progress: percentage,
    });

    // به‌روزرسانی شمارنده‌ها
    document.getElementById("correctCount").textContent =
      currentState.correctAnswers;
    document.getElementById("wrongCount").textContent =
      currentState.wrongAnswers;
    document.getElementById("score").textContent = currentState.score;
    document.getElementById("masteryProgress").textContent = percentage;
    document.getElementById("progressBar").style.width = `${percentage}%`;

    // تنظیم selectها
    document.getElementById("levelSelect").value = this.game.currentNiveau;
    document.getElementById("modeSelect").value = this.game.currentMode;

    // آمار سطح
    document.getElementById("levelStats").innerHTML =
      `Wörter: <strong>${levelWords.length}</strong> | Richtig: <strong class="text-green-500">${currentState.correctAnswers}</strong> | Falsch: <strong class="text-red-500">${currentState.wrongAnswers}</strong>`;
    // رندر مربع‌های پیشرفت کلمات
    //########################################################################################
    //########################################################################################
    //########################################################################################
    this.renderWordProgressSquares(levelWords);
 
    }

     /**
   * رندر مربع‌های پیشرفت کلمات
   * Render word progress squares
   */
  // renderWordProgressSquares(levelWords) {
  //   const container = document.getElementById("wordProgressSquares");
  //   container.innerHTML = "";

    // ایجاد آرایه با ایندکس‌ها برای تصادفی‌سازی
  //      * تولید و ذخیره ترتیب تصادفی مربع‌ها در localStorage
  //  * Generate and store random square order in localStorage
  //  */
  generateRandomSquareOrder(levelWords) {
    const indices = levelWords.map((_, index) => index);
    // تصادفی‌سازی ترتیب بصری
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    
    // ذخیره در localStorage
    const storageKey = `langgame_squareOrder_${this.game.dataSetName}_${this.game.currentNiveau}_${this.game.currentMode}`;
    localStorage.setItem(storageKey, JSON.stringify(indices));

    return indices;
  }

  /**
   * دریافت ترتیب ذخیره شده مربع‌ها از localStorage
   * Get stored square order from localStorage
   */
  getStoredSquareOrder(levelWords) {
    const storageKey = `langgame_squareOrder_${this.game.dataSetName}_${this.game.currentNiveau}_${this.game.currentMode}`;
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      const indices = JSON.parse(stored);
      // بررسی اعتبار: اگر تعداد کلمات تغییر کرده باشد، ترتیب جدید تولید کن
      if (indices.length === levelWords.length) {
        return indices;
      }
    }

    // اگر ترتیب ذخیره شده وجود ندارد یا نامعتبر است، ترتیب جدید تولید کن
    return this.generateRandomSquareOrder(levelWords);
  }

  /**
   * رندر مربع‌های پیشرفت کلمات
   * Render word progress squares
   */
  renderWordProgressSquares(levelWords) {
    const container = document.getElementById("wordProgressSquares");
    container.innerHTML = "";

    // دریافت ترتیب ذخیره شده (یا تولید جدید اگر وجود ندارد)
    const indices = this.getStoredSquareOrder(levelWords);







    indices.forEach((originalIndex) => {
      const word = levelWords[originalIndex];
      const sureCount = word.sureCount || 0;

      const square = document.createElement("div");
      square.className = "w-3 h-3 cursor-pointer transition-all hover:scale-125";
      square.style.borderRadius = "2px";

      // تعیین رنگ بر اساس sureCount
      if (sureCount === 0) {
        square.style.backgroundColor = "#9ca3af"; // gray
      } else if (sureCount === 1) {
        square.style.backgroundColor = "#86efac"; // light green
      } else if (sureCount === 2) {
        square.style.backgroundColor = "#22c55e"; // dark green
      } else if (sureCount === -1) {
        square.style.backgroundColor = "#fca5a5"; // light red
      } else if (sureCount === -2) {
        square.style.backgroundColor = "#ef4444"; // stronger red
      } else if (sureCount < -2) {
        // سایر مقادیر منفی - قرمز تیره‌تر
        const intensity = Math.min(Math.abs(sureCount) - 1, 3);
        const redValue = Math.max(100, 220 - intensity * 30);
        square.style.backgroundColor = `rgb(${redValue}, 50, 50)`;
      }

      // کلیک روی مربع
      square.addEventListener("click", () => {
        this.openWordDetailsModal(word);
      });

      container.appendChild(square);
    });
  }

  /**
   * باز کردن مودال جزئیات کلمه با مخفی کردن آیکون، عنوان و پیام
   * Open word details modal with icon, title, and message hidden
   */
  openWordDetailsModal(word) {
    const modal = document.getElementById("resultModal");
     this.modalSource = 'progressSquare';

    // مخفی کردن فقط آیکون، عنوان و پیام
    document.getElementById("modalIcon").classList.add("hidden");
    document.getElementById("modalTitle").classList.add("hidden");
    document.getElementById("modalMessage").classList.add("hidden");

    // نمایش جزئیات کلمه
    let content = `<div class="mb-4"><strong>Word:</strong> <a href="https://translate.google.com/?sl=de&tl=fa&text=${encodeURIComponent(word.word)}" target="_blank" class="text-indigo-800 text-lg font-bold hover:underline">${word.word}</a></div><div class="mb-1"><strong>Meaning:</strong> ${word.meaning}</div>`;
    content += `<div class="mb-1"><strong>Sure Count:</strong> ${word.sureCount || 0}</div>`;

    if (word.sentences && word.sentences.length > 0) {
      content += `<div class="mt-4"><strong>Example Sentences:</strong></div>`;
      word.sentences.slice(0, 3).forEach((s) => {
        content += `<div class="pt-1 border-t border-gray-200"><div class="text-sm text-blue-700"><a href="https://translate.google.com/?sl=de&tl=fa&text=${encodeURIComponent(s.de)}" target="_blank" class="hover:underline">${s.de}</a></div><div class="text-sm text-gray-600 mt-1 text-right rtl" dir="rtl">"${s.fa}"</div></div>`;
      });
    }

    document.getElementById("modalDetails").innerHTML = content;
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }

  //#########################################################################################
  //#########################################################################################
  //#########################################################################################

  /**
   * Generate type label HTML if type exists
   */
  getTypeLabelHTML() {
    if (this.game.currentWord && this.game.currentWord.type) {
      return `<span class="absolute top-0 left-0 text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md font-medium">${this.game.currentWord.type}</span>`;
    }
    return "";
  }

  /**
   * نمایش سوال
   * Render current question
   */
  renderQuestion() {
    const wordDisplay = document.getElementById("fallingWord");
    const sentenceDisplay = document.getElementById("sentenceDisplay");
    const questionType = document.getElementById("questionType");
    const answerOptions = document.getElementById("answerOptions");
    const hardContainer = document.getElementById("hardInputContainer");

    answerOptions.innerHTML = "";
    hardContainer.classList.add("hidden");
    document.getElementById("hardInput").value = "";
    document.getElementById("autocompleteList").classList.add("hidden");

    if (this.game.currentMode === "hard") {
      hardContainer.classList.remove("hidden");
      this.renderHardQuestion();
    } else {
      wordDisplay.className =
        "falling-word text-4xl font-bold text-indigo-800 mb-4 relative";
      sentenceDisplay.classList.add("hidden");
      questionType.textContent = "";

      const isSentence =
        this.game.currentQuestionType.isSentence && this.game.currentSentence;
      const target = isSentence
        ? this.game.currentSentence
        : this.game.currentWord;
      const sureCount = target.sureCount || 0;
      const typeLabel = this.getTypeLabelHTML();
console.log(this.game.currentWord);
      switch (this.game.currentQuestionType.type) {
        case "de_to_fa":
          wordDisplay.innerHTML = `${typeLabel}<a href="https://translate.google.com/?sl=de&tl=fa&text=${encodeURIComponent(this.game.currentWord.word)}" target="_blank" class="text-indigo-800 hover:text-indigo-600 ">${this.game.currentWord.word}</a>`;
          questionType.textContent = "Auf Persisch übersetzen";
          break;
        case "word_with_sentence":
          sentenceDisplay.textContent = `"${this.game.currentSentence.fa}"`;
          sentenceDisplay.classList.remove("hidden");
          questionType.textContent = "Finde das Adjektiv";
          wordDisplay.innerHTML = `${typeLabel}?`;
          break;
        case "fa_to_de":
          wordDisplay.innerHTML = `${typeLabel}${this.game.currentWord.meaning}`;
          questionType.textContent = "Ins Deutsche übersetzen";
          break;
        case "sentence_only":
          sentenceDisplay.textContent = `"${this.game.currentSentence.de}"`;
          sentenceDisplay.classList.remove("hidden");
          questionType.textContent = "Was bedeutet dieser Satz?";
          wordDisplay.innerHTML = `${typeLabel}?`;
          break;
      }

      questionType.textContent += ` (Sure: ${sureCount}/2)`;
      this.generateAnswerOptions();
    }
  }

  /**
   * نمایش سوال در حالت Hard (ورودی متنی)
   */
  renderHardQuestion() {
    const wordDisplay = document.getElementById("fallingWord");
    const sentenceDisplay = document.getElementById("sentenceDisplay");
    const questionType = document.getElementById("questionType");

    wordDisplay.className =
      "falling-word text-4xl font-bold text-indigo-800 mb-4";
    sentenceDisplay.classList.add("hidden");
    questionType.textContent = "";

    const isSentence =
      this.game.currentQuestionType.isSentence && this.game.currentSentence;
    const target = isSentence
      ? this.game.currentSentence
      : this.game.currentWord;
    const sureCount = target.sureCount || 0;

    if (
      this.game.currentQuestionType.type === "word_with_sentence" ||
      this.game.currentQuestionType.type === "sentence_only"
    ) {
      sentenceDisplay.textContent = `"${this.game.currentSentence.fa}"`;
      sentenceDisplay.classList.remove("hidden");
      questionType.textContent = "Schreibe das passende Adjektiv";
      wordDisplay.textContent = "?";
    } else {
      wordDisplay.textContent = this.game.currentWord.meaning;
      questionType.textContent = "Ins Deutsche übersetzen (eintippen)";
    }

    questionType.textContent += ` (Sure: ${sureCount}/2)`;
  }

  /**
   * تولید گزینه‌های پاسخ چندگزینه‌ای
   */
  generateAnswerOptions() {
    const answerOptions = document.getElementById("answerOptions");
    answerOptions.innerHTML = "";

    let correctAnswer;
    switch (this.game.currentQuestionType.type) {
      case "de_to_fa":
        correctAnswer = this.game.currentWord.meaning;
        break;
      case "word_with_sentence":
        correctAnswer = this.game.currentWord.word;
        break;
      case "fa_to_de":
        correctAnswer = this.game.currentWord.word;
        break;
      case "sentence_only":
        correctAnswer = this.game.currentSentence.fa;
        break;
    }

    let options = [correctAnswer];
    const distractors = this.generateDistractors(correctAnswer, 3);
    options = options.concat(distractors);
    options.sort(() => Math.random() - 0.5);

    options.forEach((option) => {
      const button = document.createElement("button");
      button.className =
        "bg-white border-1 border-gray-300 rounded-lg p-4 text-center hover:border-indigo-500 hover:bg-indigo-50 transition-all transform hover:scale-105 shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2";

      if (
        this.game.currentQuestionType.type === "fa_to_de" ||
        this.game.currentQuestionType.type === "word_with_sentence"
      ) {
        button.innerHTML = `<div class="flex justify-between items-center"><span>${option}</span><a href="https://translate.google.com/?sl=de&tl=fa&text=${encodeURIComponent(option)}" target="_blank" class="text-indigo-600 hover:text-indigo-800 text-sm ml-2" onclick="event.stopPropagation()">🌐</a></div>`;
      } else {
        button.textContent = option;
      }

      button.addEventListener("click", () =>
        this.game.checkAnswer(option, correctAnswer),
      );
      answerOptions.appendChild(button);
    });
  }

  /**
   * تولید گزینه‌های انحرافی (کامل)
   */
  generateDistractors(correctAnswer, count) {
    let distractors = new Set();
    const type = this.game.currentQuestionType.type;
    let candidates = [];

    if (type === "de_to_fa") {
      candidates = this.game.words
        .filter((w) => w.meaning !== correctAnswer)
        .map((w) => w.meaning);
    } else if (type === "fa_to_de" || type === "word_with_sentence") {
      candidates = this.game.words
        .filter((w) => w.word !== correctAnswer)
        .map((w) => w.word);
    } else if (type === "sentence_only") {
      candidates = this.game.words
        .flatMap((w) => w.sentences || [])
        .filter((s) => s.fa !== correctAnswer)
        .map((s) => s.fa);
    }

    candidates.sort(() => Math.random() - 0.5);

    for (let item of candidates) {
      if (distractors.size >= count) break;
      const correctLen = String(correctAnswer).length;
      const itemLen = String(item).length;
      if (
        Math.abs(correctLen - itemLen) <= 3 ||
        (correctAnswer &&
          item &&
          String(correctAnswer)[0].toLowerCase() ===
            String(item)[0].toLowerCase())
      ) {
        distractors.add(item);
      }
    }

    // Fallbacks
    while (distractors.size < count && candidates.length > 0) {
      distractors.add(
        candidates[Math.floor(Math.random() * candidates.length)],
      );
    }

    return Array.from(distractors).slice(0, count);
  }

  /**
   * نمایش نتیجه پاسخ
   */
  showResult(isCorrect, correctAnswer) {
    const modal = document.getElementById("resultModal");
    this.modalSource = 'answerFlow';
    this.displayOriginalSentence();
    const currentState = this.game.getCurrentState();

    if (isCorrect) {
      document.getElementById("modalIcon").textContent = "";
      document.getElementById("modalTitle").textContent = "Correct!";
      document.getElementById("modalTitle").className =
        "text-2xl font-bold mb-2 text-green-600";
      document.getElementById("modalMessage").textContent =
        "Great job! Keep it up!";
      this.playSound("correct");
    } else {
      document.getElementById("modalIcon").textContent = "";
      document.getElementById("modalTitle").textContent = "Wrong";
      document.getElementById("modalTitle").className =
        "text-2xl font-bold mb-2 text-red-600";
      document.getElementById("modalMessage").textContent =
        `The correct answer was: ${correctAnswer}`;
      this.playSound("wrong");

      const existingMistake = currentState.mistakes.find(
        (m) => m.word === this.game.currentWord.word,
      );
      if (!existingMistake) {
        currentState.mistakes.unshift({
          word: this.game.currentWord.word,
          meaning: this.game.currentWord.meaning,
          sentences: this.game.currentWord.sentences
            ? [...this.game.currentWord.sentences]
            : [],
        });
        if (currentState.mistakes.length > 20) currentState.mistakes.pop();
      }
      this.game.saveData();
    }

    let content = `<div class="mb-4"><strong>Word:</strong> <a href="https://translate.google.com/?sl=de&tl=fa&text=${encodeURIComponent(this.game.currentWord.word)}" target="_blank" class="text-indigo-800 text-lg font-bold hover:underline">${this.game.currentWord.word}</a></div><div class="mb-1"><strong>Meaning:</strong> ${this.game.currentWord.meaning}</div>`;

    if (
      this.game.currentWord.sentences &&
      this.game.currentWord.sentences.length > 0
    ) {
      content += `<div class="mt-4"><strong>Example Sentences:</strong></div>`;
      this.game.currentWord.sentences.slice(0, 3).forEach((s) => {
        content += `<div class="pt-1 border-t border-gray-200"><div class="text-sm text-blue-700"><a href="https://translate.google.com/?sl=de&tl=fa&text=${encodeURIComponent(s.de)}" target="_blank" class="hover:underline">${s.de}</a></div><div class="text-sm text-gray-600 mt-1 text-right rtl" dir="rtl">"${s.fa}"</div></div>`;
      });
    }

    document.getElementById("modalDetails").innerHTML = content;
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }

  /**
   * نمایش جمله اصلی بعد از پاسخ
   */
  displayOriginalSentence() {
    const wordDisplay = document.getElementById("fallingWord");
    const sentenceDisplay = document.getElementById("sentenceDisplay");
    const questionType = document.getElementById("questionType");

    wordDisplay.className =
      "falling-word text-4xl font-bold text-indigo-800 mb-4";
    sentenceDisplay.classList.remove("hidden");
    questionType.textContent = "Original sentence";

    if (
      (this.game.currentQuestionType.isSentence ||
        this.game.currentQuestionType.type === "word_with_sentence") &&
      this.game.currentSentence
    ) {
      sentenceDisplay.textContent = `"${this.game.currentSentence.de}"`;
      wordDisplay.innerHTML = `<a href="https://translate.google.com/?sl=de&tl=fa&text=${encodeURIComponent(this.game.currentWord.word)}" target="_blank" class="text-indigo-800 hover:text-indigo-600 ">${this.game.currentWord.word}</a> ✓`;
    } else if (
      this.game.currentWord.sentences &&
      this.game.currentWord.sentences.length > 0
    ) {
      const rs =
        this.game.currentWord.sentences[
          Math.floor(Math.random() * this.game.currentWord.sentences.length)
        ];
      sentenceDisplay.innerHTML = `<div class="text-lg text-gray-800"><a href="https://translate.google.com/?sl=de&tl=fa&text=${encodeURIComponent(rs.de)}" target="_blank" class="hover:underline">${rs.de}</a></div><div class="text-sm text-gray-600 mt-2">"${rs.fa}"</div>`;
      wordDisplay.innerHTML = `<a href="https://translate.google.com/?sl=de&tl=fa&text=${encodeURIComponent(this.game.currentWord.word)}" target="_blank" class="text-indigo-800 hover:text-indigo-600 ">${this.game.currentWord.word}</a> ✓`;
    }
  }

  /**
   * نمایش لیست اشتباهات
   */
  showMistakesModal() {
    const modal = document.getElementById("mistakesModal");
    const listContainer = document.getElementById("mistakesList");
    listContainer.innerHTML = "";

    const currentState = this.game.getCurrentState();

    if (currentState.mistakes.length === 0) {
      listContainer.innerHTML = `<p class="text-gray-500 text-center py-8">Bisher wurden keine Fehler registriert.</p>`;
      modal.classList.remove("hidden");
      modal.classList.add("flex");
      return;
    }

    currentState.mistakes.forEach((item) => {
      let html = `
      <div class="border border-red-200 rounded-xl p-5 bg-red-50 hover:bg-red-100 transition-colors">
          <a href="https://translate.google.com/?sl=de&tl=fa&text=${encodeURIComponent(item.word)}" target="_blank" class="text-red-500 font-bold hover:underline text-xl block">${item.word}</a>
          <div class="text-gray-400 mt-1 text-md text-right dir-rtl" dir="rtl">${item.meaning}</div>`;

      if (item.sentences && item.sentences.length > 0) {
        html += `<div class="mt-4"><div class="text-sm font-semibold text-red-400 mb-2">Examples:</div>`;
        item.sentences.forEach((s) => {
          html += `
          <div class="mb-3 bg-white rounded-xl p-4 border border-gray-200">
            <div class="text-gray-800"><a href="https://translate.google.com/?sl=de&tl=fa&text=${encodeURIComponent(s.de)}" target="_blank" class="hover:underline">${s.de}</a></div>
            <div class="text-emerald-700 mt-1 text-right dir-rtl" dir="rtl">"${s.fa}"</div>
          </div>`;
        });
        html += `</div>`;
      }
      html += `</div>`;
      listContainer.innerHTML += html;
    });

    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }

  closeMistakesModal() {
    const modal = document.getElementById("mistakesModal");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }

  showConfidenceModal() {
    const modal = document.getElementById("confidenceModal");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    setTimeout(() => document.getElementById("sureBtn").focus(), 100);
  }

  // handleConfidence(confidence) {
  //   // فقط مودال را ببند
  //   const modal = document.getElementById("confidenceModal");
  //   if (modal) {
  //     modal.classList.add("hidden");
  //     modal.classList.remove("flex");
  //   }

  //   // منطق را به بازی بده
  //   this.game.handleConfidence(confidence);
  // }

  resetSession() {
    document.getElementById("startBtn").classList.remove("hidden");
    document.getElementById("nextBtn").classList.add("hidden");
    document.getElementById("fallingWord").textContent =
      "Klicke auf „Spiel starten“, um zu beginnen.";
    document.getElementById("sentenceDisplay").classList.add("hidden");
    document.getElementById("answerOptions").innerHTML = "";
    document.getElementById("hardInputContainer").classList.add("hidden");
  }

  showLevelComplete() {
    const modal = document.getElementById("resultModal");
    document.getElementById("modalIcon").textContent = "🎉";
    document.getElementById("modalTitle").textContent = "Level Complete!";
    document.getElementById("modalTitle").className =
      "text-2xl font-bold mb-2 text-green-600";
    document.getElementById("modalMessage").textContent =
      `You have mastered all active words in ${this.game.currentNiveau}!`;
    document.getElementById("modalDetails").innerHTML =
      `<div class="text-center py-6 text-gray-600">You can continue practicing or change level from the menu.</div>`;
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }

  closeModal() {


    const modal = document.getElementById("resultModal");
    modal.classList.add("hidden");
    modal.classList.remove("flex");

        // بازگردانی عناصر مخفی شده
    document.getElementById("modalIcon").classList.remove("hidden");
    document.getElementById("modalTitle").classList.remove("hidden");
    document.getElementById("modalMessage").classList.remove("hidden");



    this.game.isAnswering = false;

    if (
      this.modalSource === 'answerFlow' &&
      this.game.currentWord &&
      !document.getElementById("nextBtn").classList.contains("hidden")
    ) {
      this.game.nextQuestion();
    }

     this.modalSource = null;
  }

  handleInput() {
    const input = document.getElementById("hardInput").value.trim();
    const list = document.getElementById("autocompleteList");
    list.innerHTML = "";

    if (!input || this.game.autoCompleteMode === 0) {
      list.classList.add("hidden");
      return;
    }

    const minLength = this.game.autoCompleteMode;
    if (input.length < minLength) {
      list.classList.add("hidden");
      return;
    }

    const candidates = this.game.words
      .filter((w) => w.word.toLowerCase().startsWith(input.toLowerCase()))
      .slice(0, 8);

    if (candidates.length === 0) {
      list.classList.add("hidden");
      return;
    }

    candidates.forEach((word) => {
      const div = document.createElement("div");
      div.className =
        "px-5 py-3 hover:bg-indigo-50 cursor-pointer border-b last:border-0";
      div.textContent = word.word;
      div.onclick = () => {
        document.getElementById("hardInput").value = word.word;
        list.classList.add("hidden");
        this.game.submitHardAnswer();
      };
      list.appendChild(div);
    });

    list.classList.remove("hidden");
  }

  playSound(type) {
    const audioContext = new (
      window.AudioContext || window.webkitAudioContext
    )();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = type === "correct" ? 800 : 300;
    gainNode.gain.value = 0.1;
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  }

  showError(message) {
    const toast = document.createElement("div");
    toast.className =
      "fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
}