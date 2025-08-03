// خواندن داده‌ها از localStorage
const data = JSON.parse(localStorage.getItem("testGroupData")) || [];

let score = 0;
let selectedGerman = null;
let selectedPersian = null;
let matchedPairs = 0;
let lockSelection = false;
let timeLeft = 840; // 840 seconds timer
let timerInterval = null;

const germanColumn = document.getElementById("german-column");
const persianColumn = document.getElementById("persian-column");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const popup = document.getElementById("result-popup");
const totalScoreDisplay = document.getElementById("total-score");
const earnedScoreDisplay = document.getElementById("earned-score");

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function loadPageItems() {
  // دریافت groupIndex و level از URL
  const urlParams = new URLSearchParams(window.location.search);
  const groupIndex = parseInt(urlParams.get("groupIndex")) || 0;
  const level = urlParams.get("level") || "A2"; // مقدار پیش‌فرض A2
  document.getElementById("group-index").textContent = groupIndex;

  // تنظیم مسیر فایل صوتی بر اساس سطح
  const audioPath = level === "A1" ? "audio-A1" : "audio-A2";

  germanColumn.innerHTML = "";
  persianColumn.innerHTML = "";

  // مرتب‌سازی داده‌های آلمانی بر اساس Sound_de
  const sortedGerman = [...data].sort((a, b) =>
    a.Sound_de.localeCompare(b.Sound_de)
  );
  // داده‌های پارسی همچنان به‌صورت تصادفی
  const shuffledPersian = shuffle([...data]);

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
  // دریافت level از URL
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
    if (matchedPairs === data.length) {
      clearInterval(timerInterval);
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
  totalScoreDisplay.textContent = data.length;
  earnedScoreDisplay.textContent = score;
  popup.style.display = "block";
  clearInterval(timerInterval);
}

function restartGame() {
  score = 0;
  matchedPairs = 0;
  timeLeft = 840;
  scoreDisplay.textContent = score;
  timerDisplay.textContent = timeLeft;
  popup.style.display = "none";
  loadPageItems();
  startTimer();
}

function startTimer() {
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
  const urlParams = new URLSearchParams(window.location.search);
  const groupIndex = parseInt(urlParams.get("groupIndex")) || 1;
  const level = localStorage.getItem("selectedLevel") || "A2"; // مقدار پیش‌فرض A2
  window.location.href = `index.html?level=${level}&groupIndex=${groupIndex}`;
}

// شروع تایمر و بارگذاری آیتم‌ها هنگام لود صفحه
startTimer();
loadPageItems();

function goBackToLevel() {
  const urlParams = new URLSearchParams(window.location.search);
  const groupIndex = parseInt(urlParams.get("groupIndex")) || 1;
  const level = localStorage.getItem("selectedLevel") || "A2"; // مقدار پیش‌فرض A2
  window.location.href = `index.html?level=${level}&groupIndex=${groupIndex}`;
}
