const container = document.querySelector(".content");
const rootModal = document.getElementById("rootModal");
const modalRootContent = document.getElementById("modalRootContent");
const modalRootHeader = document.getElementById("modalRootHeader");
const closeButton = document.querySelector(".close-button");
const backButton = document.querySelector(".back-btn");
const header = document.querySelector(".header");
const urlParams = new URLSearchParams(window.location.search);
const level = urlParams.get("level");

// نقشه تنظیمات برای فایل‌ها و مسیرهای audio
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
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load JSON file");
        }
        return response.json();
      })
      .then((data) => {
        renderItems(data, config.headerClass);
        backButton.style.display = "block";
      })
      .catch((error) => {
        container.innerHTML = `<div class="error">خطا در بارگذاری فایل JSON: ${error.message}</div>`;
      });
  } else {
    container.innerHTML = `<div class="error">سطح نامعتبر است یا وجود ندارد</div>`;
  }
});

function groupItems(items) {
  const grouped = [];
  const groupSize = 50;

  for (let i = 0; i < items.length; i += groupSize) {
    grouped.push(items.slice(i, i + groupSize));
  }

  return grouped;
}

function createItem(group, groupIndex, itemIndexInGroup) {
  const mainItem = group[0];
  const relatedItems = group.slice(1);
  const mainSoundDe =
    mainItem.Sound_de && typeof mainItem.Sound_de === "string"
      ? mainItem.Sound_de.trim()
      : "";
  const isMainSentence = /[.!?]$/.test(mainSoundDe);

  let colorClass = "";
  if (!isMainSentence) {
    const lowerCaseSoundDe = mainSoundDe.toLowerCase();
    if (lowerCaseSoundDe.startsWith("die ")) {
      colorClass = "pink-text";
    } else if (lowerCaseSoundDe.startsWith("der ")) {
      colorClass = "blue-text";
    } else if (lowerCaseSoundDe.startsWith("das ")) {
      colorClass = "green-text";
    }
  }

  let rootIconHtml = "";
  if (
    mainItem.root &&
    typeof mainItem.root === "string" &&
    mainItem.root.trim() !== ""
  ) {
    const safeRoot = String(mainItem.root || "")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
    const safeSoundDe = String(mainItem.Sound_de || "")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

    rootIconHtml = `<div class="root-icon" data-root-content='${JSON.stringify({
      root: safeRoot,
      Sound_de: safeSoundDe,
    })}'>i</div>`;
  }

  let typeHtml = "";
  if (
    mainItem.type &&
    typeof mainItem.type === "string" &&
    mainItem.type.trim() !== ""
  ) {
    typeHtml = `<div class="type">${
      mainItem.type === "فعل (غیرجداشدنی)" ? "فعل" : mainItem.type
    }</div>`;
  }

  const itemNumber = groupIndex * 50 + itemIndexInGroup + 1;

  const itemDiv = document.createElement("div");
  itemDiv.classList.add("item");

  itemDiv.innerHTML = `
          <div class="item-top">
            <div class="filename">${itemNumber}</div>
            ${typeHtml}
            <div class="translate">${mainItem.translate_fa || ""}</div>
          </div>
          ${rootIconHtml}
        `;

  function createItemBottom(item, isSentence, audioPath) {
    let soundContent = "";
    let maxSliderValue;
    let segments;

    const soundDe =
      item.Sound_de && typeof item.Sound_de === "string"
        ? item.Sound_de.trim()
        : "";

    if (isSentence) {
      segments = soundDe.split(" ");
      let currentIndex = 0;
      soundContent = segments
        .map((word, index) => {
          if (index < currentIndex) {
            return "";
          }

          let className = "";
          const cleanWord = word.replace(/[.,!?:]/g, "").toLowerCase();
          const punctuation = word.match(/[.,!?:]/g)
            ? word.match(/[.,!?:]/g).join("")
            : "";

          const checkMultiWord = (arr, index) => {
            if (!arr) return { match: false, length: 1, phraseWords: [] };
            for (let item of arr) {
              if (!item || typeof item !== "string") continue;
              const words = item.split(" ");
              const phrase = segments
                .slice(index, index + words.length)
                .join(" ")
                .replace(/[.,!?:]/g, "")
                .toLowerCase();
              if (phrase === item.toLowerCase()) {
                return {
                  match: true,
                  length: words.length,
                  phraseWords: segments.slice(index, index + words.length),
                };
              }
            }
            return { match: false, length: 1, phraseWords: [] };
          };

          let result = checkMultiWord(item.subject, index);
          if (result.match) {
            const phraseWords = result.phraseWords;
            currentIndex = index + result.length;
            return phraseWords
              .map((w, i) => {
                const punc = w.match(/[.,!?:]/g)
                  ? w.match(/[.,!?:]/g).join("")
                  : "";
                return `<span class="subject">${w.replace(
                  /[.,!?:]/g,
                  ""
                )}${punc}</span>`;
              })
              .join(" ");
          }

          result = checkMultiWord(item.object, index);
          if (result.match) {
            const phraseWords = result.phraseWords;
            currentIndex = index + result.length;
            return phraseWords
              .map((w, i) => {
                const punc = w.match(/[.,!?:]/g)
                  ? w.match(/[.,!?:]/g).join("")
                  : "";
                return `<span class="object">${w.replace(
                  /[.,!?:]/g,
                  ""
                )}${punc}</span>`;
              })
              .join(" ");
          }

          if (
            item.auxiliary_verb &&
            item.auxiliary_verb.some(
              (a) => a && typeof a === "string" && a.toLowerCase() === cleanWord
            )
          ) {
            className = "aux-verb";
          } else if (
            item.subject &&
            item.subject.some(
              (s) => s && typeof s === "string" && s.toLowerCase() === cleanWord
            )
          ) {
            className = "subject";
          } else if (
            item.verb &&
            item.verb.some(
              (v) => v && typeof v === "string" && v.toLowerCase() === cleanWord
            )
          ) {
            className = "verb";
          } else if (
            item.verb_part1 &&
            item.verb_part1.some(
              (vp1) =>
                vp1 &&
                typeof vp1 === "string" &&
                vp1.toLowerCase() === cleanWord
            )
          ) {
            className = "verb_part1";
          } else if (
            item.verb_part2 &&
            item.verb_part2.some(
              (vp2) =>
                vp2 &&
                typeof vp2 === "string" &&
                vp2.toLowerCase() === cleanWord
            )
          ) {
            className = "verb_part2";
          } else if (
            item.object &&
            item.object.some(
              (o) => o && typeof o === "string" && o.toLowerCase() === cleanWord
            )
          ) {
            className = "object";
          }

          currentIndex = index + 1;
          return `<span class="${className}">${word.replace(
            /[.,!?:]/g,
            ""
          )}${punctuation}</span>`;
        })
        .filter((segment) => segment !== "")
        .join(" ");
      maxSliderValue = segments.length;
    } else {
      segments = soundDe.split("");
      soundContent = segments.map((char) => `<span>${char}</span>`).join("");
      maxSliderValue = segments.length;
    }

    const itemBottom = document.createElement("div");
    itemBottom.classList.add("item-bottom");
    itemBottom.innerHTML = `
            <div class="sound ${isSentence ? "sentence" : ""} ${
      isSentence ? "" : colorClass
    }">${soundContent}</div>
            <input type="text" class="input-text" placeholder="Testen Sie Ihr Schreiben.">
            <audio src="${audioPath}/${item.file || ""}" preload="none"></audio>
            <div class="control-buttons">
              <button class="delete-btn">Löschen</button>
              <button class="play-btn">Aussprache</button>
            </div>
            <input type="range" min="0" max="${
              maxSliderValue || 0
            }" value="0" step="1" class="reveal-slider">
          `;

    itemBottom.dataset.revealIndex = "0";

    const playButton = itemBottom.querySelector(".play-btn");
    const audio = itemBottom.querySelector("audio");
    playButton.addEventListener("click", () => {
      audio.play();
    });

    const deleteButton = itemBottom.querySelector(".delete-btn");
    deleteButton.addEventListener("click", () => {
      itemBottom.parentElement.remove();
    });

    const soundText = itemBottom.querySelector(".sound");
    soundText.addEventListener("click", () => {
      const spans = soundText.querySelectorAll("span");
      const allRevealed = Array.from(spans).every((span) =>
        span.classList.contains("revealed")
      );
      spans.forEach((span) => {
        span.classList.toggle("revealed", !allRevealed);
      });
      itemBottom.dataset.revealIndex = allRevealed ? "0" : spans.length;
      const slider = itemBottom.querySelector(".reveal-slider");
      slider.value = allRevealed ? 0 : spans.length;

      const percentage = (slider.value / maxSliderValue) * 100;
      slider.style.background = `linear-gradient(to right, #00ff88 ${percentage}%, #2f547f ${percentage}%)`;
    });

    const slider = itemBottom.querySelector(".reveal-slider");
    slider.addEventListener("input", () => {
      const revealIndex = parseInt(slider.value);
      const spans = soundText.querySelectorAll("span");
      spans.forEach((span, index) => {
        span.classList.toggle("revealed", index < revealIndex);
      });
      itemBottom.dataset.revealIndex = revealIndex;
      const percentage = (revealIndex / maxSliderValue) * 100;
      slider.style.background = `linear-gradient(to right, #00ff88 ${percentage}%, #34495e ${percentage}%)`;
    });

    const inputText = itemBottom.querySelector(".input-text");
    inputText.addEventListener("input", () => {
      if (inputText.value.trim() === soundDe) {
        inputText.classList.add("correct");
      } else {
        inputText.classList.remove("correct");
      }
    });

    return itemBottom;
  }

  const mainItemBottom = createItemBottom(
    mainItem,
    isMainSentence,
    document.querySelector(".content").dataset.audioPath
  );
  itemDiv.appendChild(mainItemBottom);

  relatedItems.forEach((relatedItem) => {
    const isRelatedSentence = /[.!?]$/.test(
      relatedItem.Sound_de && typeof relatedItem.Sound_de === "string"
        ? relatedItem.Sound_de.trim()
        : ""
    );
    const relatedItemBottom = createItemBottom(
      relatedItem,
      isRelatedSentence,
      document.querySelector(".content").dataset.audioPath
    );
    relatedItemBottom.querySelector(".sound").classList.add("sentence");
    relatedItemBottom.querySelector(".translate")?.remove();
    itemDiv.appendChild(relatedItemBottom);
  });

  const rootIcon = itemDiv.querySelector(".root-icon");
  if (rootIcon) {
    rootIcon.addEventListener("click", () => {
      const dataString = rootIcon.dataset.rootContent;
      const data = JSON.parse(dataString);
      const rootValue = data.root;
      const soundDeValue = data.Sound_de;

      modalRootHeader.textContent = soundDeValue;
      modalRootContent.textContent = rootValue;

      rootModal.classList.add("show");
    });
  }

  return itemDiv;
}

function renderItems(items, headerClass) {
  container.innerHTML = "";
  const groupedItems = groupItems(items);
  const groupSize = 50;

  groupedItems.forEach((group, groupIndex) => {
    const accordionDiv = document.createElement("div");
    accordionDiv.classList.add("accordion");

    const accordionHeader = document.createElement("div");
    accordionHeader.classList.add("accordion-header");

    accordionHeader.classList.add(headerClass || "color-a1"); // استفاده از headerClass یا پیش‌فرض

    const start = groupIndex * groupSize + 1;
    const end = Math.min(start + groupSize - 1, items.length);

    accordionHeader.innerHTML = `
            <span>Gruppe ${groupIndex + 1} (${start} - ${end})</span>
            <div class="header-buttons">
              <button class="test-btn">Worttest</button>
              <button class="toggle-textbox-btn" disabled>Text ein</button>
            </div>
          `;

    const accordionContent = document.createElement("div");
    accordionContent.classList.add("accordion-content");
    accordionContent.dataset.groupIndex = groupIndex;

    accordionDiv.appendChild(accordionHeader);
    accordionDiv.appendChild(accordionContent);
    container.appendChild(accordionDiv);

    accordionHeader.addEventListener("click", (e) => {
      console.log(e);
      if (
        e.target.classList.contains("toggle-textbox-btn") ||
        e.target.closest(".toggle-textbox-btn") ||
        e.target.classList.contains("test-btn") ||
        e.target.closest(".test-btn")
      ) {
        return;
      }

      const isActive = accordionContent.classList.contains("active");

      document.querySelectorAll(".accordion-content").forEach((content) => {
        if (
          content !== accordionContent &&
          content.classList.contains("active")
        ) {
          content.classList.remove("active");
          content.innerHTML = "";
          const otherHeader = content.previousElementSibling;
          const otherToggleButton = otherHeader.querySelector(
            ".toggle-textbox-btn"
          );
          otherToggleButton.disabled = true;
          otherToggleButton.textContent = "Text ein";
        }
      });

      accordionContent.classList.toggle("active");
      const toggleTextboxButton = accordionHeader.querySelector(
        ".toggle-textbox-btn"
      );
      toggleTextboxButton.disabled =
        !accordionContent.classList.contains("active");

      if (isActive) {
        accordionContent.innerHTML = "";
        toggleTextboxButton.textContent = "Text ein";
        document.body.style.overflow = "";
        // document.body.style.padding = "20px";
      } else {
        group.forEach((item, itemIndexInGroup) => {
          const itemDiv = createItem([item], groupIndex, itemIndexInGroup);
          accordionContent.appendChild(itemDiv);
        });

        requestAnimationFrame(() => {
          const yOffset = -8;
          const y =
            accordionHeader.getBoundingClientRect().top +
            window.pageYOffset +
            yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        });

        document.body.style.overflow = "hidden";
        // document.body.style.padding = "0px";
        // document.body.style.paddingBottom = "10px";
      }

      const anyActive = document.querySelector(".accordion-content.active");
      document
        .querySelectorAll(".accordion-content, .accordion-header")
        .forEach((el) => {
          if (anyActive) {
            const isThisActive =
              el.classList.contains("active") ||
              el === anyActive.previousElementSibling;
            el.style.display = isThisActive ? "" : "none";
            backButton.style.display = "none";
            header.style.display = "none";
          } else {
            el.style.display = "";
            backButton.style.display = "";
            header.style.display = "";
          }
        });
    });

    const toggleTextboxButton = accordionHeader.querySelector(
      ".toggle-textbox-btn"
    );

    toggleTextboxButton.addEventListener("click", (e) => {
      e.stopPropagation();
      const textboxes = accordionContent.querySelectorAll(".input-text");
      const isHidden =
        textboxes[0]?.style.display === "none" ||
        textboxes[0]?.style.display === "";
      textboxes.forEach((textbox) => {
        textbox.style.display = isHidden ? "block" : "none";
      });
      toggleTextboxButton.textContent = isHidden ? "Text aus" : "Text ein";
    });

    const testButton = accordionHeader.querySelector(".test-btn");
    testButton.addEventListener("click", (e) => {
      console.log(e);
      // return;
      e.stopPropagation();
      const groupIndex = parseInt(accordionContent.dataset.groupIndex);
      const groupData = groupedItems[groupIndex];
      localStorage.setItem("testGroupData", JSON.stringify(groupData));
      window.location.href = `../pages/worttest.html?groupIndex=${
        groupIndex + 1
      }&level=${level}`;
    });
  });
}

closeButton.addEventListener("click", () => {
  rootModal.classList.remove("show");
});

rootModal.addEventListener("click", (e) => {
  if (e.target === rootModal) {
    rootModal.classList.remove("show");
  }
});

backButton.addEventListener("click", () => {
  window.location.href = "../index.html";
});
