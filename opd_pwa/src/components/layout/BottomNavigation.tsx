import React from 'react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import { Home, Calendar, MessageSquareText, FileText, User } from 'lucide-react';
import { useCareChatUnreadCount } from '../../hooks/useCareChatQueries';
import { useAuthStore } from '../../store/authStore';

export const BottomNavigation: React.FC = () => {
  const { authState } = useAuthStore();
  const isAuthenticated = authState === 'authenticated';
  const { data: unreadCount = 0 } = useCareChatUnreadCount();


  const navItems = [
    { label: 'Home', path: '/home', icon: Home, disabled: false },
    { label: 'Appointments', path: '/appointments', icon: Calendar, disabled: false },
    {
      label: 'Chat',
      path: '/chat',
      icon: MessageSquareText,
      badgeCount: unreadCount,
      disabled: !isAuthenticated,
    },
    { label: 'Records', path: '/records', icon: FileText, disabled: false },
    { label: 'Profile', path: '/profile', icon: User, disabled: false },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex justify-center bg-white border-t border-[#DCE6E7] safe-padding-bottom shadow-lg">
      <div className="w-full max-w-[480px] flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          if (item.disabled) {
            return (
              <div
                key={item.path}
                className="flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-semibold text-[#CBD5E1] opacity-50 cursor-not-allowed min-h-[48px]"
                aria-disabled="true"
              >
                <Icon className="w-5 h-5 mb-1" />
                <span>{item.label}</span>
              </div>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-semibold transition-colors cursor-pointer min-h-[48px] relative',
                  isActive ? 'text-[#0B6875]' : 'text-[#708188] hover:text-[#16343C]'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className={clsx('w-5 h-5 mb-1 transition-transform', isActive && 'scale-110')} />
                    {item.badgeCount && item.badgeCount > 0 ? (
                      <span className="absolute -top-1 -right-2 bg-[#0B6875] text-white text-[9px] font-bold px-1 py-0.2 rounded-full min-w-[15px] text-center border-2 border-white leading-tight shadow-xs">
                        {item.badgeCount > 9 ? '9+' : item.badgeCount}
                      </span>
                    ) : null}
                  </div>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
