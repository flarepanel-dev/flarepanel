/**
 * JavaScript webhook templates on Workers. On Bun a validated template runs
 * in a child process with an empty environment; Workers cannot spawn, so the
 * template runs in a Dynamic Worker instead, with the same contract:
 *
 * - its own isolate, no `env`, no network (`globalOutbound: null`);
 * - a CPU limit (`limits.cpuMs`) and a wall-clock deadline in this Worker;
 * - the payload in and the result out as JSON text, so the template never
 *   holds a reference to this Worker; an oversized result is refused.
 *
 * Cost: the sandbox is keyed by a hash of the template, so one template is
 * one Dynamic Worker a day however many notifications it formats (1,000 a
 * month are included in Workers Paid, then $0.002 per Dynamic Worker a day).
 * The template is validated before it gets here (`execute` re-checks it).
 */
import type { SandboxLimits, SandboxRunner } from '@flarepanel/core';

// The API Worker's own compatibility date: supported wherever it runs.
const COMPATIBILITY_DATE = '2026-03-10';
/** A template formats one payload; this is far above what that needs. */
const TEMPLATE_CPU_MS = 50;
const TEMPLATE_ERROR_STATUS = 422;

async function templateId(code: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(code)
  );
  const hex = [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  return `webhook-template-${hex.slice(0, 40)}`;
}

/** The sandbox module: the template as an expression, called per request. */
export function sandboxModule(code: string): string {
  return `const template = (${code});
export default {
  async fetch(request) {
    try {
      const result = template(JSON.parse(await request.text()));
      const json = JSON.stringify(result);
      return new Response(json === undefined ? '' : json);
    } catch (error) {
      return new Response(String(error && error.message ? error.message : error), { status: ${TEMPLATE_ERROR_STATUS} });
    }
  },
};
`;
}

export function createDynamicWorkerRunner(loader: WorkerLoader): SandboxRunner {
  return async (code, payload, limits: SandboxLimits) => {
    const worker = loader.get(await templateId(code), () => ({
      compatibilityDate: COMPATIBILITY_DATE,
      mainModule: 'template.js',
      modules: { 'template.js': sandboxModule(code) },
      globalOutbound: null,
      env: {},
      limits: { cpuMs: TEMPLATE_CPU_MS, subRequests: 0 },
    }));
    let timer: ReturnType<typeof setTimeout> | undefined;
    const deadline = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error('Template timed out')),
        limits.deadlineMs
      );
    });
    try {
      const response = await Promise.race([
        worker.getEntrypoint().fetch('https://template.invalid/', {
          method: 'POST',
          body: JSON.stringify(payload),
        }),
        deadline,
      ]);
      const text = await response.text();
      if (new TextEncoder().encode(text).length > limits.maxOutputBytes) {
        throw new Error('Template output is too large');
      }
      if (response.status === TEMPLATE_ERROR_STATUS) {
        throw new Error(text);
      }
      if (!response.ok) {
        throw new Error(`Template sandbox failed (${response.status})`);
      }
      return text;
    } finally {
      clearTimeout(timer);
    }
  };
}
