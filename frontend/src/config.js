// Ultra-fast configuration
export const API_BASE_URL = window.location.origin;

export const WS_BASE_URL = window.location.protocol === 'https:' 
  ? `wss://${window.location.host}` 
  : `ws://${window.location.host}`;

// Performance settings
export const PERFORMANCE_CONFIG = {
  // Drawing settings
  DRAW_THROTTLE: 16,        // ~60fps
  BATCH_SIZE: 10,           // Points per batch
  MAX_POINTS_PER_STROKE: 1000,
  
  // WebSocket settings
  RECONNECT_DELAY: 1000,    // 1 second
  MAX_RECONNECT_ATTEMPTS: 5,
  HEARTBEAT_INTERVAL: 30000, // 30 seconds
  
  // Canvas settings
  CANVAS_BUFFER_SIZE: 2,    // 2x pixel ratio for crisp lines
  SMOOTH_RENDERING: true,
  
  // Cache settings
  LOCAL_STORAGE_KEY: 'collabboard_cache',
  MAX_CACHE_SIZE: 1000,     // Max cached objects
};