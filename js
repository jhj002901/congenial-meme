:root{
  --bg0:#070B14;
  --bg1:#0B1224;

  --card: rgba(255,255,255,.06);
  --card2: rgba(255,255,255,.09);

  --stroke: rgba(255,255,255,.10);
  --stroke2: rgba(255,255,255,.16);

  --text: rgba(255,255,255,.92);
  --muted: rgba(255,255,255,.70);
  --muted2: rgba(255,255,255,.55);

  --brand:#7AA7FF;
  --brand2:#7E5CFF;
  --accent:#2EE59D;

  --shadow: 0 18px 70px rgba(0,0,0,.35);
  --radius: 18px;
  --radius2: 26px;

  --max: 1120px;
}

*{ box-sizing:border-box; }
html,body{ height:100%; }
body{
  margin:0;
  color:var(--text);
  font-family: "Outfit","Noto Sans KR",system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
  background:
    radial-gradient(1200px 700px at 20% 0%, rgba(126,92,255,.25), transparent 60%),
    radial-gradient(1100px 700px at 85% 15%, rgba(122,167,255,.22), transparent 58%),
    radial-gradient(900px 600px at 50% 100%, rgba(46,229,157,.12), transparent 55%),
    linear-gradient(180deg, var(--bg0), var(--bg1));
  overflow-x:hidden;
}

a{ color:inherit; text-decoration:none; }
b{ font-weight:700; }
.container{
  max-width:var(--max);
  margin:0 auto;
  padding: 0 20px;
}

/* Background layers */
.bg-grid{
  position: fixed;
  inset: 0;
  pointer-events:none;
  background-image:
    linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(circle at 50% 18%, rgba(0,0,0,1), rgba(0,0,0,.2) 55%, rgba(0,0,0,0) 78%);
  opacity: .22;
  z-index: -2;
}

.bg-orbs{ position: fixed; inset:0; pointer-events:none; z-index:-1; }
.orb{
  position:absolute;
  filter: blur(20px);
  opacity:.55;
  border-radius: 999px;
}
.orb.o1{
  width: 420px; height: 420px;
  left: -120px; top: -120px;
  background: radial-gradient(circle, rgba(122,167,255,.55), transparent 65%);
}
.orb.o2{
  width: 520px; height: 520px;
  right: -180px; top: -160px;
  background: radial-gradient(circle, rgba(126,92,255,.50), transparent 65%);
}
.orb.o3{
  width: 520px; height: 520px;
  left: 35%; bottom: -260px;
  background: radial-gradient(circle, rgba(46,229,157,.30), transparent 65%);
}

/* Header */
.header{
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(14px);
  background: linear-gradient(180deg, rgba(7,11,20,.72), rgba(7,11,20,.30));
  border-bottom: 1px solid rgba(255,255,255,.06);
}

.nav{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 14px;
  padding: 14px 0;
}

.brand{
  display:flex;
  align-items:center;
  gap: 12px;
  min-width: 240px;
}
.logo{
  width: 40px;
  height: 40px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(122,167,255,.95), rgba(126,92,255,.90));
  border: 1px solid rgba(255,255,255,.22);
  box-shadow: 0 16px 55px rgba(122,167,255,.18);
  position: relative;
  overflow:hidden;
}
.logo::before{
  content:"";
  position:absolute;
  inset:-40%;
  background: radial-gradient(circle, rgba(255,255,255,.55), transparent 60%);
  transform: rotate(35deg);
  opacity:.35;
}
.logo.sm{ width: 34px; height: 34px; border-radius: 12px; }
.brand-txt strong{ font-size: 14px; font-weight:700; letter-spacing:.2px; }
.brand-txt small{ display:block; margin-top:2px; color: var(--muted2); font-size: 12px; }

.menu{
  display:flex;
  gap: 10px;
  align-items:center;
}
.menu a{
  font-size: 13px;
  font-weight: 500;
  color: var(--muted);
  padding: 10px 10px;
  border-radius: 12px;
  border: 1px solid transparent;
  transition: .16s ease;
}
.menu a:hover{
  color: var(--text);
  background: rgba(255,255,255,.04);
  border-color: rgba(255,255,255,.10);
}

.nav-actions{
  display:flex;
  align-items:center;
  gap: 10px;
  min-width: 260px;
  justify-content:flex-end;
}

/* Buttons */
.btn{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.05);
  color: var(--text);
  font-size: 13px;
  font-weight: 700;
  cursor:pointer;
  user-select:none;
  transition: transform .14s ease, background .14s ease, border-color .14s ease, box-shadow .14s ease;
}
.btn:hover{
  transform: translateY(-1px);
  background: rgba(255,255,255,.07);
  border-color: rgba(255,255,255,.18);
}
.btn:active{ transform: translateY(0px); }

.btn.primary{
  background: linear-gradient(135deg, rgba(122,167,255,.95), rgba(126,92,255,.88));
  border-color: rgba(122,167,255,.35);
  box-shadow: 0 18px 60px rgba(122,167,255,.22);
}
.btn.primary:hover{ transform: translateY(-2px); }

.btn.ghost{
  background: rgba(255,255,255,.03);
  border-color: rgba(255,255,255,.10);
}
.btn.tiny{
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.btn.wide{
  width: 100%;
}

.arrow{
  width: 18px;
  height: 18px;
  border-radius: 999px;
  display:inline-grid;
  place-items:center;
  background: rgba(0,0,0,.18);
  border: 1px solid rgba(255,255,255,.22);
}

/* Sections */
.section{ padding: 54px 0; }
.section.hero{ padding: 64px 0 34px; }

.section-head{
  display:flex;
  align-items:flex-end;
  justify-content:space-between;
  gap: 14px;
  margin-bottom: 16px;
}

.h2{
  margin:0 0 10px;
  font-size: 20px;
  letter-spacing: -.2px;
}
.h3{
  margin:0 0 8px;
  font-size: 15px;
  letter-spacing: -.12px;
}
.p{
  margin:0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.75;
}
.muted{ color: var(--muted); }
.muted2{ color: var(--muted2); }

.head-actions{ display:flex; gap:10px; }

/* Hero */
.hero-grid{
  display:grid;
  grid-template-columns: 1.25fr .75fr;
  gap: 20px;
  align-items: start;
}

.hero-card{
  border-radius: var(--radius2);
  border: 1px solid rgba(255,255,255,.10);
  background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03));
  box-shadow: var(--shadow);
  padding: 34px;
  position: relative;
  overflow:hidden;
}
.hero-card::before{
  content:"";
  position:absolute;
  inset:-2px;
  background:
    radial-gradient(800px 240px at 30% 0%, rgba(122,167,255,.25), transparent 60%),
    radial-gradient(650px 240px at 80% 20%, rgba(126,92,255,.20), transparent 60%);
  opacity: .85;
  pointer-events:none;
  mask-image: radial-gradient(circle at 30% 25%, rgba(0,0,0,1), rgba(0,0,0,0) 62%);
}

.pill{
  display:inline-flex;
  align-items:center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid var(--stroke);
  background: rgba(255,255,255,.04);
  backdrop-filter: blur(10px);
  box-shadow: 0 12px 40px rgba(0,0,0,.18);
  font-size: 13px;
  color: var(--muted);
}
.dot{
  width: 8px; height: 8px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--brand), var(--brand2));
  box-shadow: 0 0 18px rgba(122,167,255,.55);
}

.hero-title{
  margin: 16px 0 10px;
  font-size: clamp(30px, 4.6vw, 46px);
  line-height: 1.06;
  letter-spacing: -.6px;
}
.hero-desc{
  margin: 0;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.75;
  max-width: 60ch;
}
.hero-actions{
  display:flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 18px;
}
.chips{
  display:flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}
.chip{
  font-size: 12px;
  color: var(--muted);
  padding: 8px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(255,255,255,.03);
}

/* Hero side */
.hero-side{
  display:grid;
  gap: 12px;
}
.metric{
  border-radius: var(--radius);
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(255,255,255,.04);
  backdrop-filter: blur(12px);
  box-shadow: 0 16px 55px rgba(0,0,0,.18);
  padding: 16px;
}
.metric-top{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 10px;
  margin-bottom: 8px;
}
.k{ font-size: 12px; color: var(--muted); }
.badge{
  display:inline-flex;
  align-items:center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 999px;
  border: 1px solid var(--stroke);
  background: rgba(255,255,255,.04);
  color: var(--muted);
  font-size: 12px;
  white-space: nowrap;
}
.v{
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -.35px;
}
.bar{
  height: 10px;
  margin-top: 12px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(122,167,255,.9), rgba(126,92,255,.85), rgba(46,229,157,.75));
  opacity:.85;
}

.mini-card{
  border-radius: var(--radius);
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(255,255,255,.04);
  padding: 16px;
  box-shadow: 0 16px 55px rgba(0,0,0,.18);
}
.mini-title{
  font-weight: 800;
  letter-spacing: -.2px;
  margin-bottom: 10px;
}
.mini-list{
  margin: 0 0 12px 18px;
  padding: 0;
  color: var(--muted);
  line-height: 1.7;
  font-size: 13px;
}

/* Cards */
.cards{
  display:grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
.card{
  border-radius: var(--radius);
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(255,255,255,.04);
  box-shadow: 0 18px 60px rgba(0,0,0,.18);
  padding: 18px;
  min-height: 168px;
  position: relative;
  overflow:hidden;
}
.card::before{
  content:"";
  position:absolute;
  inset:-2px;
  background:
    radial-gradient(300px 120px at 20% 0%, rgba(122,167,255,.22), transparent 65%),
    radial-gradient(260px 120px at 80% 20%, rgba(126,92,255,.18), transparent 60%);
  opacity: .55;
  pointer-events:none;
}
.icon{
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display:grid;
  place-items:center;
  border: 1px solid rgba(255,255,255,.14);
  background: rgba(255,255,255,.05);
  margin-bottom: 10px;
}
.tags{
  display:flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
.tag{
  font-size: 12px;
  color: var(--muted2);
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(255,255,255,.03);
}

/* Timeline */
.timeline{
  display:grid;
  gap: 12px;
}
.step{
  border-radius: var(--radius);
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(255,255,255,.04);
  box-shadow: 0 18px 60px rgba(0,0,0,.18);
  padding: 16px;
  display:grid;
  grid-template-columns: 68px 1fr;
  gap: 12px;
  align-items:flex-start;
}
.step-no{
  width: 56px; height: 56px;
  border-radius: 18px;
  display:grid;
  place-items:center;
  font-weight: 900;
  letter-spacing: -.4px;
  border: 1px solid rgba(122,167,255,.25);
  background: linear-gradient(135deg, rgba(122,167,255,.20), rgba(126,92,255,.16));
}

/* Archive */
.archive-grid{
  display:grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
.archive-card{
  border-radius: var(--radius);
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(255,255,255,.04);
  box-shadow: 0 18px 60px rgba(0,0,0,.18);
  padding: 18px;
}
.archive-top{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 10px;
  margin-bottom: 10px;
}
.archive-bottom{
  display:flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

/* CTA */
.cta{
  border-radius: var(--radius2);
  border: 1px solid rgba(255,255,255,.10);
  background:
    radial-gradient(800px 240px at 20% 0%, rgba(46,229,157,.18), transparent 60%),
    radial-gradient(700px 260px at 80% 25%, rgba(122,167,255,.25), transparent 60%),
    linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03));
  box-shadow: var(--shadow);
  padding: 22px;
  display:grid;
  grid-template-columns: 1.2fr .8fr;
  gap: 16px;
  align-items:start;
}
.cta-mini{
  display:flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}
.cta-right{
  display:grid;
  gap: 10px;
}
.hint{
  display:flex;
  gap: 10px;
  align-items:center;
  color: var(--muted2);
  font-size: 12px;
  padding-top: 6px;
}

/* FAQ */
.faq{
  display:grid;
  gap: 10px;
}
.faq-item{
  border-radius: var(--radius);
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(255,255,255,.04);
  box-shadow: 0 18px 60px rgba(0,0,0,.18);
  padding: 12px 14px;
}
.faq-item summary{
  cursor:pointer;
  font-weight: 800;
  letter-spacing: -.1px;
  color: var(--text);
}
.faq-body{ margin-top: 10px; }

/* Footer */
.footer{
  padding: 26px 0 38px;
  border-top: 1px solid rgba(255,255,255,.06);
  margin-top: 10px;
}
.foot{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.foot-brand{
  display:flex;
  gap: 12px;
  align-items:center;
}
.foot-brand strong{ font-size: 14px; }
.foot-brand small{ display:block; margin-top:2px; font-size: 12px; color: var(--muted2); }
.foot-links{
  display:flex;
  gap: 12px;
  flex-wrap: wrap;
}
.foot-links a{
  font-size: 12px;
  color: var(--muted);
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid transparent;
  transition:.16s ease;
}
.foot-links a:hover{
  color: var(--text);
  background: rgba(255,255,255,.04);
  border-color: rgba(255,255,255,.10);
}

/* Modal */
.modal{
  position: fixed;
  inset: 0;
  display:none;
  z-index: 100;
}
.modal.show{ display:block; }
.modal-backdrop{
  position:absolute;
  inset:0;
  background: rgba(0,0,0,.55);
  backdrop-filter: blur(6px);
}
.modal-panel{
  position: relative;
  width: min(720px, calc(100% - 28px));
  margin: 76px auto;
  border-radius: var(--radius2);
  border: 1px solid rgba(255,255,255,.12);
  background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.05));
  box-shadow: var(--shadow);
  overflow:hidden;
}
.modal-head{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 10px;
  padding: 16px 16px 10px;
  border-bottom: 1px solid rgba(255,255,255,.08);
}
.icon-btn{
  width: 40px; height: 40px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.04);
  color: var(--text);
  cursor:pointer;
  transition: .14s ease;
}
.icon-btn:hover{
  background: rgba(255,255,255,.06);
  border-color: rgba(255,255,255,.18);
  transform: translateY(-1px);
}
.modal-body{ padding: 14px 16px 16px; }
.pre{
  margin: 12px 0 0;
  padding: 14px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(0,0,0,.18);
  color: rgba(255,255,255,.88);
  overflow:auto;
  line-height: 1.65;
  font-size: 13px;
}
.modal-actions{
  display:flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 12px;
}

/* Toast */
.toast{
  position: fixed;
  left: 50%;
  bottom: 26px;
  transform: translateX(-50%) translateY(8px);
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,.14);
  background: rgba(10,16,32,.78);
  backdrop-filter: blur(12px);
  color: rgba(255,255,255,.88);
  font-size: 13px;
  box-shadow: 0 16px 50px rgba(0,0,0,.28);
  opacity: 0;
  pointer-events: none;
  transition: opacity .18s ease, transform .18s ease;
  z-index: 120;
}
.toast.show{
  opacity: 1;
  transform: translateX(-50%) translateY(0px);
}

/* Reveal animation */
.reveal{
  opacity: 0;
  transform: translateY(12px);
  transition: opacity .55s ease, transform .55s ease;
}
.reveal.in{
  opacity: 1;
  transform: translateY(0px);
}

/* Responsive */
@media (max-width: 980px){
  .menu{ display:none; }
  .nav-actions{ min-width:auto; }
  .hero-grid{ grid-template-columns: 1fr; }
  .cards{ grid-template-columns: 1fr; }
  .archive-grid{ grid-template-columns: 1fr; }
  .cta{ grid-template-columns: 1fr; }
  .section{ padding: 40px 0; }
  .section.hero{ padding: 52px 0 26px; }
  .hero-card{ padding: 24px; }
  .step{ grid-template-columns: 58px 1fr; }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce){
  .reveal{ transition:none; }
  .btn{ transition:none; }
  .toast{ transition:none; }
}
