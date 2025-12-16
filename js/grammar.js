const container = document.querySelector(".content");
const backButton = document.querySelector(".back-btn");
const header = document.querySelector(".header");

// نقشه تنظیمات برای فایل‌ها و مسیرهای audio
const levelConfig = {
  "A1 GRAMMATIK": {
    jsonFile: "../json/json-A1-Grammatik.json",
    headerText: "A1 GRAMMATIK",
    headerClass: "color-a1",
  },
  "A2 GRAMMATIK": {
    jsonFile: "../json/json-A2-Grammatik.json",
    headerText: "A2 GRAMMATIK",
    headerClass: "color-a2",
  },
    "B1 GRAMMATIK": {
    jsonFile: "../json/json-B1-Grammatik.json",
    headerText: "B1 GRAMMATIK",
    headerClass: "color-a2",
  },
};


// بررسی پارامترهای URL هنگام بارگذاری صفحه
let colorclass = "";
window.addEventListener("load", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const level = urlParams.get("level");
  header.innerHTML = level;

  if (level && levelConfig[level]) {
    const config = levelConfig[level];
    colorclass = config.headerClass;
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

function createItem(item) {
  const itemDiv = document.createElement("div");
  itemDiv.classList.add("grammar-item");

  // ایجاد title_fa
  const titleDiv = document.createElement("div");
  titleDiv.classList.add("grammar-title-fa", colorclass);
  titleDiv.innerHTML = item.title_fa;

  // ایجاد header
  const headerDiv = document.createElement("div");
  headerDiv.classList.add("grammar-header");
  headerDiv.innerHTML = item.header;

  // ایجاد لیست بخش‌ها
  const sectionsDiv = document.createElement("div");
  item.sections.forEach((section) => {
    const sectionHeader = document.createElement("div");
    sectionHeader.classList.add(colorclass, "section-header");
    sectionHeader.innerHTML = section.title;

    const sectionContent = document.createElement("div");
    sectionContent.classList.add("section-content");
    sectionContent.innerHTML = section.content;

    sectionHeader.addEventListener("click", () => {
      // بستن سایر section-contentها در همان grammar-item
      const siblingContents =
        sectionHeader.parentElement.querySelectorAll(".section-content");
      siblingContents.forEach((content) => {
        if (
          content !== sectionContent &&
          content.classList.contains("active")
        ) {
          content.classList.remove("active");
        }
      });

      // تغییر وضعیت section-content فعلی
      sectionContent.classList.toggle("active");
    });

    sectionsDiv.appendChild(sectionHeader);
    sectionsDiv.appendChild(sectionContent);
  });

  itemDiv.appendChild(titleDiv);
  itemDiv.appendChild(headerDiv);
  itemDiv.appendChild(sectionsDiv);

  return itemDiv;
}

function renderItems(items, headerClass) {
  container.innerHTML = "";

  items.forEach((item, index) => {
    const accordionDiv = document.createElement("div");
    accordionDiv.classList.add("accordion");

    const accordionHeader = document.createElement("div");
    accordionHeader.classList.add(
      "accordion-header",
      headerClass || "color-a1"
    );
    accordionHeader.innerHTML = `<span>${index + 1}. ${item.title}</span>`;

    const accordionContent = document.createElement("div");
    accordionContent.classList.add("accordion-content");

    accordionDiv.appendChild(accordionHeader);
    accordionDiv.appendChild(accordionContent);
    container.appendChild(accordionDiv);

    accordionHeader.addEventListener("click", () => {
      const isActive = accordionContent.classList.contains("active");

      // بستن سایر آکاردئون‌ها
      document.querySelectorAll(".accordion-content").forEach((content) => {
        if (
          content !== accordionContent &&
          content.classList.contains("active")
        ) {
          content.classList.remove("active");
          content.innerHTML = "";
        }
      });

      accordionContent.classList.toggle("active");

      if (isActive) {
        accordionContent.innerHTML = "";
        document.body.style.overflow = "";
      } else {
        const itemDiv = createItem(item);
        accordionContent.appendChild(itemDiv);

        requestAnimationFrame(() => {
          const yOffset = -8;
          const y =
            accordionHeader.getBoundingClientRect().top +
            window.pageYOffset +
            yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        });

        document.body.style.overflow = "hidden";
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
  });
}

backButton.addEventListener("click", () => {
  window.location.href = "../index.html";
});
