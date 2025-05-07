
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

interface ContentPreviewProps {
  contentType: string;
  contentTone: string;
  topics: string;
  platforms: string[];
  onSave?: (content: string) => void;
}

export default function ContentPreview({
  contentType,
  contentTone,
  topics,
  platforms,
  onSave
}: ContentPreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [platformContent, setPlatformContent] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("general");

  const generateContent = async () => {
    if (!topics) return;
    
    setIsGenerating(true);
    setGeneratedContent("");
    setPlatformContent({});

    try {
      const response = await apiRequest("POST", "/api/content/generate", {
        contentType,
        contentTone,
        topics,
        platforms,
        length: "medium"
      });
      
      const data = await response.json();
      setGeneratedContent(data.content);
      
      // Generate platform-specific versions
      const platformVersions: Record<string, string> = {};
      for (const platform of platforms) {
        const platformRes = await apiRequest("POST", "/api/content/adapt", {
          content: data.content,
          platform
        });
        const platformData = await platformRes.json();
        platformVersions[platform] = platformData.content;
      }
      
      setPlatformContent(platformVersions);
    } catch (error) {
      console.error("Error generating content:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Content Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium">AI Generated Content</h3>
              <p className="text-xs text-neutral-500">
                Preview content before scheduling in your workflow
              </p>
            </div>
            <Button
              onClick={generateContent}
              disabled={isGenerating}
              size="sm"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate Preview
                </>
              )}
            </Button>
          </div>

          {generatedContent ? (
            <div className="mt-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="platforms">Platform Versions</TabsTrigger>
                  <TabsTrigger value="edit">Edit</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general" className="mt-4">
                  <div className="rounded-md border border-neutral-200 p-4 whitespace-pre-wrap">
                    {generatedContent}
                  </div>
                </TabsContent>
                
                <TabsContent value="platforms" className="mt-4">
                  {platforms.length > 0 ? (
                    <div className="space-y-4">
                      {platforms.map((platform) => (
                        <div key={platform} className="space-y-2">
                          <h4 className="text-sm font-medium">{platform}</h4>
                          <div className="rounded-md border border-neutral-200 p-4 whitespace-pre-wrap">
                            {platformContent[platform] || (
                              <Skeleton className="h-24 w-full" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-neutral-500">No platforms selected.</p>
                  )}
                </TabsContent>
                
                <TabsContent value="edit" className="mt-4">
                  <Textarea 
                    value={generatedContent}
                    onChange={(e) => setGeneratedContent(e.target.value)}
                    className="h-60 resize-none"
                  />
                  
                  {onSave && (
                    <div className="mt-4 flex justify-end">
                      <Button onClick={() => onSave(generatedContent)}>
                        Save Content
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          ) : isGenerating ? (
            <div className="space-y-3 mt-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <div className="text-center p-12 border border-dashed border-neutral-300 rounded-lg">
              <svg
                className="mx-auto h-12 w-12 text-neutral-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
              <p className="mt-2 text-sm text-neutral-500">
                Click the Generate Preview button to create content with AI
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
