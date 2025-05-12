import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Copy, CheckCheck, RefreshCw, Palette, ImageIcon, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ColorSwatch {
  hex: string;
  name: string;
  rgb: string;
}

interface ColorPalette {
  id: string;
  name: string;
  colors: ColorSwatch[];
  type: 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'custom';
}

export default function ColorPaletteGenerator() {
  const [baseColor, setBaseColor] = useState<string>('#6366f1');
  const [paletteType, setPaletteType] = useState<string>('complementary');
  const [colorCount, setColorCount] = useState<number>(5);
  const [palettes, setPalettes] = useState<ColorPalette[]>([]);
  const [selectedPalette, setSelectedPalette] = useState<ColorPalette | null>(null);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [generationMethod, setGenerationMethod] = useState<'color' | 'image' | 'text'>('color');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  
  const { toast } = useToast();

  // Generate palette mutation
  const generatePaletteMutation = useMutation({
    mutationFn: async () => {
      // Simulated API response for demo purposes
      return await new Promise(resolve => {
        setTimeout(() => {
          // Generate a mock palette based on the base color
          let baseColorHex = baseColor.replace('#', '');
          let r = parseInt(baseColorHex.slice(0, 2), 16);
          let g = parseInt(baseColorHex.slice(2, 4), 16);
          let b = parseInt(baseColorHex.slice(4, 6), 16);
          
          // Create variations based on palette type
          const mockPalette: ColorPalette = {
            id: `palette-${Date.now()}`,
            name: `Palette ${palettes.length + 1}`,
            type: paletteType as any,
            colors: []
          };
          
          for (let i = 0; i < colorCount; i++) {
            // Simple algorithm to vary colors based on palette type
            let newR, newG, newB;
            
            if (paletteType === 'monochromatic') {
              // Lighten/darken
              const factor = 0.7 + (i / colorCount) * 0.6;
              newR = Math.min(255, Math.floor(r * factor));
              newG = Math.min(255, Math.floor(g * factor));
              newB = Math.min(255, Math.floor(b * factor));
            } else if (paletteType === 'complementary') {
              // Mix with complement
              const t = i / (colorCount - 1);
              newR = Math.floor(r * (1 - t) + (255 - r) * t);
              newG = Math.floor(g * (1 - t) + (255 - g) * t);
              newB = Math.floor(b * (1 - t) + (255 - b) * t);
            } else {
              // Create variations with hue shifts
              const hueShift = (i / colorCount) * 60;
              const [h, s, l] = rgbToHsl(r, g, b);
              const [newR1, newG1, newB1] = hslToRgb((h + hueShift) % 360, s, l);
              newR = newR1;
              newG = newG1;
              newB = newB1;
            }
            
            const hex = rgbToHex(newR, newG, newB);
            mockPalette.colors.push({
              hex,
              name: getColorName(hex),
              rgb: `rgb(${newR}, ${newG}, ${newB})`
            });
          }
          
          resolve({ palette: mockPalette });
        }, 1500);
      });
    },
    onSuccess: (data: any) => {
      const newPalettes = [data.palette, ...palettes];
      setPalettes(newPalettes);
      setSelectedPalette(data.palette);
      
      toast({
        title: "Palette Generated",
        description: `Your ${paletteType} color palette is ready to use.`,
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate color palette. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Function to copy color to clipboard
  const copyColorToClipboard = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    
    toast({
      title: "Copied to Clipboard",
      description: `Color ${color} has been copied.`,
    });
    
    setTimeout(() => setCopiedColor(null), 2000);
  };

  // Helper functions for color conversion
  function rgbToHex(r: number, g: number, b: number): string {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  
  function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      
      h *= 60;
    }
    
    return [h, s, l];
  }
  
  function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      r = hue2rgb(p, q, (h / 360) + 1/3);
      g = hue2rgb(p, q, h / 360);
      b = hue2rgb(p, q, (h / 360) - 1/3);
    }
    
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }
  
  function getColorName(hex: string): string {
    // This is a simplified version, in a real app you'd use a color name library
    const colorNames = [
      'Sapphire', 'Ruby', 'Emerald', 'Amethyst', 'Topaz', 
      'Pearl', 'Amber', 'Jade', 'Coral', 'Azure',
      'Crimson', 'Teal', 'Indigo', 'Lavender', 'Maroon'
    ];
    
    // Use the hash of the hex code to pick a name deterministically
    const hashCode = hex.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colorNames[Math.abs(hashCode) % colorNames.length];
  }

  return (
    <div className="w-full">
      <Card className="p-6 mb-6 border border-border/50">
        <Tabs defaultValue="generator" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="generator">Generator</TabsTrigger>
            <TabsTrigger value="saved">My Palettes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generator" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Generation Method</Label>
                <div className="flex space-x-2">
                  <Button 
                    variant={generationMethod === 'color' ? 'default' : 'outline'} 
                    onClick={() => setGenerationMethod('color')}
                    size="sm"
                  >
                    <Palette className="h-4 w-4 mr-2" />
                    Base Color
                  </Button>
                  <Button 
                    variant={generationMethod === 'image' ? 'default' : 'outline'} 
                    onClick={() => setGenerationMethod('image')}
                    size="sm"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    From Image
                  </Button>
                  <Button 
                    variant={generationMethod === 'text' ? 'default' : 'outline'} 
                    onClick={() => setGenerationMethod('text')}
                    size="sm"
                  >
                    <Palette className="h-4 w-4 mr-2" />
                    From Text
                  </Button>
                </div>
              </div>
              
              {generationMethod === 'color' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="base-color" className="mb-2 block">Base Color</Label>
                    <div className="flex space-x-2">
                      <div 
                        className="h-10 w-10 rounded border"
                        style={{ backgroundColor: baseColor }}
                      />
                      <Input
                        id="base-color"
                        type="color"
                        value={baseColor}
                        onChange={(e) => setBaseColor(e.target.value)}
                        className="w-full h-10"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="palette-type" className="mb-2 block">Palette Type</Label>
                    <Select value={paletteType} onValueChange={setPaletteType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select palette type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monochromatic">Monochromatic</SelectItem>
                        <SelectItem value="analogous">Analogous</SelectItem>
                        <SelectItem value="complementary">Complementary</SelectItem>
                        <SelectItem value="triadic">Triadic</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label htmlFor="color-count">Number of Colors</Label>
                      <span className="text-sm text-muted-foreground">{colorCount}</span>
                    </div>
                    <Slider
                      id="color-count"
                      min={3}
                      max={8}
                      step={1}
                      value={[colorCount]}
                      onValueChange={(values) => setColorCount(values[0])}
                    />
                  </div>
                </div>
              )}
              
              {generationMethod === 'image' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="image-url" className="mb-2 block">Image URL</Label>
                    <Input
                      id="image-url"
                      placeholder="https://example.com/your-image.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      We'll extract the dominant colors from this image.
                    </p>
                  </div>
                </div>
              )}
              
              {generationMethod === 'text' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="text-prompt" className="mb-2 block">Describe your theme</Label>
                    <Input
                      id="text-prompt"
                      placeholder="e.g. sunset over ocean, forest in autumn..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      We'll generate colors that match your description.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end pt-2">
                <Button 
                  onClick={() => generatePaletteMutation.mutate()}
                  disabled={generatePaletteMutation.isPending}
                >
                  {generatePaletteMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Generate Palette
                </Button>
              </div>
            </div>
            
            {selectedPalette && (
              <motion.div 
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-medium mb-4">Generated Palette: {selectedPalette.name}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {selectedPalette.colors.map((color, index) => (
                    <div 
                      key={index} 
                      className="flex flex-col items-center"
                      title={`${color.name}: ${color.hex}`}
                    >
                      <div 
                        className="w-full aspect-square rounded-md mb-2 cursor-pointer relative overflow-hidden group"
                        style={{ backgroundColor: color.hex }}
                        onClick={() => copyColorToClipboard(color.hex)}
                      >
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                          {copiedColor === color.hex ? (
                            <CheckCheck className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          ) : (
                            <Copy className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-sm">{color.name}</p>
                        <p className="text-xs text-muted-foreground">{color.hex}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex justify-between items-center">
                  <div className="flex gap-2">
                    <Badge>{selectedPalette.type}</Badge>
                    <Badge variant="outline">{selectedPalette.colors.length} colors</Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Save Palette
                    </Button>
                    <Button variant="outline" size="sm">
                      Export CSS
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </TabsContent>
          
          <TabsContent value="saved" className="space-y-4">
            {palettes.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">
                  You haven't saved any palettes yet. Generate and save a palette to see it here.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {palettes.map((palette) => (
                  <div 
                    key={palette.id} 
                    className="border rounded-md p-4 hover:shadow-sm transition-shadow"
                    onClick={() => setSelectedPalette(palette)}
                  >
                    <h4 className="font-medium mb-2">{palette.name}</h4>
                    <div className="flex h-8 rounded overflow-hidden mb-2">
                      {palette.colors.map((color, index) => (
                        <div 
                          key={index} 
                          className="flex-1 h-full"
                          style={{ backgroundColor: color.hex }}
                          title={color.hex}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">{palette.type}</Badge>
                      <Button variant="ghost" size="sm">
                        Use
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}