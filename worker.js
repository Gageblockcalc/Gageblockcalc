/* Gage Block Calculator — solver Web Worker. Runs findStacks off the main thread. */
importScripts('algorithm.js?v=1.0.97');
var A = self.GageBlockAlgo;
var SETS = A.buildSets();
self.onmessage = function (e) {
  var m = e.data || {};
  try {
    var setDef = SETS[m.setId];
    if (!setDef) throw new Error('Unknown set ' + m.setId);
    var found = A.findStacks(m.target, setDef, m.avail, m.useWear, m.usage);
    self.postMessage({ id: m.id, ok: true, stacks: found.stacks, method: found.method });
  } catch (err) {
    self.postMessage({ id: m.id, ok: false, error: String(err && err.message || err) });
  }
};
