import React from 'react';
import { clsx } from 'clsx';
import { ConversationStatus } from '../../types/careChat';

interface Props {
  status: ConversationStatus;
  className?: string;
}

export const ConversationStatusBadge: React.FC<Props> = ({ status, className }) => {
  const getBadgeConfig = (st: ConversationStatus) => {
    switch (st) {
      case 'CREATED':
        return { label: 'Request created', style: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'WAITING_FOR_TEAM':
        return { label: 'Waiting for care team', style: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'ADMIN_ASSIGNED':
        return { label: 'Care coordinator assigned', style: 'bg-teal-50 text-teal-800 border-teal-200' };
      case 'UNDER_REVIEW':
        return { label: 'Under review', style: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
      case 'DOCTOR_REQUESTED':
        return { label: 'Doctor requested', style: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'DOCTOR_ASSIGNED':
        return { label: 'Doctor assigned', style: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'ACTIVE':
        return { label: 'Care team is responding', style: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold' };
      case 'WAITING_FOR_PATIENT':
        return { label: 'Waiting for your reply', style: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'RESOLVED':
        return { label: 'Marked resolved', style: 'bg-gray-100 text-gray-700 border-gray-300' };
      case 'CLOSED':
        return { label: 'Conversation closed', style: 'bg-gray-200 text-gray-600 border-gray-300' };
      case 'ROUTING_FAILED':
        return { label: 'Could not route request', style: 'bg-red-50 text-red-700 border-red-200' };
      case 'NO_TEAM_AVAILABLE':
        return { label: 'Team currently offline', style: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'ESCALATED':
        return { label: 'Escalated care', style: 'bg-orange-100 text-orange-800 border-orange-300' };
      default:
        return { label: 'Active', style: 'bg-teal-50 text-teal-700 border-teal-200' };
    }
  };

  const { label, style } = getBadgeConfig(status);

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] border font-medium transition-colors',
        style,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {label}
    </span>
  );
};
