import { eq, and, isNull, gt } from "drizzle-orm";
import { db } from "../index.js";
import { NewRefreshToken, refreshTokens, users } from "../schema.js";
import { getUserByID } from "./users.js";

export async function saveRefreshToken(userID: string, token: string) {
  const rows = await db
    .insert(refreshTokens)
    .values({
      token: token,
      userId: userID,
      expiresAt: new Date(Date.now() + 60),
      revokedAt: null,
    })
    .returning();

  return rows.length > 0;
}

export async function userForRefreshToken(token: string) {
  const [result] = await db
    .select({ user: users })
    .from(users)
    .innerJoin(refreshTokens, eq(users.id, refreshTokens.userId))
    .where(
      and(
        eq(refreshTokens.token, token),
        isNull(refreshTokens.revokedAt),
        gt(refreshTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return result;
}

export async function revokeRefreshToken(token: string) {
  const rows = await db
    .update(refreshTokens)
    .set({ expiresAt: new Date() })
    .where(eq(refreshTokens.token, token))
    .returning();

  if (rows.length === 0) {
    throw new Error("Couldn't revoke token");
  }
}