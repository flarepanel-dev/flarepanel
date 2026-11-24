import {
  BotIcon,
  CodeIcon,
  DownloadIcon,
  KeyRoundIcon,
  LayoutGridIcon,
  type LucideIcon,
  SearchIcon,
  Settings2Icon,
  SparklesIcon,
  ZapIcon,
} from 'lucide-react';

export interface SettingsTab {
  id: string;
  label: string;
  icon: LucideIcon;
  /** A chart palette colour, so the tab colours follow the theme. */
  accent: string;
}

export const PROJECT_SETTINGS_TABS: SettingsTab[] = [
  {
    id: 'details',
    label: 'Details',
    icon: Settings2Icon,
    accent: 'var(--chart-0)',
  },
  {
    id: 'events',
    label: 'Events',
    icon: ZapIcon,
    accent: 'var(--chart-2)',
  },
  {
    id: 'clients',
    label: 'Clients / API keys',
    icon: KeyRoundIcon,
    accent: 'var(--chart-1)',
  },
  {
    id: 'tracking',
    label: 'Tracking script',
    icon: CodeIcon,
    accent: 'var(--chart-4)',
  },
  {
    id: 'mcp',
    label: 'MCP',
    icon: BotIcon,
    accent: 'var(--chart-3)',
  },
  {
    id: 'widgets',
    label: 'Widgets',
    icon: LayoutGridIcon,
    accent: 'var(--chart-11)',
  },
  {
    id: 'imports',
    label: 'Imports',
    icon: DownloadIcon,
    accent: 'var(--chart-7)',
  },
  {
    id: 'gsc',
    label: 'Google Search',
    icon: SearchIcon,
    accent: 'var(--chart-10)',
  },
  {
    id: 'ai',
    label: 'AI',
    icon: SparklesIcon,
    accent: 'var(--chart-9)',
  },
];
