import React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, BarChart3, RefreshCw, TrendingUp, Eye, MessageSquare, Share2, BarChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Chart } from "@/components/ui/chart";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Line,
  LineChart,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface ContentPerformanceMetricsProps {
  className?: string;
  timeRange?: '7d' | '30d' | '90d' | 'all';
}

interface ContentMetric {
  id: number;
  platformId: number;
  platformName: string;
  contentId: number;
  contentTitle: string;
  impressions: number;
  reach: number;
  engagement: number;
  shares: number;
  clicks: number;
  saves: number;
  date: string;
}

interface PlatformPerformance {
  platformId: number;
  platformName: string;
  totalImpressions: number;
  totalEngagement: number;
  totalShares: number;
  engagementRate: number;
  contentCount: number;
}

interface ContentPeformanceSummary {
  topPlatform: string;
  totalReach: number;
  totalEngagement: number;
  averageEngagementRate: number;
  totalContent: number;
  engagementGrowth: number;
  reachGrowth: number;
  topPerformingContentId: number;
  topPerformingContentTitle: string;
  weeklyPerformance: {
    date: string;
    reach: number;
    engagement: number;
  }[];
  platformPerformance: PlatformPerformance[];
  recentMetrics: ContentMetric[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

export function ContentPerformanceMetrics({ className, timeRange = '30d' }: ContentPerformanceMetricsProps) {
  const { toast } = useToast();
  
  // Query to get content performance data
  const performanceQuery = useQuery({
    queryKey: ['/api/analytics/content-performance', timeRange],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/analytics/content-performance?timeRange=${timeRange}`);
      return await res.json() as ContentPeformanceSummary;
    },
    retry: 1,
  });
  
  // Function to refresh analytics data
  const refreshData = () => {
    performanceQuery.refetch();
  };
  
  const isLoading = performanceQuery.isLoading;
  const error = performanceQuery.error;
  const data = performanceQuery.data;

  // Calculate top platforms by engagement rate
  const topPlatformsByEngagement = data?.platformPerformance
    ?.sort((a, b) => b.engagementRate - a.engagementRate)
    .slice(0, 5) || [];
    
  // Prepare pie chart data for platform distribution
  const platformDistributionData = data?.platformPerformance?.map(platform => ({
    name: platform.platformName,
    value: platform.totalEngagement
  })) || [];
  
  // Format engagement as percentage
  const formatEngagementRate = (value: number) => `${value.toFixed(2)}%`;
  
  // Convert weekly performance data for chart
  const weeklyData = data?.weeklyPerformance || [];

  if (error) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle>Content Performance Metrics</CardTitle>
          <CardDescription>Track your content engagement across platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-destructive/10 p-4 text-destructive text-sm">
            Error loading content performance data: {error instanceof Error ? error.message : "Unknown error"}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Content Performance Metrics</CardTitle>
            <CardDescription>Track your content engagement across platforms</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            disabled={performanceQuery.isFetching}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", performanceQuery.isFetching && "animate-spin")} />
            Refresh
          </Button>
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
            <Skeleton className="h-72 rounded-lg" />
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg border p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-medium text-muted-foreground">Total Reach</div>
                  <div className="bg-primary/10 text-primary p-1.5 rounded-md">
                    <Eye className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={data.totalReach} />
                </div>
                <div className="text-xs mt-2 flex items-center">
                  <span className={cn(
                    "flex items-center",
                    data.reachGrowth >= 0 ? "text-green-500" : "text-red-500"
                  )}>
                    <ArrowUpRight className="h-3 w-3 mr-1" 
                      style={{ transform: data.reachGrowth < 0 ? 'rotate(90deg)' : 'none' }}
                    />
                    {Math.abs(data.reachGrowth)}%
                  </span>
                  <span className="text-muted-foreground ml-1">vs. previous period</span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-medium text-muted-foreground">Engagement Rate</div>
                  <div className="bg-indigo-100 text-indigo-600 p-1.5 rounded-md">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold">
                  <AnimatedCounter 
                    value={data.averageEngagementRate} 
                    formatValue={(val) => `${val.toFixed(2)}%`} 
                  />
                </div>
                <div className="text-xs mt-2 flex items-center">
                  <span className={cn(
                    "flex items-center",
                    data.engagementGrowth >= 0 ? "text-green-500" : "text-red-500"
                  )}>
                    <ArrowUpRight className="h-3 w-3 mr-1" 
                      style={{ transform: data.engagementGrowth < 0 ? 'rotate(90deg)' : 'none' }}
                    />
                    {Math.abs(data.engagementGrowth)}%
                  </span>
                  <span className="text-muted-foreground ml-1">vs. previous period</span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-medium text-muted-foreground">Total Content</div>
                  <div className="bg-amber-100 text-amber-600 p-1.5 rounded-md">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={data.totalContent} />
                </div>
                <div className="text-xs mt-2 flex items-center text-muted-foreground">
                  <span>Across {data.platformPerformance.length} platforms</span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-medium text-muted-foreground">Top Platform</div>
                  <div className="bg-emerald-100 text-emerald-600 p-1.5 rounded-md">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold truncate">
                  {data.topPlatform}
                </div>
                <div className="text-xs mt-2 flex items-center text-muted-foreground">
                  <span>Highest engagement rate platform</span>
                </div>
              </div>
            </div>
            
            {/* Weekly Performance Chart */}
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium mb-4">Weekly Performance Trend</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="reach" 
                      name="Reach" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="engagement" 
                      name="Engagement" 
                      stroke="#82ca9d" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Platform Performance Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-4">Platform Engagement Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={platformDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {platformDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-4">Top Platforms by Engagement Rate</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topPlatformsByEngagement}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" tickFormatter={formatEngagementRate} />
                      <YAxis dataKey="platformName" type="category" width={100} />
                      <Tooltip formatter={(value) => [`${value.toFixed(2)}%`, 'Engagement Rate']} />
                      <Legend />
                      <Bar dataKey="engagementRate" name="Engagement Rate" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Top Performing Content */}
            {data.recentMetrics.length > 0 && (
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-4">Recent Content Performance</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="pb-3 font-medium">Content</th>
                        <th className="pb-3 font-medium">Platform</th>
                        <th className="pb-3 font-medium text-right">Impressions</th>
                        <th className="pb-3 font-medium text-right">Engagement</th>
                        <th className="pb-3 font-medium text-right">Shares</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentMetrics.slice(0, 5).map((metric) => (
                        <tr key={`${metric.contentId}-${metric.platformId}`} className="border-b border-border/50">
                          <td className="py-3 truncate max-w-[180px]">{metric.contentTitle}</td>
                          <td className="py-3">{metric.platformName}</td>
                          <td className="py-3 text-right">{metric.impressions.toLocaleString()}</td>
                          <td className="py-3 text-right">{metric.engagement.toLocaleString()}</td>
                          <td className="py-3 text-right">{metric.shares.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <div className="mb-3">
              <BarChart className="w-12 h-12 mx-auto text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-medium mb-2">No performance data available</h3>
            <p className="text-sm max-w-md mx-auto mb-4">
              Start creating and publishing content to generate performance metrics and analytics.
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