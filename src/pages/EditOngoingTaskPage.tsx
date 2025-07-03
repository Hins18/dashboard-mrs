// src/pages/EditOngoingTaskPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Button } from '@/components/ui/button';

export default function EditOngoingTaskPage() {
  const navigate = useNavigate();
  const { taskId } = useParams();

  const [formData, setFormData] = useState({
    judul: '',
    id_risk: 0,
    rmp: 0,
    tanggal_terbit: '',
    durasi: 14,
    no_nd: '',
    inisiator: '',
    pics: [''],
    assigned_by: '',
    remarks: '',
    progress_percentage: 0,
    is_data_complete: true,
  });
  
  // State ini sekarang hanya menyimpan tanggal (string) atau null
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

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
        const picArray = data.pic ? data.pic.split(', ') : [''];
        
        setFormData({
            judul: data.judul || '',
            id_risk: data.id_risk || 0,
            rmp: data.rmp || 0,
            tanggal_terbit: data.tanggal_terbit || '',
            durasi: data.durasi || 14,
            no_nd: data.no_nd || '',
            inisiator: data.inisiator || '',
            pics: picArray,
            assigned_by: data.assigned_by || '',
            remarks: data.remarks || '',
            progress_percentage: data.progress_percentage || 0,
            is_data_complete: data.is_data_complete ?? true,
        });

        // --- PERUBAHAN 1: Logika untuk mengatur state lastUpdated ---
        if (data.updated_at) {
          const date = new Date(data.updated_at);
          // Format tanggal menjadi string yang mudah dibaca
          const formattedDate = date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
          // Simpan HANYA tanggal yang sudah diformat ke dalam state
          setLastUpdated(formattedDate);
        } else {
          // Jika data tidak ada, pastikan state-nya null
          setLastUpdated(null);
        }
      }
      setLoading(false);
    }
    fetchTaskData();
  }, [taskId, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  const { name, value, type, checked } = e.target as HTMLInputElement;

  if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
  } else {
      const updatedValue = type === 'number' ? parseInt(value, 10) || 0 : value;
      setFormData(prev => ({ ...prev, [name]: updatedValue }));
  }
};

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
    setIsSubmitting(true);
    const picValue = formData.pics.filter(Boolean).join(', ');

    const { error } = await supabase
      .from('tasks_master')
      .update({
        judul: formData.judul,
        id_risk: formData.id_risk,
        rmp: formData.rmp,
        tanggal_terbit: formData.tanggal_terbit || null,
        durasi: formData.durasi,
        no_nd: formData.no_nd,
        inisiator: formData.inisiator,
        pic: picValue,
        assigned_by: formData.assigned_by,
        remarks: formData.remarks,
        progress_percentage: formData.progress_percentage,
        is_data_complete: formData.is_data_complete,
      })
      .eq('id', taskId);

    if (error) {
      alert('Gagal menyimpan perubahan!');
    } else {
      alert('Perubahan berhasil disimpan!');
      navigate('/ongoing');
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return <div className="p-8">Memuat data...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center mb-8">
        <Button variant="outline" className="bg-blue-500 text-white hover:bg-blue-600 hover:text-white" onClick={() => navigate(-1)}>Kembali</Button>
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6 ml-1">EDIT DATA ONGOING</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        
        {/* ... (semua input form Anda tetap sama) ... */}

        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="judul" className="text-right font-semibold text-gray-700">GRC ON PROGRESS</label>
          <input type="text" id="judul" name="judul" value={formData.judul} onChange={handleChange} className="col-span-2 border p-2 rounded-md" required />
        </div>
        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="tanggal_terbit" className="text-right font-semibold text-gray-700">AMS (Tanggal Terbit)</label>
          <input type="date" id="tanggal_terbit" name="tanggal_terbit" value={formData.tanggal_terbit} onChange={handleChange} className="col-span-2 border p-2 rounded-md" />
        </div>
        <div className="grid grid-cols-3 items-center gap-4">
          <label htmlFor="progress_percentage" className="text-right font-semibold text-gray-700">Data Complete</label>
          <div className="col-span-2 flex items-center">
            <input type="number" id="progress_percentage" name="progress_percentage" value={formData.progress_percentage || ''} onChange={handleChange} className="w-24 border p-2 rounded-md" />
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
          <input type="number" id="durasi" name="durasi" value={formData.durasi || ''} onChange={handleChange} className="col-span-2 border p-2 rounded-md w-24" />
        </div>
        {formData.pics.map((pic, index) => (
          <div key={index} className="grid grid-cols-3 items-center gap-4">
            <label htmlFor={`pic-${index}`} className="text-right font-semibold text-gray-700">{`PIC ${index + 1}`}</label>
            <div className="col-span-2 flex items-center gap-2">
              <select id={`pic-${index}`} value={pic} onChange={(e) => handlePicChange(index, e.target.value)} className="flex-grow border p-2 rounded-md bg-white">
                <option value="">Pilih PIC</option>
                <option value="Fernando">Fernando</option>
                <option value="Andini">Andini</option>
                <option value="Budi">Budi</option>
                <option value="Citra">Citra</option>
                <option value="Fachri">Fachri</option>
                <option value="Alif">Alif</option>
              </select>
              {formData.pics.length > 1 && (
                <Button type="button" onClick={() => removePicInput(index)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 font-bold">-</Button>
              )}
            </div>
          </div>
        ))}
        <div className="grid grid-cols-3"><div className="col-start-2 col-span-2">
          <Button type="button" onClick={addPicInput} className="bg-blue-500 hover:bg-blue-600 text-white">+ Tambah PIC</Button>
        </div></div>
        <div className="grid grid-cols-3 items-start gap-4">
          <label htmlFor="remarks" className="text-right font-semibold text-gray-700 pt-2">REMARKS</label>
          <textarea id="remarks" name="remarks" value={formData.remarks || ''} onChange={handleChange} className="col-span-2 border p-2 rounded-md" rows={4} />
        </div>

        
        {/* --- PERUBAHAN 2: Tampilan JSX diubah menjadi statis --- */}
        <div className="flex justify-between items-center pt-4">
          <div>
            <p className="text-sm text-gray-500 italic">
              Last Updated: {lastUpdated}
            </p>
          </div>
          
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white w-48" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : 'SIMPAN PERUBAHAN'}
          </Button>
        </div>
      </form>
    </div>
  );
}