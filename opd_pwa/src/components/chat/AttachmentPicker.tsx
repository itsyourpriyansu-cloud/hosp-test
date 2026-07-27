import React, { useRef } from 'react';
import { Image as ImageIcon, FileText, Upload } from 'lucide-react';
import { BottomSheet } from '../ui/BottomSheet';
import { Attachment } from '../../types/careChat';
import { careChatService } from '../../services/careChatService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAttachmentUploaded: (attachment: Attachment) => void;
}

export const AttachmentPicker: React.FC<Props> = ({
  isOpen,
  onClose,
  onAttachmentUploaded,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check unsupported executables
    if (file.name.endsWith('.exe') || file.name.endsWith('.sh') || file.name.endsWith('.bat')) {
      alert('Executable files are not supported.');
      return;
    }

    try {
      const attachment = await careChatService.uploadAttachment(file);
      onAttachmentUploaded(attachment);
      onClose();
    } catch (err) {
      console.error('Failed to upload attachment', err);
      alert('Failed to upload attachment');
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Attach Document or Image">
      <div className="p-4 space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx"
          className="hidden"
          onChange={handleFileChange}
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          className="p-4 rounded-2xl border-2 border-dashed border-[#0B6875]/30 hover:border-[#0B6875] bg-[#F0F7F7] flex flex-col items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
        >
          <div className="w-12 h-12 rounded-full bg-[#0B6875]/10 text-[#0B6875] flex items-center justify-center">
            <Upload className="w-6 h-6" />
          </div>
          <span className="font-bold text-sm text-[#16343C]">Upload from device</span>
          <span className="text-xs text-[#708188]">Supports JPG, PNG, PDF & Documents</span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-3 p-3 rounded-xl border border-[#E2E8F0] hover:border-[#0B6875] bg-white text-left transition-all cursor-pointer min-h-[48px]"
          >
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-[#0B6875] flex items-center justify-center shrink-0">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-xs text-[#16343C]">Medical Image</div>
              <div className="text-[10px] text-[#708188]">Photo, Scan, X-ray</div>
            </div>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-3 p-3 rounded-xl border border-[#E2E8F0] hover:border-[#0B6875] bg-white text-left transition-all cursor-pointer min-h-[48px]"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-xs text-[#16343C]">Lab Report / PDF</div>
              <div className="text-[10px] text-[#708188]">PDF, Doc</div>
            </div>
          </button>
        </div>

        <div className="pt-3">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[#F1F5F9] text-[#475569] font-bold text-sm hover:bg-[#E2E8F0] transition-colors cursor-pointer min-h-[48px]"
          >
            Cancel
          </button>
        </div>
      </div>
    </BottomSheet>
  );
};
