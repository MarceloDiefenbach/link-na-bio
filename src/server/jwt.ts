import { createHmac } from "crypto";

function base64url(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

export function signJWT(payload: Record<string, any>, secret: string, expiresInSec = 60 * 60 * 24) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = { iat: now, exp: now + expiresInSec, ...payload };
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(body));
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac("sha256", secret).update(data).digest();
  const encodedSig = base64url(signature);
  return `${data}.${encodedSig}`;
}

export function verifyJWT(token: string, secret: string): { valid: boolean; payload?: any; error?: string } {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return { valid: false, error: "Malformed token" };
    const [h, p, s] = parts;
    const data = `${h}.${p}`;
    const expected = base64url(createHmac("sha256", secret).update(data).digest());
    if (s !== expected) return { valid: false, error: "Invalid signature" };
    const payload = JSON.parse(Buffer.from(p, "base64").toString());
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && now > payload.exp) return { valid: false, error: "Token expired" };
    return { valid: true, payload };
  } catch (e: any) {
    return { valid: false, error: e?.message || "Invalid token" };
  }
}

