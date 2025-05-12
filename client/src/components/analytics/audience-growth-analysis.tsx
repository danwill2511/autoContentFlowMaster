import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  RefreshCw, 
  Users, 
  Calendar, 
  ArrowUpRight, 
  MapPin, 
  Clock, 
  UserPlus, 
  Share2 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { AnimatedCounter, AnimatedProgress } from "@/components/ui/animated-counter";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface AudienceGrowthAnalysisProps {
  className?: string;
}

interface AudienceAnalytics {
  totalFollowers: number;
  newFollowers: number;
  followerGrowthRate: number;
  averageEngagementRate: number;
  demographicData: {
    ageGroups: {
      label: string;
      value: number;
    }[];
    genders: {
      label: string;
      value: number;
    }[];
    topLocations: {
      location: string;
      percentage: number;
    }[];
  };
  growthTrend: {
    date: string;
    followers: number;
    newFollowers: number;
  }[];
  activeHours: {
    hour: number;
    activity: number;
  }[];
  platformGrowth: {
    platformId: number;
    platformName: string;
    followers: number;
    growthRate: number;
  }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

export function AudienceGrowthAnalysis({ className }: AudienceGrowthAnalysisProps) {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState<string>('30d');
  
  // Query to get audience analytics data
  const audienceQuery = useQuery({
    queryKey: ['/api/analytics/audience', timeRange],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/analytics/audience?timeRange=${timeRange}`);
      return await res.json() as AudienceAnalytics;
    },
    retry: 1,
  });
  
  // Function to refresh analytics data
  const refreshData = () => {
    audienceQuery.refetch();
  };
  
  const isLoading = audienceQuery.isLoading;
  const error = audienceQuery.error;
  const data = audienceQuery.data;

  // Format time from 24h to 12h
  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 || 12;
    return `${h}${period}`;
  };

  if (error) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle>Audience Growth Analysis</CardTitle>
          <CardDescription>Understand your audience demographics and growth trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-destructive/10 p-4 text-destructive text-sm">
            Error loading audience data: {error instanceof Error ? error.message : "Unknown error"}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle>Audience Growth Analysis</CardTitle>
            <CardDescription>Understand your audience demographics and growth trends</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon"
              onClick={refreshData}
              disabled={audienceQuery.isFetching}
            >
              <RefreshCw className={cn("h-4 w-4", audienceQuery.isFetching && "animate-spin")} />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
            </div>
            <Skeleton className="h-72 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-64 rounded-lg" />
              <Skeleton className="h-64 rounded-lg" />
            </div>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg border p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-medium text-muted-foreground">Total Followers</div>
                  <div className="bg-primary/10 text-primary p-1.5 rounded-md">
                    <Users className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={data.totalFollowers} />
                </div>
                <div className="text-xs mt-2 flex items-center">
                  <span className={cn(
                    "flex items-center",
                    data.followerGrowthRate >= 0 ? "text-green-500" : "text-red-500"
                  )}>
                    <ArrowUpRight className="h-3 w-3 mr-1" 
                      style={{ transform: data.followerGrowthRate < 0 ? 'rotate(90deg)' : 'none' }}
                    />
                    {Math.abs(data.followerGrowthRate).toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground ml-1">growth rate</span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-medium text-muted-foreground">New Followers</div>
                  <div className="bg-emerald-100 text-emerald-600 p-1.5 rounded-md">
                    <UserPlus className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={data.newFollowers} />
                </div>
                <div className="text-xs mt-2 flex items-center text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>In selected period</span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-medium text-muted-foreground">Engagement Rate</div>
                  <div className="bg-amber-100 text-amber-600 p-1.5 rounded-md">
                    <Share2 className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold">
                  <AnimatedCounter 
                    value={data.averageEngagementRate} 
                    formatValue={(val) => `${val.toFixed(1)}%`} 
                  />
                </div>
                <div className="text-xs mt-2 flex items-center text-muted-foreground">
                  <span>Avg. across all platforms</span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-medium text-muted-foreground">Top Location</div>
                  <div className="bg-indigo-100 text-indigo-600 p-1.5 rounded-md">
                    <MapPin className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold truncate">
                  {data.demographicData.topLocations[0]?.location || "N/A"}
                </div>
                <div className="text-xs mt-2 flex items-center text-muted-foreground">
                  <span>{data.demographicData.topLocations[0]?.percentage.toFixed(1)}% of audience</span>
                </div>
              </div>
            </div>
            
            {/* Growth Trend Chart */}
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium mb-4">Audience Growth Trend</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.growthTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="followers" 
                      name="Total Followers" 
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="newFollowers" 
                      name="New Followers" 
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Demographics and Activity Tabs */}
            <Tabs defaultValue="demographics" className="border rounded-lg p-4">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="demographics">Demographics</TabsTrigger>
                <TabsTrigger value="platforms">Platform Growth</TabsTrigger>
                <TabsTrigger value="activity">Activity Hours</TabsTrigger>
              </TabsList>
              
              <TabsContent value="demographics" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium mb-4">Age Distribution</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.demographicData.ageGroups}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="label" />
                          <YAxis tickFormatter={(value) => `${value}%`} />
                          <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                          <Bar dataKey="value" name="Age Group" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-4">Gender Distribution</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.demographicData.genders}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="label"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {data.demographicData.genders.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-4">Top Locations</h3>
                  <div className="space-y-3">
                    {data.demographicData.topLocations.map((location, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-32 text-sm truncate">{location.location}</div>
                        <div className="flex-1 mx-2">
                          <AnimatedProgress
                            value={location.percentage}
                            color={COLORS[index % COLORS.length]}
                            height={8}
                            showLabel={false}
                          />
                        </div>
                        <div className="text-sm font-medium w-16 text-right">
                          {location.percentage.toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="platforms">
                <h3 className="text-sm font-medium mb-4">Platform Growth Comparison</h3>
                <div className="space-y-6">
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.platformGrowth}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" />
                        <YAxis dataKey="platformName" type="category" width={100} />
                        <Tooltip formatter={(value, name) => [
                          name === 'growthRate' ? `${value.toFixed(1)}%` : value.toLocaleString(),
                          name === 'growthRate' ? 'Growth Rate' : 'Followers'
                        ]} />
                        <Legend />
                        <Bar dataKey="followers" name="Followers" fill="#8884d8" />
                        <Bar dataKey="growthRate" name="Growth Rate" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.platformGrowth.map((platform) => (
                      <div key={platform.platformId} className="border rounded-lg p-3">
                        <div className="font-medium">{platform.platformName}</div>
                        <div className="flex justify-between items-center mt-1">
                          <div className="text-sm text-muted-foreground">Followers:</div>
                          <div className="font-medium">{platform.followers.toLocaleString()}</div>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <div className="text-sm text-muted-foreground">Growth Rate:</div>
                          <div className={cn(
                            "font-medium",
                            platform.growthRate >= 0 ? "text-green-500" : "text-red-500"
                          )}>
                            {platform.growthRate >= 0 ? "+" : ""}{platform.growthRate.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="activity">
                <h3 className="text-sm font-medium mb-4">Audience Activity by Hour</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.activeHours}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" tickFormatter={formatHour} />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(label) => `Time: ${formatHour(label)}`}
                        formatter={(value) => [`${value}%`, 'Activity Level']}
                      />
                      <Bar dataKey="activity" name="Activity Level" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 bg-muted/40 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Peak Activity Times</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        The chart above shows when your audience is most active. 
                        Consider scheduling your content during peak hours to maximize engagement.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <div className="mb-3">
              <Users className="w-12 h-12 mx-auto text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-medium mb-2">No audience data available</h3>
            <p className="text-sm max-w-md mx-auto mb-4">
              Connect social media platforms to your account to start collecting audience analytics.
            </p>
            <Button onClick={refreshData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}