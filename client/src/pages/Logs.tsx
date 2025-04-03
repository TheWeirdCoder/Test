import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Eye, Loader2, RefreshCw, DownloadCloud, Search, AlertCircle, Info, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CommandLog } from "@shared/schema";
import { z } from "zod";
import { queryClient } from "@/lib/queryClient";
import BackButton from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Log types for filtering
type LogSeverity = "all" | "info" | "warning" | "error";

// Extended log type with proper timestamp handling
type ExtendedCommandLog = Omit<CommandLog, 'timestamp'> & {
  timestamp: Date | string;
};

export default function Logs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [severity, setSeverity] = useState<LogSeverity>("all");
  const [limit, setLimit] = useState("100");
  const [selectedLog, setSelectedLog] = useState<ExtendedCommandLog | null>(null);

  // Fetch logs
  const { data: logs, isLoading, refetch } = useQuery<ExtendedCommandLog[]>({
    queryKey: ['/api/logs'],
    select: (data) => {
      return data.map(log => ({
        ...log,
        timestamp: new Date(log.timestamp)
      }));
    },
  });

  // Filter logs
  const filteredLogs = logs?.filter(log => {
    // Filter by search term
    const matchesSearch = searchTerm === "" || 
      log.command?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by severity
    const matchesSeverity = 
      severity === "all" || 
      (severity === "error" && log.isError) || 
      (severity === "warning" && log.isWarning) || 
      (severity === "info" && !log.isError && !log.isWarning);
    
    return matchesSearch && matchesSeverity;
  }).slice(0, parseInt(limit)) || [];

  // Format date
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    });
  };

  // Get badge color based on log type
  const getBadgeVariant = (log: ExtendedCommandLog): "destructive" | "secondary" | "default" | "outline" => {
    if (log.isError) return "destructive";
    if (log.isWarning) return "default";
    return "secondary";
  };

  // Get icon based on log type
  const getLogIcon = (log: ExtendedCommandLog) => {
    if (log.isError) return <AlertCircle className="h-4 w-4 text-red-500" />;
    if (log.isWarning) return <Info className="h-4 w-4 text-yellow-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  // Download logs
  const downloadLogs = () => {
    if (!logs) return;
    
    const logData = logs.map(log => ({
      timestamp: new Date(log.timestamp).toISOString(),
      username: log.username,
      userId: log.userId,
      command: log.command,
      message: log.message,
      isError: log.isError,
      isWarning: log.isWarning
    }));
    
    const jsonString = JSON.stringify(logData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `discord-bot-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Log detail dialog
  const LogDetailDialog = ({ log }: { log: ExtendedCommandLog }) => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Timestamp</p>
            <p className="font-medium">{formatDate(log.timestamp)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Type</p>
            <Badge variant={getBadgeVariant(log)}>
              {log.isError ? "Error" : log.isWarning ? "Warning" : "Info"}
            </Badge>
          </div>
          <div>
            <p className="text-muted-foreground">User</p>
            <p className="font-medium">{log.username}</p>
          </div>
          <div>
            <p className="text-muted-foreground">User ID</p>
            <p className="font-medium">{log.userId}</p>
          </div>
          <div className="col-span-2">
            <p className="text-muted-foreground">Command</p>
            <p className="font-medium font-mono bg-muted p-1 rounded">{log.command}</p>
          </div>
        </div>
        <div>
          <p className="text-muted-foreground">Message</p>
          <div className="mt-1 bg-muted p-3 rounded font-mono text-sm whitespace-pre-wrap">
            {log.message || "No message content"}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <BackButton to="/" />
          <h1 className="text-3xl font-bold tracking-tight mt-2">Command Logs</h1>
          <p className="text-muted-foreground">
            View and analyze command execution history
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={downloadLogs} disabled={isLoading || !logs?.length}>
            <DownloadCloud className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Log History</CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} of {logs?.length || 0} log entries
          </CardDescription>

          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex space-x-2">
              <Select value={severity} onValueChange={(val) => setSeverity(val as LogSeverity)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
              <Select value={limit} onValueChange={setLimit}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Limit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredLogs.length > 0 ? (
            <div className="border rounded-md">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-10 px-4 text-left font-medium">Timestamp</th>
                      <th className="h-10 px-4 text-left font-medium">Type</th>
                      <th className="h-10 px-4 text-left font-medium">User</th>
                      <th className="h-10 px-4 text-left font-medium">Command</th>
                      <th className="h-10 px-4 text-left font-medium">Message</th>
                      <th className="h-10 px-4 text-center font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4 align-middle">
                          {formatDate(log.timestamp)}
                        </td>
                        <td className="p-4 align-middle">
                          <Badge variant={getBadgeVariant(log)}>
                            {log.isError ? "Error" : log.isWarning ? "Warning" : "Info"}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle">{log.username}</td>
                        <td className="p-4 align-middle font-mono">{log.command}</td>
                        <td className="p-4 align-middle">
                          <div className="max-w-xs truncate">{log.message}</div>
                        </td>
                        <td className="p-4 align-middle text-center">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setSelectedLog(log)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center">
                                  {getLogIcon(log)}
                                  <span className="ml-2">
                                    Log Details
                                  </span>
                                </DialogTitle>
                                <DialogDescription>
                                  Complete information about this log entry
                                </DialogDescription>
                              </DialogHeader>
                              {log && <LogDetailDialog log={log} />}
                            </DialogContent>
                          </Dialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground mb-4">No logs found.</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or adding some commands.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}