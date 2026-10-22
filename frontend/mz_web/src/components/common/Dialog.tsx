import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Dialog({ open, onClose, title, children, maxWidth = 'max-w-md' }: DialogProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[85vh] flex flex-col dialog-animate`}>
        <div className="flex items-center justify-between px-5 h-14 border-b border-[#E4DDCE] flex-shrink-0">
          <h3 className="font-bold text-[#1B2420] text-[15px]">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-[#55605A]"
            aria-label="Close"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
