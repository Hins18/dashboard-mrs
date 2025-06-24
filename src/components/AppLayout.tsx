// src/components/AppLayout.tsx
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AppLayout() {
  // Kita asumsikan sidebar kanan juga akan menjadi bagian dari layout ini
  // Untuk saat ini, kita fokus pada Sidebar kiri dan konten utama
  return (
    <div className="flex min-h-screen bg-white font-sans">
      <Sidebar />
      {/* <Outlet /> ini adalah sebuah "placeholder" di mana React Router 
          akan secara dinamis merender halaman yang aktif (Dashboard atau Ongoing) */}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}