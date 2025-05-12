
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Workflow } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface WorkflowCardProps {
  workflow: Workflow;
  platforms: string[];
}

export function WorkflowCard({ workflow, platforms }: WorkflowCardProps) {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
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
  
  const getFrequencyText = (frequency: string) => {
    switch(frequency) {
      case "daily": return "Daily";
      case "weekly": return "Weekly";
      case "bi-weekly": return "Bi-weekly";
      case "monthly": return "Monthly";
      default: return frequency;
    }
  };
  
  // Toggle workflow status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async () => {
      const newStatus = workflow.status === "active" ? "paused" : "active";
      const res = await apiRequest("PUT", `/api/workflows/${workflow.id}/status`, { status: newStatus });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
      toast({
        title: `Workflow ${workflow.status === "active" ? "paused" : "activated"}`,
        description: `"${workflow.name}" has been ${workflow.status === "active" ? "paused" : "activated"}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update workflow",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete workflow mutation
  const deleteWorkflowMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/workflows/${workflow.id}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete workflow");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
      toast({
        title: "Workflow deleted",
        description: `"${workflow.name}" has been deleted.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete workflow",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleDelete = () => {
    deleteWorkflowMutation.mutate();
    setIsDeleteDialogOpen(false);
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden border border-neutral-200">
      <div className="px-4 py-5 sm:px-6 border-b border-neutral-200 bg-neutral-50">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-neutral-900 truncate">
              {workflow.name}
            </h3>
            <p className="mt-1 text-sm text-neutral-500">
              {getFrequencyText(workflow.frequency)} · {workflow.contentType}
            </p>
          </div>
          <Badge variant={workflow.status === "active" ? "default" : "secondary"} className={workflow.status === "active" ? "bg-green-500 hover:bg-green-600" : ""}>
            {workflow.status === "active" ? "Active" : "Paused"}
          </Badge>
        </div>
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        {/* Platforms */}
        <div className="flex flex-wrap gap-2 mb-4">
          {platforms.map((platform) => (
            <div
              key={platform}
              className="flex items-center bg-neutral-100 px-3 py-1 rounded-full"
            >
              <div className="mr-1">{getPlatformIcon(platform)}</div>
              <span className="text-xs font-medium">{platform}</span>
            </div>
          ))}
        </div>
        
        {/* Topics */}
        <div className="mt-4">
          <h4 className="text-sm font-medium text-neutral-700">Topics</h4>
          <p className="mt-1 text-sm text-neutral-600">
            {workflow.topics}
          </p>
        </div>
        
        {/* Next post */}
        {workflow.nextPostDate && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-neutral-700">Next post</h4>
            <p className="mt-1 text-sm text-neutral-600">
              {new Date(workflow.nextPostDate).toLocaleDateString()} at{" "}
              {new Date(workflow.nextPostDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        )}
      </div>
      
      <div className="px-4 py-4 sm:px-6 bg-neutral-50 border-t border-neutral-200 flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => toggleStatusMutation.mutate()}
          disabled={toggleStatusMutation.isPending}
        >
          {workflow.status === "active" ? "Pause" : "Activate"}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          asChild
        >
          <a href={`/workflow/${workflow.id}/posts`}>View Posts</a>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <a href={`/workflow/${workflow.id}/edit`}>Edit workflow</a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={`/workflow/${workflow.id}/posts`}>View posts</a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={`/workflow/${workflow.id}/analytics`}>Analytics</a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              Delete workflow
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete workflow</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{workflow.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
