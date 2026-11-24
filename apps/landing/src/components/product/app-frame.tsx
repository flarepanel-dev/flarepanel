'use client';

import {
  Bell,
  BookOpen,
  Bot,
  Building2,
  ChartGantt,
  ChartLine,
  ChevronsUpDown,
  CircleUser,
  Cog,
  Globe2,
  Grid3x3,
  Layers,
  LayoutPanelTop,
  type LucideIcon,
  MessageSquare,
  Search,
  Sparkles,
  Target,
  TrendingUpDown,
  UndoDot,
  UserRound,
  Users,
  Wallpaper,
  Workflow,
} from 'lucide-react';
import type { ReactNode } from 'react';

export type ViewId =
  | 'overview'
  | 'realtime'
  | 'sessions'
  | 'funnel'
  | 'retention'
  | 'profiles'
  | 'chat';

interface NavItem {
  label: string;
  icon: LucideIcon;
  view?: ViewId;
}

// The project sidebar of apps/start (sidebar-project-menu.tsx), same order and icons.
const TOP: NavItem[] = [
  { label: 'Report', icon: ChartLine, view: 'funnel' },
  { label: 'Chat', icon: Sparkles, view: 'chat' },
];
const ANALYTICS: NavItem[] = [
  { label: 'Overview', icon: Wallpaper, view: 'overview' },
  { label: 'Dashboards', icon: LayoutPanelTop },
  { label: 'Insights', icon: TrendingUpDown },
  { label: 'AI', icon: Bot },
  { label: 'Pages', icon: Layers },
  { label: 'SEO', icon: Search },
  { label: 'Realtime', icon: Globe2, view: 'realtime' },
  { label: 'Events', icon: ChartGantt },
  { label: 'Sessions', icon: Users, view: 'sessions' },
  { label: 'Profiles', icon: CircleUser, view: 'profiles' },
  { label: 'Groups', icon: Building2 },
  { label: 'Cohorts', icon: Target },
];
const MANAGE: NavItem[] = [
  { label: 'Settings', icon: Cog },
  { label: 'References', icon: Grid3x3 },
  { label: 'Notifications', icon: Bell },
  { label: 'Integrations', icon: Workflow },
  { label: 'Back to workspace', icon: UndoDot },
];

/** Which sidebar entry lights up for each view (funnels and retention are reports). */
const ACTIVE_LABEL: Record<ViewId, string> = {
  overview: 'Overview',
  realtime: 'Realtime',
  sessions: 'Sessions',
  funnel: 'Report',
  retention: 'Report',
  profiles: 'Profiles',
  chat: 'Chat',
};

function Item({
  item,
  active,
  onSelect,
}: {
  item: NavItem;
  active: boolean;
  onSelect?: (view: ViewId) => void;
}) {
  const Icon = item.icon;
  const clickable = Boolean(item.view && onSelect);
  // Mouse shortcut inside the decorative frame; keyboard users have the tour's tabs.
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: decorative, aria-hidden frame
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: decorative, aria-hidden frame
    // biome-ignore lint/a11y/useKeyWithClickEvents: the tour's tabs are the keyboard path
    <div
      className={`flex h-[30px] items-center gap-2.5 rounded-md px-2.5 text-[12.5px] tracking-[-0.005em] transition-colors duration-150 ${
        active
          ? 'bg-app-field font-medium text-app-text'
          : 'text-app-nav hover:bg-app-hover'
      } ${clickable ? 'cursor-pointer' : ''}`}
      onClick={clickable ? () => onSelect?.(item.view as ViewId) : undefined}
    >
      <Icon className="size-[15px] shrink-0 opacity-90" strokeWidth={1.75} />
      <span className="truncate">{item.label}</span>
    </div>
  );
}

function Sidebar({
  view,
  onSelect,
}: {
  view: ViewId;
  onSelect?: (view: ViewId) => void;
}) {
  const activeLabel = ACTIVE_LABEL[view];
  const group = (title: string, items: NavItem[]) => (
    <div className="mt-4">
      <div className="mb-1 px-2.5 font-medium text-[11px] text-app-muted">
        {title}
      </div>
      {items.map((item) => (
        <Item
          active={item.label === activeLabel}
          item={item}
          key={item.label}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
  return (
    <div className="hidden w-[212px] shrink-0 flex-col border-app-line border-r bg-app-card md:flex">
      <div className="flex items-center gap-2 p-2.5">
        <svg aria-hidden className="size-[30px] shrink-0" viewBox="0 0 48 48">
          <rect fill="#FFFFFF" height="48" rx="11" width="48" />
          <rect fill="#0D0D10" height="26" rx="3" width="6" x="12" y="11" />
          <rect fill="#0D0D10" height="6" rx="3" width="16" x="20.5" y="11" />
          <rect fill="#0D0D10" height="6" rx="3" width="10.5" x="20.5" y="21" />
          <circle cx="23.5" cy="34" fill="#FF496B" r="3" />
        </svg>
        <div className="flex h-[30px] min-w-0 flex-1 items-center gap-2 rounded-md border border-app-line px-2 text-[12.5px] text-app-text">
          <Building2
            className="size-3.5 shrink-0 text-app-muted"
            strokeWidth={1.75}
          />
          <span className="truncate">Acme Website</span>
          <ChevronsUpDown className="ml-auto size-3.5 shrink-0 text-app-muted" />
        </div>
      </div>
      <div className="flex-1 overflow-hidden px-2.5 pt-1">
        {TOP.map((item) => (
          <Item
            active={item.label === activeLabel}
            item={item}
            key={item.label}
            onSelect={onSelect}
          />
        ))}
        {group('Analytics', ANALYTICS)}
        {group('Manage', MANAGE)}
      </div>
      <div className="px-2.5 pb-2.5">
        <span className="flex items-center justify-center rounded-[5px] border border-app-line px-2 py-1 font-mono text-[10px] text-app-muted uppercase tracking-[0.08em]">
          Sample data
        </span>
      </div>
      <div className="flex items-center gap-3 border-app-line border-t px-3.5 py-2.5 text-[11.5px] text-app-muted">
        <span className="flex items-center gap-1.5">
          <MessageSquare className="size-3" strokeWidth={1.75} />
          Give feedback
        </span>
        <span className="flex items-center gap-1.5">
          <BookOpen className="size-3" strokeWidth={1.75} />
          Docs
        </span>
        <UserRound className="ml-auto size-3.5" strokeWidth={1.75} />
      </div>
    </div>
  );
}

/**
 * The dashboard window: the project sidebar of apps/start beside a view.
 * Decorative for assistive tech (the section around it carries the meaning);
 * pointer users can click the sidebar to switch views.
 */
export function AppFrame({
  view,
  onSelect,
  children,
  height,
  className = '',
}: {
  view: ViewId;
  onSelect?: (view: ViewId) => void;
  children: ReactNode;
  height: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`relative flex overflow-hidden rounded-[18px] border border-rule bg-app-bg text-app-text shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] ${height} ${className}`}
    >
      <Sidebar onSelect={onSelect} view={view} />
      <div className="relative min-w-0 flex-1 overflow-hidden">{children}</div>
      <span className="pointer-events-none absolute top-3 right-3 z-20 rounded-[5px] border border-app-line bg-app-card/90 px-2 py-1 font-mono text-[10px] text-app-muted uppercase tracking-[0.08em] backdrop-blur-sm md:hidden">
        Sample data
      </span>
    </div>
  );
}
