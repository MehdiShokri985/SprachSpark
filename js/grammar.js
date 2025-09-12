const container = document.querySelector(".content");
const backButton = document.querySelector(".back-btn");
const header = document.querySelector(".header");

// نقشه تنظیمات برای فایل‌ها و مسیرهای audio
const levelConfig = {
  "A1 GRAMMATIK": {
    jsonFile: "json-A1-Grammatik.json",
    headerText: "A1 GRAMMATIK",
    headerClass: "color-a1",
  },
  "A2 GRAMMATIK": {
    jsonFile: "json-A2-Grammatik.json",
    headerText: "A2 GRAMMATIK",
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

  itemDiv.innerHTML = `
          <div class="grammar-title-fa ${colorclass}">${item.title_fa}</div>
          <div class="grammar-description">${item.description}</div>
          <div class="grammar-examples">
            <ul>
              ${item.examples
                .map((example) => `<li class="${colorclass}">${example}</li>`)
                .join("")}
            </ul>
          </div>
        `;

  return itemDiv;
}

function renderItems(items, headerClass) {
  container.innerHTML = "";

  items.forEach((item, index) => {
    const accordionDiv = document.createElement("div");
    accordionDiv.classList.add("accordion");

    const accordionHeader = document.createElement("div");
    accordionHeader.classList.add("accordion-header");
    accordionHeader.innerHTML = `<span>${index + 1}. ${item.title}</span>`;

    const accordionContent = document.createElement("div");
    accordionContent.classList.add("accordion-content");
    accordionHeader.classList.add(headerClass || "color-a1"); // استفاده از headerClass یا پیش‌فرض

    accordionDiv.appendChild(accordionHeader);
    accordionDiv.appendChild(accordionContent);
    container.appendChild(accordionDiv);

    accordionHeader.addEventListener("click", () => {
      const isActive = accordionContent.classList.contains("active");

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
        // document.body.style.padding = "20px";
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
  });
}

backButton.addEventListener("click", () => {
  window.location.href = "index.html";
});
