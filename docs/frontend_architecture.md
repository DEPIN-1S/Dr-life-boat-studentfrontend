# Enterprise Frontend Architecture: Large-Scale Online Examination System

## 1. Advanced Cache Management & Version Control
**Strategy:**
- **Service Worker (Workbox)**: Cache static assets (CSS, JS, Fonts) and API GET requests lazily.
- **Cache Busting**: Use a `useVersionCheck` hook that polls a `version.json` file. If the version changes, prompt the user to reload (after the exam is submitted, to avoid interruption).
- **IndexedDB**: Use for critical exam data (answers, question palette status). Is persistent and holds more data than localStorage.
- **LocalStorage**: ONLY for non-sensitive UI preferences (theme, font size). **NEVER** for exam answers or timer state in plain text.

## 2. Offline-First Architecture
**The "Sync Queue" Pattern:**
1.  **Intercept Submissions**: When a student clicks "Save & Next", the `useOfflineManager` hook intercepts.
2.  **Network Check**:
    -   **Online**: Send to API immediately.
    -   **Offline**: Save payload to IndexedDB `sync_queue` store.
3.  **Background Sync**:
    -   Listen for `online` event.
    -   Periodically poll (every 30s) if queue has items.
    -   Flush queue: Send pending answers one by one.
4.  **Conflict Resolution**: Server timestamp wins. If a later answer arrives before an earlier one, the server ensures the latest logical answer is stored.

## 3. Memory Optimization
**React Best Practices:**
-   **AbortController**: Cancel pending fetch requests in `useEffect` cleanup.
-   **Memoization**: Use `React.memo` for question components to avoid re-rendering the entire exam on every timer tick.
-   **Timer Worker**: Run the countdown timer in a **Web Worker** (already implemented). This prevents the main thread from blocking the timer and ensures accuracy even if the tab is inactive.
-   **Lazy Loading**: Load heavy components (Charts, Analysis) only when needed using `React.lazy`.

## 4. Security Architecture
-   **No Plain Text Storage**: Use `secureStorage` utility to encrypt/obfuscate sensitive data in localStorage/IndexedDB.
-   **Token Storage**: Store JWT in `httpOnly` cookie if possible. If simple `sessionStorage` is used (current implementation), ensure XSS protection headers are active on the server.
-   **Anti-Tamper**:
    -   Calculate a checksum (hash) of the answers on the client side.
    -   Send checksum with submission.
    -   Server validates checksum to ensure data wasn't modified in transit or by a proxy.
-   **Auto-Logout**: `useSafeAutoLogout` tracks user activity (mouse, keyboard). If inactive for X mins, show warning. If exam is active, **DO NOT** logout, but flag the session for proctor review.

## 5. Performance & Scalability (50k+ Users)
-   **Batching**: Instead of sending an API call for *every* option select, batch answers every 30 seconds or on "Next" click.
-   **Optimistic UI**: Update the UI immediately (mark as answered) before the server responds. Rollback if error (and offline queue fails).
-   **Low-Memory Mode**: Detect low-end devices (`navigator.deviceMemory`) and disable animations/heavy logs.

## 6. Production Folder Structure
```
src/
├── components/       # Reusable UI components
│   ├── Exam/         # Exam specific components
│   │   ├── QuestionPalette.jsx
│   │   ├── QuestionView.jsx
│   │   └── Timer.jsx
│   └── common/       # Buttons, Modals, Inputs
├── hooks/            # Custom React Hooks
│   ├── useExamTimer.js
│   ├── useOfflineManager.js
│   ├── useKeyDisable.js
│   └── useSecureStorage.js
├── services/         # API & Logic Layers
│   ├── api.js        # Axios instance with interceptors
│   ├── db.js         # IndexedDB wrapper (Dexie.js or raw IDB)
│   └── syncQueue.js  # Offline sync logic
├── context/          # Global State (AuthProvider, Theme)
├── utils/            # Helper functions
│   ├── crypto.js     # Encryption helpers
│   └── formatting.js
└── types/            # TypeScript interfaces (if using TS)
```

## 7. What NOT To Do (Dangerous Patterns)
1.  ❌ **Never use `setInterval` in the main thread for exam timers.** Browsers throttle it when the tab is inactive, causing the timer to lag. (You are correctly using a Worker ✅).
2.  ❌ **Never store answers *only* in React state.** If the browser crashes, data is lost. Always persist to IndexedDB/LocalStorage immediately.
3.  ❌ **Never trust the client clock.** Always validate submission timestamps on the server.
4.  ❌ **Never force a full page reload** on network failure. Show a "Reconnecting..." toast and retry silently.
5.  ❌ **Never Block the UI** with synchronous operations (e.g., heavy encryption) on the main thread. Use `requestIdleCallback` or Workers.
6.  ❌ **Never logout a student during an exam** due to token expiry. Implement a seamless `refreshToken` flow or allow the exam submission to carry a "finish" flag that the server accepts even if the token is slightly expired (grace period).
