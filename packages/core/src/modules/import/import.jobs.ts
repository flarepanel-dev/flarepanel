// `import` is this module's own queue and only job: the registry key, Redis
// name and BullMQ job name are all `import`. There is no cron fragment, imports
// are user-triggered.
//
// Core's worker has no live BullMQ job to hand `updateImportStatus` for
// progress, so this handler runs with the no-op default.

import { z } from 'zod';
import { defineJob } from '../../jobs/define';
import { createImportProvider, updateImportStatus } from './import.service';
import {
  runWorkersImportStep,
  type WorkersImportProvider,
} from './src/workers-import';

const importJobPayload = z.object({ importId: z.string() });

/** The `import` queue's own job. */
export const importQueueJobs = {
  import: defineJob({
    payload: importJobPayload,
    handler: async ({ payload, ctx }) => {
      // Workers: one short step at a time, each enqueueing the next.
      if (ctx.eventStore) {
        const logger = ctx.logger.child({ importId: payload.importId });
        const step = await runWorkersImportStep({
          deps: { db: ctx.db, eventStore: ctx.eventStore, logger },
          importId: payload.importId,
          createProvider: async (projectId, config) =>
            (await createImportProvider(
              projectId,
              config,
              logger
            )) as unknown as WorkersImportProvider,
          progress: (options) =>
            updateImportStatus(
              ctx,
              logger,
              { updateProgress: () => undefined },
              payload.importId,
              options
            ),
        });
        if (!step.done) {
          await ctx.queues.import.import.add(
            { importId: payload.importId },
            step.delayMs ? { delay: step.delayMs } : undefined
          );
        }
        return;
      }
      await ctx.services.import.run(payload.importId);
    },
  }),
};
