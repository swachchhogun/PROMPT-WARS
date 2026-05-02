/**
 * @fileoverview PollingPoint — API & App Configuration
 * 
 * SECURITY NOTE: Do NOT commit your real config.js. 
 * Rename this file to `config.js` and fill in your keys to run locally.
 */
'use strict';

/**
 * Direct Gemini API config — used as fallback if Vertex AI is unavailable.
 */
const CONFIG = Object.freeze({
  GEMINI_API_KEY:       'YOUR_GEMINI_API_KEY_HERE',
  GEMINI_URL:           'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
  CACHE_MAX_SIZE:       20,
  RATE_LIMIT_MAX:       18,
  RATE_LIMIT_WINDOW_MS: 60_000,
  MAX_RETRIES:          3,
});

/**
 * Firebase project configuration.
 */
const FIREBASE_CONFIG = Object.freeze({
  apiKey:            'YOUR_FIREBASE_API_KEY_HERE',
  authDomain:        'YOUR_PROJECT.firebaseapp.com',
  databaseURL:       'https://YOUR_PROJECT.firebaseio.com',
  projectId:         'YOUR_PROJECT_ID',
  storageBucket:     'YOUR_PROJECT.firebasestorage.app',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId:             'YOUR_APP_ID',
  measurementId:     'YOUR_MEASUREMENT_ID',
});
