// The token travels from the dashboard to the API once, on connect (and to
// list zones before that); reads return its last 4 characters only.

import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../../rpc/base';
import {
  zCloudflareConnectInput,
  zCloudflareListZonesInput,
} from './cloudflare-analytics.constants';
import { CloudflareConnectError } from './cloudflare-analytics.service';

function userFacing<T>(run: () => Promise<T>): Promise<T> {
  return run().catch((error: unknown) => {
    if (error instanceof CloudflareConnectError) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });
    }
    throw error;
  });
}

export const cloudflareAnalyticsRouter = createTRPCRouter({
  getSetup: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input: { projectId }, ctx }) => {
      await ctx.services.auth.requireProjectAccess({
        userId: ctx.session.userId,
        projectId,
        level: 'read',
      });
      return ctx.services.cloudflareAnalytics.getSetup(projectId);
    }),

  // A mutation: it sends a secret, and is not something to cache or refetch.
  listZones: protectedProcedure
    .input(zCloudflareListZonesInput)
    .mutation(async ({ input, ctx }) => {
      await ctx.services.auth.requireProjectAccess({
        userId: ctx.session.userId,
        projectId: input.projectId,
        level: 'write',
      });
      return userFacing(() =>
        ctx.services.cloudflareAnalytics.listZones(input.projectId, input.token)
      );
    }),

  connect: protectedProcedure
    .input(zCloudflareConnectInput)
    .mutation(async ({ input, ctx }) => {
      await ctx.services.auth.requireProjectAccess({
        userId: ctx.session.userId,
        projectId: input.projectId,
        level: 'write',
      });
      return userFacing(() =>
        ctx.services.cloudflareAnalytics.connect({
          ...input,
          userId: ctx.session.userId,
        })
      );
    }),

  syncNow: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ input: { projectId }, ctx }) => {
      await ctx.services.auth.requireProjectAccess({
        userId: ctx.session.userId,
        projectId,
        level: 'write',
      });
      await userFacing(() =>
        ctx.services.cloudflareAnalytics.syncNow(projectId)
      );
      return { ok: true };
    }),

  disconnect: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ input: { projectId }, ctx }) => {
      await ctx.services.auth.requireProjectAccess({
        userId: ctx.session.userId,
        projectId,
        level: 'write',
      });
      await ctx.services.cloudflareAnalytics.disconnect(projectId);
      return { ok: true };
    }),
});
