import { Message, EmbedBuilder } from 'discord.js';
import { Command } from './index';
import { IStorage } from '../../storage';

export const helpCommand: Command = {
  name: 'help',
  description: 'Displays a list of available commands',
  usage: 'help [command]',
  category: 'Core',
  execute: async (message: Message, args: string[], storage: IStorage) => {
    // Get all commands from storage
    const commands = await storage.getCommands();
    const botSettings = await storage.getBotSettings();
    const prefix = botSettings?.prefix || '!';
    
    // If no specific command is mentioned, list all commands
    if (!args.length) {
      // Group commands by category
      const categorizedCommands: Record<string, typeof commands> = {};
      
      commands.forEach(cmd => {
        if (!cmd.enabled) return; // Skip disabled commands
        
        if (!categorizedCommands[cmd.category]) {
          categorizedCommands[cmd.category] = [];
        }
        
        categorizedCommands[cmd.category].push(cmd);
      });
      
      // Create an embed for the help command
      const embed = new EmbedBuilder()
        .setColor('#5865F2') // Discord Blurple
        .setTitle('Bot Commands')
        .setDescription(`Use \`${prefix}help [command]\` to get detailed info about a specific command.`)
        .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
        .setTimestamp();

      // Add fields for each category
      Object.keys(categorizedCommands).forEach(category => {
        const commandList = categorizedCommands[category]
          .map(cmd => `\`${cmd.name}\`: ${cmd.description}`)
          .join('\n');
        
        embed.addFields({ name: `${category} Commands`, value: commandList });
      });
      
      return message.reply({ embeds: [embed] });
    }
    
    // If a specific command is mentioned
    const commandName = args[0].toLowerCase();
    const command = commands.find(cmd => cmd.name === commandName && cmd.enabled);
    
    if (!command) {
      return message.reply(`I couldn't find that command. Use \`${prefix}help\` to see all commands.`);
    }
    
    // Create an embed for the specific command
    const embed = new EmbedBuilder()
      .setColor('#5865F2') // Discord Blurple
      .setTitle(`Command: ${command.name}`)
      .setDescription(command.description)
      .addFields(
        { name: 'Usage', value: `\`${prefix}${command.usage}\`` },
        { name: 'Category', value: command.category }
      )
      .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    
    return message.reply({ embeds: [embed] });
  }
};
