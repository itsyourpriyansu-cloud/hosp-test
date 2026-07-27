import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  User,
  Users,
  Check,
  ChevronRight,
  ChevronLeft,
  Paperclip,
  X,
  AlertTriangle,
  Send,
  Loader2,
  FileText,
  Calendar,
  Building2,
  ShieldAlert,
  HeartPulse,
  Sparkles,
  ArrowRight,
  BadgeCheck,
} from 'lucide-react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { useAuthStore } from '../../store/authStore';
import { useCareCircleStore } from '../../store/careCircleStore';
import {
  useCareChatDepartments,
  useCreateConversationMutation,
} from '../../hooks/useCareChatQueries';
import { HelpCategory, Attachment } from '../../types/careChat';
import { AttachmentPicker } from '../../components/chat/AttachmentPicker';
import { EmergencyHelpSheet } from '../../components/sheets/EmergencyHelpSheet';

export const StartCareChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCat = (searchParams.get('category') as HelpCategory) || 'MEDICINE_QUESTION';

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const { patient } = useAuthStore();
  const { members: careMembers = [] } = useCareCircleStore();
  const { data: departments = [] } = useCareChatDepartments();

  const createMutation = useCreateConversationMutation();

  // Deduplicate patient list (Primary patient + Care Circle members)
  const patientList = useMemo(() => {
    const map = new Map<string, {
      id: string;
      name: string;
      age: number;
      mrn: string;
      relationship: string;
      isSelf: boolean;
      initials: string;
      bloodGroup?: string;
    }>();

    if (patient) {
      map.set(patient.id, {
        id: patient.id,
        name: patient.fullName,
        age: 42,
        mrn: patient.mrNumber || 'MR-2026-8842',
        relationship: 'Myself',
        isSelf: true,
        initials: patient.fullName
          ? patient.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
          : 'RS',
        bloodGroup: patient.bloodGroup || 'B+',
      });
    }

    careMembers.forEach((m: any) => {
      const isSelfMember = m.relationship === 'myself' || m.id === patient?.id;
      const key = m.id;
      if (!map.has(key)) {
        map.set(key, {
          id: m.id,
          name: m.fullName,
          age: m.age || 40,
          mrn: m.mrn || 'MR-2026-3312',
          relationship: isSelfMember ? 'Myself' : m.relationshipLabel || 'Family Member',
          isSelf: isSelfMember,
          initials: m.avatarInitials || (m.fullName ? m.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'FM'),
          bloodGroup: m.bloodGroup || 'O+',
        });
      }
    });

    return Array.from(map.values());
  }, [patient, careMembers]);

  // Form State
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    patientList[0]?.id || 'pat-101'
  );
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory>(initialCat);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('dept-pharma');
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isAttachmentPickerOpen, setIsAttachmentPickerOpen] = useState(false);
  const [isEmergencySheetOpen, setIsEmergencySheetOpen] = useState(false);

  const selectedPatientObj =
    patientList.find((p) => p.id === selectedPatientId) || patientList[0];

  // Auto-suggest department based on selected category
  useEffect(() => {
    switch (selectedCategory) {
      case 'MEDICINE_QUESTION':
      case 'PRESCRIPTION_CLARIFICATION':
        setSelectedDeptId('dept-pharma');
        break;
      case 'REPORT_QUESTION':
        setSelectedDeptId('dept-diag');
        break;
      case 'APPOINTMENT_HELP':
        setSelectedDeptId('dept-appts');
        break;
      case 'SYMPTOMS_CONCERN':
        setSelectedDeptId('dept-cardio');
        break;
      case 'BILLING_ADMIN':
        setSelectedDeptId('dept-billing');
        break;
      default:
        setSelectedDeptId('dept-support');
    }
  }, [selectedCategory]);

  const helpCategoryOptions: {
    category: HelpCategory;
    title: string;
    description: string;
    icon: string;
    badge: string;
  }[] = [
    {
      category: 'MEDICINE_QUESTION',
      title: 'Medicine & Prescription Question',
      description: 'Dosage timing, side effects, refills & substitute queries',
      icon: '💊',
      badge: 'Pharmacy',
    },
    {
      category: 'REPORT_QUESTION',
      title: 'Test Report Clarification',
      description: 'Lab test results, status, or preparation guidelines',
      icon: '🧪',
      badge: 'Diagnostics',
    },
    {
      category: 'APPOINTMENT_HELP',
      title: 'Appointment Assistance',
      description: 'Rescheduling, live token status, or doctor availability',
      icon: '📅',
      badge: 'Scheduling',
    },
    {
      category: 'POST_VISIT_SUPPORT',
      title: 'Post-Consultation Doubt',
      description: 'Follow-up questions regarding advice given in recent OPD visit',
      icon: '🩺',
      badge: 'Clinical',
    },
    {
      category: 'SYMPTOMS_CONCERN',
      title: 'Mild Symptoms Concern',
      description: 'Non-emergency symptom guidance & care recommendations',
      icon: '❤️',
      badge: 'Care Team',
    },
    {
      category: 'DEPARTMENT_ASSISTANCE',
      title: 'Clinical Department Assistance',
      description: 'Contacting a specific department desk',
      icon: '🏥',
      badge: 'Desk',
    },
    {
      category: 'BILLING_ADMIN',
      title: 'Billing & Administrative Help',
      description: 'OPD bills, receipts, certificates & desk support',
      icon: '🧾',
      badge: 'Billing',
    },
    {
      category: 'OTHER',
      title: 'General Assistance',
      description: 'Hospital navigation, general queries & support',
      icon: '🎧',
      badge: 'Support',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    const deptObj = departments.find((d) => d.id === selectedDeptId) || {
      id: selectedDeptId,
      name: 'General Care Desk',
    };

    try {
      const createdConv = await createMutation.mutateAsync({
        patientId: selectedPatientObj.id,
        patientName: selectedPatientObj.name,
        patientAge: selectedPatientObj.age,
        patientMrn: selectedPatientObj.mrn,
        relationship: selectedPatientObj.relationship,
        category: selectedCategory,
        departmentId: deptObj.id,
        departmentName: deptObj.name,
        subject: subject.trim(),
        message: message.trim(),
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      navigate(`/chat/${createdConv.id}`, { replace: true });
    } catch (err) {
      console.error('Failed to create chat request', err);
      alert('Failed to submit chat request. Please check connection.');
    }
  };

  return (
    <ScreenContainer>
      <PageHeader
        title="Start Care Chat"
        subtitle={`Step ${step} of 4 — ${
          step === 1
            ? 'Select Patient'
            : step === 2
            ? 'Select Category'
            : step === 3
            ? 'Confirm Department'
            : 'Describe Request'
        }`}
        showBack={true}
        onBack={() => {
          if (step > 1) setStep((step - 1) as any);
          else navigate(-1);
        }}
      />

      <div className="p-4 max-w-[480px] mx-auto pb-24 space-y-4">
        {/* Modern Stepper Indicator */}
        <div className="bg-white border border-[#E2E8F0] p-3 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-[#0B6875] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Step {step} of 4
            </span>
            <span className="text-[#708188] font-medium">
              {step === 1
                ? 'Who needs help?'
                : step === 2
                ? 'Type of assistance'
                : step === 3
                ? 'Routing department'
                : 'Details & attachments'}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step
                    ? 'bg-gradient-to-r from-[#0B6875] to-[#084F59] shadow-xs'
                    : i < step
                    ? 'bg-[#0B6875]/40'
                    : 'bg-[#E2E8F0]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Who needs help? */}
        {step === 1 && (
          <div className="space-y-3 animate-fadeIn">
            <div className="bg-gradient-to-r from-[#F0F7F7] to-[#E6F3F4] p-3.5 rounded-2xl border border-[#C5E1E3] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs text-[#0B6875] uppercase tracking-wider">
                  Patient Selection
                </h3>
                <p className="text-xs text-[#16343C] font-semibold mt-0.5">
                  Select who this assistance request is for:
                </p>
              </div>
              <span className="text-[11px] font-bold bg-white text-[#0B6875] px-2.5 py-1 rounded-full shadow-2xs">
                {patientList.length} Accounts
              </span>
            </div>

            <div className="space-y-2.5">
              {patientList.map((p) => {
                const isSelected = p.id === selectedPatientId;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPatientId(p.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'border-[#0B6875] bg-gradient-to-r from-[#F0F7F7] via-white to-white ring-2 ring-[#0B6875]/20 shadow-md scale-[1.01]'
                        : 'border-[#E2E8F0] bg-white hover:border-[#0B6875]/50 hover:shadow-xs'
                    }`}
                  >
                    {/* Left Accent Bar when Selected */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#0B6875] rounded-l-2xl" />
                    )}

                    <div className="flex items-center justify-between gap-3 pl-1">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-sm shrink-0 transition-transform ${
                            isSelected
                              ? 'bg-gradient-to-br from-[#0B6875] to-[#084F59] text-white shadow-sm scale-105'
                              : 'bg-[#F1F5F9] text-[#475569]'
                          }`}
                        >
                          {p.initials}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-[#16343C] leading-snug">
                              {p.name}
                            </h4>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                p.isSelf
                                  ? 'bg-[#0B6875]/10 text-[#0B6875] border-[#0B6875]/30'
                                  : 'bg-purple-50 text-purple-700 border-purple-200'
                              }`}
                            >
                              {p.relationship}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-[#708188] mt-1 font-medium">
                            <span className="bg-[#F8FAFC] border border-[#E2E8F0] px-1.5 py-0.2 rounded font-mono text-[11px]">
                              {p.mrn}
                            </span>
                            <span>•</span>
                            <span>{p.age} yrs</span>
                            {p.bloodGroup && (
                              <>
                                <span>•</span>
                                <span className="text-[#0B6875] font-semibold">{p.bloodGroup}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Styled Custom Checkbox */}
                      <div
                        className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? 'border-[#0B6875] bg-[#0B6875] text-white shadow-xs scale-105'
                            : 'border-[#CBD5E1] bg-[#F8FAFC]'
                        }`}
                      >
                        {isSelected && <Check className="w-4 h-4 stroke-[2.5]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-4 rounded-2xl bg-[#0B6875] hover:bg-[#09545E] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer transition-all mt-4 min-h-[52px]"
            >
              Continue to Category <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Choose type of help */}
        {step === 2 && (
          <div className="space-y-3 animate-fadeIn">
            <div className="bg-gradient-to-r from-[#F0F7F7] to-[#E6F3F4] p-3.5 rounded-2xl border border-[#C5E1E3] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs text-[#0B6875] uppercase tracking-wider">
                  Category Selection
                </h3>
                <p className="text-xs text-[#16343C] font-semibold mt-0.5">
                  Select help type for <span className="text-[#0B6875] font-bold">{selectedPatientObj.name}</span>:
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {helpCategoryOptions.map((item) => {
                const isSelected = item.category === selectedCategory;
                return (
                  <div
                    key={item.category}
                    onClick={() => setSelectedCategory(item.category)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'border-[#0B6875] bg-gradient-to-r from-[#F0F7F7] via-white to-white ring-2 ring-[#0B6875]/20 shadow-md scale-[1.01]'
                        : 'border-[#E2E8F0] bg-white hover:border-[#0B6875]/50 hover:shadow-xs'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#0B6875] rounded-l-2xl" />
                    )}

                    <div className="flex items-center justify-between gap-3 pl-1">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#F0F7F7] flex items-center justify-center text-lg shrink-0 border border-[#D0E2E5]">
                          {item.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs text-[#16343C]">{item.title}</h4>
                            <span className="text-[10px] font-semibold bg-[#F1F5F9] text-[#475569] px-2 py-0.2 rounded-full border border-[#E2E8F0]">
                              {item.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#708188] mt-0.5 leading-snug">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? 'border-[#0B6875] bg-[#0B6875] text-white shadow-xs'
                            : 'border-[#CBD5E1] bg-[#F8FAFC]'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3.5 rounded-2xl border border-[#DCE6E7] bg-white text-[#475569] font-bold text-xs hover:bg-[#F7F9F8] transition-colors cursor-pointer min-h-[48px]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-3.5 rounded-2xl bg-[#0B6875] hover:bg-[#09545E] text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md cursor-pointer transition-all min-h-[48px]"
              >
                Confirm Department <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Confirm department */}
        {step === 3 && (
          <div className="space-y-3 animate-fadeIn">
            <div className="bg-gradient-to-r from-[#F0F7F7] to-[#E6F3F4] p-3.5 rounded-2xl border border-[#C5E1E3]">
              <h3 className="font-bold text-xs text-[#0B6875] uppercase tracking-wider">
                Department Routing
              </h3>
              <p className="text-xs text-[#16343C] font-semibold mt-0.5">
                Suggested clinical department for your request:
              </p>
            </div>

            <div className="space-y-2.5">
              {departments.map((d) => {
                const isSelected = d.id === selectedDeptId;
                return (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDeptId(d.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'border-[#0B6875] bg-gradient-to-r from-[#F0F7F7] via-white to-white ring-2 ring-[#0B6875]/20 shadow-md scale-[1.01]'
                        : 'border-[#E2E8F0] bg-white hover:border-[#0B6875]/50 hover:shadow-xs'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#0B6875] rounded-l-2xl" />
                    )}

                    <div className="flex items-center justify-between gap-3 pl-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#0B6875] border border-teal-100 flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs text-[#16343C]">{d.name}</h4>
                            {isSelected && (
                              <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.2 rounded-full">
                                Auto-Suggested
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#708188] mt-0.5">{d.description}</p>
                        </div>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? 'border-[#0B6875] bg-[#0B6875] text-white shadow-xs'
                            : 'border-[#CBD5E1] bg-[#F8FAFC]'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 py-3.5 rounded-2xl border border-[#DCE6E7] bg-white text-[#475569] font-bold text-xs hover:bg-[#F7F9F8] transition-colors cursor-pointer min-h-[48px]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="flex-1 py-3.5 rounded-2xl bg-[#0B6875] hover:bg-[#09545E] text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md cursor-pointer transition-all min-h-[48px]"
              >
                Write Request <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Describe the concern */}
        {step === 4 && (
          <form onSubmit={handleSubmit} className="space-y-4 animate-fadeIn">
            {/* Summary Banner */}
            <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-[#F1F5F9]">
                <span className="text-[#708188]">Patient:</span>
                <span className="font-bold text-[#16343C]">
                  {selectedPatientObj.name} ({selectedPatientObj.relationship})
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#708188]">Target Desk:</span>
                <span className="font-bold text-[#0B6875]">
                  {departments.find((d) => d.id === selectedDeptId)?.name || 'Care Support'}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#16343C]">Subject / Topic *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Atorvastatin dosage timing after dinner"
                className="w-full p-3 rounded-2xl border border-[#E2E8F0] text-xs text-[#16343C] focus:outline-none focus:border-[#0B6875] bg-white shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#16343C]">Message details *</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your question or the help you need."
                className="w-full p-3 rounded-2xl border border-[#E2E8F0] text-xs text-[#16343C] focus:outline-none focus:border-[#0B6875] bg-white shadow-2xs"
              />
            </div>

            {/* Attachments Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#16343C]">
                  Optional Attachments
                </label>
                <button
                  type="button"
                  onClick={() => setIsAttachmentPickerOpen(true)}
                  className="text-xs text-[#0B6875] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Paperclip className="w-3.5 h-3.5" /> Attach File / Report
                </button>
              </div>

              {attachments.length > 0 && (
                <div className="space-y-1.5">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between bg-white border border-[#E2E8F0] p-2.5 rounded-xl text-xs"
                    >
                      <span className="font-medium text-[#16343C] truncate max-w-[240px]">
                        📄 {att.filename}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setAttachments((prev) => prev.filter((a) => a.id !== att.id))
                        }
                        className="text-rose-600 p-1 hover:bg-rose-50 rounded-lg cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Emergency Warning Notice before submission */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 shadow-2xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                This service is for non-life-threatening assistance. Responses depend on care-team availability.
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEmergencySheetOpen(true)}
                className="px-3.5 py-3.5 rounded-2xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[48px]"
              >
                <ShieldAlert className="w-4 h-4" /> Emergency
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-3.5 py-3.5 rounded-2xl border border-[#DCE6E7] bg-white text-[#475569] font-bold text-xs hover:bg-[#F7F9F8] transition-colors cursor-pointer min-h-[48px]"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={!subject.trim() || !message.trim() || createMutation.isPending}
                className="flex-1 py-3.5 rounded-2xl bg-[#0B6875] hover:bg-[#09545E] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer min-h-[48px] disabled:opacity-50"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Send Request
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      <AttachmentPicker
        isOpen={isAttachmentPickerOpen}
        onClose={() => setIsAttachmentPickerOpen(false)}
        onAttachmentUploaded={(att) => setAttachments((prev) => [...prev, att])}
      />

      <EmergencyHelpSheet
        isOpen={isEmergencySheetOpen}
        onClose={() => setIsEmergencySheetOpen(false)}
        careMembers={patientList as any}
        activePatientId={selectedPatientId}
      />
    </ScreenContainer>
  );
};
