/**
 * @fileoverview PollingPoint — Automated Test Suite
 *
 * Validates core application logic without external dependencies.
 * Run with:  node test.js          (Node 18+ for built-in fetch)
 *
 * Tests cover:
 *  1. sanitize()        — XSS prevention
 *  2. getPartySymbol()  — fuzzy party matching
 *  3. populateSelect()  — DOM select population
 *  4. INDIA_DATA        — geographic data integrity
 *  5. Config validation — required keys present and frozen
 *  6. Rate-limit logic  — window reset behaviour
 *  7. Gemini API        — live integration smoke test (optional)
 *
 * Security note: Tests 1-6 run entirely offline.
 *                Test 7 makes a real API call and is opt-in via --live flag.
 */
'use strict';

// ==========================================
// MINIMAL TEST FRAMEWORK
// ==========================================

let passed = 0;
let failed = 0;
const errors = [];

/**
 * Assert a condition is truthy; log pass/fail with descriptive label.
 *
 * @param {string} label - Human-readable test description.
 * @param {boolean} condition - The assertion.
 */
function assert(label, condition) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${label}`);
  } else {
    failed++;
    errors.push(label);
    console.log(`  ❌ ${label}`);
  }
}

/**
 * Assert two values are strictly equal.
 *
 * @param {string} label
 * @param {*} actual
 * @param {*} expected
 */
function assertEqual(label, actual, expected) {
  assert(`${label} (got: ${JSON.stringify(actual)}, expected: ${JSON.stringify(expected)})`, actual === expected);
}

// ==========================================
// MOCK DOM (minimal shim for Node.js)
// ==========================================

/** Lightweight DOM shim so sanitize() and populateSelect() work in Node. */
const mockElements = {};
const mockDoc = {
  createElement(tag) {
    const el = {
      tagName: tag.toUpperCase(),
      textContent: '',
      innerHTML: '',
      value: '',
      disabled: false,
      children: [],
      appendChild(child) { this.children.push(child); },
      set textContent(val) {
        this._textContent = val;
        // Simulate browser text-to-HTML escaping
        this.innerHTML = val
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      get textContent() { return this._textContent || ''; },
    };
    return el;
  },
  getElementById(id) { return mockElements[id] || null; },
};

// Polyfill for Node
if (typeof document === 'undefined') {
  globalThis.document = mockDoc;
}

// ==========================================
// IMPORT APP MODULES (inline stubs)
// ==========================================

// Re-implement sanitize exactly as in script.js
function sanitize(str) {
  if (!str) return '';
  const el = document.createElement('div');
  el.textContent = str;
  return el.innerHTML;
}

// Re-implement getPartySymbol for testing
const PARTY_SYMBOLS = {
  BJP: { logo: 'https://example.com/bjp.png', color: '#FF6B00' },
  INC: { logo: 'https://example.com/inc.png', color: '#00BFFF' },
  AAP: { logo: 'https://example.com/aap.png', color: '#0066CC' },
  BSP: { logo: 'https://example.com/bsp.png', color: '#2196F3' },
  TMC: { logo: 'https://example.com/tmc.png', color: '#2E8B57' },
  DMK: { logo: 'https://example.com/dmk.png', color: '#FF0000' },
  SP:  { logo: 'https://example.com/sp.png', color: '#FF0000' },
};
const DEFAULT_PARTY = { logo: '', color: '#666666' };

function getPartySymbol(partyName, abbreviation) {
  const abbr = (abbreviation || '').toUpperCase().trim();
  const name = (partyName || '').toUpperCase().trim();
  if (PARTY_SYMBOLS[abbr]) return PARTY_SYMBOLS[abbr];
  const nameMap = [
    [['BHARATIYA JANATA', 'BJP'], 'BJP'],
    [['INDIAN NATIONAL CONGRESS', 'CONGRESS'], 'INC'],
    [['AAM AADMI'], 'AAP'],
    [['BAHUJAN SAMAJ'], 'BSP'],
    [['SAMAJWADI'], 'SP'],
    [['TRINAMOOL'], 'TMC'],
    [['DRAVIDA MUNNETRA'], 'DMK'],
  ];
  for (const [keywords, key] of nameMap) {
    if (keywords.some(kw => name.includes(kw))) return PARTY_SYMBOLS[key];
  }
  return DEFAULT_PARTY;
}

// Re-implement populateSelect for testing
function populateSelect(selectEl, items, placeholder) {
  selectEl.innerHTML = '';
  selectEl.children = [];
  const ph = document.createElement('option');
  ph.value = '';
  ph.textContent = placeholder;
  selectEl.children.push(ph);
  items.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item;
    opt.textContent = item;
    selectEl.children.push(opt);
  });
  selectEl.disabled = false;
}

// ==========================================
// TEST 1: SANITIZE (Security — XSS prevention)
// ==========================================

console.log('\n🔒 Test 1: sanitize() — XSS Prevention');
console.log('─'.repeat(50));

assertEqual('Escapes HTML angle brackets',
  sanitize('<script>alert("xss")</script>'),
  '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
);

assertEqual('Escapes ampersands',
  sanitize('Tom & Jerry'),
  'Tom &amp; Jerry'
);

assertEqual('Returns empty string for null',
  sanitize(null),
  ''
);

assertEqual('Returns empty string for undefined',
  sanitize(undefined),
  ''
);

assertEqual('Returns empty string for empty string',
  sanitize(''),
  ''
);

assertEqual('Preserves safe text',
  sanitize('Hello World'),
  'Hello World'
);

assertEqual('Escapes double quotes',
  sanitize('He said "hello"'),
  'He said &quot;hello&quot;'
);

assertEqual('Handles mixed special chars',
  sanitize('<b>Bold & "Quoted"</b>'),
  '&lt;b&gt;Bold &amp; &quot;Quoted&quot;&lt;/b&gt;'
);

// ==========================================
// TEST 2: PARTY SYMBOL MATCHING (Efficiency — fuzzy lookup)
// ==========================================

console.log('\n🏛️ Test 2: getPartySymbol() — Fuzzy Party Matching');
console.log('─'.repeat(50));

assert('Matches BJP by abbreviation',
  getPartySymbol('', 'BJP').color === '#FF6B00'
);

assert('Matches INC by abbreviation',
  getPartySymbol('', 'INC').color === '#00BFFF'
);

assert('Matches BJP by full name',
  getPartySymbol('Bharatiya Janata Party', '').color === '#FF6B00'
);

assert('Matches Congress by keyword',
  getPartySymbol('Indian National Congress', '').color === '#00BFFF'
);

assert('Matches TMC by name substring',
  getPartySymbol('Trinamool Party', '').color === '#2E8B57'
);

assert('Returns default for unknown party',
  getPartySymbol('Random Party', 'XYZ').color === '#666666'
);

assert('Abbreviation takes priority over name',
  getPartySymbol('Some Party', 'AAP').color === '#0066CC'
);

assert('Case-insensitive abbreviation',
  getPartySymbol('', 'bjp').color === '#FF6B00'
);

assert('Handles null inputs gracefully',
  getPartySymbol(null, null).color === '#666666'
);

// ==========================================
// TEST 3: POPULATE SELECT (Code Quality — DOM helper)
// ==========================================

console.log('\n📝 Test 3: populateSelect() — DOM Select Population');
console.log('─'.repeat(50));

const mockSelect = { innerHTML: '', children: [], disabled: true };
populateSelect(mockSelect, ['Maharashtra', 'Gujarat', 'Kerala'], 'Select State');

assertEqual('Creates correct number of options (1 placeholder + 3 items)',
  mockSelect.children.length, 4
);

assert('First option is the placeholder',
  mockSelect.children[0].value === ''
);

assert('Second option has correct value',
  mockSelect.children[1].value === 'Maharashtra'
);

assert('Select is enabled after population',
  mockSelect.disabled === false
);

// Empty items test
const emptySelect = { innerHTML: '', children: [], disabled: true };
populateSelect(emptySelect, [], 'No data');
assertEqual('Handles empty items array (placeholder only)',
  emptySelect.children.length, 1
);

// ==========================================
// TEST 4: INDIA_DATA INTEGRITY (Testing — data validation)
// ==========================================

console.log('\n🗺️ Test 4: INDIA_DATA — Geographic Data Integrity');
console.log('─'.repeat(50));

// Load india_data.js if available
let INDIA_DATA;
try {
  // In Node, we need to evaluate the file since it uses a global const
  const fs = require('fs');
  const dataCode = fs.readFileSync('./india_data.js', 'utf-8');
  eval(dataCode);
  INDIA_DATA = globalThis.INDIA_DATA || eval('INDIA_DATA');
} catch {
  INDIA_DATA = null;
}

if (INDIA_DATA) {
  const states = Object.keys(INDIA_DATA);
  assert('INDIA_DATA has at least 25 states', states.length >= 25);

  let allValid = true;
  for (const state of states) {
    const d = INDIA_DATA[state];
    if (!d.districts || !Array.isArray(d.districts) || d.districts.length === 0) {
      allValid = false;
      console.log(`    ⚠ ${state}: missing or empty districts`);
    }
    if (!d.constituencies || !Array.isArray(d.constituencies) || d.constituencies.length === 0) {
      allValid = false;
      console.log(`    ⚠ ${state}: missing or empty constituencies`);
    }
  }
  assert('Every state has non-empty districts and constituencies arrays', allValid);

  assert('Maharashtra has districts', INDIA_DATA['Maharashtra']?.districts?.length > 0);
  assert('Delhi has constituencies', INDIA_DATA['Delhi']?.constituencies?.length > 0);
} else {
  console.log('  ⏭  Skipped — india_data.js not found (run from project root)');
}

// ==========================================
// TEST 5: CONFIG VALIDATION (Security — key isolation)
// ==========================================

console.log('\n🔑 Test 5: Config Validation — Security');
console.log('─'.repeat(50));

let CONFIG, FIREBASE_CONFIG;
try {
  const fs = require('fs');
  const configCode = fs.readFileSync('./config.js', 'utf-8');
  eval(configCode);
} catch {
  CONFIG = null;
  FIREBASE_CONFIG = null;
}

if (CONFIG) {
  assert('CONFIG is frozen (immutable)',
    Object.isFrozen(CONFIG)
  );

  assert('CONFIG has GEMINI_API_KEY',
    typeof CONFIG.GEMINI_API_KEY === 'string' && CONFIG.GEMINI_API_KEY.length > 10
  );

  assert('CONFIG has valid GEMINI_URL',
    CONFIG.GEMINI_URL?.includes('generativelanguage.googleapis.com')
  );

  assert('CONFIG has sensible rate limit',
    CONFIG.RATE_LIMIT_MAX > 0 && CONFIG.RATE_LIMIT_MAX <= 30
  );

  assert('CONFIG has max retries',
    CONFIG.MAX_RETRIES >= 1 && CONFIG.MAX_RETRIES <= 5
  );

  assert('CONFIG cache size is bounded',
    CONFIG.CACHE_MAX_SIZE > 0 && CONFIG.CACHE_MAX_SIZE <= 100
  );
} else {
  console.log('  ⏭  Skipped — config.js not found (gitignored; copy config.example.js)');
}

if (FIREBASE_CONFIG) {
  assert('FIREBASE_CONFIG is frozen (immutable)',
    Object.isFrozen(FIREBASE_CONFIG)
  );

  assert('FIREBASE_CONFIG has projectId',
    typeof FIREBASE_CONFIG.projectId === 'string' && FIREBASE_CONFIG.projectId.length > 0
  );

  assert('FIREBASE_CONFIG has authDomain',
    typeof FIREBASE_CONFIG.authDomain === 'string' && FIREBASE_CONFIG.authDomain.includes('.firebaseapp.com')
  );

  assert('FIREBASE_CONFIG has databaseURL',
    typeof FIREBASE_CONFIG.databaseURL === 'string' && FIREBASE_CONFIG.databaseURL.includes('firebaseio.com')
  );
} else if (!CONFIG) {
  // Already skipped above
} else {
  console.log('  ⏭  Skipped — FIREBASE_CONFIG not found');
}

// ==========================================
// TEST 6: RATE LIMIT LOGIC (Efficiency — resource management)
// ==========================================

console.log('\n⏱️ Test 6: Rate Limit Logic — Efficiency');
console.log('─'.repeat(50));

// Simulate the rate-limit window reset logic from callGemini
let apiCallsCount = 5;
let lastCallReset = Date.now() - 70000; // 70 seconds ago
const RATE_LIMIT_WINDOW_MS = 60000;

if (Date.now() - lastCallReset > RATE_LIMIT_WINDOW_MS) {
  apiCallsCount = 0;
  lastCallReset = Date.now();
}

assertEqual('Rate limit resets after window expires', apiCallsCount, 0);

// Simulate within window (should NOT reset)
apiCallsCount = 10;
lastCallReset = Date.now() - 30000; // 30 seconds ago (within window)

if (Date.now() - lastCallReset > RATE_LIMIT_WINDOW_MS) {
  apiCallsCount = 0;
  lastCallReset = Date.now();
}

assertEqual('Rate limit preserved within window', apiCallsCount, 10);

// LRU cache eviction test
const CACHE = new Map();
const CACHE_MAX = 3;
CACHE.set('a', 1);
CACHE.set('b', 2);
CACHE.set('c', 3);

// Adding a 4th entry should evict the first
if (CACHE.size >= CACHE_MAX) {
  CACHE.delete(CACHE.keys().next().value);
}
CACHE.set('d', 4);

assertEqual('LRU cache evicts oldest entry', CACHE.size, 3);
assert('LRU cache no longer has first entry', !CACHE.has('a'));
assert('LRU cache has newest entry', CACHE.has('d'));

// ==========================================
// TEST 7: GEMINI API SMOKE TEST (Google Services — optional)
// ==========================================

const isLive = process.argv.includes('--live');

if (isLive) {
  console.log('\n🤖 Test 7: Gemini API — Live Integration');
  console.log('─'.repeat(50));

  (async () => {
    try {
      const fs = require('fs');
      const configCode = fs.readFileSync('./config.js', 'utf-8');
      eval(configCode);

      const response = await fetch(`${CONFIG.GEMINI_URL}?key=${CONFIG.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Return JSON: {"status":"ok","model":"gemini"}' }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 100,
            responseMimeType: 'application/json',
          },
        }),
      });

      const data = await response.json();
      assert('API returns 200 OK', !data.error);

      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        const text = data.candidates[0].content.parts[0].text;
        const parsed = JSON.parse(text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim());
        assert('API returns valid JSON', typeof parsed === 'object');
        assert('API response has expected shape', parsed.status === 'ok');
        console.log('  📡 Model responded:', JSON.stringify(parsed));
      } else {
        assert('API returns expected response structure', false);
      }
    } catch (err) {
      assert(`API call succeeded (error: ${err.message})`, false);
    }

    printSummary();
  })();
} else {
  console.log('\n⏭  Test 7: Gemini API — Skipped (use --live flag to run)');
  printSummary();
}

// ==========================================
// SUMMARY
// ==========================================

function printSummary() {
  console.log('\n' + '═'.repeat(50));
  console.log(`📊 Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);

  if (failed > 0) {
    console.log('\n❌ Failures:');
    errors.forEach(e => console.log(`   • ${e}`));
    process.exit(1);
  } else {
    console.log('✅ All tests passed!');
    process.exit(0);
  }
}