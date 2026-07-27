import React, { useState } from 'react';
import { CheckCircle2, Star } from 'lucide-react';
import { BottomSheet } from '../ui/BottomSheet';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirmResolve: (rating?: number, note?: string) => void;
  isLoading?: boolean;
}

export const ResolveConversationSheet: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirmResolve,
  isLoading = false,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [note, setNote] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmResolve(rating, note);
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Mark Query Resolved">
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-base text-[#16343C]">Has your issue been resolved?</h3>
          <p className="text-xs text-[#708188]">
            This will mark the conversation resolved. You can reopen it anytime if you need further help.
          </p>
        </div>

        <div className="space-y-1.5 pt-2">
          <label className="text-xs font-semibold text-[#16343C] block text-center">
            How satisfied were you with the care team's response?
          </label>
          <div className="flex items-center justify-center gap-2 py-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 cursor-pointer transition-transform hover:scale-110"
              >
                <Star
                  className={`w-7 h-7 ${
                    star <= rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-[#CBD5E1] fill-transparent'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-[#708188]">
            Optional feedback or comment:
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Thank the care team or add additional feedback..."
            className="w-full p-2.5 rounded-xl border border-[#E2E8F0] text-xs text-[#16343C] focus:outline-none focus:border-[#0B6875]"
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
            disabled={isLoading}
            className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer min-h-[48px] disabled:opacity-50"
          >
            {isLoading ? 'Resolving...' : 'Confirm Resolution'}
          </button>
        </div>
      </form>
    </BottomSheet>
  );
};
