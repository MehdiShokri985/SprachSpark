/**
 * Emotional progress squares — chaos → order visual layer.
 * Isolated from gameplay; only reads word.sureCount and word.id.
 */

const SQUARE_PX = 12;
const GAP_PX = 11;
const MIN_CENTER_DIST = SQUARE_PX + GAP_PX;

export class WordProgressSquares {
  constructor(game, onSquareClick) {
    this.game = game;
    this.onSquareClick = onSquareClick;
    this._chaoticEl = null;
    this._organizedEl = null;
    this._previousMastered = new Set();
    this._hasRenderedOnce = false;
    this._lastComboKey = null;
    this._transitioning = new Set();
    /** @type {Map<string, { leftPx: number, topPx: number, maxDriftPx: number }>} */
    this._chaoticLayout = new Map();
    this._layoutSessionSeed = null;
  }

  _storageKey(suffix) {
    return `langgame_${suffix}_${this.game.dataSetName}_${this.game.currentNiveau}_${this.game.currentMode}`;
  }

  _getRoot() {
    return document.getElementById("wordProgressSquares");
  }

  _ensureSections(root) {
    if (root.querySelector(".wps-chaotic-area")) {
      this._chaoticEl = root.querySelector(".wps-chaotic-area");
      this._organizedEl = root.querySelector(".wps-organized-area");
      return;
    }

    root.classList.add("wps-root");
    root.innerHTML = "";
    root.classList.remove("flex", "flex-wrap", "gap-1", "justify-center");

    this._chaoticEl = document.createElement("div");
    this._chaoticEl.className = "wps-chaotic-area";

    this._organizedEl = document.createElement("div");
    this._organizedEl.className = "wps-organized-area";

    root.appendChild(this._chaoticEl);
    root.appendChild(this._organizedEl);
  }

  _hashSeed(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  _seededUnit(seed, salt) {
    const x = Math.sin(seed + salt * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }

  _jitterFromSeed(wordId, salt, min, max) {
    const t = this._seededUnit(this._hashSeed(String(wordId)), salt);
    return min + t * (max - min);
  }

  _newSessionSeed() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  _getSessionSeed(comboKey) {
    const key = `wps_layout_${comboKey}`;
    let seed = sessionStorage.getItem(key);
    if (!seed) {
      seed = this._newSessionSeed();
      sessionStorage.setItem(key, seed);
    }
    return seed;
  }

  _resetSessionLayout(comboKey) {
    sessionStorage.setItem(`wps_layout_${comboKey}`, this._newSessionSeed());
    this._chaoticLayout.clear();
    this._layoutSessionSeed = null;
  }

  _chaoticAreaHeight(count) {
    const narrow =
      typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches;
    const base = narrow ? 32 : 40;
    const cap = narrow ? 108 : 148;
    const step = narrow ? 7 : 9;
    const floor = narrow ? 46 : 58;
    return Math.max(floor, Math.min(cap, base + count * step));
  }

  _dist(ax, ay, bx, by) {
    return Math.hypot(ax - bx, ay - by);
  }

  _collides(leftPx, topPx, placed) {
    const cx = leftPx + SQUARE_PX / 2;
    const cy = topPx + SQUARE_PX / 2;
    for (const p of placed) {
      const ox = p.leftPx + SQUARE_PX / 2;
      const oy = p.topPx + SQUARE_PX / 2;
      if (this._dist(cx, cy, ox, oy) < MIN_CENTER_DIST) return true;
    }
    return false;
  }

  _gridFallback(index, count, areaW, areaH) {
    const cols = Math.max(1, Math.floor((areaW - 16) / MIN_CENTER_DIST));
    const col = index % cols;
    const row = Math.floor(index / cols);
    const leftPx = 8 + col * MIN_CENTER_DIST + (index % 3) * 2;
    const topPx = 8 + row * MIN_CENTER_DIST + (index % 2) * 2;
    return {
      leftPx: Math.min(leftPx, areaW - SQUARE_PX - 4),
      topPx: Math.min(topPx, areaH - SQUARE_PX - 4),
    };
  }

  _computeMaxDrift(leftPx, topPx, placed, selfId) {
    const cx = leftPx + SQUARE_PX / 2;
    const cy = topPx + SQUARE_PX / 2;
    let minDist = Infinity;

    for (const p of placed) {
      if (p.id === selfId) continue;
      const ox = p.leftPx + SQUARE_PX / 2;
      const oy = p.topPx + SQUARE_PX / 2;
      minDist = Math.min(minDist, this._dist(cx, cy, ox, oy));
    }

    if (!Number.isFinite(minDist)) return 9;
    const safe = (minDist - SQUARE_PX) / 2 - 3;
    return Math.max(3.5, Math.min(9, safe));
  }

  _findOpenPosition(placed, areaW, areaH, seed) {
    const margin = 6;
    const maxL = Math.max(margin, areaW - SQUARE_PX - margin);
    const maxT = Math.max(margin, areaH - SQUARE_PX - margin);

    for (let attempt = 0; attempt < 120; attempt++) {
      const leftPx =
        margin + this._seededUnit(seed, attempt * 2 + 1) * (maxL - margin);
      const topPx =
        margin + this._seededUnit(seed, attempt * 2 + 2) * (maxT - margin);
      if (!this._collides(leftPx, topPx, placed)) {
        return { leftPx, topPx };
      }
    }
    return null;
  }

  _syncChaoticLayout(activeWords, comboKey, forceNewLayout) {
    if (forceNewLayout) {
      this._resetSessionLayout(comboKey);
    }

    const sessionSeed = this._getSessionSeed(comboKey);
    if (this._layoutSessionSeed !== sessionSeed) {
      this._chaoticLayout.clear();
      this._layoutSessionSeed = sessionSeed;
    }

    const activeIds = new Set(
      activeWords.map((w) => String(w.id ?? w.word)),
    );

    for (const id of [...this._chaoticLayout.keys()]) {
      if (!activeIds.has(id)) this._chaoticLayout.delete(id);
    }

    const measured =
      this._chaoticEl?.clientWidth || this._getRoot()?.clientWidth || 0;
    const areaW = Math.max(100, measured || 300);
    const areaH = this._chaoticAreaHeight(activeWords.length);

    const placed = [];
    for (const [id, pos] of this._chaoticLayout) {
      placed.push({ id, leftPx: pos.leftPx, topPx: pos.topPx });
    }

    const shuffled = [...activeWords].sort((a, b) => {
      const sa = this._hashSeed(`${sessionSeed}-${a.id ?? a.word}`);
      const sb = this._hashSeed(`${sessionSeed}-${b.id ?? b.word}`);
      return sa - sb;
    });

    for (const word of shuffled) {
      const id = String(word.id ?? word.word);
      if (this._chaoticLayout.has(id)) continue;

      const seed = this._hashSeed(`${sessionSeed}-${id}`);
      let spot = this._findOpenPosition(placed, areaW, areaH, seed);

      if (!spot) {
        spot = this._gridFallback(placed.length, activeWords.length, areaW, areaH);
        let nudge = 0;
        while (this._collides(spot.leftPx, spot.topPx, placed) && nudge < 24) {
          spot.leftPx = Math.min(
            areaW - SQUARE_PX - 4,
            spot.leftPx + (nudge % 2 === 0 ? 3 : -3),
          );
          spot.topPx = Math.min(
            areaH - SQUARE_PX - 4,
            spot.topPx + (nudge % 3 === 0 ? 3 : -2),
          );
          nudge++;
        }
      }

      const entry = {
        leftPx: spot.leftPx,
        topPx: spot.topPx,
        maxDriftPx: 0,
      };
      placed.push({ id, ...entry });
      this._chaoticLayout.set(id, entry);
    }

    for (const [id, entry] of this._chaoticLayout) {
      entry.maxDriftPx = this._computeMaxDrift(
        entry.leftPx,
        entry.topPx,
        placed,
        id,
      );
    }

    return areaH;
  }

  getVisualState(sureCount) {
    if (sureCount >= 2) return "mastered";
    if (sureCount === 1) return "learning";
    if (sureCount === 0) return "neutral";
    if (sureCount === -1) return "warning";
    if (sureCount === -2) return "tense-2";
    return "tense-deep";
  }

  getSquareColor(sureCount) {
    if (sureCount === 0) return "rgba(156, 163, 175, 0.42)";
    if (sureCount === 1) return "#86efac";
    if (sureCount >= 2) return "#4ade80";
    if (sureCount === -1) return "#fde68a";
    if (sureCount === -2) return "#fdba74";
    const depth = Math.min(Math.abs(sureCount) - 2, 4);
    const t = depth / 4;
    const r = Math.round(251 + (220 - 251) * t);
    const g = Math.round(113 + (50 - 113) * t);
    const b = Math.round(60 + (50 - 60) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }

  _driftAmplitudeScale(visualState, sureCount) {
    if (visualState === "learning") return 0.78;
    if (visualState === "mastered") return 0.48;
    if (visualState === "warning") return 1.08;
    if (visualState === "tense-2") return 1.14;
    if (visualState === "tense-deep") {
      return 1.18 + Math.min(0.12, Math.abs(sureCount) * 0.02);
    }
    return 1;
  }

  _driftDurationScale(visualState, sureCount) {
    if (visualState === "learning") return 1.15;
    if (visualState === "mastered") return 1.32;
    if (visualState === "warning") return 0.9;
    if (visualState.startsWith("tense")) {
      return 0.8 - Math.min(0.15, Math.max(0, Math.abs(sureCount) - 2) * 0.04);
    }
    return 1;
  }

  _applyMotionVars(el, wordId, visualState, sureCount, maxDriftPx = 9) {
    const amp = this._driftAmplitudeScale(visualState, sureCount);
    const durScale = this._driftDurationScale(visualState, sureCount);
    const cap = maxDriftPx * amp;

    const baseDrift = this._jitterFromSeed(wordId, 3, 16, 22) * durScale;
    const basePulse = this._jitterFromSeed(wordId, 4, 3.2, 6.8);

    const rawDxA = this._jitterFromSeed(wordId, 5, 6, 14) * amp;
    const rawDyA = this._jitterFromSeed(wordId, 6, 5, 12) * amp;
    const rawDxB = this._jitterFromSeed(wordId, 7, -13, -5) * amp;
    const rawDyB = this._jitterFromSeed(wordId, 8, 4, 13) * amp;

    const clamp = (v) => {
      const s = Math.max(-cap, Math.min(cap, v));
      return s;
    };

    const animDelay = this._jitterFromSeed(wordId, 9, 0, 12).toFixed(2);
    const pulseDelay = this._jitterFromSeed(wordId, 10, 0, 8).toFixed(2);
    const pulseDurOffset = this._jitterFromSeed(wordId, 11, -0.9, 1.4).toFixed(2);

    el.style.setProperty("--wps-drift-dur", `${baseDrift.toFixed(1)}s`);
    el.style.setProperty(
      "--wps-pulse-dur",
      `${(basePulse + parseFloat(pulseDurOffset)).toFixed(1)}s`,
    );
    el.style.setProperty("--wps-dx-a", `${clamp(rawDxA).toFixed(1)}px`);
    el.style.setProperty("--wps-dy-a", `${clamp(rawDyA).toFixed(1)}px`);
    el.style.setProperty("--wps-dx-b", `${clamp(rawDxB).toFixed(1)}px`);
    el.style.setProperty("--wps-dy-b", `${clamp(rawDyB).toFixed(1)}px`);
    el.style.setProperty("--wps-anim-delay", `${animDelay}s`);
    el.style.setProperty("--wps-pulse-delay", `${pulseDelay}s`);
  }

  _insertOrganizedAtIndex(placeholder, sortedIds, wordId) {
    const targetIdx = sortedIds.indexOf(wordId);
    let insertBefore = null;

    for (const child of this._organizedEl.children) {
      const childId = child.dataset.wordId;
      if (!childId) continue;
      const childIdx = sortedIds.indexOf(childId);
      if (childIdx > targetIdx) {
        insertBefore = child;
        break;
      }
    }

    if (insertBefore) {
      this._organizedEl.insertBefore(placeholder, insertBefore);
    } else {
      this._organizedEl.appendChild(placeholder);
    }
  }

  _animateMasteryTransition(word, fromEl, sortedMasteredIds) {
    const id = String(word.id ?? word.word);
    if (this._transitioning.has(id)) return;

    this._transitioning.add(id);
    this._chaoticLayout.delete(id);

    const fromRect = fromEl.getBoundingClientRect();
    fromEl.remove();

    const placeholder = document.createElement("div");
    placeholder.className =
      "wps-square wps-square--organized wps-state-mastered wps-transition-placeholder";
    placeholder.dataset.wordId = id;
    this._insertOrganizedAtIndex(placeholder, sortedMasteredIds, id);

    const toRect = placeholder.getBoundingClientRect();

    const flyer = document.createElement("div");
    flyer.className = "wps-square wps-square--traveling wps-state-mastered";
    flyer.style.backgroundColor = this.getSquareColor(2);
    flyer.style.width = `${fromRect.width}px`;
    flyer.style.height = `${fromRect.height}px`;
    flyer.style.transform = `translate3d(${fromRect.left}px, ${fromRect.top}px, 0)`;
    document.body.appendChild(flyer);

    const dx =
      toRect.left + toRect.width / 2 - (fromRect.left + fromRect.width / 2);
    const dy =
      toRect.top + toRect.height / 2 - (fromRect.top + fromRect.height / 2);
    const scale = Math.min(
      1.15,
      Math.max(0.85, toRect.width / Math.max(fromRect.width, 1)),
    );

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      flyer.remove();
      placeholder.remove();
      this._transitioning.delete(id);
      this._createOrUpdateSquare(word, { zone: "organized" });
    };

    const run = () => {
      flyer.classList.add("wps-square--traveling-active");
      flyer.style.transform = `translate3d(${fromRect.left + dx}px, ${fromRect.top + dy}px, 0) scale(${scale})`;
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }

    requestAnimationFrame(() => requestAnimationFrame(run));

    flyer.addEventListener("transitionend", finish, { once: true });
    setTimeout(finish, 1300);
  }

  _createOrUpdateSquare(word, { zone }) {
    const sureCount = word.sureCount || 0;
    const visualState = this.getVisualState(sureCount);
    const stateClass = `wps-state-${visualState}`;
    const id = String(word.id ?? word.word);

    const parent = zone === "organized" ? this._organizedEl : this._chaoticEl;
    let el = parent.querySelector(`[data-word-id="${CSS.escape(id)}"]`);

    if (!el) {
      el = document.createElement("div");
      el.dataset.wordId = id;
      el.className = "wps-square";
      el.addEventListener("click", () => this.onSquareClick(word));
      parent.appendChild(el);
    }

    const zoneClass =
      zone === "organized" ? "wps-square--organized" : "wps-square--chaotic";
    el.className = `wps-square ${zoneClass} ${stateClass}`.trim();
    el.style.backgroundColor = this.getSquareColor(sureCount);

    const layoutEntry = this._chaoticLayout.get(id);
    const maxDrift = layoutEntry?.maxDriftPx ?? 9;
    this._applyMotionVars(el, id, visualState, sureCount, maxDrift);

    if (zone === "chaotic" && layoutEntry) {
      el.style.left = `${layoutEntry.leftPx}px`;
      el.style.top = `${layoutEntry.topPx}px`;
    } else {
      el.style.left = "";
      el.style.top = "";
    }

    return el;
  }

  render(levelWords) {
    const root = this._getRoot();
    if (!root) return;

    this._ensureSections(root);

    const comboKey = this._storageKey("combo");
    const comboChanged = this._lastComboKey !== comboKey;
    if (comboChanged) {
      this._lastComboKey = comboKey;
      this._previousMastered = new Set();
      this._hasRenderedOnce = false;
      this._transitioning.clear();
    }

    const active = [];
    const mastered = [];

    levelWords.forEach((word) => {
      if ((word.sureCount || 0) >= 2) mastered.push(word);
      else active.push(word);
    });

    mastered.sort((a, b) =>
      String(a.id ?? a.word).localeCompare(String(b.id ?? b.word), undefined, {
        numeric: true,
      }),
    );

    const sortedMasteredIds = mastered.map((w) => String(w.id ?? w.word));

    const areaH = this._syncChaoticLayout(active, comboKey, comboChanged);

    const nextMastered = new Set(sortedMasteredIds);
    const newlyMastered = new Set();
    if (this._hasRenderedOnce) {
      nextMastered.forEach((id) => {
        if (!this._previousMastered.has(id)) newlyMastered.add(id);
      });
    }
    this._previousMastered = nextMastered;
    this._hasRenderedOnce = true;

    const activeIds = new Set();
    active.forEach((word) => {
      const id = String(word.id ?? word.word);
      activeIds.add(id);
      this._createOrUpdateSquare(word, { zone: "chaotic" });
    });

    newlyMastered.forEach((id) => {
      const chaoticEl = this._chaoticEl.querySelector(
        `[data-word-id="${CSS.escape(id)}"]`,
      );
      const word = mastered.find((w) => String(w.id ?? w.word) === id);
      if (chaoticEl && word) {
        this._animateMasteryTransition(word, chaoticEl, sortedMasteredIds);
      }
    });

    const masteredIds = new Set();
    mastered.forEach((word) => {
      const id = String(word.id ?? word.word);
      masteredIds.add(id);
      if (this._transitioning.has(id)) return;
      this._createOrUpdateSquare(word, { zone: "organized" });
    });

    this._pruneOrphans(this._chaoticEl, activeIds);

    const organizedKeep = new Set([...masteredIds, ...this._transitioning]);
    this._pruneOrphans(this._organizedEl, organizedKeep);

    this._chaoticEl.style.minHeight = active.length ? `${areaH}px` : "";
  }

  _pruneOrphans(container, keepIds) {
    container.querySelectorAll("[data-word-id]").forEach((el) => {
      if (!keepIds.has(el.dataset.wordId)) el.remove();
    });
  }
}
