// متغیرهای قبلی بدون تغییر
let data = [];
let datalenght = 0;
let currentIndex = 0;
let hearts = 3;
let correctStreak = 0;
let bridgePieces = 0;
let totalCorrectAnswers = 0;
let pieceCounter = 1;
let pillars = [{ x: 50, pieces: 0, filenames: [], questions: [], number: 1 }];
let currentPillar = 0;
let wrongCount = 0;
let clickLocked = false;
const pillarColors = ["#ff4500", "#32cd32", "#1e90ff", "#ff69b4", "#ffd700"];
const testData = [
  {
    translate_fa: "سلام",
    Sound_de: "Hallo",
    Filename: "hallo_640.mp3",
    type: "کلمه",
  },
  {
    translate_fa: "خداحافظ",
    Sound_de: "Tschüss",
    Filename: "tschuss_641.mp3",
    type: "کلمه",
  },
  {
    translate_fa: "من خوبم",
    Sound_de: "Ich bin gut.",
    Filename: "ich_bin_gut_642.mp3",
    type: "جمله",
  },
];

// توابع دیگر بدون تغییر باقی می‌مانند
// فقط تابع correctAnswer تغییر می‌کند
function correctAnswer(item) {
  bridgePieces++;
  totalCorrectAnswers++;
  correctStreak++;
  item.pieceNumber = pieceCounter++;
  if (pillars[pillars.length - 1].pieces === 10) {
    addPillar();
  }
  pillars[currentPillar].filenames.push(item.Filename);
  pillars[currentPillar].questions.push(item);
  pillars[currentPillar].pieces++;
  renderBridge(true);
  renderRemainingQuestions();

  // تایمر پشتیبان برای رفتن به سوال بعدی
  const fallbackTimer = setTimeout(() => {
    clickLocked = false;
    startQuestion();
  }, 5000); // ۵ ثانیه تایمر پشتیبان

  // پخش فایل صوتی
  playSound(item);
  const audio = document.getElementById("sound");
  audio.onended = () => {
    clearTimeout(fallbackTimer); // لغو تایمر اگر صوت به پایان رسید
    clickLocked = false;
    startQuestion();
  };
  audio.onerror = () => {
    clearTimeout(fallbackTimer); // لغو تایمر در صورت خطای صوت
    clickLocked = false;
    startQuestion();
  };

  if (correctStreak >= 3) {
    hearts = hearts + 1;
    correctStreak = 0;
    updateHearts();
  }
  currentIndex++;
}

// بقیه توابع بدون تغییر
function createPillarElement(pillar) {
  const div = document.createElement("div");
  div.className = "bridge-pillar";
  div.style.left = `${pillar.x - 4}px`;
  const numberDiv = document.createElement("div");
  numberDiv.className = "pillar-number";
  numberDiv.textContent = pillar.number;
  numberDiv.style.color =
    pillarColors[(pillar.number - 1) % pillarColors.length];
  div.appendChild(numberDiv);
  return div;
}

function renderBridge(
  isNewPiece = false,
  isFalling = false,
  fallingPiece = null
) {
  const bridgeContainer = document.getElementById("bridgeContainer");
  const gameContainer = document.getElementById("gameContainer");
  bridgeContainer.innerHTML = "";
  const pieceSize =
    parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--bridge-piece-size"
      )
    ) || 28;
  let maxWidth = 0;
  pillars.forEach((pillar, pIndex) => {
    const pillarDiv = createPillarElement(pillar);
    const pillarWidth =
      parseInt(
        getComputedStyle(pillarDiv).getPropertyValue("--pillar-width")
      ) || 30;
    bridgeContainer.appendChild(pillarDiv);
    const pieceCount =
      isFalling && pIndex === currentPillar ? pillar.pieces - 1 : pillar.pieces;
    for (let i = 0; i < pieceCount; i++) {
      const piece = document.createElement("div");
      piece.className = "bridge-piece";
      const leftPos = pillar.x + pillarWidth + i * (pieceSize + 6);
      piece.style.left = `${leftPos}px`;
      piece.style.bottom = `calc(var(--bottom-gap) + 8px)`;
      piece.textContent = `${pillar.questions[i].pieceNumber}`;
      piece.title = pillar.filenames[i] || "";
      if (isNewPiece && pIndex === currentPillar && i === pillar.pieces - 1) {
        piece.classList.add("added");
      }
      bridgeContainer.appendChild(piece);
      maxWidth = Math.max(maxWidth, leftPos + pieceSize + 40);
    }
    if (isFalling && pIndex === currentPillar && fallingPiece) {
      const piece = document.createElement("div");
      piece.className = "bridge-piece falling";
      const leftPos =
        pillar.x + pillarWidth + (pillar.pieces - 1) * (pieceSize + 6);
      piece.style.left = `${leftPos}px`;
      piece.style.bottom = `calc(var(--bottom-gap) + 8px)`;
      piece.textContent = `${fallingPiece.pieceNumber}`;
      piece.title = fallingPiece.Filename || "";
      bridgeContainer.appendChild(piece);
      maxWidth = Math.max(maxWidth, leftPos + pieceSize + 40);
    }
  });
  bridgeContainer.style.width = `${maxWidth}px`;
  const containerWidth = gameContainer.clientWidth;
  if (maxWidth > containerWidth) {
    gameContainer.style.overflowX = "auto";
  } else {
    gameContainer.style.overflowX = "hidden";
  }
  setTimeout(() => scrollToPillar(), 60);
}
function addPillar() {
  const prevIndex = pillars.length - 1;
  const pieceSize =
    parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--bridge-piece-size"
      )
    ) || 28;
  const prevPillarDiv = createPillarElement(pillars[prevIndex]);
  const pillarWidth =
    parseInt(
      getComputedStyle(prevPillarDiv).getPropertyValue("--pillar-width")
    ) || 30;
  const prevX =
    pillars[prevIndex].x +
    pillarWidth +
    pillars[prevIndex].pieces * (pieceSize + 6);
  pillars.push({
    x: prevX,
    pieces: 0,
    filenames: [],
    questions: [],
    number: pillars.length + 1,
  });
  currentPillar = pillars.length - 1;
  renderBridge();
}
function scrollToPillar() {
  const gameContainer = document.getElementById("gameContainer");
  const pieceSize =
    parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--bridge-piece-size"
      )
    ) || 28;
  const targetPillar = pillars[currentPillar];
  const pillarDiv = createPillarElement(targetPillar);
  const pillarWidth =
    parseInt(getComputedStyle(pillarDiv).getPropertyValue("--pillar-width")) ||
    30;
  if (pillars.length === 0) {
    gameContainer.scrollTo({ left: 0, behavior: "smooth" });
    return;
  }
  const targetX =
    targetPillar.x + pillarWidth + targetPillar.pieces * (pieceSize + 6);
  gameContainer.scrollTo({ left: targetX - 80, behavior: "smooth" });
}
function updateHearts() {
  const heartsEl = document.getElementById("hearts");
  heartsEl.innerHTML = `<span id="heartIcon">❤️</span><span id="heartsCount">${hearts}</span>`;
}

function renderRemainingQuestions() {
  const remaining = datalenght - bridgePieces;
  console.log(datalenght, "-", bridgePieces);
  const remainingEl = document.getElementById("remainingQuestions");
  remainingEl.textContent = `${remaining}`;
}

function playSound(item) {
  if (!item || !item.file) return;
  const audio = document.getElementById("sound");
  audio.pause();
  audio.src = `${audioPath}/${item.file}`;
  audio.currentTime = 0;
  audio.play().catch((e) => console.warn("Sound play failed:", e));
}
function showEndMessage(text) {
  let em = document.getElementById("endMessage");
  if (!em) {
    em = document.createElement("div");
    em.id = "endMessage";
    document.getElementById("gameContainer").appendChild(em);
  }
  em.innerHTML = `<div>${text}</div><div style="margin-top:10px"><button onclick="location.reload()">بازی دوباره</button></div>`;
  em.style.display = "block";
}
function startQuestion() {
  if (clickLocked) {
    return;
  }
  if (currentIndex >= data.length) {
    showEndMessage("آفرین! همه سوالات تمام شد.");
    return;
  }
  const item = data[currentIndex];
  const qEl = document.getElementById("question");
  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";
  qEl.textContent = item.translate_fa || "—";
  const textDe = (item.Sound_de || "").toString().trim();
  const isSentence =
    /[\.\!\?؟]$/.test(textDe) ||
    (item.type && item.type.toString().includes("جمله"));
  if (isSentence) {
    const puzzle = document.createElement("div");
    puzzle.id = "puzzle";
    const wordBank = document.createElement("div");
    wordBank.id = "wordBank";
    const wordLine = document.createElement("div");
    wordLine.id = "wordLine";
    puzzle.appendChild(wordLine);
    puzzle.appendChild(wordBank);
    optionsDiv.appendChild(puzzle);
    const words = textDe.split(/\s+/).filter(Boolean);
    const shuffled = shuffleArray([...words]);
    function createDraggableWord(word) {
      const w = document.createElement("div");
      w.className = "draggableWord";
      w.textContent = word;
      w.setAttribute("draggable", "true");
      w.addEventListener("dragstart", (e) => {
        if (clickLocked) return;
        e.dataTransfer.setData("text/plain", word);
        e.dataTransfer.effectAllowed = "move";
        w.classList.add("dragging");
        draggedEl = w;
      });
      w.addEventListener("dragend", () => {
        w.classList.remove("dragging");
        draggedEl = null;
      });
      w.addEventListener("click", () => {
        if (clickLocked) return;
        if (w.parentElement === wordBank) {
          if (wordLine.children.length < words.length) {
            wordLine.appendChild(w);
            checkSentenceOrder(words);
          }
        } else {
          wordBank.appendChild(w);
        }
      });
      return w;
    }
    shuffled.forEach((w) => {
      const el = createDraggableWord(w);
      wordBank.appendChild(el);
    });
    let draggedEl = null;
    wordLine.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
    wordLine.addEventListener("drop", (e) => {
      e.preventDefault();
      if (clickLocked || !draggedEl) return;
      const afterElement = getDragAfterElement(wordLine, e.clientX);
      if (afterElement == null) {
        wordLine.appendChild(draggedEl);
      } else {
        wordLine.insertBefore(draggedEl, afterElement);
      }
      checkSentenceOrder(words);
    });
    wordBank.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
    wordBank.addEventListener("drop", (e) => {
      e.preventDefault();
      if (clickLocked || !draggedEl) return;
      wordBank.appendChild(draggedEl);
      checkSentenceOrder(words);
    });
    function getDragAfterElement(container, x) {
      const draggableElements = [
        ...container.querySelectorAll(".draggableWord:not(.dragging)"),
      ];
      return (
        draggableElements.reduce(
          (closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = x - box.left - box.width / 2;
            if (offset < 0 && offset > (closest.offset || -Infinity)) {
              return { offset: offset, element: child };
            } else {
              return closest;
            }
          },
          { offset: -Infinity }
        ).element || null
      );
    }
    function checkSentenceOrder(correctWords) {
      if (clickLocked) return;
      clickLocked = true;
      const userWords = Array.from(wordLine.children).map((n) =>
        n.textContent.trim()
      );
      let isCorrect = true;
      for (let i = 0; i < userWords.length; i++) {
        if (userWords[i] !== correctWords[i]) {
          isCorrect = false;
          break;
        }
      }
      if (!isCorrect) {
        wrongAnswer();
      } else if (userWords.length === correctWords.length) {
        correctAnswer(item);
      } else {
        clickLocked = false;
      }
    }
  } else {
    const correct = item;
    const options = [correct];
    const pool = data.filter((d) => {
      const s = (d.Sound_de || "").toString().trim();
      if (!s || /\s/.test(s) || /[\.\!\?؟]$/.test(s)) return false;
      return s !== (correct.Sound_de || "").toString().trim();
    });
    shuffleArray(pool);
    while (options.length < 4 && pool.length > 0) options.push(pool.pop());
    if (options.length < 4) {
      const fallback = data.filter((d) => !options.includes(d));
      shuffleArray(fallback);
      while (options.length < 4 && fallback.length > 0)
        options.push(fallback.pop());
    }
    shuffleArray(options).forEach((optItem) => {
      const opt = document.createElement("div");
      opt.className = "option";
      opt.textContent = optItem.Sound_de || "";
      opt.onclick = () => {
        if (clickLocked) {
          return;
        }
        clickLocked = true;
        opt.disabled = true;
        checkAnswer(optItem, correct);
      };
      optionsDiv.appendChild(opt);
    });
  }
}
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function checkAnswer(selected, correct) {
  if ((selected.Sound_de || "") === (correct.Sound_de || "")) {
    correctAnswer(correct);
  } else {
    wrongAnswer();
  }
}

function wrongAnswer() {
  wrongCount++;
  hearts = Math.max(0, hearts - 1);
  updateHearts();
  if (hearts <= 0) {
    showEndMessage("بازی تمام شد! ❤️");
    clickLocked = false;
    return;
  }
  if (bridgePieces > 0) {
    let targetPillar = currentPillar;
    while (targetPillar >= 0 && pillars[targetPillar].pieces === 0) {
      targetPillar--;
    }
    if (targetPillar >= 0 && pillars[targetPillar].pieces > 0) {
      currentPillar = targetPillar;
      const lastPieceIndex = pillars[currentPillar].pieces - 1;
      const removedQuestion = pillars[currentPillar].questions[lastPieceIndex];
      renderBridge(false, true, removedQuestion);
      setTimeout(() => {
        pillars[currentPillar].filenames.pop();
        pillars[currentPillar].questions.pop();
        pillars[currentPillar].pieces--;
        bridgePieces--;
        pieceCounter--;
        console.log(bridgePieces);
        console.log(pieceCounter);
        if (pillars[currentPillar].pieces === 0) {
          pillars.splice(currentPillar, 1);
          pillars.forEach((pillar, index) => {
            pillar.number = index + 1;
          });
          currentPillar =
            pillars.length > 0 ? Math.max(0, currentPillar - 1) : -1;
        }
        if (pillars.length === 0) {
          pillars.push({
            x: 50,
            pieces: 0,
            filenames: [],
            questions: [],
            number: 1,
          });
          currentPillar = 0;
        }
        if (removedQuestion) {
          delete removedQuestion.pieceNumber;
          data.splice(currentIndex, 0, removedQuestion);
        }
        renderBridge(false, false);
        renderRemainingQuestions();
        clickLocked = false;
        startQuestion();
      }, 600);
    }
  } else {
    setTimeout(() => {
      clickLocked = false;
      startQuestion();
    }, 600);
  }
}

const levelConfig = {
  A1_game: {
    jsonFile: "json-worterA1.json",
    audioPath: "audio-A1",
    headerText: "A1 WORTLISTE",
    headerClass: "color-a1",
  },
  A2_game: {
    jsonFile: "json-worterA2.json",
    audioPath: "audio-A2",
    headerText: "A2 WORTLISTE",
    headerClass: "color-a2",
  },
  A1_VERBEN_game: {
    jsonFile: "json-verb-A1.json",
    audioPath: "audio-A1",
    headerText: "A1 VERBEN",
    headerClass: "color-a1",
  },
  A2_VERBEN_game: {
    jsonFile: "json-verb-A2.json",
    audioPath: "audio-A2",
    headerText: "A2 VERBEN",
    headerClass: "color-a2",
  },
  A1_Kollokationen_game: {
    jsonFile: "json-A1-Kollokationen.json",
    audioPath: "audio-A1-Kollokationen",
    headerText: "A1 Kollokationen",
    headerClass: "color-a1",
  },
  A2_Kollokationen_game: {
    jsonFile: "json-A2-Kollokationen.json",
    audioPath: "audio-A2-Kollokationen",
    headerText: "A2 Kollokationen",
    headerClass: "color-a2",
  },
};

let config = null;
let audioPath = null;

async function loadData() {
  const urlParams = new URLSearchParams(window.location.search);
  const level = urlParams.get("level");

  if (level && levelConfig[level]) {
    config = levelConfig[level];
    audioPath = config.audioPath;
    localStorage.setItem("selectedLevel", level);

    try {
      const res = await fetch(config.jsonFile);
      if (!res.ok) throw new Error("شبکه مشکل دارد");
      data = await res.json();
      datalenght = data.length;
      if (!Array.isArray(data) || data.length === 0)
        throw new Error("فرمت یا محتوای json درست نیست");
    } catch (e) {
      console.warn(
        "خطا در بارگذاری JSON:",
        e.message,
        "— استفاده از دادهٔ تستی"
      );
      data = testData;
    }
    data = data.map((d) => ({
      ...d,
      Sound_de: (d.Sound_de || d.Sound || d.sound || "").toString(),
      translate_fa: d.translate_fa || d.translate || d.t || "",
      Filename: d.Filename || d.file || d.File || d.filename || "",
    }));

    data = shuffleArray(data);
    initBridge();
    renderRemainingQuestions();
    startQuestion();
    updateHearts();
  }
}

function initBridge() {
  const bc = document.getElementById("bridgeContainer");
  bc.innerHTML = "";
  if (!pillars || pillars.length === 0)
    pillars = [{ x: 50, pieces: 0, filenames: [], questions: [], number: 1 }];
  renderBridge(false);
}
document.addEventListener("keydown", (e) => {
  if (clickLocked) {
    return;
  }
  if (e.key === "ArrowRight") {
    clickLocked = true;
    if (data[currentIndex]) correctAnswer(data[currentIndex]);
  } else if (e.key === "ArrowLeft") {
    clickLocked = true;
    wrongAnswer();
  }
});
loadData();
