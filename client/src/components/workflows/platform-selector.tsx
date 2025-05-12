
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface Platform {
  id: number;
  name: string;
  type: string;
  icon?: string;
}

interface PlatformSelectorProps {
  selectedPlatforms: number[];
  onPlatformSelect: (platformIds: number[]) => void;
}

export function PlatformSelector({ selectedPlatforms, onPlatformSelect }: PlatformSelectorProps) {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const fetchPlatforms = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/platforms');
      if (!response.ok) {
        throw new Error('Failed to fetch platforms');
      }
      const data = await response.json();
      setPlatforms(data);
    } catch (err) {
      setError('Failed to load platforms. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to load platforms. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlatformToggle = (platformId: number) => {
    const updatedSelection = selectedPlatforms.includes(platformId)
      ? selectedPlatforms.filter(id => id !== platformId)
      : [...selectedPlatforms, platformId];
    onPlatformSelect(updatedSelection);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-4 bg-destructive/10 text-destructive">
        <p>{error}</p>
        <button 
          onClick={fetchPlatforms}
          className="mt-2 text-sm underline hover:text-destructive/80"
        >
          Retry
        </button>
      </Card>
    );
  }

  if (platforms.length === 0) {
    return (
      <Card className="p-4 text-center">
        <p className="text-muted-foreground">No platforms available. Please connect a platform first.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {platforms.map((platform) => (
        <div key={platform.id} className="flex items-center space-x-3 p-3 rounded-lg border">
          {platform.icon && (
            <img 
              src={platform.icon} 
              alt={platform.name} 
              className="w-6 h-6"
            />
          )}
          <div className="flex-1">
            <p className="font-medium">{platform.name}</p>
            <p className="text-sm text-muted-foreground">{platform.type}</p>
          </div>
          <Checkbox
            checked={selectedPlatforms.includes(platform.id)}
            onCheckedChange={() => handlePlatformToggle(platform.id)}
          />
        </div>
      ))}
    </div>
  );
}
