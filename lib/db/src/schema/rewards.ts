import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const rewardsTable = pgTable("rewards", {
  id: serial("id").primaryKey(),
  totalStars: integer("total_stars").notNull().default(0),
  totalCrystals: integer("total_crystals").notNull().default(0),
  totalCoins: integer("total_coins").notNull().default(0),
  badges: text("badges").notNull().default("[]"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertRewardSchema = createInsertSchema(rewardsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertReward = z.infer<typeof insertRewardSchema>;
export type Reward = typeof rewardsTable.$inferSelect;
