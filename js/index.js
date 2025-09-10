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

    const grammarLevels = ["A1 GRAMMATIK", "A2 GRAMMATIK"];
    let targetPage;
    if (grammarLevels.includes(level)) {
      targetPage = type === "list" ? "grammar.html" : "flashcard.html";
    } else {
      targetPage = type === "list" ? "content.html" : "flashcard.html";
    }

    window.location.href = `${targetPage}?level=${level}`;
  });
});
