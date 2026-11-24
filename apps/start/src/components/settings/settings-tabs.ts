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
  /** Hosted edition only: the banner above the tab's content. */
  title: string;
  description: string;
  icon: LucideIcon;
  /** A chart palette colour, so the tab colours follow the theme. */
  accent: string;
}

export const PROJECT_SETTINGS_TABS: SettingsTab[] = [
  {
    id: 'details',
    label: 'Details',
    title: 'Project details',
    description: 'Name, domains and how this project tracks visitors.',
    icon: Settings2Icon,
    accent: 'var(--chart-0)',
  },
  {
    id: 'events',
    label: 'Events',
    title: 'Events',
    description: 'Your custom events and the traffic you filter out.',
    icon: ZapIcon,
    accent: 'var(--chart-2)',
  },
  {
    id: 'clients',
    label: 'Clients / API keys',
    title: 'Clients and API keys',
    description:
      'Keys that send events to this project or read its data. Secrets are shown once, when you create them.',
    icon: KeyRoundIcon,
    accent: 'var(--chart-1)',
  },
  {
    id: 'tracking',
    label: 'Tracking script',
    title: 'Tracking script',
    description: 'The snippet that starts tracking on your site or app.',
    icon: CodeIcon,
    accent: 'var(--chart-4)',
  },
  {
    id: 'mcp',
    label: 'MCP',
    title: 'MCP server',
    description:
      'Let Claude, Cursor and other AI tools read this project and build dashboards for you.',
    icon: BotIcon,
    accent: 'var(--chart-3)',
  },
  {
    id: 'widgets',
    label: 'Widgets',
    title: 'Widgets',
    description:
      'Show your numbers on your own site. Each widget gets a public link once it is on; turn it off and the link stops working.',
    icon: LayoutGridIcon,
    accent: 'var(--chart-11)',
  },
  {
    id: 'imports',
    label: 'Imports',
    title: 'Imports',
    description: 'Bring your history in from another analytics tool.',
    icon: DownloadIcon,
    accent: 'var(--chart-7)',
  },
  {
    id: 'gsc',
    label: 'Google Search',
    title: 'Google Search Console',
    description: 'Clicks, impressions and queries from Google Search.',
    icon: SearchIcon,
    accent: 'var(--chart-10)',
  },
  {
    id: 'ai',
    label: 'AI',
    title: 'AI',
    description: 'AI features for this project and the models they use.',
    icon: SparklesIcon,
    accent: 'var(--chart-9)',
  },
];
