import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Search, FileText, BookOpen, Code, HelpCircle, ChevronRight } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

// Sample documentation categories and articles
// In a real app, this would come from an API or CMS
const documentationCategories = [
  {
    id: "getting-started",
    name: "Getting Started",
    description: "Essential guides to begin with AutoContentFlow",
    icon: <BookOpen className="h-5 w-5" />,
    articles: [
      { id: "quickstart", title: "Quick Start Guide", updated: "2 days ago" },
      { id: "installation", title: "Installation", updated: "1 week ago" },
      { id: "account-setup", title: "Account Setup", updated: "2 weeks ago" },
      { id: "first-workflow", title: "Creating Your First Workflow", updated: "3 weeks ago" },
    ]
  },
  {
    id: "features",
    name: "Platform Features",
    description: "Learn about all AutoContentFlow capabilities",
    icon: <FileText className="h-5 w-5" />,
    articles: [
      { id: "ai-content", title: "AI Content Generation", updated: "1 day ago" },
      { id: "workflow-automation", title: "Workflow Automation", updated: "3 days ago" },
      { id: "analytics", title: "Analytics Dashboard", updated: "1 week ago" },
      { id: "publishing", title: "Multi-Platform Publishing", updated: "2 weeks ago" },
    ]
  },
  {
    id: "integration",
    name: "Platform Integration",
    description: "Connect with social media and other services",
    icon: <Code className="h-5 w-5" />,
    articles: [
      { id: "twitter-integration", title: "Twitter Integration", updated: "4 days ago" },
      { id: "facebook-integration", title: "Facebook Integration", updated: "5 days ago" },
      { id: "instagram-integration", title: "Instagram Integration", updated: "1 week ago" },
      { id: "linkedin-integration", title: "LinkedIn Integration", updated: "2 weeks ago" },
    ]
  },
  {
    id: "troubleshooting",
    name: "Troubleshooting",
    description: "Solve common issues and get help",
    icon: <HelpCircle className="h-5 w-5" />,
    articles: [
      { id: "common-issues", title: "Common Issues", updated: "3 days ago" },
      { id: "error-codes", title: "Error Codes", updated: "1 week ago" },
      { id: "contact-support", title: "Contacting Support", updated: "2 weeks ago" },
      { id: "faq", title: "Frequently Asked Questions", updated: "3 weeks ago" },
    ]
  }
];

// Sample article content for demo
const articleContent = `
# Quick Start Guide

## Introduction
Welcome to AutoContentFlow! This guide will help you get started with our platform and start creating automated content workflows in minutes.

## Prerequisites
- An active AutoContentFlow account
- Access to at least one social media platform account
- Basic understanding of content creation principles

## Step 1: Set up your account
After signing up, complete your profile by adding your name, company, and preferred settings. This information helps us personalize your experience.

## Step 2: Connect social media platforms
Navigate to the Platforms page and connect your social media accounts. We support Twitter, Facebook, Instagram, LinkedIn, and more.

## Step 3: Create your first workflow
1. Go to the Workflows page
2. Click on "Create New Workflow"
3. Select the platforms you want to publish to
4. Configure your content parameters
5. Set your publishing schedule
6. Save your workflow

## Step 4: Generate content
Use our AI-powered content generator to create engaging posts based on your topics and preferences.

## Step 5: Review and approve
Before publishing, review the generated content and make any necessary edits.

## Step 6: Monitor performance
Use the Analytics Dashboard to track the performance of your content across platforms.

## Next steps
- Explore advanced workflow features
- Set up content templates
- Configure automatic responses
- Integrate with other services using our API

Need more help? Contact our support team at support@autocontentflow.com
`;

export default function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("getting-started");
  const [selectedArticle, setSelectedArticle] = useState("quickstart");
  
  // Filter articles based on search query
  const filteredCategories = searchQuery 
    ? documentationCategories.map(category => ({
        ...category,
        articles: category.articles.filter(article => 
          article.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.articles.length > 0)
    : documentationCategories;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto py-8 px-4">
        <div className="flex flex-col mb-8">
          <h1 className="text-3xl font-bold">Documentation</h1>
          <p className="text-muted-foreground">Learn how to use AutoContentFlow effectively</p>
          
          <div className="flex max-w-md mt-4">
            <div className="relative w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documentation..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button className="ml-2" variant="outline">
              Search
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Documentation Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Documentation</CardTitle>
                <CardDescription>Browse all topics</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="px-4 pb-4">
                    {filteredCategories.map((category) => (
                      <div key={category.id} className="mb-6">
                        <div 
                          className="flex items-center mb-2 cursor-pointer"
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          <div className="mr-2">{category.icon}</div>
                          <h3 className="font-medium text-sm">{category.name}</h3>
                        </div>
                        <ul className="pl-7 space-y-1">
                          {category.articles.map((article) => (
                            <li 
                              key={article.id}
                              className={`text-sm py-1 px-2 rounded-md cursor-pointer hover:bg-neutral-100 ${
                                selectedCategory === category.id && selectedArticle === article.id
                                  ? "bg-neutral-100 text-primary font-medium"
                                  : "text-neutral-700"
                              }`}
                              onClick={() => {
                                setSelectedCategory(category.id);
                                setSelectedArticle(article.id);
                              }}
                            >
                              {article.title}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
          
          {/* Documentation Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>
                      {documentationCategories
                        .find(c => c.id === selectedCategory)
                        ?.articles.find(a => a.id === selectedArticle)?.title || "Documentation"}
                    </CardTitle>
                    <CardDescription>
                      Last updated: {documentationCategories
                        .find(c => c.id === selectedCategory)
                        ?.articles.find(a => a.id === selectedArticle)?.updated || "Recently"}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {/* This would typically be rendered markdown from a CMS */}
                  <h1>Quick Start Guide</h1>
                  
                  <h2>Introduction</h2>
                  <p>Welcome to AutoContentFlow! This guide will help you get started with our platform and start creating automated content workflows in minutes.</p>
                  
                  <h2>Prerequisites</h2>
                  <ul>
                    <li>An active AutoContentFlow account</li>
                    <li>Access to at least one social media platform account</li>
                    <li>Basic understanding of content creation principles</li>
                  </ul>
                  
                  <h2>Step 1: Set up your account</h2>
                  <p>After signing up, complete your profile by adding your name, company, and preferred settings. This information helps us personalize your experience.</p>
                  
                  <h2>Step 2: Connect social media platforms</h2>
                  <p>Navigate to the Platforms page and connect your social media accounts. We support Twitter, Facebook, Instagram, LinkedIn, and more.</p>
                  
                  <h2>Step 3: Create your first workflow</h2>
                  <ol>
                    <li>Go to the Workflows page</li>
                    <li>Click on "Create New Workflow"</li>
                    <li>Select the platforms you want to publish to</li>
                    <li>Configure your content parameters</li>
                    <li>Set your publishing schedule</li>
                    <li>Save your workflow</li>
                  </ol>
                  
                  <h2>Step 4: Generate content</h2>
                  <p>Use our AI-powered content generator to create engaging posts based on your topics and preferences.</p>
                  
                  <h2>Step 5: Review and approve</h2>
                  <p>Before publishing, review the generated content and make any necessary edits.</p>
                  
                  <h2>Step 6: Monitor performance</h2>
                  <p>Use the Analytics Dashboard to track the performance of your content across platforms.</p>
                  
                  <h2>Next steps</h2>
                  <ul>
                    <li>Explore advanced workflow features</li>
                    <li>Set up content templates</li>
                    <li>Configure automatic responses</li>
                    <li>Integrate with other services using our API</li>
                  </ul>
                  
                  <p className="text-muted-foreground mt-8">
                    Need more help? Contact our support team at <a href="mailto:support@autocontentflow.com" className="text-primary">support@autocontentflow.com</a>
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-between mt-6">
              <Button variant="outline" className="flex items-center">
                <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
                Previous Article
              </Button>
              <Button variant="outline" className="flex items-center">
                Next Article
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Was this article helpful?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Button variant="outline">Yes, it helped</Button>
                  <Button variant="outline">No, I need more help</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}