const container = document.querySelector(".content");
const rootModal = document.getElementById("rootModal");
const modalRootContent = document.getElementById("modalRootContent");
const modalRootHeader = document.getElementById("modalRootHeader");
const closeButton = document.querySelector(".close-button");
const backButton = document.querySelector(".back-btn");
const header = document.querySelector(".header");
const urlParams = new URLSearchParams(window.location.search);
const level = urlParams.get("level");

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
    audioPath: "../audio-A1-Verben",
    headerText: "A1 VERBEN",
    headerClass: "color-a1",
  },
  "A2 VERBEN": {
    jsonFile: "../json/json-verb-A2.json",
    audioPath: "../audio-A2-Verben",
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
  Flughafen: {
    jsonFile: "../json/json-Flughafen.json",
    audioPath: "../Flughafen",
    headerText: "Am Flughafen",
    headerClass: "color-a2",
  },
};

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
        renderGroups(data, config.headerClass);
        // نمایش اولیه header و back-btn هنگام بارگذاری گروه‌ها
        header.style.display = "block";
        backButton.style.display = "block";
      })
      .catch((err) => {
        container.innerHTML = `<div class="error">خطا در بارگذاری فایل JSON: ${err.message}</div>`;
      });
  } else {
    container.innerHTML = `<div class="error">سطح نامعتبر است یا وجود ندارد</div>`;
    // مخفی کردن header و back-btn در صورت خطا
    header.style.display = "none";
    backButton.style.display = "none";
  }
});

function groupItems(items) {
  const grouped = [];
  const groupSize = 50;
  for (let i = 0; i < items.length; i += groupSize)
    grouped.push(items.slice(i, i + groupSize));
  return grouped;
}

function createFlashcard(item, groupIndex, itemIndexInGroup, audioPath) {
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

  const itemNumber = groupIndex * 50 + itemIndexInGroup + 1;

  const flashcardDiv = document.createElement("div");
  flashcardDiv.className = "flashcard";
  flashcardDiv.dataset.index = itemIndexInGroup;

  flashcardDiv.innerHTML = `
    <div class="flashcard-inner">
      <div class="flashcard-front">
        <div class="item-top">
          <div class="filename">${itemNumber}</div>
          ${
            mainItem.type
              ? mainItem.type === "فعل (غیرجداشدنی)"
                ? "<div class='type'>فعل</div>"
                : `<div class='type'>${mainItem.type}</div>`
              : ""
          }
          
        </div>
        <div class="translate">${mainItem.translate_fa || ""}</div>
      </div>
      <div class="flashcard-back">
        <div class="item-top">
          <div class="filename">${itemNumber}</div>
          ${
            mainItem.type
              ? mainItem.type === "فعل (غیرجداشدنی)"
                ? "<div class='type'>فعل</div>"
                : `<div class='type'>${mainItem.type}</div>`
              : ""
          }
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
      </div>
    </div>
  `;

  const soundDiv = flashcardDiv.querySelector(".sound");
  const audioEl = flashcardDiv.querySelector("audio");
  const slider = flashcardDiv.querySelector(".reveal-slider");
  const playButton = flashcardDiv.querySelector(".play-btn");
  const inputText = flashcardDiv.querySelector(".input-text");

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
    const val = Math.min(Number(slider.value), slider.max); // محدود کردن به max
    slider.value = val; // به‌روزرسانی مقدار اسلایدر
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

  return flashcardDiv;
}

function renderGroups(items, headerClass) {
  container.innerHTML = "";
  const groupedItems = groupItems(items);
  const groupSize = 50;

  groupedItems.forEach((group, groupIndex) => {
    const accordionHeader = document.createElement("div");
    accordionHeader.className = `group-header ${headerClass || "color-a1"}`;
    const start = groupIndex * groupSize + 1;
    const end = Math.min(start + groupSize - 1, items.length);
    accordionHeader.innerHTML = `
      <span>Gruppe ${groupIndex + 1} (${start} - ${end})</span>
      <div class="header-buttons">
        <button class="filter-words-btn"> </button>
        <button class="view-toggle-btn"> </button>
        <button class="test-btn" > </button>
        <button class="toggle-textbox-btn" disabled >Text ein</button>
      </div>
    `;

    const flashcardContainer = document.createElement("div");
    flashcardContainer.className = "flashcard-container";
    flashcardContainer.dataset.groupIndex = groupIndex;
    flashcardContainer.dataset.viewMode = "single"; // Default view mode
    flashcardContainer.dataset.filterMode = "all"; // Default filter mode: all items

    container.appendChild(accordionHeader);
    container.appendChild(flashcardContainer);

    accordionHeader.addEventListener("click", (e) => {
      if (
        e.target.classList.contains("toggle-textbox-btn") ||
        e.target.closest(".toggle-textbox-btn") ||
        e.target.classList.contains("test-btn") ||
        e.target.closest(".test-btn") ||
        e.target.classList.contains("view-toggle-btn") ||
        e.target.closest(".view-toggle-btn") ||
        e.target.classList.contains("filter-words-btn") ||
        e.target.closest(".filter-words-btn")
      ) {
        return;
      }

      if (flashcardContainer.classList.contains("active")) {
        // بازگشت به نمایش همه گروه‌ها
        document
          .querySelectorAll(".group-header, .flashcard-container")
          .forEach((el) => {
            el.style.display = "";
          });
        document.querySelectorAll(".flashcard-container").forEach((el) => {
          el.classList.remove("active");
          el.innerHTML = ""; // پاک کردن فلش‌کارت‌ها برای بازنشانی
        });
        // ریست کردن وضعیت دکمه toggle-textbox-btn برای همه گروه‌ها
        document.querySelectorAll(".toggle-textbox-btn").forEach((btn) => {
          btn.disabled = true;
          btn.textContent = "Text ein";
        });
        // نمایش header و back-btn هنگام بازگشت به گروه‌ها
        header.style.display = "block";
        backButton.style.display = "block";
      } else {
        // نمایش فلش‌کارت‌های گروه انتخاب‌شده
        document
          .querySelectorAll(".group-header, .flashcard-container")
          .forEach((el) => {
            el.style.display =
              el === accordionHeader || el === flashcardContainer ? "" : "none";
          });
        // مخفی کردن header و back-btn هنگام نمایش فلش‌کارت‌ها
        header.style.display = "none";
        backButton.style.display = "none";
        flashcardContainer.innerHTML = "";
        flashcardContainer.classList.add("active");

        let filteredGroup = group;
        if (flashcardContainer.dataset.filterMode === "words") {
          filteredGroup = group.filter(
            (item) => !/[.!?]$/.test((item.Sound_de || "").trim())
          );
        }

        renderFlashcards(flashcardContainer, filteredGroup, groupIndex);

        const toggleTextboxButton = accordionHeader.querySelector(
          ".toggle-textbox-btn"
        );
        toggleTextboxButton.disabled = false;
        toggleTextboxButton.addEventListener("click", (e) => {
          e.stopPropagation();
          const textboxes = flashcardContainer.querySelectorAll(".input-text");
          const isHidden =
            !textboxes[0] ||
            textboxes[0].style.display === "none" ||
            textboxes[0].style.display === "";
          textboxes.forEach((textbox) => {
            textbox.style.display = isHidden ? "block" : "none";
          });
          toggleTextboxButton.textContent = isHidden ? "Text aus" : "Text ein";
        });
      }
    });

    const filterWordsButton =
      accordionHeader.querySelector(".filter-words-btn");
    filterWordsButton.addEventListener("click", (e) => {
      e.stopPropagation();
      const currentFilter = flashcardContainer.dataset.filterMode;
      const newFilter = currentFilter === "all" ? "words" : "all";
      flashcardContainer.dataset.filterMode = newFilter;
      // filterWordsButton.textContent =
      //   newFilter === "all" ? "Nur Wörter" : "Alle";
      if (flashcardContainer.classList.contains("active")) {
        flashcardContainer.innerHTML = "";
        let filteredGroup = group;
        if (newFilter === "words") {
          filteredGroup = group.filter(
            (item) => !/[.!?]$/.test((item.Sound_de || "").trim())
          );
        }
        renderFlashcards(flashcardContainer, filteredGroup, groupIndex);
      }
    });

    const viewToggleButton = accordionHeader.querySelector(".view-toggle-btn");
    viewToggleButton.addEventListener("click", (e) => {
      e.stopPropagation();
      const currentMode = flashcardContainer.dataset.viewMode;
      const newMode = currentMode === "single" ? "table" : "single";
      flashcardContainer.dataset.viewMode = newMode;
      // viewToggleButton.textContent =
      //   newMode === "single" ? "Tabelle" : "Einzeln";
      if (flashcardContainer.classList.contains("active")) {
        flashcardContainer.innerHTML = "";
        let filteredGroup = group;
        if (flashcardContainer.dataset.filterMode === "words") {
          filteredGroup = group.filter(
            (item) => !/[.!?]$/.test((item.Sound_de || "").trim())
          );
        }
        renderFlashcards(flashcardContainer, filteredGroup, groupIndex);
      }
    });

    const testButton = accordionHeader.querySelector(".test-btn");
    testButton.addEventListener("click", (e) => {
      e.stopPropagation();
      localStorage.setItem("testGroupData", JSON.stringify(group));
      window.location.href = `../pages/worttest.html?groupIndex=${
        groupIndex + 1
      }&level=${level}`;
    });
  });
}

function renderFlashcards(flashcardContainer, group, groupIndex) {
  const viewMode = flashcardContainer.dataset.viewMode;
  const audioPath = container.dataset.audioPath;

  group.forEach((item, idx) => {
    const fc = createFlashcard(item, groupIndex, idx, audioPath);
    flashcardContainer.appendChild(fc);
  });

  const flashcards = Array.from(
    flashcardContainer.querySelectorAll(".flashcard")
  );

  if (viewMode === "table") {
    flashcardContainer.classList.add("table-mode");
    flashcards.forEach((card) => {
      card.classList.add("active");
      attachFlipListener(card);
    });
  } else {
    flashcardContainer.classList.remove("table-mode");
    flashcards.forEach((card, index) => {
      card.classList.add(index === 0 ? "active" : "next");
      attachSwipeListeners(card, flashcards, index);
    });
  }
}

function attachFlipListener(card) {
  card.addEventListener("click", (ev) => {
    if (
      ev.target.closest(
        ".root-icon, .play-btn, .reveal-slider, .sound, .input-text, button, input, a"
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

function attachSwipeListeners(card, flashcards, initialIndex) {
  let activeCardIndex = initialIndex;
  let isDown = false;
  let startX = 0,
    startY = 0,
    currentX = 0;
  let startTime = 0;
  let isDragging = false;
  const dragThreshold = 10;
  const swipeThreshold = 80;
  const interactiveSelector =
    ".root-icon, .play-btn, .reveal-slider, .sound, .input-text, button, input, a";

  card.addEventListener("pointerdown", (ev) => {
    if (ev.target.closest(interactiveSelector)) return;
    card.setPointerCapture(ev.pointerId);
    isDown = true;
    startX = ev.clientX;
    startY = ev.clientY;
    currentX = startX;
    startTime = Date.now();
    isDragging = false;
    card.style.transition = "none";
  });

  card.addEventListener("pointermove", (ev) => {
    if (!isDown) return;
    const diffX = ev.clientX - startX;
    const diffY = ev.clientY - startY;
    if (
      !isDragging &&
      Math.abs(diffX) > dragThreshold &&
      Math.abs(diffX) > Math.abs(diffY)
    ) {
      isDragging = true;
      card.classList.add("dragging");
      ev.preventDefault();
    }
    if (isDragging) {
      currentX = ev.clientX;
      card.style.transform = `translate(calc(-50% + ${diffX}px), -50%)`;
    }
  });

  const endPointer = (ev) => {
    if (!isDown) return;
    try {
      card.releasePointerCapture(ev.pointerId);
    } catch (e) {}
    isDown = false;
    card.classList.remove("dragging");
    card.style.transition = "transform 0.45s ease, opacity 0.45s ease";

    const endX = ev.clientX || currentX || startX;
    const diffX = endX - startX;
    const duration = Date.now() - startTime;

    if (!isDragging && duration < 300 && Math.abs(diffX) < dragThreshold) {
      const isFlipped = card.classList.contains("flipped");
      card.classList.toggle("flipped");
      card.style.transform = "translate(-50%, -50%)";
      const slider = card.querySelector(".reveal-slider");
      const spans = card.querySelectorAll(".sound span");
      if (slider && spans) {
        slider.value = 0;
        spans.forEach((s) => s.classList.remove("revealed"));
        const updateSliderBg = (val, max) => {
          const percent = max
            ? Math.min(100, Math.round((val / max) * 100))
            : 0;
          slider.style.background = `linear-gradient(to right, #00ff88 ${percent}%, #34495e ${percent}%)`;
        };
        updateSliderBg(0, slider.max);
      }
      return;
    }

    if (isDragging && Math.abs(diffX) > swipeThreshold) {
      if (diffX < 0 && activeCardIndex < flashcards.length - 1) {
        flashcards[activeCardIndex].classList.remove("active");
        flashcards[activeCardIndex].classList.add("prev");
        activeCardIndex += 1;
        flashcards[activeCardIndex].classList.remove("next");
        flashcards[activeCardIndex].classList.add("active");
        if (activeCardIndex + 1 < flashcards.length)
          flashcards[activeCardIndex + 1].classList.add("next");
      } else if (diffX > 0 && activeCardIndex > 0) {
        flashcards[activeCardIndex].classList.remove("active");
        flashcards[activeCardIndex].classList.add("next");
        activeCardIndex -= 1;
        flashcards[activeCardIndex].classList.remove("prev");
        flashcards[activeCardIndex].classList.add("active");
      }
    }

    flashcards.forEach((c, i) => {
      c.style.transform = c.classList.contains("active")
        ? "translate(-50%, -50%)"
        : c.classList.contains("next")
        ? "translate(100%, -50%)"
        : c.classList.contains("prev")
        ? "translate(-100%, -50%)"
        : "";
    });

    isDragging = false;
  };

  card.addEventListener("pointerup", endPointer);
  card.addEventListener("pointercancel", endPointer);
}

closeButton.addEventListener("click", () => rootModal.classList.remove("show"));
rootModal.addEventListener("click", (e) => {
  if (e.target === rootModal) rootModal.classList.remove("show");
});
backButton.addEventListener(
  "click",
  () => (window.location.href = "../index.html")
);
