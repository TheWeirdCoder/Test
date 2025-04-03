import { Message } from 'discord.js';
import { helpCommand } from './help';
import { pingCommand } from './ping';
import { infoCommand } from './info';
import { IStorage } from '../../storage';

// Define the interface for commands
export interface Command {
  name: string;
  description: string;
  usage: string;
  category: string;
  execute: (message: Message, args: string[], storage: IStorage) => Promise<void>;
}

// Load all commands and return them as a Map
export async function loadCommands(): Promise<Map<string, Command>> {
  const commandsMap = new Map<string, Command>();
  
  // Add commands to the map
  const commands: Command[] = [
    helpCommand,
    pingCommand,
    infoCommand
  ];
  
  // Register each command
  for (const command of commands) {
    commandsMap.set(command.name, command);
  }
  
  return commandsMap;
}
