import { useEffect, useRef } from 'react';
import { useNotificationContext } from '@/context/NotificationContext';
import { notificationsApi } from '@/api/notifications.api';

const todayStr    = () => new Date().toISOString().slice(0, 10);
const tomorrowStr = () => new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);

function fmtTime(time) {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return ` at ${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
}

/**
 * Build a notification payload for a reminder if it is due today, overdue,
 * or due tomorrow. Returns null if no notification should fire.
 */
function buildPayload(reminder) {
  if (!reminder || reminder.done || !reminder.due) return null;

  const today    = todayStr();
  const tomorrow = tomorrowStr();
  const timeStr  = fmtTime(reminder.time);

  if (reminder.due < today) {
    return {
      type:    'REMINDER_OVERDUE',
      message: `⚠ Overdue: "${reminder.title}" was due on ${new Date(reminder.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}${timeStr}`,
    };
  }
  if (reminder.due === today) {
    return {
      type:    'REMINDER_DUE',
      message: `🔔 Due today${timeStr}: "${reminder.title}"`,
    };
  }
  if (reminder.due === tomorrow) {
    return {
      type:    'REMINDER_UPCOMING',
      message: `📅 Due tomorrow${timeStr}: "${reminder.title}"`,
    };
  }
  return null;
}

/**
 * Fire a notification for a single reminder immediately.
 * Exported so RemindersPage can call it on create / edit.
 */
export function fireReminderNotification(reminder, push) {
  const payload = buildPayload(reminder);
  if (!payload) return;

  const today = todayStr();
  push({
    id:        `rem-${reminder.id}-${today}`,
    type:      payload.type,
    message:   payload.message,
    isRead:    false,
    createdAt: new Date().toISOString(),
  });

  notificationsApi.createSelf(payload.message, payload.type).catch(() => {});
}

/**
 * On mount, scan localStorage reminders and fire notifications for any that
 * are due today, overdue, or due tomorrow. Uses an in-memory Set (not
 * localStorage) so it fires once per page load — not once per calendar day.
 */
export function useReminderNotifications(storageKey) {
  const { push } = useNotificationContext();
  const firedRef = useRef(new Set());

  useEffect(() => {
    let reminders;
    try { reminders = JSON.parse(localStorage.getItem(storageKey) ?? '[]'); } catch { reminders = []; }

    reminders.forEach((r) => {
      if (firedRef.current.has(r.id)) return;
      const payload = buildPayload(r);
      if (!payload) return;

      firedRef.current.add(r.id);
      push({
        id:        `rem-${r.id}-${todayStr()}`,
        type:      payload.type,
        message:   payload.message,
        isRead:    false,
        createdAt: new Date().toISOString(),
      });

      notificationsApi.createSelf(payload.message, payload.type).catch(() => {});
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
