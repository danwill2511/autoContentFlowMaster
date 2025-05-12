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
  // Size classes
  const sizeClasses = {
    sm: {
      badge: 'w-10 h-10',
      icon: 'w-5 h-5',
      unlocked: 'w-3 h-3',
      progress: 'w-7 h-7',
      label: 'text-xs',
      tooltip: 'w-48'
    },
    md: {
      badge: 'w-14 h-14',
      icon: 'w-7 h-7',
      unlocked: 'w-4 h-4',
      progress: 'w-10 h-10',
      label: 'text-sm',
      tooltip: 'w-56'
    },
    lg: {
      badge: 'w-20 h-20',
      icon: 'w-10 h-10',
      unlocked: 'w-5 h-5',
      progress: 'w-16 h-16',
      label: 'text-base',
      tooltip: 'w-64'
    }
  };

  // Badge content
  const BadgeContent = () => (
    <motion.div 
      className={`relative flex items-center justify-center ${sizeClasses[size].badge} rounded-full ${
        achievement.unlocked 
          ? 'bg-primary-100 text-primary-700' 
          : 'bg-neutral-100 text-neutral-400'
      } cursor-pointer`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
    >
      {/* Icon */}
      <div className={sizeClasses[size].icon}>
        {achievement.icon}
      </div>
      
      {/* Unlocked indicator */}
      {achievement.unlocked && (
        <motion.div 
          className={`absolute -top-1 -right-1 bg-green-500 text-white ${sizeClasses[size].unlocked} rounded-full flex items-center justify-center`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-full h-full p-0.5">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </motion.div>
      )}
      
      {/* Progress indicator */}
      {!achievement.unlocked && achievement.progress && (
        <motion.div 
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
              className="stroke-primary-200"
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="stroke-primary-500"
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${achievement.progress.current / achievement.progress.total * 100}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <text 
              x="18" 
              y="21" 
              textAnchor="middle" 
              className="fill-primary-700 text-[8px] font-semibold"
            >
              {`${achievement.progress.current}/${achievement.progress.total}`}
            </text>
          </svg>
        </motion.div>
      )}
    </motion.div>
  );

  // Tooltip content
  const TooltipInfo = () => (
    <div className={`space-y-1 p-2 ${sizeClasses[size].tooltip}`}>
      <p className="font-medium">{achievement.name}</p>
      <p className="text-xs text-neutral-500">{achievement.description}</p>
      {!achievement.unlocked && achievement.progress && (
        <div className="mt-2">
          <div className="w-full bg-neutral-200 rounded-full h-1.5">
            <div 
              className="bg-primary-500 h-1.5 rounded-full" 
              style={{ width: `${(achievement.progress.current / achievement.progress.total) * 100}%` }}
            />
          </div>
          <div className="text-xs text-neutral-500 mt-1 text-right">
            {achievement.progress.current} / {achievement.progress.total}
          </div>
        </div>
      )}
    </div>
  );

  // Render with or without tooltip
  return showTooltip ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div><BadgeContent /></div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <TooltipInfo />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    <BadgeContent />
  );
}