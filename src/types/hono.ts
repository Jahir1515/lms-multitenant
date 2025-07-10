import { Context } from "hono";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: "admin" | "teacher" | "student";
  academyId: string;
}

export interface Env {
  DB: D1Database;
  KV_SESSIONS: KVNamespace;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
}

export interface HonoContext {
  Bindings: Env;
  Variables: {
    user: AuthenticatedUser;
  };
}

export type AppContext = Context<HonoContext>;
