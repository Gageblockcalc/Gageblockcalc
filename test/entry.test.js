// node test/entry.test.js
const { parseEntryQuery, stackSearch } = require('../entry.js');
let fail = 0;
const bad = (m) => { fail++; console.log('FAIL', m); };
function eq(label, got, expect) {
  const a = JSON.stringify(got);
  const b = JSON.stringify(expect);
  if (a !== b) bad(label + ' got ' + a + ' expected ' + b);
}

eq('empty', parseEntryQuery(''), {});
eq('no query', parseEntryQuery('?'), {});
eq('inch example', parseEntryQuery('?target=1.2345&set=inch-81'), { setId: 'inch-81', target: '1.2345' });
eq('36', parseEntryQuery('?target=0.7505&set=inch-36'), { setId: 'inch-36', target: '0.7505' });
eq('28', parseEntryQuery('?target=0.12345&set=inch-28'), { setId: 'inch-28', target: '0.12345' });
eq('metric unit only', parseEntryQuery('?target=41.125&unit=mm'), { unit: 'mm', target: '41.125' });
eq('wear on', parseEntryQuery('?target=2.3456&set=inch-81&wear=1'), { setId: 'inch-81', target: '2.3456', wear: true });
eq('wear true', parseEntryQuery('?target=41.125&set=metric-88&wear=true'), { setId: 'metric-88', target: '41.125', wear: true });
eq('wear TRUE', parseEntryQuery('?wear=TRUE'), { wear: true });
eq('wear off', parseEntryQuery('?wear=0'), { wear: false });
eq('wear false', parseEntryQuery('?wear=false'), { wear: false });
eq('wear absent', parseEntryQuery('?target=2.3456&set=inch-81').wear, undefined);
eq('share wear on', parseEntryQuery(stackSearch('2.3456', 'inch-81', true)), { setId: 'inch-81', target: '2.3456', wear: true });
eq('share wear off', parseEntryQuery(stackSearch('41.125', 'metric-88', false)), { setId: 'metric-88', target: '41.125', wear: false });
eq('share wear unknown', stackSearch('1.2345', 'inch-81'), '?target=1.2345&set=inch-81');
if (stackSearch('2.3456', 'inch-81', true) !== '?target=2.3456&set=inch-81&wear=1') bad('share wear format');
eq('thread stack', parseEntryQuery('?target=0.2608&set=inch-81'), { setId: 'inch-81', target: '0.2608' });
eq('leading dot', parseEntryQuery('?target=.1005&set=inch-81'), { setId: 'inch-81', target: '.1005' });

eq('bad set dropped', parseEntryQuery('?set=custom&target=1'), { target: '1' });
eq('bad unit dropped', parseEntryQuery('?unit=cm&target=1'), { target: '1' });
eq('zero dropped', parseEntryQuery('?target=0'), {});
eq('negative dropped', parseEntryQuery('?target=-1'), {});
eq('words dropped', parseEntryQuery('?target=1.2in'), {});
eq('email not a target', parseEntryQuery('?target=shop@example.com'), {});
eq('huge dropped', parseEntryQuery('?target=123456'), {});
eq('wear word dropped', parseEntryQuery('?wear=yes'), {});
eq('extra ignored', parseEntryQuery('?target=1.0000&set=inch-81&email=a@b.co&blocks=1,2'), { setId: 'inch-81', target: '1.0000' });

console.log(fail ? fail + ' FAILURES' : 'ALL PASS');
process.exit(fail ? 1 : 0);
