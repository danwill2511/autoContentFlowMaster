
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

interface OAuthStatus {
  connected: boolean;
  lastChecked?: Date;
  error?: string;
}

export function PlatformSettings({ platformId, platformName, settings, onChange }: PlatformSettingsProps) {
  const [oauthStatus, setOauthStatus] = useState<OAuthStatus>({ connected: false });
  const [isConnecting, setIsConnecting] = useState(false);

  const handleOAuthConnect = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch(`/api/platforms/${platformId}/oauth`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.authUrl;
      } else {
        throw new Error('Failed to initiate OAuth flow');
      }
    } catch (error) {
      console.error('OAuth error:', error);
      setOauthStatus({ connected: false, error: 'Failed to connect' });
    } finally {
      setIsConnecting(false);
    }
  };

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
      <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Connection Status</Label>
              <div className="text-sm text-neutral-500">
                {oauthStatus.connected ? 'Connected' : 'Not connected'}
              </div>
            </div>
            <Button
              onClick={handleOAuthConnect}
              disabled={isConnecting}
              variant={oauthStatus.connected ? "outline" : "default"}
            >
              {isConnecting ? (
                <>
                  <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Connecting...
                </>
              ) : oauthStatus.connected ? (
                'Reconnect'
              ) : (
                'Connect'
              )}
            </Button>
          </div>
          {oauthStatus.error && (
            <Alert variant="destructive">
              <AlertDescription>{oauthStatus.error}</AlertDescription>
            </Alert>
          )}
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
