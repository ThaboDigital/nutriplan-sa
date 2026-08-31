import { NotificationPreferences, AppNotification } from '../types';

export const notificationService = {
  isQuietHours(prefs: NotificationPreferences): boolean {
    if (!prefs.quietHoursEnabled) return false;
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = prefs.quietHoursStart.split(':').map(Number);
    const [endH, endM] = prefs.quietHoursEnd.split(':').map(Number);

    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    if (startTotal > endTotal) {
      // Over midnight (e.g. 22:00 to 06:30)
      return currentMins >= startTotal || currentMins < endTotal;
    }
    return currentMins >= startTotal && currentMins < endTotal;
  },

  async requestBrowserPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  },

  sendNotification(
    title: string,
    message: string,
    category: AppNotification['category'],
    prefs: NotificationPreferences
  ): void {
    if (this.isQuietHours(prefs)) {
      console.log('Suppressed notification due to Quiet Hours:', title);
      return;
    }

    // 1. Web Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: '/favicon.svg',
        });
      } catch (e) {
        console.warn('Browser notification error:', e);
      }
    }
  },
};