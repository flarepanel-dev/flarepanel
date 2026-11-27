import type {
  AiAnswerProvider,
  IAiAnswer,
  IAiAnswerSetup,
  IAiAnswerSummary,
} from '@flarepanel/core/modules/ai-answers/ai-answers.constants';
import {
  AI_ANSWER_PROMPTS_MAX,
  AI_ANSWER_PROVIDER_LABELS,
  AI_ANSWER_PROVIDERS,
} from '@flarepanel/core/modules/ai-answers/ai-answers.constants';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckIcon,
  ChevronDownIcon,
  ExternalLinkIcon,
  MessageSquareQuoteIcon,
  MinusIcon,
  PlayIcon,
  PlusIcon,
  SettingsIcon,
  TriangleAlertIcon,
  XIcon,
} from 'lucide-react';
import { useId, useState } from 'react';
import { toast } from 'sonner';
import {
  AI_ANSWERS_DOCS_URL,
  percent,
  providersToAsk,
  rank,
  runStatusText,
  splitPrompts,
  splitTerms,
} from './ai-answers-view';
import { Skeleton } from '@/components/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button, LinkButton } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { handleError, useTRPC } from '@/integrations/trpc/react';
import { formatTimeAgoOrDateTime } from '@/utils/date';

const RUNNING_REFETCH_MS = 10_000;
const HTTP_URL = /^https?:\/\//i;

function useAiAnswers(projectId: string) {
  const trpc = useTRPC();
  const setup = useQuery(
    trpc.aiAnswers.getSetup.queryOptions(
      { projectId },
      {
        refetchInterval: (query) =>
          query.state.data?.tracker?.lastRunStatus === 'running'
            ? RUNNING_REFETCH_MS
            : false,
      }
    )
  );
  const running = setup.data?.tracker?.lastRunStatus === 'running';
  const summary = useQuery(
    trpc.aiAnswers.summary.queryOptions(
      { projectId },
      {
        enabled: Boolean(setup.data?.tracker),
        refetchInterval: running ? RUNNING_REFETCH_MS : false,
      }
    )
  );
  return { setup, summary };
}

function useRefresh() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries(trpc.aiAnswers.getSetup.pathFilter()),
      queryClient.invalidateQueries(trpc.aiAnswers.summary.pathFilter()),
    ]);
}

/**
 * AI answer visibility: whether ChatGPT and Claude name the brand when
 * people ask the tracked prompts, checked daily on the workspace's own key.
 */
export function AiAnswersCard({
  projectId,
  organizationId,
}: {
  projectId: string;
  organizationId: string;
}) {
  const { setup, summary } = useAiAnswers(projectId);
  const [editing, setEditing] = useState(false);
  const data = setup.data;
  const tracker = data?.tracker ?? null;
  const hasKey = Boolean(data && (data.keys.openai || data.keys.anthropic));

  return (
    <section aria-labelledby="ai-answers" className="card overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3">
        <div>
          <h2
            className="flex items-center gap-2 font-medium text-sm"
            id="ai-answers"
          >
            <MessageSquareQuoteIcon className="size-4 text-muted-foreground" />
            AI answers
            <Badge variant="secondary">Beta</Badge>
          </h2>
          <p className="text-muted-foreground text-xs">
            Whether ChatGPT and Claude name you when people ask. Checked daily
            with web search, on your workspace’s own AI key.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {tracker && !editing && data && (
            <RunNowButton projectId={projectId} setup={data} />
          )}
          {tracker && !editing && (
            <Button
              icon={SettingsIcon}
              onClick={() => setEditing(true)}
              size="sm"
              variant="ghost"
            >
              Settings
            </Button>
          )}
          <a
            className="flex items-center gap-1 text-muted-foreground text-xs hover:text-foreground"
            href={AI_ANSWERS_DOCS_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            How it works
            <ExternalLinkIcon className="size-3" />
          </a>
        </div>
      </div>
      <div className="p-4">
        {setup.isLoading || !data ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <div className="space-y-4">
            {!hasKey && <NoKeyNotice organizationId={organizationId} />}
            {!tracker || editing ? (
              <SettingsForm
                hasKey={hasKey}
                onCancel={tracker ? () => setEditing(false) : undefined}
                onDone={() => setEditing(false)}
                projectId={projectId}
                setup={data}
              />
            ) : (
              <Results
                isLoading={summary.isLoading}
                projectId={projectId}
                setup={data}
                summary={summary.data}
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function NoKeyNotice({ organizationId }: { organizationId: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-dashed p-3 text-sm">
      <p className="text-muted-foreground">
        Answers are checked with your own OpenAI or Anthropic key, so your
        provider bills the few calls a day directly. Add a key to start.
      </p>
      <LinkButton
        params={{ organizationId }}
        size="sm"
        to="/$organizationId/settings"
        variant="outline"
      >
        Add an AI key
      </LinkButton>
    </div>
  );
}

function RunNowButton({
  projectId,
  setup,
}: {
  projectId: string;
  setup: IAiAnswerSetup;
}) {
  const trpc = useTRPC();
  const refresh = useRefresh();
  const runNow = useMutation(
    trpc.aiAnswers.runNow.mutationOptions({
      onSuccess() {
        toast.success('Checking answers', {
          description: 'Results show up here in a minute or two.',
        });
        refresh();
      },
      onError: handleError,
    })
  );
  const running = setup.tracker?.lastRunStatus === 'running';
  const wait = setup.nextRunNowAt ? new Date(setup.nextRunNowAt) : null;
  const disabled =
    running ||
    setup.prompts.length === 0 ||
    providersToAsk(setup.tracker, setup.keys).length === 0 ||
    Boolean(wait && wait.getTime() > Date.now());
  return (
    <Button
      disabled={disabled}
      icon={PlayIcon}
      loading={runNow.isPending || running}
      onClick={() => runNow.mutate({ projectId })}
      size="sm"
      title={
        wait
          ? `You can check again ${formatTimeAgoOrDateTime(wait)}`
          : 'Ask every prompt now'
      }
      variant="outline"
    >
      Check now
    </Button>
  );
}

function SettingsForm({
  projectId,
  setup,
  hasKey,
  onCancel,
  onDone,
}: {
  projectId: string;
  setup: IAiAnswerSetup;
  hasKey: boolean;
  onCancel?: () => void;
  onDone: () => void;
}) {
  const trpc = useTRPC();
  const refresh = useRefresh();
  const ids = {
    brand: useId(),
    domains: useId(),
    competitors: useId(),
    prompts: useId(),
  };
  const tracker = setup.tracker;
  const [brand, setBrand] = useState(
    (tracker?.brandNames ?? setup.defaults.brandNames).join(', ')
  );
  const [domains, setDomains] = useState(
    (tracker?.brandDomains ?? setup.defaults.brandDomains).join(', ')
  );
  const [competitors, setCompetitors] = useState(
    (tracker?.competitors ?? []).join(', ')
  );
  const [providers, setProviders] = useState<AiAnswerProvider[]>(
    tracker?.providers.length
      ? tracker.providers
      : AI_ANSWER_PROVIDERS.filter((provider) => setup.keys[provider])
  );
  const [enabled, setEnabled] = useState(tracker?.enabled ?? true);
  const [prompts, setPrompts] = useState('');

  const save = useMutation(trpc.aiAnswers.saveSettings.mutationOptions());
  const addPrompt = useMutation(trpc.aiAnswers.addPrompt.mutationOptions());
  const runNow = useMutation(trpc.aiAnswers.runNow.mutationOptions());
  const firstSetup = !tracker;
  const newPrompts = splitPrompts(prompts).slice(0, AI_ANSWER_PROMPTS_MAX);
  const asked = providers.filter((provider) => setup.keys[provider]);

  const submit = async () => {
    try {
      await save.mutateAsync({
        projectId,
        brandNames: splitTerms(brand),
        brandDomains: splitTerms(domains),
        competitors: splitTerms(competitors),
        providers,
        enabled,
      });
      for (const prompt of newPrompts) {
        await addPrompt.mutateAsync({ projectId, prompt });
      }
      if (firstSetup && hasKey && newPrompts.length > 0 && asked.length > 0) {
        await runNow.mutateAsync({ projectId });
        toast.success('Tracking started', {
          description: 'The first answers show up here in a minute or two.',
        });
      } else {
        toast.success('Saved');
      }
      await refresh();
      onDone();
    } catch (error) {
      handleError(error as never);
      await refresh();
    }
  };
  const busy = save.isPending || addPrompt.isPending || runNow.isPending;

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={ids.brand}>Your brand</Label>
          <Input
            id={ids.brand}
            onChange={(event) => setBrand(event.target.value)}
            placeholder="Acme, Acme Analytics"
            value={brand}
          />
          <p className="text-muted-foreground text-xs">
            Names people use for you, comma separated.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={ids.domains}>Your domains</Label>
          <Input
            id={ids.domains}
            onChange={(event) => setDomains(event.target.value)}
            placeholder="acme.com"
            value={domains}
          />
          <p className="text-muted-foreground text-xs">
            A source on these counts as your site.
          </p>
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor={ids.competitors}>Competitors</Label>
          <Input
            id={ids.competitors}
            onChange={(event) => setCompetitors(event.target.value)}
            placeholder="Plausible, Fathom, PostHog"
            value={competitors}
          />
          <p className="text-muted-foreground text-xs">
            Up to 10. Your rank is your place among the brands an answer names.
          </p>
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="mb-1 font-medium text-sm">Ask</legend>
        <div className="flex flex-wrap gap-4">
          {AI_ANSWER_PROVIDERS.map((provider) => (
            <ProviderCheckbox
              checked={providers.includes(provider)}
              hasKey={setup.keys[provider]}
              key={provider}
              onChange={(checked) =>
                setProviders((list) =>
                  checked
                    ? [...new Set([...list, provider])]
                    : list.filter((p) => p !== provider)
                )
              }
              provider={provider}
            />
          ))}
          {tracker && (
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={enabled}
                onCheckedChange={(value) => setEnabled(value === true)}
              />
              Check daily
            </label>
          )}
        </div>
      </fieldset>

      {setup.prompts.length < AI_ANSWER_PROMPTS_MAX && firstSetup && (
        <div className="space-y-1.5">
          <Label htmlFor={ids.prompts}>Prompts to track</Label>
          <Textarea
            id={ids.prompts}
            onChange={(event) => setPrompts(event.target.value)}
            placeholder={
              'What is the best privacy-friendly analytics tool?\nWhich analytics tools run on Cloudflare?'
            }
            rows={4}
            value={prompts}
          />
          <p className="text-muted-foreground text-xs">
            One question per line, the way your customers would ask it. Up to{' '}
            {AI_ANSWER_PROMPTS_MAX}.{' '}
            {asked.length > 0
              ? `Each check asks every prompt once per assistant: ${newPrompts.length * asked.length} calls a day on your key.`
              : 'Checks start once the workspace has an AI key.'}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          disabled={splitTerms(brand).length === 0}
          loading={busy}
          type="submit"
        >
          {firstSetup ? 'Start tracking' : 'Save'}
        </Button>
        {onCancel && (
          <Button onClick={onCancel} type="button" variant="ghost">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

function ProviderCheckbox({
  provider,
  checked,
  hasKey,
  onChange,
}: {
  provider: AiAnswerProvider;
  checked: boolean;
  hasKey: boolean;
  onChange: (checked: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-center gap-2 text-sm">
      <Checkbox
        checked={checked && hasKey}
        disabled={!hasKey}
        id={id}
        onCheckedChange={(value) => onChange(value === true)}
      />
      <Label className="mb-0 cursor-pointer" htmlFor={id}>
        {AI_ANSWER_PROVIDER_LABELS[provider]}
        {!hasKey && (
          <span className="ml-1 font-normal text-muted-foreground text-xs">
            (needs an {provider === 'openai' ? 'OpenAI' : 'Anthropic'} key)
          </span>
        )}
      </Label>
    </div>
  );
}

function Results({
  projectId,
  setup,
  summary,
  isLoading,
}: {
  projectId: string;
  setup: IAiAnswerSetup;
  summary: IAiAnswerSummary | undefined;
  isLoading: boolean;
}) {
  const tracker = setup.tracker;
  if (!tracker) {
    return null;
  }
  const status = runStatusText(tracker);
  const brandName = tracker.brandNames[0] ?? 'You';

  return (
    <div className="space-y-6">
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-xs">
        <span className={status.tone === 'error' ? 'text-destructive' : ''}>
          {status.text}
        </span>
        {tracker.lastRunAt && tracker.lastRunStatus !== 'running' && (
          <span>
            Last check {formatTimeAgoOrDateTime(new Date(tracker.lastRunAt))}
          </span>
        )}
        <span>Last {summary?.days ?? 30} days</span>
      </p>
      {tracker.lastRunError && tracker.lastRunStatus !== 'running' && (
        <p className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-2 text-xs">
          <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0 text-destructive" />
          <span className="break-words">{tracker.lastRunError}</span>
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi
          isLoading={isLoading}
          label={`Answers naming ${brandName}`}
          value={percent(summary?.mentionRate ?? null)}
        />
        <Kpi
          isLoading={isLoading}
          label="Average rank when named"
          value={rank(summary?.avgPosition ?? null)}
        />
        <Kpi
          isLoading={isLoading}
          label="Answers using your site"
          value={percent(summary?.citationRate ?? null)}
        />
        <Kpi
          isLoading={isLoading}
          label="Answers checked"
          value={(summary?.answers ?? 0).toLocaleString()}
        />
      </div>

      {summary && summary.answers > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ShareOfVoice summary={summary} />
          <CitedDomains summary={summary} />
        </div>
      )}

      <PromptsTable projectId={projectId} setup={setup} summary={summary} />
    </div>
  );
}

function Kpi({
  label,
  value,
  isLoading,
}: {
  label: string;
  value: string;
  isLoading: boolean;
}) {
  return (
    <div>
      <div className="truncate text-muted-foreground text-xs">{label}</div>
      {isLoading ? (
        <Skeleton className="mt-1 h-7 w-16" />
      ) : (
        <div className="font-semibold text-2xl tabular-nums">{value}</div>
      )}
    </div>
  );
}

function ShareOfVoice({ summary }: { summary: IAiAnswerSummary }) {
  const max = Math.max(1, ...summary.shareOfVoice.map((row) => row.answers));
  return (
    <div>
      <h3 className="mb-2 font-medium text-xs">Named in answers</h3>
      <ul className="space-y-1.5 text-xs">
        {summary.shareOfVoice.slice(0, 8).map((row) => (
          <li className="flex items-center gap-2" key={row.name}>
            <span
              className={`w-28 shrink-0 truncate ${row.own ? 'font-medium' : ''}`}
            >
              {row.name}
            </span>
            <span className="h-2 flex-1 overflow-hidden rounded-sm bg-muted">
              <span
                className={`block h-full rounded-sm ${row.own ? 'bg-primary' : 'bg-muted-foreground/50'}`}
                style={{ width: `${(row.answers / max) * 100}%` }}
              />
            </span>
            <span className="w-16 shrink-0 text-right text-muted-foreground tabular-nums">
              {row.answers} of {summary.answers}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CitedDomains({ summary }: { summary: IAiAnswerSummary }) {
  if (summary.topCitedDomains.length === 0) {
    return (
      <div>
        <h3 className="mb-2 font-medium text-xs">Sources the answers used</h3>
        <p className="text-muted-foreground text-xs">No sources yet.</p>
      </div>
    );
  }
  return (
    <div>
      <h3 className="mb-2 font-medium text-xs">Sources the answers used</h3>
      <ul className="space-y-1.5 text-xs">
        {summary.topCitedDomains.map((row) => (
          <li
            className="flex items-center justify-between gap-2"
            key={row.domain}
          >
            <span className={`truncate ${row.own ? 'font-medium' : ''}`}>
              {row.domain}
              {row.own && (
                <Badge className="ml-2" variant="success">
                  Yours
                </Badge>
              )}
            </span>
            <span className="shrink-0 text-muted-foreground tabular-nums">
              {row.answers}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PromptsTable({
  projectId,
  setup,
  summary,
}: {
  projectId: string;
  setup: IAiAnswerSetup;
  summary: IAiAnswerSummary | undefined;
}) {
  const trpc = useTRPC();
  const refresh = useRefresh();
  const inputId = useId();
  const [draft, setDraft] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const addPrompt = useMutation(
    trpc.aiAnswers.addPrompt.mutationOptions({
      onSuccess() {
        setDraft('');
        refresh();
      },
      onError: handleError,
    })
  );
  const removePrompt = useMutation(
    trpc.aiAnswers.removePrompt.mutationOptions({
      onSuccess: () => refresh(),
      onError: handleError,
    })
  );
  const providers = providersToAsk(setup.tracker, setup.keys);
  const columns = providers.length > 0 ? providers : AI_ANSWER_PROVIDERS;
  const byId = new Map((summary?.prompts ?? []).map((row) => [row.id, row]));

  return (
    <div>
      <h3 className="mb-2 font-medium text-xs">
        Prompts ({setup.prompts.length} of {AI_ANSWER_PROMPTS_MAX})
      </h3>
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-muted-foreground text-xs">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Prompt</th>
              {columns.map((provider) => (
                <th className="px-3 py-2 text-left font-medium" key={provider}>
                  {AI_ANSWER_PROVIDER_LABELS[provider]}
                </th>
              ))}
              <th className="px-3 py-2 text-right font-medium">Named</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {setup.prompts.map((prompt) => {
              const row = byId.get(prompt.id);
              const latest = new Map(
                (row?.latest ?? []).map((answer) => [answer.provider, answer])
              );
              const expanded = open === prompt.id;
              return (
                <PromptRow
                  answers={columns.map((provider) => latest.get(provider))}
                  columns={columns.length}
                  expanded={expanded}
                  key={prompt.id}
                  mentionRate={row?.mentionRate ?? null}
                  onRemove={() =>
                    removePrompt.mutate({ projectId, promptId: prompt.id })
                  }
                  onToggle={() => setOpen(expanded ? null : prompt.id)}
                  prompt={prompt.prompt}
                />
              );
            })}
            {setup.prompts.length === 0 && (
              <tr>
                <td
                  className="px-3 py-4 text-muted-foreground text-xs"
                  colSpan={columns.length + 3}
                >
                  Add the questions your customers ask an assistant.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {setup.prompts.length < AI_ANSWER_PROMPTS_MAX && (
        <form
          className="mt-3 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (draft.trim()) {
              addPrompt.mutate({ projectId, prompt: draft });
            }
          }}
        >
          <Label className="sr-only" htmlFor={inputId}>
            New prompt
          </Label>
          <Input
            id={inputId}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Add a prompt, e.g. Which analytics tools are GDPR friendly?"
            value={draft}
          />
          <Button
            disabled={!draft.trim()}
            icon={PlusIcon}
            loading={addPrompt.isPending}
            type="submit"
            variant="outline"
          >
            Add
          </Button>
        </form>
      )}
    </div>
  );
}

function PromptRow({
  prompt,
  answers,
  columns,
  mentionRate,
  expanded,
  onToggle,
  onRemove,
}: {
  prompt: string;
  answers: (IAiAnswer | undefined)[];
  columns: number;
  mentionRate: number | null;
  expanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const hasAnswers = answers.some(Boolean);
  return (
    <>
      <tr className="align-top">
        <td className="px-3 py-2">
          <button
            aria-expanded={expanded}
            className="flex items-start gap-1.5 text-left disabled:cursor-default"
            disabled={!hasAnswers}
            onClick={onToggle}
            type="button"
          >
            <ChevronDownIcon
              className={`mt-0.5 size-3.5 shrink-0 text-muted-foreground transition-transform ${expanded ? '' : '-rotate-90'} ${hasAnswers ? '' : 'opacity-0'}`}
            />
            <span>{prompt}</span>
          </button>
        </td>
        {answers.map((answer, index) => (
          <td className="px-3 py-2" key={answer?.provider ?? index}>
            <AnswerCell answer={answer} />
          </td>
        ))}
        <td className="px-3 py-2 text-right tabular-nums">
          {percent(mentionRate)}
        </td>
        <td className="px-1 py-1.5">
          <Button
            aria-label="Remove prompt"
            onClick={onRemove}
            size="icon"
            variant="ghost"
          >
            <XIcon className="size-3.5" />
          </Button>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-muted/20">
          <td className="space-y-3 px-3 py-3" colSpan={columns + 3}>
            {answers.filter(Boolean).map((answer) => (
              <AnswerDetail
                answer={answer as IAiAnswer}
                key={answer?.provider}
              />
            ))}
          </td>
        </tr>
      )}
    </>
  );
}

function AnswerCell({ answer }: { answer: IAiAnswer | undefined }) {
  if (!answer) {
    return <span className="text-muted-foreground text-xs">Not checked</span>;
  }
  if (answer.error) {
    return (
      <span
        className="flex items-center gap-1 text-destructive text-xs"
        title={answer.error}
      >
        <TriangleAlertIcon className="size-3.5" />
        Failed
      </span>
    );
  }
  return (
    <span className="flex items-center gap-2 text-xs">
      {answer.mentioned ? (
        <span className="flex items-center gap-1 font-medium">
          <CheckIcon className="size-3.5 text-emerald-600" />
          {rank(answer.position)}
        </span>
      ) : (
        <span className="flex items-center gap-1 text-muted-foreground">
          <MinusIcon className="size-3.5" />
          Not named
        </span>
      )}
      {answer.ownCited && <Badge variant="outline">Your site</Badge>}
    </span>
  );
}

function AnswerDetail({ answer }: { answer: IAiAnswer }) {
  return (
    <div className="text-xs">
      <div className="mb-1 font-medium">
        {AI_ANSWER_PROVIDER_LABELS[answer.provider]}
        <span className="ml-2 font-normal text-muted-foreground">
          {answer.day}
          {answer.model ? ` · ${answer.model}` : ''}
        </span>
      </div>
      {answer.error ? (
        <p className="text-destructive">{answer.error}</p>
      ) : (
        <>
          <p className="text-muted-foreground">
            {answer.excerpt || 'The answer was empty.'}
          </p>
          {answer.competitors.length > 0 && (
            <p className="mt-1">
              <span className="text-muted-foreground">Also named: </span>
              {answer.competitors.join(', ')}
            </p>
          )}
          {answer.citations.length > 0 && (
            <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
              {answer.citations
                .filter((url) => HTTP_URL.test(url))
                .slice(0, 8)
                .map((url) => (
                  <li key={url}>
                    <a
                      className="underline underline-offset-2 hover:text-foreground"
                      href={url}
                      rel="noopener noreferrer nofollow"
                      target="_blank"
                    >
                      {safeHost(url)}
                    </a>
                  </li>
                ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

function safeHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
