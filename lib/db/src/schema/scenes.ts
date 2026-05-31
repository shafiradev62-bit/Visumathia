import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const scenesTable = pgTable("scenes", {
  id: serial("id").primaryKey(),
  sceneNumber: integer("scene_number").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  isUnlocked: boolean("is_unlocked").notNull().default(false),
  isCompleted: boolean("is_completed").notNull().default(false),
  starsEarned: integer("stars_earned").notNull().default(0),
  maxStars: integer("max_stars").notNull().default(3),
  bestScore: integer("best_score").notNull().default(0),
  playCount: integer("play_count").notNull().default(0),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSceneSchema = createInsertSchema(scenesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertScene = z.infer<typeof insertSceneSchema>;
export type Scene = typeof scenesTable.$inferSelect;
