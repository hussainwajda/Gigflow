import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

import { env } from "./env.js";
import type { Database } from "../types/database.types.js";

type WebSocketTransport = NonNullable<Parameters<typeof createClient<Database>>[2]>["realtime"] extends { transport?: infer T }
  ? T
  : never;

const websocketTransport = WebSocket as unknown as WebSocketTransport;

export const supabaseAnon = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  realtime: {
    transport: websocketTransport,
  },
});

export const supabaseAdmin = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  realtime: {
    transport: websocketTransport,
  },
});
