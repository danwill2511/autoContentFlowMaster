
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { WorkflowCard } from "@/components/dashboard/workflow-card";
import { ContentFlowVisualizer } from "@/components/workflows/content-flow-visualizer";

export default function WorkflowAutomationPage() {
  const { data: workflows } = useQuery({
    queryKey: ["/api/workflows"],
    queryFn: async () => {
      const response = await fetch("/api/workflows");
      return response.json();
    },
  });

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Workflow Automation</h1>
            <p className="text-muted-foreground">Automate your content publishing workflow</p>
          </div>
          <Button asChild>
            <a href="/workflows/create">Create New Workflow</a>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Active Workflows</CardTitle>
              <CardDescription>Currently running automation workflows</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflows?.map((workflow: any) => (
                  <WorkflowCard key={workflow.id} workflow={workflow} />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workflow Visualization</CardTitle>
              <CardDescription>Visual representation of your content flow</CardDescription>
            </CardHeader>
            <CardContent>
              <ContentFlowVisualizer platforms={workflows?.[0]?.platforms || []} />
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
