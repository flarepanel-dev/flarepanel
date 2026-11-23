import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_app/$organizationId/$projectId/events/_tabs/'
)({
  component: Component,
  beforeLoad({ params, preload }) {
    // A redirect thrown while hovering a link (preload) can leave the tabs
    // layout pending forever on the later click; redirect on real loads only.
    if (preload) {
      return;
    }
    throw redirect({
      to: '/$organizationId/$projectId/events/events',
      params,
    });
  },
});

function Component() {
  return null;
}
