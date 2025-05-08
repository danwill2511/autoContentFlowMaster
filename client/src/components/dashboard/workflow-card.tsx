import { useLocation, useLocation as useWouterLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Workflow } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface WorkflowCardProps {
  workflow: Workflow;
  platforms: string[];
}

export function WorkflowCard({ workflow, platforms }: WorkflowCardProps) {
  const { toast } = useToast();
  const [location, setLocation] = useWouterLocation();

  const toggleStatus = useMutation({
    mutationFn: async (status: string) => {
      const res = await apiRequest("PUT", `/api/workflows/${workflow.id}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
      toast({
        title: `Workflow ${workflow.status === "active" ? "paused" : "activated"}`,
        description: `"${workflow.name}" has been ${workflow.status === "active" ? "paused" : "activated"}.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating workflow status",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleToggleStatus = () => {
    const newStatus = workflow.status === "active" ? "paused" : "active";
    toggleStatus.mutate(newStatus);
  };

  // Format the next post date
  const formatNextPostDate = () => {
    if (!workflow.nextPostDate) return "Not scheduled";

    const date = new Date(workflow.nextPostDate);
    const today = new Date();

    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    // Check if it's tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    // Otherwise return day of week and time
    return `${date.toLocaleDateString([], { weekday: 'long' })}, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, { icon: React.ReactNode, bgColor: string }> = {
      "LinkedIn": { 
        icon: <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
        bgColor: "bg-blue-100" 
      },
      "Twitter": { 
        icon: <svg className="h-5 w-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>,
        bgColor: "bg-blue-100" 
      },
      "Facebook": { 
        icon: <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
        bgColor: "bg-blue-100" 
      },
      "Pinterest": { 
        icon: <svg className="h-5 w-5 text-red-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/></svg>,
        bgColor: "bg-red-100" 
      },
      "YouTube": { 
        icon: <svg className="h-5 w-5 text-red-600" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
        bgColor: "bg-red-100" 
      }
    };

    return icons[platform] || { 
      icon: <svg className="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>,
      bgColor: "bg-gray-100" 
    };
  };

  return (
    <div className="workflow-card bg-white shadow rounded-lg overflow-hidden border border-neutral-200 hover:shadow-md transition-shadow">
      <div className="px-4 py-5 sm:px-6 border-b border-neutral-200 bg-neutral-50 flex justify-between items-center">
        <button 
          onClick={() => setLocation(`/workflows/${workflow.id}`)} 
          className="text-neutral-900 hover:text-primary-700 text-left"
        >
          <h3 className="text-lg leading-6 font-medium text-neutral-900">{workflow.name}</h3>
        </button>
        <div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            workflow.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {workflow.status === 'active' ? 'Active' : 'Paused'}
          </span>
        </div>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {platforms.map((platform, index) => {
            const { icon, bgColor } = getPlatformIcon(platform);
            return (
              <div key={index} className={`platform-icon flex items-center justify-center h-10 w-10 rounded-lg ${bgColor}`}>
                {icon}
              </div>
            );
          })}
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-sm text-neutral-500 mb-1">
            <span>Next post:</span>
            <span>{formatNextPostDate()}</span>
          </div>
          <div className="flex justify-between text-sm text-neutral-500 mb-1">
            <span>Content type:</span>
            <span>{workflow.contentType}</span>
          </div>
          <div className="flex justify-between text-sm text-neutral-500">
            <span>Frequency:</span>
            <span>{workflow.frequency}</span>
          </div>
        </div>
      </div>
      <div className="px-4 py-4 sm:px-6 bg-neutral-50 border-t border-neutral-200 flex justify-between">
        <Button variant="outline" size="sm" asChild>
          <button onClick={() => setLocation(`/workflows/${workflow.id}/edit`)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Edit
          </button>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleToggleStatus}
          disabled={toggleStatus.isPending}
        >
          {workflow.status === 'active' ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Pause
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Activate
            </>
          )}
        </Button>
        <Button size="sm" asChild>
          <button onClick={() => setLocation(`/workflows/${workflow.id}/analytics`)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            Analytics
          </button>
        </Button>
      </div>
    </div>
  );
}