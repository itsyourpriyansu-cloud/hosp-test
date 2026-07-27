import React, { useState } from 'react';
import { BottomSheet } from '../ui/BottomSheet';
import { CareMember, EmergencyAlertResponse } from '../../types';
import { HOSPITAL_EMERGENCY_CONFIG, emergencyService } from '../../services/emergencyService';
import { EmergencyAlertStatusModal } from './EmergencyAlertStatusModal';
import { PhoneCall, Siren, ShieldAlert, Check, Loader2, Hospital, UserCheck } from 'lucide-react';

interface EmergencyHelpSheetProps {
  isOpen: boolean;
  onClose: () => void;
  careMembers: CareMember[];
  activePatientId: string;
  onSelectPatient?: (id: string) => void;
}

export const EmergencyHelpSheet: React.FC<EmergencyHelpSheetProps> = ({
  isOpen,
  onClose,
  careMembers = [],
  activePatientId,
  onSelectPatient,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(activePatientId);
  const [isAlerting, setIsAlerting] = useState<boolean>(false);
  const [alertResponse, setAlertResponse] = useState<EmergencyAlertResponse | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);

  // Normalize patient properties safely to support any patient object structure
  const normalizedMembers = careMembers.map((m: any) => {
    const fullName = m.fullName || m.name || 'Patient';
    const relationshipLabel = m.relationshipLabel || m.relationship || 'Myself';
    const avatarInitials =
      m.avatarInitials ||
      m.initials ||
      fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
    const mrn = m.mrn || m.mrNumber || 'MR-2026-8842';

    return {
      ...m,
      id: m.id || 'pat-101',
      fullName,
      relationshipLabel,
      avatarInitials,
      mrn,
    };
  });

  const selectedPatient =
    normalizedMembers.find((m) => m.id === selectedPatientId) || normalizedMembers[0];

  const handlePatientSelect = (id: string) => {
    setSelectedPatientId(id);
    if (onSelectPatient) {
      onSelectPatient(id);
    }
  };

  const handleCall112 = () => {
    window.location.href = 'tel:112';
  };

  const handleCallHospital = () => {
    window.location.href = `tel:${HOSPITAL_EMERGENCY_CONFIG.hospitalHotline}`;
  };

  const handleSendHospitalAlert = async () => {
    if (!selectedPatient) return;
    setIsAlerting(true);
    try {
      const response = await emergencyService.sendEmergencyAlert({
        patientId: selectedPatient.id,
        patientName: selectedPatient.fullName,
        relation: selectedPatient.relationshipLabel,
        requestorMobile: selectedPatient.emergencyContact || '+919876543210',
        notes: 'Immediate emergency alert triggered from patient PWA.',
      });
      setAlertResponse(response);
      setIsStatusModalOpen(true);
    } catch (err) {
      console.error('ER Alert error:', err);
      setAlertResponse({
        alertId: `EMG-ERR-${Date.now()}`,
        patientId: selectedPatient.id,
        patientName: selectedPatient.fullName,
        timestamp: new Date().toISOString(),
        status: 'failed',
        hotlineFallback: HOSPITAL_EMERGENCY_CONFIG.hospitalHotline,
        message: 'Alert failed due to connection issue. Please use direct call below.',
      });
      setIsStatusModalOpen(true);
    } finally {
      setIsAlerting(false);
    }
  };

  return (
    <>
      <BottomSheet isOpen={isOpen} onClose={onClose} showCloseButton={true}>
        <div className="flex flex-col gap-4">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#BA1A1A] to-[#D32F2F] text-white p-4.5 -mx-5 -mt-5 rounded-t-[24px] flex items-start gap-3 shadow-md border-b border-white/10">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
              <Siren className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="pr-6">
              <h2 className="text-lg font-extrabold text-white leading-tight tracking-tight">Emergency Help</h2>
              <p className="text-xs text-white/90 font-medium mt-0.5 leading-snug">
                For immediate medical danger, contact emergency services now.
              </p>
            </div>
          </div>

          {/* Patient Selector */}
          <div className="flex flex-col gap-2.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#708188] flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#0B6875]" />
                Requesting help for
              </label>
              <span className="text-[11px] font-bold text-[#0B6875] bg-[#0B6875]/10 px-2.5 py-0.5 rounded-full border border-[#0B6875]/20">
                {selectedPatient?.relationshipLabel || 'Myself'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {normalizedMembers.map((member) => {
                const isSelected = member.id === selectedPatientId;
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => handlePatientSelect(member.id)}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#0B6875] bg-[#F0F7F7] ring-2 ring-[#0B6875]/20 shadow-2xs'
                        : 'border-[#E2E8F0] bg-white hover:border-[#0B6875]/40 hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl text-xs font-extrabold flex items-center justify-center shrink-0 transition-transform ${
                          isSelected ? 'bg-[#0B6875] text-white shadow-2xs' : 'bg-[#F1F5F9] text-[#475569]'
                        }`}
                      >
                        {member.avatarInitials}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-[#16343C] truncate leading-tight">
                          {member.fullName}
                        </span>
                        <span className="text-[10px] font-medium text-[#708188] truncate">
                          {member.relationshipLabel}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#0B6875] text-white flex items-center justify-center shrink-0 ml-1">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action List (Prioritized) */}
          <div className="flex flex-col gap-2.5 pt-1">
            {/* Action 1: Call 112 (Primary) */}
            <button
              type="button"
              onClick={handleCall112}
              className="w-full bg-[#BA1A1A] hover:bg-[#93000A] text-white p-3.5 rounded-2xl flex items-center justify-between transition-all active:scale-[0.98] cursor-pointer shadow-md group min-h-[56px]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-extrabold text-white leading-tight">Call 112 now</span>
                  <span className="text-xs text-white/80 font-medium">National Emergency Services</span>
                </div>
              </div>
              <span className="px-3 py-1 bg-white/20 text-white rounded-lg text-xs font-bold tracking-wider shrink-0">
                FREE
              </span>
            </button>

            {/* Action 2: Call Hospital Emergency (Secondary) */}
            <button
              type="button"
              onClick={handleCallHospital}
              className="w-full bg-[#0B6875] hover:bg-[#084F59] text-white p-3.5 rounded-2xl flex items-center justify-between transition-all active:scale-[0.98] cursor-pointer shadow-xs min-h-[54px]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white shrink-0">
                  <Hospital className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-left truncate">
                  <span className="text-xs font-extrabold text-white truncate">Call Balaji Heart Center Hotline</span>
                  <span className="text-[11px] text-white/80 font-medium truncate">{HOSPITAL_EMERGENCY_CONFIG.hospitalHotline}</span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-white/90 bg-white/15 px-2.5 py-1 rounded-lg shrink-0 ml-2">
                24/7 ER Desk
              </span>
            </button>

            {/* Action 3: Alert ER Team (Tertiary) */}
            <button
              type="button"
              onClick={handleSendHospitalAlert}
              disabled={isAlerting}
              className="w-full bg-white border border-[#0B6875] hover:bg-[#F0F7F7] text-[#0B6875] p-3.5 rounded-2xl flex items-center justify-between transition-all active:scale-[0.98] cursor-pointer min-h-[54px] disabled:opacity-50 shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#0B6875]/10 flex items-center justify-center text-[#0B6875] shrink-0">
                  {isAlerting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldAlert className="w-5 h-5" />}
                </div>
                <div className="flex flex-col text-left truncate">
                  <span className="text-xs font-extrabold text-[#16343C] truncate">Alert ER Triage Team</span>
                  <span className="text-[11px] text-[#708188] truncate">
                    Send patient MRN ({selectedPatient?.mrn}) & live signal to ER
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#0B6875] bg-[#0B6875]/10 px-2.5 py-1 rounded-lg shrink-0 ml-2">
                Transmit
              </span>
            </button>
          </div>

          <div className="text-[11px] text-[#708188] text-center bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0] mt-1 font-medium">
            Note: Direct phone calls operate even without mobile internet.
          </div>
        </div>
      </BottomSheet>

      {/* ER Alert Feedback Modal */}
      <EmergencyAlertStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        response={alertResponse}
      />
    </>
  );
};
