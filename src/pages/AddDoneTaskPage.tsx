// src/pages/AddDoneTaskPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Button } from '@/components/ui/button';

export default function AddDoneTaskPage() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    judul: '',
    id_risk: 0,
    rmp: 0,
    tanggal_terbit: '',
    durasi: 0,
    no_nd: '',
    inisiator: '',
    pics: [''], // State 'pics' berupa array
    assigned_by: '',
    progress_percentage: 100,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const updatedValue = type === 'number' ? parseInt(value, 10) || 0 : value;
    setFormData(prev => ({ ...prev, [name]: updatedValue }));
  };

  // Fungsi untuk mengelola input PIC dinamis
  const handlePicChange = (index: number, value: string) => {
    const newPics = [...formData.pics];
    newPics[index] = value;
    setFormData(prev => ({ ...prev, pics: newPics }));
  };

  const addPicInput = () => {
    setFormData(prev => ({ ...prev, pics: [...prev.pics, ''] }));
  };

  const removePicInput = (index: number) => {
    if (formData.pics.length > 1) {
      const newPics = formData.pics.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, pics: newPics }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.judul) {
      alert('Judul tidak boleh kosong!');
      return;
    }
    setIsSubmitting(true);

    const picValue = formData.pics.filter(Boolean).join(', ');

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
        pic: picValue,
        assigned_by: formData.assigned_by,
        progress_percentage: formData.progress_percentage,
        is_completed: true,
      });

    if (error) {
      console.error('Error inserting data:', error);
      alert('Gagal menyimpan data!');
    } else {
      // Ganti alert dengan navigate dan state
      navigate('/done', { 
        state: { 
          message: 'Data berhasil ditambahkan!', 
          type: 'success' 
        } 
      });
    }
    setIsSubmitting(false);
  };


  return (
    <div className="p-8">
      <div className="flex items-center mb-8">
        <Button variant="outline" className="bg-blue-500 text-white hover:bg-blue-600 hover:text-white" onClick={() => navigate(-1)}>Kembali</Button>
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6 ml-1">KR DONE - TAMBAH DATA</h1>
      
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        
        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="judul" className="text-right font-semibold text-gray-700">JUDUL</label>
          <input type="text" id="judul" name="judul" value={formData.judul} onChange={handleChange} className="col-span-2 border p-2 rounded-md" required />
        </div>

        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="id_risk" className="text-right font-semibold text-gray-700">ID RISK</label>
          <input type="number" id="id_risk" name="id_risk" value={formData.id_risk || ''} onChange={handleChange} className="col-span-2 border p-2 rounded-md" />
        </div>

        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="rmp" className="text-right font-semibold text-gray-700">RMP</label>
          <input type="number" id="rmp" name="rmp" value={formData.rmp || ''} onChange={handleChange} className="col-span-2 border p-2 rounded-md" />
        </div>

        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="tanggal_terbit" className="text-right font-semibold text-gray-700">TANGGAL TERBIT</label>
          <input type="date" id="tanggal_terbit" name="tanggal_terbit" value={formData.tanggal_terbit} onChange={handleChange} className="col-span-2 border p-2 rounded-md" />
        </div>

        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="durasi" className="text-right font-semibold text-gray-700">DURASI</label>
          <input type="number" id="durasi" name="durasi" value={formData.durasi || ''} onChange={handleChange} className="col-span-2 border p-2 rounded-md w-24" />
        </div>

        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="no_nd" className="text-right font-semibold text-gray-700">NO ND</label>
          <input type="text" id="no_nd" name="no_nd" value={formData.no_nd} onChange={handleChange} className="col-span-2 border p-2 rounded-md" />
        </div>

        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="inisiator" className="text-right font-semibold text-gray-700">INISIATOR</label>
          <input type="text" id="inisiator" name="inisiator" value={formData.inisiator} onChange={handleChange} className="col-span-2 border p-2 rounded-md" />
        </div>

        {/* --- BAGIAN PIC DINAMIS (INPUT MANUAL) --- */}
        {formData.pics.map((pic, index) => (
          <div key={index} className="grid grid-cols-3 items-center gap-4">
            <label htmlFor={`pic-${index}`} className="text-right font-semibold text-gray-700">{`PIC ${index + 1}`}</label>
            <div className="col-span-2 flex items-center gap-2">
              <input
                type="text"
                id={`pic-${index}`}
                value={pic}
                onChange={(e) => handlePicChange(index, e.target.value)}
                className="flex-grow border p-2 rounded-md"
                placeholder="Masukkan nama PIC"
              />
              {formData.pics.length > 1 && (
                <Button type="button" onClick={() => removePicInput(index)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 font-bold">-</Button>
              )}
            </div>
          </div>
        ))}
        
        <div className="grid grid-cols-3"><div className="col-start-2 col-span-2">
          <Button type="button" onClick={addPicInput} className="bg-blue-500 hover:bg-blue-600 text-white">+ Tambah PIC</Button>
        </div></div>
        {/* --- AKHIR BAGIAN PIC DINAMIS --- */}

        
        <div className="flex justify-end pt-4">
          <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white w-40" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : 'TAMBAH'}
          </Button>
        </div>
      </form>
    </div>
  );
}