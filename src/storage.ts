import AsyncStorage from '@react-native-async-storage/async-storage';

export type RepeatRule = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type ReminderRule = 'none' | 'at_time' | '10m' | '30m' | '1h' | '1d';
export type MemberRole = 'owner' | 'editor' | 'viewer';

export type CalendarItem = {
  id: string;
  name: string;
  color: string;
  enabled: boolean;
  shared?: boolean;
  inviteCode?: string;
};

export type CalendarMember = {
  id: string;
  calendarId: string;
  name: string;
  role: MemberRole;
  avatarText?: string;
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
  repeat?: RepeatRule;
  reminder?: ReminderRule;
};

const EVENTS_KEY = '@wtdt/events/v2';
const CALENDARS_KEY = '@wtdt/calendars/v2';
const MEMBERS_KEY = '@wtdt/members/v1';

async function loadArray<T>(key: string, fallback: T[]): Promise<T[]> {
  try {
    const value = await AsyncStorage.getItem(key);
    if (!value) return fallback;
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function loadEvents(fallback: EventItem[]) {
  return loadArray(EVENTS_KEY, fallback);
}

export function saveEvents(events: EventItem[]) {
  return AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

export function loadCalendars(fallback: CalendarItem[]) {
  return loadArray(CALENDARS_KEY, fallback);
}

export function saveCalendars(calendars: CalendarItem[]) {
  return AsyncStorage.setItem(CALENDARS_KEY, JSON.stringify(calendars));
}

export function loadMembers(fallback: CalendarMember[]) {
  return loadArray(MEMBERS_KEY, fallback);
}

export function saveMembers(members: CalendarMember[]) {
  return AsyncStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
}
