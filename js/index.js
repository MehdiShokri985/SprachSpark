const accordionHeaders = document.querySelectorAll(".accordion-header");
const levelButtons = document.querySelectorAll(".level-btn");

// مدیریت کلیک روی هدر آکاردئون
accordionHeaders.forEach((header) => {
  header.addEventListener("click", () => {
    const content = header.nextElementSibling;
    const isActive = content.classList.contains("active");

    // بستن همه آکاردئون‌های دیگر
    document.querySelectorAll(".accordion-content").forEach((otherContent) => {
      if (
        otherContent !== content &&
        otherContent.classList.contains("active")
      ) {
        otherContent.classList.remove("active");
      }
    });

    // تغییر وضعیت آکاردئون فعلی
    content.classList.toggle("active", !isActive);
  });
});

// مدیریت کلیک روی دکمه‌های سطح
levelButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const level = button.dataset.level;
    const type = button.dataset.type;
    localStorage.setItem("selectedLevel", level);

    const gameLevels = [
      "A1_game",
      "A1_VERBEN_game",
      "A1_Kollokationen_game",
      "A2_game",
      "A2_VERBEN_game",
      "A2_Kollokationen_game",
      "A1_Gruppierte_Worter_game",
      "A1_Synonyms_Worter_game",
      "A1_Synonyms_verb_game",
      "A2_Gruppierte_Worter_game",
      "A2_Synonyms_Worter_game",
      "A2_Synonyms_verb_game",
      "worter_A1_game",
      "worter_A2_game",
    ];
    const grammarLevels = ["A1 GRAMMATIK", "A2 GRAMMATIK"];
    let targetPage;
    // console.log(grammarLevels);

    if (gameLevels.includes(level)) {
      targetPage = "pages/bridgeGame.html";
    } else if (grammarLevels.includes(level)) {
      targetPage = "pages/grammar.html";
    } else {
      targetPage =
        type === "list"
          ? "pages/content.html"
          : type === "flashcard"
          ? "pages/flashcard.html"
          : type === "box"
          ? "pages/box.html"
          : type === "box2"
          ? "pages/box2.html"
          : "pages/gesprach.html";
    }

    window.location.href = `${targetPage}?level=${level}`;
  });
});
