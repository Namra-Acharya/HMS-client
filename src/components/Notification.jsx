import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, InfoIcon, AlertTriangle, X } from 'lucide-react';
import useHMSStore from '../store/hmsStore';

function Notification() {
  const { notification, setNotification } = useHMSStore();

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification, setNotification]);

  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-600" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-yellow-600" />;
      case 'info':
        return <InfoIcon size={20} className="text-blue-600" />;
      default:
        return <InfoIcon size={20} className="text-blue-600" />;
    }
  };

  const bgColor = {
    success: 'bg-green-50 border-green-300',
    error: 'bg-red-50 border-red-300',
    warning: 'bg-yellow-50 border-yellow-300',
    info: 'bg-blue-50 border-blue-300'
  }[notification.type] || 'bg-blue-50 border-blue-300';

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`${bgColor} border rounded-lg shadow-lg p-4 flex items-start gap-3 max-w-md`}>
        {getIcon()}
        <div className="flex-1">
          {notification.title && <h3 className="font-semibold text-sm mb-1">{notification.title}</h3>}
          <p className="text-sm">{notification.message}</p>
        </div>
        <button onClick={() => setNotification(null)} className="text-gray-500 hover:text-gray-700 p-1">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

export default Notification;
