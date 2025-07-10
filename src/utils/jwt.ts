import { SignJWT, jwtVerify, type JWTPayload } from "jose";

interface CustomJWTPayload extends JWTPayload {
  userId: number;
  academyId: number;
  role: string;
}

export const generateToken = async (
  payload: CustomJWTPayload,
  secret: string
): Promise<string> => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(secret));
};

export const verifyToken = async (
  token: string,
  secret: string
): Promise<CustomJWTPayload> => {
  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
  return payload as CustomJWTPayload;
};
