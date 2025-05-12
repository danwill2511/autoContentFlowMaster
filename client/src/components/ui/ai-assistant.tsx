import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface AiAssistantProps {
  characterName?: string;
  contextualHints?: string[];
  initialMessage?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export function AiAssistant({
  characterName = 'Flow',
  contextualHints = [
    'Try creating a new workflow for your social media content',
    'You can customize your content tone in the workflow settings',
    'Use the analytics dashboard to track your content performance'
  ],
  initialMessage = 'Hi there! I\'m Flow, your AI assistant. How can I help you with content creation today?',
  position = 'bottom-right'
}: AiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(true);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [hint, setHint] = useState(contextualHints[0]);
  const [showHint, setShowHint] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [emotion, setEmotion] = useState<'neutral' | 'happy' | 'thinking'>('neutral');
  
  // Initialize with the welcome message
  useEffect(() => {
    if (!messages.length) {
      setMessages([
        {
          id: 'welcome',
          content: initialMessage,
          sender: 'assistant',
          timestamp: new Date()
        }
      ]);
      setUnreadCount(1);
    }
  }, [initialMessage]);
  
  // Rotate through hints
  useEffect(() => {
    const interval = setInterval(() => {
      setHint(hints => {
        const currentIndex = contextualHints.indexOf(hints);
        const nextIndex = (currentIndex + 1) % contextualHints.length;
        return contextualHints[nextIndex];
      });
      
      if (!isOpen) {
        setShowHint(true);
        setTimeout(() => setShowHint(false), 5000);
      }
    }, 15000);
    
    return () => clearInterval(interval);
  }, [contextualHints, isOpen]);
  
  // Assistant response simulation
  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setEmotion('thinking');
    setIsTyping(true);
    
    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: getAssistantResponse(input),
        sender: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
      setEmotion('happy');
      
      setTimeout(() => {
        setEmotion('neutral');
      }, 2000);
      
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    }, 1500);
  };
  
  // Mock response generator - in a real app, this would call the AI service
  const getAssistantResponse = (userInput: string): string => {
    const userInputLower = userInput.toLowerCase();
    
    if (userInputLower.includes('workflow') || userInputLower.includes('create')) {
      return "To create a new workflow, click the 'New Workflow' button on the dashboard. You can then set your content type, tone, and target platforms.";
    } else if (userInputLower.includes('analytics') || userInputLower.includes('performance')) {
      return "You can view your content performance in the Analytics dashboard. It shows engagement rates, audience growth, and content quality scores.";
    } else if (userInputLower.includes('help') || userInputLower.includes('how to')) {
      return "I'm here to help! Check out our getting started guide in the Help section, or ask me specific questions about creating content workflows.";
    } else {
      return "I understand you're asking about " + userInput.substring(0, 20) + "... Can you provide more details about what you need help with?";
    }
  };
  
  // Handle opening the assistant
  const handleOpen = () => {
    setIsOpen(true);
    setShowBubble(false);
    setUnreadCount(0);
    setShowHint(false);
  };
  
  // Handle closing the assistant
  const handleClose = () => {
    setIsOpen(false);
    setShowBubble(true);
  };
  
  // Render the assistant avatar with expression
  const renderAssistantAvatar = () => {
    return (
      <div className="relative">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-primary-500 text-white ${emotion === 'thinking' ? 'animate-pulse' : ''}`}>
          <span className="text-xl font-bold">{characterName.charAt(0)}</span>
        </div>
        
        {/* Expression overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {emotion === 'neutral' && (
            <span className="text-xl">😊</span>
          )}
          {emotion === 'happy' && (
            <span className="text-xl">😄</span>
          )}
          {emotion === 'thinking' && (
            <span className="text-xl">🤔</span>
          )}
        </div>
      </div>
    );
  };
  
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'left-4 bottom-4';
      case 'top-right':
        return 'right-4 top-4';
      case 'top-left':
        return 'left-4 top-4';
      case 'bottom-right':
      default:
        return 'right-4 bottom-4';
    }
  };
  
  return (
    <>
      {/* Floating chat bubble */}
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className={`fixed ${getPositionClasses()} z-50`}
          >
            <div className="relative">
              <Button
                onClick={handleOpen}
                className="w-12 h-12 rounded-full shadow-lg bg-primary-500 hover:bg-primary-600 p-0"
              >
                {renderAssistantAvatar()}
              </Button>
              
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {unreadCount}
                </div>
              )}
              
              {/* Hint speech bubble */}
              <AnimatePresence>
                {showHint && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-white rounded-lg shadow-lg"
                  >
                    <div className="text-sm">{hint}</div>
                    <div className="absolute w-3 h-3 bg-white transform rotate-45 right-4 -bottom-1.5"></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Full assistant dialog */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed ${getPositionClasses()} z-50 w-full max-w-sm bg-white rounded-lg shadow-xl border overflow-hidden`}
          >
            {/* Header */}
            <div className="bg-primary-500 p-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {renderAssistantAvatar()}
                <div>
                  <h3 className="font-medium">{characterName}</h3>
                  <p className="text-xs opacity-80">Your content assistant</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleClose}
                className="h-8 w-8 rounded-full text-white hover:bg-primary-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Button>
            </div>
            
            {/* Chat messages */}
            <ScrollArea className="h-96 p-4">
              <div className="space-y-4">
                {messages.map(message => (
                  <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`max-w-[75%] px-4 py-2 rounded-lg ${
                        message.sender === 'user' 
                          ? 'bg-primary-100 text-primary-800' 
                          : 'bg-neutral-100 text-neutral-800'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-50 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-neutral-100 px-4 py-2 rounded-lg text-neutral-800">
                      <div className="flex space-x-1 items-center h-5">
                        <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            {/* Input area */}
            <div className="p-4 border-t">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex space-x-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!input.trim()}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11h2v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </Button>
              </form>
              <div className="mt-2 flex flex-wrap gap-2">
                {contextualHints.slice(0, 2).map((hint, index) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => {
                      setInput(hint);
                    }}
                  >
                    {hint.length > 30 ? hint.substring(0, 27) + '...' : hint}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}