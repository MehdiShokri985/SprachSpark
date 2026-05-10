
      class AdaptiveLearningGame {
        constructor() {
          this.words = [];
          this.currentNiveau = "A1";
          this.currentMode = "normal";
          this.allStates = {}; // Isolated states for each combination
          this.currentWord = null;
          this.currentQuestionType = null;
          this.currentSentence = null;
          this.isAnswering = false;
          this.lastFaToDeIndex = 0;
          this.pendingIsCorrect = false;
          this.pendingCorrectAnswer = null;
          this.autoCompleteMode = 1;

          this.init();
        }

        async init() {
          await this.loadData();
          this.setupEventListeners();
          this.updateUI();
          document.getElementById("modeModal").classList.remove("hidden");
        }

        // Get current combination key
        getCurrentKey() {
          return `${this.currentNiveau}_${this.currentMode}`;
        }

        // Get or create isolated state for current combination
        getCurrentState() {
          const key = this.getCurrentKey();
          if (!this.allStates[key]) {
            this.allStates[key] = {
              score: 0,
              totalQuestions: 0,
              correctAnswers: 0,
              wrongAnswers: 0,
              lastWordId: null,
              progress: 0,
              sessionNumber: 1,
              mistakes: []
            };
          }
          return this.allStates[key];
        }

        async loadData() {
          try {
            const savedWords = localStorage.getItem("konnektoren_words");
            if (savedWords) {
              this.words = JSON.parse(savedWords);
            } else {
              const wordsResponse = await fetch("json/konnektoren.json");
              this.words = await wordsResponse.json();

              this.words = this.words.map((word) => {
                const normalizedWord = { ...word };
                if (normalizedWord.strength === undefined || normalizedWord.strength === null) normalizedWord.strength = 0.3;
                normalizedWord.dueIn = normalizedWord.dueIn || 0;
                normalizedWord.seenCount = normalizedWord.seenCount || 0;
                normalizedWord.mistakeCount = normalizedWord.mistakeCount || 0;
                normalizedWord.correctStreak = normalizedWord.correctStreak || 0;
                normalizedWord.sureCount = normalizedWord.sureCount || 0;

                normalizedWord.sentences = (normalizedWord.sentences || []).map((s) => ({
                  ...s,
                  strength: typeof s.strength === "number" ? s.strength : 0.3,
                  dueIn: s.dueIn ?? 0,
                  mistakeCount: s.mistakeCount ?? 0,
                  seenCount: s.seenCount ?? 0,
                  correctStreak: s.correctStreak ?? 0,
                  sureCount: s.sureCount ?? 0,
                }));
                return normalizedWord;
              });
            }

            // Load all combination states
            this.loadAllStates();
            this.saveData();
          } catch (error) {
            console.error("Error loading data:", error);
            this.showError("Failed to load game data");
          }
        }

        loadAllStates() {
          const combinations = [
            "A1_normal", "A1_hard", "A2_normal", "A2_hard",
            "B1_normal", "B1_hard", "B2_normal", "B2_hard",
            "C1_normal", "C1_hard", "C2_normal", "C2_hard"
          ];

          combinations.forEach(key => {
            const savedState = localStorage.getItem(`konnektoren_state_${key}`);
            if (savedState) {
              this.allStates[key] = JSON.parse(savedState);
            }
          });
        }

        saveData() {
          // Save words data
          localStorage.setItem("konnektoren_words", JSON.stringify(this.words));
          
          // Save current combination state
          const key = this.getCurrentKey();
          const currentState = this.getCurrentState();
          localStorage.setItem(`konnektoren_state_${key}`, JSON.stringify(currentState));
          
          // Debug tracing
          console.log(`💾 Saved state for ${key}:`, {
            niveau: this.currentNiveau,
            mode: this.currentMode,
            score: currentState.score,
            correctAnswers: currentState.correctAnswers,
            wrongAnswers: currentState.wrongAnswers,
            mistakesCount: currentState.mistakes.length
          });
        }

        setupEventListeners() {
          document.getElementById("startBtn").addEventListener("click", () => this.startGame());
          document.getElementById("nextBtn").addEventListener("click", () => this.nextQuestion());
          document.getElementById("resetBtn").addEventListener("click", () => this.resetProgress());
          document.getElementById("modalCloseBtn").addEventListener("click", () => this.closeModal());
          document.getElementById("levelSelect").addEventListener("change", (e) => this.changeLevel(e.target.value));
          document.getElementById("modeSelect").addEventListener("change", (e) => this.changeMode(e.target.value));
          document.getElementById("sureBtn").addEventListener("click", () => this.handleConfidence("sure"));
          document.getElementById("maybeBtn").addEventListener("click", () => this.handleConfidence("maybe"));
          document.getElementById("closeMistakesBtn").addEventListener("click", () => this.closeMistakesModal());
          document.getElementById("wrongCounter").addEventListener("click", () => this.showMistakesModal());

          const hardInput = document.getElementById("hardInput");
          hardInput.addEventListener("input", () => this.handleInput());
          hardInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") this.submitHardAnswer();
          });

          document.addEventListener("keydown", (e) => {
            if (this.isAnswering) return;
            const currentState = this.getCurrentState();
            switch (e.key) {
              case "Enter":
                if (currentState.totalQuestions === 0) this.startGame();
                else this.nextQuestion();
                break;
              case "Escape":
                document.querySelectorAll(".modal-overlay").forEach(m => {
                  if (!m.classList.contains("hidden")) m.classList.add("hidden");
                });
                break;
            }
          });
        }

        selectMode(mode) {
          this.currentMode = mode;
          document.getElementById("modeModal").classList.add("hidden");
          this.updateUI();
        }

        setAutoCompleteMode(mode) {
          this.autoCompleteMode = mode;

          // به‌روزرسانی استایل دکمه‌ها
          document.querySelectorAll('#hardInputContainer button[id^="ac"]').forEach(btn => {
            btn.classList.toggle('border-indigo-600', parseInt(btn.id.replace('ac','')) === mode);
          });

          // نمایش/مخفی کردن دکمه Prüfen فقط در حالت 0
          const submitBtn = document.getElementById("submitBtn");
          if (submitBtn) {
            submitBtn.classList.toggle("hidden", mode !== 0);
          }
        }

        startGame() {
          const currentState = this.getCurrentState();
          currentState.totalQuestions = 0;
          currentState.sessionNumber++;
          document.getElementById("startBtn").classList.add("hidden");
          document.getElementById("nextBtn").classList.remove("hidden");
          this.nextQuestion();
        }

        // ==================== بقیه متدها بدون تغییر ====================
        selectNextWord() {
          const levelWords = this.words.filter((word) => (word.level || "A1") === this.currentNiveau);
          const activeWords = levelWords.filter((word) => (word.sureCount || 0) < 2);
          if (activeWords.length === 0) return null;

          const dueWords = activeWords.filter((word) => word.dueIn <= 0);
          const candidateWords = dueWords.length > 0 ? dueWords : activeWords;

          const currentState = this.getCurrentState();
          let availableWords = candidateWords.filter((word) => word.id !== currentState.lastWordId);
          if (availableWords.length === 0) availableWords = candidateWords;

          const newWords = availableWords.filter((word) => word.seenCount === 0);
          const reviewWords = availableWords.filter((word) => word.seenCount > 0);

          const questionPosition = currentState.totalQuestions % 4;
          let selectedPool = questionPosition === 0 && newWords.length > 0 ? newWords : reviewWords.length > 0 ? reviewWords : newWords;

          selectedPool.sort((a, b) => {
            if (a.strength !== b.strength) return a.strength - b.strength;
            if (a.mistakeCount !== b.mistakeCount) return b.mistakeCount - a.mistakeCount;
            return a.seenCount - b.seenCount;
          });

          let selected = selectedPool[0];
          if (selected && selected.id === currentState.lastWordId && selectedPool.length > 1) {
            selected = selectedPool.find((w) => w.id !== currentState.lastWordId) || selected;
          }
          return selected;
        }

        determineQuestionType(word) {
          const s = word.strength;
          this.questionCounter = (this.questionCounter || 0) + 1;

          if (this.lastFaToDeIndex > 4) {
            this.lastFaToDeIndex = 0;
            return !word.sentences || word.sentences.length === 0 ? { type: "de_to_fa", showWord: true } : { type: "fa_to_de", showWord: true };
          }

          let mode;
          const rand = Math.random();
          if (s < 0.4) mode = rand < 0.6 ? "de_to_fa" : "word_with_sentence";
          else if (s < 0.7) {
            if (rand < 0.4) mode = "de_to_fa";
            else if (rand < 0.8) mode = "word_with_sentence";
            else mode = "fa_to_de";
          } else {
            if (rand < 0.4) mode = "fa_to_de";
            else if (rand < 0.8) mode = "sentence_only";
            else mode = "word_with_sentence";
          }

          if ((mode === "word_with_sentence" || mode === "sentence_only") && (!word.sentences || word.sentences.length === 0)) {
            mode = "de_to_fa";
          }

          if (mode === "fa_to_de") this.lastFaToDeIndex = 0;
          else this.lastFaToDeIndex++;

          const result = {
            de_to_fa: () => ({ type: "de_to_fa", showWord: true }),
            word_with_sentence: () => ({ type: "word_with_sentence", showSentence: true }),
            fa_to_de: () => ({ type: "fa_to_de", showWord: true }),
            sentence_only: () => ({ type: "sentence_only", showSentence: true, isSentence: true }),
          }[mode]();

          return result;
        }

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

          if (this.currentMode === "hard") {
            hardContainer.classList.remove("hidden");
            this.renderHardQuestion();
          } else {
            wordDisplay.className = "falling-word text-4xl font-bold text-indigo-800 mb-4";
            sentenceDisplay.classList.add("hidden");
            questionType.textContent = "";

            const isSentence = this.currentQuestionType.isSentence && this.currentSentence;
            const target = isSentence ? this.currentSentence : this.currentWord;
            const sureCount = target.sureCount || 0;

            switch (this.currentQuestionType.type) {
              case "de_to_fa":
                wordDisplay.innerHTML = `<a href="https://translate.google.com/?sl=de&tl=fa&text=${encodeURIComponent(this.currentWord.word)}" target="_blank" class="text-indigo-800 hover:text-indigo-600 ">${this.currentWord.word}</a>`;
                questionType.textContent = "Auf Persisch übersetzen";
                break;
              case "word_with_sentence":
                sentenceDisplay.textContent = `"${this.currentSentence.fa}"`;
                sentenceDisplay.classList.remove("hidden");
                questionType.textContent = "Finde das konnektoren";
                wordDisplay.textContent = "?";
                break;
              case "fa_to_de":
                wordDisplay.textContent = this.currentWord.meaning;
                questionType.textContent = "Ins Deutsche übersetzen";
                break;
              case "sentence_only":
                sentenceDisplay.textContent = `"${this.currentSentence.de}"`;
                sentenceDisplay.classList.remove("hidden");
                questionType.textContent = "Was bedeutet dieser Satz?";
                wordDisplay.textContent = "?";
                break;
            }

            // Display sure count
            questionType.textContent += ` (Sure: ${sureCount}/2)`;
            this.generateAnswerOptions();
          }
        }

        renderHardQuestion() {
          const wordDisplay = document.getElementById("fallingWord");
          const sentenceDisplay = document.getElementById("sentenceDisplay");
          const questionType = document.getElementById("questionType");

          wordDisplay.className = "falling-word text-4xl font-bold text-indigo-800 mb-4";
          sentenceDisplay.classList.add("hidden");
          questionType.textContent = "";

          const isSentence = this.currentQuestionType.isSentence && this.currentSentence;
          const target = isSentence ? this.currentSentence : this.currentWord;
          const sureCount = target.sureCount || 0;

          if (this.currentQuestionType.type === "word_with_sentence" || this.currentQuestionType.type === "sentence_only") {
            sentenceDisplay.textContent = `"${this.currentSentence.fa}"`;
            sentenceDisplay.classList.remove("hidden");
            questionType.textContent = "Schreibe das passende konnektoren";
            wordDisplay.textContent = "?";
          } else {
            wordDisplay.textContent = this.currentWord.meaning;
            questionType.textContent = "Ins Deutsche übersetzen (eintippen)";
          }

          // Display sure count
          questionType.textContent += ` (Sure: ${sureCount}/2)`;
          this.setAutoCompleteMode(1);
        }

        handleInput() {
          const input = document.getElementById("hardInput").value.trim();
          const list = document.getElementById("autocompleteList");
          list.innerHTML = "";

          if (!input || this.autoCompleteMode === 0) {
            list.classList.add("hidden");
            return;
          }

          const minLength = this.autoCompleteMode;
          if (input.length < minLength) {
            list.classList.add("hidden");
            return;
          }

          const candidates = this.words
            .filter(w => w.word.toLowerCase().startsWith(input.toLowerCase()))
            .slice(0, 8);

          if (candidates.length === 0) {
            list.classList.add("hidden");
            return;
          }

          candidates.forEach(word => {
            const div = document.createElement("div");
            div.className = "px-5 py-3 hover:bg-indigo-50 cursor-pointer border-b last:border-0";
            div.textContent = word.word;
            div.onclick = () => {
              document.getElementById("hardInput").value = word.word;
              list.classList.add("hidden");
              this.submitHardAnswer();
            };
            list.appendChild(div);
          });

          list.classList.remove("hidden");
        }

        submitHardAnswer() {
          if (this.isAnswering) return;
          const selected = document.getElementById("hardInput").value.trim();
          if (!selected) return;

          this.isAnswering = true;
          const correctAnswer = this.currentWord.word;
          const isCorrect = selected.toLowerCase() === correctAnswer.toLowerCase();

          this.pendingIsCorrect = isCorrect;
          this.pendingCorrectAnswer = correctAnswer;

          const currentState = this.getCurrentState();
          
          // 🧪 DEBUG: Trace memory references
          console.log(`🔍 DEBUG submitHardAnswer - ${this.getCurrentKey()}:`, {
            activeNiveau: this.currentNiveau,
            activeMode: this.currentMode,
            storageKey: `konnektoren_state_${this.getCurrentKey()}`,
            wrongCountRef: currentState.wrongAnswers,
            correctCountRef: currentState.correctAnswers,
            scoreRef: currentState.score,
            stateMemoryRef: currentState
          });
          
          if (isCorrect) {
            currentState.correctAnswers++;
            currentState.score += 30;
            console.log(`✅ Updated correctCount: ${currentState.correctAnswers}, score: ${currentState.score}`);
          } else {
            currentState.wrongAnswers++;
            console.log(`❌ Updated wrongCount: ${currentState.wrongAnswers}`);
          }

          currentState.totalQuestions++;
          this.saveData();
          this.showConfidenceModal();
          this.updateUI();
        }

        generateAnswerOptions() {
          const answerOptions = document.getElementById("answerOptions");
          answerOptions.innerHTML = "";

          let correctAnswer;
          switch (this.currentQuestionType.type) {
            case "de_to_fa": correctAnswer = this.currentWord.meaning; break;
            case "word_with_sentence": correctAnswer = this.currentWord.word; break;
            case "fa_to_de": correctAnswer = this.currentWord.word; break;
            case "sentence_only": correctAnswer = this.currentSentence.fa; break;
          }

          let options = [correctAnswer];
          const distractors = this.generateDistractors(correctAnswer, 3);
          options = options.concat(distractors);
          options.sort(() => Math.random() - 0.5);

          options.forEach((option) => {
            const button = document.createElement("button");
            button.className = "bg-white border-2 border-gray-300 rounded-lg p-4 text-center hover:border-indigo-500 hover:bg-indigo-50 transition-all transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2";

            if (this.currentQuestionType.type === "fa_to_de" || this.currentQuestionType.type === "word_with_sentence") {
              button.innerHTML = `<div class="flex justify-between items-center"><span>${option}</span><a href="https://translate.google.com/?sl=de&tl=fa&text=${encodeURIComponent(option)}" target="_blank" class="text-indigo-600 hover:text-indigo-800 text-sm ml-2" onclick="event.stopPropagation()">🌐</a></div>`;
            } else {
              button.textContent = option;
            }

            button.addEventListener("click", () => this.checkAnswer(option, correctAnswer));
            answerOptions.appendChild(button);
          });
        }

        generateDistractors(correctAnswer, count) {
          let distractors = new Set();
          const type = this.currentQuestionType.type;
          let candidates = [];

          if (type === "de_to_fa")
            candidates = this.words.filter((w) => w.meaning !== correctAnswer).map((w) => w.meaning);
          else if (type === "fa_to_de" || type === "word_with_sentence")
            candidates = this.words.filter((w) => w.word !== correctAnswer).map((w) => w.word);
          else if (type === "sentence_only")
            candidates = this.words.flatMap((w) => w.sentences || []).filter((s) => s.fa !== correctAnswer).map((s) => s.fa);

          candidates.sort(() => Math.random() - 0.5);

          for (let item of candidates) {
            if (distractors.size >= count) break;
            const correctLen = String(correctAnswer).length;
            const itemLen = String(item).length;
            if (Math.abs(correctLen - itemLen) <= 3 || 
                (correctAnswer && item && String(correctAnswer)[0].toLowerCase() === String(item)[0].toLowerCase())) {
              distractors.add(item);
            }
          }

          while (distractors.size < count && candidates.length > 0) {
            distractors.add(candidates[Math.floor(Math.random() * candidates.length)]);
          }

          if (distractors.size < count) {
            const fallbacks = {
              de_to_fa: ["کوچک", "زیبا", "سریع", "قدیمی", "جدید", "خوب", "بد", "بزرگ", "گرم", "سرد"],
              fa_to_de: ["klein", "schön", "schnell", "alt", "neu", "gut", "schlecht", "groß", "lang", "kurz"],
              word_with_sentence: ["klein", "schön", "schnell", "alt", "neu", "gut", "groß", "lang", "kurz", "teuer"],
              sentence_only: ["این جمله تست است.", "خانه کوچک است.", "من خوشحال هستم.", "او سریع می‌دود.", "کتاب جالب است."],
            };
            const list = fallbacks[type] || fallbacks["fa_to_de"];
            for (let fb of list) {
              if (fb !== correctAnswer) distractors.add(fb);
              if (distractors.size >= count) break;
            }
          }
          return Array.from(distractors).slice(0, count);
        }

        checkAnswer(selectedAnswer, correctAnswer) {
          if (this.isAnswering) return;
          this.isAnswering = true;
          const isCorrect = selectedAnswer === correctAnswer;
          this.pendingIsCorrect = isCorrect;
          this.pendingCorrectAnswer = correctAnswer;

          const currentState = this.getCurrentState();
          
          // 🧪 DEBUG: Trace memory references
          console.log(`🔍 DEBUG checkAnswer - ${this.getCurrentKey()}:`, {
            activeNiveau: this.currentNiveau,
            activeMode: this.currentMode,
            storageKey: `konnektoren_state_${this.getCurrentKey()}`,
            wrongCountRef: currentState.wrongAnswers,
            correctCountRef: currentState.correctAnswers,
            scoreRef: currentState.score,
            stateMemoryRef: currentState
          });
          
          if (isCorrect) {
            currentState.correctAnswers++;
            const scoreMap = { de_to_fa: 10, word_with_sentence: 15, fa_to_de: 20, sentence_only: 25 };
            currentState.score += scoreMap[this.currentQuestionType.type] || 10;
            console.log(`✅ Updated correctCount: ${currentState.correctAnswers}, score: ${currentState.score}`);
          } else {
            currentState.wrongAnswers++;
            console.log(`❌ Updated wrongCount: ${currentState.wrongAnswers}`);
          }

          currentState.totalQuestions++;
          currentState.lastWordId = this.currentWord.id;
          this.saveData();
          this.showConfidenceModal();
          this.updateUI();
        }

        showConfidenceModal() {
          const modal = document.getElementById("confidenceModal");
          modal.classList.remove("hidden");
          modal.classList.add("flex");
          setTimeout(() => document.getElementById("sureBtn").focus(), 100);
        }

        handleConfidence(confidence) {
          const modal = document.getElementById("confidenceModal");
          modal.classList.add("hidden");
          modal.classList.remove("flex");

          const isCorrect = this.pendingIsCorrect;
          const isSentence = this.currentQuestionType && this.currentQuestionType.isSentence && this.currentSentence;
          const target = isSentence ? this.currentSentence : this.currentWord;

          if (isCorrect) {
            if (confidence === "sure") {
              target.strength = Math.min(1, (target.strength || 0) + 0.25);
              target.dueIn = Math.min(40, (target.dueIn || 0) + 15);
              target.sureCount = (target.sureCount || 0) + 1;
              target.correctStreak = (target.correctStreak || 0) + 1;
              target.mistakeCount = 0;
            } else {
              target.strength = Math.min(1, (target.strength || 0) + 0.08);
              target.dueIn = Math.min(25, Math.max(1, (target.dueIn || 0) + 3));
              target.sureCount = (target.sureCount || 0) - 1;
              target.correctStreak = (target.correctStreak || 0) + 1;
              target.mistakeCount = 0;
            }
          } else {
            if (confidence === "sure") {
              target.strength = Math.max(0.001, (target.strength || 0) - 0.3);
              target.dueIn = 1;
              target.mistakeCount = (target.mistakeCount || 0) + 2;
              target.correctStreak = 0;
              target.sureCount = (target.sureCount || 0) - 1;
            } else {
              target.strength = Math.max(0.001, (target.strength || 0) - 0.05);
              target.dueIn = 1;
              target.mistakeCount = (target.mistakeCount || 0) + 1;
              target.correctStreak = 0;
              target.sureCount = (target.sureCount || 0) - 1;
            }
          }

          this.saveData();
          this.showResult(this.pendingIsCorrect, this.pendingCorrectAnswer);
          this.updateUI();
        }

        showResult(isCorrect, correctAnswer) {
          const modal = document.getElementById("resultModal");
          this.displayOriginalSentence();
          const currentState = this.getCurrentState();

          // 🧪 DEBUG: Trace memory references
          console.log(`🔍 DEBUG showResult - ${this.getCurrentKey()}:`, {
            activeNiveau: this.currentNiveau,
            activeMode: this.currentMode,
            storageKey: `konnektoren_state_${this.getCurrentKey()}`,
            mistakesListRef: currentState.mistakes,
            mistakesLength: currentState.mistakes.length,
            stateMemoryRef: currentState
          });

          if (isCorrect) {
            document.getElementById("modalIcon").textContent = "✅";
            document.getElementById("modalTitle").textContent = "Correct!";
            document.getElementById("modalTitle").className = "text-2xl font-bold mb-2 text-green-600";
            document.getElementById("modalMessage").textContent = "Great job! Keep it up!";
            this.playSound("correct");
          } else {
            document.getElementById("modalIcon").textContent = "❌";
            document.getElementById("modalTitle").textContent = "Wrong";
            document.getElementById("modalTitle").className = "text-2xl font-bold mb-2 text-red-600";
            document.getElementById("modalMessage").textContent = `The correct answer was: ${correctAnswer}`;
            this.playSound("wrong");

            // Add to isolated mistakes list (prevent duplicates)
            console.log(`📝 Adding mistake to ${this.getCurrentKey()} mistakes list`);
            const existingMistake = currentState.mistakes.find(m => m.word === this.currentWord.word);
            if (!existingMistake) {
              currentState.mistakes.unshift({
                word: this.currentWord.word,
                meaning: this.currentWord.meaning,
                sentences: this.currentWord.sentences ? [...this.currentWord.sentences] : [],
              });
              if (currentState.mistakes.length > 20) currentState.mistakes.pop();
              console.log(`📝 Mistakes list length now: ${currentState.mistakes.length}`);
            } else {
              console.log(`📝 Word "${this.currentWord.word}" already in mistakes list, skipping`);
            }
            this.saveData();
          }

          let content = `<div class="mb-4"><strong>Word:</strong> <a href="https://translate.google.com/?sl=de&tl=fa&text=${encodeURIComponent(this.currentWord.word)}" target="_blank" class="text-indigo-600 hover:underline">${this.currentWord.word}</a></div><div class="mb-3"><strong>Meaning:</strong> ${this.currentWord.meaning}</div>`;
          if (this.currentWord.sentences && this.currentWord.sentences.length > 0) {
            content += `<div class="mt-4"><strong>Example Sentences:</strong></div>`;
            this.currentWord.sentences.slice(0, 3).forEach((s) => {
              content += `<div class="mt-3 pt-3 border-t border-gray-200"><div class="text-sm text-gray-700"><a href="https://translate.google.com/?sl=de&tl=fa&text=${encodeURIComponent(s.de)}" target="_blank" class="hover:underline">${s.de}</a></div><div class="text-sm text-gray-600 mt-1">"${s.fa}"</div></div>`;
            });
          }
          document.getElementById("modalDetails").innerHTML = content;
          modal.classList.remove("hidden");
          modal.classList.add("flex");
        }

        displayOriginalSentence() {
          const wordDisplay = document.getElementById("fallingWord");
          const sentenceDisplay = document.getElementById("sentenceDisplay");
          const questionType = document.getElementById("questionType");

          wordDisplay.className = "falling-word text-4xl font-bold text-indigo-800 mb-4";
          sentenceDisplay.classList.remove("hidden");
          questionType.textContent = "Original sentence";

          if ((this.currentQuestionType.isSentence || this.currentQuestionType.type === "word_with_sentence") && this.currentSentence) {
            sentenceDisplay.textContent = `"${this.currentSentence.de}"`;
            wordDisplay.innerHTML = `<a href="https://translate.google.com/?sl=de&tl=fa&text=${encodeURIComponent(this.currentWord.word)}" target="_blank" class="text-indigo-800 hover:text-indigo-600 ">${this.currentWord.word}</a> ✓`;
          } else if (this.currentWord.sentences && this.currentWord.sentences.length > 0) {
            const rs = this.currentWord.sentences[Math.floor(Math.random() * this.currentWord.sentences.length)];
            sentenceDisplay.innerHTML = `<div class="text-lg text-gray-800"><a href="https://translate.google.com/?sl=de&tl=fa&text=${encodeURIComponent(rs.de)}" target="_blank" class="hover:underline">${rs.de}</a></div><div class="text-sm text-gray-600 mt-2">"${rs.fa}"</div>`;
            wordDisplay.innerHTML = `<a href="https://translate.google.com/?sl=de&tl=fa&text=${encodeURIComponent(this.currentWord.word)}" target="_blank" class="text-indigo-800 hover:text-indigo-600 ">${this.currentWord.word}</a> ✓`;
          }
        }

        showMistakesModal() {
          const modal = document.getElementById("mistakesModal");
          const listContainer = document.getElementById("mistakesList");
          listContainer.innerHTML = "";
          
          const currentState = this.getCurrentState();
          
          // 🧪 DEBUG: Trace memory references
          console.log(`🔍 DEBUG showMistakesModal - ${this.getCurrentKey()}:`, {
            activeNiveau: this.currentNiveau,
            activeMode: this.currentMode,
            storageKey: `konnektoren_state_${this.getCurrentKey()}`,
            mistakesListRef: currentState.mistakes,
            mistakesLength: currentState.mistakes.length,
            stateMemoryRef: currentState
          });

          if (currentState.mistakes.length === 0) {
            listContainer.innerHTML = `<p class="text-gray-500 text-center py-8">هنوز اشتباهی ثبت نشده است.</p>`;
            modal.classList.remove("hidden");
            modal.classList.add("flex");
            return;
          }

          currentState.mistakes.forEach((item) => {
            let html = `
            <div class="border border-red-200 rounded-xl p-5 bg-red-50 hover:bg-red-100 transition-colors">
                <a href="https://translate.google.com/?sl=de&tl=fa&text=${encodeURIComponent(item.word)}" target="_blank" class="text-red-700 font-bold hover:underline text-xl block">${item.word}</a>
                <div class="text-gray-700 mt-1 text-lg">${item.meaning}</div>`;

            if (item.sentences && item.sentences.length > 0) {
              html += `<div class="mt-4"><div class="text-sm font-semibold text-red-600 mb-2">Examples:</div>`;
              item.sentences.forEach((s) => {
                html += `
                <div class="mb-3 bg-white rounded-xl p-4 border border-gray-200">
                  <div class="text-gray-800"><a href="https://translate.google.com/?sl=de&tl=fa&text=${encodeURIComponent(s.de)}" target="_blank" class="hover:underline">${s.de}</a></div>
                  <div class="text-emerald-700 mt-1">"${s.fa}"</div>
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

        showLevelComplete() {
          const modal = document.getElementById("resultModal");
          document.getElementById("modalIcon").textContent = "🎉";
          document.getElementById("modalTitle").textContent = "Level Complete!";
          document.getElementById("modalTitle").className = "text-2xl font-bold mb-2 text-green-600";
          document.getElementById("modalMessage").textContent = `You have mastered all active words in ${this.currentNiveau}!`;
          document.getElementById("modalDetails").innerHTML = `<div class="text-center py-6 text-gray-600">You can continue practicing or change level from the menu.</div>`;
          modal.classList.remove("hidden");
          modal.classList.add("flex");
        }

        closeModal() {
          const modal = document.getElementById("resultModal");
          modal.classList.add("hidden");
          modal.classList.remove("flex");
          this.isAnswering = false;
          // Only call nextQuestion if game is active and has questions
          if (this.currentWord && document.getElementById("nextBtn").classList.contains("hidden") === false) {
            this.nextQuestion();
          }
        }

        changeMode(newMode) {
          this.currentMode = newMode;
          this.resetSession();
          this.updateUI();
          this.saveData();
          
          // Debug tracing
          console.log(`🔄 Changed to ${this.getCurrentKey()}`);
        }

        changeLevel(newLevel) {
          this.currentNiveau = newLevel;
          this.resetSession();
          this.updateUI();
          this.saveData();
          
          // Debug tracing
          console.log(`🔄 Changed to ${this.getCurrentKey()}`);
        }

        resetSession() {
          // Only reset session-specific UI state, NOT the persistent counters
          // Counters (correctAnswers, wrongAnswers, score) must persist per combination
          document.getElementById("startBtn").classList.remove("hidden");
          document.getElementById("nextBtn").classList.add("hidden");
          document.getElementById("fallingWord").textContent = 'Klicke auf „Spiel starten“, um zu beginnen. ';
          document.getElementById("sentenceDisplay").classList.add("hidden");
          document.getElementById("answerOptions").innerHTML = "";
          document.getElementById("hardInputContainer").classList.add("hidden");
        }

        resetProgress() {
          if (confirm("Are you sure you want to reset all progress for current combination?")) {
            const key = this.getCurrentKey();
            localStorage.removeItem(`konnektoren_state_${key}`);
            delete this.allStates[key];
            
            // Reset word progress data for current niveau to fix progressBar
            const levelWords = this.words.filter((word) => (word.level || "A1") === this.currentNiveau);
            levelWords.forEach(word => {
              word.strength = 0.3;
              word.dueIn = 0;
              word.seenCount = 0;
              word.mistakeCount = 0;
              word.correctStreak = 0;
              word.sureCount = 0;
              
              // Reset sentence progress too
              if (word.sentences) {
                word.sentences.forEach(sentence => {
                  sentence.strength = 0.3;
                  sentence.dueIn = 0;
                  sentence.mistakeCount = 0;
                  sentence.seenCount = 0;
                  sentence.correctStreak = 0;
                  sentence.sureCount = 0;
                });
              }
            });
            
            this.resetSession();
            this.updateUI();
            this.saveData();
            
            // Debug tracing
            console.log(`🗑️ Reset progress for ${key} and word data for niveau ${this.currentNiveau}`);
          }
        }

        updateUI() {
          const levelWords = this.words.filter((w) => (w.level || "A1") === this.currentNiveau);
          let totalSureNeeded = levelWords.length * 2;
          let totalSureAchieved = levelWords.reduce((sum, word) => sum + Math.min(2, (word.sureCount || 0)), 0);

          const percentage = totalSureNeeded > 0 ? Math.round((totalSureAchieved / totalSureNeeded) * 100) : 0;
          const currentState = this.getCurrentState();
          
          // 🧪 DEBUG: Trace memory references
          console.log(`🔍 DEBUG updateUI - ${this.getCurrentKey()}:`, {
            activeNiveau: this.currentNiveau,
            activeMode: this.currentMode,
            storageKey: `konnektoren_state_${this.getCurrentKey()}`,
            wrongCountRef: currentState.wrongAnswers,
            correctCountRef: currentState.correctAnswers,
            scoreRef: currentState.score,
            progressBarSource: percentage,
            stateMemoryRef: currentState
          });

          document.getElementById("correctCount").textContent = currentState.correctAnswers;
          document.getElementById("wrongCount").textContent = currentState.wrongAnswers;
          document.getElementById("score").textContent = currentState.score;
          document.getElementById("masteryProgress").textContent = percentage;
          document.getElementById("progressBar").style.width = `${percentage}%`;
          document.getElementById("levelSelect").value = this.currentNiveau;
          document.getElementById("modeSelect").value = this.currentMode;

          document.getElementById("levelStats").innerHTML = `Wörter: <strong>${levelWords.length}</strong> | Richtig: <strong>${currentState.correctAnswers}</strong> | Falsch: <strong>${currentState.wrongAnswers}</strong>`;
          
          // Debug tracing
          console.log(`🎯 Updated UI for ${this.getCurrentKey()}:`, {
            niveau: this.currentNiveau,
            mode: this.currentMode,
            correctAnswers: currentState.correctAnswers,
            wrongAnswers: currentState.wrongAnswers,
            score: currentState.score,
            progress: percentage
          });
        }

        playSound(type) {
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
          toast.className = "fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse";
          toast.textContent = message;
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 3000);
        }

        nextQuestion() {
          this.currentWord = this.selectNextWord();
          if (!this.currentWord) {
            this.showLevelComplete();
            return;
          }

          this.currentQuestionType = this.determineQuestionType(this.currentWord);
          this.currentSentence = null;
          const currentState = this.getCurrentState();

          this.currentWord.seenCount = (this.currentWord.seenCount || 0) + 1;
          currentState.lastWordId = this.currentWord.id;

          if (this.currentQuestionType.showSentence && this.currentWord.sentences?.length > 0) {
            const available = this.currentWord.sentences.filter((s) => s.dueIn <= 0);
            const pool = available.length > 0 ? available : this.currentWord.sentences;
            this.currentSentence = pool[Math.floor(Math.random() * pool.length)];
            if (this.currentSentence) this.currentSentence.seenCount = (this.currentSentence.seenCount || 0) + 1;
          }

          this.renderQuestion();
          this.updateUI();
          this.saveData();
        }
      }

      let game;
      document.addEventListener("DOMContentLoaded", () => {
        game = new AdaptiveLearningGame();
      });
