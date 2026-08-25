import { EventItem, ReminderRule, RepeatRule } from './storage';

export const repeatOptions: { value: RepeatRule; label: string }[] = [
  { value: 'none', label: '不重複' },
  { value: 'daily', label: '每天' },
  { value: 'weekly', label: '每週' },
  { value: 'monthly', label: '每月' },
  { value: 'yearly', label: '每年' },
];

export const reminderOptions: { value: ReminderRule; label: string }[] = [
  { value: 'none', label: '不提醒' },
  { value: 'at_time', label: '行程開始時' },
  { value: '10m', label: '10 分鐘前' },
  { value: '30m', label: '30 分鐘前' },
  { value: '1h', label: '1 小時前' },
  { value: '1d', label: '1 天前' },
];

export function ruleLabel<T extends string>(options: { value: T; label: string }[], value?: T) {
  return options.find(option => option.value === value)?.label ?? options[0].label;
}

export function eventOccursOn(event: EventItem, dateKey: string): boolean {
  if (event.date === dateKey) return true;
  const repeat = event.repeat ?? 'none';
  if (repeat === 'none' || dateKey < event.date) return false;

  const start = new Date(`${event.date}T12:00:00`);
  const target = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(target.getTime())) return false;

  if (repeat === 'daily') return true;
  if (repeat === 'weekly') return start.getDay() === target.getDay();
  if (repeat === 'monthly') return start.getDate() === target.getDate();
  return start.getMonth() === target.getMonth() && start.getDate() === target.getDate();
}
