// `protectedProcedure` runs `enforceUserIsAuthed` + `enforceAccess` BEFORE
// the input parser; `models`, `aiKeys`, `saveAiKey` and `removeAiKey` carry a
// top-level organizationId, so membership is checked before they run.

import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../../rpc/base';
import { TRPCNotFoundError } from '../../rpc/errors';
import {
  getOrganizationByProjectIdCached,
  getSettingsForProject,
} from '../organization/organization.service';
import {
  getAvailableChatModels,
  getDefaultChatModelId,
  zReportDraftRequest,
} from './assistant.constants';
import { chatLimitsFor, checkChatLimits } from './src/limits';
import {
  AI_KEY_PROVIDERS,
  AiKeyError,
  listWorkspaceAiKeys,
  removeWorkspaceAiKey,
  resolveWorkspaceAi,
  saveWorkspaceAiKey,
} from './src/workspace-keys';

export const chatRouter = createTRPCRouter({
  // With an organizationId the answer covers that workspace's own keys.
  models: protectedProcedure
    .input(z.object({ organizationId: z.string() }).optional())
    .query(async ({ ctx, input }) => {
      const ai = input?.organizationId
        ? await resolveWorkspaceAi(ctx, input.organizationId)
        : { config: ctx.config, ownKey: false };
      const providers = {
        openai: Boolean(ai.config.ai.openai.apiKey),
        anthropic: Boolean(ai.config.ai.anthropic.apiKey),
      };
      return {
        providers,
        models: getAvailableChatModels(providers),
        defaultModelId: getDefaultChatModelId(providers),
        // Whoever pays the provider picks the model: a self-hoster, or a
        // workspace on its own key. Otherwise one vetted default.
        canChooseModel: ctx.config.selfHosted || ai.ownKey,
        ownKey: ai.ownKey,
        selfHosted: ctx.config.selfHosted,
      };
    }),

  // Bring your own key. Members see which providers have a key (last 4
  // characters only); only admins add or remove one.
  aiKeys: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(({ ctx, input }) =>
      listWorkspaceAiKeys(ctx.db, input.organizationId)
    ),

  saveAiKey: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        provider: z.enum(AI_KEY_PROVIDERS),
        apiKey: z.string().min(1).max(500),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.services.auth.requireOrganizationAdmin({
        userId: ctx.session.userId,
        organizationId: input.organizationId,
      });
      try {
        return await saveWorkspaceAiKey(ctx, {
          organizationId: input.organizationId,
          provider: input.provider,
          apiKey: input.apiKey,
          userId: ctx.session.userId,
        });
      } catch (error) {
        if (error instanceof AiKeyError) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });
        }
        throw error;
      }
    }),

  removeAiKey: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        provider: z.enum(AI_KEY_PROVIDERS),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.services.auth.requireOrganizationAdmin({
        userId: ctx.session.userId,
        organizationId: input.organizationId,
      });
      await removeWorkspaceAiKey(ctx.db, input.organizationId, input.provider);
      return true;
    }),

  // The report editor's prompt box. Drafts a report for the caller's own
  // editor and changes no project state, but it is a model turn, so it counts
  // against the same spend limits as a chat message.
  draftReport: protectedProcedure
    .meta({ readOnlyMutation: true })
    .input(zReportDraftRequest)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.userId;
      await ctx.services.auth.requireProjectAccess({
        userId,
        projectId: input.projectId,
        level: 'read',
      });
      const [organization, settings] = await Promise.all([
        getOrganizationByProjectIdCached(ctx, input.projectId),
        getSettingsForProject(ctx, input.projectId),
      ]);
      if (!organization) {
        throw new TRPCNotFoundError('Project not found');
      }
      const limited = await checkChatLimits(ctx, {
        organizationId: organization.id,
        userId,
        ...chatLimitsFor(
          organization,
          ctx.config.selfHosted,
          (await resolveWorkspaceAi(ctx, organization.id)).ownKey
        ),
      });
      if (limited) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: limited.message,
        });
      }
      return ctx.services.assistant.draftReport({
        prompt: input.prompt,
        projectId: input.projectId,
        timezone: settings.timezone || 'UTC',
        userId,
        organizationId: organization.id,
      });
    }),
});
