import React, { useState } from 'react';
import { Bot, UserCheck, Stethoscope, CheckCircle, RefreshCw, X } from 'lucide-react';
import { careChatService } from '../../services/careChatService';
import { useQueryClient } from '@tanstack/react-query';
import { careChatKeys } from '../../hooks/useCareChatQueries';

interface Props {
  conversationId: string;
}

export const DevChatSimulator: React.FC<Props> = ({ conversationId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const queryClient = useQueryClient();

  // Show only in DEV mode
  if (!import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_API !== 'true') {
    return null;
  }

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: careChatKeys.conversation(conversationId) });
    queryClient.invalidateQueries({ queryKey: careChatKeys.messages(conversationId) });
    queryClient.invalidateQueries({ queryKey: careChatKeys.conversations() });
  };

  const handleSimulateAdminReply = async () => {
    setIsSimulating(true);
    await careChatService.simulateAdminReply(
      conversationId,
      'Hello! I am Priya Verma from Balaji Care Support. I have received your question and will verify your records.'
    );
    refreshAll();
    setIsSimulating(false);
  };

  const handleSimulateDoctorReply = async () => {
    setIsSimulating(true);
    await careChatService.simulateDoctorReply(
      conversationId,
      'Dr. Ananya Deshmukh here. Based on your report, please continue your prescribed dosage after food twice daily.'
    );
    refreshAll();
    setIsSimulating(false);
  };

  const handleSimulateResolve = async () => {
    setIsSimulating(true);
    await careChatService.resolveConversation(conversationId);
    refreshAll();
    setIsSimulating(false);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 z-40 bg-[#1E293B] text-amber-400 border border-amber-400/40 text-xs font-bold px-3 py-2 rounded-full shadow-xl flex items-center gap-1.5 cursor-pointer hover:bg-slate-800 transition-all active:scale-95"
        >
          <Bot className="w-4 h-4 animate-bounce text-amber-400" /> DEV Simulator
        </button>
      )}

      {/* Simulator Drawer Panel */}
      {isOpen && (
        <div className="fixed bottom-16 left-4 right-4 max-w-[440px] mx-auto z-40 bg-[#1E293B] border border-amber-500/40 rounded-2xl p-4 shadow-2xl text-white text-xs animate-slideUp">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2.5 mb-3">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <Bot className="w-4 h-4 text-amber-400" /> Care Chat DEV Simulator
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-slate-300 mb-3">
            Test real-time team participation states without backend services:
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleSimulateAdminReply}
              disabled={isSimulating}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-colors cursor-pointer disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4 text-teal-400 shrink-0" />
              <div>
                <div className="font-bold text-teal-300">1. Admin Reply</div>
                <div className="text-[10px] text-slate-400">Coordinator joins</div>
              </div>
            </button>

            <button
              onClick={handleSimulateDoctorReply}
              disabled={isSimulating}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-colors cursor-pointer disabled:opacity-50"
            >
              <Stethoscope className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="font-bold text-emerald-300">2. Doctor Reply</div>
                <div className="text-[10px] text-slate-400">Doctor joins</div>
              </div>
            </button>

            <button
              onClick={handleSimulateResolve}
              disabled={isSimulating}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-colors cursor-pointer disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="font-bold text-amber-300">3. Mark Resolved</div>
                <div className="text-[10px] text-slate-400">Resolve query</div>
              </div>
            </button>

            <button
              onClick={refreshAll}
              disabled={isSimulating}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <div className="font-bold text-blue-300">4. Refresh View</div>
                <div className="text-[10px] text-slate-400">Re-query state</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
