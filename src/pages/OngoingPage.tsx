// src/pages/OngoingPage.tsx
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Plus, FilePenLine, Trash2, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Database } from '../database.types';
import { eachDayOfInterval, isSameDay, isWeekend, addDays, startOfDay } from 'date-fns';
import Notification from '@/components/ui/Notification';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import DoneConfirmationModal from '@/components/ui/DoneConfirmationModal';

type Task = Database['public']['Tables']['tasks_master']['Row'];

export default function OngoingPage() {
  const [rawTasks, setRawTasks] = useState<Task[]>([]);
  const [holidays, setHolidays] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState({ column: 'created_at' as keyof Task | 'durasi', ascending: false });
  const [highlightedRow, setHighlightedRow] = useState<number | null>(null);
  
  // State untuk notifikasi
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false); // <-- TAMBAHKAN INI
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null); // <-- TAMBAHKAN INI

  const [isDoneModalOpen, setIsDoneModalOpen] = useState(false); // <-- TAMBAHKAN INI
  const [taskToComplete, setTaskToComplete] = useState<number | null>(null); // <-- TAMBAHKAN INI

  const itemsPerPage = 5;
  const navigate = useNavigate();
  const location = useLocation();
  const rowRefs = useRef<Map<number, HTMLTableRowElement>>(new Map());

  useEffect(() => {
    // Cek state dari navigasi untuk menampilkan notifikasi
    if (location.state?.message && location.state?.type) {
      setNotification({ message: location.state.message, type: location.state.type });
      // Bersihkan state lokasi agar notifikasi tidak muncul lagi saat refresh
      // tapi tetap pertahankan highlightedTaskId jika ada
      const { message, type, ...restState } = location.state;
      navigate(location.pathname, { replace: true, state: restState });
    }
  }, [location, navigate]);

  const calculateDeadline = useCallback((startDate: Date, workdays: number): Date => {
    let deadline = new Date(startDate);
    deadline.setHours(0, 0, 0, 0);
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
  }, [holidays]);

  const calculateWorkingDaysBetween = useCallback((start: Date, end: Date): number => {
    if (start > end) return 0;
    let count = 0;
    eachDayOfInterval({ start, end }).forEach(day => {
        const isPublicHoliday = holidays.some(h => isSameDay(h, day));
        if (!isWeekend(day) && !isPublicHoliday) count++;
    });
    return count;
  }, [holidays]);

  const getCountdownValue = useCallback((task: Task): number => {
    if (!task.tanggal_terbit || !task.durasi) return Infinity;
    const today = startOfDay(new Date());

    if (task.is_data_complete && task.tanggal_resume && task.sisa_durasi_saat_pause != null) {
        const resumeDate = startOfDay(new Date(task.tanggal_resume));
        const workdaysLeftWhenPaused = task.sisa_durasi_saat_pause;
        const workdaysPassedSinceResume = calculateWorkingDaysBetween(resumeDate, today);
        const newCountdown = workdaysLeftWhenPaused - (workdaysPassedSinceResume - 1);
        return Math.max(0, newCountdown);
    } else {
        const startDate = startOfDay(new Date(task.tanggal_terbit));
        const deadline = calculateDeadline(startDate, task.durasi);
        return calculateWorkingDaysBetween(addDays(today, 1), deadline);
    }
  }, [calculateDeadline, calculateWorkingDaysBetween]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const year = new Date().getFullYear();
      const response = await fetch(`https://api-harilibur.vercel.app/api?year=${year}`);
      const holidayData: { holiday_date: string }[] = await response.json();
      setHolidays(holidayData.map(h => startOfDay(new Date(h.holiday_date))));
    } catch (error) {
      console.error("Gagal mengambil hari libur:", error);
    }
    const { data, error } = await supabase.from('tasks_master').select('*').eq('is_completed', false);
    if (error) {
      console.error('Error fetching ongoing tasks:', error);
    } else {
      setRawTasks(data || []);
    }
    setLoading(false);
  }, []);

  

  const getCountdown = useCallback((task: Task): { text: string; colorClass: string } => {
    if (task.is_data_complete === false) {
      if (task.sisa_durasi_saat_pause != null) {
          const text = task.sisa_durasi_saat_pause >= 0
            ? `Pause (${task.sisa_durasi_saat_pause} hari)`
            : `Pause (Lewat SLA)`;
          return { text, colorClass: 'text-blue-500' };
      }
      return { text: 'Pause', colorClass: 'text-blue-500' };
    }

    const daysDiff = getCountdownValue(task);
    if (daysDiff === Infinity) return { text: "-", colorClass: 'text-gray-700' };

    let colorClass = 'text-gray-700';
    if (daysDiff < 0) {
      colorClass = 'text-red-800';
      return { text: 'Lewat SLA', colorClass };
    }
    if (daysDiff === 0) {
      colorClass = 'text-red-600';
      return { text: 'Hari Ini', colorClass };
    }
    if (daysDiff <= 3) colorClass = 'text-red-600';
    else if (daysDiff <= 6) colorClass = 'text-orange-500';
    else if (daysDiff <= 9) colorClass = 'text-yellow-500';

    return { text: `${daysDiff} hari lagi`, colorClass };
  }, [getCountdownValue]);

  // useEffect sekarang hanya memanggil fetchData saat komponen pertama kali dimuat
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openDeleteModal = (taskId: number) => {
    setTaskToDelete(taskId);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (taskToDelete === null) return;

    const { error } = await supabase.from('tasks_master').delete().eq('id', taskToDelete);

    setIsModalOpen(false);

    if (error) {
      alert('Gagal menghapus data.');
    } else {
      setNotification({
        message: 'Data berhasil dihapus!',
        type: 'success',
      });
      // Hapus item dari state untuk memperbarui UI tanpa fetch ulang
      setRawTasks(prev => prev.filter(task => task.id !== taskToDelete));
      setTaskToDelete(null);
    }
  };

  const openDoneModal = (taskId: number) => {
    setTaskToComplete(taskId);
    setIsDoneModalOpen(true);
  };

  const handleConfirmDone = async () => {
    if (taskToComplete === null) return;

    const { error } = await supabase
      .from('tasks_master')
      .update({ is_completed: true, progress_percentage: 100 })
      .eq('id', taskToComplete);

    setIsDoneModalOpen(false);

    if (error) {
      alert('Gagal menyelesaikan tugas.');
    } else {
      setNotification({
        message: 'Tugas berhasil diselesaikan!',
        type: 'success',
      });
      setRawTasks(prev => prev.filter(task => task.id !== taskToComplete));
      setTaskToComplete(null);
    }
  };


  const handleSort = (columnName: keyof Task | 'durasi') => {
    setSort(prevSort => ({
      column: columnName,
      ascending: prevSort.column === columnName ? !prevSort.ascending : true,
    }));
    setCurrentPage(1);
  };

  const sortedTasks = useMemo(() => {
    if (!rawTasks) return [];
    const tasksWithCountdown = rawTasks.map(task => ({
        ...task,
        countdownValue: getCountdownValue(task)
    }));
    
    tasksWithCountdown.sort((a, b) => {
        if (sort.column === 'durasi') {
            const aIsOverdue = a.countdownValue < 0;
            const bIsOverdue = b.countdownValue < 0;
            if (sort.ascending) {
                if (aIsOverdue && !bIsOverdue) return 1;
                if (!aIsOverdue && bIsOverdue) return -1;
                return a.countdownValue - b.countdownValue;
            } else {
                if (aIsOverdue && !bIsOverdue) return 1;
                if (!aIsOverdue && bIsOverdue) return -1;
                return b.countdownValue - a.countdownValue;
            }
        }
        
        const aValue = a[sort.column as keyof Task];
        const bValue = b[sort.column as keyof Task];
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        if (aValue < bValue) return sort.ascending ? -1 : 1;
        if (aValue > bValue) return sort.ascending ? 1 : -1;
        return 0;
    });
    return tasksWithCountdown;
  }, [rawTasks, sort, getCountdownValue]);

  useEffect(() => {
    const highlightedTaskId = location.state?.highlightedTaskId;
    if (highlightedTaskId && sortedTasks.length > 0) {
      const taskIndex = sortedTasks.findIndex(t => t.id === highlightedTaskId);
      if (taskIndex !== -1) {
        const targetPage = Math.floor(taskIndex / itemsPerPage) + 1;
        setCurrentPage(targetPage);
        setHighlightedRow(highlightedTaskId);

        const rowElement = rowRefs.current.get(highlightedTaskId);
        if (rowElement) {
          setTimeout(() => {
            rowElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
        }

        const timer = setTimeout(() => {
          setHighlightedRow(null);
          // Hapus hanya highlightedTaskId dari state, biarkan yang lain jika ada
          const { highlightedTaskId, ...restState } = location.state;
          navigate(location.pathname, { replace: true, state: restState });
        }, 3000);

        return () => clearTimeout(timer);
      }
    }
  }, [location.state, sortedTasks, navigate]);

  const paginatedTasks = useMemo(() => {
    const from = (currentPage - 1) * itemsPerPage;
    return sortedTasks.slice(from, from + itemsPerPage);
  }, [sortedTasks, currentPage]);

  const totalPages = Math.ceil(rawTasks.length / itemsPerPage);
  
  const SortIndicator = ({ columnName }: { columnName: string }) => { // Tipe diubah ke string agar lebih fleksibel
    if (sort.column !== columnName) return null;
    // Dibungkus dengan <span> agar menjadi elemen JSX yang valid
    return <span>{sort.ascending ? ' 🔼' : ' 🔽'}</span>;
  };
  
  return (
    <div className="p-8 h-full overflow-y-auto">
      {/* Render komponen notifikasi */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <h1 className="text-3xl font-bold text-gray-800 mb-2">KR Ongoing</h1>
      <div className="flex justify-between items-center mb-6">
        <Button className="bg-green-500 hover:bg-green-600" onClick={() => navigate('/add-task')}>
          <Plus size={18} className="mr-2" />
          Tambah Tugas
        </Button>
        <Button variant="outline" onClick={fetchData} disabled={loading}>
          <RotateCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 w-16">No</th>
              <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('judul')}>GRC On-Progress<SortIndicator columnName="judul" /></th>
              <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('tanggal_terbit')}>AMS<SortIndicator columnName="tanggal_terbit" /></th>
              <th scope="col" className="px-6 py-3 w-48 text-center cursor-pointer" onClick={() => handleSort('progress_percentage')}>Data Selesai (%)<SortIndicator columnName="progress_percentage" /></th>
              <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('inisiator')}>Inisiator<SortIndicator columnName="inisiator" /></th>
              <th scope="col" className="px-6 py-3 w-40 text-center cursor-pointer" onClick={() => handleSort('durasi')}>Sisa Waktu<SortIndicator columnName="durasi" /></th>
              <th scope="col" className="px-6 py-3">Remarks</th>
              <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('pic')}>PIC<SortIndicator columnName="pic" /></th>
              <th scope="col" className="px-6 py-3 text-center w-36">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="text-center p-4">Memuat...</td></tr>
            ) : paginatedTasks.length === 0 ? (
              <tr><td colSpan={9} className="text-center p-4">Tidak ada tugas yang sedang berjalan.</td></tr>
            ) : (
              paginatedTasks.map((task, index) => {
                const countdown = getCountdown(task);
                return (
                  <tr 
                    ref={node => {
                      if (node) rowRefs.current.set(task.id, node);
                      else rowRefs.current.delete(task.id);
                    }}
                    key={task.id} 
                    className={`border-b hover:bg-gray-50 transition-colors duration-500 ${task.id === highlightedRow ? 'bg-blue-100' : 'bg-white'}`}
                  >
                    <td className="px-4 py-4 text-center font-medium">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{task.judul}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{task.tanggal_terbit ? new Date(task.tanggal_terbit).toLocaleDateString('en-GB') : '-'}</td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">{task.progress_percentage}%</td>
                    <td className="px-6 py-4 whitespace-nowrap">{task.inisiator}</td>
                    <td className={`px-6 py-4 text-center whitespace-nowrap font-semibold ${countdown.colorClass}`}>
                      {countdown.text}
                    </td>
                    <td className="px-6 py-4">{task.remarks}</td>
                    <td className="px-6 py-4">{task.pic}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <Button 
                          className="bg-blue-500 hover:bg-blue-600 text-white" 
                          size="sm" 
                          onClick={() => {
                            const countdownValue = getCountdownValue(task);
                            navigate(`/edit-ongoing/${task.id}`, { 
                              state: { 
                                initialCountdown: countdownValue 
                              } 
                            });
                          }}
                        >
                          <FilePenLine size={16} />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => openDeleteModal(task.id)}>
  <Trash2 size={16} />
</Button>
                        <Button className="bg-green-500 hover:bg-green-600 text-white px-3 text-xs" size="sm" onClick={() => openDoneModal(task.id)}>
  Done
</Button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center items-center space-x-2 mt-6">
        <Button onClick={() => setCurrentPage(1)} disabled={currentPage === 1 || totalPages === 0} variant="outline" size="sm">&lt;&lt;</Button>
        <Button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1 || totalPages === 0} variant="outline" size="sm">&lt;</Button>
        <span className="text-sm font-medium">Halaman {currentPage} dari {totalPages || 1}</span>
        <Button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} variant="outline" size="sm">&gt;</Button>
        <Button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || totalPages === 0} variant="outline" size="sm">&gt;&gt;</Button>
      </div>

       <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Konfirmasi Hapus Data"
        message="Apakah Anda yakin ingin menghapus data ini secara permanen? Tindakan ini tidak dapat diurungkan."
      />

      <DoneConfirmationModal
        isOpen={isDoneModalOpen}
        onClose={() => setIsDoneModalOpen(false)}
        onConfirm={handleConfirmDone}
      />
    </div>
  );
}