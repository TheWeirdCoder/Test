import { useLocation, Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

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

interface SidebarProps {
  status: BotStatus | null;
  isLoading: boolean;
  isMobile: boolean;
  onClose?: () => void;
}

export default function Sidebar({ status, isLoading, isMobile, onClose }: SidebarProps) {
  const [location] = useLocation();

  // Navigation items
  const navItems = [
    {
      group: "Bot Configuration",
      items: [
        { icon: "home", label: "Dashboard", path: "/" },
        { icon: "terminal", label: "Commands", path: "/commands" },
        { icon: "code", label: "API Commands", path: "/api-commands" },
        { icon: "book", label: "API Documentation", path: "/api-docs" },
        { icon: "sliders-h", label: "Settings", path: "/settings" },
      ]
    },
    {
      group: "Development",
      items: [
        { icon: "plug", label: "Integrations", path: "/integrations" },
        { icon: "chart-bar", label: "Analytics", path: "/analytics" },
        { icon: "file-code", label: "Logs", path: "/logs" }
      ]
    }
  ];

  // Determine if we should hide the sidebar or show it
  const sidebarClasses = isMobile
    ? "bg-[#2F3136] w-full p-4"
    : "hidden sm:flex flex-col bg-[#2F3136] w-64 p-4 shrink-0";

  return (
    <div className={sidebarClasses}>
      {/* Bot Logo and Status */}
      <div className="flex items-center space-x-3 mb-6">
        {status && status.avatar ? (
          <img 
            src={status.avatar} 
            alt={status.username || "Bot"} 
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center">
            <span className="text-white text-lg">🤖</span>
          </div>
        )}
        <div>
          <h1 className="font-bold text-lg">{status?.username || "Discord Bot"}</h1>
          <div className="flex items-center">
            <span className={`w-2 h-2 ${isLoading || !status ? 'bg-gray-500' : 'bg-[#3BA55C]'} rounded-full mr-2`}></span>
            <span className="text-xs text-[#8e9297]">
              {isLoading ? 'Loading...' : (status ? 'Online' : 'Offline')}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      {navItems.map((group, groupIndex) => (
        <div key={groupIndex} className="mb-6">
          <h2 className="uppercase font-semibold text-xs text-[#8e9297] mb-2 tracking-wider">
            {group.group}
          </h2>
          <div className="space-y-1">
            {group.items.map((item, itemIndex) => {
              const isActive = item.path === location;
              return (
                <Link 
                  key={itemIndex} 
                  href={item.path}
                  onClick={() => {
                    if (isMobile && onClose) {
                      onClose();
                    }
                  }}
                >
                  <a 
                    className={`flex items-center px-2 py-1.5 text-sm rounded hover:bg-[#42464D] hover:text-white ${
                      isActive 
                        ? 'text-white bg-[#42464D]' 
                        : 'text-[#8e9297]'
                    }`}
                  >
                    <i className={`fas fa-${item.icon} w-5 mr-2`}></i>
                    <span>{item.label}</span>
                  </a>
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      {/* Bot Status Info */}
      <div className="mt-auto">
        <div className="bg-[#202225] rounded-md p-3">
          <div className="flex items-center space-x-3 mb-2">
            <i className="fas fa-info-circle text-[#5865F2]"></i>
            <span className="text-sm font-medium">Bot Status</span>
          </div>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full bg-[#36393F]" />
              <Skeleton className="h-4 w-full bg-[#36393F]" />
              <Skeleton className="h-4 w-full bg-[#36393F]" />
            </div>
          ) : status ? (
            <div className="text-xs space-y-1 text-[#8e9297]">
              <div className="flex justify-between">
                <span>Uptime:</span>
                <span className="font-mono">{status.uptime || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Servers:</span>
                <span className="font-mono">{status.guildCount || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span>Commands used:</span>
                <span className="font-mono">{status.commandCount ? status.commandCount.toLocaleString() : '0'}</span>
              </div>
            </div>
          ) : (
            <div className="text-xs space-y-1 text-[#8e9297]">
              <p>Bot is currently offline</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
