import { Client, GatewayIntentBits, Message, ActivityType } from 'discord.js';
import { storage } from '../storage';
import { loadCommands } from './commands';
import dotenv from 'dotenv';

dotenv.config();

let client: Client;
let commandPrefix: string = '!'; // Default prefix
let commands: Map<string, any> = new Map();

// Initialize the Discord bot
export async function initBot() {
  if (!process.env.DISCORD_TOKEN) {
    console.error('DISCORD_TOKEN environment variable not set');
    return;
  }

  try {
    // Initialize the database if needed
    if (process.env.DATABASE_URL) {
      await storage.initializeDatabase();
    }
    
    // Get bot settings from storage
    const settings = await storage.getBotSettings();
    if (settings) {
      commandPrefix = settings.prefix;
    }

    // Create a new Discord client with required intents for message commands
    client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
      ],
    });

    // Load commands
    commands = await loadCommands();

    // Event handler for when the bot is ready
    client.once('ready', () => {
      console.log(`Discord bot is ready! Logged in as ${client.user?.tag}`);
      
      // Set bot presence
      client.user?.setPresence({
        activities: [{ name: `${commandPrefix}help`, type: ActivityType.Listening }],
        status: 'online',
      });
    });

    // Event handler for messages
    client.on('messageCreate', async (message: Message) => {
      // Ignore messages from bots
      if (message.author.bot) return;
      
      // Check if message starts with the command prefix
      if (!message.content.startsWith(commandPrefix)) return;
      
      // Extract the command and arguments
      const args = message.content.slice(commandPrefix.length).trim().split(/ +/);
      const commandName = args.shift()?.toLowerCase();
      
      if (!commandName) return;
      
      // Check if the command exists
      const command = commands.get(commandName);
      
      // Log the command attempt
      try {
        await storage.createCommandLog({
          userId: message.author.id,
          username: message.author.tag,
          command: `${commandPrefix}${commandName}`,
          isError: !command, // If command doesn't exist, log as error
          isWarning: false,
          message: command 
            ? `${message.author.tag} executed command: ${commandPrefix}${commandName}`
            : `Error: ${message.author.tag} tried to use unknown command: ${commandPrefix}${commandName}`
        });
      } catch (err) {
        console.error('Error logging command:', err);
      }
      
      // If the command doesn't exist or is disabled
      if (!command) {
        // Get the custom "command not found" message from settings
        const settings = await storage.getBotSettings();
        if (settings && settings.displayErrorsToUsers) {
          await message.reply(settings.commandNotFoundMessage);
        }
        return;
      }
      
      // Execute the command
      try {
        await command.execute(message, args, storage);
      } catch (error) {
        console.error(`Error executing command ${commandName}:`, error);
        
        // Log the error
        const settings = await storage.getBotSettings();
        if (settings && settings.logErrors) {
          await storage.createCommandLog({
            userId: message.author.id,
            username: message.author.tag,
            command: `${commandPrefix}${commandName}`,
            isError: true,
            isWarning: false,
            message: `Error executing ${commandPrefix}${commandName}: ${(error as Error).message}`
          });
        }
        
        // Reply with error message
        if (settings && settings.displayErrorsToUsers) {
          let errorMessage = 'There was an error executing that command!';
          
          if (settings.showDetailedErrors) {
            errorMessage += ` Error: ${(error as Error).message}`;
          }
          
          await message.reply(errorMessage);
        }
      }
    });

    // Login to Discord
    await client.login(process.env.DISCORD_TOKEN);
    return client;
  } catch (error) {
    console.error('Error initializing Discord bot:', error);
    throw error;
  }
}

// Get the current command prefix
export function getCommandPrefix(): string {
  return commandPrefix;
}

// Update the command prefix
export async function updateBotPrefix(newPrefix: string): Promise<void> {
  commandPrefix = newPrefix;
  
  // Update prefix in database
  const settings = await storage.getBotSettings();
  if (settings) {
    await storage.updateBotSettings({ prefix: newPrefix });
  }
  
  // Update bot presence with new prefix
  if (client && client.user) {
    client.user.setPresence({
      activities: [{ name: `${commandPrefix}help`, type: ActivityType.Listening }],
      status: 'online',
    });
  }
}

// Update the bot's name and/or avatar
export async function updateBotProfile(options: { botName?: string, botAvatar?: string }): Promise<{ success: boolean; error?: string }> {
  if (!client || !client.user) {
    console.error('Bot client not initialized');
    return { success: false, error: 'Bot client not initialized' };
  }
  
  try {
    let nameUpdateSuccess = true;
    let nameUpdateError = null;
    
    // Update bot name if provided
    if (options.botName) {
      try {
        // Update username (global)
        await client.user.setUsername(options.botName);
        console.log(`Bot username updated to: ${options.botName}`);
        
        // Update nickname in each guild (server)
        const updatePromises = client.guilds.cache.map(async (guild) => {
          try {
            const member = await guild.members.fetch(client.user.id);
            await member.setNickname(options.botName);
            console.log(`Bot nickname updated in guild ${guild.name} to: ${options.botName}`);
            return true;
          } catch (nickError) {
            console.warn(`Could not update nickname in guild ${guild.name}:`, nickError);
            return false;
          }
        });
        
        // Wait for all nickname updates to complete
        await Promise.all(updatePromises);
        
      } catch (nameError: any) {
        // Record the error but continue in case we need to update avatar
        nameUpdateSuccess = false;
        nameUpdateError = nameError?.message || 'Failed to update bot name';
        console.error('Error updating bot name:', nameUpdateError);
        
        // If there's no avatar to update, return the error
        if (!options.botAvatar) {
          return { 
            success: false, 
            error: nameUpdateError
          };
        }
      }
    }
    
    // Update bot avatar if provided
    if (options.botAvatar) {
      try {
        await client.user.setAvatar(options.botAvatar);
        console.log(`Bot avatar updated to: ${options.botAvatar}`);
      } catch (avatarError: any) {
        console.error('Error updating bot avatar:', avatarError?.message || avatarError);
        
        // If the name was also unsuccessful or wasn't requested, return avatar error
        if (!options.botName || !nameUpdateSuccess) {
          return { 
            success: false, 
            error: avatarError?.message || 'Failed to update bot avatar'
          };
        }
      }
    }
    
    // Update database settings regardless of Discord API updates
    // This allows the database to store the intended values even if Discord API rejected them
    await storage.updateBotSettings({
      botName: options.botName,
      botAvatar: options.botAvatar
    });
    
    // If name update wasn't successful, return appropriate error
    if (options.botName && !nameUpdateSuccess) {
      return { 
        success: false, 
        error: nameUpdateError || 'Discord declined the username change, but database was updated. The name may be too common or violate Discord\'s policies.'
      };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Error updating bot profile:', error);
    return { 
      success: false, 
      error: error?.message || 'Unknown error updating bot profile'
    };
  }
}

// Get the Discord client
export function getBotClient(): Client | undefined {
  return client;
}
