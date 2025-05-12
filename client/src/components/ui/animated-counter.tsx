import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  formatValue?: (value: number) => string;
  className?: string;
  onComplete?: () => void;
}

export function AnimatedCounter({
  value,
  duration = 2,
  formatValue = (val) => val.toLocaleString(),
  className = '',
  onComplete
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValue = useRef(0);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Clear any existing animation
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }
    
    // Calculate animation steps
    const startValue = prevValue.current;
    const endValue = value;
    const diff = endValue - startValue;
    const steps = 30; // 30 frames per second * duration
    
    let currentStep = 0;
    
    // Start the animation
    animationRef.current = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easedProgress = easeOutCubic(progress);
      const newValue = startValue + (diff * easedProgress);
      
      setDisplayValue(Math.round(newValue));
      
      // Complete the animation
      if (currentStep >= steps) {
        setDisplayValue(endValue);
        clearInterval(animationRef.current!);
        if (onComplete) onComplete();
      }
    }, (duration * 1000) / steps);
    
    // Save current value as previous for next animation
    prevValue.current = value;
    
    // Cleanup
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [value, duration, onComplete]);
  
  // Easing function
  const easeOutCubic = (x: number): number => {
    return 1 - Math.pow(1 - x, 3);
  };
  
  return (
    <span className={className}>
      {formatValue(displayValue)}
    </span>
  );
}

interface AnimatedProgressProps {
  value: number;
  max?: number;
  duration?: number;
  color?: string;
  height?: number;
  className?: string;
  showLabel?: boolean;
  labelClassName?: string;
  labelPosition?: 'inside' | 'outside';
  formatLabel?: (value: number, max: number) => string;
  onComplete?: () => void;
}

export function AnimatedProgress({
  value,
  max = 100,
  duration = 1.5,
  color = '#3b82f6',
  height = 6,
  className = '',
  showLabel = true,
  labelClassName = '',
  labelPosition = 'inside',
  formatLabel = (value, max) => `${Math.round((value / max) * 100)}%`,
  onComplete
}: AnimatedProgressProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValue = useRef(0);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Clear any existing animation
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }
    
    // Calculate animation steps
    const startValue = prevValue.current;
    const endValue = value;
    const diff = endValue - startValue;
    const steps = 30; // 30 frames per second * duration
    
    let currentStep = 0;
    
    // Start the animation
    animationRef.current = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easedProgress = easeOutCubic(progress);
      const newValue = startValue + (diff * easedProgress);
      
      setDisplayValue(Math.round(newValue));
      
      // Complete the animation
      if (currentStep >= steps) {
        setDisplayValue(endValue);
        clearInterval(animationRef.current!);
        if (onComplete) onComplete();
      }
    }, (duration * 1000) / steps);
    
    // Save current value as previous for next animation
    prevValue.current = value;
    
    // Cleanup
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [value, duration, onComplete]);
  
  // Easing function
  const easeOutCubic = (x: number): number => {
    return 1 - Math.pow(1 - x, 3);
  };
  
  // Calculate percentage for width
  const percentage = Math.min(100, (displayValue / max) * 100);
  
  return (
    <div className={`relative ${className}`}>
      <div 
        className="overflow-hidden rounded-full bg-neutral-200" 
        style={{ height }}
      >
        <motion.div 
          className="h-full rounded-full"
          initial={{ width: `${Math.min(100, (prevValue.current / max) * 100)}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
          style={{ backgroundColor: color }}
        />
      </div>
      
      {showLabel && labelPosition === 'inside' && (
        <div className={`absolute inset-0 flex items-center justify-center text-xs font-medium ${labelClassName}`}>
          {formatLabel(displayValue, max)}
        </div>
      )}
      
      {showLabel && labelPosition === 'outside' && (
        <div className={`mt-1 text-right text-xs ${labelClassName}`}>
          {formatLabel(displayValue, max)}
        </div>
      )}
    </div>
  );
}

interface AnimatedBarChartProps {
  data: {
    label: string;
    value: number;
    color?: string;
  }[];
  height?: number;
  maxValue?: number;
  showLabels?: boolean;
  animate?: boolean;
  barSpacing?: number;
  duration?: number;
  className?: string;
}

export function AnimatedBarChart({
  data,
  height = 200,
  maxValue,
  showLabels = true,
  animate = true,
  barSpacing = 8,
  duration = 0.5,
  className = ''
}: AnimatedBarChartProps) {
  // Calculate maximum value
  const calculatedMax = maxValue || Math.max(...data.map(item => item.value)) * 1.2;
  
  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <div className="flex h-full items-end justify-between">
        {data.map((item, index) => {
          const barHeight = `${(item.value / calculatedMax) * 100}%`;
          const barColor = item.color || '#3b82f6';
          
          return (
            <div
              key={`${item.label}-${index}`}
              className="flex flex-col items-center"
              style={{ width: `calc((100% - ${(data.length - 1) * barSpacing}px) / ${data.length})` }}
            >
              <motion.div
                className="w-full rounded-t"
                style={{ 
                  backgroundColor: barColor,
                  height: animate ? 0 : barHeight
                }}
                animate={{ height: barHeight }}
                transition={{ duration }}
              />
              
              {showLabels && (
                <div className="mt-2 w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-xs">
                  {item.label}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface AnimatedIconProps {
  icon: React.ReactNode;
  animation: 
    | 'pulse' 
    | 'bounce' 
    | 'spin' 
    | 'shake' 
    | 'wiggle'
    | 'flash'
    | 'tada'
    | 'heartbeat';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
  duration?: number;
  onClick?: () => void;
  tooltip?: string;
}

export function AnimatedIcon({
  icon,
  animation,
  size = 'md',
  color = 'currentColor',
  className = '',
  duration = 1.5,
  onClick,
  tooltip
}: AnimatedIconProps) {
  // Size mapping
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }[size];
  
  // Animation variants
  const variants = {
    pulse: {
      scale: [1, 1.1, 1],
      opacity: [1, 0.8, 1],
      transition: { duration, repeat: Infinity }
    },
    bounce: {
      y: ['0%', '-25%', '0%'],
      transition: { duration, repeat: Infinity }
    },
    spin: {
      rotate: [0, 360],
      transition: { duration, repeat: Infinity, ease: 'linear' }
    },
    shake: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration, repeat: Infinity, repeatDelay: 1 }
    },
    wiggle: {
      rotate: [0, -10, 10, -10, 10, 0],
      transition: { duration, repeat: Infinity, repeatDelay: 1 }
    },
    flash: {
      opacity: [1, 0, 1, 0, 1],
      transition: { duration, repeat: Infinity, repeatDelay: 1 }
    },
    tada: {
      scale: [1, 0.9, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1],
      rotate: [0, -3, 3, -3, 3, -3, 3, -3, 0],
      transition: { duration, repeat: Infinity, repeatDelay: 2 }
    },
    heartbeat: {
      scale: [1, 1.3, 1, 1.3, 1],
      transition: { duration, repeat: Infinity, repeatDelay: 1 }
    }
  };
  
  return (
    <motion.div
      className={`inline-flex items-center justify-center ${sizeClass} ${className}`}
      animate={variants[animation]}
      onClick={onClick}
      style={{ color }}
      title={tooltip}
    >
      {icon}
    </motion.div>
  );
}