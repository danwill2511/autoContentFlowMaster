import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, Clock, Search, Tag, Users, ArrowRight, Bookmark, Share2, Eye, MessagesSquare } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

// Sample blog posts data
// In a real app, this would come from an API or CMS
const blogPosts = [
  {
    id: 1,
    title: "Maximizing Engagement with AI-Generated Content: Best Practices",
    excerpt: "Learn how to leverage AI-generated content effectively to boost engagement across all your social media platforms while maintaining your authentic brand voice.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec auctor, nisl eget consectetur sagittis, nisl nunc ultricies nisi, vitae ultricies nisl nunc eget nisl. Donec auctor, nisl eget consectetur sagittis, nisl nunc ultricies nisi, vitae ultricies nisl nunc eget nisl.",
    category: "Content Strategy",
    tags: ["AI Content", "Engagement", "Best Practices"],
    author: {
      name: "Sarah Johnson",
      role: "Content Strategist",
      avatar: "SJ"
    },
    publishDate: "2025-04-28",
    readTime: 8,
    featured: true,
    image: "https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    stats: {
      views: 3502,
      comments: 47,
      shares: 134
    }
  },
  {
    id: 2,
    title: "The Future of Social Media Content: Trends to Watch in 2025",
    excerpt: "Explore emerging trends in social media content creation and how AI technologies like AutoContentFlow are reshaping how brands connect with their audiences.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec auctor, nisl eget consectetur sagittis, nisl nunc ultricies nisi, vitae ultricies nisl nunc eget nisl. Donec auctor, nisl eget consectetur sagittis, nisl nunc ultricies nisi, vitae ultricies nisl nunc eget nisl.",
    category: "Industry Trends",
    tags: ["Trends", "Future of Content", "Social Media"],
    author: {
      name: "Michael Chen",
      role: "CTO",
      avatar: "MC"
    },
    publishDate: "2025-04-15",
    readTime: 10,
    featured: true,
    image: "https://images.unsplash.com/photo-1560472355-536de3962603?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    stats: {
      views: 5823,
      comments: 86,
      shares: 287
    }
  },
  {
    id: 3,
    title: "Case Study: How Brand X Increased Engagement by 320% with Automated Workflows",
    excerpt: "Discover how Brand X revolutionized their content strategy using automated workflows, resulting in a massive increase in engagement and conversion rates.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec auctor, nisl eget consectetur sagittis, nisl nunc ultricies nisi, vitae ultricies nisl nunc eget nisl. Donec auctor, nisl eget consectetur sagittis, nisl nunc ultricies nisi, vitae ultricies nisl nunc eget nisl.",
    category: "Case Studies",
    tags: ["Success Stories", "Workflow Automation", "ROI"],
    author: {
      name: "Aisha Patel",
      role: "Head of Product",
      avatar: "AP"
    },
    publishDate: "2025-04-03",
    readTime: 7,
    featured: false,
    image: "https://images.unsplash.com/photo-1590650046871-92c887180603?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    stats: {
      views: 2791,
      comments: 35,
      shares: 112
    }
  },
  {
    id: 4,
    title: "Content Analytics: Key Metrics Every Creator Should Track",
    excerpt: "Learn about the essential metrics that can help you measure the success of your content strategy and make data-driven decisions for future campaigns.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec auctor, nisl eget consectetur sagittis, nisl nunc ultricies nisi, vitae ultricies nisl nunc eget nisl. Donec auctor, nisl eget consectetur sagittis, nisl nunc ultricies nisi, vitae ultricies nisl nunc eget nisl.",
    category: "Analytics",
    tags: ["Metrics", "Data Analysis", "Performance"],
    author: {
      name: "David Rodriguez",
      role: "Head of Marketing",
      avatar: "DR"
    },
    publishDate: "2025-03-22",
    readTime: 9,
    featured: false,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    stats: {
      views: 3128,
      comments: 29,
      shares: 98
    }
  },
  {
    id: 5,
    title: "Creating a Consistent Cross-Platform Content Strategy",
    excerpt: "Explore strategies for maintaining a consistent brand voice and message across multiple social media platforms while adapting to each platform's unique requirements.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec auctor, nisl eget consectetur sagittis, nisl nunc ultricies nisi, vitae ultricies nisl nunc eget nisl. Donec auctor, nisl eget consectetur sagittis, nisl nunc ultricies nisi, vitae ultricies nisl nunc eget nisl.",
    category: "Content Strategy",
    tags: ["Cross-Platform", "Brand Consistency", "Social Media"],
    author: {
      name: "Emma Wilson",
      role: "Lead AI Engineer",
      avatar: "EW"
    },
    publishDate: "2025-03-15",
    readTime: 6,
    featured: false,
    image: "https://images.unsplash.com/photo-1553028826-f4804a6dba3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    stats: {
      views: 2487,
      comments: 23,
      shares: 87
    }
  },
  {
    id: 6,
    title: "The Psychology Behind Viral Content: What Makes Content Shareable",
    excerpt: "Delve into the psychological factors that make certain content go viral and learn how to apply these principles to your own content strategy.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec auctor, nisl eget consectetur sagittis, nisl nunc ultricies nisi, vitae ultricies nisl nunc eget nisl. Donec auctor, nisl eget consectetur sagittis, nisl nunc ultricies nisi, vitae ultricies nisl nunc eget nisl.",
    category: "Content Psychology",
    tags: ["Viral Content", "Psychology", "User Behavior"],
    author: {
      name: "James Thompson",
      role: "Customer Success Director",
      avatar: "JT"
    },
    publishDate: "2025-02-28",
    readTime: 11,
    featured: false,
    image: "https://images.unsplash.com/photo-1567883380014-0b8aa24e25e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    stats: {
      views: 4215,
      comments: 63,
      shares: 201
    }
  }
];

// Unique categories from blog posts
const categories = ["All", ...new Set(blogPosts.map(post => post.category))];

// Unique tags from blog posts
const tags = [...new Set(blogPosts.flatMap(post => post.tags))];

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTag, setSelectedTag] = useState("All");
  
  // Filter posts based on search, category, and tag
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = searchQuery === "" || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    
    const matchesTag = selectedTag === "All" || post.tags.includes(selectedTag);
    
    return matchesSearch && matchesCategory && matchesTag;
  });
  
  // Featured posts
  const featuredPosts = blogPosts.filter(post => post.featured);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto py-8 px-4">
        {/* Hero section */}
        <section className="mb-12">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h1 className="text-4xl font-bold mb-4">AutoContentFlow Blog</h1>
            <p className="text-lg text-neutral-700">
              Insights, tips, and trends on content creation, automation, and social media marketing
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className="relative w-full md:w-auto md:flex-1 max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Tags</SelectItem>
                  {tags.map(tag => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>
        
        {/* Featured posts section */}
        {featuredPosts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Featured Articles</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden">
                  <div 
                    className="h-48 bg-cover bg-center" 
                    style={{ backgroundImage: `url(${post.image})` }}
                  ></div>
                  <CardContent className="pt-6">
                    <Badge className="mb-2">{post.category}</Badge>
                    <h3 className="text-xl font-bold mb-2 hover:text-primary">
                      <a href={`/blog/${post.id}`}>{post.title}</a>
                    </h3>
                    <p className="text-neutral-700 mb-4">{post.excerpt}</p>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={`/avatars/${post.author.avatar}.png`} alt={post.author.name} />
                          <AvatarFallback>{post.author.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{post.author.name}</div>
                          <div className="text-xs text-neutral-500">{post.author.role}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-sm text-neutral-500">
                        <CalendarDays className="h-4 w-4 mr-1" />
                        {new Date(post.publishDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                        <Separator orientation="vertical" className="h-4 mx-2" />
                        <Clock className="h-4 w-4 mr-1" />
                        {post.readTime} min read
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
        
        {/* All posts section */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Latest Articles</h2>
          
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden flex flex-col">
                  <div 
                    className="h-48 bg-cover bg-center" 
                    style={{ backgroundImage: `url(${post.image})` }}
                  ></div>
                  <CardContent className="pt-6 pb-2 flex-grow">
                    <Badge className="mb-2">{post.category}</Badge>
                    <h3 className="text-lg font-bold mb-2 hover:text-primary line-clamp-2">
                      <a href={`/blog/${post.id}`}>{post.title}</a>
                    </h3>
                    <p className="text-neutral-600 mb-4 line-clamp-3">{post.excerpt}</p>
                    
                    <div className="flex items-center mt-auto">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={`/avatars/${post.author.avatar}.png`} alt={post.author.name} />
                        <AvatarFallback>{post.author.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">{post.author.name}</div>
                        <div className="text-xs text-neutral-500">
                          {new Date(post.publishDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 pb-4 px-6 flex justify-between">
                    <div className="flex items-center text-sm text-neutral-500">
                      <Eye className="h-4 w-4 mr-1" />
                      {post.stats.views.toLocaleString()}
                      <Separator orientation="vertical" className="h-3 mx-2" />
                      <MessagesSquare className="h-4 w-4 mr-1" />
                      {post.stats.comments}
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Bookmark className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">No articles found</h3>
              <p className="text-muted-foreground mb-6">
                We couldn't find any articles matching your search criteria.
              </p>
              <Button onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setSelectedTag("All");
              }}>
                Clear Filters
              </Button>
            </div>
          )}
          
          <Pagination className="mt-12">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </section>
        
        {/* Newsletter section */}
        <section className="mt-16 bg-primary/5 p-8 rounded-lg">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">Subscribe to our newsletter</h3>
            <p className="text-neutral-700 mb-6">
              Get the latest articles, resources, and updates from AutoContentFlow directly in your inbox.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter your email address"
                className="bg-white"
              />
              <Button>Subscribe</Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}