import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  const { type = 'info', message, title } = toast;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-400 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/30 bg-emerald-950/40 text-emerald-100',
    error: 'border-rose-500/30 bg-rose-950/40 text-rose-100',
    warning: 'border-amber-500/30 bg-amber-950/40 text-amber-100',
    info: 'border-indigo-500/30 bg-indigo-950/40 text-indigo-100',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full animate-bounce-short">
      <div className={`p-4 rounded-xl border backdrop-blur-md shadow-2xl flex items-start justify-between gap-3 ${borders[type]}`}>
        <div className="flex items-start gap-3">
          {icons[type]}
          <div>
            {title && <h4 className="font-bold text-sm leading-tight mb-0.5">{title}</h4>}
            <p className="text-xs leading-relaxed opacity-90">{message}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 opacity-70 hover:opacity-100 transition-opacity">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
