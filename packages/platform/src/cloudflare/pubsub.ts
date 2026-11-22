/**
 * Cloudflare PubSub: a Durable Object hub that holds subscribers as
 * hibernating WebSockets (tagged with their channel) and fans each published
 * message out to them. An idle subscriber costs nothing while hibernated;
 * a publish is one Durable Object request, and messages to sockets are billed
 * at 20:1 as requests.
 *
 * Channels are spread over a few hubs by hash. Delivery is at-most-once, like
 * Redis pub/sub.
 */

import { DurableObject } from 'cloudflare:workers';
import type { PubSub, Subscription } from '../ports';

const DEFAULT_HUBS = 4;
const HUB_ORIGIN = 'https://pubsub-hub.flarepanel.internal';

export class PubSubHubDurableObject extends DurableObject {
  async fetch(request: Request): Promise<Response> {
    const channel = new URL(request.url).searchParams.get('channel');
    if (!channel || request.headers.get('Upgrade') !== 'websocket') {
      return new Response('expected a websocket upgrade with ?channel=', {
        status: 426,
      });
    }
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair) as [WebSocket, WebSocket];
    this.ctx.acceptWebSocket(server, [channel]);
    return new Response(null, { status: 101, webSocket: client });
  }

  publish(channel: string, message: string): number {
    let delivered = 0;
    for (const socket of this.ctx.getWebSockets(channel)) {
      try {
        socket.send(message);
        delivered++;
      } catch {
        // A socket that is closing; the close handler removes it.
      }
    }
    return delivered;
  }

  webSocketClose(socket: WebSocket, code: number) {
    try {
      socket.close(code === 1005 ? 1000 : code, 'bye');
    } catch {
      // already closed
    }
  }

  webSocketError(socket: WebSocket) {
    try {
      socket.close(1011, 'error');
    } catch {
      // already closed
    }
  }
}

function hubOf(channel: string, hubs: number): number {
  let hash = 0x81_1c_9d_c5;
  for (let i = 0; i < channel.length; i++) {
    hash ^= channel.charCodeAt(i);
    hash = Math.imul(hash, 0x01_00_01_93);
  }
  return (hash >>> 0) % hubs;
}

interface ChannelConnection {
  listeners: Set<(message: string) => void>;
  ready: Promise<WebSocket | null>;
}

/**
 * One WebSocket per channel per isolate, reference-counted like the Redis
 * subscriber: the socket opens on the first listener and closes with the last.
 */
export class DurablePubSub implements PubSub {
  private readonly channels = new Map<string, ChannelConnection>();

  constructor(
    private readonly namespace: DurableObjectNamespace<PubSubHubDurableObject>,
    private readonly hubs = DEFAULT_HUBS
  ) {}

  private stub(channel: string) {
    return this.namespace.getByName(`pubsub-hub-${hubOf(channel, this.hubs)}`);
  }

  publish(channel: string, message: string): Promise<number> {
    return this.stub(channel).publish(channel, message);
  }

  private connect(channel: string, connection: ChannelConnection) {
    return this.stub(channel)
      .fetch(`${HUB_ORIGIN}/subscribe?channel=${encodeURIComponent(channel)}`, {
        headers: { Upgrade: 'websocket' },
      })
      .then((response) => {
        const socket = response.webSocket;
        if (!socket) {
          return null;
        }
        socket.accept();
        socket.addEventListener('message', (event) => {
          const data =
            typeof event.data === 'string'
              ? event.data
              : new TextDecoder().decode(event.data as ArrayBuffer);
          for (const listener of connection.listeners) {
            listener(data);
          }
        });
        socket.addEventListener('close', () => {
          if (this.channels.get(channel) === connection) {
            this.channels.delete(channel);
          }
        });
        return socket;
      })
      .catch(() => {
        if (this.channels.get(channel) === connection) {
          this.channels.delete(channel);
        }
        return null;
      });
  }

  subscribe(
    channel: string,
    listener: (message: string) => void
  ): Subscription {
    let connection = this.channels.get(channel);
    if (!connection) {
      const created: ChannelConnection = {
        listeners: new Set(),
        ready: Promise.resolve(null),
      };
      created.ready = this.connect(channel, created);
      this.channels.set(channel, created);
      connection = created;
    }
    connection.listeners.add(listener);
    const current = connection;

    let isActive = true;
    return {
      ready: current.ready.then(() => undefined),
      unsubscribe: () => {
        if (!isActive) {
          return;
        }
        isActive = false;
        current.listeners.delete(listener);
        if (current.listeners.size > 0) {
          return;
        }
        if (this.channels.get(channel) === current) {
          this.channels.delete(channel);
        }
        current.ready.then((socket) => socket?.close(1000, 'unsubscribed'));
      },
    };
  }
}
