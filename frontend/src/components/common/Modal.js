import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'default', icon: Icon }) => {
  if (!isOpen) return null;

  const sizes = {
    small: 'max-w-md',
    default: 'max-w-lg',
    large: 'max-w-2xl',
    xlarge: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-secondary-900/60 to-secondary-800/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative bg-white rounded-2xl shadow-2xl ${sizes[size]} w-full max-h-[90vh] overflow-hidden animate-fade-in`}>
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-secondary-50 to-white border-b border-secondary-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-md">
                <Icon className="w-5 h-5 text-white" />
              </div>
            )}
            <h3 className="text-lg font-semibold text-secondary-800">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary-100 rounded-xl transition-colors group"
          >
            <X className="w-5 h-5 text-secondary-400 group-hover:text-secondary-600 transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
