import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs animate-fade-in">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[480px] bg-white rounded-t-[24px] p-5 shadow-2xl z-10 animate-slide-up max-h-[85vh] overflow-y-auto scrollbar-none"
      >
        {/* Handle pill */}
        <div className="w-10 h-1 bg-[#CBD5E1] rounded-full mx-auto mb-3 shrink-0" />

        {title ? (
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2E8F0]">
            <h3 className="text-base font-bold text-[#16343C]">{title}</h3>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full text-[#708188] hover:bg-[#F1F5F9] hover:text-[#16343C] cursor-pointer transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        ) : (
          showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3.5 right-3.5 z-20 p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-white cursor-pointer transition-colors backdrop-blur-xs"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )
        )}

        <div className="safe-padding-bottom">{children}</div>
      </div>
    </div>
  );
};
