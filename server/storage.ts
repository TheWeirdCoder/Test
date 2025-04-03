import { 
  users, type User, type InsertUser,
  commands, type Command, type InsertCommand,
  botSettings, type BotSettings, type InsertBotSettings,
  commandLogs, type CommandLog, type InsertCommandLog
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;

  // Command methods
  getCommands(): Promise<Command[]>;
  getCommandByName(name: string): Promise<Command | undefined>;
  createCommand(command: InsertCommand): Promise<Command>;
  updateCommand(id: number, command: Partial<InsertCommand>): Promise<Command | undefined>;
  deleteCommand(id: number): Promise<boolean>;

  // Bot settings methods
  getBotSettings(): Promise<BotSettings | undefined>;
  updateBotSettings(settings: Partial<InsertBotSettings>): Promise<BotSettings | undefined>;

  // Command logs methods
  getCommandLogs(limit?: number): Promise<CommandLog[]>;
  createCommandLog(log: InsertCommandLog): Promise<CommandLog>;
  
  // Database initialization
  initializeDatabase(): Promise<void>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private commandsStore: Map<number, Command>;
  private botSettingsStore: Map<number, BotSettings>;
  private commandLogsStore: Map<number, CommandLog>;
  userCurrentId: number;
  commandCurrentId: number;
  botSettingsCurrentId: number;
  commandLogCurrentId: number;

  constructor() {
    this.users = new Map();
    this.commandsStore = new Map();
    this.botSettingsStore = new Map();
    this.commandLogsStore = new Map();
    this.userCurrentId = 1;
    this.commandCurrentId = 1;
    this.botSettingsCurrentId = 1;
    this.commandLogCurrentId = 1;
    
    // Initialize with default commands
    this.initializeCommands();
    this.initializeBotSettings();
  }

  private initializeCommands() {
    const defaultCommands: InsertCommand[] = [
      {
        name: "help",
        description: "Displays a list of available commands",
        category: "Core",
        usage: "!help [command]",
        enabled: true,
      },
      {
        name: "ping",
        description: "Checks the bot's response time",
        category: "Utility",
        usage: "!ping",
        enabled: true,
      },
      {
        name: "info",
        description: "Shows information about the bot",
        category: "Utility",
        usage: "!info",
        enabled: true,
      }
    ];

    defaultCommands.forEach(cmd => this.createCommand(cmd));
  }

  private initializeBotSettings() {
    const defaultSettings: InsertBotSettings = {
      prefix: "!",
      botName: "Discord Bot",
      botAvatar: null,
      helpCommandEnabled: true,
      commandNotFoundMessage: "Sorry, I couldn't find that command. Try using !help to see all available commands.",
      logErrors: true,
      displayErrorsToUsers: true,
      showDetailedErrors: false,
    };

    const id = this.botSettingsCurrentId++;
    const settings: BotSettings = { 
      id,
      prefix: "!",
      botName: "Discord Bot",
      botAvatar: null,
      helpCommandEnabled: true,
      commandNotFoundMessage: "Sorry, I couldn't find that command. Try using !help to see all available commands.",
      logErrors: true,
      displayErrorsToUsers: true,
      showDetailedErrors: false
    };
    this.botSettingsStore.set(id, settings);
  }

  // Implementation required by IStorage interface
  async initializeDatabase(): Promise<void> {
    // No database to initialize for in-memory storage, but we'll create the specified user
    const specialUser = await this.getUserByUsername("XtalyVA");
    if (!specialUser) {
      console.log("Creating XtalyVA user...");
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash("binxisacoolcat!", 10);
      await this.createUser({
        username: "XtalyVA",
        password: hashedPassword,
        role: "admin"
      });
    }
    return;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "user" 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;

    const updatedUser = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Command methods
  async getCommands(): Promise<Command[]> {
    return Array.from(this.commandsStore.values());
  }

  async getCommandByName(name: string): Promise<Command | undefined> {
    return Array.from(this.commandsStore.values()).find(
      (command) => command.name === name,
    );
  }

  async createCommand(insertCommand: InsertCommand): Promise<Command> {
    const id = this.commandCurrentId++;
    // Ensure all required fields are present
    const command: Command = { 
      id,
      name: insertCommand.name,
      description: insertCommand.description,
      category: insertCommand.category,
      usage: insertCommand.usage,
      response: insertCommand.response || "",
      enabled: insertCommand.enabled ?? true
    };
    this.commandsStore.set(id, command);
    return command;
  }

  async updateCommand(id: number, command: Partial<InsertCommand>): Promise<Command | undefined> {
    const existingCommand = this.commandsStore.get(id);
    if (!existingCommand) return undefined;

    const updatedCommand = { ...existingCommand, ...command };
    this.commandsStore.set(id, updatedCommand);
    return updatedCommand;
  }

  async deleteCommand(id: number): Promise<boolean> {
    return this.commandsStore.delete(id);
  }

  // Bot settings methods
  async getBotSettings(): Promise<BotSettings | undefined> {
    // Return the first settings object (we only have one)
    return Array.from(this.botSettingsStore.values())[0];
  }

  async updateBotSettings(settings: Partial<InsertBotSettings>): Promise<BotSettings | undefined> {
    const existingSettings = Array.from(this.botSettingsStore.values())[0];
    if (!existingSettings) return undefined;

    const updatedSettings = { ...existingSettings, ...settings };
    this.botSettingsStore.set(existingSettings.id, updatedSettings);
    return updatedSettings;
  }

  // Command logs methods
  async getCommandLogs(limit: number = 100): Promise<CommandLog[]> {
    const logs = Array.from(this.commandLogsStore.values());
    return logs.sort((a, b) => {
      // Sort by timestamp descending (newest first)
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }).slice(0, limit);
  }

  async createCommandLog(insertLog: InsertCommandLog): Promise<CommandLog> {
    const id = this.commandLogCurrentId++;
    const log: CommandLog = { 
      id,
      username: insertLog.username,
      message: insertLog.message,
      timestamp: new Date(),
      userId: insertLog.userId,
      command: insertLog.command,
      isError: insertLog.isError ?? false,
      isWarning: insertLog.isWarning ?? false
    };
    this.commandLogsStore.set(id, log);
    return log;
  }
}

// PostgreSQL storage implementation using Drizzle ORM
export class PostgresStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;
  private client: ReturnType<typeof postgres>;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    // Create database connection
    this.client = postgres(process.env.DATABASE_URL);
    this.db = drizzle(this.client);
  }

  // Initialize the database with default values if needed
  async initializeDatabase(): Promise<void> {
    console.log("Initializing database...");
    
    // Check if we need to create default commands
    const existingCommands = await this.getCommands();
    if (existingCommands.length === 0) {
      console.log("Creating default commands...");
      const defaultCommands: InsertCommand[] = [
        {
          name: "help",
          description: "Displays a list of available commands",
          category: "general",
          usage: "!help [command]",
          response: "Here are all the available commands:",
          enabled: true,
        },
        {
          name: "ping",
          description: "Checks the bot's response time",
          category: "utility",
          usage: "!ping",
          response: "Pong! Response time: {ping}ms",
          enabled: true,
        },
        {
          name: "info",
          description: "Shows information about the bot",
          category: "utility",
          usage: "!info",
          response: "**Bot Information**\nName: {botName}\nUptime: {uptime}\nServers: {serverCount}\nCommands: {commandCount}",
          enabled: true,
        }
      ];

      for (const cmd of defaultCommands) {
        await this.createCommand(cmd);
      }
    }

    // Check if we need to create default bot settings
    const existingSettings = await this.getBotSettings();
    if (!existingSettings) {
      console.log("Creating default bot settings...");
      const defaultSettings: InsertBotSettings = {
        prefix: "!",
        botName: "Xtaly's Bot",
        botAvatar: null,
        helpCommandEnabled: true,
        commandNotFoundMessage: "Sorry, I couldn't find that command. Try using !help to see all available commands.",
        logErrors: true,
        displayErrorsToUsers: true,
        showDetailedErrors: false,
      };

      await this.db.insert(botSettings).values(defaultSettings);
    }
    
    // Check if we need to create the specified user
    const specialUser = await this.getUserByUsername("XtalyVA");
    if (!specialUser) {
      console.log("Creating XtalyVA user...");
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash("binxisacoolcat!", 10);
      await this.db.insert(users).values({
        username: "XtalyVA",
        password: hashedPassword,
        role: "admin"
      });
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const result = await this.db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    
    return result[0];
  }

  // Command methods
  async getCommands(): Promise<Command[]> {
    return this.db.select().from(commands);
  }

  async getCommandByName(name: string): Promise<Command | undefined> {
    const result = await this.db.select().from(commands).where(eq(commands.name, name));
    return result[0];
  }

  async createCommand(insertCommand: InsertCommand): Promise<Command> {
    const result = await this.db.insert(commands).values(insertCommand).returning();
    return result[0];
  }

  async updateCommand(id: number, command: Partial<InsertCommand>): Promise<Command | undefined> {
    const result = await this.db.update(commands)
      .set(command)
      .where(eq(commands.id, id))
      .returning();
    
    return result[0];
  }

  async deleteCommand(id: number): Promise<boolean> {
    const result = await this.db.delete(commands).where(eq(commands.id, id)).returning();
    return result.length > 0;
  }

  // Bot settings methods
  async getBotSettings(): Promise<BotSettings | undefined> {
    const result = await this.db.select().from(botSettings);
    return result[0];
  }

  async updateBotSettings(settings: Partial<InsertBotSettings>): Promise<BotSettings | undefined> {
    // Get the first settings object
    const existingSettings = await this.getBotSettings();
    
    if (!existingSettings) {
      const inserted = await this.db.insert(botSettings).values(settings).returning();
      return inserted[0];
    }
    
    const result = await this.db.update(botSettings)
      .set(settings)
      .where(eq(botSettings.id, existingSettings.id))
      .returning();
    
    return result[0];
  }

  // Command logs methods
  async getCommandLogs(limit: number = 100): Promise<CommandLog[]> {
    return this.db.select()
      .from(commandLogs)
      .orderBy(desc(commandLogs.timestamp))
      .limit(limit);
  }

  async createCommandLog(insertLog: InsertCommandLog): Promise<CommandLog> {
    const result = await this.db.insert(commandLogs).values(insertLog).returning();
    return result[0];
  }
}

// Create and export the storage instance
// Using PostgreSQL storage explicitly as we have a database available
export const storage = new PostgresStorage();
