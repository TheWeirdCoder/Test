import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { SaveIcon, Loader2Icon } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { BotSettings } from "@shared/schema";

// Create a schema for error handling settings
const errorHandlingSchema = z.object({
  commandNotFoundMessage: z.string().min(1),
  logErrors: z.boolean(),
  displayErrorsToUsers: z.boolean(),
  showDetailedErrors: z.boolean(),
});

type ErrorHandlingFormValues = z.infer<typeof errorHandlingSchema>;

export default function ErrorHandling() {
  const { toast } = useToast();
  
  // Fetch bot settings
  const { 
    data: settings, 
    isLoading 
  } = useQuery<BotSettings>({
    queryKey: ['/api/settings'],
  });

  // Form initialization
  const form = useForm<ErrorHandlingFormValues>({
    resolver: zodResolver(errorHandlingSchema),
    defaultValues: {
      commandNotFoundMessage: "Sorry, I couldn't find that command. Try using !help to see all available commands.",
      logErrors: true,
      displayErrorsToUsers: true,
      showDetailedErrors: false,
    },
    values: settings ? {
      commandNotFoundMessage: settings.commandNotFoundMessage,
      logErrors: settings.logErrors,
      displayErrorsToUsers: settings.displayErrorsToUsers,
      showDetailedErrors: settings.showDetailedErrors,
    } : undefined,
  });

  // Update error handling settings mutation
  const { mutate: updateSettings, isPending } = useMutation({
    mutationFn: async (data: ErrorHandlingFormValues) => {
      const updated = await apiRequest("PATCH", "/api/settings", data);
      return updated.json();
    },
    onSuccess: () => {
      toast({
        title: "Error handling updated",
        description: "Error handling settings have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update error handling settings. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating settings:", error);
    },
  });

  // Handle form submission
  const onSubmit = (data: ErrorHandlingFormValues) => {
    updateSettings(data);
  };

  if (isLoading) {
    return (
      <div className="mb-6">
        <Skeleton className="h-6 w-40 mb-4 bg-[#202225]" />
        <div className="bg-[#2F3136] rounded-md p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Skeleton className="h-5 w-40 mb-2 bg-[#202225]" />
              <Skeleton className="h-24 w-full bg-[#202225]" />
            </div>
            <div>
              <Skeleton className="h-5 w-32 mb-2 bg-[#202225]" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-full bg-[#202225]" />
                <Skeleton className="h-6 w-full bg-[#202225]" />
                <Skeleton className="h-6 w-full bg-[#202225]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Error Handling</h2>
        <Button 
          onClick={form.handleSubmit(onSubmit)} 
          className="bg-[#5865F2] hover:bg-opacity-80 text-white"
          size="sm"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <SaveIcon className="mr-2 h-4 w-4" />
              Save
            </>
          )}
        </Button>
      </div>
      
      <div className="bg-[#2F3136] rounded-md p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormField
                control={form.control}
                name="commandNotFoundMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-sm mb-2">Command Not Found Response</FormLabel>
                    <FormControl>
                      <Textarea 
                        className="bg-[#202225] border-gray-700 rounded-md py-2 px-3 w-full text-sm focus:ring-2 focus:ring-[#5865F2] focus:outline-none h-24 resize-none text-white"
                        placeholder="Enter message to show when command is not found"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <div>
              <h3 className="font-medium text-sm mb-2">Error Logging</h3>
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="logErrors"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                          className="rounded bg-[#202225] border-gray-700 text-[#5865F2] focus:ring-[#5865F2]"
                        />
                      </FormControl>
                      <FormLabel className="text-sm cursor-pointer">Log command errors</FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="displayErrorsToUsers"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                          className="rounded bg-[#202225] border-gray-700 text-[#5865F2] focus:ring-[#5865F2]"
                        />
                      </FormControl>
                      <FormLabel className="text-sm cursor-pointer">Display error messages to users</FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="showDetailedErrors"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                          className="rounded bg-[#202225] border-gray-700 text-[#5865F2] focus:ring-[#5865F2]"
                        />
                      </FormControl>
                      <FormLabel className="text-sm cursor-pointer">Show detailed error information</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
