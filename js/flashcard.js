const container = document.querySelector(".content");
const rootModal = document.getElementById("rootModal");
const modalRootContent = document.getElementById("modalRootContent");
const modalRootHeader = document.getElementById("modalRootHeader");
const closeButton = document.querySelector(".close-button");
const backButton = document.querySelector(".back-btn");
const header = document.querySelector(".header");

const levelConfig = {
  A1: {
    jsonFile: "json-worterA1.json",
    audioPath: "audio-A1",
    headerText: "A1 WORTLISTE",
    headerClass: "color-a1",
  },
  A2: {
    jsonFile: "json-worterA2.json",
    audioPath: "audio-A2",
    headerText: "A2 WORTLISTE",
    headerClass: "color-a2",
  },
  "A1 VERBEN": {
    jsonFile: "json-verb-A1.json",
    audioPath: "audio-A1",
    headerText: "A1 VERBEN",
    headerClass: "color-a1",
  },
  "A2 VERBEN": {
    jsonFile: "json-verb-A2.json",
    audioPath: "audio-A2",
    headerText: "A2 VERBEN",
    headerClass: "color-a2",
  },
  "A1 Kollokationen": {
    jsonFile: "json-A1-Kollokationen.json",
    audioPath: "audio-A1-Kollokationen",
    headerText: "A1 Kollokationen",
    headerClass: "color-a1",
  },
  "A2 Kollokationen": {
    jsonFile: "json-A2-Kollokationen.json",
    audioPath: "audio-A2-Kollokationen",
    headerText: "A2 Kollokationen",
    headerClass: "color-a2",
  },
};

window.addEventListener("load", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const level = urlParams.get("level");
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
          <div class="type">${
            mainItem.type
              ? mainItem.type === "فعل (غیرجداشدنی)"
                ? "فعل"
                : mainItem.type
              : ""
          }</div>
        </div>
        <div class="translate">${mainItem.translate_fa || ""}</div>
      </div>
      <div class="flashcard-back">
        <div class="item-top">
          <div class="filename">${itemNumber}</div>
          <div class="type">${
            mainItem.type
              ? mainItem.type === "فعل (غیرجداشدنی)"
                ? "فعل"
                : mainItem.type
              : ""
          }</div>
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
         
          <button class="play-btn" type="button">Aussprache</button>
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
    const val = Number(slider.value);
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
    const groupDiv = document.createElement("div");
    groupDiv.className = `group-header ${headerClass || "color-a1"}`;
    const start = groupIndex * groupSize + 1;
    const end = Math.min(start + groupSize - 1, items.length);
    groupDiv.innerHTML = `
      <span>Gruppe ${groupIndex + 1} (${start} - ${end})</span>
      <div class="header-buttons">
        <button class="test-btn" type="button">Worttest</button>
        <button class="toggle-textbox-btn" disabled type="button">Text ein</button>
      </div>
    `;

    const flashcardContainer = document.createElement("div");
    flashcardContainer.className = "flashcard-container";
    flashcardContainer.dataset.groupIndex = groupIndex;

    container.appendChild(groupDiv);
    container.appendChild(flashcardContainer);

    groupDiv.addEventListener("click", (e) => {
      if (e.target.closest(".toggle-textbox-btn, .test-btn")) return;

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
        // نمایش header و back-btn هنگام بازگشت به گروه‌ها
        header.style.display = "block";
        backButton.style.display = "block";
      } else {
        // نمایش فلش‌کارت‌های گروه انتخاب‌شده
        document
          .querySelectorAll(".group-header, .flashcard-container")
          .forEach((el) => {
            el.style.display =
              el === groupDiv || el === flashcardContainer ? "" : "none";
          });
        // مخفی کردن header و back-btn هنگام نمایش فلش‌کارت‌ها
        header.style.display = "none";
        backButton.style.display = "none";
        flashcardContainer.innerHTML = "";
        flashcardContainer.classList.add("active");

        group.forEach((item, idx) => {
          const fc = createFlashcard(
            item,
            groupIndex,
            idx,
            container.dataset.audioPath
          );
          flashcardContainer.appendChild(fc);
          fc.classList.add(idx === 0 ? "active" : "next");
        });

        const flashcards = Array.from(
          flashcardContainer.querySelectorAll(".flashcard")
        );
        let activeCardIndex = 0;

        flashcards.forEach((card, index) => {
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

            if (
              !isDragging &&
              duration < 300 &&
              Math.abs(diffX) < dragThreshold
            ) {
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
        });

        const toggleTextboxButton = groupDiv.querySelector(
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

        const testButton = groupDiv.querySelector(".test-btn");
        testButton.addEventListener("click", (e) => {
          e.stopPropagation();
          localStorage.setItem("testGroupData", JSON.stringify(group));
          const level = container.dataset.audioPath.includes("A1")
            ? "A1"
            : container.dataset.audioPath.includes("A2")
            ? "A2"
            : "A1 VERBEN";
          window.location.href = `worttest.html?groupIndex=${
            groupIndex + 1
          }&level=${level}`;
        });
      }
    });
  });
}

closeButton.addEventListener("click", () => rootModal.classList.remove("show"));
rootModal.addEventListener("click", (e) => {
  if (e.target === rootModal) rootModal.classList.remove("show");
});
backButton.addEventListener(
  "click",
  () => (window.location.href = "index.html")
);
