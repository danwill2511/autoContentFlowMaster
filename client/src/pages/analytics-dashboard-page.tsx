import React from 'react';
import { Layout } from '@/components/layout/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Chart } from '@/components/ui/chart';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { SchedulingInsights } from '@/components/analytics/scheduling-insights';
import { PostingTimeOptimizer } from '@/components/analytics/posting-time-optimizer';
import { ManualSchedulerTrigger } from '@/components/analytics/manual-scheduler-trigger';

export default function AnalyticsDashboardPage() {
  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 rounded-3xl" />
          <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg mb-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4">Analytics Dashboard ✨</h1>
              <p className="text-lg text-neutral-600">Track and optimize your content performance across all platforms</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-medium mb-2">Total Reach</h3>
              <AnimatedCounter value={128745} prefix="👥" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-medium mb-2">Engagement Rate</h3>
              <AnimatedCounter value={4.8} suffix="%" prefix="❤️" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-medium mb-2">Active Workflows</h3>
              <AnimatedCounter value={12} prefix="🔄" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Performance by Platform</h2>
              <Chart 
                type="bar"
                showLegend={true}
                enableInteraction={true}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Posting Schedule</h2>
              <SchedulingInsights 
                showHeatmap={true}
                enableOptimization={true}
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Optimize Your Schedule</h2>
            <PostingTimeOptimizer 
              showRecommendations={true}
              enableAutoSchedule={true}
            />
            <ManualSchedulerTrigger 
              showLastRun={true}
              enableQuickReschedule={true}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}