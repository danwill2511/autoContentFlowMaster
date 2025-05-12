import React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, LineChart, RefreshCw, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface SchedulingInsightsProps {
  className?: string;
}

interface TimeOptimization {
  platformId: number;
  platformName: string;
  platformType: string;
  bestHours: number[];
  bestDays: number[];
  audienceTimezone: string;
  engagementScore: number;
}

interface OptimalTimeResponse {
  optimalTime: string;
  timeOptimizations: TimeOptimization[];
  message: string;
}

// Map day numbers to day names
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Helper function to format hours in 12-hour format
const formatHour = (hour: number): string => {
  const period = hour >= 12 ? "PM" : "AM";
  const adjustedHour = hour % 12 || 12;
  return `${adjustedHour}${period}`;
};

export function SchedulingInsights({ className }: SchedulingInsightsProps) {
  const { toast } = useToast();
  
  // Query to get all platforms
  const platformsQuery = useQuery({
    queryKey: ["/api/platforms"],
    retry: 1,
  });
  
  // Get the optimal posting times
  const optimizationQuery = useQuery({
    queryKey: ["/api/scheduler/optimal-times"],
    queryFn: async () => {
      // Only run this query if we have platforms
      if (!platformsQuery.data?.platforms?.length) {
        return null;
      }
      
      const platformIds = platformsQuery.data.platforms.map((p: any) => p.id);
      const res = await apiRequest("POST", "/api/scheduler/optimal-times", { platformIds });
      return await res.json() as OptimalTimeResponse;
    },
    enabled: platformsQuery.isSuccess && !!platformsQuery.data?.platforms?.length,
  });

  // Mutation to manually trigger the scheduler
  const processPostsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/scheduler/process-pending");
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message || `Processed ${data.count} posts`,
      });
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to process pending posts: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Function to refresh optimization data
  const refreshOptimizationData = () => {
    optimizationQuery.refetch();
  };

  const isLoading = platformsQuery.isLoading || optimizationQuery.isLoading;
  const error = platformsQuery.error || optimizationQuery.error;

  if (error) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle>Scheduling Insights</CardTitle>
          <CardDescription>Smart timing for better engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-destructive/10 p-4 text-destructive text-sm">
            Error loading scheduling insights: {error instanceof Error ? error.message : "Unknown error"}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Scheduling Insights</CardTitle>
            <CardDescription>Smart timing for better engagement</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshOptimizationData}
            disabled={optimizationQuery.isFetching}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", optimizationQuery.isFetching && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ) : optimizationQuery.data ? (
          <div className="space-y-4">
            <div className="bg-primary/10 rounded-md p-4 space-y-2">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-primary mr-2" />
                <h3 className="text-sm font-medium">Recommended next posting time</h3>
              </div>
              <div className="text-2xl font-bold">
                {new Date(optimizationQuery.data.optimalTime).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                Based on historical engagement across all your platforms
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">Platform-specific insights</h3>
              <div className="space-y-3">
                {optimizationQuery.data.timeOptimizations.map((opt) => (
                  <div key={opt.platformId} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">{opt.platformName}</div>
                      <div className="text-xs px-2 py-1 rounded-full bg-muted">{opt.platformType}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="flex items-center text-xs text-muted-foreground mb-1">
                          <Calendar className="h-3 w-3 mr-1" /> Best days
                        </div>
                        <div>
                          {opt.bestDays.length > 0 
                            ? opt.bestDays.map(day => dayNames[day]).join(', ')
                            : 'No data yet'}
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center text-xs text-muted-foreground mb-1">
                          <Clock className="h-3 w-3 mr-1" /> Best hours
                        </div>
                        <div>
                          {opt.bestHours.length > 0 
                            ? opt.bestHours.map(hour => formatHour(hour)).join(', ')
                            : 'No data yet'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs">
                      <div className="flex items-center">
                        <LineChart className="h-3 w-3 mr-1" />
                        <span className="text-muted-foreground mr-1">Engagement score:</span>
                        <span className="font-medium">{opt.engagementScore || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {optimizationQuery.data.timeOptimizations.length === 0 && (
                  <div className="text-center py-6 text-sm text-muted-foreground">
                    No platform optimization data available yet.
                    <div className="mt-2">Post content to start collecting engagement data.</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-sm text-muted-foreground">
            No platforms configured yet.
            <div className="mt-2">Add platforms in the Platforms section to see scheduling insights.</div>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-6">
        <Button 
          className="w-full" 
          onClick={() => processPostsMutation.mutate()}
          disabled={processPostsMutation.isPending}
        >
          {processPostsMutation.isPending ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Processing posts...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Manually Process Pending Posts
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}