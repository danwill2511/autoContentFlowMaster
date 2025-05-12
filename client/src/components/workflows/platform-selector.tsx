import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface Platform {
  id: number;
  name: string;
  icon: React.ReactNode;
  bgColor: string;
}

interface PlatformSelectorProps {
  platforms: Platform[];
  selectedPlatforms: number[];
  onChange: (selectedIds: number[]) => void;
}

// Utility function for conditional class names
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function PlatformSelector({ platforms, selectedPlatforms, onChange }: PlatformSelectorProps) {
  // const platforms = [ // Removed since this is now a prop
  //   { id: 'twitter', name: 'Twitter', icon: '🐦', color: 'bg-blue-400' },
  //   { id: 'instagram', name: 'Instagram', icon: '📸', color: 'bg-pink-400' },
  //   { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'bg-blue-700' },
  //   { id: 'pinterest', name: 'Pinterest', icon: '📌', color: 'bg-red-500' },
  //   { id: 'youtube', name: 'YouTube', icon: '🎥', color: 'bg-red-600' }
  // ];

  const handlePlatformClick = (platformId: number) => {
    onChange(
      selectedPlatforms.includes(platformId)
        ? selectedPlatforms.filter((id) => id !== platformId)
        : [...selectedPlatforms, platformId]
    );
  };

  return (
    <div className="p-4">
      <h3 className="text-xl font-semibold mb-6 text-center">Choose Your Platforms ✨</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => handlePlatformClick(platform.id)}
            className={cn(
              "relative group p-4 rounded-xl transition-all duration-200 hover:scale-105",
              selectedPlatforms.includes(platform.id) ? `${platform.bgColor} text-white` : "bg-white border border-neutral-200"
            )}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-3xl">{platform.icon}</span>
              <span className="font-medium">{platform.name}</span>
            </div>
            {selectedPlatforms.includes(platform.id) && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                ✓
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default PlatformSelector;