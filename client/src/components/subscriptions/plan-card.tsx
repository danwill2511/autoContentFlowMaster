import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PlanCardProps {
  name: string;
  price: number | string;
  description: string;
  features: string[];
  isPopular?: boolean;
  isCurrent?: boolean;
  onUpgrade?: () => void;
}

export function PlanCard({
  name,
  price,
  description,
  features,
  isPopular = false,
  isCurrent = false,
  onUpgrade
}: PlanCardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const upgradeMutation = useMutation({
    mutationFn: async (tier: string) => {
      const res = await apiRequest("POST", "/api/subscriptions/upgrade", { tier });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/user"], data);
      toast({
        title: "Subscription updated",
        description: `Your subscription has been updated to ${name}.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating subscription",
        description: error.message || "There was an error updating your subscription.",
        variant: "destructive",
      });
    }
  });

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      upgradeMutation.mutate(name.toLowerCase());
    }
  };

  return (
    <div className={`bg-white shadow rounded-lg overflow-hidden relative
      ${isPopular ? 'border-2 border-primary shadow-lg' : 'border border-neutral-200'}`}>
      
      {isPopular && (
        <div className="absolute top-0 right-0 m-1">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
            Popular
          </span>
        </div>
      )}
      
      <div className="p-6">
        <h3 className="text-lg leading-6 font-medium text-neutral-900">{name}</h3>
        <p className="mt-4">
          <span className="text-4xl font-extrabold text-neutral-900">${price}</span>
          {typeof price === 'number' && price > 0 && (
            <span className="text-base font-medium text-neutral-500">/mo</span>
          )}
        </p>
        <p className="mt-4 text-sm text-neutral-500">{description}</p>
        
        <ul className="mt-6 space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex space-x-3">
              {feature.startsWith("No ") ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-sm text-neutral-600">{feature.substring(3)}</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-neutral-600">{feature}</span>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="bg-neutral-50 px-6 py-4">
        {isCurrent ? (
          <Button variant="outline" className="w-full" disabled>
            Current Plan
          </Button>
        ) : (
          <Button 
            className={`w-full ${isPopular ? '' : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'}`}
            variant={isPopular ? "default" : "outline"}
            onClick={handleUpgrade}
            disabled={upgradeMutation.isPending}
          >
            {upgradeMutation.isPending ? 'Processing...' : 'Upgrade'}
          </Button>
        )}
      </div>
    </div>
  );
}

export default PlanCard;
