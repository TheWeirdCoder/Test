import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Schema for bot settings form
const botNameSchema = z.object({
  botName: z.string().min(2, 'Bot name must be at least 2 characters').max(32, 'Bot name must be at most 32 characters'),
});

const botAvatarSchema = z.object({
  botAvatar: z.string().url('Please enter a valid URL').nullable().optional(),
});

const prefixSchema = z.object({
  prefix: z.string().min(1, 'Command prefix is required').max(5, 'Prefix must be at most 5 characters'),
});

type BotNameFormValues = z.infer<typeof botNameSchema>;
type BotAvatarFormValues = z.infer<typeof botAvatarSchema>;
type PrefixFormValues = z.infer<typeof prefixSchema>;

interface BotConfigProps {
  onUpdate: () => void;
}

export default function BotConfig({ onUpdate }: BotConfigProps) {
  const { toast } = useToast();
  const [isAvatarValid, setIsAvatarValid] = useState(true);
  const [currentSettings, setCurrentSettings] = useState<any>(null);

  // Fetch current bot settings
  const { data: settings, isLoading: isLoadingSettings, refetch: refetchSettings } = useQuery<any>({
    queryKey: ['/api/settings']
  });
  
  // Handle settings data changes
  useEffect(() => {
    if (settings) {
      setCurrentSettings(settings);
      // Check if there's a warning message
      if (settings && 'warning' in settings) {
        toast({
          title: "Warning",
          description: settings.warning,
          variant: "destructive",
        });
      }
    }
  }, [settings, toast]);

  // Set up forms
  const nameForm = useForm<BotNameFormValues>({
    resolver: zodResolver(botNameSchema),
    defaultValues: {
      botName: ''
    }
  });

  const avatarForm = useForm<BotAvatarFormValues>({
    resolver: zodResolver(botAvatarSchema),
    defaultValues: {
      botAvatar: ''
    }
  });

  const prefixForm = useForm<PrefixFormValues>({
    resolver: zodResolver(prefixSchema),
    defaultValues: {
      prefix: '!'
    }
  });

  // Update forms when settings are loaded
  useEffect(() => {
    if (settings) {
      nameForm.reset({ botName: settings.botName || 'Discord Bot' });
      avatarForm.reset({ botAvatar: settings.botAvatar || '' });
      prefixForm.reset({ prefix: settings.prefix || '!' });
    }
  }, [settings, nameForm, avatarForm, prefixForm]);

  // Mutation for updating bot name
  const updateNameMutation = useMutation({
    mutationFn: async (data: BotNameFormValues) => {
      const response = await apiRequest('PATCH', '/api/settings', data);
      return response.json();
    },
    onSuccess: (data) => {
      // Check if there's a warning message in the response
      if (data && data.warning) {
        toast({
          title: "Bot name partially updated",
          description: data.warning,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Bot name updated",
          description: "The bot name has been updated successfully.",
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/status'] });
      onUpdate();
    },
    onError: (error) => {
      toast({
        title: "Failed to update bot name",
        description: (error as Error).message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Mutation for updating bot avatar
  const updateAvatarMutation = useMutation({
    mutationFn: async (data: BotAvatarFormValues) => {
      const response = await apiRequest('PATCH', '/api/settings', data);
      return response.json();
    },
    onSuccess: (data) => {
      // Check if there's a warning message in the response
      if (data && data.warning) {
        toast({
          title: "Bot avatar partially updated",
          description: data.warning,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Bot avatar updated",
          description: "The bot avatar has been updated successfully.",
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/status'] });
      onUpdate();
    },
    onError: (error) => {
      toast({
        title: "Failed to update bot avatar",
        description: (error as Error).message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Mutation for updating prefix
  const updatePrefixMutation = useMutation({
    mutationFn: async (data: PrefixFormValues) => {
      const response = await apiRequest('PATCH', '/api/settings', data);
      return response.json();
    },
    onSuccess: (data) => {
      // Check if there's a warning message in the response
      if (data && data.warning) {
        toast({
          title: "Command prefix partially updated",
          description: data.warning,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Command prefix updated",
          description: "The command prefix has been updated successfully.",
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/status'] });
      onUpdate();
    },
    onError: (error) => {
      toast({
        title: "Failed to update command prefix",
        description: (error as Error).message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  });

  const validateImageUrl = (url: string) => {
    if (!url) {
      setIsAvatarValid(true);
      return;
    }

    const img = new Image();
    img.onload = () => setIsAvatarValid(true);
    img.onerror = () => setIsAvatarValid(false);
    img.src = url;
  };

  const onSubmitName = (data: BotNameFormValues) => {
    updateNameMutation.mutate(data);
  };

  const onSubmitAvatar = (data: BotAvatarFormValues) => {
    if (!isAvatarValid && data.botAvatar) {
      toast({
        title: "Invalid avatar URL",
        description: "Please enter a valid image URL or leave it blank.",
        variant: "destructive",
      });
      return;
    }
    updateAvatarMutation.mutate(data);
  };

  const onSubmitPrefix = (data: PrefixFormValues) => {
    updatePrefixMutation.mutate(data);
  };

  if (isLoadingSettings) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Bot Configuration</CardTitle>
        <CardDescription>
          Customize your Discord bot's appearance and behavior
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Bot Name Section */}
          <div className="border border-gray-700 rounded-md p-4 bg-[#36393F]">
            <h3 className="text-lg font-medium mb-3">Bot Name</h3>
            <Form {...nameForm}>
              <form onSubmit={nameForm.handleSubmit(onSubmitName)} className="space-y-4">
                <FormField
                  control={nameForm.control}
                  name="botName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bot Name</FormLabel>
                      <div className="flex space-x-2">
                        <FormControl>
                          <Input 
                            placeholder="Discord Bot" 
                            {...field} 
                            className="flex-1"
                          />
                        </FormControl>
                        <Button 
                          type="submit" 
                          className="bg-[#5865F2] hover:bg-opacity-80 text-white"
                          disabled={updateNameMutation.isPending}
                        >
                          {updateNameMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <FormDescription>
                        The name displayed for your bot in Discord (2-32 characters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
            {currentSettings && (
              <div className="mt-2 text-sm text-gray-400">
                Current name: <span className="font-medium text-gray-300">{currentSettings.botName || 'Discord Bot'}</span>
              </div>
            )}
          </div>

          {/* Bot Avatar Section */}
          <div className="border border-gray-700 rounded-md p-4 bg-[#36393F]">
            <h3 className="text-lg font-medium mb-3">Bot Avatar</h3>
            <Form {...avatarForm}>
              <form onSubmit={avatarForm.handleSubmit(onSubmitAvatar)} className="space-y-4">
                <FormField
                  control={avatarForm.control}
                  name="botAvatar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bot Avatar URL</FormLabel>
                      <div className="flex space-x-2">
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/avatar.png" 
                            {...field} 
                            value={field.value || ''}
                            onChange={(e) => {
                              field.onChange(e);
                              validateImageUrl(e.target.value);
                            }}
                            className="flex-1"
                          />
                        </FormControl>
                        <Button 
                          type="submit" 
                          className="bg-[#5865F2] hover:bg-opacity-80 text-white"
                          disabled={updateAvatarMutation.isPending}
                        >
                          {updateAvatarMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <FormDescription>
                        Direct link to an image (.jpg, .png or .gif)
                      </FormDescription>
                      {!isAvatarValid && field.value && (
                        <p className="text-sm text-red-500 mt-1">
                          This doesn't appear to be a valid image URL
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
            {currentSettings && (
              <div className="mt-2">
                <div className="text-sm text-gray-400 mb-2">
                  Current avatar:
                </div>
                {currentSettings.botAvatar ? (
                  <div className="flex items-center space-x-2">
                    <img 
                      src={currentSettings.botAvatar} 
                      alt="Bot Avatar" 
                      className="w-10 h-10 rounded-full object-cover bg-[#2F3136]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://cdn.discordapp.com/embed/avatars/0.png';
                      }}
                    />
                    <span className="text-sm text-gray-300 truncate max-w-[300px]">{currentSettings.botAvatar}</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center mr-2">
                      <span className="text-white text-sm">🤖</span>
                    </div>
                    <span className="text-sm text-gray-400">No custom avatar set</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Command Prefix Section */}
          <div className="border border-gray-700 rounded-md p-4 bg-[#36393F]">
            <h3 className="text-lg font-medium mb-3">Command Prefix</h3>
            <Form {...prefixForm}>
              <form onSubmit={prefixForm.handleSubmit(onSubmitPrefix)} className="space-y-4">
                <FormField
                  control={prefixForm.control}
                  name="prefix"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Command Prefix</FormLabel>
                      <div className="flex space-x-2">
                        <FormControl>
                          <Input 
                            placeholder="!" 
                            maxLength={5} 
                            {...field} 
                            className="flex-1"
                          />
                        </FormControl>
                        <Button 
                          type="submit" 
                          className="bg-[#5865F2] hover:bg-opacity-80 text-white"
                          disabled={updatePrefixMutation.isPending}
                        >
                          {updatePrefixMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <FormDescription>
                        The symbol used to trigger bot commands (e.g., !, $, etc.)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
            {currentSettings && (
              <div className="mt-2 text-sm text-gray-400">
                Current prefix: <span className="font-medium text-gray-300">{currentSettings.prefix || '!'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-6 flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => refetchSettings()}
            className="text-gray-400 border-gray-700 hover:bg-[#2F3136] hover:text-white"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Settings
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start text-sm text-muted-foreground">
        <p>Note: Changes to the bot's name or avatar may take a few minutes to propagate through Discord.</p>
        <p className="mt-1">Discord enforces rate limits on profile changes. Too many changes in a short period may be throttled.</p>
      </CardFooter>
    </Card>
  );
}