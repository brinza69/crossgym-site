/* ═══════════════════════════════════════════════════════════════════════════
   CrossGym Târgoviște — urmărire evenimente Google Analytics 4
   ───────────────────────────────────────────────────────────────────────────
   DE CE EXISTĂ FIȘIERUL ĂSTA:
   GA4 urmărește din oficiu doar pageview, scroll 90%, click pe linkuri
   externe și descărcări. NU urmărește clic pe „tel:" și „mailto:" — adică
   exact acțiunile care aduc clienți unei săli de fitness. Fără fișierul
   ăsta, în GA4 vezi doar „câți au intrat", nu „câți au sunat".

   Evenimentele trimise (toate apar în GA4 → Rapoarte → Interacțiune → Evenimente):
     click_telefon        — cineva a apăsat un număr de telefon
     click_email          — cineva a apăsat adresa de email
     click_harta          — cineva a deschis adresa în Google Maps
     click_social         — Instagram / Facebook (param: retea)
     click_cta            — butoanele mari „Programează-te" / „Vezi abonamentele"
     play_video_tur       — a pornit turul video al sălii
     deschide_imagine     — a deschis o imagine în lightbox
     vizualizare_preturi  — a ajuns efectiv cu scroll la cardurile de abonamente

   Pe primele 4 le marchezi ca „Evenimente-cheie" în GA4 (vezi ghidul din chat).
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // gtag e definit în <head>. Dacă lipsește (ex. blocat de un adblock),
  // funcția devine no-op ca să nu arunce erori în consolă.
  function ev(nume, params) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', nume, params || {});
  }

  // Din ce pagină vine evenimentul — util ca să vezi ce pagină generează sunete
  function pagina() {
    var p = location.pathname.replace(/\.html$/, '').replace(/\/$/, '');
    // /index si '' inseamna acelasi lucru cu '/' — le normalizez ca sa nu
    // apara doua randuri diferite pentru homepage in rapoartele GA4.
    return (p === '' || p === '/index') ? '/' : p;
  }

  var baza = { pagina: pagina() };

  function cu(extra) {
    var o = { pagina: baza.pagina };
    for (var k in extra) if (Object.prototype.hasOwnProperty.call(extra, k)) o[k] = extra[k];
    return o;
  }

  /* ───────── 1. Clicuri pe linkuri (delegare: prinde și conținut adăugat later) ───────── */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';

    // Telefon — CEA MAI IMPORTANTĂ conversie pentru o sală
    if (href.indexOf('tel:') === 0) {
      ev('click_telefon', cu({ numar: href.replace('tel:', '').trim(), locatie: a.className || 'link' }));
      return;
    }

    // Email
    if (href.indexOf('mailto:') === 0) {
      ev('click_email', cu({ adresa: href.replace('mailto:', '').trim() }));
      return;
    }

    // Hartă / indicații rutiere
    if (href.indexOf('google.com/maps') > -1 || href.indexOf('goo.gl/maps') > -1) {
      ev('click_harta', cu({ destinatie: 'google_maps' }));
      return;
    }

    // Rețele sociale
    if (href.indexOf('instagram.com') > -1) {
      ev('click_social', cu({ retea: 'instagram', profil: href }));
      return;
    }
    if (href.indexOf('facebook.com') > -1) {
      ev('click_social', cu({ retea: 'facebook', profil: href }));
      return;
    }

    // Butoanele mari de acțiune din hero / secțiuni
    if (a.classList.contains('btn')) {
      var eticheta = (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60);
      if (eticheta) ev('click_cta', cu({ buton: eticheta, destinatie: href }));
    }
  }, { passive: true });

  /* ───────── 2. Turul video al sălii ───────── */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-pop="video"]');
    if (b) ev('play_video_tur', cu({ sursa: b.getAttribute('data-src-mp4') || 'tur-sala' }));
  }, { passive: true });

  /* ───────── 3. Deschidere imagine în lightbox (semnal de interes real) ───────── */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-pop="img"], [data-lightbox]');
    if (!b) return;
    var src = b.getAttribute('data-src') || b.getAttribute('src') || '';
    ev('deschide_imagine', cu({ imagine: src.split('/').pop() }));
  }, { passive: true });

  /* ───────── 4. A ajuns efectiv la prețuri (nu doar a deschis pagina) ───────── */
  var grilaPreturi = document.querySelector('.price-grid, .pricing .cards');
  if (grilaPreturi && 'IntersectionObserver' in window) {
    var trimis = false;
    var io = new IntersectionObserver(function (intrari) {
      intrari.forEach(function (i) {
        if (i.isIntersecting && !trimis) {
          trimis = true;
          ev('vizualizare_preturi', cu({}));
          io.disconnect();
        }
      });
    }, { threshold: 0.4 });
    io.observe(grilaPreturi);
  }
})();
