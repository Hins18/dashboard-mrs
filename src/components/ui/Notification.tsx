// src/components/ui/Notification.tsx
import { useEffect } from 'react';
import { CheckCircle, Info, X } from 'lucide-react';

interface NotificationProps {
  message: string;
  type: 'success' | 'info';
  onClose: () => void;
}

const notificationStyles = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-400',
    text: 'text-green-800',
    icon: <CheckCircle className="h-6 w-6 text-green-500" />,
    title: 'Success',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-400',
    text: 'text-blue-800',
    icon: <Info className="h-6 w-6 text-blue-500" />,
    title: 'Info',
  },
};

export default function Notification({ message, type, onClose }: NotificationProps) {
  const styles = notificationStyles[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Notifikasi akan hilang setelah 5 detik

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  return (
    <div className={`fixed top-5 right-5 w-full max-w-sm rounded-lg border-l-4 ${styles.border} ${styles.bg} p-4 shadow-lg z-50 animate-slide-in`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {styles.icon}
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-bold ${styles.text}`}>{styles.title}</p>
          <p className={`mt-1 text-sm ${styles.text}`}>{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button onClick={onClose} className="inline-flex rounded-md bg-transparent text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <span className="sr-only">Close</span>
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}