import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, RefreshCw } from "lucide-react";
import { useState } from "react";
import BackButton from "@/components/BackButton";

// Integration types and data
type IntegrationType = "webhook" | "api" | "bot";
type IntegrationStatus = "active" | "inactive" | "pending";

interface Integration {
  id: string;
  name: string;
  description: string;
  type: IntegrationType;
  status: IntegrationStatus;
  createdAt: Date;
  lastUsed?: Date;
}

export default function Integrations() {
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock data for now
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "1",
      name: "Discord Webhook",
      description: "Sends notifications to a Discord channel",
      type: "webhook",
      status: "active",
      createdAt: new Date(2023, 2, 15),
      lastUsed: new Date(2023, 5, 20)
    },
    {
      id: "2",
      name: "GitHub Bot",
      description: "Responds to GitHub events",
      type: "bot",
      status: "inactive",
      createdAt: new Date(2023, 1, 10)
    },
    {
      id: "3",
      name: "Slack API",
      description: "Connects to Slack for notifications",
      type: "api",
      status: "pending",
      createdAt: new Date(2023, 4, 5)
    }
  ]);

  // Get status badge color
  const getStatusColor = (status: IntegrationStatus) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "inactive": return "bg-gray-500";
      case "pending": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  // Get type badge variant
  const getTypeVariant = (type: IntegrationType) => {
    switch (type) {
      case "webhook": return "outline";
      case "api": return "secondary";
      case "bot": return "default";
      default: return "outline";
    }
  };

  // Toggle integration status
  const toggleStatus = (id: string) => {
    setIntegrations(prevIntegrations => 
      prevIntegrations.map(integration => 
        integration.id === id 
          ? { 
              ...integration, 
              status: integration.status === "active" ? "inactive" : "active" 
            } 
          : integration
      )
    );
  };

  // Format date for display
  const formatDate = (date?: Date) => {
    if (!date) return "Never";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  // Refresh integrations
  const refreshIntegrations = () => {
    setIsLoading(true);
    // Mock refresh action
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <BackButton to="/" />
          <h1 className="text-3xl font-bold tracking-tight mt-2">Integrations</h1>
          <p className="text-muted-foreground">
            Connect your bot with external services and platforms
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={refreshIntegrations} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Integration
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {integrations.map(integration => (
          <Card key={integration.id} className="overflow-hidden">
            <CardHeader className="bg-card/5">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center">
                    {integration.name}
                    <Badge variant={getTypeVariant(integration.type)} className="ml-2 capitalize">
                      {integration.type}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{integration.description}</CardDescription>
                </div>
                <div className="flex items-center">
                  <span className={`mr-2 text-sm ${integration.status === "active" ? "text-green-500" : "text-gray-500"}`}>
                    {integration.status === "active" ? "Active" : "Inactive"}
                  </span>
                  <Switch
                    checked={integration.status === "active"}
                    onCheckedChange={() => toggleStatus(integration.id)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium flex items-center">
                    <span className={`h-2 w-2 rounded-full ${getStatusColor(integration.status)} mr-2`}></span>
                    <span className="capitalize">{integration.status}</span>
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium">{formatDate(integration.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Used</p>
                  <p className="font-medium">{formatDate(integration.lastUsed)}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <Button variant="outline" size="sm">Configure</Button>
                <Button variant="outline" size="sm">Test</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {integrations.length === 0 && (
        <Card className="p-8 text-center">
          <div className="space-y-3">
            <h3 className="text-lg font-medium">No integrations found</h3>
            <p className="text-muted-foreground">Get started by adding your first integration</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}