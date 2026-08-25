import { CalendarItem, CalendarMember, MemberRole } from './storage';

const INVITE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function createInviteCode(length = 8): string {
  let value = '';
  for (let i = 0; i < length; i += 1) {
    value += INVITE_ALPHABET[Math.floor(Math.random() * INVITE_ALPHABET.length)];
  }
  return value;
}

export function ensureInviteCode(calendar: CalendarItem): CalendarItem {
  if (!calendar.shared || calendar.inviteCode) return calendar;
  return { ...calendar, inviteCode: createInviteCode() };
}

export function roleLabel(role: MemberRole): string {
  if (role === 'owner') return '擁有者';
  if (role === 'editor') return '可編輯';
  return '僅查看';
}

export function canEditCalendar(members: CalendarMember[], calendarId: string, memberId: string): boolean {
  const member = members.find(item => item.calendarId === calendarId && item.id === memberId);
  return member?.role === 'owner' || member?.role === 'editor';
}

export function canManageMembers(members: CalendarMember[], calendarId: string, memberId: string): boolean {
  return members.some(item => item.calendarId === calendarId && item.id === memberId && item.role === 'owner');
}

export function membersForCalendar(members: CalendarMember[], calendarId: string): CalendarMember[] {
  return members.filter(item => item.calendarId === calendarId);
}
