<!doctype html>
<html lang="ko" data-theme="lcd-green">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>CAT-MOGOTCHI · 3D Toy Tamagotchi (Single File)</title>
  <style>
    /* =========================================================
      CAT-MOGOTCHI (Single index.html)
      - 3D toy cat (pure CSS)
      - Tamagotchi device shell + LCD screen overlays
      - Simple game loop + actions + movement + save (localStorage)
      - Theme switch (green/blue/mono) via <html data-theme="">
    ========================================================= */

    /* ---------- THEME TOKENS ---------- */
    :root{
      --bg:#0b0c10;
      --uiText:rgba(255,255,255,.92);
      --uiMuted:rgba(255,255,255,.70);

      --frame:#2b2a2f;
      --frame2:#1f1e23;
      --frameStroke:rgba(255,255,255,.18);

      --lcd:#cfe8c9;
      --lcd2:#bfe2b8;
      --lcdText:#214b2e;
      --lcdText2:rgba(33,75,46,.78);

      --accent:#2f6a45;
      --accent2:#214b2e;

      --btn:#3b3d49;
      --btnTop:#4a4d5c;
      --btnEdge:#1c1e26;

      --shadow: 0 16px 48px rgba(0,0,0,.45);

      --scanOpacity:.14;     /* scanline strength */
      --ditherOpacity:.10;   /* dot texture */
      --vignetteOpacity:.34; /* edge darkening */

      --catFur1:#f2c38f; /* warm orange */
      --catFur2:#eaa96a;
      --catFur3:#d78645;
      --catShadow:rgba(0,0,0,.18);
    }

    :root[data-theme="lcd-blue"]{
      --bg:#070a12;

      --frame:#262a35;
      --frame2:#1b1f2a;

      --lcd:#cfe6ff;
      --lcd2:#bddcff;
      --lcdText:#1d2f5b;
      --lcdText2:rgba(29,47,91,.78);

      --accent:#2b4fb0;
      --accent2:#1d2f5b;

      --btn:#37445c;
      --btnTop:#44536f;
      --btnEdge:#1b2232;

      --catFur1:#f0caa2;
      --catFur2:#e5b98a;
      --catFur3:#d59d6a;
    }

    :root[data-theme="mono"]{
      --bg:#0a0a0a;

      --frame:#2c2c2c;
      --frame2:#1e1e1e;

      --lcd:#e6e6e6;
      --lcd2:#dcdcdc;
      --lcdText:#111;
      --lcdText2:rgba(17,17,17,.72);

      --accent:#111;
      --accent2:#111;

      --btn:#2f2f2f;
      --btnTop:#3a3a3a;
      --btnEdge:#151515;

      --catFur1:#d9d9d9;
      --catFur2:#cfcfcf;
      --catFur3:#bfbfbf;
      --catShadow:rgba(0,0,0,.22);
    }

    /* ---------- BASE ---------- */
    *{box-sizing:border-box}
    html,body{height:100%}
    body{
      margin:0;
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:18px;
      color:var(--uiText);
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Apple SD Gothic Neo", "Noto Sans KR", Arial;

      background:
        radial-gradient(900px 600px at 25% 10%, rgba(182,166,255,.18), transparent 60%),
        radial-gradient(800px 520px at 80% 25%, rgba(155,231,196,.14), transparent 60%),
        var(--bg);
    }

    /* ---------- DEVICE SHELL ---------- */
    .device{
      width:min(980px, 96vw);
      border-radius: 34px;
      padding: 18px;
      position:relative;
      overflow:hidden;
      box-shadow: var(--shadow);

      background:
        radial-gradient(900px 350px at 30% 0%, rgba(255,255,255,.16), transparent 60%),
        linear-gradient(180deg, rgba(255,255,255,.08), rgba(0,0,0,.10)),
        linear-gradient(180deg, var(--frame), var(--frame2));
      border:1px solid var(--frameStroke);
    }
    .device::before{
      content:"";
      position:absolute;
      left:-20%;
      top:-30%;
      width:140%;
      height:55%;
      transform: rotate(-8deg);
      background: linear-gradient(180deg, rgba(255,255,255,.18), rgba(255,255,255,0));
      opacity:.55;
      pointer-events:none;
    }
    .device::after{
      content:"";
      position:absolute; inset:0;
      background:
        repeating-linear-gradient(120deg,
          rgba(255,255,255,.06) 0px,
          rgba(255,255,255,.06) 1px,
          rgba(255,255,255,0) 3px,
          rgba(255,255,255,0) 10px);
      opacity:.06;
      pointer-events:none;
    }

    .screw{
      position:absolute;
      width:18px; height:18px;
      border-radius:50%;
      border:1px solid rgba(255,255,255,.14);
      background:
        radial-gradient(circle at 30% 30%, rgba(255,255,255,.14), transparent 50%),
        radial-gradient(circle at 50% 60%, rgba(0,0,0,.55), rgba(0,0,0,.25));
      box-shadow: inset 0 2px 4px rgba(0,0,0,.55);
      opacity:.9;
    }
    .screw::after{
      content:"";
      position:absolute; left:50%; top:50%;
      width:10px; height:2px;
      background:rgba(255,255,255,.18);
      transform:translate(-50%,-50%) rotate(20deg);
      border-radius:2px;
    }
    .screw.tl{ left:12px; top:12px; }
    .screw.tr{ right:12px; top:12px; }
    .screw.bl{ left:12px; bottom:12px; }
    .screw.br{ right:12px; bottom:12px; }

    .inner{ position:relative; z-index:1; }

    /* ---------- TOP BAR ---------- */
    .topbar{
      display:flex;
      gap:12px;
      align-items:flex-start;
      justify-content:space-between;
      flex-wrap:wrap;
      padding:6px 6px 12px;
    }
    .brand{
      display:flex; flex-direction:column; gap:4px;
      padding:10px 12px;
      border-radius:16px;
      background:rgba(0,0,0,.12);
      border:1px solid rgba(255,255,255,.12);
      max-width: 560px;
    }
    .title{
      font-size:14px;
      font-weight:850;
      letter-spacing:.4px;
    }
    .subtitle{
      font-size:12px;
      color:var(--uiMuted);
      line-height:1.35;
    }
    .actions{
      display:flex; gap:10px; align-items:center; flex-wrap:wrap;
    }
    .speaker{
      width:56px;
      height:28px;
      border-radius:12px;
      border:1px solid rgba(255,255,255,.10);
      background:
        radial-gradient(circle, rgba(0,0,0,.45) 28%, transparent 30%) 0 0/10px 10px,
        linear-gradient(180deg, rgba(255,255,255,.06), rgba(0,0,0,.10));
      opacity:.9;
    }
    .pill{
      display:inline-flex; align-items:center; gap:8px;
      padding:9px 12px; border-radius:999px;
      border:1px solid rgba(255,255,255,.14);
      background:rgba(0,0,0,.14);
      font-size:12px;
      color:var(--uiMuted);
    }
    .pill strong{ color:var(--uiText); font-weight:850; }

    /* ---------- BUTTONS (PHYSICAL) ---------- */
    .btn{
      cursor:pointer;
      border:1px solid rgba(255,255,255,.14);
      background: linear-gradient(180deg, var(--btnTop), var(--btn));
      color: rgba(255,255,255,.92);
      padding:10px 12px;
      border-radius:16px;
      font-size:12px;
      user-select:none;

      box-shadow:
        0 8px 0 var(--btnEdge),
        0 16px 24px rgba(0,0,0,.35);
      transition: transform .08s, box-shadow .08s, filter .08s;
    }
    .btn:hover{ filter:brightness(1.05); }
    .btn:active{
      transform: translateY(6px);
      box-shadow:
        0 2px 0 var(--btnEdge),
        0 10px 16px rgba(0,0,0,.25);
    }
    .btn.primary{
      border-color: rgba(255,255,255,.18);
      background:
        linear-gradient(180deg, rgba(255,255,255,.18), rgba(0,0,0,.08)),
        linear-gradient(180deg, var(--accent), var(--accent2));
    }
    .btn.danger{
      background:
        linear-gradient(180deg, rgba(255,255,255,.14), rgba(0,0,0,.08)),
        linear-gradient(180deg, #a33, #7a1f1f);
    }

    /* ---------- SCREEN ---------- */
    .screen-shell{
      border-radius:28px;
      padding:14px;
      background:rgba(0,0,0,.14);
      border:1px solid rgba(255,255,255,.14);
      position:relative;
    }
    .screen{
      border-radius:22px;
      overflow:hidden;
      border: 2px solid rgba(0,0,0,.35);
      background: linear-gradient(180deg, var(--lcd), var(--lcd2));
      position:relative;
      height: 470px;
      box-shadow:
        inset 0 0 0 1px rgba(255,255,255,.18),
        inset 0 -14px 34px rgba(0,0,0,.18),
        0 10px 28px rgba(0,0,0,.35);
    }
    @media (max-width:720px){ .screen{height:520px;} }

    /* LCD overlays */
    .screen::before{
      content:"";
      position:absolute; inset:0;
      background:
        repeating-linear-gradient(
          180deg,
          rgba(0,0,0, var(--scanOpacity)) 0px,
          rgba(0,0,0, var(--scanOpacity)) 1px,
          rgba(0,0,0, 0) 3px,
          rgba(0,0,0, 0) 6px
        ),
        repeating-linear-gradient(
          90deg,
          rgba(0,0,0,.06) 0px,
          rgba(0,0,0,.06) 1px,
          rgba(0,0,0,0) 4px,
          rgba(0,0,0,0) 10px
        );
      mix-blend-mode: overlay;
      opacity:.85;
      pointer-events:none;
      z-index:10;
    }
    .screen::after{
      content:"";
      position:absolute; inset:0;
      background:
        radial-gradient(circle, rgba(0,0,0,.22) 20%, transparent 22%) 0 0/6px 6px,
        radial-gradient(120% 90% at 50% 40%,
          rgba(0,0,0,0) 55%,
          rgba(0,0,0, var(--vignetteOpacity)) 100%);
      opacity: var(--ditherOpacity);
      mix-blend-mode: multiply;
      pointer-events:none;
      z-index:11;
    }

    /* HUD */
    .hud{
      position:absolute;
      top:10px; left:10px; right:10px;
      display:flex;
      justify-content:space-between;
      gap:10px;
      z-index:12;
      pointer-events:none;
    }
    .hud-left,.hud-right{
      display:flex; gap:8px; align-items:center; flex-wrap:wrap;
    }
    .hud-badge{
      display:inline-flex;
      align-items:center;
      gap:8px;
      padding:7px 10px;
      border-radius:999px;
      border:1px solid rgba(0,0,0,.22);
      background: rgba(255,255,255,.25);
      color: var(--lcdText2);
      font-size:12px;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.25);
      white-space:nowrap;
    }
    .hud-badge strong{ color: var(--lcdText); font-weight:900; }
    .bar{
      width:120px; height:10px;
      border-radius:999px;
      border:1px solid rgba(0,0,0,.22);
      background: rgba(0,0,0,.08);
      overflow:hidden;
    }
    .bar > i{
      display:block; height:100%; width:50%;
      background: linear-gradient(180deg, rgba(0,0,0,.18), rgba(0,0,0,.10));
      box-shadow: inset 0 1px 0 rgba(255,255,255,.25);
    }
    .bar.warn > i{ background: linear-gradient(180deg, rgba(0,0,0,.22), rgba(0,0,0,.14)); }
    .bar.bad  > i{ background: linear-gradient(180deg, rgba(0,0,0,.26), rgba(0,0,0,.18)); }

    /* ROOM BACKGROUND */
    .bg{
      position:absolute; inset:0;
      pointer-events:none;
      z-index:1;
    }
    .stars{
      position:absolute; inset:0;
      opacity:.22;
      background:
        radial-gradient(circle, rgba(0,0,0,.30) 1px, transparent 2px) 0 0/34px 34px,
        radial-gradient(circle, rgba(0,0,0,.25) 1px, transparent 2px) 12px 18px/42px 42px;
      mix-blend-mode:multiply;
    }
    .window{
      position:absolute;
      top:68px; left:24px;
      width:160px; height:120px;
      border-radius:18px;
      border:1px solid rgba(0,0,0,.20);
      background:
        radial-gradient(120px 80px at 30% 30%, rgba(255,255,255,.35), transparent 60%),
        linear-gradient(180deg, rgba(255,255,255,.20), rgba(0,0,0,.06));
      opacity:.9;
    }
    .window::after{
      content:"";
      position:absolute; inset:10px;
      border-radius:14px;
      border:1px dashed rgba(0,0,0,.18);
      opacity:.7;
    }

    .floor{
      position:absolute;
      left:0; right:0; bottom:0;
      height:170px;
      background:
        linear-gradient(180deg, rgba(0,0,0,.08), rgba(0,0,0,.18)),
        repeating-linear-gradient(90deg,
          rgba(0,0,0,.10) 0px,
          rgba(0,0,0,.10) 2px,
          rgba(0,0,0,0) 6px,
          rgba(0,0,0,0) 10px);
      border-top:1px solid rgba(0,0,0,.20);
      opacity:.55;
    }

    .items{
      position:absolute;
      bottom:22px; left:18px; right:18px;
      display:flex;
      justify-content:space-between;
      gap:10px;
      opacity:.9;
      filter: drop-shadow(0 8px 12px rgba(0,0,0,.28));
    }
    .item{
      width:120px; height:70px;
      display:flex; align-items:center; justify-content:center;
      font-size:28px;
      color: rgba(0,0,0,.32);
      text-shadow: 0 2px 0 rgba(255,255,255,.25);
      border:none; background:transparent;
    }
    @media (max-width:520px){ .item{width:92px; height:64px; font-size:26px;} }

    /* ---------- CHARACTER WRAPPER ---------- */
    .pet{
      position:absolute;
      width:180px; height:180px;
      left:50%; top:52%;
      transform:translate(-50%,-50%);
      z-index:9;
      pointer-events:none;
    }
    .pet::before{
      content:"";
      position:absolute;
      left:50%; bottom:12px;
      width:110px; height:22px;
      transform:translateX(-50%);
      border-radius:50%;
      background: var(--catShadow);
      filter: blur(2px);
      opacity:.65;
      transition:transform .12s, opacity .12s;
    }

    /* Speech bubble */
    .bubble{
      position:absolute;
      left:50%;
      top:-54px;
      transform:translateX(-50%) scale(.96);
      padding:10px 12px;
      border-radius:14px;
      border:1px solid rgba(0,0,0,.22);
      background: rgba(255,255,255,.25);
      color: var(--lcdText);
      font-size:12px;
      max-width:300px;
      text-align:center;
      opacity:0;
      transition:opacity .14s, transform .14s;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.25);
    }
    .bubble.show{
      opacity:1;
      transform:translateX(-50%) translateY(-6px) scale(1);
      animation:bubblePop .22s ease-out;
    }
    @keyframes bubblePop{
      0%{transform:translateX(-50%) scale(.92)}
      70%{transform:translateX(-50%) translateY(-8px) scale(1.05)}
      100%{transform:translateX(-50%) translateY(-6px) scale(1)}
    }
    .bubble::after{
      content:"";
      position:absolute; left:50%; bottom:-7px;
      width:12px; height:12px;
      background: rgba(255,255,255,.25);
      border-right:1px solid rgba(0,0,0,.22);
      border-bottom:1px solid rgba(0,0,0,.22);
      transform:translateX(-50%) rotate(45deg);
    }

    /* ---------- 3D TOY CAT (PURE CSS) ---------- */
    .cat3d{
      position:absolute; inset:0;
      transform-style:preserve-3d;
      perspective: 900px;
      filter: drop-shadow(0 18px 20px rgba(0,0,0,.26));
    }

    /* body group */
    .cat{
      position:absolute;
      left:50%; top:54%;
      width:140px; height:140px;
      transform:translate(-50%,-50%);
      transform-style:preserve-3d;
    }

    /* Main body */
    .body{
      position:absolute;
      left:50%; top:58%;
      width:110px; height:86px;
      transform:translate(-50%,-50%);
      border-radius:44px;
      background:
        radial-gradient(70px 50px at 30% 25%, rgba(255,255,255,.55), transparent 60%),
        linear-gradient(180deg, var(--catFur1), var(--catFur3));
      box-shadow:
        inset 0 2px 0 rgba(255,255,255,.28),
        inset 0 -14px 18px rgba(0,0,0,.12);
      transform-style:preserve-3d;
    }
    .body::after{
      content:"";
      position:absolute; inset:10px 14px 22px 14px;
      border-radius:40px;
      background: radial-gradient(60px 50px at 50% 30%, rgba(255,255,255,.18), rgba(0,0,0,.06));
      opacity:.55;
    }

    /* Head */
    .head{
      position:absolute;
      left:50%; top:34%;
      width:120px; height:100px;
      transform:translate(-50%,-50%) translateZ(8px);
      border-radius:48px;
      background:
        radial-gradient(70px 55px at 28% 22%, rgba(255,255,255,.62), transparent 60%),
        linear-gradient(180deg, var(--catFur1), var(--catFur2));
      box-shadow:
        inset 0 2px 0 rgba(255,255,255,.28),
        inset 0 -18px 24px rgba(0,0,0,.12);
      transform-style:preserve-3d;
    }

    /* Ears */
    .ear{
      position:absolute;
      top:-10px;
      width:34px; height:34px;
      background: linear-gradient(180deg, var(--catFur1), var(--catFur3));
      border-radius:8px 28px 8px 28px;
      transform: rotate(12deg) translateZ(6px);
      box-shadow: inset 0 2px 0 rgba(255,255,255,.22);
    }
    .ear.left{ left:14px; transform: rotate(-18deg) translateZ(6px); }
    .ear.right{ right:14px; transform: rotate(18deg) translateZ(6px) scaleX(-1); }
    .ear::after{
      content:"";
      position:absolute; inset:8px 10px 10px 8px;
      border-radius:6px 20px 6px 18px;
      background: radial-gradient(circle at 30% 30%, rgba(255,170,170,.65), rgba(255,170,170,.25));
      opacity:.75;
    }

    /* Face elements */
    .face{
      position:absolute;
      left:50%; top:54%;
      width:90px; height:54px;
      transform:translate(-50%,-50%) translateZ(10px);
    }
    .eye{
      position:absolute; top:12px;
      width:16px; height:18px;
      border-radius:10px;
      background: rgba(0,0,0,.32);
      box-shadow: inset 0 2px 0 rgba(255,255,255,.22);
    }
    .eye.left{ left:14px; }
    .eye.right{ right:14px; }
    .eye::after{
      content:"";
      position:absolute; left:3px; top:3px;
      width:5px; height:6px;
      border-radius:50%;
      background: rgba(255,255,255,.55);
    }

    .nose{
      position:absolute;
      left:50%; top:34px;
      width:12px; height:9px;
      transform:translateX(-50%);
      border-radius: 0 0 8px 8px;
      background: rgba(0,0,0,.20);
    }
    .mouth{
      position:absolute;
      left:50%; top:42px;
      width:24px; height:12px;
      transform:translateX(-50%);
    }
    .mouth::before, .mouth::after{
      content:"";
      position:absolute; top:0;
      width:12px; height:10px;
      border-bottom:2px solid rgba(0,0,0,.22);
      border-radius: 0 0 14px 14px;
    }
    .mouth::before{ left:0; transform: rotate(8deg); }
    .mouth::after{ right:0; transform: rotate(-8deg); }

    /* Cheeks */
    .cheek{
      position:absolute; top:32px;
      width:16px; height:10px;
      border-radius:50%;
      background: rgba(255,140,140,.18);
    }
    .cheek.left{ left:2px; }
    .cheek.right{ right:2px; }

    /* Paws */
    .paw{
      position:absolute;
      bottom:16px;
      width:22px; height:18px;
      border-radius:12px;
      background: linear-gradient(180deg, var(--catFur1), var(--catFur3));
      box-shadow: inset 0 2px 0 rgba(255,255,255,.18);
      transform: translateZ(6px);
      opacity:.98;
    }
    .paw.left{ left:40px; }
    .paw.right{ right:40px; }

    /* Tail */
    .tail{
      position:absolute;
      right:8px;
      top:80px;
      width:56px; height:16px;
      border-radius:999px;
      background: linear-gradient(180deg, var(--catFur2), var(--catFur3));
      transform-origin: 10px 8px;
      transform: rotate(18deg) translateZ(-2px);
      box-shadow: inset 0 2px 0 rgba(255,255,255,.18);
      opacity:.95;
    }
    .tail::after{
      content:"";
      position:absolute; right:-2px; top:2px;
      width:16px; height:12px;
      border-radius:999px;
      background: rgba(255,255,255,.18);
      opacity:.35;
    }

    /* Nameplate */
    .nameplate{
      position:absolute;
      left:50%; bottom:-28px;
      transform:translateX(-50%);
      padding:6px 10px;
      border-radius:999px;
      border:1px solid rgba(0,0,0,.22);
      background: rgba(255,255,255,.25);
      font-size:12px;
      color: var(--lcdText2);
      white-space:nowrap;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.25);
    }

    /* Animations: idle / walk / blink / squash */
    @keyframes idleBob{
      0%,100%{ transform:translate(-50%,-50%) translateY(0); }
      50%{ transform:translate(-50%,-50%) translateY(-3px); }
    }
    @keyframes walkBob{
      0%,100%{ transform:translate(-50%,-50%) translateY(-1px) scaleX(1); }
      25%{ transform:translate(-50%,-50%) translateY(-5px) scaleX(.98); }
      50%{ transform:translate(-50%,-50%) translateY(-2px) scaleX(1.02); }
      75%{ transform:translate(-50%,-50%) translateY(-6px) scaleX(.99); }
    }
    @keyframes tailWag{
      0%,100%{ transform: rotate(18deg) translateZ(-2px); }
      50%{ transform: rotate(-12deg) translateZ(-2px); }
    }
    @keyframes blink{
      0%, 92%, 100%{ transform: scaleY(1); }
      94%{ transform: scaleY(.2); }
      96%{ transform: scaleY(1); }
    }
    @keyframes squash{
      0%{ transform:scale(1); }
      50%{ transform:scale(1.05,.95); }
      100%{ transform:scale(1); }
    }

    .pet{
      animation: idleBob 2.4s ease-in-out infinite;
    }
    .pet .tail{ animation: tailWag 1.8s ease-in-out infinite; }
    .pet .eye{ animation: blink 5.6s linear infinite; }

    .pet.moving{ animation: walkBob .55s ease-in-out infinite; }
    .pet.moving::before{
      transform:translateX(-50%) scale(1.06,.92);
      opacity:.55;
    }
    .pet.bump .cat{ animation: squash .12s ease-out; }

    /* ---------- CONTROLS ---------- */
    .controls{
      display:flex;
      justify-content:space-between;
      gap:12px;
      flex-wrap:wrap;
      padding:14px 8px 0;
    }
    .left, .right{ display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
    .hint{
      color:var(--uiMuted);
      font-size:12px;
      line-height:1.4;
      padding:10px 12px;
      border-radius:16px;
      border:1px solid rgba(255,255,255,.10);
      background:rgba(0,0,0,.10);
    }

    /* Small theme picker */
    .themeRow{
      display:flex; gap:8px; flex-wrap:wrap; align-items:center;
    }
    .tbtn{
      cursor:pointer;
      border:1px solid rgba(255,255,255,.14);
      background: rgba(0,0,0,.12);
      color: rgba(255,255,255,.86);
      padding:9px 10px;
      border-radius:999px;
      font-size:12px;
      user-select:none;
    }
    .tbtn:hover{ background: rgba(255,255,255,.08); }
    .tbtn.active{
      border-color: rgba(255,255,255,.22);
      background: rgba(255,255,255,.10);
    }

    /* Mobile spacing */
    @media (max-width:520px){
      .device{ border-radius: 30px; }
      .screen-shell{ border-radius:24px; }
      .screen{ border-radius: 20px; }
      .brand{ max-width: 100%; }
    }
  </style>
</head>

<body>
  <div class="device">
    <div class="screw tl"></div><div class="screw tr"></div><div class="screw bl"></div><div class="screw br"></div>

    <div class="inner">
      <div class="topbar">
        <div class="brand">
          <div class="title">CAT-MOGOTCHI · 3D Toy Tamagotchi</div>
          <div class="subtitle">
            방향키/WSAD 이동 · F(밥) P(놀기) R(휴식) C(청소) T(말걸기)
            · GitHub Pages에 <b>index.html</b> 하나로 업로드 OK
          </div>
        </div>

        <div class="actions">
          <div class="speaker" title="speaker"></div>
          <div class="pill"><span>컨디션</span> <strong id="moodText">보통</strong></div>
          <button class="btn primary" id="saveNow">저장</button>
          <button class="btn danger" id="resetAll">초기화</button>
        </div>
      </div>

      <div class="screen-shell">
        <div class="screen" id="screen">
          <div class="bg">
            <div class="stars"></div>
            <div class="window"></div>
            <div class="floor"></div>
            <div class="items" aria-hidden="true">
              <div class="item" title="밥">🍚</div>
              <div class="item" title="놀이">🧶</div>
              <div class="item" title="청소">🧽</div>
            </div>
          </div>

          <div class="hud">
            <div class="hud-left">
              <div class="hud-badge"><span>이름</span> <strong id="petName">냥이</strong></div>
              <div class="hud-badge"><span>배부름</span> <div class="bar" id="hungerBar"><i></i></div></div>
            </div>
            <div class="hud-right">
              <div class="hud-badge"><span>에너지</span> <div class="bar" id="energyBar"><i></i></div></div>
              <div class="hud-badge"><span>청결</span> <div class="bar" id="cleanBar"><i></i></div></div>
            </div>
          </div>

          <!-- PET -->
          <div class="pet" id="pet">
            <div class="bubble" id="bubble">...</div>

            <div class="cat3d">
              <div class="cat" id="cat">
                <div class="head">
                  <div class="ear left"></div>
                  <div class="ear right"></div>

                  <div class="face">
                    <div class="eye left"></div>
                    <div class="eye right"></div>
                    <div class="cheek left"></div>
                    <div class="cheek right"></div>
                    <div class="nose"></div>
                    <div class="mouth"></div>
                  </div>
                </div>

                <div class="body"></div>
                <div class="paw left"></div>
                <div class="paw right"></div>
                <div class="tail"></div>
              </div>
            </div>

            <div class="nameplate" id="nameplate">오늘도 나를 돌봐줘 😺</div>
          </div>
        </div>
      </div>

      <div class="controls">
        <div class="left">
          <button class="btn primary" id="btnFeed">🍚 FEED</button>
          <button class="btn" id="btnPlay">🧶 PLAY</button>
          <button class="btn" id="btnRest">😴 REST</button>
          <button class="btn" id="btnClean">🧽 CLEAN</button>
          <button class="btn" id="btnTalk">💬 TALK</button>
        </div>

        <div class="right">
          <div class="themeRow" title="테마 선택">
            <button class="tbtn" data-theme="lcd-green">Green LCD</button>
            <button class="tbtn" data-theme="lcd-blue">Blue LCD</button>
            <button class="tbtn" data-theme="mono">Mono</button>
          </div>
          <div class="hint">
            <b>이동</b>: 방향키 / WASD<br>
            <b>빠른키</b>: F 밥 · P 놀기 · R 휴식 · C 청소 · T 대화
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    /*********************************************************
      CAT-MOGOTCHI JS
      - Movement + .moving toggle + bump
      - Stats: hunger (배부름), energy, clean (청결), mood label
      - Decay over time + daily decay
      - Actions: feed/play/rest/clean/talk
      - Save/Load localStorage
      - Theme switch
    **********************************************************/
    (() => {
      "use strict";

      const STORAGE_KEY = "cat_mogotchi_v1";

      const $ = (s) => document.querySelector(s);
      const $$ = (s) => Array.from(document.querySelectorAll(s));
      const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
      const now = () => Date.now();
      const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

      const ui = {
        screen: $("#screen"),
        pet: $("#pet"),
        cat: $("#cat"),
        bubble: $("#bubble"),
        moodText: $("#moodText"),
        petName: $("#petName"),
        nameplate: $("#nameplate"),

        hungerBar: $("#hungerBar"),
        energyBar: $("#energyBar"),
        cleanBar: $("#cleanBar"),

        btnFeed: $("#btnFeed"),
        btnPlay: $("#btnPlay"),
        btnRest: $("#btnRest"),
        btnClean: $("#btnClean"),
        btnTalk: $("#btnTalk"),

        saveNow: $("#saveNow"),
        resetAll: $("#resetAll"),

        themeButtons: $$("[data-theme]"),
      };

      function dayKey(ts = Date.now()){
        const d = new Date(ts);
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      }

      function defaultState(){
        return {
          name: "냥이",
          pos: { x: 0, y: 0 },  // inside screen
          dir: { x: 0, y: 0 },
          lastDir: { x: 0, y: 0 },

          // 0..100 (높을수록 좋음)
          hunger: 68,
          energy: 70,
          clean: 62,

          mood: 60, // internal

          lastActiveDay: "",
          lastSavedAt: 0,
          lastActionAt: 0,
        };
      }

      function loadState(){
        try{
          const raw = localStorage.getItem(STORAGE_KEY);
          if(!raw) return defaultState();
          const s = JSON.parse(raw);
          const base = defaultState();
          return {
            ...base,
            ...s,
            pos: { ...base.pos, ...(s.pos||{}) },
            dir: { ...base.dir, ...(s.dir||{}) },
            lastDir: { ...base.lastDir, ...(s.lastDir||{}) },
          };
        }catch{
          localStorage.removeItem(STORAGE_KEY);
          return defaultState();
        }
      }

      let state = loadState();

      function saveState(){
        state.lastSavedAt = now();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }

      function setBar(el, value){
        const v = clamp(value, 0, 100);
        const i = el?.querySelector("i");
        if(i) i.style.width = `${v}%`;
        el?.classList.toggle("warn", v < 55 && v >= 30);
        el?.classList.toggle("bad", v < 30);
      }

      function moodLabel(){
        // 간단: hunger/energy/clean 합산으로 컨디션 라벨
        const score = (state.hunger*0.40 + state.energy*0.35 + state.clean*0.25);
        if(score >= 75) return "좋음";
        if(score >= 48) return "보통";
        return "힘듦";
      }

      function ensurePosition(){
        const rect = ui.screen.getBoundingClientRect();
        const w = 180, h = 180;
        const pad = 10;

        if(state.pos.x === 0 && state.pos.y === 0){
          state.pos.x = rect.width/2 - w/2;
          state.pos.y = rect.height*0.58 - h/2;
        }
        state.pos.x = clamp(state.pos.x, pad, rect.width - w - pad);
        state.pos.y = clamp(state.pos.y, 90, rect.height - h - 22);
      }

      function render(){
        ensurePosition();

        ui.pet.style.left = `${state.pos.x + 90}px`;
        ui.pet.style.top  = `${state.pos.y + 90}px`;

        ui.petName.textContent = state.name || "냥이";
        ui.moodText.textContent = moodLabel();

        setBar(ui.hungerBar, state.hunger);
        setBar(ui.energyBar, state.energy);
        setBar(ui.cleanBar, state.clean);

        // nameplate message based on mood
        const m = moodLabel();
        ui.nameplate.textContent =
          m === "좋음" ? "오늘 컨디션 최고 😺" :
          m === "보통" ? "조금만 더 돌봐줘 😺" :
                         "나… 좀 힘들어 🥺";
      }

      function showBubble(msg, ms=1400){
        ui.bubble.textContent = msg;
        ui.bubble.classList.add("show");
        clearTimeout(showBubble._t);
        showBubble._t = setTimeout(()=>ui.bubble.classList.remove("show"), ms);
      }

      function bump(){
        ui.pet.classList.add("bump");
        clearTimeout(bump._t);
        bump._t = setTimeout(()=>ui.pet.classList.remove("bump"), 140);
      }

      /* ---------- DAILY + DECAY ---------- */
      function applyDailyLogic(){
        const today = dayKey();
        if(!state.lastActiveDay){
          state.lastActiveDay = today;
          return;
        }
        if(state.lastActiveDay === today) return;

        const last = new Date(state.lastActiveDay + "T00:00:00");
        const t = new Date(today + "T00:00:00");
        const diffDays = Math.round((t - last) / 86400000);
        const d = clamp(diffDays, 1, 7);

        // missed days: drains
        state.hunger = clamp(state.hunger - 12*d, 0, 100);
        state.energy = clamp(state.energy - 10*d, 0, 100);
        state.clean  = clamp(state.clean  - 14*d, 0, 100);

        state.lastActiveDay = today;
        showBubble("새로운 하루야! 다시 시작하자 😺", 1700);
      }

      function tickDecay(dtMs){
        const dt = dtMs/1000;

        // slow drain baseline
        state.hunger = clamp(state.hunger - dt*0.040, 0, 100);
        state.energy = clamp(state.energy - dt*0.030, 0, 100);
        state.clean  = clamp(state.clean  - dt*0.020, 0, 100);

        // mood converges
        const target = (state.hunger*0.40 + state.energy*0.35 + state.clean*0.25);
        state.mood = clamp(state.mood + (target - state.mood)*0.02, 0, 100);
      }

      /* ---------- ACTIONS ---------- */
      function actFeed(){
        state.hunger = clamp(state.hunger + 28, 0, 100);
        state.energy = clamp(state.energy + 6, 0, 100);
        state.clean  = clamp(state.clean  - 2, 0, 100); // 밥먹으면 살짝 어질
        state.lastActionAt = now();
        showBubble("🍚 냠냠… 배불러!", 1500);
        bump();
        saveState();
      }

      function actPlay(){
        // play increases mood but costs energy & hunger a bit
        state.energy = clamp(state.energy - 14, 0, 100);
        state.hunger = clamp(state.hunger - 9, 0, 100);
        state.clean  = clamp(state.clean  - 6, 0, 100);
        state.mood   = clamp(state.mood + 10, 0, 100);
        state.lastActionAt = now();
        showBubble("🧶 야호! 더 놀자!", 1500);
        bump();
        saveState();
      }

      function actRest(){
        state.energy = clamp(state.energy + 28, 0, 100);
        state.hunger = clamp(state.hunger - 4, 0, 100);
        state.clean  = clamp(state.clean  - 1, 0, 100);
        state.lastActionAt = now();
        showBubble("😴 잠깐 쉬자…", 1500);
        bump();
        saveState();
      }

      function actClean(){
        state.clean  = clamp(state.clean + 32, 0, 100);
        state.energy = clamp(state.energy - 6, 0, 100);
        state.lastActionAt = now();
        showBubble("🧽 반짝반짝! 기분 좋아!", 1500);
        bump();
        saveState();
      }

      function actTalk(){
        const m = moodLabel();
        const linesGood = [
          "오늘은 완전 행복해!",
          "너랑 있으면 안정돼 😺",
          "밥도 주고 놀아줘서 고마워!",
          "지금 이 속도가 딱 좋아.",
        ];
        const linesOk = [
          "한 가지만 해도 괜찮아.",
          "오늘은 유지가 성공이야.",
          "물 한 잔, 밥 한 끼… 그런 거!",
          "너 자신을 너무 몰아붙이지 마.",
        ];
        const linesBad = [
          "배고파… 🥺",
          "나 좀 지쳤어… 쉬어도 돼?",
          "방이 조금 지저분해…",
          "오늘은 최소만 하자.",
        ];
        const msg = m==="좋음" ? pick(linesGood) : m==="보통" ? pick(linesOk) : pick(linesBad);
        showBubble(`😺 ${msg}`, 1700);
        state.lastActionAt = now();
        saveState();
      }

      /* ---------- MOVEMENT ---------- */
      const keys = new Set();

      function computeDir(){
        let dx=0, dy=0;
        if(keys.has("arrowleft")||keys.has("a")) dx -= 1;
        if(keys.has("arrowright")||keys.has("d")) dx += 1;
        if(keys.has("arrowup")||keys.has("w")) dy -= 1;
        if(keys.has("arrowdown")||keys.has("s")) dy += 1;
        if(dx!==0 && dy!==0){ dx*=0.7071; dy*=0.7071; }
        state.dir.x = dx; state.dir.y = dy;
      }

      function directionBump(){
        const changed =
          (state.dir.x !== 0 && state.lastDir.x !== 0 && Math.sign(state.dir.x) !== Math.sign(state.lastDir.x)) ||
          (state.dir.y !== 0 && state.lastDir.y !== 0 && Math.sign(state.dir.y) !== Math.sign(state.lastDir.y));
        if(changed) bump();
        state.lastDir.x = state.dir.x;
        state.lastDir.y = state.dir.y;
      }

      function move(dtMs){
        computeDir();
        const moving = Math.abs(state.dir.x)+Math.abs(state.dir.y) > 0.05;
        ui.pet.classList.toggle("moving", moving);

        const rect = ui.screen.getBoundingClientRect();
        const w=180, h=180;
        const pad=10;

        // speed depends on energy
        const baseSpeed = 0.22; // px per ms
        const energyFactor = clamp(0.55 + (state.energy/100)*0.65, 0.55, 1.2);

        const vx = state.dir.x * baseSpeed * dtMs * energyFactor;
        const vy = state.dir.y * baseSpeed * dtMs * energyFactor;

        state.pos.x = clamp(state.pos.x + vx, pad, rect.width - w - pad);
        state.pos.y = clamp(state.pos.y + vy, 90, rect.height - h - 22);

        // moving drains slightly
        if(moving){
          state.energy = clamp(state.energy - dtMs*0.0025, 0, 100);
          state.hunger = clamp(state.hunger - dtMs*0.0016, 0, 100);
        }

        // head tilt based on dx
        const tilt = clamp(state.dir.x*10, -10, 10);
        ui.cat.style.transform = `translate(-50%,-50%) rotateY(${tilt}deg)`;

        directionBump();
      }

      function onKeyDown(e){
        if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) e.preventDefault();
        const k = e.key.toLowerCase();
        keys.add(k);

        // hotkeys
        if(k==="f") actFeed();
        if(k==="p") actPlay();
        if(k==="r") actRest();
        if(k==="c") actClean();
        if(k==="t") actTalk();
      }
      function onKeyUp(e){ keys.delete(e.key.toLowerCase()); }

      /* ---------- THEME ---------- */
      function setTheme(theme){
        document.documentElement.dataset.theme = theme;
        ui.themeButtons.forEach(b => b.classList.toggle("active", b.dataset.theme === theme));
        showBubble(`테마 변경: ${theme}`, 1200);
        saveState();
      }

      /* ---------- LOOP ---------- */
      let lastTs = now();
      function loop(){
        const ts = now();
        const dt = ts - lastTs;
        lastTs = ts;

        applyDailyLogic();
        tickDecay(dt);
        move(dt);

        // autosave every 10s
        if(ts - (state.lastSavedAt||0) > 10000) saveState();

        render();
        requestAnimationFrame(loop);
      }

      /* ---------- BIND ---------- */
      function bind(){
        ui.btnFeed.addEventListener("click", () => { actFeed(); render(); });
        ui.btnPlay.addEventListener("click", () => { actPlay(); render(); });
        ui.btnRest.addEventListener("click", () => { actRest(); render(); });
        ui.btnClean.addEventListener("click", () => { actClean(); render(); });
        ui.btnTalk.addEventListener("click", () => { actTalk(); render(); });

        ui.saveNow.addEventListener("click", () => {
          saveState();
          showBubble("저장 완료!", 1200);
        });

        ui.resetAll.addEventListener("click", () => {
          if(!confirm("정말 초기화할까? (저장된 상태가 모두 삭제돼)")) return;
          localStorage.removeItem(STORAGE_KEY);
          state = defaultState();
          ensurePosition();
          render();
          showBubble("초기화 완료!", 1200);
        });

        ui.themeButtons.forEach(btn => {
          btn.addEventListener("click", () => setTheme(btn.dataset.theme));
        });

        window.addEventListener("keydown", onKeyDown, { passive:false });
        window.addEventListener("keyup", onKeyUp);
        window.addEventListener("resize", () => { ensurePosition(); render(); saveState(); });
      }

      /* ---------- INIT ---------- */
      function init(){
        // initial position + active theme buttons
        ensurePosition();
        render();
        bind();

        // set active button state based on current theme
        const currentTheme = document.documentElement.dataset.theme || "lcd-green";
        ui.themeButtons.forEach(b => b.classList.toggle("active", b.dataset.theme === currentTheme));

        // friendly hello
        showBubble("😺 안녕! 오늘도 같이 가자.", 1500);

        requestAnimationFrame(loop);
      }

      init();
    })();
  </script>
</body>
</html>
