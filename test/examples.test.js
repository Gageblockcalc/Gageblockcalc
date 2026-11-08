// node test/examples.test.js — pinned stacks for the published calculator examples.
const fs = require('fs');
const path = require('path');
new Function(fs.readFileSync(path.join(__dirname, '../algorithm.js'), 'utf8'))();
const A = globalThis.GageBlockAlgo;
const sets = A.buildSets();
let fail = 0;
const bad = (m) => { fail++; console.log('FAIL', m); };

function stackOf(setId, target, wear) {
  const set = sets[setId];
  const av = A.applyWearAvailability(A.defaultAvailability(set), set, wear);
  const r = A.findStacks(target, set, av, !!wear, null);
  if (!r.stacks.length) return null;
  return r.stacks[0].map((x) => A.formatSize(x, set));
}

function expect(label, setId, target, wear, blocks) {
  const got = stackOf(setId, target, wear);
  const a = JSON.stringify(got);
  const b = JSON.stringify(blocks);
  if (a !== b) bad(label + ' got ' + a + ' expected ' + b);
  else console.log('ok', label, got.join(' + '));
}

expect('1.2345 in 81', 'inch-81', 1.2345, false, ['1.000', '0.134', '0.1005']);
expect('0.7505 in 36', 'inch-36', 0.7505, false, ['0.500', '0.150', '0.1005']);
expect('0.12345 in 28', 'inch-28', 0.12345, false, ['0.060', '0.023', '0.0204', '0.02005']);
expect('0.10005 in 28', 'inch-28', 0.10005, false, ['0.080', '0.02005']);
expect('41.125 mm 112', 'metric-112', 41.125, false, ['25', '14', '1.12', '1.005']);
expect('41.125 mm 88', 'metric-88', 41.125, false, ['30', '9', '1.12', '1.005']);
expect('2.3456 in wear', 'inch-81', 2.3456, true, ['2.000', '0.145', '0.1006', '0.050', '0.050']);
expect('0.250 in 36 wear', 'inch-36', 0.25, true, ['0.150', '0.050', '0.050']);
expect('0.2608 in 1/4-20', 'inch-81', 0.2608, false, ['0.110', '0.1008', '0.050']);
expect('mic 0.105', 'inch-81', 0.105, false, ['0.105']);
expect('mic 0.210', 'inch-81', 0.21, false, ['0.110', '0.100']);
expect('mic 0.315', 'inch-81', 0.315, false, ['0.200', '0.115']);

console.log(fail ? fail + ' FAILURES' : 'ALL PASS');
process.exit(fail ? 1 : 0);
