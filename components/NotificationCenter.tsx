
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { CheckCircleIcon } from './icons';
import { Notification, View } from '../types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  setView: (view: View) => void;
}

function timeSince(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
}


const NotificationItem: React.FC<{ notification: Notification; onNotificationClick: (notification: Notification) => void }> = ({ notification, onNotificationClick }) => {
    const { state } = useAppContext();
    const candidate = state.candidates.find(c => c.id === notification.candidateId);
    
    const itemClasses = notification.read
        ? "p-3 bg-white hover:bg-slate-50 cursor-pointer rounded-lg transition-colors"
        : "p-3 bg-blue-50 hover:bg-blue-100 cursor-pointer rounded-lg transition-colors border-l-4 border-brand-accent";

    return (
        <li
            onClick={() => onNotificationClick(notification)}
            className={itemClasses}
        >
            <div className="flex items-start">
                {candidate && (
                     <img className="h-8 w-8 rounded-full mr-3 mt-1 bg-slate-200 object-contain p-1" src={candidate.avatarUrl} alt={candidate.name} />
                )}
                {!candidate && (
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                        <CheckCircleIcon className="w-5 h-5 text-slate-500" />
                    </div>
                )}
                <div className="flex-1">
                    <p className={`text-sm text-brand-charcoal ${!notification.read ? 'font-semibold' : ''}`}>{notification.message}</p>
                    <p className="text-xs text-brand-gray-dark mt-0.5">{timeSince(notification.createdAt)}</p>
                </div>
                {!notification.read && (
                    <div className="w-2.5 h-2.5 bg-brand-accent rounded-full self-center ml-2 flex-shrink-0 animate-pulse"></div>
                )}
            </div>
        </li>
    )
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose, setView }) => {
  const { state, dispatch } = useAppContext();
  const { notifications, candidates } = state;

  const sortedNotifications = [...notifications].sort((a, b) => {
      // Sort by read status (unread first), then by date
      if (a.read === b.read) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return a.read ? 1 : -1;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;
  
  const handleNotificationClick = (notification: Notification) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notification.id });
    
    if (notification.candidateId) {
        const candidate = candidates.find(c => c.id === notification.candidateId);
        if (candidate) {
            dispatch({ type: 'SELECT_CANDIDATE', payload: candidate });
        }
    }

    if (notification.actionLink) {
        setView(notification.actionLink);
    } else if (notification.candidateId) {
         setView('candidate-detail');
    }

    onClose();
  }

  const handleMarkAllRead = (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' });
  }

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-2xl border border-slate-200 z-10">
        <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-lg">
            <h3 className="font-semibold text-brand-charcoal">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs font-medium text-brand-accent hover:text-brand-accent/80 hover:underline">Mark all as read</button>
            )}
        </div>
        {sortedNotifications.length > 0 ? (
            <ul className="py-2 px-2 max-h-96 overflow-y-auto space-y-1">
                {sortedNotifications.map(notification => (
                    <NotificationItem key={notification.id} notification={notification} onNotificationClick={handleNotificationClick} />
                ))}
            </ul>
        ) : (
            <div className="p-8 text-center text-sm text-brand-gray-dark">
                <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                    <CheckCircleIcon className="w-6 h-6 text-slate-400" />
                </div>
                You have no notifications.
            </div>
        )}
    </div>
  );
};

export default NotificationCenter;
