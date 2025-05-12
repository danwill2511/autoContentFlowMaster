import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Workflow, Platform, Post } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit,
  MessageSquare,
  Share2,
  Zap,
  Settings,
  BarChart
} from "lucide-react";

// Interface for the platforms used in the visualizer
interface PlatformWithIcon extends Platform {
  icon: React.ReactNode;
  color: string;
}

// Interface for the content flow visualizer component
interface ContentFlowVisualizerProps {
  workflow?: Workflow;
  platforms?: Platform[];
  posts?: Post[];
  isLoading?: boolean;
  showControls?: boolean;
}

// Connector component to draw lines between flow steps
const Connector = ({ color = "bg-neutral-200" }: { color?: string }) => (
  <div className="flex justify-center">
    <div className={`w-0.5 h-10 ${color}`}></div>
  </div>
);

export function ContentFlowVisualizer({
  workflow,
  platforms = [],
  posts = [],
  isLoading = false,
  showControls = true
}: ContentFlowVisualizerProps) {
  const [activeTab, setActiveTab] = useState<string>("flow");
  const [viewMode, setViewMode] = useState<"sequential" | "parallel">("sequential");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState<boolean>(false);
  const flowRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Animation variants for the flow steps
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  // Get platform data with icons
  const getPlatformData = (): PlatformWithIcon[] => {
    return platforms.map(platform => {
      let icon = <Share2 className="w-4 h-4" />;
      let color = "bg-blue-100 text-blue-700";
      
      // Set icon and color based on platform name
      switch(platform.name.toLowerCase()) {
        case 'twitter':
        case 'x':
          icon = <Share2 className="w-4 h-4" />;
          color = "bg-blue-100 text-blue-700";
          break;
        case 'facebook':
          icon = <Share2 className="w-4 h-4" />;
          color = "bg-indigo-100 text-indigo-700";
          break;
        case 'instagram':
          icon = <Share2 className="w-4 h-4" />;
          color = "bg-pink-100 text-pink-700";
          break;
        case 'linkedin':
          icon = <Share2 className="w-4 h-4" />;
          color = "bg-sky-100 text-sky-700";
          break;
        case 'pinterest':
          icon = <Share2 className="w-4 h-4" />;
          color = "bg-red-100 text-red-700";
          break;
        default:
          icon = <Share2 className="w-4 h-4" />;
          color = "bg-neutral-100 text-neutral-700";
      }
      
      return {
        ...platform,
        icon,
        color
      };
    });
  };

  // Get AI suggestions for improving the workflow
  const getAiSuggestions = useMutation({
    mutationFn: async () => {
      if (!workflow) return [];
      
      const res = await apiRequest("POST", "/api/workflows/suggestions", {
        workflowId: workflow.id
      });
      return await res.json();
    },
    onSuccess: (data) => {
      setAiSuggestions(data.suggestions || []);
    },
    onError: (error) => {
      toast({
        title: "Failed to get suggestions",
        description: error.message,
        variant: "destructive",
      });
      // Fallback to static suggestions if API fails
      setAiSuggestions([
        "Add more diverse content types to increase engagement",
        "Post during peak hours for your audience demographic",
        "Include more visual elements in your content"
      ]);
    },
    onSettled: () => {
      setIsSuggestionsLoading(false);
    }
  });

  // Fetch AI suggestions when workflow changes
  useEffect(() => {
    if (workflow && activeTab === "insights") {
      setIsSuggestionsLoading(true);
      getAiSuggestions.mutate();
    }
  }, [workflow, activeTab]);

  // Export flow as image
  const exportFlowAsImage = () => {
    if (flowRef.current) {
      // This is a placeholder for actual image export functionality
      toast({
        title: "Flow Exported",
        description: "Content flow visualization has been exported as an image.",
      });
    }
  };

  // Share flow with team
  const shareFlow = () => {
    // This is a placeholder for actual sharing functionality
    toast({
      title: "Flow Shared",
      description: "Content flow has been shared with your team.",
    });
  };

  // Render loading skeleton
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render no workflow message
  if (!workflow) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Content Flow Visualizer</CardTitle>
          <CardDescription>
            Visualize and optimize your content workflow
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="flex flex-col items-center justify-center">
            <div className="rounded-full bg-neutral-100 p-3 mb-4">
              <Zap className="h-6 w-6 text-neutral-400" />
            </div>
            <h3 className="text-lg font-medium">No Workflow Selected</h3>
            <p className="text-sm text-neutral-500 mt-2 max-w-md mx-auto">
              Select or create a workflow to visualize how content flows from creation to publishing across your platforms.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get platform data with icons
  const platformsWithIcons = getPlatformData();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Content Flow Visualizer</CardTitle>
            <CardDescription>
              {workflow.name} - {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
            </CardDescription>
          </div>
          {showControls && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setViewMode(viewMode === "sequential" ? "parallel" : "sequential")}
              >
                {viewMode === "sequential" ? "Parallel View" : "Sequential View"}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={exportFlowAsImage}
              >
                Export
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={shareFlow}
              >
                Share
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="flow">Content Flow</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="stats">Performance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="flow" className="space-y-2">
            <div ref={flowRef} className="space-y-1 p-2">
              {/* Content Creation Step */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                custom={0}
                className="border border-neutral-200 rounded-lg p-4 bg-white shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-100 p-2">
                      <Edit className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Content Creation</h3>
                      <p className="text-sm text-neutral-500">
                        AI generates {workflow.contentType} with {workflow.contentTone} tone
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                    Step 1
                  </span>
                </div>
              </motion.div>

              <Connector />

              {/* Content Review Step */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                custom={1}
                className="border border-neutral-200 rounded-lg p-4 bg-white shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-amber-100 p-2">
                      <MessageSquare className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Content Review</h3>
                      <p className="text-sm text-neutral-500">
                        Optional human review and edits
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded-full">
                    Step 2
                  </span>
                </div>
              </motion.div>

              <Connector />

              {/* Scheduling Step */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                custom={2}
                className="border border-neutral-200 rounded-lg p-4 bg-white shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-violet-100 p-2">
                      <Clock className="h-4 w-4 text-violet-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Content Scheduling</h3>
                      <p className="text-sm text-neutral-500">
                        {workflow.frequency} posting schedule
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-violet-50 text-violet-600 px-2 py-1 rounded-full">
                    Step 3
                  </span>
                </div>
              </motion.div>

              <Connector />

              {/* Platform Distribution Section */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                custom={3}
                className="border border-neutral-200 rounded-lg p-4 bg-white shadow-sm"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-green-100 p-2">
                      <Share2 className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Platform Distribution</h3>
                      <p className="text-sm text-neutral-500">
                        Tailored content for each platform
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full">
                    Step 4
                  </span>
                </div>

                {/* Platform list */}
                <div className={`grid ${viewMode === "sequential" ? "grid-cols-1" : "grid-cols-2 md:grid-cols-3"} gap-2 mt-2`}>
                  {platformsWithIcons.length > 0 ? (
                    platformsWithIcons.map((platform, idx) => (
                      <motion.div
                        key={platform.id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        custom={idx + 4}
                        className={`border rounded-md p-2 ${platform.color.split(' ')[0]} bg-opacity-15`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`rounded-full ${platform.color} p-1`}>
                            {platform.icon}
                          </div>
                          <span className="text-sm font-medium">{platform.name}</span>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-2 text-sm text-neutral-500">
                      No platforms connected to this workflow
                    </div>
                  )}
                </div>
              </motion.div>

              <Connector />

              {/* Analytics & Feedback Step */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                custom={7}
                className="border border-neutral-200 rounded-lg p-4 bg-white shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-cyan-100 p-2">
                      <BarChart className="h-4 w-4 text-cyan-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Analytics & Learning</h3>
                      <p className="text-sm text-neutral-500">
                        Performance tracking and AI optimization
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-cyan-50 text-cyan-600 px-2 py-1 rounded-full">
                    Step 5
                  </span>
                </div>
              </motion.div>
            </div>
          </TabsContent>
          
          <TabsContent value="insights">
            <Card className="border-none shadow-none">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg">AI-Generated Insights</CardTitle>
                <CardDescription>
                  Intelligent suggestions to improve your content workflow
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                {isSuggestionsLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : aiSuggestions.length > 0 ? (
                  <div className="space-y-3">
                    {aiSuggestions.map((suggestion, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex gap-3 p-3 border rounded-lg bg-neutral-50"
                      >
                        <div className="mt-0.5">
                          <Zap className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-sm">{suggestion}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="rounded-full bg-neutral-100 p-3 mb-3 mx-auto w-12 h-12 flex items-center justify-center">
                      <AlertCircle className="h-6 w-6 text-neutral-400" />
                    </div>
                    <h3 className="text-sm font-medium">No insights available</h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      Run this workflow a few times to gather data for AI insights
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="px-0 pb-0">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setIsSuggestionsLoading(true);
                    getAiSuggestions.mutate();
                  }}
                  disabled={isSuggestionsLoading}
                >
                  {isSuggestionsLoading ? "Generating..." : "Refresh Insights"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="stats">
            <Card className="border-none shadow-none">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg">Performance Statistics</CardTitle>
                <CardDescription>
                  Track how your content performs across platforms
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <div className="space-y-4">
                  {/* Posts Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-neutral-50 rounded-lg p-4 border">
                      <h4 className="text-sm font-medium text-neutral-500">Total Posts</h4>
                      <p className="text-2xl font-bold mt-1">{posts.length}</p>
                    </div>
                    
                    <div className="bg-neutral-50 rounded-lg p-4 border">
                      <h4 className="text-sm font-medium text-neutral-500">Published</h4>
                      <p className="text-2xl font-bold mt-1 text-green-600">
                        {posts.filter(p => p.status === 'published').length}
                      </p>
                    </div>
                    
                    <div className="bg-neutral-50 rounded-lg p-4 border">
                      <h4 className="text-sm font-medium text-neutral-500">Pending</h4>
                      <p className="text-2xl font-bold mt-1 text-amber-600">
                        {posts.filter(p => p.status === 'pending').length}
                      </p>
                    </div>
                  </div>
                  
                  {/* Status Overview */}
                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm font-medium mb-3">Workflow Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center">
                          <Settings className="h-4 w-4 mr-2 text-neutral-500" />
                          <span>Status</span>
                        </div>
                        <div className="flex items-center">
                          {workflow.status === 'active' ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                              <span className="text-green-600 font-medium">Active</span>
                            </>
                          ) : (
                            <>
                              <Clock className="h-4 w-4 mr-1 text-amber-500" />
                              <span className="text-amber-600 font-medium">Paused</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-neutral-500" />
                          <span>Next Post</span>
                        </div>
                        <span className="font-medium">
                          {workflow.nextPostDate ? new Date(workflow.nextPostDate).toLocaleDateString() : 'Not scheduled'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center">
                          <Share2 className="h-4 w-4 mr-2 text-neutral-500" />
                          <span>Platforms</span>
                        </div>
                        <span className="font-medium">{platformsWithIcons.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default ContentFlowVisualizer;