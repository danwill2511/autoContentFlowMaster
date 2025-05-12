
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

// Page imports
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import CreateWorkflowPage from "@/pages/create-workflow-page";
import WorkflowsPage from "@/pages/workflows-page";
import PlatformsPage from "@/pages/platforms-page";
import ShowcasePage from "@/pages/showcase-page";
import AIContentGenerationPage from "@/pages/ai-content-generation";
import WorkflowAutomationPage from "@/pages/workflow-automation";
import MultiPlatformPublishingPage from "@/pages/multi-platform-publishing";
import SubscriptionPage from "@/pages/subscription-page";
import AnalyticsDashboardPage from "@/pages/analytics-dashboard-page";

// Resource pages
import DocumentationPage from "@/pages/documentation-page";
import ApiReferencePage from "@/pages/api-reference-page";
import ContentLibraryPage from "@/pages/content-library-page";
import FAQPage from "@/pages/faq-page";

// Company pages
import AboutUsPage from "@/pages/about-us-page";
import BlogPage from "@/pages/blog-page";
import CareersPage from "@/pages/careers-page";
import ContactPage from "@/pages/contact-page";

function Router() {
  return (
    <Switch>
      {/* Main app routes */}
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/workflows" component={WorkflowsPage} />
      <ProtectedRoute path="/workflows/create" component={CreateWorkflowPage} />
      <ProtectedRoute path="/platforms" component={PlatformsPage} />
      <ProtectedRoute path="/showcase" component={ShowcasePage} />
      <ProtectedRoute path="/subscription" component={SubscriptionPage} />
      <ProtectedRoute path="/analytics" component={AnalyticsDashboardPage} />
      
      {/* Feature pages */}
      <Route path="/ai-content-generation" component={AIContentGenerationPage} />
      <Route path="/workflow-automation" component={WorkflowAutomationPage} />
      <Route path="/multi-platform-publishing" component={MultiPlatformPublishingPage} />
      
      {/* Resource pages */}
      <Route path="/documentation" component={DocumentationPage} />
      <Route path="/api-reference" component={ApiReferencePage} />
      <Route path="/content-library" component={ContentLibraryPage} />
      <Route path="/faq" component={FAQPage} />
      
      {/* Company pages */}
      <Route path="/about-us" component={AboutUsPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/careers" component={CareersPage} />
      <Route path="/contact" component={ContactPage} />
      
      {/* Auth */}
      <Route path="/auth" component={AuthPage} />
      
      {/* Catch-all for 404 */}
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
