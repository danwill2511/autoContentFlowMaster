import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type ThemeOption = {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
};

type ThemeSwitcherProps = {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  onThemeChange?: (themeId: string) => void;
  floatingButton?: boolean;
  hideAfterSelection?: boolean;
  defaultTheme?: string;
};

export function ThemeSwitcher({
  position = 'bottom-left',
  onThemeChange,
  floatingButton = true,
  hideAfterSelection = false,
  defaultTheme = 'blue'
}: ThemeSwitcherProps) {
  const [selectedTheme, setSelectedTheme] = useState<string>(defaultTheme);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const themes: ThemeOption[] = [
    {
      id: 'blue',
      name: 'Ocean Blue',
      primaryColor: '#2563eb',
      secondaryColor: '#1e40af',
      bgColor: '#f8fafc',
      textColor: '#1e293b',
      accentColor: '#38bdf8'
    },
    {
      id: 'purple',
      name: 'Royal Purple',
      primaryColor: '#7c3aed',
      secondaryColor: '#5b21b6',
      bgColor: '#f5f3ff',
      textColor: '#1e1b4b',
      accentColor: '#c4b5fd'
    },
    {
      id: 'green',
      name: 'Forest Green',
      primaryColor: '#10b981',
      secondaryColor: '#047857',
      bgColor: '#ecfdf5',
      textColor: '#064e3b',
      accentColor: '#6ee7b7'
    },
    {
      id: 'orange',
      name: 'Sunset Orange',
      primaryColor: '#f97316',
      secondaryColor: '#c2410c',
      bgColor: '#fff7ed',
      textColor: '#7c2d12',
      accentColor: '#fdba74'
    },
    {
      id: 'pink',
      name: 'Cherry Blossom',
      primaryColor: '#ec4899',
      secondaryColor: '#be185d',
      bgColor: '#fdf2f8',
      textColor: '#831843',
      accentColor: '#f9a8d4'
    },
    {
      id: 'dark',
      name: 'Dark Mode',
      primaryColor: '#8b5cf6',
      secondaryColor: '#6d28d9',
      bgColor: '#1e1e2d',
      textColor: '#e2e8f0',
      accentColor: '#a78bfa'
    },
  ];

  // Apply the theme when it changes
  useEffect(() => {
    applyTheme(selectedTheme);
    
    if (onThemeChange) {
      onThemeChange(selectedTheme);
    }
  }, [selectedTheme]);

  const applyTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return;

    // Apply CSS variables to :root
    document.documentElement.style.setProperty('--primary', theme.primaryColor);
    document.documentElement.style.setProperty('--primary-dark', theme.secondaryColor);
    document.documentElement.style.setProperty('--background', theme.bgColor);
    document.documentElement.style.setProperty('--text', theme.textColor);
    document.documentElement.style.setProperty('--accent', theme.accentColor);
    
    // For dark mode, add a class to the html element
    if (themeId === 'dark') {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  };

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    
    toast({
      title: "Theme updated",
      description: `Theme has been changed to ${themes.find(t => t.id === themeId)?.name}`,
    });
    
    if (hideAfterSelection) {
      setIsOpen(false);
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
      default:
        return 'bottom-4 left-4';
    }
  };

  const triggerButton = (
    <Button 
      variant="secondary"
      size="icon"
      className="rounded-full"
      onClick={() => setIsOpen(!isOpen)}
    >
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" />
        </svg>
      </motion.div>
    </Button>
  );

  if (floatingButton) {
    return (
      <div className={`fixed z-40 ${getPositionClasses()}`}>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            {triggerButton}
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0 rounded-lg border" side="top">
            <div className="p-3">
              <h3 className="font-medium mb-2">Choose a theme</h3>
              <div className="grid grid-cols-3 gap-2">
                <AnimatePresence>
                  {themes.map(theme => (
                    <motion.div
                      key={theme.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleThemeSelect(theme.id)}
                      className={`cursor-pointer p-2 rounded-md flex flex-col items-center ${
                        selectedTheme === theme.id ? 'ring-2 ring-offset-2 ring-primary' : ''
                      }`}
                      style={{ backgroundColor: theme.bgColor }}
                    >
                      <div 
                        className="w-full h-6 rounded mb-1" 
                        style={{ backgroundColor: theme.primaryColor }}
                      />
                      <span className="text-xs" style={{ color: theme.textColor }}>
                        {theme.name}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {triggerButton}
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0 rounded-lg border">
        <div className="p-3">
          <h3 className="font-medium mb-2">Choose a theme</h3>
          <div className="grid grid-cols-3 gap-2">
            {themes.map(theme => (
              <motion.div
                key={theme.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleThemeSelect(theme.id)}
                className={`cursor-pointer p-2 rounded-md flex flex-col items-center ${
                  selectedTheme === theme.id ? 'ring-2 ring-offset-2 ring-primary' : ''
                }`}
                style={{ backgroundColor: theme.bgColor }}
              >
                <div 
                  className="w-full h-6 rounded mb-1" 
                  style={{ backgroundColor: theme.primaryColor }}
                />
                <span className="text-xs" style={{ color: theme.textColor }}>
                  {theme.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}