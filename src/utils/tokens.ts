export function generateTokenId(): string {
  return crypto.randomUUID();
}

// Tipado para TypeScript
declare global {
  interface Crypto {
    randomUUID(): string;
  }
}
