/* ═══════════════════════════════════════════════════════════════════════════
   CrossGym Târgoviște — consimțământ cookies (GDPR / ePrivacy)
   ───────────────────────────────────────────────────────────────────────────
   CE REZOLVĂ:
   În UE, cookie-urile de analiză NU sunt "strict necesare", deci au nevoie de
   consimțământ PREALABIL și EXPLICIT (Regulamentul 2016/679 + Directiva
   ePrivacy, transpusă în România prin Legea 506/2004, art. 4 alin. 5).

   Implementare strictă: scriptul Google Analytics NU se încarcă deloc până
   când vizitatorul nu apasă „Accept". Nici măcar o cerere de rețea nu pleacă
   spre Google înainte de asta — deci nici IP-ul vizitatorului.

   Reguli respectate:
   - refuzul e la fel de simplu ca acceptul (două butoane egale ca vizibilitate)
   - fără casete pre-bifate
   - alegerea poate fi schimbată oricând (link în subsol + funcția publică
     window.deschideSetariCookies)
   - alegerea se reține 6 luni, apoi se întreabă din nou
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var CHEIE = 'crossgym_consimtamant';
  var LUNI_VALABILITATE = 6;
  var GA_ID = 'G-GNM3W91MVZ';   // înlocuit automat odată cu restul paginilor

  /* ───────── stocare ───────── */
  function citeste() {
    try {
      var brut = localStorage.getItem(CHEIE);
      if (!brut) return null;
      var d = JSON.parse(brut);
      var expira = d.data + LUNI_VALABILITATE * 30 * 24 * 60 * 60 * 1000;
      if (Date.now() > expira) { localStorage.removeItem(CHEIE); return null; }
      return d;
    } catch (e) { return null; }
  }

  function scrie(analiza) {
    try {
      localStorage.setItem(CHEIE, JSON.stringify({
        analiza: !!analiza, data: Date.now(), versiune: 1
      }));
    } catch (e) { /* mod privat / stocare plină — continuăm fără să reținem */ }
  }

  /* ───────── Google Analytics, încărcat DOAR după accept ───────── */
  var gaPornit = false;
  function pornesteAnalytics() {
    if (gaPornit || !GA_ID || GA_ID.indexOf('XXXX') > -1) return;
    gaPornit = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);

    window.gtag('js', new Date());
    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    window.gtag('config', GA_ID, { anonymize_ip: true, send_page_view: true });
  }

  /* ───────── conținut extern blocat până la accept (ex. harta) ───────── */
  function deblocheazaContinutExtern() {
    document.querySelectorAll('[data-consimtamant-src]').forEach(function (el) {
      if (el.dataset.incarcat) return;
      el.dataset.incarcat = '1';
      var cadru = document.createElement('iframe');
      cadru.src = el.getAttribute('data-consimtamant-src');
      cadru.title = el.getAttribute('data-titlu') || 'Conținut încorporat';
      cadru.loading = 'lazy';
      cadru.referrerPolicy = 'no-referrer-when-downgrade';
      cadru.allowFullscreen = true;
      cadru.style.cssText = 'border:0;position:absolute;inset:0;width:100%;height:100%;';
      el.innerHTML = '';
      el.appendChild(cadru);
    });
  }

  function aplica(d) {
    if (d && d.analiza) { pornesteAnalytics(); deblocheazaContinutExtern(); }
  }

  /* ───────── bannerul ───────── */
  var banner = null;

  function inchideBanner() {
    if (!banner) return;
    banner.classList.remove('este-vizibil');
    setTimeout(function () { if (banner) { banner.remove(); banner = null; } }, 320);
  }

  function construieste() {
    if (banner) return;
    banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Setări confidențialitate');
    banner.innerHTML =
      '<div class="cookie-banner__continut">' +
        '<div class="cookie-banner__text">' +
          '<strong>Respectăm confidențialitatea ta</strong>' +
          '<p>Folosim cookie-uri strict necesare pentru funcționarea site-ului. ' +
          'Cu acordul tău, folosim și cookie-uri de analiză (Google Analytics), ' +
          'ca să înțelegem cum e folosit site-ul. Fără acordul tău nu se încarcă ' +
          'nimic de la terți. Detalii în <a href="/privacy">Politica de confidențialitate</a>.</p>' +
        '</div>' +
        '<div class="cookie-banner__actiuni">' +
          '<button type="button" class="btn outline" data-cookie="refuz">Doar necesare</button>' +
          '<button type="button" class="btn" data-cookie="accept">Accept toate</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(banner);

    banner.querySelector('[data-cookie="accept"]').addEventListener('click', function () {
      scrie(true); aplica({ analiza: true }); inchideBanner();
    });
    banner.querySelector('[data-cookie="refuz"]').addEventListener('click', function () {
      scrie(false); inchideBanner();
    });

    requestAnimationFrame(function () {
      requestAnimationFrame(function () { banner.classList.add('este-vizibil'); });
    });
  }

  /* permite reschimbarea alegerii (link în subsol) */
  window.deschideSetariCookies = function () {
    try { localStorage.removeItem(CHEIE); } catch (e) {}
    construieste();
  };

  function porneste() {
    var d = citeste();
    if (d === null) construieste();
    else aplica(d);

    // butonul „Încarcă harta" din pagina de contact, pentru cine a refuzat analiza
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-incarca-extern]');
      if (b) {
        var gazda = b.closest('[data-consimtamant-src]');
        if (gazda) { gazda.dataset.incarcat = ''; deblocheazaContinutExtern(); }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', porneste);
  } else { porneste(); }
})();
