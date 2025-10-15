const container = document.querySelector(".container");
const rootModal = document.getElementById("rootModal");
const modalRootContent = document.getElementById("modalRootContent");
const modalRootHeader = document.getElementById("modalRootHeader");
const closeButton = document.querySelector(".close-button");
const backButton = document.querySelector(".back-btn");
const header = document.querySelector(".header");
const urlParams = new URLSearchParams(window.location.search);
const level = urlParams.get("level");
const flashcardPopup = document.getElementById("flashcardPopup");
const box0 = document.getElementById("box0");
const box50 = document.getElementById("box50");
const box100 = document.getElementById("box100");
const groupBox = document.getElementById("groupBox");
const pathContainer = document.querySelector(".path-container");
const groupContainer = document.querySelector(".group-container");
const groupParentTitle = document.querySelector(".group-parent-title");
const tenseDisplay = document.getElementById("tenseDisplay");
const reviewPopup = document.getElementById("reviewPopup");
const reviewClose = document.querySelector(".review-close");
const reviewGerman = document.getElementById("reviewGerman");
const reviewPersian = document.getElementById("reviewPersian");
const reviewAudio = document.getElementById("reviewAudio");
const reviewCounter = document.getElementById("reviewCounter");
const reviewTimer = document.getElementById("reviewTimer");
const reviewProgress = document.getElementById("reviewProgress");
const reviewProgressDots = reviewProgress.querySelector(
  ".review-progress-dots"
);

const levelConfig = {
  A1_verben_II: {
    jsonFile: "../json/json-verb-II-A1.json",
    audioPath: "../audio-A1-Verben-II",
    tense: "../json/json-All-tense-verb-A1.json",
    headerText: "A1 Verben II",
    headerClass: "color-a1",
  },
  A2_verben_II: {
    jsonFile: "../json/json-verb-II-A2.json",
    audioPath: "../audio-A2-Verben-II",
    tense: "../json/json-All-tense-verb-A2.json",
    headerText: "A2 Verben II",
    headerClass: "color-a2",
  },
};

let itemsData = [];
let nodeStates = [];
let nodeViewCounts = [];
let tenseData = {};
let currentGroupParent = "";

function sanitizeString(str) {
  if (!str) return "";
  return str
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/\r/g, " ")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderTenses(tenses, groupParent) {
  let html = `<div class="tense-header">Zeiten: ${groupParent}</div><ul class="tense-list">`;
  Object.keys(tenses).forEach((time) => {
    html += `<li class="tense-item"><span class="tense-time">${time}:</span> <span class="tense-form">${tenses[time]}</span></li>`;
  });
  html += "</ul>";
  tenseDisplay.innerHTML = html;
  tenseDisplay.style.display = "block";
}

window.addEventListener("load", () => {
  if (level && levelConfig[level]) {
    const config = levelConfig[level];
    header.textContent = config.headerText;
    container.dataset.audioPath = config.audioPath;
    localStorage.setItem("selectedLevel", level);
    fetch(config.jsonFile)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load JSON file");
        return r.json();
      })
      .then((data) => {
        itemsData = data;
        nodeStates = new Array(itemsData.length).fill("0");
        nodeViewCounts = new Array(itemsData.length).fill(0);
        return fetch(config.tense);
      })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load tense JSON file");
        return r.json();
      })
      .then((tenseObj) => {
        Object.keys(tenseObj).forEach((key) => {
          const presens = tenseObj[key].Präsens;
          if (presens) {
            tenseData[presens] = tenseObj[key];
          }
        });
        header.style.display = "block";
        backButton.style.display = "block";
        renderGroups(config.headerClass);
      })
      .catch((err) => {
        container.innerHTML = `<div class="error">خطا در بارگذاری فایل JSON: ${err.message}</div>`;
        header.style.display = "none";
        backButton.style.display = "none";
      });
  } else {
    container.innerHTML = `<div class="error">سطح نامعتبر است یا وجود ندارد</div>`;
    header.style.display = "none";
    backButton.style.display = "none";
  }
});

function renderGroups(headerClass) {
  groupContainer.style.display = "block";
  pathContainer.style.display = "none";
  backButton.textContent = "Zurück zur Hauptseite";
  groupBox.innerHTML = "";
  const uniqueParents = [
    ...new Set(itemsData.map((item) => item.parent)),
  ].filter(Boolean);
  uniqueParents.forEach((parent, i) => {
    const wrapper = document.createElement("div");
    wrapper.className = "group-wrapper";
    const groupNode = document.createElement("div");
    groupNode.className = "group-node";
    groupNode.textContent = parent;
    groupNode.dataset.groupParent = parent;
    groupNode.addEventListener("click", () => showGroup(parent));
    const reviewBtn = document.createElement("div");
    reviewBtn.className = "review-btn";
    reviewBtn.textContent = "R";
    reviewBtn.dataset.groupParent = parent;
    reviewBtn.addEventListener("click", () => showReviewSlideshow(parent));
    wrapper.appendChild(groupNode);
    wrapper.appendChild(reviewBtn);
    groupBox.appendChild(wrapper);
  });
}

function showGroup(groupParent) {
  currentGroupParent = groupParent;
  const groupItems = itemsData.filter((item) => item.parent === groupParent);
  renderPath(groupItems);
  groupParentTitle.textContent = "";
  const tenses = tenseData[groupParent];
  if (tenses) {
    renderTenses(tenses, groupParent);
  } else {
    tenseDisplay.style.display = "none";
  }
  groupContainer.style.display = "none";
  pathContainer.style.display = "block";
  backButton.textContent = "Zurück zu den Gruppen";
}

function renderPath(items) {
  // Clear previous content
  box0.innerHTML = "";
  box50.innerHTML = "";
  box100.innerHTML = "";

  // Group items by state (0, 50, 100)
  const groups = {
    0: items.filter((_, localIndex) => {
      const globalIndex = itemsData.indexOf(items[localIndex]);
      return nodeStates[globalIndex] === "0";
    }),
    50: items.filter((_, localIndex) => {
      const globalIndex = itemsData.indexOf(items[localIndex]);
      return nodeStates[globalIndex] === "50";
    }),
    100: items.filter((_, localIndex) => {
      const globalIndex = itemsData.indexOf(items[localIndex]);
      return nodeStates[globalIndex] === "100";
    }),
  };

  // For each state box
  Object.keys(groups).forEach((state) => {
    const targetBox = getBoxByLevel(state);
    const stateItems = groups[state];

    if (stateItems.length === 0) return;

    // Further group by tense within the state
    const tenseMap = new Map();
    stateItems.forEach((item, localIndex) => {
      const globalIndex = itemsData.indexOf(item);
      const tense = item.tense || "Unbekannt";
      if (!tenseMap.has(tense)) {
        tenseMap.set(tense, []);
      }
      tenseMap.get(tense).push({ item, localIndex, globalIndex });
    });

    // Render each tense group
    tenseMap.forEach((tenseItems, tense) => {
      const groupTitle = document.createElement("div");
      groupTitle.className = "tense-group-title";
      groupTitle.textContent = tense;
      targetBox.appendChild(groupTitle);

      const nodesWrapper = document.createElement("div");
      nodesWrapper.className = "nodes-wrapper";

      tenseItems.forEach(({ item, localIndex, globalIndex }) => {
        const node = document.createElement("div");
        node.className = `node node-${nodeStates[globalIndex]}`;
        node.textContent = globalIndex + 1;
        node.dataset.index = globalIndex;
        const counter = document.createElement("div");
        counter.className = "node-counter";
        counter.textContent = nodeViewCounts[globalIndex];
        if (nodeViewCounts[globalIndex] > 0) {
          counter.classList.add("visible");
        }
        node.appendChild(counter);
        nodesWrapper.appendChild(node);
        node.addEventListener("click", () => showFlashcardPopup(globalIndex));
      });

      targetBox.appendChild(nodesWrapper);
    });
  });
}

function getBoxByLevel(level) {
  if (level === "50") return box50;
  if (level === "100") return box100;
  return box0;
}

function getSoundDetails(itm) {
  if (!itm) return { soundContent: "", colorClass: "", isSentence: false };
  const mainSoundDe = (itm.Sound_de || "").trim();
  const isSentence = /[.!?,]$/.test(mainSoundDe);
  let colorClass = "";
  if (!isSentence) {
    const lower = mainSoundDe.toLowerCase();
    if (lower.startsWith("die ")) colorClass = "pink-text";
    else if (lower.startsWith("der ")) colorClass = "blue-text";
    else if (lower.startsWith("das ")) colorClass = "green-text";
  }
  let soundContent = mainSoundDe;
  if (isSentence) {
    const segments = mainSoundDe.split(" ").filter(Boolean);
    let currentIndex = 0;
    soundContent = segments
      .map((word, idx) => {
        if (idx < currentIndex) return "";
        const cleanWord = word.replace(/[.,!?:؛]/g, "").toLowerCase();
        const punctuation = (word.match(/[.,!?:؛]+$/) || [""])[0];
        const checkMultiWord = (arrCandidate, i) => {
          if (!arrCandidate)
            return { match: false, length: 1, phraseWords: [] };
          for (let itm of arrCandidate) {
            if (!itm || typeof itm !== "string") continue;
            const words = itm.split(" ");
            const phrase = segments
              .slice(i, i + words.length)
              .join(" ")
              .replace(/[.,!?:؛]/g, "")
              .toLowerCase();
            if (phrase === itm.toLowerCase())
              return {
                match: true,
                length: words.length,
                phraseWords: segments.slice(i, i + words.length),
              };
          }
          return { match: false, length: 1, phraseWords: [] };
        };
        let result = checkMultiWord(itm.subject, idx);
        if (result.match) {
          const phrase = result.phraseWords
            .map(
              (w) =>
                `${w.replace(/[.,!?:؛]/g, "")}${
                  (w.match(/[.,!?:؛]+$/) || [""])[0]
                }`
            )
            .join(" ");
          currentIndex = idx + result.length;
          return `<span class="subject">${phrase}</span>`;
        }
        result = checkMultiWord(itm.object, idx);
        if (result.match) {
          const phrase = result.phraseWords
            .map(
              (w) =>
                `${w.replace(/[.,!?:؛]/g, "")}${
                  (w.match(/[.,!?:؛]+$/) || [""])[0]
                }`
            )
            .join(" ");
          currentIndex = idx + result.length;
          return `<span class="object">${phrase}</span>`;
        }
        const clean = cleanWord;
        let cls = "";
        if (itm.auxiliary_verb?.some((a) => a?.toLowerCase() === clean))
          cls = "aux-verb";
        else if (itm.subject?.some((s) => s?.toLowerCase() === clean))
          cls = "subject";
        else if (itm.verb?.some((v) => v?.toLowerCase() === clean))
          cls = "verb";
        else if (itm.verb_part1?.some((vp) => vp?.toLowerCase() === clean))
          cls = "verb_part1";
        else if (itm.verb_part2?.some((vp) => vp?.toLowerCase() === clean))
          cls = "verb_part2";
        else if (itm.object?.some((o) => o?.toLowerCase() === clean))
          cls = "object";
        currentIndex = idx + 1;
        return `<span class="${cls}">${word.replace(
          /[.,!?:؛]/g,
          ""
        )}${punctuation}</span>`;
      })
      .filter(Boolean)
      .join(" ");
  }
  return { soundContent, colorClass, isSentence };
}

function createFlashcard(item, index, audioPath) {
  const mainItem = item;
  const itemNumber = index + 1;
  const mainSoundDetails = getSoundDetails(mainItem);
  const soundContent = mainSoundDetails.soundContent;
  const colorClass = mainSoundDetails.colorClass;
  const isSentence = mainSoundDetails.isSentence;

  const flashcardDiv = document.createElement("div");
  flashcardDiv.className = "flashcard";
  flashcardDiv.dataset.index = index;
  flashcardDiv.innerHTML = `
          <div class="flashcard-inner">
            <div class="flashcard-front">
              <div class="item-top">
                <div class="filename">${itemNumber}</div>
                <div class="tense">${mainItem.tense || ""}</div>
              </div>
              <div class="translate">${mainItem.translate_fa || ""}</div>
            </div>
            <div class="flashcard-back">
              <div class="item-top">
                <div class="filename">${itemNumber}</div>
                <div class="tense">${mainItem.tense || ""}</div>
              </div>
              ${
                mainItem.root?.trim()
                  ? `
                <div class="root-icon">!</div>
                <div class="root-icon" style="display: none;" data-root-content='${JSON.stringify(
                  {
                    root: sanitizeString(mainItem.root),
                    Sound_de: sanitizeString(mainItem.Sound_de),
                  }
                )}'></div>
              `
                  : ""
              }
              <div class="sound-container">
                <div class="sound ${isSentence ? "sentence" : ""} ${
    isSentence ? "" : colorClass
  }">${soundContent}</div>
                <div class="ctrl-bottom">
                  <audio src="${audioPath}/${
    mainItem.file || ""
  }" preload="none"></audio>
                  <button class="play-btn" type="button">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M10.4 1.8C11.5532 0.262376 14 1.07799 14 3.00001V21.1214C14 23.0539 11.5313 23.8627 10.3878 22.3049L6.49356 17H4C2.34315 17 1 15.6569 1 14V10C1 8.34315 2.34315 7 4 7H6.5L10.4 1.8ZM12 3L8.1 8.2C7.72229 8.70361 7.12951 9 6.5 9H4C3.44772 9 3 9.44772 3 10V14C3 14.5523 3.44772 15 4 15H6.49356C7.13031 15 7.72901 15.3032 8.10581 15.8165L12 21.1214V3Z"/>
                      <path d="M16.2137 4.17445C16.1094 3.56451 16.5773 3 17.1961 3C17.6635 3 18.0648 3.328 18.1464 3.78824C18.4242 5.35347 19 8.96465 19 12C19 15.0353 18.4242 18.6465 18.1464 20.2118C18.0648 20.672 17.6635 21 17.1961 21C16.5773 21 16.1094 20.4355 16.2137 19.8256C16.5074 18.1073 17 14.8074 17 12C17 9.19264 16.5074 5.8927 16.2137 4.17445Z"/>
                      <path d="M21.41 5C20.7346 5 20.2402 5.69397 20.3966 6.35098C20.6758 7.52413 21 9.4379 21 12C21 14.5621 20.6758 16.4759 20.3966 17.649C20.2402 18.306 20.7346 19 21.41 19C21.7716 19 22.0974 18.7944 22.2101 18.4509C22.5034 17.5569 23 15.5233 23 12C23 8.47672 22.5034 6.44306 22.2101 5.54913C22.0974 5.20556 21.7716 5 21.41 5Z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;

  const soundDivs = flashcardDiv.querySelectorAll(".sound");
  soundDivs.forEach((soundDiv) => {
    soundDiv.addEventListener("click", (ev) => {
      ev.stopPropagation();
    });
  });

  const playButtons = flashcardDiv.querySelectorAll(".play-btn");
  playButtons.forEach((btn) => {
    btn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const audio = btn.previousElementSibling;
      audio.currentTime = 0;
      audio.play();
    });
  });

  const rootIcons = flashcardDiv.querySelectorAll(
    ".root-icon:not([style*='display: none'])"
  );

  rootIcons.forEach((icon, idx) => {
    const dataIcon = icon.nextElementSibling;
    if (dataIcon) {
      icon.addEventListener("click", (ev) => {
        ev.stopPropagation();
        try {
          const data = JSON.parse(dataIcon.dataset.rootContent || "{}");
          modalRootHeader.textContent = data.Sound_de || "";
          const rootLines = (data.root || "").split("\n");
          modalRootContent.innerHTML = rootLines
            .map((line) => {
              const isPersian = /[\u0600-\u06FF]/.test(line);
              const dir = isPersian ? "rtl" : "ltr";
              const textAlign = isPersian ? "right" : "left";
              return `<span style="display: block; direction: ${dir}; text-align: ${textAlign};">${line}</span>`;
            })
            .join("");
          rootModal.classList.add("show");
        } catch (error) {
          console.error(
            "Error parsing JSON:",
            error,
            dataIcon.dataset.rootContent
          );
          modalRootHeader.textContent = "خطا";
          modalRootContent.textContent = "داده‌های ریشه نامعتبر است.";
          rootModal.classList.add("show");
        }
      });
    }
  });

  const buttonsDiv = document.createElement("div");
  buttonsDiv.className = "selection-buttons";
  ["0", "50", "100"].forEach((lvl) => {
    const btn = document.createElement("button");
    btn.className = `selection-btn level-${lvl}`;
    btn.textContent = `${lvl}%`;
    btn.addEventListener("click", () => handleSelection(index, lvl));
    buttonsDiv.appendChild(btn);
  });
  flashcardDiv.appendChild(buttonsDiv);
  attachFlipListener(flashcardDiv);
  return flashcardDiv;
}

function showFlashcardPopup(index) {
  const audioPath = container.dataset.audioPath;
  const item = itemsData[index];
  const flashcard = createFlashcard(item, index, audioPath);
  flashcardPopup.innerHTML = "";
  flashcardPopup.appendChild(flashcard);
  flashcardPopup.style.display = "flex";
  setTimeout(() => {
    flashcardPopup.classList.add("active");
  }, 10);
}

function handleSelection(index, level) {
  nodeViewCounts[index]++;
  flashcardPopup.classList.remove("active");
  setTimeout(() => {
    flashcardPopup.style.display = "none";
    flashcardPopup.innerHTML = "";
    const node = document.querySelector(`.node[data-index="${index}"]`);
    nodeStates[index] = level;
    node.className = `node node-${level}`;
    const counter = node.querySelector(".node-counter");
    counter.textContent = nodeViewCounts[index];
    if (nodeViewCounts[index] > 0) {
      counter.classList.add("visible");
    } else {
      counter.classList.remove("visible");
    }
    // Re-render the path to update grouping
    const groupItems = itemsData.filter(
      (item) => item.parent === currentGroupParent
    );
    renderPath(groupItems);
  }, 500);

  setTimeout(() => {
    if (box0.children.length === 0 && box50.children.length === 0) {
      showCelebration();
      return;
    }
  }, 600);
}

function attachFlipListener(card) {
  card.addEventListener("click", (ev) => {
    if (ev.target.closest(".root-icon, .play-btn, .sound, .selection-btn"))
      return;
    card.classList.toggle("flipped");
  });
}

closeButton.addEventListener("click", () => rootModal.classList.remove("show"));
rootModal.addEventListener("click", (e) => {
  if (e.target === rootModal) rootModal.classList.remove("show");
});

backButton.addEventListener("click", () => {
  if (pathContainer.style.display === "block") {
    pathContainer.style.display = "none";
    tenseDisplay.style.display = "none";
    groupContainer.style.display = "block";
    backButton.textContent = "Zurück zur Hauptseite";
  } else {
    window.location.href = "../index.html";
  }
});

function showCelebration() {
  const celebrationDiv = document.createElement("div");
  celebrationDiv.className = "celebration";
  celebrationDiv.style.fontFamily =
    '"iranyekanwebregular", Arial, Helvetica, sans-serif';
  celebrationDiv.innerHTML = `
          <h2>تبریک! 🎉</h2>
          <p>همه فلش‌کارت‌ها به 100% رسیدند!</p>
        `;
  document.body.appendChild(celebrationDiv);

  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });

  setTimeout(() => {
    celebrationDiv.remove();
  }, 3000);
}

let currentReviewIndex = 0;
let reviewItems = [];
let reviewAudioPath = "";
let timerInterval;
let reviewDurations = [];

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec < 10 ? "0" : ""}${sec}`;
}

function showReviewSlideshow(groupParent) {
  reviewItems = itemsData.filter((item) => item.parent === groupParent);
  reviewAudioPath = container.dataset.audioPath;
  let totalTime = 0;
  let loadedCount = 0;
  reviewDurations = [];
  reviewItems.forEach((item, idx) => {
    const audio = new Audio(`${reviewAudioPath}/${item.file || ""}`);
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      const duration = audio.duration + 2;
      reviewDurations[idx] = duration;
      totalTime += duration;
      loadedCount++;
      if (loadedCount === reviewItems.length) {
        startReview(totalTime);
      }
    };
    audio.onerror = () => {
      const duration = 4;
      reviewDurations[idx] = duration;
      totalTime += duration;
      loadedCount++;
      if (loadedCount === reviewItems.length) {
        startReview(totalTime);
      }
    };
  });
}

function startReview(totalTime) {
  currentReviewIndex = 0;
  reviewPopup.style.display = "flex";
  setTimeout(() => {
    reviewPopup.classList.add("active");
    let remainingTime = Math.round(totalTime);
    reviewTimer.textContent = formatTime(remainingTime);
    timerInterval = setInterval(() => {
      remainingTime = Math.max(0, remainingTime - 1);
      reviewTimer.textContent = formatTime(remainingTime);
      if (remainingTime <= 0) clearInterval(timerInterval);
    }, 1000);
    initProgressBar();
    showNextReviewItem();
  }, 10);
}

function initProgressBar() {
  reviewProgressDots.innerHTML = "";
  reviewItems.forEach((_, idx) => {
    const dot = document.createElement("div");
    dot.className = "review-progress-dot";
    dot.dataset.index = idx;
    dot.addEventListener("click", () => jumpToReviewItem(idx));
    reviewProgressDots.appendChild(dot);
  });
  updateProgressBar();
}

function updateProgressBar() {
  const dots = reviewProgressDots.querySelectorAll(".review-progress-dot");
  dots.forEach((dot, idx) => {
    if (idx < currentReviewIndex) {
      dot.classList.add("active");
    } else {
      dot.classList.remove("active");
    }
  });
}

function recalculateRemainingTime() {
  let remainingTime = 0;
  for (let i = currentReviewIndex; i < reviewDurations.length; i++) {
    remainingTime += reviewDurations[i] || 4;
  }
  return Math.round(remainingTime);
}

function jumpToReviewItem(newIndex) {
  if (newIndex < 0 || newIndex >= reviewItems.length) return;
  reviewAudio.pause();
  currentReviewIndex = newIndex;
  clearInterval(timerInterval);
  let remainingTime = recalculateRemainingTime();
  reviewTimer.textContent = formatTime(remainingTime);
  timerInterval = setInterval(() => {
    remainingTime = Math.max(0, remainingTime - 1);
    reviewTimer.textContent = formatTime(remainingTime);
    if (remainingTime <= 0) clearInterval(timerInterval);
  }, 1000);
  showNextReviewItem();
}

function showNextReviewItem() {
  if (currentReviewIndex >= reviewItems.length) {
    closeReviewPopup();
    return;
  }

  const item = reviewItems[currentReviewIndex];
  const mainSoundDetails = getSoundDetails(item);
  reviewGerman.innerHTML = mainSoundDetails.soundContent;
  reviewPersian.textContent = item.translate_fa || "";

  reviewCounter.textContent = `${currentReviewIndex + 1}/${reviewItems.length}`;

  reviewAudio.src = `${reviewAudioPath}/${item.file || ""}`;
  reviewAudio.play();

  updateProgressBar();

  reviewAudio.onended = () => {
    setTimeout(() => {
      currentReviewIndex++;
      showNextReviewItem();
    }, 1000);
  };
}

function closeReviewPopup() {
  reviewPopup.classList.remove("active");
  clearInterval(timerInterval);
  setTimeout(() => {
    reviewPopup.style.display = "none";
    reviewAudio.pause();
    reviewAudio.src = "";
    currentReviewIndex = 0;
    reviewItems = [];
    reviewDurations = [];
    reviewProgressDots.innerHTML = "";
  }, 500);
}

reviewClose.addEventListener("click", closeReviewPopup);
reviewPopup.addEventListener("click", (e) => {
  if (e.target === reviewPopup) closeReviewPopup();
});
