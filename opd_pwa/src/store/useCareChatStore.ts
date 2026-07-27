import { create } from 'zustand';

interface CareChatUIState {
  activeFilter: 'ALL' | 'ACTIVE' | 'RESOLVED' | 'CLOSED';
  departmentFilter: string | null;
  searchQuery: string;
  isAttachmentPickerOpen: boolean;
  isDetailsSheetOpen: boolean;
  isResolveSheetOpen: boolean;
  isReopenSheetOpen: boolean;
  isDevSimulatorOpen: boolean;
  selectedQuickReply: string | null;
  draftMessageMap: Record<string, string>;

  // Actions
  setActiveFilter: (filter: 'ALL' | 'ACTIVE' | 'RESOLVED' | 'CLOSED') => void;
  setDepartmentFilter: (deptId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setAttachmentPickerOpen: (open: boolean) => void;
  setDetailsSheetOpen: (open: boolean) => void;
  setResolveSheetOpen: (open: boolean) => void;
  setReopenSheetOpen: (open: boolean) => void;
  setDevSimulatorOpen: (open: boolean) => void;
  setSelectedQuickReply: (text: string | null) => void;
  setDraftMessage: (conversationId: string, text: string) => void;
  clearDraftMessage: (conversationId: string) => void;
}

export const useCareChatStore = create<CareChatUIState>((set) => ({
  activeFilter: 'ALL',
  departmentFilter: null,
  searchQuery: '',
  isAttachmentPickerOpen: false,
  isDetailsSheetOpen: false,
  isResolveSheetOpen: false,
  isReopenSheetOpen: false,
  isDevSimulatorOpen: false,
  selectedQuickReply: null,
  draftMessageMap: {},

  setActiveFilter: (activeFilter) => set({ activeFilter }),
  setDepartmentFilter: (departmentFilter) => set({ departmentFilter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setAttachmentPickerOpen: (isAttachmentPickerOpen) => set({ isAttachmentPickerOpen }),
  setDetailsSheetOpen: (isDetailsSheetOpen) => set({ isDetailsSheetOpen }),
  setResolveSheetOpen: (isResolveSheetOpen) => set({ isResolveSheetOpen }),
  setReopenSheetOpen: (isReopenSheetOpen) => set({ isReopenSheetOpen }),
  setDevSimulatorOpen: (isDevSimulatorOpen) => set({ isDevSimulatorOpen }),
  setSelectedQuickReply: (selectedQuickReply) => set({ selectedQuickReply }),
  setDraftMessage: (conversationId, text) =>
    set((state) => ({
      draftMessageMap: { ...state.draftMessageMap, [conversationId]: text },
    })),
  clearDraftMessage: (conversationId) =>
    set((state) => {
      const next = { ...state.draftMessageMap };
      delete next[conversationId];
      return { draftMessageMap: next };
    }),
}));
