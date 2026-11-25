import { describe, expect, it } from 'bun:test';
import { getClientById } from './client.service';

function dbReturning(found: unknown) {
  return { db: { client: { findUnique: async () => found } } } as never;
}

const base = {
  id: 'c1',
  organizationId: 'org-1',
  projectId: 'p1',
  project: { id: 'p1', deleteAt: null },
};

describe('getClientById and scheduled deletion', () => {
  it('returns a live client without the organization lookup', async () => {
    const client = await getClientById(
      dbReturning({ ...base, organization: { deleteAt: null } }),
      'c1'
    );
    expect(client).toEqual(base as never);
  });

  it('treats a key of a workspace pending deletion as unknown', async () => {
    const client = await getClientById(
      dbReturning({ ...base, organization: { deleteAt: new Date() } }),
      'c1'
    );
    expect(client).toBeNull();
  });

  it('treats a key of a project pending deletion as unknown', async () => {
    const client = await getClientById(
      dbReturning({
        ...base,
        project: { id: 'p1', deleteAt: new Date() },
        organization: { deleteAt: null },
      }),
      'c1'
    );
    expect(client).toBeNull();
  });

  it('keeps a root key (no project) of a live workspace', async () => {
    const root = { ...base, projectId: null, project: null };
    const client = await getClientById(
      dbReturning({ ...root, organization: { deleteAt: null } }),
      'c1'
    );
    expect(client).toEqual(root as never);
  });
});
