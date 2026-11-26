import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/integrations/trpc/react';
import { pushModal } from '@/modals';
import { op } from '@/utils/op';

/**
 * Where feedback goes when the server does not take it in the app (a
 * self-hosted install without FEEDBACK_EMAIL or FEEDBACK_GITHUB_TOKEN).
 */
export const PUBLIC_FEEDBACK_URL =
  'https://github.com/flarepanel-dev/flarepanel/issues/new/choose';

/** True when "Give feedback" should open the in-app form. */
export function useInAppFeedback(): boolean {
  const trpc = useTRPC();
  const config = useQuery({
    ...trpc.feedback.config.queryOptions(),
    staleTime: Number.POSITIVE_INFINITY,
    retry: false,
  });
  return config.data?.inApp === true;
}

export function openFeedback(topic?: string) {
  op.track('feedback_button_clicked', topic ? { topic } : undefined);
  pushModal('Feedback', topic ? { topic } : {});
}

export function FeedbackButton({
  className,
  children = 'Give feedback',
  topic,
}: {
  className?: string;
  children?: React.ReactNode;
  /** Where the button sits, such as "AI observability". */
  topic?: string;
}) {
  const inApp = useInAppFeedback();
  if (inApp) {
    return (
      <button
        className={className}
        onClick={() => openFeedback(topic)}
        type="button"
      >
        {children}
      </button>
    );
  }
  return (
    <a
      className={className}
      href={PUBLIC_FEEDBACK_URL}
      onClick={() => op.track('feedback_button_clicked')}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
    </a>
  );
}
