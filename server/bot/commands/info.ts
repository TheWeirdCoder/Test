import { Message, EmbedBuilder, version as discordJsVersion } from 'discord.js';
import { Command } from './index';
import { IStorage } from '../../storage';

export const infoCommand: Command = {
  name: 'info',
  description: 'Shows information about the bot',
  usage: 'info',
  category: 'Utility',
  execute: async (message: Message, args: string[], storage: IStorage) => {
    const client = message.client;
    
    // Calculate uptime
    const uptime = client.uptime ? Math.floor(client.uptime / 1000) : 0;
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    const uptimeString = `${days}d ${remainingHours}h ${minutes}m ${seconds}s`;
    
    // Create embed with bot information
    const embed = new EmbedBuilder()
      .setColor('#5865F2') // Discord Blurple
      .setTitle('Bot Information')
      .setThumbnail(client.user?.displayAvatarURL() || '')
      .addFields(
        { name: 'Bot Name', value: client.user?.username || 'Unknown', inline: true },
        { name: 'Bot ID', value: client.user?.id || 'Unknown', inline: true },
        { name: 'Uptime', value: uptimeString, inline: true },
        { name: 'Servers', value: client.guilds.cache.size.toString(), inline: true },
        { name: 'Discord.js Version', value: discordJsVersion, inline: true },
        { name: 'Node.js Version', value: process.version, inline: true }
      )
      .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    
    // If the bot is in a guild, add guild-specific information
    if (message.guild) {
      embed.addFields(
        { name: 'Current Server', value: message.guild.name, inline: true },
        { name: 'Server Members', value: message.guild.memberCount.toString(), inline: true }
      );
    }
    
    await message.reply({ embeds: [embed] });
  }
};
