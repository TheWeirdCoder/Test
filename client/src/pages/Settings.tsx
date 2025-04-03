import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import BotConfig from "@/components/BotConfig";
import ErrorHandling from "@/components/ErrorHandling";
import { useIsMobile } from "@/hooks/use-mobile";
import BackButton from "@/components/BackButton";
import { Loader2 } from "lucide-react";

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

export default function Settings() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  // Fetch bot status
  const { 
    data: botStatus,
    isLoading: isLoadingStatus,
    refetch: refetchStatus
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
            <h1 className="text-xl font-bold mb-1">Bot Settings</h1>
            <p className="text-[#8e9297] text-sm">Configure your Discord bot's appearance and behavior</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto p-4">
          <div className="mb-4">
            <BackButton />
          </div>
          
          {/* Bot Configuration Section */}
          <div className="mb-8">
            <BotConfig onUpdate={() => refetchStatus()} />
          </div>

          {/* Error Handling Section */}
          <div className="mb-8">
            <ErrorHandling />
          </div>
        </div>
      </div>
    </div>
  );
}