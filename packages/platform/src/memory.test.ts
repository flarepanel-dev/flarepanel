import { describe, expect, test } from 'bun:test';
import { createMemoryStores } from './memory';
import { storeContract } from './testing/contract';

storeContract({ describe, test, expect }, 'memory', () => createMemoryStores());
