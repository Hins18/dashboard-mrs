// src/lib/dateUtils.ts
import { eachDayOfInterval, isSameDay, isWeekend, addDays, startOfDay } from 'date-fns';

// Fungsi ini membutuhkan daftar hari libur sebagai argumen
export function calculateWorkingDaysBetween(start: Date, end: Date, holidays: Date[]): number {
  if (start > end) return 0;
  let count = 0;
  eachDayOfInterval({ start, end }).forEach(day => {
      const isPublicHoliday = holidays.some(h => isSameDay(h, day));
      if (!isWeekend(day) && !isPublicHoliday) count++;
  });
  return count;
};

// Fungsi ini juga membutuhkan hari libur
export function addWorkingDays(startDate: Date, workdays: number, holidays: Date[]): Date {
  let deadline = startOfDay(new Date(startDate));
  if (workdays <= 0) return deadline;
  let daysCounted = 0;
  while (daysCounted < workdays) {
    const isPublicHoliday = holidays.some(h => isSameDay(h, deadline));
    if (!isWeekend(deadline) && !isPublicHoliday) {
      daysCounted++;
    }
    if (daysCounted < workdays) {
      deadline = addDays(deadline, 1);
    }
  }
  return deadline;
}