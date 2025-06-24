// src/pages/AddTaskPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Button } from '@/components/ui/button';

export default function AddTaskPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    grc_on_progress: '',
    ams_date: '',
    progress_percentage: 0,
    initiator: '',
    duration_days: 0,
    pic: '',
    assigned_by: '',
    remarks: '' // Menambahkan remarks
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fungsi untuk menangani perubahan di setiap input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Fungsi untuk mengirim data ke Supabase saat form disubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase
      .from('kro_tasks')
      .insert({
        grc_on_progress: formData.grc_on_progress,
        ams_date: formData.ams_date || null,
        progress_percentage: Number(formData.progress_percentage) || 0,
        initiator: formData.initiator,
        duration_days: Number(formData.duration_days) || 0,
        pic: formData.pic,
        assigned_by: formData.assigned_by,
        remarks: formData.remarks,
      });

    if (error) {
      console.error('Error inserting data:', error);
      alert('Gagal menyimpan data!');
    } else {
      alert('Data berhasil ditambahkan!');
      navigate('/ongoing'); // Kembali ke halaman Ongoing setelah berhasil
    }
    setIsSubmitting(false);
  };

  return (
    <div className="p-8">
      <div className="flex items-center mb-8">
        <Button variant="outline" className="bg-blue-500 text-white hover:bg-blue-600 hover:text-white" onClick={() => navigate(-1)}>Kembali</Button>
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6 ml-1">KR ONGOING - TAMBAH DATA</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">

        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="grc_on_progress" className="text-right font-semibold text-gray-700">GRC ON PROGRESS</label>
          <input type="text" id="grc_on_progress" name="grc_on_progress" value={formData.grc_on_progress} onChange={handleChange} className="col-span-2 border p-2 rounded-md" />
        </div>

        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="ams_date" className="text-right font-semibold text-gray-700">AMS</label>
          <input type="date" id="ams_date" name="ams_date" value={formData.ams_date} onChange={handleChange} className="col-span-2 border p-2 rounded-md" />
        </div>

        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="progress_percentage" className="text-right font-semibold text-gray-700">Data Complete</label>
          <div className="col-span-2 flex items-center">
            <input type="number" id="progress_percentage" name="progress_percentage" value={formData.progress_percentage} onChange={handleChange} className="w-24 border p-2 rounded-md" />
            <span className="ml-2 font-semibold text-gray-600">%</span>
          </div>
        </div>

        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="initiator" className="text-right font-semibold text-gray-700">INISIATOR</label>
          <input type="text" id="initiator" name="initiator" value={formData.initiator} onChange={handleChange} className="col-span-2 border p-2 rounded-md" />
        </div>

        {/* Kolom % di desain sepertinya sama dengan Data Complete, jadi kita bisa lewati atau gunakan field yang sama */}

        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="duration_days" className="text-right font-semibold text-gray-700">DURATION</label>
          <input type="number" id="duration_days" name="duration_days" value={formData.duration_days} onChange={handleChange} className="w-24 border p-2 rounded-md" />
        </div>

        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="pic" className="text-right font-semibold text-gray-700">PIC</label>
          <select id="pic" name="pic" value={formData.pic} onChange={handleChange} className="col-span-2 border p-2 rounded-md bg-white">
            <option value="">Pilih PIC</option>
            <option value="Bondon">Bondon</option>
            <option value="Chandra">Chandra</option>
            <option value="Dewi">Dewi</option>
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
          <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white w-40" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : 'TAMBAH'}
          </Button>
        </div>
      </form>
    </div>
  );
}