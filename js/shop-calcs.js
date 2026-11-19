/**
 * Length change and inch/mm conversion for the shop guide pages.
 * The stack solver is not used here and is not modified.
 * Steel, tungsten carbide, zirconia, and chrome carbide coefficients are the
 * nominal values in NIST Monograph 180, Table 3.2, at 20 °C.
 * The international inch is exactly 25.4 mm.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.GBCShop = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var STEEL = 11.5e-6;
  var CARBIDE = 4.5e-6;
  var CERAMIC = 9.2e-6;
  var CHROME = 8.4e-6;
  var IN_TO_MM = 25.4;

  function deltaL(length, alphaPerC, temperature, tempUnit) {
    var L = Number(length);
    var a = Number(alphaPerC);
    var t = Number(temperature);
    if (!(L > 0) || !(a >= 0) || !isFinite(L) || !isFinite(a) || !isFinite(t)) return null;
    var dT = tempUnit === 'F' ? (t - 68) * 5 / 9 : (t - 20);
    if (!isFinite(dT)) return null;
    var change = L * a * dT;
    return { dT: dT, dL: change, lengthAtT: L + change };
  }

  function convertLength(value, fromUnit) {
    var v = Number(value);
    if (!(v > 0) || !isFinite(v)) return null;
    if (fromUnit === 'in') return { inches: v, mm: v * IN_TO_MM };
    if (fromUnit === 'mm') return { inches: v / IN_TO_MM, mm: v };
    return null;
  }

  // Decimal the calculator accepts: target= up to 4 digits and 6 decimal places.
  function queryNumber(n) {
    if (!(typeof n === 'number') || !(n > 0) || !isFinite(n)) return null;
    var s = n.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
    if (!/^(\d{1,4}(\.\d{1,6})?|\.\d{1,6})$/.test(s)) return null;
    if (!(parseFloat(s) > 0)) return null;
    return s;
  }

  function stackHref(target, setId) {
    var q = queryNumber(target);
    if (!q || !setId) return null;
    return '/?target=' + q + '&set=' + setId + '&wear=0';
  }

  return {
    STEEL: STEEL,
    CARBIDE: CARBIDE,
    CERAMIC: CERAMIC,
    CHROME: CHROME,
    IN_TO_MM: IN_TO_MM,
    deltaL: deltaL,
    convertLength: convertLength,
    queryNumber: queryNumber,
    stackHref: stackHref
  };
});
