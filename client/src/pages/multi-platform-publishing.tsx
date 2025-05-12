
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/layout";

export default function MultiPlatformPublishingPage() {
  const { data: platforms } = useQuery({
    queryKey: ["/api/platforms"],
    queryFn: async () => {
      const response = await fetch("/api/platforms");
      return response.json();
    },
  });

  const { data: scheduledPosts } = useQuery({
    queryKey: ["/api/scheduled-posts"],
    queryFn: async () => {
      const response = await fetch("/api/scheduled-posts");
      return response.json();
    },
  });

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Multi-Platform Publishing</h1>
            <p className="text-muted-foreground">Manage and schedule your content across platforms</p>
          </div>
          <Button asChild>
            <a href="/platforms">Connect Platform</a>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Connected Platforms</CardTitle>
              <CardDescription>Your active social media connections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {platforms?.map((platform: any) => (
                  <div key={platform.id} className="flex items-center justify-between p-2 bg-neutral-100 rounded">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-full ${platform.bgColor} flex items-center justify-center`}>
                        {platform.icon}
                      </div>
                      <span>{platform.name}</span>
                    </div>
                    <Badge variant={platform.status === "connected" ? "success" : "warning"}>
                      {platform.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Posts</CardTitle>
                <CardDescription>Upcoming content publications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scheduledPosts?.map((post: any) => (
                    <div key={post.id} className="p-4 border rounded">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{post.title}</h3>
                        <Badge>{post.platform}</Badge>
                      </div>
                      <p className="text-sm text-neutral-600 mb-2">{post.content}</p>
                      <div className="flex justify-between items-center text-sm text-neutral-500">
                        <span>Scheduled for: {new Date(post.scheduledFor).toLocaleString()}</span>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
