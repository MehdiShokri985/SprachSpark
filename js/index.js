const levelButtons = document.querySelectorAll(".level-btn");

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
