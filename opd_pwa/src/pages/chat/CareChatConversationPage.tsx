import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Info,
  CheckCircle2,
  RotateCcw,
  Loader2,
  AlertTriangle,
  PhoneCall,
  ShieldAlert,
} from 'lucide-react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { ChatContextCard } from '../../components/chat/ChatContextCard';
import { ChatMessageBubble } from '../../components/chat/ChatMessageBubble';
import { SystemMessage } from '../../components/chat/SystemMessage';
import { ChatComposer } from '../../components/chat/ChatComposer';
import { QuickReplyChips } from '../../components/chat/QuickReplyChips';
import { AttachmentPicker } from '../../components/chat/AttachmentPicker';
import { ResolveConversationSheet } from '../../components/chat/ResolveConversationSheet';
import { ReopenConversationSheet } from '../../components/chat/ReopenConversationSheet';
import { DevChatSimulator } from '../../components/chat/DevChatSimulator';
import { EmergencyHelpSheet } from '../../components/sheets/EmergencyHelpSheet';
import {
  useCareChatConversation,
  useCareChatMessages,
  useSendMessageMutation,
  useResolveConversationMutation,
  useReopenConversationMutation,
} from '../../hooks/useCareChatQueries';
import { Attachment } from '../../types/careChat';
import { careChatService } from '../../services/careChatService';
import { useAuthStore } from '../../store/authStore';

export const CareChatConversationPage: React.FC = () => {
  const { conversationId = '' } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { patient } = useAuthStore();

  const {
    data: conversation,
    isLoading: isConvLoading,
    isError: isConvError,
  } = useCareChatConversation(conversationId);

  const {
    data: messages = [],
    isLoading: isMsgsLoading,
  } = useCareChatMessages(conversationId);

  const sendMutation = useSendMessageMutation(conversationId);
  const resolveMutation = useResolveConversationMutation(conversationId);
  const reopenMutation = useReopenConversationMutation(conversationId);

  // Local state
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isAttachmentPickerOpen, setIsAttachmentPickerOpen] = useState(false);
  const [isResolveSheetOpen, setIsResolveSheetOpen] = useState(false);
  const [isReopenSheetOpen, setIsReopenSheetOpen] = useState(false);
  const [isEmergencySheetOpen, setIsEmergencySheetOpen] = useState(false);
  const [safetyAlertText, setSafetyAlertText] = useState<string | null>(null);

  // Mark unread as read on open
  useEffect(() => {
    if (conversationId) {
      careChatService.markConversationRead(conversationId);
    }
  }, [conversationId]);

  // Scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isReadOnly = conversation?.status === 'CLOSED' || conversation?.status === 'RESOLVED';

  // Safety keywords check
  const checkSafetyKeywords = (text: string): boolean => {
    const dangerous = [
      'chest pain',
      'breathing difficulty',
      'unconscious',
      'heavy bleeding',
      'severe pain',
      'heart attack',
    ];
    const found = dangerous.find((kw) => text.toLowerCase().includes(kw));
    if (found) {
      setSafetyAlertText(
        `Your message contains "${found}". Care Chat is for non-emergency guidance. If you are experiencing a life-threatening emergency, please use Emergency Help immediately.`
      );
      return true;
    }
    return false;
  };

  const handleSendMessage = async (text: string, atts?: Attachment[]) => {
    checkSafetyKeywords(text);

    try {
      await sendMutation.mutateAsync({
        body: text,
        attachments: atts,
        senderName: patient?.fullName || 'Rajesh K. Sharma',
      });
      setAttachments([]);
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const handleRetryMessage = async (msgId: string) => {
    await careChatService.retryMessage(conversationId, msgId);
  };

  const handleConfirmResolve = async (rating?: number, note?: string) => {
    await resolveMutation.mutateAsync({ rating, note });
    setIsResolveSheetOpen(false);
  };

  const handleConfirmReopen = async (reason: string) => {
    await reopenMutation.mutateAsync(reason);
    setIsReopenSheetOpen(false);
  };

  if (isConvLoading) {
    return (
      <ScreenContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#0B6875]" />
        </div>
      </ScreenContainer>
    );
  }

  if (isConvError || !conversation) {
    return (
      <ScreenContainer>
        <div className="p-8 text-center space-y-4 max-w-[400px] mx-auto pt-20">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="font-bold text-lg text-[#16343C]">Conversation Not Found</h2>
          <p className="text-xs text-[#708188]">
            This conversation link is invalid or may have been deleted.
          </p>
          <button
            onClick={() => navigate('/chat')}
            className="px-4 py-2 bg-[#0B6875] text-white rounded-xl font-bold text-xs cursor-pointer"
          >
            Back to Care Chat
          </button>
        </div>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Top Fixed Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-[#DCE6E7] px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3 overflow-hidden">
          <button
            onClick={() => navigate('/chat')}
            className="p-1.5 hover:bg-[#F0F7F7] rounded-xl text-[#0B6875] transition-colors cursor-pointer shrink-0"
            aria-label="Back to chat home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="truncate">
            <h2 className="font-bold text-sm text-[#16343C] truncate leading-tight">
              {conversation.assignedDoctor
                ? conversation.assignedDoctor.name
                : conversation.departmentName}
            </h2>
            <p className="text-[11px] text-[#708188] truncate flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              {conversation.assignedDoctor
                ? `Doctor • ${conversation.departmentName}`
                : conversation.assignedAdmin
                ? `${conversation.assignedAdmin.role}`
                : 'Waiting for care team assignment'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => navigate(`/chat/${conversation.id}/details`)}
            className="p-2 hover:bg-[#F0F7F7] rounded-xl text-[#0B6875] transition-colors cursor-pointer"
            title="Conversation details"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Context Summary Card */}
      <ChatContextCard conversation={conversation} />

      {/* Safety Interruption Alert if urgent keywords typed */}
      {safetyAlertText && (
        <div className="bg-rose-50 border-b border-rose-200 p-3 text-xs text-rose-900 flex items-start gap-2 animate-fadeIn">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-[11px] leading-relaxed">{safetyAlertText}</p>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => setIsEmergencySheetOpen(true)}
                className="px-2.5 py-1 bg-rose-600 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 cursor-pointer"
              >
                <PhoneCall className="w-3 h-3" /> Emergency Help
              </button>
              <button
                onClick={() => setSafetyAlertText(null)}
                className="text-[10px] text-rose-700 underline font-semibold cursor-pointer"
              >
                Dismiss warning
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Timeline */}
      <div className="p-4 space-y-2 pb-32 max-w-[480px] mx-auto min-h-[60vh]">
        {isMsgsLoading ? (
          <div className="p-8 text-center text-[#708188]">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#0B6875]" />
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.senderType === 'SYSTEM' || msg.messageType === 'SYSTEM_EVENT') {
              return <SystemMessage key={msg.id} message={msg} />;
            }
            return (
              <ChatMessageBubble
                key={msg.id}
                message={msg}
                onRetry={handleRetryMessage}
              />
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer Controls & Composer */}
      <div className="fixed bottom-0 left-0 right-0 z-30 max-w-[480px] mx-auto">
        {/* Resolution Banner Actions */}
        {conversation.status === 'RESOLVED' && (
          <div className="bg-emerald-50 border-t border-emerald-200 p-3 text-center text-xs text-emerald-900 space-y-2">
            <p className="font-semibold">This conversation is marked resolved.</p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setIsReopenSheetOpen(true)}
                className="px-3 py-1.5 bg-[#0B6875] text-white rounded-xl font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer min-h-[36px]"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reopen Question
              </button>
            </div>
          </div>
        )}

        {!isReadOnly && (
          <>
            {/* Resolution Quick Action Button */}
            <div className="flex items-center justify-end px-3 py-1 bg-white border-t border-[#F1F5F9]">
              <button
                onClick={() => setIsResolveSheetOpen(true)}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer py-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Mark query resolved
              </button>
            </div>

            {/* Quick Replies */}
            <QuickReplyChips
              onSelect={(text) => handleSendMessage(text)}
              disabled={isReadOnly}
            />

            {/* Main Message Composer */}
            <ChatComposer
              onSendMessage={handleSendMessage}
              onOpenAttachmentPicker={() => setIsAttachmentPickerOpen(true)}
              disabled={isReadOnly}
              attachments={attachments}
              onRemoveAttachment={(id) =>
                setAttachments((prev) => prev.filter((a) => a.id !== id))
              }
            />
          </>
        )}
      </div>

      {/* Dev Simulator Panel */}
      <DevChatSimulator conversationId={conversation.id} />

      {/* Sheets & Modals */}
      <AttachmentPicker
        isOpen={isAttachmentPickerOpen}
        onClose={() => setIsAttachmentPickerOpen(false)}
        onAttachmentUploaded={(att) => setAttachments((prev) => [...prev, att])}
      />

      <ResolveConversationSheet
        isOpen={isResolveSheetOpen}
        onClose={() => setIsResolveSheetOpen(false)}
        onConfirmResolve={handleConfirmResolve}
        isLoading={resolveMutation.isPending}
      />

      <ReopenConversationSheet
        isOpen={isReopenSheetOpen}
        onClose={() => setIsReopenSheetOpen(false)}
        onConfirmReopen={handleConfirmReopen}
        isLoading={reopenMutation.isPending}
      />

      <EmergencyHelpSheet
        isOpen={isEmergencySheetOpen}
        onClose={() => setIsEmergencySheetOpen(false)}
        careMembers={[]}
        activePatientId={patient?.id || 'pat-101'}
      />
    </ScreenContainer>
  );
};
