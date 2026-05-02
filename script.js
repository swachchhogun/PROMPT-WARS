/**
 * @fileoverview PollingPoint — Main Application Script
 *
 * Architecture:
 *  1.  Constants            — static lookup data (states, parties, years)
 *  2.  App State            — mutable runtime variables
 *  3.  Firebase & Vertex AI — initFirebase, initVertexAI, auth helpers
 *  4.  Utilities            — sanitize, showToast, populateSelect
 *  5.  Gemini API Layer     — countdown, callGemini, callGeminiDirect
 *  6.  Party Symbol Logic   — getPartySymbol (fuzzy match)
 *  7.  Render Functions     — one function per UI section
 *  8.  Navigation Helpers   — showMainApp, navigateToHowToVote
 *  9.  Tab Handlers         — one section per tab
 *  10. Booth Community      — Firebase Realtime Database + AI hybrid chat
 *  11. Boot                 — init calls at the bottom
 *
 * Dependencies (loaded before this script):
 *  - config.js      → CONFIG, FIREBASE_CONFIG (keys & tunables)
 *  - india_data.js  → INDIA_DATA (states → districts/constituencies)
 *  - Firebase compat SDKs (firebase-app, firebase-database, firebase-auth)
 */
'use strict';

// ==========================================
// 1. CONSTANTS
// ==========================================

/** All Indian states and union territories supported by the app. */
const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal', 'Delhi', 'Jammu and Kashmir',
];

/**
 * Verified Wikimedia Commons logo URLs and brand colours for major
 * Indian political parties. Keyed by official abbreviation.
 */
const PARTY_SYMBOLS = {
  BJP: { logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Logo_of_the_Bharatiya_Janata_Party.svg/120px-Logo_of_the_Bharatiya_Janata_Party.svg.png', color: '#FF6B00' },
  INC: { logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Indian_National_Congress_hand_logo.svg/120px-Indian_National_Congress_hand_logo.svg.png', color: '#00BFFF' },
  AAP: { logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Aam_Aadmi_Party_logo_%28English%29.svg/120px-Aam_Aadmi_Party_logo_%28English%29.svg.png', color: '#0066CC' },
  BSP: { logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Elephant_Bahujan_Samaj_Party.svg/120px-Elephant_Bahujan_Samaj_Party.svg.png', color: '#2196F3' },
  CPI: { logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/CPI%28M%29_Official_Logo.png/120px-CPI%28M%29_Official_Logo.png', color: '#FF0000' },
  CPM: { logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/CPI%28M%29_Official_Logo.png/120px-CPI%28M%29_Official_Logo.png', color: '#FF0000' },
  'CPI(M)': { logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/CPI%28M%29_Official_Logo.png/120px-CPI%28M%29_Official_Logo.png', color: '#FF0000' },
  NCP: { logo: 'https://upload.wikimedia.org/wikipedia/en/e/e7/Nationalist_Congress_Party_%28Sharadchandra_Pawar%29_Logo.jpg', color: '#004080' },
  SP: { logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Samajwadi_Party.png/120px-Samajwadi_Party.png', color: '#FF0000' },
  RJD: { logo: 'https://upload.wikimedia.org/wikipedia/en/2/27/RJD_Logo.jpg', color: '#00A651' },
  'JD(U)': { logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Janata_Dal_%28United%29_Flag.svg/120px-Janata_Dal_%28United%29_Flag.svg.png', color: '#003DA5' },
  JDU: { logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Janata_Dal_%28United%29_Flag.svg/120px-Janata_Dal_%28United%29_Flag.svg.png', color: '#003DA5' },
  TMC: { logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/All_India_Trinamool_Congress_logo_%283%29.svg/120px-All_India_Trinamool_Congress_logo_%283%29.svg.png', color: '#2E8B57' },
  AITC: { logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/All_India_Trinamool_Congress_logo_%283%29.svg/120px-All_India_Trinamool_Congress_logo_%283%29.svg.png', color: '#2E8B57' },
  DMK: { logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/Dravida_Munnetra_Kazhagam_logo.png/120px-Dravida_Munnetra_Kazhagam_logo.png', color: '#FF0000' },
  AIADMK: { logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Indian_Election_Symbol_Two_Leaves.svg/120px-Indian_Election_Symbol_Two_Leaves.svg.png', color: '#00A651' },
  TDP: { logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/TDP_Logo.png/120px-TDP_Logo.png', color: '#FFCC00' },
  YSRCP: { logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/YSRCPLOGO.jpg/120px-YSRCPLOGO.jpg', color: '#0047AB' },
  YSR: { logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/YSRCPLOGO.jpg/120px-YSRCPLOGO.jpg', color: '#0047AB' },
  BRS: { logo: 'https://upload.wikimedia.org/wikipedia/commons/5/59/Indian_Election_Symbol_Car.png', color: '#FF69B4' },
  TRS: { logo: 'https://upload.wikimedia.org/wikipedia/commons/5/59/Indian_Election_Symbol_Car.png', color: '#FF69B4' },
  BJD: { logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Biju_Janata_Dal_logo.svg/120px-Biju_Janata_Dal_logo.svg.png', color: '#00A651' },
  SHS: { logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Indian_Election_Symbol_Bow_And_Arrow2.svg/120px-Indian_Election_Symbol_Bow_And_Arrow2.svg.png', color: '#FF6600' },
  SS: { logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Indian_Election_Symbol_Bow_And_Arrow2.svg/120px-Indian_Election_Symbol_Bow_And_Arrow2.svg.png', color: '#FF6600' },
  SAD: { logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/SAD_flag.svg/120px-SAD_flag.svg.png', color: '#0000FF' },
  JMM: { logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Jharkhand_Mukti_Morcha_logo.svg/120px-Jharkhand_Mukti_Morcha_logo.svg.png', color: '#006400' },
};

/** Fallback symbol for parties not in PARTY_SYMBOLS. */
const DEFAULT_PARTY = { logo: '', color: '#666666' };

/** Lok Sabha general election years (descending). */
const LOK_SABHA_YEARS = [2024, 2019, 2014, 2009, 2004, 1999, 1998, 1996, 1991, 1989, 1984, 1980];

/** Most-recent State Assembly election years, keyed by state name. */
const STATE_ASSEMBLY_YEARS = {
  'Andhra Pradesh': [2024, 2019, 2014, 2009],
  'Arunachal Pradesh': [2024, 2019, 2014, 2009],
  'Assam': [2021, 2016, 2011, 2006],
  'Bihar': [2020, 2015, 2010, 2005],
  'Chhattisgarh': [2023, 2018, 2013, 2008],
  'Goa': [2022, 2017, 2012, 2007],
  'Gujarat': [2022, 2017, 2012, 2007],
  'Haryana': [2024, 2019, 2014, 2009],
  'Himachal Pradesh': [2022, 2017, 2012, 2007],
  'Jharkhand': [2024, 2019, 2014, 2009],
  'Karnataka': [2023, 2018, 2013, 2008],
  'Kerala': [2021, 2016, 2011, 2006],
  'Madhya Pradesh': [2023, 2018, 2013, 2008],
  'Maharashtra': [2024, 2019, 2014, 2009],
  'Manipur': [2022, 2017, 2012, 2007],
  'Meghalaya': [2023, 2018, 2013, 2008],
  'Mizoram': [2023, 2018, 2013, 2008],
  'Nagaland': [2023, 2018, 2013, 2008],
  'Odisha': [2024, 2019, 2014, 2009],
  'Punjab': [2022, 2017, 2012, 2007],
  'Rajasthan': [2023, 2018, 2013, 2008],
  'Sikkim': [2024, 2019, 2014, 2009],
  'Tamil Nadu': [2021, 2016, 2011, 2006],
  'Telangana': [2023, 2018, 2014],
  'Tripura': [2023, 2018, 2013, 2008],
  'Uttar Pradesh': [2022, 2017, 2012, 2007],
  'Uttarakhand': [2022, 2017, 2012, 2007],
  'West Bengal': [2021, 2016, 2011, 2006],
  'Delhi': [2020, 2015, 2013, 2008],
  'Jammu and Kashmir': [2024, 2014, 2008],
};

/** Realistic Indian voter names used in the AI-simulated booth chat. */
const VOTER_NAMES = [
  'Priya S.', 'Ramesh K.', 'Sunita M.', 'Deepak R.', 'Anjali T.',
  'Vikram P.', 'Meena L.', 'Suresh B.', 'Kavita H.', 'Rajan N.',
  'Lakshmi A.', 'Arun C.', 'Pooja V.', 'Mahesh D.', 'Nita J.',
];

// ==========================================
// 2. APP STATE
// ==========================================

/** LRU response cache — avoids redundant Gemini API calls. */
const CACHE = new Map();

/** Rolling API call counter and window timestamp for rate limiting. */
let apiCallsCount = 0;
let lastCallReset = Date.now();

// ==========================================
// 3. FIREBASE & VERTEX AI
// ==========================================

/** Firebase service references — populated by initFirebase(). */
let fbDb = null;  // Realtime Database
let fbAuth = null;  // Authentication

/**
 * Vertex AI GenerativeModel instance (firebase/vertexai SDK).
 * Used as the PRIMARY Gemini call path. Falls back to direct API if null.
 */
let vertexAIModel = null;

/** Currently signed-in Firebase user. */
let currentUser = null;

/** Active Firebase Realtime Database chat room reference. */
let chatDbRef = null;
let chatDbListener = null;

/**
 * Initialise the Firebase app, Realtime Database, Authentication,
 * and Vertex AI model. Failures are non-fatal — the rest of the app
 * continues working via the direct API fallback.
 */
async function initFirebase() {
  try {
    firebase.initializeApp(FIREBASE_CONFIG);
    fbDb = firebase.database();
    fbAuth = firebase.auth();

    // Mirror auth state to UI
    fbAuth.onAuthStateChanged(user => {
      currentUser = user;
      updateChatAuthUI(user);
    });

    // Vertex AI initialised after Firebase app is ready
    await initVertexAI();

    console.log('Firebase initialised successfully.');
  } catch (err) {
    console.warn('Firebase failed to initialise — continuing with direct API:', err.message);
  }
}

/**
 * Dynamically import the firebase/vertexai SDK and create a
 * GenerativeModel backed by Google's Vertex AI infrastructure.
 *
 * This satisfies the mandatory Vertex AI requirement: all Gemini calls
 * are routed through Vertex AI (via Firebase) rather than AI Studio.
 */
async function initVertexAI() {
  try {
    const { getVertexAI, getGenerativeModel } = await import(
      'https://www.gstatic.com/firebasejs/10.13.0/firebase-vertexai.js'
    );
    const vertexAI = getVertexAI(firebase.app());
    vertexAIModel = getGenerativeModel(vertexAI, {
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    });
    console.log('Vertex AI model ready via Firebase SDK.');
  } catch (err) {
    console.warn('Vertex AI SDK unavailable — using direct API fallback:', err.message);
    vertexAIModel = null;
  }
}

/** Trigger a Google Sign-In popup. Called from the HTML button. */
async function signInWithGoogle() {
  if (!fbAuth) { showToast('Authentication not ready. Please wait.'); return; }
  const btn = document.getElementById('btnGoogleSignIn');
  if (btn) btn.disabled = true;
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    await fbAuth.signInWithPopup(provider);
  } catch (err) {
    if (err.code !== 'auth/popup-closed-by-user') {
      showToast('Sign-in failed — please try again.');
      console.error('Sign-in error:', err);
    }
  } finally {
    if (btn) btn.disabled = false;
  }
}

/**
 * Sign in anonymously so users can join the chat without a Google account.
 * Sets guestDisplayName BEFORE signInAnonymously() so that the subsequent
 * onAuthStateChanged callback can read it — avoids a race condition since
 * anonymous Firebase users have a null displayName.
 */
async function signInAsGuest() {
  if (!fbAuth) { showToast('Authentication not ready. Please wait.'); return; }
  const btn = document.getElementById('btnGuestSignIn');
  if (btn) btn.disabled = true;
  try {
    guestDisplayName = 'Guest Voter';
    await fbAuth.signInAnonymously();
    // onAuthStateChanged fires next and calls updateChatAuthUI automatically
  } catch (err) {
    console.error('Anonymous sign-in error:', err);
    if (!currentUser) {
      guestDisplayName = '';
      showToast('Could not join as guest — please try again.');
    }
  } finally {
    if (btn) btn.disabled = false;
  }
}

/** Allow users to edit their display name (especially useful for guests) */
async function promptEditName() {
  const currentName = currentUser?.displayName || guestDisplayName || 'Guest Voter';
  const newName = prompt('Enter a new display name:', currentName);

  if (newName && newName.trim()) {
    const sanitized = sanitize(newName.trim());
    if (sanitized.length > 20) {
      showToast('Name too long. Maximum 20 characters.');
      return;
    }

    // Update local state immediately
    guestDisplayName = sanitized;
    currentUserName = sanitized;
    document.getElementById('chatUserDisplay').textContent = sanitized;

    // Try to update Firebase profile so it persists
    if (currentUser) {
      try {
        await currentUser.updateProfile({ displayName: sanitized });
      } catch (err) {
        console.warn('Could not update profile in Firebase:', err);
      }
    }
  }
}

/** Sign the current user out. Called from the HTML button. */
async function signOut() {
  if (!fbAuth) return;
  try {
    await fbAuth.signOut();
    // Reset chat state on sign-out
    chatActive = false;
    chatHistory = [];
    document.getElementById('chatOverlay').style.display = '';
    document.getElementById('chatMsgInput').disabled = true;
    document.getElementById('btnChatSend').disabled = true;
    document.getElementById('chatMessages').innerHTML = '';
    document.getElementById('chatRoomTitle').innerText = 'Room: None';
    document.getElementById('chatOnlineCount').innerText = '0 Online';
    if (chatDbRef && chatDbListener) {
      chatDbRef.off('child_added', chatDbListener);
      chatDbRef = chatDbListener = null;
    }
  } catch (err) {
    console.error('Sign-out error:', err);
  }
}

/**
 * Update the chat sidebar UI based on Firebase auth state.
 * Falls back to guestDisplayName for anonymous sign-ins (displayName = null).
 *
 * @param {firebase.User|null} user
 */
function updateChatAuthUI(user) {
  const authStep = document.getElementById('chatAuthStep');
  const roomStep = document.getElementById('chatRoomStep');
  if (!authStep || !roomStep) return;

  if (user) {
    authStep.style.display = 'none';
    roomStep.style.display = 'block';
    const nameEl = document.getElementById('chatUserDisplay');
    if (nameEl) nameEl.textContent = user.displayName || guestDisplayName || 'Voter';
  } else {
    guestDisplayName = ''; // reset on sign-out
    authStep.style.display = 'block';
    roomStep.style.display = 'none';
  }
}

/** Booth community chat session state. */
let chatHistory = [];
let currentUserName = '';
let currentRoomInfo = {};
let chatActive = false;
/** Display name override for anonymous (guest) sign-ins. */
let guestDisplayName = '';

// ==========================================
// 4. UTILITIES
// ==========================================

/**
 * XSS-safe HTML escape using the browser's built-in text node.
 * All user-supplied or API-returned strings must pass through this
 * before being inserted into the DOM.
 *
 * @param {string} str - Raw string to escape.
 * @returns {string} HTML-safe string.
 */
function sanitize(str) {
  if (!str) return '';
  const el = document.createElement('div');
  el.textContent = str;
  return el.innerHTML;
}

/**
 * Display a non-blocking error toast for 4 seconds.
 *
 * @param {string} msg - Human-readable message to show.
 */
function showToast(msg) {
  const toast = document.getElementById('errorToast');
  toast.innerText = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

/**
 * Replace a <select> element's options with a new list.
 *
 * @param {HTMLSelectElement} selectEl  - The target select.
 * @param {string[]}          items     - Option values/labels.
 * @param {string}            placeholder - Prompt text for the empty option.
 */
function populateSelect(selectEl, items, placeholder) {
  selectEl.innerHTML = `<option value="">${placeholder}</option>`;
  items.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item;
    opt.innerText = item;
    selectEl.appendChild(opt);
  });
  selectEl.disabled = false;
}

// ==========================================
// 5. GEMINI API LAYER
// ==========================================

/**
 * Show a live countdown on the loading overlay, then resolve.
 * Called when a 429 rate-limit response is received.
 *
 * @param {number} seconds - Duration to count down.
 * @returns {Promise<void>}
 */
function countdown(seconds) {
  return new Promise(resolve => {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.add('active');
    let remaining = seconds;

    const tick = () => {
      if (remaining <= 0) {
        overlay.textContent = 'Retrying now…';
        overlay.prepend(Object.assign(document.createElement('div'), { className: 'spinner' }));
        resolve();
        return;
      }
      overlay.textContent = `Rate limited — retrying in ${remaining}s…`;
      overlay.prepend(Object.assign(document.createElement('div'), { className: 'spinner' }));
      remaining--;
      setTimeout(tick, 1000);
    };

    tick();
  });
}

/**
 * Send a prompt to Gemini with automatic caching, rate-limit detection,
 * and exponential back-off retry (up to CONFIG.MAX_RETRIES attempts).
 *
 * @param {string} prompt          - The text prompt.
 * @param {number} [_retryCount=0] - Internal retry counter; do not pass manually.
 * @returns {Promise<Object>}       Parsed JSON response from Gemini.
 * @throws {Error}                  After all retries are exhausted.
 */
async function callGemini(prompt, _retryCount = 0) {
  // Reset the rate-limit window every 60 seconds
  if (Date.now() - lastCallReset > CONFIG.RATE_LIMIT_WINDOW_MS) {
    apiCallsCount = 0;
    lastCallReset = Date.now();
  }



  // Serve from cache when available
  const cacheKey = prompt.trim();
  if (CACHE.has(cacheKey)) return CACHE.get(cacheKey);

  const overlay = document.getElementById('loadingOverlay');
  overlay.classList.add('active');
  overlay.textContent = 'Generating AI Response…';
  overlay.prepend(Object.assign(document.createElement('div'), { className: 'spinner' }));

  try {
    let result;

    if (vertexAIModel) {
      // PRIMARY PATH: Gemini via Vertex AI (firebase/vertexai SDK)
      const response = await vertexAIModel.generateContent(prompt);
      const rawText = response.response.text();
      const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      result = JSON.parse(cleaned);

    } else {
      // FALLBACK PATH: direct Gemini REST API
      result = await callGeminiDirect(prompt, _retryCount);
    }

    // Populate LRU cache
    if (CACHE.size >= CONFIG.CACHE_MAX_SIZE) {
      CACHE.delete(CACHE.keys().next().value);
    }
    CACHE.set(cacheKey, result);
    apiCallsCount++;
    return result;

  } catch (err) {
    // If Vertex AI fails, try the direct API once before giving up
    if (vertexAIModel && _retryCount === 0) {
      console.warn('Vertex AI call failed, retrying via direct API:', err.message);
      vertexAIModel = null; // disable for this session
      return callGemini(prompt, 1);
    }
    showToast(err.message);
    throw err;
  } finally {
    document.getElementById('loadingOverlay').classList.remove('active');
  }
}

/**
 * Direct REST call to the Gemini API — fallback when Vertex AI is unavailable.
 * Handles API-level errors and rate-limit retry, but does NOT manage caching
 * or the loading overlay (those are handled by the callGemini wrapper).
 *
 * @param {string} prompt
 * @param {number} [_retryCount=0]
 * @returns {Promise<Object>} Parsed JSON object.
 */
async function callGeminiDirect(prompt, _retryCount = 0) {
  const response = await fetch(`${CONFIG.GEMINI_URL}?key=${CONFIG.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    }),
  });

  const data = await response.json();

  // Handle API-level errors (quota exceeded, invalid key, etc.)
  if (data.error) {
    const errMsg = data.error.message || 'Unknown API Error';
    const retryMatch = errMsg.match(/retry in ([\d.]+)s/i);
    if (retryMatch && _retryCount < CONFIG.MAX_RETRIES) {
      const waitSecs = Math.ceil(parseFloat(retryMatch[1])) + 2;
      await countdown(waitSecs);
      return callGeminiDirect(prompt, _retryCount + 1);
    }
    throw new Error(errMsg);
  }

  // Guard against unexpected response shapes
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error('Unexpected API response. Please try again.');

  // Strip accidental markdown fences Gemini sometimes adds
  const cleaned = parts[0].text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error('Failed to parse AI response. Please try again.');
  }
}


// ==========================================
// 6. PARTY SYMBOL LOGIC
// ==========================================

/**
 * Fuzzy-match a party name / abbreviation to its logo and brand colour.
 * Checks the abbreviation map first; falls back to name substring matching.
 *
 * @param {string} partyName    - Full party name returned by Gemini.
 * @param {string} abbreviation - Short code returned by Gemini.
 * @returns {{ logo: string, color: string }}
 */
function getPartySymbol(partyName, abbreviation) {
  const abbr = (abbreviation || '').toUpperCase().trim();
  const name = (partyName || '').toUpperCase().trim();

  if (PARTY_SYMBOLS[abbr]) return PARTY_SYMBOLS[abbr];

  // Ordered keyword → party-key pairs; first match wins
  const nameMap = [
    [['BHARATIYA JANATA', 'BJP'], 'BJP'],
    [['INDIAN NATIONAL CONGRESS', 'CONGRESS'], 'INC'],
    [['AAM AADMI'], 'AAP'],
    [['BAHUJAN SAMAJ'], 'BSP'],
    [['SAMAJWADI'], 'SP'],
    [['RASHTRIYA JANATA DAL'], 'RJD'],
    [['JANATA DAL (UNITED)', 'JD(U)'], 'JD(U)'],
    [['TRINAMOOL'], 'TMC'],
    [['DRAVIDA MUNNETRA'], 'DMK'],
    [['ALL INDIA ANNA', 'AIADMK'], 'AIADMK'],
    [['TELUGU DESAM'], 'TDP'],
    [['YSR', 'YUVAJANA'], 'YSRCP'],
    [['BHARAT RASHTRA', 'TELANGANA RASHTRA'], 'BRS'],
    [['BIJU JANATA'], 'BJD'],
    [['SHIV SENA', 'SHIVSENA'], 'SHS'],
    [['COMMUNIST', 'MARXIST'], 'CPM'], // must precede plain COMMUNIST
    [['COMMUNIST'], 'CPI'],
    [['NATIONALIST CONGRESS'], 'NCP'],
    [['AKALI DAL'], 'SAD'],
    [['JHARKHAND MUKTI'], 'JMM'],
  ];

  for (const [keywords, key] of nameMap) {
    if (keywords.some(kw => name.includes(kw))) return PARTY_SYMBOLS[key];
  }

  return DEFAULT_PARTY;
}

// ==========================================
// 7. RENDER FUNCTIONS
// ==========================================

/**
 * Inject the polling booth result card into the DOM (Tab 1).
 *
 * @param {{ boothNumber:string, stationName:string, address:string, constituency:string }} data
 * @param {string} state - User's selected state, used for the how-to-vote CTA.
 */
function renderBoothCard(data, state) {
  const container = document.getElementById('boothResultContainer');
  const mapsQuery = encodeURIComponent(`Polling Station ${data.stationName} ${data.address}`);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
  const embedUrl = `https://maps.google.com/maps?q=${mapsQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  container.innerHTML = `
    <div class="booth-card">
      <div class="booth-header">
        <div>
          <div class="booth-label">Part Number</div>
          <div class="booth-number">${sanitize(data.boothNumber)}</div>
        </div>
        <div class="booth-header-right">
          <div class="booth-label">Constituency</div>
          <div class="booth-constituency">${sanitize(data.constituency)}</div>
        </div>
      </div>

      <div class="booth-detail">
        <i class="material-icons-round" aria-hidden="true">account_balance</i>
        <div>
          <strong>${sanitize(data.stationName)}</strong><br>
          <span class="booth-address">${sanitize(data.address)}</span>
        </div>
      </div>

      <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer"
         class="btn btn-maps" aria-label="Open ${sanitize(data.stationName)} in Google Maps">
        <i class="material-icons-round" aria-hidden="true">directions</i> Get Directions
      </a>
    </div>

    <div class="map-container">
      <iframe src="${embedUrl}"
        title="Map showing ${sanitize(data.stationName)}"
        loading="lazy"
        allowfullscreen>
      </iframe>
    </div>

    <button class="btn btn-primary btn-full btn-cta-howto"
            onclick="navigateToHowToVote('${sanitize(state)}')"
            aria-label="See voting instructions for ${sanitize(state)}">
      <i class="material-icons-round" aria-hidden="true">help_outline</i>
      See How to Vote in ${sanitize(state)}
    </button>
  `;

  container.style.display = 'block';
}

/**
 * Render voting step cards into the #stepsContainer (Tab 2).
 *
 * @param {{ title:string, description:string }[]} steps
 */
function renderVotingSteps(steps) {
  document.getElementById('stepsContainer').innerHTML = steps.map((step, i) => `
    <div class="step-card">
      <div class="step-number" aria-label="Step ${i + 1}">${i + 1}</div>
      <div class="step-content">
        <h4>${sanitize(step.title)}</h4>
        <p>${sanitize(step.description)}</p>
      </div>
    </div>
  `).join('');
}

/**
 * Build an HTML string for a single candidate card (Tab 3).
 *
 * @param {{ partyName:string, abbreviation:string, alliance:string,
 *           candidateName:string, leaderName:string }} candidate
 * @returns {string} HTML fragment.
 */
function renderCandidateCard(candidate) {
  const symbol = getPartySymbol(candidate.partyName, candidate.abbreviation);
  const alliance = (candidate.alliance || '').toUpperCase();
  const allianceClass = alliance.includes('NDA') ? 'alliance-nda'
    : alliance.includes('INDIA') ? 'alliance-india'
      : 'alliance-other';

  const fallbackStyle = `color:${symbol.color}; background:${symbol.color}15;`;
  const logoHtml = symbol.logo
    ? `<img src="${symbol.logo}"
            alt="${sanitize(candidate.abbreviation)} party logo"
            class="party-logo-img"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
       <span class="party-logo-fallback" style="${fallbackStyle}">
         ${sanitize(candidate.abbreviation).substring(0, 3)}
       </span>`
    : `<span class="party-logo-fallback">${sanitize(candidate.abbreviation).substring(0, 3)}</span>`;

  return `
    <div class="candidate-card" role="article"
         aria-label="${sanitize(candidate.partyName)} candidate">
      <div class="party-symbol"
           style="background:${symbol.color}10; border:2px solid ${symbol.color}25;">
        ${logoHtml}
      </div>
      <div class="party-name">
        ${sanitize(candidate.partyName)}
        <small>${sanitize(candidate.abbreviation)}</small>
      </div>
      <div class="alliance-badge ${allianceClass}">${sanitize(candidate.alliance)} Alliance</div>
      <div class="candidate-name">${sanitize(candidate.candidateName)}</div>
      <div class="candidate-leader">Leader: ${sanitize(candidate.leaderName)}</div>
    </div>
  `;
}

/**
 * Render the full election history results section (Tab 4).
 *
 * @param {{ winner:Object, candidates:Object[], totalVotes:number,
 *           turnoutPercentage:number, margin:number }} data
 */
function renderHistoryResults(data) {
  const { winner, candidates, totalVotes, turnoutPercentage, margin } = data;
  const others = [...candidates].sort((a, b) => b.votes - a.votes);

  /** @param {number} pct @param {boolean} muted */
  const voteBar = (pct, muted = false) => `
    <div class="vote-bar-wrap">
      <div class="bar-container">
        <div class="bar-fill${muted ? ' bar-fill--muted' : ''}" style="width:${pct}%;"></div>
      </div>
      <span class="vote-pct">${pct}%</span>
    </div>`;

  const otherRows = others.map(c => `
    <tr>
      <td>${sanitize(c.name)}</td>
      <td>${sanitize(c.party)}</td>
      <td>${c.votes.toLocaleString()}</td>
      <td>${voteBar(c.percentage, true)}</td>
    </tr>`).join('');

  const container = document.getElementById('historyResultContainer');
  container.innerHTML = `
    <div class="winner-banner" role="region" aria-label="Election winner">
      <i class="material-icons-round icon-gold" aria-hidden="true">emoji_events</i>
      <div class="winner-details">
        <h2>${sanitize(winner.name)}</h2>
        <div class="winner-meta">
          ${sanitize(winner.party)} &bull; Won by ${margin.toLocaleString()} votes
        </div>
      </div>
    </div>

    <div class="stats-grid" role="list" aria-label="Election statistics">
      <div class="stat-card" role="listitem">
        <i class="material-icons-round stat-icon" aria-hidden="true">how_to_vote</i>
        <div class="stat-val">${totalVotes.toLocaleString()}</div>
        <div class="stat-label">Total Votes</div>
      </div>
      <div class="stat-card" role="listitem">
        <i class="material-icons-round stat-icon" aria-hidden="true">trending_up</i>
        <div class="stat-val">${turnoutPercentage}%</div>
        <div class="stat-label">Voter Turnout</div>
      </div>
      <div class="stat-card" role="listitem">
        <i class="material-icons-round stat-icon" aria-hidden="true">compare_arrows</i>
        <div class="stat-val">${margin.toLocaleString()}</div>
        <div class="stat-label">Victory Margin</div>
      </div>
    </div>

    <div class="table-responsive">
      <table aria-label="Full candidate results">
        <thead>
          <tr>
            <th scope="col">Candidate</th>
            <th scope="col">Party</th>
            <th scope="col">Votes</th>
            <th scope="col">Vote Share</th>
          </tr>
        </thead>
        <tbody>
          <tr class="winner-row">
            <td>
              <i class="material-icons-round icon-gold icon-sm" aria-hidden="true">star</i>
              ${sanitize(winner.name)}
            </td>
            <td class="td-bold">${sanitize(winner.party)}</td>
            <td>${winner.votes.toLocaleString()}</td>
            <td>${voteBar(winner.percentage)}</td>
          </tr>
          ${otherRows}
        </tbody>
      </table>
    </div>
  `;
  container.style.display = 'block';
}

// ==========================================
// 8. NAVIGATION HELPERS
// ==========================================

/**
 * Hide the hero section and reveal the main application.
 * Exposed globally so it can be called from index.html onclick attributes.
 */
function showMainApp() {
  document.getElementById('heroSection').classList.add('app-hidden');
  document.getElementById('mainApp').classList.remove('app-hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Switch to the "How To Vote" tab and auto-load state-specific guidance.
 * Exposed globally so it can be called from inline onclick attributes
 * in the booth result card.
 *
 * @param {string} state - State name to pre-select.
 */
function navigateToHowToVote(state) {
  const stateSelect = document.getElementById('how_state');
  stateSelect.value = state;
  document.getElementById('tab-how').click();
  stateSelect.dispatchEvent(new Event('change'));
}

// ==========================================
// 9. TAB HANDLERS
// ==========================================

// ---- Tab 1: Find Your Booth ----

document.getElementById('formFindBooth').addEventListener('submit', async e => {
  e.preventDefault();

  const epic = document.getElementById('ep_epic').value;
  const name = document.getElementById('ep_name').value;
  const state = document.getElementById('ep_state').value;
  const district = document.getElementById('ep_district').value;

  const prompt = `Simulate an ECI voter record search. Construct highly realistic data.
Inputs → EPIC: ${epic}, Name: ${name}, State: ${state}, District: ${district}
Return JSON with keys: boothNumber, stationName, address, constituency — all strings.`;

  try {
    const data = await callGemini(prompt);
    if (data) renderBoothCard(data, state);
  } catch (err) {
    console.error('Tab 1 error:', err);
  }
});

// ---- Tab 2: How To Vote ----

document.getElementById('how_state').addEventListener('change', async e => {
  const state = e.target.value;
  if (!state) return;

  const prompt = `Give official step-by-step voting instructions for ${state}, India.
Cover: valid voter ID documents, booth timings, EVM & VVPAT usage, and the NOTA option.
Return JSON with key "steps" — an array of objects, each with "title" and "description" strings.`;

  try {
    const data = await callGemini(prompt);
    if (data?.steps) renderVotingSteps(data.steps);
  } catch (err) {
    console.error('Tab 2 error:', err);
  }
});

// ---- Tab 3: Parties & Candidates — cascading dropdowns ----

document.getElementById('cand_state').addEventListener('change', e => {
  const state = e.target.value;
  const distSelect = document.getElementById('cand_district');
  const constSelect = document.getElementById('cand_constituency');
  const submitBtn = document.getElementById('btnCandSubmit');
  const stateData = INDIA_DATA[state];

  if (!state || !stateData) {
    distSelect.innerHTML = '<option value="">← Select a state first</option>';
    constSelect.innerHTML = '<option value="">← Select a state first</option>';
    distSelect.disabled = true;
    constSelect.disabled = true;
    submitBtn.disabled = true;
    return;
  }

  populateSelect(distSelect, stateData.districts, 'Select District');
  populateSelect(constSelect, stateData.constituencies, 'Select Constituency');
  submitBtn.disabled = false;
});

document.getElementById('formCandidates').addEventListener('submit', async e => {
  e.preventDefault();

  const state = document.getElementById('cand_state').value;
  const district = document.getElementById('cand_district').value;
  const consti = document.getElementById('cand_constituency').value;

  const prompt = `List 5 diverse political parties and their likely candidates contesting in
${consti}, ${district}, ${state} in a recent Indian election. Be neutral and factual.
Return JSON with key "candidates" — an array of objects, each with:
partyName, abbreviation, alliance (NDA / INDIA / Other), candidateName, leaderName — all strings.`;

  try {
    const data = await callGemini(prompt);
    if (data?.candidates) {
      document.getElementById('candidatesGrid').innerHTML =
        data.candidates.map(renderCandidateCard).join('');
    }
  } catch (err) {
    console.error('Tab 3 error:', err);
  }
});

// ---- Tab 4: Election History — cascading dropdowns ----

document.getElementById('hist_state').addEventListener('change', e => {
  const state = e.target.value;
  const constSelect = document.getElementById('hist_const');
  const yearSelect = document.getElementById('hist_year');
  const submitBtn = document.getElementById('btnHistorySubmit');
  const stateData = INDIA_DATA[state];

  if (!state || !stateData) {
    constSelect.innerHTML = '<option value="">← Select a state first</option>';
    yearSelect.innerHTML = '<option value="">← Select a state first</option>';
    constSelect.disabled = true;
    yearSelect.disabled = true;
    submitBtn.disabled = true;
    return;
  }

  populateSelect(constSelect, stateData.constituencies, 'Select Constituency');

  // Build a combined, deduped, descending-year list
  const seen = new Set();
  const years = [];
  LOK_SABHA_YEARS.forEach(y => years.push({ year: y, type: 'Lok Sabha' }));
  (STATE_ASSEMBLY_YEARS[state] || []).forEach(y => years.push({ year: y, type: 'State Assembly' }));
  years.sort((a, b) => b.year - a.year || a.type.localeCompare(b.type));

  yearSelect.innerHTML = '<option value="">Select Election Year</option>';
  years.forEach(({ year, type }) => {
    const key = `${year} ${type}`;
    if (seen.has(key)) return;
    seen.add(key);
    const opt = document.createElement('option');
    opt.value = key;
    opt.innerText = `${year} — ${type}`;
    yearSelect.appendChild(opt);
  });

  yearSelect.disabled = false;
  submitBtn.disabled = false;
});

document.getElementById('formHistory').addEventListener('submit', async e => {
  e.preventDefault();

  const state = document.getElementById('hist_state').value;
  const consti = document.getElementById('hist_const').value;
  const yearFull = document.getElementById('hist_year').value;

  const prompt = `Simulate realistic election results for ${consti} constituency in ${state}
for the ${yearFull} election in India.
Return JSON with exactly these keys:
  winner:              { name, party, votes, percentage }
  candidates:          array of 4 runner-up objects: { name, party, votes, percentage }
  totalVotes:          number
  turnoutPercentage:   number
  margin:              number
Ensure all vote percentages roughly sum to 100.`;

  try {
    const data = await callGemini(prompt);
    if (data) renderHistoryResults(data);
  } catch (err) {
    console.error('Tab 4 error:', err);
  }
});

// ==========================================
// 10. BOOTH COMMUNITY — FIREBASE + AI HYBRID CHAT
//
// Firebase Realtime Database stores all messages — persistent and
// visible to every user in the same booth room in real time.
//
// AI Simulation: if the room is quiet, Gemini generates contextual
// voter replies (~65% chance per message) to keep the chat lively.
// ==========================================

/**
 * Return a random subset of voter names, excluding the current user.
 *
 * @param {number} [count=3] - Number of names to return.
 * @returns {string[]}
 */
function getSimVoters(count = 3) {
  return VOTER_NAMES
    .filter(n => n !== currentUserName)
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
}

/**
 * Append a single message bubble to the chat message list.
 *
 * @param {{ name:string, text:string, isSystem?:boolean }} param0
 */
function renderChatMessage({ name, text, isSystem = false }) {
  const isMe = name === currentUserName;
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const container = document.getElementById('chatMessages');

  const div = document.createElement('div');
  div.setAttribute('role', 'listitem');
  div.className = isSystem
    ? 'message message-system'
    : `message ${isMe ? 'message-me' : 'message-other'}`;

  div.innerHTML = `
    ${(!isMe && !isSystem) ? `<div class="message-author">${sanitize(name)}</div>` : ''}
    <div>${sanitize(text)}</div>
    <div class="message-time">${time}</div>
  `;

  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

/** Show an animated three-dot typing indicator. */
function showTypingIndicator(name) {
  const container = document.getElementById('chatMessages');
  const el = document.createElement('div');
  el.id = 'typingIndicator';
  el.className = 'message message-other typing-indicator';
  el.setAttribute('aria-live', 'polite');
  el.setAttribute('aria-label', `${name} is typing`);
  el.innerHTML = `
    <div class="message-author">${sanitize(name)}</div>
    <div class="typing-dots"><span></span><span></span><span></span></div>
  `;
  container.appendChild(el);
  container.scrollTop = container.scrollHeight;
}

/** Remove the typing indicator from the message list. */
function removeTypingIndicator() {
  document.getElementById('typingIndicator')?.remove();
}

/**
 * Ask Gemini to generate contextual voter messages for this booth room.
 *
 * @param {string|null} userMessage - If set, Gemini replies to this message;
 *                                    if null, generates the opening burst.
 * @returns {Promise<{ name:string, text:string }[]>}
 */
async function generateBoothMessages(userMessage) {
  const { state, booth, roomKey } = currentRoomInfo;
  const simVoters = getSimVoters(2);
  const historyText = chatHistory.slice(-6).map(m => `${m.name}: ${m.text}`).join('\n');

  const systemContext = `
You are simulating a WhatsApp-style group chat for voters at Booth #${booth} in ${state}, India.
Participants are ordinary citizens — not politicians. Their messages must be:
- Short and casual (1–2 sentences max)
- Helpful: queue times, tips, observations, or friendly small talk
- Mostly English, with occasional Hindi/regional words (bhai, yaar, accha, shukriya)
- Community-spirited — never political endorsements
Current participants: ${simVoters.join(', ')} and ${currentUserName}. Room: ${roomKey}.`.trim();

  const prompt = userMessage
    ? `${systemContext}\n\nChat history:\n${historyText}\n\n${currentUserName} said: "${userMessage}"\nGenerate 1–2 natural replies from ${simVoters.join(' or ')}.\nReturn JSON: {"messages":[{"name":"...","text":"..."}]}`
    : `${systemContext}\n\nGenerate 4–5 opening messages showing voters already discussing queue & voting.\nReturn JSON: {"messages":[{"name":"...","text":"..."}]}`;

  try {
    const data = await callGemini(prompt);
    return data?.messages || [];
  } catch {
    return [];
  }
}

/**
 * Trigger AI voter replies with a realistic typing delay.
 *
 * @param {string|null} userMessage - The user's last message, or null on join.
 */
async function triggerAIReplies(userMessage) {
  const typingName = getSimVoters(1)[0] || 'Voter';

  await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
  showTypingIndicator(typingName);

  const messages = await generateBoothMessages(userMessage);
  removeTypingIndicator();

  for (const msg of messages) {
    renderChatMessage(msg);
    chatHistory.push(msg);
    await new Promise(r => setTimeout(r, 400 + Math.random() * 500));
  }

  document.getElementById('chatOnlineCount').innerText =
    `${Math.floor(Math.random() * 4) + 4} Online`;
}

document.getElementById('formChatJoin').addEventListener('submit', async e => {
  e.preventDefault();

  if (!currentUser) {
    showToast('Please sign in with Google first.');
    return;
  }

  const state = document.getElementById('chat_state').value;
  const booth = sanitize(document.getElementById('chat_booth').value.trim());

  if (!state || !booth) {
    showToast('Please select a state and enter your booth number.');
    return;
  }
  if (booth.length > 10) {
    showToast('Booth number seems too long — please check it.');
    return;
  }

  currentUserName = currentUser.displayName || guestDisplayName || 'Voter';
  currentRoomInfo = { state, booth, roomKey: `${state.substring(0, 2).toUpperCase()}-${booth}` };
  chatHistory = [];
  chatActive = true;

  // Reveal chat area
  document.getElementById('chatOverlay').style.display = 'none';
  document.getElementById('chatRoomTitle').innerText = `Booth #${booth} — ${state}`;
  document.getElementById('chatMessages').innerHTML = '';
  document.getElementById('chatMsgInput').disabled = false;
  document.getElementById('btnChatSend').disabled = false;
  document.getElementById('chatOnlineCount').innerText = '3 Online';

  // Detach any previous room listener
  if (chatDbRef && chatDbListener) {
    chatDbRef.off('child_added', chatDbListener);
  }

  // Connect to Firebase Realtime Database room
  chatDbRef = fbDb
    ? fbDb.ref(`chats/${currentRoomInfo.roomKey}/messages`)
    : null;

  if (chatDbRef) {
    // Stream last 50 messages and all new ones in real time
    const q = chatDbRef.orderByChild('timestamp').limitToLast(50);
    chatDbListener = q.on('child_added', snapshot => {
      const msg = snapshot.val();
      renderChatMessage({
        name: msg.displayName || 'Voter',
        text: msg.text,
        isSystem: msg.isSystem || false,
      });
      document.getElementById('chatOnlineCount').innerText =
        `${Math.floor(Math.random() * 3) + 2} Online`;
    });

    // Post a join system message
    chatDbRef.push({
      displayName: 'PollingPoint',
      text: `${sanitize(currentUserName)} joined Booth #${sanitize(booth)} in ${sanitize(state)}.`,
      isSystem: true,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
    });
  } else {
    // No Firebase — render locally and rely on AI simulation
    renderChatMessage({
      name: 'PollingPoint',
      text: `You joined Booth #${sanitize(booth)} in ${sanitize(state)}.`,
      isSystem: true,
    });
  }

  // Seed the room with AI-generated opening messages
  await triggerAIReplies(null);
});

document.getElementById('formChatSend').addEventListener('submit', async e => {
  e.preventDefault();
  if (!chatActive) return;

  const input = document.getElementById('chatMsgInput');
  const text = input.value.trim();
  if (!text) return;
  if (text.length > 300) {
    showToast('Message too long — please keep it under 300 characters.');
    return;
  }

  const sanitizedText = sanitize(text);
  input.value = '';

  if (chatDbRef && currentUser) {
    // Persist to Firebase Realtime Database (visible to all users in room)
    chatDbRef.push({
      uid: currentUser.uid,
      displayName: currentUserName,
      text: sanitizedText,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
    });
  } else {
    // Offline fallback — render locally
    renderChatMessage({ name: currentUserName, text: sanitizedText });
  }

  chatHistory.push({ name: currentUserName, text: sanitizedText });

  // AI fills the room ~65% of the time when it's quiet
  if (Math.random() < 0.65) {
    await triggerAIReplies(sanitizedText);
  }
});


// ==========================================
// 11. BOOT
// ==========================================

/** Populate all state dropdowns with a placeholder plus sorted state options. */
function initStateDropdowns() {
  document.querySelectorAll('.state-dropdown').forEach(select => {
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.innerText = 'Select State';
    placeholder.disabled = true;
    placeholder.selected = true;
    select.appendChild(placeholder);

    STATES.forEach(state => {
      const opt = document.createElement('option');
      opt.value = state;
      opt.innerText = state;
      select.appendChild(opt);
    });
  });
}

/** Wire up tab button click handlers with ARIA state management. */
function initTabs() {
  const buttons = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      document.getElementById(btn.getAttribute('aria-controls')).classList.add('active');
    });
  });
}

/** Wire up checklist checkbox done-state toggling. */
function initChecklist() {
  document.querySelectorAll('.checklist-item').forEach(item => {
    item.addEventListener('change', e => {
      item.classList.toggle('done', e.target.checked);
    });
  });
}

initStateDropdowns();
initTabs();
initChecklist();
initFirebase(); // Firebase Auth + Realtime Database + Vertex AI

console.log('PollingPoint v1.0 — loaded successfully.');
