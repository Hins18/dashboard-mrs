// src/pages/EditTaskPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Button } from '@/components/ui/button';

export default function EditTaskPage() {
  const navigate = useNavigate();
  const { taskId } = useParams(); // Mengambil ID dari URL

  // State untuk menampung semua data dari form
  const [formData, setFormData] = useState({
    judul: '',
    id_risk: 0,
    rmp: 0,
    tanggal_terbit: '',
    durasi: 0,
    no_nd: '',
    inisiator: '',
    pic: '',
    assigned_by: '',
    progress_percentage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mengambil data tugas yang ada saat halaman pertama kali dibuka
  useEffect(() => {
    async function fetchTaskData() {
      if (!taskId) return;
      setLoading(true);

      const { data, error } = await supabase
        .from('tasks_master')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) {
        console.error('Error fetching task for edit:', error);
        alert('Gagal memuat data tugas.');
        navigate(-1);
      } else if (data) {
        // Mengisi state form dengan data yang ada dari database
        setFormData({
            judul: data.judul || '',
            id_risk: data.id_risk || 0,
            rmp: data.rmp || 0,
            tanggal_terbit: data.tanggal_terbit || '',
            durasi: data.durasi || 0,
            no_nd: data.no_nd || '',
            inisiator: data.inisiator || '',
            pic: data.pic || '',
            assigned_by: data.assigned_by || '',
            progress_percentage: data.progress_percentage || 0,
        });
      }
      setLoading(false);
    }

    fetchTaskData();
  }, [taskId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Fungsi untuk menyimpan perubahan (UPDATE)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase
      .from('tasks_master')
      .update({ // <-- Menggunakan .update()
        judul: formData.judul,
        id_risk: Number(formData.id_risk) || null,
        rmp: Number(formData.rmp) || null,
        tanggal_terbit: formData.tanggal_terbit || null,
        durasi: Number(formData.durasi) || null,
        no_nd: formData.no_nd,
        inisiator: formData.inisiator,
        pic: formData.pic,
        assigned_by: formData.assigned_by,
        progress_percentage: Number(formData.progress_percentage) || 0,
      })
      .eq('id', taskId); // <-- Hanya update baris dengan ID yang cocok

    if (error) {
      alert('Gagal menyimpan perubahan!');
    } else {
      alert('Perubahan berhasil disimpan!');
      navigate(-1); // Kembali ke halaman sebelumnya
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return <div className="p-8">Loading data...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center mb-8">
        <Button variant="outline" className="bg-blue-500 text-white hover:bg-blue-600 hover:text-white" onClick={() => navigate(-1)}>Kembali</Button>
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6 ml-1">EDIT DATA</h1>
      
      {/* FORM LENGKAP UNTUK EDIT */}
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        
        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="judul" className="text-right font-semibold text-gray-700">JUDUL</label>
          <input type="text" id="judul" name="judul" value={formData.judul} onChange={handleChange} className="col-span-2 border p-2 rounded-md" required />
        </div>

        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="id_risk" className="text-right font-semibold text-gray-700">ID RISK</label>
          <input type="number" id="id_risk" name="id_risk" value={formData.id_risk} onChange={handleChange} className="col-span-2 border p-2 rounded-md" />
        </div>

        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="rmp" className="text-right font-semibold text-gray-700">RMP</label>
          <input type="number" id="rmp" name="rmp" value={formData.rmp} onChange={handleChange} className="col-span-2 border p-2 rounded-md" />
        </div>

        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="tanggal_terbit" className="text-right font-semibold text-gray-700">TANGGAL TERBIT</label>
          <input type="date" id="tanggal_terbit" name="tanggal_terbit" value={formData.tanggal_terbit} onChange={handleChange} className="col-span-2 border p-2 rounded-md" />
        </div>

        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="durasi" className="text-right font-semibold text-gray-700">DURASI</label>
          <input type="number" id="durasi" name="durasi" value={formData.durasi} onChange={handleChange} className="col-span-2 border p-2 rounded-md w-24" />
        </div>

        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="no_nd" className="text-right font-semibold text-gray-700">NO ND</label>
          <input type="text" id="no_nd" name="no_nd" value={formData.no_nd} onChange={handleChange} className="col-span-2 border p-2 rounded-md" />
        </div>

        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="inisiator" className="text-right font-semibold text-gray-700">INISIATOR</label>
          <input type="text" id="inisiator" name="inisiator" value={formData.inisiator} onChange={handleChange} className="col-span-2 border p-2 rounded-md" />
        </div>

        

        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="pic" className="text-right font-semibold text-gray-700">PIC</label>
          <select id="pic" name="pic" value={formData.pic} onChange={handleChange} className="col-span-2 border p-2 rounded-md bg-white">
            <option value="">Pilih PIC</option>
            <option value="Fernando">Fernando</option>
            <option value="Andini">Andini</option>
            <option value="Budi">Budi</option>
            <option value="Citra">Citra</option>
          </select>
        </div>

        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="assigned_by" className="text-right font-semibold text-gray-700">Assigned by</label>
          <select id="assigned_by" name="assigned_by" value={formData.assigned_by} onChange={handleChange} className="col-span-2 border p-2 rounded-md bg-white">
            <option value="">Pilih Pemberi Tugas</option>
            <option value="Manager A">Manager A</option>
            <option value="Manager B">Manager B</option>
            <option value="Manager C">Manager C</option>
          </select>
        </div>
        
        <div className="flex justify-end pt-4">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white w-48" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : 'SIMPAN PERUBAHAN'}
          </Button>
        </div>
      </form>
    </div>
  );
}