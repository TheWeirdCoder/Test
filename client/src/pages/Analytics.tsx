import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import BackButton from "@/components/BackButton";

// Analytics data types
interface CommandUsageData {
  name: string;
  count: number;
}

interface UserActivityData {
  date: string;
  commands: number;
}

interface ServerData {
  name: string;
  percentage: number;
  color: string;
}

interface StatData {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
}

interface AnalyticsData {
  commandUsageData: CommandUsageData[];
  userActivityData: UserActivityData[];
  serverData: ServerData[];
  statsData: StatData[];
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("7d");
  
  // Fetch analytics data from API
  const { data, isLoading, isError } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics'],
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <BackButton to="/" />
          <h1 className="text-3xl font-bold tracking-tight mt-2">Analytics</h1>
          <p className="text-muted-foreground">
            Monitor your bot's performance and usage statistics
          </p>
        </div>
        <div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-80">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading analytics data...</span>
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-red-500">Error loading analytics</h3>
          <p className="mt-2 text-muted-foreground">
            There was a problem loading the analytics data. Please try again later.
          </p>
        </div>
      ) : data ? (
        <>
          {/* Key Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.statsData.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="p-4 pb-2">
                  <CardDescription>{stat.label}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex justify-between items-baseline">
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className={`text-sm ${stat.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.change}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <Tabs defaultValue="commands">
            <TabsList className="mb-4">
              <TabsTrigger value="commands">Command Usage</TabsTrigger>
              <TabsTrigger value="activity">User Activity</TabsTrigger>
              <TabsTrigger value="servers">Server Distribution</TabsTrigger>
            </TabsList>
            
            <TabsContent value="commands">
              <Card>
                <CardHeader>
                  <CardTitle>Most Used Commands</CardTitle>
                  <CardDescription>
                    Breakdown of command usage across all servers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data.commandUsageData.length === 0 ? (
                    <div className="h-80 flex items-center justify-center text-center">
                      <div>
                        <p className="text-lg font-medium">No command usage data available</p>
                        <p className="text-muted-foreground">
                          Start using commands with your bot to see usage statistics
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={data.commandUsageData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#5865F2" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>User Activity</CardTitle>
                  <CardDescription>
                    Command usage over time (last 14 days)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data.userActivityData.length === 0 ? (
                    <div className="h-80 flex items-center justify-center text-center">
                      <div>
                        <p className="text-lg font-medium">No activity data available</p>
                        <p className="text-muted-foreground">
                          Start using commands with your bot to see activity over time
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={data.userActivityData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="commands" stroke="#5865F2" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="servers">
              <Card>
                <CardHeader>
                  <CardTitle>User Distribution</CardTitle>
                  <CardDescription>
                    Command usage across different users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data.serverData.length === 0 ? (
                    <div className="h-80 flex items-center justify-center text-center">
                      <div>
                        <p className="text-lg font-medium">No user distribution data available</p>
                        <p className="text-muted-foreground">
                          Start using your bot in different servers to see usage distribution
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-80 flex items-center justify-center">
                      <div className="w-full max-w-md">
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={data.serverData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="percentage"
                              label={({ name, percent }) => `${name}: ${percent}%`}
                            >
                              {data.serverData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No analytics data available.</p>
        </div>
      )}
    </div>
  );
}