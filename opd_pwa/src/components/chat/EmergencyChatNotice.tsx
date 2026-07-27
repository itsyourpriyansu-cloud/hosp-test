import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, PhoneCall, PlusCircle } from 'lucide-react';
import { EmergencyHelpSheet } from '../sheets/EmergencyHelpSheet';
import { useCareCircleStore } from '../../store/careCircleStore';
import { useAuthStore } from '../../store/authStore';

interface Props {
  onStartNewChat?: () => void;
  showStartButton?: boolean;
}

export const EmergencyChatNotice: React.FC<Props> = ({
  onStartNewChat,
  showStartButton = true,
}) => {
  const navigate = useNavigate();
  const [isEmergencySheetOpen, setIsEmergencySheetOpen] = useState(false);

  const { members: careMembers = [] } = useCareCircleStore();
  const { patient } = useAuthStore();


  const membersList = careMembers.length > 0
    ? careMembers
    : patient
    ? [
        {
          id: patient.id,
          fullName: patient.fullName,
          relationshipLabel: 'Myself',
          avatarInitials: patient.fullName.slice(0, 2).toUpperCase(),
          mrn: patient.mrNumber,
          ageGender: `${patient.gender}`,
          emergencyContact: patient.mobile,
          isSelf: true,
        },
      ]
    : [];

  return (
    <>
      <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 shadow-xs mb-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-xs text-amber-900 leading-snug">
              24/7 Internal Care Assistance
            </h4>
            <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
              Care Chat is for questions & guidance. For a life-threatening emergency, do not wait for a chat response.
            </p>

            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => setIsEmergencySheetOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#BA1A1A] hover:bg-[#93000A] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer min-h-[36px]"
              >
                <PhoneCall className="w-3.5 h-3.5" /> Emergency Help
              </button>

              {showStartButton && (
                <button
                  type="button"
                  onClick={() => {
                    if (onStartNewChat) onStartNewChat();
                    else navigate('/chat/new');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0B6875] hover:bg-[#09545E] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer min-h-[36px]"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Start a new chat
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <EmergencyHelpSheet
        isOpen={isEmergencySheetOpen}
        onClose={() => setIsEmergencySheetOpen(false)}
        careMembers={membersList as any}
        activePatientId={patient?.id || 'pat-101'}
      />
    </>
  );
};
