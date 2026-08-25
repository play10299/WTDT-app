import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { EventItem, ReminderRule } from './storage';

const CHANNEL_ID = 'calendar-reminders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const offsets: Record<ReminderRule, number | null> = {
  none: null,
  at_time: 0,
  '10m': 10 * 60 * 1000,
  '30m': 30 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
};

export async function configureNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: '行程提醒',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 150, 250],
      sound: 'default',
    });
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === 'granted';
}

function eventStart(event: EventItem) {
  const time = event.allDay ? '09:00' : event.start;
  const [year, month, day] = event.date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

export async function cancelEventReminder(eventId: string) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const matches = scheduled.filter(item => item.content.data?.eventId === eventId);
  await Promise.all(matches.map(item => Notifications.cancelScheduledNotificationAsync(item.identifier)));
}

export async function scheduleEventReminder(event: EventItem) {
  await cancelEventReminder(event.id);
  const reminder = event.reminder || 'none';
  const offset = offsets[reminder];
  if (offset === null) return null;

  const granted = await configureNotifications();
  if (!granted) return null;

  const triggerDate = new Date(eventStart(event).getTime() - offset);
  if (triggerDate.getTime() <= Date.now()) return null;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: event.title,
      body: event.allDay ? `今天的行程 · ${event.calendarId}` : `${event.start} · ${event.location || '星火日曆'}`,
      sound: 'default',
      data: { eventId: event.id, date: event.date, calendarId: event.calendarId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
      channelId: Platform.OS === 'android' ? CHANNEL_ID : undefined,
    },
  });
}

export async function syncEventReminders(events: EventItem[]) {
  const validIds = new Set(events.map(event => event.id));
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter(item => item.content.data?.eventId && !validIds.has(String(item.content.data.eventId)))
      .map(item => Notifications.cancelScheduledNotificationAsync(item.identifier)),
  );
  for (const event of events) {
    if (event.reminder && event.reminder !== 'none') await scheduleEventReminder(event);
  }
}
