import { LOGGING_URL } from '../config';

const buildPayload = ({ error, info = {}, level = 'error' } = {}) => {
  return {
    message: error?.message || String(error) || 'Unknown error',
    stack: error?.stack || null,
    info: typeof info === 'string' ? info : JSON.stringify(info || {}),
    url: typeof window !== 'undefined' ? window.location.href : null,
    user: (() => {
      try {
        const raw = localStorage.getItem('user');
        if (raw) {
          const u = JSON.parse(raw);
          return { id: u.id, email: u.email };
        }
      } catch (e) {
        // ignore
      }
      return null;
    })(),
    level,
    timestamp: new Date().toISOString()
  };
};

export async function logError({ error, info, level } = {}) {
  try {
    const payload = buildPayload({ error, info, level });

    // Store a small debug copy locally for immediate troubleshooting (non-sensitive)
    try {
      const debug = { message: payload.message, url: payload.url, timestamp: payload.timestamp };
      localStorage.setItem('last_client_error', JSON.stringify(debug));
    } catch (e) {
      // ignore localStorage errors
    }

    // Temporarily disable remote logging to avoid 404 errors
    console.log('Error logging disabled:', payload.message);
    return;
    
    // Original logging code (commented out)
    /*
    // Use sendBeacon when possible for reliability during unload/fatal errors
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon(LOGGING_URL, blob);
      return;
    }

    await fetch(LOGGING_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    */
  } catch (e) {
    // If logging fails, don't throw further errors
    // eslint-disable-next-line no-console
    console.error('Failed to send error log:', e);
  }
}

export default logError;
