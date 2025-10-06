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
const box0 = document.getElementById("box0");
const box50 = document.getElementById("box50");
const box100 = document.getElementById("box100");
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
let nodeViewCounts = [];
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
        nodeStates = new Array(data.length).fill("0");
        nodeViewCounts = new Array(data.length).fill(0);
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
function renderPath(items, headerClass) {
  box0.innerHTML = "";
  box50.innerHTML = "";
  box100.innerHTML = "";
  items.forEach((item, index) => {
    const node = document.createElement("div");
    node.className = `node node-${nodeStates[index]}`;
    node.textContent = index + 1;
    node.dataset.index = index;
    const counter = document.createElement("div");
    counter.className = "node-counter";
    counter.textContent = nodeViewCounts[index];
    if (nodeViewCounts[index] > 0) {
      counter.classList.add("visible");
    }
    node.appendChild(counter);
    const targetBox = getBoxByLevel(nodeStates[index]);
    targetBox.appendChild(node);
    node.addEventListener("click", () => showFlashcardPopup(index));
  });
}
function getBoxByLevel(level) {
  if (level === "50") return box50;
  if (level === "100") return box100;
  return box0;
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
  let soundContent = mainSoundDe;
  if (isMainSentence) {
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
        let result = checkMultiWord(mainItem.subject, idx);
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
        result = checkMultiWord(mainItem.object, idx);
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
        currentIndex = idx + 1;
        return `<span class="${cls}">${word.replace(
          /[.,!?:؛]/g,
          ""
        )}${punctuation}</span>`;
      })
      .filter(Boolean)
      .join(" ");
  }
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
  const soundDiv = flashcardDiv.querySelector(".sound");
  const audioEl = flashcardDiv.querySelector("audio");
  const playButton = flashcardDiv.querySelector(".play-btn");
  playButton.addEventListener("click", (ev) => {
    ev.stopPropagation();
    audioEl.currentTime = 0;
    audioEl.play();
  });
  soundDiv.addEventListener("click", (ev) => {
    ev.stopPropagation();
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
      // Create a temporary node to calculate the target position at the end
      const tempNode = document.createElement("div");
      tempNode.style.visibility = "hidden";
      tempNode.style.width = "36px";
      tempNode.style.height = "36px";
      newBox.appendChild(tempNode); // Append temp node to the end
      const targetRect = tempNode.getBoundingClientRect();
      setTimeout(() => {
        node.style.left = `${targetRect.left}px`;
        node.style.top = `${targetRect.top}px`;
        node.style.opacity = "0.5";
      }, 10);
      setTimeout(() => {
        newBox.appendChild(node); // Append the actual node to the end
        newBox.removeChild(tempNode);
        node.style.position = "relative";
        node.style.left = "";
        node.style.top = "";
        node.style.opacity = "1";
        node.style.transition = "";
        node.style.zIndex = "";
      }, 600);
    } else {
      // If staying in the same box, move to the end
      newBox.appendChild(node);
    }
  }, 500);
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
backButton.addEventListener(
  "click",
  () => (window.location.href = "../index.html")
);
