export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: "admin" | "teacher" | "student";
  academy_id: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: "admin" | "teacher" | "student";
  academyId: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
  iat?: number;
  exp?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    academyId: string;
  };
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: "admin" | "teacher" | "student";
  academyId: string;
}
