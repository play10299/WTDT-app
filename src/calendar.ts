export const pad = (n: number) => String(n).padStart(2, '0');

export const dateKey = (year: number, month: number, day: number) =>
  `${year}-${pad(month + 1)}-${pad(day)}`;

export const parseDateKey = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const monthTitle = (date: Date) => `${date.getFullYear()}年${date.getMonth() + 1}月`;

export const addMonths = (date: Date, amount: number) =>
  new Date(date.getFullYear(), date.getMonth() + amount, 1);

export type CalendarCell = {
  date: string;
  day: number;
  current: boolean;
};

export const buildMonthCells = (anchor: Date): CalendarCell[] => {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const previousDays = new Date(year, month, 0).getDate();

  return Array.from({ length: 42 }, (_, index) => {
    const raw = index - firstWeekday + 1;
    if (raw < 1) {
      const day = previousDays + raw;
      const previous = new Date(year, month - 1, day);
      return { day, current: false, date: dateKey(previous.getFullYear(), previous.getMonth(), day) };
    }
    if (raw > days) {
      const day = raw - days;
      const next = new Date(year, month + 1, day);
      return { day, current: false, date: dateKey(next.getFullYear(), next.getMonth(), day) };
    }
    return { day: raw, current: true, date: dateKey(year, month, raw) };
  });
};

export const todayKey = () => {
  const now = new Date();
  return dateKey(now.getFullYear(), now.getMonth(), now.getDate());
};
