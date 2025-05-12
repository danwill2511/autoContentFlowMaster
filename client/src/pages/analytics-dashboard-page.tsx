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
        <h1 className="text-4xl font-bold mb-8 text-center">Content Performance</h1>

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