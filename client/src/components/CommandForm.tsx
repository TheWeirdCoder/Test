import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertCommandSchema, Command } from "@shared/schema";

// Extend the schema to add validation
const commandFormSchema = insertCommandSchema.extend({
  name: z.string().min(2, "Command name must be at least 2 characters").max(32, "Command name must be less than 32 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  response: z.string().min(1, "Response cannot be empty"),
});

type CommandFormValues = z.infer<typeof commandFormSchema>;

interface CommandFormProps {
  command?: Command; // Optional for editing existing command
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CommandForm({ command, onSuccess, onCancel }: CommandFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!command;

  const form = useForm<CommandFormValues>({
    resolver: zodResolver(commandFormSchema),
    defaultValues: {
      name: command?.name || "",
      description: command?.description || "",
      usage: command?.usage || "",
      category: command?.category || "general",
      response: command?.response || "",
      enabled: command?.enabled === undefined ? true : command.enabled,
    },
  });

  async function onSubmit(data: CommandFormValues) {
    setIsSubmitting(true);
    try {
      if (isEditing && command) {
        // Update existing command
        await apiRequest("PATCH", `/api/commands/${command.id}`, data);
        toast({
          title: "Command updated",
          description: `The ${data.name} command has been updated successfully.`,
        });
      } else {
        // Create new command
        await apiRequest("POST", "/api/commands", data);
        toast({
          title: "Command created",
          description: `The ${data.name} command has been created successfully.`,
        });
      }
      
      // Invalidate queries to refresh the commands list
      queryClient.invalidateQueries({ queryKey: ['/api/commands'] });
      
      // Execute onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save command",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full bg-[#2F3136] text-white border-gray-700">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Command" : "Add New Command"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Command Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Command name without prefix" 
                      {...field} 
                      className="bg-[#40444B] border-gray-700 text-white" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="What does this command do?" 
                      {...field} 
                      className="bg-[#40444B] border-gray-700 text-white min-h-[80px]" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="usage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usage</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Example: !command <argument>" 
                      {...field} 
                      className="bg-[#40444B] border-gray-700 text-white" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-[#40444B] border-gray-700 text-white">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#2F3136] border-gray-700 text-white">
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="moderation">Moderation</SelectItem>
                      <SelectItem value="fun">Fun</SelectItem>
                      <SelectItem value="utility">Utility</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="response"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Response</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="The message the bot will respond with" 
                      {...field} 
                      className="bg-[#40444B] border-gray-700 text-white min-h-[120px]" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="pt-4 flex justify-end space-x-4">
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                  className="border-gray-600 text-white hover:bg-gray-700"
                >
                  Cancel
                </Button>
              )}
              <Button 
                type="submit" 
                className="bg-[#5865F2] hover:bg-[#4752C4] text-white" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  isEditing ? "Update Command" : "Create Command"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}