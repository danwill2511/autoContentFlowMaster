import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ScrollArea 
} from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Users, 
  MessageSquare, 
  Send, 
  Trash, 
  Download, 
  Pencil, 
  Check, 
  X, 
  RefreshCw,
  LightbulbIcon,
  ThumbsUp,
  UserIcon,
  Star,
  FileText,
  Calendar
} from 'lucide-react';

interface Idea {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
  likes: number;
  category: string;
  tags: string[];
  isEditing?: boolean;
}

interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
  ideaId: string;
}

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  online: boolean;
}

export default function BrainstormingInterface() {
  const [activeTab, setActiveTab] = useState<string>('ideation');
  const [ideas, setIdeas] = useState<Idea[]>([
    {
      id: 'idea-1',
      text: 'Launch a social media challenge where users create and share content related to our product.',
      author: 'Sarah Johnson',
      timestamp: new Date(Date.now() - 60000 * 45),
      likes: 5,
      category: 'social-media',
      tags: ['engagement', 'user-generated']
    },
    {
      id: 'idea-2',
      text: 'Create a behind-the-scenes video series showing how our products are made with sustainable materials.',
      author: 'Michael Chen',
      timestamp: new Date(Date.now() - 60000 * 30),
      likes: 3,
      category: 'video',
      tags: ['sustainability', 'transparency']
    },
    {
      id: 'idea-3',
      text: 'Partner with micro-influencers in our niche to create authentic review content.',
      author: 'You',
      timestamp: new Date(Date.now() - 60000 * 10),
      likes: 2,
      category: 'influencer',
      tags: ['partnership', 'reviews']
    }
  ]);
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 'comment-1',
      text: 'We should specify the hashtag we\'d use for this challenge.',
      author: 'Michael Chen',
      timestamp: new Date(Date.now() - 60000 * 20),
      ideaId: 'idea-1'
    },
    {
      id: 'comment-2',
      text: 'I like this! We should also highlight our eco-friendly packaging.',
      author: 'Sarah Johnson',
      timestamp: new Date(Date.now() - 60000 * 5),
      ideaId: 'idea-2'
    }
  ]);
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: 'user-1',
      name: 'You',
      role: 'Marketing Manager',
      online: true
    },
    {
      id: 'user-2',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100',
      role: 'Content Strategist',
      online: true
    },
    {
      id: 'user-3',
      name: 'Michael Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100',
      role: 'Social Media Specialist',
      online: true
    },
    {
      id: 'user-4',
      name: 'Alex Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=100',
      role: 'Graphic Designer',
      online: false
    }
  ]);
  
  const [newIdea, setNewIdea] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [commentText, setCommentText] = useState<string>('');
  const [selectedIdea, setSelectedIdea] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Add new idea
  const addIdea = () => {
    if (!newIdea.trim()) {
      toast({
        title: "Empty Idea",
        description: "Please enter some text for your idea.",
        variant: "destructive"
      });
      return;
    }
    
    const idea: Idea = {
      id: `idea-${Date.now()}`,
      text: newIdea,
      author: 'You',
      timestamp: new Date(),
      likes: 0,
      category: 'other',
      tags: []
    };
    
    setIdeas([idea, ...ideas]);
    setNewIdea('');
    
    toast({
      title: "Idea Added",
      description: "Your idea has been added to the board.",
    });
  };

  // Like an idea
  const likeIdea = (id: string) => {
    setIdeas(
      ideas.map(idea => 
        idea.id === id ? { ...idea, likes: idea.likes + 1 } : idea
      )
    );
  };

  // Delete an idea
  const deleteIdea = (id: string) => {
    setIdeas(ideas.filter(idea => idea.id !== id));
    setComments(comments.filter(comment => comment.ideaId !== id));
    
    toast({
      title: "Idea Deleted",
      description: "The idea and its comments have been removed.",
    });
  };

  // Start editing an idea
  const startEditingIdea = (id: string) => {
    setIdeas(
      ideas.map(idea => 
        idea.id === id ? { ...idea, isEditing: true } : idea
      )
    );
  };

  // Update edited idea
  const updateIdea = (id: string, newText: string) => {
    if (!newText.trim()) {
      toast({
        title: "Empty Idea",
        description: "Idea text cannot be empty.",
        variant: "destructive"
      });
      return;
    }
    
    setIdeas(
      ideas.map(idea => 
        idea.id === id ? { ...idea, text: newText, isEditing: false } : idea
      )
    );
    
    toast({
      title: "Idea Updated",
      description: "Your changes have been saved.",
    });
  };

  // Cancel editing
  const cancelEditingIdea = (id: string) => {
    setIdeas(
      ideas.map(idea => 
        idea.id === id ? { ...idea, isEditing: false } : idea
      )
    );
  };

  // Add comment to an idea
  const addComment = () => {
    if (!commentText.trim() || !selectedIdea) {
      toast({
        title: "Empty Comment",
        description: "Please enter some text for your comment.",
        variant: "destructive"
      });
      return;
    }
    
    const comment: Comment = {
      id: `comment-${Date.now()}`,
      text: commentText,
      author: 'You',
      timestamp: new Date(),
      ideaId: selectedIdea
    };
    
    setComments([...comments, comment]);
    setCommentText('');
    
    toast({
      title: "Comment Added",
      description: "Your comment has been added to the idea.",
    });
  };

  // Filter ideas by category
  const filteredIdeas = selectedCategory === 'all' 
    ? ideas 
    : ideas.filter(idea => idea.category === selectedCategory);

  // Get comments for selected idea
  const selectedIdeaComments = comments.filter(
    comment => comment.ideaId === selectedIdea
  ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  // Generate ideas with AI
  const generateIdeas = () => {
    setIsGenerating(true);
    
    // Simulate API call
    setTimeout(() => {
      const generatedIdeas: Idea[] = [
        {
          id: `idea-gen-${Date.now()}`,
          text: 'Create a series of educational infographics explaining the benefits of our product for different customer segments.',
          author: 'AI Assistant',
          timestamp: new Date(),
          likes: 0,
          category: 'graphics',
          tags: ['educational', 'infographic']
        },
        {
          id: `idea-gen-${Date.now() + 1}`,
          text: 'Launch a weekly podcast interviewing industry experts and satisfied customers about trends and product use cases.',
          author: 'AI Assistant',
          timestamp: new Date(),
          likes: 0,
          category: 'audio',
          tags: ['podcast', 'interviews']
        }
      ];
      
      setIdeas([...generatedIdeas, ...ideas]);
      setIsGenerating(false);
      
      toast({
        title: "Ideas Generated",
        description: "AI has suggested new content ideas based on current trends.",
      });
    }, 2000);
  };

  // Format relative time
  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Export ideas as text
  const exportIdeas = () => {
    const formattedIdeas = ideas.map(idea => 
      `Idea: ${idea.text}\nAuthor: ${idea.author}\nCategory: ${idea.category}\nLikes: ${idea.likes}\nTags: ${idea.tags.join(', ')}\n\n`
    ).join('');
    
    const blob = new Blob([formattedIdeas], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'brainstorming-ideas.txt';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Ideas Exported",
      description: "Your ideas have been exported as a text file.",
    });
  };

  return (
    <div className="w-full">
      <Card className="border border-border/50">
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-start justify-between mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <Users className="h-6 w-6 mr-2 text-primary" />
                Collaborative Content Brainstorming
              </h2>
              <p className="text-muted-foreground mt-1">
                Work with your team to generate and refine content ideas
              </p>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" onClick={exportIdeas}>
                <Download className="h-4 w-4 mr-2" />
                Export Ideas
              </Button>
              <Button 
                onClick={generateIdeas}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <LightbulbIcon className="h-4 w-4 mr-2" />
                )}
                Generate Ideas
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left sidebar - participants */}
            <div className="order-3 lg:order-1">
              <Card className="h-full border border-border/50">
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Participants ({participants.filter(p => p.online).length} online)
                  </h3>
                  <div className="space-y-2">
                    {participants.map((participant) => (
                      <div 
                        key={participant.id} 
                        className={cn(
                          "flex items-center p-2 rounded-md",
                          participant.online ? "bg-muted/20" : "bg-transparent opacity-60"
                        )}
                      >
                        <Avatar className="h-8 w-8 mr-2">
                          {participant.avatar ? (
                            <AvatarImage src={participant.avatar} alt={participant.name} />
                          ) : (
                            <AvatarFallback>
                              {participant.name.charAt(0)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium flex items-center">
                            {participant.name}
                            {participant.online && (
                              <span className="ml-2 h-2 w-2 rounded-full bg-green-500" />
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">{participant.role}</p>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      <Plus className="h-3 w-3 mr-1" /> Invite
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Main content area */}
            <div className="order-1 lg:order-2 lg:col-span-2">
              <Tabs defaultValue="ideation" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="ideation" onClick={() => setActiveTab('ideation')}>
                    Ideation
                  </TabsTrigger>
                  <TabsTrigger value="organization" onClick={() => setActiveTab('organization')}>
                    Organization
                  </TabsTrigger>
                  <TabsTrigger value="refinement" onClick={() => setActiveTab('refinement')}>
                    Refinement
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="ideation" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-idea">Add a new idea</Label>
                    <Textarea
                      id="new-idea"
                      placeholder="Type your content idea here..."
                      value={newIdea}
                      onChange={(e) => setNewIdea(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex justify-end">
                      <Button onClick={addIdea}>
                        <Plus className="h-4 w-4 mr-2" /> Add Idea
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>All Ideas</Label>
                      <Select 
                        value={selectedCategory} 
                        onValueChange={setSelectedCategory}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="social-media">Social Media</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="blog">Blog</SelectItem>
                          <SelectItem value="influencer">Influencer</SelectItem>
                          <SelectItem value="graphics">Graphics</SelectItem>
                          <SelectItem value="audio">Audio</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <ScrollArea className="h-[400px] border rounded-md p-2">
                      <AnimatePresence>
                        {filteredIdeas.length === 0 ? (
                          <div className="p-8 text-center">
                            <p className="text-muted-foreground">
                              No ideas found. Add your first idea or switch category.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {filteredIdeas.map((idea) => (
                              <motion.div
                                key={idea.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                className="p-3 border rounded-md hover:shadow-sm transition-shadow"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center">
                                    <Avatar className="h-6 w-6 mr-2">
                                      <AvatarFallback>
                                        {idea.author.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium">{idea.author}</span>
                                    <span className="text-xs text-muted-foreground ml-2">
                                      {formatRelativeTime(idea.timestamp)}
                                    </span>
                                  </div>
                                  <div className="flex gap-1">
                                    {idea.author === 'You' && !idea.isEditing && (
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() => startEditingIdea(idea.id)}
                                      >
                                        <Pencil className="h-3 w-3" />
                                      </Button>
                                    )}
                                    {idea.author === 'You' && (
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className="h-6 w-6 p-0 text-destructive"
                                        onClick={() => deleteIdea(idea.id)}
                                      >
                                        <Trash className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                
                                {idea.isEditing ? (
                                  <div className="space-y-2">
                                    <Textarea
                                      defaultValue={idea.text}
                                      className="w-full min-h-[80px]"
                                      id={`edit-${idea.id}`}
                                    />
                                    <div className="flex justify-end gap-2">
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => cancelEditingIdea(idea.id)}
                                      >
                                        <X className="h-4 w-4 mr-1" />
                                        Cancel
                                      </Button>
                                      <Button 
                                        size="sm"
                                        onClick={() => {
                                          const textarea = document.getElementById(`edit-${idea.id}`) as HTMLTextAreaElement;
                                          updateIdea(idea.id, textarea.value);
                                        }}
                                      >
                                        <Check className="h-4 w-4 mr-1" />
                                        Save
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <p className="mb-2">{idea.text}</p>
                                    
                                    <div className="flex justify-between items-center">
                                      <div className="flex gap-1 flex-wrap">
                                        <Badge variant="secondary" className="text-xs">
                                          {idea.category}
                                        </Badge>
                                        {idea.tags.map((tag, index) => (
                                          <Badge 
                                            key={index} 
                                            variant="outline" 
                                            className="text-xs"
                                          >
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                      
                                      <div className="flex gap-2">
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          className="h-7 text-xs"
                                          onClick={() => {
                                            setSelectedIdea(idea.id);
                                            if (commentInputRef.current) {
                                              setTimeout(() => commentInputRef.current?.focus(), 0);
                                            }
                                          }}
                                        >
                                          <MessageSquare className="h-3 w-3 mr-1" />
                                          {comments.filter(c => c.ideaId === idea.id).length}
                                        </Button>
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          className="h-7 text-xs"
                                          onClick={() => likeIdea(idea.id)}
                                        >
                                          <ThumbsUp className="h-3 w-3 mr-1" />
                                          {idea.likes}
                                        </Button>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </AnimatePresence>
                    </ScrollArea>
                  </div>
                </TabsContent>
                
                <TabsContent value="organization" className="space-y-4">
                  <div className="border rounded-md p-6 h-[400px] flex items-center justify-center">
                    <div className="text-center max-w-md">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">Organize Your Ideas</h3>
                      <p className="text-muted-foreground mb-4">
                        In this tab, you would be able to organize your ideas into categories, 
                        campaigns, and content calendars.
                      </p>
                      <Button disabled>Coming Soon</Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="refinement" className="space-y-4">
                  <div className="border rounded-md p-6 h-[400px] flex items-center justify-center">
                    <div className="text-center max-w-md">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">Refine Your Content Plan</h3>
                      <p className="text-muted-foreground mb-4">
                        In this tab, you would be able to refine content ideas, 
                        add detailed outlines, and schedule content.
                      </p>
                      <Button disabled>Coming Soon</Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Right sidebar - comments */}
            <div className="order-2 lg:order-3">
              <Card className="h-full border border-border/50">
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3 flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Discussion
                  </h3>
                  
                  {selectedIdea ? (
                    <div className="flex flex-col h-full">
                      <div className="mb-3 p-2 bg-muted/50 rounded-md">
                        <p className="text-xs text-muted-foreground mb-1">Selected idea:</p>
                        <p className="text-sm">
                          {ideas.find(idea => idea.id === selectedIdea)?.text}
                        </p>
                      </div>
                      
                      <ScrollArea className="flex-1 mb-3 max-h-[300px]">
                        {selectedIdeaComments.length > 0 ? (
                          <div className="space-y-3">
                            {selectedIdeaComments.map((comment) => (
                              <div key={comment.id} className="flex gap-2">
                                <Avatar className="h-6 w-6 mt-1">
                                  <AvatarFallback>
                                    {comment.author.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium">{comment.author}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {formatRelativeTime(comment.timestamp)}
                                    </span>
                                  </div>
                                  <p className="text-sm">{comment.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center">
                            <p className="text-sm text-muted-foreground">
                              No comments yet. Start the discussion!
                            </p>
                          </div>
                        )}
                      </ScrollArea>
                      
                      <div className="mt-auto">
                        <div className="flex gap-2">
                          <Textarea
                            ref={commentInputRef}
                            placeholder="Add a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="min-h-[80px]"
                          />
                        </div>
                        <div className="flex justify-end mt-2">
                          <Button 
                            onClick={addComment}
                            disabled={!commentText.trim()}
                            size="sm"
                          >
                            <Send className="h-3 w-3 mr-2" />
                            Send
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center py-12">
                      <UserIcon className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-center text-muted-foreground mb-2">
                        Select an idea to view and add comments
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}