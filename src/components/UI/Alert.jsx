import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useState, useEffect } from 'react';

const Alert = ({ 
  type = 'success', 
  title, 
  message, 
  onClose, 
  autoClose = 5000,
  showProgress = true 
}) => {
  const [progress, setProgress] = useState(100);

  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      borderColor: 'border-green-200',
      progressColor: 'bg-green-500'
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
      borderColor: 'border-red-200',
      progressColor: 'bg-red-500'
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      borderColor: 'border-yellow-200',
      progressColor: 'bg-yellow-500'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      progressColor: 'bg-blue-500'
    }
  };

  const config = typeConfig[type];
  const IconComponent = config.icon;

  useEffect(() => {
    if (!autoClose) return;

    const interval = 50;
    const totalSteps = autoClose / interval;
    const step = 100 / totalSteps;

    const timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - step;
        if (newProgress <= 0) {
          clearInterval(timer);
          setTimeout(() => {
            onClose();
          }, 0);
          return 0;
        }
        return newProgress;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [autoClose, onClose]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[60] animate-fadeIn">
      <div className={`bg-white rounded-2xl shadow-2xl border ${config.borderColor} p-6 max-w-sm transform transition-all duration-300 hover:scale-105`}>
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 ${config.bgColor} rounded-xl flex items-center justify-center`}>
            <IconComponent className={`w-6 h-6 ${config.textColor}`} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-red-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        {showProgress && autoClose && (
          <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
            <div 
              className={`${config.progressColor} h-1 rounded-full transition-all duration-100`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;