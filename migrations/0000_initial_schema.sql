-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "username" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL
);

-- Create commands table
CREATE TABLE IF NOT EXISTS "commands" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "usage" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true
);

-- Create bot_settings table
CREATE TABLE IF NOT EXISTS "bot_settings" (
  "id" SERIAL PRIMARY KEY,
  "prefix" TEXT NOT NULL DEFAULT '!',
  "help_command_enabled" BOOLEAN NOT NULL DEFAULT true,
  "command_not_found_message" TEXT NOT NULL DEFAULT 'Sorry, I couldn''t find that command. Try using !help to see all available commands.',
  "log_errors" BOOLEAN NOT NULL DEFAULT true,
  "display_errors_to_users" BOOLEAN NOT NULL DEFAULT true,
  "show_detailed_errors" BOOLEAN NOT NULL DEFAULT false
);

-- Create command_logs table
CREATE TABLE IF NOT EXISTS "command_logs" (
  "id" SERIAL PRIMARY KEY,
  "timestamp" TIMESTAMP NOT NULL DEFAULT NOW(),
  "user_id" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "command" TEXT NOT NULL,
  "is_error" BOOLEAN NOT NULL DEFAULT false,
  "is_warning" BOOLEAN NOT NULL DEFAULT false,
  "message" TEXT NOT NULL
);

-- Insert default bot settings if none exist
INSERT INTO "bot_settings" ("prefix", "help_command_enabled", "command_not_found_message", "log_errors", "display_errors_to_users", "show_detailed_errors")
SELECT '!', true, 'Sorry, I couldn''t find that command. Try using !help to see all available commands.', true, true, false
WHERE NOT EXISTS (SELECT 1 FROM "bot_settings" LIMIT 1);

-- Insert default commands if none exist
INSERT INTO "commands" ("name", "description", "category", "usage", "enabled")
SELECT 'help', 'Displays a list of available commands', 'Core', '!help [command]', true
WHERE NOT EXISTS (SELECT 1 FROM "commands" WHERE "name" = 'help');

INSERT INTO "commands" ("name", "description", "category", "usage", "enabled")
SELECT 'ping', 'Checks the bot''s response time', 'Utility', '!ping', true 
WHERE NOT EXISTS (SELECT 1 FROM "commands" WHERE "name" = 'ping');

INSERT INTO "commands" ("name", "description", "category", "usage", "enabled")
SELECT 'info', 'Shows information about the bot', 'Utility', '!info', true
WHERE NOT EXISTS (SELECT 1 FROM "commands" WHERE "name" = 'info');