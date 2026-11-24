import { isOrganizationAdminRole } from '@flarepanel/core/modules/organization/organization.constants';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLinkIcon, KeyRoundIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Widget, WidgetBody, WidgetHead } from '@/components/widget';
import { handleError, useTRPC } from '@/integrations/trpc/react';
import { formatDate } from '@/utils/date';

type Provider = 'openai' | 'anthropic';

const PROVIDERS: {
  id: Provider;
  label: string;
  placeholder: string;
  keysUrl: string;
}[] = [
  {
    id: 'openai',
    label: 'OpenAI',
    placeholder: 'sk-...',
    keysUrl: 'https://platform.openai.com/api-keys',
  },
  {
    id: 'anthropic',
    label: 'Anthropic',
    placeholder: 'sk-ant-...',
    keysUrl: 'https://console.anthropic.com/settings/keys',
  },
];

/**
 * Bring your own key: the assistant, AI report drafts, AI filters and insight
 * summaries run on the workspace's own provider key, billed by the provider.
 */
export default function AiKeys({ organizationId }: { organizationId: string }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: myAccess } = useQuery(
    trpc.organization.myAccess.queryOptions({ organizationId })
  );
  const keys = useQuery(trpc.chat.aiKeys.queryOptions({ organizationId }));
  const isAdmin = Boolean(myAccess && isOrganizationAdminRole(myAccess.role));

  const refresh = () => {
    queryClient.invalidateQueries(trpc.chat.aiKeys.pathFilter());
    queryClient.invalidateQueries(trpc.chat.models.pathFilter());
  };

  return (
    <Widget>
      <WidgetHead className="flex items-center justify-between">
        <span className="title">AI provider key</span>
      </WidgetHead>
      <WidgetBody className="col gap-5">
        <p className="text-muted-foreground text-sm">
          The AI assistant, report drafts, AI filters and insight summaries run
          on your own OpenAI or Anthropic key. Your provider bills you directly
          for what you use; FlarePanel adds no AI charges and no AI limits
          beyond a short per-minute burst limit. The key is stored encrypted and
          is never shown again after you save it.
        </p>
        {PROVIDERS.map((provider) => (
          <ProviderKey
            isAdmin={isAdmin}
            key={provider.id}
            onChange={refresh}
            organizationId={organizationId}
            provider={provider}
            saved={keys.data?.find((row) => row.provider === provider.id)}
          />
        ))}
        {!isAdmin && (
          <p className="text-muted-foreground text-sm">
            Only workspace admins can add or remove keys.
          </p>
        )}
      </WidgetBody>
    </Widget>
  );
}

function ProviderKey({
  provider,
  saved,
  isAdmin,
  organizationId,
  onChange,
}: {
  provider: (typeof PROVIDERS)[number];
  saved: { keyHint: string; updatedAt: Date | string } | undefined;
  isAdmin: boolean;
  organizationId: string;
  onChange: () => void;
}) {
  const trpc = useTRPC();
  const [value, setValue] = useState('');
  const [editing, setEditing] = useState(false);

  const save = useMutation(
    trpc.chat.saveAiKey.mutationOptions({
      onSuccess() {
        toast.success(`${provider.label} key saved`, {
          description: 'It works: AI features now run on your key.',
        });
        setValue('');
        setEditing(false);
        onChange();
      },
      onError: handleError,
    })
  );
  const remove = useMutation(
    trpc.chat.removeAiKey.mutationOptions({
      onSuccess() {
        toast.success(`${provider.label} key removed`);
        onChange();
      },
      onError: handleError,
    })
  );

  const showForm = isAdmin && (!saved || editing);

  return (
    <div className="col gap-3 rounded-md border p-4">
      <div className="row items-center justify-between gap-3">
        <div className="row items-center gap-2">
          <KeyRoundIcon className="size-4 text-muted-foreground" />
          <span className="font-medium">{provider.label}</span>
          {saved ? (
            <Badge variant="success">Connected ····{saved.keyHint}</Badge>
          ) : (
            <Badge variant="secondary">No key</Badge>
          )}
        </div>
        <a
          className="row items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
          href={provider.keysUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          Get a key
          <ExternalLinkIcon className="size-3.5" />
        </a>
      </div>
      {saved && !editing && (
        <div className="row items-center justify-between gap-3">
          <span className="text-muted-foreground text-sm">
            Added {formatDate(new Date(saved.updatedAt))}
          </span>
          {isAdmin && (
            <div className="row gap-2">
              <Button
                onClick={() => setEditing(true)}
                size="sm"
                variant="outline"
              >
                Replace
              </Button>
              <Button
                loading={remove.isPending}
                onClick={() =>
                  remove.mutate({ organizationId, provider: provider.id })
                }
                size="sm"
                variant="outline"
              >
                Remove
              </Button>
            </div>
          )}
        </div>
      )}
      {showForm && (
        <form
          className="row gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (value.trim()) {
              save.mutate({
                organizationId,
                provider: provider.id,
                apiKey: value.trim(),
              });
            }
          }}
        >
          <Input
            aria-label={`${provider.label} API key`}
            autoComplete="off"
            className="flex-1"
            onChange={(event) => setValue(event.target.value)}
            placeholder={provider.placeholder}
            spellCheck={false}
            type="password"
            value={value}
          />
          <Button
            disabled={!value.trim()}
            loading={save.isPending}
            type="submit"
          >
            Check and save
          </Button>
          {editing && (
            <Button
              onClick={() => {
                setEditing(false);
                setValue('');
              }}
              type="button"
              variant="ghost"
            >
              Cancel
            </Button>
          )}
        </form>
      )}
    </div>
  );
}
