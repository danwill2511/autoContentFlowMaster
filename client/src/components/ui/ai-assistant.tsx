import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface AiAssistantProps {
  characterName?: string;
  initialMessage?: string;
  contextualHints?: string[];
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

interface Message {
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
}

export function AiAssistant({
  characterName = 'Assistant',
  initialMessage = 'Hello! How can I help you today?',
  contextualHints = [],
  position = 'bottom-right'
}: AiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isBubbleOpen, setIsBubbleOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [mood, setMood] = useState<'neutral' | 'happy' | 'thinking' | 'confused'>('neutral');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  };

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          sender: 'ai',
          text: initialMessage,
          timestamp: new Date()
        }
      ]);
      
      // Show bubble after a delay
      setTimeout(() => {
        setIsBubbleOpen(true);
      }, 2000);
    }
  }, [initialMessage]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Close bubble when chat is opened
  useEffect(() => {
    if (isOpen) {
      setIsBubbleOpen(false);
    }
  }, [isOpen]);

  // Simple AI responses based on keywords
  const getAiResponse = async (message: string): Promise<string> => {
    // Normalize message for keyword matching
    const lowerMessage = message.toLowerCase();
    setIsThinking(true);
    
    // Simple keyword matching for demo purposes
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Change mood based on message content
    if (lowerMessage.includes('thank') || lowerMessage.includes('great') || lowerMessage.includes('awesome')) {
      setMood('happy');
    } else if (lowerMessage.includes('confused') || lowerMessage.includes('don\'t understand') || lowerMessage.includes('problem')) {
      setMood('confused');
    } else {
      setMood('neutral');
    }
    
    // Generate response based on keywords
    let response = '';
    
    if (lowerMessage.includes('help')) {
      response = `I'm here to help with AutoContentFlow! You can ask me about creating workflows, connecting platforms, or content generation.`;
    } 
    else if (lowerMessage.includes('workflow') || lowerMessage.includes('automate')) {
      response = `To create a workflow, go to the Workflows page and click "Create Workflow". You can select content types, platforms, and scheduling options.`;
    } 
    else if (lowerMessage.includes('platform') || lowerMessage.includes('connect')) {
      response = `To connect a social media platform, navigate to the Platforms page, select your desired platform, and follow the authentication prompts.`;
    } 
    else if (lowerMessage.includes('content') || lowerMessage.includes('generate')) {
      response = `Our AI can generate various types of content: blog posts, social media updates, email newsletters, and more. Just specify your topic and tone!`;
    } 
    else if (lowerMessage.includes('analytics') || lowerMessage.includes('stats') || lowerMessage.includes('performance')) {
      response = `Check out the Analytics page to see engagement metrics, content performance by platform, and audience growth statistics.`;
    } 
    else if (lowerMessage.includes('subscribe') || lowerMessage.includes('upgrade') || lowerMessage.includes('plan')) {
      response = `You can upgrade your subscription on the Subscription page. We offer Essential, Pro, and Business tiers with increasing features and capabilities.`;
    } 
    else if (lowerMessage.includes('shopify') || lowerMessage.includes('store') || lowerMessage.includes('product')) {
      response = `Our Shopify integration lets you automatically create content for your products. Connect your store on the Platforms page and select "Shopify".`;
    } 
    else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      response = `Hi there! I'm ${characterName}, your AI assistant. How can I help you with content creation today?`;
    } 
    else {
      response = "I'm not sure I understand. Could you try rephrasing your question? You can ask about workflows, platforms, content generation, or analytics.";
      setMood('thinking');
    }
    
    setIsThinking(false);
    return response;
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      sender: 'user',
      text: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Generate AI response
    try {
      const response = await getAiResponse(userMessage.text);
      
      // Add AI response
      const aiMessage: Message = {
        sender: 'ai',
        text: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast({
        title: "AI Assistant Error",
        description: "Sorry, I couldn't generate a response. Please try again.",
        variant: "destructive",
      });
      setMood('confused');
    }
  };

  // Handle pressing Enter in the input field
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Handle clicking a contextual hint
  const handleHintClick = (hint: string) => {
    setInputValue(hint);
    
    // Auto-submit after a brief delay
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  // Get emoji based on mood
  const getMoodEmoji = () => {
    switch (mood) {
      case 'happy': return '😊';
      case 'thinking': return '🤔';
      case 'confused': return '😕';
      default: return '🙂';
    }
  };

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating Bubble */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            className={`fixed ${positionClasses[position]} z-50 ${isBubbleOpen ? 'cursor-pointer' : 'cursor-default'}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: isBubbleOpen ? 1 : 0, opacity: isBubbleOpen ? 1 : 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={() => isBubbleOpen && setIsOpen(true)}
          >
            <div className="relative">
              <div className="flex items-center">
                <motion.div 
                  className="absolute p-3 -left-4 -top-1"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                >
                  <div className="w-3 h-3 bg-primary-400 rounded-full" />
                </motion.div>
                <div className="bg-white border border-neutral-100 rounded-tl-xl rounded-tr-xl rounded-br-xl p-3 shadow-lg max-w-xs">
                  <p className="text-sm">{initialMessage.split(' ').slice(0, 5).join(' ')}...</p>
                </div>
              </div>
              <div className="absolute -bottom-6 right-0 bg-primary-100 rounded-full p-2 h-12 w-12 flex items-center justify-center border-2 border-white shadow-md">
                <span className="text-xl">{getMoodEmoji()}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`fixed ${positionClasses[position]} z-50`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="w-80 md:w-96 overflow-hidden shadow-xl border border-neutral-200">
              {/* Header */}
              <div className="bg-primary-50 p-3 flex items-center justify-between border-b border-neutral-200">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10 bg-primary-100 text-primary-800 flex items-center justify-center">
                    <span className="text-xl">{getMoodEmoji()}</span>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-neutral-900">{characterName}</h3>
                    <p className="text-xs text-neutral-500">AI Assistant</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  className="h-8 w-8 p-0" 
                  onClick={() => setIsOpen(false)}
                >
                  <span className="sr-only">Close</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M6 18L18 6M6 6l12 12" 
                    />
                  </svg>
                </Button>
              </div>
              
              {/* Messages */}
              <div className="h-80 overflow-y-auto p-3 bg-neutral-50 space-y-3">
                {messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg px-3 py-2 ${
                        msg.sender === 'user' 
                          ? 'bg-primary-100 text-primary-800' 
                          : 'bg-white border border-neutral-200 text-neutral-800'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className="text-xs opacity-70 text-right mt-1">
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Thinking indicator */}
                {isThinking && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-neutral-200 rounded-lg px-3 py-2 max-w-[80%]">
                      <div className="flex space-x-1">
                        <motion.div 
                          className="w-2 h-2 bg-neutral-300 rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                        />
                        <motion.div 
                          className="w-2 h-2 bg-neutral-300 rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                        />
                        <motion.div 
                          className="w-2 h-2 bg-neutral-300 rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Auto-scroll anchor */}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Contextual hints */}
              {contextualHints.length > 0 && (
                <div className="p-3 border-t border-neutral-200 bg-white">
                  <p className="text-xs text-neutral-500 mb-2">Suggested questions:</p>
                  <div className="flex flex-wrap gap-2">
                    {contextualHints.map((hint, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleHintClick(hint)}
                      >
                        {hint}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Input */}
              <div className="p-3 border-t border-neutral-200 bg-white">
                <div className="flex space-x-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={isThinking}>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
                      />
                    </svg>
                    <span className="sr-only">Send</span>
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}