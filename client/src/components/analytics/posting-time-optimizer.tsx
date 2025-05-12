import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { MultiSelect } from "@/components/ui/multi-select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Calendar, Clock, Loader2, RotateCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface PostingTimeOptimizerProps {
  className?: string;
}

// Define form schema
const formSchema = z.object({
  platformIds: z.array(z.number()).min(1, "Select at least one platform")
});

type FormValues = z.infer<typeof formSchema>;

// Days and hours visualization helpers
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Heat map color function based on value
const getHeatMapColor = (value: number, max: number): string => {
  if (value === 0) return "bg-background border";
  const normalized = Math.min(1, value / max);
  
  if (normalized < 0.3) return "bg-primary/10";
  if (normalized < 0.6) return "bg-primary/30";
  if (normalized < 0.8) return "bg-primary/60";
  return "bg-primary text-white";
};

export function PostingTimeOptimizer({ className }: PostingTimeOptimizerProps) {
  const { toast } = useToast();
  const [activeHeatmapPlatform, setActiveHeatmapPlatform] = useState<number | null>(null);
  
  // Query to get all platforms
  const platformsQuery = useQuery({
    queryKey: ["/api/platforms"],
    retry: 1,
  });
  
  // Set up the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      platformIds: []
    },
  });

  // Mutation to get optimal posting time
  const optimizationMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("POST", "/api/scheduler/optimal-times", data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Optimal posting times calculated",
      });
      
      // If we have time optimizations, set the first one as active for heatmap
      if (data.timeOptimizations?.length > 0) {
        setActiveHeatmapPlatform(data.timeOptimizations[0].platformId);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to calculate optimal posting times: " + error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (values: FormValues) => {
    optimizationMutation.mutate(values);
  };
  
  // Handle platform selection for heatmap view
  const handlePlatformSelect = (platformId: number) => {
    setActiveHeatmapPlatform(platformId);
  };
  
  // Format options for platform selection
  const platformOptions = platformsQuery.data?.platforms?.map((platform: any) => ({
    value: platform.id,
    label: platform.name
  })) || [];
  
  // Find active platform data
  const activePlatformData = optimizationMutation.data?.timeOptimizations?.find(
    p => p.platformId === activeHeatmapPlatform
  );
  
  // Generate day-based heatmap data
  const dayHeatmapData = Array(7).fill(0).map((_, index) => {
    const dayScore = activePlatformData?.bestDays?.includes(index) ? 1 : 0;
    return {
      day: index,
      dayName: dayNames[index],
      score: dayScore
    };
  });
  
  // Generate hour-based heatmap data (24-hour format)
  const hourHeatmapData = Array(24).fill(0).map((_, index) => {
    const hourScore = activePlatformData?.bestHours?.includes(index) ? 1 : 0;
    return {
      hour: index,
      score: hourScore
    };
  });
  
  // Function to render the time matrix visualization
  const renderTimeMatrix = () => {
    // Group hours by rows (6 hours per row)
    const hourRows = [
      hourHeatmapData.slice(0, 6),
      hourHeatmapData.slice(6, 12),
      hourHeatmapData.slice(12, 18),
      hourHeatmapData.slice(18, 24)
    ];
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">Best Time to Post</h3>
          <div className="text-xs text-muted-foreground">
            {activePlatformData?.platformName || "Select a platform"}
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between">
            <h4 className="text-xs text-muted-foreground flex items-center">
              <Calendar className="h-3 w-3 mr-1" /> Day of week
            </h4>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {dayHeatmapData.map((day) => (
              <div
                key={day.day}
                className={cn(
                  "h-8 rounded flex items-center justify-center text-xs font-medium transition-colors",
                  getHeatMapColor(day.score, 1)
                )}
              >
                {day.dayName}
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between">
            <h4 className="text-xs text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" /> Hour of day
            </h4>
          </div>
          <div className="space-y-1">
            {hourRows.map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-6 gap-1">
                {row.map((hourData) => {
                  const hour = hourData.hour;
                  const period = hour >= 12 ? "PM" : "AM";
                  const displayHour = hour % 12 || 12;
                  
                  return (
                    <div
                      key={hour}
                      className={cn(
                        "h-8 rounded flex items-center justify-center text-xs transition-colors",
                        getHeatMapColor(hourData.score, 1)
                      )}
                    >
                      {displayHour}{period}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground mt-2">
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-background border rounded mr-1"></div>
              <span>Low</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-primary/30 rounded mr-1"></div>
              <span>Medium</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-primary rounded mr-1"></div>
              <span>High</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle>Posting Time Optimizer</CardTitle>
        <CardDescription>Find the best times to post for maximum engagement</CardDescription>
      </CardHeader>
      <CardContent>
        {platformsQuery.isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ) : platformsQuery.error ? (
          <div className="rounded-md bg-destructive/10 p-4 text-destructive text-sm">
            Error loading platforms: {
              platformsQuery.error instanceof Error ? platformsQuery.error.message : "Unknown error"
            }
          </div>
        ) : platformsQuery.data?.platforms?.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground">
            No platforms configured yet.
            <div className="mt-2">Add platforms in the Platforms section first.</div>
          </div>
        ) : (
          <Tabs defaultValue="calculate">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="calculate">Calculate</TabsTrigger>
              <TabsTrigger value="visualize" disabled={!optimizationMutation.data}>Visualize</TabsTrigger>
            </TabsList>
            
            <TabsContent value="calculate" className="pt-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="platformIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select platforms</FormLabel>
                        <FormControl>
                          <MultiSelect
                            placeholder="Select platforms"
                            options={platformOptions}
                            onChange={(values) => field.onChange(values.map(v => Number(v.value)))}
                            selected={field.value.map(v => ({
                              value: v,
                              label: platformOptions.find(p => p.value === v)?.label || `Platform ${v}`
                            }))}
                          />
                        </FormControl>
                        <FormDescription>
                          Select the platforms you want to calculate optimal posting times for
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={optimizationMutation.isPending}
                  >
                    {optimizationMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <RotateCw className="h-4 w-4 mr-2" />
                        Calculate Optimal Times
                      </>
                    )}
                  </Button>
                </form>
              </Form>
              
              {optimizationMutation.data && (
                <div className="mt-6 bg-muted/50 p-4 rounded-md">
                  <h3 className="text-sm font-medium mb-2">Results</h3>
                  <div className="text-sm">
                    <div className="flex flex-col space-y-2">
                      <div>
                        <span className="font-medium">Optimal posting time: </span>
                        <span>{new Date(optimizationMutation.data.optimalTime).toLocaleString()}</span>
                      </div>
                      
                      <div>
                        <span className="font-medium">Platforms analyzed: </span>
                        <span>{optimizationMutation.data.timeOptimizations.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="visualize" className="pt-4">
              {optimizationMutation.data && (
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {optimizationMutation.data.timeOptimizations.map((platform) => (
                      <Button
                        key={platform.platformId}
                        variant={platform.platformId === activeHeatmapPlatform ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePlatformSelect(platform.platformId)}
                      >
                        {platform.platformName}
                      </Button>
                    ))}
                  </div>
                  
                  {activeHeatmapPlatform ? (
                    renderTimeMatrix()
                  ) : (
                    <div className="text-center py-6 text-sm text-muted-foreground">
                      Select a platform to visualize its optimal posting times
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}