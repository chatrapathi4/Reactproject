export const API_BASE_URL = window.location.origin;

export const WS_BASE_URL = window.location.protocol === 'https:' 
  ? `wss://${window.location.host}` 
  : `ws://${window.location.host}`;