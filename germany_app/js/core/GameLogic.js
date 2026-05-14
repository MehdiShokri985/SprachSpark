/**
 * منطق اصلی انتخاب کلمه و نوع سوال (بدون وابستگی به UI)
 * Core game logic: word selection and question type determination
 */

export class GameLogic {
  constructor(words) {
    this.words = words;
  }

  selectNextWord(currentNiveau, currentState) {
    const levelWords = this.words.filter(w => (w.level || "A1") === currentNiveau);
    const activeWords = levelWords.filter(w => (w.sureCount || 0) < 2);
    if (activeWords.length === 0) return null;

    const dueWords = activeWords.filter(w => w.dueIn <= 0);
    const candidateWords = dueWords.length > 0 ? dueWords : activeWords;

    let availableWords = candidateWords.filter(w => w.id !== currentState.lastWordId);
    if (availableWords.length === 0) availableWords = candidateWords;

    const newWords = availableWords.filter(w => w.seenCount === 0);
    const reviewWords = availableWords.filter(w => w.seenCount > 0);

    const questionPosition = currentState.totalQuestions % 4;
    let selectedPool = (questionPosition === 0 && newWords.length > 0) ? newWords : (reviewWords.length > 0 ? reviewWords : newWords);

    
    selectedPool.sort((a, b) => {
      if (a.strength !== b.strength) return a.strength - b.strength;
      if (a.mistakeCount !== b.mistakeCount) return b.mistakeCount - a.mistakeCount;
      return a.seenCount - b.seenCount;
    });

    let selected = selectedPool[0];
    if (selected && selected.id === currentState.lastWordId && selectedPool.length > 1) {
      selected = selectedPool.find(w => w.id !== currentState.lastWordId) || selected;
    }
    return selected;
  }

   determineQuestionType(word) {
          const s = word.strength;
          this.questionCounter = (this.questionCounter || 0) + 1;

          if (this.lastFaToDeIndex > 4) {
            this.lastFaToDeIndex = 0;
            return !word.sentences || word.sentences.length === 0 ? { type: "de_to_fa", showWord: true } : { type: "fa_to_de", showWord: true };
          }

          let mode;
          const rand = Math.random();
          if (s < 0.4) mode = rand < 0.6 ? "de_to_fa" : "word_with_sentence";
          else if (s < 0.7) {
            if (rand < 0.4) mode = "de_to_fa";
            else if (rand < 0.8) mode = "word_with_sentence";
            else mode = "fa_to_de";
          } else {
            if (rand < 0.4) mode = "fa_to_de";
            else if (rand < 0.8) mode = "sentence_only";
            else mode = "word_with_sentence";
          }

          if ((mode === "word_with_sentence" || mode === "sentence_only") && (!word.sentences || word.sentences.length === 0)) {
            mode = "de_to_fa";
          }

          if (mode === "fa_to_de") this.lastFaToDeIndex = 0;
          else this.lastFaToDeIndex++;

          const result = {
            de_to_fa: () => ({ type: "de_to_fa", showWord: true }),
            word_with_sentence: () => ({ type: "word_with_sentence", showSentence: true }),
            fa_to_de: () => ({ type: "fa_to_de", showWord: true }),
            sentence_only: () => ({ type: "sentence_only", showSentence: true, isSentence: true }),
          }[mode]();

          return result;
        }
}