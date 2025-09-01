      const accordionHeaders = document.querySelectorAll(".accordion-header");
      const levelButtons = document.querySelectorAll(".level-btn");

      // مدیریت کلیک روی هدر آکاردئون
      accordionHeaders.forEach((header) => {
        header.addEventListener("click", () => {
          const content = header.nextElementSibling;
          const isActive = content.classList.contains("active");

          // بستن همه آکاردئون‌های دیگر
          document.querySelectorAll(".accordion-content").forEach((otherContent) => {
            if (otherContent !== content && otherContent.classList.contains("active")) {
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
          localStorage.setItem("selectedLevel", level);

          const grammarLevels = ["A1 GRAMMATIK", "A2 GRAMMATIK"];
          const targetPage = grammarLevels.includes(level)
            ? "grammar.html"
            : "content.html";

          window.location.href = `${targetPage}?level=${level}`;
        });
      });