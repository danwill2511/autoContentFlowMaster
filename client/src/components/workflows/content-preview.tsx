import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ContentPreviewProps {
  contentType: string;
  contentTone: string;
  topics: string;
  platforms: string[];
  onSave?: (content: string) => void;
  initialContent?: string;
}

export function ContentPreview({ 
  contentType, 
  contentTone, 
  topics, 
  platforms,
  platformSettings 

const formatForPlatform = (content: string, platform: string, settings?: any): string => {
  let formatted = content;
  
  // Apply platform-specific character limits
  const maxLength = settings?.characterLimit || getPlatformDefaultLimit(platform);
  if (formatted.length > maxLength) {
    formatted = formatted.slice(0, maxLength - 3) + '...';
  }

  // Add hashtags if enabled
  if (settings?.hashtagCount > 0) {
    const hashtags = generateHashtags(formatted, settings.hashtagCount);
    formatted = `${formatted}\n\n${hashtags}`;
  }

  // Add platform-specific formatting
  switch(platform.toLowerCase()) {
    case 'twitter':
    case 'x':
      formatted = formatted.replace(/\n\n/g, '\n');
      break;
    case 'linkedin':
      formatted = formatted.replace(/\n/g, '\n\n');
      break;
  }

  return formatted;
};

const generateHashtags = (content: string, count: number): string => {
  const words = content.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3)
    .map(word => word.replace(/[^a-z0-9]/g, ''));
  
  const uniqueWords = Array.from(new Set(words));
  const hashtags = uniqueWords
    .slice(0, count)
    .map(word => `#${word}`);
  
  return hashtags.join(' ');
};

}: ContentPreviewProps & { platformSettings?: Record<string, any> }) {
  const [previewContent, setPreviewContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const generatePreview = async () => {
      if (!contentType || !contentTone || !topics) return;

      setIsLoading(true);
      try {
        const response = await fetch("/api/content/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contentType,
            contentTone,
            topics: topics.split(",").map(t => t.trim()),
            platforms,
            platformSettings
          })
        });

        const data = await response.json();
        setPreviewContent(data.content);
      } catch (error) {
        console.error("Preview generation failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(generatePreview, 1000);
    return () => clearTimeout(debounce);
  }, [contentType, contentTone, topics, platforms, platformSettings]);

  const { toast } = useToast();
  const [generatedContent, setGeneratedContent] = useState<string>(initialContent || "");
  const [platformContent, setPlatformContent] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("general");

  // Generate content based on parameters
  const generateContent = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/content/generate", {
        contentType,
        contentTone,
        topics,
        platforms,
        length: "medium"
      });
      return await res.json();
    },
    onSuccess: (data) => {
      setGeneratedContent(data.content);
      generatePlatformVersions(data.content);
    },
    onError: (error) => {
      toast({
        title: "Failed to generate content",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsGenerating(false);
    }
  });

  // Generate platform-specific content
  const generatePlatformVersions = async (content: string) => {
    const platformVersions: Record<string, string> = {};

    for (const platform of platforms) {
      try {
        // Apply platform-specific formatting before API call
        const formattedContent = formatForPlatform(content, platform, platformSettings?.[platform.toLowerCase()]);
        const res = await apiRequest("POST", "/api/content/adapt", {
          content,
          platform
        });
        const data = await res.json();
        platformVersions[platform] = data.content;
      } catch (error) {
        console.error(`Failed to adapt content for ${platform}:`, error);
        platformVersions[platform] = `Error generating content for ${platform}`;
      }
    }

    setPlatformContent(platformVersions);
  };

  useEffect(() => {
    // If all required inputs are provided and there's no initial content, generate
    if (contentType && contentTone && topics && platforms.length > 0 && !initialContent) {
      setIsGenerating(true);
      generateContent.mutate();
    }
  }, [contentType, contentTone, topics, platforms.length, initialContent]);

  return (
    <div className="rounded-md border border-neutral-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Content Preview</h3>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => {
            setIsGenerating(true);
            generateContent.mutate();
          }}
          disabled={isGenerating}
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
            <>Regenerate</>
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
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
          <p className="mt-2 text-sm text-neutral-500">
            Content preview will appear here
          </p>
          <p className="text-xs text-neutral-400">
            Complete the form above to generate content
          </p>
        </div>
      )}
    </div>
  );
}

export default ContentPreview;