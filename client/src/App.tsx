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

// Placeholder components - replace with actual implementations
const AIContentGenerationPage = () => <div>AI Content Generation</div>;
const WorkflowAutomationPage = () => <div>Workflow Automation</div>;
const MultiPlatformPublishingPage = () => <div>Multi-Platform Publishing</div>;

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/workflows" component={WorkflowsPage} />
      <ProtectedRoute path="/workflows/create" component={CreateWorkflowPage} />
      <ProtectedRoute path="/platforms" component={PlatformsPage} />
      <ProtectedRoute path="/showcase" component={ShowcasePage} />
      <Route path="/ai-content-generation" component={AIContentGenerationPage} />
      <Route path="/workflow-automation" component={WorkflowAutomationPage} />
      <Route path="/multi-platform-publishing" component={MultiPlatformPublishingPage} />
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