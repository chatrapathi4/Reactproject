export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000'
    : window.location.origin);

// Allow REACT_APP_WS_URL to override in development (e.g. ws://localhost:8000)
// --- CHANGED: default to backend on localhost so React dev server doesn't get WS traffic
export const WS_BASE_URL = process.env.REACT_APP_WS_URL ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? (window.location.protocol === 'https:' ? 'wss://localhost:8000' : 'ws://localhost:8000')
    : (window.location.protocol === 'https:' 
        ? `wss://${window.location.host}` 
        : `ws://${window.location.host}`));