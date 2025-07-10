import { verifyPassword } from "../utils/password";
import {
  createAccessToken,
  createRefreshToken,
  generateTokenId,
  verifyRefreshToken,
} from "../utils/jwt";
import {
  User,
  LoginResponse,
  JWTPayload,
  RefreshTokenPayload,
} from "../types/auth";

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

    const accessTokenPayload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      academyId: user.academy_id,
    };

    const refreshTokenPayload: RefreshTokenPayload = {
      userId: user.id,
      tokenId,
    };

    const accessToken = createAccessToken(
      accessTokenPayload,
      this.env.JWT_SECRET
    );
    const refreshToken = createRefreshToken(
      refreshTokenPayload,
      this.env.JWT_REFRESH_SECRET
    );

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
    const payload = verifyRefreshToken(
      refreshToken,
      this.env.JWT_REFRESH_SECRET
    );
    if (!payload) {
      return null;
    }

    const storedToken = await this.env.KV_SESSIONS.get(
      `refresh_token:${payload.tokenId}`
    );
    if (!storedToken) {
      return null;
    }

    const tokenData = JSON.parse(storedToken);

    const user = (await this.env.DB.prepare(
      "SELECT id, email, role, academy_id FROM users WHERE id = ?"
    )
      .bind(payload.userId)
      .first()) as User | null;

    if (!user) {
      await this.env.KV_SESSIONS.delete(`refresh_token:${payload.tokenId}`);
      return null;
    }

    const accessTokenPayload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      academyId: user.academy_id,
    };

    const accessToken = createAccessToken(
      accessTokenPayload,
      this.env.JWT_SECRET
    );

    return { accessToken };
  }

  async logout(refreshToken: string): Promise<boolean> {
    const payload = verifyRefreshToken(
      refreshToken,
      this.env.JWT_REFRESH_SECRET
    );
    if (!payload) {
      return false;
    }

    await this.env.KV_SESSIONS.delete(`refresh_token:${payload.tokenId}`);
    return true;
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
