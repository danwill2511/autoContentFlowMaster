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

export function PlatformSelector({ platforms, selectedPlatforms, onChange }: PlatformSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>(selectedPlatforms);

  const handlePlatformClick = (platform: Platform) => {
    const newSelectedIds = selectedIds.includes(platform.id)
      ? selectedIds.filter(id => id !== platform.id)
      : [...selectedIds, platform.id];
    
    setSelectedIds(newSelectedIds);
    onChange(newSelectedIds);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {platforms.map((platform) => (
        <div 
          key={platform.id}
          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
            selectedIds.includes(platform.id) 
              ? 'bg-primary-50 border-primary-200' 
              : 'border-neutral-200 hover:bg-primary-50 hover:border-primary-200'
          }`}
          onClick={() => handlePlatformClick(platform)}
        >
          <div className="flex items-center">
            <Checkbox 
              id={`platform-${platform.id}`} 
              checked={selectedIds.includes(platform.id)}
              onCheckedChange={() => handlePlatformClick(platform)}
              className="h-4 w-4"
            />
            <Label 
              htmlFor={`platform-${platform.id}`} 
              className="ml-3 block text-sm font-medium text-neutral-700 cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <div className={`flex items-center justify-center h-8 w-8 rounded-lg ${platform.bgColor}`}>
                  {platform.icon}
                </div>
                <span>{platform.name}</span>
              </div>
            </Label>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PlatformSelector;
