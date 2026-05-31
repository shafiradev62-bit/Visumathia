import { Router, type IRouter } from "express";
import { db, scenesTable, playerProgressTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetStatsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stats", async (req, res): Promise<void> => {
  const [progress] = await db.select().from(playerProgressTable).limit(1);
  const scenes = await db.select().from(scenesTable).where(eq(scenesTable.isCompleted, true));

  const totalScenesCompleted = scenes.length;
  const totalStars = progress?.totalStars ?? 0;
  const totalPlayTimeSeconds = progress?.totalPlayTimeSeconds ?? 0;
  const averageStarsPerScene =
    totalScenesCompleted > 0
      ? Math.round((totalStars / totalScenesCompleted) * 10) / 10
      : 0;
  const mostRecentScene = progress?.currentScene ?? 1;
  const completionPercentage = Math.round((totalScenesCompleted / 10) * 100);

  res.json(
    GetStatsResponse.parse({
      totalScenesCompleted,
      totalStars,
      totalPlayTimeSeconds,
      averageStarsPerScene,
      mostRecentScene,
      completionPercentage,
    })
  );
});

export default router;
