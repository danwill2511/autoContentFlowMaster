import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { WorkflowCard } from "@/components/dashboard/workflow-card";
import { NewWorkflowCard } from "@/components/dashboard/new-workflow-card";
import ContentFlowVisualizer from "@/components/workflows/content-flow-visualizer";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Workflow, Platform } from "@shared/schema";

export default function WorkflowsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  
  // Fetch workflows
  const { 
    data: workflows, 
    isLoading: isLoadingWorkflows 
  } = useQuery<Workflow[]>({
    queryKey: ["/api/workflows"],
  });

  // Fetch platforms
  const { 
    data: platforms, 
    isLoading: isLoadingPlatforms 
  } = useQuery<Platform[]>({
    queryKey: ["/api/platforms"],
  });

  // Get platform names for each workflow - this is a simplified approach
  const getWorkflowPlatforms = (workflow: Workflow): string[] => {
    if (!platforms) return [];

    // This is a simplified approach since we don't have direct workflowPlatforms data
    // In a real implementation, you would map workflowPlatforms to actual platform names
    const platformMapping: Record<number, string[]> = {
      1: ["LinkedIn", "Twitter"],
      2: ["Pinterest", "Facebook"],
      3: ["YouTube"],
    };
    
    return platformMapping[workflow.id] || ["Facebook", "Twitter"];
  };

  // Filter and sort workflows
  const filteredWorkflows = workflows?.filter(workflow => {
    // Apply status filter
    if (statusFilter !== "all" && workflow.status !== statusFilter) {
      return false;
    }
    
    // Apply search query
    if (searchQuery && !workflow.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  }) || [];
  
  // Sort workflows
  const sortedWorkflows = [...filteredWorkflows].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
        <div className="px-4 sm:px-0">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-semibold text-neutral-900">Content Workflows</h1>
              <p className="mt-1 text-sm text-neutral-500">
                Manage your automated content workflows across all platforms.
              </p>
            </div>
          </div>
          
          <div className="mt-6">
            <Tabs defaultValue="all" onValueChange={setStatusFilter}>
              <div className="flex justify-between flex-wrap gap-4">
                <TabsList>
                  <TabsTrigger value="all">All Workflows</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="paused">Paused</TabsTrigger>
                </TabsList>
                
                <div className="flex space-x-2">
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                    <Input
                      type="text"
                      placeholder="Search workflows..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <Select defaultValue="newest" onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                      <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                      <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <TabsContent value="all" className="mt-6">
                {renderWorkflows(sortedWorkflows, isLoadingWorkflows, isLoadingPlatforms, getWorkflowPlatforms)}
              </TabsContent>
              
              <TabsContent value="active" className="mt-6">
                {renderWorkflows(
                  sortedWorkflows.filter(w => w.status === 'active'),
                  isLoadingWorkflows,
                  isLoadingPlatforms,
                  getWorkflowPlatforms
                )}
              </TabsContent>
              
              <TabsContent value="paused" className="mt-6">
                {renderWorkflows(
                  sortedWorkflows.filter(w => w.status === 'paused'),
                  isLoadingWorkflows,
                  isLoadingPlatforms,
                  getWorkflowPlatforms
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function renderWorkflows(
  workflows: Workflow[],
  isLoadingWorkflows: boolean,
  isLoadingPlatforms: boolean,
  getWorkflowPlatforms: (workflow: Workflow) => string[],
  onSelectWorkflow?: (workflow: Workflow) => void
) {
  if (isLoadingWorkflows || isLoadingPlatforms) {
    return (
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
    );
  }
  
  if (workflows.length === 0) {
    return (
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
        <h3 className="mt-2 text-sm font-medium text-neutral-900">No workflows found</h3>
        <p className="mt-1 text-sm text-neutral-500">
          No matching workflows were found. Try changing your filters or create a new workflow.
        </p>
        <div className="mt-6">
          <Button asChild>
            <a href="/create-workflow">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Workflow
            </a>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {workflows.map((workflow) => (
        <WorkflowCard 
          key={workflow.id} 
          workflow={workflow} 
          platforms={getWorkflowPlatforms(workflow)}
          onClick={onSelectWorkflow ? () => onSelectWorkflow(workflow) : undefined}
        />
      ))}
      <NewWorkflowCard />
    </div>
  );
}
