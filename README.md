<div align="center">

# 🗳️ PollingPoint

### AI-Powered Voting Companion for Indian Democracy

**Built for Google Prompt Wars 2025**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Cloud%20Run-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)](https://pollingpoint-538243488914.us-central1.run.app)
[![Gemini AI](https://img.shields.io/badge/Gemini%202.5%20Flash-Vertex%20AI-8E44AD?style=for-the-badge&logo=google&logoColor=white)](https://cloud.google.com/vertex-ai)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20RTDB-FF6B00?style=for-the-badge&logo=firebase&logoColor=white)](https://firebase.google.com)

---

*From finding your polling booth to chatting live with voters at your exact station — everything you need for election day, powered by Google Gemini AI.*

</div>

---

## ✨ What Is PollingPoint?

Most Indian voters face the same frustrations on election day: they don't know where their polling booth is, they've never seen an EVM machine before, they don't know who's contesting in their constituency, and the official Election Commission resources are scattered and hard to navigate.

**PollingPoint** solves all of this in one place — five AI-powered features wrapped in a clean, government-inspired UI, with a real-time community chat so voters at the same booth can talk to each other before they vote.

**Live URL →** https://pollingpoint-538243488914.us-central1.run.app

---

## 🚀 Features

### 🔍 1. Find Your Polling Booth
Enter your EPIC number, name, state, and district. Gemini simulates an ECI voter record lookup and returns your booth number, station name, full address, and constituency — with an embedded Google Map and a "Get Directions" button.

### 📋 2. How To Vote
Select your state and get official step-by-step voting instructions: valid ID documents, booth timings, how to operate the EVM and VVPAT machine, what NOTA means, and what NOT to bring inside. Cross-links to your state after finding your booth.

### 🏛️ 3. Know Your Candidates
Cascading dropdowns (State → District → Constituency) populated from a local geographic dataset — no waiting for AI to enumerate districts. Gemini returns 5 parties with names, alliances (NDA / I.N.D.I.A / Other), candidate names, leader names, and verified party logos from Wikimedia Commons.

### 📊 4. Election History
Query past Lok Sabha and State Assembly results for any constituency. Gemini returns the winner, runners-up, total votes, voter turnout, and victory margin — rendered as a winner banner, stats grid, and animated vote-share bar chart.

### 💬 5. Booth Community Chat *(the centrepiece)*
A real-time multi-user chat room per polling booth, powered by Firebase Realtime Database. Sign in with Google or join anonymously as a Guest Voter. All messages are live — open the same room in two tabs and you'll see them sync instantly. An AI layer adds simulated voter replies (~65% chance per message) to keep the room feeling alive.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **AI / LLM** | Gemini 2.5 Flash Lite | Powers all 5 features |
| **AI Routing** | Vertex AI via `firebase/vertexai` SDK | Mandatory competition requirement — all Gemini calls go through Vertex AI |
| **Auth** | Firebase Authentication | Google Sign-In + Anonymous guest access |
| **Database** | Firebase Realtime Database | Live chat storage and sync |
| **Hosting** | Google Cloud Run (`nginx:alpine`) | Production deployment |
| **Maps** | Google Maps Embed | Polling station location & directions |
| **Fonts** | Google Fonts (`Outfit`) | Typography |
| **Frontend** | Vanilla HTML + CSS + JavaScript | Zero npm dependencies in the browser |

> **Why no framework?** Judges can read every line. Zero build step, zero node_modules, zero magic. What you see is what runs.

---

## 🏗️ Architecture

```
Browser
│
├── index.html        → Markup + ARIA semantics
├── style.css         → Full design system (CSS variables, animations, no Tailwind)
├── config.js         → API keys (Object.freeze, documented, isolated)
├── india_data.js     → State → Districts → Constituencies (static lookup, ~800 lines)
└── script.js         → Main app logic (11 sections, JSDoc on every function)
      │
      ├── Firebase compat SDK (CDN)
      │     ├── firebase-app-compat.js
      │     ├── firebase-database-compat.js
      │     └── firebase-auth-compat.js
      │
      └── Vertex AI (dynamic ES module import, post-Firebase init)
            └── firebase-vertexai.js
                  └── getVertexAI() → getGenerativeModel('gemini-2.5-flash-lite')
```

### Gemini Call Pipeline

```
User triggers a feature
        │
        ▼
callGemini(prompt)
        ├── Hit LRU cache? → return instantly (20-entry cache)
        ├── Near rate limit? → show countdown UI (18 req/min window)
        │
        ▼
[PRIMARY]  vertexAIModel.generateContent()   ← Vertex AI via Firebase SDK
        │  fails?
        ▼
[FALLBACK] fetch() → generativelanguage.googleapis.com  ← Direct REST API
        │
        ▼
Strip markdown fences → JSON.parse() → cache → return to feature handler
```

---

## 📁 Project Structure

```
PROMPT-WARS/
├── index.html          # App shell — all 5 tab panels, chat sidebar, hero section
├── style.css           # ~1,260 lines — design tokens, components, animations
├── script.js           # ~1,220 lines — 11 documented sections
│   ├── § 1  Constants            (states, parties, years)
│   ├── § 2  App State            (cache, rate-limit counters)
│   ├── § 3  Firebase & Vertex AI (init, auth helpers)
│   ├── § 4  Utilities            (sanitize, showToast, populateSelect)
│   ├── § 5  Gemini API Layer     (callGemini, callGeminiDirect, countdown)
│   ├── § 6  Party Symbol Logic   (fuzzy logo & colour matching)
│   ├── § 7  Render Functions     (booth card, steps, candidates, history)
│   ├── § 8  Navigation Helpers   (showMainApp, navigateToHowToVote)
│   ├── § 9  Tab Handlers         (form submit listeners per tab)
│   ├── § 10 Booth Community      (Firebase chat, AI simulation)
│   └── § 11 Boot                 (initStateDropdowns, initTabs, initFirebase)
├── india_data.js       # Static geographic data — all states, districts, constituencies
├── config.js           # GEMINI_API_KEY, FIREBASE_CONFIG, tunables
├── Dockerfile          # nginx:alpine — serves static files on port 8080
└── .gcloudignore       # Excludes test files from Cloud Build context
```

---

## ⚙️ Running Locally

```bash
# No build step needed — it's plain HTML/CSS/JS
# Any static server works. Recommended:
npx serve .

# Then open:
# http://localhost:3000
```

Before running, edit `config.js` and fill in:
- `GEMINI_API_KEY` — from [Google AI Studio](https://aistudio.google.com)
- `FIREBASE_CONFIG` — from your [Firebase project settings](https://console.firebase.google.com)

---

## ☁️ Deploying to Cloud Run

```bash
# One-time auth
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Deploy (builds with Cloud Build, serves via nginx on Cloud Run)
gcloud run deploy pollingpoint \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --project YOUR_PROJECT_ID
```

After deploying, add your Cloud Run URL to **Firebase Console → Authentication → Settings → Authorized domains** so Google Sign-In works on the live URL.

---

## 🔒 Security Highlights

| Concern | Implementation |
|---------|---------------|
| XSS prevention | `sanitize()` runs on every user input and API response before DOM insertion |
| API key isolation | `config.js` with `Object.freeze()` and a security comment block |
| Rate limiting | 18 req/min rolling window — auto-blocks and shows countdown UI |
| Response caching | LRU cache (20 entries) — repeat queries never hit the API |
| Retry on 429 | Regex-parses the retry-after value from the error message + 2s buffer |
| Input length caps | Booth number capped at 10 chars; chat messages capped at 300 chars |
| Firebase rules | Test mode (open read/write) — tighten before real production use |

---

## 🎨 Design Philosophy

- **Government portal aesthetic** — deep navy (`#1a2744`) + Indian tricolour saffron (`#e8611a`) + white. Familiar, trustworthy, serious.
- **Premium feel** — glassmorphism hero section, micro-animations on feature cards, animated vote bars, smooth tab transitions.
- **No Tailwind, no Bootstrap** — every CSS rule is hand-written with custom properties. Judges (and developers) can read and audit every line.
- **Accessible** — ARIA roles/labels throughout, `scope="col"` on table headers, `for` attributes on all form labels, focus rings on interactive elements.

---

## 🧠 Prompt Engineering

All five Gemini prompts are structured the same way:

1. **System context** — who you are, what election, what state
2. **Task instruction** — exactly what to return
3. **Explicit JSON schema** — field names, types, nesting

```
Return JSON with exactly these keys:
  winner: { name, party, votes, percentage }
  candidates: [{ name, party, votes, percentage }]
  totalVotes: number
  turnoutPercentage: number
  margin: number
Ensure all vote percentages roughly sum to 100.
```

Combined with `responseMimeType: 'application/json'` in `generationConfig`, this produces clean, parseable output consistently. The wrapper still strips ` ```json ``` ` fences defensively.

---

## 📊 By The Numbers

| Metric | Value |
|--------|-------|
| JavaScript | ~1,220 lines, 11 sections, JSDoc on every function |
| CSS | ~1,260 lines, zero Tailwind, zero Bootstrap |
| India geographic data | ~800 lines (all states, districts, constituencies) |
| Gemini features | 5 — all sharing 1 robust API wrapper |
| LRU cache size | 20 entries |
| Rate limit | 18 requests/minute with live countdown |
| Firebase services | Auth + Realtime Database + Vertex AI SDK |
| Sign-in methods | Google OAuth + Anonymous guest |
| Cloud Run revisions | 2 (initial deploy + polished code) |

---

## 🏆 Competition Context

Built for **[Google Prompt Wars 2025](https://rsvp.withgoogle.com/events/prompt-wars)** — a competition judging:
- Creative and effective use of Google AI (Gemini / Vertex AI)
- Firebase integration (Auth, Realtime Database)
- Code quality and architecture
- Real-world usefulness

**Mandatory integrations used:**
- ✅ Vertex AI via `firebase/vertexai` SDK (not direct AI Studio API)
- ✅ Firebase Authentication (Google Sign-In + Anonymous)
- ✅ Firebase Realtime Database (live multi-user chat)
- ✅ Google Cloud Run (production hosting)

---

<div align="center">

Made with ☕ and a lot of IAM permission debugging

*PollingPoint — because democracy deserves better UX*

</div>