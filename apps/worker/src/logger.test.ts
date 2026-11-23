import { afterEach, describe, expect, it, spyOn } from 'bun:test';
import { createConsoleLogger } from './logger';

describe('createConsoleLogger', () => {
  const log = spyOn(console, 'log').mockImplementation(() => undefined);
  afterEach(() => log.mockClear());

  it('redacts secrets, emails and credentials in URL queries', () => {
    const logger = createConsoleLogger('info', { accessToken: 'bound' });
    logger.info(
      {
        url: '/mcp?token=abc&project=p1',
        config: { secretAccessKey: 'shh', bucket: 'b' },
        email: 'a@example.com',
      },
      'request done'
    );
    const line = JSON.parse(String(log.mock.calls[0]?.[0]));
    expect(line).toMatchObject({
      accessToken: '[REDACTED]',
      url: '/mcp?token=[REDACTED]&project=p1',
      config: { secretAccessKey: '[REDACTED]', bucket: 'b' },
      email: '[REDACTED]',
      msg: 'request done',
    });
  });

  it('skips levels below the minimum', () => {
    createConsoleLogger('warn').info('quiet');
    expect(log).not.toHaveBeenCalled();
  });
});
