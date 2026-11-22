import type { ServiceDeps } from '../../../services';
import type { AssistantUIMessage } from './message';

const NULL_CHARACTER = '\u0000';

/** Postgres json cannot hold NUL, and tool outputs echo raw event data. */
export function stripNullCharacters<T>(value: T): T {
  if (typeof value === 'string') {
    return value.replaceAll(NULL_CHARACTER, '') as T;
  }
  if (Array.isArray(value)) {
    return value.map(stripNullCharacters) as T;
  }
  if (value !== null && typeof value === 'object') {
    // fromEntries defines own properties, so a "__proto__" key survives.
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        stripNullCharacters(key),
        stripNullCharacters(entry),
      ])
    ) as T;
  }
  return value;
}

/** Rows are one UI message each; `parts` is the message's parts array. */
export async function loadMessages(
  deps: ServiceDeps,
  conversationId: string
): Promise<AssistantUIMessage[]> {
  const rows = await deps.db.chatMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
  });
  return rows.map((row) => ({
    id: row.id,
    role: row.role as AssistantUIMessage['role'],
    parts: row.parts as AssistantUIMessage['parts'],
    metadata: (row.metadata ?? undefined) as AssistantUIMessage['metadata'],
  }));
}

export async function saveMessages(
  deps: ServiceDeps,
  input: {
    conversationId: string;
    projectId: string;
    organizationId: string;
    userId: string;
    messages: AssistantUIMessage[];
    title?: string | null;
  }
): Promise<void> {
  const db = deps.db;
  // Checks first, then every write in one atomic batch: Cloudflare D1 has no
  // interactive transactions. Conversation ids are client-generated UUIDs, so
  // another user creating this exact id between check and write is not a
  // realistic race.

  // Message ids come from the client; one must not overwrite a row in another conversation.
  const foreign = await db.chatMessage.findFirst({
    where: {
      id: { in: input.messages.map((message) => message.id) },
      conversationId: { not: input.conversationId },
    },
    select: { id: true },
  });
  if (foreign) {
    throw new Error(`Message ${foreign.id} belongs to another conversation`);
  }
  // The id comes from the client and is only checked before the model runs;
  // someone else may have created it since, and must not get these messages.
  const existing = await db.conversation.findUnique({
    where: { id: input.conversationId },
    select: { userId: true, projectId: true },
  });
  if (
    existing &&
    !(
      existing.userId === input.userId && existing.projectId === input.projectId
    )
  ) {
    throw new Error(
      `Conversation ${input.conversationId} belongs to another user`
    );
  }

  const title = stripNullCharacters(input.title ?? undefined);
  // Rows saved together must load in this order; the default timestamp can tie.
  const baseTime = Date.now();
  await db.$transaction([
    db.conversation.upsert({
      where: { id: input.conversationId },
      create: {
        id: input.conversationId,
        projectId: input.projectId,
        organizationId: input.organizationId,
        userId: input.userId,
        title,
      },
      update: {
        updatedAt: new Date(),
        ...(title ? { title } : {}),
      },
    }),
    ...input.messages.map((message, index) => {
      const parts = stripNullCharacters(message.parts as unknown[]);
      const metadata = stripNullCharacters(
        (message.metadata ?? {}) as Record<string, unknown>
      );
      return db.chatMessage.upsert({
        where: { id: message.id },
        create: {
          id: message.id,
          conversationId: input.conversationId,
          role: message.role,
          parts,
          metadata,
          createdAt: new Date(baseTime + index),
        },
        update: { parts, metadata },
      });
    }),
  ]);
}

/** Regeneration: drop the message and everything after it. */
export async function deleteMessagesFrom(
  deps: ServiceDeps,
  conversationId: string,
  messageId: string
): Promise<void> {
  const target = await deps.db.chatMessage.findFirst({
    where: { id: messageId, conversationId },
    select: { createdAt: true },
  });
  if (!target) {
    return;
  }
  await deps.db.chatMessage.deleteMany({
    where: { conversationId, createdAt: { gte: target.createdAt } },
  });
}
