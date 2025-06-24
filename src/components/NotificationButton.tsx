// src/components/NotificationButton.tsx
import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bell, X } from 'lucide-react';
import NotificationItem from './NotificationItem';
import { Separator } from '@/components/ui/separator';
import type { Notification } from '@/pages/DashboardPage';

interface NotificationButtonProps {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

export default function NotificationButton({
  notifications,
  setNotifications,
}: NotificationButtonProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllAsRead = () => {
    const readNotifications = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(readNotifications);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="mr-6 w-80" align="end">
        <div className="p-2">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-bold">
              Notifications{' '}
              {unreadCount > 0 && (
                <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </Button>
            )}
            {/* Tombol close sudah disediakan oleh Popover, tapi kita bisa tambahkan jika perlu */}
          </div>
          <Separator className="mb-4" />
          <div className="max-h-96 space-y-3 overflow-y-auto">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
