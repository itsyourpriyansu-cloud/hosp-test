import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, Image as ImageIcon, FileText } from 'lucide-react';
import { Attachment } from '../../types/careChat';

interface Props {
  onSendMessage: (text: string, attachments?: Attachment[]) => void;
  onOpenAttachmentPicker: () => void;
  disabled?: boolean;
  initialText?: string | null;
  attachments?: Attachment[];
  onRemoveAttachment?: (id: string) => void;
}

export const ChatComposer: React.FC<Props> = ({
  onSendMessage,
  onOpenAttachmentPicker,
  disabled = false,
  initialText,
  attachments = [],
  onRemoveAttachment,
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialText !== undefined && initialText !== null) {
      setText(initialText);
    }
  }, [initialText]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if ((!trimmed && attachments.length === 0) || disabled) return;
    onSendMessage(trimmed, attachments.length > 0 ? attachments : undefined);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = (text.trim().length > 0 || attachments.length > 0) && !disabled;

  return (
    <div className="bg-white border-t border-[#DCE6E7] p-2.5 sm:p-3 shadow-lg transition-all">
      {/* Attachment previews above input */}
      {attachments.length > 0 && (
        <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-1.5 bg-[#F0F7F7] border border-[#0B6875]/30 text-[#0B6875] text-xs px-2.5 py-1 rounded-xl shrink-0"
            >
              {att.fileType === 'IMAGE' ? (
                <ImageIcon className="w-3.5 h-3.5" />
              ) : (
                <FileText className="w-3.5 h-3.5" />
              )}
              <span className="truncate max-w-[120px] font-medium">{att.filename}</span>
              <button
                onClick={() => onRemoveAttachment?.(att.id)}
                className="p-0.5 hover:bg-[#0B6875]/10 rounded-full cursor-pointer ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 max-w-[480px] mx-auto">
        <button
          type="button"
          onClick={onOpenAttachmentPicker}
          disabled={disabled}
          className="w-12 h-12 rounded-2xl bg-[#F0F7F7] text-[#0B6875] hover:bg-[#E0F0F0] active:scale-95 flex items-center justify-center transition-all shrink-0 cursor-pointer disabled:opacity-50 min-h-[48px] min-w-[48px]"
          aria-label="Add attachment"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <div className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] focus-within:border-[#0B6875] focus-within:ring-2 focus-within:ring-[#0B6875]/20 rounded-2xl px-3 py-2 flex items-center transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={disabled ? 'Conversation resolved or read-only' : 'Type your question or message...'}
            className="w-full bg-transparent text-sm text-[#16343C] placeholder-[#94A3B8] focus:outline-none resize-none max-h-[120px] min-h-[28px] py-1"
          />
        </div>

        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shrink-0 min-h-[48px] min-w-[48px] ${
            canSend
              ? 'bg-[#0B6875] text-white hover:bg-[#09545E] active:scale-95 shadow-md cursor-pointer'
              : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
          }`}
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
