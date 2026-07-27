import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNavigation } from './BottomNavigation';
import { OfflineBanner } from '../ui/OfflineBanner';

export const AppShell: React.FC = () => {
  const location = useLocation();

  // Hide bottom nav on specific fullscreen / detail / modal views
  const hideNavRoutes = [
    '/login',
    '/verify-otp',
    '/create-profile',
    '/profile-created',
    '/called',
    '/reschedule',
    '/check-in',
    '/documents/',
    '/report-issue',
  ];

  const isChatSubpage =
    location.pathname === '/chat/new' ||
    (location.pathname.startsWith('/chat/') && location.pathname !== '/chat/history');

  const shouldHideNav =
    hideNavRoutes.some((route) => location.pathname.includes(route)) || isChatSubpage;

  return (
    <div className="mobile-shell bg-[#F7F9F8]">
      <OfflineBanner />
      <Outlet />
      {!shouldHideNav && <BottomNavigation />}
    </div>
  );
};
