/* =========================================================
  CAT-MOGOTCHI · app.js
  - Works with the "device + screen + pet + 3D cat" HTML
  - Robust: will run even if some optional nodes don't exist
========================================================= */

(() => {
  "use strict";

  /* ---------- helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const now = () => Date.now();

  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const fmt2 = (n) => String(n).padStart(2, "0");

  /* ---------- DOM (expected ids from earlier HTML) ---------- */
  const el = {
    moodText: $("#moodText"),
    petName: $("#petName"),
    zodiacLabel: $("#zodiacLabel"),
    bubble: $("#bubble"),
    pet: $("#pet"),
    screen: $("#screen"),

    btnFeed: $("#btnFeed"),
    btnPlay: $("#btnPlay"),
    btnRest: $("#btnRest"),
    btnClean: $("#btnClean"),
    btnTalk: $("#btnTalk"),

    saveNow: $("#saveNow"),
    resetAll: $("#resetAll"),

    hungerBar: $("#hungerBar i") || $("#barHunger"),
    energyBar: $("#energyBar i") || $("#barEnergy"),
    cleanBar: $("#cleanBar i") || $("#barClean"),

    themeBtns: $$(".tbtn"),
    clock: $("#clock"),

    // optional zodiac select mode (if you later add it)
    btnZodiac: $("#btnZodiac"),
    select: $("#select"),
    prevZodiac: $("#prevZodiac"),
    nextZodiac: $("#nextZodiac"),
    okZodiac: $("#okZodiac"),
    backZodiac: $("#backZodiac"),
    zodiacEmoji: $("#zodiacEmoji"),
    zodiacName: $("#zodiacName"),
    zodiacHint: $("#zodiacHint"),
  };

  /* ---------- ZODIAC data ---------- */
  const ZODIACS = [
    { key: "rat", emoji: "🐭", name: "쥐", hint: "민첩 / 호기심" },
    { key: "ox", emoji: "🐮", name: "소", hint: "꾸준 / 성실" },
    { key: "tiger", emoji: "🐯", name: "호랑이", hint: "용기 / 추진" },
    { key: "rabbit", emoji: "🐰", name: "토끼", hint: "섬세 / 배려" },
    { key: "dragon", emoji: "🐲", name: "용", hint: "야망 / 카리스마" },
    { key: "snake", emoji: "🐍", name: "뱀", hint: "집중 / 직관" },
    { key: "horse", emoji: "🐴", name: "말", hint: "자유 / 에너지" },
    { key: "goat", emoji: "🐑", name: "양", hint: "온화 / 예술" },
    { key: "monkey", emoji: "🐵", name: "원숭이", hint: "재치 / 실험" },
    { key: "rooster", emoji: "🐔", name: "닭", hint: "정리 / 계획" },
    { key: "dog", emoji: "🐶", name: "개", hint: "충성 / 우정" },
    { key: "pig", emoji: "🐷", name: "돼지", hint: "풍요 / 낙천" },
  ];

  /* ---------- STATE ---------- */
  const STORAGE_KEY = "catmogotchi_v1";

  const defaultState = () => ({
    petName: "냥이",
    zodiacIndex: 0,
    theme: "lcd-green",

    // stats 0..100
    hunger: 70,
    energy: 70,
    clean: 70,

    // position inside screen (percent)
    x: 50,
    y: 52,

    // meta
    lastTick: now(),
    lastAction: now(),
    streak: 0, // fun extra
  });

  let state = loadState() || defaultState();

  // selection mode index (for zodiac carousel if present)
  let zodiacCursor = state.zodiacIndex;

  /* ---------- INIT ---------- */
  applyTheme(state.theme);
  renderAll(true);
  setClock();
  setInterval(setClock, 1000 * 15);

  // main tick: decay + random events
  setInterval(mainTick, 1000); // 1s

  // autosave periodically
  setInterval(() => saveState(state), 5000);

  // Bind UI actions
  bindButtons();
  bindKeys();

  // Show a welcome bubble
  bubble(pick([
    "오늘도 나를 돌봐줘 😺",
    "밥… 줘… 🍚",
    "놀아줘! 🧶",
    "청소도… 부탁… 🧽",
  ]), 1400);

  /* =========================================================
    FUNCTIONS
  ========================================================= */

  function bindButtons() {
    el.btnFeed?.addEventListener("click", () => act("feed"));
    el.btnPlay?.addEventListener("click", () => act("play"));
    el.btnRest?.addEventListener("click", () => act("rest"));
    el.btnClean?.addEventListener("click", () => act("clean"));
    el.btnTalk?.addEventListener("click", () => act("talk"));

    el.saveNow?.addEventListener("click", () => {
      saveState(state);
      bump();
      bubble("저장 완료! 💾", 900);
    });

    el.resetAll?.addEventListener("click", () => {
      if (!confirm("정말 초기화할까? (저장된 데이터가 삭제됨)")) return;
      state = defaultState();
      zodiacCursor = state.zodiacIndex;
      applyTheme(state.theme);
      renderAll(true);
      saveState(state);
      bubble("초기화했어. 다시 시작! ✨", 1200);
    });

    // theme buttons
    el.themeBtns.forEach((b) => {
      b.addEventListener("click", () => {
        const t = b.dataset.theme;
        applyTheme(t);
        state.theme = t;
        el.themeBtns.forEach((x) => x.classList.toggle("active", x === b));
        bump();
      });
    });

    // zodiac select mode (optional)
    el.btnZodiac?.addEventListener("click", () => openZodiacSelect());
    el.backZodiac?.addEventListener("click", () => closeZodiacSelect());
    el.prevZodiac?.addEventListener("click", () => zodiacStep(-1));
    el.nextZodiac?.addEventListener("click", () => zodiacStep(+1));
    el.okZodiac?.addEventListener("click", () => confirmZodiac());
  }

  function bindKeys() {
    window.addEventListener("keydown", (e) => {
      const key = e.key.toLowerCase();

      // If zodiac select open, handle it
      if (isZodiacOpen()) {
        if (key === "escape") return closeZodiacSelect();
        if (key === "arrowleft" || key === "a") return zodiacStep(-1);
        if (key === "arrowright" || key === "d") return zodiacStep(+1);
        if (key === "enter" || key === " ") return confirmZodiac();
        return;
      }

      // actions shortcuts
      if (key === "f") return act("feed");
      if (key === "p") return act("play");
      if (key === "r") return act("rest");
      if (key === "c") return act("clean");
      if (key === "t") return act("talk");
      if (key === "z") return openZodiacSelect();

      // movement
      const moveKeys = ["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"];
      if (!moveKeys.includes(key)) return;

      e.preventDefault();

      if (key === "arrowup" || key === "w") movePet(0, -1);
      if (key === "arrowdown" || key === "s") movePet(0, +1);
      if (key === "arrowleft" || key === "a") movePet(-1, 0);
      if (key === "arrowright" || key === "d") movePet(+1, 0);
    });
  }

  function setClock() {
    if (!el.clock) return;
    const d = new Date();
    el.clock.textContent = `${fmt2(d.getHours())}:${fmt2(d.getMinutes())}`;
  }

  function renderAll(force = false) {
    // labels
    if (el.petName) el.petName.textContent = state.petName;
    if (el.zodiacLabel) {
      const z = ZODIACS[state.zodiacIndex];
      el.zodiacLabel.textContent = z ? `${z.emoji} ${z.name}` : "—";
    }

    // theme button active state
    if (el.themeBtns.length) {
      el.themeBtns.forEach((b) => b.classList.toggle("active", b.dataset.theme === state.theme));
    }

    // stats bars
    setBar(el.hungerBar, state.hunger);
    setBar(el.energyBar, state.energy);
    setBar(el.cleanBar, state.clean);

    // mood
    const m = computeMood(state);
    if (el.moodText) el.moodText.textContent = m.label;

    // pet position
    if (el.pet) {
      el.pet.style.left = `${state.x}%`;
      el.pet.style.top = `${state.y}%`;
    }

    if (force) {
      // ensure cursor used by zodiac select
      zodiacCursor = state.zodiacIndex;
      renderZodiacCard();
    }
  }

  function setBar(barEl, value) {
    if (!barEl) return;
    const v = clamp(value, 0, 100);
    barEl.style.width = `${v}%`;

    // optional visual states if your CSS uses .warn/.bad on parent
    const parent = barEl.closest(".bar");
    if (parent) {
      parent.classList.toggle("bad", v < 25);
      parent.classList.toggle("warn", v >= 25 && v < 45);
    }
  }

  function computeMood(s) {
    // weighted score
    const score = (s.hunger * 0.40) + (s.energy * 0.35) + (s.clean * 0.25);
    if (score >= 78) return { key: "great", label: "좋음" };
    if (score >= 55) return { key: "ok", label: "보통" };
    if (score >= 35) return { key: "tired", label: "지침" };
    return { key: "bad", label: "위험" };
  }

  /* ---------- actions ---------- */
  function act(type) {
    // action cooldown feel
    bump();

    const beforeMood = computeMood(state).key;

    switch (type) {
      case "feed": {
        const gain = rand(12, 24);
        state.hunger = clamp(state.hunger + gain, 0, 100);
        state.clean = clamp(state.clean - rand(2, 5), 0, 100); // eating makes a bit dirty
        bubble(pick([
          "냠냠! 🍚",
          "배가 든든해졌어 😺",
          "밥 최고…!",
          "간식도… 있나? 👀",
        ]), 1200);
        break;
      }
      case "play": {
        const cost = rand(8, 16);
        state.energy = clamp(state.energy - cost, 0, 100);
        state.clean = clamp(state.clean - rand(1, 4), 0, 100);
        state.hunger = clamp(state.hunger - rand(1, 4), 0, 100);
        bubble(pick([
          "놀자! 🧶",
          "꺄악 신난다!",
          "잡았다!! 😼",
          "한 판 더? 👾",
        ]), 1200);
        // tiny reward
        if (Math.random() < 0.18) {
          state.hunger = clamp(state.hunger + 6, 0, 100);
          bubble("보너스 간식 발견! 🍪", 1200);
        }
        break;
      }
      case "rest": {
        const gain = rand(14, 28);
        state.energy = clamp(state.energy + gain, 0, 100);
        state.hunger = clamp(state.hunger - rand(1, 3), 0, 100);
        bubble(pick([
          "Zzz… 😴",
          "잠깐 충전 완료!",
          "휴식은 중요해…",
        ]), 1200);
        break;
      }
      case "clean": {
        const gain = rand(18, 32);
        state.clean = clamp(state.clean + gain, 0, 100);
        bubble(pick([
          "반짝반짝 ✨",
          "깨끗해졌어! 🧽",
          "상쾌하다~",
        ]), 1200);
        break;
      }
      case "talk": {
        talkLine();
        break;
      }
      default:
        break;
    }

    state.lastAction = now();

    // streak (playful)
    if (type !== "talk") state.streak = clamp(state.streak + 1, 0, 999);

    // mood change reaction
    const afterMood = computeMood(state).key;
    if (beforeMood !== afterMood) {
      bubble(moodChangeLine(afterMood), 1200);
    }

    renderAll();
  }

  function talkLine() {
    const m = computeMood(state).key;

    const lines = {
      great: [
        "오늘 컨디션 최고야 😺",
        "이대로만 가자!",
        "너 덕분이야 🙂",
      ],
      ok: [
        "무난한 하루야.",
        "밥/휴식 중 하나만 더 해줘!",
        "오늘도 고마워.",
      ],
      tired: [
        "조금 지쳤어… 😿",
        "휴식이 필요해…",
        "정리(청소)도 하면 좋을 듯?",
      ],
      bad: [
        "나 지금 좀 힘들어…",
        "밥이랑 휴식… 부탁…",
        "청결도… 신경 써줘…",
      ],
    };

    bubble(pick(lines[m] || lines.ok), 1400);

    // small random request
    if (Math.random() < 0.20) {
      const req = pick(["feed", "rest", "clean", "play"]);
      bubble(`요청: ${req.toUpperCase()}!`, 900);
    }
  }

  function moodChangeLine(moodKey) {
    if (moodKey === "great") return "기분이 좋아졌어! 😺✨";
    if (moodKey === "ok") return "다시 안정적이야 🙂";
    if (moodKey === "tired") return "조금 지쳤어… 😿";
    return "위험해… 지금 케어가 필요해 😵";
  }

  /* ---------- movement ---------- */
  let movingTimer = null;

  function movePet(dx, dy) {
    if (!el.pet) return;

    // movement speed depends on energy
    const speed = state.energy > 60 ? 1.6 : state.energy > 30 ? 1.2 : 0.9;

    state.x = clamp(state.x + dx * speed, 12, 88);
    state.y = clamp(state.y + dy * speed, 26, 80);

    // small stat changes while moving
    state.energy = clamp(state.energy - 0.2, 0, 100);
    state.hunger = clamp(state.hunger - 0.05, 0, 100);

    el.pet.classList.add("moving");
    clearTimeout(movingTimer);
    movingTimer = setTimeout(() => el.pet.classList.remove("moving"), 160);

    renderAll();
  }

  function bump() {
    if (!el.pet) return;
    el.pet.classList.add("bump");
    setTimeout(() => el.pet.classList.remove("bump"), 120);
  }

  /* ---------- bubble ---------- */
  let bubbleTimer = null;
  function bubble(text, ms = 1200) {
    if (!el.bubble) return;

    el.bubble.textContent = text;
    el.bubble.classList.add("show");

    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => {
      el.bubble.classList.remove("show");
    }, ms);
  }

  /* ---------- decay + random events ---------- */
  function mainTick() {
    const t = now();
    const dt = Math.max(0, (t - state.lastTick) / 1000); // seconds
    state.lastTick = t;

    // decay rates per second
    // tuned to be slow but noticeable
    const hungerDecay = 0.06;
    const energyDecay = 0.05;
    const cleanDecay = 0.035;

    state.hunger = clamp(state.hunger - hungerDecay * dt, 0, 100);
    state.energy = clamp(state.energy - energyDecay * dt, 0, 100);
    state.clean = clamp(state.clean - cleanDecay * dt, 0, 100);

    // If very low, slightly faster (soft pressure)
    if (state.hunger < 20) state.energy = clamp(state.energy - 0.02 * dt, 0, 100);
    if (state.clean < 20) state.energy = clamp(state.energy - 0.015 * dt, 0, 100);

    // random micro-event every ~25-55 seconds
    if (Math.random() < dt / rand(25, 55)) {
      randomEvent();
    }

    // subtle idle bubble if user inactive long
    const idleSec = (t - state.lastAction) / 1000;
    if (idleSec > 45 && Math.random() < dt / 18) {
      bubble(pick([
        "있잖아… 👀",
        "나 여기 있어~",
        "오늘도 한 번만 눌러줘!",
        "심심해…",
      ]), 1200);
    }

    renderAll();
  }

  function randomEvent() {
    const m = computeMood(state).key;

    const events = [
      () => { // snack found
        if (Math.random() < 0.35) {
          state.hunger = clamp(state.hunger + rand(6, 14), 0, 100);
          bubble("바닥에서 간식 발견! 🍪", 1400);
        } else {
          bubble("뭔가 냄새가 나… 🤔", 1200);
        }
      },
      () => { // energy dip
        state.energy = clamp(state.energy - rand(4, 10), 0, 100);
        bubble("갑자기 졸려… 😴", 1200);
      },
      () => { // mess
        state.clean = clamp(state.clean - rand(6, 14), 0, 100);
        bubble("어… 방이 좀… 😅", 1200);
      },
      () => { // wander
        // move a bit
        state.x = clamp(state.x + rand(-8, 8), 12, 88);
        state.y = clamp(state.y + rand(-6, 6), 26, 80);
        if (el.pet) el.pet.classList.add("moving");
        setTimeout(() => el.pet?.classList.remove("moving"), 260);
        bubble("산책 중… 🚶‍♂️", 1000);
      },
      () => { // mood-based line
        const line = m === "great"
          ? "나 오늘 기분 좋아!"
          : m === "tired"
            ? "조금 힘들어…"
            : m === "bad"
              ? "지금 케어가 필요해…"
              : "무난무난~";
        bubble(line, 1200);
      },
    ];

    pick(events)();
  }

  /* ---------- theme ---------- */
  function applyTheme(theme) {
    const t = theme || "lcd-green";
    document.documentElement.dataset.theme = t;
  }

  /* ---------- save/load ---------- */
  function saveState(s) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch (e) {
      // ignore
    }
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);

      // basic validation with fallbacks
      const s = defaultState();
      Object.assign(s, parsed);

      s.hunger = clamp(Number(s.hunger), 0, 100);
      s.energy = clamp(Number(s.energy), 0, 100);
      s.clean = clamp(Number(s.clean), 0, 100);

      s.x = clamp(Number(s.x), 12, 88);
      s.y = clamp(Number(s.y), 26, 80);

      s.zodiacIndex = clamp(Number(s.zodiacIndex), 0, ZODIACS.length - 1);
      s.theme = typeof s.theme === "string" ? s.theme : "lcd-green";
      s.petName = typeof s.petName === "string" ? s.petName : "냥이";

      s.lastTick = now();
      s.lastAction = now();
      return s;
    } catch (e) {
      return null;
    }
  }

  /* ---------- Zodiac Select (optional) ---------- */
  function isZodiacOpen() {
    return !!(el.select && !el.select.hidden);
  }

  function openZodiacSelect() {
    if (!el.select) {
      // if no selector UI exists, just rotate zodiac quickly
      state.zodiacIndex = (state.zodiacIndex + 1) % ZODIACS.length;
      bubble(`십이지 변경: ${ZODIACS[state.zodiacIndex].emoji} ${ZODIACS[state.zodiacIndex].name}`, 1200);
      renderAll();
      return;
    }
    zodiacCursor = state.zod
