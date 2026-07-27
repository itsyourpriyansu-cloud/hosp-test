import React from 'react';

interface Props {
  onSelect: (text: string) => void;
  disabled?: boolean;
}

export const QuickReplyChips: React.FC<Props> = ({ onSelect, disabled = false }) => {
  const quickReplies = [
    'Thank you!',
    'I still need help',
    'Can I share a report?',
    'Please connect me with the doctor',
    'The issue is resolved',
  ];

  if (disabled) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto px-4 py-2 bg-[#F8FAFC] border-t border-[#E2E8F0] scrollbar-none">
      <span className="text-[11px] font-semibold text-[#708188] shrink-0">Quick reply:</span>
      {quickReplies.map((reply) => (
        <button
          key={reply}
          onClick={() => onSelect(reply)}
          className="text-xs text-[#0B6875] bg-white hover:bg-[#F0F7F7] border border-[#0B6875]/30 active:scale-95 px-3 py-1 rounded-full font-medium shrink-0 transition-all cursor-pointer min-h-[36px]"
        >
          {reply}
        </button>
      ))}
    </div>
  );
};
