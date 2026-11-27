// Brand, competitors and prompts for AI answer visibility, and the summary.
// Runs use the workspace's own AI key; nothing here sends or returns a key.

import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../../rpc/base';
import {
  zAiAnswerPromptInput,
  zAiAnswerSettingsInput,
} from './ai-answers.constants';
import { AiAnswerError } from './ai-answers.service';

function userFacing<T>(run: () => Promise<T>): Promise<T> {
  return run().catch((error: unknown) => {
    if (error instanceof AiAnswerError) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });
    }
    throw error;
  });
}

const zProject = z.object({ projectId: z.string() });

export const aiAnswersRouter = createTRPCRouter({
  getSetup: protectedProcedure
    .input(zProject)
    .query(async ({ input: { projectId }, ctx }) => {
      await ctx.services.auth.requireProjectAccess({
        userId: ctx.session.userId,
        projectId,
        level: 'read',
      });
      return ctx.services.aiAnswers.getSetup(projectId);
    }),

  summary: protectedProcedure
    .input(zProject)
    .query(async ({ input: { projectId }, ctx }) => {
      await ctx.services.auth.requireProjectAccess({
        userId: ctx.session.userId,
        projectId,
        level: 'read',
      });
      return ctx.services.aiAnswers.summary(projectId);
    }),

  saveSettings: protectedProcedure
    .input(zAiAnswerSettingsInput)
    .mutation(async ({ input, ctx }) => {
      await ctx.services.auth.requireProjectAccess({
        userId: ctx.session.userId,
        projectId: input.projectId,
        level: 'write',
      });
      return ctx.services.aiAnswers.saveSettings(input);
    }),

  addPrompt: protectedProcedure
    .input(zAiAnswerPromptInput)
    .mutation(async ({ input, ctx }) => {
      await ctx.services.auth.requireProjectAccess({
        userId: ctx.session.userId,
        projectId: input.projectId,
        level: 'write',
      });
      return userFacing(() =>
        ctx.services.aiAnswers.addPrompt(input.projectId, input.prompt)
      );
    }),

  removePrompt: protectedProcedure
    .input(z.object({ projectId: z.string(), promptId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.services.auth.requireProjectAccess({
        userId: ctx.session.userId,
        projectId: input.projectId,
        level: 'write',
      });
      await ctx.services.aiAnswers.removePrompt(
        input.projectId,
        input.promptId
      );
      return { ok: true };
    }),

  runNow: protectedProcedure
    .input(zProject)
    .mutation(async ({ input: { projectId }, ctx }) => {
      await ctx.services.auth.requireProjectAccess({
        userId: ctx.session.userId,
        projectId,
        level: 'write',
      });
      await userFacing(() => ctx.services.aiAnswers.runNow(projectId));
      return { ok: true };
    }),
});
