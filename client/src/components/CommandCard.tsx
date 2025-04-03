import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { TrashIcon, EditIcon, Code, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { Command } from "@shared/schema";
import CommandForm from "@/components/CommandForm";

interface CommandCardProps {
  command: Command;
  onUpdate: () => void;
}

export default function CommandCard({ command, onUpdate }: CommandCardProps) {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showResponse, setShowResponse] = useState(false);

  // Handle delete command
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await apiRequest("DELETE", `/api/commands/${command.id}`);
      toast({
        title: "Command deleted",
        description: `The command ${command.name} has been deleted.`,
      });
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete command. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Handle edit command
  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };
  
  // Handle successful edit
  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    onUpdate();
    toast({
      title: "Command updated",
      description: `The command ${command.name} has been updated successfully.`,
    });
  };

  return (
    <>
      <div className="bg-[#2F3136] rounded-md p-4 mb-3 hover:bg-[#42464D] transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div>
            <div className="flex items-center">
              <h3 className="font-medium text-base">{command.name}</h3>
              <span className="ml-2 px-2 py-0.5 bg-[#5865F2] rounded-full text-xs font-medium">
                {command.category}
              </span>
              {!command.enabled && (
                <span className="ml-2 px-2 py-0.5 bg-gray-600 rounded-full text-xs font-medium">
                  Disabled
                </span>
              )}
            </div>
            <p className="text-[#8e9297] text-sm mt-1">{command.description}</p>
          </div>
          <div className="flex items-center space-x-2 mt-3 sm:mt-0">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-[#8e9297] hover:text-white hover:bg-[#202225]"
              onClick={() => setShowResponse(!showResponse)}
              title="Toggle response preview"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-[#8e9297] hover:text-white hover:bg-[#202225]"
              onClick={handleEdit}
              title="Edit command"
            >
              <EditIcon className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-[#8e9297] hover:text-[#ED4245] hover:bg-[#202225]"
              onClick={() => setIsDeleteDialogOpen(true)}
              title="Delete command"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="flex items-center mb-2">
            <Code className="h-4 w-4 mr-2 text-[#8e9297]" />
            <span className="text-xs text-[#8e9297]">Usage:</span>
          </div>
          <div className="bg-[#202225] rounded p-2 mb-3">
            <code className="font-mono text-sm text-green-400">{command.usage}</code>
          </div>
          
          {showResponse && (
            <>
              <div className="flex items-center my-2">
                <MessageSquare className="h-4 w-4 mr-2 text-[#8e9297]" />
                <span className="text-xs text-[#8e9297]">Response:</span>
              </div>
              <div className="bg-[#202225] rounded p-2 mb-1 max-h-32 overflow-y-auto">
                <p className="text-sm text-white whitespace-pre-wrap">{command.response || "No response configured"}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-[#36393F] text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Delete Command</DialogTitle>
            <DialogDescription className="text-[#8e9297]">
              Are you sure you want to delete the "{command.name}" command? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-gray-700 bg-[#2F3136] text-white hover:bg-[#42464D] hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <span className="mr-2">Deleting</span>
                  <span className="animate-spin">⏳</span>
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Command Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-[#36393F] text-white border-gray-700 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Command: {command.name}</DialogTitle>
          </DialogHeader>
          <CommandForm 
            command={command} 
            onSuccess={handleEditSuccess} 
            onCancel={() => setIsEditDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
