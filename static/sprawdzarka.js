// Sprawdzarka § 28a — drzewko pytań. Każdy wynik pokazuje cytat ustępu z danych #dane-cytatow (zrodla/cytaty.json).
(function () {
  var root = document.getElementById('sprawdzarka');
  var daneEl = document.getElementById('dane-cytatow');
  if (!root || !daneEl) return;
  var C = JSON.parse(daneEl.textContent);
  var M = ['stycznia','lutego','marca','kwietnia','maja','czerwca','lipca','sierpnia','września','października','listopada','grudnia'];
  var stan = {}, historia = [];

  var PYTANIA = {
    typ: {
      p: 'Jaki lokal sprawdzasz?',
      o: [
        ['Mieszkanie, w którym ktoś mieszka (lokal mieszkalny)', {typ: 'M'}, 'ssp'],
        ['Mieszkanie, pokój lub apartament wynajmowany gościom na krótko (usługi hotelarskie)', {typ: 'H'}, 'ssp'],
        ['Lokal użytkowy, w którym przebywają ludzie (biuro, gabinet, sklep, punkt usługowy)', {typ: 'U'}, 'spalanie'],
        ['Dom jednorodzinny', {typ: 'D'}, 'ssp']
      ]
    },
    ssp: {
      p: 'Czy lokal jest chroniony systemem sygnalizacji pożarowej albo stałym samoczynnym urządzeniem gaśniczym?',
      h: 'Chodzi o instalację w budynku (system sygnalizacji pożarowej, tryskacze), a nie o pojedynczą czujkę na baterię. Jeśli nie wiesz — zapytaj zarządcę budynku.',
      o: [
        ['Tak, jest taka instalacja', {ssp: true}, 'spalanie'],
        ['Nie ma albo nie wiem', {ssp: false}, 'spalanie']
      ]
    },
    spalanie: {
      p: 'Czy w lokalu jest pomieszczenie, w którym spala się paliwo stałe, ciekłe lub gazowe?',
      h: 'Na przykład: gazowy podgrzewacz wody, kocioł, kominek, piec na drewno lub węgiel, kuchenka gazowa.',
      o: [
        ['Tak', {spalanie: true}, 'urzadzenie'],
        ['Nie — ogrzewanie i gotowanie są bez spalania (np. elektryczne, sieć ciepłownicza)', {spalanie: false}, 'kiedy']
      ]
    },
    urzadzenie: {
      p: 'Co spala paliwo w tym pomieszczeniu?',
      h: 'Informację o zamkniętej komorze spalania znajdziesz w instrukcji lub na tabliczce znamionowej urządzenia.',
      o: [
        ['Tylko kuchenka lub płyta gazowa do gotowania', {urz: 'kuchenka'}, 'kiedy'],
        ['Tylko urządzenia z zamkniętą komorą spalania', {urz: 'zamknieta'}, 'kiedy'],
        ['Inne urządzenie: z otwartą komorą, kominek, piec na paliwo stałe (także gdy obok jest kuchenka)', {urz: 'inne'}, 'kiedy'],
        ['Nie wiem, jaką komorę ma urządzenie', {urz: 'nie-wiem'}, 'kiedy']
      ]
    },
    kiedy: {
      p: 'Czy lokal był użytkowany jako taki już 23 grudnia 2024 r.?',
      h: 'To dzień wejścia w życie rozporządzenia. Dla lokali użytkowanych w tym dniu przepis przewiduje okres przejściowy.',
      o: [
        ['Tak, był użytkowany już wtedy', {istniejacy: true}, null],
        ['Nie — zaczął być użytkowany później', {istniejacy: false}, null]
      ]
    }
  };

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function dataPl(iso) { var p = iso.split('-'); return (+p[2]) + ' ' + M[+p[1] - 1] + ' ' + p[0] + ' r.'; }
  function dniDo(iso) { var p = iso.split('-'); var d = new Date(); return Math.round((Date.UTC(+p[0], +p[1] - 1, +p[2]) - Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())) / 86400000); }
  function termin(iso) { var n = dniDo(iso); return n > 0 ? 'od ' + dataPl(iso) + ' (za ' + n + ' dni)' : 'od ' + dataPl(iso) + ' — ten termin już minął, wymóg obowiązuje'; }

  function cytat(id) {
    var c = C[id]; if (!c) return el('p', null, '[brak cytatu ' + id + ']');
    var f = el('figure', 'cytat'); var q = el('blockquote'); q.setAttribute('cite', c.url);
    q.appendChild(el('p', null, '„' + c.cytat + '”')); f.appendChild(q);
    var cap = el('figcaption', null, c.jednostka + ', '); var a = el('a', null, c.dz_u); a.href = c.url; a.rel = 'external';
    cap.appendChild(a); f.appendChild(cap); return f;
  }

  function wynik(klasa, tytul, tekst, cytaty) {
    var w = el('div', 'sp-wynik ' + klasa); w.appendChild(el('h3', null, tytul));
    (Array.isArray(tekst) ? tekst : [tekst]).forEach(function (t) { if (t) w.appendChild(el('p', null, t)); });
    (cytaty || []).forEach(function (id) { w.appendChild(cytat(id)); });
    return w;
  }

  function policz() {
    var s = stan, out = [];
    var nowy = s.istniejacy === false;
    // --- czujka dymu (§ 28a ust. 1–2): lokal mieszkalny i usługi hotelarskie; lokalu użytkowego ust. 1 nie wymienia
    if (s.typ === 'U') {
      out.push(wynik('sp-nie', 'Czujka dymu: § 28a nie wymaga jej w lokalu użytkowym',
        'Ust. 1 wymienia pomieszczenia i jednostki mieszkalne z usługami hotelarskimi oraz lokal mieszkalny. Lokalu użytkowego w tym ustępie nie ma — inne przepisy przeciwpożarowe mogą jednak dotyczyć budynku.', ['r1716-28a-1']));
    } else if (s.ssp) {
      out.push(wynik('sp-nie', 'Czujka dymu: nie jest wymagana, jeśli lokal chroni instalacja',
        'Wyłączenie z ust. 2 działa tylko wtedy, gdy lokal faktycznie jest chroniony systemem sygnalizacji pożarowej albo stałym samoczynnym urządzeniem gaśniczym.', ['r1716-28a-2']));
    } else {
      var t, ids = ['r1716-28a-1'];
      if (nowy) { t = 'Wymóg obowiązuje od wejścia w życie rozporządzenia (23 grudnia 2024 r.) — okres przejściowy z § 2 dotyczy tylko lokali użytkowanych w tym dniu.'; ids.push('r1716-3'); }
      else if (s.typ === 'H') { t = 'Termin dla pomieszczeń i jednostek mieszkalnych z usługami hotelarskimi: ' + termin('2026-06-30') + '.'; ids.push('r1716-2-4'); }
      else { t = 'Termin dla lokali mieszkalnych użytkowanych 23 grudnia 2024 r.: ' + termin('2030-01-01') + '.'; ids.push('r1716-2-2'); }
      var dod = [];
      if (s.typ === 'H') dod.push('Mieszkanie na wynajem krótkoterminowy jest też lokalem mieszkalnym, dla którego § 2 ust. 2 przewiduje 1 stycznia 2030 r. Rozporządzenie nie rozstrzyga wprost, który termin wygrywa — bezpieczniej przyjąć wcześniejszy.');
      if (s.typ === 'D') dod.push('Rozporządzenie mówi o „lokalu mieszkalnym” i nie definiuje tego pojęcia. Nie rozstrzyga wprost, czy obejmuje dom jednorodzinny — ten wynik zakłada, że tak.');
      out.push(wynik('sp-tak', 'Czujka dymu: wymagana — co najmniej jedna', [t].concat(dod), ids));
    }
    // --- czujka tlenku węgla (§ 28a ust. 3–4)
    if (!s.spalanie) {
      out.push(wynik('sp-nie', 'Czujka czadu (tlenku węgla): § 28a nie wymaga',
        'Ust. 3 dotyczy tylko pomieszczenia, w którym odbywa się proces spalania paliwa stałego, ciekłego lub gazowego.', ['r1716-28a-3']));
    } else if (s.urz === 'kuchenka' || s.urz === 'zamknieta') {
      out.push(wynik('sp-nie', 'Czujka czadu (tlenku węgla): nie jest wymagana przez § 28a',
        s.urz === 'kuchenka' ? 'Ust. 4 wyłącza spalanie w gazowym urządzeniu do przygotowania posiłków. Wyłączenie przestaje działać, gdy w tym samym pomieszczeniu jest też inne urządzenie spalające paliwo.'
                             : 'Ust. 4 wyłącza urządzenia z zamkniętą komorą spalania. Sprawdź to w instrukcji każdego urządzenia w pomieszczeniu.', ['r1716-28a-4']));
    } else {
      var tc, idc = ['r1716-28a-3'];
      if (nowy) { tc = 'Wymóg obowiązuje od wejścia w życie rozporządzenia (23 grudnia 2024 r.).'; idc.push('r1716-3'); }
      else if (s.typ === 'U' || s.typ === 'H') { tc = 'Termin: ' + termin('2026-06-30') + '.'; idc.push('r1716-2-4'); }
      else { tc = 'Termin dla pomieszczeń ze spalaniem w lokalach mieszkalnych użytkowanych 23 grudnia 2024 r.: ' + termin('2030-01-01') + '.'; idc.push('r1716-2-3'); }
      var dc = ['Czujka ma być w pomieszczeniu, w którym odbywa się spalanie.'];
      if (s.urz === 'nie-wiem') dc.push('Nie znasz rodzaju komory spalania — dopóki tego nie sprawdzisz, przyjmij, że wymóg cię dotyczy.');
      if (s.typ === 'U') dc.push('Warunek z ust. 3: lokal użytkowy ma być przeznaczony na pobyt ludzi i znajdować się w strefie pożarowej zakwalifikowanej do kategorii zagrożenia ludzi ZL. O kategorię strefy zapytaj zarządcę budynku.');
      if (s.typ === 'H') dc.push('Dla mieszkania na wynajem krótkoterminowy możliwy jest też termin z § 2 ust. 3 (1 stycznia 2030 r.) — przepis nie rozstrzyga tego wprost, bezpieczniej przyjąć 30 czerwca 2026 r.');
      out.push(wynik('sp-tak', 'Czujka czadu (tlenku węgla): wymagana w pomieszczeniu ze spalaniem', [tc].concat(dc), idc));
    }
    out.push(wynik('sp-info', 'Zawsze warto wiedzieć',
      ['Czujnik gazu nie jest objęty § 28a — rozdział 6 rozporządzenia wymienia autonomiczne czujki dymu i tlenku węgla.',
       'Czujki autonomiczne montuje się, konserwuje i eksploatuje według instrukcji producenta — coroczne przeglądy urządzeń przeciwpożarowych ich nie dotyczą.'],
      ['r1716-tytul6', 'r1716-3a']));
    return out;
  }

  function rysuj(klucz) {
    root.innerHTML = '';
    if (!klucz) {
      root.appendChild(el('p', 'sp-krok', 'Wynik'));
      policz().forEach(function (w) { root.appendChild(w); });
      root.appendChild(el('p', 'sp-pomoc', 'Sprawdzarka czyta tylko § 28a i § 2 rozporządzenia (Dz.U. 2024 poz. 1716). To nie jest porada prawna.'));
    } else {
      var q = PYTANIA[klucz];
      root.appendChild(el('p', 'sp-krok', 'Pytanie ' + (historia.length + 1)));
      root.appendChild(el('p', 'sp-pytanie', q.p));
      if (q.h) root.appendChild(el('p', 'sp-pomoc', q.h));
      var box = el('div', 'sp-opcje');
      q.o.forEach(function (op) {
        var b = el('button', null, op[0]); b.type = 'button';
        b.addEventListener('click', function () {
          historia.push({klucz: klucz, stan: JSON.parse(JSON.stringify(stan))});
          for (var k in op[1]) stan[k] = op[1][k];
          var dalej = op[2];
          if (dalej === 'kiedy' && stan.typ !== 'U' && stan.ssp && !stan.spalanie) dalej = null;
          if (dalej === 'kiedy' && !wymaga()) dalej = null;
          rysuj(dalej);
          var h = root.querySelector('.sp-pytanie, h3'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({preventScroll: false}); }
        });
        box.appendChild(b);
      });
      root.appendChild(box);
    }
    var nav = el('div', 'sp-nawig');
    if (historia.length) {
      var wstecz = el('button', null, '← Wstecz'); wstecz.type = 'button';
      wstecz.addEventListener('click', function () { var h = historia.pop(); stan = h.stan; rysuj(h.klucz); });
      nav.appendChild(wstecz);
      var od = el('button', null, 'Zacznij od nowa'); od.type = 'button';
      od.addEventListener('click', function () { historia = []; stan = {}; rysuj('typ'); });
      nav.appendChild(od);
    }
    root.appendChild(nav);
  }

  function wymaga() {
    var dym = stan.typ !== 'U' && !stan.ssp;
    var co = stan.spalanie && (stan.urz === 'inne' || stan.urz === 'nie-wiem');
    return dym || co;
  }

  rysuj('typ');
})();
