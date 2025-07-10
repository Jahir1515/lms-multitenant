import { SignJWT, jwtVerify } from "jose";
import { verifyPassword } from "../utils/password";
import { User, LoginResponse } from "../types/auth";
import { generateTokenId } from "../utils/tokens";

interface AuthServiceEnv {
  DB: D1Database;
  KV_SESSIONS: KVNamespace;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
}

export class AuthService {
  constructor(private env: AuthServiceEnv) {}

  async login(email: string, password: string): Promise<LoginResponse | null> {
    const user = (await this.env.DB.prepare(
      "SELECT id, email, password_hash, role, academy_id FROM users WHERE email = ?"
    )
      .bind(email)
      .first()) as User | null;

    if (!user) {
      return null;
    }

    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return null;
    }

    const tokenId = generateTokenId();

    // Generar access token con jose
    const accessToken = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      academyId: user.academy_id,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(new TextEncoder().encode(this.env.JWT_SECRET));

    // Generar refresh token con jose
    const refreshToken = await new SignJWT({
      userId: user.id,
      tokenId,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(new TextEncoder().encode(this.env.JWT_REFRESH_SECRET));

    // Almacenar refresh token en KV
    await this.env.KV_SESSIONS.put(
      `refresh_token:${tokenId}`,
      JSON.stringify({
        userId: user.id,
        email: user.email,
        createdAt: new Date().toISOString(),
      }),
      { expirationTtl: 7 * 24 * 60 * 60 }
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        academyId: user.academy_id,
      },
    };
  }

  async refreshAccessToken(
    refreshToken: string
  ): Promise<{ accessToken: string } | null> {
    try {
      const { payload } = await jwtVerify(
        refreshToken,
        new TextEncoder().encode(this.env.JWT_REFRESH_SECRET)
      );

      const tokenId = payload.tokenId as string;
      const userId = payload.userId as string;

      const storedToken = await this.env.KV_SESSIONS.get(
        `refresh_token:${tokenId}`
      );
      if (!storedToken) {
        return null;
      }

      const user = (await this.env.DB.prepare(
        "SELECT id, email, role, academy_id FROM users WHERE id = ?"
      )
        .bind(userId)
        .first()) as User | null;

      if (!user) {
        await this.env.KV_SESSIONS.delete(`refresh_token:${tokenId}`);
        return null;
      }

      // Generar nuevo access token
      const accessToken = await new SignJWT({
        userId: user.id,
        email: user.email,
        role: user.role,
        academyId: user.academy_id,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("15m")
        .sign(new TextEncoder().encode(this.env.JWT_SECRET));

      return { accessToken };
    } catch (error) {
      return null;
    }
  }

  async logout(refreshToken: string): Promise<boolean> {
    try {
      const { payload } = await jwtVerify(
        refreshToken,
        new TextEncoder().encode(this.env.JWT_REFRESH_SECRET)
      );

      await this.env.KV_SESSIONS.delete(
        `refresh_token:${payload.tokenId as string}`
      );
      return true;
    } catch {
      return false;
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    const user = (await this.env.DB.prepare(
      "SELECT id, email, password_hash, role, academy_id FROM users WHERE id = ?"
    )
      .bind(userId)
      .first()) as User | null;

    return user;
  }

  async logoutAllSessions(userId: string): Promise<void> {
    const userTokensKey = `user_tokens:${userId}`;
    const userTokens = await this.env.KV_SESSIONS.get(userTokensKey);

    if (userTokens) {
      const tokenIds = JSON.parse(userTokens) as string[];
      await Promise.all(
        tokenIds.map((tokenId) =>
          this.env.KV_SESSIONS.delete(`refresh_token:${tokenId}`)
        )
      );
      await this.env.KV_SESSIONS.delete(userTokensKey);
    }
  }
}
