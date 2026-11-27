import { z } from 'zod';
import { defineJob } from '../../jobs/define';

/** Once a day, early in the European morning. */
export const AI_ANSWERS_CRON = '30 5 * * *';
const DAY_MS = 24 * 60 * 60 * 1000;

const projectPayload = z.object({ projectId: z.string() });

/**
 * Per-project runs, on the `gsc` queue with the other third-party pulls.
 * One attempt only: every call is billed to the workspace's own AI key, and
 * failed answers are stored and shown rather than retried.
 */
export const aiAnswersQueueJobs = {
  aiAnswersProjectRun: defineJob({
    payload: projectPayload,
    options: { attempts: 1 },
    handler: async ({ payload, ctx }) => {
      await ctx.services.aiAnswers.runProject(payload.projectId);
    },
  }),
};

/** This module's fragment of the `cron` queue's jobs. */
export const aiAnswersCronJobs = {
  // Fans out one `aiAnswersProjectRun` per project with prompts, once a day.
  aiAnswersDaily: defineJob({
    payload: z.null(),
    cron: { pattern: AI_ANSWERS_CRON },
    handler: async ({ ctx }) => {
      const projects = await ctx.services.aiAnswers.listProjectsForRun();
      const day = Math.floor(Date.now() / DAY_MS);
      for (const { projectId } of projects) {
        await ctx.queues.gsc.aiAnswersProjectRun.add(
          { projectId },
          { deduplicationId: `ai-answers:${projectId}:${day}` }
        );
      }
    },
  }),
};
