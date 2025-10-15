export const API_BASE_URL = window.location.origin;

// Allow REACT_APP_WS_URL to override in development (e.g. ws://localhost:8000)
export const WS_BASE_URL = process.env.REACT_APP_WS_URL ||
  (window.location.protocol === 'https:' 
    ? `wss://${window.location.host}` 
    : `ws://${window.location.host}`);