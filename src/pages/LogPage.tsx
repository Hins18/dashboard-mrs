// src/pages/LogPage.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false }); // Urutkan dari yang terbaru

    if (error) {
      console.error('Error fetching logs:', error);
    } else if (data) {
      setLogs(data);
    }
    setLoading(false);
  }

  return (
    <div className="p-8 h-full overflow-y-auto">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Activity</h1>
        <Button variant="outline" className="text-gray-600">
          Sort By: Date
          <ArrowUpDown size={16} className="ml-2" />
        </Button>
      </header>

      {/* List untuk Log Aktivitas */}
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Header List */}
        <div className="grid grid-cols-4 gap-4 p-4 text-xs text-gray-500 font-bold border-b">
          <div className="col-span-1">IP Adress</div>
          <div className="col-span-1">Date</div>
          <div className="col-span-1">Activity</div>
          <div className="col-span-1">Status</div>
        </div>

        {/* Isi List */}
        {loading ? (
          <div className="text-center p-4">Loading...</div>
        ) : (
          logs.map(log => (
            <div key={log.id} className="grid grid-cols-4 gap-4 p-4 border-b last:border-b-0 items-center hover:bg-gray-50">
              <div className="col-span-1 font-mono text-gray-700">{log.ip_address}</div>
              <div className="col-span-1 text-gray-600">{new Date(log.created_at).toLocaleDateString('id-ID')}</div>
              <div className="col-span-1 text-gray-800">
                <span className="font-bold">{log.user_name}</span> {log.action}
              </div>
              <div className="col-span-1">
                <span className={`flex items-center text-sm font-medium px-3 py-1 rounded-full w-fit ${
                  log.status === 'Online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    log.status === 'Online' ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  {log.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}