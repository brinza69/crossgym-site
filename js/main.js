/* ── Burger menu: panou fullscreen cinetic ────────────────────────────
   Refoloseste <nav id="menu"> existent (linkurile raman neschimbate in
   HTML). Straturile decorative sunt create aici, ca sa nu fie nevoie de
   modificari in cele 9 fisiere HTML; au aria-hidden, deci nu apar in
   arborele de accesibilitate.                                          */
const burger = document.querySelector('.burger');
const menu = document.getElementById('menu');

if (burger && menu) {
  // Scrim-ul (valul intunecat peste pagina) — singurul strat din afara meniului.
  const kin = document.createElement('div');
  kin.className = 'kin-nav';
  kin.setAttribute('aria-hidden', 'true');
  kin.innerHTML = '<div class="kin-scrim"></div>';
  document.body.appendChild(kin);

  // Fundalul si formele ambientale intra CHIAR IN .menu, nu intr-un container
  // separat. Motivul: .menu e position:fixed (ancorat la viewport), iar un
  // strat absolute intr-un alt container se poate alinia gresit daca pagina
  // are latime diferita de viewport — exact bug-ul in care panoul ajungea in
  // afara ecranului. Asa, fundalul urmeaza intotdeauna exact panoul.
  const deco = document.createElement('div');
  deco.className = 'kin-deco';
  deco.setAttribute('aria-hidden', 'true');
  deco.innerHTML =
    '<span class="kin-deco__bg"></span>' +
    '<svg class="kin-shapes" viewBox="0 0 400 800" fill="none" preserveAspectRatio="xMidYMid slice">' +
      '<circle cx="330" cy="120" r="70"  fill="rgba(255,210,31,.10)"/>' +
      '<circle cx="70"  cy="300" r="110" fill="rgba(255,210,31,.06)"/>' +
      '<circle cx="350" cy="520" r="50"  fill="rgba(255,210,31,.12)"/>' +
      '<circle cx="120" cy="680" r="90"  fill="rgba(255,210,31,.05)"/>' +
      '<circle cx="280" cy="700" r="34"  fill="rgba(255,210,31,.14)"/>' +
    '</svg>';
  menu.insertBefore(deco, menu.firstChild);

  /* Blocarea scroll-ului in spatele meniului.
     `overflow:hidden` pe <body> NU functioneaza: elementul care deruleaza
     este <html>, nu <body>. Iar pe iOS Safari nici `overflow:hidden` pe
     <html> nu e de incredere — bara de adresa reintroduce derularea.

     Metoda sigura peste tot: retinem pozitia, fixam body-ul deplasat in sus
     cu exact acea valoare (deci nu sare imaginea), iar la inchidere derulam
     inapoi. Meniul in sine ramane derulabil intern (overflow-y:auto). */
  var scrollSalvat = 0;

  const blocheazaScroll = function (activ) {
    if (activ) {
      scrollSalvat = window.pageYOffset || document.documentElement.scrollTop || 0;
      document.body.style.position = 'fixed';
      document.body.style.top = (-scrollSalvat) + 'px';
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.classList.add('kin-lock');
    } else {
      document.body.classList.remove('kin-lock');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollSalvat);
    }
  };

  const setare = function (deschis) {
    if (deschis) {
      // Fortam un reflow inainte de a adauga clasa. Fara asta, tranzitia nu
      // porneste fiabil: elementul vine din visibility:hidden si, in acelasi
      // cadru, body isi schimba pozitionarea (relayout), asa ca browserul
      // poate sari direct la starea finala sau intarzia pornirea animatiei.
      void menu.offsetWidth;
      void kin.offsetWidth;
    }
    menu.classList.toggle('show', deschis);
    kin.classList.toggle('is-open', deschis);
    blocheazaScroll(deschis);
    burger.setAttribute('aria-expanded', deschis ? 'true' : 'false');
    burger.setAttribute('aria-label', deschis ? 'Închide meniul' : 'Deschide meniul');
    burger.innerHTML = deschis ? '&times;' : '&#9776;';
  };

  const esteDeschis = function () { return menu.classList.contains('show'); };

  burger.addEventListener('click', function () { setare(!esteDeschis()); });

  // click pe fundal inchide
  kin.querySelector('.kin-scrim').addEventListener('click', function () { setare(false); });

  // click pe un link inchide (navigarea catre ancore ramane vizibila)
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) setare(false);
  });

  // Escape inchide
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && esteDeschis()) { setare(false); burger.focus(); }
  });

  // daca se trece pe desktop cu meniul deschis, curatam starea
  window.addEventListener('resize', function () {
    if (window.innerWidth > 980 && esteDeschis()) setare(false);
  }, { passive: true });
}


// Reveal on scroll
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('show'); io.unobserve(e.target); } });
},{threshold:0.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

// Lightbox
const lb = document.getElementById('lb');
if (lb){
  document.querySelectorAll('[data-lightbox]').forEach(img=>{
    img.addEventListener('click', ()=>{
      lb.querySelector('img').src = img.getAttribute('src');
      lb.classList.add('show');
    });
  });
  lb.addEventListener('click', ()=> lb.classList.remove('show'));
}

document.addEventListener('DOMContentLoaded', () => {
    const hero = document.querySelector('.hero-landing');
    if (!hero) return;
  
    // pornește animația imediat ce DOM e gata
    requestAnimationFrame(() => hero.classList.add('animate'));
  });


  /* ===================== COUNT-UP (on view) ===================== */
// (function () {
//     const $ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
//     const counters = $('[data-count]');
//     if (!counters.length) return;
  
//     // easing mai fin
//     const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
  
//     // formatare cu separatori + zecimale
//     const format = (n, decimals = 0, grouping = true) => {
//       const opts = { minimumFractionDigits: decimals, maximumFractionDigits: decimals };
//       return grouping ? n.toLocaleString('ro-RO', opts) : n.toFixed(decimals);
//     };
  
//     // animarea unui element
//     const animate = (el) => {
//       if (el.dataset.counted) return;           // rulează o singură dată
//       el.dataset.counted = '1';
  
//       const to        = parseFloat(el.dataset.count);            // valoarea finală
//       const from      = parseFloat(el.dataset.from || 0);        // start (implicit 0)
//       const duration  = parseInt(el.dataset.duration || 1500, 10); // ms
//       const decimals  = parseInt(el.dataset.decimals || 0, 10);  // zecimale
//       const prefix    = el.dataset.prefix  || '';                // ex: +
//       const suffix    = el.dataset.suffix  || '';                // ex: +
//       const grouping  = el.dataset.grouping !== 'false';         // separatori 1.000
  
//       const t0 = performance.now();
//       const step = (now) => {
//         const p = Math.min(1, (now - t0) / duration);
//         const eased = easeOutCubic(p);
//         const val = from + (to - from) * eased;
//         el.textContent = prefix + format(val, decimals, grouping) + suffix;
//         if (p < 1) requestAnimationFrame(step);
//       };
//       requestAnimationFrame(step);
//     };
  
//     // pornește la vizibilitate
//     if ('IntersectionObserver' in window) {
//       const io = new IntersectionObserver((entries) => {
//         entries.forEach(e => {
//           if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); }
//         });
//       }, { threshold: 0.35 });
//       counters.forEach(el => io.observe(el));
//     } else {
//       // fallback pt. browsere vechi
//       counters.forEach(animate);
//     }
//   })();

// ===== Stats counter fără separatori de mii =====
(function () {
  const els = document.querySelectorAll('.stat .num');
  if (!els.length) return;

  els.forEach(el => {
    const end   = parseInt(el.dataset.count || '0', 10);
    const suf   = el.dataset.suffix || '';
    const dur   = 900; // ms
    let startTs = null;

    function tick(ts){
      if (!startTs) startTs = ts;
      const t = Math.min(1, (ts - startTs) / dur);
      const val = Math.round(end * t);
      // IMPORTANT: fără toLocaleString, fără separatori
      el.textContent = String(val) + suf;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
})();



  /* ========== Billing toggle (Lunar / Anual -10%) ========== */
(() => {
    const toggle = document.getElementById('billingToggle');
    if (!toggle) return;
  
    const cards = document.querySelectorAll('.plan .price .value');
  
    // mică animație de „flip” când schimbăm prețul
    const flip = el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(6px)';
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 120);
    };
  
    const updatePrices = () => {
      const yearly = toggle.checked;
      cards.forEach(el => {
        const m = el.getAttribute('data-monthly');
        const y = el.getAttribute('data-yearly') || m;
        el.textContent = yearly ? y : m;
        flip(el);
        // schimbă și sufixul /lună în funcție de tip (pentru ședință rămâne identic)
        const per = el.closest('.price').querySelector('.per');
        if (!per) return;
        if (per.textContent.includes('ședință')) return;
        per.textContent = yearly ? '/lună (plată anuală -10%)' : '/lună';
      });
    };
  
    toggle.addEventListener('change', updatePrices);
  })();

  // ============ Billing toggle (Lunar / Anual -10%) ============
(function () {
  const toggle = document.querySelector('.billing-toggle');
  const plans  = document.querySelectorAll('.plans .plan');
  if (!toggle || !plans.length) return;

  const buttons = toggle.querySelectorAll('[data-bill]');

  function setMode(mode) {
    // activeaza vizual butonul
    buttons.forEach(b => b.classList.toggle('is-active', b.dataset.bill === mode));

    plans.forEach(p => {
      const type  = p.dataset.type || 'month';
      const numEl = p.querySelector('.plan-price .num');
      const perEl = p.querySelector('.plan-price .per');

      if (!numEl || !perEl) return;

      if (type === 'session') {
        // ședința nu se schimbă
        perEl.textContent = '/ședință';
        return;
      }

      // preț lunar (atribut required pe <article>)
      const monthly = Number(p.dataset.monthly || 0);
      const price   = (mode === 'annual') ? Math.round(monthly * 0.9) : monthly;

      numEl.textContent = price;
      perEl.textContent = '/lună';
    });

    // salvăm preferința
    try { localStorage.setItem('billing', mode); } catch {}
  }

  // click pe butoane
  buttons.forEach(btn => {
    btn.addEventListener('click', () => setMode(btn.dataset.bill));
  });

  // inițializare
  const initMode = (localStorage.getItem('billing') === 'annual') ? 'annual' : 'monthly';
  setMode(initMode);
})();





// schimbător „întrebări / abonamente / …”
(function(){
  const el = document.getElementById('swapWords');
  if(!el) return;
  const words = JSON.parse(el.dataset.words || '[]');
  if(!words.length) return;

  let i = 0, locked = false;
  const next = () => {
    if (locked) return;
    locked = true;
    el.classList.add('is-swapping');
    setTimeout(() => {
      i = (i + 1) % words.length;
      el.textContent = words[i];
      el.classList.remove('is-swapping');
      locked = false;
    }, 220);
  };
  setInterval(next, 1800);
})();



// NU bloca linkurile externe (harti, tel, mail)
document.addEventListener('click', (e) => {
  const a = e.target.closest('a');
  if (!a) return;
  const href = a.getAttribute('href') || '';
  const isExternal = /^(https?:|tel:|mailto:)/i.test(href);
  if (isExternal) {
    // lasă browserul să deschidă normal
    return;
  }
});

// Copiere rapidă a numărului (fallback desktop)
const copyBtn = document.getElementById('copyPhone');
if (copyBtn) {
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('+40735393772');
      const old = copyBtn.innerHTML;
      copyBtn.innerHTML = 'Copiat!';
      setTimeout(() => copyBtn.innerHTML = old, 1200);
    } catch {
      alert('Nu am putut copia numărul. Copiază manual: +40 735 393 772');
    }
  });
}










  
  
  


/* =========================================================
   NAVBAR REDIMENSIONABIL
   ---------------------------------------------------------
   Port vanilla al efectului "resizable navbar": la scroll > 100px
   adauga clasa .is-shrunk pe .site-header, iar CSS-ul face restul.

   De ce asa si nu in React: site-ul e HTML static pe GitHub Pages,
   fara build. Efectul e identic, dar linkurile raman in HTML (bun
   pentru Google) si nu adaugam nicio dependenta.

   Optimizat: listener passive + rAF, deci nu blocheaza scroll-ul si
   nu forteaza reflow la fiecare eveniment.
   ========================================================= */
function initNavbarShrink(){
  var header = document.querySelector('.site-header');
  if (!header) return;

  var PRAG = 100;          // aceeasi valoare ca in componenta originala
  var ticking = false;

  function aplica(){
    ticking = false;
    var y = window.pageYOffset || document.documentElement.scrollTop;
    // Citim starea direct din DOM, nu dintr-o variabila de stare.
    // O variabila proprie se poate desincroniza de clasa reala (ex. daca alt
    // cod atinge clasa), iar atunci garda "daca nu s-a schimbat, iesi" blocheaza
    // definitiv aplicarea. toggle(clasa, boolean) e idempotent, deci apelul
    // repetat nu costa nimic si starea se auto-corecteaza mereu.
    header.classList.toggle('is-shrunk', y > PRAG);
  }

  function onScroll(){
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(aplica);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  aplica();   // starea corecta si daca pagina se deschide deja derulata
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavbarShrink);
} else {
  initNavbarShrink();
}
