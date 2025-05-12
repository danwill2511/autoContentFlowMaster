import React, { useState } from 'react';
import Layout from '@/components/layout/layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CreativeSuiteTools from '@/components/content/CreativeSuiteTools';
import AIWritingAssistant from '@/components/content/AIWritingAssistant';
import ColorPaletteGenerator from '@/components/content/ColorPaletteGenerator';
import MoodBoardCreator from '@/components/content/MoodBoardCreator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function CreativeToolsPage() {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  
  const renderActiveToolContent = () => {
    switch (activeToolId) {
      case 'ai-writing-assistant':
        return <AIWritingAssistant />;
      case 'color-palette-generator':
        return <ColorPaletteGenerator />;
      case 'mood-board-creator':
        return <MoodBoardCreator />;
      default:
        return null;
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Creative Tools Suite</h1>
          <p className="text-lg text-muted-foreground">
            Enhance your content creation workflow with these powerful AI-driven tools
          </p>
        </header>
        
        <div className="mb-8">
          <CreativeSuiteTools />
        </div>
        
        {activeToolId ? (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {activeToolId === 'ai-writing-assistant' && 'AI Writing Assistant'}
                {activeToolId === 'color-palette-generator' && 'Color Palette Generator'}
                {activeToolId === 'mood-board-creator' && 'Mood Board Creator'}
              </h2>
              <Button variant="ghost" onClick={() => setActiveToolId(null)}>
                Back to Tools
              </Button>
            </div>
            {renderActiveToolContent()}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-border/50" onClick={() => setActiveToolId('ai-writing-assistant')}>
              <CardHeader className="pb-2">
                <CardTitle>AI Writing Assistant</CardTitle>
                <CardDescription>
                  Create professional content with tone detection and suggestions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-40 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-md flex items-center justify-center mb-4">
                  <img src="https://placehold.co/400x200/f5f5f5/a1a1aa?text=AI+Writing" alt="AI Writing Preview" className="h-full w-full object-cover" />
                </div>
                <Button className="w-full">
                  Start Writing <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-border/50" onClick={() => setActiveToolId('color-palette-generator')}>
              <CardHeader className="pb-2">
                <CardTitle>Color Palette Generator</CardTitle>
                <CardDescription>
                  Create harmonious color schemes for your content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-40 rounded-md mb-4 flex overflow-hidden">
                  <div className="flex-1 bg-blue-500"></div>
                  <div className="flex-1 bg-indigo-500"></div>
                  <div className="flex-1 bg-purple-500"></div>
                  <div className="flex-1 bg-pink-500"></div>
                  <div className="flex-1 bg-rose-500"></div>
                </div>
                <Button className="w-full">
                  Generate Palettes <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-border/50" onClick={() => setActiveToolId('mood-board-creator')}>
              <CardHeader className="pb-2">
                <CardTitle>Mood Board Creator</CardTitle>
                <CardDescription>
                  Generate visual mood boards for your social media campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-40 bg-muted-foreground/10 rounded-md grid grid-cols-2 grid-rows-2 gap-1 p-1 mb-4">
                  <div className="bg-blue-200"></div>
                  <div className="bg-indigo-200"></div>
                  <div className="bg-purple-200"></div>
                  <div className="bg-pink-200"></div>
                </div>
                <Button className="w-full">
                  Create Mood Boards <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
        
        <div className="mt-12 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-lg border border-border/50 p-6">
          <h2 className="text-2xl font-bold mb-2">Upgrade Your Creative Workflow</h2>
          <p className="mb-4 text-muted-foreground">
            Access all creative tools and premium features with a subscription plan.
          </p>
          <Tabs defaultValue="essential">
            <TabsList>
              <TabsTrigger value="free">Free</TabsTrigger>
              <TabsTrigger value="essential">Essential</TabsTrigger>
              <TabsTrigger value="pro">Pro</TabsTrigger>
            </TabsList>
            
            <TabsContent value="free" className="mt-4">
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Basic access to creative tools</li>
                <li>Limited generations per day</li>
                <li>Standard resolution exports</li>
              </ul>
              <Button variant="outline">Current Plan</Button>
            </TabsContent>
            
            <TabsContent value="essential" className="mt-4">
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Full access to all creative tools</li>
                <li>Unlimited generations</li>
                <li>HD exports and downloads</li>
                <li>Save up to 50 templates and boards</li>
              </ul>
              <Button>Upgrade to Essential</Button>
            </TabsContent>
            
            <TabsContent value="pro" className="mt-4">
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Everything in Essential</li>
                <li>API access for automation</li>
                <li>Team collaboration features</li>
                <li>Priority support</li>
                <li>Custom branding options</li>
              </ul>
              <Button>Upgrade to Pro</Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}