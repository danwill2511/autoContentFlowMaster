
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface Platform {
  id: number;
  name: string;
  icon: React.ReactNode;
  bgColor: string;
}

interface PlatformSelectorProps {
  platforms: Platform[];
  selectedPlatforms: number[];
  onChange: (selectedPlatforms: number[]) => void;
}

export function PlatformSelector({
  platforms,
  selectedPlatforms,
  onChange,
}: PlatformSelectorProps) {
  const togglePlatform = (id: number) => {
    let newSelected;
    
    if (selectedPlatforms.includes(id)) {
      newSelected = selectedPlatforms.filter((platformId) => platformId !== id);
    } else {
      newSelected = [...selectedPlatforms, id];
    }
    
    onChange(newSelected);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {platforms.map((platform) => {
        const isSelected = selectedPlatforms.includes(platform.id);
        
        return (
          <button
            key={platform.id}
            type="button"
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all",
              isSelected
                ? "border-primary bg-primary-50"
                : "border-transparent hover:border-neutral-200",
              platform.bgColor
            )}
            onClick={() => togglePlatform(platform.id)}
          >
            <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm">
              {platform.icon}
            </div>
            
            <span className={cn(
              "font-medium text-sm",
              isSelected ? "text-primary-700" : "text-neutral-700"
            )}>
              {platform.name}
            </span>
            
            <div className="mt-2 h-5">
              {isSelected && (
                <svg
                  className="h-5 w-5 text-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
