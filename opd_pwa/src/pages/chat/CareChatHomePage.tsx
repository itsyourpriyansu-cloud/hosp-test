import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquarePlus,
  History,
  Pill,
  FileSpreadsheet,
  Calendar,
  Stethoscope,
  HeartHandshake,
  HelpCircle,
  Loader2,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { EmergencyChatNotice } from '../../components/chat/EmergencyChatNotice';
import { ConversationCard } from '../../components/chat/ConversationCard';
import { useCareChatConversations } from '../../hooks/useCareChatQueries';
import { HelpCategory } from '../../types/careChat';

export const CareChatHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { data: conversations = [], isLoading, isError, refetch } = useCareChatConversations();

  const activeConversation = conversations.find(
    (c) => c.status !== 'RESOLVED' && c.status !== 'CLOSED'
  );

  const recentConversations = conversations.filter(
    (c) => c.id !== activeConversation?.id
  );

  const helpCategories: {
    category: HelpCategory;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }[] = [
    {
      category: 'MEDICINE_QUESTION',
      title: 'Medicine Question',
      description: 'Dosage, side-effects & refills',
      icon: Pill,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      category: 'REPORT_QUESTION',
      title: 'Report Question',
      description: 'Lab test results & status',
      icon: FileSpreadsheet,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      category: 'APPOINTMENT_HELP',
      title: 'Appointment Help',
      description: 'Reschedule, token & timing',
      icon: Calendar,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      category: 'SYMPTOMS_CONCERN',
      title: 'Symptoms Concern',
      description: 'Mild discomfort & guidance',
      icon: Stethoscope,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      category: 'POST_VISIT_SUPPORT',
      title: 'Post-Visit Support',
      description: 'Doctor advice follow-up',
      icon: HeartHandshake,
      color: 'bg-teal-50 text-teal-800 border-teal-200',
    },
    {
      category: 'OTHER',
      title: 'Other Guidance',
      description: 'Billing, desk & navigation',
      icon: HelpCircle,
      color: 'bg-slate-50 text-slate-700 border-slate-200',
    },
  ];

  const handleCategoryClick = (cat: HelpCategory) => {
    navigate(`/chat/new?category=${cat}`);
  };

  return (
    <ScreenContainer>
      <PageHeader
        title="Care Chat"
        subtitle="24/7 help from your care team"
        rightAction={
          <button
            onClick={() => navigate('/chat/history')}
            className="p-2 rounded-xl text-[#0B6875] hover:bg-[#F0F7F7] active:scale-95 transition-all flex items-center gap-1 text-xs font-semibold cursor-pointer min-h-[44px]"
            title="Chat History"
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
          </button>
        }
      />

      <div className="p-4 space-y-5 pb-32 max-w-[480px] mx-auto">
        {/* Safety Warning Card */}
        <EmergencyChatNotice onStartNewChat={() => navigate('/chat/new')} showStartButton={false} />

        {/* Start New Chat Main CTA */}
        <button
          onClick={() => navigate('/chat/new')}
          className="w-full bg-[#0B6875] hover:bg-[#09545E] active:scale-[0.99] text-white p-4 rounded-2xl flex items-center justify-between shadow-md transition-all cursor-pointer min-h-[56px]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="font-bold text-sm block leading-tight">Start a new chat</span>
              <span className="text-xs text-white/80 font-medium">
                Connect with pharmacy, doctors or support desk
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/80 shrink-0" />
        </button>

        {/* Loading State */}
        {isLoading && (
          <div className="p-8 text-center text-[#708188] space-y-2">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#0B6875]" />
            <p className="text-xs font-medium">Loading care conversations...</p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Failed to load conversations.</span>
            </div>
            <button
              onClick={() => refetch()}
              className="font-bold underline cursor-pointer hover:text-rose-950"
            >
              Retry
            </button>
          </div>
        )}

        {/* Active Conversation Section */}
        {!isLoading && activeConversation && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-[11px] uppercase tracking-wider text-[#708188]">
                Active Conversation
              </h3>
              <span className="text-[11px] font-bold text-[#0B6875] bg-[#0B6875]/10 px-2 py-0.5 rounded-full">
                In Progress
              </span>
            </div>
            <ConversationCard conversation={activeConversation} isFeatured={true} />
          </div>
        )}

        {/* Quick Help Categories */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-[11px] uppercase tracking-wider text-[#708188]">
              What do you need help with?
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {helpCategories.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.category}
                  onClick={() => handleCategoryClick(item.category)}
                  className={`p-3.5 rounded-2xl border ${item.color} text-left transition-all active:scale-[0.98] cursor-pointer shadow-2xs hover:shadow-xs flex flex-col justify-between min-h-[96px]`}
                >
                  <div className="w-8 h-8 rounded-xl bg-white/90 flex items-center justify-center shadow-2xs mb-2">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs leading-snug">{item.title}</h4>
                    <p className="text-[10px] opacity-80 mt-0.5 line-clamp-1 font-medium">
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Conversations Section */}
        {!isLoading && recentConversations.length > 0 && (
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#708188]">
                Recent Conversations
              </h3>
              <button
                onClick={() => navigate('/chat/history')}
                className="text-xs font-semibold text-[#0B6875] hover:underline cursor-pointer"
              >
                View all
              </button>
            </div>

            <div className="space-y-2.5">
              {recentConversations.slice(0, 3).map((conv) => (
                <ConversationCard key={conv.id} conversation={conv} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && conversations.length === 0 && (
          <div className="p-8 bg-white border border-[#E2E8F0] rounded-2xl text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#F0F7F7] text-[#0B6875] mx-auto flex items-center justify-center">
              <MessageSquarePlus className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#16343C]">No care conversations yet</h3>
              <p className="text-xs text-[#708188] max-w-[280px] mx-auto mt-1 leading-relaxed">
                Start a chat when you need help with medicines, reports, appointments or follow-up care.
              </p>
            </div>
            <button
              onClick={() => navigate('/chat/new')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0B6875] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#09545E] cursor-pointer transition-all"
            >
              Start your first chat
            </button>
          </div>
        )}
      </div>
    </ScreenContainer>
  );
};
