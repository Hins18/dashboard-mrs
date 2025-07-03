// src/pages/DonePage.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Plus, ArrowUpDown, FilePenLine, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import type { Database } from '../database.types';

type Task = Database['public']['Tables']['tasks_master']['Row'];

export default function DonePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. TAMBAHKAN STATE UNTUK PAGINASI DAN SORTING
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [sort, setSort] = useState({ column: 'tanggal_terbit', ascending: false });
  
  const itemsPerPage = 5;
  const from = (currentPage - 1) * itemsPerPage;

  // 2. PERBARUI useEffect UNTUK MEMANTAU PERUBAHAN SORTING
  useEffect(() => {
    fetchDoneTasks();
  }, [currentPage, sort]);

  // 3. PERBARUI FUNGSI FETCH DATA DENGAN LOGIKA SORTING & PAGINASI
  async function fetchDoneTasks() {
    setLoading(true);
    const to = from + itemsPerPage - 1;

    const { data, error, count } = await supabase
      .from('tasks_master')
      .select('*', { count: 'exact' })
      .eq('is_completed', true)
      .order(sort.column, { ascending: sort.ascending }) // <-- Order sekarang dinamis
      .range(from, to);

    if (error) {
      console.error('Error fetching done tasks:', error);
    } else {
      if (data) setTasks(data);
      if (count) setTotalTasks(count);
    }
    setLoading(false);
  }

  const totalPages = Math.ceil(totalTasks / itemsPerPage);

  // 4. TAMBAHKAN FUNGSI handleSort
  const handleSort = (columnName: string) => {
    const newAscending = sort.column === columnName ? !sort.ascending : true;
    setSort({ column: columnName, ascending: newAscending });
    setCurrentPage(1); // Kembali ke halaman 1 setiap kali sorting diubah
  };

  const handleDelete = async (taskId: number) => {
    if (window.confirm("Yakin ingin menghapus tugas ini?")) {
      await supabase.from('tasks_master').delete().eq('id', taskId);
      fetchDoneTasks();
    }
  };

  const SortIndicator = ({ columnName }: { columnName: string }) => {
    if (sort.column !== columnName) return null;
    return sort.ascending ? ' 🔼' : ' 🔽';
  };
  return (
    <div className="p-8 h-full overflow-y-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">KR Done</h1>
      <div className="flex justify-between items-center mb-6">
        <Button className="bg-green-500 hover:bg-green-600" onClick={() => navigate('/add-done-task')}>
          <Plus size={18} className="mr-2" />
          Tambah
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 w-16 text-center">NO</th>
              
              {/* Kolom yang bisa di-sort dengan indikator baru */}
              <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('judul')}>
                JUDUL<SortIndicator columnName="judul" />
              </th>
              <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('id_risk')}>
                ID RISK<SortIndicator columnName="id_risk" />
              </th>
              <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('rmp')}>
                RMP<SortIndicator columnName="rmp" />
              </th>
              <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('tanggal_terbit')}>
                TANGGAL TERBIT<SortIndicator columnName="tanggal_terbit" />
              </th>
              <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-100 text-center" onClick={() => handleSort('durasi')}>
                DURASI<SortIndicator columnName="durasi" />
              </th>

              {/* Kolom yang tidak bisa di-sort */}
              <th scope="col" className="px-6 py-3">NO ND</th>
              <th scope="col" className="px-6 py-3">INISIATOR</th>
              <th scope="col" className="px-6 py-3">PIC</th>
              <th scope="col" className="px-6 py-3 text-center w-28">AKSI</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} className="text-center p-4">Loading...</td></tr>
            ) : (
              tasks.map((task, index) => (
                <tr key={task.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-4 py-4 text-center">{from + index + 1}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{task.judul}</td>
                  <td className="px-6 py-4 text-center">{task.id_risk}</td>
                  <td className="px-6 py-4 text-center">{task.rmp}</td>
                  <td className="px-6 py-4">{task.tanggal_terbit ? new Date(task.tanggal_terbit).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}) : '-'}</td>
                  <td className="px-6 py-4 text-center">{task.durasi}</td>
                  <td className="px-6 py-4">{task.no_nd}</td>
                  <td className="px-6 py-4">{task.inisiator}</td>
                  <td className="px-6 py-4">{task.pic}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/edit-done/${task.id}`)}><FilePenLine size={16} /></Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(task.id)}><Trash2 size={16} /></Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Menambahkan kembali Paginasi */}
      <div className="flex justify-center items-center space-x-2 mt-6">
        <Button onClick={() => setCurrentPage(1)} disabled={currentPage === 1 || totalPages === 0} variant="outline" size="sm">&lt;&lt;</Button>
        <Button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1 || totalPages === 0} variant="outline" size="sm">&lt;</Button>
        <span className="text-sm font-medium">Page {currentPage} of {totalPages || 1}</span>
        <Button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} variant="outline" size="sm">&gt;</Button>
        <Button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || totalPages === 0} variant="outline" size="sm">&gt;&gt;</Button>
      </div>
    </div>
  );
}