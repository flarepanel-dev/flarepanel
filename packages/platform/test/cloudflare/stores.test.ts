import { env } from 'cloudflare:test';
import { describe, expect, test } from 'vitest';
import { createCloudflareStores } from '../../src/cloudflare/stores';
import { storeContract } from '../../src/testing/contract';

storeContract({ describe, test, expect }, 'cloudflare', () =>
  createCloudflareStores(env as never)
);
