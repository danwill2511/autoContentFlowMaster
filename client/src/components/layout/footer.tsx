import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-3">AutoContentFlow</h3>
            <p className="text-sm text-neutral-600 mb-4">
              Streamlining content creation and social media management with AI-powered automation.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Features</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-neutral-600 hover:text-neutral-900">AI Content Generation</a></li>
              <li><a href="#" className="text-neutral-600 hover:text-neutral-900">Workflow Automation</a></li>
              <li><a href="#" className="text-neutral-600 hover:text-neutral-900">Analytics Dashboard</a></li>
              <li><a href="#" className="text-neutral-600 hover:text-neutral-900">Multi-Platform Publishing</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-neutral-600 hover:text-neutral-900">Documentation</a></li>
              <li><a href="#" className="text-neutral-600 hover:text-neutral-900">API Reference</a></li>
              <li><a href="#" className="text-neutral-600 hover:text-neutral-900">Content Library</a></li>
              <li><a href="#" className="text-neutral-600 hover:text-neutral-900">FAQs</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-neutral-600 hover:text-neutral-900">About Us</a></li>
              <li><a href="#" className="text-neutral-600 hover:text-neutral-900">Blog</a></li>
              <li><a href="#" className="text-neutral-600 hover:text-neutral-900">Careers</a></li>
              <li><a href="#" className="text-neutral-600 hover:text-neutral-900">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-200 mt-8 pt-6 flex flex-col md:flex-row justify-between">
          <p className="text-sm text-neutral-600">
            &copy; {new Date().getFullYear()} AutoContentFlow. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-neutral-600 hover:text-neutral-900">
              Privacy Policy
            </a>
            <a href="#" className="text-neutral-600 hover:text-neutral-900">
              Terms of Service
            </a>
            <a href="#" className="text-neutral-600 hover:text-neutral-900">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}