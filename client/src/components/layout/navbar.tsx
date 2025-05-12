import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { useAuth } from '@/hooks/use-auth';
import { Menu, X, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <span className="text-xl font-bold text-primary cursor-pointer">AutoContentFlow</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex ml-10 space-x-1">
              {/* Features Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant={isActive('/ai-content-generation') || isActive('/workflow-automation') || isActive('/multi-platform-publishing') ? 'default' : 'ghost'} className="flex items-center">
                    Features <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <Link href="/ai-content-generation">AI Content Generation</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/workflow-automation">Workflow Automation</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/multi-platform-publishing">Multi-Platform Publishing</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Resources Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant={isActive('/documentation') || isActive('/api-reference') || isActive('/content-library') || isActive('/faq') ? 'default' : 'ghost'} className="flex items-center">
                    Resources <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <Link href="/documentation">Documentation</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/api-reference">API Reference</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/content-library">Content Library</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/faq">FAQ</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Company Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant={isActive('/about-us') || isActive('/blog') || isActive('/careers') || isActive('/contact') ? 'default' : 'ghost'} className="flex items-center">
                    Company <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <Link href="/about-us">About Us</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/blog">Blog</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/careers">Careers</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/contact">Contact</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Pricing Link */}
              <Button 
                variant={isActive('/subscription') ? 'default' : 'ghost'}
                asChild
              >
                <Link href="/subscription">Pricing</Link>
              </Button>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/">Dashboard</Link>
                </Button>
                <Button onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/auth">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-center py-4">
                    <span className="text-lg font-bold">Menu</span>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon">
                        <X className="h-5 w-5" />
                      </Button>
                    </SheetClose>
                  </div>
                  
                  <div className="flex flex-col space-y-4 py-4">
                    <div className="font-semibold text-sm uppercase text-muted-foreground">Features</div>
                    <SheetClose asChild>
                      <Link href="/ai-content-generation" className="py-2">
                        AI Content Generation
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/workflow-automation" className="py-2">
                        Workflow Automation
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/multi-platform-publishing" className="py-2">
                        Multi-Platform Publishing
                      </Link>
                    </SheetClose>
                    
                    <div className="font-semibold text-sm uppercase text-muted-foreground mt-4">Resources</div>
                    <SheetClose asChild>
                      <Link href="/documentation" className="py-2">
                        Documentation
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/api-reference" className="py-2">
                        API Reference
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/content-library" className="py-2">
                        Content Library
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/faq" className="py-2">
                        FAQ
                      </Link>
                    </SheetClose>
                    
                    <div className="font-semibold text-sm uppercase text-muted-foreground mt-4">Company</div>
                    <SheetClose asChild>
                      <Link href="/about-us" className="py-2">
                        About Us
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/blog" className="py-2">
                        Blog
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/careers" className="py-2">
                        Careers
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/contact" className="py-2">
                        Contact
                      </Link>
                    </SheetClose>
                    
                    <SheetClose asChild>
                      <Link href="/subscription" className="py-2">
                        Pricing
                      </Link>
                    </SheetClose>
                  </div>
                  
                  <div className="mt-auto pt-6 border-t">
                    {user ? (
                      <div className="space-y-2">
                        <SheetClose asChild>
                          <Button variant="outline" className="w-full" asChild>
                            <Link href="/">Dashboard</Link>
                          </Button>
                        </SheetClose>
                        <Button className="w-full" onClick={() => {
                          setIsMenuOpen(false);
                          handleLogout();
                        }}>
                          Logout
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <SheetClose asChild>
                          <Button variant="outline" className="w-full" asChild>
                            <Link href="/auth">Login</Link>
                          </Button>
                        </SheetClose>
                        <SheetClose asChild>
                          <Button className="w-full" asChild>
                            <Link href="/auth">Sign Up</Link>
                          </Button>
                        </SheetClose>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}