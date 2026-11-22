// @vitest-environment jsdom

import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { FeedbackWidgetScripts } from './feedback-widget-scripts';

describe('FeedbackWidgetScripts', () => {
  afterEach(cleanup);

  test('loads no third-party widget', () => {
    const { container } = render(<FeedbackWidgetScripts />);
    expect(container.querySelectorAll('script')).toHaveLength(0);
  });
});
