// src/pages/OngoingPage.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Plus, ArrowUpDown, FilePenLine, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import type { Database } from '../database.types';
type Task = Database['public']['Tables']['tasks_master']['Row'];

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
    // Diubah untuk memanggil fetchTasks dengan status yang benar
    fetchTasks('ongoing'); 
  }, [currentPage, sort]);

  async function fetchTasks(status: 'ongoing' | 'done') {
    setLoading(true);
    const to = from + itemsPerPage - 1;

    const { data, error, count } = await supabase
      .from('tasks_master')
      .select('*', { count: 'exact' })
      .eq('is_completed', status === 'ongoing' ? false : true)
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

  const totalPages = Math.ceil(totalTasks / itemsPerPage);
  
  const handleDelete = async (taskId: number) => {
    if(window.confirm("Yakin ingin menghapus?")){
        await supabase.from('tasks_master').delete().eq('id', taskId);
        fetchTasks('ongoing');
    }
  }

  // Fungsi handleSort tidak perlu diubah
  const handleSort = (columnName: string) => {
    const newAscending = sort.column === columnName ? !sort.ascending : true;
    setSort({ column: columnName, ascending: newAscending });
    setCurrentPage(1);
  };

  return (
    <div className="p-8 h-full overflow-y-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">KR Ongoing</h1>
      <div className="flex justify-between items-center mb-6">
        <Button 
          className="bg-green-500 hover:bg-green-600"
          onClick={() => navigate('/add-task')}
        >
          <Plus size={18} className="mr-2" />
          Tambah
        </Button>
        <Button variant="outline" className="text-gray-600" onClick={() => handleSort('durasi')}>
          Sort By: Durasi
          <ArrowUpDown size={16} className="ml-2" />
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3">No</th>
              <th scope="col" className="px-6 py-3">GRC On-Progress</th>
              <th scope="col" className="px-6 py-3">AMS</th>
              <th scope="col" className="px-6 py-3">Data Completed</th>
              <th scope="col" className="px-6 py-3">Inisiator</th>
              <th scope="col" className="px-6 py-3">Duration</th>
              <th scope="col" className="px-6 py-3">Remarks</th>
              <th scope="col" className="px-6 py-3">PIC</th>
              <th scope="col" className="px-6 py-3">Assigned by</th>
              <th scope="col" className="px-6 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} className="text-center p-4">Loading...</td></tr>
            ) : (
              tasks.map((task, index) => (
                <tr key={task.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-4 py-4 font-medium text-center">{from + index + 1}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900 min-w-[250px] break-words">{task.judul}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{task.tanggal_terbit ? new Date(task.tanggal_terbit).toLocaleDateString('en-GB') : '-'}</td>
                  
                  {/* Kolom 'Data Completed' sekarang menampilkan persentase */}
                  <td className="px-6 py-4 text-center whitespace-nowrap">{task.progress_percentage}%</td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">{task.inisiator}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">{task.durasi}</td>
                  <td className="px-6 py-4 min-w-[300px] break-words">{task.remarks}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{task.pic}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{task.assigned_by}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/edit-task/${task.id}`)}><FilePenLine size={16} /></Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(task.id)}><Trash2 size={16} /></Button>
                    </div>
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
    </div>
  );
}