import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCwIcon, DownloadIcon } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { CommandLog } from "@shared/schema";

export default function CommandLogs() {
  const { 
    data: logs = [], 
    isLoading, 
    isRefetching,
    refetch 
  } = useQuery<CommandLog[]>({
    queryKey: ['/api/logs'],
  });

  // Format timestamp function
  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    return date.toISOString().replace('T', ' ').substring(0, 19);
  };

  // Handle log refresh
  const handleRefresh = () => {
    refetch();
  };

  // Handle logs export
  const handleExport = () => {
    if (!logs || logs.length === 0) return;
    
    // Convert logs to CSV
    const headers = "Timestamp,Username,Command,Message,Type\n";
    const csvData = logs.map(log => {
      const type = log.isError ? "Error" : (log.isWarning ? "Warning" : "Info");
      return `"${formatTimestamp(log.timestamp)}","${log.username}","${log.command}","${log.message.replace(/"/g, '""')}","${type}"`;
    }).join("\n");
    
    // Create and download CSV file
    const blob = new Blob([headers + csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `discord-bot-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Get log style based on type (error, warning, normal)
  const getLogStyle = (log: CommandLog) => {
    if (log.isError) {
      return "text-red-400";
    } else if (log.isWarning) {
      return "text-yellow-400";
    }
    return "text-green-400";
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Command Logs</h2>
      
      <div className="bg-[#2F3136] rounded-md p-4 overflow-hidden">
        {isLoading ? (
          <div className="max-h-64 space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full bg-[#202225]" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="max-h-64 py-8 text-center text-[#8e9297]">
            <p>No command logs available</p>
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto font-mono text-sm space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="py-1.5 px-2 rounded bg-[#202225] flex items-start">
                <span className={getLogStyle(log)}>
                  [{formatTimestamp(log.timestamp)}]
                </span>
                <span className="ml-2 text-white">{log.message}</span>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-[#8e9297] hover:text-white hover:bg-[#36393F]"
            onClick={handleRefresh}
            disabled={isRefetching}
          >
            <RefreshCwIcon className={`h-4 w-4 mr-1 ${isRefetching ? 'animate-spin' : ''}`} />
            {isRefetching ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-[#8e9297] hover:text-white hover:bg-[#36393F]"
            onClick={handleExport}
            disabled={isLoading || logs.length === 0}
          >
            <DownloadIcon className="h-4 w-4 mr-1" />
            Export Logs
          </Button>
        </div>
      </div>
    </div>
  );
}
