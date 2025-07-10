// src/components/CalendarWidget.tsx

import { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, isWeekend, isSameDay, startOfDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import CustomToolbar from './CustomToolbar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

interface MyEvent {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
}

const locales = {
  'en-US': enUS,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const myEvents: MyEvent[] = [];

export default function CalendarWidget() {
  const [holidays, setHolidays] = useState<Date[]>([]);

  useEffect(() => {
    async function fetchHolidays() {
      try {
        const year = new Date().getFullYear();
        const response = await fetch(`https://api-harilibur.vercel.app/api?year=${year}`);
        const holidayData: { holiday_date: string }[] = await response.json();
        const holidayDates = holidayData.map(h => startOfDay(new Date(h.holiday_date)));
        setHolidays(holidayDates);
      } catch (error) {
        console.error("Gagal mengambil data hari libur:", error);
      }
    }
    fetchHolidays();
  }, []);

  const dayPropGetter = useCallback(
    (date: Date) => {
      const isPublicHoliday = holidays.some(holidayDate => isSameDay(holidayDate, date));
      const isWeekEnd = isWeekend(date);
      if (isPublicHoliday || isWeekEnd) {
        return {
          style: {
            backgroundColor: '#ffebee',
            borderLeft: '3px solid #f44336',
          },
        };
      }
      return {};
    },
    [holidays]
  );

  return (
    <div className="mb-8 h-96 text-sm p-4 bg-white rounded-lg shadow-sm border">
      <h2 className="text-xl font-bold text-gray-800 mb-0">Kalender</h2>
      {/* PERUBAHAN DI SINI: Tambahkan <MyEvent> untuk menentukan tipe generik 
      */}
      <Calendar<MyEvent>
        localizer={localizer}
        events={myEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 'calc(100% - 20px)' }}
        views={[Views.MONTH]}
        dayPropGetter={dayPropGetter}
        components={{
          toolbar: CustomToolbar,
        }}
      />
    </div>
  );
}