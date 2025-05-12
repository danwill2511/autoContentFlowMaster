import { useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import WorkflowCard from "@/components/dashboard/workflow-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Workflow } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function WorkflowsPage() {
  const { user } = useAuth();

  // Fetch workflows
  const { 
    data: workflows, 
    isLoading: isLoadingWorkflows 
  } = useQuery<Workflow[]>({
    queryKey: ["/api/workflows"],
    enabled: !!user,
  });

  // Get platform names for each workflow
  const getWorkflowPlatforms = (workflow: Workflow): string[] => {
    // In a real implementation, this would fetch the actual platform data
    // For now, we'll return example platforms
    const platformMapping: Record<number, string[]> = {
      1: ["LinkedIn", "Twitter"],
      2: ["Pinterest", "Facebook"],
      3: ["YouTube"],
    };

    return platformMapping[workflow.id] || [];
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
        {/* PageHeader */}
        <div className="px-4 sm:px-0 mb-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900">
                Content Workflows
              </h1>
              <p className="mt-1 text-sm text-neutral-500">
                Manage and monitor your automated content creation workflows
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

        {/* WorkflowList */}
        <div className="mt-8 px-4 sm:px-0">
          {isLoadingWorkflows ? (
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