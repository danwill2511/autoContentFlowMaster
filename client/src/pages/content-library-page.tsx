import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Search, FileText, Bookmark, Calendar, Star, Share2, Download, Plus, Filter } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

// Sample content templates for the library
// In a real app, this would come from an API or CMS
const contentTemplates = [
  {
    id: 1,
    title: "Product Launch Announcement",
    description: "Template for announcing new product launches across platforms",
    category: "Marketing",
    platforms: ["Twitter", "LinkedIn", "Facebook"],
    downloads: 1248,
    rating: 4.8,
    dateCreated: "2023-03-15",
    tags: ["product", "launch", "announcement"],
    premium: false,
    template: "Excited to announce our new [Product]! 🚀\n\n[Product] helps you [benefit] without [pain point]. Learn more at [link] #ProductLaunch #[Industry]"
  },
  {
    id: 2,
    title: "Weekly Industry Insights",
    description: "Regular post format for sharing industry news and trends",
    category: "Thought Leadership",
    platforms: ["LinkedIn", "Twitter"],
    downloads: 879,
    rating: 4.6,
    dateCreated: "2023-04-20",
    tags: ["insights", "industry", "weekly"],
    premium: false,
    template: "📊 This week in [Industry]: \n\n1. [Trend 1] is changing how companies approach [topic]\n2. [Company] announced [news] that will impact [audience]\n3. New research shows [statistic] about [topic]\n\nYour thoughts? #[Industry]Insights"
  },
  {
    id: 3,
    title: "Customer Success Story",
    description: "Showcase happy customers and their results",
    category: "Social Proof",
    platforms: ["LinkedIn", "Facebook", "Instagram"],
    downloads: 1532,
    rating: 4.9,
    dateCreated: "2023-02-10",
    tags: ["testimonial", "case study", "results"],
    premium: true,
    template: "✨ Customer Spotlight: [Company/Person] ✨\n\nChallenge: [Brief description of their problem]\n\nSolution: [How your product/service helped]\n\nResults: [Specific metrics and outcomes]\n\n\"[Quote from customer]\"\n\nLearn more about how we can help you achieve similar results: [link]"
  },
  {
    id: 4,
    title: "Event Promotion Template",
    description: "Promote upcoming virtual or in-person events",
    category: "Events",
    platforms: ["Twitter", "LinkedIn", "Facebook", "Instagram"],
    downloads: 1105,
    rating: 4.7,
    dateCreated: "2023-05-05",
    tags: ["events", "promotion", "webinar"],
    premium: false,
    template: "🗓️ Join us for [Event Name]!\n\n📅 Date: [Date]\n⏰ Time: [Time]\n📍 Location: [Location/Virtual]\n\nLearn about [Topic] and how to [Benefit].\n\nRegister now: [Link]\n\n#[EventHashtag] #[Industry]"
  },
  {
    id: 5,
    title: "Blog Post Promotional Template",
    description: "Share new blog posts with compelling hooks",
    category: "Content Marketing",
    platforms: ["Twitter", "LinkedIn", "Facebook"],
    downloads: 945,
    rating: 4.5,
    dateCreated: "2023-04-12",
    tags: ["blog", "promotion", "content"],
    premium: false,
    template: "📝 New on the blog: \"[Blog Title]\"\n\n[Interesting statistic or fact from the blog]\n\nFind out [what readers will learn] in our latest post.\n\nRead now: [Link]\n\n#[Industry] #ContentMarketing"
  },
  {
    id: 6,
    title: "Special Offer Announcement",
    description: "Promote limited-time offers and promotions",
    category: "Sales",
    platforms: ["Twitter", "Facebook", "Instagram"],
    downloads: 1387,
    rating: 4.8,
    dateCreated: "2023-03-20",
    tags: ["promotion", "offer", "sale"],
    premium: true,
    template: "🔥 SPECIAL OFFER: [Brief description of offer]\n\n⏰ Limited Time: Ends [End Date]\n\n[Value proposition and benefits]\n\nUse code: [PROMOCODE] at checkout.\n\nShop now: [Link]\n\n#SpecialOffer #LimitedTime"
  },
  {
    id: 7,
    title: "Industry Tip Series",
    description: "Share valuable tips related to your industry",
    category: "Educational",
    platforms: ["Twitter", "LinkedIn", "Instagram"],
    downloads: 1056,
    rating: 4.7,
    dateCreated: "2023-01-15",
    tags: ["tips", "advice", "education"],
    premium: false,
    template: "💡 [Industry] Tip #[Number]: [Brief tip title]\n\n[Expanded explanation of the tip]\n\n[How this helps the audience]\n\nSave this post for later! ➡️\n\n#[Industry]Tips #ProfessionalDevelopment"
  },
  {
    id: 8,
    title: "Product Feature Spotlight",
    description: "Highlight specific features of your product",
    category: "Product Marketing",
    platforms: ["Twitter", "LinkedIn", "Instagram", "Facebook"],
    downloads: 890,
    rating: 4.6,
    dateCreated: "2023-05-18",
    tags: ["product", "features", "spotlight"],
    premium: true,
    template: "✨ Feature Spotlight: [Feature Name] ✨\n\n[Brief description of what the feature does]\n\n🔑 Key benefits:\n• [Benefit 1]\n• [Benefit 2]\n• [Benefit 3]\n\nLearn how to use this feature: [Link]\n\n#ProductTips #[Product]Features"
  }
];

export default function ContentLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [activeTab, setActiveTab] = useState("all");
  
  // Categories derived from template data
  const categories = ["All", ...new Set(contentTemplates.map(item => item.category))];
  
  // Platforms derived from template data
  const platforms = [
    "All", 
    ...new Set(contentTemplates.flatMap(item => item.platforms))
  ];
  
  // Filter templates based on search query, category, and platform
  const filteredTemplates = contentTemplates.filter(template => {
    const matchesSearch = searchQuery === "" || 
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesCategory = selectedCategory === "All" || template.category === selectedCategory;
    
    const matchesPlatform = selectedPlatform === "All" || 
      template.platforms.includes(selectedPlatform);
      
    const matchesTab = (
      activeTab === "all" || 
      (activeTab === "premium" && template.premium) || 
      (activeTab === "free" && !template.premium)
    );
    
    return matchesSearch && matchesCategory && matchesPlatform && matchesTab;
  });

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto py-8 px-4">
        <div className="flex flex-col mb-8">
          <h1 className="text-3xl font-bold">Content Library</h1>
          <p className="text-muted-foreground">Discover templates and inspiration for your content</p>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 gap-4">
            <div className="relative w-full sm:w-auto sm:flex-1 max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[180px]">
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
              
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map(platform => (
                    <SelectItem key={platform} value={platform}>
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList>
              <TabsTrigger value="all">All Templates</TabsTrigger>
              <TabsTrigger value="premium">Premium</TabsTrigger>
              <TabsTrigger value="free">Free</TabsTrigger>
              <TabsTrigger value="saved">Saved</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{template.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {template.description}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Bookmark className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pb-0">
                <div className="flex flex-wrap gap-2 mb-4">
                  {template.platforms.map((platform) => (
                    <Badge key={platform} variant="outline">
                      {platform}
                    </Badge>
                  ))}
                </div>
                
                <div className="bg-neutral-50 p-4 rounded-md mb-4 h-40 overflow-auto">
                  <pre className="text-sm whitespace-pre-wrap font-sans">
                    {template.template}
                  </pre>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  {template.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-4 mt-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  {template.dateCreated}
                </div>
                <div className="flex items-center space-x-1 text-sm">
                  <Star className="h-3.5 w-3.5 text-amber-500" />
                  <span>{template.rating}</span>
                  <span className="text-muted-foreground ml-2">
                    ({template.downloads})
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    className="h-8"
                    variant={template.premium ? "secondary" : "default"}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    {template.premium ? "Premium" : "Use"}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
          
          {/* "Create Your Own" card */}
          <Card className="overflow-hidden border-dashed">
            <div className="flex flex-col items-center justify-center h-full p-8">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Create Custom Template</h3>
              <p className="text-sm text-center text-muted-foreground mb-4">
                Need something specific? Create your own custom template.
              </p>
              <Button>Create Template</Button>
            </div>
          </Card>
        </div>
        
        {filteredTemplates.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="h-16 w-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No templates found</h3>
            <p className="text-muted-foreground max-w-md">
              We couldn't find any templates matching your search criteria. Try adjusting your filters or search terms.
            </p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}