// @vitest-environment jsdom

import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { LinkButton } from './button';

describe('LinkButton', () => {
  afterEach(cleanup);

  test('an href without a route is a plain link to that address', () => {
    // No router in this render: the anchor path must not need one.
    const { getByRole } = render(
      <LinkButton href="https://docs.flarepanel.dev/x#y" target="_blank">
        Open the setup guide
      </LinkButton>
    );
    const link = getByRole('link', { name: 'Open the setup guide' });
    expect(link.getAttribute('href')).toBe('https://docs.flarepanel.dev/x#y');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });
});
