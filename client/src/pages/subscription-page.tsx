import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import PlanCard from "@/components/subscriptions/plan-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SubscriptionTier } from "@shared/schema";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

interface PayPalConfig {
  clientId: string;
  plans: Record<string, { id: string; price: number; name: string }>;
}

export default function SubscriptionPage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier | null>(null);
  const [paypalConfig, setPaypalConfig] = useState<PayPalConfig | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  // Get subscriptions data
  const { data: subscriptions, isLoading: isLoadingSubscriptions } = useQuery({
    queryKey: ["/api/subscriptions"],
    enabled: !!user,
  });

  // Get PayPal configuration
  const { data: paypalData, isLoading: isLoadingPaypal } = useQuery({
    queryKey: ["/api/paypal/setup"],
    enabled: !!user,
    onSuccess: (data) => {
      setPaypalConfig(data);
    },
  });

  // Upgrade subscription mutation
  const upgradeMutation = useMutation({
    mutationFn: async (tier: SubscriptionTier) => {
      const res = await apiRequest("POST", "/api/subscriptions/upgrade", { tier });
      return await res.json();
    },
    onSuccess: (data) => {
      updateUser(data);
      toast({
        title: "Subscription upgraded",
        description: `Your account has been upgraded to the ${selectedPlan} plan.`,
      });
      setSelectedPlan(null);
      setShowPayment(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Upgrade failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePlanSelect = (plan: SubscriptionTier) => {
    if (plan === user?.subscription) {
      toast({
        title: "Current plan",
        description: "You are already subscribed to this plan.",
      });
      return;
    }

    if (plan === "free") {
      upgradeMutation.mutate("free");
      return;
    }

    setSelectedPlan(plan);
    setShowPayment(true);
  };

  const handleOrderSuccess = (orderId: string) => {
    if (selectedPlan) {
      upgradeMutation.mutate(selectedPlan);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
        <div className="px-4 sm:px-0 mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900">Subscription Plans</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Choose the perfect plan for your content creation needs
          </p>
        </div>

        {isLoadingSubscriptions ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 px-4 sm:px-0">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-12 w-20 mb-4" />
                <div className="space-y-2 mb-6">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 px-4 sm:px-0">
            <PlanCard
              name="Free"
              price={0}
              features={subscriptions?.free.features || []}
              isActive={user?.subscription === "free"}
              onSelect={() => handlePlanSelect("free")}
            />

            <PlanCard
              name="Essential"
              price={subscriptions?.essential.price || 14}
              features={subscriptions?.essential.features || []}
              isActive={user?.subscription === "essential"}
              onSelect={() => handlePlanSelect("essential")}
            />

            <PlanCard
              name="Pro"
              price={subscriptions?.pro.price || 29}
              features={subscriptions?.pro.features || []}
              isActive={user?.subscription === "pro"}
              onSelect={() => handlePlanSelect("pro")}
              isPopular
            />

            <PlanCard
              name="Business"
              price={subscriptions?.business.price || 79}
              features={subscriptions?.business.features || []}
              isActive={user?.subscription === "business"}
              onSelect={() => handlePlanSelect("business")}
            />
          </div>
        )}

        {showPayment && selectedPlan && paypalConfig && (
          <div className="mt-12 bg-white p-6 rounded-lg shadow-sm border border-neutral-200 max-w-md mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-neutral-900">
                Complete Your Subscription
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                You're upgrading to the {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} plan
              </p>
            </div>

            <PayPalScriptProvider options={{ "client-id": paypalConfig.clientId }}>
              <PayPalButtons
                style={{ layout: "vertical" }}
                createOrder={async () => {
                  try {
                    const planId = paypalConfig.plans[selectedPlan].id;
                    const response = await apiRequest("POST", "/api/paypal/order", { planId });
                    const data = await response.json();
                    return data.orderID;
                  } catch (error) {
                    console.error("Error creating order:", error);
                    throw error;
                  }
                }}
                onApprove={async (data) => {
                  try {
                    await apiRequest("POST", `/api/paypal/order/${data.orderID}/capture`);
                    handleOrderSuccess(data.orderID);
                  } catch (error) {
                    console.error("Error capturing order:", error);
                    toast({
                      title: "Payment failed",
                      description: "There was an error processing your payment.",
                      variant: "destructive",
                    });
                  }
                }}
              />
            </PayPalScriptProvider>

            <div className="mt-4 text-center">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedPlan(null);
                  setShowPayment(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="mt-16 px-4 sm:px-0">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-neutral-900">Can I upgrade or downgrade my plan?</h3>
              <p className="mt-2 text-neutral-600">
                Yes, you can upgrade your plan at any time. Downgrades will take effect at the end of your current billing cycle.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-neutral-900">How does billing work?</h3>
              <p className="mt-2 text-neutral-600">
                All plans are billed monthly via PayPal. You can cancel your subscription at any time.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-neutral-900">What happens if I exceed my workflow limit?</h3>
              <p className="mt-2 text-neutral-600">
                If you reach your workflow limit, you'll need to upgrade to a higher plan or archive existing workflows to create new ones.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-neutral-900">Do you offer refunds?</h3>
              <p className="mt-2 text-neutral-600">
                We offer a 7-day money-back guarantee for all paid plans. Contact our support if you're not satisfied with your subscription.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}