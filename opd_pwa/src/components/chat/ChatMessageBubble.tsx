import React from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck, Clock, AlertCircle, FileText, Download } from 'lucide-react';
import { Message } from '../../types/careChat';

interface Props {
  message: Message;
  onRetry?: (msgId: string) => void;
}

export const ChatMessageBubble: React.FC<Props> = ({ message, onRetry }) => {
  const isPatient = message.senderType === 'PATIENT';

  const formattedTime = (() => {
    try {
      return format(new Date(message.createdAt), 'h:mm a');
    } catch {
      return '';
    }
  })();

  const renderDeliveryStatus = () => {
    if (!isPatient) return null;

    switch (message.deliveryStatus) {
      case 'QUEUED':
        return (
          <span className="flex items-center gap-1 text-[10px] text-amber-200" title="Queued offline">
            <Clock className="w-3 h-3" /> Offline
          </span>
        );
      case 'SENDING':
        return (
          <span className="flex items-center gap-1 text-[10px] text-teal-100" title="Sending...">
            <Clock className="w-3 h-3 animate-spin" />
          </span>
        );
      case 'SENT':
        return (
          <span title="Sent">
            <Check className="w-3.5 h-3.5 text-teal-100" />
          </span>
        );
      case 'DELIVERED':
        return (
          <span title="Delivered">
            <CheckCheck className="w-3.5 h-3.5 text-teal-100" />
          </span>
        );
      case 'SEEN':
        return (
          <span title="Seen by Care Team">
            <CheckCheck className="w-3.5 h-3.5 text-teal-300" />
          </span>
        );

      case 'FAILED':
        return (
          <button
            onClick={() => onRetry?.(message.id)}
            className="flex items-center gap-1 text-[10px] text-rose-300 underline font-semibold cursor-pointer"
            title="Failed to send. Tap to retry."
          >
            <AlertCircle className="w-3 h-3" /> Retry
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex flex-col mb-3 ${isPatient ? 'items-end' : 'items-start'}`}>
      {!isPatient && (
        <div className="flex items-center gap-1.5 mb-1 px-1">
          {message.senderAvatarUrl ? (
            <img
              src={message.senderAvatarUrl}
              alt={message.senderName}
              className="w-5 h-5 rounded-full object-cover border border-[#0B6875]/30"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-[#0B6875] text-white text-[10px] font-bold flex items-center justify-center">
              {message.senderName.charAt(0)}
            </div>
          )}
          <span className="text-xs font-bold text-[#16343C]">{message.senderName}</span>
          {message.senderRole && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                message.senderType === 'DOCTOR'
                  ? 'bg-emerald-100 text-emerald-800 font-semibold'
                  : 'bg-teal-50 text-teal-700'
              }`}
            >
              {message.senderRole}
            </span>
          )}
        </div>
      )}

      <div
        className={`max-w-[82%] sm:max-w-[75%] rounded-2xl px-3.5 py-2.5 shadow-xs transition-all ${
          isPatient
            ? 'bg-[#0B6875] text-white rounded-br-xs'
            : 'bg-white border border-[#E2E8F0] text-[#16343C] rounded-bl-xs'
        }`}
      >
        {/* Attachment rendering */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mb-2 space-y-1.5">
            {message.attachments.map((att) => (
              <div
                key={att.id}
                className={`p-2 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                  isPatient
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#16343C]'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span className="truncate font-medium">{att.filename}</span>
                </div>
                {att.secureUrl && (
                  <a
                    href={att.secureUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 hover:bg-black/10 rounded transition-colors shrink-0"
                    title="View attachment"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Text body */}
        <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.body}
        </p>

        {/* Footer timestamp & status */}
        <div
          className={`flex items-center justify-end gap-1.5 mt-1 text-[10px] ${
            isPatient ? 'text-teal-100' : 'text-[#94A3B8]'
          }`}
        >
          <span>{formattedTime}</span>
          {renderDeliveryStatus()}
        </div>
      </div>
    </div>
  );
};
