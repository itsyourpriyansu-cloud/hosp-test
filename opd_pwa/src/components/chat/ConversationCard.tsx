import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { HeartPulse, Stethoscope, Pill, FileSpreadsheet, CalendarCheck, Receipt, Headphones, ChevronRight } from 'lucide-react';
import { Conversation } from '../../types/careChat';
import { ConversationStatusBadge } from './ConversationStatusBadge';

interface Props {
  conversation: Conversation;
  isFeatured?: boolean;
}

export const ConversationCard: React.FC<Props> = ({ conversation, isFeatured = false }) => {
  const navigate = useNavigate();

  const getDepartmentIcon = (deptId: string) => {
    switch (deptId) {
      case 'dept-cardio':
        return HeartPulse;
      case 'dept-genmed':
        return Stethoscope;
      case 'dept-pharma':
        return Pill;
      case 'dept-diag':
        return FileSpreadsheet;
      case 'dept-appts':
        return CalendarCheck;
      case 'dept-billing':
        return Receipt;
      default:
        return Headphones;
    }
  };

  const IconComp = getDepartmentIcon(conversation.departmentId);

  const formattedTime = (() => {
    try {
      const date = new Date(conversation.updatedAt);
      const isToday = new Date().toDateString() === date.toDateString();
      return isToday ? format(date, 'h:mm a') : formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return '';
    }
  })();

  return (
    <div
      onClick={() => navigate(`/chat/${conversation.id}`)}
      className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer active:scale-[0.99] hover:shadow-md ${
        isFeatured
          ? 'border-[#0B6875]/40 bg-gradient-to-r from-[#F0F7F7] via-white to-white ring-1 ring-[#0B6875]/20 shadow-xs'
          : 'border-[#E2E8F0] bg-white hover:border-[#0B6875]/40 shadow-2xs'
      }`}
    >
      <div className="flex items-start justify-between gap-2.5 mb-2.5">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F0F7F7] to-[#E0F0F0] text-[#0B6875] border border-[#C5E1E3] flex items-center justify-center shrink-0 shadow-2xs">
            <IconComp className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-sm text-[#16343C] leading-snug truncate">
              {conversation.departmentName}
            </h4>
            <div className="text-xs text-[#708188] flex items-center gap-1.5 min-w-0 mt-0.5">
              <span className="font-medium truncate">{conversation.patientName}</span>
              {conversation.relationship && (
                <span className="text-[10px] font-semibold bg-[#F1F5F9] text-[#475569] px-2 py-0.5 rounded-full border border-[#E2E8F0] shrink-0 leading-none">
                  {conversation.relationship}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="shrink-0">
          <ConversationStatusBadge status={conversation.status} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 mb-2">
        <h5 className="font-bold text-xs text-[#16343C] truncate leading-tight flex-1">
          {conversation.subject}
        </h5>
        <ChevronRight className="w-4 h-4 text-[#94A3B8] shrink-0" />
      </div>

      {conversation.lastMessage && (
        <div className="text-xs text-[#334155] line-clamp-2 mb-2.5 bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0]/80 leading-relaxed">
          <span className="font-bold text-[#0F172A]">
            {conversation.lastMessage.senderName}:
          </span>{' '}
          {conversation.lastMessage.body}
        </div>
      )}

      <div className="flex items-center justify-between text-[11px] text-[#94A3B8] pt-2 border-t border-[#F1F5F9]">
        <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-2">
          {conversation.assignedDoctor ? (
            <span className="text-[#0B6875] font-bold flex items-center gap-1 truncate">
              👨‍⚕️ <span className="truncate">{conversation.assignedDoctor.name}</span>
            </span>
          ) : conversation.assignedAdmin ? (
            <span className="text-[#475569] font-medium flex items-center gap-1 truncate">
              🎧 <span className="truncate">{conversation.assignedAdmin.name} ({conversation.assignedAdmin.role})</span>
            </span>
          ) : (
            <span className="text-amber-700 font-medium truncate">⏳ Waiting for care team</span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="font-medium text-[#94A3B8]">{formattedTime}</span>
          {conversation.unreadCount > 0 && (
            <span className="bg-[#0B6875] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-2xs">
              {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
