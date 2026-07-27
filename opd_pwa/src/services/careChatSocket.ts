import { Message, ConversationStatus } from '../types/careChat';

export type RealtimeEventHandler = (event: string, payload: any) => void;

class CareChatSocketManager {
  private handlers: Set<RealtimeEventHandler> = new Set();
  private isConnected = false;

  connect() {
    this.isConnected = true;
    console.log('[CareChatSocket] Connected to real-time chat service (mock mode active)');
  }

  disconnect() {
    this.isConnected = false;
    this.handlers.clear();
    console.log('[CareChatSocket] Disconnected from real-time chat service');
  }

  subscribe(handler: RealtimeEventHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  emitEvent(eventName: string, payload: any) {
    if (!this.isConnected) return;
    this.handlers.forEach((h) => {
      try {
        h(eventName, payload);
      } catch (err) {
        console.error('[CareChatSocket] Error handling real-time event', err);
      }
    });
  }

  // Real-time notification helpers
  notifyNewMessage(msg: Message) {
    this.emitEvent('message_received', msg);
  }

  notifyStatusChanged(conversationId: string, status: ConversationStatus) {
    this.emitEvent('conversation_status_changed', { conversationId, status });
  }
}

export const careChatSocket = new CareChatSocketManager();
