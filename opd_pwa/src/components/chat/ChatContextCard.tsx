import React, { useState } from 'react';
import { ChevronDown, ChevronUp, User, Building2, FileText, Calendar, Info } from 'lucide-react';
import { Conversation } from '../../types/careChat';
import { ConversationStatusBadge } from './ConversationStatusBadge';

interface Props {
  conversation: Conversation;
}

export const ChatContextCard: React.FC<Props> = ({ conversation }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-[#F0F7F7] border-b border-[#D0E2E5] px-4 py-2.5 transition-all text-xs text-[#16343C]">
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <Info className="w-4 h-4 text-[#0B6875] shrink-0" />
          <div className="truncate font-medium">
            <span className="font-bold text-[#0B6875]">{conversation.departmentName}</span>
            <span className="mx-1.5 text-[#94A3B8]">|</span>
            <span className="truncate">{conversation.subject}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ConversationStatusBadge status={conversation.status} />
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-[#708188]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#708188]" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-2.5 border-t border-[#D0E2E5]/60 space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#708188] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Patient:
            </span>
            <span className="font-semibold text-[#16343C]">
              {conversation.patientName}{' '}
              {conversation.patientMrn ? `(${conversation.patientMrn})` : ''}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[#708188] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Department:
            </span>
            <span className="font-semibold text-[#16343C]">{conversation.departmentName}</span>
          </div>

          {conversation.assignedDoctor && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#708188] flex items-center gap-1.5">👨‍⚕️ Assigned Doctor:</span>
              <span className="font-semibold text-[#0B6875]">
                {conversation.assignedDoctor.name}
              </span>
            </div>
          )}

          {conversation.assignedAdmin && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#708188] flex items-center gap-1.5">🎧 Care Team:</span>
              <span className="font-medium text-[#16343C]">
                {conversation.assignedAdmin.name} ({conversation.assignedAdmin.role})
              </span>
            </div>
          )}

          {conversation.relatedAppointmentId && (
            <div className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-[#E2E8F0]">
              <span className="text-[#708188] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#0B6875]" /> Ref Appointment:
              </span>
              <span className="font-mono font-medium text-[#0B6875]">
                #{conversation.relatedAppointmentId}
              </span>
            </div>
          )}

          {conversation.relatedPrescriptionId && (
            <div className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-[#E2E8F0]">
              <span className="text-[#708188] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#0B6875]" /> Ref Prescription:
              </span>
              <span className="font-mono font-medium text-[#0B6875]">
                #{conversation.relatedPrescriptionId}
              </span>
            </div>
          )}

          {conversation.relatedReportId && (
            <div className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-[#E2E8F0]">
              <span className="text-[#708188] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#0B6875]" /> Ref Lab Report:
              </span>
              <span className="font-mono font-medium text-[#0B6875]">
                #{conversation.relatedReportId}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
