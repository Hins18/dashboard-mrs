// src/pages/DonePage.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Plus, FilePenLine, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Database } from '../database.types';
import Notification from '@/components/ui/Notification';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

type Task = Database['public']['Tables']['tasks_master']['Row'];

export default function DonePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [sort, setSort] = useState({ column: 'tanggal_terbit', ascending: false });
  const [highlightedColumn, setHighlightedColumn] = useState<string | null>(null);
  
  // State untuk notifikasi
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false); // <-- TAMBAHKAN INI
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null); // <-- TAMBAHKAN INI

  const itemsPerPage = 5;
  const from = (currentPage - 1) * itemsPerPage;

  useEffect(() => {
    // Cek state dari navigasi untuk menampilkan notifikasi
    if (location.state?.message && location.state?.type) {
      setNotification({ message: location.state.message, type: location.state.type });
      // Bersihkan state lokasi agar notifikasi tidak muncul lagi saat refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    fetchDoneTasks();
  }, [currentPage, sort]);

  useEffect(() => {
    const colToHighlight = location.state?.highlightColumn;
    if (colToHighlight) {
      setHighlightedColumn(colToHighlight);
      const timer = setTimeout(() => {
        setHighlightedColumn(null);
        navigate(location.pathname, { replace: true, state: {} }); 
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [location.state, navigate]);

  async function fetchDoneTasks() {
    setLoading(true);
    const to = from + itemsPerPage - 1;

    const { data, error, count } = await supabase
      .from('tasks_master')
      .select('*', { count: 'exact' })
      .eq('is_completed', true)
      .order(sort.column, { ascending: sort.ascending })
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

  const handleSort = (columnName: string) => {
    const newAscending = sort.column === columnName ? !sort.ascending : true;
    setSort({ column: columnName, ascending: newAscending });
    setCurrentPage(1);
  };

  // src/pages/DonePage.tsx

  const openDeleteModal = (taskId: number) => {
    setTaskToDelete(taskId);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (taskToDelete === null) return;

    const { error } = await supabase.from('tasks_master').delete().eq('id', taskToDelete);

    setIsModalOpen(false);
    setTaskToDelete(null);

    if (error) {
      alert('Gagal menghapus data.'); // Notifikasi jika gagal
    } else {
      // Tampilkan notifikasi sukses
      setNotification({
        message: 'Data berhasil dihapus!',
        type: 'success',
      });
      fetchDoneTasks(); // Muat ulang data
    }
  };

  const SortIndicator = ({ columnName }: { columnName: string }) => {
    if (sort.column !== columnName) return null;
    // Bungkus teks dengan <span> agar menjadi elemen JSX yang valid
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
              <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('judul')}>
                JUDUL<SortIndicator columnName="judul" />
              </th>
              <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('id_risk')}>
                ID RISK<SortIndicator columnName="id_risk" />
              </th>
              <th scope="col" className={`px-6 py-3 cursor-pointer hover:bg-gray-100 text-center transition-colors duration-300 ${highlightedColumn === 'rmp' ? 'bg-yellow-200' : ''}`} onClick={() => handleSort('rmp')}>
                 RMP<SortIndicator columnName="rmp" />
              </th>
              <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('tanggal_terbit')}>
                TANGGAL TERBIT<SortIndicator columnName="tanggal_terbit" />
              </th>
              <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-100 text-center" onClick={() => handleSort('durasi')}>
                DURASI<SortIndicator columnName="durasi" />
              </th>
              <th scope="col" className="px-6 py-3">NO ND</th>
              <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('inisiator')}>Inisiator<SortIndicator columnName="inisiator" /></th>
              <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('pic')}>PIC<SortIndicator columnName="pic" /></th>
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
                      <Button variant="outline" className="bg-blue-500 hover:bg-blue-600 text-white" size="sm" onClick={() => navigate(`/edit-done/${task.id}`)}><FilePenLine size={16} /></Button>
<Button variant="destructive" size="sm" onClick={() => openDeleteModal(task.id)}><Trash2 size={16} /></Button>                  </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center items-center space-x-2 mt-6">
        <Button onClick={() => setCurrentPage(1)} disabled={currentPage === 1 || totalPages === 0} variant="outline" size="sm">&lt;&lt;</Button>
        <Button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1 || totalPages === 0} variant="outline" size="sm">&lt;</Button>
        <span className="text-sm font-medium">Page {currentPage} of {totalPages || 1}</span>
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
    </div>
  );

}