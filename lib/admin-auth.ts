import { cookies } from "next/headers";
import { createHash } from "crypto";

export const ADMIN_COOKIE = "vbweb-admin";

export function adminToken(password: string): string {
  return createHash("sha256").update(`vbweb-admin:${password}`).digest("hex");
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const c = await cookies();
  const token = c.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return token === adminToken(expected);
}
