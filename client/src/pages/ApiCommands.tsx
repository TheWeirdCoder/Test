import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Command } from "@shared/schema";
import CommandForm from "@/components/CommandForm";
import BackButton from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, AlertTriangle, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import CommandCard from "@/components/CommandCard";

// API command templates
const API_TEMPLATES = [
  {
    name: "weather",
    description: "Get current weather for a specified city",
    category: "api",
    usage: "!weather <city>",
    response: "The current weather in {city} is {temperature}°C with {description}",
    apiUrl: "https://api.openweathermap.org/data/2.5/weather?q={city}&appid={WEATHER_API_KEY}&units=metric"
  },
  {
    name: "joke",
    description: "Get a random joke",
    category: "api",
    usage: "!joke",
    response: "{joke}",
    apiUrl: "https://official-joke-api.appspot.com/random_joke"
  },
  {
    name: "crypto",
    description: "Get the current price of a cryptocurrency",
    category: "api",
    usage: "!crypto <symbol>",
    response: "Current price of {symbol}: ${price} USD",
    apiUrl: "https://api.coingecko.com/api/v3/simple/price?ids={coin}&vs_currencies=usd"
  }
];

export default function ApiCommands() {
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("available");
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  // Fetch all commands
  const { data: commands, isLoading, refetch } = useQuery<Command[]>({
    queryKey: ['/api/commands'],
  });

  // Filter API commands
  const apiCommands = commands?.filter(command => command.category === 'api') || [];

  // Handle successful command creation
  const handleCommandSuccess = () => {
    setShowAddForm(false);
    setSelectedTemplate(null);
    refetch();
    toast({
      title: "API Command Created",
      description: "Your API command has been created successfully."
    });
  };

  // Use a template
  const useTemplate = (template: any) => {
    setSelectedTemplate(template);
    setShowAddForm(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="mb-4">
        <BackButton />
      </div>
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">API Commands</h1>
        <Button
          onClick={() => {
            setShowAddForm(!showAddForm);
            if (showAddForm) {
              setSelectedTemplate(null);
            }
          }}
          className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
        >
          {showAddForm ? "Cancel" : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Create API Command
            </>
          )}
        </Button>
      </div>

      <Alert className="bg-[#2F3136] border-yellow-600 text-white">
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
        <AlertTitle>API Integration</AlertTitle>
        <AlertDescription>
          Create commands that fetch data from external APIs. You'll need to provide the API endpoint URL and configure your response format. 
          Some APIs may require API keys which should be set in your bot configuration.
          <div className="mt-2">
            <Button 
              variant="link" 
              onClick={() => window.location.href = "/api-docs"}
              className="text-blue-400 hover:text-blue-300 p-0 h-auto"
            >
              <span className="inline-flex items-center">
                View API Documentation
                <i className="fas fa-external-link-alt text-xs ml-1"></i>
              </span>
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      {showAddForm && (
        <div className="mb-6">
          <CommandForm 
            onSuccess={handleCommandSuccess} 
            onCancel={() => {
              setShowAddForm(false);
              setSelectedTemplate(null);
            }} 
            command={selectedTemplate}
          />
        </div>
      )}

      <Tabs defaultValue="available" onValueChange={setActiveTab}>
        <TabsList className="bg-[#2F3136] border border-gray-700">
          <TabsTrigger value="available">Available Templates</TabsTrigger>
          <TabsTrigger value="my-api">My API Commands</TabsTrigger>
        </TabsList>
        
        <TabsContent value="available" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {API_TEMPLATES.map((template, index) => (
              <Card key={index} className="bg-[#2F3136] text-white border-gray-700 hover:bg-[#36393F] transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 mr-2 text-[#5865F2]" />
                      <CardTitle>{template.name}</CardTitle>
                    </div>
                    <span className="px-2 py-0.5 bg-[#5865F2] rounded-full text-xs font-medium">
                      API
                    </span>
                  </div>
                  <CardDescription className="text-[#8e9297]">{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm text-[#8e9297] mb-1">Usage:</p>
                    <div className="bg-[#202225] rounded p-2">
                      <code className="font-mono text-sm text-green-400">{template.usage}</code>
                    </div>
                  </div>
                  <Button 
                    onClick={() => useTemplate(template)}
                    variant="outline" 
                    className="w-full bg-[#202225] border-gray-700 hover:bg-[#2a2e33] text-white"
                  >
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="my-api" className="mt-4">
          {isLoading ? (
            <Card className="flex justify-center items-center py-8 bg-[#2F3136] text-white border-gray-700">
              <Loader2 className="h-8 w-8 animate-spin text-[#5865F2]" />
            </Card>
          ) : apiCommands.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {apiCommands.map(command => (
                <CommandCard 
                  key={command.id} 
                  command={command} 
                  onUpdate={() => refetch()} 
                />
              ))}
            </div>
          ) : (
            <Card className="bg-[#2F3136] text-white border-gray-700">
              <CardHeader>
                <CardTitle className="text-center">No API Commands Found</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-400">
                  You haven't created any API commands yet. Try using one of our templates to get started.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}