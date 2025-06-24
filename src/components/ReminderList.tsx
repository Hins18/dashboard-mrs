// src/components/ReminderList.tsx
import { Bell, AlertCircle } from 'lucide-react';

export default function ReminderList() {
  const reminders = [
    { text: 'Monitoring of LMR Corporate Risk Profile' },
    { text: 'GRC Assignment And Approval of PLN...' },
    { text: 'GRC review request for green attribute...' },
  ];

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">Reminder</h2>
        <Bell size={20} className="text-gray-500" />
      </div>
      <div className="space-y-3">
        {reminders.map((item, index) => (
          <div key={index} className="flex items-start text-sm">
            <AlertCircle
              size={18}
              className="mr-3 mt-0.5 flex-shrink-0 text-orange-500"
            />
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
