
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NewWorkflowCard() {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden border border-dashed border-neutral-300 flex items-center justify-center p-10">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-medium text-neutral-900">Create workflow</h3>
        <p className="mt-1 text-sm text-neutral-500">
          Add a new AI-powered content workflow
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/create-workflow">
              Create Workflow
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
