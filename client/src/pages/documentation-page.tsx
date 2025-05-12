import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  BookOpen, 
  Code, 
  Settings, 
  ExternalLink,
  Play,
  BarChart2,
  Share2,
  HelpCircle
} from "lucide-react";
import Layout from "@/components/layout/layout";

export default function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1 flex items-center">
              <BookOpen className="h-6 w-6 mr-2 text-primary" />
              Documentation
            </h1>
            <p className="text-muted-foreground">
              Comprehensive guides and references for using AutoContentFlow.
            </p>
          </div>
          
          <div className="w-full md:w-auto mt-4 md:mt-0 relative">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search documentation..."
                className="pl-8 w-full md:w-[260px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-lg">Documentation</CardTitle>
              </CardHeader>
              <CardContent className="px-2">
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="pr-4">
                    <div className="font-medium mb-2 text-sm text-muted-foreground px-3">Getting Started</div>
                    <div className="space-y-1 mb-4">
                      <Button variant="ghost" className="w-full justify-start text-left font-normal px-3">
                        Introduction
                      </Button>
                      <Button variant="ghost" className="w-full justify-start text-left font-normal px-3">
                        Quick Start Guide
                      </Button>
                      <Button variant="ghost" className="w-full justify-start text-left font-normal px-3">
                        System Requirements
                      </Button>
                    </div>
                    
                    <div className="font-medium mb-2 text-sm text-muted-foreground px-3">Key Features</div>
                    <div className="space-y-1 mb-4">
                      <Button variant="ghost" className="w-full justify-start text-left font-normal px-3">
                        Workflow Automation
                      </Button>
                      <Button variant="ghost" className="w-full justify-start text-left font-normal px-3">
                        AI Content Generation
                      </Button>
                      <Button variant="ghost" className="w-full justify-start text-left font-normal px-3">
                        Multi-Platform Publishing
                      </Button>
                      <Button variant="ghost" className="w-full justify-start text-left font-normal px-3">
                        Analytics & Insights
                      </Button>
                    </div>
                    
                    <div className="font-medium mb-2 text-sm text-muted-foreground px-3">Resources</div>
                    <div className="space-y-1 mb-4">
                      <Button variant="ghost" className="w-full justify-start text-left font-normal px-3">
                        API Reference
                      </Button>
                      <Button variant="ghost" className="w-full justify-start text-left font-normal px-3">
                        FAQ
                      </Button>
                      <Button variant="ghost" className="w-full justify-start text-left font-normal px-3">
                        Tutorials
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader className="py-4">
                <CardTitle className="text-lg">Additional Resources</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <a href="/api-reference" className="flex items-center text-sm text-primary hover:underline">
                  <Code className="h-4 w-4 mr-2" />
                  API Reference
                </a>
                <a href="/faq" className="flex items-center text-sm text-primary hover:underline">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  FAQ
                </a>
                <a href="#" className="flex items-center text-sm text-primary hover:underline">
                  <Play className="h-4 w-4 mr-2" />
                  Video Tutorials
                </a>
                <a href="#" className="flex items-center text-sm text-primary hover:underline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Developer Hub
                </a>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-2xl">Introduction to AutoContentFlow</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>Welcome to AutoContentFlow, a comprehensive AI-powered content management platform designed to streamline your social media content generation across multiple platforms.</p>
                
                <h2>What is AutoContentFlow?</h2>
                <p>AutoContentFlow is an all-in-one solution for content creators, marketers, and businesses looking to maintain a consistent and engaging presence across multiple social media platforms. Our platform combines the power of AI with intelligent workflow automation to help you create, schedule, publish, and analyze content with unprecedented efficiency.</p>
                
                <h2>Key Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 not-prose">
                  <div className="flex items-start">
                    <div className="rounded-full bg-primary/10 p-2 mr-3">
                      <Settings className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">Workflow Automation</h3>
                      <p className="text-neutral-700">Create custom content workflows for different platforms, campaigns, or content types.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="rounded-full bg-primary/10 p-2 mr-3">
                      <Code className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">AI Content Generation</h3>
                      <p className="text-neutral-700">Leverage advanced AI to generate high-quality, platform-specific content in seconds.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="rounded-full bg-primary/10 p-2 mr-3">
                      <Share2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">Multi-Platform Publishing</h3>
                      <p className="text-neutral-700">Publish seamlessly to all major social platforms with platform-specific optimizations.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="rounded-full bg-primary/10 p-2 mr-3">
                      <BarChart2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">Comprehensive Analytics</h3>
                      <p className="text-neutral-700">Track performance across platforms with insightful metrics and actionable recommendations.</p>
                    </div>
                  </div>
                </div>
                
                <h2>Getting Started</h2>
                <p>To get started with AutoContentFlow, follow these simple steps:</p>
                
                <ol>
                  <li><strong>Create an account</strong> - Sign up for a free account to explore the platform</li>
                  <li><strong>Connect your platforms</strong> - Link your social media accounts</li>
                  <li><strong>Create your first workflow</strong> - Set up your content generation and publishing flow</li>
                  <li><strong>Generate content</strong> - Use our AI to create engaging content</li>
                  <li><strong>Schedule and publish</strong> - Let automation handle the rest</li>
                </ol>
                
                <div className="bg-muted p-4 rounded-lg not-prose">
                  <h3 className="font-semibold mb-2">Was this page helpful?</h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">👍 Yes</Button>
                    <Button variant="outline" size="sm">👎 No</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}