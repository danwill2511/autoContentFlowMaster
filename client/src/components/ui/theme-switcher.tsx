import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';

type ThemeColor = 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'dark';

interface ThemeSwitcherProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  floatingButton?: boolean;
}

export function ThemeSwitcher({
  position = 'bottom-left',
  floatingButton = true
}: ThemeSwitcherProps) {
  const [currentTheme, setCurrentTheme] = useState<ThemeColor>('blue');
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  };

  // Color classes for themes
  const colorClasses = {
    blue: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a'
      }
    },
    purple: {
      primary: {
        50: '#faf5ff',
        100: '#f3e8ff',
        200: '#e9d5ff',
        300: '#d8b4fe',
        400: '#c084fc',
        500: '#a855f7',
        600: '#9333ea',
        700: '#7e22ce',
        800: '#6b21a8',
        900: '#581c87'
      }
    },
    green: {
      primary: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d'
      }
    },
    orange: {
      primary: {
        50: '#fff7ed',
        100: '#ffedd5',
        200: '#fed7aa',
        300: '#fdba74',
        400: '#fb923c',
        500: '#f97316',
        600: '#ea580c',
        700: '#c2410c',
        800: '#9a3412',
        900: '#7c2d12'
      }
    },
    pink: {
      primary: {
        50: '#fdf2f8',
        100: '#fce7f3',
        200: '#fbcfe8',
        300: '#f9a8d4',
        400: '#f472b6',
        500: '#ec4899',
        600: '#db2777',
        700: '#be185d',
        800: '#9d174d',
        900: '#831843'
      }
    },
    dark: {
      primary: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827'
      }
    }
  };

  // Theme options
  const themeOptions: Array<{
    id: ThemeColor;
    name: string;
    background: string;
    accent: string;
    icon?: React.ReactNode;
  }> = [
    {
      id: 'blue',
      name: 'Blue',
      background: 'bg-blue-500',
      accent: 'bg-blue-200',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      id: 'purple',
      name: 'Purple',
      background: 'bg-purple-500',
      accent: 'bg-purple-200'
    },
    {
      id: 'green',
      name: 'Green',
      background: 'bg-green-500',
      accent: 'bg-green-200'
    },
    {
      id: 'orange',
      name: 'Orange',
      background: 'bg-orange-500',
      accent: 'bg-orange-200'
    },
    {
      id: 'pink',
      name: 'Pink',
      background: 'bg-pink-500',
      accent: 'bg-pink-200'
    },
    {
      id: 'dark',
      name: 'Dark',
      background: 'bg-gray-800',
      accent: 'bg-gray-600'
    },
  ];

  // Load theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme && Object.keys(colorClasses).includes(savedTheme)) {
      setCurrentTheme(savedTheme as ThemeColor);
      applyTheme(savedTheme as ThemeColor);
    }
  }, []);

  // Apply theme by changing CSS variables
  const applyTheme = (theme: ThemeColor) => {
    const root = document.documentElement;

    // Set CSS variables for the theme
    Object.entries(colorClasses[theme].primary).forEach(([key, value]) => {
      root.style.setProperty(`--color-primary-${key}`, value);
    });

    // Store theme preference
    localStorage.setItem('app-theme', theme);
  };

  // Handle theme change
  const handleThemeChange = (theme: ThemeColor) => {
    setCurrentTheme(theme);
    applyTheme(theme);
    setIsOpen(false);
    
    toast({
      title: `Theme Changed`,
      description: `Applied the ${theme.charAt(0).toUpperCase() + theme.slice(1)} theme.`,
    });
  };

  // Floating button component
  const FloatingButton = () => (
    <AnimatePresence>
      <motion.div
        className={`fixed ${positionClasses[position]} z-40`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 250, damping: 20 }}
      >
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-10 w-10 shadow-md border border-neutral-200 bg-white"
              onClick={() => setIsOpen(!isOpen)}
            >
              <div className={`w-5 h-5 rounded-full ${themeOptions.find(t => t.id === currentTheme)?.background}`}></div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-2" align="end">
            <div className="space-y-2">
              <div className="px-1 py-1">
                <h3 className="text-sm font-medium">Choose Theme</h3>
                <p className="text-xs text-neutral-500">Select your preferred color scheme</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {themeOptions.map((theme) => (
                  <button
                    key={theme.id}
                    className={`relative flex flex-col items-center rounded-md p-2 hover:bg-neutral-100 transition-colors ${
                      currentTheme === theme.id ? 'bg-neutral-100' : ''
                    }`}
                    onClick={() => handleThemeChange(theme.id)}
                  >
                    <div className={`w-full h-6 rounded ${theme.background} mb-1`}></div>
                    <div className={`w-full h-2 rounded ${theme.accent}`}></div>
                    <span className="mt-1 text-xs">{theme.name}</span>
                    {currentTheme === theme.id && (
                      <div className="absolute -top-1 -right-1 text-white bg-green-500 rounded-full w-4 h-4 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </motion.div>
    </AnimatePresence>
  );

  // Inline button and options
  const InlineSelector = () => (
    <div className="rounded-lg border border-neutral-200 bg-white shadow-sm p-3">
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium">Application Theme</h3>
          <p className="text-xs text-neutral-500">Choose your preferred color scheme</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {themeOptions.map((theme) => (
            <button
              key={theme.id}
              className={`relative flex flex-col items-center rounded-md p-2 hover:bg-neutral-100 transition-colors ${
                currentTheme === theme.id ? 'bg-neutral-100' : ''
              }`}
              onClick={() => handleThemeChange(theme.id)}
            >
              <div className={`w-full h-6 rounded ${theme.background} mb-1`}></div>
              <div className={`w-full h-2 rounded ${theme.accent}`}></div>
              <span className="mt-1 text-xs">{theme.name}</span>
              {currentTheme === theme.id && (
                <div className="absolute -top-1 -right-1 text-white bg-green-500 rounded-full w-4 h-4 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return floatingButton ? <FloatingButton /> : <InlineSelector />;
}