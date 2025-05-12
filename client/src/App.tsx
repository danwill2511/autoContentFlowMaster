import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ReplitAuthProvider } from "@/hooks/use-replit-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { ErrorBoundary } from "@/components/error-boundary";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import CreateWorkflowPage from "@/pages/create-workflow-page";
import WorkflowsPage from "@/pages/workflows-page";
import SubscriptionPage from "@/pages/subscription-page";
import AnalyticsDashboardPage from "@/pages/analytics-dashboard-page";
import PlatformsPage from "@/pages/platforms-page";
import ShowcasePage from "@/pages/showcase-page";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/workflows" component={WorkflowsPage} />
      <ProtectedRoute path="/workflows/create" component={CreateWorkflowPage} />
      <ProtectedRoute path="/platforms" component={PlatformsPage} />
      <ProtectedRoute path="/analytics" component={AnalyticsDashboardPage} />
      <ProtectedRoute path="/subscription" component={SubscriptionPage} />
      <ProtectedRoute path="/showcase" component={ShowcasePage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
      <AuthProvider>
        <ReplitAuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ReplitAuthProvider>
      </AuthProvider>
    </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;