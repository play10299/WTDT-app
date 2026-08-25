import AsyncStorage from '@react-native-async-storage/async-storage';

export type CalendarItem = {
  id: string;
  name: string;
  color: string;
  enabled: boolean;
};

export type EventItem = {
  id: string;
  title: string;
  date: string;
  start: string;
  end: string;
  calendarId: string;
  allDay?: boolean;
  location?: string;
  notes?: string;
};

const EVENTS_KEY = '@wtdt/events/v1';

export async function loadEvents(fallback: EventItem[]): Promise<EventItem[]> {
  try {
    const value = await AsyncStorage.getItem(EVENTS_KEY);
    if (!value) return fallback;
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export async function saveEvents(events: EventItem[]) {
  await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}
