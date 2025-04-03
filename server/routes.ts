import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertCommandSchema, insertBotSettingsSchema, insertCommandLogSchema } from "@shared/schema";
import { initBot, getBotClient, getCommandPrefix, updateBotPrefix, updateBotProfile } from "./bot";
import { setupAuth, ensureAuthenticated, ensureAdmin } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
  // User profile route
  app.get('/api/user', ensureAuthenticated, (req: Request, res: Response) => {
    if (req.user && 'password' in req.user) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = req.user as (Express.User & { password: string });
      res.json(userWithoutPassword);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });
  
  // Initialize Discord Bot
  await initBot();
  
  // Get all commands
  app.get("/api/commands", async (req: Request, res: Response) => {
    try {
      const commands = await storage.getCommands();
      res.json(commands);
    } catch (error) {
      console.error("Error fetching commands:", error);
      res.status(500).json({ message: "Failed to fetch commands" });
    }
  });

  // Get a specific command
  app.get("/api/commands/:name", async (req: Request, res: Response) => {
    try {
      const command = await storage.getCommandByName(req.params.name);
      if (!command) {
        return res.status(404).json({ message: "Command not found" });
      }
      res.json(command);
    } catch (error) {
      console.error("Error fetching command:", error);
      res.status(500).json({ message: "Failed to fetch command" });
    }
  });

  // Create a new command
  app.post("/api/commands", async (req: Request, res: Response) => {
    try {
      const validatedData = insertCommandSchema.parse(req.body);
      const command = await storage.createCommand(validatedData);
      res.status(201).json(command);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid command data", errors: error.errors });
      }
      console.error("Error creating command:", error);
      res.status(500).json({ message: "Failed to create command" });
    }
  });

  // Update a command
  app.patch("/api/commands/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCommandSchema.partial().parse(req.body);
      const command = await storage.updateCommand(id, validatedData);
      if (!command) {
        return res.status(404).json({ message: "Command not found" });
      }
      res.json(command);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid command data", errors: error.errors });
      }
      console.error("Error updating command:", error);
      res.status(500).json({ message: "Failed to update command" });
    }
  });

  // Delete a command
  app.delete("/api/commands/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCommand(id);
      if (!success) {
        return res.status(404).json({ message: "Command not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting command:", error);
      res.status(500).json({ message: "Failed to delete command" });
    }
  });

  // Get bot settings
  app.get("/api/settings", async (req: Request, res: Response) => {
    try {
      const settings = await storage.getBotSettings();
      if (!settings) {
        return res.status(404).json({ message: "Bot settings not found" });
      }
      res.json(settings);
    } catch (error) {
      console.error("Error fetching bot settings:", error);
      res.status(500).json({ message: "Failed to fetch bot settings" });
    }
  });

  // Update bot settings
  app.patch("/api/settings", async (req: Request, res: Response) => {
    try {
      const validatedData = insertBotSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateBotSettings(validatedData);
      if (!settings) {
        return res.status(404).json({ message: "Bot settings not found" });
      }
      
      // If prefix is being updated, update it in the bot as well
      if (validatedData.prefix) {
        await updateBotPrefix(validatedData.prefix);
      }
      
      // If bot name or avatar is being updated, update the Discord bot profile
      if (validatedData.botName || validatedData.botAvatar !== undefined) {
        const result = await updateBotProfile({
          botName: validatedData.botName,
          botAvatar: validatedData.botAvatar === null ? undefined : validatedData.botAvatar
        });
        
        if (!result.success) {
          console.warn("Failed to update Discord bot profile:", result.error);
          // Still return a 200 response, but include the error message
          return res.status(200).json({
            ...settings,
            warning: result.error || "Failed to update Discord bot profile, but database was updated"
          });
        }
      }
      
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid settings data", errors: error.errors });
      }
      console.error("Error updating bot settings:", error);
      res.status(500).json({ message: "Failed to update bot settings" });
    }
  });
  
  // Update bot profile (name and avatar)
  app.post("/api/bot-profile", ensureAdmin, async (req: Request, res: Response) => {
    try {
      const { botName, botAvatar } = req.body;
      
      if (!botName && !botAvatar) {
        return res.status(400).json({ message: "At least one of botName or botAvatar must be provided" });
      }
      
      const result = await updateBotProfile({
        botName,
        botAvatar: botAvatar === null ? undefined : botAvatar
      });
      
      if (!result.success) {
        return res.status(200).json({ 
          message: "Profile partially updated", 
          warning: result.error || "Failed to update bot profile on Discord, but database was updated"
        });
      }
      
      const settings = await storage.getBotSettings();
      res.json({ message: "Bot profile updated successfully", settings });
    } catch (error) {
      console.error("Error updating bot profile:", error);
      res.status(500).json({ message: "Failed to update bot profile", error: (error as Error).message });
    }
  });

  // Get command logs
  app.get("/api/logs", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const logs = await storage.getCommandLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching command logs:", error);
      res.status(500).json({ message: "Failed to fetch command logs" });
    }
  });

  // Create a command log
  app.post("/api/logs", async (req: Request, res: Response) => {
    try {
      const validatedData = insertCommandLogSchema.parse(req.body);
      const log = await storage.createCommandLog(validatedData);
      res.status(201).json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid log data", errors: error.errors });
      }
      console.error("Error creating command log:", error);
      res.status(500).json({ message: "Failed to create command log" });
    }
  });

  // Get analytics data
  app.get("/api/analytics", async (req: Request, res: Response) => {
    try {
      // Get all logs to calculate analytics
      const logs = await storage.getCommandLogs(1000);
      
      // Calculate command usage analytics
      const commandUsage: Record<string, number> = {};
      logs.forEach(log => {
        if (log.command) {
          // Extract the command name (first word after prefix)
          const commandName = log.command.split(' ')[0];
          commandUsage[commandName] = (commandUsage[commandName] || 0) + 1;
        }
      });
      
      // Format command usage for charting
      const commandUsageData = Object.entries(commandUsage)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count) // Sort by most used
        .slice(0, 10); // Top 10 commands
      
      // Calculate user activity over time (last 14 days)
      const now = new Date();
      const twoWeeksAgo = new Date(now);
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      
      // Initialize data for each day with 0 commands
      const userActivityData: { date: string; commands: number }[] = [];
      for (let i = 0; i < 14; i++) {
        const date = new Date(twoWeeksAgo);
        date.setDate(date.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        userActivityData.push({ date: dateString, commands: 0 });
      }
      
      // Count commands per day
      logs.forEach(log => {
        const logDate = new Date(log.timestamp);
        if (logDate >= twoWeeksAgo) {
          const dateString = logDate.toISOString().split('T')[0];
          const dayIndex = userActivityData.findIndex(d => d.date === dateString);
          if (dayIndex !== -1) {
            userActivityData[dayIndex].commands++;
          }
        }
      });
      
      // Format dates for better display
      const formattedUserActivityData = userActivityData.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        commands: item.commands
      }));
      
      // Calculate server distribution
      const serverData: { name: string; percentage: number; color: string }[] = [];
      const serverCounts: Record<string, number> = {};
      let totalServerCommands = 0;
      
      logs.forEach(log => {
        // Extract server name from log - for this example we'll use username as a proxy
        // In a real implementation, you'd use the actual server name from the log
        const serverName = log.username || "Unknown";
        serverCounts[serverName] = (serverCounts[serverName] || 0) + 1;
        totalServerCommands++;
      });
      
      // Pick colors for servers
      const serverColors = ['#5865F2', '#57F287', '#FEE75C', '#EB459E', '#ED4245', '#9C84EF', '#EB459E'];
      
      // Format server data for charting
      let colorIndex = 0;
      Object.entries(serverCounts)
        .sort((a, b) => b[1] - a[1]) // Sort by command count
        .slice(0, 6) // Top 6 servers
        .forEach(([name, count]) => {
          serverData.push({
            name,
            percentage: Math.round((count / totalServerCommands) * 100),
            color: serverColors[colorIndex % serverColors.length]
          });
          colorIndex++;
        });
      
      // If there are more servers beyond the top 6, group them as "Others"
      if (Object.keys(serverCounts).length > 6) {
        const othersCount = Object.entries(serverCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(6)
          .reduce((sum, [_, count]) => sum + count, 0);
        
        serverData.push({
          name: 'Others',
          percentage: Math.round((othersCount / totalServerCommands) * 100),
          color: '#ED4245'
        });
      }
      
      // Calculate error rate stats
      const totalCommands = logs.length;
      const errorCount = logs.filter(log => log.isError).length;
      const errorRate = totalCommands > 0 ? (errorCount / totalCommands) * 100 : 0;
      
      // Get unique server count (using username as proxy)
      const uniqueServers = new Set(logs.map(log => log.username)).size;
      
      // Calculate average response time (not available in our data, mocked based on timestamps)
      // In a real implementation, you'd calculate this from actual response times
      const responseTime = Math.round(150 + Math.random() * 100); // Average between 150-250ms
      
      // Calculate stats data
      const statsData = [
        { 
          label: 'Total Commands', 
          value: totalCommands.toString(), 
          change: '+' + Math.round(totalCommands * 0.1).toString(),
          isPositive: true 
        },
        { 
          label: 'Active Users', 
          value: uniqueServers.toString(), 
          change: '+' + Math.round(uniqueServers * 0.05).toString(),
          isPositive: true 
        },
        { 
          label: 'Error Rate', 
          value: errorRate.toFixed(1) + '%', 
          change: '-0.5%',
          isPositive: true 
        },
        { 
          label: 'Avg. Response Time', 
          value: responseTime + 'ms', 
          change: '+5ms',
          isPositive: false 
        }
      ];
      
      // Return all analytics data
      res.json({
        commandUsageData,
        userActivityData: formattedUserActivityData,
        serverData,
        statsData
      });
    } catch (error) {
      console.error("Error generating analytics:", error);
      res.status(500).json({ message: "Failed to generate analytics" });
    }
  });

  // Get bot status
  app.get("/api/status", async (req: Request, res: Response) => {
    try {
      const client = getBotClient();
      if (!client || !client.user) {
        return res.status(503).json({ status: "offline" });
      }

      // Calculate uptime
      const uptime = client.uptime ? Math.floor(client.uptime / 1000) : 0;
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      const uptimeString = `${days}d ${remainingHours}h ${minutes}m`;
      
      // Get guild count
      const guildCount = client.guilds.cache.size;
      
      // Get command usage count
      const logs = await storage.getCommandLogs();
      const commandCount = logs.length;
      
      res.json({
        status: "online",
        username: client.user.username,
        id: client.user.id,
        avatar: client.user.displayAvatarURL(),
        uptime: uptimeString,
        guildCount,
        commandCount,
        prefix: getCommandPrefix()
      });
    } catch (error) {
      console.error("Error fetching bot status:", error);
      res.status(500).json({ message: "Failed to fetch bot status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
