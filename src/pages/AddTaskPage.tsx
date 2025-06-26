// src/pages/AddTaskPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Button } from '@/components/ui/button';

export default function AddTaskPage() {
  const navigate = useNavigate();
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
    remarks: '',
    progress_percentage: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fungsi untuk menangani perubahan di setiap input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    // Mengubah nilai menjadi angka jika tipe inputnya adalah number
    const updatedValue = type === 'number' ? parseInt(value, 10) || 0 : value;
    setFormData(prev => ({ ...prev, [name]: updatedValue }));
  };

  // Fungsi untuk mengirim data ke Supabase saat form disubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.judul) {
      alert('Judul tidak boleh kosong!');
      return;
    }
    setIsSubmitting(true);

    // ========================================================
    // ==         BAGIAN INSERT YANG SUDAH DIPERBAIKI        ==
    // ========================================================
    const { error } = await supabase
      .from('tasks_master')
      .insert({
        judul: formData.judul,
        id_risk: formData.id_risk,
        rmp: formData.rmp,
        tanggal_terbit: formData.tanggal_terbit || null,
        durasi: formData.durasi,
        no_nd: formData.no_nd,
        inisiator: formData.inisiator,
        pic: formData.pic,
        assigned_by: formData.assigned_by,
        remarks: formData.remarks,
        progress_percentage: formData.progress_percentage,
        is_completed: false, // Selalu false untuk tugas Ongoing baru
      });
    // ========================================================

    if (error) {
      console.error('Error inserting data:', error);
      alert('Gagal menyimpan data!');
    } else {
      alert('Data berhasil ditambahkan!');
      navigate('/ongoing'); 
    }
    setIsSubmitting(false);
  };

  return (
    <div className="p-8">
      <div className="flex items-center mb-8">
        <Button variant="outline" className="bg-blue-500 text-white hover:bg-blue-600 hover:text-white" onClick={() => navigate(-1)}>Kembali</Button>
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6 ml-1">KR ONGOING - TAMBAH DATA</h1>
      
      {/* Bagian form Anda sudah benar, tidak perlu diubah */}
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        
        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="judul" className="text-right font-semibold text-gray-700">GRC ON PROGRESS</label>
          <input type="text" id="judul" name="judul" value={formData.judul} onChange={handleChange} className="col-span-2 border p-2 rounded-md" required />
        </div>

        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="ams_date" className="text-right font-semibold text-gray-700">AMS</label>
          <input type="date" id="tanggal_terbit" name="tanggal_terbit" value={formData.tanggal_terbit} onChange={handleChange} className="col-span-2 border p-2 rounded-md" />
        </div>

        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="progress_percentage" className="text-right font-semibold text-gray-700">Data Complete</label>
          <div className="col-span-2 flex items-center">
            <input type="number" id="progress_percentage" name="progress_percentage" value={formData.progress_percentage} onChange={handleChange} className="w-24 border p-2 rounded-md" />
            <span className="ml-2 font-semibold text-gray-600">%</span>
          </div>
        </div>

        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="inisiator" className="text-right font-semibold text-gray-700">INISIATOR</label>
          <input type="text" id="inisiator" name="inisiator" value={formData.inisiator} onChange={handleChange} className="col-span-2 border p-2 rounded-md" />
        </div>

        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="durasi" className="text-right font-semibold text-gray-700">DURATION</label>
          <input type="number" id="durasi" name="durasi" value={formData.durasi} onChange={handleChange} className="col-span-2 border p-2 rounded-md w-24" />
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

        <div className="grid grid-cols-3 items-start gap-4">
          <label htmlFor="remarks" className="text-right font-semibold text-gray-700 pt-2">REMARKS</label>
          <textarea id="remarks" name="remarks" value={formData.remarks} onChange={handleChange} className="col-span-2 border p-2 rounded-md" rows={4} />
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