import React from 'react';
import { PageContainer } from '@/components/shared/PageContainer';
import { WelcomeHeader } from './components/WelcomeHeader';
import { QuickShortcuts } from './components/QuickShortcuts';
import { DailyPulseCards } from './components/DailyPulseCards';
import { ActivityTimeline24h } from './components/ActivityTimeline24h';
import { useHomeOverview } from './hooks/useHomeOverview';

export const HomePage: React.FC = () => {
  const {
    greeting,
    formattedDate,
    contextualSubtitle,
    totalPendingCount,
    dailyPulse,
    events,
    activeTab,
    tabCounts,
    setActiveTab,
    markAsRead,
    markAllAsRead,
  } = useHomeOverview();

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Dynamic Welcome Header with contextual badge and date */}
        <WelcomeHeader
          greeting={greeting}
          formattedDate={formattedDate}
          contextualSubtitle={contextualSubtitle}
          pendingCount={totalPendingCount}
        />

        {/* 1-click Quick Shortcuts grid */}
        <QuickShortcuts pendingCount={totalPendingCount} />

        {/* 24-hour Daily Operational Pulse Cards */}
        <DailyPulseCards summary={dailyPulse} />

        {/* Chronological 24-hour Activity Timeline */}
        <ActivityTimeline24h
          events={events}
          activeTab={activeTab}
          tabCounts={tabCounts}
          onTabChange={setActiveTab}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
        />
      </div>
    </PageContainer>
  );
};

export default HomePage;
