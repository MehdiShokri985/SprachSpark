const container = document.querySelector(".content");
const backButton = document.querySelector(".back-btn");
const header = document.querySelector(".header");

// بررسی پارامترهای URL هنگام بارگذاری صفحه
window.addEventListener("load", () => {
  const urlParams = new URLSearchParams(window.location.search);
  console.log(urlParams);
  const level = urlParams.get("level");
  header.innerHTML = level;
  const json_file =
    level === "A1 GRAMMATIK"
      ? "json-A1-Grammatik.json"
      : "json-A2-Grammatik.json";

  //   if (level === "A1 GRAMMATIK") {

  fetch(json_file)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load JSON file");
      }
      return response.json();
    })
    .then((data) => {
      renderItems(data);
      backButton.style.display = "block";
    })
    .catch((error) => {
      container.innerHTML = `<div class="error">خطا در بارگذاری فایل JSON: ${error.message}</div>`;
    });
  //   }
});

function createItem(item) {
  const itemDiv = document.createElement("div");
  itemDiv.classList.add("grammar-item");

  itemDiv.innerHTML = `
          <div class="grammar-title-fa">${item.title_fa}</div>
          <div class="grammar-description">${item.description}</div>
          <div class="grammar-examples">
            <ul>
              ${item.examples.map((example) => `<li>${example}</li>`).join("")}
            </ul>
          </div>
        `;

  return itemDiv;
}

function renderItems(items) {
  container.innerHTML = "";

  items.forEach((item, index) => {
    const accordionDiv = document.createElement("div");
    accordionDiv.classList.add("accordion");

    const accordionHeader = document.createElement("div");
    accordionHeader.classList.add("accordion-header");
    accordionHeader.innerHTML = `<span>${index + 1}. ${item.title}</span>`;

    const accordionContent = document.createElement("div");
    accordionContent.classList.add("accordion-content");

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
        document.body.style.padding = "20px";
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
        document.body.style.padding = "0px";
        document.body.style.paddingBottom = "10px";
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
