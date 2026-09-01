import { createClient } from "redis";

import { env } from "@/lib/env";

type RedisSerializable =
  | string
  | number
  | boolean
  | null
  | undefined
  | Record<string, unknown>
  | Array<unknown>;

type RedisAdapter = {
  get<T = unknown>(key: string): Promise<T | null>;
  set<T = RedisSerializable>(
    key: string,
    value: T,
    options?: { exSeconds?: number },
  ): Promise<void>;
  del(key: string): Promise<void>;
};

type GlobalRedisState = typeof globalThis & {
  __istockRedisClient?: Promise<unknown>;
  __istockRedisMemory?: Map<string, string>;
};

const globalState = globalThis as GlobalRedisState;
const hasUpstashRest = Boolean(
  env.upstashRedisRestUrl && env.upstashRedisRestToken,
);

if (!globalState.__istockRedisMemory) {
  globalState.__istockRedisMemory = new Map<string, string>();
}

function serializeValue(value: unknown) {
  return typeof value === "string" ? value : JSON.stringify(value);
}

function deserializeValue<T>(value: string): T | string {
  try {
    return JSON.parse(value) as T;
  } catch {
    return value;
  }
}

async function getRedisClient() {
  if (!env.redisUrl) {
    return null;
  }

  if (!globalState.__istockRedisClient) {
    globalState.__istockRedisClient = (async () => {
      const client = createClient({ url: env.redisUrl }) as unknown;

      // client may be an unknown runtime type; log errors safely
      try {
        // bind to runtime methods if available
        const runtimeClient = client as unknown as {
          on?: (event: string, cb: (err: unknown) => void) => void;
          connect?: () => Promise<void>;
        };

        runtimeClient.on?.("error", (error: unknown) => {
          console.error("Redis client error", error);
        });

        if (runtimeClient.connect) {
          await runtimeClient.connect();
        }
      } catch (error) {
        console.error("Failed to connect to Redis", error);
        return null;
      }

      return client;
    })().catch((error) => {
      console.error("Failed to connect to Redis", error);
      globalState.__istockRedisClient = undefined;
      return null;
    });
  }

  return globalState.__istockRedisClient;
}

async function runUpstashCommand(command: string[]) {
  if (!hasUpstashRest) {
    return null;
  }

  const response = await fetch(`${env.upstashRedisRestUrl}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.upstashRedisRestToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([command]),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Upstash request failed with status ${response.status}`);
  }

  const json = (await response.json()) as Array<{
    result?: unknown;
    error?: string;
  }>;

  const [first] = json;
  if (first?.error) {
    throw new Error(first.error);
  }

  return first?.result ?? null;
}

export const redis: RedisAdapter = {
  async get<T>(key: string) {
    const client = await getRedisClient();

    if (client) {
      const runtimeClient = client as unknown as {
        get?: (k: string) => Promise<string | null>;
      };

      if (runtimeClient.get) {
        const value = await runtimeClient.get(key);

        if (value === null) {
          return null;
        }

        return deserializeValue<T>(value) as T;
      }
    }

    if (hasUpstashRest) {
      try {
        const value = await runUpstashCommand(["GET", key]);

        if (value === null) {
          return null;
        }

        return deserializeValue<T>(String(value)) as T;
      } catch (error) {
        console.error(
          "Upstash GET failed, falling back to memory cache",
          error,
        );
      }
    }

    const cached = globalState.__istockRedisMemory?.get(key);

    if (cached === undefined) {
      return null;
    }

    return deserializeValue<T>(cached) as T;
  },

  async set<T>(key: string, value: T, options?: { exSeconds?: number }) {
    const serialized = serializeValue(value);
    const client = await getRedisClient();

    if (client) {
      const runtimeClient = client as unknown as {
        set?: (
          k: string,
          v: string,
          opts?: { EX?: number },
        ) => Promise<unknown>;
      };

      if (runtimeClient.set) {
        if (options?.exSeconds) {
          await runtimeClient.set(key, serialized, { EX: options.exSeconds });
        } else {
          await runtimeClient.set(key, serialized);
        }

        return;
      }
    }

    if (hasUpstashRest) {
      try {
        const command = options?.exSeconds
          ? ["SET", key, serialized, "EX", String(options.exSeconds)]
          : ["SET", key, serialized];

        await runUpstashCommand(command);
        return;
      } catch (error) {
        console.error(
          "Upstash SET failed, falling back to memory cache",
          error,
        );
      }
    }

    globalState.__istockRedisMemory?.set(key, serialized);

    if (options?.exSeconds) {
      const timeout = setTimeout(() => {
        globalState.__istockRedisMemory?.delete(key);
      }, options.exSeconds * 1000);

      if (typeof timeout.unref === "function") {
        timeout.unref();
      }
    }
  },

  async del(key: string) {
    const client = await getRedisClient();

    if (client) {
      const runtimeClient = client as unknown as {
        del?: (k: string) => Promise<unknown>;
      };

      if (runtimeClient.del) {
        await runtimeClient.del(key);
        return;
      }
    }

    if (hasUpstashRest) {
      try {
        await runUpstashCommand(["DEL", key]);
        return;
      } catch (error) {
        console.error(
          "Upstash DEL failed, falling back to memory cache",
          error,
        );
      }
    }

    globalState.__istockRedisMemory?.delete(key);
  },
};
