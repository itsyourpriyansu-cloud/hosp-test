import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MessageSquare, PlusCircle, Loader2 } from 'lucide-react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { ConversationCard } from '../../components/chat/ConversationCard';
import { useCareChatConversations } from '../../hooks/useCareChatQueries';

export const CareChatHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: conversations = [], isLoading } = useCareChatConversations();

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'RESOLVED' | 'CLOSED'>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      // Status filter
      if (statusFilter === 'ACTIVE' && (c.status === 'RESOLVED' || c.status === 'CLOSED')) {
        return false;
      }
      if (statusFilter === 'RESOLVED' && c.status !== 'RESOLVED') {
        return false;
      }
      if (statusFilter === 'CLOSED' && c.status !== 'CLOSED') {
        return false;
      }

      // Dept filter
      if (deptFilter !== 'ALL' && c.departmentId !== deptFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSubject = c.subject.toLowerCase().includes(q);
        const matchesDept = c.departmentName.toLowerCase().includes(q);
        const matchesDoctor = c.assignedDoctor?.name.toLowerCase().includes(q);
        const matchesId = c.id.toLowerCase().includes(q);
        const matchesPatient = c.patientName.toLowerCase().includes(q);
        return matchesSubject || matchesDept || matchesDoctor || matchesId || matchesPatient;
      }

      return true;
    });
  }, [conversations, statusFilter, deptFilter, searchQuery]);

  return (
    <ScreenContainer>
      <PageHeader
        title="Care Chat History"
        subtitle="All past and active assistance requests"
        showBack={true}
        onBack={() => navigate('/chat')}
        rightAction={
          <button
            onClick={() => navigate('/chat/new')}
            className="p-2 rounded-xl text-[#0B6875] hover:bg-[#F0F7F7] active:scale-95 transition-all flex items-center gap-1 text-xs font-semibold cursor-pointer min-h-[44px]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        }
      />

      <div className="p-4 space-y-4 max-w-[480px] mx-auto pb-32">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by subject, doctor, department, ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E8F0] focus:border-[#0B6875] rounded-2xl text-xs text-[#16343C] placeholder-[#94A3B8] focus:outline-none shadow-2xs"
          />
        </div>

        {/* Status Filter Segmented Control */}
        <div className="flex items-center bg-[#F1F5F9] p-1 rounded-2xl text-xs">
          {(['ALL', 'ACTIVE', 'RESOLVED', 'CLOSED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer text-center capitalize ${
                statusFilter === tab
                  ? 'bg-white text-[#0B6875] shadow-2xs'
                  : 'text-[#708188] hover:text-[#16343C]'
              }`}
            >
              {tab.toLowerCase()}
            </button>
          ))}
        </div>

        {/* Department Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none hide-scrollbar">
          <span className="text-[11px] font-extrabold text-[#475569] shrink-0 flex items-center gap-1 bg-[#F1F5F9] px-2.5 py-1 rounded-full border border-[#E2E8F0] whitespace-nowrap">
            <Filter className="w-3 h-3 text-[#0B6875]" /> Dept
          </span>
          {[
            { id: 'ALL', name: 'All Departments' },
            { id: 'dept-cardio', name: 'Cardiology' },
            { id: 'dept-pharma', name: 'Pharmacy' },
            { id: 'dept-diag', name: 'Diagnostics' },
            { id: 'dept-appts', name: 'Appointments' },
            { id: 'dept-billing', name: 'Billing' },
            { id: 'dept-support', name: 'Patient Support' },
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => setDeptFilter(d.id)}
              className={`px-3.5 py-1.5 rounded-full font-semibold shrink-0 transition-all cursor-pointer min-h-[32px] whitespace-nowrap text-xs ${
                deptFilter === d.id
                  ? 'bg-[#0B6875] text-white font-bold shadow-2xs'
                  : 'bg-white text-[#475569] border border-[#E2E8F0] hover:bg-[#F8FAFC]'
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="p-8 text-center text-[#708188]">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#0B6875]" />
          </div>
        )}

        {/* List of Conversations */}
        {!isLoading && filteredConversations.length > 0 && (
          <div className="space-y-3">
            {filteredConversations.map((conv) => (
              <ConversationCard key={conv.id} conversation={conv} />
            ))}
          </div>
        )}

        {/* Empty Filter State */}
        {!isLoading && filteredConversations.length === 0 && (
          <div className="p-8 bg-white border border-[#E2E8F0] rounded-2xl text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#F0F7F7] text-[#0B6875] mx-auto flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-[#16343C]">No matching conversations</h3>
            <p className="text-xs text-[#708188] max-w-[260px] mx-auto">
              Try adjusting your search query or filter selection.
            </p>
          </div>
        )}
      </div>
    </ScreenContainer>
  );
};
