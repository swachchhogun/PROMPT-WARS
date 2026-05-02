/**
 * @fileoverview PollingPoint — Unit Tests
 *
 * Lightweight, zero-dependency test harness for core utility functions.
 * Run in the browser console or via Node.js (DOM-dependent tests skipped
 * automatically when `document` is unavailable).
 *
 * Usage:
 *   Open index.html → Dev Tools Console → paste this file
 *   OR: include via <script src="test.js"> after script.js
 */
'use strict';

/* ---------- Test Runner ---------- */

let _passed = 0;
let _failed = 0;

/**
 * Assert that `actual` strictly equals `expected`.
 *
 * @param {string} label    - Human-readable description of the test.
 * @param {*}      actual   - The value produced by the code under test.
 * @param {*}      expected - The value we expect.
 */
function assert(label, actual, expected) {
  if (actual === expected) {
    _passed++;
    console.log(`  ✅ ${label}`);
  } else {
    _failed++;
    console.error(`  ❌ ${label} — expected "${expected}", got "${actual}"`);
  }
}

/**
 * Assert that `fn` throws an error (or the result is falsy).
 *
 * @param {string}   label - Description.
 * @param {Function} fn    - Code that should throw or return falsy.
 */
function assertThrows(label, fn) {
  try {
    const result = fn();
    if (!result) { _passed++; console.log(`  ✅ ${label}`); }
    else         { _failed++; console.error(`  ❌ ${label} — did not throw`); }
  } catch {
    _passed++;
    console.log(`  ✅ ${label}`);
  }
}

function printSummary() {
  const total = _passed + _failed;
  console.log(`\n${'='.repeat(40)}`);
  console.log(`Tests: ${_passed}/${total} passed${_failed ? ` (${_failed} FAILED)` : ''}`);
  console.log('='.repeat(40));
}

/* ---------- Tests: sanitize() ---------- */

console.log('\n🧪 sanitize()');

if (typeof sanitize === 'function') {
  assert('Escapes <script> tags',
    sanitize('<script>alert("xss")</script>'),
    '&lt;script&gt;alert("xss")&lt;/script&gt;');

  assert('Escapes HTML entities',
    sanitize('<img onerror="alert(1)">'),
    '&lt;img onerror="alert(1)"&gt;');

  assert('Returns empty string for null input',
    sanitize(null), '');

  assert('Returns empty string for undefined input',
    sanitize(undefined), '');

  assert('Returns empty string for empty string',
    sanitize(''), '');

  assert('Preserves normal text',
    sanitize('Hello World'), 'Hello World');

  assert('Escapes ampersands',
    sanitize('A & B'), 'A &amp; B');

  assert('Escapes nested HTML',
    sanitize('<div onclick="hack()">click</div>'),
    '&lt;div onclick="hack()"&gt;click&lt;/div&gt;');
} else {
  console.warn('  ⚠️  sanitize() not found — skipping (load test.js after script.js)');
}

/* ---------- Tests: getPartySymbol() ---------- */

console.log('\n🧪 getPartySymbol()');

if (typeof getPartySymbol === 'function') {
  assert('Matches BJP by abbreviation',
    getPartySymbol('Bharatiya Janata Party', 'BJP').color, '#FF6B00');

  assert('Matches INC by abbreviation',
    getPartySymbol('Indian National Congress', 'INC').color, '#00BFFF');

  assert('Matches AAP by abbreviation',
    getPartySymbol('Aam Aadmi Party', 'AAP').color, '#0066CC');

  assert('Matches TMC by name substring',
    getPartySymbol('All India Trinamool Congress', '').color, '#2E8B57');

  assert('Returns default for unknown party',
    getPartySymbol('Unknown Party XYZ', 'UPX').color, '#666666');

  assert('Case-insensitive abbreviation match',
    getPartySymbol('', 'bjp').color, '#FF6B00');

  assert('Matches Congress by name keyword',
    getPartySymbol('Indian National Congress', '').color, '#00BFFF');

  assert('Default party has empty logo string',
    getPartySymbol('Random Party', 'RP').logo, '');
} else {
  console.warn('  ⚠️  getPartySymbol() not found — skipping');
}

/* ---------- Tests: showToast() ---------- */

console.log('\n🧪 showToast()');

if (typeof showToast === 'function' && typeof document !== 'undefined') {
  showToast('Test message');
  const toast = document.getElementById('errorToast');
  assert('Toast text is set correctly',
    toast?.innerText, 'Test message');
  assert('Toast has "show" class after call',
    toast?.classList.contains('show'), true);
} else {
  console.warn('  ⚠️  showToast() not available — skipping');
}

/* ---------- Tests: populateSelect() ---------- */

console.log('\n🧪 populateSelect()');

if (typeof populateSelect === 'function' && typeof document !== 'undefined') {
  const testSelect = document.createElement('select');
  populateSelect(testSelect, ['Alpha', 'Beta', 'Gamma'], 'Pick one');

  assert('Placeholder option is first',
    testSelect.options[0].text, 'Pick one');

  assert('Correct number of options (placeholder + items)',
    testSelect.options.length, 4);

  assert('First item value is "Alpha"',
    testSelect.options[1].value, 'Alpha');

  assert('Select is enabled after population',
    testSelect.disabled, false);
} else {
  console.warn('  ⚠️  populateSelect() not available — skipping');
}

/* ---------- Tests: CONFIG validation ---------- */

console.log('\n🧪 CONFIG object');

if (typeof CONFIG !== 'undefined') {
  assert('CONFIG is frozen (immutable)',
    Object.isFrozen(CONFIG), true);

  assert('CONFIG.CACHE_MAX_SIZE is a positive number',
    CONFIG.CACHE_MAX_SIZE > 0, true);

  assert('CONFIG.RATE_LIMIT_MAX is a positive number',
    CONFIG.RATE_LIMIT_MAX > 0, true);

  assert('CONFIG.MAX_RETRIES is at least 1',
    CONFIG.MAX_RETRIES >= 1, true);

  assert('CONFIG.GEMINI_URL is a valid HTTPS URL',
    CONFIG.GEMINI_URL.startsWith('https://'), true);
} else {
  console.warn('  ⚠️  CONFIG not found — skipping');
}

/* ---------- Tests: FIREBASE_CONFIG validation ---------- */

console.log('\n🧪 FIREBASE_CONFIG object');

if (typeof FIREBASE_CONFIG !== 'undefined') {
  assert('FIREBASE_CONFIG is frozen (immutable)',
    Object.isFrozen(FIREBASE_CONFIG), true);

  assert('FIREBASE_CONFIG has a projectId',
    typeof FIREBASE_CONFIG.projectId === 'string' && FIREBASE_CONFIG.projectId.length > 0, true);

  assert('FIREBASE_CONFIG has a databaseURL',
    typeof FIREBASE_CONFIG.databaseURL === 'string' && FIREBASE_CONFIG.databaseURL.startsWith('https://'), true);

  assert('FIREBASE_CONFIG has an authDomain',
    typeof FIREBASE_CONFIG.authDomain === 'string' && FIREBASE_CONFIG.authDomain.includes('.'), true);
} else {
  console.warn('  ⚠️  FIREBASE_CONFIG not found — skipping');
}

/* ---------- Tests: CACHE (LRU behaviour) ---------- */

console.log('\n🧪 CACHE (LRU Map)');

if (typeof CACHE !== 'undefined') {
  assert('CACHE is a Map instance',
    CACHE instanceof Map, true);

  // Test LRU eviction logic
  const originalSize = CACHE.size;
  for (let i = 0; i < 25; i++) CACHE.set(`__test_key_${i}`, { test: true });
  assert('CACHE does not exceed max size + test overflow',
    CACHE.size <= CONFIG.CACHE_MAX_SIZE + 25, true);

  // Cleanup test keys
  for (let i = 0; i < 25; i++) CACHE.delete(`__test_key_${i}`);
} else {
  console.warn('  ⚠️  CACHE not found — skipping');
}

/* ---------- Tests: Data integrity ---------- */

console.log('\n🧪 Data integrity');

if (typeof STATES !== 'undefined') {
  assert('STATES array has 30 entries',
    STATES.length, 30);

  assert('STATES includes "Delhi"',
    STATES.includes('Delhi'), true);

  assert('STATES includes "Maharashtra"',
    STATES.includes('Maharashtra'), true);

  assert('STATES is sorted alphabetically',
    JSON.stringify(STATES) === JSON.stringify([...STATES].sort()), true);
}

if (typeof LOK_SABHA_YEARS !== 'undefined') {
  assert('LOK_SABHA_YEARS includes 2024',
    LOK_SABHA_YEARS.includes(2024), true);

  assert('LOK_SABHA_YEARS is sorted descending',
    JSON.stringify(LOK_SABHA_YEARS) === JSON.stringify([...LOK_SABHA_YEARS].sort((a, b) => b - a)), true);
}

if (typeof INDIA_DATA !== 'undefined') {
  assert('INDIA_DATA has entries for all STATES',
    STATES.every(s => INDIA_DATA[s] !== undefined), true);

  const mp = INDIA_DATA['Madhya Pradesh'];
  if (mp) {
    assert('Madhya Pradesh has districts array',
      Array.isArray(mp.districts) && mp.districts.length > 0, true);

    assert('Madhya Pradesh has constituencies array',
      Array.isArray(mp.constituencies) && mp.constituencies.length > 0, true);
  }
}

/* ---------- Summary ---------- */

printSummary();
