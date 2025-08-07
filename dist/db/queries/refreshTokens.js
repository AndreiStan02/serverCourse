import { eq, and, isNull, gt } from "drizzle-orm";
import { db } from "../index.js";
import { refreshTokens, users } from "../schema.js";
export async function saveRefreshToken(userID, token) {
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
export async function userForRefreshToken(token) {
    const [result] = await db
        .select({ user: users })
        .from(users)
        .innerJoin(refreshTokens, eq(users.id, refreshTokens.userId))
        .where(and(eq(refreshTokens.token, token), isNull(refreshTokens.revokedAt), gt(refreshTokens.expiresAt, new Date())))
        .limit(1);
    return result;
}
export async function revokeRefreshToken(token) {
    const rows = await db
        .update(refreshTokens)
        .set({ expiresAt: new Date() })
        .where(eq(refreshTokens.token, token))
        .returning();
    if (rows.length === 0) {
        throw new Error("Couldn't revoke token");
    }
}
