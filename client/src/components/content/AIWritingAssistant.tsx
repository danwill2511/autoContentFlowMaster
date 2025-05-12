import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Loader2, RefreshCw, Copy, CheckCheck, Wand2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface ToneMarker {
  name: string;
  color: string;
  percentage: number;
}

export function AIWritingAssistant() {
  const [content, setContent] = useState<string>('');
  const [tone, setTone] = useState<string>('professional');
  const [contentType, setContentType] = useState<string>('social-post');
  const [charCount, setCharCount] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [suggestionsVisible, setSuggestionsVisible] = useState<boolean>(false);
  const [currentTone, setCurrentTone] = useState<ToneMarker[]>([
    { name: 'Professional', color: 'bg-blue-500', percentage: 10 },
    { name: 'Casual', color: 'bg-green-500', percentage: 5 },
    { name: 'Enthusiastic', color: 'bg-yellow-500', percentage: 70 },
    { name: 'Formal', color: 'bg-purple-500', percentage: 15 },
  ]);
  const [creativity, setCreativity] = useState<number>(50);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Update character count on content change
  useEffect(() => {
    setCharCount(content.length);
  }, [content]);

  // Content generation mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/ai/generate-content", {
        prompt: content,
        tone,
        contentType,
        creativity: creativity / 100,
      });
    },
    onSuccess: (data) => {
      if (data.text) {
        setContent(data.text);
        toast({
          title: "Content Generated",
          description: "Your AI-generated content is ready!",
        });
      }
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Tone analysis mutation
  const analyzeToneMutation = useMutation({
    mutationFn: async () => {
      setAnalyzing(true);
      const result = await new Promise(resolve => {
        // Simulating API call with timeout
        setTimeout(() => {
          const mockTones = [
            { name: 'Professional', color: 'bg-blue-500', percentage: Math.floor(Math.random() * 30) + 10 },
            { name: 'Casual', color: 'bg-green-500', percentage: Math.floor(Math.random() * 20) + 5 },
            { name: 'Enthusiastic', color: 'bg-yellow-500', percentage: Math.floor(Math.random() * 40) + 30 },
            { name: 'Formal', color: 'bg-purple-500', percentage: Math.floor(Math.random() * 20) + 5 },
          ];
          resolve({ tones: mockTones });
        }, 1500);
      });
      setAnalyzing(false);
      return result;
    },
    onSuccess: (data: any) => {
      setCurrentTone(data.tones);
      setSuggestionsVisible(true);
      toast({
        title: "Tone Analysis Complete",
        description: "We've analyzed your content tone.",
      });
    }
  });

  // Copy content to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast({
      title: "Copied to Clipboard",
      description: "Content has been copied to your clipboard.",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate suggestions based on selected tone
  const generateSuggestions = () => {
    if (content.trim().length < 10) {
      toast({
        title: "Content Too Short",
        description: "Please write at least 10 characters for analysis.",
        variant: "destructive"
      });
      return;
    }
    
    analyzeToneMutation.mutate();
  };

  // Calculate max characters based on content type
  const getMaxChars = () => {
    switch (contentType) {
      case 'tweet':
        return 280;
      case 'instagram':
        return 2200;
      case 'linkedin':
        return 3000;
      default:
        return 1000;
    }
  };

  return (
    <div className="w-full">
      <Card className="p-6 mb-6 border border-border/50">
        <Tabs defaultValue="write" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="analyze">Analyze</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="write" className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="w-full md:w-1/2">
                <Label htmlFor="content-type">Content Type</Label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Social Media</SelectLabel>
                      <SelectItem value="tweet">Tweet</SelectItem>
                      <SelectItem value="instagram">Instagram Caption</SelectItem>
                      <SelectItem value="linkedin">LinkedIn Post</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Content</SelectLabel>
                      <SelectItem value="blog-intro">Blog Introduction</SelectItem>
                      <SelectItem value="product-description">Product Description</SelectItem>
                      <SelectItem value="social-post">Social Media Post</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full md:w-1/2">
                <Label htmlFor="tone">Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="humorous">Humorous</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <Label htmlFor="content">Content</Label>
                <span className="text-xs text-muted-foreground">
                  {charCount}/{getMaxChars()} characters
                </span>
              </div>
              <Textarea
                ref={textareaRef}
                id="content"
                placeholder="Start typing or generate content..."
                className="min-h-[200px] resize-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={getMaxChars()}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 justify-end">
              <Button
                variant="outline"
                className="sm:w-auto w-full"
                onClick={copyToClipboard}
                disabled={!content.trim()}
              >
                {copied ? (
                  <CheckCheck className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
              
              <Button 
                className="sm:w-auto w-full"
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
              >
                {generateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4 mr-2" />
                )}
                Generate
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="analyze" className="space-y-4">
            <div className="mb-4">
              <Label className="mb-2 block">Current Tone Analysis</Label>
              
              {analyzing ? (
                <div className="py-8 flex flex-col items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Analyzing your content...</p>
                </div>
              ) : currentTone.length > 0 ? (
                <div className="space-y-3">
                  {currentTone.map((tone, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{tone.name}</span>
                        <span>{tone.percentage}%</span>
                      </div>
                      <Progress value={tone.percentage} className={tone.color} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border rounded-md bg-muted/10">
                  <p className="text-muted-foreground">
                    No tone analysis available yet. Click the button below to analyze your content.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex justify-center">
              <Button 
                onClick={generateSuggestions}
                disabled={!content.trim() || analyzeToneMutation.isPending}
              >
                {analyzeToneMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Analyze Tone
              </Button>
            </div>
            
            {suggestionsVisible && (
              <motion.div 
                className="mt-6 p-4 border rounded-md bg-primary/5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="font-medium mb-2">Suggestions</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Try using more professional terminology to align with your target tone.</li>
                  <li>Consider reducing exclamation marks for a more formal approach.</li>
                  <li>Your content feels slightly more enthusiastic than professional.</li>
                </ul>
              </motion.div>
            )}
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <div>
              <Label htmlFor="creativity" className="mb-2 block">Creativity Level</Label>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Conservative</span>
                <Slider
                  value={[creativity]}
                  min={1}
                  max={100}
                  step={1}
                  onValueChange={(value) => setCreativity(value[0])}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">Creative</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Higher creativity means more varied and unique outputs, but potentially less predictable.
              </p>
            </div>
            
            <div>
              <Label htmlFor="model" className="mb-2 block">AI Model</Label>
              <Select defaultValue="gpt4o">
                <SelectTrigger>
                  <SelectValue placeholder="Select AI model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt4o">GPT-4o (Recommended)</SelectItem>
                  <SelectItem value="claude3">Claude 3 Sonnet</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                Different models have varying strengths in content creation.
              </p>
            </div>
            
            <div>
              <Label className="mb-2 block">Preferred Style Tags</Label>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">Concise</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">Detailed</Badge>
                <Badge variant="secondary" className="cursor-pointer">Persuasive</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">Informative</Badge>
                <Badge variant="secondary" className="cursor-pointer">Engaging</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">Technical</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">Storytelling</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Selected tags will influence the style of generated content.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

export default AIWritingAssistant;