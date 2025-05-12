import React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  RefreshCw, 
  Lightbulb, 
  TrendingUp, 
  Zap, 
  Clock, 
  Target,
  BarChart,
  Sparkles,
  BookOpen,
  CheckCircle,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface ContentAnalyticsInsightsProps {
  className?: string;
}

interface ContentInsight {
  id: string;
  type: 'tip' | 'recommendation' | 'alert' | 'achievement';
  category: 'content' | 'audience' | 'scheduling' | 'platform';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  createdAt: string;
  readAt?: string;
}

interface ContentAnalyticsInsightsResponse {
  insights: ContentInsight[];
  topRecommendation?: ContentInsight;
  totalInsights: number;
  unreadInsights: number;
}

export function ContentAnalyticsInsights({ className }: ContentAnalyticsInsightsProps) {
  const { toast } = useToast();
  
  // Query to get content insights data
  const insightsQuery = useQuery({
    queryKey: ['/api/analytics/insights'],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/analytics/insights");
      return await res.json() as ContentAnalyticsInsightsResponse;
    },
    retry: 1,
  });
  
  // Mutation to mark insight as read
  const markReadMutation = useMutation({
    mutationFn: async (insightId: string) => {
      const res = await apiRequest("POST", `/api/analytics/insights/${insightId}/read`);
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate insights query to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/insights'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to mark insight as read: " + error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation to generate new AI insights
  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/analytics/insights/generate");
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message || "Generated new insights successfully",
      });
      // Invalidate insights query to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/insights'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to generate insights: " + error.message,
        variant: "destructive",
      });
    },
  });
  
  // Function to refresh insights data
  const refreshData = () => {
    insightsQuery.refetch();
  };
  
  // Handle marking an insight as read
  const handleMarkRead = (insightId: string) => {
    markReadMutation.mutate(insightId);
  };
  
  // Generate new AI insights
  const handleGenerateInsights = () => {
    generateInsightsMutation.mutate();
  };
  
  const isLoading = insightsQuery.isLoading;
  const error = insightsQuery.error;
  const data = insightsQuery.data;

  // Get category icon
  const getCategoryIcon = (category: string, className?: string) => {
    switch (category) {
      case 'content':
        return <BookOpen className={cn("h-4 w-4", className)} />;
      case 'audience':
        return <Target className={cn("h-4 w-4", className)} />;
      case 'scheduling':
        return <Clock className={cn("h-4 w-4", className)} />;
      case 'platform':
        return <BarChart className={cn("h-4 w-4", className)} />;
      default:
        return <Lightbulb className={cn("h-4 w-4", className)} />;
    }
  };
  
  // Get type styling
  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'tip':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-700',
          icon: <Lightbulb className="h-4 w-4" />
        };
      case 'recommendation':
        return {
          bg: 'bg-emerald-100',
          text: 'text-emerald-700',
          icon: <TrendingUp className="h-4 w-4" />
        };
      case 'alert':
        return {
          bg: 'bg-amber-100',
          text: 'text-amber-700',
          icon: <Zap className="h-4 w-4" />
        };
      case 'achievement':
        return {
          bg: 'bg-indigo-100',
          text: 'text-indigo-700',
          icon: <CheckCircle className="h-4 w-4" />
        };
      default:
        return {
          bg: 'bg-neutral-100',
          text: 'text-neutral-700',
          icon: <Sparkles className="h-4 w-4" />
        };
    }
  };
  
  // Get impact badge style
  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return <Badge className="bg-red-500 hover:bg-red-600">High Impact</Badge>;
      case 'medium':
        return <Badge className="bg-amber-500 hover:bg-amber-600">Medium Impact</Badge>;
      case 'low':
        return <Badge variant="outline">Low Impact</Badge>;
      default:
        return null;
    }
  };

  if (error) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle>Content Analytics Insights</CardTitle>
          <CardDescription>AI-powered recommendations to improve your content strategy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-destructive/10 p-4 text-destructive text-sm">
            Error loading insights: {error instanceof Error ? error.message : "Unknown error"}
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
            <CardTitle>Content Analytics Insights</CardTitle>
            <CardDescription>AI-powered recommendations to improve your content strategy</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshData}
              disabled={insightsQuery.isFetching}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", insightsQuery.isFetching && "animate-spin")} />
              Refresh
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleGenerateInsights}
              disabled={generateInsightsMutation.isPending}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Insights
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-36 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
            </div>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {data.topRecommendation && (
              <div className="rounded-lg border bg-primary/5 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full mr-3",
                      "bg-primary text-primary-foreground"
                    )}>
                      <Lightbulb className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-medium">Top Recommendation</h3>
                      <p className="text-sm text-muted-foreground">Highest impact opportunity</p>
                    </div>
                  </div>
                  {getImpactBadge(data.topRecommendation.impact)}
                </div>
                
                <h4 className="text-lg font-medium mb-2">{data.topRecommendation.title}</h4>
                <p className="text-sm text-muted-foreground mb-4">{data.topRecommendation.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-muted-foreground">
                    {getCategoryIcon(data.topRecommendation.category, "mr-1")}
                    <span className="capitalize">{data.topRecommendation.category}</span>
                  </div>
                  
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => handleMarkRead(data.topRecommendation!.id)}
                    disabled={markReadMutation.isPending && markReadMutation.variables === data.topRecommendation.id}
                  >
                    {markReadMutation.isPending && markReadMutation.variables === data.topRecommendation.id ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Mark as Applied
                  </Button>
                </div>
              </div>
            )}
            
            {data.insights.length > 0 ? (
              <>
                <div>
                  <h3 className="text-sm font-medium mb-3">All Insights</h3>
                  <ScrollArea className="h-[360px] rounded-md border">
                    <div className="p-4 space-y-4">
                      {data.insights.map((insight) => {
                        const typeStyle = getTypeStyles(insight.type);
                        
                        return (
                          <div key={insight.id} className="rounded-lg border p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center">
                                <div className={cn(
                                  "flex items-center justify-center w-6 h-6 rounded-full mr-2",
                                  typeStyle.bg, typeStyle.text
                                )}>
                                  {typeStyle.icon}
                                </div>
                                <div className="font-medium">{insight.title}</div>
                              </div>
                              {insight.impact && getImpactBadge(insight.impact)}
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                            
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center">
                                  {getCategoryIcon(insight.category, "mr-1")}
                                  <span className="capitalize">{insight.category}</span>
                                </div>
                                <div>
                                  {new Date(insight.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                              
                              {!insight.readAt && insight.actionable && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => handleMarkRead(insight.id)}
                                  disabled={markReadMutation.isPending && markReadMutation.variables === insight.id}
                                >
                                  {markReadMutation.isPending && markReadMutation.variables === insight.id ? (
                                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                  )}
                                  Mark as Applied
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="shadow-none">
                    <CardContent className="p-4">
                      <div className="flex items-center text-lg font-semibold">
                        <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
                        <div>{data.insights.filter(i => i.type === 'tip').length}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">Tips</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-none">
                    <CardContent className="p-4">
                      <div className="flex items-center text-lg font-semibold">
                        <TrendingUp className="h-5 w-5 mr-2 text-emerald-500" />
                        <div>{data.insights.filter(i => i.type === 'recommendation').length}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">Recommendations</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-none">
                    <CardContent className="p-4">
                      <div className="flex items-center text-lg font-semibold">
                        <CheckCircle className="h-5 w-5 mr-2 text-indigo-500" />
                        <div>{data.insights.filter(i => i.type === 'achievement').length}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">Achievements</div>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <div className="mb-3">
                  <Lightbulb className="w-12 h-12 mx-auto text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-medium mb-2">No insights available</h3>
                <p className="text-sm max-w-md mx-auto mb-4">
                  Generate new AI-powered insights to improve your content strategy based on your analytics data.
                </p>
                <Button onClick={handleGenerateInsights} disabled={generateInsightsMutation.isPending}>
                  {generateInsightsMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Generate Insights
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <div className="mb-3">
              <Lightbulb className="w-12 h-12 mx-auto text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-medium mb-2">No insights available</h3>
            <p className="text-sm max-w-md mx-auto mb-4">
              Generate new AI-powered insights to improve your content strategy based on your analytics data.
            </p>
            <Button onClick={handleGenerateInsights}>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Insights
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-6">
        <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="text-sm text-muted-foreground">
            <p>Insights are generated using AI analysis of your content performance data.</p>
          </div>
          
          <Button variant="outline" size="sm" className="sm:w-auto w-full" onClick={handleGenerateInsights}>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate New Insights
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}