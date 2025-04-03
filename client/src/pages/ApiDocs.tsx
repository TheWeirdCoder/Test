import { useState } from "react";
import BackButton from "@/components/BackButton";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Code } from "lucide-react";

export default function ApiDocs() {
  const [activeTab, setActiveTab] = useState("placeholders");

  // Define all documentation sections
  const placeholders = [
    { name: "{ping}", description: "The bot's current response time in milliseconds", example: "Pong! Response time: {ping}ms" },
    { name: "{botName}", description: "The name of the bot", example: "Hello! I'm {botName}" },
    { name: "{uptime}", description: "How long the bot has been running", example: "I've been online for {uptime}" },
    { name: "{serverCount}", description: "Number of servers the bot is in", example: "I'm in {serverCount} servers" },
    { name: "{commandCount}", description: "Number of commands available", example: "I have {commandCount} commands" },
    { name: "{prefix}", description: "The bot's command prefix", example: "My prefix is {prefix}" },
    { name: "{user}", description: "The username of the user who triggered the command", example: "Hello, {user}!" },
    { name: "{userId}", description: "The ID of the user who triggered the command", example: "Your ID is {userId}" },
    { name: "{server}", description: "The name of the server where the command was used", example: "Welcome to {server}" },
    { name: "{channel}", description: "The name of the channel where the command was used", example: "You're in {channel}" },
  ];

  const apiVariables = [
    { name: "{city}", description: "Used in weather commands to insert city name from user input", example: "!weather New York → The weather in {city} is..." },
    { name: "{temperature}", description: "Inserts temperature value from weather API response", example: "The temperature in London is {temperature}°C" },
    { name: "{description}", description: "Inserts weather condition description", example: "Current conditions: {description}" },
    { name: "{joke}", description: "Inserts joke from joke API", example: "{joke}" },
    { name: "{symbol}", description: "Cryptocurrency symbol from user input", example: "!crypto BTC → Current price of {symbol}: $..." },
    { name: "{price}", description: "Cryptocurrency price from API response", example: "Current price of BTC: ${price} USD" },
    { name: "{coin}", description: "Full name of cryptocurrency", example: "{coin} is currently trading at..." },
  ];

  const commandStructure = [
    { field: "name", description: "The command name (without prefix)", example: "weather", notes: "Must be unique, lowercase without spaces" },
    { field: "description", description: "Brief explanation of what the command does", example: "Get current weather for a city", notes: "Keep concise but descriptive" },
    { field: "category", description: "The command category for organization", example: "utility", notes: "Common categories: general, moderation, fun, utility, api" },
    { field: "usage", description: "Example showing how to use the command", example: "!weather <city>", notes: "Use <> for required params and [] for optional ones" },
    { field: "response", description: "The formatted response with placeholders", example: "The weather in {city} is {temperature}°C with {description}", notes: "Use placeholders in {curly braces}" },
    { field: "enabled", description: "Whether the command is active", example: "true/false", notes: "Disable commands without deleting them" },
  ];

  const advancedFeatures = [
    { feature: "Conditional Responses", description: "Use different responses based on input or conditions", example: "{if temperature<0}It's freezing!{else}It's not too cold{endif}" },
    { feature: "Formatting", description: "Use Discord markdown for formatting", example: "**Bold**, *Italic*, __Underline__, ~~Strikethrough~~, `Code`" },
    { feature: "Embeds", description: "Create rich embeds with fields and colors", example: "{embed:title=Weather Report}{field:name=Temperature}{field:value={temperature}°C}" },
    { feature: "Random Responses", description: "Choose from multiple responses randomly", example: "{random:Hello|Hi|Hey there} {user}!" },
    { feature: "Cooldowns", description: "Limit how often a command can be used", example: "Set per-user and per-server cooldowns" },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="mb-4">
        <BackButton />
      </div>
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">API Documentation</h1>
      </div>

      <Card className="bg-[#2F3136] text-white border-gray-700">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Code className="h-5 w-5 text-blue-400" />
            <CardTitle>Command Response Documentation</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            Learn how to create dynamic command responses using variables and placeholders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="placeholders" onValueChange={setActiveTab}>
            <TabsList className="bg-[#202225] border border-gray-700 mb-4">
              <TabsTrigger value="placeholders">Bot Placeholders</TabsTrigger>
              <TabsTrigger value="api">API Variables</TabsTrigger>
              <TabsTrigger value="structure">Command Structure</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Features</TabsTrigger>
            </TabsList>
            
            <TabsContent value="placeholders">
              <Card className="bg-[#36393F] border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">Bot Placeholders</CardTitle>
                  <CardDescription className="text-gray-400">
                    These placeholders can be used in any command response and will be automatically replaced with the appropriate values
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-[#2F3136] border-gray-700">
                        <TableHead className="text-white">Placeholder</TableHead>
                        <TableHead className="text-white">Description</TableHead>
                        <TableHead className="text-white">Example Usage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {placeholders.map((item) => (
                        <TableRow key={item.name} className="hover:bg-[#2F3136] border-gray-700">
                          <TableCell className="font-mono text-blue-400">{item.name}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell className="font-mono text-sm text-gray-300">{item.example}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="api">
              <Card className="bg-[#36393F] border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">API Variables</CardTitle>
                  <CardDescription className="text-gray-400">
                    These variables are specific to API commands and depend on the API's response structure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-[#2F3136] border-gray-700">
                        <TableHead className="text-white">Variable</TableHead>
                        <TableHead className="text-white">Description</TableHead>
                        <TableHead className="text-white">Example Usage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {apiVariables.map((item) => (
                        <TableRow key={item.name} className="hover:bg-[#2F3136] border-gray-700">
                          <TableCell className="font-mono text-green-400">{item.name}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell className="font-mono text-sm text-gray-300">{item.example}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="structure">
              <Card className="bg-[#36393F] border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">Command Structure</CardTitle>
                  <CardDescription className="text-gray-400">
                    Understanding the structure of a command and what each field means
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-[#2F3136] border-gray-700">
                        <TableHead className="text-white">Field</TableHead>
                        <TableHead className="text-white">Description</TableHead>
                        <TableHead className="text-white">Example</TableHead>
                        <TableHead className="text-white">Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commandStructure.map((item) => (
                        <TableRow key={item.field} className="hover:bg-[#2F3136] border-gray-700">
                          <TableCell className="font-mono text-purple-400">{item.field}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell className="font-mono text-sm text-gray-300">{item.example}</TableCell>
                          <TableCell className="text-xs text-gray-400">{item.notes}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="advanced">
              <Card className="bg-[#36393F] border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">Advanced Features</CardTitle>
                  <CardDescription className="text-gray-400">
                    Take your commands to the next level with these advanced features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {advancedFeatures.map((item, index) => (
                      <AccordionItem key={index} value={`item-${index}`} className="border-gray-700">
                        <AccordionTrigger className="text-white hover:text-blue-400">
                          {item.feature}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="mb-2">{item.description}</div>
                          <div className="bg-[#202225] p-3 rounded-md font-mono text-sm text-green-400">
                            {item.example}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}