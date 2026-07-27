export type ConversationStatus =
  | 'CREATED'
  | 'WAITING_FOR_TEAM'
  | 'ADMIN_ASSIGNED'
  | 'UNDER_REVIEW'
  | 'DOCTOR_REQUESTED'
  | 'DOCTOR_ASSIGNED'
  | 'ACTIVE'
  | 'WAITING_FOR_PATIENT'
  | 'RESOLVED'
  | 'CLOSED'
  | 'ROUTING_FAILED'
  | 'NO_TEAM_AVAILABLE'
  | 'ESCALATED';

export type SenderType =
  | 'PATIENT'
  | 'ADMIN'
  | 'CARE_COORDINATOR'
  | 'DOCTOR'
  | 'SYSTEM';

export type MessageType =
  | 'TEXT'
  | 'IMAGE'
  | 'DOCUMENT'
  | 'PRESCRIPTION_REF'
  | 'REPORT_REF'
  | 'SYSTEM_EVENT';

export type DeliveryStatus =
  | 'DRAFT'
  | 'QUEUED'
  | 'SENDING'
  | 'SENT'
  | 'DELIVERED'
  | 'SEEN'
  | 'FAILED';

export type HelpCategory =
  | 'MEDICINE_QUESTION'
  | 'REPORT_QUESTION'
  | 'APPOINTMENT_HELP'
  | 'SYMPTOMS_CONCERN'
  | 'POST_VISIT_SUPPORT'
  | 'PRESCRIPTION_CLARIFICATION'
  | 'DEPARTMENT_ASSISTANCE'
  | 'BILLING_ADMIN'
  | 'OTHER';

export interface Attachment {
  id: string;
  filename: string;
  fileType: string;
  size: number;
  uploadStatus: 'PENDING' | 'UPLOADING' | 'COMPLETE' | 'FAILED';
  secureUrl?: string;
  createdAt: string;
}

export interface CareTeamMember {
  id: string;
  name: string;
  role: 'Care Coordinator' | 'Doctor' | 'Department Admin' | 'Nurse';
  avatarUrl?: string;
  departmentName?: string;
  isOnline?: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: SenderType;
  senderName: string;
  senderRole?: string;
  senderAvatarUrl?: string;
  messageType: MessageType;
  body: string;
  attachments?: Attachment[];
  relatedRecordRef?: {
    type: 'appointment' | 'prescription' | 'report';
    id: string;
    title: string;
    subtitle?: string;
  };
  createdAt: string;
  deliveryStatus: DeliveryStatus;
  isInternal?: boolean;
}

export interface Conversation {
  id: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientMrn?: string;
  relationship?: string;
  subject: string;
  category: HelpCategory;
  departmentId: string;
  departmentName: string;
  status: ConversationStatus;
  assignedAdmin?: CareTeamMember;
  assignedDoctor?: CareTeamMember;
  relatedAppointmentId?: string;
  relatedPrescriptionId?: string;
  relatedReportId?: string;
  unreadCount: number;
  lastMessage?: {
    body: string;
    senderName: string;
    createdAt: string;
    senderType: SenderType;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentOption {
  id: string;
  name: string;
  description: string;
  iconName: string;
  isAvailable: boolean;
}

export interface CreateConversationPayload {
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientMrn?: string;
  relationship?: string;
  category: HelpCategory;
  departmentId: string;
  departmentName: string;
  subject: string;
  message: string;
  attachments?: Attachment[];
  relatedAppointmentId?: string;
  relatedPrescriptionId?: string;
  relatedReportId?: string;
}
