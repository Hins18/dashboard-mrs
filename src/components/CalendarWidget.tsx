// src/components/CalendarWidget.tsx
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';

// PERHATIKAN CARA IMPORT YANG BARU DI BAWAH INI
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US'; // Cara import locale juga sedikit berbeda

import 'react-big-calendar/lib/css/react-big-calendar.css';

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

// Data contoh, nanti bisa diisi dengan data tugas dari Supabase
const myEventsList = [
  {
    title: 'Meeting Proyek',
    start: new Date(2025, 3, 15, 10, 0), // Tahun, Bulan (0-11), Tanggal, Jam, Menit
    end: new Date(2025, 3, 15, 12, 0),
  },
  {
    title: 'Deadline Laporan',
    start: new Date(2025, 3, 20),
    end: new Date(2025, 3, 20),
    allDay: true,
  },
];

export default function CalendarWidget() {
  return (
    <div className="mb-8 h-80 text-sm">
      {' '}
      {/* Diberi tinggi & ukuran font agar tidak terlalu besar */}
      <Calendar
        localizer={localizer}
        events={myEventsList}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        views={['month']} // Hanya menampilkan tampilan bulan
      />
    </div>
  );
}
