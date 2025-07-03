// src/components/TaskListModal.tsx
import { useNavigate } from 'react-router-dom'; // <-- 1. Import useNavigate
import type { Database } from '../database.types';

type Task = Database['public']['Tables']['tasks_master']['Row'];

interface TaskListModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  title: string;
  getCountdown: (task: Task) => { text: string; colorClass: string };
}

export default function TaskListModal({ isOpen, onClose, tasks, title, getCountdown }: TaskListModalProps) {
  const navigate = useNavigate(); // <-- 2. Inisialisasi hook navigasi

  if (!isOpen) return null;

  // 3. Buat fungsi untuk menangani klik pada baris
  const handleRowClick = (taskId: number) => {
    onClose(); // Tutup modal terlebih dahulu
    // Arahkan ke halaman ongoing dengan membawa ID tugas di dalam state
    navigate('/ongoing', { state: { highlightedTaskId: taskId } });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 relative" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl leading-none">&times;</button>
        </div>
        
        <div className="max-h-[70vh] overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
              <tr>
                <th className="px-4 py-2">No</th>
                <th className="px-6 py-3">Judul Tugas</th>
                <th className="px-6 py-3">PIC</th>
                <th className="px-6 py-3">Inisiator</th>
                <th className="px-6 py-3 text-center">Sisa Waktu</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length > 0 ? (
                tasks.map((task, index) => {
                  const countdown = getCountdown(task);
                  return (
                    // 4. Tambahkan onClick pada setiap baris tabel
                    <tr 
                      key={task.id} 
                      className="bg-white border-b hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleRowClick(task.id)}
                    >
                      <td className="px-4 py-3">{index + 1}</td>
                      <td className="px-6 py-4 font-semibold">{task.judul}</td>
                      <td className="px-6 py-4">{task.pic}</td>
                      <td className="px-6 py-4">{task.inisiator}</td>
                      <td className={`px-6 py-4 text-center font-semibold ${countdown.colorClass}`}>
                        {countdown.text}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr><td colSpan={5} className="text-center p-4 text-gray-500">Tidak ada data untuk kategori ini.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}