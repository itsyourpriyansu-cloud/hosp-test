import {
  Conversation,
  Message,
  DepartmentOption,
  CreateConversationPayload,
  Attachment,
} from '../types/careChat';
import {
  MOCK_CONVERSATIONS,
  MOCK_MESSAGES_MAP,
  MOCK_DEPARTMENTS,
  MOCK_ADMIN_COORDINATOR,
  MOCK_DOCTOR,
} from '../mocks/careChatMockData';
import { safeStorage } from '../utils/storage';

const STORAGE_KEY_CONVS = 'bhc_care_chat_conversations';
const STORAGE_KEY_MSGS = 'bhc_care_chat_messages';

// Initialize local storage fallback with mock data if absent
function getStoredConversations(): Conversation[] {
  try {
    const raw = safeStorage.getItem(STORAGE_KEY_CONVS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored conversations', e);
  }
  safeStorage.setItem(STORAGE_KEY_CONVS, JSON.stringify(MOCK_CONVERSATIONS));
  return MOCK_CONVERSATIONS;
}

function saveStoredConversations(convs: Conversation[]): void {
  safeStorage.setItem(STORAGE_KEY_CONVS, JSON.stringify(convs));
}

function getStoredMessagesMap(): Record<string, Message[]> {
  try {
    const raw = safeStorage.getItem(STORAGE_KEY_MSGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored messages', e);
  }
  safeStorage.setItem(STORAGE_KEY_MSGS, JSON.stringify(MOCK_MESSAGES_MAP));
  return MOCK_MESSAGES_MAP;
}

function saveStoredMessagesMap(msgs: Record<string, Message[]>): void {
  safeStorage.setItem(STORAGE_KEY_MSGS, JSON.stringify(msgs));
}

export const careChatService = {
  async getDepartments(): Promise<DepartmentOption[]> {
    await new Promise((res) => setTimeout(res, 150));
    return MOCK_DEPARTMENTS;
  },

  async getConversations(): Promise<Conversation[]> {
    await new Promise((res) => setTimeout(res, 200));
    const convs = getStoredConversations();
    return convs.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  async getUnreadCount(): Promise<number> {
    const convs = getStoredConversations();
    return convs.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0);
  },

  async getConversation(id: string): Promise<Conversation | null> {
    await new Promise((res) => setTimeout(res, 150));
    const convs = getStoredConversations();
    const found = convs.find((c) => c.id === id);
    return found || null;
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    await new Promise((res) => setTimeout(res, 200));
    const msgsMap = getStoredMessagesMap();
    const list = msgsMap[conversationId] || [];
    // CRITICAL: Filter out staff-only internal messages
    return list.filter((m) => !m.isInternal);
  },

  async createConversation(payload: CreateConversationPayload): Promise<Conversation> {
    await new Promise((res) => setTimeout(res, 350));
    const newId = `chat-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();

    const newConv: Conversation = {
      id: newId,
      patientId: payload.patientId,
      patientName: payload.patientName,
      patientAge: payload.patientAge,
      patientMrn: payload.patientMrn,
      relationship: payload.relationship,
      subject: payload.subject,
      category: payload.category,
      departmentId: payload.departmentId,
      departmentName: payload.departmentName,
      status: 'WAITING_FOR_TEAM',
      relatedAppointmentId: payload.relatedAppointmentId,
      relatedPrescriptionId: payload.relatedPrescriptionId,
      relatedReportId: payload.relatedReportId,
      unreadCount: 0,
      lastMessage: {
        body: payload.message,
        senderName: payload.patientName,
        createdAt: now,
        senderType: 'PATIENT',
      },
      createdAt: now,
      updatedAt: now,
    };

    const initialMessages: Message[] = [
      {
        id: `msg-${Date.now()}-1`,
        conversationId: newId,
        senderId: payload.patientId,
        senderType: 'PATIENT',
        senderName: payload.patientName,
        messageType: 'TEXT',
        body: payload.message,
        attachments: payload.attachments,
        createdAt: now,
        deliveryStatus: 'SENT',
      },
      {
        id: `msg-${Date.now()}-2`,
        conversationId: newId,
        senderId: 'system',
        senderType: 'SYSTEM',
        senderName: 'System',
        messageType: 'SYSTEM_EVENT',
        body: `Request submitted to ${payload.departmentName}. Care team has been notified.`,
        createdAt: new Date(Date.now() + 500).toISOString(),
        deliveryStatus: 'DELIVERED',
      },
    ];

    const convs = getStoredConversations();
    saveStoredConversations([newConv, ...convs]);

    const msgsMap = getStoredMessagesMap();
    msgsMap[newId] = initialMessages;
    saveStoredMessagesMap(msgsMap);

    return newConv;
  },

  async sendMessage(
    conversationId: string,
    body: string,
    attachments?: Attachment[],
    senderName = 'Rajesh K. Sharma'
  ): Promise<Message> {
    await new Promise((res) => setTimeout(res, 250));
    const now = new Date().toISOString();

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: 'pat-101',
      senderType: 'PATIENT',
      senderName,
      messageType: attachments && attachments.length > 0 ? 'IMAGE' : 'TEXT',
      body,
      attachments,
      createdAt: now,
      deliveryStatus: 'SENT',
    };

    const msgsMap = getStoredMessagesMap();
    const existing = msgsMap[conversationId] || [];
    msgsMap[conversationId] = [...existing, newMsg];
    saveStoredMessagesMap(msgsMap);

    // Update conversation last message & timestamp
    const convs = getStoredConversations();
    const idx = convs.findIndex((c) => c.id === conversationId);
    if (idx !== -1) {
      convs[idx] = {
        ...convs[idx],
        status: convs[idx].status === 'WAITING_FOR_PATIENT' ? 'ACTIVE' : convs[idx].status,
        lastMessage: {
          body: body || (attachments?.length ? '[Attachment]' : ''),
          senderName,
          createdAt: now,
          senderType: 'PATIENT',
        },
        updatedAt: now,
      };
      saveStoredConversations(convs);
    }

    return newMsg;
  },

  async retryMessage(conversationId: string, messageId: string): Promise<Message | null> {
    const msgsMap = getStoredMessagesMap();
    const list = msgsMap[conversationId] || [];
    const idx = list.findIndex((m) => m.id === messageId);
    if (idx !== -1) {
      list[idx] = {
        ...list[idx],
        deliveryStatus: 'SENT',
        createdAt: new Date().toISOString(),
      };
      msgsMap[conversationId] = list;
      saveStoredMessagesMap(msgsMap);
      return list[idx];
    }
    return null;
  },

  async uploadAttachment(file: File): Promise<Attachment> {
    await new Promise((res) => setTimeout(res, 500));
    const fileType = file.type.startsWith('image/')
      ? 'IMAGE'
      : file.type === 'application/pdf'
      ? 'PDF'
      : 'DOCUMENT';

    return {
      id: `att-${Date.now()}`,
      filename: file.name,
      fileType,
      size: file.size,
      uploadStatus: 'COMPLETE',
      secureUrl: URL.createObjectURL(file),
      createdAt: new Date().toISOString(),
    };
  },

  async markConversationRead(conversationId: string): Promise<void> {
    const convs = getStoredConversations();
    const idx = convs.findIndex((c) => c.id === conversationId);
    if (idx !== -1 && convs[idx].unreadCount > 0) {
      convs[idx].unreadCount = 0;
      saveStoredConversations(convs);
    }
  },

  async resolveConversation(
    conversationId: string,
    _rating?: number,
    _note?: string
  ): Promise<Conversation | null> {
    const now = new Date().toISOString();
    const convs = getStoredConversations();
    const idx = convs.findIndex((c) => c.id === conversationId);

    if (idx !== -1) {
      convs[idx] = {
        ...convs[idx],
        status: 'RESOLVED',
        updatedAt: now,
      };
      saveStoredConversations(convs);

      const msgsMap = getStoredMessagesMap();
      const list = msgsMap[conversationId] || [];
      list.push({
        id: `msg-sys-res-${Date.now()}`,
        conversationId,
        senderId: 'system',
        senderType: 'SYSTEM',
        senderName: 'System',
        messageType: 'SYSTEM_EVENT',
        body: 'Conversation marked resolved.',
        createdAt: now,
        deliveryStatus: 'DELIVERED',
      });
      msgsMap[conversationId] = list;
      saveStoredMessagesMap(msgsMap);

      return convs[idx];
    }
    return null;
  },

  async reopenConversation(
    conversationId: string,
    reason: string
  ): Promise<Conversation | null> {
    const now = new Date().toISOString();
    const convs = getStoredConversations();
    const idx = convs.findIndex((c) => c.id === conversationId);

    if (idx !== -1) {
      convs[idx] = {
        ...convs[idx],
        status: 'WAITING_FOR_TEAM',
        updatedAt: now,
      };
      saveStoredConversations(convs);

      const msgsMap = getStoredMessagesMap();
      const list = msgsMap[conversationId] || [];
      list.push(
        {
          id: `msg-sys-reopen-${Date.now()}`,
          conversationId,
          senderId: 'system',
          senderType: 'SYSTEM',
          senderName: 'System',
          messageType: 'SYSTEM_EVENT',
          body: `Conversation reopened by patient. Reason: ${reason}`,
          createdAt: now,
          deliveryStatus: 'DELIVERED',
        },
        {
          id: `msg-reopen-user-${Date.now()}`,
          conversationId,
          senderId: 'pat-101',
          senderType: 'PATIENT',
          senderName: convs[idx].patientName,
          messageType: 'TEXT',
          body: `I still need help: ${reason}`,
          createdAt: new Date(Date.now() + 100).toISOString(),
          deliveryStatus: 'SENT',
        }
      );
      msgsMap[conversationId] = list;
      saveStoredMessagesMap(msgsMap);

      return convs[idx];
    }
    return null;
  },

  // Developer Simulator Utilities
  async simulateAdminReply(conversationId: string, text: string): Promise<void> {
    const now = new Date().toISOString();
    const convs = getStoredConversations();
    const idx = convs.findIndex((c) => c.id === conversationId);

    if (idx !== -1) {
      convs[idx] = {
        ...convs[idx],
        status: 'ADMIN_ASSIGNED',
        assignedAdmin: MOCK_ADMIN_COORDINATOR,
        unreadCount: (convs[idx].unreadCount || 0) + 1,
        lastMessage: {
          body: text,
          senderName: MOCK_ADMIN_COORDINATOR.name,
          createdAt: now,
          senderType: 'CARE_COORDINATOR',
        },
        updatedAt: now,
      };
      saveStoredConversations(convs);

      const msgsMap = getStoredMessagesMap();
      const list = msgsMap[conversationId] || [];
      if (!list.some((m) => m.senderId === MOCK_ADMIN_COORDINATOR.id)) {
        list.push({
          id: `sys-coord-join-${Date.now()}`,
          conversationId,
          senderId: 'system',
          senderType: 'SYSTEM',
          senderName: 'System',
          messageType: 'SYSTEM_EVENT',
          body: `${MOCK_ADMIN_COORDINATOR.name} (Care Coordinator) joined the conversation.`,
          createdAt: new Date(Date.now() - 100).toISOString(),
          deliveryStatus: 'DELIVERED',
        });
      }
      list.push({
        id: `msg-coord-reply-${Date.now()}`,
        conversationId,
        senderId: MOCK_ADMIN_COORDINATOR.id,
        senderType: 'CARE_COORDINATOR',
        senderName: MOCK_ADMIN_COORDINATOR.name,
        senderRole: MOCK_ADMIN_COORDINATOR.role,
        senderAvatarUrl: MOCK_ADMIN_COORDINATOR.avatarUrl,
        messageType: 'TEXT',
        body: text,
        createdAt: now,
        deliveryStatus: 'DELIVERED',
      });
      msgsMap[conversationId] = list;
      saveStoredMessagesMap(msgsMap);
    }
  },

  async simulateDoctorReply(conversationId: string, text: string): Promise<void> {
    const now = new Date().toISOString();
    const convs = getStoredConversations();
    const idx = convs.findIndex((c) => c.id === conversationId);

    if (idx !== -1) {
      convs[idx] = {
        ...convs[idx],
        status: 'DOCTOR_ASSIGNED',
        assignedDoctor: MOCK_DOCTOR,
        unreadCount: (convs[idx].unreadCount || 0) + 1,
        lastMessage: {
          body: text,
          senderName: MOCK_DOCTOR.name,
          createdAt: now,
          senderType: 'DOCTOR',
        },
        updatedAt: now,
      };
      saveStoredConversations(convs);

      const msgsMap = getStoredMessagesMap();
      const list = msgsMap[conversationId] || [];
      if (!list.some((m) => m.senderId === MOCK_DOCTOR.id)) {
        list.push({
          id: `sys-doc-join-${Date.now()}`,
          conversationId,
          senderId: 'system',
          senderType: 'SYSTEM',
          senderName: 'System',
          messageType: 'SYSTEM_EVENT',
          body: `${MOCK_DOCTOR.name} (Cardiologist) has been assigned to your query.`,
          createdAt: new Date(Date.now() - 100).toISOString(),
          deliveryStatus: 'DELIVERED',
        });
      }
      list.push({
        id: `msg-doc-reply-${Date.now()}`,
        conversationId,
        senderId: MOCK_DOCTOR.id,
        senderType: 'DOCTOR',
        senderName: MOCK_DOCTOR.name,
        senderRole: MOCK_DOCTOR.role,
        senderAvatarUrl: MOCK_DOCTOR.avatarUrl,
        messageType: 'TEXT',
        body: text,
        createdAt: now,
        deliveryStatus: 'DELIVERED',
      });
      msgsMap[conversationId] = list;
      saveStoredMessagesMap(msgsMap);
    }
  },
};
