import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  X, 
  CreditCard, 
  Sparkles, 
  Zap, 
  Lock, 
  Users, 
  BarChart, 
  Database 
} from "lucide-react";
import { subscriptionTiers } from "@shared/schema";
import type { SubscriptionTier } from "@shared/schema";

// Define plan features
interface PlanFeature {
  name: string;
  free: boolean | string;
  essential: boolean | string;
  pro: boolean | string;
  business: boolean | string;
  icon?: React.ReactNode;
}

export default function SubscriptionPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [paypalInitialized, setPaypalInitialized] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);

  // Get current subscription
  const { data: subscription, isLoading } = useQuery({
    queryKey: ["/api/subscription"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/subscription");
      return await res.json();
    },
    enabled: !!user,
  });

  // Upgrade subscription mutation
  const upgradeSubscription = useMutation({
    mutationFn: async (tier: SubscriptionTier) => {
      const res = await apiRequest("POST", "/api/subscription/upgrade", { tier });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Subscription updated",
        description: "Your subscription has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update subscription",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle upgrade click
  const handleUpgradeClick = (tier: SubscriptionTier) => {
    setSelectedTier(tier);
    // In a real implementation, this would trigger the PayPal payment flow
    upgradeSubscription.mutate(tier);
  };

  // Features for each subscription tier
  const features: PlanFeature[] = [
    {
      name: "Content Workflows",
      free: "3",
      essential: "10",
      pro: "25",
      business: "Unlimited",
      icon: <Database className="h-4 w-4" />,
    },
    {
      name: "AI Generated Content",
      free: "10/month",
      essential: "50/month",
      pro: "200/month",
      business: "1000/month",
      icon: <Sparkles className="h-4 w-4" />,
    },
    {
      name: "Social Media Platforms",
      free: "2",
      essential: "5",
      pro: "10",
      business: "Unlimited",
      icon: <Users className="h-4 w-4" />,
    },
    {
      name: "Analytics",
      free: "Basic",
      essential: "Standard",
      pro: "Advanced",
      business: "Enterprise",
      icon: <BarChart className="h-4 w-4" />,
    },
    {
      name: "Custom Workflows",
      free: false,
      essential: true,
      pro: true,
      business: true,
      icon: <Zap className="h-4 w-4" />,
    },
    {
      name: "Priority Support",
      free: false,
      essential: false,
      pro: true,
      business: true,
      icon: <Lock className="h-4 w-4" />,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-10">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold">Subscription Plans</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect plan for your content creation needs. Upgrade anytime to access more features and capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Free Plan */}
            <Card className="relative border-2 border-muted">
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>For individuals just getting started</CardDescription>
                <div className="mt-1">
                  <span className="text-3xl font-bold">$0</span>
                  <span className="text-muted-foreground"> /month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 min-h-[220px]">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      {feature.icon}
                      <span>{feature.name}: </span>
                      {typeof feature.free === "boolean" ? (
                        feature.free ? (
                          <Check className="h-4 w-4 text-green-500 ml-auto" />
                        ) : (
                          <X className="h-4 w-4 text-red-500 ml-auto" />
                        )
                      ) : (
                        <span className="ml-auto font-medium">{feature.free}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled={subscription?.tier === "free"}
                >
                  {subscription?.tier === "free" ? "Current Plan" : "Downgrade"}
                </Button>
              </CardFooter>
            </Card>

            {/* Essential Plan */}
            <Card className="relative border-2 border-muted">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge variant="outline" className="bg-background">
                  Popular
                </Badge>
              </div>
              <CardHeader>
                <CardTitle>Essential</CardTitle>
                <CardDescription>For content creators building their presence</CardDescription>
                <div className="mt-1">
                  <span className="text-3xl font-bold">$9.99</span>
                  <span className="text-muted-foreground"> /month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 min-h-[220px]">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      {feature.icon}
                      <span>{feature.name}: </span>
                      {typeof feature.essential === "boolean" ? (
                        feature.essential ? (
                          <Check className="h-4 w-4 text-green-500 ml-auto" />
                        ) : (
                          <X className="h-4 w-4 text-red-500 ml-auto" />
                        )
                      ) : (
                        <span className="ml-auto font-medium">{feature.essential}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  disabled={subscription?.tier === "essential"}
                  onClick={() => handleUpgradeClick("essential")}
                >
                  {subscription?.tier === "essential" ? "Current Plan" : 
                   subscription?.tier === "pro" || subscription?.tier === "business" ? "Downgrade" : "Upgrade"}
                </Button>
              </CardFooter>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-2 border-primary">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  Recommended
                </Badge>
              </div>
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <CardDescription>For professionals managing multiple channels</CardDescription>
                <div className="mt-1">
                  <span className="text-3xl font-bold">$24.99</span>
                  <span className="text-muted-foreground"> /month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 min-h-[220px]">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      {feature.icon}
                      <span>{feature.name}: </span>
                      {typeof feature.pro === "boolean" ? (
                        feature.pro ? (
                          <Check className="h-4 w-4 text-green-500 ml-auto" />
                        ) : (
                          <X className="h-4 w-4 text-red-500 ml-auto" />
                        )
                      ) : (
                        <span className="ml-auto font-medium">{feature.pro}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  disabled={subscription?.tier === "pro"}
                  onClick={() => handleUpgradeClick("pro")}
                >
                  {subscription?.tier === "pro" ? "Current Plan" : 
                   subscription?.tier === "business" ? "Downgrade" : "Upgrade"}
                </Button>
              </CardFooter>
            </Card>

            {/* Business Plan */}
            <Card className="relative border-2 border-muted">
              <CardHeader>
                <CardTitle>Business</CardTitle>
                <CardDescription>For teams and agencies with advanced needs</CardDescription>
                <div className="mt-1">
                  <span className="text-3xl font-bold">$49.99</span>
                  <span className="text-muted-foreground"> /month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 min-h-[220px]">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      {feature.icon}
                      <span>{feature.name}: </span>
                      {typeof feature.business === "boolean" ? (
                        feature.business ? (
                          <Check className="h-4 w-4 text-green-500 ml-auto" />
                        ) : (
                          <X className="h-4 w-4 text-red-500 ml-auto" />
                        )
                      ) : (
                        <span className="ml-auto font-medium">{feature.business}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  disabled={subscription?.tier === "business"}
                  onClick={() => handleUpgradeClick("business")}
                >
                  {subscription?.tier === "business" ? "Current Plan" : "Upgrade"}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="bg-muted/50 rounded-lg p-6 mt-8">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Secure Payments</h3>
                <p className="text-muted-foreground mt-1">
                  All payments are processed securely through PayPal. We never store your payment information.
                  Subscriptions can be canceled at any time from your account settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}