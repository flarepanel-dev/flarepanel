import { Img, Link, Section, Text } from '@react-email/components';
import { z } from 'zod';
import { Layout } from '../components/layout';

// Sent to the team inbox (FEEDBACK_EMAIL) when someone uses "Give feedback"
// in the dashboard. Internal: no unsubscribe category.

export const zFeedback = z.object({
  type: z.enum(['idea', 'bug', 'question', 'other']),
  message: z.string(),
  page: z.string().optional(),
  from: z.string().optional(),
  organization: z.string().optional(),
  project: z.string().optional(),
  userAgent: z.string().optional(),
  issueUrl: z.string().optional(),
  screenshots: z.array(z.string()).optional(),
});

export type Props = z.infer<typeof zFeedback>;

export const FEEDBACK_LABELS: Record<Props['type'], string> = {
  idea: 'Idea',
  bug: 'Bug',
  question: 'Question',
  other: 'Feedback',
};

export default Feedback;
export function Feedback({
  type,
  message,
  page,
  from,
  organization,
  project,
  userAgent,
  issueUrl,
  screenshots,
}: Props) {
  return (
    <Layout>
      <Text style={{ fontSize: 13, color: '#707070', margin: 0 }}>
        {FEEDBACK_LABELS[type]} from the dashboard
      </Text>
      <Section
        style={{
          borderLeft: '3px solid #FF6A4D',
          paddingLeft: 14,
          margin: '12px 0 20px',
        }}
      >
        {message.split('\n').map((line, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static lines of one message
          <Text key={i} style={{ margin: '0 0 6px', whiteSpace: 'pre-wrap' }}>
            {line || ' '}
          </Text>
        ))}
      </Section>
      <Text style={{ fontSize: 13, color: '#707070', lineHeight: '20px' }}>
        From: {from ?? 'not shared (the sender did not allow a reply)'}
        <br />
        Page: {page ?? '–'}
        {organization ? (
          <>
            <br />
            Workspace: {organization}
            {project ? ` / ${project}` : ''}
          </>
        ) : null}
        {userAgent ? (
          <>
            <br />
            Browser: {userAgent}
          </>
        ) : null}
      </Text>
      {screenshots?.length ? (
        <Section style={{ margin: '0 0 16px' }}>
          {screenshots.map((url, i) => (
            <Link href={url} key={url}>
              <Img
                alt={`Screenshot ${i + 1}`}
                src={url}
                style={{
                  maxWidth: '100%',
                  border: '1px solid #e4e4e8',
                  borderRadius: 6,
                  margin: '0 0 10px',
                }}
                width="560"
              />
            </Link>
          ))}
        </Section>
      ) : null}
      {issueUrl ? (
        <Text style={{ fontSize: 13 }}>
          GitHub issue: <Link href={issueUrl}>{issueUrl}</Link>
        </Text>
      ) : null}
    </Layout>
  );
}

Feedback.PreviewProps = {
  type: 'idea',
  message: 'Could the realtime map show the city name on hover?',
  page: '/acme/website/realtime',
  from: 'alex@example.com',
  organization: 'acme',
  project: 'website',
  userAgent: 'Chrome 141 on macOS',
} satisfies Props;
