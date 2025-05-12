import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

// Form schema for platform creation/editing
const platformSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  accessToken: z.string().optional(),
});

type PlatformFormValues = z.infer<typeof platformSchema>;

export default function PlatformsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<any | null>(null);

  // Fetch platforms
  const { data: platforms, isLoading: isLoadingPlatforms } = useQuery<any[]>({
    queryKey: ["/api/platforms"],
    enabled: !!user,
  });

  // Form setup
  const form = useForm<PlatformFormValues>({
    resolver: zodResolver(platformSchema),
    defaultValues: {
      name: "",
      apiKey: "",
      apiSecret: "",
      accessToken: "",
    },
  });

  // Reset form when dialog is opened/closed
  const resetForm = () => {
    form.reset({
      name: editingPlatform?.name || "",
      apiKey: editingPlatform?.apiKey || "",
      apiSecret: editingPlatform?.apiSecret || "",
      accessToken: editingPlatform?.accessToken || "",
    });
  };

  // Create platform mutation
  const createPlatform = useMutation({
    mutationFn: async (data: PlatformFormValues) => {
      const endpoint = editingPlatform 
        ? `/api/platforms/${editingPlatform.id}` 
        : "/api/platforms";
      const method = editingPlatform ? "PUT" : "POST";

      const res = await apiRequest(method, endpoint, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: editingPlatform ? "Platform updated" : "Platform created",
        description: editingPlatform 
          ? "Your platform has been updated successfully." 
          : "Your new platform has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/platforms"] });
      setIsDialogOpen(false);
      setEditingPlatform(null);
    },
    onError: (error: Error) => {
      toast({
        title: editingPlatform ? "Failed to update platform" : "Failed to create platform",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditPlatform = (platform: any) => {
    setEditingPlatform(platform);
    setIsDialogOpen(true);
  };

  const testConnection = async (platformId: string) => {
    try {
      const response = await fetch(`/api/platforms/${platformId}/test`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Connection test failed');
      }

      const data = await response.json();

      toast({
        title: data.success ? "Connection Successful" : "Connection Failed",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Connection Test Failed",
        description: "Failed to test platform connection. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');

    if (code && state) {
      // Complete OAuth flow
      fetch('/api/platforms/oauth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, state }),
      })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to complete OAuth flow');
        }

        toast({
          title: "Connected Successfully",
          description: "Your platform has been connected.",
        });

        // Clear URL parameters
        window.history.replaceState({}, '', window.location.pathname);

        // Refresh platforms list
        queryClient.invalidateQueries({ queryKey: ["/api/platforms"] });
      })
      .catch((error) => {
        toast({
          title: "Connection Failed",
          description: error.message,
          variant: "destructive",
        });
      });
    } else if (error) {
      toast({
        title: "Connection Failed",
        description: params.get('error_description') || error,
        variant: "destructive",
      });
    }
  }, []);

  const onSubmit = (data: PlatformFormValues) => {
    createPlatform.mutate(data);
  };

  // Get platform icon based on name
  const getPlatformIcon = (name: string) => {
    switch(name.toLowerCase()) {
      case "linkedin":
        return <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
      case "twitter":
      case "x":
        return <svg className="h-5 w-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>;
      case "facebook":
        return <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
      case "pinterest":
        return <svg className="h-5 w-5 text-red-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/></svg>;
      case "youtube":
        return <svg className="h-5 w-5 text-red-600" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
      default:
        return <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
    }
  };

  // Get platform background color based on name
  const getPlatformBgColor = (name: string) => {
    switch(name.toLowerCase()) {
      case "linkedin":
      case "twitter":
      case "facebook":
      case "x":
        return "bg-blue-100";
      case "pinterest":
      case "youtube":
        return "bg-red-100";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
        <div className="px-4 sm:px-0 mb-8 flex flex-col sm:flex-row sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Platforms</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Manage your social media platforms for content distribution
            </p>
          </div>

          <Button 
            className="mt-4 sm:mt-0"
            onClick={() => {
              setEditingPlatform(null);
              setIsDialogOpen(true);
            }}
          >
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Platform
          </Button>
        </div>

        {/* Platform management dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (open) resetForm();
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingPlatform ? "Edit Platform" : "Add New Platform"}</DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Platform Name</FormLabel>
                      <FormControl>
                        <Input placeholder="LinkedIn, Twitter, etc." {...field} />
                      </FormControl>
                      <FormDescription>
                        Choose from popular social media platforms
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your API key" {...field} />
                      </FormControl>
                      <FormDescription>
                        You can find this in your platform's developer settings
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="apiSecret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Secret</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Enter your API secret"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accessToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Access Token (if applicable)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your access token" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createPlatform.isPending}
                  >
                    {createPlatform.isPending ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>Save</>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Platforms list */}
        <div className="px-4 sm:px-0">
          {isLoadingPlatforms ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-neutral-200 rounded-full w-2/3 mb-2"></div>
                    <div className="h-4 bg-neutral-200 rounded-full w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-neutral-200 rounded-full w-full mb-2"></div>
                    <div className="h-4 bg-neutral-200 rounded-full w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : platforms && platforms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {platforms.map((platform) => (
                <Card key={platform.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-md ${getPlatformBgColor(platform.name)}`}>
                        {getPlatformIcon(platform.name)}
                      </div>
                      <CardTitle className="text-lg">{platform.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-sm text-neutral-500">
                      <div className="flex justify-between items-center mb-1">
                        <span>API Key:</span>
                        <span>{platform.apiKey ? '••••••••••' : 'Not set'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>API Secret:</span>
                        <span>{platform.apiSecret ? '••••••••••' : 'Not set'}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span>Status:</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          platform.status === 'connected' ? 'bg-green-100 text-green-800' : 
                          platform.status === 'error' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {platform.status === 'connected' ? 'Connected' : 
                           platform.status === 'error' ? 'Error' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleEditPlatform(platform)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => testConnection(platform.id)}
                      disabled={!platform.apiKey || !platform.apiSecret}
                    >
                      Test
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-6">
                <svg
                  className="mx-auto h-12 w-12 text-neutral-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="mt-4 text-neutral-500">No platforms added yet</p>
                <p className="text-sm text-neutral-400 mt-1">
                  Add a platform to get started with content creation
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}