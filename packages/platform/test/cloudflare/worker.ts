// Minimal Worker that hosts the Durable Object for the contract tests.
export { CoordinatorDurableObject } from '../../src/cloudflare/coordinator';

export default {
  fetch() {
    return new Response('platform test worker');
  },
};
