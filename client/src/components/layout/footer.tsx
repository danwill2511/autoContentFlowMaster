import React from 'react';
import { Link } from 'wouter';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-lg font-bold mb-4">AutoContentFlow</h3>
            <p className="text-neutral-400 mb-4">
              AI-powered content management platform to streamline social media content generation across multiple platforms.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Features</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/ai-content-generation" className="text-neutral-400 hover:text-white transition-colors">
                  AI Content Generation
                </Link>
              </li>
              <li>
                <Link href="/workflow-automation" className="text-neutral-400 hover:text-white transition-colors">
                  Workflow Automation
                </Link>
              </li>
              <li>
                <Link href="/multi-platform-publishing" className="text-neutral-400 hover:text-white transition-colors">
                  Multi-Platform Publishing
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="text-neutral-400 hover:text-white transition-colors">
                  Analytics & Insights
                </Link>
              </li>
              <li>
                <Link href="/content-library" className="text-neutral-400 hover:text-white transition-colors">
                  Content Library
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/documentation" className="text-neutral-400 hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/api-reference" className="text-neutral-400 hover:text-white transition-colors">
                  API Reference
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-neutral-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-neutral-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex">
                <Mail className="h-5 w-5 mr-3 text-neutral-400" />
                <a href="mailto:info@autocontentflow.com" className="text-neutral-400 hover:text-white transition-colors">
                  hello@autocontentflow.com
                </a>
              </li>
              <li className="flex">
                <Phone className="h-5 w-5 mr-3 text-neutral-400" />
                <a href="tel:+1234567890" className="text-neutral-400 hover:text-white transition-colors">
                  +1 (800) 555-1234
                </a>
              </li>
              <li className="flex">
                <MapPin className="h-5 w-5 mr-3 text-neutral-400" />
                <span className="text-neutral-400">
                  123 Content Ave, San Francisco, CA 94105
                </span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 text-neutral-400 text-sm">
            &copy; {new Date().getFullYear()} AutoContentFlow. All rights reserved.
          </div>
          
          <div className="flex space-x-4 text-sm text-neutral-400">
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/cookies" className="hover:text-white transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}