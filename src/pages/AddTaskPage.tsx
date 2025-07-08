import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Button } from '@/components/ui/button';

export default function AddTaskPage() {
  const navigate = useNavigate();
  // State dikembalikan seperti semula, dengan 'tanggal_terbit' dan 'durasi'
  const [formData, setFormData] = useState({
    judul: '',
    id_risk: 0,
    rmp: 0,
    tanggal_terbit: '', // <-- Input AMS (Tanggal Terbit) dikembalikan
    durasi: 14,         // <-- Input Periode Kerja (Durasi)
    no_nd: '',
    inisiator: '',
    pics: [''],
    assigned_by: '',
    remarks: '',
    progress_percentage: 0,
    is_data_complete: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  const { name, value, type, checked } = e.target as HTMLInputElement;

  if (type === 'checkbox') {
    setFormData(prev => ({ ...prev, [name]: checked }));
  } else {
    const updatedValue = type === 'number' ? parseInt(value, 10) || 0 : value;
    setFormData(prev => ({ ...prev, [name]: updatedValue }));
  }
};

  // Handler khusus untuk mengubah nilai pada array PIC
  const handlePicChange = (index: number, value: string) => {
    const newPics = [...formData.pics];
    newPics[index] = value;
    setFormData(prev => ({ ...prev, pics: newPics }));
  };

  // Fungsi untuk menambah input PIC baru
  const addPicInput = () => {
    setFormData(prev => ({ ...prev, pics: [...prev.pics, ''] }));
  };

  // Fungsi untuk menghapus input PIC
  const removePicInput = (index: number) => {
    // Hanya izinkan penghapusan jika ada lebih dari satu input
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

    // Gabungkan semua PIC dari array menjadi satu string
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
        pic: picValue, // <-- Menggunakan nilai PIC yang sudah digabung
        assigned_by: formData.assigned_by,
        remarks: formData.remarks,
        progress_percentage: formData.progress_percentage,
        is_completed: false,
        is_data_complete: formData.is_data_complete,
      });

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
      
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        
        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="judul" className="text-right font-semibold text-gray-700">GRC ON PROGRESS</label>
          <input type="text" id="judul" name="judul" value={formData.judul} onChange={handleChange} className="col-span-2 border p-2 rounded-md" required />
        </div>

        {/* INPUT TANGGAL (AMS) DIKEMBALIKAN */}
        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="tanggal_terbit" className="text-right font-semibold text-gray-700">AMS (Tanggal Terbit)</label>
          <input type="date" id="tanggal_terbit" name="tanggal_terbit" value={formData.tanggal_terbit} onChange={handleChange} className="col-span-2 border p-2 rounded-md" />
        </div>

        {/* Form lengkap Anda yang lain */}
        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="progress_percentage" className="text-right font-semibold text-gray-700">Data Complete</label>
          <div className="col-span-2 flex items-center">
            <input type="number" id="progress_percentage" name="progress_percentage" value={formData.progress_percentage === 0 ? '' : formData.progress_percentage} onChange={handleChange} className="w-24 border p-2 rounded-md" />
            <span className="ml-2 font-semibold text-gray-600">%</span>
          </div>
        </div>

        {/* INPUT CHECKBOX KELENGKAPAN DATA */}
<div className="grid grid-cols-3 items-center gap-4">
    <label htmlFor="is_data_complete" className="text-right font-semibold text-gray-700">Kelengkapan Data</label>
    <div className="col-span-2 flex items-center">
        <input 
            type="checkbox" 
            id="is_data_complete" 
            name="is_data_complete" 
            checked={formData.is_data_complete} 
            onChange={handleChange} 
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="ml-2 text-gray-600">Lengkap (countdown berjalan)</span>
    </div>
</div>

        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="inisiator" className="text-right font-semibold text-gray-700">INISIATOR</label>
          <input type="text" id="inisiator" name="inisiator" value={formData.inisiator} onChange={handleChange} className="col-span-2 border p-2 rounded-md" />
        </div>
        
        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="durasi" className="text-right font-semibold text-gray-700">PERIODE KERJA (HARI)</label>
          <input type="number" id="durasi" name="durasi" value={formData.durasi === 0 ? '' : formData.durasi} onChange={handleChange} className="col-span-2 border p-2 rounded-md w-24" />
        </div>
{/* === BAGIAN PIC DINAMIS === */}
{formData.pics.map((pic, index) => (
  <div key={index} className="grid grid-cols-3 items-center gap-4">
    <label htmlFor={`pic-${index}`} className="text-right font-semibold text-gray-700">
      {`PIC ${index + 1}`}
    </label>
    <div className="col-span-2 flex items-center gap-2">
      <input 
        type="text"
        id={`pic-${index}`} 
        name={`pic-${index}`} 
        value={pic} 
        placeholder="Masukkan nama PIC"
        onChange={(e) => handlePicChange(index, e.target.value)} 
        className="flex-grow border p-2 rounded-md"
      />
      {/* Tombol hapus hanya muncul jika ada lebih dari satu PIC */}
      {formData.pics.length > 1 && (
        <Button 
          type="button" 
          onClick={() => removePicInput(index)} 
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 font-bold"
        >
          -
        </Button>
      )}
    </div>
  </div>
))}

{/* Tombol untuk menambah PIC baru */}
<div className="grid grid-cols-3">
  <div className="col-start-2 col-span-2">
    <Button type="button" onClick={addPicInput} className="bg-blue-500 hover:bg-blue-600 text-white">
      + Tambah PIC
    </Button>
  </div>
</div>
{/* === AKHIR BAGIAN PIC DINAMIS === */}

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