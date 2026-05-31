import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, rewardsTable } from "@workspace/db";
import {
  GetRewardsResponse,
  ClaimRewardBody,
  ClaimRewardResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function ensureRewards() {
  const existing = await db.select().from(rewardsTable).limit(1);
  if (existing.length > 0) return existing[0];
  const [created] = await db.insert(rewardsTable).values({}).returning();
  return created;
}

function parseReward(row: { totalStars: number; totalCrystals: number; totalCoins: number; badges: string }) {
  let badges: string[] = [];
  try {
    badges = JSON.parse(row.badges);
  } catch {
    badges = [];
  }
  return {
    totalStars: row.totalStars,
    totalCrystals: row.totalCrystals,
    totalCoins: row.totalCoins,
    badges,
  };
}

router.get("/rewards", async (req, res): Promise<void> => {
  const reward = await ensureRewards();
  res.json(GetRewardsResponse.parse(parseReward(reward)));
});

router.post("/rewards/claim", async (req, res): Promise<void> => {
  const body = ClaimRewardBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const reward = await ensureRewards();
  let badges: string[] = [];
  try {
    badges = JSON.parse(reward.badges);
  } catch {
    badges = [];
  }
  if (body.data.badge && !badges.includes(body.data.badge)) {
    badges.push(body.data.badge);
  }

  const [updated] = await db
    .update(rewardsTable)
    .set({
      totalStars: reward.totalStars + body.data.stars,
      totalCrystals: reward.totalCrystals + body.data.crystals,
      totalCoins: reward.totalCoins + body.data.coins,
      badges: JSON.stringify(badges),
      updatedAt: new Date(),
    })
    .where(eq(rewardsTable.id, reward.id))
    .returning();

  res.json(ClaimRewardResponse.parse(parseReward(updated)));
});

export default router;
