
import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useMobile } from "@/hooks/use-mobile";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  const [_, navigate] = useLocation();
  const { isMobile } = useMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <nav className="border-b border-neutral-200 bg-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and brand name */}
          <div className="flex items-center">
            <div 
              className="cursor-pointer flex items-center" 
              onClick={() => handleNavigation("/")}
            >
              <div className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 p-2">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="ml-2 text-xl font-semibold text-neutral-900">
                AutoContentFlow
              </span>
            </div>
            
            {/* Desktop Menu */}
            {!isMobile && (
              <div className="ml-10 flex items-center space-x-4">
                <div 
                  className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
                  onClick={() => handleNavigation("/dashboard")}
                >
                  Dashboard
                </div>
                <div 
                  className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
                  onClick={() => handleNavigation("/workflows")}
                >
                  Workflows
                </div>
                <div 
                  className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
                  onClick={() => handleNavigation("/platforms")}
                >
                  Platforms
                </div>
                <div 
                  className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
                  onClick={() => handleNavigation("/analytics")}
                >
                  Analytics
                </div>
                <div 
                  className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
                  onClick={() => handleNavigation("/subscriptions")}
                >
                  Subscription
                </div>
              </div>
            )}
          </div>
          
          {/* Right side actions */}
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center">
                {/* Notification button */}
                <button className="mr-4 rounded-full bg-neutral-100 p-2 text-neutral-600 hover:bg-neutral-200">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                </button>
                
                {/* User dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center rounded-full border border-neutral-200 p-1 hover:bg-neutral-50">
                      <div className="h-8 w-8 overflow-hidden rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center">
                        {user.username?.charAt(0).toUpperCase() || "U"}
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center p-2">
                      <div className="ml-2">
                        <p className="text-sm font-medium text-neutral-900">{user.username || "User"}</p>
                        <p className="truncate text-sm font-medium text-neutral-900">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleNavigation("/profile")}>
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavigation("/settings")}>
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  onClick={() => handleNavigation("/auth")}
                >
                  Sign in
                </Button>
                <Button 
                  onClick={() => handleNavigation("/auth")}
                >
                  Sign up
                </Button>
              </div>
            )}
            
            {/* Mobile menu button */}
            {isMobile && (
              <div className="ml-2">
                <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                  <SheetTrigger asChild>
                    <button className="text-neutral-500 hover:text-neutral-600">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Menu</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 flex flex-col gap-4">
                      <div 
                        className="flex items-center cursor-pointer p-2 hover:bg-neutral-100 rounded-md"
                        onClick={() => handleNavigation("/dashboard")}
                      >
                        <span className="text-sm font-medium">Dashboard</span>
                      </div>
                      <div 
                        className="flex items-center cursor-pointer p-2 hover:bg-neutral-100 rounded-md"
                        onClick={() => handleNavigation("/workflows")}
                      >
                        <span className="text-sm font-medium">Workflows</span>
                      </div>
                      <div 
                        className="flex items-center cursor-pointer p-2 hover:bg-neutral-100 rounded-md"
                        onClick={() => handleNavigation("/platforms")}
                      >
                        <span className="text-sm font-medium">Platforms</span>
                      </div>
                      <div 
                        className="flex items-center cursor-pointer p-2 hover:bg-neutral-100 rounded-md"
                        onClick={() => handleNavigation("/analytics")}
                      >
                        <span className="text-sm font-medium">Analytics</span>
                      </div>
                      <div 
                        className="flex items-center cursor-pointer p-2 hover:bg-neutral-100 rounded-md"
                        onClick={() => handleNavigation("/subscriptions")}
                      >
                        <span className="text-sm font-medium">Subscription</span>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
