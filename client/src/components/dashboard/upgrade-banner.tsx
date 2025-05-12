import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { SubscriptionTier, subscriptionTiers } from "@shared/schema";

interface UpgradeBannerProps {
  workflowCount: number;
}

export function UpgradeBanner({ workflowCount }: UpgradeBannerProps) {
  const { user } = useAuth();
  
  if (!user) return null;
  
  const currentTier = user.subscription as SubscriptionTier;
  const maxWorkflows = subscriptionTiers[currentTier].maxWorkflows;
  
  // Only show upgrade banner if using a significant portion of their limit
  const isNearLimit = workflowCount >= maxWorkflows * 0.6;
  
  if (!isNearLimit || currentTier === "business") return null;
  
  // Determine next tier to suggest
  const getNextTier = (): SubscriptionTier => {
    switch (currentTier) {
      case "free": return "essential";
      case "essential": return "pro";
      case "pro": return "business";
      default: return "essential";
    }
  };
  
  const nextTier = getNextTier();
  const nextTierMaxWorkflows = subscriptionTiers[nextTier].maxWorkflows;
  
  return (
    <div className="bg-gradient-to-r from-primary to-secondary-500 rounded-lg shadow-lg overflow-hidden">
      <div className="px-4 py-5 sm:p-6 md:flex md:items-center md:justify-between">
        <div className="max-w-xl">
          <h3 className="text-lg leading-6 font-medium text-white">Upgrade to {nextTier.charAt(0).toUpperCase() + nextTier.slice(1)} Plan</h3>
          <div className="mt-2 text-sm text-primary-100">
            <p>You are currently using {workflowCount} out of {maxWorkflows} available workflows in your {currentTier} plan. Upgrade to {nextTier} for up to {nextTierMaxWorkflows} workflows and advanced features.</p>
          </div>
        </div>
        <div className="mt-5 md:mt-0 md:ml-6 flex">
          <Button variant="secondary" asChild>
            <Link href="/subscription">View Plans</Link>
          </Button>
          <Button className="ml-3 bg-primary-700 hover:bg-primary-800" asChild>
            <Link href="/subscription?upgrade=true">Upgrade Now</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default UpgradeBanner;
