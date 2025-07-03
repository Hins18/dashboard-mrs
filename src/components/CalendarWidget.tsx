// src/components/CalendarWidget.tsx

// --- IMPORTS ---
// Hanya mengimpor hooks dan fungsi date-fns yang diperlukan
import { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, isWeekend, isSameDay, startOfDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';

// Impor CSS untuk kalender
import 'react-big-calendar/lib/css/react-big-calendar.css';


// --- KONFIGURASI LOCALIZER (tidak berubah) ---
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


// --- KOMPONEN UTAMA ---
export default function CalendarWidget() {
  // State hanya untuk menyimpan daftar hari libur
  const [holidays, setHolidays] = useState<Date[]>([]);

  // useEffect untuk mengambil data hari libur saat komponen dimuat
  useEffect(() => {
    async function fetchHolidays() {
      try {
        const year = new Date().getFullYear();
        // Mengambil data hari libur dari API publik
        const response = await fetch(`https://api-harilibur.vercel.app/api?year=${year}`);
        const holidayData: { holiday_date: string }[] = await response.json();
        
        // Mengonversi string tanggal menjadi objek Date
        const holidayDates = holidayData.map(h => startOfDay(new Date(h.holiday_date)));
        setHolidays(holidayDates); // Simpan tanggal libur di state
      } catch (error) {
        console.error("Gagal mengambil data hari libur:", error);
      }
    }

    fetchHolidays();
  }, []); // Dependensi kosong '[]' berarti efek ini hanya berjalan sekali saat komponen pertama kali dirender

  // Fungsi 'dayPropGetter' untuk memberikan style pada tanggal tertentu
  const dayPropGetter = useCallback(
    (date: Date) => {
      // Cek apakah tanggal ini ada di dalam daftar hari libur
      const isPublicHoliday = holidays.some(holidayDate => isSameDay(holidayDate, date));
      
      // Cek apakah tanggal ini adalah Sabtu atau Minggu
      const isWeekEnd = isWeekend(date);

      // Jika tanggal adalah akhir pekan atau hari libur nasional, berikan style khusus
      if (isPublicHoliday || isWeekEnd) {
        return {
          style: {
            backgroundColor: '#ffebee', // Warna latar merah muda
            borderLeft: '3px solid #f44336', // Garis merah di sisi kiri sebagai indikator
          },
        };
      }
      
      // Jika bukan, kembalikan objek kosong (tanpa style tambahan)
      return {};
    },
    [holidays] // Fungsi ini akan dibuat ulang hanya jika state 'holidays' berubah
  );

  return (
    // Wrapper untuk memberikan tampilan yang rapi
    <div className="mb-8 h-96 text-sm p-4 bg-white rounded-lg shadow-sm border">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Kalender</h2>
      <Calendar
        localizer={localizer}
        events={[]} // Tidak ada event (tugas) yang ditampilkan
        startAccessor="start"
        endAccessor="end"
        style={{ height: 'calc(100% - 40px)' }} // Sesuaikan tinggi agar pas dengan container
        views={[Views.MONTH]} // Hanya menampilkan tampilan bulan
        dayPropGetter={dayPropGetter} // Terapkan style kustom untuk tanggal di sini
      />
    </div>
  );
}
