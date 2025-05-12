
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PlatformSettingsProps {
  platformId: number;
  platformName: string;
  settings: any;
  onChange: (id: number, settings: any) => void;
}

export function PlatformSettings({ platformId, platformName, settings, onChange }: PlatformSettingsProps) {
  const handleChange = (key: string, value: any) => {
    let validatedValue = value;
    
    // Validate inputs based on platform and field type
    switch(key) {
      case "hashtagCount":
        validatedValue = Math.min(Math.max(0, value), 30);
        break;
      case "characterLimit":
        validatedValue = Math.min(Math.max(10, value), getPlatformMaxLimit(platformName));
        break;
    }
    
    onChange(platformId, { ...settings, [key]: validatedValue });
  };

  const getPlatformMaxLimit = (platform: string): number => {
    switch(platform.toLowerCase()) {
      case 'twitter':
      case 'x': return 280;
      case 'linkedin': return 3000;
      case 'instagram': return 2200;
      case 'facebook': return 5000;
      default: return 1000;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{platformName} Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Hashtag Count</Label>
          <Input 
            type="number"
            min={0}
            max={30}
            value={settings?.hashtagCount || 0}
            onChange={(e) => handleChange("hashtagCount", parseInt(e.target.value))}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Character Limit</Label>
          <Input 
            type="number"
            value={settings?.characterLimit || getPlatformDefaultLimit(platformName)}
            onChange={(e) => handleChange("characterLimit", parseInt(e.target.value))}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch 
            id={`include-images-${platformId}`}
            checked={settings?.includeImages || false}
            onCheckedChange={(checked) => handleChange("includeImages", checked)}
          />
          <Label htmlFor={`include-images-${platformId}`}>Include Images</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch 
            id={`include-links-${platformId}`}
            checked={settings?.includeLinks || false}
            onCheckedChange={(checked) => handleChange("includeLinks", checked)}
          />
          <Label htmlFor={`include-links-${platformId}`}>Include Links</Label>
        </div>
      </CardContent>
    </Card>
  );
}

function getPlatformDefaultLimit(platform: string): number {
  switch (platform.toLowerCase()) {
    case 'twitter': 
    case 'x': return 280;
    case 'linkedin': return 3000;
    case 'facebook': return 5000;
    case 'instagram': return 2200;
    default: return 1000;
  }
}
