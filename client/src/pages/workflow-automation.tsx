import React from 'react';
import { Layout } from '@/components/layout/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlatformSelector } from '@/components/workflows/platform-selector';
import { ContentPreview } from '@/components/workflows/content-preview';
import { ContentFlowVisualizer } from '@/components/workflows/content-flow-visualizer';

export default function WorkflowAutomationPage() {
  return (
    <Layout>
      <div className="container mx-auto py-8">
  <div className="relative">
    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 rounded-3xl" />
    <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg mb-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Workflow Automation 🔄</h1>
        <p className="text-lg text-neutral-600">Build powerful automated content workflows with ease</p>
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          <Button variant="outline" size="sm">
            <span className="mr-2">✨</span> Create Workflow
          </Button>
          <Button variant="outline" size="sm">
            <span className="mr-2">📋</span> Templates
          </Button>
          <Button variant="outline" size="sm">
            <span className="mr-2">⚙️</span> Settings
          </Button>
        </div>
      </div>
    </div>
  </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">1. Choose Platforms</h2>
              <PlatformSelector 
                showPopularTemplates={true}
                enableDragReorder={true}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">2. Content Settings</h2>
              <ContentPreview 
                enableFormatPreview={true}
                showPlatformGuidelines={true}
              />
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4">3. Visualize Flow</h2>
            <ContentFlowVisualizer 
              showTimeline={true}
              enableInteractiveEditing={true}
            />
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button size="lg" className="text-lg px-8 py-4">
            🚀 Activate Workflow
          </Button>
        </div>
      </div>
    </Layout>
  );
}