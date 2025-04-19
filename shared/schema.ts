import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Session model for remote viewing practice sessions
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  drawing: text("drawing").notNull(), // Base64 encoded image data
  targetImage: text("target_image").notNull(), // URL of the unsplash image
  thumbnailImage: text("thumbnail_image").notNull(), // Thumbnail URL of the unsplash image
  rating: text("rating").notNull(), // "hit", "miss", or "maybe"
  notes: text("notes"), // Optional user notes
  category: text("category"), // Category of the target image
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}));

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true,
});

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

// Define a schema for local storage sessions without requiring database
export const localSessionSchema = z.object({
  id: z.string(),
  drawing: z.string(),
  targetImage: z.string(),
  thumbnailImage: z.string(),
  rating: z.enum(["hit", "miss", "maybe"]),
  notes: z.string().optional(),
  category: z.string().optional(),
  createdAt: z.string(),
});

export type LocalSession = z.infer<typeof localSessionSchema>;
