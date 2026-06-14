// Streak PWA — Service Worker
// Handles background push-style notifications via periodic sync fallback
// and scheduled alarms stored in IndexedDB

const CACHE = 'streak-v1';
const ASSETS = ['./', './index.html'];

// ── Install & cache ──────────────────────────────────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

// ── Notification display ─────────────────────────────────────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window' }).then(list => {
    if (list.length) return list[0].focus();
    return clients.openWindow('./');
  }));
});

// ── Message from page: schedule alarms ──────────────────────────────────────
self.addEventListener('message', e => {
  if (e.data?.type === 'SCHEDULE') {
    scheduleAll(e.data.reminders);
  }
  if (e.data?.type === 'FIRE_TEST') {
    self.registration.showNotification('🔔 Test notification', {
      body: 'Notifications are working!',
      icon: './icon.png',
      badge: './icon.png',
      tag: 'test'
    });
  }
});

// ── Alarm scheduling via setTimeout inside SW ────────────────────────────────
// SW may be killed & restarted by the OS — we use a heartbeat from the page
// when the app is open, and rely on the SW waking up for push events otherwise.
// For true background delivery without a push server we use the best available:
// 1. If periodicSync is available, register it
// 2. Otherwise fall back to SW-side setTimeout (works while SW is alive)

const timers = {};

function scheduleAll(reminders) {
  // Clear old timers
  Object.values(timers).forEach(t => clearTimeout(t));
  Object.keys(timers).forEach(k => delete timers[k]);

  (reminders || []).filter(r => r.on).forEach(r => armTimer(r));
}

function armTimer(r) {
  const now = Date.now();
  const next = nextFire(r);
  if (!next) return;
  const ms = next - now;
  if (ms <= 0 || ms > 25 * 60 * 60 * 1000) return; // only arm within 25h
  timers[r.id] = setTimeout(() => {
    fire(r);
    // rearm for next day
    setTimeout(() => armTimer(r), 5000);
  }, ms);
}

function nextFire(r) {
  const [hh, mm] = r.time.split(':').map(Number);
  const now = new Date();
  const candidate = new Date(now);
  candidate.setHours(hh, mm, 0, 0);
  if (candidate <= now) candidate.setDate(candidate.getDate() + 1);

  // Advance to a valid day
  for (let i = 0; i < 8; i++) {
    const day = candidate.getDay();
    const ok = r.days === 'weekdays' ? (day >= 1 && day <= 5)
             : r.days === 'weekends' ? (day === 0 || day === 6)
             : true;
    if (ok) return candidate.getTime();
    candidate.setDate(candidate.getDate() + 1);
  }
  return null;
}

function fire(r) {
  self.registration.showNotification(`⏰ ${r.label}`, {
    body: 'Time to check your habits and keep your streak alive! 🔥',
    icon: './icon.png',
    badge: './icon.png',
    tag: r.id,
    renotify: true,
    requireInteraction: false
  });
}

// ── Periodic sync (fires SW periodically on Android Chrome) ─────────────────
self.addEventListener('periodicsync', e => {
  if (e.tag === 'habit-check') {
    e.waitUntil(checkAndNotify());
  }
});

async function checkAndNotify() {
  // Read reminders from all clients
  const clientList = await clients.matchAll();
  clientList.forEach(c => c.postMessage({ type: 'GET_REMINDERS' }));
}
