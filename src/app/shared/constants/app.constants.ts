export const MAP_CONSTANTS = {
  DEFAULT_CENTER: { lat: 33.8869, lng: 9.5375 },
  DEFAULT_ZOOM: 6,
  DETAIL_ZOOM: 15,
  TILE_LAYER_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  ATTRIBUTION: '© OpenStreetMap contributors',
  PADDING: [50, 50] as [number, number],
  ICON_SIZE: [32, 32] as [number, number],
  ICON_ANCHOR: [16, 16] as [number, number],
  POPUP_ANCHOR: [0, -16] as [number, number]
} as const;

export const CHART_CONSTANTS = {
  COLORS: {
    VALID: '#05cd99',
    ISSUE: '#ee5d50',
    NON_VALID: '#ffb800',
    PRIMARY: '#4318ff',
    ORANGE_TUNISIE: '#ff7900',
    TUNISIE_TELECOM: '#0075c2',
    OOREDOO: '#ed1c24',
    UNKNOWN: '#a3aed0',
    SPARK_TOTAL: '#4f46e5',
    SPARK_VALID: '#10b981',
    SPARK_ISSUE: '#f43f5e',
    SPARK_MOVING: '#f59e0b'
  },
  SPARKLINE_STEPS: 6,
  BORDER_RADIUS: 8
} as const;

export const SIM_CARD_PREFIXES = {
  ORANGE_TUNISIE: '8921601',
  TUNISIE_TELECOM: '8921602',
  OOREDOO_TUNISIE: '8921603'
} as const;

export const SPEED_BANDS = {
  STOPPED: '0 km/h',
  SLOW: '1-30 km/h',
  MEDIUM: '31-60 km/h',
  FAST: '61+ km/h'
} as const;

export const CAR_STYLES = ['c1', 'c2', 'c3', 'c4'] as const;

export const VALID_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315, 360] as const;

export const TIMEOUTS = {
  MAP_INITIALIZE: 300,
  MAP_FIT_BOUNDS: 1000
} as const;

export const REALTIME_CONSTANTS = {
  UPDATE_DEBOUNCE_MS: 300,
  ANIMATION_DURATION_MS: 500,
  WEBSOCKET_RECONNECT_DELAY: 5000
} as const;

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'currentUser',
  AUTH_STATUS: 'isAuthenticate',
  IS_RELOADING: 'isReloading'
} as const;

export const STATUS_TYPES = {
  VALID: 'VALID',
  TECHNICAL_ISSUE: 'TECHNICAL_ISSUE',
  NON_VALID: 'NON_VALID'
} as const;

export const NOTIFICATION_SUBQUERIES = [
  'date_sub(NOW(), INTERVAL 6 hour)',
  'date_sub(NOW(), INTERVAL 1 DAY)',
  'date_sub(NOW(), INTERVAL 2 DAY)'
] as const;
