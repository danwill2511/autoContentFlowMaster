
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';

export function Documentation() {
  return (
    <ScrollArea className="h-[500px] w-full rounded-md border p-4">
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
          <p>Welcome to AutoContentFlow! Follow these steps to get started:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Connect your social media accounts</li>
            <li>Create your first content workflow</li>
            <li>Set up posting schedules</li>
            <li>Monitor your content performance</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold mb-4">Creating Workflows</h2>
          <p>Learn how to create and manage automated content workflows...</p>
        </section>
      </div>
    </ScrollArea>
  );
}
