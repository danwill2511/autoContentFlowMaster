import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CalendarClock, Check, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ManualSchedulerTriggerProps {
  className?: string;
}

export function ManualSchedulerTrigger({ className }: ManualSchedulerTriggerProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
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
      // Close the dialog
      setTimeout(() => setOpen(false), 1500);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to process pending posts: " + error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn("gap-2", className)}
        >
          <CalendarClock className="h-4 w-4" />
          Trigger Scheduler
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manual Scheduler Trigger</DialogTitle>
          <DialogDescription>
            This will immediately process all pending posts that are due now or overdue.
            Posts scheduled for the future will not be affected.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="rounded-md bg-amber-50 p-4 text-amber-800 text-sm border border-amber-200">
            <p>
              <strong>Note:</strong> This feature is typically used by administrators or when testing.
              The automated scheduler processes posts every 5 minutes automatically.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => processPostsMutation.mutate()}
            disabled={processPostsMutation.isPending}
          >
            {processPostsMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : processPostsMutation.isSuccess ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Done
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Process Now
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}