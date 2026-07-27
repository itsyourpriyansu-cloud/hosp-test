import { careChatService } from '../services/careChatService';

export async function runCareChatTests() {
  const depts = await careChatService.getDepartments();
  console.assert(depts.length > 0, 'Departments list should not be empty');

  const conv = await careChatService.createConversation({
    patientId: 'pat-101',
    patientName: 'Rajesh K. Sharma',
    category: 'MEDICINE_QUESTION',
    departmentId: 'dept-pharma',
    departmentName: 'Pharmacy Support',
    subject: 'Test dosage query',
    message: 'Can I take this medication before breakfast?',
  });
  console.assert(conv.status === 'WAITING_FOR_TEAM', 'New chat should start in WAITING_FOR_TEAM status');

  const msgs = await careChatService.getMessages(conv.id);
  const internalMsgs = msgs.filter((m) => m.isInternal === true);
  console.assert(internalMsgs.length === 0, 'Internal staff messages should be filtered out from patient view');

  return { success: true, conversationId: conv.id };
}
