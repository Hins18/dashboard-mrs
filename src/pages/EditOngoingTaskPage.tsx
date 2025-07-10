  // src/pages/EditOngoingTaskPage.tsx
  import { useState, useEffect, useCallback } from 'react';
  import { useNavigate, useParams, useLocation } from 'react-router-dom';
  import { supabase } from '../lib/supabaseClient';
  import { Button } from '@/components/ui/button';
  // Impor fungsi date-fns yang dibutuhkan
import { eachDayOfInterval, isSameDay, isWeekend, addDays, startOfDay } from 'date-fns';
  export default function EditOngoingTaskPage() {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const location = useLocation();
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
    sisa_durasi_saat_pause: null as number | null,
    tanggal_resume: null as string | null,
  });
  const [initialTaskState, setInitialTaskState] = useState<any>(null);
  const [holidays, setHolidays] = useState<Date[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tanggalPauseManual, setTanggalPauseManual] = useState<string>('');
  const [tanggalResumeManual, setTanggalResumeManual] = useState<string>('');


  // SALIN FUNGSI KALKULASI DARI OngoingPage.tsx
  const calculateWorkingDaysBetween = useCallback((start: Date, end: Date): number => {
    if (start > end) return 0;
    let count = 0;
    eachDayOfInterval({ start, end }).forEach(day => {
        const isPublicHoliday = holidays.some(h => isSameDay(h, day));
        if (!isWeekend(day) && !isPublicHoliday) count++;
    });
    return count;
  }, [holidays]);

  const calculateDeadline = useCallback((startDate: Date, workdays: number): Date => {
    let deadline = new Date(startDate);
    deadline.setHours(0, 0, 0, 0);
    if (workdays <= 0) return deadline;
    let daysCounted = 0;
    while (daysCounted < workdays) {
      const isPublicHoliday = holidays.some(h => isSameDay(h, deadline));
      if (!isWeekend(deadline) && !isPublicHoliday) {
        daysCounted++;
      }
      if (daysCounted < workdays) {
        deadline = addDays(deadline, 1);
      }
    }
    return deadline;
  }, [holidays]);
  
  useEffect(() => {
      async function loadHolidays() {
          try {
            const year = new Date().getFullYear();
            const response = await fetch(`https://api-harilibur.vercel.app/api?year=${year}`);
            const holidayData: { holiday_date: string }[] = await response.json();
            setHolidays(holidayData.map(h => startOfDay(new Date(h.holiday_date))));
          } catch (error) {
            console.error("Gagal mengambil hari libur:", error);
          }
      }
      loadHolidays();
  }, [])


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
            durasi: data.durasi || 14,
            no_nd: data.no_nd || '',
            inisiator: data.inisiator || '',
            pics: picArray,
            assigned_by: data.assigned_by || '',
            remarks: data.remarks || '',
            progress_percentage: data.progress_percentage || 0,
            is_data_complete: data.is_data_complete ?? true,
            sisa_durasi_saat_pause: data.sisa_durasi_saat_pause,
            tanggal_resume: data.tanggal_resume,
        });
        setInitialTaskState(data);

        if (data.updated_at) {
          const date = new Date(data.updated_at);
          const formattedDate = date.toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
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
    const isCheckbox = e.target.type === 'checkbox';
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: isCheckbox ? checked : (type === 'number' ? parseInt(value, 10) || 0 : value),
    }));
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
  

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  
  if (!initialTaskState) {
    alert("Data tugas awal tidak ditemukan, tidak bisa menyimpan.");
    return;
  }
  
  const initialCountdown = location.state?.initialCountdown;
  setIsSubmitting(true);

  const today = startOfDay(new Date());
  const todayISO = today.toISOString().split('T')[0];

  const form = e.currentTarget;
  const formDataObj = new FormData(form);
  // Ambil nilai dari kedua date picker manual
  const manualPauseDateFromForm = formDataObj.get('tanggal_pause_manual') as string;
  const manualResumeDateFromForm = formDataObj.get('tanggal_resume_manual') as string;

  const updatePayload: any = {
    judul: formDataObj.get('judul'),
    id_risk: Number(formDataObj.get('id_risk')),
    rmp: Number(formDataObj.get('rmp')),
    no_nd: formDataObj.get('no_nd'),
    inisiator: formDataObj.get('inisiator'),
    pic: formData.pics.filter(Boolean).join(', '),    
    assigned_by: formDataObj.get('assigned_by'),
    remarks: formDataObj.get('remarks'),
    progress_percentage: Number(formDataObj.get('progress_percentage')),
    durasi: Number(formDataObj.get('durasi')), 
    tanggal_terbit: formDataObj.get('tanggal_terbit'),
  };

  const isDataComplete = formDataObj.get('is_data_complete') === 'on';
  const isPausing = initialTaskState.is_data_complete && !isDataComplete;
  const isResuming = !initialTaskState.is_data_complete && isDataComplete;

  if (isPausing) {
    let sisaDurasiToSave: number;
    let pauseDateToSave: string;

    if (manualPauseDateFromForm) {
      pauseDateToSave = manualPauseDateFromForm;
      const manualPauseDate = startOfDay(new Date(manualPauseDateFromForm + 'T00:00:00'));
      const startDate = startOfDay(new Date(initialTaskState.tanggal_terbit));
      const deadline = calculateDeadline(startDate, initialTaskState.durasi);
      sisaDurasiToSave = calculateWorkingDaysBetween(addDays(manualPauseDate, 1), deadline);
    } else {
      pauseDateToSave = todayISO;
      sisaDurasiToSave = initialCountdown ?? 0;
    }
    
    updatePayload.is_data_complete = false;
    updatePayload.sisa_durasi_saat_pause = sisaDurasiToSave;
    updatePayload.tanggal_pause = pauseDateToSave;
    updatePayload.tanggal_resume = null;

  } else if (isResuming) {
    updatePayload.is_data_complete = true;
    
    // --- PERUBAHAN LOGIKA RESUME ---
    // Gunakan tanggal resume manual jika ada, jika tidak, baru gunakan tanggal hari ini.
    const resumeDateToSave = manualResumeDateFromForm ? manualResumeDateFromForm : todayISO;
    updatePayload.tanggal_resume = resumeDateToSave;
  
  } else {
    updatePayload.is_data_complete = isDataComplete;
  }
  
  const { error } = await supabase
    .from('tasks_master')
    .update(updatePayload)
    .eq('id', Number(taskId));

  if (error) {
    console.error("Error updating:", error);
    alert('Gagal menyimpan perubahan!');
  } else {
    navigate('/ongoing', { 
      state: { 
        message: 'Perubahan berhasil disimpan!', 
        type: 'info',
        highlightedTaskId: parseInt(taskId!) 
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

  {formData.is_data_complete && initialTaskState?.tanggal_pause && (
  <div className="grid grid-cols-3 items-center gap-4 bg-green-50 p-3 rounded-md border border-green-200 ring-2 ring-green-100">
    <label htmlFor="tanggal_resume_manual" className="text-right font-semibold text-green-800">Tanggal Berakhir Pause</label>
    <div className="col-span-2">
      <input
        type="date"
        id="tanggal_resume_manual"
        name="tanggal_resume_manual" // <-- Atribut name penting!
        value={tanggalResumeManual}
        onChange={(e) => setTanggalResumeManual(e.target.value)}
        className="border p-2 rounded-md"
      />
      <p className="text-xs text-gray-500 mt-1">
        Kosongkan jika tanggal resume adalah hari ini.
      </p>
    </div>
  </div>
)}


  {/* -- INPUT TANGGAL PAUSE MANUAL -- */}
{!formData.is_data_complete && (
  <div className="grid grid-cols-3 items-center gap-4 bg-yellow-50 p-3 rounded-md border border-yellow-200 ring-2 ring-yellow-100">
    <label htmlFor="tanggal_pause_manual" className="text-right font-semibold text-amber-800">Tanggal Mulai Pause</label>
    <div className="col-span-2">
      <input
  type="date"
  id="tanggal_pause_manual"
  name="tanggal_pause_manual" // <--- TAMBAHKAN BARIS INI
  value={tanggalPauseManual}
  onChange={(e) => setTanggalPauseManual(e.target.value)}
  className="border p-2 rounded-md"
/>
      <p className="text-xs text-gray-500 mt-1">
        Kosongkan jika tanggal pause adalah hari ini.
      </p>
    </div>
  </div>
)}
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