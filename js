/**********************
 * LIFE-MOGOTCHI · Complete JS (Drop-in)
 * - Zodiac (12) selection
 * - Movement (Arrow / WASD) + .moving toggle + bump on direction change
 * - Actions: Feed / Exercise / Rest / Talk
 * - Daily logic (streak + day-change decay)
 * - Continuous decay + autosave
 * - Theme support (optional): <html data-theme="lcd-green|lcd-blue|mono">
 *   If you add buttons with data-theme, it will auto-bind.
 *
 * ✅ HOW TO USE
 * 1) Replace your existing <script> ... </script> with this code.
 * 2) Keep the same HTML IDs as your current file.
 **********************/

(() => {
  "use strict";

  const STORAGE_KEY = "life_mogotchi_zodiac_v2";

  const ZODIAC = [
    { key: "rat", name: "쥐", emoji: "🐭" },
    { key: "ox", name: "소", emoji: "🐮" },
    { key: "tiger", name: "호랑이", emoji: "🐯" },
    { key: "rabbit", name: "토끼", emoji: "🐰" },
    { key: "dragon", name: "용", emoji: "🐲" },
    { key: "snake", name: "뱀", emoji: "🐍" },
    { key: "horse", name: "말", emoji: "🐴" },
    { key: "goat", name: "양", emoji: "🐑" },
    { key: "monkey", name: "원숭이", emoji: "🐵" },
    { key: "rooster", name: "닭", emoji: "🐔" },
    { key: "dog", name: "개", emoji: "🐶" },
    { key: "pig", name: "돼지", emoji: "🐷" },
  ];

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  const ui = {
    screen: $("#screen"),
    char: $("#char"),
    sprite: $("#sprite"),
    bubble: $("#bubble"),
    nameplate: $("#nameplate"),
    zodiacName: $("#zodiacName"),
    moodText: $("#moodText"),
    hungerBar: $("#hungerBar"),
    energyBar: $("#energyBar"),
    streakText: $("#streakText"),

    modal: $("#modal"),
    zgrid: $("#zgrid"),
    openPicker: $("#openPicker"),
    closePicker: $("#closePicker"),

    saveNow: $("#saveNow"),
    hardReset: $("#hardReset"),

    btnFeed: $("#btnFeed"),
    btnExercise: $("#btnExercise"),
    btnRest: $("#btnRest"),
    btnTalk: $("#btnTalk"),
  };

  // Optional theme buttons: <button data-theme="lcd-blue">Blue</button>
  const themeButtons = $$("[data-theme]");

  /* -------------------- Utils -------------------- */
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const now = () => Date.now();
  const randPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  function dayKey(ts = Date.now()) {
    const d = new Date(ts);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function zodiacByKey(key) {
    return ZODIAC.find((z) => z.key === key) || null;
  }

  function safeJSONParse(raw) {
    try { return JSON.parse(raw); } catch { return null; }
  }

  /* -------------------- State -------------------- */
  function defaultState() {
    return {
      zodiacKey: "",
      pos: { x: 0, y: 0 },  // px within screen
      dir: { x: 0, y: 0 },  // movement direction (-1..1)
      lastDir: { x: 0, y: 0 },

      hunger: 55,  // 0..100 (higher = 더 배부름)
      energy: 60,  // 0..100
      mood: 50,    // 0..100 internal (not shown)

      streak: 0,
      lastActiveDay: "",

      lastSavedAt: 0,
      lastActionAt: 0,

      // simple behavior / idle
      lastTalkAt: 0,
    };
  }

  let state = loadState();

  function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();

    const parsed = safeJSONParse(raw);
    if (!parsed) return defaultState();

    const base = defaultState();
    // merge with defaults
    const merged = {
      ...base,
      ...parsed,
      pos: { ...base.pos, ...(parsed.pos || {}) },
      dir: { ...base.dir, ...(parsed.dir || {}) },
      lastDir: { ...base.lastDir, ...(parsed.lastDir || {}) },
    };

    return merged;
  }

  function saveState() {
    state.lastSavedAt = now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  /* -------------------- UI Helpers -------------------- */
  function showBubble(msg, ms = 1400) {
    if (!ui.bubble) return;
    ui.bubble.textContent = msg;
    ui.bubble.classList.add("show");
    clearTimeout(showBubble._t);
    showBubble._t = setTimeout(() => ui.bubble.classList.remove("show"), ms);
  }

  function setBar(el, value) {
    if (!el) return;
    const v = clamp(value, 0, 100);
    const i = el.querySelector("i");
    if (i) i.style.width = `${v}%`;
    el.classList.toggle("warn", v < 55 && v >= 30);
    el.classList.toggle("bad", v < 30);
  }

  function moodLabel() {
    // hunger/energy -> overall mood label
    const score = state.hunger * 0.55 + state.energy * 0.45;
    if (score >= 72) return { text: "좋음", face: "🙂" };
    if (score >= 45) return { text: "보통", face: "😐" };
    return { text: "힘듦", face: "😞" };
  }

  function ensurePosition() {
    if (!ui.screen) return;
    const rect = ui.screen.getBoundingClientRect();
    const cw = 120, ch = 120;
    const pad = 8;

    if (state.pos.x === 0 && state.pos.y === 0) {
      state.pos.x = rect.width / 2 - cw / 2;
      state.pos.y = rect.height * 0.58 - ch / 2;
    }

    state.pos.x = clamp(state.pos.x, pad, rect.width - cw - pad);
    state.pos.y = clamp(state.pos.y, 66, rect.height - ch - 10);
  }

  function render() {
    ensurePosition();

    // Position: our CSS expects center anchoring at left/top, so add half
    if (ui.char) {
      ui.char.style.left = `${state.pos.x + 60}px`;
      ui.char.style.top = `${state.pos.y + 60}px`;
    }

    // Zodiac
    const z = zodiacByKey(state.zodiacKey);
    if (ui.sprite) ui.sprite.textContent = z ? z.emoji : "❓";
    if (ui.zodiacName) ui.zodiacName.textContent = z ? z.name : "미선택";
    if (ui.nameplate) ui.nameplate.textContent = z ? `${z.name} · LIFE-MOGOTCHI` : "새 친구를 선택해줘";

    // Mood + bars
    const m = moodLabel();
    if (ui.moodText) ui.moodText.textContent = m.text;
    setBar(ui.hungerBar, state.hunger);
    setBar(ui.energyBar, state.energy);

    if (ui.streakText) ui.streakText.textContent = String(state.streak || 0);
  }

  /* -------------------- Daily + Decay -------------------- */
  function applyDailyLogic() {
    const today = dayKey();
    if (!state.lastActiveDay) {
      state.lastActiveDay = today;
      state.streak = 0;
      return;
    }
    if (state.lastActiveDay === today) return;

    const last = new Date(state.lastActiveDay + "T00:00:00");
    const t = new Date(today + "T00:00:00");
    const diffDays = Math.round((t - last) / 86400000);

    // streak
    if (diffDays === 1) state.streak = (state.streak || 0) + 1;
    else state.streak = 0;

    // decay based on missed days (cap)
    const d = clamp(diffDays, 1, 7);
    state.hunger = clamp(state.hunger - 10 * d, 0, 100);
    state.energy = clamp(state.energy - 8 * d, 0, 100);

    state.lastActiveDay = today;
    showBubble("새로운 하루야. 다시 돌봐줘!");
  }

  function tickDecay(dtMs) {
    const dt = dtMs / 1000; // seconds
    // slow drain
    state.hunger = clamp(state.hunger - dt * 0.03, 0, 100);
    state.energy = clamp(state.energy - dt * 0.025, 0, 100);

    // mood converges to hunger/energy combination
    const target = state.hunger * 0.55 + state.energy * 0.45;
    state.mood = clamp(state.mood + (target - state.mood) * 0.02, 0, 100);
  }

  /* -------------------- Actions -------------------- */
  function canAct() {
    if (zodiacByKey(state.zodiacKey)) return true;
    showBubble("먼저 십이지 캐릭터를 선택해줘!");
    openPicker();
    return false;
  }

  function bump() {
    if (!ui.char) return;
    ui.char.classList.add("bump");
    clearTimeout(bump._t);
    bump._t = setTimeout(() => ui.char.classList.remove("bump"), 140);
  }

  function actFeed() {
    if (!canAct()) return;
    state.hunger = clamp(state.hunger + 28, 0, 100);
    state.energy = clamp(state.energy + 6, 0, 100);
    state.lastActionAt = now();
    showBubble("🍚 냠냠… 든든해!");
    bump();
    saveState();
    render();
  }

  function actExercise() {
    if (!canAct()) return;
    state.energy = clamp(state.energy - 14, 0, 100);
    state.hunger = clamp(state.hunger - 10, 0, 100);
    state.mood = clamp(state.mood + 6, 0, 100);
    state.lastActionAt = now();
    showBubble("💪 후… 상쾌해!");
    bump();
    saveState();
    render();
  }

  function actRest() {
    if (!canAct()) return;
    state.energy = clamp(state.energy + 26, 0, 100);
    state.hunger = clamp(state.hunger - 4, 0, 100);
    state.lastActionAt = now();
    showBubble("😴 잠깐 쉬자…");
    bump();
    saveState();
    render();
  }

  function actTalk() {
    if (!canAct()) return;
    const z = zodiacByKey(state.zodiacKey);
    const mood = moodLabel().text;

    const linesGood = [
      "오늘도 잘 돌보고 있네 🙂",
      "지금의 너, 충분히 괜찮아.",
      "밥 챙긴 거 최고야!",
      "조급해하지 말자. 천천히.",
    ];
    const linesOk = [
      "한 가지만 해도 충분해.",
      "물 한 잔 + 밥 한 끼가 먼저야.",
      "지금도 계속 나아가는 중이야.",
      "오늘은 “유지”만 해도 성공.",
    ];
    const linesBad = [
      "배고파… 밥 좀… 🥲",
      "지치면 쉬어도 돼.",
      "오늘은 최소한의 돌봄만 하자.",
      "너 자신을 너무 몰아붙이지 마.",
    ];

    const msg =
      mood === "좋음" ? randPick(linesGood) :
      mood === "보통" ? randPick(linesOk) : randPick(linesBad);

    showBubble(`${z.name}: ${msg}`, 1700);
    state.lastTalkAt = now();
    state.lastActionAt = now();
    saveState();
    render();
  }

  /* -------------------- Movement -------------------- */
  const keys = new Set();

  function computeDirFromKeys() {
    let dx = 0, dy = 0;
    if (keys.has("arrowleft") || keys.has("a")) dx -= 1;
    if (keys.has("arrowright") || keys.has("d")) dx += 1;
    if (keys.has("arrowup") || keys.has("w")) dy -= 1;
    if (keys.has("arrowdown") || keys.has("s")) dy += 1;

    // normalize diagonal
    if (dx !== 0 && dy !== 0) { dx *= 0.7071; dy *= 0.7071; }

    state.dir.x = dx;
    state.dir.y = dy;
  }

  function updateMovingClass() {
    if (!ui.char) return;
    const moving = Math.abs(state.dir.x) + Math.abs(state.dir.y) > 0.05;
    ui.char.classList.toggle("moving", moving);
  }

  function detectDirectionChangeBump() {
    const changed =
      (state.dir.x !== 0 && state.lastDir.x !== 0 && Math.sign(state.dir.x) !== Math.sign(state.lastDir.x)) ||
      (state.dir.y !== 0 && state.lastDir.y !== 0 && Math.sign(state.dir.y) !== Math.sign(state.lastDir.y));

    if (changed) bump();
    state.lastDir.x = state.dir.x;
    state.lastDir.y = state.dir.y;
  }

  function move(dtMs) {
    if (!ui.screen) return;
    computeDirFromKeys();
    updateMovingClass();

    const rect = ui.screen.getBoundingClientRect();
    const speed = 0.18; // px per ms
    const cw = 120, ch = 120;
    const pad = 8;

    const energyFactor = clamp(0.55 + (state.energy / 100) * 0.65, 0.55, 1.2);
    const vx = state.dir.x * speed * dtMs * energyFactor;
    const vy = state.dir.y * speed * dtMs * energyFactor;

    state.pos.x = clamp(state.pos.x + vx, pad, rect.width - cw - pad);
    state.pos.y = clamp(state.pos.y + vy, 66, rect.height - ch - 10);

    // extra drain while moving
    const moving = Math.abs(state.dir.x) + Math.abs(state.dir.y) > 0.05;
    if (moving) {
      state.energy = clamp(state.energy - dtMs * 0.002, 0, 100);
      state.hunger = clamp(state.hunger - dtMs * 0.0015, 0, 100);
    }

    detectDirectionChangeBump();
  }

  function onKeyDown(e) {
    // Prevent page scroll with arrows
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) e.preventDefault();

    const k = e.key.toLowerCase();
    keys.add(k);

    // Hotkeys
    if (k === "f") actFeed();
    if (k === "e") actExercise();
    if (k === "r") actRest();
    if (k === "t") actTalk();
  }

  function onKeyUp(e) {
    keys.delete(e.key.toLowerCase());
  }

  /* -------------------- Picker -------------------- */
  function buildZodiacGrid() {
    if (!ui.zgrid) return;
    ui.zgrid.innerHTML = "";
    ZODIAC.forEach((z) => {
      const el = document.createElement("div");
      el.className = "zodiac";
      el.setAttribute("data-key", z.key);
      el.innerHTML = `<div class="e">${z.emoji}</div><div class="t">${z.name}</div>`;
      el.addEventListener("click", () => {
        state.zodiacKey = z.key;
        showBubble(`${z.name} 선택 완료!`);
        closePicker();
        saveState();
        render();
      });
      ui.zgrid.appendChild(el);
    });
  }

  function openPicker() {
    if (!ui.modal) return;
    ui.modal.classList.add("show");
  }

  function closePicker() {
    if (!ui.modal) return;
    ui.modal.classList.remove("show");
  }

  /* -------------------- Theme (Optional) -------------------- */
  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    // light feedback
    showBubble(`테마: ${theme}`);
  }

  function bindThemeButtons() {
    if (!themeButtons.length) return;
    themeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const theme = btn.getAttribute("data-theme");
        if (theme) setTheme(theme);
      });
    });
  }

  /* -------------------- Loop -------------------- */
  let lastTs = now();

  function loop() {
    const ts = now();
    const dt = ts - lastTs;
    lastTs = ts;

    applyDailyLogic();
    tickDecay(dt);
    move(dt);

    // autosave every 10s
    if (ts - (state.lastSavedAt || 0) > 10_000) saveState();

    render();
    requestAnimationFrame(loop);
  }

  /* -------------------- Bind Events -------------------- */
  function bindEvents() {
    // modal
    ui.openPicker?.addEventListener("click", openPicker);
    ui.closePicker?.addEventListener("click", closePicker);
    ui.modal?.addEventListener("click", (e) => {
      if (e.target === ui.modal) closePicker();
    });

    // actions
    ui.btnFeed?.addEventListener("click", actFeed);
    ui.btnExercise?.addEventListener("click", actExercise);
    ui.btnRest?.addEventListener("click", actRest);
    ui.btnTalk?.addEventListener("click", actTalk);

    ui.saveNow?.addEventListener("click", () => {
      saveState();
      showBubble("저장했어!");
    });

    ui.hardReset?.addEventListener("click", () => {
      if (!confirm("정말 초기화할까? 캐릭터/상태/스트릭이 모두 리셋돼.")) return;
      localStorage.removeItem(STORAGE_KEY);
      state = defaultState();
      ensurePosition();
      buildZodiacGrid();
      render();
      showBubble("초기화 완료!");
    });

    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("keyup", onKeyUp);

    window.addEventListener("resize", () => {
      ensurePosition();
      render();
      saveState();
    });

    bindThemeButtons();
  }

  /* -------------------- Init -------------------- */
  function init() {
    // If you added screws in HTML with class="screw tl" etc., CSS will show them.
    buildZodiacGrid();
    ensurePosition();
    render();
    bindEvents();

    // First time: open picker
    if (!state.zodiacKey) {
      setTimeout(() => openPicker(), 200);
      showBubble("십이지 캐릭터를 골라줘!");
    } else {
      showBubble("다시 왔네 🙂");
    }

    requestAnimationFrame(loop);
  }

  init();
})();
