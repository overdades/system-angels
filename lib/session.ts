import crypto from "crypto";

type Payload = {
  memberId: number;
  iat: number;
};

const SECRET = process.env.AOC_SESSION_SECRET || "";

function b64url(input: Buffer | string) {
  const b = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return b.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function fromB64url(s: string) {
  const pad = 4 - (s.length % 4 || 4);
  const base64 = (s + "=".repeat(pad)).replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(base64, "base64");
}

export function signSession(memberId: number) {
  if (!SECRET || SECRET.length < 16) throw new Error("SESSION_SECRET fraco/ausente.");
  const payload: Payload = { memberId, iat: Date.now() };
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = b64url(payloadStr);
  const sig = crypto.createHmac("sha256", SECRET).update(payloadB64).digest();
  return `${payloadB64}.${b64url(sig)}`;
}

export function verifySession(token: string | undefined | null): Payload | null {
  if (!token) return null;
  const [payloadB64, sigB64] = token.split(".");
  if (!payloadB64 || !sigB64) return null;

  const expectedSig = crypto.createHmac("sha256", SECRET).update(payloadB64).digest();
  const gotSig = fromB64url(sigB64);

  // timing-safe compare
  if (gotSig.length !== expectedSig.length) return null;
  if (!crypto.timingSafeEqual(gotSig, expectedSig)) return null;

  try {
    const payload = JSON.parse(fromB64url(payloadB64).toString("utf8")) as Payload;
    if (typeof payload.memberId !== "number") return null;

    // expiração opcional (ex: 7 dias)
    const age = Date.now() - payload.iat;
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    if (age > sevenDays) return null;

    return payload;
  } catch {
    return null;
  }
}