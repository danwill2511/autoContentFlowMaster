import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import PlatformSelector, { Platform as PlatformType } from "@/components/workflows/platform-selector";
import ContentPreview from "@/components/workflows/content-preview";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const workflowSchema = z.object({
  name: z.string().min(3, "Workflow name must be at least 3 characters"),
  frequency: z.string().min(1, "Please select a frequency"),
  contentType: z.string().min(1, "Please select a content type"),
  contentTone: z.string().min(1, "Please select a content tone"),
  topics: z.string().min(3, "Please add at least one topic"),
  nextPostDate: z.string().optional(),
  status: z.string().default("active"),
});

type WorkflowFormValues = z.infer<typeof workflowSchema>;

export default function CreateWorkflowPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const [selectedPlatforms, setSelectedPlatforms] = useState<number[]>([]);
  
  // Get user platforms
  const { data: platforms } = useQuery<any[]>({
    queryKey: ["/api/platforms"],
    enabled: !!user,
  });

  // Map platforms to platform selector format
  const mapPlatforms = (): PlatformType[] => {
    if (!platforms) return [];
    
    // This is a simplified approach since the real platforms data might be structured differently
    // In a real implementation, you would map platform data from the API to the correct format
    return platforms.map(platform => ({
      id: platform.id,
      name: platform.name,
      icon: getPlatformIcon(platform.name),
      bgColor: getPlatformBgColor(platform.name),
    }));
  };

  const getPlatformIcon = (name: string) => {
    switch(name) {
      case "LinkedIn":
        return <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
      case "Twitter":
        return <svg className="h-5 w-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>;
      case "Facebook":
        return <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
      case "Pinterest":
        return <svg className="h-5 w-5 text-red-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/></svg>;
      case "YouTube":
        return <svg className="h-5 w-5 text-red-600" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
      default:
        return <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
    }
  };

  const getPlatformBgColor = (name: string) => {
    switch(name) {
      case "LinkedIn":
      case "Twitter":
      case "Facebook":
        return "bg-blue-100";
      case "Pinterest":
      case "YouTube":
        return "bg-red-100";
      default:
        return "bg-gray-100";
    }
  };

  // Form setup
  const form = useForm<WorkflowFormValues>({
    resolver: zodResolver(workflowSchema),
    defaultValues: {
      name: "",
      frequency: "daily",
      contentType: "blog posts",
      contentTone: "professional",
      topics: "",
      status: "active",
    },
  });

  // Create workflow mutation
  const createWorkflow = useMutation({
    mutationFn: async (data: WorkflowFormValues) => {
      const res = await apiRequest("POST", "/api/workflows", {
        ...data,
        platforms: selectedPlatforms,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Workflow created",
        description: "Your new workflow has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create workflow",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: WorkflowFormValues) => {
    if (selectedPlatforms.length === 0) {
      toast({
        title: "Select platforms",
        description: "Please select at least one platform for your workflow.",
        variant: "destructive",
      });
      return;
    }
    
    // Add the nextPostDate if set
    if (data.nextPostDate) {
      const dateObj = new Date(data.nextPostDate);
      // If time is not explicitly set, default to noon
      if (dateObj.getHours() === 0 && dateObj.getMinutes() === 0) {
        dateObj.setHours(12, 0, 0);
      }
      data.nextPostDate = dateObj.toISOString();
    } else {
      // Default to tomorrow noon
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(12, 0, 0, 0);
      data.nextPostDate = tomorrow.toISOString();
    }
    
    createWorkflow.mutate(data);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
        <div className="px-4 sm:px-0 mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900">Create New Workflow</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Set up automated content creation and posting across your platforms.
          </p>
        </div>
        
        <Card className="mx-auto mb-8">
          <CardHeader>
            <CardTitle>New Content Workflow</CardTitle>
            <CardDescription>
              Configure your automated content creation and posting settings
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div>
                  <h3 className="text-base font-medium text-neutral-900 mb-4">1. Basic Information</h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
                    <div className="sm:col-span-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Workflow Name</FormLabel>
                            <FormControl>
                              <Input placeholder="E.g., Weekly Blog Posts" {...field} />
                            </FormControl>
                            <FormDescription>
                              A descriptive name for your content workflow
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="sm:col-span-2">
                      <FormField
                        control={form.control}
                        name="frequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Posting Frequency</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              How often content will be posted
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-base font-medium text-neutral-900 mb-4">2. Select Platforms</h3>
                  {platforms && platforms.length > 0 ? (
                    <PlatformSelector
                      platforms={mapPlatforms()}
                      selectedPlatforms={selectedPlatforms}
                      onChange={(selected) => setSelectedPlatforms(selected)}
                    />
                  ) : (
                    <div className="text-center py-6 border border-dashed border-neutral-300 rounded-lg">
                      <svg
                        className="mx-auto h-12 w-12 text-neutral-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="mt-2 text-sm text-neutral-500">
                        No platforms configured yet. Please add a platform first.
                      </p>
                      <Button className="mt-4" variant="outline" asChild>
                        <a href="/platforms">Add Platform</a>
                      </Button>
                    </div>
                  )}
                  {selectedPlatforms.length === 0 && (
                    <p className="text-sm text-red-500 mt-2">
                      Please select at least one platform
                    </p>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-base font-medium text-neutral-900 mb-4">3. Content Configuration</h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <FormField
                        control={form.control}
                        name="contentType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select content type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="blog posts">Blog posts</SelectItem>
                                <SelectItem value="short articles">Short articles</SelectItem>
                                <SelectItem value="social media updates">Social media updates</SelectItem>
                                <SelectItem value="video scripts">Video scripts</SelectItem>
                                <SelectItem value="infographic text">Infographic text</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Type of content to generate
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="sm:col-span-3">
                      <FormField
                        control={form.control}
                        name="contentTone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content Tone</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select tone" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="professional">Professional</SelectItem>
                                <SelectItem value="casual">Casual</SelectItem>
                                <SelectItem value="friendly">Friendly</SelectItem>
                                <SelectItem value="humorous">Humorous</SelectItem>
                                <SelectItem value="authoritative">Authoritative</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Style and tone of the content
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="sm:col-span-6">
                      <FormField
                        control={form.control}
                        name="topics"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Topics to Cover</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="E.g., technology, marketing, business" 
                                className="resize-none" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Separate different topics with commas
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-base font-medium text-neutral-900 mb-4">4. Content Preview</h3>
                  <div className="grid grid-cols-1 gap-6">
                    {selectedPlatforms.length > 0 && (
                      <ContentPreview 
                        contentType={form.watch("contentType")}
                        contentTone={form.watch("contentTone")}
                        topics={form.watch("topics")}
                        platforms={selectedPlatforms.map(id => {
                          const platform = platforms?.find(p => p.id === id);
                          return platform?.name || "";
                        }).filter(Boolean)}
                      />
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-base font-medium text-neutral-900 mb-4">5. Scheduling</h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <FormField
                        control={form.control}
                        name="nextPostDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormDescription>
                              When to start posting content
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-neutral-200 pt-6">
                  <div className="flex justify-end space-x-3">
                    <Button type="button" variant="outline" onClick={() => setLocation("/")}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createWorkflow.isPending}
                    >
                      {createWorkflow.isPending ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Create Workflow
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
