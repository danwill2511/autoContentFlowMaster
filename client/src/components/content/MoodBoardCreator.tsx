import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Share2, 
  Plus, 
  X, 
  Image, 
  Grid3X3, 
  Wand2, 
  Loader2, 
  ArrowRight,
  LayoutGrid,
  LayoutList
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface MoodBoardItem {
  id: string;
  type: 'image' | 'text' | 'color';
  content: string;
  width?: number;
  height?: number;
  position?: {
    x: number;
    y: number;
  };
}

interface MoodBoard {
  id: string;
  name: string;
  description: string;
  theme: string;
  layout: 'grid' | 'freeform';
  items: MoodBoardItem[];
}

export function MoodBoardCreator() {
  const [currentBoard, setCurrentBoard] = useState<MoodBoard>({
    id: `board-${Date.now()}`,
    name: 'My Mood Board',
    description: '',
    theme: 'social-media',
    layout: 'grid',
    items: []
  });
  const [prompt, setPrompt] = useState<string>('');
  const [itemCount, setItemCount] = useState<number>(6);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [savedBoards, setSavedBoards] = useState<MoodBoard[]>([]);
  const [addingItem, setAddingItem] = useState<boolean>(false);
  const [newItemUrl, setNewItemUrl] = useState<string>('');
  
  const { toast } = useToast();

  // Generate mood board mutation
  const generateBoardMutation = useMutation({
    mutationFn: async () => {
      // Simulated API response for demo purposes
      return await new Promise(resolve => {
        setTimeout(() => {
          // Generate mock images
          const mockItems: MoodBoardItem[] = [];
          
          // Some preset mock image URLs
          const placeholderImages = [
            'https://images.unsplash.com/photo-1493612276216-ee3925520721',
            'https://images.unsplash.com/photo-1504297050568-910d24c426d3',
            'https://images.unsplash.com/photo-1473186578172-c141e6798cf4',
            'https://images.unsplash.com/photo-1492551557933-34265f7af79e',
            'https://images.unsplash.com/photo-1531297484001-80022131f5a1',
            'https://images.unsplash.com/photo-1497215842964-222b430dc094',
            'https://images.unsplash.com/photo-1545239351-ef35f43d514b'
          ];
          
          // Generate text blocks based on prompt
          const promptWords = prompt.split(' ');
          const textSuggestions = [
            'Engage your audience with authentic content',
            'Build trust through consistency',
            'Tell your brand story visually',
            'Connect through shared values',
            'Create memorable experiences'
          ];
          
          // Add images
          for (let i = 0; i < Math.min(itemCount - 1, placeholderImages.length); i++) {
            mockItems.push({
              id: `item-${i}-${Date.now()}`,
              type: 'image',
              content: `${placeholderImages[i]}?w=600&h=400&fit=crop&auto=format&q=80`
            });
          }
          
          // Add a text item
          mockItems.push({
            id: `text-${Date.now()}`,
            type: 'text',
            content: prompt ? 
              `"${promptWords.slice(0, 5).join(' ')}${promptWords.length > 5 ? '...' : ''}"` : 
              textSuggestions[Math.floor(Math.random() * textSuggestions.length)]
          });
          
          resolve({ 
            board: {
              ...currentBoard,
              items: mockItems,
              name: prompt ? `${promptWords[0]} ${promptWords[1] || ''} Board`.trim() : currentBoard.name
            } 
          });
        }, 2000);
      });
    },
    onSuccess: (data: any) => {
      setCurrentBoard(data.board);
      setViewMode('preview');
      
      toast({
        title: "Mood Board Generated",
        description: "Your mood board has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate mood board. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Save board
  const saveBoard = () => {
    if (currentBoard.items.length === 0) {
      toast({
        title: "Cannot Save Empty Board",
        description: "Please add some items to your mood board first.",
        variant: "destructive"
      });
      return;
    }
    
    const newSavedBoards = [...savedBoards, {...currentBoard, id: `board-${Date.now()}`}];
    setSavedBoards(newSavedBoards);
    
    toast({
      title: "Board Saved",
      description: "Your mood board has been saved successfully.",
    });
  };

  // Add item to board
  const addItem = () => {
    if (!newItemUrl) {
      toast({
        title: "No URL Provided",
        description: "Please enter an image URL to add to your board.",
        variant: "destructive"
      });
      return;
    }
    
    const newItem: MoodBoardItem = {
      id: `item-${Date.now()}`,
      type: 'image',
      content: newItemUrl
    };
    
    setCurrentBoard({
      ...currentBoard,
      items: [...currentBoard.items, newItem]
    });
    
    setNewItemUrl('');
    setAddingItem(false);
    
    toast({
      title: "Item Added",
      description: "New image has been added to your mood board.",
    });
  };

  // Remove item from board
  const removeItem = (itemId: string) => {
    setCurrentBoard({
      ...currentBoard,
      items: currentBoard.items.filter(item => item.id !== itemId)
    });
  };

  // Clear board
  const clearBoard = () => {
    setCurrentBoard({
      ...currentBoard,
      items: []
    });
    
    toast({
      title: "Board Cleared",
      description: "All items have been removed from your mood board.",
    });
  };

  // Export board
  const exportBoard = () => {
    toast({
      title: "Board Exported",
      description: "Your mood board has been exported as an image.",
    });
  };

  return (
    <div className="w-full">
      <Card className="border border-border/50">
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="w-full rounded-t-lg border-b">
            <TabsTrigger value="create" className="flex-1">Create</TabsTrigger>
            <TabsTrigger value="saved" className="flex-1">Saved</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Editor Controls */}
              <div className="w-full md:w-1/3 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="board-name">Board Name</Label>
                  <Input
                    id="board-name"
                    value={currentBoard.name}
                    onChange={(e) => setCurrentBoard({...currentBoard, name: e.target.value})}
                    placeholder="Enter a name for your mood board"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="board-theme">Theme</Label>
                  <Select 
                    value={currentBoard.theme} 
                    onValueChange={(value) => setCurrentBoard({...currentBoard, theme: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="social-media">Social Media</SelectItem>
                      <SelectItem value="brand-identity">Brand Identity</SelectItem>
                      <SelectItem value="content-campaign">Content Campaign</SelectItem>
                      <SelectItem value="product-launch">Product Launch</SelectItem>
                      <SelectItem value="seasonal">Seasonal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="layout-style">Layout Style</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={currentBoard.layout === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => setCurrentBoard({...currentBoard, layout: 'grid'})}
                    >
                      <LayoutGrid className="h-4 w-4 mr-2" />
                      Grid
                    </Button>
                    <Button
                      variant={currentBoard.layout === 'freeform' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => setCurrentBoard({...currentBoard, layout: 'freeform'})}
                    >
                      <LayoutList className="h-4 w-4 mr-2" />
                      Freeform
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="generation-prompt">AI Generation Prompt</Label>
                  <Textarea
                    id="generation-prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the mood and style you want (e.g., 'Modern minimalist tech with blue tones')"
                    className="min-h-[80px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="item-count">Number of Items</Label>
                    <span className="text-sm text-muted-foreground">{itemCount}</span>
                  </div>
                  <Slider
                    id="item-count"
                    min={3}
                    max={12}
                    step={1}
                    value={[itemCount]}
                    onValueChange={(values) => setItemCount(values[0])}
                  />
                </div>
                
                <Button 
                  className="w-full"
                  onClick={() => generateBoardMutation.mutate()}
                  disabled={generateBoardMutation.isPending}
                >
                  {generateBoardMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4 mr-2" />
                  )}
                  Generate Mood Board
                </Button>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Manual Options</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setAddingItem(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Image
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={clearBoard}
                      disabled={currentBoard.items.length === 0}
                    >
                      Clear Board
                    </Button>
                  </div>
                </div>
                
                {addingItem && (
                  <motion.div 
                    className="space-y-2 p-3 border rounded-md bg-muted/20"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="flex justify-between items-center">
                      <Label htmlFor="image-url">Image URL</Label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setAddingItem(false)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      id="image-url"
                      value={newItemUrl}
                      onChange={(e) => setNewItemUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                    <Button 
                      size="sm"
                      className="w-full mt-2"
                      onClick={addItem}
                    >
                      Add to Board
                    </Button>
                  </motion.div>
                )}
              </div>
              
              {/* Board Preview */}
              <div className="w-full md:w-2/3">
                <div className="bg-muted/20 rounded-lg border h-[500px] relative overflow-hidden">
                  <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="h-8"
                      onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
                    >
                      {viewMode === 'edit' ? 'Preview' : 'Edit'}
                    </Button>
                  </div>
                  
                  {currentBoard.items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-6">
                      <Grid3X3 className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">Your Mood Board is Empty</h3>
                      <p className="text-center text-muted-foreground mb-4 max-w-md">
                        Generate a board using AI or add images manually to get started.
                      </p>
                      <Button 
                        onClick={() => setAddingItem(true)}
                        variant="outline"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add First Item
                      </Button>
                    </div>
                  ) : (
                    <ScrollArea className="h-full px-4 py-6">
                      <div className={`
                        grid gap-3
                        ${currentBoard.layout === 'grid' 
                          ? 'grid-cols-2 md:grid-cols-3' 
                          : 'grid-cols-1 md:grid-cols-2'
                        }
                      `}>
                        <AnimatePresence>
                          {currentBoard.items.map((item) => (
                            <motion.div 
                              key={item.id}
                              layout
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.2 }}
                              className="relative group"
                            >
                              {item.type === 'image' ? (
                                <div className="rounded-md overflow-hidden aspect-square bg-muted-foreground/10 relative">
                                  <img 
                                    src={item.content} 
                                    alt=""
                                    className="w-full h-full object-cover" 
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/gray/white?text=Image+Error';
                                    }}
                                  />
                                  {viewMode === 'edit' && (
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => removeItem(item.id)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ) : item.type === 'text' ? (
                                <div className="rounded-md overflow-hidden p-6 bg-background h-full flex items-center justify-center text-center relative border">
                                  <p className="font-medium">{item.content}</p>
                                  {viewMode === 'edit' && (
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => removeItem(item.id)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ) : (
                                <div 
                                  className="rounded-md overflow-hidden aspect-square flex items-center justify-center"
                                  style={{ backgroundColor: item.content }}
                                >
                                  {viewMode === 'edit' && (
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => removeItem(item.id)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </ScrollArea>
                  )}
                </div>
                
                <div className="flex justify-between mt-4">
                  <div className="flex gap-2">
                    <Badge>{currentBoard.theme}</Badge>
                    <Badge variant="outline">{currentBoard.items.length} items</Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={saveBoard}
                      disabled={currentBoard.items.length === 0}
                    >
                      Save
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={exportBoard}
                      disabled={currentBoard.items.length === 0}
                    >
                      <Download className="h-4 w-4 mr-1" /> Export
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={currentBoard.items.length === 0}
                    >
                      <Share2 className="h-4 w-4 mr-1" /> Share
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="saved" className="p-6">
            {savedBoards.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">
                  You haven't saved any mood boards yet. Create and save a board to see it here.
                </p>
                <Button className="mt-4" variant="outline">
                  <ArrowRight className="h-4 w-4 mr-2" /> Go to Creator
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedBoards.map((board) => (
                  <Card 
                    key={board.id} 
                    className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      setCurrentBoard(board);
                      setViewMode('preview');
                    }}
                  >
                    <div className="h-40 bg-muted-foreground/10 grid grid-cols-2 grid-rows-2 gap-1 p-1 overflow-hidden">
                      {board.items.slice(0, 4).map((item, i) => (
                        <div key={i} className="overflow-hidden">
                          {item.type === 'image' ? (
                            <img 
                              src={item.content} 
                              alt="" 
                              className="w-full h-full object-cover" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/gray/white?text=Error';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-background flex items-center justify-center p-2 text-xs">
                              {item.content.length > 20 ? item.content.substring(0, 20) + '...' : item.content}
                            </div>
                          )}
                        </div>
                      ))}
                      {board.items.length === 0 && (
                        <div className="col-span-2 row-span-2 flex items-center justify-center">
                          <Image className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium truncate">{board.name}</h3>
                      <div className="flex justify-between mt-1">
                        <Badge variant="outline" className="text-xs">{board.theme}</Badge>
                        <span className="text-xs text-muted-foreground">{board.items.length} items</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

export default MoodBoardCreator;