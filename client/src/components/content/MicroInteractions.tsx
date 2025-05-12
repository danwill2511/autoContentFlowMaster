import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Copy, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Check, 
  MousePointerClick, 
  ZoomIn, 
  Star,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface AnimationPreset {
  id: string;
  name: string;
  category: 'button' | 'feedback' | 'navigation' | 'hover' | 'scroll';
  code: string;
  preview: React.ReactNode;
}

export default function MicroInteractions() {
  const [activeTab, setActiveTab] = useState<string>('button');
  const [selectedPreset, setSelectedPreset] = useState<AnimationPreset | null>(null);
  const [speed, setSpeed] = useState<number>(1);
  const [intensity, setIntensity] = useState<number>(1);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [previewInApp, setPreviewInApp] = useState<boolean>(false);
  const { toast } = useToast();

  // Define animation presets
  const animationPresets: AnimationPreset[] = [
    {
      id: 'button-pulse',
      name: 'Pulse Effect',
      category: 'button',
      code: `<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ duration: 0.2 }}
>
  Click Me
</motion.button>`,
      preview: (
        <motion.div 
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md cursor-pointer inline-block"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 * speed }}
        >
          Click Me
        </motion.div>
      )
    },
    {
      id: 'button-shimmer',
      name: 'Shimmer Effect',
      category: 'button',
      code: `const ShimmerButton = () => {
  return (
    <Button className="relative overflow-hidden">
      <span className="relative z-10">Click Me</span>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        style={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
      />
    </Button>
  );
}`,
      preview: (
        <div className="relative overflow-hidden bg-primary text-primary-foreground px-4 py-2 rounded-md cursor-pointer inline-block">
          <span className="relative z-10">Click Me</span>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            style={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ repeat: Infinity, duration: 1.5 / speed, ease: "linear" }}
          />
        </div>
      )
    },
    {
      id: 'feedback-success',
      name: 'Success Animation',
      category: 'feedback',
      code: `const SuccessAnimation = () => {
  const [success, setSuccess] = useState(false);
  
  return (
    <Button
      onClick={() => {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 1500);
      }}
    >
      {success ? (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Check className="h-5 w-5" />
        </motion.div>
      ) : (
        "Save"
      )}
    </Button>
  );
}`,
      preview: (
        <SuccessAnimationPreview speed={speed} />
      )
    },
    {
      id: 'hover-spotlight',
      name: 'Spotlight Effect',
      category: 'hover',
      code: `const SpotlightEffect = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      className="relative overflow-hidden rounded-md p-8 border"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="absolute bg-gradient-radial from-white/20 to-transparent rounded-full w-32 h-32 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity"
        style={{
          opacity: isHovered ? 0.8 : 0,
          left: mousePosition.x,
          top: mousePosition.y,
        }}
      />
      <span className="relative z-10">Hover over me</span>
    </div>
  );
}`,
      preview: <SpotlightEffectPreview />
    },
    {
      id: 'scroll-fade',
      name: 'Scroll Fade In',
      category: 'scroll',
      code: `const FadeInOnScroll = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
    >
      Content fades in when scrolled into view
    </motion.div>
  );
}`,
      preview: (
        <div className="h-20 rounded-md bg-muted flex items-center justify-center overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 / speed }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Scroll Animation
          </motion.div>
        </div>
      )
    },
    {
      id: 'navigation-slide',
      name: 'Slide Transition',
      category: 'navigation',
      code: `const SlideTransition = () => {
  const [page, setPage] = useState(1);
  
  return (
    <div className="overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          Page {page} content here
        </motion.div>
      </AnimatePresence>
      
      <Button onClick={() => setPage(page === 1 ? 2 : 1)}>
        Next Page
      </Button>
    </div>
  );
}`,
      preview: <SlideTransitionPreview speed={speed} />
    }
  ];

  // Filter presets by category
  const filteredPresets = animationPresets.filter(preset => preset.category === activeTab);

  // Copy code to clipboard
  const copyCode = () => {
    if (selectedPreset) {
      navigator.clipboard.writeText(selectedPreset.code);
      setCopiedCode(true);
      
      toast({
        title: "Code Copied",
        description: "Animation code has been copied to clipboard.",
      });
      
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Apply animation to app
  const applyAnimation = () => {
    setPreviewInApp(true);
    
    toast({
      title: "Animation Applied",
      description: "This animation would be applied to your app components.",
    });
    
    setTimeout(() => setPreviewInApp(false), 3000);
  };

  return (
    <div className="w-full">
      <Card className="border border-border/50">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <MousePointerClick className="h-5 w-5 mr-2 text-primary" />
            Micro-Interaction Animations
          </h2>
          
          <Tabs 
            defaultValue="button" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="button">Button</TabsTrigger>
                <TabsTrigger value="feedback">Feedback</TabsTrigger>
                <TabsTrigger value="navigation">Navigation</TabsTrigger>
                <TabsTrigger value="hover">Hover</TabsTrigger>
                <TabsTrigger value="scroll">Scroll</TabsTrigger>
              </TabsList>
              
              {selectedPreset && (
                <div className="hidden md:flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={copyCode}>
                    {copiedCode ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                    {copiedCode ? "Copied" : "Copy Code"}
                  </Button>
                  <Button size="sm" onClick={applyAnimation}>
                    <Eye className="h-4 w-4 mr-1" />
                    Apply Animation
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex flex-col md:flex-row gap-6">
              {/* Presets List */}
              <div className="w-full md:w-1/3">
                <ScrollArea className="h-[400px] border rounded-md">
                  <div className="p-4 space-y-2">
                    {filteredPresets.map((preset) => (
                      <div
                        key={preset.id}
                        className={cn(
                          "flex items-center p-3 cursor-pointer rounded-md transition-colors",
                          selectedPreset?.id === preset.id
                            ? "bg-primary/10 border-primary/20 border"
                            : "hover:bg-muted/50 border border-transparent"
                        )}
                        onClick={() => setSelectedPreset(preset)}
                      >
                        <div className="mr-3">
                          {preset.category === 'button' && <MousePointerClick className="h-5 w-5 text-blue-500" />}
                          {preset.category === 'feedback' && <Check className="h-5 w-5 text-green-500" />}
                          {preset.category === 'navigation' && <ArrowRight className="h-5 w-5 text-purple-500" />}
                          {preset.category === 'hover' && <ZoomIn className="h-5 w-5 text-amber-500" />}
                          {preset.category === 'scroll' && <Star className="h-5 w-5 text-pink-500" />}
                        </div>
                        <div>
                          <h4 className="font-medium">{preset.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {preset.category.charAt(0).toUpperCase() + preset.category.slice(1)} Animation
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              
              {/* Preview & Code */}
              <div className="w-full md:w-2/3">
                {selectedPreset ? (
                  <div className="space-y-6">
                    <div className="border rounded-md p-6 bg-muted/20 flex items-center justify-center min-h-[150px]">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={selectedPreset.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          {selectedPreset.preview}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">Animation Settings</h3>
                        <div className="flex items-center gap-2">
                          <Label htmlFor="toggle-preview" className="text-sm">Preview on Page</Label>
                          <Switch 
                            id="toggle-preview"
                            checked={previewInApp}
                            onCheckedChange={setPreviewInApp}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="speed">Speed</Label>
                            <span className="text-sm text-muted-foreground">
                              {speed === 0.5 ? "Slow" : speed === 1 ? "Normal" : "Fast"}
                            </span>
                          </div>
                          <Slider
                            id="speed"
                            min={0.5}
                            max={2}
                            step={0.5}
                            value={[speed]}
                            onValueChange={(values) => setSpeed(values[0])}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="intensity">Intensity</Label>
                            <span className="text-sm text-muted-foreground">
                              {intensity === 0.5 ? "Subtle" : intensity === 1 ? "Medium" : "Strong"}
                            </span>
                          </div>
                          <Slider
                            id="intensity"
                            min={0.5}
                            max={1.5}
                            step={0.5}
                            value={[intensity]}
                            onValueChange={(values) => setIntensity(values[0])}
                          />
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <Label className="mb-2 block">Code</Label>
                        <div className="relative">
                          <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                            <code>
                              {selectedPreset.code}
                            </code>
                          </pre>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="absolute top-2 right-2"
                            onClick={copyCode}
                          >
                            {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex md:hidden justify-end gap-2">
                      <Button variant="outline" onClick={copyCode}>
                        {copiedCode ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                        {copiedCode ? "Copied" : "Copy Code"}
                      </Button>
                      <Button onClick={applyAnimation}>
                        <Eye className="h-4 w-4 mr-1" />
                        Apply Animation
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[400px] border rounded-md p-6 bg-muted/10">
                    <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Select an Animation</h3>
                    <p className="text-center text-muted-foreground max-w-md">
                      Choose an animation from the list to preview and see the code.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Tabs>
        </div>
      </Card>
      
      {previewInApp && (
        <motion.div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground px-6 py-3 rounded-lg shadow-lg z-50"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
        >
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <p>Animation applied! Hover and click elements to see the effect.</p>
            <Button variant="ghost" size="sm" className="ml-2" onClick={() => setPreviewInApp(false)}>
              <EyeOff className="h-4 w-4 mr-1" /> Hide Preview
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Component for Success Animation Preview
function SuccessAnimationPreview({ speed }: { speed: number }) {
  const [success, setSuccess] = useState(false);
  
  return (
    <Button
      onClick={() => {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 1500 / speed);
      }}
    >
      {success ? (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 / speed }}
        >
          <Check className="h-5 w-5" />
        </motion.div>
      ) : (
        "Save"
      )}
    </Button>
  );
}

// Component for Spotlight Effect Preview
function SpotlightEffectPreview() {
  const [mousePosition, setMousePosition] = useState({ x: 100, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      className="relative overflow-hidden rounded-md p-8 border bg-muted/20"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="absolute bg-gradient-radial from-white/20 to-transparent rounded-full w-32 h-32 -translate-x-1/2 -translate-y-1/2 transition-opacity"
        style={{
          opacity: isHovered ? 0.8 : 0,
          left: mousePosition.x,
          top: mousePosition.y,
        }}
      />
      <span className="relative z-10">Hover over me</span>
    </div>
  );
}

// Component for Slide Transition Preview
function SlideTransitionPreview({ speed }: { speed: number }) {
  const [page, setPage] = useState(1);
  
  return (
    <div className="space-y-4">
      <div className="border rounded overflow-hidden p-4 h-20 flex items-center justify-center bg-muted/20">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 / speed }}
            className="flex items-center justify-center"
          >
            <div className="px-4 py-2 bg-primary text-primary-foreground rounded">
              Page {page} Content
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      <Button 
        variant="outline"
        className="w-full" 
        onClick={() => setPage(page === 1 ? 2 : 1)}
      >
        Switch to Page {page === 1 ? 2 : 1}
      </Button>
    </div>
  );
}