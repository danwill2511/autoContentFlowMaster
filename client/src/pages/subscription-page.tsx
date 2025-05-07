import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import PlanCard from "@/components/subscriptions/plan-card";
import PayPalButton from "@/components/PayPalButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SubscriptionTier, subscriptionTiers } from "@shared/schema";

interface PaymentInfo {
  amount: string;
  tier: SubscriptionTier;
}

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [location, setParams] = useLocation();
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [paymentTab, setPaymentTab] = useState("monthly");
  
  // Get the upgrade param from the URL if present
  const params = new URLSearchParams(window.location.search);
  const upgradeParam = params.get("upgrade");
  
  // Show the dialog if the user is directed here with upgrade=true
  useEffect(() => {
    if (upgradeParam === "true" && user) {
      // Determine the next tier to suggest based on current subscription
      const currentTier = user.subscription as SubscriptionTier;
      const nextTier = getNextTier(currentTier);
      
      // Set payment info for the next tier
      const tierInfo = subscriptionTiers[nextTier];
      if (tierInfo && 'price' in tierInfo) {
        setPaymentInfo({
          amount: tierInfo.price.toString(),
          tier: nextTier
        });
        
        // Open the payment dialog
        setShowDialog(true);
      }
    }
  }, [upgradeParam, user]);
  
  // Helper to get the next tier
  const getNextTier = (currentTier: SubscriptionTier): SubscriptionTier => {
    switch (currentTier) {
      case "free": return "essential";
      case "essential": return "pro";
      case "pro": return "business";
      default: return "essential";
    }
  };
  
  // Handle upgrade button click
  const handleUpgrade = (tier: SubscriptionTier, price: number) => {
    if (price === 0) return; // Free tier doesn't need payment
    
    setPaymentInfo({
      amount: price.toString(),
      tier
    });
    
    setShowDialog(true);
  };
  
  // Create feature list for each plan
  const getFeatures = (tier: SubscriptionTier) => {
    const tierInfo = subscriptionTiers[tier];
    const features = [];
    
    if (tier !== 'free') {
      features.push(`${tierInfo.maxWorkflows} Workflows`);
    } else {
      features.push(`${tierInfo.maxWorkflows} Workflows`);
    }
    
    // Add the specific features from the schema
    if (tierInfo.features) {
      features.push(...tierInfo.features.filter(f => 
        !f.includes('Workflows') // Already added above
      ));
    }
    
    return features;
  };
  
  const currentTier = user?.subscription as SubscriptionTier || "free";

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
        <div className="px-4 sm:px-0 mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900">Subscription Plans</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Choose the right plan for your content creation needs.
          </p>
        </div>
        
        <Tabs defaultValue="monthly" onValueChange={setPaymentTab} className="mb-8">
          <div className="flex justify-center mb-6">
            <TabsList>
              <TabsTrigger value="monthly">Monthly Billing</TabsTrigger>
              <TabsTrigger value="annual">Annual Billing <span className="ml-1.5 text-xs bg-green-100 text-green-800 rounded-full px-2 py-0.5">Save 20%</span></TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="monthly">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <PlanCard
                name="Free"
                price={0}
                description="Perfect for beginners who are just starting with automated content."
                features={getFeatures('free')}
                isCurrent={currentTier === 'free'}
              />
              
              <PlanCard
                name="Essential"
                price={14}
                description="Great for content creators building their online presence."
                features={getFeatures('essential')}
                isPopular={true}
                isCurrent={currentTier === 'essential'}
                onUpgrade={() => handleUpgrade('essential', 14)}
              />
              
              <PlanCard
                name="Pro"
                price={29}
                description="For serious content creators who need more power."
                features={getFeatures('pro')}
                isCurrent={currentTier === 'pro'}
                onUpgrade={() => handleUpgrade('pro', 29)}
              />
              
              <PlanCard
                name="Business"
                price={79}
                description="For teams and businesses with extensive content needs."
                features={getFeatures('business')}
                isCurrent={currentTier === 'business'}
                onUpgrade={() => handleUpgrade('business', 79)}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="annual">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <PlanCard
                name="Free"
                price={0}
                description="Perfect for beginners who are just starting with automated content."
                features={getFeatures('free')}
                isCurrent={currentTier === 'free'}
              />
              
              <PlanCard
                name="Essential"
                price={134}
                description="Great for content creators building their online presence."
                features={[...getFeatures('essential'), "Annual billing (save 20%)"] }
                isPopular={true}
                isCurrent={currentTier === 'essential'}
                onUpgrade={() => handleUpgrade('essential', 134)}
              />
              
              <PlanCard
                name="Pro"
                price={278}
                description="For serious content creators who need more power."
                features={[...getFeatures('pro'), "Annual billing (save 20%)"]}
                isCurrent={currentTier === 'pro'}
                onUpgrade={() => handleUpgrade('pro', 278)}
              />
              
              <PlanCard
                name="Business"
                price={758}
                description="For teams and businesses with extensive content needs."
                features={[...getFeatures('business'), "Annual billing (save 20%)"]}
                isCurrent={currentTier === 'business'}
                onUpgrade={() => handleUpgrade('business', 758)}
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <Alert className="mb-8">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>All plans include:</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
              <li className="flex items-center text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                AI-generated content
              </li>
              <li className="flex items-center text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Automated scheduling
              </li>
              <li className="flex items-center text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                All major platforms
              </li>
              <li className="flex items-center text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Basic analytics
              </li>
              <li className="flex items-center text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Email support
              </li>
              <li className="flex items-center text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Mobile web access
              </li>
            </ul>
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>
              Common questions about our subscription plans.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div>
              <h3 className="font-medium text-neutral-900 mb-2">What happens if I exceed my post limit?</h3>
              <p className="text-sm text-neutral-600">
                If you reach your daily post limit, your workflows will pause until the next day. You'll receive a notification so you can upgrade if needed.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-neutral-900 mb-2">Can I change plans at any time?</h3>
              <p className="text-sm text-neutral-600">
                Yes, you can upgrade your plan at any time. When upgrading, you'll be charged the prorated amount for the remainder of your billing cycle.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-neutral-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-sm text-neutral-600">
                We accept all major credit cards and PayPal for subscription payments.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-neutral-900 mb-2">Is there a free trial?</h3>
              <p className="text-sm text-neutral-600">
                Yes, our Free plan is available indefinitely with limited features. You can upgrade anytime you need more capabilities.
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Payment Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upgrade to {paymentInfo?.tier}</DialogTitle>
              <DialogDescription>
                Complete your payment to upgrade your subscription.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{paymentInfo?.tier} Plan</span>
                  <span className="font-bold">${paymentInfo?.amount}</span>
                </div>
                <div className="text-sm text-neutral-500">
                  {paymentTab === "annual" ? "Billed annually" : "Billed monthly"}
                </div>
              </div>
              
              <div className="my-6">
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Pay with PayPal</h4>
                  <div className="flex items-center justify-center border rounded-md p-4 bg-neutral-50">
                    {paymentInfo && (
                      <PayPalButton
                        amount={paymentInfo.amount}
                        currency="USD"
                        intent="capture"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
}
