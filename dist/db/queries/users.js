import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { users } from "../schema.js";
export async function createUser(user) {
    const [result] = await db
        .insert(users)
        .values(user)
        .onConflictDoNothing()
        .returning();
    const { hashedPassword: _, ...returnedUser } = result;
    return returnedUser;
}
export async function getUser(email) {
    const [result] = await db.select().from(users).where(eq(users.email, email));
    return result;
}
export async function getUserByID(id) {
    const [result] = await db.select().from(users).where(eq(users.id, id));
    return result;
}
export async function deleteAllUsers() {
    await db.delete(users);
}
export async function updateUser(id, email, password) {
    const [result] = await db.update(users).set({ email: email, hashedPassword: password }).where(eq(users.id, id)).returning();
    return result;
}
export async function upgradeUserRed(id) {
    const [result] = await db.update(users).set({ isChirpyRed: true }).where(eq(users.id, id)).returning();
    return result;
}
