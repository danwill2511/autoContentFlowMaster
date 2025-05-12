import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  ChevronUp, 
  Pencil, 
  UserSquare2, 
  Grid3X3, 
  Palette, 
  MousePointerClick 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Define the types of tools we'll offer
interface CreativeTool {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  comingSoon?: boolean;
  component?: React.ReactNode;
}

export default function CreativeSuiteTools() {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const { toast } = useToast();

  // Define our creative tools
  const creativeTools: CreativeTool[] = [
    {
      id: 'ai-writing-assistant',
      title: 'Personalized AI writing assistant with tone detection',
      description: 'Get AI-powered writing suggestions that match your brand tone and style',
      icon: <Pencil className="h-5 w-5" />,
    },
    {
      id: 'collaborative-brainstorming',
      title: 'Collaborative content brainstorming interface',
      description: 'Work with your team to generate and refine content ideas',
      icon: <UserSquare2 className="h-5 w-5" />,
    },
    {
      id: 'mood-board-creator',
      title: 'One-click social media mood board creator',
      description: 'Generate visual mood boards for your social media campaigns',
      icon: <Grid3X3 className="h-5 w-5" />,
    },
    {
      id: 'color-palette-generator',
      title: 'Smart color palette generator for content themes',
      description: 'Create harmonious color schemes for your content',
      icon: <Palette className="h-5 w-5" />,
    },
    {
      id: 'micro-animations',
      title: 'Micro-interaction animations for enhanced UX',
      description: 'Add subtle animations to improve user engagement',
      icon: <MousePointerClick className="h-5 w-5" />,
    }
  ];

  // Mutation for tool usage analytics
  const toolUsageMutation = useMutation({
    mutationFn: async (toolId: string) => {
      return await apiRequest("POST", "/api/analytics/tool-usage", { toolId });
    }
  });

  const handleToolClick = (toolId: string) => {
    // Record tool usage for analytics
    toolUsageMutation.mutate(toolId);
    
    // Open the tool dialog
    setActiveToolId(toolId);
    
    // Show coming soon toast if feature isn't fully implemented
    const tool = creativeTools.find(tool => tool.id === toolId);
    if (tool?.comingSoon) {
      toast({
        title: "Coming Soon!",
        description: `${tool.title} will be available in an upcoming update.`,
        duration: 3000,
      });
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="w-full relative">
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Creative Suite Tools</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>Show Less <ChevronUp className="h-4 w-4" /></>
            ) : (
              <>Show All <ChevronDown className="h-4 w-4" /></>
            )}
          </Button>
        </div>

        <motion.div 
          className={cn(
            "grid gap-3 transition-all duration-500 ease-in-out",
            expanded ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          )}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {creativeTools.slice(0, expanded ? creativeTools.length : 5).map((tool) => (
            <motion.div key={tool.id} variants={itemVariants}>
              <Card 
                className={cn(
                  "cursor-pointer transition-all duration-300 hover:shadow-md",
                  "bg-gradient-to-br from-background to-background/60 backdrop-blur-sm",
                  "border border-border/50 hover:border-primary/30"
                )}
                onClick={() => handleToolClick(tool.id)}
              >
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                      {tool.icon}
                    </div>
                    <h3 className="text-base font-medium leading-tight">{tool.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground ml-11">{tool.description}</p>
                  {tool.comingSoon && (
                    <div className="ml-11 mt-2">
                      <span className="text-xs font-medium bg-amber-500/10 text-amber-500 rounded-full px-2 py-1">
                        Coming Soon
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Tool Dialog */}
      <Dialog open={!!activeToolId} onOpenChange={(open) => !open && setActiveToolId(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {creativeTools.find(tool => tool.id === activeToolId)?.title || "Tool"}
            </DialogTitle>
            <DialogDescription>
              {creativeTools.find(tool => tool.id === activeToolId)?.description || ""}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {/* Placeholder for actual tool content */}
            <div className="min-h-[300px] flex items-center justify-center bg-muted/20 rounded-lg">
              <p className="text-muted-foreground">Tool interface will be implemented soon</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveToolId(null)}>
              Close
            </Button>
            <Button>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}