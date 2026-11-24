import type {
  IRealtimeWidgetOptions,
  ITrafficWidgetOptions,
  IWidgetOptions,
  IWidgetType,
} from '@flarepanel/core/modules/report/report.constants';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import {
  ActivityIcon,
  AreaChartIcon,
  AwardIcon,
  ExternalLinkIcon,
  type LucideIcon,
  RadioIcon,
  UsersIcon,
} from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { toast } from 'sonner';
import CopyInput from '@/components/forms/copy-input';
import FullPageLoadingState from '@/components/full-page-loading-state';
import { LogoSquare } from '@/components/logo';
import { Ping } from '@/components/ping';
import Syntax from '@/components/syntax';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Widget, WidgetBody, WidgetHead } from '@/components/widget';
import { useAppContext } from '@/hooks/use-app-context';
import { useAppParams } from '@/hooks/use-app-params';
import { useTRPC } from '@/integrations/trpc/react';
import { cn } from '@/utils/cn';

export const Route = createFileRoute(
  '/_app/$organizationId/$projectId/settings/_tabs/widgets'
)({
  component: Component,
});

type EmbedTheme = 'auto' | 'light' | 'dark';
type Kind = 'realtime' | 'traffic' | 'counter' | 'badge';

interface StoredWidget {
  id: string;
  public: boolean;
  options: IWidgetOptions;
}

const DEFAULT_REALTIME: IRealtimeWidgetOptions = {
  type: 'realtime',
  referrers: true,
  countries: true,
  paths: false,
};

const DEFAULT_TRAFFIC: ITrafficWidgetOptions = {
  type: 'traffic',
  range: '30d',
  pages: true,
  referrers: true,
};

interface KindMeta {
  title: string;
  /** One line on the tile. */
  summary: string;
  /** The longer text above the settings. */
  description: string;
  icon: LucideIcon;
  /** The stored widget behind it: the badge shares the counter's link. */
  store: IWidgetType;
  badge?: string;
  preview: { height: number; width?: number };
}

const KINDS: Record<Kind, KindMeta> = {
  realtime: {
    title: 'Realtime',
    summary: 'Visitors right now, live',
    description:
      'Visitors in the last 30 minutes with a per-minute chart, plus where they come from and what they read. Updates live.',
    icon: RadioIcon,
    store: 'realtime',
    preview: { height: 420 },
  },
  traffic: {
    title: 'Traffic',
    summary: '7 or 30 days, top pages',
    description:
      'Visitors and pageviews over the last 7 or 30 days on a chart, with your top pages and sources. A public stats page in one embed.',
    icon: AreaChartIcon,
    store: 'traffic',
    badge: 'New',
    preview: { height: 440 },
  },
  counter: {
    title: 'Live counter',
    summary: 'One line for a header',
    description:
      'One line with a live dot and the number of people on your site right now. Fits in a header, a footer or a sidebar.',
    icon: ActivityIcon,
    store: 'counter',
    preview: { height: 32, width: 220 },
  },
  badge: {
    title: 'Visitors badge',
    summary: '30-day visitors badge',
    description:
      'A badge with your visitors over the last 30 days. It shares its link with the live counter, so the two turn on and off together.',
    icon: AwardIcon,
    store: 'counter',
    preview: { height: 48, width: 250 },
  },
};

const KIND_ORDER: Kind[] = ['realtime', 'traffic', 'counter', 'badge'];

/** `/widget/<kind>?a=1&b=2`, skipping empty values. */
function widgetPath(
  dashboardUrl: string,
  kind: Kind,
  params: Record<string, string | boolean | undefined>
) {
  const search = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&');
  return `${dashboardUrl}/widget/${kind}${search ? `?${search}` : ''}`;
}

function embedCode(kind: Kind, url: string) {
  switch (kind) {
    case 'realtime':
      return `<iframe src="${url}" width="100%" height="420" frameborder="0" style="border-radius: 12px;" title="Live visitors"></iframe>`;
    case 'traffic':
      return `<iframe src="${url}" width="100%" height="440" frameborder="0" style="border-radius: 12px;" title="Site traffic"></iframe>`;
    case 'counter':
      return `<iframe src="${url}" height="32" width="220" style="border: none; overflow: hidden;" title="Visitors right now"></iframe>`;
    case 'badge':
      return `<a href="https://flarepanel.dev" style="display: inline-block; overflow: hidden; border-radius: 8px;">
  <iframe src="${url}" height="48" width="250" style="border: none; overflow: hidden; pointer-events: none;" title="Visitors badge"></iframe>
</a>`;
    default:
      return '';
  }
}

function Component() {
  const { projectId, organizationId } = useAppParams();
  const { dashboardUrl } = useAppContext();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Kind>('realtime');
  const [themes, setThemes] = useState<Record<Kind, EmbedTheme>>({
    realtime: 'auto',
    traffic: 'auto',
    counter: 'auto',
    badge: 'auto',
  });

  const realtimeQuery = useQuery(
    trpc.widget.get.queryOptions({ projectId, type: 'realtime' })
  );
  const trafficQuery = useQuery(
    trpc.widget.get.queryOptions({ projectId, type: 'traffic' })
  );
  const counterQuery = useQuery(
    trpc.widget.get.queryOptions({ projectId, type: 'counter' })
  );

  const toggleMutation = useMutation(
    trpc.widget.toggle.mutationOptions({
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(
          trpc.widget.get.queryFilter({ projectId, type: variables.type })
        );
        toast.success(
          variables.enabled
            ? 'Widget on: its public link works now'
            : 'Widget off: its public link stopped working'
        );
      },
      onError: (error) => {
        toast.error(error.message || 'Could not update the widget');
      },
    })
  );

  const optionsMutation = useMutation(
    trpc.widget.updateOptions.mutationOptions({
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(
          trpc.widget.get.queryFilter({
            projectId,
            type: variables.options.type,
          })
        );
      },
      onError: (error) => {
        toast.error(error.message || 'Could not save the options');
      },
    })
  );

  if (
    realtimeQuery.isLoading ||
    trafficQuery.isLoading ||
    counterQuery.isLoading
  ) {
    return <FullPageLoadingState />;
  }

  const stored: Record<IWidgetType, StoredWidget | null | undefined> = {
    realtime: realtimeQuery.data as StoredWidget | null | undefined,
    traffic: trafficQuery.data as StoredWidget | null | undefined,
    counter: counterQuery.data as StoredWidget | null | undefined,
  };
  const widgetOf = (kind: Kind) => stored[KINDS[kind].store];
  const isOn = (kind: Kind) => widgetOf(kind)?.public === true;
  const isBusy = (kind: Kind) =>
    toggleMutation.isPending &&
    toggleMutation.variables?.type === KINDS[kind].store;
  const toggle = (kind: Kind, enabled: boolean) => {
    setSelected(kind);
    toggleMutation.mutate({
      projectId,
      organizationId,
      type: KINDS[kind].store,
      enabled,
    });
  };
  const saveOptions = (options: IWidgetOptions) =>
    optionsMutation.mutate({ projectId, organizationId, options });
  const onCount = KIND_ORDER.filter(isOn).length;

  return (
    <div className="max-w-screen-lg space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        {/* The hosted edition shows this in the coloured tab banner. */}
        <div className="hosted:hidden space-y-1">
          <h2 className="font-semibold text-lg">Widgets</h2>
          <p className="max-w-prose text-muted-foreground">
            Show your numbers on your own site. Switch a widget on to get its
            public link; switch it off and the link stops working.
          </p>
        </div>
        <span className="hosted:ml-auto text-muted-foreground text-sm tabular-nums">
          {onCount} of {KIND_ORDER.length} on
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KIND_ORDER.map((kind) => (
          <WidgetTile
            busy={isBusy(kind)}
            key={kind}
            kind={kind}
            on={isOn(kind)}
            onSelect={() => setSelected(kind)}
            onToggle={(enabled) => toggle(kind, enabled)}
            selected={selected === kind}
          />
        ))}
      </div>

      <WidgetDetails
        busy={isBusy(selected)}
        dashboardUrl={dashboardUrl}
        kind={selected}
        onOptions={saveOptions}
        onTheme={(theme) =>
          setThemes((current) => ({ ...current, [selected]: theme }))
        }
        onToggle={(enabled) => toggle(selected, enabled)}
        savingOptions={optionsMutation.isPending}
        theme={themes[selected]}
        widget={widgetOf(selected)}
      />
    </div>
  );
}

function WidgetTile({
  kind,
  on,
  busy,
  selected,
  onSelect,
  onToggle,
}: {
  kind: Kind;
  on: boolean;
  busy: boolean;
  selected: boolean;
  onSelect: () => void;
  onToggle: (enabled: boolean) => void;
}) {
  const meta = KINDS[kind];
  const Icon = meta.icon;
  const switchId = `widget-${kind}`;
  return (
    <div
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border bg-card transition-[border-color,box-shadow]',
        selected
          ? 'border-foreground/40 shadow-sm ring-1 ring-foreground/15'
          : 'hover:border-foreground/25'
      )}
    >
      <button
        aria-label={`Show ${meta.title} settings`}
        aria-pressed={selected}
        className="relative block h-32 w-full overflow-hidden border-b bg-def-100 text-left"
        onClick={onSelect}
        type="button"
      >
        <div
          className={cn(
            'absolute inset-0 transition-opacity',
            on ? 'opacity-100' : 'opacity-60 group-hover:opacity-80'
          )}
        >
          <Thumbnail kind={kind} />
        </div>
        {meta.badge && (
          <span className="absolute top-2 right-2 rounded-full bg-chart-0 px-2 py-px font-medium text-[11px] text-white">
            {meta.badge}
          </span>
        )}
      </button>
      <div className="flex items-center gap-3 p-3">
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <button
          className="min-w-0 flex-1 text-left"
          onClick={onSelect}
          type="button"
        >
          <span className="block truncate font-medium text-sm">
            {meta.title}
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
            {on ? (
              <>
                <span className="size-1.5 rounded-full bg-emerald-500" />
                On
              </>
            ) : (
              meta.summary
            )}
          </span>
        </button>
        <Switch
          aria-label={`${meta.title} ${on ? 'on' : 'off'}`}
          checked={on}
          disabled={busy}
          id={switchId}
          onCheckedChange={onToggle}
        />
      </div>
    </div>
  );
}

// Small drawn previews for the tiles: sample shapes, not real numbers.
const THUMB_BARS = [
  5, 8, 6, 9, 7, 4, 10, 12, 8, 11, 9, 14, 12, 16, 13, 18, 15, 20,
];
const THUMB_AREA =
  'M0 34 C10 30 18 31 26 28 S42 22 52 25 S70 18 80 20 S96 12 106 15 S124 8 132 10 L140 6 L140 44 L0 44 Z';

function Thumbnail({ kind }: { kind: Kind }) {
  if (kind === 'realtime') {
    return (
      <div className="flex h-full flex-col justify-between p-4">
        <div className="flex items-center gap-1.5 font-medium text-[10px] text-muted-foreground uppercase tracking-wide">
          <Ping />
          Users now
        </div>
        <div className="font-bold text-3xl tabular-nums leading-none">42</div>
        <div className="flex h-8 items-end gap-[3px]">
          {THUMB_BARS.map((height, index) => (
            <div
              className="flex-1 rounded-[2px] bg-chart-0"
              key={index.toString()}
              style={{ height: `${(height / 20) * 100}%` }}
            />
          ))}
        </div>
      </div>
    );
  }
  if (kind === 'traffic') {
    return (
      <div className="flex h-full flex-col justify-between p-4">
        <div className="flex items-baseline gap-4">
          <div>
            <div className="font-bold text-2xl tabular-nums leading-none">
              7.3K
            </div>
            <div className="mt-1 text-[10px] text-muted-foreground">
              Visitors
            </div>
          </div>
          <div>
            <div className="font-bold text-2xl tabular-nums leading-none">
              21K
            </div>
            <div className="mt-1 text-[10px] text-muted-foreground">
              Pageviews
            </div>
          </div>
        </div>
        <svg
          aria-hidden
          className="h-11 w-full text-chart-0"
          preserveAspectRatio="none"
          viewBox="0 0 140 44"
        >
          <path d={THUMB_AREA} fill="currentColor" fillOpacity="0.2" />
          <path
            d={THUMB_AREA.replace(/ L140 44 L0 44 Z$/, '')}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    );
  }
  if (kind === 'counter') {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="flex items-center gap-2 rounded-full border bg-card px-3.5 py-2 text-sm shadow-sm">
          <Ping />
          <span className="font-semibold tabular-nums">42</span>
          <span className="text-muted-foreground">unique visitors</span>
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-full items-center justify-center p-4">
      <div className="flex w-full max-w-[210px] items-center gap-2.5 rounded-lg bg-[#16171c] px-2.5 py-2 text-white shadow-sm">
        <LogoSquare className="size-7" />
        <div className="min-w-0 flex-1 leading-tight">
          <div className="text-[8px] text-white/70 uppercase tracking-wide">
            Analytics from
          </div>
          <div className="font-semibold text-sm">FlarePanel</div>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <UsersIcon className="size-3.5" />
          <span className="font-medium text-xs tabular-nums">8.6K</span>
        </div>
      </div>
    </div>
  );
}

function WidgetDetails({
  kind,
  widget,
  dashboardUrl,
  busy,
  theme,
  onTheme,
  onToggle,
  onOptions,
  savingOptions,
}: {
  kind: Kind;
  widget: StoredWidget | null | undefined;
  dashboardUrl: string;
  busy: boolean;
  theme: EmbedTheme;
  onTheme: (theme: EmbedTheme) => void;
  onToggle: (enabled: boolean) => void;
  onOptions: (options: IWidgetOptions) => void;
  savingOptions: boolean;
}) {
  const meta = KINDS[kind];
  const Icon = meta.icon;
  const themeParam = theme === 'auto' || kind === 'badge' ? undefined : theme;
  const live =
    widget?.public === true
      ? widgetPath(dashboardUrl, kind, {
          shareId: widget.id,
          theme: themeParam,
        })
      : null;
  const preview =
    live ?? widgetPath(dashboardUrl, kind, { demo: true, theme: themeParam });
  const realtime =
    widget?.options.type === 'realtime' ? widget.options : DEFAULT_REALTIME;
  const traffic =
    widget?.options.type === 'traffic' ? widget.options : DEFAULT_TRAFFIC;
  // Options change what the widget returns, so the frame reloads with them.
  const frameKey =
    kind === 'realtime'
      ? `${realtime.countries}${realtime.referrers}${realtime.paths}`
      : kind === 'traffic'
        ? `${traffic.range}${traffic.pages}${traffic.referrers}`
        : kind;

  return (
    <Widget className="w-full">
      <WidgetHead className="row items-start justify-between gap-6">
        <div className="flex min-w-0 gap-3">
          <div className="shrink-0 self-start rounded-lg bg-def-200 p-2">
            <Icon size={18} />
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <span className="title">{meta.title}</span>
              <StatusPill on={!!live} />
            </div>
            <p className="max-w-prose text-muted-foreground text-sm">
              {meta.description}
            </p>
          </div>
        </div>
      </WidgetHead>
      <WidgetBody className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="min-w-0 space-y-5">
          {live ? (
            <>
              {kind === 'realtime' && (
                <OptionGroup title="Show">
                  <OptionSwitch
                    checked={realtime.countries}
                    disabled={savingOptions}
                    id="realtime-countries"
                    label="Countries"
                    onChange={(countries) =>
                      onOptions({ ...realtime, countries })
                    }
                  />
                  <OptionSwitch
                    checked={realtime.referrers}
                    disabled={savingOptions}
                    id="realtime-referrers"
                    label="Sources"
                    onChange={(referrers) =>
                      onOptions({ ...realtime, referrers })
                    }
                  />
                  <OptionSwitch
                    checked={realtime.paths}
                    disabled={savingOptions}
                    id="realtime-paths"
                    label="Pages"
                    onChange={(paths) => onOptions({ ...realtime, paths })}
                  />
                </OptionGroup>
              )}
              {kind === 'traffic' && (
                <>
                  <OptionGroup title="Period">
                    <ToggleGroup
                      className="justify-start"
                      disabled={savingOptions}
                      onValueChange={(range) => {
                        if (range === '7d' || range === '30d') {
                          onOptions({ ...traffic, range });
                        }
                      }}
                      type="single"
                      value={traffic.range}
                      variant="outline"
                    >
                      <ToggleGroupItem value="7d">7 days</ToggleGroupItem>
                      <ToggleGroupItem value="30d">30 days</ToggleGroupItem>
                    </ToggleGroup>
                  </OptionGroup>
                  <OptionGroup title="Show">
                    <OptionSwitch
                      checked={traffic.pages}
                      disabled={savingOptions}
                      id="traffic-pages"
                      label="Top pages"
                      onChange={(pages) => onOptions({ ...traffic, pages })}
                    />
                    <OptionSwitch
                      checked={traffic.referrers}
                      disabled={savingOptions}
                      id="traffic-referrers"
                      label="Top sources"
                      onChange={(referrers) =>
                        onOptions({ ...traffic, referrers })
                      }
                    />
                  </OptionGroup>
                </>
              )}
              {kind !== 'badge' && (
                <ThemePicker onChange={onTheme} value={theme} />
              )}
              <EmbedCode
                code={embedCode(kind, live)}
                note={
                  kind === 'traffic'
                    ? 'Numbers refresh every 5 minutes.'
                    : undefined
                }
                url={live}
              />
            </>
          ) : (
            <div className="flex flex-col items-start gap-4 rounded-lg border border-dashed p-6">
              <div className="space-y-1">
                <h3 className="font-medium">This widget is off</h3>
                <p className="text-muted-foreground text-sm">
                  The preview shows sample data. Switch it on to see your own
                  numbers and get the link and embed code.
                </p>
              </div>
              <Button disabled={busy} onClick={() => onToggle(true)}>
                Turn on {meta.title.toLowerCase()}
              </Button>
            </div>
          )}
        </div>
        <PreviewFrame
          height={meta.preview.height}
          key={frameKey}
          live={!!live}
          pointerEvents={kind !== 'badge'}
          src={preview}
          title={`${meta.title} preview`}
          width={meta.preview.width}
        />
      </WidgetBody>
    </Widget>
  );
}

function StatusPill({ on }: { on: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-px font-medium text-xs',
        on
          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
          : 'bg-def-200 text-muted-foreground'
      )}
    >
      <span
        className={cn(
          'size-1.5 rounded-full',
          on ? 'bg-emerald-500' : 'bg-muted-foreground/60'
        )}
      />
      {on ? 'On' : 'Off'}
    </span>
  );
}

function PreviewFrame({
  src,
  title,
  height,
  width,
  live,
  pointerEvents,
}: {
  src: string;
  title: string;
  height: number;
  width?: number;
  live: boolean;
  pointerEvents: boolean;
}) {
  return (
    <div className="min-w-0 self-start overflow-hidden rounded-lg border bg-def-100">
      <div className="flex h-10 items-center justify-between gap-3 border-b px-3 text-muted-foreground text-xs">
        <span className="flex items-center gap-2">
          {live ? (
            <>
              <Ping />
              Live
            </>
          ) : (
            'Sample data'
          )}
        </span>
        {live && (
          <Button
            icon={ExternalLinkIcon}
            onClick={() => window.open(src, '_blank', 'noopener,noreferrer')}
            size="sm"
            variant="ghost"
          >
            Open
          </Button>
        )}
      </div>
      <div className={cn('flex justify-center', width && 'px-6 py-10')}>
        <iframe
          className={cn(
            'block border-0',
            !pointerEvents && 'pointer-events-none'
          )}
          height={height}
          loading="lazy"
          src={src}
          title={title}
          width={width ?? '100%'}
        />
      </div>
    </div>
  );
}

function OptionGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="font-medium text-sm">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function OptionSwitch({
  id,
  label,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-sm" htmlFor={id}>
        {label}
      </Label>
      <Switch
        checked={checked}
        disabled={disabled}
        id={id}
        onCheckedChange={onChange}
      />
    </div>
  );
}

function ThemePicker({
  value,
  onChange,
}: {
  value: EmbedTheme;
  onChange: (theme: EmbedTheme) => void;
}) {
  return (
    <OptionGroup title="Theme">
      <ToggleGroup
        className="justify-start"
        onValueChange={(next) => {
          if (next === 'auto' || next === 'light' || next === 'dark') {
            onChange(next);
          }
        }}
        type="single"
        value={value}
        variant="outline"
      >
        <ToggleGroupItem value="auto">Match visitor</ToggleGroupItem>
        <ToggleGroupItem value="light">Light</ToggleGroupItem>
        <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
      </ToggleGroup>
    </OptionGroup>
  );
}

function EmbedCode({
  url,
  code,
  note,
}: {
  url: string;
  code: string;
  note?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <h3 className="font-medium text-sm">Link</h3>
        <CopyInput
          className="w-full"
          label=""
          onCopy={() => toast.success('Link copied')}
          value={url}
        />
      </div>
      <div className="space-y-2">
        <h3 className="font-medium text-sm">Embed code</h3>
        <Syntax
          code={code}
          language="bash"
          onCopy={() => toast.success('Embed code copied')}
          wrapLines
        />
        <p className="text-muted-foreground text-xs">
          Paste it into your site's HTML where the widget should appear.
          {note ? ` ${note}` : ''}
        </p>
      </div>
    </div>
  );
}
