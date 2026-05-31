import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, scenesTable, playerProgressTable } from "@workspace/db";
import {
  GetSceneParams,
  CompleteSceneParams,
  CompleteSceneBody,
  ListScenesResponse,
  GetSceneResponse,
  CompleteSceneResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function serializeDates<T extends Record<string, unknown>>(row: T): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(row).map(([k, v]) => [k, v instanceof Date ? v.toISOString() : v])
  );
}

router.get("/scenes", async (req, res): Promise<void> => {
  const scenes = await db
    .select()
    .from(scenesTable)
    .orderBy(scenesTable.sceneNumber);
  res.json(ListScenesResponse.parse(scenes.map(s => serializeDates(s as Record<string, unknown>))));
});

router.get("/scenes/:sceneId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.sceneId)
    ? req.params.sceneId[0]
    : req.params.sceneId;
  const params = GetSceneParams.safeParse({ sceneId: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [scene] = await db
    .select()
    .from(scenesTable)
    .where(eq(scenesTable.sceneNumber, params.data.sceneId));

  if (!scene) {
    res.status(404).json({ error: "Scene not found" });
    return;
  }

  res.json(GetSceneResponse.parse(serializeDates(scene as Record<string, unknown>)));
});

router.post("/scenes/:sceneId/complete", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.sceneId)
    ? req.params.sceneId[0]
    : req.params.sceneId;
  const params = CompleteSceneParams.safeParse({ sceneId: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = CompleteSceneBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [scene] = await db
    .select()
    .from(scenesTable)
    .where(eq(scenesTable.sceneNumber, params.data.sceneId));

  if (!scene) {
    res.status(404).json({ error: "Scene not found" });
    return;
  }

  const newStars = Math.max(scene.starsEarned, body.data.starsEarned);
  const newScore = Math.max(scene.bestScore, body.data.score);

  const [updated] = await db
    .update(scenesTable)
    .set({
      isCompleted: true,
      starsEarned: newStars,
      bestScore: newScore,
      playCount: scene.playCount + 1,
      updatedAt: new Date(),
    })
    .where(eq(scenesTable.id, scene.id))
    .returning();

  // unlock next scene
  const nextSceneNum = scene.sceneNumber + 1;
  const [nextScene] = await db
    .select()
    .from(scenesTable)
    .where(eq(scenesTable.sceneNumber, nextSceneNum));

  if (nextScene && !nextScene.isUnlocked) {
    await db
      .update(scenesTable)
      .set({ isUnlocked: true, updatedAt: new Date() })
      .where(eq(scenesTable.id, nextScene.id));
  }

  // update player progress
  const [progress] = await db.select().from(playerProgressTable).limit(1);
  if (progress) {
    await db
      .update(playerProgressTable)
      .set({
        totalStars: progress.totalStars + body.data.starsEarned,
        scenesCompleted: Math.max(progress.scenesCompleted, scene.sceneNumber),
        currentScene: Math.max(progress.currentScene, nextSceneNum),
        totalPlayTimeSeconds:
          progress.totalPlayTimeSeconds + body.data.playTimeSeconds,
        updatedAt: new Date(),
      })
      .where(eq(playerProgressTable.id, progress.id));
  }

  res.json(CompleteSceneResponse.parse(serializeDates(updated as Record<string, unknown>)));
});

export default router;
