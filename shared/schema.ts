import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Bot schema
export const commands = pgTable("commands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  usage: text("usage").notNull(),
  response: text("response").notNull().default(""),
  enabled: boolean("enabled").notNull().default(true),
});

export const insertCommandSchema = createInsertSchema(commands).pick({
  name: true,
  description: true,
  category: true,
  usage: true,
  response: true,
  enabled: true,
});

export type InsertCommand = z.infer<typeof insertCommandSchema>;
export type Command = typeof commands.$inferSelect;

export const botSettings = pgTable("bot_settings", {
  id: serial("id").primaryKey(),
  prefix: text("prefix").notNull().default("!"),
  botName: text("bot_name").notNull().default("Discord Bot"),
  botAvatar: text("bot_avatar"),
  helpCommandEnabled: boolean("help_command_enabled").notNull().default(true),
  commandNotFoundMessage: text("command_not_found_message").notNull().default("Sorry, I couldn't find that command. Try using !help to see all available commands."),
  logErrors: boolean("log_errors").notNull().default(true),
  displayErrorsToUsers: boolean("display_errors_to_users").notNull().default(true),
  showDetailedErrors: boolean("show_detailed_errors").notNull().default(false),
});

export const insertBotSettingsSchema = createInsertSchema(botSettings).pick({
  prefix: true,
  botName: true,
  botAvatar: true,
  helpCommandEnabled: true,
  commandNotFoundMessage: true,
  logErrors: true,
  displayErrorsToUsers: true,
  showDetailedErrors: true,
});

export type InsertBotSettings = z.infer<typeof insertBotSettingsSchema>;
export type BotSettings = typeof botSettings.$inferSelect;

export const commandLogs = pgTable("command_logs", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  userId: text("user_id").notNull(),
  username: text("username").notNull(),
  command: text("command").notNull(),
  isError: boolean("is_error").notNull().default(false),
  isWarning: boolean("is_warning").notNull().default(false),
  message: text("message").notNull(),
});

export const insertCommandLogSchema = createInsertSchema(commandLogs).pick({
  userId: true,
  username: true,
  command: true,
  isError: true,
  isWarning: true,
  message: true,
});

export type InsertCommandLog = z.infer<typeof insertCommandLogSchema>;
export type CommandLog = typeof commandLogs.$inferSelect;

// User login schema
export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

// User registration schema
export const registerSchema = loginSchema.extend({
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export type RegisterCredentials = z.infer<typeof registerSchema>;
