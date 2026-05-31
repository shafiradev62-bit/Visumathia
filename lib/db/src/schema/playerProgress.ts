import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const playerProgressTable = pgTable("player_progress", {
  id: serial("id").primaryKey(),
  totalStars: integer("total_stars").notNull().default(0),
  totalCrystals: integer("total_crystals").notNull().default(0),
  totalCoins: integer("total_coins").notNull().default(0),
  currentScene: integer("current_scene").notNull().default(1),
  scenesCompleted: integer("scenes_completed").notNull().default(0),
  totalPlayTimeSeconds: integer("total_play_time_seconds").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPlayerProgressSchema = createInsertSchema(playerProgressTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPlayerProgress = z.infer<typeof insertPlayerProgressSchema>;
export type PlayerProgress = typeof playerProgressTable.$inferSelect;
