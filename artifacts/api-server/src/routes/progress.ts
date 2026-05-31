import { Router, type IRouter } from "express";
import { db, playerProgressTable } from "@workspace/db";
import {
  GetProgressResponse,
  ResetProgressResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function serializeDates<T extends Record<string, unknown>>(row: T): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(row).map(([k, v]) => [k, v instanceof Date ? v.toISOString() : v])
  );
}

async function ensureProgress() {
  const existing = await db.select().from(playerProgressTable).limit(1);
  if (existing.length > 0) return existing[0];
  const [created] = await db.insert(playerProgressTable).values({}).returning();
  return created;
}

router.get("/progress", async (req, res): Promise<void> => {
  const progress = await ensureProgress();
  res.json(GetProgressResponse.parse(serializeDates(progress as Record<string, unknown>)));
});

router.post("/progress/reset", async (req, res): Promise<void> => {
  const existing = await db.select().from(playerProgressTable).limit(1);
  if (existing.length === 0) {
    const [created] = await db.insert(playerProgressTable).values({}).returning();
    res.json(ResetProgressResponse.parse(serializeDates(created as Record<string, unknown>)));
    return;
  }
  const { eq } = await import("drizzle-orm");
  const [updated] = await db
    .update(playerProgressTable)
    .set({
      totalStars: 0,
      totalCrystals: 0,
      totalCoins: 0,
      currentScene: 1,
      scenesCompleted: 0,
      totalPlayTimeSeconds: 0,
      updatedAt: new Date(),
    })
    .where(eq(playerProgressTable.id, existing[0].id))
    .returning();
  res.json(ResetProgressResponse.parse(serializeDates(updated as Record<string, unknown>)));
});

export default router;
