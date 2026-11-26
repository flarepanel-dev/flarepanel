import { useMutation, useQuery } from '@tanstack/react-query';
import { useLocation, useRouteContext } from '@tanstack/react-router';
import {
  BugIcon,
  CheckIcon,
  CircleHelpIcon,
  ImagePlusIcon,
  LightbulbIcon,
  MessageSquareIcon,
  XIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { popModal } from '.';
import {
  isAcceptedImage,
  MAX_SCREENSHOTS,
  prepareScreenshot,
  type Screenshot,
} from './feedback-screenshots';
import { ModalContent, ModalHeader } from './Modal/Container';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAppParams } from '@/hooks/use-app-params';
import { handleError, useTRPC } from '@/integrations/trpc/react';
import { cn } from '@/utils/cn';
import { op } from '@/utils/op';

type FeedbackType = 'idea' | 'bug' | 'question' | 'other';

const TYPES: {
  id: FeedbackType;
  label: string;
  icon: typeof BugIcon;
  placeholder: string;
}[] = [
  {
    id: 'idea',
    label: 'Idea',
    icon: LightbulbIcon,
    placeholder: 'What would make FlarePanel better for you?',
  },
  {
    id: 'bug',
    label: 'Bug',
    icon: BugIcon,
    placeholder:
      'What happened, and what did you expect instead? Steps to reproduce help a lot.',
  },
  {
    id: 'question',
    label: 'Question',
    icon: CircleHelpIcon,
    placeholder: 'What would you like to know?',
  },
  {
    id: 'other',
    label: 'Other',
    icon: MessageSquareIcon,
    placeholder: "What's on your mind?",
  },
];

const MAX = 4000;

export default function Feedback({
  topic,
  defaultType = 'idea',
}: {
  /** Where it was opened from, such as "AI observability". */
  topic?: string;
  defaultType?: FeedbackType;
}) {
  const trpc = useTRPC();
  const { organizationId, projectId } = useAppParams();
  const pathname = useLocation().pathname;
  const context = useRouteContext({ strict: false }) as {
    session?: { user?: { email?: string } | null } | null;
  };
  const email = context.session?.user?.email;
  const [type, setType] = useState<FeedbackType>(defaultType);
  const [message, setMessage] = useState('');
  const [allowReply, setAllowReply] = useState(true);
  const [shots, setShots] = useState<Screenshot[]>([]);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const config = useQuery({
    ...trpc.feedback.config.queryOptions(),
    staleTime: Number.POSITIVE_INFINITY,
  });
  const canAttach = config.data?.screenshots === true;

  // Free the preview URLs when the form closes.
  const shotsRef = useRef(shots);
  shotsRef.current = shots;
  useEffect(
    () => () => {
      for (const s of shotsRef.current) {
        URL.revokeObjectURL(s.preview);
      }
    },
    []
  );

  const addFiles = async (files: File[]) => {
    if (!canAttach) {
      return;
    }
    const images = files.filter(isAcceptedImage);
    if (images.length < files.length) {
      toast.error('Screenshots must be PNG, JPEG or WebP images.');
    }
    const room = MAX_SCREENSHOTS - shots.length;
    if (images.length > room) {
      toast.error(`You can attach up to ${MAX_SCREENSHOTS} screenshots.`);
    }
    if (room <= 0 || images.length === 0) {
      return;
    }
    setBusy(true);
    try {
      const prepared: Screenshot[] = [];
      for (const file of images.slice(0, room)) {
        try {
          prepared.push(await prepareScreenshot(file));
        } catch (error) {
          toast.error((error as Error).message || 'Could not read that image.');
        }
      }
      setShots((current) =>
        [...current, ...prepared].slice(0, MAX_SCREENSHOTS)
      );
    } finally {
      setBusy(false);
    }
  };

  const removeShot = (id: string) => {
    setShots((current) => {
      const gone = current.find((s) => s.id === id);
      if (gone) {
        URL.revokeObjectURL(gone.preview);
      }
      return current.filter((s) => s.id !== id);
    });
  };

  const mutation = useMutation(
    trpc.feedback.send.mutationOptions({
      onSuccess: () => op.track('feedback_sent', { type }),
      onError: handleError,
    })
  );

  const current = TYPES.find((t) => t.id === type) ?? TYPES[0]!;
  const canSend = message.trim().length >= 3 && !mutation.isPending && !busy;
  const send = () => {
    if (!canSend) {
      return;
    }
    mutation.mutate({
      type,
      message: message.trim(),
      page: topic ? `${pathname} · ${topic}` : pathname,
      allowReply: Boolean(email) && allowReply,
      organizationId: organizationId || undefined,
      projectId: projectId || undefined,
      screenshots: shots.map(({ contentType, data }) => ({
        contentType,
        data,
      })),
    });
  };

  if (mutation.isSuccess) {
    return (
      <ModalContent className="max-w-md">
        <div className="col items-center gap-3 px-2 py-6 text-center">
          <div className="center-center size-12 rounded-full bg-ember/15 text-ember">
            <CheckIcon className="size-6" strokeWidth={2.5} />
          </div>
          <div className="font-semibold text-lg">Thanks, we got it</div>
          <p className="max-w-[34ch] text-muted-foreground">
            We read every message.
            {email && allowReply
              ? ` If we have a question, we will email ${email}.`
              : ''}
          </p>
          <Button className="mt-2" onClick={() => popModal()}>
            Close
          </Button>
        </div>
      </ModalContent>
    );
  }

  return (
    <ModalContent className="max-w-lg">
      <ModalHeader
        text="Ideas, bugs or questions: it goes straight to the team."
        title={topic ? `Feedback on ${topic}` : 'Send feedback'}
      />
      {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: dropping and pasting images is a shortcut; the Add screenshot button is the keyboard path */}
      <form
        className={cn(
          'col gap-4 rounded-md transition-shadow',
          dragging &&
            'ring-2 ring-ember/60 ring-offset-4 ring-offset-background'
        )}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setDragging(false);
          }
        }}
        onDragOver={(e) => {
          if (canAttach && e.dataTransfer.types.includes('Files')) {
            e.preventDefault();
            setDragging(true);
          }
        }}
        onDrop={(e) => {
          if (!canAttach) {
            return;
          }
          e.preventDefault();
          setDragging(false);
          addFiles(Array.from(e.dataTransfer.files));
        }}
        onPaste={(e) => {
          const files = Array.from(e.clipboardData.files);
          if (canAttach && files.length > 0) {
            e.preventDefault();
            addFiles(files);
          }
        }}
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <div
          aria-label="Kind of feedback"
          className="grid grid-cols-4 gap-2"
          role="radiogroup"
        >
          {TYPES.map((t) => {
            const selected = t.id === type;
            return (
              <button
                aria-checked={selected}
                className={cn(
                  'col h-16 items-center justify-center gap-1.5 rounded-md border text-xs transition-colors',
                  selected
                    ? 'border-ember/60 bg-ember/10 text-foreground'
                    : 'border-border text-muted-foreground hover:bg-def-100 hover:text-foreground'
                )}
                key={t.id}
                onClick={() => setType(t.id)}
                role="radio"
                type="button"
              >
                <t.icon
                  className={cn('size-4', selected ? 'text-ember' : '')}
                />
                {t.label}
              </button>
            );
          })}
        </div>
        <div className="col gap-1.5">
          <Textarea
            aria-label="Your feedback"
            autoFocus
            className="min-h-36 resize-y"
            maxLength={MAX}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={current.placeholder}
            value={message}
          />
          <div className="row justify-between text-2xs text-muted-foreground">
            <span>
              Sent with this page and your browser type
              {shots.length ? ' and your screenshots.' : ', nothing else.'}
            </span>
            <span className="tabular-nums">
              {message.length}/{MAX}
            </span>
          </div>
        </div>
        {canAttach ? (
          <div className="col gap-2">
            <div className="row flex-wrap items-center gap-2">
              {shots.map((shot, i) => (
                <div
                  className="group relative size-16 overflow-hidden rounded-md border border-border bg-def-100"
                  key={shot.id}
                >
                  <img
                    alt={`Screenshot ${i + 1}`}
                    className="size-full object-cover"
                    height={64}
                    src={shot.preview}
                    width={64}
                  />
                  <button
                    aria-label={`Remove screenshot ${i + 1}`}
                    className="center-center absolute top-1 right-1 size-5 rounded-full bg-background/90 text-foreground opacity-90 shadow-sm transition-opacity hover:opacity-100"
                    onClick={() => removeShot(shot.id)}
                    type="button"
                  >
                    <XIcon className="size-3" />
                  </button>
                </div>
              ))}
              {shots.length < MAX_SCREENSHOTS ? (
                <Button
                  className="h-16 gap-2 border-dashed px-3 text-muted-foreground"
                  disabled={busy}
                  loading={busy}
                  onClick={() => fileInput.current?.click()}
                  type="button"
                  variant="outline"
                >
                  <ImagePlusIcon className="size-4" />
                  <span className="col items-start text-left leading-tight">
                    <span className="text-foreground text-sm">
                      Add screenshot
                    </span>
                    <span className="text-2xs">or paste, or drop here</span>
                  </span>
                </Button>
              ) : null}
              <input
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                multiple
                onChange={(e) => {
                  addFiles(Array.from(e.target.files ?? []));
                  e.target.value = '';
                }}
                ref={fileInput}
                type="file"
              />
            </div>
            {shots.length ? (
              <p className="text-2xs text-muted-foreground">
                Screenshots can show your analytics data. Only the FlarePanel
                team sees them, and they are deleted after 90 days.
              </p>
            ) : null}
          </div>
        ) : null}
        {email ? (
          <label className="row cursor-pointer items-center gap-2 text-sm">
            <Checkbox
              checked={allowReply}
              onCheckedChange={(v) => setAllowReply(v === true)}
            />
            <span>
              You can reply to me at{' '}
              <span className="font-medium text-foreground">{email}</span>
            </span>
          </label>
        ) : null}
        <DialogFooter className="row items-center gap-2 sm:justify-between">
          <span className="hidden text-2xs text-muted-foreground sm:block">
            ⌘ Enter to send
          </span>
          <div className="row gap-2">
            <Button onClick={() => popModal()} type="button" variant="ghost">
              Cancel
            </Button>
            <Button
              disabled={!canSend}
              loading={mutation.isPending}
              type="submit"
            >
              Send feedback
            </Button>
          </div>
        </DialogFooter>
      </form>
    </ModalContent>
  );
}
