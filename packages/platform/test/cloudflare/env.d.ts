declare module 'cloudflare:test' {
  interface ProvidedEnv {
    COORDINATOR: DurableObjectNamespace;
    PUBSUB_HUB: DurableObjectNamespace;
  }
}
