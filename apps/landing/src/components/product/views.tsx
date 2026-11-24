'use client';

import type { ViewId } from './app-frame';
import { ChatView } from './chat-view';
import { OverviewView } from './overview-view';
import {
  AiView,
  CohortsView,
  DashboardsView,
  EventsView,
  GroupsView,
  InsightsView,
  IntegrationsView,
  NotificationsView,
  PagesView,
  ReferencesView,
  SeoView,
  SettingsView,
  WorkspaceView,
} from './page-views';
import { ProfileView } from './profile-view';
import { RealtimeView } from './realtime-view';
import { FunnelView, RetentionView } from './report-views';
import { SessionsView } from './sessions-view';

/** Every page the sidebar can open, shared by the hero and the tour. */
export function AppView({ id }: { id: ViewId }) {
  switch (id) {
    case 'overview':
      return <OverviewView />;
    case 'dashboards':
      return <DashboardsView />;
    case 'insights':
      return <InsightsView />;
    case 'ai':
      return <AiView />;
    case 'pages':
      return <PagesView />;
    case 'seo':
      return <SeoView />;
    case 'realtime':
      return <RealtimeView />;
    case 'events':
      return <EventsView />;
    case 'sessions':
      return <SessionsView />;
    case 'profiles':
      return <ProfileView />;
    case 'groups':
      return <GroupsView />;
    case 'cohorts':
      return <CohortsView />;
    case 'funnel':
      return <FunnelView />;
    case 'retention':
      return <RetentionView />;
    case 'settings':
      return <SettingsView />;
    case 'references':
      return <ReferencesView />;
    case 'notifications':
      return <NotificationsView />;
    case 'integrations':
      return <IntegrationsView />;
    case 'workspace':
      return <WorkspaceView />;
    default:
      return <ChatView />;
  }
}
