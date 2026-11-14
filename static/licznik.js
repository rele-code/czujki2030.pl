// Licznik dni do daty z atrybutu data-cel. Bez skryptu zostaje wartość z dnia budowy.
(function () {
  var M = ['stycznia','lutego','marca','kwietnia','maja','czerwca','lipca','sierpnia','września','października','listopada','grudnia'];
  document.querySelectorAll('.licznik[data-cel]').forEach(function (el) {
    var p = el.getAttribute('data-cel').split('-');
    var cel = Date.UTC(+p[0], +p[1] - 1, +p[2]);
    var d = new Date();
    var dzis = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
    var dni = Math.max(0, Math.round((cel - dzis) / 86400000));
    var liczba = el.querySelector('[data-licznik]');
    if (liczba) liczba.textContent = String(dni);
    var stan = el.querySelector('[data-licznik-dzis]');
    if (stan) stan.textContent = d.getDate() + ' ' + M[d.getMonth()] + ' ' + d.getFullYear();
  });
})();
