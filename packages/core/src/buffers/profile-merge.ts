// How a profile write combines with the stored profile. Shared by the Redis
// profile buffer (Bun) and the per-project profile store (Workers).
import { deepMergeObjects } from '@flarepanel/shared';
import { omit, uniq } from 'ramda';
import type { IClickhouseProfile } from '../modules/profile/profile.service';

export function mergeProfiles(
  existing: IClickhouseProfile | null,
  incoming: IClickhouseProfile
): IClickhouseProfile {
  if (!existing) {
    return incoming;
  }

  let profile = incoming;
  if (
    existing.properties.device !== 'server' &&
    incoming.properties.device === 'server'
  ) {
    profile = {
      ...incoming,
      properties: omit(
        [
          'city',
          'country',
          'region',
          'longitude',
          'latitude',
          'os',
          'osVersion',
          'browser',
          'device',
          'isServer',
          'os_version',
          'browser_version',
        ],
        incoming.properties
      ),
    };
  }

  return {
    // `created_at` is preserved (existing wins → first seen stays put).
    // `last_seen_at` flows through from incoming so the RMT version advances.
    // `groups` get unioned below.
    ...deepMergeObjects(existing, omit(['created_at', 'groups'], profile)),
    groups: uniq([...(existing.groups ?? []), ...(incoming.groups ?? [])]),
  };
}
