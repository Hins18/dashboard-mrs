// src/pages/EditDoneTaskPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Button } from '@/components/ui/button';

export default function EditDoneTaskPage() {
  const navigate = useNavigate();
  const { taskId } = useParams();

  const [formData, setFormData] = useState({
    judul: '',
    id_risk: 0,
    rmp: 0,
    tanggal_terbit: '',
    durasi: 0,
    no_nd: '',
    inisiator: '',
    pics: [''],
  });

  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchTaskData() {
      if (!taskId) return;
      setLoading(true);
      const { data, error } = await supabase.from('tasks_master').select('*').eq('id', Number(taskId)).single();
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
            durasi: data.durasi || 0,
            no_nd: data.no_nd || '',
            inisiator: data.inisiator || '',
            pics: picArray,
        });

        if (data.updated_at) {
          const date = new Date(data.updated_at);
          const formattedDate = date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
          setLastUpdated(formattedDate);
        } else {
          setLastUpdated(null);
        }
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
      })
      .eq('id', Number(taskId));

    if (error) {
      alert('Gagal menyimpan perubahan!');
    } else {
      // Ganti alert dengan navigate dan state
      navigate('/done', { 
        state: { 
          message: 'Perubahan berhasil disimpan!', 
          type: 'info' 
        } 
      });
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6 ml-1">EDIT DATA DONE</h1>

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
        
        {/* === BAGIAN PIC DINAMIS (INPUT MANUAL) === */}
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