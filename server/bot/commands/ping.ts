import { Message, EmbedBuilder } from 'discord.js';
import { Command } from './index';
import { IStorage } from '../../storage';

export const pingCommand: Command = {
  name: 'ping',
  description: 'Checks the bot\'s response time',
  usage: 'ping',
  category: 'Utility',
  execute: async (message: Message, args: string[], storage: IStorage) => {
    // Send initial reply to measure roundtrip time
    const sent = await message.reply('Pinging...');
    
    // Calculate ping
    const roundtripLatency = sent.createdTimestamp - message.createdTimestamp;
    const apiLatency = message.client.ws.ping;
    
    // Create embed with ping information
    const embed = new EmbedBuilder()
      .setColor('#5865F2') // Discord Blurple
      .setTitle('🏓 Pong!')
      .addFields(
        { name: 'Roundtrip Latency', value: `${roundtripLatency}ms`, inline: true },
        { name: 'API Latency', value: `${apiLatency}ms`, inline: true }
      )
      .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    
    // Edit the original reply with the embed
    await sent.edit({ content: null, embeds: [embed] });
  }
};
