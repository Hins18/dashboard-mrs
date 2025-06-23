// src/pages/TaskPage.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Database } from '../database.types';

// Definisikan tipe untuk satu tugas (sekarang tanpa user_id)
type Task = Database['public']['Tables']['tasks']['Row'];

export default function TaskPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // useEffect untuk mengambil data dan mendengarkan perubahan real-time
  useEffect(() => {
    fetchTasks();

    const channel = supabase
      .channel('realtime tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' },
        () => fetchTasks()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Fungsi untuk mengambil semua tugas
  const fetchTasks = async () => {
    const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (data) setTasks(data);
  };

  // Fungsi untuk menambah tugas baru (tanpa user_id)
  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    
    await supabase.from('tasks').insert({ title, description });
    
    setTitle('');
    setDescription('');
  };
  
  // Fungsi untuk mengubah status selesai
  const toggleTask = async (id: number, is_completed: boolean) => {
    await supabase.from('tasks').update({ is_completed: !is_completed }).eq('id', id);
  };

  // Fungsi untuk menghapus tugas
  const deleteTask = async (id: number) => {
    await supabase.from('tasks').delete().eq('id', id);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Tugas Divisi</h1>
          {/* Tombol Logout sudah dihapus */}
        </div>
        
        <form onSubmit={addTask} className="mb-8 p-4 bg-gray-50 rounded-md">
          <input type="text" placeholder="Judul Tugas Baru..." value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border rounded mb-2" />
          <textarea placeholder="Deskripsi..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 border rounded mb-2" />
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 font-semibold">
            Tambah Tugas
          </button>
        </form>

        <div>
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-4 mb-3 border rounded-lg shadow-sm">
              <div className="flex items-center">
                <input type="checkbox" checked={task.is_completed} onChange={() => toggleTask(task.id, task.is_completed)} className="h-5 w-5 rounded-full mr-4"/>
                <div>
                  <p className={`font-semibold ${task.is_completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>{task.title}</p>
                  <p className="text-sm text-gray-600">{task.description}</p>
                </div>
              </div>
              <button onClick={() => deleteTask(task.id)} className="text-gray-400 hover:text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}