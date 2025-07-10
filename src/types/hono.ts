import { Context, MiddlewareHandler } from 'hono';
import { BlankInput, Env as HonoEnv } from 'hono/types';
import { D1Database, R2Bucket, KVNamespace } from '@cloudflare/workers-types';

// Tipos base
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  academyId: string;
}

export interface Env extends HonoEnv {
  DB: D1Database;
  KV_SESSIONS: KVNamespace;
  R2_MATERIALS: R2Bucket;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  API_KEY: string;
  API_VERSION: string;
  CORS_ORIGIN: string;
  MAX_FILE_SIZE: string;
  ALLOWED_FILE_TYPES: string;
  ENVIRONMENT: 'development' | 'production' | 'staging';
}

// Tipo completo para el contexto de la aplicación
export type AppContext = Context<{
  Bindings: Env;
  Variables: {
    user: AuthenticatedUser;
  };
}>;

// Tipo para middlewares de autenticación
export type AuthMiddleware = MiddlewareHandler<{
  Bindings: Env;
  Variables: {
    user: AuthenticatedUser;
  };
}>;