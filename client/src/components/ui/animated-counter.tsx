import React, { useState, useEffect, useRef } from 'react';
import { useSpring, animated } from 'framer-motion';

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
  const [internalValue, setInternalValue] = useState(0);
  const prevValue = useRef(0);
  
  // Setup animation spring
  const springValue = useSpring({
    from: { value: prevValue.current },
    to: { value },
    config: { duration: duration * 1000 },
    onRest: () => {
      if (onComplete) onComplete();
    },
  });
  
  // Update internal state for render
  useEffect(() => {
    prevValue.current = internalValue;
    setInternalValue(value);
  }, [value]);
  
  return (
    <animated.span
      className={className}
      // Use Framer Motion's animated.span with incremental value
      // @ts-ignore - Framer Motion typings are problematic here
      children={springValue.value.to(val => formatValue(Math.floor(val)))}
    />
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
  duration = 1,
  color = '#2563eb',
  height = 8,
  className = '',
  showLabel = false,
  labelClassName = '',
  labelPosition = 'outside',
  formatLabel = (value, max) => `${Math.round((value / max) * 100)}%`,
  onComplete
}: AnimatedProgressProps) {
  const prevWidth = useRef(0);
  const percentage = (value / max) * 100;
  
  // Animate the width using framer-motion
  const width = useSpring({
    from: { width: prevWidth.current },
    to: { width: percentage },
    config: { duration: duration * 1000 },
    onRest: () => {
      if (onComplete) onComplete();
    },
  });
  
  // Update reference for subsequent animations
  useEffect(() => {
    prevWidth.current = percentage;
  }, [percentage]);
  
  return (
    <div className={`relative ${className}`}>
      <div
        className="bg-neutral-200 rounded overflow-hidden"
        style={{ height: `${height}px` }}
      >
        <animated.div
          className="h-full rounded"
          style={{
            width: width.width.to(w => `${w}%`),
            backgroundColor: color,
          }}
        >
          {showLabel && labelPosition === 'inside' && (
            <div className="h-full px-2 flex items-center justify-center">
              <animated.span
                className={`text-white text-xs font-medium ${labelClassName}`}
                // @ts-ignore
                children={width.width.to(w => formatLabel(w * max / 100, max))}
              />
            </div>
          )}
        </animated.div>
      </div>
      
      {showLabel && labelPosition === 'outside' && (
        <div className="mt-1 text-right">
          <animated.span
            className={`text-xs ${labelClassName}`}
            // @ts-ignore
            children={width.width.to(w => formatLabel(w * max / 100, max))}
          />
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
  maxValue: userMaxValue,
  showLabels = true,
  animate = true,
  barSpacing = 12,
  duration = 1,
  className = ''
}: AnimatedBarChartProps) {
  // Calculate the max value from data if not provided
  const maxValue = userMaxValue || Math.max(...data.map(item => item.value), 0);
  const barWidth = `calc((100% - ${(data.length - 1) * barSpacing}px) / ${data.length})`;
  
  return (
    <div className={`relative ${className}`}>
      <div className="relative" style={{ height: `${height}px` }}>
        <div className="flex h-full items-end">
          {data.map((item, index) => {
            const percentage = (item.value / maxValue) * 100;
            
            return (
              <div
                key={index}
                className="group flex flex-col items-center"
                style={{ width: barWidth, marginRight: index < data.length - 1 ? `${barSpacing}px` : 0 }}
              >
                <div className="w-full relative flex items-end justify-center h-full">
                  <animated.div
                    className="w-full rounded-t-md group-hover:opacity-90 transition-opacity"
                    style={{
                      backgroundColor: item.color || '#2563eb',
                      height: animate
                        ? useSpring({
                            from: { height: '0%' },
                            to: { height: `${percentage}%` },
                            config: { duration: duration * 1000 }
                          }).height
                        : `${percentage}%`,
                    }}
                  />
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-neutral-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                      {item.value.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                {showLabels && (
                  <div className="mt-2 text-xs text-center truncate w-full" title={item.label}>
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>
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
  color,
  className = '',
  duration = 1,
  onClick,
  tooltip
}: AnimatedIconProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-10 w-10'
  };

  // Animation values
  const animations = {
    pulse: {
      animate: { scale: [1, 1.05, 1] },
      transition: { 
        repeat: Infinity, 
        duration: duration,
        ease: "easeInOut"
      }
    },
    bounce: {
      animate: { y: [0, -10, 0] },
      transition: { 
        repeat: Infinity, 
        duration: duration,
        ease: "easeInOut"
      }
    },
    spin: {
      animate: { rotate: 360 },
      transition: { 
        repeat: Infinity, 
        duration: duration,
        ease: "linear"
      }
    },
    shake: {
      animate: { x: [0, -5, 5, -5, 5, 0] },
      transition: { 
        repeat: Infinity, 
        duration: duration,
        ease: "easeInOut"
      }
    },
    wiggle: {
      animate: { rotate: [0, -5, 5, -5, 5, 0] },
      transition: { 
        repeat: Infinity, 
        duration: duration,
        ease: "easeInOut"
      }
    },
    flash: {
      animate: { opacity: [1, 0.5, 1] },
      transition: { 
        repeat: Infinity, 
        duration: duration,
        ease: "easeInOut"
      }
    },
    tada: {
      animate: { 
        scale: [1, 0.9, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1],
        rotate: [0, -3, 3, -3, 3, -3, 3, -3, 0]
      },
      transition: { 
        repeat: Infinity, 
        duration: duration * 2,
        ease: "easeInOut"
      }
    },
    heartbeat: {
      animate: { scale: [1, 1.2, 1, 1.2, 1] },
      transition: { 
        repeat: Infinity, 
        duration: duration,
        ease: "easeInOut"
      }
    }
  };
  
  const currentAnimation = animations[animation];
  
  return (
    <div className="relative inline-block">
      {tooltip && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-neutral-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            {tooltip}
          </div>
        </div>
      )}
      
      <animated.div
        // @ts-ignore - Framer Motion typings
        animate={currentAnimation.animate}
        transition={currentAnimation.transition}
        className={`inline-flex ${sizeClasses[size]} ${className} ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
        style={{ color }}
      >
        {icon}
      </animated.div>
    </div>
  );
}