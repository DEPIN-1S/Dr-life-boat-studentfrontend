# What NOT To Do: Enterprise Exam System Anti-Patterns

## 🚫 1. Do NOT Trust Client-Side Clocks
-   **Bad:** `const timeLeft = endTime - Date.now()` (if user changes system time, exam ends early/late).
-   **Good:** Use a Web Worker that counts *ticks* independent of system time, or validate `serverTime` on every heartbeat.

## 🚫 2. Do NOT Store Answers Only in React State
-   **Bad:** `const [answers, setAnswers] = useState({})`. If the browser crashes or user hits Refresh, all data is lost.
-   **Good:** `useEffect` should write every change to `IndexedDB` or `localStorage` immediately.

## 🚫 3. Do NOT Block the UI for Encryption
-   **Bad:** Running heavy encryption on every keystroke/click.
-   **Good:** Use `debounce` or `requestIdleCallback` to save/encrypt data when the user pauses typing.

## 🚫 4. Do NOT Force Logout During an Exam
-   **Bad:** "Token Expired. Logging out..." (User loses exam progress).
-   **Good:** Implement `silentRefresh`. If that fails, allow the exam to continue and submit with a flag. The server should decide whether to accept it (grace period).

## 🚫 5. Do NOT Show "Network Error" Alerts
-   **Bad:** `alert('No Internet')` every time a request fails.
-   **Good:** Show a non-intrusive "Offline: Saving locally..." toast. Queue the request and retry silently.

## 🚫 6. Do NOT Use `JSON.stringify` on Large Datasets in Main Thread
-   **Bad:** Serializing a 5MB exam object on every render.
-   **Good:** Keep the exam object structure flat. Use `Immer` or mutation-safe patterns.

## 🚫 7. Do NOT Allow "Back" Button to Exit Exam
-   **Bad:** User accidentally clicks Back and leaves the exam.
-   **Good:** Use `history.pushState(null, null, location.href)` to trap the back button and show a "Are you sure?" modal.
