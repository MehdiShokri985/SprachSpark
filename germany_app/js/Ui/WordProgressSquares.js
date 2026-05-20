/**
 * Emotional progress squares — chaos → shape visual layer.
 * Isolated from gameplay; only reads word.sureCount and word.id.
 */

const SQUARE_PX = 12;
const GAP_PX = 11;
const MIN_CENTER_DIST = SQUARE_PX + GAP_PX;
const SHAPE_POOL_LARGE = [
  "mandala",
  "flower",
  "infinity",
  "star",
  "hex",
  "wing",
  "constellation",
  "spiral",
];
const SHAPE_POOL_MEDIUM = [
  "flower",
  "orbit",
  "star",
  "hex",
  "heart",
  "infinity",
  "wave",
  "diamond",
];
const SHAPE_POOL_SMALL = ["triangle", "orbit", "curve", "diamond"];

export class WordProgressSquares {
  constructor(game, onSquareClick) {
    this.game = game;
    this.onSquareClick = onSquareClick;
    this._chaoticEl = null;
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
      root.querySelector(".wps-organized-area")?.remove();
      return;
    }

    root.classList.add("wps-root");
    root.innerHTML = "";
    root.classList.remove("flex", "flex-wrap", "gap-1", "justify-center");

    this._chaoticEl = document.createElement("div");
    this._chaoticEl.className = "wps-chaotic-area";
    root.appendChild(this._chaoticEl);
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

  _shapePoolForCount(count) {
    if (count <= 1) return ["dot"];
    if (count === 2) return ["line"];
    if (count === 3) return ["triangle", "orbit"];
    if (count <= 6) return SHAPE_POOL_SMALL;
    if (count <= 14) return SHAPE_POOL_MEDIUM;
    return SHAPE_POOL_LARGE;
  }

  _pickRandomShape(count) {
    const pool = this._shapePoolForCount(count);
    return pool[Math.floor(Math.random() * pool.length)];
  }

  _getSessionShape(comboKey, count) {
    const key = `wps_shape_${comboKey}`;
    const pool = this._shapePoolForCount(count);
    let shape = sessionStorage.getItem(key);
    if (!shape || !pool.includes(shape)) {
      shape = this._pickRandomShape(count);
      sessionStorage.setItem(key, shape);
    }
    return shape;
  }

  _resetSessionLayout(comboKey, count) {
    sessionStorage.setItem(`wps_layout_${comboKey}`, this._newSessionSeed());
    sessionStorage.setItem(`wps_shape_${comboKey}`, this._pickRandomShape(count));
    this._chaoticLayout.clear();
    this._layoutSessionSeed = null;
  }

  _isNarrow() {
    return (
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 640px)").matches
    );
  }

  _areaHeightForLayout(activeCount, totalCount) {
    const narrow = this._isNarrow();
    const base = narrow ? 24 : 32;
    const cap = narrow ? 88 : 120;
    const step = narrow ? 5 : 7;
    const floor = narrow ? 36 : 46;
    const shapeSpan =
      totalCount <= 1
        ? 22
        : MIN_CENTER_DIST * (1.85 + Math.sqrt(totalCount) * 0.82);
    const activePart =
      activeCount > 0 ? Math.max(floor, Math.min(cap, base + activeCount * step)) : 0;

    if (totalCount === 0) return floor;
    if (activeCount === 0) return Math.max(floor, shapeSpan + 8);
    return Math.max(activePart, activePart * 0.38 + shapeSpan + 8);
  }

  _distributeOnPath(count, vertices) {
    if (count <= 0) return [];
    const segments = [];
    let totalLen = 0;
    for (let i = 0; i < vertices.length; i++) {
      const a = vertices[i];
      const b = vertices[(i + 1) % vertices.length];
      const len = Math.hypot(b.nx - a.nx, b.ny - a.ny) || 0.001;
      segments.push({ a, b, len, start: totalLen });
      totalLen += len;
    }
    const result = [];
    for (let i = 0; i < count; i++) {
      let d = ((i + 0.5) / count) * totalLen;
      if (d >= totalLen) d -= totalLen;
      let seg = segments[0];
      for (const s of segments) {
        if (d >= s.start && d < s.start + s.len) {
          seg = s;
          break;
        }
      }
      const local = (d - seg.start) / seg.len;
      result.push({
        nx: seg.a.nx + (seg.b.nx - seg.a.nx) * local,
        ny: seg.a.ny + (seg.b.ny - seg.a.ny) * local,
      });
    }
    return result;
  }

  /**
   * Evenly space points along a smooth parametric curve (arc-length sampling).
   */
  _sampleArcCurve(count, fn, closed = true) {
    if (count <= 0) return [];
    const steps = Math.max(96, count * 10);
    const dense = [];
    for (let i = 0; i <= steps; i++) {
      dense.push(fn(i / steps));
    }
    const lengths = [0];
    for (let i = 1; i < dense.length; i++) {
      lengths.push(
        lengths[i - 1] +
          Math.hypot(
            dense[i].nx - dense[i - 1].nx,
            dense[i].ny - dense[i - 1].ny,
          ),
      );
    }
    if (closed) {
      const closing =
        Math.hypot(
          dense[0].nx - dense[dense.length - 1].nx,
          dense[0].ny - dense[dense.length - 1].ny,
        ) || 0.001;
      lengths.push(lengths[lengths.length - 1] + closing);
      dense.push({ ...dense[0] });
    }
    const total = lengths[lengths.length - 1] || 0.001;
    const result = [];
    for (let i = 0; i < count; i++) {
      let target = ((i + 0.5) / count) * total;
      if (target >= total) target -= total;
      let idx = 0;
      while (idx < lengths.length - 1 && lengths[idx + 1] < target) idx++;
      const segLen = Math.max(lengths[idx + 1] - lengths[idx], 0.0001);
      const local = (target - lengths[idx]) / segLen;
      const a = dense[idx];
      const b = dense[Math.min(idx + 1, dense.length - 1)];
      result.push({
        nx: a.nx + (b.nx - a.nx) * local,
        ny: a.ny + (b.ny - a.ny) * local,
      });
    }
    return result;
  }

  _sampleOrbit(count) {
    if (count <= 3) {
      return this._distributeOnPath(count, [
        { nx: 0, ny: -0.72 },
        { nx: 0.64, ny: 0.42 },
        { nx: -0.64, ny: 0.42 },
      ]);
    }
    const rings = count <= 6 ? 2 : 3;
    const pts = [];
    let remaining = count;
    for (let ring = 1; ring <= rings; ring++) {
      const onRing =
        ring === rings ? remaining : Math.max(1, Math.round(count / (rings + 0.4)));
      remaining -= onRing;
      const r = (ring / rings) * 0.78;
      for (let i = 0; i < onRing; i++) {
        const angle = (i / onRing) * Math.PI * 2 - Math.PI / 2 + ring * 0.18;
        pts.push({ nx: r * Math.cos(angle), ny: r * Math.sin(angle) });
      }
    }
    return pts.slice(0, count);
  }

  _sampleFlower(count) {
    const petals = count <= 8 ? 5 : count <= 16 ? 6 : 8;
    return this._sampleArcCurve(count, (t) => {
      const theta = t * Math.PI * 2 - Math.PI / 2;
      const r = 0.22 + 0.58 * Math.abs(Math.cos((petals * theta) / 2));
      return { nx: r * Math.cos(theta), ny: r * Math.sin(theta) };
    });
  }

  _sampleMandala(count, comboKey) {
    const golden = Math.PI * (3 - Math.sqrt(5));
    const phase = this._seededUnit(this._hashSeed(comboKey), 88) * Math.PI * 2;
    const pts = [];
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count;
      const r = 0.14 + 0.78 * Math.pow(t, 0.62);
      const angle = phase + i * golden;
      pts.push({ nx: r * Math.cos(angle), ny: r * Math.sin(angle) });
    }
    return pts;
  }

  _sampleHex(count) {
    const verts = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
      verts.push({ nx: Math.cos(a), ny: Math.sin(a) });
    }
    if (count <= 6) return this._distributeOnPath(count, verts);
    const outer = Math.max(6, Math.ceil(count * 0.58));
    const inner = count - outer;
    const outerPts = this._distributeOnPath(outer, verts);
    const innerPts = this._sampleArcCurve(Math.max(0, inner), (t) => {
      const theta = t * Math.PI * 2;
      const r = 0.4;
      return { nx: r * Math.cos(theta), ny: r * Math.sin(theta) };
    });
    return [...outerPts, ...innerPts];
  }

  _sampleInfinity(count) {
    return this._sampleArcCurve(count, (t) => {
      const theta = t * Math.PI * 2;
      const denom = 1 + Math.sin(theta) ** 2;
      const scale = 0.72 / denom;
      return {
        nx: scale * Math.cos(theta),
        ny: scale * Math.sin(theta) * Math.cos(theta),
      };
    });
  }

  _sampleWing(count) {
    return this._sampleArcCurve(count, (t) => {
      const theta = t * Math.PI * 2 - Math.PI / 2;
      const r =
        0.52 +
        0.28 * Math.cos(2 * theta) +
        0.14 * Math.sin(3 * theta);
      return { nx: r * Math.cos(theta), ny: r * Math.sin(theta) * 0.82 };
    });
  }

  _sampleHeart(count) {
    return this._sampleArcCurve(count, (t) => {
      const theta = t * Math.PI * 2;
      const sx = 16 * Math.pow(Math.sin(theta), 3);
      const sy = -(
        13 * Math.cos(theta) -
        5 * Math.cos(2 * theta) -
        2 * Math.cos(3 * theta) -
        Math.cos(4 * theta)
      );
      return { nx: sx / 17, ny: sy / 17 };
    });
  }

  _sampleStarPath(count) {
    const points = count <= 10 ? 5 : 7;
    return this._sampleArcCurve(count, (t) => {
      const theta = t * Math.PI * 2 - Math.PI / 2;
      const r = 0.38 + 0.52 * Math.abs(Math.cos((points * theta) / 2));
      return { nx: r * Math.cos(theta), ny: r * Math.sin(theta) };
    });
  }

  _sampleWave(count) {
    const pts = [];
    for (let i = 0; i < count; i++) {
      const t = count <= 1 ? 0.5 : i / (count - 1);
      pts.push({
        nx: -0.88 + t * 1.76,
        ny: 0.38 * Math.sin(t * Math.PI * 2),
      });
    }
    return pts;
  }

  _sampleSpiral(count) {
    const golden = Math.PI * (3 - Math.sqrt(5));
    const pts = [];
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count;
      const r = 0.12 + 0.82 * Math.pow(t, 0.72);
      const angle = i * golden - Math.PI / 2;
      pts.push({ nx: r * Math.cos(angle), ny: r * Math.sin(angle) });
    }
    return pts;
  }

  _sampleCurve(count) {
    const pts = [];
    for (let i = 0; i < count; i++) {
      const t = count <= 1 ? 0.5 : i / (count - 1);
      pts.push({
        nx: -0.75 + t * 1.5,
        ny: -0.55 * Math.sin(t * Math.PI),
      });
    }
    return pts;
  }

  _sampleConstellation(count, comboKey) {
    const seed = this._hashSeed(comboKey);
    const rings = Math.min(4, Math.max(2, Math.round(Math.sqrt(count / 4))));
    const pts = [];
    let assigned = 0;
    for (let ring = 1; ring <= rings; ring++) {
      const onRing =
        ring === rings
          ? count - assigned
          : Math.max(1, Math.round((count * ring) / ((rings * (rings + 1)) / 2)));
      assigned += onRing;
      const r = (ring / rings) * 0.76;
      const twist = (ring - 1) * 0.22 + this._seededUnit(seed, ring) * 0.35;
      for (let i = 0; i < onRing; i++) {
        const angle = (i / onRing) * Math.PI * 2 - Math.PI / 2 + twist;
        pts.push({ nx: r * Math.cos(angle), ny: r * Math.sin(angle) });
      }
    }
    return pts.slice(0, count);
  }

  _normalizedShapePoints(shape, count, comboKey = "") {
    if (count <= 0) return [];
    if (count === 1) return [{ nx: 0, ny: 0 }];
    if (shape === "line" || count === 2) {
      return [
        { nx: -0.55, ny: 0 },
        { nx: 0.55, ny: 0 },
      ].slice(0, count);
    }
    if (shape === "curve") return this._sampleCurve(count);
    if (shape === "orbit") return this._sampleOrbit(count);
    if (shape === "flower") return this._sampleFlower(count);
    if (shape === "mandala") return this._sampleMandala(count, comboKey);
    if (shape === "hex") return this._sampleHex(count);
    if (shape === "infinity") return this._sampleInfinity(count);
    if (shape === "wing") return this._sampleWing(count);
    if (shape === "triangle") {
      return this._distributeOnPath(count, [
        { nx: 0, ny: -0.82 },
        { nx: 0.78, ny: 0.62 },
        { nx: -0.78, ny: 0.62 },
      ]);
    }
    if (shape === "wave") return this._sampleWave(count);
    if (shape === "spiral") return this._sampleSpiral(count);
    if (shape === "constellation") return this._sampleConstellation(count, comboKey);
    if (shape === "heart") return this._sampleHeart(count);
    if (shape === "star") return this._sampleStarPath(count);
    if (shape === "diamond") {
      return this._sampleArcCurve(count, (t) => {
        const theta = t * Math.PI * 2 - Math.PI / 2;
        const r = 0.78 / (Math.abs(Math.cos(theta)) + Math.abs(Math.sin(theta)));
        return { nx: r * Math.cos(theta), ny: r * Math.sin(theta) };
      });
    }
    return this._sampleArcCurve(count, (t) => {
      const theta = t * Math.PI * 2 - Math.PI / 2;
      return { nx: 0.82 * Math.cos(theta), ny: 0.82 * Math.sin(theta) };
    });
  }

  _computeShapeLayout(count, areaW, areaH, comboKey) {
    if (count <= 0) return [];

    const pad = 7;
    const usableW = Math.max(40, areaW - pad * 2 - SQUARE_PX);
    const usableH = Math.max(28, areaH - pad * 2 - SQUARE_PX);
    const cx = areaW / 2;
    const cy = areaH / 2;

    const shape = this._getSessionShape(comboKey, count);
    const norm = this._normalizedShapePoints(shape, count, comboKey);

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const p of norm) {
      minX = Math.min(minX, p.nx);
      maxX = Math.max(maxX, p.nx);
      minY = Math.min(minY, p.ny);
      maxY = Math.max(maxY, p.ny);
    }
    const bw = Math.max(maxX - minX, 0.01);
    const bh = Math.max(maxY - minY, 0.01);
    const scale = Math.min(usableW / bw, usableH / bh) * 0.92;
    const midNx = (minX + maxX) / 2;
    const midNy = (minY + maxY) / 2;
    const margin = 4;

    return norm.map((p) => ({
      leftPx: Math.max(
        margin,
        Math.min(
          areaW - SQUARE_PX - margin,
          cx + (p.nx - midNx) * scale - SQUARE_PX / 2,
        ),
      ),
      topPx: Math.max(
        margin,
        Math.min(
          areaH - SQUARE_PX - margin,
          cy + (p.ny - midNy) * scale - SQUARE_PX / 2,
        ),
      ),
    }));
  }

  _shapeBottomExtent(positions) {
    if (!positions.length) return 0;
    return Math.max(...positions.map((p) => p.topPx + SQUARE_PX));
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

    if (!Number.isFinite(minDist)) return 11;
    const safe = (minDist - SQUARE_PX) / 2 - 2;
    return Math.max(4, Math.min(12, safe));
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

  _syncChaoticLayout(
    activeWords,
    comboKey,
    forceNewLayout,
    blocked,
    areaH,
    wordCount,
  ) {
    if (forceNewLayout) {
      this._resetSessionLayout(comboKey, wordCount);
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

    const placed = blocked.map((p, i) => ({
      id: `__shape_${i}`,
      leftPx: p.leftPx,
      topPx: p.topPx,
    }));

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
        spot = this._gridFallback(
          placed.length,
          activeWords.length,
          areaW,
          areaH,
        );
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

    return { areaW, areaH };
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
    if (visualState === "learning") return 0.92;
    if (visualState === "mastered") return 0.32;
    if (visualState === "warning") return 1.22;
    if (visualState === "tense-2") return 1.28;
    if (visualState === "tense-deep") {
      return 1.32 + Math.min(0.14, Math.abs(sureCount) * 0.025);
    }
    return 1.12;
  }

  _driftDurationScale(visualState, sureCount) {
    if (visualState === "learning") return 1.05;
    if (visualState === "mastered") return 1.45;
    if (visualState === "warning") return 0.78;
    if (visualState.startsWith("tense")) {
      return 0.72 - Math.min(0.12, Math.max(0, Math.abs(sureCount) - 2) * 0.035);
    }
    return 0.88;
  }

  _applyMotionVars(el, wordId, visualState, sureCount, maxDriftPx = 11) {
    const amp = this._driftAmplitudeScale(visualState, sureCount);
    const durScale = this._driftDurationScale(visualState, sureCount);
    const cap = maxDriftPx * amp;

    const baseDrift = this._jitterFromSeed(wordId, 3, 11, 17) * durScale;
    const basePulse = this._jitterFromSeed(wordId, 4, 2.4, 5.2);

    const rawDxA = this._jitterFromSeed(wordId, 5, 8, 18) * amp;
    const rawDyA = this._jitterFromSeed(wordId, 6, 7, 16) * amp;
    const rawDxB = this._jitterFromSeed(wordId, 7, -17, -6) * amp;
    const rawDyB = this._jitterFromSeed(wordId, 8, 6, 17) * amp;

    const clamp = (v) => Math.max(-cap, Math.min(cap, v));

    const animDelay = this._jitterFromSeed(wordId, 9, 0, 10).toFixed(2);
    const pulseDelay = this._jitterFromSeed(wordId, 10, 0, 7).toFixed(2);
    const pulseDurOffset = this._jitterFromSeed(wordId, 11, -0.7, 1.1).toFixed(
      2,
    );

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

  _applyEnsembleMotion(el, comboKey) {
    const seed = this._hashSeed(comboKey);
    const dur = 24 + this._seededUnit(seed, 20) * 10;
    const dx = 1.8 + this._seededUnit(seed, 21) * 1.6;
    const dy = 1.2 + this._seededUnit(seed, 22) * 1.4;
    el.style.setProperty("--wps-ensemble-dur", `${dur.toFixed(1)}s`);
    el.style.setProperty("--wps-ensemble-dx", `${dx.toFixed(2)}px`);
    el.style.setProperty("--wps-ensemble-dy", `${(-dy).toFixed(2)}px`);
  }

  _clearEnsembleMotion(el) {
    el.style.removeProperty("--wps-ensemble-dur");
    el.style.removeProperty("--wps-ensemble-dx");
    el.style.removeProperty("--wps-ensemble-dy");
  }

  _applySettledMotionVars(el, wordId, living = false, memberIndex = 0, memberTotal = 1) {
    if (living) {
      const phase = memberTotal > 0 ? memberIndex / memberTotal : 0;
      el.style.setProperty("--wps-member-phase", phase.toFixed(4));
      el.style.setProperty(
        "--wps-pulse-dur",
        `${(5.8 + (memberIndex % 7) * 0.12).toFixed(1)}s`,
      );
      el.style.setProperty("--wps-dx-a", "0px");
      el.style.setProperty("--wps-dy-a", "0px");
      el.style.setProperty("--wps-dx-b", "0px");
      el.style.setProperty("--wps-dy-b", "0px");
      el.style.setProperty("--wps-op-min", "0.66");
      el.style.setProperty("--wps-op-max", "1");
      el.style.setProperty("--wps-br-min", "0.94");
      el.style.setProperty("--wps-br-max", "1.08");
      el.style.setProperty(
        "--wps-pulse-delay",
        `${(-phase * 6).toFixed(2)}s`,
      );
      return;
    }

    const micro = this._jitterFromSeed(wordId, 12, 1.2, 2.6);
    const driftBase = 30;
    el.style.setProperty("--wps-drift-dur", `${(driftBase + micro).toFixed(1)}s`);
    el.style.setProperty(
      "--wps-pulse-dur",
      `${this._jitterFromSeed(wordId, 13, 7.5, 10.5).toFixed(1)}s`,
    );
    el.style.setProperty("--wps-dx-a", `${micro.toFixed(1)}px`);
    el.style.setProperty("--wps-dy-a", `${(micro * 0.75).toFixed(1)}px`);
    el.style.setProperty("--wps-dx-b", `${(-micro * 0.9).toFixed(1)}px`);
    el.style.setProperty("--wps-dy-b", `${(micro * 0.95).toFixed(1)}px`);
    el.style.setProperty("--wps-op-min", "0.7");
    el.style.setProperty("--wps-op-max", "0.96");
    el.style.setProperty("--wps-br-min", "0.95");
    el.style.setProperty("--wps-br-max", "1.06");
    el.style.setProperty(
      "--wps-anim-delay",
      `${this._jitterFromSeed(wordId, 14, 0, 6).toFixed(2)}s`,
    );
    el.style.setProperty(
      "--wps-pulse-delay",
      `${this._jitterFromSeed(wordId, 15, 0, 5).toFixed(2)}s`,
    );
  }

  _animateMasteryTransition(word, fromEl, targetPos) {
    const id = String(word.id ?? word.word);
    if (this._transitioning.has(id)) return;

    this._transitioning.add(id);
    this._chaoticLayout.delete(id);

    const fromRect = fromEl.getBoundingClientRect();
    fromEl.remove();

    const placeholder = document.createElement("div");
    placeholder.className =
      "wps-square wps-square--settled wps-state-mastered wps-transition-placeholder";
    placeholder.dataset.wordId = id;
    placeholder.style.left = `${targetPos.leftPx}px`;
    placeholder.style.top = `${targetPos.topPx}px`;
    this._chaoticEl.appendChild(placeholder);

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
      1.12,
      Math.max(0.88, toRect.width / Math.max(fromRect.width, 1)),
    );

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      flyer.remove();
      placeholder.remove();
      this._transitioning.delete(id);
      this._createOrUpdateSquare(word, {
        settled: true,
        position: targetPos,
        living: false,
      });
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
    setTimeout(finish, 1400);
  }

  _createOrUpdateSquare(
    word,
    {
      settled = false,
      position = null,
      living = false,
      memberIndex = 0,
      memberTotal = 1,
    } = {},
  ) {
    const sureCount = word.sureCount || 0;
    const visualState = this.getVisualState(sureCount);
    const stateClass = `wps-state-${visualState}`;
    const id = String(word.id ?? word.word);

    let el = this._chaoticEl.querySelector(`[data-word-id="${CSS.escape(id)}"]`);

    if (!el) {
      el = document.createElement("div");
      el.dataset.wordId = id;
      el.className = "wps-square";
      el.addEventListener("click", () => this.onSquareClick(word));
      this._chaoticEl.appendChild(el);
    }

    const modeClass = settled ? "wps-square--settled" : "wps-square--chaotic";
    const livingClass = settled && living ? "wps-square--living" : "";
    el.className = `wps-square ${modeClass} ${livingClass} ${stateClass}`.trim();
    el.style.backgroundColor = this.getSquareColor(sureCount);

    if (settled && position) {
      el.style.left = `${position.leftPx}px`;
      el.style.top = `${position.topPx}px`;
      this._applySettledMotionVars(el, id, living, memberIndex, memberTotal);
    } else {
      const layoutEntry = this._chaoticLayout.get(id);
      const maxDrift = layoutEntry?.maxDriftPx ?? 11;
      this._applyMotionVars(el, id, visualState, sureCount, maxDrift);
      if (layoutEntry) {
        el.style.left = `${layoutEntry.leftPx}px`;
        el.style.top = `${layoutEntry.topPx}px`;
      } else {
        el.style.left = "";
        el.style.top = "";
      }
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

    const allSorted = [...levelWords].sort((a, b) =>
      String(a.id ?? a.word).localeCompare(String(b.id ?? b.word), undefined, {
        numeric: true,
      }),
    );
    const indexById = new Map(
      allSorted.map((w, i) => [String(w.id ?? w.word), i]),
    );

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

    const progressReset =
      this._hasRenderedOnce &&
      this._previousMastered.size > 0 &&
      mastered.length === 0;
    const forceNewLayout = comboChanged || progressReset;

    const measured =
      this._chaoticEl?.clientWidth || root.clientWidth || 0;
    const areaW = Math.max(100, measured || 300);

    let areaH = this._areaHeightForLayout(active.length, allSorted.length);
    let shapePositions = this._computeShapeLayout(
      allSorted.length,
      areaW,
      areaH,
      comboKey,
    );
    const shapeBottom = this._shapeBottomExtent(shapePositions);
    if (shapeBottom + 6 > areaH) {
      areaH = shapeBottom + 8;
      shapePositions = this._computeShapeLayout(
        allSorted.length,
        areaW,
        areaH,
        comboKey,
      );
    }

    const blocked = mastered
      .map((w) => {
        const idx = indexById.get(String(w.id ?? w.word));
        return idx !== undefined ? shapePositions[idx] : null;
      })
      .filter(Boolean);

    const shapeComplete =
      allSorted.length > 0 &&
      active.length === 0 &&
      mastered.length === allSorted.length;

    this._chaoticEl.classList.toggle("wps-chaotic-area--living", shapeComplete);
    if (shapeComplete) {
      this._applyEnsembleMotion(this._chaoticEl, comboKey);
    } else {
      this._clearEnsembleMotion(this._chaoticEl);
    }

    this._syncChaoticLayout(
      active,
      comboKey,
      forceNewLayout,
      blocked,
      areaH,
      allSorted.length,
    );

    const nextMastered = new Set(sortedMasteredIds);
    const newlyMastered = new Set();
    if (this._hasRenderedOnce) {
      nextMastered.forEach((id) => {
        if (!this._previousMastered.has(id)) newlyMastered.add(id);
      });
    }
    this._previousMastered = nextMastered;
    this._hasRenderedOnce = true;

    const keepIds = new Set();

    active.forEach((word) => {
      const id = String(word.id ?? word.word);
      keepIds.add(id);
      this._createOrUpdateSquare(word, { settled: false });
    });

    newlyMastered.forEach((id) => {
      const chaoticEl = this._chaoticEl.querySelector(
        `[data-word-id="${CSS.escape(id)}"]`,
      );
      const word = mastered.find((w) => String(w.id ?? w.word) === id);
      const idx = indexById.get(id);
      const targetPos =
        idx !== undefined ? shapePositions[idx] : null;
      if (chaoticEl && word && targetPos) {
        this._animateMasteryTransition(word, chaoticEl, targetPos);
      }
    });

    mastered.forEach((word, memberIndex) => {
      const id = String(word.id ?? word.word);
      keepIds.add(id);
      if (this._transitioning.has(id)) return;
      const idx = indexById.get(id);
      const position =
        idx !== undefined ? shapePositions[idx] : null;
      if (position) {
        this._createOrUpdateSquare(word, {
          settled: true,
          position,
          living: shapeComplete,
          memberIndex,
          memberTotal: mastered.length,
        });
      }
    });

    this._transitioning.forEach((id) => keepIds.add(id));
    this._pruneOrphans(this._chaoticEl, keepIds);

    this._chaoticEl.style.minHeight =
      allSorted.length > 0 ? `${areaH}px` : "";
  }

  _pruneOrphans(container, keepIds) {
    container.querySelectorAll("[data-word-id]").forEach((el) => {
      if (!keepIds.has(el.dataset.wordId)) el.remove();
    });
  }
}
