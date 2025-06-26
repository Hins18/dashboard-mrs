// src/pages/EditOngoingTaskPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Button } from '@/components/ui/button';

export default function EditOngoingTaskPage() {
  const navigate = useNavigate();
  const { taskId } = useParams();

  // State formnya lebih sederhana, hanya berisi kolom untuk Ongoing
  const [formData, setFormData] = useState({
    judul: '',
    tanggal_terbit: '',
    progress_percentage: 0,
    inisiator: '',
    durasi: 0,
    pic: '',
    assigned_by: '',
    remarks: '',
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchTaskData() {
      if (!taskId) return;
      setLoading(true);
      const { data, error } = await supabase.from('tasks_master').select('*').eq('id', taskId).single();
      if (error) {
        alert('Gagal memuat data tugas.');
        navigate(-1);
      } else if (data) {
        setFormData({
            judul: data.judul || '',
            tanggal_terbit: data.tanggal_terbit || '',
            progress_percentage: data.progress_percentage || 0,
            inisiator: data.inisiator || '',
            durasi: data.durasi || 0,
            pic: data.pic || '',
            assigned_by: data.assigned_by || '',
            remarks: data.remarks || '',
        });
      }
      setLoading(false);
    }
    fetchTaskData();
  }, [taskId, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const updatedValue = type === 'number' ? parseInt(value, 10) || 0 : value;
    setFormData(prev => ({ ...prev, [name]: updatedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase
      .from('tasks_master')
      .update({ // Hanya update field yang ada di form ini
        judul: formData.judul,
        tanggal_terbit: formData.tanggal_terbit || null,
        progress_percentage: formData.progress_percentage,
        inisiator: formData.inisiator,
        durasi: formData.durasi,
        pic: formData.pic,
        assigned_by: formData.assigned_by,
        remarks: formData.remarks,
      })
      .eq('id', taskId);

    if (error) {
      alert('Gagal menyimpan perubahan!');
    } else {
      alert('Perubahan berhasil disimpan!');
      navigate('/ongoing'); // Kembali ke halaman Ongoing
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6 ml-1">EDIT DATA ONGOING</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="judul" className="text-right font-semibold text-gray-700">GRC ON PROGRESS</label>
          <input type="text" id="judul" name="judul" value={formData.judul} onChange={handleChange} className="col-span-2 border p-2 rounded-md" required />
        </div>

        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="tanggal_terbit" className="text-right font-semibold text-gray-700">AMS</label>
          <input type="date" id="tanggal_terbit" name="tanggal_terbit" value={formData.tanggal_terbit} onChange={handleChange} className="col-span-2 border p-2 rounded-md" />
        </div>

        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="progress_percentage" className="text-right font-semibold text-gray-700">Data Complete (%)</label>
          <input type="number" id="progress_percentage" name="progress_percentage" value={formData.progress_percentage} onChange={handleChange} className="col-span-2 border p-2 rounded-md w-24" />
        </div>

        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="inisiator" className="text-right font-semibold text-gray-700">INISIATOR</label>
          <input type="text" id="inisiator" name="inisiator" value={formData.inisiator} onChange={handleChange} className="col-span-2 border p-2 rounded-md" />
        </div>

        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="durasi" className="text-right font-semibold text-gray-700">DURATION</label>
          <input type="number" id="durasi" name="durasi" value={formData.durasi} onChange={handleChange} className="col-span-2 border p-2 rounded-md w-24" />
        </div>

        <div className="grid grid-cols-3 items-start gap-4">
          <label htmlFor="remarks" className="text-right font-semibold text-gray-700 pt-2">REMARKS</label>
          <textarea id="remarks" name="remarks" value={formData.remarks} onChange={handleChange} className="col-span-2 border p-2 rounded-md" rows={4} />
        </div>

        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="pic" className="text-right font-semibold text-gray-700">PIC</label>
          <select id="pic" name="pic" value={formData.pic} onChange={handleChange} className="col-span-2 border p-2 rounded-md bg-white">
            <option value="">Pilih PIC</option>
            <option value="Fernando">Fernando</option>
            <option value="Andini">Andini</option>
            <option value="Budi">Budi</option>
          </select>
        </div>

        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="assigned_by" className="text-right font-semibold text-gray-700">Assigned by</label>
          <select id="assigned_by" name="assigned_by" value={formData.assigned_by} onChange={handleChange} className="col-span-2 border p-2 rounded-md bg-white">
            <option value="">Pilih Pemberi Tugas</option>
            <option value="Manager A">Manager A</option>
            <option value="Manager B">Manager B</option>
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