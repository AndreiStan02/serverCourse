import { eq , asc , desc} from "drizzle-orm";
import { db } from "../index.js";
import { NewChirp, chirps } from "../schema.js";

export async function createChirp(chirp: NewChirp) {
  const [result] = await db
    .insert(chirps)
    .values(chirp)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function getAllChirps(sort: string){
    if (sort === "asc"){
      const result = await db.select().from(chirps).orderBy(asc(chirps.createdAt));
      return result;
    } else {
      const result = await db.select().from(chirps).orderBy(desc(chirps.createdAt));
      return result;
    }
}

export async function getAllChirpsForUser(userID: string, sort: string){
    if (sort === "asc"){
      const result = await db.select().from(chirps).orderBy(asc(chirps.createdAt)).where(eq(chirps.userId, userID));
      return result;
    } else {
      const result = await db.select().from(chirps).orderBy(desc(chirps.createdAt)).where(eq(chirps.userId, userID));
      return result;
    }
}

export async function getOneChirp(id: string){
    const [result] = await db.select().from(chirps).where(eq(chirps.id, id));
    return result;
}

export async function deleteChirpById(id: string){
  await db.delete(chirps).where(eq(chirps.id, id));
}