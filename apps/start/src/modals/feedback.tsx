import { useMutation } from '@tanstack/react-query';
import { useLocation, useRouteContext } from '@tanstack/react-router';
import {
  BugIcon,
  CheckIcon,
  CircleHelpIcon,
  LightbulbIcon,
  MessageSquareIcon,
} from 'lucide-react';
import { useState } from 'react';
import { popModal } from '.';
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

  const mutation = useMutation(
    trpc.feedback.send.mutationOptions({
      onSuccess: () => op.track('feedback_sent', { type }),
      onError: handleError,
    })
  );

  const current = TYPES.find((t) => t.id === type) ?? TYPES[0]!;
  const canSend = message.trim().length >= 3 && !mutation.isPending;
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
      <form
        className="col gap-4"
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
              Sent with this page and your browser type, nothing else.
            </span>
            <span className="tabular-nums">
              {message.length}/{MAX}
            </span>
          </div>
        </div>
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
