const container = document.querySelector(".content");
const rootModal = document.getElementById("rootModal");
const modalRootContent = document.getElementById("modalRootContent");
const modalRootHeader = document.getElementById("modalRootHeader");
const closeButton = document.querySelector(".close-button");
const backButton = document.querySelector(".back-btn");
const header = document.querySelector(".header");
const urlParams = new URLSearchParams(window.location.search);
const level = urlParams.get("level");
const flashcardPopup = document.getElementById("flashcardPopup");
const levelConfig = {
  A1: {
    jsonFile: "../json/json-A1.json",
    audioPath: "../audio-A1",
    headerText: "A1 WORTLISTE",
    headerClass: "color-a1",
  },
  A2: {
    jsonFile: "../json/json-A2.json",
    audioPath: "../audio-A2",
    headerText: "A2 WORTLISTE",
    headerClass: "color-a2",
  },
  "A1 VERBEN": {
    jsonFile: "../json/json-verb-A1.json",
    audioPath: "../audio-A1",
    headerText: "A1 VERBEN",
    headerClass: "color-a1",
  },
  "A2 VERBEN": {
    jsonFile: "../json/json-verb-A2.json",
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
    audioPath: "../audio-A1",
    headerText: "A1 Gruppierte Worter",
    headerClass: "color-a1",
  },
  "A2 Gruppierte Worter": {
    jsonFile: "../json/json-Gruppierte-worterA2.json",
    audioPath: "../audio-A2",
    headerText: "A2 Gruppierte Worter",
    headerClass: "color-a2",
  },
  "A1 Synonyms worter": {
    jsonFile: "../json/json-Synonyms-worterA1.json",
    audioPath: "../audio-A1",
    headerText: "A1 Synonyms worter",
    headerClass: "color-a1",
  },
  "A2 Synonyms worter": {
    jsonFile: "../json/json-Synonyms-worterA2.json",
    audioPath: "../audio-A2",
    headerText: "A2 Synonyms worter",
    headerClass: "color-a2",
  },
  "A1 Synonyms verb": {
    jsonFile: "../json/json-Synonyms-verbA1.json",
    audioPath: "../audio-A1",
    headerText: "A1 Synonyms verb",
    headerClass: "color-a1",
  },
  "A2 Synonyms verb": {
    jsonFile: "../json/json-Synonyms-verbA2.json",
    audioPath: "../audio-A2",
    headerText: "A2 Synonyms verb",
    headerClass: "color-a2",
  },
  worter_A1: {
    jsonFile: "../json/json-worter-A1.json",
    audioPath: "../audio-A1",
    headerText: "A1 WORTLISTE",
    headerClass: "color-a1",
  },
  worter_A2: {
    jsonFile: "../json/json-worter-A2.json",
    audioPath: "../audio-A2",
    headerText: "A2 WORTLISTE",
    headerClass: "color-a2",
  },
};
let itemsData = [];
let nodeStates = [];
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
        nodeStates = new Array(data.length).fill("default");
        renderPath(data, config.headerClass);
        header.style.display = "block";
        backButton.style.display = "block";
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
function generatePosition(index, total) {
  const nodeSize = 26;
  const gap = 10;
  const step = nodeSize + gap;
  const margin = 2;
  const containerWidth =
    container.offsetWidth || window.innerWidth - 2 * margin;
  const maxWidth = containerWidth - 2 * margin;
  const nodesPerRow = Math.floor(maxWidth / step);
  const centerOffset = (containerWidth - nodesPerRow * step) / 2 + margin;
  let x = centerOffset;
  let y = margin;
  let currentIndex = 0;
  let direction = 1; // 1 for left to right, -1 for right to left
  let row = 0;

  while (currentIndex < total) {
    // Horizontal row
    let rowStartX = x;
    let rowEndX =
      direction === 1
        ? rowStartX + (nodesPerRow - 1) * step
        : rowStartX - (nodesPerRow - 1) * step;
    for (let col = 0; col < nodesPerRow && currentIndex < total; col++) {
      const posX = rowStartX + col * step * direction;
      if (index === currentIndex) {
        return { x: `${posX}px`, y: `${y}px`, row: null };
      }
      currentIndex++;
    }
    // Vertical connection of 3 nodes at the end of the row
    let verticalX = rowEndX;
    let verticalY = y;
    for (let v = 0; v < 3 && currentIndex < total; v++) {
      verticalY += step;
      if (index === currentIndex) {
        return { x: `${verticalX}px`, y: `${verticalY}px`, row: row + 1 };
      }
      currentIndex++;
    }
    // Update starting X for next row to align with the third vertical node
    x = verticalX;
    y = verticalY; // Move to the position after the third vertical node
    direction = -direction; // Switch direction for next row
    row++;
  }
  // Fallback for last node
  return { x: `${centerOffset}px`, y: `${y}px`, row: null };
}
function renderPath(items, headerClass) {
  container.innerHTML = "";
  let lastRowNumber = null;
  items.forEach((item, index) => {
    const pos = generatePosition(index, items.length);
    const node = document.createElement("div");
    node.className = `node ${nodeStates[index] || ""}`;
    node.textContent = index + 1;
    node.style.left = pos.x;
    node.style.top = pos.y;
    node.dataset.index = index;
    container.appendChild(node);
    node.addEventListener("click", () => showFlashcardPopup(index, pos));

    // Add row number if this is the last of the vertical nodes
    if (
      pos.row &&
      (index === items.length - 1 ||
        generatePosition(index + 1, items.length).row !== pos.row)
    ) {
      const rowNumber = document.createElement("div");
      rowNumber.className = "row-number";
      rowNumber.textContent = pos.row;
      rowNumber.style.top = `${parseFloat(pos.y) - 50}px`; // 20px higher + additional 20px adjustment
      // Adjust left/right based on row number parity
      if (pos.row % 2 === 1) {
        rowNumber.style.right = "50px"; // Odd rows, 40px from right
        rowNumber.style.left = "auto"; // Reset left to avoid conflict
      } else {
        rowNumber.style.left = "50px"; // Even rows, 40px from left
        rowNumber.style.right = "auto"; // Reset right to avoid conflict
      }
      container.appendChild(rowNumber);
      lastRowNumber = pos.row;
    }
  });
  // Adjust container height
  const maxY = Math.max(
    ...Array.from(container.querySelectorAll(".node, .row-number")).map(
      (node) => parseFloat(node.style.top)
    )
  );
  container.style.height = `${maxY + 100}px`;
}
function createFlashcard(item, index, audioPath) {
  const mainItem = item;
  const mainSoundDe = (mainItem.Sound_de || "").trim();
  const isMainSentence = /[.!?]$/.test(mainSoundDe);
  let colorClass = "";
  if (!isMainSentence) {
    const lower = mainSoundDe.toLowerCase();
    if (lower.startsWith("die ")) colorClass = "pink-text";
    else if (lower.startsWith("der ")) colorClass = "blue-text";
    else if (lower.startsWith("das ")) colorClass = "green-text";
  }
  const itemNumber = index + 1;
  const flashcardDiv = document.createElement("div");
  flashcardDiv.className = "flashcard";
  flashcardDiv.dataset.index = index;
  flashcardDiv.innerHTML = `
          <div class="flashcard-inner">
            <div class="flashcard-front">
              <div class="item-top">
                <div class="filename">${itemNumber}</div>
               
              </div>
              <div class="translate">${mainItem.translate_fa || ""}</div>
            </div>
            <div class="flashcard-back">
              <div class="item-top">
                <div class="filename">${itemNumber}</div>
               
              </div>
              <div class="item-bottom">
                <div class="sound ${isMainSentence ? "sentence" : ""} ${
    isMainSentence ? "" : colorClass
  }"></div>
                <div class="ctrl-bottom">
                  <audio src="${audioPath}/${
    mainItem.file || ""
  }" preload="none"></audio>
                  <input type="text" class="input-text" placeholder="Enter text here">
                  <input type="range" min="0" max="0" value="0" step="1" class="reveal-slider">
                  <button class="play-btn" type="button">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M10.4 1.8C11.5532 0.262376 14 1.07799 14 3.00001V21.1214C14 23.0539 11.5313 23.8627 10.3878 22.3049L6.49356 17H4C2.34315 17 1 15.6569 1 14V10C1 8.34315 2.34315 7 4 7H6.5L10.4 1.8ZM12 3L8.1 8.2C7.72229 8.70361 7.12951 9 6.5 9H4C3.44772 9 3 9.44772 3 10V14C3 14.5523 3.44772 15 4 15H6.49356C7.13031 15 7.72901 15.3032 8.10581 15.8165L12 21.1214V3Z"/>
                      <path d="M16.2137 4.17445C16.1094 3.56451 16.5773 3 17.1961 3C17.6635 3 18.0648 3.328 18.1464 3.78824C18.4242 5.35347 19 8.96465 19 12C19 15.0353 18.4242 18.6465 18.1464 20.2118C18.0648 20.672 17.6635 21 17.1961 21C16.5773 21 16.1094 20.4355 16.2137 19.8256C16.5074 18.1073 17 14.8074 17 12C17 9.19264 16.5074 5.8927 16.2137 4.17445Z"/>
                      <path d="M21.41 5C20.7346 5 20.2402 5.69397 20.3966 6.35098C20.6758 7.52413 21 9.4379 21 12C21 14.5621 20.6758 16.4759 20.3966 17.649C20.2402 18.306 20.7346 19 21.41 19C21.7716 19 22.0974 18.7944 22.2101 18.4509C22.5034 17.5569 23 15.5233 23 12C23 8.47672 22.5034 6.44306 22.2101 5.54913C22.0974 5.20556 21.7716 5 21.41 5Z"/>
                    </svg>
                  </button>
                </div>
              </div>
              <button class="close-popup-btn">Close</button>
              <div class="learn-checkbox">
                <label>
                  <input type="checkbox"> Ich kenne dieses Wort
                </label>
              </div>
            </div>
          </div>
        `;
  const soundDiv = flashcardDiv.querySelector(".sound");
  const audioEl = flashcardDiv.querySelector("audio");
  const slider = flashcardDiv.querySelector(".reveal-slider");
  const playButton = flashcardDiv.querySelector(".play-btn");
  const inputText = flashcardDiv.querySelector(".input-text");
  const closeBtn = flashcardDiv.querySelector(".close-popup-btn");
  let segments = [];
  if (isMainSentence) {
    segments = mainSoundDe.split(" ").filter(Boolean);
    let currentIndex = 0;
    const arr = segments
      .map((word, index) => {
        if (index < currentIndex) return "";
        const cleanWord = word.replace(/[.,!?:؛]/g, "").toLowerCase();
        const punctuation = (word.match(/[.,!?:؛]+$/) || [""])[0];
        const checkMultiWord = (arrCandidate, idx) => {
          if (!arrCandidate)
            return { match: false, length: 1, phraseWords: [] };
          for (let item of arrCandidate) {
            if (!item || typeof item !== "string") continue;
            const words = item.split(" ");
            const phrase = segments
              .slice(idx, idx + words.length)
              .join(" ")
              .replace(/[.,!?:؛]/g, "")
              .toLowerCase();
            if (phrase === item.toLowerCase())
              return {
                match: true,
                length: words.length,
                phraseWords: segments.slice(idx, idx + words.length),
              };
          }
          return { match: false, length: 1, phraseWords: [] };
        };
        let result = checkMultiWord(mainItem.subject, index);
        if (result.match) {
          const phrase = result.phraseWords
            .map(
              (w) =>
                `${w.replace(/[.,!?:؛]/g, "")}${
                  (w.match(/[.,!?:؛]+$/) || [""])[0]
                }`
            )
            .join(" ");
          currentIndex = index + result.length;
          return `<span class="subject">${phrase}</span>`;
        }
        result = checkMultiWord(mainItem.object, index);
        if (result.match) {
          const phrase = result.phraseWords
            .map(
              (w) =>
                `${w.replace(/[.,!?:؛]/g, "")}${
                  (w.match(/[.,!?:؛]+$/) || [""])[0]
                }`
            )
            .join(" ");
          currentIndex = index + result.length;
          return `<span class="object">${phrase}</span>`;
        }
        const clean = cleanWord;
        let cls = "";
        if (mainItem.auxiliary_verb?.some((a) => a?.toLowerCase() === clean))
          cls = "aux-verb";
        else if (mainItem.subject?.some((s) => s?.toLowerCase() === clean))
          cls = "subject";
        else if (mainItem.verb?.some((v) => v?.toLowerCase() === clean))
          cls = "verb";
        else if (mainItem.verb_part1?.some((vp) => vp?.toLowerCase() === clean))
          cls = "verb_part1";
        else if (mainItem.verb_part2?.some((vp) => vp?.toLowerCase() === clean))
          cls = "verb_part2";
        else if (mainItem.object?.some((o) => o?.toLowerCase() === clean))
          cls = "object";
        currentIndex = index + 1;
        return `<span class="${cls}">${word.replace(
          /[.,!?:؛]/g,
          ""
        )}${punctuation}</span>`;
      })
      .filter(Boolean)
      .join(" ");
    soundDiv.innerHTML = arr;
    slider.max = segments.length || 0;
  } else {
    segments = (mainSoundDe || "").split("").filter(Boolean);
    soundDiv.innerHTML = segments.map((c) => `<span>${c}</span>`).join("");
    slider.max = segments.length || 0;
  }
  const updateSliderBg = (val, max) => {
    const percent = max ? Math.min(100, Math.round((val / max) * 100)) : 0;
    slider.style.background = `linear-gradient(to right, #00ff88 ${percent}%, #34495e ${percent}%)`;
  };
  updateSliderBg(0, slider.max);
  playButton.addEventListener("click", (ev) => {
    ev.stopPropagation();
    audioEl.currentTime = 0;
    audioEl.play();
  });
  soundDiv.addEventListener("click", (ev) => {
    ev.stopPropagation();
    const spans = soundDiv.querySelectorAll("span");
    const allRevealed = Array.from(spans).every((s) =>
      s.classList.contains("revealed")
    );
    spans.forEach((s, i) => s.classList.toggle("revealed", !allRevealed));
    slider.value = allRevealed ? 0 : segments.length;
    updateSliderBg(slider.value, slider.max);
  });
  slider.addEventListener("input", (ev) => {
    ev.stopPropagation();
    const val = Math.min(Number(slider.value), slider.max);
    slider.value = val;
    const spans = soundDiv.querySelectorAll("span");
    spans.forEach((s, i) => s.classList.toggle("revealed", i < val));
    updateSliderBg(val, slider.max);
  });
  if (mainItem.root?.trim()) {
    const rootIcon = document.createElement("div");
    rootIcon.className = "root-icon";
    rootIcon.textContent = "i";
    rootIcon.dataset.rootContent = JSON.stringify({
      root: mainItem.root,
      Sound_de: mainSoundDe,
    });
    const backSide = flashcardDiv.querySelector(".flashcard-back");
    backSide.insertBefore(rootIcon, backSide.querySelector(".item-bottom"));
    rootIcon.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const data = JSON.parse(rootIcon.dataset.rootContent || "{}");
      modalRootHeader.textContent = data.Sound_de || "";
      modalRootContent.textContent = data.root || "";
      rootModal.classList.add("show");
    });
  }
  attachFlipListener(flashcardDiv);
  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    handleClosePopup(index, {
      x: flashcardPopup.style.left,
      y: flashcardPopup.style.top,
    });
  });
  return flashcardDiv;
}
function showFlashcardPopup(index, originPos) {
  const audioPath = container.dataset.audioPath;
  const item = itemsData[index];
  const flashcard = createFlashcard(item, index, audioPath);
  flashcardPopup.style.top = originPos.y;
  flashcardPopup.style.left = originPos.x;
  flashcardPopup.style.transform = "translate(-50%, -50%) scale(0.1)";
  flashcardPopup.innerHTML = "";
  flashcardPopup.appendChild(flashcard);
  flashcardPopup.classList.add("active");
  setTimeout(() => {
    flashcardPopup.style.top = "50%";
    flashcardPopup.style.left = "50%";
    flashcardPopup.style.transform = "translate(-50%, -50%) scale(1)";
  }, 10);
}
function handleClosePopup(index, originPos) {
  const checkbox = flashcardPopup.querySelector(".learn-checkbox input");
  const isLearned = checkbox.checked;
  flashcardPopup.style.top = originPos.y;
  flashcardPopup.style.left = originPos.x;
  flashcardPopup.style.transform = "translate(-50%, -50%) scale(0.1)";
  setTimeout(() => {
    flashcardPopup.classList.remove("active");
    flashcardPopup.innerHTML = "";
    const node = document.querySelector(`.node[data-index="${index}"]`);
    if (isLearned) {
      node.classList.add("learned");
      node.classList.remove("not-learned");
      nodeStates[index] = "learned";
    } else {
      node.classList.add("not-learned");
      node.classList.remove("learned");
      nodeStates[index] = "not-learned";
    }
  }, 500);
}
function attachFlipListener(card) {
  card.addEventListener("click", (ev) => {
    if (
      ev.target.closest(
        ".root-icon, .play-btn, .reveal-slider, .sound, .input-text, .learn-checkbox, button, input"
      )
    )
      return;
    card.classList.toggle("flipped");
    const slider = card.querySelector(".reveal-slider");
    const spans = card.querySelectorAll(".sound span");
    if (slider && spans) {
      slider.value = 0;
      spans.forEach((s) => s.classList.remove("revealed"));
      const updateSliderBg = (val, max) => {
        const percent = max ? Math.min(100, Math.round((val / max) * 100)) : 0;
        slider.style.background = `linear-gradient(to right, #00ff88 ${percent}%, #34495e ${percent}%)`;
      };
      updateSliderBg(0, slider.max);
    }
  });
}
closeButton.addEventListener("click", () => rootModal.classList.remove("show"));
rootModal.addEventListener("click", (e) => {
  if (e.target === rootModal) rootModal.classList.remove("show");
});
backButton.addEventListener(
  "click",
  () => (window.location.href = "../index.html")
);
