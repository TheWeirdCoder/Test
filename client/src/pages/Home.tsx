import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import CommandCard from "@/components/CommandCard";
import ErrorHandling from "@/components/ErrorHandling";
import CommandLogs from "@/components/CommandLogs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusIcon, Loader2Icon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Command } from "@shared/schema";

// Define the BotStatus interface for the API response
interface BotStatus {
  status: string;
  username?: string;
  id?: string;
  avatar?: string;
  uptime?: string;
  guildCount?: number;
  commandCount?: number;
  prefix?: string;
}

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  // Fetch commands
  const { 
    data: commands = [], 
    isLoading: isLoadingCommands,
    refetch: refetchCommands
  } = useQuery<Command[]>({
    queryKey: ['/api/commands'],
  });

  // Fetch bot status
  const { 
    data: botStatus,
    isLoading: isLoadingStatus 
  } = useQuery<BotStatus | null>({
    queryKey: ['/api/status'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex h-screen bg-[#36393F] text-white">
      {/* Sidebar for desktop */}
      <Sidebar 
        status={botStatus || null} 
        isLoading={isLoadingStatus} 
        isMobile={false} 
      />

      {/* Mobile Navigation */}
      <div className="sm:hidden bg-[#202225] w-full p-3 flex items-center justify-between fixed top-0 z-10">
        <div className="flex items-center space-x-3">
          {botStatus && 'avatar' in botStatus && botStatus.avatar ? (
            <img 
              src={botStatus.avatar} 
              alt={'username' in botStatus ? botStatus.username : "Bot"} 
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center">
              <i className="text-white text-sm">🤖</i>
            </div>
          )}
          <h1 className="font-bold">{botStatus && 'username' in botStatus ? botStatus.username : "Discord Bot"}</h1>
        </div>
        <button 
          onClick={toggleMobileMenu} 
          className="text-white"
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-[#202225] z-20 pt-16 sm:hidden">
          <Sidebar 
            status={botStatus || null} 
            isLoading={isLoadingStatus} 
            isMobile={true} 
            onClose={() => setIsMobileMenuOpen(false)} 
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto pt-0 sm:pt-0 mt-14 sm:mt-0">
        {/* Header */}
        <div className="bg-[#36393F] border-b border-gray-700 p-4">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-xl font-bold mb-1">Command Management</h1>
            <p className="text-[#8e9297] text-sm">Configure and monitor your Discord bot commands</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto p-4">
          {/* Commands Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Commands</h2>
              <Button 
                className="bg-[#3BA55C] hover:bg-opacity-80 text-white"
                size="sm"
                onClick={() => {
                  toast({
                    title: "Feature Coming Soon",
                    description: "Creating new commands will be available in a future update.",
                  });
                }}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                New Command
              </Button>
            </div>

            {/* Commands List */}
            {isLoadingCommands ? (
              // Loading state
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-[#2F3136] rounded-md p-4 mb-3">
                  <div className="flex justify-between">
                    <div>
                      <Skeleton className="h-6 w-24 bg-[#202225]" />
                      <Skeleton className="h-4 w-48 mt-2 bg-[#202225]" />
                    </div>
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 w-8 rounded-md bg-[#202225]" />
                      <Skeleton className="h-8 w-8 rounded-md bg-[#202225]" />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <Skeleton className="h-10 w-full bg-[#202225]" />
                  </div>
                </div>
              ))
            ) : commands.length === 0 ? (
              // Empty state
              <div className="bg-[#2F3136] rounded-md p-6 text-center">
                <p className="text-[#8e9297]">No commands found. Add your first command!</p>
              </div>
            ) : (
              // Commands list
              commands.map((command) => (
                <CommandCard 
                  key={command.id} 
                  command={command} 
                  onUpdate={() => refetchCommands()} 
                />
              ))
            )}
          </div>

          {/* Error Handling Section */}
          <ErrorHandling />

          {/* Command Logs Section */}
          <CommandLogs />
        </div>
      </div>
    </div>
  );
}
