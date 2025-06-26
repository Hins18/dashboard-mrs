// src/pages/DonePage.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Plus, ArrowUpDown, FilePenLine, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function DonePage() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    // ... state paginasi dan sorting bisa ditambahkan di sini jika perlu

    useEffect(() => { fetchDoneTasks(); }, []);

    async function fetchDoneTasks() {
        setLoading(true);
        const { data, error } = await supabase
        .from('tasks_master') // <-- Menggunakan tabel yang sama
        .select('*')
        .eq('is_completed', true); // <-- Tapi filternya berbeda

        if (error) console.error('Error:', error);
        else if (data) setTasks(data);
        setLoading(false);
    }

    const handleDelete = async (taskId: number) => {
        if(window.confirm("Yakin ingin menghapus?")){
            await supabase.from('tasks_master').delete().eq('id', taskId);
            fetchDoneTasks();
        }
    }

    return (
        <div className="p-8 h-full overflow-y-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">KR Done</h1>
             <div className="flex justify-between items-center mb-6">
                <Button className="bg-green-500 hover:bg-green-600" onClick={() => navigate('/add-done-task')}>
                    <Plus size={18} className="mr-2" />
                    Tambah
                </Button>
                {/* ... tombol sort ... */}
            </div>
            <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
    <tr>
      <th scope="col" className="px-4 py-3 w-16">NO</th>
      <th scope="col" className="px-6 py-3">JUDUL</th>
      <th scope="col" className="px-6 py-3 whitespace-nowrap">ID RISK</th>
      <th scope="col" className="px-6 py-3 whitespace-nowrap">RMP</th>
      <th scope="col" className="px-6 py-3 whitespace-nowrap">TANGGAL TERBIT</th>
      <th scope="col" className="px-6 py-3 w-24 text-center">DURASI</th>
      <th scope="col" className="px-6 py-3">NO ND</th>
      <th scope="col" className="px-6 py-3 whitespace-nowrap">INISIATOR</th>
      <th scope="col" className="px-6 py-3 whitespace-nowrap">PIC</th>
      <th scope="col" className="px-6 py-3 text-center w-28">AKSI</th>
    </tr>
  </thead>
  <tbody>
    {loading ? (
      <tr><td colSpan={10} className="text-center p-4">Loading...</td></tr>
    ) : (
      tasks.map((task, index) => (
        <tr key={task.id} className="bg-white border-b hover:bg-gray-50">
          <td className="px-4 py-4 text-center">{index + 1}</td>
          <td className="px-6 py-4 font-semibold text-gray-900 min-w-[250px] break-words">{task.judul}</td>
          <td className="px-6 py-4 text-center whitespace-nowrap">{task.id_risk}</td>
          <td className="px-6 py-4 text-center whitespace-nowrap">{task.rmp}</td>
          <td className="px-6 py-4 whitespace-nowrap">{task.tanggal_terbit ? new Date(task.tanggal_terbit).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}) : '-'}</td>
          <td className="px-6 py-4 text-center whitespace-nowrap">{task.durasi}</td>
          <td className="px-6 py-4">{task.no_nd}</td>
          <td className="px-6 py-4 whitespace-nowrap">{task.inisiator}</td>
          <td className="px-6 py-4 whitespace-nowrap">{task.pic}</td>
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
            {/* ... Paginasi bisa ditambahkan di sini ... */}
        </div>
    );
}