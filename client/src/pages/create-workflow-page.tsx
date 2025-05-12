import { useState, useEffect } from "react";
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
import { PlatformSelector } from "@/components/workflows/platform-selector";
import { ContentFlowVisualizer } from "@/components/workflows/content-flow-visualizer";
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
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ChevronRight,
  Save,
  Clock,
  Calendar as CalendarIcon,
  Settings,
  PlusCircle,
  RefreshCw,
  Sparkles,
  Instagram,
  Twitter,
  Linkedin,
  Facebook,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Define Platform type locally since it's not exported from the component
interface PlatformType {
  id: number;
  name: string;
  type: string;
  icon?: string;
}

// Form validation schema
const formSchema = z.object({
  name: z.string().min(3, {
    message: "Workflow name must be at least 3 characters.",
  }),
  description: z.string().optional(),
  contentType: z.enum(["text", "image", "video", "link", "mixed"]),
  frequency: z.enum(["once", "daily", "weekly", "monthly", "custom"]),
  customFrequency: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  useAi: z.boolean().default(false),
  schedulingStrategy: z.enum(["immediate", "optimal", "scheduled"]).default("scheduled"),
  scheduledTime: z.string().optional(),
  optimizationCriteria: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateWorkflowPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedPlatforms, setSelectedPlatforms] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState("templates");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [previewWorkflow, setPreviewWorkflow] = useState<any>(null);
  
  // State to track if visualization is visible
  const [showVisualization, setShowVisualization] = useState(false);
  
  // Default values for the form
  const defaultValues: Partial<FormValues> = {
    name: "",
    contentType: "text",
    frequency: "once",
    useAi: true,
    schedulingStrategy: "scheduled",
    optimizationCriteria: ["engagement"],
    tags: [],
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Track form fields to conditionally show fields and update preview
  const formValues = form.watch();
  const schedulingStrategy = formValues.schedulingStrategy;
  const frequency = formValues.frequency;
  const useAi = formValues.useAi;
  
  // Update the preview workflow when form values change
  useEffect(() => {
    // Only show visualization after user has started filling out the form
    if (formValues.name || selectedTemplate) {
      setShowVisualization(true);
      
      // Create a preview workflow based on current form values
      setPreviewWorkflow({
        id: 0, // Placeholder ID for preview
        name: formValues.name || "New Workflow",
        description: formValues.description || "",
        status: "draft",
        createdAt: new Date(),
        userId: user?.id || 0,
        contentType: formValues.contentType || "text",
        frequency: formValues.frequency || "once",
        tags: formValues.tags || [],
        useAi: formValues.useAi || false,
        schedulingStrategy: formValues.schedulingStrategy || "scheduled",
        // For visualization purposes only
        nextPostDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        optimizationCriteria: formValues.optimizationCriteria || []
      });
    }
  }, [formValues, selectedTemplate, user]);

  // Update form settings based on complex interactions
  const updateSettings = (field: string, value: any) => {
    form.setValue(field as any, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };
  
  // Apply a workflow template
  const applyTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    
    const template = workflowTemplates.find(t => t.id === templateId);
    if (!template) return;
    
    // Update form with template defaults
    Object.entries(template.defaults).forEach(([field, value]) => {
      updateSettings(field, value);
    });
    
    // Update selected platforms
    setSelectedPlatforms(template.platforms);
    
    // Move to the next tab if not a custom workflow
    if (templateId !== 'custom-workflow') {
      setActiveTab('basic');
    }
    
    toast({
      title: `${template.name} template applied`,
      description: "Form has been pre-filled with template settings.",
    });
  };

  const createWorkflowMutation = useMutation({
    mutationFn: async (data: FormValues & { platforms: number[] }) => {
      const response = await apiRequest("POST", "/api/workflows", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
      toast({
        title: "Workflow created",
        description: "Your workflow has been created successfully.",
      });
      navigate("/workflows");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create workflow",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: FormValues) {
    if (selectedPlatforms.length === 0) {
      toast({
        title: "No platforms selected",
        description: "Please select at least one platform for your workflow.",
        variant: "destructive",
      });
      return;
    }

    // Combine form data with selected platforms
    const workflowData = {
      ...data,
      platforms: selectedPlatforms,
    };

    createWorkflowMutation.mutate(workflowData);
  }

  // Mock platform data until API is connected
  const availablePlatforms: PlatformType[] = [
    {
      id: 1,
      name: "Instagram",
      type: "social",
      icon: "instagram",
    },
    {
      id: 2,
      name: "Twitter",
      type: "social",
      icon: "twitter",
    },
    {
      id: 3,
      name: "LinkedIn",
      type: "business",
      icon: "linkedin",
    },
    {
      id: 4,
      name: "Facebook",
      type: "social",
      icon: "facebook",
    },
  ];

  const optimizationOptions = [
    { value: "engagement", label: "Maximize Engagement" },
    { value: "reach", label: "Maximize Reach" },
    { value: "clicks", label: "Maximize Clicks" },
    { value: "conversions", label: "Maximize Conversions" },
  ];
  
  // Workflow templates
  const workflowTemplates = [
    {
      id: "social-media-mix",
      name: "Social Media Mix",
      description: "A balanced workflow for posting across multiple social platforms",
      icon: <RefreshCw className="h-8 w-8 text-blue-500" />,
      platforms: [1, 2, 4], // Instagram, Twitter, Facebook
      defaults: {
        name: "Social Media Mix",
        contentType: "mixed",
        frequency: "weekly",
        useAi: true,
        schedulingStrategy: "optimal",
        optimizationCriteria: ["engagement", "reach"],
        tags: ["social", "content"],
      }
    },
    {
      id: "professional-networking",
      name: "Professional Networking",
      description: "Focus on business-oriented content for professional audiences",
      icon: <Linkedin className="h-8 w-8 text-blue-700" />,
      platforms: [3], // LinkedIn
      defaults: {
        name: "Professional Networking",
        contentType: "text",
        frequency: "weekly",
        useAi: true,
        schedulingStrategy: "scheduled",
        scheduledTime: "09:00",
        optimizationCriteria: ["conversions"],
        tags: ["business", "professional", "networking"],
      }
    },
    {
      id: "visual-storytelling",
      name: "Visual Storytelling",
      description: "Image-focused workflow for visually engaging platforms",
      icon: <Instagram className="h-8 w-8 text-pink-500" />,
      platforms: [1, 4], // Instagram, Facebook
      defaults: {
        name: "Visual Storytelling",
        contentType: "image",
        frequency: "daily",
        useAi: true,
        schedulingStrategy: "optimal",
        optimizationCriteria: ["engagement"],
        tags: ["visual", "storytelling", "images"],
      }
    },
    {
      id: "trend-engagement",
      name: "Trend Engagement",
      description: "Quick responses to trending topics and conversations",
      icon: <Twitter className="h-8 w-8 text-blue-400" />,
      platforms: [2], // Twitter
      defaults: {
        name: "Trend Engagement",
        contentType: "text",
        frequency: "daily",
        useAi: true,
        schedulingStrategy: "immediate",
        optimizationCriteria: ["reach"],
        tags: ["trends", "realtime", "conversations"],
      }
    },
    {
      id: "custom-workflow",
      name: "Custom Workflow",
      description: "Create a workflow from scratch with your own settings",
      icon: <PlusCircle className="h-8 w-8 text-gray-500" />,
      platforms: [],
      defaults: {
        name: "",
        contentType: "text",
        frequency: "once",
        useAi: true,
        schedulingStrategy: "scheduled",
      }
    }
  ];

  const renderPlatformIcon = (platform: PlatformType) => {
    switch (platform.icon) {
      case "instagram":
        return <Instagram className="h-5 w-5 text-pink-500" />;
      case "twitter":
        return <Twitter className="h-5 w-5 text-blue-400" />;
      case "linkedin":
        return <Linkedin className="h-5 w-5 text-blue-700" />;
      case "facebook":
        return <Facebook className="h-5 w-5 text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container max-w-6xl py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Create Workflow</h1>
          <Button variant="outline" onClick={() => navigate("/workflows")}>
            Cancel
          </Button>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="platforms">Platforms</TabsTrigger>
                <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="templates" className="space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {workflowTemplates.map((template) => (
                    <Card 
                      key={template.id}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        selectedTemplate === template.id ? "ring-2 ring-primary" : ""
                      )}
                      onClick={() => applyTemplate(template.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 rounded-md flex items-center justify-center bg-primary/10">
                            {template.icon}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-sm">{template.description}</p>
                        
                        {template.platforms.length > 0 && (
                          <div className="mt-4">
                            <p className="text-xs text-muted-foreground mb-2">Platforms:</p>
                            <div className="flex space-x-2">
                              {template.platforms.map(platformId => {
                                const platform = availablePlatforms.find(p => p.id === platformId);
                                if (!platform) return null;
                                return (
                                  <div key={platformId} className="h-7 w-7">
                                    {renderPlatformIcon(platform)}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        
                        {template.id === "custom-workflow" ? (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="mt-3 w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              applyTemplate(template.id);
                              setActiveTab("basic");
                            }}
                          >
                            Start from scratch
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="mt-3 w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              applyTemplate(template.id);
                            }}
                          >
                            Use this template
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="flex justify-end mt-6">
                  <Button
                    onClick={() => {
                      if (!selectedTemplate) {
                        applyTemplate('custom-workflow');
                      }
                      setActiveTab('basic');
                    }}
                  >
                    {selectedTemplate ? 'Continue' : 'Skip Templates'} <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="basic" className="space-y-6 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Workflow Details</CardTitle>
                    <CardDescription>
                      Define the basic information about your workflow
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Workflow Name</FormLabel>
                          <FormControl>
                            <Input placeholder="My Content Workflow" {...field} />
                          </FormControl>
                          <FormDescription>
                            A descriptive name for your workflow
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the purpose of this workflow"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Provide additional details about this workflow
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                              <SelectItem value="text">Text Only</SelectItem>
                              <SelectItem value="image">Image</SelectItem>
                              <SelectItem value="video">Video</SelectItem>
                              <SelectItem value="link">Link</SelectItem>
                              <SelectItem value="mixed">Mixed Content</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The primary type of content this workflow will manage
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="useAi"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">AI Content Generation</FormLabel>
                            <FormDescription>
                              Use AI to help generate and optimize content
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/workflows")}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setActiveTab("platforms")}
                    >
                      Next <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="platforms" className="space-y-6 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Select Platforms</CardTitle>
                    <CardDescription>
                      Choose which platforms to publish content to
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      {availablePlatforms.map((platform) => (
                        <div key={platform.id} 
                          className={cn(
                            "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors",
                            selectedPlatforms.includes(platform.id) 
                              ? "border-primary bg-primary/5" 
                              : "hover:bg-muted/50"
                          )}
                          onClick={() => {
                            setSelectedPlatforms(prev => 
                              prev.includes(platform.id)
                                ? prev.filter(id => id !== platform.id)
                                : [...prev, platform.id]
                            );
                          }}
                        >
                          {renderPlatformIcon(platform)}
                          <div className="flex-1">
                            <p className="font-medium">{platform.name}</p>
                            <p className="text-sm text-muted-foreground">{platform.type}</p>
                          </div>
                          <div className="h-5 w-5 rounded-full border flex items-center justify-center">
                            {selectedPlatforms.includes(platform.id) && (
                              <div className="h-3 w-3 rounded-full bg-primary" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedPlatforms.length === 0 && (
                      <Alert variant="destructive" className="mt-4">
                        <AlertTitle>No platforms selected</AlertTitle>
                        <AlertDescription>
                          You must select at least one platform to continue.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("basic")}
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setActiveTab("scheduling")}
                      disabled={selectedPlatforms.length === 0}
                    >
                      Next <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="scheduling" className="space-y-6 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Scheduling Settings</CardTitle>
                    <CardDescription>
                      Configure how and when content will be published
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Publishing Frequency</FormLabel>
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
                              <SelectItem value="once">One-time Post</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="custom">Custom Schedule</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            How often content should be published
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {frequency === "custom" && (
                      <FormField
                        control={form.control}
                        name="customFrequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custom Frequency</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Every Monday and Thursday"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Describe your custom posting schedule
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="schedulingStrategy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Scheduling Strategy</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select strategy" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="immediate">Post Immediately</SelectItem>
                              <SelectItem value="scheduled">Schedule for Specific Time</SelectItem>
                              <SelectItem value="optimal">AI-Optimized Timing</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            {field.value === "optimal" 
                              ? "Our AI will analyze your audience to find the optimal posting time" 
                              : "Choose when to publish your content"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {schedulingStrategy === "scheduled" && (
                      <div className="grid gap-6 pt-2">
                        <FormField
                          control={form.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Start Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date < new Date()
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormDescription>
                                When to start publishing content
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="scheduledTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Time</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormDescription>
                                The time to publish content (in your local timezone)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {schedulingStrategy === "optimal" && useAi && (
                      <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 flex items-center gap-3">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <div className="text-sm">
                          <p className="font-medium">AI-Optimized Timing Enabled</p>
                          <p className="text-muted-foreground">
                            Our AI will analyze your audience patterns and schedule 
                            posts for maximum engagement
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("platforms")}
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setActiveTab("advanced")}
                    >
                      Next <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-6 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Settings</CardTitle>
                    <CardDescription>
                      Configure additional optimization options
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {useAi && (
                      <>
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium">AI Optimization Criteria</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {optimizationOptions.map((option) => (
                              <div
                                key={option.value}
                                className={cn(
                                  "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors",
                                  form.watch("optimizationCriteria")?.includes(option.value)
                                    ? "border-primary bg-primary/5"
                                    : "hover:bg-muted/50"
                                )}
                                onClick={() => {
                                  const current = form.watch("optimizationCriteria") || [];
                                  const updated = current.includes(option.value)
                                    ? current.filter((v) => v !== option.value)
                                    : [...current, option.value];
                                  form.setValue("optimizationCriteria", updated);
                                }}
                              >
                                <div className="flex-1">
                                  <p className="font-medium">{option.label}</p>
                                </div>
                                <div className="h-5 w-5 rounded-full border flex items-center justify-center">
                                  {form.watch("optimizationCriteria")?.includes(option.value) && (
                                    <div className="h-3 w-3 rounded-full bg-primary" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <Separator />
                      </>
                    )}

                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter tags separated by commas"
                              onChange={(e) => {
                                const tags = e.target.value
                                  .split(",")
                                  .map((tag) => tag.trim())
                                  .filter(Boolean);
                                form.setValue("tags", tags);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Tags to help organize your workflows
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("scheduling")}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={createWorkflowMutation.isPending}
                    >
                      {createWorkflowMutation.isPending ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Create Workflow
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
            
            {/* Preview visualization that updates in real-time */}
            {showVisualization && previewWorkflow && (
              <div className="mt-8 pt-8 border-t">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Live Workflow Preview</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowVisualization(!showVisualization)}
                  >
                    {showVisualization ? "Hide Preview" : "Show Preview"}
                  </Button>
                </div>
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <ContentFlowVisualizer 
                    workflow={previewWorkflow}
                    platforms={availablePlatforms
                      .filter(p => selectedPlatforms.includes(p.id))
                      .map(p => ({
                        id: p.id,
                        name: p.name,
                        type: p.type,
                        userId: user?.id || 0,
                        createdAt: new Date(),
                        apiKey: null,
                        apiSecret: null,
                        accessToken: null
                      }))}
                    showControls={false}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  This preview shows how your content will flow through the workflow. It updates as you make changes to your workflow configuration.
                </p>
              </div>
            )}
          </form>
        </Form>
      </main>
      <Footer />
    </div>
  );
}