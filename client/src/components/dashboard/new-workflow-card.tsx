import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useLocation } from 'wouter'; // Added import for useLocation
import { Card } from "@/components/ui/card"; // Using named import instead of default


export function NewWorkflowCard() {
  const [_, setLocation] = useLocation();

  return (
    <Card 
      className="border border-dashed border-neutral-300 bg-neutral-50 hover:bg-neutral-100 transition-colors cursor-pointer"
      onClick={() => setLocation("/workflows/create")}
    >
      <div className="p-6"> {/* Removed unnecessary block */}
        <div className="rounded-full bg-primary-100 p-3 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-neutral-900 mb-1">New Workflow</h3>
        <p className="text-sm text-neutral-500 mb-4 text-center">Create a new content workflow for your platforms</p>
        {/* Removed nested Link; navigation handled by onClick */}
      </div>
    </Card>
  );
}

export default NewWorkflowCard;