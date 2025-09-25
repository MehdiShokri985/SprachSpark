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
let difficultyLevel = "simple";
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
let lockClick = false;
const legend = document.getElementById("legend");
const navigationButtons = document.getElementById("navigation-buttons");
const prevSentenceButton = document.getElementById("prev-sentence");
const nextSentenceButton = document.getElementById("next-sentence");
let completedSentencesStates = [];
const playAudioButton = document.getElementById("play-audio");
const sentenceRoot = document.getElementById("sentence-root");

let config = "";

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const levelConfig = {
  A1: {
    audioPath: "../audio-A1",
  },
  A2: {
    audioPath: "../audio-A2",
  },
  "A1 VERBEN": {
    audioPath: "../audio-A1",
  },
  "A2 VERBEN": {
    audioPath: "../audio-A2",
  },
  "A1 Kollokationen": {
    audioPath: "../audio-A1-Kollokationen",
  },
  "A2 Kollokationen": {
    audioPath: "../audio-A2-Kollokationen",
  },
  "A1 Gruppierte Worter": {
    audioPath: "../audio-A1",
  },
  "A2 Gruppierte Worter": {
    audioPath: "../audio-A2",
  },
  "A1 Synonyms worter": {
    audioPath: "../audio-A1",
  },
  "A2 Synonyms worter": {
    audioPath: "../audio-A2",
  },
  "A1 Synonyms verb": {
    audioPath: "../audio-A1",
  },
  "A2 Synonyms verb": {
    audioPath: "../audio-A2",
  },
};

function loadPageItems() {
  // const urlParams = new URLSearchParams(window.location.search);

  const urlParams = new URLSearchParams(window.location.search);
  const level = urlParams.get("level");

  if (level && levelConfig[level]) {
    config = levelConfig[level];
  }

  const groupIndex = parseInt(urlParams.get("groupIndex")) || 0;
  // const level = urlParams.get("level") || "A2";
  document.getElementById("group-index").textContent = groupIndex;

  const audioPath = config.audioPath; // level === "A1" ? "../audio-A1" : "../audio-A2";
  columns.style.display = currentMode === "words" ? "flex" : "none";
  sentenceGame.style.display = currentMode === "sentences" ? "block" : "none";
  legend.style.display = currentMode === "sentences" ? "block" : "none";
  document.getElementById("difficulty-switch").style.display =
    currentMode === "sentences" ? "flex" : "none";
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
      console.log("Shuffled sentences:", shuffledSentences.length);
    }
    loadSentenceGame(audioPath);
  }
}

function loadSentenceGame(audioPath) {
  console.log(
    "Loading sentence:",
    currentSentenceIndex,
    "Total sentences:",
    shuffledSentences.length
  );
  sentenceBoxes.innerHTML = "";
  wordBank.innerHTML = "";
  sentenceTranslation.textContent = "";
  sentenceCount.textContent = remainingSentences;
  sentenceRoot.style.display = "none";
  sentenceRoot.textContent = "";
  completedSentence.style.display = "none";
  completedSentence.textContent = "";
  wordBank.style.display = "flex";
  legend.style.display = "block";
  nextSentenceButton.disabled = true;
  prevSentenceButton.disabled = currentSentenceIndex === 0;
  playAudioButton.disabled = !completedSentencesStates[currentSentenceIndex];
  playAudioButton.classList.toggle(
    "active",
    !!completedSentencesStates[currentSentenceIndex]
  );
  if (shuffledSentences.length === 0) {
    sentenceGame.innerHTML =
      '<div style="color: #f4d03f; text-align: center;">هیچ جمله‌ای برای آزمون یافت نشد.</div>';
    legend.style.display = "none";
    if (timerInterval) clearInterval(timerInterval);
    return;
  }
  if (currentSentenceIndex >= shuffledSentences.length) {
    showResult();
    legend.style.display = "none";
    return;
  }
  if (completedSentencesStates[currentSentenceIndex]) {
    sentenceBoxes.innerHTML =
      completedSentencesStates[currentSentenceIndex].sentenceBoxesHTML;
    sentenceTranslation.textContent =
      completedSentencesStates[currentSentenceIndex].translation;
    completedSentence.textContent =
      completedSentencesStates[currentSentenceIndex].completedSentence;
    sentenceRoot.textContent =
      shuffledSentences[currentSentenceIndex].root || "بدون ریشه";
    completedSentence.style.display = "block";
    sentenceRoot.style.display = "block";
    wordBank.style.display = "none";
    nextSentenceButton.disabled =
      currentSentenceIndex >= shuffledSentences.length - 1;
    prevSentenceButton.disabled = currentSentenceIndex === 0;
    playAudioButton.disabled = false;
    playAudioButton.classList.add("active");
    return;
  }
  const currentSentence = shuffledSentences[currentSentenceIndex];
  sentenceTranslation.textContent = currentSentence.translate_fa;
  const words = currentSentence.Sound_de.trim().split(" ");
  let allWords = [...words];
  if (difficultyLevel === "medium" && shuffledSentences.length > 1) {
    const otherSentences = shuffledSentences.filter(
      (_, idx) => idx !== currentSentenceIndex
    );
    const randomSentence =
      otherSentences[Math.floor(Math.random() * otherSentences.length)];
    allWords = [...allWords, ...randomSentence.Sound_de.trim().split(" ")];
  } else if (difficultyLevel === "hard" && shuffledSentences.length > 2) {
    const otherSentences = shuffledSentences.filter(
      (_, idx) => idx !== currentSentenceIndex
    );
    const randomIndices = [];
    while (randomIndices.length < 2 && otherSentences.length > 0) {
      const randomIndex = Math.floor(Math.random() * otherSentences.length);
      if (!randomIndices.includes(randomIndex)) {
        randomIndices.push(randomIndex);
        allWords = [
          ...allWords,
          ...otherSentences[randomIndex].Sound_de.trim().split(" "),
        ];
      }
    }
  }
  const shuffledWords = shuffle([...allWords]);
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
  if (lockClick) return;
  lockClick = true;
  const allBoxes = sentenceBoxes.querySelectorAll(".sentence-box");
  const emptyBox = Array.from(allBoxes).find((box) => !box.textContent);
  if (!emptyBox) {
    lockClick = false;
    return;
  }
  wordItem.classList.add("selected");
  const wordRect = wordItem.getBoundingClientRect();
  const boxRect = emptyBox.getBoundingClientRect();
  const translateX = boxRect.left - wordRect.left;
  const translateY = boxRect.top - wordRect.top;

  const getWordCategory = (word, sentence, index) => {
    const cleanWord = (w) => {
      if (!w || typeof w !== "string") return "";
      return w.replace(/[.,!?;:]/g, "").toLowerCase();
    };

    const sentenceWords = cleanWord(sentence.Sound_de || "")
      .split(" ")
      .map((w) => cleanWord(w));
    const wordLower = cleanWord(word);

    const categories = [
      { key: "subject", value: sentence.subject || [] },
      { key: "verb", value: sentence.verb || [] },
      { key: "auxiliary_verb", value: sentence.auxiliary_verb || [] },
      { key: "object", value: sentence.object || [] },
      { key: "verb_part1", value: sentence.verb_part1 || [] },
      { key: "verb_part2", value: sentence.verb_part2 || [] },
    ];

    for (const { key, value } of categories) {
      if (Array.isArray(value) && value.length > 0) {
        for (const phrase of value) {
          if (phrase && typeof phrase === "string") {
            const phraseWords = phrase
              .trim()
              .split(" ")
              .map((w) => cleanWord(w));

            if (phraseWords.length > 1) {
              const startIndex = sentenceWords.indexOf(phraseWords[0]);
              if (startIndex !== -1) {
                const endIndex = startIndex + phraseWords.length - 1;
                if (index >= startIndex && index <= endIndex) {
                  const phraseWord = phraseWords[index - startIndex];
                  if (sentenceWords[index] === phraseWord) {
                    return key;
                  }
                }
              }
            } else if (value.some((v) => cleanWord(v) === wordLower)) {
              return key;
            }
          }
        }
      }
    }
    return "";
  };

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
      const category = getWordCategory(word, sentence, emptyBox.dataset.index);
      if (category) {
        emptyBox.classList.add(category);
      }
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
        loadSentenceGame(audioPath);
        lockClick = false;
      }, 1000);
      return;
    }
    scoreDisplay.textContent = score;
    const allCorrect = Array.from(allBoxes).every((box) =>
      box.classList.contains("correct")
    );
    if (allCorrect && wordBank.children.length > 0) {
      wordBank.innerHTML = "";
    }
    if (allCorrect) {
      score++;
      remainingSentences--;
      wrongAttempts = 0;
      scoreDisplay.textContent = score;
      sentenceCount.textContent = remainingSentences;
      wordBank.style.display = "none";
      completedSentence.style.display = "block";
      completedSentence.textContent = sentence.Sound_de.trim();
      sentenceRoot.style.display = "block";
      sentenceRoot.textContent = sentence.root || "بدون ریشه";
      completedSentencesStates[currentSentenceIndex] = {
        sentenceBoxesHTML: sentenceBoxes.innerHTML,
        translation: sentenceTranslation.textContent,
        completedSentence: completedSentence.textContent,
        root: sentenceRoot.textContent,
      };
      console.log(
        "Sentence completed:",
        currentSentenceIndex,
        "Next available:",
        currentSentenceIndex < shuffledSentences.length - 1
      );
      const audio = new Audio(`${audioPath}/${sentence.Filename}_de.mp3`);
      audio.addEventListener("ended", () => {
        nextSentenceButton.disabled =
          currentSentenceIndex >= shuffledSentences.length - 1;
        prevSentenceButton.disabled = currentSentenceIndex === 0;
        playAudioButton.disabled = false;
        playAudioButton.classList.add("active");
      });
      audio.play();
      if (currentSentenceIndex === shuffledSentences.length - 1) {
        showResult();
      }
    }
    lockClick = false;
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
  // const urlParams = new URLSearchParams(window.location.search);
  // const level = urlParams.get("level") || "A2";
  const audioPath = config.audioPath; //level === "A1" ? "../audio-A1" : "../audio-A2";
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
  nextSentenceButton.disabled = true;
  prevSentenceButton.disabled = true;
  playAudioButton.disabled = true;
  if (timerInterval) clearInterval(timerInterval);
}

function restartGame() {
  score = 0;
  matchedPairs = 0;
  currentSentenceIndex = 0;
  shuffledSentences = [];
  wrongAttempts = 0;
  timeLeft = 840;
  lockClick = false;
  difficultyLevel = "simple";
  document.querySelector(
    'input[name="difficulty"][value="simple"]'
  ).checked = true;
  scoreDisplay.textContent = score;
  timerDisplay.textContent = timeLeft;
  popup.style.display = "none";
  completedSentencesStates = [];
  nextSentenceButton.disabled = true;
  prevSentenceButton.disabled = true;
  playAudioButton.disabled = true;
  playAudioButton.classList.add("active");
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
  window.location.href = `../index.html?level=${level}`;
}

function nextSentence() {
  if (currentSentenceIndex < shuffledSentences.length - 1) {
    currentSentenceIndex++;
    console.log("Moving to next sentence:", currentSentenceIndex);
    // const urlParams = new URLSearchParams(window.location.search);
    // const level = urlParams.get("level") || "A2";
    const audioPath = config.audioPath; //level === "A1" ? "../audio-A1" : "../audio-A2";
    loadSentenceGame(audioPath);
  } else {
    console.log("No next sentence available");
  }
}

function prevSentence() {
  if (currentSentenceIndex > 0) {
    currentSentenceIndex--;
    // console.log("Moving to previous sentence:", currentSentenceIndex);
    // const urlParams = new URLSearchParams(window.location.search);
    // const level = urlParams.get("level") || "A2";
    const audioPath = config.audioPath; //level === "A1" ? "../audio-A1" : "../audio-A2";
    loadSentenceGame(audioPath);
  } else {
    console.log("No previous sentence available");
  }
}

function closePopup() {
  popup.style.display = "none";
}

function playAudio() {
  if (!playAudioButton.disabled) {
    // console.log("Playing audio for sentence:", currentSentenceIndex);
    // const urlParams = new URLSearchParams(window.location.search);
    // const level = urlParams.get("level") || "A2";
    const audioPath = config.audioPath; //level === "A1" ? "../audio-A1" : "../audio-A2";
    const currentSentence = shuffledSentences[currentSentenceIndex];
    const audio = new Audio(`${audioPath}/${currentSentence.Filename}_de.mp3`);
    console.log(audio);
    audio.play();
  }
}

document.querySelectorAll('input[name="mode"]').forEach((radio) => {
  radio.addEventListener("change", (e) => {
    currentMode = e.target.value;
    score = 0;
    matchedPairs = 0;
    currentSentenceIndex = 0;
    shuffledSentences = [];
    wrongAttempts = 0;
    // فقط در حالت "sentences" سطح دشواری را تنظیم کنید
    if (currentMode === "sentences") {
      difficultyLevel = "simple";
      const simpleRadio = document.querySelector(
        'input[name="difficulty"][value="simple"]'
      );
      if (simpleRadio) {
        simpleRadio.checked = true;
      }
    }
    scoreDisplay.textContent = score;
    popup.style.display = "none";
    completedSentencesStates = [];
    nextSentenceButton.disabled = true;
    prevSentenceButton.disabled = true;
    playAudioButton.disabled = true;
    playAudioButton.classList.remove("active");
    loadPageItems();
    startTimer();
  });
});

document.querySelectorAll('input[name="difficulty"]').forEach((radio) => {
  radio.addEventListener("change", (e) => {
    difficultyLevel = e.target.value;
    console.log("Difficulty changed to:", difficultyLevel);
    currentSentenceIndex = 0;
    shuffledSentences = [];
    wrongAttempts = 0;
    completedSentencesStates = [];
    score = 0;
    scoreDisplay.textContent = score;
    popup.style.display = "none";
    nextSentenceButton.disabled = true;
    prevSentenceButton.disabled = true;
    playAudioButton.disabled = true;
    playAudioButton.classList.remove("active");
    loadPageItems();
  });
});

playAudioButton.addEventListener("click", playAudio);
nextSentenceButton.addEventListener("click", nextSentence);
prevSentenceButton.addEventListener("click", prevSentence);

startTimer();
loadPageItems();
