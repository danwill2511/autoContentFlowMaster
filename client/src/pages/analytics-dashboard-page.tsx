import React, { useState } from 'react';
import { Layout } from '@/components/layout/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { SchedulingInsights } from '@/components/analytics/scheduling-insights';
import { PostingTimeOptimizer } from '@/components/analytics/posting-time-optimizer';
import { ManualSchedulerTrigger } from '@/components/analytics/manual-scheduler-trigger';
import { ContentPerformanceMetrics } from '@/components/analytics/content-performance-metrics';
import { AudienceGrowthAnalysis } from '@/components/analytics/audience-growth-analysis';
import { ContentEffectivenessComparison } from '@/components/analytics/content-effectiveness-comparison';
import { ContentAnalyticsInsights } from '@/components/analytics/content-analytics-insights';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export default function AnalyticsDashboardPage() {
  const [timeRange, setTimeRange] = useState<string>('30d');
  
  // Query to get user analytics
  const analyticsQuery = useQuery({
    queryKey: ['/api/analytics', timeRange],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/analytics?timeRange=${timeRange}`);
      return await res.json();
    },
  });

  // Extract data from the analytics query
  const data = analyticsQuery.data;
  const isLoading = analyticsQuery.isLoading;
  
  // Calculate summary values
  const totalReach = data?.engagement?.total || 0;
  const engagementRate = data?.engagement?.avgPerPost || 0;
  const activeWorkflows = data?.user?.activeWorkflows || 0;

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 rounded-3xl" />
          <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg mb-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Analytics Dashboard ✨</h1>
                <p className="text-lg text-neutral-600">Track and optimize your content performance across all platforms</p>
              </div>
              <div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Time period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-medium mb-2">Total Reach</h3>
              <AnimatedCounter 
                value={totalReach} 
                prefix="👥" 
                formatValue={(val) => val.toLocaleString()}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-medium mb-2">Engagement Rate</h3>
              <AnimatedCounter 
                value={engagementRate} 
                suffix="%" 
                prefix="❤️" 
                formatValue={(val) => val.toFixed(2)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-medium mb-2">Active Workflows</h3>
              <AnimatedCounter 
                value={activeWorkflows} 
                prefix="🔄"
              />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="content-performance" className="space-y-8">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
            <TabsTrigger value="content-performance">Content Performance</TabsTrigger>
            <TabsTrigger value="audience-insights">Audience Insights</TabsTrigger>
            <TabsTrigger value="content-comparison">Content Comparison</TabsTrigger>
            <TabsTrigger value="scheduling-optimization">Scheduling</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content-performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ContentPerformanceMetrics timeRange={timeRange} />
              </div>
              <div>
                <ContentAnalyticsInsights />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="audience-insights">
            <AudienceGrowthAnalysis />
          </TabsContent>
          
          <TabsContent value="content-comparison">
            <ContentEffectivenessComparison />
          </TabsContent>
          
          <TabsContent value="scheduling-optimization" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <SchedulingInsights />
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <PostingTimeOptimizer />
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardContent className="p-6 flex justify-end">
                <ManualSchedulerTrigger />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}