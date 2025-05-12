
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

interface UpgradeBannerProps {
  workflowCount: number;
}

export default function UpgradeBanner({ workflowCount }: UpgradeBannerProps) {
  const { user } = useAuth();
  
  if (!user) return null;
  
  // Get max workflows based on subscription tier
  const getMaxWorkflows = () => {
    switch (user.subscription) {
      case "free":
        return 2;
      case "essential":
        return 5;
      case "pro":
        return 10;
      case "business":
        return 9999; // Effectively unlimited
      default:
        return 2;
    }
  };
  
  const maxWorkflows = getMaxWorkflows();
  const workflowPercentage = Math.min(Math.round((workflowCount / maxWorkflows) * 100), 100);
  
  // Only show if on free plan or approaching limit
  if (
    (user.subscription === "business") || 
    (user.subscription !== "free" && workflowPercentage < 80)
  ) {
    return null;
  }

  return (
    <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-md">
      <div className="p-6 md:p-8 md:flex md:items-center md:justify-between">
        <div className="max-w-xl">
          <h3 className="text-lg font-medium text-white">
            {user.subscription === "free" 
              ? "Upgrade to unlock more workflows and features" 
              : "You're approaching your workflow limit"}
          </h3>
          <p className="mt-2 text-indigo-100">
            {user.subscription === "free" 
              ? "You're currently using the free plan with limited features. Upgrade to create more workflows and access premium features."
              : `You're using ${workflowCount} of ${maxWorkflows} available workflows (${workflowPercentage}%). Upgrade to add more.`}
          </p>
          
          {/* Progress bar for subscription usage */}
          <div className="mt-4 bg-white bg-opacity-20 rounded-full h-2.5">
            <div 
              className="bg-white h-2.5 rounded-full" 
              style={{ width: `${workflowPercentage}%` }}
            ></div>
          </div>
          <p className="mt-1 text-xs text-indigo-100">
            {workflowCount} of {maxWorkflows} workflows
          </p>
        </div>
        <div className="mt-6 md:mt-0 md:ml-8">
          <Button asChild variant="secondary" className="w-full md:w-auto">
            <Link href="/subscription">
              Upgrade Now
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
