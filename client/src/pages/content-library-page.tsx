
import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Search, FileText, Bookmark, Calendar, Star, Share2, Download, Plus, Filter, Play, Pause, List, Loader2, Check } from "lucide-react";
import Layout from "@/components/layout/layout";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { contentTemplates } from "@/data/contentTemplateData";
import { ContentTemplate } from "@/data/contentTemplateData";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function ContentLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [platformFilter, setPlatformFilter] = useState("All");
  const [premiumFilter, setPremiumFilter] = useState("All");
  const [sortOption, setSortOption] = useState("popular");
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
  const [showWorkflowSteps, setShowWorkflowSteps] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState<number[]>(() => {
    const saved = localStorage.getItem('savedTemplates');
    return saved ? JSON.parse(saved) : [];
  });

  const { toast } = useToast();

  // Mutation for generating preview images
  const generatePreviewMutation = useMutation({
    mutationFn: async (template: ContentTemplate) => {
      const response = await apiRequest("POST", "/api/templates/generate-preview", {
        title: template.title,
        description: template.description,
        category: template.category,
        workflowSteps: template.workflowSteps
      });
      return await response.json();
    },
    onSuccess: (data, template) => {
      // Update the template with the new image URL
      const updatedTemplate = { ...template, animationPreview: data.imageUrl };
      // We'd typically update this in the database, but for now we'll just toast a success message
      toast({
        title: "Preview generated successfully",
        description: "The AI image preview has been generated and saved.",
      });

      // Force a re-render by setting the selected template
      setSelectedTemplate(updatedTemplate);
    },
    onError: (error) => {
      toast({
        title: "Failed to generate preview",
        description: "An error occurred while generating the preview image.",
        variant: "destructive"
      });
    }
  });

  // Function to toggle saving a template
  const toggleSaveTemplate = (templateId: number) => {
    let newSavedTemplates: number[];

    if (savedTemplates.includes(templateId)) {
      newSavedTemplates = savedTemplates.filter(id => id !== templateId);
      toast({
        title: "Template removed",
        description: "Template has been removed from your saved items."
      });
    } else {
      newSavedTemplates = [...savedTemplates, templateId];
      toast({
        title: "Template saved",
        description: "Template has been saved to your library."
      });
    }

    setSavedTemplates(newSavedTemplates);
    localStorage.setItem('savedTemplates', JSON.stringify(newSavedTemplates));
  };

  // Function to use a template (start workflow creation with this template)
  const useTemplate = (template: ContentTemplate) => {
    toast({
      title: "Template applied",
      description: "Template has been applied to a new workflow.",
    });

    // Here you would typically redirect to workflow creation with this template
    // or open a modal to configure workflow options
    setIsDialogOpen(false);
  };

  // Function to regenerate preview image for a template
  const regeneratePreview = (template: ContentTemplate) => {
    generatePreviewMutation.mutate(template);
  };

  // Get unique categories
  const categories = ["All", ...new Set(contentTemplates.map((t) => t.category))];

  // Get unique platforms
  const allPlatforms = contentTemplates.flatMap((t) => t.platforms);
  const platforms = ["All", ...new Set(allPlatforms)];

  // Filter templates based on search, category, platform, and premium filters
  const filteredTemplates = contentTemplates.filter((template) => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === "All" || template.category === categoryFilter;

    const matchesPlatform = platformFilter === "All" || 
      template.platforms.some(platform => platform === platformFilter);

    const matchesPremium = premiumFilter === "All" || 
      (premiumFilter === "Premium" && template.premium) ||
      (premiumFilter === "Free" && !template.premium);

    return matchesSearch && matchesCategory && matchesPlatform && matchesPremium;
  });

  // Sort templates
  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortOption) {
      case "popular":
        return b.downloads - a.downloads;
      case "rating":
        return b.rating - a.rating;
      case "newest":
        return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
      default:
        return 0;
    }
  });

  return (
    <Layout>
      
      <div className="container mx-auto py-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 rounded-3xl" />
          <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg mb-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4">Content Library 📚</h1>
              <p className="text-lg text-neutral-600">Your centralized hub for content templates and inspiration</p>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                <Button variant="outline" size="sm">
                  <span className="mr-2">📝</span> Create Template
                </Button>
                <Button variant="outline" size="sm">
                  <span className="mr-2">🔍</span> Browse Templates
                </Button>
                <Button variant="outline" size="sm">
                  <span className="mr-2">⭐</span> Favorites
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div>
              <h3 className="font-medium mb-2">Category</h3>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="font-medium mb-2">Platform</h3>
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="font-medium mb-2">Type</h3>
              <Select value={premiumFilter} onValueChange={setPremiumFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Free">Free</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="font-medium mb-2">Sort By</h3>
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium mb-2">Pro Tips</h3>
              <ul className="text-sm space-y-2">
                <li>• Use AI to customize templates</li>
                <li>• Save favorites for quick access</li>
                <li>• Check analytics for best performers</li>
              </ul>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold">
                  {sortedTemplates.length} Templates Found
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedTemplates.map((template) => (
                <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{template.title}</CardTitle>
                        <CardDescription className="text-xs text-muted-foreground mt-1">
                          {new Date(template.dateCreated).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      {template.premium && (
                        <Badge variant="default" className="bg-amber-600 hover:bg-amber-700">Premium</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm mb-3 line-clamp-2">{template.description}</p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.platforms.map((platform) => (
                        <Badge key={platform} variant="outline" className="text-xs">
                          {platform}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex justify-between text-xs text-muted-foreground mb-3">
                      <div className="flex items-center">
                        <Download className="h-3 w-3 mr-1" />
                        {template.downloads.toLocaleString()}
                      </div>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-500 mr-1" />
                        {template.rating}
                      </div>
                    </div>

                    <div className="overflow-hidden bg-muted rounded-md p-2 mb-2 h-24">
                      <ScrollArea className="h-full">
                        <div className="text-xs whitespace-pre-wrap">{template.template}</div>
                      </ScrollArea>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-3 pb-3">
                    <Dialog open={isDialogOpen && selectedTemplate?.id === template.id} onOpenChange={(open) => {
                      setIsDialogOpen(open);
                      if (open) setSelectedTemplate(template);
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Play className="h-3 w-3 mr-1" /> View Workflow
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>{template.title} Workflow</DialogTitle>
                          <DialogDescription>
                            {template.description}
                          </DialogDescription>
                        </DialogHeader>

                        <div className="flex flex-col md:flex-row gap-6 mt-2">
                          <div className="md:w-1/2">
                            <div className="border rounded-lg overflow-hidden bg-muted p-2 text-center">
                              <div className="flex justify-between items-center mb-2">
                                <p className="text-sm">Workflow Preview</p>
                                {!generatePreviewMutation.isPending && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 text-xs"
                                    onClick={() => regeneratePreview(template)}
                                    title="Generate AI preview"
                                  >
                                    <Download className="h-3 w-3 mr-1" /> 
                                    Generate AI Preview
                                  </Button>
                                )}
                              </div>
                              <div className="h-56 flex items-center justify-center">
                                {generatePreviewMutation.isPending && generatePreviewMutation.variables?.id === template.id ? (
                                  <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <p className="text-sm text-muted-foreground">Generating AI preview...</p>
                                  </div>
                                ) : template.animationPreview ? (
                                  <img 
                                    src={template.animationPreview} 
                                    alt={`${template.title} workflow preview`} 
                                    className="max-h-full"
                                  />
                                ) : (
                                  <div className="flex flex-col items-center gap-2">
                                    <p className="text-sm text-muted-foreground">No preview available</p>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => regeneratePreview(template)}
                                    >
                                      Generate AI Preview
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="mt-4">
                              <h4 className="font-medium text-sm mb-2">Template Content:</h4>
                              <div className="bg-muted rounded-md p-3 text-sm whitespace-pre-wrap">
                                {template.template}
                              </div>
                            </div>
                          </div>

                          <div className="md:w-1/2">
                            {template.workflowSteps && (
                              <div className="border rounded-lg p-4">
                                <h4 className="font-medium mb-3 flex items-center">
                                  <List className="h-4 w-4 mr-2" />
                                  Workflow Steps
                                </h4>
                                <ol className="space-y-3">
                                  {template.workflowSteps.map((step, index) => (
                                    <li key={index} className="flex items-start">
                                      <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                                        {index + 1}
                                      </span>
                                      <span className="text-sm">{step}</span>
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            )}

                            <div className="mt-4">
                              <h4 className="font-medium text-sm mb-2">Platform Support:</h4>
                              <div className="flex flex-wrap gap-2">
                                {template.platforms.map(platform => (
                                  <Badge key={platform}>{platform}</Badge>
                                ))}
                              </div>
                            </div>

                            <div className="mt-4">
                              <h4 className="font-medium text-sm mb-2">Tags:</h4>
                              <div className="flex flex-wrap gap-1">
                                {template.tags.map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <DialogFooter className="sm:justify-between mt-6">
                          <div className="flex items-center text-sm">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span>{template.rating} rating • {template.downloads.toLocaleString()} downloads</span>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline"
                              onClick={() => toggleSaveTemplate(template.id)}
                            >
                              {savedTemplates.includes(template.id) ? (
                                <>
                                  <Check className="h-4 w-4 mr-2" />
                                  Saved
                                </>
                              ) : (
                                <>
                                  <Bookmark className="h-4 w-4 mr-2" />
                                  Save
                                </>
                              )}
                            </Button>
                            <Button onClick={() => useTemplate(template)}>
                              <Download className="h-4 w-4 mr-2" />
                              Use Template
                            </Button>
                          </div>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Button 
                      variant="default" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => useTemplate(template)}
                    >
                      <Download className="h-3 w-3 mr-1" /> Use
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {sortedTemplates.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No templates found</h3>
                <p className="text-muted-foreground mt-2">
                  Try adjusting your filters or search query
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}