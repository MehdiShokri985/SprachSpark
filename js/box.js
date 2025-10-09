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
const reviewPopup = document.getElementById("reviewPopup");
const reviewClose = document.querySelector(".review-close");
const reviewGerman = document.getElementById("reviewGerman");
const reviewPersian = document.getElementById("reviewPersian");
const reviewAudio = document.getElementById("reviewAudio");
const reviewCounter = document.getElementById("reviewCounter");
const reviewTimer = document.getElementById("reviewTimer");
const reviewProgress = document.getElementById("reviewProgress");
// const reviewProgressLine = reviewProgress.querySelector(".review-progress-line");
const reviewProgressDots = reviewProgress.querySelector(
  ".review-progress-dots"
);
const levelConfig = {
  A1: {
    jsonFile: "../json/json-A1.json",
    jsonParentFile: "../json/json-A1.json",
    audioPath: "../audio-A1",
    headerText: "A1 WORTLISTE",
    headerClass: "color-a1",
  },
  A2: {
    jsonFile: "../json/json-A2.json",
    jsonParentFile: "../json/json-A2.json",
    audioPath: "../audio-A2",
    headerText: "A2 WORTLISTE",
    headerClass: "color-a2",
  },
  "A1 VERBEN": {
    jsonFile: "../json/json-verb-A1.json",
    jsonParentFile: "../json/json-A1.json",
    audioPath: "../audio-A1",
    headerText: "A1 VERBEN",
    headerClass: "color-a1",
  },
  "A2 VERBEN": {
    jsonFile: "../json/json-verb-A2.json",
    jsonParentFile: "../json/json-A2.json",
    audioPath: "../audio-A2",
    headerText: "A2 VERBEN",
    headerClass: "color-a2",
  },
  "A1 Kollokationen": {
    jsonFile: "../json/json-A1-Kollokationen.json",
    audioPath: "../audio-A1-Kollokationen",
    headerText: "A1 Kollokationen",
    headerClass: "color-a1",
  },
  "A2 Kollokationen": {
    jsonFile: "../json/json-A2-Kollokationen.json",
    audioPath: "../audio-A2-Kollokationen",
    headerText: "A2 Kollokationen",
    headerClass: "color-a2",
  },
  "A1 Gruppierte Worter": {
    jsonFile: "../json/json-Gruppierte-worterA1.json",
    jsonParentFile: "../json/json-A1.json",
    audioPath: "../audio-A1",
    headerText: "A1 Gruppierte Worter",
    headerClass: "color-a1",
  },
  "A2 Gruppierte Worter": {
    jsonFile: "../json/json-Gruppierte-worterA2.json",
    jsonParentFile: "../json/json-A2.json",
    audioPath: "../audio-A2",
    headerText: "A2 Gruppierte Worter",
    headerClass: "color-a2",
  },
  "A1 Synonyms worter": {
    jsonFile: "../json/json-Synonyms-worterA1.json",
    jsonParentFile: "../json/json-A1.json",
    audioPath: "../audio-A1",
    headerText: "A1 Synonyms worter",
    headerClass: "color-a1",
  },
  "A2 Synonyms worter": {
    jsonFile: "../json/json-Synonyms-worterA2.json",
    jsonParentFile: "../json/json-A2.json",
    audioPath: "../audio-A2",
    headerText: "A2 Synonyms worter",
    headerClass: "color-a2",
  },
  "A1 Synonyms verb": {
    jsonFile: "../json/json-Synonyms-verbA1.json",
    jsonParentFile: "../json/json-A1.json",
    audioPath: "../audio-A1",
    headerText: "A1 Synonyms verb",
    headerClass: "color-a1",
  },
  "A2 Synonyms verb": {
    jsonFile: "../json/json-Synonyms-verbA2.json",
    jsonParentFile: "../json/json-A2.json",
    audioPath: "../audio-A2",
    headerText: "A2 Synonyms verb",
    headerClass: "color-a2",
  },
  worter_A1: {
    jsonFile: "../json/json-worter-A1.json",
    jsonParentFile: "../json/json-A1.json",
    audioPath: "../audio-A1",
    headerText: "A1 WORTLISTE",
    headerClass: "color-a1",
  },
  worter_A2: {
    jsonFile: "../json/json-worter-A2.json",
    jsonParentFile: "../json/json-A2.json",
    audioPath: "../audio-A2",
    headerText: "A2 WORTLISTE",
    headerClass: "color-a2",
  },
};
let itemsData = [];
let parentData = [];
let nodeStates = [];
let nodeViewCounts = [];
let currentGroupStart = -1;
const groupSize = 50;

function sanitizeString(str) {
  if (!str) return "";
  // جایگزینی نقل‌قول‌های تکی و دوتایی و کاراکترهای خاص
  return (
    str
      .replace(/"/g, "&quot;") // جایگزینی نقل‌قول دوتایی
      .replace(/'/g, "&apos;") // جایگزینی نقل‌قول تکی
      // .replace(/\n/g, " ") // جایگزینی خط جدید
      .replace(/\r/g, " ") // جایگزینی بازگشت به خط
      .replace(/</g, "&lt;") // جایگزینی < برای جلوگیری از مشکلات HTML
      .replace(/>/g, "&gt;")
  ); // جایگزینی > برای جلوگیری از مشکلات HTML
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
        // console.log(config.jsonParentFile);
        return fetch(config.jsonParentFile);
      })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load parent JSON file");
        return r.json();
      })
      .then((pdata) => {
        parentData = pdata;
        nodeStates = new Array(itemsData.length).fill("0");
        nodeViewCounts = new Array(itemsData.length).fill(0);
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
  const numGroups = Math.ceil(itemsData.length / groupSize);
  for (let i = 0; i < numGroups; i++) {
    const wrapper = document.createElement("div");
    wrapper.className = "group-wrapper";
    const groupNode = document.createElement("div");
    groupNode.className = "group-node";
    const start = i * groupSize + 1;
    const end = Math.min((i + 1) * groupSize, itemsData.length);
    groupNode.textContent = `${start}-${end}`;
    groupNode.dataset.groupIndex = i;
    groupNode.addEventListener("click", () => showGroup(i));
    const reviewBtn = document.createElement("div");
    reviewBtn.className = "review-btn";
    reviewBtn.textContent = "R";
    reviewBtn.dataset.groupIndex = i;
    reviewBtn.addEventListener("click", () => showReviewSlideshow(i));
    wrapper.appendChild(groupNode);
    wrapper.appendChild(reviewBtn);
    groupBox.appendChild(wrapper);
  }
}
function showGroup(groupIndex) {
  currentGroupStart = groupIndex * groupSize;
  const groupItems = itemsData.slice(
    currentGroupStart,
    currentGroupStart + groupSize
  );
  renderPath(groupItems, currentGroupStart);
  groupContainer.style.display = "none";
  pathContainer.style.display = "block";
  backButton.textContent = "Zurück zu den Gruppen";
}
function renderPath(items, startIndex) {
  box0.innerHTML = "";
  box50.innerHTML = "";
  box100.innerHTML = "";
  items.forEach((item, localIndex) => {
    const globalIndex = startIndex + localIndex;
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
    const targetBox = getBoxByLevel(nodeStates[globalIndex]);
    targetBox.appendChild(node);
    node.addEventListener("click", () => showFlashcardPopup(globalIndex));
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
  const isMainSentence = mainSoundDetails.isSentence;

  let sentenceItem = null;
  if (mainItem.Filename) {
    const filenameNum = parseInt(mainItem.Filename);

    if (!isNaN(filenameNum)) {
      const sentenceNum = filenameNum + 1;
      const sentenceIndex = sentenceNum - 1;
      if (sentenceIndex >= 0 && sentenceIndex < parentData.length) {
        // const potentialSentence = parentData[sentenceIndex];
        const potentialSentence = parentData.filter(
          (sentences) => sentences.Filename == sentenceIndex + 1
        )[0];
        //  console.log(potentialSentence)
        const soundDe = potentialSentence.Sound_de || "";
        if (/[.!?,]$/.test(soundDe)) {
          sentenceItem = potentialSentence;
        }
      }
      //  console.log(parentData);
      //  console.log(filenameNum,sentenceIndex)
    }
  }

  const sentenceSoundDetails = getSoundDetails(sentenceItem);
  const sentenceSoundContent = sentenceSoundDetails.soundContent;
  const sentenceColorClass = sentenceSoundDetails.colorClass;
  const isSentenceSentence = sentenceSoundDetails.isSentence;

  const flashcardDiv = document.createElement("div");
  flashcardDiv.className = "flashcard";
  flashcardDiv.dataset.index = index;
  const withSentenceClass = sentenceItem ? "with-sentence" : "";
  flashcardDiv.innerHTML = `
          <div class="flashcard-inner">
            <div class="flashcard-front ${withSentenceClass}">
              <div class="item-top">
                <div class="filename">${itemNumber}</div>
              </div>
              <div class="translate">${mainItem.translate_fa || ""}</div>
              ${
                sentenceItem
                  ? `
                <div class="translate sentence-translate">${
                  sentenceItem.translate_fa || ""
                }</div>
              `
                  : ""
              }
            </div>
            <div class="flashcard-back ${withSentenceClass}">
              <div class="item-top">
                <div class="filename">${itemNumber}</div>
              </div>
              ${
                mainItem.root?.trim()
                  ? `
                <div class="root-icon word-root-icon">!</div>
                <div class="root-icon word-root-icon" style="display: none;" data-root-content='${JSON.stringify(
                  {
                    root: sanitizeString(mainItem.root),
                    Sound_de: sanitizeString(mainItem.Sound_de),
                  }
                )}'></div>
              `
                  : ""
              }
              <div class="sound-container">
                <div class="sound ${isMainSentence ? "sentence" : ""} ${
    isMainSentence ? "" : colorClass
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
              ${
                sentenceItem
                  ? `
                ${
                  sentenceItem.root?.trim()
                    ? `
                  <div class="root-icon sentence-root-icon">!</div>
                  <div class="root-icon sentence-root-icon" style="display: none;" data-root-content='${JSON.stringify(
                    {
                      root: sanitizeString(sentenceItem.root),
                      Sound_de: sanitizeString(sentenceItem.Sound_de),
                    }
                  )}'></div>
                `
                    : ""
                }
                <div class="sound-container sentence-container">
                  <div class="sound ${isSentenceSentence ? "sentence" : ""} ${
                      isSentenceSentence ? "" : sentenceColorClass
                    }">${sentenceSoundContent}</div>
                  <div class="ctrl-bottom">
                    <audio src="${audioPath}/${
                      sentenceItem.file || ""
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
              `
                  : ""
              }
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
    // console.log(dataIcon);
    if (dataIcon) {
      icon.addEventListener("click", (ev) => {
        ev.stopPropagation();

        try {
          // console.log("data-root-content:", dataIcon.dataset.rootContent); // برای اشکال‌زدایی
          const data = JSON.parse(dataIcon.dataset.rootContent || "{}");
          modalRootHeader.textContent = data.Sound_de || "";
          modalRootContent.textContent = data.root || "";
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
    const oldBox = node.parentElement;
    const newBox = getBoxByLevel(level);
    if (oldBox !== newBox) {
      const rect = node.getBoundingClientRect();
      node.style.position = "fixed";
      node.style.left = `${rect.left}px`;
      node.style.top = `${rect.top}px`;
      node.style.zIndex = "1000";
      node.style.transition =
        "left 0.5s ease, top 0.5s ease, opacity 0.5s ease";
      document.body.appendChild(node);
      const tempNode = document.createElement("div");
      tempNode.style.visibility = "hidden";
      tempNode.style.width = "36px";
      tempNode.style.height = "36px";
      newBox.appendChild(tempNode);
      const targetRect = tempNode.getBoundingClientRect();
      setTimeout(() => {
        node.style.left = `${targetRect.left}px`;
        node.style.top = `${targetRect.top}px`;
        node.style.opacity = "0.5";
      }, 10);
      setTimeout(() => {
        newBox.appendChild(node);
        newBox.removeChild(tempNode);
        node.style.position = "relative";
        node.style.left = "";
        node.style.top = "";
        node.style.opacity = "1";
        node.style.transition = "";
        node.style.zIndex = "";
      }, 600);
    } else {
      newBox.appendChild(node);
    }
  }, 500);

  // بررسی خالی بودن box0 و box50
  setTimeout(() => {
    if (box0.children.length === 0 && box50.children.length === 0) {
      showCelebration();
      return;
    }
  }, 600); // بعد از اتمام انیمیشن جابجایی

  // بررسی اینکه آیا تمام نودهای گروه فعلی در وضعیت 100 هستند
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
let reviewDurations = []; // To store durations for accurate time recalculation

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec < 10 ? "0" : ""}${sec}`;
}

function showReviewSlideshow(groupIndex) {
  const start = groupIndex * groupSize;
  reviewItems = itemsData.slice(start, start + groupSize);
  reviewAudioPath = container.dataset.audioPath;
  let totalTime = 0;
  let loadedCount = 0;
  reviewDurations = [];
  reviewItems.forEach((item, idx) => {
    const audio = new Audio(`${reviewAudioPath}/${item.file || ""}`);
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      const duration = audio.duration + 2; // Add 2s pause
      reviewDurations[idx] = duration;
      totalTime += duration;
      loadedCount++;
      if (loadedCount === reviewItems.length) {
        startReview(totalTime);
      }
    };
    audio.onerror = () => {
      const duration = 4; // Default 2s audio + 2s pause
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
  reviewProgressDots.innerHTML = ""; // Clear previous dots
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
  const progressPercentage = (currentReviewIndex / reviewItems.length) * 100;
  // reviewProgressLine.style.width = `${progressPercentage}%`;

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
    remainingTime += reviewDurations[i] || 4; // Default if not loaded
  }
  return Math.round(remainingTime);
}

function jumpToReviewItem(newIndex) {
  if (newIndex < 0 || newIndex >= reviewItems.length) return;
  reviewAudio.pause(); // Pause current audio
  currentReviewIndex = newIndex;
  clearInterval(timerInterval); // Stop current timer
  let remainingTime = recalculateRemainingTime(); // Use let instead of const
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
    }, 1000); // مکث 2 ثانیه بعد از پایان صدا
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
    // reviewProgressLine.style.width = "0%";
  }, 500);
}

reviewClose.addEventListener("click", closeReviewPopup);
reviewPopup.addEventListener("click", (e) => {
  if (e.target === reviewPopup) closeReviewPopup();
});
