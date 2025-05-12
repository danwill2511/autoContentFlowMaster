import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { AiAssistant } from "@/components/ui/ai-assistant";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { AnimatedCounter, AnimatedProgress, AnimatedBarChart, AnimatedIcon } from "@/components/ui/animated-counter";
import { Achievement, AchievementBadge } from "@/components/gamification/achievement-badge";
import { UserEngagementTracker } from "@/components/gamification/user-engagement-tracker";
import { ShopifyIntegration } from "@/components/integrations/shopify-integration";

export default function ShowcasePage() {
  const [currentTab, setCurrentTab] = useState("overview");
  
  // Sample achievement data
  const achievements: Achievement[] = [
    {
      id: "first-workflow",
      name: "Workflow Creator",
      description: "Created your first content workflow",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      unlocked: true
    },
    {
      id: "content-master",
      name: "Content Master",
      description: "Created 10 pieces of content",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      unlocked: true
    },
    {
      id: "platform-connector",
      name: "Platform Connector",
      description: "Connected 3 social media platforms",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      unlocked: false,
      progress: {
        current: 2,
        total: 3
      }
    },
    {
      id: "engagement-king",
      name: "Engagement King",
      description: "Reached 1,000 total engagements",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      unlocked: false,
      progress: {
        current: 687,
        total: 1000
      }
    },
    {
      id: "social-butterfly",
      name: "Social Butterfly",
      description: "Posted to all connected platforms in a single day",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
      unlocked: true
    }
  ];
  
  // Sample bar chart data
  const engagementData = [
    { label: 'Mon', value: 25, color: '#2563eb' },
    { label: 'Tue', value: 40, color: '#2563eb' },
    { label: 'Wed', value: 30, color: '#2563eb' },
    { label: 'Thu', value: 55, color: '#2563eb' },
    { label: 'Fri', value: 45, color: '#2563eb' },
    { label: 'Sat', value: 35, color: '#2563eb' },
    { label: 'Sun', value: 20, color: '#2563eb' },
  ];
  
  // Sample platform distribution data
  const platformData = [
    { label: 'Twitter', value: 35, color: '#1DA1F2' },
    { label: 'Instagram', value: 27, color: '#E1306C' },
    { label: 'LinkedIn', value: 20, color: '#0A66C2' },
    { label: 'Facebook', value: 18, color: '#4267B2' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
        <div className="px-4 sm:px-0 mb-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900">
                UI Component Showcase
              </h1>
              <p className="mt-1 text-sm text-neutral-500">
                Explore the new UI components added to AutoContentFlow
              </p>
            </div>
          </div>
        </div>
        
        <div className="px-4 sm:px-0 mb-8">
          <Tabs defaultValue={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid grid-cols-6 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="gamification">Gamification</TabsTrigger>
              <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
              <TabsTrigger value="animations">Animations</TabsTrigger>
              <TabsTrigger value="theme">Theme Switcher</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Gamification System</CardTitle>
                    <CardDescription>User engagement tracker with achievement badges</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3 mb-4">
                      {achievements.slice(0, 3).map(achievement => (
                        <AchievementBadge key={achievement.id} achievement={achievement} />
                      ))}
                    </div>
                    <Button size="sm" onClick={() => setCurrentTab("gamification")}>
                      View Details
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>AI Assistant</CardTitle>
                    <CardDescription>Contextual AI help with playful character design</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-xl">😊</span>
                      </div>
                      <div className="bg-primary-50 px-3 py-2 rounded-lg">
                        <p className="text-sm text-primary-800">
                          Hi! I'm your AI assistant. Need help?
                        </p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => setCurrentTab("ai-assistant")}>
                      View Details
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Animated Elements</CardTitle>
                    <CardDescription>Micro-interactions for dashboard elements</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-4">
                      <AnimatedCounter value={3578} formatValue={(val) => `${val.toLocaleString()} Views`} className="text-lg font-semibold" />
                      <AnimatedProgress value={72} showLabel />
                    </div>
                    <Button size="sm" onClick={() => setCurrentTab("animations")}>
                      View Details
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Theme Customization</CardTitle>
                    <CardDescription>One-click theme switcher with smooth transitions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {['blue', 'purple', 'green'].map(color => (
                        <div key={color} className={`h-8 rounded-md bg-${color === 'blue' ? 'primary' : color}-500`}></div>
                      ))}
                    </div>
                    <Button size="sm" onClick={() => setCurrentTab("theme")}>
                      View Details
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Shopify Integration</CardTitle>
                    <CardDescription>Connect your store to generate product content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                          <path d="M7 10v12"></path>
                          <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Shopify Connection</p>
                        <p className="text-xs text-neutral-500">Sync products & create content</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => setCurrentTab("integrations")}>
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Gamification Tab */}
            <TabsContent value="gamification" className="space-y-6">
              <h2 className="text-xl font-semibold">Gamified User Engagement Tracker</h2>
              <p className="text-neutral-500">Increase user engagement with achievement badges and progression tracking</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <UserEngagementTracker
                    achievements={achievements}
                    level={4}
                    experience={350}
                    experienceForNextLevel={500}
                    streakDays={7}
                  />
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Available Achievements</CardTitle>
                    <CardDescription>Unlock achievements as you use the platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {achievements.map(achievement => (
                        <div key={achievement.id} className="flex items-start space-x-3">
                          <AchievementBadge
                            achievement={achievement}
                            size="sm"
                            showTooltip={false}
                          />
                          <div>
                            <h4 className="text-sm font-medium">{achievement.name}</h4>
                            <p className="text-xs text-neutral-500">{achievement.description}</p>
                            {achievement.progress && !achievement.unlocked && (
                              <div className="mt-1">
                                <AnimatedProgress
                                  value={achievement.progress.current}
                                  max={achievement.progress.total}
                                  height={4}
                                  showLabel
                                  labelPosition="outside"
                                  className="mt-1"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* AI Assistant Tab */}
            <TabsContent value="ai-assistant" className="space-y-6">
              <h2 className="text-xl font-semibold">Contextual AI Help Bubble</h2>
              <p className="text-neutral-500">Playful assistant that provides contextual help throughout the application</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Assistant Demo</CardTitle>
                    <CardDescription>Click the bubble in the bottom-right corner to interact</CardDescription>
                  </CardHeader>
                  <CardContent className="h-96 flex items-center justify-center bg-neutral-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-neutral-500 mb-4">The AI assistant appears as a floating bubble</p>
                      <p className="text-sm text-neutral-400">Look for it in the bottom-right corner of the page</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Features</CardTitle>
                    <CardDescription>What makes our AI assistant special</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-violet-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Contextual Awareness</h4>
                          <p className="text-xs text-neutral-500">Provides hints based on the current page and user activity</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Expressive Character</h4>
                          <p className="text-xs text-neutral-500">Shows emotions based on interactions and responses</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Suggestion Prompts</h4>
                          <p className="text-xs text-neutral-500">Offers quick suggestion buttons based on common questions</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Animations Tab */}
            <TabsContent value="animations" className="space-y-6">
              <h2 className="text-xl font-semibold">Micro-Interaction Animations</h2>
              <p className="text-neutral-500">Subtle animations that make the dashboard more engaging and interactive</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Animated Counters & Progress</CardTitle>
                    <CardDescription>Numbers and progress bars with smooth animations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Animated Counter</h4>
                      <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <AnimatedCounter 
                          value={12458}
                          duration={2}
                          className="text-2xl font-bold text-primary-600"
                        />
                        <p className="text-sm text-neutral-500 mt-1">Total Visitors</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Progress Bars</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Storage Used</span>
                            <span>68%</span>
                          </div>
                          <AnimatedProgress value={68} showLabel={false} color="#2563eb" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Weekly Goal</span>
                            <span>45%</span>
                          </div>
                          <AnimatedProgress value={45} showLabel={false} color="#10b981" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Animated Charts</CardTitle>
                    <CardDescription>Data visualizations with smooth animations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Bar Chart</h4>
                        <div className="bg-white p-4 rounded-lg shadow-sm border">
                          <AnimatedBarChart
                            data={engagementData}
                            height={150}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Platform Distribution</h4>
                        <div className="bg-white p-4 rounded-lg shadow-sm border">
                          <AnimatedBarChart
                            data={platformData}
                            height={150}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Animated Icons</CardTitle>
                    <CardDescription>Interactive icons with various animation types</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                      <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-col items-center">
                        <AnimatedIcon
                          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>}
                          animation="pulse"
                          size="lg"
                          color="#ef4444"
                        />
                        <p className="mt-2 text-sm font-medium">Pulse</p>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-col items-center">
                        <AnimatedIcon
                          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>}
                          animation="bounce"
                          size="lg"
                          color="#3b82f6"
                        />
                        <p className="mt-2 text-sm font-medium">Bounce</p>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-col items-center">
                        <AnimatedIcon
                          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>}
                          animation="spin"
                          size="lg"
                          color="#8b5cf6"
                        />
                        <p className="mt-2 text-sm font-medium">Spin</p>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-col items-center">
                        <AnimatedIcon
                          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>}
                          animation="tada"
                          size="lg"
                          color="#10b981"
                        />
                        <p className="mt-2 text-sm font-medium">Tada</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Theme Switcher Tab */}
            <TabsContent value="theme" className="space-y-6">
              <h2 className="text-xl font-semibold">One-Click Theme Switcher</h2>
              <p className="text-neutral-500">Change the application theme with smooth transitions</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Theme Switcher Demo</CardTitle>
                    <CardDescription>Click the button to open the theme selector</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center items-center py-8">
                    <ThemeSwitcher floatingButton={false} />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Available Themes</CardTitle>
                    <CardDescription>Choose from a variety of color schemes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      {['blue', 'purple', 'green', 'orange', 'pink', 'dark'].map(theme => (
                        <div key={theme} className="bg-white rounded-lg border overflow-hidden">
                          <div className={`h-6 bg-${theme === 'blue' ? 'primary' : theme}-500`}></div>
                          <div className="p-2 text-center">
                            <p className="text-xs font-medium capitalize">{theme}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-2">Features</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Smooth color transitions</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Remembers user preference</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Dark mode support</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Floating or inline display options</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Integrations Tab */}
            <TabsContent value="integrations" className="space-y-6">
              <h2 className="text-xl font-semibold">Shopify App Integration</h2>
              <p className="text-neutral-500">Connect your Shopify store to automatically generate product content</p>
              
              <ShopifyIntegration />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
      
      {/* AI Assistant Bubble */}
      <AiAssistant
        characterName="Flow"
        initialMessage="Hi there! I'm Flow, your AI assistant. How can I help you with content creation today?"
        contextualHints={[
          "Try exploring the gamification features",
          "Change the app theme to match your brand",
          "Connect your Shopify store for product content"
        ]}
      />
      
      {/* Floating Theme Switcher */}
      <ThemeSwitcher position="bottom-left" />
    </div>
  );
}