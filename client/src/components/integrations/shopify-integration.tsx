import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { useToast } from '@/hooks/use-toast';

interface ShopifyIntegrationProps {
  connected?: boolean;
  storeName?: string;
  onConnect?: (storeName: string) => Promise<void>;
  onDisconnect?: () => Promise<void>;
  isLoading?: boolean;
}

export function ShopifyIntegration({
  connected = false,
  storeName = '',
  onConnect,
  onDisconnect,
  isLoading = false
}: ShopifyIntegrationProps) {
  const [store, setStore] = useState(storeName);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(connected);
  const [activeTab, setActiveTab] = useState('settings');
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [productSync, setProductSync] = useState(true);
  const [orderSync, setOrderSync] = useState(true);
  const [customerSync, setCustomerSync] = useState(false);
  const [autoPublish, setAutoPublish] = useState(false);
  const { toast } = useToast();

  // Sample products from Shopify
  const shopifyProducts = [
    { id: 1, name: 'Eco-friendly Water Bottle', price: '$24.99', status: 'active', type: 'Accessories' },
    { id: 2, name: 'Organic Cotton T-Shirt', price: '$35.99', status: 'active', type: 'Apparel' },
    { id: 3, name: 'Handcrafted Wooden Bowl', price: '$49.99', status: 'draft', type: 'Home' },
    { id: 4, name: 'Natural Face Serum', price: '$28.99', status: 'active', type: 'Beauty' },
  ];

  // Sample post mappings
  const contentMappings = [
    { id: 1, product: 'Eco-friendly Water Bottle', workflow: 'Sustainable Products', lastPosted: '2 days ago' },
    { id: 2, product: 'Organic Cotton T-Shirt', workflow: 'New Arrivals', lastPosted: '1 week ago' },
  ];

  // Handle connect action
  const handleConnect = async () => {
    if (!store.trim()) {
      toast({
        title: "Store name required",
        description: "Please enter a valid Shopify store name",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      if (onConnect) {
        await onConnect(store);
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsConnected(true);
      toast({
        title: "Connected to Shopify",
        description: `Successfully connected to ${store}.myshopify.com`,
      });
      setShowAuthDialog(false);
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Failed to connect to Shopify store. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle disconnect action
  const handleDisconnect = async () => {
    try {
      if (onDisconnect) {
        await onDisconnect();
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsConnected(false);
      setStore('');
      toast({
        title: "Disconnected from Shopify",
        description: "Your Shopify store has been disconnected",
      });
    } catch (error) {
      toast({
        title: "Disconnection failed",
        description: "Failed to disconnect from Shopify store",
        variant: "destructive",
      });
    }
  };

  // Animation variants for cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonLoader isLoading={true}>
          <div></div>
        </SkeletonLoader>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
              <path d="M7 10v12"></path>
              <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Shopify Integration</h2>
            <p className="text-sm text-neutral-500">Connect your Shopify store to automate product content</p>
          </div>
        </div>
        
        {isConnected ? (
          <Button variant="outline" onClick={() => handleDisconnect()}>
            Disconnect
          </Button>
        ) : (
          <Button onClick={() => setShowAuthDialog(true)}>
            Connect Store
          </Button>
        )}
      </div>
      
      {isConnected ? (
        <div>
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg flex items-center space-x-3 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium">Connected to {store}.myshopify.com</p>
          </div>
          
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="mappings">Content Mappings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Synchronization Settings</CardTitle>
                  <CardDescription>
                    Configure how your Shopify store synchronizes with AutoContentFlow
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="product-sync">Product Sync</Label>
                      <p className="text-sm text-neutral-500">
                        Automatically import products from Shopify
                      </p>
                    </div>
                    <Switch
                      id="product-sync"
                      checked={productSync}
                      onCheckedChange={setProductSync}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="order-sync">Order Sync</Label>
                      <p className="text-sm text-neutral-500">
                        Track orders for sales-driven content
                      </p>
                    </div>
                    <Switch
                      id="order-sync"
                      checked={orderSync}
                      onCheckedChange={setOrderSync}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="customer-sync">Customer Data Sync</Label>
                      <p className="text-sm text-neutral-500">
                        Use customer data for targeted content
                      </p>
                    </div>
                    <Switch
                      id="customer-sync"
                      checked={customerSync}
                      onCheckedChange={setCustomerSync}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Content Publishing</CardTitle>
                  <CardDescription>
                    Configure automatic content publishing settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-publish">Auto-Publish</Label>
                      <p className="text-sm text-neutral-500">
                        Automatically publish content when products are updated
                      </p>
                    </div>
                    <Switch
                      id="auto-publish"
                      checked={autoPublish}
                      onCheckedChange={setAutoPublish}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <Label>Publish Triggers</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="new-product" />
                        <label
                          htmlFor="new-product"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          New product created
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="price-change" />
                        <label
                          htmlFor="price-change"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Product price changes
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="inventory" checked />
                        <label
                          htmlFor="inventory"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Back in stock alerts
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="products" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Imported Products</CardTitle>
                  <CardDescription>
                    Products imported from your Shopify store
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase bg-neutral-50">
                        <tr>
                          <th scope="col" className="px-6 py-3">Product Name</th>
                          <th scope="col" className="px-6 py-3">Price</th>
                          <th scope="col" className="px-6 py-3">Status</th>
                          <th scope="col" className="px-6 py-3">Type</th>
                          <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shopifyProducts.map((product, index) => (
                          <motion.tr 
                            key={product.id}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            custom={index}
                            className="bg-white border-b"
                          >
                            <td className="px-6 py-4 font-medium text-neutral-900">
                              {product.name}
                            </td>
                            <td className="px-6 py-4">{product.price}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                product.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-neutral-100 text-neutral-800'
                              }`}>
                                {product.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">{product.type}</td>
                            <td className="px-6 py-4">
                              <Button variant="outline" size="sm">
                                Create Content
                              </Button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
                <CardFooter className="justify-between">
                  <Button variant="outline" size="sm">
                    Refresh Products
                  </Button>
                  <Button size="sm">
                    Import More
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="mappings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Product-Workflow Mappings</CardTitle>
                  <CardDescription>
                    Connect Shopify products to content workflows
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {contentMappings.length > 0 ? (
                    <div className="space-y-4">
                      {contentMappings.map((mapping, index) => (
                        <motion.div
                          key={mapping.id}
                          variants={cardVariants}
                          initial="hidden"
                          animate="visible"
                          custom={index}
                          className="bg-white border rounded-lg p-4"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{mapping.product}</h4>
                              <p className="text-sm text-neutral-500">
                                Workflow: {mapping.workflow} • Last posted: {mapping.lastPosted}
                              </p>
                            </div>
                            <Button variant="outline" size="sm">
                              Edit Mapping
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="mx-auto w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium">No mappings found</h3>
                      <p className="text-sm text-neutral-500 mt-2">
                        Start by creating a mapping between products and workflows
                      </p>
                      <Button className="mt-4">
                        Create Mapping
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="bg-neutral-50 rounded-lg p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium">Connect Your Shopify Store</h3>
          <p className="text-sm text-neutral-500 mt-2 max-w-md mx-auto">
            Connect your Shopify store to automatically sync products and create content for your store items.
          </p>
          <Button className="mt-4" onClick={() => setShowAuthDialog(true)}>
            Connect Store
          </Button>
        </div>
      )}
      
      {/* Connect Store Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Shopify Store</DialogTitle>
            <DialogDescription>
              Enter your Shopify store URL to connect with AutoContentFlow
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="store-name">Store Name</Label>
              <div className="flex">
                <Input
                  id="store-name"
                  value={store}
                  onChange={(e) => setStore(e.target.value)}
                  placeholder="yourstore"
                  className="rounded-r-none"
                />
                <span className="inline-flex items-center px-3 bg-neutral-100 border border-l-0 border-neutral-300 rounded-r-md text-neutral-500">
                  .myshopify.com
                </span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Checkbox id="permissions" />
                <label
                  htmlFor="permissions"
                  className="text-sm text-neutral-500"
                >
                  I authorize AutoContentFlow to access my Shopify store data
                </label>
              </div>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setShowAuthDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </>
              ) : (
                'Connect Store'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}