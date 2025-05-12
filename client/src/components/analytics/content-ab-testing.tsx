
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function ContentABTesting() {
  const [selectedTest, setSelectedTest] = useState<string | null>(null);

  const { data: activeTests } = useQuery({
    queryKey: ["ab-tests"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/analytics/ab-tests");
      return res.json();
    }
  });

  const createTestMutation = useMutation({
    mutationFn: async (testData: any) => {
      const res = await apiRequest("POST", "/api/analytics/ab-tests", testData);
      return res.json();
    }
  });

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">A/B Testing</h2>
      <div className="space-y-4">
        {activeTests?.map((test: any) => (
          <div key={test.id} className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">{test.name}</h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Version A</p>
                <Progress value={test.versionAPerformance} className="mt-1" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Version B</p>
                <Progress value={test.versionBPerformance} className="mt-1" />
              </div>
            </div>
          </div>
        ))}
        
        <Button onClick={() => createTestMutation.mutate({
          name: "New Test",
          versionA: {},
          versionB: {}
        })}>
          Create New Test
        </Button>
      </div>
    </Card>
  );
}
