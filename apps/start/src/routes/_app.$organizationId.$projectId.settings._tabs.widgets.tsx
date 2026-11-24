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
} from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { toast } from 'sonner';
import CopyInput from '@/components/forms/copy-input';
import FullPageLoadingState from '@/components/full-page-loading-state';
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

/** `/widget/<kind>?a=1&b=2`, skipping empty values. */
function widgetPath(
  dashboardUrl: string,
  kind: string,
  params: Record<string, string | boolean | undefined>
) {
  const search = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&');
  return `${dashboardUrl}/widget/${kind}${search ? `?${search}` : ''}`;
}

function themeParam(theme: EmbedTheme) {
  return theme === 'auto' ? undefined : theme;
}

function Component() {
  const { projectId, organizationId } = useAppParams();
  const { dashboardUrl } = useAppContext();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

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

  const toggle = (type: IWidgetType, enabled: boolean) =>
    toggleMutation.mutate({ projectId, organizationId, type, enabled });
  const saveOptions = (options: IWidgetOptions) =>
    optionsMutation.mutate({ projectId, organizationId, options });

  if (
    realtimeQuery.isLoading ||
    trafficQuery.isLoading ||
    counterQuery.isLoading
  ) {
    return <FullPageLoadingState />;
  }

  const realtime = realtimeQuery.data as StoredWidget | null | undefined;
  const traffic = trafficQuery.data as StoredWidget | null | undefined;
  const counter = counterQuery.data as StoredWidget | null | undefined;
  const pending = (type: IWidgetType) =>
    toggleMutation.isPending && toggleMutation.variables?.type === type;

  return (
    <div className="max-w-screen-lg space-y-6">
      <div className="space-y-1">
        <h2 className="font-semibold text-lg">Widgets</h2>
        <p className="text-muted-foreground">
          Show your numbers on your own site. Each widget gets a public link
          once it is on; turn it off and the link stops working. Previews show
          sample data until a widget is on.
        </p>
      </div>

      <RealtimeCard
        busy={pending('realtime')}
        dashboardUrl={dashboardUrl}
        onOptions={saveOptions}
        onToggle={(enabled) => toggle('realtime', enabled)}
        savingOptions={optionsMutation.isPending}
        widget={realtime}
      />
      <TrafficCard
        busy={pending('traffic')}
        dashboardUrl={dashboardUrl}
        onOptions={saveOptions}
        onToggle={(enabled) => toggle('traffic', enabled)}
        savingOptions={optionsMutation.isPending}
        widget={traffic}
      />
      <CounterCard
        busy={pending('counter')}
        dashboardUrl={dashboardUrl}
        onToggle={(enabled) => toggle('counter', enabled)}
        widget={counter}
      />
      <BadgeCard
        busy={pending('counter')}
        dashboardUrl={dashboardUrl}
        onToggle={(enabled) => toggle('counter', enabled)}
        widget={counter}
      />
    </div>
  );
}

interface CardProps {
  widget: StoredWidget | null | undefined;
  dashboardUrl: string;
  busy: boolean;
  onToggle: (enabled: boolean) => void;
}

interface OptionsProps {
  onOptions: (options: IWidgetOptions) => void;
  savingOptions: boolean;
}

/** The live link when the widget is on, else the sample-data preview. */
function useWidgetLinks(
  widget: StoredWidget | null | undefined,
  dashboardUrl: string,
  kind: string,
  theme: EmbedTheme
) {
  const live =
    widget?.public === true
      ? widgetPath(dashboardUrl, kind, {
          shareId: widget.id,
          theme: themeParam(theme),
        })
      : null;
  const preview =
    live ??
    widgetPath(dashboardUrl, kind, { demo: true, theme: themeParam(theme) });
  return { live, preview };
}

function RealtimeCard({
  widget,
  dashboardUrl,
  busy,
  onToggle,
  onOptions,
  savingOptions,
}: CardProps & OptionsProps) {
  const [theme, setTheme] = useState<EmbedTheme>('auto');
  const { live, preview } = useWidgetLinks(
    widget,
    dashboardUrl,
    'realtime',
    theme
  );
  const options =
    widget?.options.type === 'realtime' ? widget.options : DEFAULT_REALTIME;
  const set = (patch: Partial<IRealtimeWidgetOptions>) =>
    onOptions({ ...options, ...patch });

  return (
    <WidgetCard
      busy={busy}
      description="Visitors in the last 30 minutes with a per-minute chart, plus where they come from and what they read. Updates live."
      enabled={!!live}
      icon={RadioIcon}
      onToggle={onToggle}
      preview={
        <PreviewFrame
          height={420}
          // Options change what the widget returns, so reload the frame.
          key={`${options.countries}${options.referrers}${options.paths}`}
          live={!!live}
          src={preview}
          title="Realtime widget preview"
        />
      }
      title="Realtime"
    >
      {live && (
        <>
          <OptionGroup title="Show">
            <OptionSwitch
              checked={options.countries}
              disabled={savingOptions}
              id="realtime-countries"
              label="Countries"
              onChange={(countries) => set({ countries })}
            />
            <OptionSwitch
              checked={options.referrers}
              disabled={savingOptions}
              id="realtime-referrers"
              label="Sources"
              onChange={(referrers) => set({ referrers })}
            />
            <OptionSwitch
              checked={options.paths}
              disabled={savingOptions}
              id="realtime-paths"
              label="Pages"
              onChange={(paths) => set({ paths })}
            />
          </OptionGroup>
          <ThemePicker onChange={setTheme} value={theme} />
          <EmbedCode
            code={`<iframe src="${live}" width="100%" height="420" frameborder="0" style="border-radius: 12px;" title="Live visitors"></iframe>`}
            url={live}
          />
        </>
      )}
    </WidgetCard>
  );
}

function TrafficCard({
  widget,
  dashboardUrl,
  busy,
  onToggle,
  onOptions,
  savingOptions,
}: CardProps & OptionsProps) {
  const [theme, setTheme] = useState<EmbedTheme>('auto');
  const { live, preview } = useWidgetLinks(
    widget,
    dashboardUrl,
    'traffic',
    theme
  );
  const options =
    widget?.options.type === 'traffic' ? widget.options : DEFAULT_TRAFFIC;
  const set = (patch: Partial<ITrafficWidgetOptions>) =>
    onOptions({ ...options, ...patch });

  return (
    <WidgetCard
      badge="New"
      busy={busy}
      description="Visitors and pageviews over the last 7 or 30 days on a chart, with your top pages and sources. A public stats page in one embed."
      enabled={!!live}
      icon={AreaChartIcon}
      onToggle={onToggle}
      preview={
        <PreviewFrame
          height={440}
          key={`${options.range}${options.pages}${options.referrers}`}
          live={!!live}
          src={preview}
          title="Traffic widget preview"
        />
      }
      title="Traffic"
    >
      {live && (
        <>
          <OptionGroup title="Period">
            <ToggleGroup
              className="justify-start"
              disabled={savingOptions}
              onValueChange={(range) => {
                if (range === '7d' || range === '30d') {
                  set({ range });
                }
              }}
              type="single"
              value={options.range}
              variant="outline"
            >
              <ToggleGroupItem value="7d">7 days</ToggleGroupItem>
              <ToggleGroupItem value="30d">30 days</ToggleGroupItem>
            </ToggleGroup>
          </OptionGroup>
          <OptionGroup title="Show">
            <OptionSwitch
              checked={options.pages}
              disabled={savingOptions}
              id="traffic-pages"
              label="Top pages"
              onChange={(pages) => set({ pages })}
            />
            <OptionSwitch
              checked={options.referrers}
              disabled={savingOptions}
              id="traffic-referrers"
              label="Top sources"
              onChange={(referrers) => set({ referrers })}
            />
          </OptionGroup>
          <ThemePicker onChange={setTheme} value={theme} />
          <EmbedCode
            code={`<iframe src="${live}" width="100%" height="440" frameborder="0" style="border-radius: 12px;" title="Site traffic"></iframe>`}
            note="Numbers refresh every 5 minutes."
            url={live}
          />
        </>
      )}
    </WidgetCard>
  );
}

function CounterCard({ widget, dashboardUrl, busy, onToggle }: CardProps) {
  const [theme, setTheme] = useState<EmbedTheme>('auto');
  const { live, preview } = useWidgetLinks(
    widget,
    dashboardUrl,
    'counter',
    theme
  );

  return (
    <WidgetCard
      busy={busy}
      description="One line with a live dot and the number of people on your site right now. Fits in a header, a footer or a sidebar."
      enabled={!!live}
      icon={ActivityIcon}
      onToggle={onToggle}
      preview={
        <PreviewFrame
          height={32}
          live={!!live}
          src={preview}
          title="Live counter preview"
          width={220}
        />
      }
      title="Live counter"
    >
      {live && (
        <>
          <ThemePicker onChange={setTheme} value={theme} />
          <EmbedCode
            code={`<iframe src="${live}" height="32" width="220" style="border: none; overflow: hidden;" title="Visitors right now"></iframe>`}
            url={live}
          />
        </>
      )}
    </WidgetCard>
  );
}

function BadgeCard({ widget, dashboardUrl, busy, onToggle }: CardProps) {
  const { live, preview } = useWidgetLinks(
    widget,
    dashboardUrl,
    'badge',
    'auto'
  );

  return (
    <WidgetCard
      busy={busy}
      description="A badge with your visitors over the last 30 days. It shares its link with the live counter, so the two turn on and off together."
      enabled={!!live}
      icon={AwardIcon}
      onToggle={onToggle}
      preview={
        <PreviewFrame
          className="pointer-events-none"
          height={48}
          live={!!live}
          src={preview}
          title="Visitors badge preview"
          width={250}
        />
      }
      title="Visitors badge"
    >
      {live && (
        <EmbedCode
          code={`<a href="https://flarepanel.dev" style="display: inline-block; overflow: hidden; border-radius: 8px;">
  <iframe src="${live}" height="48" width="250" style="border: none; overflow: hidden; pointer-events: none;" title="Visitors badge"></iframe>
</a>`}
          url={live}
        />
      )}
    </WidgetCard>
  );
}

function WidgetCard({
  title,
  icon: Icon,
  badge,
  description,
  enabled,
  busy,
  onToggle,
  preview,
  children,
}: {
  title: string;
  icon: LucideIcon;
  badge?: string;
  description: string;
  enabled: boolean;
  busy: boolean;
  onToggle: (enabled: boolean) => void;
  preview: ReactNode;
  children?: ReactNode;
}) {
  const switchId = `widget-${title.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <Widget className="w-full">
      <WidgetHead className="row items-start justify-between gap-6">
        <div className="flex min-w-0 gap-3">
          <div className="shrink-0 self-start rounded-lg bg-def-200 p-2">
            <Icon size={18} />
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <label className="title" htmlFor={switchId}>
                {title}
              </label>
              {badge && (
                <span className="rounded-full bg-chart-0/15 px-2 py-px font-medium text-chart-0 text-xs">
                  {badge}
                </span>
              )}
            </div>
            <p className="max-w-prose text-muted-foreground text-sm">
              {description}
            </p>
          </div>
        </div>
        <Switch
          checked={enabled}
          disabled={busy}
          id={switchId}
          onCheckedChange={onToggle}
        />
      </WidgetHead>
      <WidgetBody
        className={cn(
          'grid gap-6',
          children && 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]'
        )}
      >
        {children && <div className="min-w-0 space-y-5">{children}</div>}
        <div className="min-w-0">{preview}</div>
      </WidgetBody>
    </Widget>
  );
}

function PreviewFrame({
  src,
  title,
  height,
  width,
  live,
  className,
}: {
  src: string;
  title: string;
  height: number;
  width?: number;
  live: boolean;
  className?: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border bg-def-100">
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
      <div className={cn('flex justify-center', width && 'p-6')}>
        <iframe
          className={cn('block border-0', className)}
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
