import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  Building2,
  Calendar,
  FileText,
  CheckCircle2,
  RotateCcw,
  AlertCircle,
  Paperclip,
  Clock,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { ConversationStatusBadge } from '../../components/chat/ConversationStatusBadge';
import { ResolveConversationSheet } from '../../components/chat/ResolveConversationSheet';
import { ReopenConversationSheet } from '../../components/chat/ReopenConversationSheet';
import {
  useCareChatConversation,
  useCareChatMessages,
  useResolveConversationMutation,
  useReopenConversationMutation,
} from '../../hooks/useCareChatQueries';
import { format } from 'date-fns';

export const CareChatDetailsPage: React.FC = () => {
  const { conversationId = '' } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();

  const { data: conversation } = useCareChatConversation(conversationId);
  const { data: messages = [] } = useCareChatMessages(conversationId);

  const resolveMutation = useResolveConversationMutation(conversationId);
  const reopenMutation = useReopenConversationMutation(conversationId);

  const [isResolveSheetOpen, setIsResolveSheetOpen] = useState(false);
  const [isReopenSheetOpen, setIsReopenSheetOpen] = useState(false);

  if (!conversation) {
    return (
      <ScreenContainer>
        <PageHeader title="Conversation Details" showBack={true} />
        <div className="p-8 text-center text-[#708188]">
          Conversation not found.
        </div>
      </ScreenContainer>
    );
  }

  // Collect all uploaded attachments from messages
  const allAttachments = messages.flatMap((m) => m.attachments || []);

  const formattedCreated = (() => {
    try {
      return format(new Date(conversation.createdAt), 'PPP p');
    } catch {
      return conversation.createdAt;
    }
  })();

  const isClosedOrResolved =
    conversation.status === 'RESOLVED' || conversation.status === 'CLOSED';

  return (
    <ScreenContainer>
      <PageHeader
        title="Conversation Details"
        subtitle={`ID: #${conversation.id}`}
        showBack={true}
      />

      <div className="p-4 space-y-4 max-w-[480px] mx-auto pb-24">
        {/* Status Card Header */}
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs text-[#708188] block">Subject</span>
              <h3 className="font-bold text-sm text-[#16343C]">{conversation.subject}</h3>
            </div>
            <ConversationStatusBadge status={conversation.status} />
          </div>

          <div className="text-xs text-[#708188] flex items-center gap-1.5 pt-2 border-t border-[#F1F5F9]">
            <Clock className="w-3.5 h-3.5 text-[#0B6875]" /> Created on: {formattedCreated}
          </div>
        </div>

        {/* Patient & Care Team Info Card */}
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl space-y-3 shadow-xs">
          <h4 className="font-bold text-xs uppercase tracking-wider text-[#708188]">
            Participants
          </h4>

          <div className="flex items-center justify-between text-xs py-1 border-b border-[#F1F5F9]">
            <span className="text-[#708188] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#0B6875]" /> Patient:
            </span>
            <span className="font-bold text-[#16343C]">
              {conversation.patientName}{' '}
              {conversation.relationship ? `(${conversation.relationship})` : ''}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-b border-[#F1F5F9]">
            <span className="text-[#708188] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#0B6875]" /> Department:
            </span>
            <span className="font-bold text-[#16343C]">{conversation.departmentName}</span>
          </div>

          {conversation.assignedAdmin && (
            <div className="flex items-center justify-between text-xs py-1 border-b border-[#F1F5F9]">
              <span className="text-[#708188]">🎧 Care Coordinator:</span>
              <span className="font-medium text-[#16343C]">
                {conversation.assignedAdmin.name}
              </span>
            </div>
          )}

          {conversation.assignedDoctor && (
            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-[#708188]">👨‍⚕️ Assigned Doctor:</span>
              <span className="font-bold text-[#0B6875]">
                {conversation.assignedDoctor.name}
              </span>
            </div>
          )}
        </div>

        {/* Linked Records Section */}
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl space-y-3 shadow-xs">
          <h4 className="font-bold text-xs uppercase tracking-wider text-[#708188]">
            Related Records
          </h4>

          {conversation.relatedAppointmentId ? (
            <div
              onClick={() => navigate(`/appointments/${conversation.relatedAppointmentId}`)}
              className="p-3 rounded-xl bg-[#F0F7F7] border border-[#0B6875]/30 flex items-center justify-between cursor-pointer hover:bg-[#E0F0F0] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#0B6875]" />
                <div>
                  <div className="font-bold text-xs text-[#16343C]">OPD Appointment</div>
                  <div className="text-[10px] text-[#708188]">
                    Ref: #{conversation.relatedAppointmentId}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#0B6875]" />
            </div>
          ) : (
            <p className="text-xs text-[#94A3B8]">No related appointment linked</p>
          )}

          {conversation.relatedPrescriptionId && (
            <div
              onClick={() => navigate(`/prescriptions/${conversation.relatedPrescriptionId}`)}
              className="p-3 rounded-xl bg-[#F0F7F7] border border-[#0B6875]/30 flex items-center justify-between cursor-pointer hover:bg-[#E0F0F0] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-[#0B6875]" />
                <div>
                  <div className="font-bold text-xs text-[#16343C]">Prescription Record</div>
                  <div className="text-[10px] text-[#708188]">
                    Ref: #{conversation.relatedPrescriptionId}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#0B6875]" />
            </div>
          )}
        </div>

        {/* Shared Attachments Section */}
        {allAttachments.length > 0 && (
          <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl space-y-3 shadow-xs">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#708188] flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 text-[#0B6875]" /> Shared Attachments ({allAttachments.length})
            </h4>
            <div className="space-y-2">
              {allAttachments.map((att) => (
                <div
                  key={att.id}
                  className="p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-[#16343C] truncate max-w-[260px]">
                    {att.filename}
                  </span>
                  <a
                    href={att.secureUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#0B6875] font-bold text-[11px] hover:underline"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions Section */}
        <div className="space-y-2.5 pt-2">
          {!isClosedOrResolved ? (
            <button
              onClick={() => setIsResolveSheetOpen(true)}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all min-h-[48px]"
            >
              <CheckCircle2 className="w-4 h-4" /> Mark Query Resolved
            </button>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => setIsReopenSheetOpen(true)}
                className="w-full py-3.5 rounded-2xl bg-[#0B6875] hover:bg-[#09545E] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all min-h-[48px]"
              >
                <RotateCcw className="w-4 h-4" /> Reopen Conversation
              </button>

              <button
                onClick={() => navigate('/chat/new')}
                className="w-full py-3.5 rounded-2xl border border-[#0B6875] text-[#0B6875] bg-white hover:bg-[#F0F7F7] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[48px]"
              >
                <PlusCircle className="w-4 h-4" /> Start a New Chat
              </button>
            </div>
          )}

          <button
            onClick={() => navigate('/support/report-issue')}
            className="w-full py-3 rounded-2xl bg-[#F1F5F9] text-[#475569] font-semibold text-xs hover:bg-[#E2E8F0] flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
          >
            <AlertCircle className="w-3.5 h-3.5" /> Report a problem with this chat
          </button>
        </div>
      </div>

      <ResolveConversationSheet
        isOpen={isResolveSheetOpen}
        onClose={() => setIsResolveSheetOpen(false)}
        onConfirmResolve={async (rating, note) => {
          await resolveMutation.mutateAsync({ rating, note });
          setIsResolveSheetOpen(false);
        }}
        isLoading={resolveMutation.isPending}
      />

      <ReopenConversationSheet
        isOpen={isReopenSheetOpen}
        onClose={() => setIsReopenSheetOpen(false)}
        onConfirmReopen={async (reason) => {
          await reopenMutation.mutateAsync(reason);
          setIsReopenSheetOpen(false);
        }}
        isLoading={reopenMutation.isPending}
      />
    </ScreenContainer>
  );
};
