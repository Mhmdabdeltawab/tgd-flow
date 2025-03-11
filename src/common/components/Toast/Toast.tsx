import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';
import { ToastType } from '../../hooks/useToast';

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  onClose: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertCircle,
};

const styles = {
  success: 'bg-green-50 text-green-800 border-green-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
};

const iconStyles = {
  success: 'text-green-500',
  error: 'text-red-500',
  info: 'text-blue-500',
  warning: 'text-yellow-500',
};

export default function Toast({ id, type, message, onClose }: ToastProps) {
  const Icon = icons[type];

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <div
      className={`
        flex items-center justify-between w-full max-w-sm px-4 py-3
        rounded-lg shadow-lg border ${styles[type]}
        transform transition-all duration-300 ease-in-out
      `}
      role="alert"
    >
      <div className="flex items-center">
        <Icon className={`w-5 h-5 ${iconStyles[type]} mr-3`} />
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={() => onClose(id)}
        className="ml-4 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}