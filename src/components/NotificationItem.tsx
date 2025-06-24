// src/components/NotificationItem.tsx
import type { Notification } from '@/pages/DashboardPage'; // Menggunakan path alias

const urgencyStyles = {
  high: 'bg-red-100 border-red-200',
  medium: 'bg-yellow-100 border-yellow-200',
};

export default function NotificationItem({ notification }: { notification: Notification }) {
  const isUnread = !notification.read;
  const bgColor = isUnread ? urgencyStyles[notification.urgency] : 'bg-white';

  return (
    <div className={`p-4 rounded-lg border ${bgColor}`}>
      <p className="font-bold text-gray-800">{notification.title}</p>
      <p className="text-sm text-gray-600 mt-1">PIC : {notification.pic}</p>
      <div className="flex items-center text-sm text-blue-600 font-semibold mt-2">
        <div className={`w-1.5 h-4 mr-2 ${isUnread ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
        <span>{notification.remaining}</span>
      </div>
      <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
    </div>
  );
}