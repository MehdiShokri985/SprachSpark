/**
 * مدیریت وضعیت‌های ایزوله برای هر ترکیب سطح + حالت + نوع داده
 * Isolated state manager for each (niveau + mode + dataset) combination
 */

import { CONFIG } from "../config.js";

export class StateManager {
  constructor(dataSetName = "adjektive") {
    this.dataSetName = dataSetName;
    this.allStates = {};
  }

  getStateKey(niveau, mode) {
    return `${this.dataSetName}_${niveau}_${mode}`;

  }

  getFullStorageKey(niveau, mode) {
    return `${CONFIG.STORAGE_PREFIX}state_${this.getStateKey(niveau, mode)}`;
  }

  getCurrentState(niveau, mode) {
    const key = this.getStateKey(niveau, mode);
    if (!this.allStates[key]) {
      const saved = localStorage.getItem(this.getFullStorageKey(niveau, mode));
      this.allStates[key] = saved ? JSON.parse(saved) : this.createNewState();
    }
    return this.allStates[key];
  }

  createNewState() {
    return {
      score: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      lastWordId: null,
      progress: 0,
      sessionNumber: 1,
      mistakes: [],
       correctAnswersList: []
    };
  }

  saveState(niveau, mode) {
    const key = this.getStateKey(niveau, mode);
    const state = this.allStates[key];
    if (state) {
      localStorage.setItem(this.getFullStorageKey(niveau, mode), JSON.stringify(state));
    }
  }

  resetProgress(niveau, mode) {
    const key = this.getStateKey(niveau, mode);
    localStorage.removeItem(this.getFullStorageKey(niveau, mode));
    delete this.allStates[key];
  }
}