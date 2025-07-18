// src/pages/DashboardPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { addDays, eachDayOfInterval, isSameDay, isWeekend, startOfDay } from 'date-fns';
import StatCard from '../components/StatCard';
import CalendarWidget from '../components/CalendarWidget';
import StatusPieChart from '../components/StatusPieChart';
import TaskListModal from '../components/TaskListModal';
import { useNavigate } from 'react-router-dom';
import YearScroller from '../components/YearScroller'; // Impor komponen baru
import type { Database } from '../database.types';

export type Notification = {
  id: number;
  title: string;
  pic: string;
  remaining: string;
  time: string;
  urgency: 'high' | 'medium';
  read: boolean;
};

type Task = Database['public']['Tables']['tasks_master']['Row'];
interface ChartData { overdue: number; zeroToTwoDays: number; threeToFiveDays: number; sixToNineDays: number; totalOngoing: number; }
type ChartCategory = 'overdue' | 'zeroToTwoDays' | 'threeToFiveDays' | 'sixToNineDays';

export default function DashboardPage() {
  const [stats, setStats] = useState([
    { title: 'PAUSE', value: 0 },
    { title: 'KR ONGOING', value: 0 },
    { title: 'KR TERBIT', value: 0 },
    { title: 'TOTAL MITIGASI', value: 0 },
  ]);
  const [chartData, setChartData] = useState<ChartData>({ overdue: 0, zeroToTwoDays: 0, threeToFiveDays: 0, sixToNineDays: 0, totalOngoing: 0 });
  const [allOngoingTasks, setAllOngoingTasks] = useState<Task[]>([]);
  const [holidays, setHolidays] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [modalTitle, setModalTitle] = useState('');
  
  const navigate = useNavigate();

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

  const calculateWorkingDaysBetween = useCallback((start: Date, end: Date): number => {
    if (start > end) return 0;
    let count = 0;
    eachDayOfInterval({ start, end }).forEach(day => {
        const isPublicHoliday = holidays.some(h => isSameDay(h, day));
        if (!isWeekend(day) && !isPublicHoliday) count++;
    });
    return count;
  }, [holidays]);
  
  const getRemainingWorkingDays = useCallback((task: Task) => {
    if (!task.tanggal_terbit || !task.durasi || task.is_data_complete === false) return null;
    const startDate = startOfDay(new Date(task.tanggal_terbit));
    const deadline = calculateDeadline(startDate, task.durasi);
    const today = startOfDay(new Date());
    
    if (isSameDay(today, deadline)) return 0;
    if (today > deadline) {
      return -Math.max(1, calculateWorkingDaysBetween(addDays(deadline, 1), today));
    }
    return calculateWorkingDaysBetween(addDays(today, 1), deadline);
  }, [calculateDeadline, calculateWorkingDaysBetween]);

  const getCountdown = useCallback((task: Task): { text: string; colorClass: string } => {
    if (task.is_data_complete === false) {
      return { text: "Pause", colorClass: 'text-blue-500' };
    }
    const daysDiff = getRemainingWorkingDays(task);
    if (daysDiff === null) return { text: "-", colorClass: 'text-gray-700' };
    
    let colorClass = 'text-gray-700';
    if (daysDiff < 0) {
      colorClass = 'text-red-800';
      return { text: 'Lewat SLA', colorClass };
    }
    if (daysDiff === 0) {
      colorClass = 'text-red-600';
      return { text: 'Hari Ini', colorClass };
    }
    if (daysDiff <= 2) colorClass = 'text-red-600';
    else if (daysDiff <= 5) colorClass = 'text-orange-500';
    else if (daysDiff <= 9) colorClass = 'text-yellow-500';

    return { text: `${daysDiff} hari lagi`, colorClass };
  }, [getRemainingWorkingDays]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const year = selectedYear;
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      try {
        const response = await fetch(`https://api-harilibur.vercel.app/api?year=${year}`);
        const holidayData: { holiday_date: string }[] = await response.json();
        setHolidays(holidayData.map(holiday => startOfDay(new Date(holiday.holiday_date))));
      } catch (error) { console.error(error); }
      
      const { data: doneTasks, error: doneError } = await supabase
        .from('tasks_master').select('rmp', { count: 'exact' })
        .eq('is_completed', true).gte('tanggal_terbit', startDate).lte('tanggal_terbit', endDate);

      const { data: ongoingTasks, error: ongoingError } = await supabase
        .from('tasks_master').select('*')
        .eq('is_completed', false).gte('tanggal_terbit', startDate).lte('tanggal_terbit', endDate);
      
      if (ongoingError) console.error("Error fetching ongoing tasks:", ongoingError);
      else if (ongoingTasks) setAllOngoingTasks(ongoingTasks);

      if (doneError) console.error("Error fetching done tasks:", doneError);
      
      const pausedCount = ongoingTasks?.filter(task => task.is_data_complete === false).length || 0;
      const activeOngoingCount = (ongoingTasks?.length || 0) - pausedCount;

      setStats([
        { title: 'PAUSE', value: pausedCount },
        { title: 'KR ONGOING', value: activeOngoingCount },
        { title: 'KR TERBIT', value: doneTasks?.length || 0 },
        { title: 'TOTAL MITIGASI', value: doneTasks?.reduce((sum, task) => sum + (task.rmp || 0), 0) || 0 },
      ]);
      
      setLoading(false);
    }
    fetchData();
  }, [selectedYear]);

  useEffect(() => {
    if (loading) return;
    let counts = { overdue: 0, zeroToTwoDays: 0, threeToFiveDays: 0, sixToNineDays: 0 };
    const activeTasks = allOngoingTasks.filter(task => task.is_data_complete !== false);
    
    activeTasks.forEach(task => {
      const remainingDays = getRemainingWorkingDays(task);
      if (remainingDays === null) return;
      if (remainingDays < 0) counts.overdue++;
      else if (remainingDays <= 2) counts.zeroToTwoDays++;
      else if (remainingDays <= 5) counts.threeToFiveDays++;
      else if (remainingDays <= 9) counts.sixToNineDays++;
    });
    setChartData({ ...counts, totalOngoing: activeTasks.length });
  }, [allOngoingTasks, loading, getRemainingWorkingDays]);

  const handleChartClick = useCallback((category: ChartCategory, title: string) => {
    const activeTasks = allOngoingTasks.filter(task => task.is_data_complete !== false);
    const filteredTasks = activeTasks.filter(task => {
      const remainingDays = getRemainingWorkingDays(task);
      if (remainingDays === null) return false;
      switch (category) {
        case 'overdue': return remainingDays < 0;
        case 'zeroToTwoDays': return remainingDays >= 0 && remainingDays <= 2;
        case 'threeToFiveDays': return remainingDays >= 3 && remainingDays <= 5;
        case 'sixToNineDays': return remainingDays >= 6 && remainingDays <= 9;
        default: return false;
      }
    });
    setSelectedTasks(filteredTasks);
    setModalTitle(title);
    setIsModalOpen(true);
  }, [allOngoingTasks, getRemainingWorkingDays]);
  
  const handlePauseCardClick = () => {
    const pausedTasks = allOngoingTasks.filter(task => task.is_data_complete === false);
    setSelectedTasks(pausedTasks);
    setModalTitle("Daftar Tugas yang Di-pause");
    setIsModalOpen(true);
  };

  const handleStatCardClick = (title: string) => {
    switch (title) {
      case 'KR ONGOING':
        navigate('/ongoing');
        break;
      case 'KR TERBIT':
        navigate('/done');
        break;
      case 'TOTAL MITIGASI':
        navigate('/done', { state: { highlightColumn: 'rmp' } });
        break;
      default:
        break;
    }
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  return (
    <>
      <div className="flex min-h-screen bg-gray-50 font-sans">
        <main className="flex-1 p-8">
          <header className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">Reports</h1>
          </header>

          <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            {loading ? <p>Memuat data chart...</p> : (
              <>
                <div onClick={() => handleChartClick('overdue', 'Tugas Lewat SLA')} className="cursor-pointer"><StatusPieChart count={chartData.overdue} total={chartData.totalOngoing} color="#A40E26" title="Lewat SLA" /></div>
                <div onClick={() => handleChartClick('zeroToTwoDays', 'Sisa Waktu 0-2 Hari')} className="cursor-pointer"><StatusPieChart count={chartData.zeroToTwoDays} total={chartData.totalOngoing} color="#DC3545" title="Sisa Waktu 0-2 Hari" /></div>
                <div onClick={() => handleChartClick('threeToFiveDays', 'Sisa Waktu 3-5 Hari')} className="cursor-pointer"><StatusPieChart count={chartData.threeToFiveDays} total={chartData.totalOngoing} color="#FD7E14" title="Sisa Waktu 3-5 Hari" /></div>
                <div onClick={() => handleChartClick('sixToNineDays', 'Sisa Waktu 6-9 Hari')} className="cursor-pointer"><StatusPieChart count={chartData.sixToNineDays} total={chartData.totalOngoing} color="#FFC107" title="Sisa Waktu 6-9 Hari" /></div>
              </>
            )}
          </div>
          
          <div className="flex space-x-6 items-center">
            <div className="flex-none">
              <YearScroller selectedYear={selectedYear} onYearChange={handleYearChange} />
            </div>
            <div className="flex-grow grid grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const isClickable = ['KR ONGOING', 'KR TERBIT', 'TOTAL MITIGASI', 'PAUSE'].includes(stat.title);
                const handleClick = () => {
                  if (stat.title === 'PAUSE') {
                    handlePauseCardClick();
                  } else {
                    handleStatCardClick(stat.title);
                  }
                };
                return (
                  <div key={index} className={isClickable ? 'cursor-pointer' : ''} onClick={isClickable ? handleClick : undefined}>
                    <StatCard title={stat.title} value={stat.value} />
                  </div>
                );
              })}
            </div>
          </div>
        </main>
        <aside className="w-96 border-l bg-white p-6">
          <CalendarWidget />
        </aside>
      </div>

      <TaskListModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} tasks={selectedTasks} title={modalTitle} getCountdown={getCountdown} />
    </>
  );
}