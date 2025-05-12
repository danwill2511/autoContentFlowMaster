import React from 'react';
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, TrendingUp, Share2, ThumbsUp, MessageSquare } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { SchedulingInsights } from "@/components/analytics/scheduling-insights";
import { PostingTimeOptimizer } from "@/components/analytics/posting-time-optimizer";
import { ManualSchedulerTrigger } from "@/components/analytics/manual-scheduler-trigger";

// Sample data - in a real app this would come from API
const sampleEngagementData = [
  { name: "Jan", likes: 400, comments: 240, shares: 100 },
  { name: "Feb", likes: 300, comments: 139, shares: 80 },
  { name: "Mar", likes: 200, comments: 980, shares: 200 },
  { name: "Apr", likes: 280, comments: 390, shares: 210 },
  { name: "May", likes: 590, comments: 480, shares: 260 },
  { name: "Jun", likes: 390, comments: 380, shares: 120 },
  { name: "Jul", likes: 490, comments: 430, shares: 220 },
];

const samplePlatformPerformance = [
  { name: "Twitter", value: 400 },
  { name: "Facebook", value: 300 },
  { name: "Instagram", value: 300 },
  { name: "LinkedIn", value: 200 },
];

const sampleContentTypePerformance = [
  { name: "Blog", value: 35 },
  { name: "Image", value: 45 },
  { name: "Video", value: 20 },
];

const colors = ["#8884d8", "#83a6ed", "#8dd1e1", "#82ca9d", "#a4de6c"];

interface AnalyticsData {
  engagementData: Array<{
    name: string;
    likes: number;
    comments: number;
    shares: number;
  }>;
  platformPerformance: Array<{
    name: string;
    value: number;
  }>;
  contentTypePerformance: Array<{
    name: string;
    value: number;
  }>;
  topPosts: Array<{
    id: number;
    title: string;
    platform: string;
    engagement: number;
    date: string;
  }>;
  totalEngagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  growthRate: number;
  dailyEngagement?: number[];
  platformMetrics?: {
    posts?: number[];
    engagement?: number[];
  };
  totalPosts?: number;
  activeWorkflows?: number;
}

export default function AnalyticsDashboardPage() {
  const [timeRange, setTimeRange] = useState("1m");
  const [platform, setPlatform] = useState("all");
  
  // Query API with filters
  const { data: analyticsData, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics", timeRange, platform],
    queryFn: async () => {
      const response = await fetch(`/api/analytics?timeRange=${timeRange}&platform=${platform}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      return await response.json();
    },
    // Default data structure
    placeholderData: {
      engagementData: sampleEngagementData,
      platformPerformance: samplePlatformPerformance,
      contentTypePerformance: sampleContentTypePerformance,
      topPosts: [
        {
          id: 1,
          title: "10 Ways to Boost Your Social Media Presence",
          platform: "Twitter",
          engagement: 1240,
          date: "2023-06-15",
        },
        {
          id: 2,
          title: "The Future of Content Marketing in 2023",
          platform: "LinkedIn",
          engagement: 980,
          date: "2023-06-10",
        },
        {
          id: 3,
          title: "How to Create Viral Content Every Time",
          platform: "Instagram",
          engagement: 820,
          date: "2023-06-05",
        },
      ],
      totalEngagement: {
        likes: 4500,
        comments: 2100,
        shares: 980,
      },
      growthRate: 23.4,
      dailyEngagement: [100, 200, 150, 300, 250, 400, 350],
      platformMetrics: {
        posts: [50, 30, 20],
        engagement: [300, 200, 100],
      },
      totalPosts: 150,
      activeWorkflows: 5,
    },
  });

  const engagementData = React.useMemo(() => ({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Engagement',
        data: analyticsData?.dailyEngagement || [],
      },
    ],
  }), [analyticsData?.dailyEngagement]);

  const platformData = React.useMemo(() => ({
    labels: ['Twitter', 'LinkedIn', 'Facebook'],
    datasets: [
      {
        label: 'Posts',
        data: analyticsData?.platformMetrics?.posts || [],
      },
      {
        label: 'Engagement',
        data: analyticsData?.platformMetrics?.engagement || [],
      },
    ],
  }), [analyticsData?.platformMetrics]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-muted-foreground">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Track your content performance across platforms</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="1m">Last month</SelectItem>
                <SelectItem value="3m">Last 3 months</SelectItem>
                <SelectItem value="6m">Last 6 months</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="pinterest">Pinterest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{analyticsData.totalEngagement.likes.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{analyticsData.totalEngagement.comments.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Share2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{analyticsData.totalEngagement.shares.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-emerald-500" />
                <span className="text-2xl font-bold">{analyticsData.growthRate}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Compared to previous period
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Top Platform</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsData.platformPerformance && analyticsData.platformPerformance.length > 0 ? (
                <>
                  <div className="text-2xl font-bold">
                    {analyticsData.platformPerformance[0].name}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analyticsData.platformPerformance[0].value} total engagements
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No platform data available</p>
              )}
            </CardContent>
          </Card>
          <Card>
              <CardHeader>
                <CardTitle>Total Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData?.totalPosts || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData?.totalEngagement ? 
                    (analyticsData.totalEngagement.likes + analyticsData.totalEngagement.comments + analyticsData.totalEngagement.shares).toLocaleString() 
                    : 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Workflows</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData?.activeWorkflows || 0}
                </div>
              </CardContent>
            </Card>
        </div>

        <Tabs defaultValue="engagement" className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="engagement">Engagement Over Time</TabsTrigger>
            <TabsTrigger value="platforms">Platform Comparison</TabsTrigger>
            <TabsTrigger value="contentTypes">Content Types</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="engagement">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>
                  Track likes, comments, and shares over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={analyticsData.engagementData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="likes" stroke="#8884d8" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="comments" stroke="#82ca9d" />
                      <Line type="monotone" dataKey="shares" stroke="#ffc658" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
            <CardHeader>
              <CardTitle>Daily Engagement</CardTitle>
              <CardDescription>
                Engagement trends over the past week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="likes" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="comments" stroke="#82ca9d" />
                <Line type="monotone" dataKey="shares" stroke="#ffc658" />
              </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          </TabsContent>
          
          <TabsContent value="platforms">
            <Card>
              <CardHeader>
                <CardTitle>Platform Performance</CardTitle>
                <CardDescription>
                  Compare engagement across different social media platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      width={500}
                      height={300}
                      data={analyticsData.platformPerformance}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Engagement" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
            <CardHeader>
              <CardTitle>Platform Performance</CardTitle>
              <CardDescription>
                Comparison across different platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.platformPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Engagement" fill="#8884d8" />
              </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          </TabsContent>
          
          <TabsContent value="contentTypes">
            <Card>
              <CardHeader>
                <CardTitle>Content Type Distribution</CardTitle>
                <CardDescription>
                  See which content types are performing best
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.contentTypePerformance}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analyticsData.contentTypePerformance.map((entry: { name: string; value: number }, index: number) => (
                          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            

            
          </div>
        </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Posts</CardTitle>
            <CardDescription>
              Your content with the highest engagement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Title</th>
                    <th className="text-left py-3 px-4">Platform</th>
                    <th className="text-left py-3 px-4">Engagement</th>
                    <th className="text-left py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.topPosts.map((post: { id: number; title: string; platform: string; engagement: number; date: string }) => (
                    <tr key={post.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{post.title}</td>
                      <td className="py-3 px-4">{post.platform}</td>
                      <td className="py-3 px-4">{post.engagement.toLocaleString()}</td>
                      <td className="py-3 px-4">{new Date(post.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}