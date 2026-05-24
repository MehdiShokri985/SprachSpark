/**
 * Progressive verb conjugation practice (one combobox at a time).
 */

import {
  VERB_PERSONS,
  VERB_TENSE_KEYS,
  VERB_TENSE_LABELS,
  getTensePersonEntries,
  getTenseExamples,
  makeVerbSlotId,
  getAllVerbFormSlots,
  shuffleArray,
  normalizeForm,
} from "../core/verbUtils.js";

export class VerbConjugationPractice {
  constructor(game) {
    this.game = game;
    this.verb = null;
    /** @type {Set<string>} solved slot ids (tense:person) */
    this.usedSlotIds = new Set();
    this.tenseIndex = 0;
    this.personIndex = 0;
    /** @type {'person'|'done'} */
    this.phase = "person";
    this.completedTenses = [];

    this.modal = document.getElementById("verbConjugationModal");
    this.content = document.getElementById("verbConjugationContent");
    this.subtitle = document.getElementById("verbPracticeSubtitle");
    this.continueBtn = document.getElementById("verbPracticeContinueBtn");
    this.closeBtn = document.getElementById("closeVerbConjugationBtn");

    this.continueBtn?.addEventListener("click", () =>
      this.game.finishVerbPractice(),
    );
    this.closeBtn?.addEventListener("click", () => this.close());
  }

  open(verb) {
    if (!verb || !this.modal) return;

    this.verb = verb;
    this.usedSlotIds = new Set();
    this.tenseIndex = 0;
    this.personIndex = 0;
    this.phase = "person";
    this.completedTenses = [];

    this.subtitle.textContent = verb.word
      ? `${verb.word} — ${verb.meaning || ""}`
      : "";

    this.game.uiManager?.setWordProgressSquaresVisible(false);
    document.getElementById("panel")?.classList.add("hidden");
    document.getElementById("resultModal")?.classList.add("hidden");

    this.modal.classList.remove("hidden");
    this.render();
  }

  close(restoreResultView = true) {
    this.modal?.classList.add("hidden");
    this.content.innerHTML = "";

    if (restoreResultView) {
      document.getElementById("resultModal")?.classList.remove("hidden");
      this.game.uiManager?.setWordProgressSquaresVisible(true);
      document.getElementById("panel")?.classList.add("hidden");
    }
  }

  getRemainingForms() {
    return getAllVerbFormSlots(this.verb)
      .filter((slot) => !this.usedSlotIds.has(slot.id))
      .map((slot) => slot.form);
  }

  getCurrentTenseKey() {
    return VERB_TENSE_KEYS[this.tenseIndex];
  }

  getCurrentPersonEntry() {
    const tenseKey = this.getCurrentTenseKey();
    const entries = getTensePersonEntries(this.verb, tenseKey);
    const person = VERB_PERSONS[this.personIndex];
    return entries.find((e) => e.person === person) || null;
  }

  render() {
    if (!this.content || !this.verb) return;

    // Invariant: while verbConjugationModal is active, competing panels must be hidden.
    // Re-enforced on every render so async or external state changes cannot leak through.
    if (this.modal && !this.modal.classList.contains("hidden")) {
      this.game.uiManager?.setWordProgressSquaresVisible(false);
      document.getElementById("resultModal")?.classList.add("hidden");
    }

    let html = "";

    this.completedTenses.forEach((block) => {
      html += this.renderTenseBlock(block, true);
    });

    if (this.phase === "done") {
      this.content.innerHTML = html;
      return;
    }

    const tenseKey = this.getCurrentTenseKey();
    if (!tenseKey) {
      this.phase = "done";
      this.render();
      return;
    }

    if (this.phase === "person") {
      html += this.renderActiveTense(tenseKey);
    }

    this.content.innerHTML = html;
    this.attachActiveInput();
  }

  renderTenseBlock(block, completed) {
    const cls = completed
      ? "verb-practice-tense verb-practice-tense--completed"
      : "verb-practice-tense";
    let html = `<section class="${cls}"><h3 class="verb-practice-tense-title">${block.label}</h3><div class="verb-practice-rows">`;

    block.solvedRows.forEach((row) => {
      html += this.renderSolvedRow(row.person, row.form, row.fa);
    });

    html += `</div>`;

    if (block.examples?.length) {
      html += this.renderExamplesSection(block.examples);
    }

    html += `</section>`;
    return html;
  }

  renderActiveTense(tenseKey) {
    const label = VERB_TENSE_LABELS[tenseKey] || tenseKey;
    let html = `<section class="verb-practice-tense"><h3 class="verb-practice-tense-title">${label}</h3><div class="verb-practice-rows">`;

    for (let i = 0; i < this.personIndex; i++) {
      const person = VERB_PERSONS[i];
      const row = this.getSolvedRowForPerson(tenseKey, person);
      if (row) {
        html += this.renderSolvedRow(row.person, row.form, row.fa);
      }
    }

    if (this.personIndex < VERB_PERSONS.length) {
      const person = VERB_PERSONS[this.personIndex];
      const entry = this.getCurrentPersonEntry();
      const listId = `verb-datalist-${tenseKey}-${this.personIndex}`;
      html += `<div class="verb-practice-row verb-practice-row--active" data-active="1">
        <span class="verb-person-label">${person}</span>
        <input
          type="text"
          class="verb-form-input"
          id="verbActiveInput"
          list="${listId}"
          autocomplete="off"
          placeholder="Form wählen oder eingeben…"
          aria-label="${person}"
        />
        <datalist id="${listId}">${this.renderDatalistOptions()}</datalist>
      </div>`;
    }

    html += `</div></section>`;
    return html;
  }

  renderSolvedRow(person, form, fa) {
    const line = `${person} ${form}`.trim();
    return `<div class="verb-practice-row verb-practice-row--done">
      <span class="verb-practice-line">${this.googleTranslateDeLink(line, "verb-practice-de")} <span class="text-gray-400">—</span> <span class="verb-practice-fa" dir="rtl">${this.escapeHtml(fa || "")}</span></span>
    </div>`;
  }

  renderExamplesSection(examples) {
    if (!examples?.length) return "";
    let html = `<div class="verb-practice-examples"><div class="verb-practice-examples-title">Beispielsätze</div>`;
    examples.forEach((ex) => {
      html += `<div class="verb-example-row">
        ${this.googleTranslateDeLink(ex.de || "", "verb-example-de")}
        <span class="verb-example-fa" dir="rtl">${this.escapeHtml(ex.fa || "")}</span>
      </div>`;
    });
    html += `</div>`;
    return html;
  }

  renderDatalistOptions() {
    const options = shuffleArray(this.getRemainingForms());
    return options
      .map((f) => `<option value="${this.escapeAttr(f)}"></option>`)
      .join("");
  }

  getSolvedRowForPerson(tenseKey, person) {
    const entries = getTensePersonEntries(this.verb, tenseKey);
    const e = entries.find((x) => x.person === person);
    if (!e) return null;
    return { person: e.person, form: e.form, fa: e.fa };
  }

  attachActiveInput() {
    const input = document.getElementById("verbActiveInput");
    if (!input) return;

    const tryAnswer = () => this.checkAnswer(input.value);
    const openCombo = (event) => {
      try {
        if (typeof input.showPicker === "function") {
          // call showPicker directly on a user click; avoid preventDefault/focus that may break gesture
          input.showPicker();
          return;
        }
      } catch (err) {
        // Some browsers throw if showPicker isn't allowed; ignore and fall back
      }

      // Fallback: focus the input and place caret at end so keyboard/autocomplete appears
      try {
        input.focus();
        const len = input.value?.length || 0;
        input.setSelectionRange(len, len);
      } catch (e) {
        /* ignore */
      }
    };

    // Use only click to avoid duplicate, non-gesture calls on pointer events
    input.addEventListener("click", openCombo);
    input.addEventListener("change", tryAnswer);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        tryAnswer();
      }
    });
    input.focus();
  }

  checkAnswer(raw) {
    const entry = this.getCurrentPersonEntry();
    if (!entry) return;

    if (normalizeForm(raw) !== normalizeForm(entry.form)) return;

    const tenseKey = this.getCurrentTenseKey();
    this.usedSlotIds.add(makeVerbSlotId(tenseKey, entry.person));
    this.personIndex++;

    if (this.personIndex >= VERB_PERSONS.length) {
      this.finishCurrentTense();
    } else {
      this.render();
    }
  }

  finishCurrentTense() {
    const tenseKey = this.getCurrentTenseKey();
    const entries = getTensePersonEntries(this.verb, tenseKey);
    const solvedRows = VERB_PERSONS.map((person) => {
      const e = entries.find((x) => x.person === person);
      return e ? { person: e.person, form: e.form, fa: e.fa } : null;
    }).filter(Boolean);

    this.completedTenses.push({
      label: VERB_TENSE_LABELS[tenseKey] || tenseKey,
      solvedRows,
      examples: getTenseExamples(this.verb, tenseKey),
    });

    this.tenseIndex++;
    this.personIndex = 0;

    if (this.tenseIndex >= VERB_TENSE_KEYS.length) {
      this.phase = "done";
    } else {
      this.phase = "person";
    }

    this.render();
  }

  googleTranslateDeLink(text, className) {
    const german = String(text || "").trim();
    if (!german) return "";
    const href = `https://translate.google.com/?sl=de&tl=fa&text=${encodeURIComponent(german)}`;
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="${className} hover:underline">${this.escapeHtml(german)}</a>`;
  }

  escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  escapeAttr(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }
}
