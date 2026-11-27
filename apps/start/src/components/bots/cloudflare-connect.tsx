import type {
  ICloudflareConnection,
  ICloudflareSetup,
  ICloudflareZone,
} from '@flarepanel/core/modules/cloudflare-analytics/cloudflare-analytics.constants';
import { parseHostnames } from '@flarepanel/core/modules/cloudflare-analytics/cloudflare-analytics.constants';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CloudIcon,
  ExternalLinkIcon,
  RefreshCwIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { useId, useState } from 'react';
import { toast } from 'sonner';
import { CLOUDFLARE_DOCS_URL, cloudflareSyncSummary } from './bot-stats';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { handleError, useTRPC } from '@/integrations/trpc/react';
import { formatTimeAgoOrDateTime } from '@/utils/date';

/** A Cloudflare dashboard link that opens the API token page. */
const CLOUDFLARE_TOKENS_URL = 'https://dash.cloudflare.com/profile/api-tokens';
const PENDING_REFETCH_MS = 10_000;

/** The Cloudflare setup this page shows, or null while it loads. */
export function useCloudflareSetup(projectId: string) {
  const trpc = useTRPC();
  return useQuery(
    trpc.cloudflareAnalytics.getSetup.queryOptions(
      { projectId },
      {
        // Poll while a first sync is pending, so the card updates by itself.
        refetchInterval: (query) =>
          query.state.data?.connection &&
          !query.state.data.connection.lastSyncedAt
            ? PENDING_REFETCH_MS
            : false,
      }
    )
  );
}

/**
 * Connect Cloudflare (no code): a read-only API token and a zone, and an
 * hourly job imports AI crawler hits from the zone's analytics.
 */
export function CloudflareConnectCard({
  projectId,
  setup,
}: {
  projectId: string;
  setup: ICloudflareSetup;
}) {
  const [editing, setEditing] = useState(false);
  const connection = setup.connection;

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <h3 className="flex items-center gap-2 font-medium text-sm">
          <CloudIcon className="size-4 text-muted-foreground" />
          Cloudflare
          {connection ? (
            <Badge variant="success">Connected</Badge>
          ) : (
            <Badge variant="secondary">No code needed</Badge>
          )}
        </h3>
        <a
          className="flex items-center gap-1 text-muted-foreground text-xs hover:text-foreground"
          href={CLOUDFLARE_DOCS_URL}
          rel="noopener noreferrer"
          target="_blank"
        >
          How it works
          <ExternalLinkIcon className="size-3" />
        </a>
      </div>
      <div className="p-4">
        {setup.available ? (
          connection && !editing ? (
            <ConnectedView
              connection={connection}
              onEdit={() => setEditing(true)}
              projectId={projectId}
            />
          ) : (
            <ConnectForm
              connection={connection}
              defaultHostnames={setup.defaultHostnames}
              onCancel={connection ? () => setEditing(false) : undefined}
              onDone={() => setEditing(false)}
              projectId={projectId}
            />
          )
        ) : (
          <p className="text-muted-foreground text-sm">
            Importing from Cloudflare needs the Cloudflare Workers deployment of
            FlarePanel, where bot traffic is kept.
          </p>
        )}
      </div>
    </div>
  );
}

function ConnectedView({
  projectId,
  connection,
  onEdit,
}: {
  projectId: string;
  connection: ICloudflareConnection;
  onEdit: () => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const refresh = () =>
    queryClient.invalidateQueries(
      trpc.cloudflareAnalytics.getSetup.pathFilter()
    );
  const syncNow = useMutation(
    trpc.cloudflareAnalytics.syncNow.mutationOptions({
      onSuccess() {
        toast.success('Sync queued', {
          description: 'New crawler hits show up here in a minute or two.',
        });
        setTimeout(refresh, PENDING_REFETCH_MS);
      },
      onError: handleError,
    })
  );
  const disconnect = useMutation(
    trpc.cloudflareAnalytics.disconnect.mutationOptions({
      onSuccess() {
        toast.success('Cloudflare disconnected', {
          description:
            'Imported hits stay until they expire after 30 days. Delete the token in Cloudflare too.',
        });
        refresh();
      },
      onError: handleError,
    })
  );
  const summary = cloudflareSyncSummary(connection);

  return (
    <div className="space-y-3 text-sm">
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5">
        <dt className="text-muted-foreground">Zone</dt>
        <dd className="truncate">{connection.zoneName || connection.zoneId}</dd>
        <dt className="text-muted-foreground">Token</dt>
        <dd className="tabular-nums">····{connection.tokenHint}</dd>
        <dt className="text-muted-foreground">Hostnames</dt>
        <dd className="truncate">
          {connection.hostnames.length > 0
            ? connection.hostnames.join(', ')
            : 'Every hostname in the zone'}
        </dd>
        <dt className="text-muted-foreground">Last sync</dt>
        <dd>
          {connection.lastSyncedAt
            ? `${formatTimeAgoOrDateTime(new Date(connection.lastSyncedAt))} · `
            : ''}
          <span
            className={
              summary.tone === 'error' ? 'text-destructive' : undefined
            }
          >
            {summary.text}
          </span>
        </dd>
      </dl>
      {connection.lastSyncError && (
        <p className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-2 text-xs">
          <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0 text-destructive" />
          <span className="break-words">{connection.lastSyncError}</span>
        </p>
      )}
      <p className="text-muted-foreground text-xs">
        Synced every hour. Cloudflare samples its analytics, so these numbers
        are estimates. Hours your server snippet reported keep the snippet's
        exact numbers.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          icon={RefreshCwIcon}
          loading={syncNow.isPending}
          onClick={() => syncNow.mutate({ projectId })}
          size="sm"
          variant="outline"
        >
          Sync now
        </Button>
        <Button onClick={onEdit} size="sm" variant="outline">
          Change zone or token
        </Button>
        <Button
          loading={disconnect.isPending}
          onClick={() => disconnect.mutate({ projectId })}
          size="sm"
          variant="ghost"
        >
          Disconnect
        </Button>
      </div>
    </div>
  );
}

function ConnectForm({
  projectId,
  connection,
  defaultHostnames,
  onCancel,
  onDone,
}: {
  projectId: string;
  connection: ICloudflareConnection | null;
  defaultHostnames: string[];
  onCancel?: () => void;
  onDone: () => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const tokenId = useId();
  const zoneId = useId();
  const hostsId = useId();
  const [token, setToken] = useState('');
  const [zones, setZones] = useState<ICloudflareZone[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [zone, setZone] = useState(connection?.zoneId ?? '');
  const [hostnames, setHostnames] = useState(
    (connection?.hostnames ?? defaultHostnames).join(', ')
  );

  const listZones = useMutation(
    trpc.cloudflareAnalytics.listZones.mutationOptions({
      onSuccess(result) {
        setZones(result.zones);
        setListError(result.listError);
        const [only] = result.zones;
        if (!zone && only && result.zones.length === 1) {
          setZone(only.id);
        }
      },
      onError: handleError,
    })
  );
  const connect = useMutation(
    trpc.cloudflareAnalytics.connect.mutationOptions({
      onSuccess() {
        toast.success('Cloudflare connected', {
          description:
            'The first sync reads the last 7 days; crawler hits show up here in a few minutes.',
        });
        setToken('');
        queryClient.invalidateQueries(
          trpc.cloudflareAnalytics.getSetup.pathFilter()
        );
        onDone();
      },
      onError: handleError,
    })
  );

  const trimmedToken = token.trim();
  const canUseStoredToken = Boolean(connection) && !trimmedToken;
  const checked = zones !== null;
  const showZoneStep = checked || Boolean(connection);

  return (
    <form
      className="space-y-4 text-sm"
      onSubmit={(event) => {
        event.preventDefault();
        if (!showZoneStep) {
          listZones.mutate({ projectId, token: trimmedToken });
          return;
        }
        connect.mutate({
          projectId,
          ...(trimmedToken ? { token: trimmedToken } : {}),
          zoneId: zone.trim(),
          hostnames: parseHostnames(hostnames),
        });
      }}
    >
      <p className="text-muted-foreground">
        On Cloudflare? Import AI crawler and search bot hits from your zone's
        analytics, no code on your site. Create a{' '}
        <a
          className="underline underline-offset-2 hover:text-foreground"
          href={CLOUDFLARE_TOKENS_URL}
          rel="noopener noreferrer"
          target="_blank"
        >
          custom API token
        </a>{' '}
        with <strong>Zone → Analytics → Read</strong> (add{' '}
        <strong>Zone → Zone → Read</strong> to pick the zone from a list), for
        this zone only.
      </p>
      <div className="space-y-1.5">
        <Label htmlFor={tokenId}>API token</Label>
        <div className="flex gap-2">
          <Input
            autoComplete="off"
            className="flex-1"
            id={tokenId}
            onChange={(event) => setToken(event.target.value)}
            placeholder={
              connection
                ? `Keep the saved token ····${connection.tokenHint}`
                : 'Paste the token'
            }
            spellCheck={false}
            type="password"
            value={token}
          />
          {showZoneStep && (
            <Button
              disabled={!(trimmedToken || canUseStoredToken)}
              loading={listZones.isPending}
              onClick={() =>
                listZones.mutate({
                  projectId,
                  ...(trimmedToken ? { token: trimmedToken } : {}),
                })
              }
              type="button"
              variant="outline"
            >
              List zones
            </Button>
          )}
        </div>
      </div>
      {showZoneStep && (
        <>
          <div className="space-y-1.5">
            <Label htmlFor={zoneId}>Zone</Label>
            {zones && zones.length > 0 ? (
              <Select onValueChange={setZone} value={zone}>
                <SelectTrigger id={zoneId}>
                  <SelectValue placeholder="Pick the zone of this site" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                autoComplete="off"
                id={zoneId}
                onChange={(event) => setZone(event.target.value)}
                placeholder="Zone ID (32 characters, on the zone's Overview page)"
                spellCheck={false}
                value={zone}
              />
            )}
            {listError && (
              <p className="text-muted-foreground text-xs">{listError}</p>
            )}
            {zones && zones.length === 0 && !listError && (
              <p className="text-muted-foreground text-xs">
                This token sees no zones. Enter the zone ID instead.
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={hostsId}>Hostnames</Label>
            <Input
              id={hostsId}
              onChange={(event) => setHostnames(event.target.value)}
              placeholder="Every hostname in the zone"
              spellCheck={false}
              value={hostnames}
            />
            <p className="text-muted-foreground text-xs">
              Only requests to these hostnames are imported, comma separated.
              Leave empty for every hostname in the zone.
            </p>
          </div>
        </>
      )}
      <div className="flex gap-2">
        {showZoneStep ? (
          <Button
            disabled={!(zone.trim() && (trimmedToken || canUseStoredToken))}
            loading={connect.isPending}
            type="submit"
          >
            {connection ? 'Save' : 'Connect'}
          </Button>
        ) : (
          <Button
            disabled={!trimmedToken}
            loading={listZones.isPending}
            type="submit"
          >
            Continue
          </Button>
        )}
        {onCancel && (
          <Button onClick={onCancel} type="button" variant="ghost">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
