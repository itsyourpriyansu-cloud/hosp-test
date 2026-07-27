import React from 'react';
import { format } from 'date-fns';
import { Message } from '../../types/careChat';

interface Props {
  message: Message;
}

export const SystemMessage: React.FC<Props> = ({ message }) => {
  const formattedTime = (() => {
    try {
      return format(new Date(message.createdAt), 'h:mm a');
    } catch {
      return '';
    }
  })();

  return (
    <div className="flex flex-col items-center my-3 my-2 px-4">
      <div className="bg-[#F1F5F9] border border-[#E2E8F0] text-[#475569] text-[11px] font-medium px-3 py-1.5 rounded-full text-center max-w-[90%] shadow-2xs">
        <span>{message.body}</span>
        {formattedTime && <span className="ml-2 text-[10px] text-[#94A3B8]">({formattedTime})</span>}
      </div>
    </div>
  );
};
