import jwt from "jsonwebtoken";
import { JWTPayload, RefreshTokenPayload } from "../types/auth";

export function createAccessToken(payload: JWTPayload, secret: string): string {
  return jwt.sign(payload, secret, {
    expiresIn: "15m", 
    algorithm: "HS256",
  });
}
export function createRefreshToken(
  payload: RefreshTokenPayload,
  secret: string
): string {
  return jwt.sign(payload, secret, {
    expiresIn: "7d",
    algorithm: "HS256",
  });
}

export function verifyAccessToken(
  token: string,
  secret: string
): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, secret) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error("Error verificando access token:", error);
    return null;
  }
}

export function verifyRefreshToken(
  token: string,
  secret: string
): RefreshTokenPayload | null {
  try {
    const decoded = jwt.verify(token, secret) as RefreshTokenPayload;
    return decoded;
  } catch (error) {
    console.error("Error verificando refresh token:", error);
    return null;
  }
}

export function generateTokenId(): string {
  return crypto.randomUUID();
}
