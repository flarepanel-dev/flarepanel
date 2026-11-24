import { afterEach, describe, expect, it } from 'bun:test';
import { execute, runInSandbox, setSandboxRunner } from './execute';

const IS_LINUX = process.platform === 'linux';

describe('template sandbox', () => {
  it('fails a template that allocates past the memory limit', async () => {
    const run = execute("(payload) => 'x'.repeat(2 ** 30)", {});
    await expect(run).rejects.toThrow('Error executing JavaScript template');
    // The OS cap is Linux-only; elsewhere the output cap rejects it after the
    // child allocates.
    if (IS_LINUX) {
      await expect(run).rejects.toThrow(/memory/i);
    }
  });

  it.if(IS_LINUX)(
    'fails a template that doubles a string until it runs out of memory',
    async () => {
      const doubling = `(payload) => [${Array.from({ length: 32 }, () => 0).join(',')}].reduce((a) => a + a, 'x'.repeat(1024))`;
      await expect(execute(doubling, {})).rejects.toThrow(/memory/i);
    }
  );

  it('kills a child that outlives its deadline', async () => {
    const started = performance.now();
    await expect(
      runInSandbox(
        // Exponential backtracking on a short string: slow, but no memory.
        "(payload) => 'a'.repeat(40).replace(/(a+)+b/, '')",
        {},
        { timeoutMs: 10_000, deadlineMs: 100, maxOutputBytes: 1000 }
      )
    ).rejects.toThrow('timed out');
    expect(performance.now() - started).toBeLessThan(2000);
  });

  it('runs an honest template under the limits', async () => {
    expect(
      await execute('(payload) => ({ n: payload.n + 1 })', { n: 1 })
    ).toEqual({
      n: 2,
    });
  });
});

describe('a registered sandbox runner (Workers)', () => {
  afterEach(() => setSandboxRunner(undefined));

  it('runs validated templates through the runner instead of a child process', async () => {
    const seen: string[] = [];
    setSandboxRunner((code, payload) => {
      seen.push(code);
      return Promise.resolve(JSON.stringify({ echoed: payload.name }));
    });
    expect(
      await execute('(payload) => ({ echoed: payload.name })', {
        name: 'signup',
      })
    ).toEqual({ echoed: 'signup' });
    expect(seen).toHaveLength(1);
  });

  it('never hands an invalid template to the runner', async () => {
    let called = false;
    setSandboxRunner(() => {
      called = true;
      return Promise.resolve('');
    });
    await expect(
      execute('(payload) => fetch("https://example.com")', {})
    ).rejects.toThrow('Invalid JavaScript template');
    expect(called).toBe(false);
  });

  it('reports the runner’s template errors like the child process does', async () => {
    setSandboxRunner(() => Promise.reject(new Error('bad template')));
    await expect(execute('(payload) => payload', {})).rejects.toThrow(
      'Error executing JavaScript template: bad template'
    );
  });
});
