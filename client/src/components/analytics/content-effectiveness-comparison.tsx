import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  RefreshCw, 
  ArrowUpRight, 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  FileBarChart,
  Check,
  X,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Scatter,
  ScatterChart,
  ZAxis
} from "recharts";

interface ContentEffectivenessComparisonProps {
  className?: string;
}

interface ContentTypePerformance {
  contentType: string;
  averageEngagement: number;
  averageReach: number;
  totalItems: number;
  conversionRate?: number;
}

interface ContentLengthPerformance {
  lengthCategory: string;
  averageEngagement: number;
  averageReach: number;
  totalItems: number;
}

interface HashtagPerformance {
  hashtag: string;
  averageEngagement: number;
  frequency: number;
}

interface TimeBasedPerformance {
  timeFrame: string;
  averageEngagement: number;
  totalItems: number;
}

interface ContentFormatPerformance {
  format: string;
  engagement: number;
  reach: number;
  conversionRate: number;
}

interface ContentComparisonResponse {
  contentTypePerformance: ContentTypePerformance[];
  contentLengthPerformance: ContentLengthPerformance[];
  topPerformingHashtags: HashtagPerformance[];
  timeBasedPerformance: TimeBasedPerformance[];
  formatComparison: ContentFormatPerformance[];
}

export function ContentEffectivenessComparison({ className }: ContentEffectivenessComparisonProps) {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState<string>('30d');
  
  // Query to get content effectiveness data
  const comparisonQuery = useQuery({
    queryKey: ['/api/analytics/content-comparison', timeRange],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/analytics/content-comparison?timeRange=${timeRange}`);
      return await res.json() as ContentComparisonResponse;
    },
    retry: 1,
  });
  
  // Function to refresh analytics data
  const refreshData = () => {
    comparisonQuery.refetch();
  };
  
  const isLoading = comparisonQuery.isLoading;
  const error = comparisonQuery.error;
  const data = comparisonQuery.data;

  // Format percentage for display
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  if (error) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle>Content Effectiveness Comparison</CardTitle>
          <CardDescription>Compare performance across different content types and formats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-destructive/10 p-4 text-destructive text-sm">
            Error loading comparison data: {error instanceof Error ? error.message : "Unknown error"}
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
            <CardTitle>Content Effectiveness Comparison</CardTitle>
            <CardDescription>Compare performance across different content types and formats</CardDescription>
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
              disabled={comparisonQuery.isFetching}
            >
              <RefreshCw className={cn("h-4 w-4", comparisonQuery.isFetching && "animate-spin")} />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-64 rounded" />
            <Skeleton className="h-72 rounded-lg" />
            <Skeleton className="h-8 w-64 rounded mt-6" />
            <Skeleton className="h-72 rounded-lg" />
          </div>
        ) : data ? (
          <Tabs defaultValue="content-types" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="content-types">Content Types</TabsTrigger>
              <TabsTrigger value="content-length">Content Length</TabsTrigger>
              <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
              <TabsTrigger value="posting-time">Posting Time</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content-types">
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-4">Content Type Performance Comparison</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.contentTypePerformance}
                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="contentType" />
                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                        <Tooltip formatter={(value, name) => {
                          if (name === 'conversionRate') {
                            return [`${value.toFixed(2)}%`, 'Conversion Rate'];
                          }
                          return [value, name === 'averageEngagement' ? 'Avg. Engagement' : 'Avg. Reach'];
                        }} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="averageEngagement" name="Avg. Engagement" fill="#8884d8" />
                        <Bar yAxisId="left" dataKey="averageReach" name="Avg. Reach" fill="#82ca9d" />
                        {data.contentTypePerformance.some(item => item.conversionRate !== undefined) && (
                          <Bar yAxisId="right" dataKey="conversionRate" name="Conversion Rate" fill="#ffc658" />
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-4">Content Format Effectiveness</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.formatComparison}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="format" />
                        <PolarRadiusAxis />
                        <Radar name="Engagement" dataKey="engagement" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        <Radar name="Reach" dataKey="reach" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                        <Radar name="Conversion" dataKey="conversionRate" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                        <Legend />
                        <Tooltip formatter={(value, name) => {
                          return [value, name === 'Engagement' ? 'Engagement' : name === 'Reach' ? 'Reach' : 'Conversion Rate'];
                        }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {data.contentTypePerformance.map((type) => (
                    <div key={type.contentType} className="border rounded-lg p-4">
                      <div className="font-medium mb-2">{type.contentType}</div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Avg. Engagement:</span>
                          <span className="font-medium">{type.averageEngagement.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Avg. Reach:</span>
                          <span className="font-medium">{type.averageReach.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total Items:</span>
                          <span className="font-medium">{type.totalItems}</span>
                        </div>
                        {type.conversionRate !== undefined && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Conversion Rate:</span>
                            <span className="font-medium">{type.conversionRate.toFixed(2)}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="content-length">
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-4">Content Length Performance</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.contentLengthPerformance}
                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="lengthCategory" />
                        <YAxis />
                        <Tooltip formatter={(value, name) => {
                          return [value, name === 'averageEngagement' ? 'Avg. Engagement' : 'Avg. Reach'];
                        }} />
                        <Legend />
                        <Bar dataKey="averageEngagement" name="Avg. Engagement" fill="#8884d8" />
                        <Bar dataKey="averageReach" name="Avg. Reach" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-4">Content Length Distribution vs. Engagement</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart
                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid />
                        <XAxis 
                          type="category" 
                          dataKey="lengthCategory" 
                          name="Length Category" 
                        />
                        <YAxis 
                          type="number" 
                          dataKey="averageEngagement" 
                          name="Average Engagement" 
                        />
                        <ZAxis 
                          type="number" 
                          dataKey="totalItems" 
                          range={[50, 500]} 
                          name="Number of Content Items" 
                        />
                        <Tooltip 
                          cursor={{ strokeDasharray: '3 3' }} 
                          formatter={(value, name, props) => {
                            if (name === 'Number of Content Items') {
                              return [props.payload.totalItems, name];
                            }
                            return [value, name];
                          }}
                        />
                        <Legend />
                        <Scatter 
                          name="Content Length vs. Engagement" 
                          data={data.contentLengthPerformance} 
                          fill="#8884d8" 
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="bg-muted/40 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">Content Length Insights</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {data.contentLengthPerformance.length > 0 ? 
                          `Based on your data, ${data.contentLengthPerformance.sort((a, b) => b.averageEngagement - a.averageEngagement)[0].lengthCategory} content tends to perform best in terms of engagement.` :
                          "Start creating content with varied lengths to see which performs best for your audience."
                        }
                      </p>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5" />
                          <span className="text-sm">Consistent length across platforms</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5" />
                          <span className="text-sm">Platform-specific optimizations</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <X className="h-4 w-4 text-red-500 mt-0.5" />
                          <span className="text-sm">Extremely long content</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <X className="h-4 w-4 text-red-500 mt-0.5" />
                          <span className="text-sm">Overly generic short content</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="hashtags">
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-4">Top Performing Hashtags</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart
                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" dataKey="frequency" name="Usage Frequency" />
                        <YAxis type="number" dataKey="averageEngagement" name="Average Engagement" />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value, name, props) => {
                          if (name === 'Usage Frequency') {
                            return [value, 'Times Used'];
                          }
                          return [value, 'Avg. Engagement'];
                        }} />
                        <Legend />
                        <Scatter name="Hashtags" data={data.topPerformingHashtags} fill="#8884d8">
                          {data.topPerformingHashtags.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index < 3 ? '#FF8042' : '#8884d8'} />
                          ))}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="text-sm font-medium mb-4">Top Hashtag Effectiveness</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={data.topPerformingHashtags.slice(0, 10)}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis 
                            type="category" 
                            dataKey="hashtag" 
                            width={100}
                          />
                          <Tooltip formatter={(value, name) => {
                            return [value, name === 'averageEngagement' ? 'Avg. Engagement' : 'Times Used'];
                          }} />
                          <Legend />
                          <Bar dataKey="averageEngagement" name="Avg. Engagement" fill="#8884d8" />
                          <Bar dataKey="frequency" name="Times Used" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="text-sm font-medium mb-4">Top Performing Hashtags</h3>
                    <div className="overflow-auto max-h-72">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left border-b">
                            <th className="pb-3 font-medium">Hashtag</th>
                            <th className="pb-3 font-medium text-right">Engagement</th>
                            <th className="pb-3 font-medium text-right">Usage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.topPerformingHashtags.map((hashtag, index) => (
                            <tr 
                              key={hashtag.hashtag} 
                              className={cn(
                                "border-b border-border/50",
                                index < 3 ? "bg-amber-50" : ""
                              )}
                            >
                              <td className="py-3">
                                <span className={cn(
                                  "font-medium",
                                  index < 3 ? "text-amber-700" : ""
                                )}>
                                  #{hashtag.hashtag}
                                </span>
                              </td>
                              <td className="py-3 text-right">{hashtag.averageEngagement.toLocaleString()}</td>
                              <td className="py-3 text-right">{hashtag.frequency}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="posting-time">
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-4">Time-Based Performance</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.timeBasedPerformance}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timeFrame" />
                        <YAxis />
                        <Tooltip formatter={(value, name) => {
                          return [value, name === 'averageEngagement' ? 'Avg. Engagement' : 'Content Count'];
                        }} />
                        <Legend />
                        <Bar dataKey="averageEngagement" name="Avg. Engagement" fill="#8884d8" />
                        <Bar dataKey="totalItems" name="Content Count" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-4 bg-muted/40 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium">Posting Time Insights</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {data.timeBasedPerformance.length > 0 ? 
                            `Based on historical data, ${data.timeBasedPerformance.sort((a, b) => b.averageEngagement - a.averageEngagement)[0].timeFrame} tends to generate the highest engagement.` :
                            "Start posting content at different times to identify the optimal posting schedule for your audience."
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="text-sm font-medium mb-4">Performance vs. Posting Time</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {data.timeBasedPerformance.map((timeData, index) => (
                        <div key={timeData.timeFrame} className="flex items-center">
                          <div className="w-32 text-sm">{timeData.timeFrame}</div>
                          <div className="flex-1 h-6 rounded-full bg-muted overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{ 
                                width: `${Math.min(100, (timeData.averageEngagement / Math.max(...data.timeBasedPerformance.map(t => t.averageEngagement))) * 100)}%` 
                              }}
                            />
                          </div>
                          <div className="w-20 text-right text-sm font-medium">
                            {timeData.averageEngagement.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="text-sm font-medium mb-4">Recommended Posting Times</h3>
                    <div className="space-y-4">
                      {data.timeBasedPerformance
                        .sort((a, b) => b.averageEngagement - a.averageEngagement)
                        .slice(0, 3)
                        .map((timeData, index) => (
                          <div key={timeData.timeFrame} className="flex items-start gap-3">
                            <div className={cn(
                              "flex items-center justify-center w-8 h-8 rounded-full text-white shrink-0",
                              index === 0 ? "bg-amber-500" : 
                              index === 1 ? "bg-zinc-400" : 
                              "bg-amber-700"
                            )}>
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium">{timeData.timeFrame}</div>
                              <div className="text-sm text-muted-foreground mt-1">
                                Average engagement: {timeData.averageEngagement.toLocaleString()}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Content count: {timeData.totalItems}
                              </div>
                            </div>
                          </div>
                        ))
                      }
                      
                      {data.timeBasedPerformance.length === 0 && (
                        <div className="text-center py-6 text-muted-foreground">
                          <div className="mb-3">
                            <FileBarChart className="w-10 h-10 mx-auto text-muted-foreground/50" />
                          </div>
                          <p className="text-sm">No time-based performance data available yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <div className="mb-3">
              <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-medium mb-2">No comparison data available</h3>
            <p className="text-sm max-w-md mx-auto mb-4">
              Start creating content with varied formats, lengths, and hashtags to see performance comparisons.
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