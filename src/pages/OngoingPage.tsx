// src/pages/OngoingPage.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Plus, ArrowUpDown, FilePenLine, Trash2 } from 'lucide-react'; // <-- Import ikon baru
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Task {
  id: number;
  // ... (sisa interface Task sama seperti sebelumnya)
  grc_on_progress: string | null;
  ams_date: string | null;
  progress_percentage: number | null;
  initiator: string | null;
  duration_days: number | null;
  remarks: string | null;
  pic: string | null;
  assigned_by: string | null;
}

export default function OngoingPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [sort, setSort] = useState({ column: 'created_at', ascending: false });
  
  const itemsPerPage = 5;
  const navigate = useNavigate();
  const from = (currentPage - 1) * itemsPerPage;

  useEffect(() => {
    fetchOngoingTasks();
  }, [currentPage, sort]);

  async function fetchOngoingTasks() {
    setLoading(true);
    const to = from + itemsPerPage - 1;
    const { data, error, count } = await supabase
      .from('kro_tasks')
      .select('*', { count: 'exact' })
      .eq('is_completed', false)
      .order(sort.column, { ascending: sort.ascending }) 
      .range(from, to);
    if (error) {
      console.error('Error:', error);
    } else {
      if (data) setTasks(data);
      if (count) setTotalTasks(count);
    }
    setLoading(false);
  }

  const handleSort = (columnName: string) => {
    const newAscending = sort.column === columnName ? !sort.ascending : true;
    setSort({ column: columnName, ascending: newAscending });
    setCurrentPage(1);
  };

  // FUNGSI BARU UNTUK MENGHAPUS TUGAS
  const handleDelete = async (taskId: number) => {
    // Tampilkan konfirmasi sebelum menghapus
    const isConfirmed = window.confirm("Apakah Anda yakin ingin menghapus tugas ini?");
    
    if (isConfirmed) {
      const { error } = await supabase
        .from('kro_tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Error deleting task:', error);
        alert('Gagal menghapus tugas.');
      } else {
        // Jika berhasil, panggil ulang fetchOngoingTasks untuk memperbarui tampilan
        fetchOngoingTasks();
        alert('Tugas berhasil dihapus.');
      }
    }
  };
  const totalPages = Math.ceil(totalTasks / itemsPerPage);

  return (
    <div className="p-8 h-full overflow-y-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">KR Ongoing</h1>
      <div className="flex justify-between items-center mb-6">
        <Button 
  className="bg-green-500 hover:bg-green-600"
  onClick={() => navigate('/add-task')} // <-- PASTIKAN INI ADA
>
  <Plus size={18} className="mr-2" />
  Tambah
</Button>
        <Button variant="outline" className="text-gray-600" onClick={() => handleSort('duration_days')}>
          Sort By: Durasi
          <ArrowUpDown size={16} className="ml-2" />
        </Button>
      </div>

      {/* Pembungkus tabel dengan overflow-x-auto untuk scroll horizontal */}
      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        {/* Hapus 'table-fixed' agar lebar kolom menyesuaikan konten */}
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3">No</th>
              <th scope="col" className="px-6 py-3">GRC On-Progress</th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">AMS</th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">Data Completed (%)</th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">Inisiator</th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">Duration</th>
              <th scope="col" className="px-6 py-3">Remarks</th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">PIC</th>
              <th scope="col" className="px-6 py-3 whitespace-nowrap">Assigned by</th>
              {/* KOLOM AKSI BARU */}
              <th scope="col" className="px-6 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} className="text-center p-4">Loading...</td></tr>
            ) : (
              tasks.map((task, index) => (
                <tr key={task.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-4 py-4 font-medium">{from + index + 1}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900 min-w-[250px]">{task.grc_on_progress}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{task.ams_date ? new Date(task.ams_date).toLocaleDateString('en-GB') : '-'}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">{task.progress_percentage}%</td>
                  <td className="px-6 py-4 whitespace-nowrap">{task.initiator}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">{task.duration_days}</td>
                  <td className="px-6 py-4 min-w-[300px]">{task.remarks}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{task.pic}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{task.assigned_by}</td>
                  {/* TOMBOL AKSI BARU */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/edit-task/${task.id}`)}>
                        <FilePenLine size={16} />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(task.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

{/* Kontrol Paginasi */}
<div className="flex justify-center items-center space-x-2 mt-6">
  <Button onClick={() => setCurrentPage(1)} disabled={currentPage === 1 || totalPages === 0} variant="outline" size="sm">
    &lt;&lt;
  </Button>
  <Button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1 || totalPages === 0} variant="outline" size="sm">
    &lt;
  </Button>
  <span className="text-sm font-medium">
    Page {currentPage} of {totalPages || 1}
  </span>
  <Button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} variant="outline" size="sm">
    &gt;
  </Button>
  <Button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || totalPages === 0} variant="outline" size="sm">
    &gt;&gt;
  </Button>
</div>

      {/* Kontrol Paginasi (tidak berubah) */}
      <div className="flex justify-center items-center space-x-2 mt-6">
        {/* ... tombol-tombol paginasi ... */}
      </div>
    </div>
  );
}