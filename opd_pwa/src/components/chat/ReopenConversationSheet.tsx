import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { BottomSheet } from '../ui/BottomSheet';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReopen: (reason: string) => void;
  isLoading?: boolean;
}

export const ReopenConversationSheet: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirmReopen,
  isLoading = false,
}) => {
  const [reason, setReason] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirmReopen(reason.trim());
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Reopen Care Chat">
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-teal-50 text-[#0B6875] mx-auto flex items-center justify-center">
            <RotateCcw className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-[#16343C]">Reopen this chat</h3>
          <p className="text-xs text-[#708188]">
            Need further clarification? Reopening will alert your care team to respond again.
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#16343C]">
            Why are you reopening this request? *
          </label>
          <textarea
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="e.g., Medicine doubt is not fully clear, symptoms still persisting..."
            className="w-full p-3 rounded-xl border border-[#E2E8F0] text-xs text-[#16343C] focus:outline-none focus:border-[#0B6875]"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-[#F1F5F9] text-[#475569] font-bold text-xs hover:bg-[#E2E8F0] transition-colors cursor-pointer min-h-[48px]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!reason.trim() || isLoading}
            className="flex-1 py-3 rounded-xl bg-[#0B6875] hover:bg-[#09545E] text-white font-bold text-xs shadow-md transition-all cursor-pointer min-h-[48px] disabled:opacity-50"
          >
            {isLoading ? 'Reopening...' : 'Reopen Chat'}
          </button>
        </div>
      </form>
    </BottomSheet>
  );
};
