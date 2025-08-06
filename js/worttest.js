const data = JSON.parse(localStorage.getItem("testGroupData")) || [];
let score = 0;
let selectedGerman = null;
let selectedPersian = null;
let matchedPairs = 0;
let lockSelection = false;
let timeLeft = 840;
let timerInterval = null;
let currentMode = "words";
let currentSentenceIndex = 0;
let remainingSentences = 0;
let shuffledSentences = [];
let wrongAttempts = 0;
const columns = document.getElementById("columns");
const sentenceGame = document.getElementById("sentence-game");
const germanColumn = document.createElement("div");
germanColumn.id = "german-column";
germanColumn.className = "column";
const persianColumn = document.createElement("div");
persianColumn.id = "persian-column";
persianColumn.className = "column";
columns.appendChild(germanColumn);
columns.appendChild(persianColumn);
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const popup = document.getElementById("result-popup");
const totalScoreDisplay = document.getElementById("total-score");
const earnedScoreDisplay = document.getElementById("earned-score");
const sentenceBoxes = document.getElementById("sentence-boxes");
const wordBank = document.getElementById("word-bank");
const sentenceTranslation = document.getElementById("sentence-translation");
const sentenceCount = document.getElementById("counter");
const completedSentence = document.getElementById("completed-sentence");
let lockClick = false; // اضافه کردن قفل برای کلیک‌ها

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function loadPageItems() {
  const urlParams = new URLSearchParams(window.location.search);
  const groupIndex = parseInt(urlParams.get("groupIndex")) || 0;
  const level = urlParams.get("level") || "A2";
  document.getElementById("group-index").textContent = groupIndex;
  const audioPath = level === "A1" ? "audio-A1" : "audio-A2";

  columns.style.display = currentMode === "words" ? "flex" : "none";
  sentenceGame.style.display = currentMode === "sentences" ? "block" : "none";

  if (currentMode === "words") {
    germanColumn.innerHTML = "";
    persianColumn.innerHTML = "";
    const wordsOnly = data.filter(
      (item) =>
        item.Sound_de &&
        typeof item.Sound_de === "string" &&
        !/[.!?]$/.test(item.Sound_de.trim())
    );
    if (wordsOnly.length === 0) {
      columns.innerHTML =
        '<div style="color: #f4d03f; text-align: center;">هیچ کلمه‌ای برای آزمون یافت نشد.</div>';
      if (timerInterval) clearInterval(timerInterval);
      return;
    }
    const sortedGerman = [...wordsOnly].sort((a, b) =>
      a.Sound_de.localeCompare(b.Sound_de)
    );
    const shuffledPersian = shuffle([...wordsOnly]);
    sortedGerman.forEach((item) => {
      const div = document.createElement("div");
      div.className = "item german";
      div.textContent = item.Sound_de;
      div.dataset.filename = item.Filename;
      div.addEventListener("click", () => selectItem(div, "german"));
      germanColumn.appendChild(div);
    });
    shuffledPersian.forEach((item) => {
      const div = document.createElement("div");
      div.className = "item persian";
      div.textContent = item.translate_fa;
      div.dataset.filename = item.Filename;
      div.addEventListener("click", () => selectItem(div, "persian"));
      persianColumn.appendChild(div);
    });
  } else {
    if (shuffledSentences.length === 0) {
      shuffledSentences = shuffle([
        ...data.filter(
          (item) =>
            item.Sound_de &&
            typeof item.Sound_de === "string" &&
            /[.!?]$/.test(item.Sound_de.trim())
        ),
      ]);
      remainingSentences = shuffledSentences.length;
      wrongAttempts = 0;
    }
    loadSentenceGame(audioPath);
  }
}

function loadSentenceGame(audioPath) {
  sentenceBoxes.innerHTML = "";
  wordBank.innerHTML = "";
  sentenceTranslation.textContent = "";
  sentenceCount.textContent = remainingSentences;
  completedSentence.style.display = "none";
  completedSentence.textContent = "";
  wordBank.style.display = "flex";
  if (shuffledSentences.length === 0) {
    sentenceGame.innerHTML =
      '<div style="color: #f4d03f; text-align: center;">هیچ جمله‌ای برای آزمون یافت نشد.</div>';
    if (timerInterval) clearInterval(timerInterval);
    return;
  }
  if (currentSentenceIndex >= shuffledSentences.length) {
    showResult();
    return;
  }
  const currentSentence = shuffledSentences[currentSentenceIndex];
  sentenceTranslation.textContent = currentSentence.translate_fa;
  const words = currentSentence.Sound_de.trim().split(" ");
  const shuffledWords = shuffle([...words]);
  words.forEach((_, index) => {
    const box = document.createElement("div");
    box.className = "sentence-box";
    box.dataset.index = index;
    sentenceBoxes.appendChild(box);
  });
  shuffledWords.forEach((word) => {
    const wordItem = document.createElement("div");
    wordItem.className = "word-item";
    wordItem.textContent = word;
    wordItem.addEventListener("click", () =>
      handleWordClick(wordItem, word, currentSentence, audioPath, words)
    );
    wordBank.appendChild(wordItem);
  });
}

function handleWordClick(wordItem, word, sentence, audioPath, words) {
  if (lockClick) return; // اگر قفل فعال است، کلیک نادیده گرفته شود
  lockClick = true; // فعال کردن قفل

  const allBoxes = sentenceBoxes.querySelectorAll(".sentence-box");
  const emptyBox = Array.from(allBoxes).find((box) => !box.textContent);
  if (!emptyBox) {
    lockClick = false; // اگر باکس خالی نیست، قفل را آزاد کن
    return;
  }

  wordItem.classList.add("selected");
  const wordRect = wordItem.getBoundingClientRect();
  const boxRect = emptyBox.getBoundingClientRect();
  const translateX = boxRect.left - wordRect.left;
  const translateY = boxRect.top - wordRect.top;

  wordItem.style.transition = "transform 0.3s ease";
  wordItem.style.transform = `translate(${translateX}px, ${translateY}px)`;

  setTimeout(() => {
    emptyBox.textContent = word;
    wordItem.remove();
    const correctWord =
      sentence.Sound_de.trim().split(" ")[emptyBox.dataset.index];
    if (word === correctWord) {
      emptyBox.classList.add("correct");
      emptyBox.classList.remove("wrong");
    } else {
      emptyBox.classList.add("wrong");
      emptyBox.classList.remove("correct");
      wrongAttempts++;
      if (wrongAttempts >= 3) {
        score--;
        wrongAttempts = 0;
        scoreDisplay.textContent = score;
      }
      setTimeout(() => {
        sentenceBoxes.innerHTML = "";
        wordBank.innerHTML = "";
        const shuffledWords = shuffle([...words]);
        words.forEach((_, index) => {
          const newBox = document.createElement("div");
          newBox.className = "sentence-box";
          newBox.dataset.index = index;
          sentenceBoxes.appendChild(newBox);
        });
        shuffledWords.forEach((word) => {
          const wordItem = document.createElement("div");
          wordItem.className = "word-item";
          wordItem.textContent = word;
          wordItem.addEventListener("click", () =>
            handleWordClick(wordItem, word, sentence, audioPath, words)
          );
          wordBank.appendChild(wordItem);
        });
        lockClick = false; // آزاد کردن قفل پس از بازنشانی
      }, 1000);
      scoreDisplay.textContent = score;
      lockClick = false; // آزاد کردن قفل پس از پردازش خطا
      return;
    }
    scoreDisplay.textContent = score;
    const allCorrect = Array.from(allBoxes).every((box) =>
      box.classList.contains("correct")
    );
    if (allCorrect && wordBank.children.length === 0) {
      score++;
      remainingSentences--;
      wrongAttempts = 0;
      scoreDisplay.textContent = score;
      sentenceCount.textContent = remainingSentences;
      wordBank.style.display = "none";
      completedSentence.style.display = "block";
      completedSentence.textContent = sentence.Sound_de.trim();
      const audio = new Audio(`${audioPath}/${sentence.Filename}_de.mp3`);
      audio.addEventListener("ended", () => {
        currentSentenceIndex++;
        loadSentenceGame(audioPath);
      });
      audio.play();
    }
    lockClick = false; // آزاد کردن قفل پس از تکمیل پردازش
  }, 300);
}

function selectItem(element, type) {
  if (lockSelection || element.classList.contains("correct")) return;
  element.classList.add("selected");
  if (type === "german") {
    if (selectedGerman) selectedGerman.classList.remove("selected");
    selectedGerman = element;
  } else {
    if (selectedPersian) selectedPersian.classList.remove("selected");
    selectedPersian = element;
  }
  if (selectedGerman && selectedPersian) {
    checkMatch();
  }
}

function checkMatch() {
  const urlParams = new URLSearchParams(window.location.search);
  const level = urlParams.get("level") || "A2";
  const audioPath = level === "A1" ? "audio-A1" : "audio-A2";
  lockSelection = true;
  if (selectedGerman.dataset.filename === selectedPersian.dataset.filename) {
    selectedGerman.classList.add("correct");
    selectedPersian.classList.add("correct");
    score++;
    matchedPairs++;
    scoreDisplay.textContent = score;
    const audio = new Audio(
      `${audioPath}/${selectedGerman.dataset.filename}_de.mp3`
    );
    audio.play();
    selectedGerman = null;
    selectedPersian = null;
    lockSelection = false;
    if (
      matchedPairs ===
      data.filter(
        (item) =>
          item.Sound_de &&
          typeof item.Sound_de === "string" &&
          !/[.!?]$/.test(item.Sound_de.trim())
      ).length
    ) {
      if (timerInterval) clearInterval(timerInterval);
      showResult();
    }
  } else {
    selectedGerman.classList.add("wrong");
    selectedPersian.classList.add("wrong");
    score--;
    scoreDisplay.textContent = score;
    const audio = new Audio(`${audioPath}/falsch.mp3`);
    audio.play();
    setTimeout(() => {
      if (selectedGerman) selectedGerman.classList.remove("wrong");
      if (selectedPersian) selectedPersian.classList.remove("wrong");
      if (selectedGerman) selectedGerman.classList.remove("selected");
      if (selectedPersian) selectedPersian.classList.remove("selected");
      selectedGerman = null;
      selectedPersian = null;
      lockSelection = false;
    }, 1000);
  }
}

function showResult() {
  const sentences = data.filter(
    (item) =>
      item.Sound_de &&
      typeof item.Sound_de === "string" &&
      /[.!?]$/.test(item.Sound_de.trim())
  );
  totalScoreDisplay.textContent =
    currentMode === "words"
      ? data.filter(
          (item) =>
            item.Sound_de &&
            typeof item.Sound_de === "string" &&
            !/[.!?]$/.test(item.Sound_de.trim())
        ).length
      : sentences.length;
  earnedScoreDisplay.textContent = score;
  popup.style.display = "block";
  if (timerInterval) clearInterval(timerInterval);
}

function restartGame() {
  score = 0;
  matchedPairs = 0;
  currentSentenceIndex = 0;
  shuffledSentences = [];
  wrongAttempts = 0;
  timeLeft = 840;
  lockClick = false; // بازنشانی قفل
  scoreDisplay.textContent = score;
  timerDisplay.textContent = timeLeft;
  popup.style.display = "none";
  loadPageItems();
  startTimer();
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      showResult();
    }
  }, 1000);
}

function goBackToLevel() {
  const level = localStorage.getItem("selectedLevel") || "A2";
  window.location.href = `index.html?level=${level}`;
}

document.querySelectorAll('input[name="mode"]').forEach((radio) => {
  radio.addEventListener("change", (e) => {
    currentMode = e.target.value;
    score = 0;
    matchedPairs = 0;
    currentSentenceIndex = 0;
    shuffledSentences = [];
    wrongAttempts = 0;
    scoreDisplay.textContent = score;
    popup.style.display = "none";
    loadPageItems();
    startTimer();
  });
});

startTimer();
loadPageItems();
