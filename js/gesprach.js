const backButton = document.querySelector(".back-btn");

fetch("json/Gespräch/json-Gesprach-Gruppe.json")
  .then((response) => response.json())
  .then((data) => {
    const container = document.getElementById("accordion-container");
    data.Gruppen.forEach((gruppe, index) => {
      // const isA2 = index === 1; // Assuming second group is A2 for styling
      const isA2 = 0; // Assuming second group is A2 for styling
      const accordion = document.createElement("div");
      accordion.className = "accordion";

      const header = document.createElement("div");
      header.className = `accordion-header ${isA2 ? "a2" : ""}`;
      const persianHeader = document.createElement("span");
      persianHeader.className = "persian-title";
      persianHeader.textContent = gruppe.GruppeFarsi;
      const germanHeader = document.createElement("span");
      germanHeader.className = "german-title";
      germanHeader.textContent = gruppe.Gruppe;
      header.appendChild(persianHeader);
      header.appendChild(germanHeader);

      const content = document.createElement("div");
      content.className = "accordion-content";

      const levelSelection = document.createElement("div");
      levelSelection.className = "level-selection";

      gruppe.Themen.forEach((thema) => {
        const levelItem = document.createElement("div");
        levelItem.className = `level-item ${isA2 ? "a2" : ""}`;

        const levelTitle = document.createElement("div");
        levelTitle.className = `level-title ${isA2 ? "a2" : ""}`;
        const persianTitle = document.createElement("span");
        persianTitle.className = "persian-title";
        persianTitle.textContent = thema.ThemaFarsi;
        const germanTitle = document.createElement("span");
        germanTitle.className = "german-title";
        germanTitle.textContent = thema.Thema;
        levelTitle.appendChild(persianTitle);
        levelTitle.appendChild(germanTitle);

        const levelButtons = document.createElement("div");
        levelButtons.className = "level-buttons";

        const buttons = [
          {
            text: "Flashcard 2",
            type: "flashcard",
            dataLevel: {
              thema: `${thema.fileName}2`,
              Nr: thema.Nr,
              gruppe: gruppe.id,
            },
            class: "flashcard",
          },
          {
            text: "Flashcard 1",
            type: "flashcard",
            dataLevel: {
              thema: `${thema.fileName}1`,
              Nr: thema.Nr,
              gruppe: gruppe.id,
            },
            class: "flashcard",
          },
        ];

        buttons.forEach((btn) => {
          const button = document.createElement("button");
          button.className = `level-btn ${isA2 ? "a2" : ""} ${btn.class || ""}`;
          button.dataset.level = JSON.stringify(btn.dataLevel);
          button.dataset.type = btn.type;
          button.textContent = btn.text;
          levelButtons.appendChild(button);
        });

        levelItem.appendChild(levelTitle);
        levelItem.appendChild(levelButtons);
        levelSelection.appendChild(levelItem);
      });

      accordion.appendChild(header);
      accordion.appendChild(content);
      content.appendChild(levelSelection);
      container.appendChild(accordion);
    });

    const accordionHeaders = document.querySelectorAll(".accordion-header");
    const levelButtons = document.querySelectorAll(".level-btn");

    accordionHeaders.forEach((header) => {
      header.addEventListener("click", () => {
        const content = header.nextElementSibling;
        const isActive = content.classList.contains("active");

        document
          .querySelectorAll(".accordion-content")
          .forEach((otherContent) => {
            if (
              otherContent !== content &&
              otherContent.classList.contains("active")
            ) {
              otherContent.classList.remove("active");
            }
          });

        content.classList.toggle("active", !isActive);
      });
    });

    levelButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const level = button.dataset.level;
        // const type = button.dataset.type;
        let targetPage;
        targetPage = "/pages/gesprach-flashcard.html";
        localStorage.setItem("selectedLevel", JSON.stringify(level));

        window.location.href = `${targetPage}`;
      });
    });
  })
  .catch((error) => console.error("Error loading JSON:", error));

backButton.addEventListener(
  "click",
  () => (window.location.href = "index.html")
);
