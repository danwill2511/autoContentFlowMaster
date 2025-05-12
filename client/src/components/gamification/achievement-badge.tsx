import React from 'react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress?: {
    current: number;
    total: number;
  };
}

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  onClick?: () => void;
}

export function AchievementBadge({
  achievement,
  size = 'md',
  showTooltip = true,
  onClick
}: AchievementBadgeProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const badge = (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full relative 
        ${achievement.unlocked 
          ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-white cursor-pointer' 
          : 'bg-neutral-200 text-neutral-400 opacity-50'}`}
    >
      <div className="absolute inset-0 rounded-full overflow-hidden">
        {achievement.progress && achievement.progress.current > 0 && !achievement.unlocked && (
          <div 
            className="absolute bottom-0 bg-amber-300 opacity-40"
            style={{ 
              height: `${(achievement.progress.current / achievement.progress.total) * 100}%`,
              width: '100%' 
            }}
          />
        )}
      </div>
      <div className={`relative ${achievement.unlocked ? 'text-white' : 'text-neutral-500'}`}>
        {achievement.icon}
      </div>
      {achievement.unlocked && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </span>
      )}
    </motion.div>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px] text-center">
          <div className="font-medium">{achievement.name}</div>
          <div className="text-xs text-neutral-500">{achievement.description}</div>
          {achievement.progress && !achievement.unlocked && (
            <div className="mt-1 text-xs">
              Progress: {achievement.progress.current}/{achievement.progress.total}
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}