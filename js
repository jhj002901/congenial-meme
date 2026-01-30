(() => {
  // ---------- Helpers ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const toastEl = $("#toast");
  let toastTimer = null;

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1300);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast("복사 완료 ✅");
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      toast("복사 완료 ✅");
    }
  }

  // ---------- Smooth anchor scroll ----------
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // ---------- Year ----------
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ---------- Copy payloads ----------
  const ONE_LINER = "오늘 20분만 수거하고, 사진 3장과 한 문장 소감을 기록한다.";
  const PITCH = "쓰레기 수거를 출발점으로 아트를 만들고, 과정을 기록해 온라인 전시로 남기는 참여형 파일럿 프로젝트입니다.";
  const CHECKLIST = [
    "✅ 오늘 바로 가능한 최소 실행(10분 플랜)",
    "1) 수거 20분",
    "2) 사진 3장",
    "3) 한 문장 소감",
    "4) 다음 액션 1개"
  ].join("\n");

  const TEMPLATE = `📌 1회 파일럿 로그
- 날짜:
- 장소:
- 참여자(혼자 가능):
- 수거량(대략):
- 발견 포인트(인상/문제/아이디어):
- 아트 전환 아이디어(사진/오브제/콜라주/업사이클 등):
- 결과물 링크(사진·영상·문서):
- 느낀 점(한 문장):
- 다음 액션(1개만):`;

  const PROPOSAL_5_LINES = `안녕하세요. “쓰레기 → 아트 → 기록 → 온라인 전시” 파일럿 캠페인을 진행 중입니다.
기술보다 실행과 기록을 우선하며, 2~4주 단위로 작은 결과물을 축적합니다.
협업 형태는 (1) 공동 수거/기록, (2) 아트 전환, (3) 전시/홍보 중 선택 가능합니다.
결과물은 사진·영상·PDF로 정리해 공유드리며, 필요 시 기부/수익분배 구조도 설계 가능합니다.
관심 있으시면 일정/역할 범위를 간단히 맞춰보고 싶습니다.`;

  // Buttons
  $("#btnCopyOneLiner")?.addEventListener("click", () => copyText(ONE_LINER));
  $("#btnCopyPitch")?.addEventListener("click", () => copyText(PITCH));
  $("#btnCopyChecklist")?.addEventListener("click", () => copyText(CHECKLIST));
  $("#btnCopyTemplate")?.addEventListener("click", () => copyText(TEMPLATE));
  $("#btnCopyProposal")?.addEventListener("click", () => copyText(PROPOSAL_5_LINES));

  // ---------- Modal ----------
  const modal = $("#modal");
  const modalClose = $("#modalClose");
  const modalBackdrop = $(".modal-backdrop");
  const btnOpenTemplate = $("#btnOpenTemplate");
  const btnOpenModal = $("#btnOpenModal");

  function openModal() {
    if (!modal) return;
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  btnOpenTemplate?.addEventListener("click", openModal);
  btnOpenModal?.addEventListener("click", openModal);
  modalClose?.addEventListener("click", closeModal);
  modalBackdrop?.addEventListener("click", (e) => {
    if (e.target?.dataset?.close) closeModal();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal?.classList.contains("show")) closeModal();
  });

  // Modal copy actions
  $("#btnModalCopy")?.addEventListener("click", () => copyText(TEMPLATE));
  $("#btnModalCopyPitch")?.addEventListener("click", () => copyText(PITCH));

  // Keep template text synced (in case you edit HTML later)
  const templatePre = $("#templateText");
  if (templatePre) templatePre.textContent = TEMPLATE;

  // ---------- Reveal on scroll ----------
  const revealEls = $$(".reveal");
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => io.observe(el));

  // ---------- Archive: add sample log cards ----------
  const archiveGrid = $("#archiveGrid");
  $("#btnAddSample")?.addEventListener("click", () => {
    if (!archiveGrid) return;

    const titles = [
      "시장 주변 25분 수거",
      "버스정류장 주변 집중 수거",
      "산책로 40분 루틴 수거",
      "학교 앞 골목 20분 미니 루틴",
      "하천변 30분 수거 + 사진 콜라주"
    ];
    const bodies = [
      "일회용 컵/뚜껑이 많아 ‘소비의 흔적’ 메시지로 기록.",
      "담배꽁초가 많아 ‘작은 불씨’라는 주제로 아카이브 작성.",
      "비닐류가 많은 구간을 지도에 표시해 다음 실행 포인트로 저장.",
      "짧게라도 반복하는 게 핵심. 소감 1문장과 다음 액션 1개만 남김.",
      "반짝이는 쓰레기 소재로 ‘빛의 잔재’ 사진 시리즈 구상."
    ];
    const tags = [
      ["사진 3장", "한 문장", "다음 액션"],
      ["오브제", "기록물", "PDF"],
      ["루틴", "반복", "스토리"],
      ["미니 실행", "증빙", "아카이브"],
      ["사진", "콜라주", "메시지"]
    ];

    const i = Math.floor(Math.random() * titles.length);

    const card = document.createElement("article");
    card.className = "archive-card reveal";
    card.innerHTML = `
      <div class="archive-top">
        <span class="badge">2주 파일럿</span>
        <span class="muted">추가됨</span>
      </div>
      <h3 class="h3">${titles[i]}</h3>
      <p class="p">${bodies[i]}</p>
      <div class="archive-bottom">
        ${tags[i].map(t => `<span class="tag">${t}</span>`).join("")}
      </div>
    `;

    archiveGrid.prepend(card);
    io.observe(card);
    toast("샘플 기록 추가 ✅");
  });

  // ---------- Optional: Make mailto easier to customize ----------
  // Tip: HTML에서 hello@example.com만 네 이메일로 바꾸면 됨.
})();
