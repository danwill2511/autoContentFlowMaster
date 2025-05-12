import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  ChevronRight, 
  BookOpen, 
  Code, 
  Settings, 
  ArrowRight, 
  ExternalLink,
  Play,
  LayoutGrid,
  BarChart2,
  Workflow,
  Share2,
  Copy,
  Check,
  HelpCircle,
  Users
} from "lucide-react";
import Layout from "@/components/layout/layout";

// Sample table of contents data
const tableOfContents = [
  {
    title: "Getting Started",
    id: "getting-started",
    items: [
      { title: "Introduction", id: "introduction" },
      { title: "Quick Start Guide", id: "quick-start" },
      { title: "System Requirements", id: "system-requirements" },
      { title: "Installation", id: "installation" }
    ]
  },
  {
    title: "Key Concepts",
    id: "key-concepts",
    items: [
      { title: "Content Workflows", id: "content-workflows" },
      { title: "Platform Connections", id: "platform-connections" },
      { title: "Content Generation", id: "content-generation" },
      { title: "Scheduling & Publishing", id: "scheduling-publishing" },
      { title: "Analytics", id: "analytics" }
    ]
  },
  {
    title: "Using the Platform",
    id: "using-platform",
    items: [
      { title: "Dashboard Overview", id: "dashboard-overview" },
      { title: "Creating Workflows", id: "creating-workflows" },
      { title: "Managing Platforms", id: "managing-platforms" },
      { title: "Content Library", id: "content-library" },
      { title: "Analytics Dashboard", id: "analytics-dashboard" }
    ]
  },
  {
    title: "Advanced Features",
    id: "advanced-features",
    items: [
      { title: "AI Content Wizard", id: "ai-content-wizard" },
      { title: "Custom Templates", id: "custom-templates" },
      { title: "Content Flow Visualizer", id: "content-flow-visualizer" },
      { title: "Posting Time Optimizer", id: "posting-time-optimizer" },
      { title: "Content Recycling", id: "content-recycling" }
    ]
  },
  {
    title: "Integrations",
    id: "integrations",
    items: [
      { title: "Social Media Platforms", id: "social-media-platforms" },
      { title: "CMS Integrations", id: "cms-integrations" },
      { title: "Analytics Tools", id: "analytics-tools" },
      { title: "Custom Webhooks", id: "custom-webhooks" }
    ]
  },
  {
    title: "Account Management",
    id: "account-management",
    items: [
      { title: "User Profiles", id: "user-profiles" },
      { title: "Teams & Collaboration", id: "teams-collaboration" },
      { title: "Subscription Plans", id: "subscription-plans" },
      { title: "Billing & Invoices", id: "billing-invoices" }
    ]
  },
  {
    title: "Troubleshooting",
    id: "troubleshooting",
    items: [
      { title: "Common Issues", id: "common-issues" },
      { title: "Platform Connection Errors", id: "platform-connection-errors" },
      { title: "Content Publishing Issues", id: "content-publishing-issues" },
      { title: "Error Messages", id: "error-messages" }
    ]
  },
  {
    title: "API Reference",
    id: "api-reference",
    items: [
      { title: "API Overview", id: "api-overview" },
      { title: "Authentication", id: "api-authentication" },
      { title: "Resources & Endpoints", id: "resources-endpoints" },
      { title: "Rate Limits", id: "rate-limits" }
    ]
  }
];

// Sample documentation content
const documentationContent = {
  "introduction": {
    title: "Introduction to AutoContentFlow",
    content: `
      <h1>Introduction to AutoContentFlow</h1>
      <div class="text-lg text-neutral-700 mb-6">
        <p>Welcome to AutoContentFlow, a comprehensive AI-powered content management platform designed to streamline your social media content generation across multiple platforms.</p>
      </div>
      
      <h2 class="text-2xl font-bold mb-4">What is AutoContentFlow?</h2>
      <p class="mb-4">AutoContentFlow is an all-in-one solution for content creators, marketers, and businesses looking to maintain a consistent and engaging presence across multiple social media platforms. Our platform combines the power of AI with intelligent workflow automation to help you create, schedule, publish, and analyze content with unprecedented efficiency.</p>
      
      <h2 class="text-2xl font-bold mb-4">Key Features</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="flex items-start">
          <div class="rounded-full bg-primary/10 p-2 mr-3">
            <Workflow class="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 class="font-bold mb-1">Workflow Automation</h3>
            <p class="text-neutral-700">Create custom content workflows for different platforms, campaigns, or content types.</p>
          </div>
        </div>
        
        <div class="flex items-start">
          <div class="rounded-full bg-primary/10 p-2 mr-3">
            <Code class="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 class="font-bold mb-1">AI Content Generation</h3>
            <p class="text-neutral-700">Leverage advanced AI to generate high-quality, platform-specific content in seconds.</p>
          </div>
        </div>
        
        <div class="flex items-start">
          <div class="rounded-full bg-primary/10 p-2 mr-3">
            <Share2 class="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 class="font-bold mb-1">Multi-Platform Publishing</h3>
            <p class="text-neutral-700">Publish seamlessly to all major social platforms with platform-specific optimizations.</p>
          </div>
        </div>
        
        <div class="flex items-start">
          <div class="rounded-full bg-primary/10 p-2 mr-3">
            <BarChart2 class="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 class="font-bold mb-1">Comprehensive Analytics</h3>
            <p class="text-neutral-700">Track performance across platforms with insightful metrics and actionable recommendations.</p>
          </div>
        </div>
      </div>
      
      <h2 class="text-2xl font-bold mb-4">Who It's For</h2>
      <p class="mb-6">AutoContentFlow is designed for:</p>
      <ul class="list-disc pl-5 space-y-2 mb-6">
        <li><strong>Content Creators</strong> - Individuals managing their personal brand across platforms</li>
        <li><strong>Social Media Managers</strong> - Professionals handling content for businesses or clients</li>
        <li><strong>Marketing Teams</strong> - Teams collaborating on content strategies and campaigns</li>
        <li><strong>Small Businesses</strong> - Organizations looking to maintain an active social presence without a dedicated team</li>
        <li><strong>Agencies</strong> - Marketing agencies managing multiple client accounts and campaigns</li>
      </ul>
      
      <h2 class="text-2xl font-bold mb-4">Getting Started</h2>
      <p class="mb-4">Ready to transform your content strategy? This documentation will guide you through every aspect of using AutoContentFlow, from basic setup to advanced features.</p>
      <p class="mb-6">We recommend starting with the <a href="#quick-start" class="text-primary hover:underline">Quick Start Guide</a> to get up and running quickly.</p>
      
      <div class="bg-neutral-100 p-6 rounded-lg">
        <h3 class="text-xl font-bold mb-3">Need Help?</h3>
        <p class="mb-4">If you can't find what you're looking for in the documentation, our support team is here to help.</p>
        <div class="flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <a href="/contact">Contact Support</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/faq">View FAQ</a>
          </Button>
        </div>
      </div>
    `,
  },
  "quick-start": {
    title: "Quick Start Guide",
    content: `
      <h1>Quick Start Guide</h1>
      <p class="text-lg text-neutral-700 mb-6">Get up and running with AutoContentFlow in just a few minutes with this step-by-step guide.</p>
      
      <div class="relative mb-10">
        <div class="absolute top-0 bottom-0 left-5 w-0.5 bg-neutral-200"></div>
        
        <div class="relative pl-10 pb-8">
          <div class="absolute left-0 rounded-full bg-primary text-white flex items-center justify-center w-10 h-10">1</div>
          <h2 class="text-xl font-bold mb-2">Create Your Account</h2>
          <p class="mb-3">Start by signing up for an AutoContentFlow account.</p>
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <h3 class="font-semibold">Sign Up Options</h3>
                <ul class="list-disc pl-5 space-y-1">
                  <li>Create an account with your email and password</li>
                  <li>Sign up with Google, Twitter, or Facebook</li>
                </ul>
              </div>
              <div class="flex items-center text-sm text-neutral-600 border-t pt-3">
                <div class="mr-auto">
                  <span>Ready to get started?</span>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <a href="/auth">Sign Up Now</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div class="relative pl-10 pb-8">
          <div class="absolute left-0 rounded-full bg-primary text-white flex items-center justify-center w-10 h-10">2</div>
          <h2 class="text-xl font-bold mb-2">Connect Your Platforms</h2>
          <p class="mb-3">Link your social media accounts to AutoContentFlow.</p>
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <h3 class="font-semibold">Supported Platforms</h3>
                <div class="grid grid-cols-2 gap-2 mt-2">
                  <div class="flex items-center">
                    <Badge variant="outline" className="mr-2">Twitter</Badge>
                  </div>
                  <div class="flex items-center">
                    <Badge variant="outline" className="mr-2">Instagram</Badge>
                  </div>
                  <div class="flex items-center">
                    <Badge variant="outline" className="mr-2">LinkedIn</Badge>
                  </div>
                  <div class="flex items-center">
                    <Badge variant="outline" className="mr-2">Facebook</Badge>
                  </div>
                  <div class="flex items-center">
                    <Badge variant="outline" className="mr-2">Pinterest</Badge>
                  </div>
                  <div class="flex items-center">
                    <Badge variant="outline" className="mr-2">YouTube</Badge>
                  </div>
                </div>
              </div>
              <div class="flex items-center text-sm text-neutral-600 border-t pt-3">
                <div class="mr-auto">
                  <span>Need help with connections?</span>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <a href="#platform-connections">Platform Guide</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div class="relative pl-10 pb-8">
          <div class="absolute left-0 rounded-full bg-primary text-white flex items-center justify-center w-10 h-10">3</div>
          <h2 class="text-xl font-bold mb-2">Create Your First Workflow</h2>
          <p class="mb-3">Set up a content workflow for automatic content generation and publishing.</p>
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <h3 class="font-semibold">Workflow Setup Steps</h3>
                <ol class="list-decimal pl-5 space-y-1">
                  <li>Name your workflow (e.g., "Daily Twitter Posts")</li>
                  <li>Select target platforms</li>
                  <li>Define content parameters (topics, tone, etc.)</li>
                  <li>Set publishing schedule</li>
                  <li>Enable or disable approval steps</li>
                </ol>
              </div>
              <div class="flex items-center text-sm text-neutral-600 border-t pt-3">
                <div class="mr-auto">
                  <span>Need more details?</span>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <a href="#creating-workflows">Workflow Guide</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div class="relative pl-10 pb-8">
          <div class="absolute left-0 rounded-full bg-primary text-white flex items-center justify-center w-10 h-10">4</div>
          <h2 class="text-xl font-bold mb-2">Generate Your First Content</h2>
          <p class="mb-3">Use the AI content generator to create your first piece of content.</p>
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <h3 class="font-semibold">Content Generation Options</h3>
                <ul class="list-disc pl-5 space-y-1">
                  <li>Use the Quick Generate feature</li>
                  <li>Try the AI Content Wizard for guided creation</li>
                  <li>Choose from templates in the Content Library</li>
                </ul>
              </div>
              <div class="flex items-center text-sm text-neutral-600 border-t pt-3">
                <div class="mr-auto">
                  <span>Learn about AI options</span>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <a href="#content-generation">Generation Guide</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div class="relative pl-10">
          <div class="absolute left-0 rounded-full bg-primary text-white flex items-center justify-center w-10 h-10">5</div>
          <h2 class="text-xl font-bold mb-2">Schedule and Publish</h2>
          <p class="mb-3">Set your content to publish automatically or manually approve before posting.</p>
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <h3 class="font-semibold">Publishing Options</h3>
                <ul class="list-disc pl-5 space-y-1">
                  <li>Schedule for optimal posting times</li>
                  <li>Set up recurring schedules</li>
                  <li>Use the manual approval queue</li>
                  <li>Publish immediately</li>
                </ul>
              </div>
              <div class="flex items-center text-sm text-neutral-600 border-t pt-3">
                <div class="mr-auto">
                  <span>Publishing details</span>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <a href="#scheduling-publishing">Publishing Guide</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <h2 class="text-2xl font-bold mb-4">Next Steps</h2>
      <p class="mb-4">After completing these basic steps, you'll have your first content workflow up and running! Here are some additional resources to help you get the most out of AutoContentFlow:</p>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Explore Advanced Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul class="space-y-2">
              <li>
                <a href="#content-flow-visualizer" class="flex items-center text-primary hover:underline">
                  <ChevronRight className="h-4 w-4 mr-1" />
                  Content Flow Visualizer
                </a>
              </li>
              <li>
                <a href="#posting-time-optimizer" class="flex items-center text-primary hover:underline">
                  <ChevronRight className="h-4 w-4 mr-1" />
                  Posting Time Optimizer
                </a>
              </li>
              <li>
                <a href="#custom-templates" class="flex items-center text-primary hover:underline">
                  <ChevronRight className="h-4 w-4 mr-1" />
                  Custom Templates
                </a>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">View Video Tutorials</CardTitle>
          </CardHeader>
          <CardContent>
            <ul class="space-y-2">
              <li>
                <a href="#" class="flex items-center text-primary hover:underline">
                  <Play className="h-4 w-4 mr-1" />
                  Getting Started Tutorial
                </a>
              </li>
              <li>
                <a href="#" class="flex items-center text-primary hover:underline">
                  <Play className="h-4 w-4 mr-1" />
                  Advanced Workflow Setup
                </a>
              </li>
              <li>
                <a href="#" class="flex items-center text-primary hover:underline">
                  <Play className="h-4 w-4 mr-1" />
                  Analytics Dashboard Tour
                </a>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <div class="bg-primary/5 p-6 rounded-lg">
        <h3 class="text-xl font-bold mb-3">Ready to Go Pro?</h3>
        <p class="mb-4">Unlock the full potential of AutoContentFlow with our premium plans.</p>
        <Button asChild>
          <a href="/subscription">View Subscription Plans</a>
        </Button>
      </div>
    `,
  },
  "content-workflows": {
    title: "Content Workflows",
    content: `
      <h1>Content Workflows</h1>
      <p class="text-lg text-neutral-700 mb-6">Learn how to create and optimize automated content workflows that save time and maintain consistency across your platforms.</p>
      
      <h2 class="text-2xl font-bold mb-4">What is a Content Workflow?</h2>
      <p class="mb-4">A content workflow in AutoContentFlow is a customizable sequence of automated steps that handle the creation, optimization, scheduling, and publishing of content across your connected platforms.</p>
      <p class="mb-6">Think of workflows as your virtual content team that works 24/7 to keep your social media presence active and engaging.</p>
      
      <h2 class="text-2xl font-bold mb-4">Workflow Components</h2>
      <div class="mb-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <div class="flex items-center">
                <div class="rounded-full bg-primary/10 p-2 mr-3">
                  <Code className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>Content Generation</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p class="text-neutral-700">Define how content should be created: AI-generated, from templates, or a mix of both. Set parameters for tone, style, and topics.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div class="flex items-center">
                <div class="rounded-full bg-primary/10 p-2 mr-3">
                  <LayoutGrid className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>Platform Selection</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p class="text-neutral-700">Choose which connected platforms should receive content from this workflow. Each platform can have its own content adaptation settings.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div class="flex items-center">
                <div class="rounded-full bg-primary/10 p-2 mr-3">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>Scheduling Rules</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p class="text-neutral-700">Set when and how often content should be published. Options include fixed times, optimal time detection, frequency settings, and more.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div class="flex items-center">
                <div class="rounded-full bg-primary/10 p-2 mr-3">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>Approval Process</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p class="text-neutral-700">Define whether content needs manual review before publishing or can be automatically posted. Set up approval assignments and notifications.</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <h2 class="text-2xl font-bold mb-4">Workflow Types</h2>
      <p class="mb-4">AutoContentFlow supports various workflow types to match different content strategies:</p>
      
      <div class="space-y-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Regular Posting Workflow</CardTitle>
            <CardDescription>Maintain a consistent posting schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <p class="text-neutral-700 mb-3">Ideal for maintaining regular activity on your platforms with consistent, scheduled content.</p>
            <p class="text-neutral-700 mb-3"><strong>Example:</strong> "Daily Twitter Tips" workflow that posts one AI-generated tip about your industry every day at optimal engagement times.</p>
            <div class="text-sm text-neutral-600 border-t pt-3">
              <strong>Best for:</strong> Core content strategy, maintaining consistent presence
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Campaign Workflow</CardTitle>
            <CardDescription>Time-limited, focused content sequences</CardDescription>
          </CardHeader>
          <CardContent>
            <p class="text-neutral-700 mb-3">Designed for specific marketing campaigns with defined start and end dates.</p>
            <p class="text-neutral-700 mb-3"><strong>Example:</strong> "Product Launch" workflow that creates a sequence of teaser posts, announcement content, and follow-up materials across multiple platforms.</p>
            <div class="text-sm text-neutral-600 border-t pt-3">
              <strong>Best for:</strong> Product launches, promotions, events, seasonal campaigns
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Content Repurposing Workflow</CardTitle>
            <CardDescription>Transform existing content for multiple uses</CardDescription>
          </CardHeader>
          <CardContent>
            <p class="text-neutral-700 mb-3">Takes content from one source and adapts it for multiple platforms or formats.</p>
            <p class="text-neutral-700 mb-3"><strong>Example:</strong> "Blog Repurposing" workflow that takes your latest blog post and creates platform-specific posts across Twitter, LinkedIn, Facebook, and Instagram.</p>
            <div class="text-sm text-neutral-600 border-t pt-3">
              <strong>Best for:</strong> Content maximization, cross-platform promotion
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Curated Content Workflow</CardTitle>
            <CardDescription>Share industry news and third-party content</CardDescription>
          </CardHeader>
          <CardContent>
            <p class="text-neutral-700 mb-3">Focuses on sharing relevant content from external sources with your audience.</p>
            <p class="text-neutral-700 mb-3"><strong>Example:</strong> "Industry News" workflow that monitors RSS feeds for relevant articles and creates social posts with your commentary.</p>
            <div class="text-sm text-neutral-600 border-t pt-3">
              <strong>Best for:</strong> Thought leadership, community building, increasing engagement
            </div>
          </CardContent>
        </Card>
      </div>
      
      <h2 class="text-2xl font-bold mb-4">Creating Your First Workflow</h2>
      <p class="mb-4">Ready to create your first workflow? Check out our detailed <a href="#creating-workflows" class="text-primary hover:underline">workflow creation guide</a> for step-by-step instructions.</p>
      
      <div class="bg-primary/5 p-6 rounded-lg mb-8">
        <h3 class="text-xl font-bold mb-3">Pro Tip: Workflow Templates</h3>
        <p class="mb-4">Save time by starting with our pre-built workflow templates designed for common content strategies. Templates provide proven content structures and scheduling patterns you can customize for your needs.</p>
        <Button variant="outline" asChild>
          <a href="/content-library">Browse Workflow Templates</a>
        </Button>
      </div>
      
      <h2 class="text-2xl font-bold mb-4">Further Reading</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <a href="#content-flow-visualizer" class="flex items-center text-primary hover:underline">
              <ArrowRight className="h-4 w-4 mr-2" />
              Content Flow Visualizer
            </a>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <a href="#scheduling-publishing" class="flex items-center text-primary hover:underline">
              <ArrowRight className="h-4 w-4 mr-2" />
              Scheduling & Publishing
            </a>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <a href="#analytics" class="flex items-center text-primary hover:underline">
              <ArrowRight className="h-4 w-4 mr-2" />
              Analytics & Insights
            </a>
          </CardContent>
        </Card>
      </div>
    `,
  }
};

export default function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("introduction");
  const [copiedText, setCopiedText] = useState("");
  
  // Copy to clipboard function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(""), 2000);
  };
  
  // Function to create HTML from content string
  const createMarkup = (htmlContent: string) => {
    return { __html: htmlContent };
  };
  
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1 flex items-center">
              <BookOpen className="h-6 w-6 mr-2 text-primary" />
              Documentation
            </h1>
            <p className="text-muted-foreground">
              Everything you need to know about AutoContentFlow
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documentation..."
                className="pl-8 w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-lg">Table of Contents</CardTitle>
                </CardHeader>
                <CardContent className="p-0 max-h-[calc(100vh-250px)]">
                  <ScrollArea className="h-full">
                    <div className="p-4">
                      {tableOfContents.map((section) => (
                        <div key={section.id} className="mb-4">
                          <h3 className="text-sm font-bold text-neutral-700 mb-2">
                            {section.title}
                          </h3>
                          <ul className="space-y-1">
                            {section.items.map((item) => (
                              <li key={item.id}>
                                <a
                                  href={`#${item.id}`}
                                  className={`text-sm block py-1 px-2 rounded ${
                                    activeSection === item.id 
                                      ? "bg-primary text-primary-foreground" 
                                      : "hover:bg-neutral-100"
                                  }`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setActiveSection(item.id);
                                  }}
                                >
                                  {item.title}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
              
              <Card>
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
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-6">
                {/* Content for the selected section */}
                {documentationContent[activeSection as keyof typeof documentationContent] && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <Badge variant="outline" className="text-xs">
                        Last updated: April 25, 2025
                      </Badge>
                      
                      <div className="flex items-center">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs flex items-center"
                          onClick={() => copyToClipboard(window.location.href + "#" + activeSection)}
                        >
                          {copiedText === window.location.href + "#" + activeSection ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 mr-1" />
                              Copy Link
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div 
                      className="prose prose-neutral max-w-none"
                      dangerouslySetInnerHTML={createMarkup(documentationContent[activeSection as keyof typeof documentationContent].content)} 
                    />
                    
                    <div className="flex justify-between items-center mt-12 pt-4 border-t">
                      <Button variant="outline" size="sm" disabled={activeSection === "introduction"}>
                        Previous
                      </Button>
                      <Button variant="outline" size="sm">
                        Next
                      </Button>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t">
                      <h3 className="text-xl font-bold mb-4">Was this page helpful?</h3>
                      <div className="flex space-x-4">
                        <Button variant="outline">
                          👍 Yes
                        </Button>
                        <Button variant="outline">
                          👎 No
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}