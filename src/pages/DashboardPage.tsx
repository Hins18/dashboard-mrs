// src/pages/TaskPage.tsx
import { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import ReminderList from '../components/ReminderList';
import CalendarWidget from '../components/CalendarWidget';
import UrgentTaskCard from '../components/UrgentTaskCard';
import NotificationButton from '../components/NotificationButton';

// ... (setelah baris import)
export type Notification = {
  id: number;
  title: string;
  pic: string;
  remaining: string;
  time: string;
  read: boolean;
  urgency: 'high' | 'medium'; // Untuk menentukan warna
};
export default function TaskPage() {
  // Data statis sebagai contoh, nanti kita ganti dengan data dari Supabase
  const stats = [
    { title: 'KR TERBIT', value: 65 },
    { title: 'TOTAL MITIGASI', value: 65 },
    { title: 'MITIGASI SELESAI DITINDAKLANJUTI', value: 65 },
    { title: 'MITIGASI IN PROGRESS', value: 65 },
    { title: 'MITIGASI BELUM DITINDAKLANJUTI', value: 65 },
  ];

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: 'Monitoring of LMR Corporate Risk Profile',
      pic: 'Fernando',
      remaining: '9 Periode Remaining',
      time: '10 min ago',
      read: false,
      urgency: 'medium',
    },
    {
      id: 2,
      title: 'Monitoring of LMR Corporate Risk Profile',
      pic: 'Fernando',
      remaining: '3 Periode Remaining',
      time: '10 hours ago',
      read: false,
      urgency: 'high',
    },

  ]);

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">

      {/* KOLOM TENGAH: Konten Utama */}
      <main className="flex-1 p-8">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Reports</h1>
          <div className="w-40">
            {/* Dropdown Tahun (bisa dibuat komponen sendiri nanti) */}
            <select className="w-full rounded-md border p-2">
              <option>2025</option>
              <option>2024</option>
              <option>2023</option>
            </select>
          </div>
          {/* TAMBAHKAN TOMBOL NOTIFIKASI DI SINI */}
          <NotificationButton
            notifications={notifications}
            setNotifications={setNotifications}
          />
        </header>

        {/* Grid untuk Kartu Statistik */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, index) => (
            <StatCard key={index} title={stat.title} value={stat.value} />
          ))}
        </div>
      </main>

      {/* KOLOM KANAN: Reminder & Urgent Task */}
      <aside className="w-80 border-l bg-white p-6">
        <ReminderList />
        <CalendarWidget />
        <UrgentTaskCard />
      </aside>
    </div>
  );
}
