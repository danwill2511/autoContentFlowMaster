import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { StatsCard } from "@/components/dashboard/stats-card";
import { WorkflowCard } from "@/components/dashboard/workflow-card";
import { NewWorkflowCard } from "@/components/dashboard/new-workflow-card";
import { UpgradeBanner } from "@/components/dashboard/upgrade-banner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Workflow, Platform } from "@shared/schema";

export default function DashboardPage() {
  const { user } = useAuth();

  // Fetch workflows
  const { 
    data: workflows, 
    isLoading: isLoadingWorkflows 
  } = useQuery<Workflow[]>({
    queryKey: ["/api/workflows"],
    enabled: !!user,
  });

  // Fetch platforms
  const { 
    data: platforms, 
    isLoading: isLoadingPlatforms 
  } = useQuery<Platform[]>({
    queryKey: ["/api/platforms"],
    enabled: !!user,
  });

  // Get platform names for each workflow
  const getWorkflowPlatforms = (workflow: Workflow): string[] => {
    if (!platforms) return [];

    // This is a simplified approach since we don't have direct workflowPlatforms data
    // In a real implementation, you would map workflowPlatforms to actual platform names
    // For now, we'll just return some example platforms based on workflow ID to show the concept
    const platformMapping: Record<number, string[]> = {
      1: ["LinkedIn", "Twitter"],
      2: ["Pinterest", "Facebook"],
      3: ["YouTube"],
    };
    
    return platformMapping[workflow.id] || ["Facebook", "Twitter"];
  };

  // Calculate stats
  const activeWorkflows = workflows?.filter(w => w.status === 'active').length || 0;
  const totalPosts = 18; // This would come from API in a real implementation
  const totalViews = "24.8k"; // This would come from API in a real implementation
  const maxWorkflows = user?.subscription === "free" ? 2 : 
                     user?.subscription === "essential" ? 5 :
                     user?.subscription === "pro" ? 10 : 100;
  const planUsage = `${workflows?.length || 0}/${maxWorkflows}`;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
        {/* PageHeader */}
        <div className="px-4 sm:px-0 mb-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900">
                Welcome back, {user?.name || user?.username}!
              </h1>
              <p className="mt-1 text-sm text-neutral-500">
                Here's what's happening with your content workflows today.
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button asChild>
                <Link href="/create-workflow">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  New Workflow
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* WorkflowStats */}
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 px-4 sm:px-0">
          <StatsCard
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            }
            title="Active Workflows"
            value={activeWorkflows}
            bgColor="bg-primary-100"
            textColor="text-primary-600"
          />

          <StatsCard
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11h2v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            }
            title="Posts This Week"
            value={totalPosts}
            bgColor="bg-green-100"
            textColor="text-green-600"
          />

          <StatsCard
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            }
            title="Total Views"
            value={totalViews}
            bgColor="bg-blue-100"
            textColor="text-blue-600"
          />

          <StatsCard
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            }
            title="Plan Usage"
            value={
              <span>
                {planUsage}{" "}
                <span className="text-sm text-neutral-500">workflows</span>
              </span>
            }
            bgColor="bg-yellow-100"
            textColor="text-yellow-600"
          />
        </div>

        {/* UpgradeBanner */}
        {workflows && <UpgradeBanner workflowCount={workflows.length} />}

        {/* WorkflowList */}
        <div className="mt-8 px-4 sm:px-0">
          <h2 className="text-lg font-medium text-neutral-900 mb-4">Your Content Workflows</h2>
          
          {isLoadingWorkflows || isLoadingPlatforms ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white shadow rounded-lg overflow-hidden border border-neutral-200">
                  <div className="px-4 py-5 sm:px-6 border-b border-neutral-200 bg-neutral-50">
                    <Skeleton className="h-6 w-36 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {[1, 2].map((j) => (
                        <Skeleton key={j} className="h-10 w-10 rounded-lg" />
                      ))}
                    </div>
                    <div className="mt-4 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                  <div className="px-4 py-4 sm:px-6 bg-neutral-50 border-t border-neutral-200 flex justify-between">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : workflows && workflows.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {workflows.map((workflow) => (
                <WorkflowCard 
                  key={workflow.id} 
                  workflow={workflow} 
                  platforms={getWorkflowPlatforms(workflow)} 
                />
              ))}
              <NewWorkflowCard />
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow border border-neutral-200">
              <svg
                className="mx-auto h-12 w-12 text-neutral-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-neutral-900">No workflows</h3>
              <p className="mt-1 text-sm text-neutral-500">
                Get started by creating your first content workflow.
              </p>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/create-workflow">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    New Workflow
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
