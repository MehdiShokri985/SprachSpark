/**
 * مدیریت بارگذاری و ذخیره‌سازی داده‌ها
 * Data loading and persistence manager
 */

import { CONFIG } from "../config.js";

export class DataManager {
  constructor(dataSetName = "adjektive") {
    this.dataSetName = dataSetName;
    // this.storageKeyWords = `${CONFIG.STORAGE_PREFIX}words_${dataSetName}`;
  }

   getStorageKeyWords(niveau, mode) {
    return `${CONFIG.STORAGE_PREFIX}words_${this.dataSetName}_${niveau}_${mode}`;
  }

  /**
   * بارگذاری کلمات از localStorage یا فایل JSON
   * Load words from localStorage or JSON file
   */
//   async loadWords(jsonPath) {
  async loadWords(jsonPath, niveau, mode) {
    try {
    //   const savedWords = localStorage.getItem(this.storageKeyWords);
    const savedWords = localStorage.getItem(this.getStorageKeyWords(niveau, mode));
      if (savedWords) {
        return JSON.parse(savedWords);
      }

      const response = await fetch(jsonPath);
      let words = await response.json();

      // نرمال‌سازی داده‌ها
      words = words.map(word => {
        const normalized = { ...word };
        if (normalized.strength === undefined) normalized.strength = 0.3;
        normalized.dueIn = normalized.dueIn ?? 0;
        normalized.seenCount = normalized.seenCount ?? 0;
        normalized.mistakeCount = normalized.mistakeCount ?? 0;
        normalized.correctStreak = normalized.correctStreak ?? 0;
        normalized.sureCount = normalized.sureCount ?? 0;

        if (normalized.sentences) {
          normalized.sentences = normalized.sentences.map(s => ({
            ...s,
            strength: typeof s.strength === "number" ? s.strength : 0.3,
            dueIn: s.dueIn ?? 0,
            mistakeCount: s.mistakeCount ?? 0,
            seenCount: s.seenCount ?? 0,
            correctStreak: s.correctStreak ?? 0,
            sureCount: s.sureCount ?? 0,
          }));
        }
        return normalized;
      });

    //   this.saveWords(words);
    this.saveWords(words, niveau, mode);
      return words;
    } catch (error) {
      console.error("Error loading words:", error);
      throw error;
    }
  }

//   saveWords(words) {
//     localStorage.setItem(this.storageKeyWords, JSON.stringify(words));
 saveWords(words, niveau, mode) {
    localStorage.setItem(this.getStorageKeyWords(niveau, mode), JSON.stringify(words));
  }
}