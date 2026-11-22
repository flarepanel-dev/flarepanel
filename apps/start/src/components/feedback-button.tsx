import { op } from '@/utils/op';

/** FlarePanel collects feedback as GitHub issues; no third-party widget. */
export const PUBLIC_FEEDBACK_URL =
  'https://github.com/flarepanel-dev/flarepanel/issues/new/choose';

export function FeedbackButton({
  className,
  children = 'Give feedback',
}: {
  className?: string;
  children?: React.ReactNode;
}) {
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
