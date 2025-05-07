import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export function NewWorkflowCard() {
  return (
    <div className="workflow-card bg-white shadow rounded-lg overflow-hidden border border-neutral-200 hover:shadow-md border-dashed flex flex-col items-center justify-center p-8">
      <div className="rounded-full bg-primary-100 p-3 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-neutral-900 mb-1">New Workflow</h3>
      <p className="text-sm text-neutral-500 mb-4 text-center">Create a new content workflow for your platforms</p>
      <Button asChild>
        <Link href="/create-workflow">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Create Workflow
        </Link>
      </Button>
    </div>
  );
}

export default NewWorkflowCard;
