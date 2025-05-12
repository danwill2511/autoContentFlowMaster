import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Search, Code, Copy, Check, Info, AlertCircle, Server, GitBranch } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

// Sample API endpoints for demo
// In a real app, this would come from an API or documentation system
const apiEndpoints = [
  {
    category: "Authentication",
    endpoints: [
      {
        method: "POST",
        endpoint: "/api/auth/login",
        description: "Authenticate a user and receive an access token",
        parameters: [
          { name: "username", type: "string", required: true, description: "User's email or username" },
          { name: "password", type: "string", required: true, description: "User's password" }
        ],
        responses: [
          { code: "200", description: "Success", example: '{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }' },
          { code: "401", description: "Invalid credentials", example: '{ "error": "Invalid username or password" }' }
        ]
      },
      {
        method: "POST",
        endpoint: "/api/auth/register",
        description: "Register a new user account",
        parameters: [
          { name: "username", type: "string", required: true, description: "Desired username" },
          { name: "email", type: "string", required: true, description: "User's email address" },
          { name: "password", type: "string", required: true, description: "User's password" }
        ],
        responses: [
          { code: "201", description: "Account created", example: '{ "id": 123, "username": "johndoe" }' },
          { code: "400", description: "Invalid input", example: '{ "error": "Username already taken" }' }
        ]
      }
    ]
  },
  {
    category: "Workflows",
    endpoints: [
      {
        method: "GET",
        endpoint: "/api/workflows",
        description: "Get a list of all workflows",
        parameters: [
          { name: "status", type: "string", required: false, description: "Filter by status (active, paused, draft)" },
          { name: "limit", type: "integer", required: false, description: "Maximum number of results" }
        ],
        responses: [
          { 
            code: "200", 
            description: "Success", 
            example: '{ "workflows": [{ "id": 1, "name": "Daily Posts", "status": "active" }] }' 
          }
        ]
      },
      {
        method: "POST",
        endpoint: "/api/workflows",
        description: "Create a new workflow",
        parameters: [
          { name: "name", type: "string", required: true, description: "Workflow name" },
          { name: "description", type: "string", required: false, description: "Workflow description" },
          { name: "platforms", type: "array", required: true, description: "Array of platform IDs" },
          { name: "schedule", type: "object", required: true, description: "Scheduling parameters" }
        ],
        responses: [
          { 
            code: "201", 
            description: "Workflow created", 
            example: '{ "id": 5, "name": "Evening Posts", "status": "draft" }' 
          },
          { 
            code: "400", 
            description: "Invalid input", 
            example: '{ "error": "Missing required fields" }' 
          }
        ]
      }
    ]
  },
  {
    category: "Content Generation",
    endpoints: [
      {
        method: "POST",
        endpoint: "/api/content/generate",
        description: "Generate content using AI",
        parameters: [
          { name: "contentType", type: "string", required: true, description: "Type of content (blog, social, etc.)" },
          { name: "contentTone", type: "string", required: true, description: "Tone of content (professional, casual, etc.)" },
          { name: "topics", type: "array", required: true, description: "Array of topics or keywords" },
          { name: "platforms", type: "array", required: true, description: "Target platforms" }
        ],
        responses: [
          { 
            code: "200", 
            description: "Content generated", 
            example: '{ "content": "Here is your generated content..." }' 
          },
          { 
            code: "429", 
            description: "Rate limit exceeded", 
            example: '{ "error": "Too many requests" }' 
          }
        ]
      },
      {
        method: "POST",
        endpoint: "/api/content/adapt",
        description: "Adapt content for a specific platform",
        parameters: [
          { name: "content", type: "string", required: true, description: "Original content" },
          { name: "platform", type: "string", required: true, description: "Target platform" }
        ],
        responses: [
          { 
            code: "200", 
            description: "Content adapted", 
            example: '{ "content": "Platform-specific content..." }' 
          }
        ]
      }
    ]
  },
  {
    category: "Analytics",
    endpoints: [
      {
        method: "GET",
        endpoint: "/api/analytics",
        description: "Get performance analytics data",
        parameters: [
          { name: "timeRange", type: "string", required: false, description: "Time range (7d, 1m, 3m, etc.)" },
          { name: "platform", type: "string", required: false, description: "Filter by platform" }
        ],
        responses: [
          { 
            code: "200", 
            description: "Analytics data", 
            example: '{ "engagementData": [...], "platformPerformance": [...] }' 
          }
        ]
      },
      {
        method: "GET",
        endpoint: "/api/analytics/posts/{postId}",
        description: "Get analytics for a specific post",
        parameters: [
          { name: "postId", type: "integer", required: true, description: "ID of the post" }
        ],
        responses: [
          { 
            code: "200", 
            description: "Post analytics", 
            example: '{ "likes": 423, "comments": 87, "shares": 52 }' 
          },
          { 
            code: "404", 
            description: "Post not found", 
            example: '{ "error": "Post not found" }' 
          }
        ]
      }
    ]
  }
];

export default function ApiReferencePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Authentication");
  const [copiedText, setCopiedText] = useState("");
  
  // Filter endpoints based on search query
  const filteredEndpoints = searchQuery 
    ? apiEndpoints.map(category => ({
        ...category,
        endpoints: category.endpoints.filter(endpoint => 
          endpoint.endpoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
          endpoint.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.endpoints.length > 0)
    : apiEndpoints;

  // Copy to clipboard function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(""), 2000);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">API Reference</h1>
            <p className="text-muted-foreground">Comprehensive documentation for the AutoContentFlow API</p>
          </div>
          <div className="flex mt-4 md:mt-0">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search API endpoints..."
                className="pl-8 w-full md:w-[260px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button className="ml-2" variant="outline">
              API Keys
            </Button>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="h-5 w-5 mr-2" />
              Getting Started with the API
            </CardTitle>
            <CardDescription>
              Basic information to help you get started with the AutoContentFlow API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-md">
                  <div className="flex items-center mb-2">
                    <Server className="h-5 w-5 mr-2 text-primary" />
                    <h3 className="font-medium">Base URL</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">All API requests should be made to:</p>
                  <code className="block bg-neutral-100 p-2 rounded mt-2 text-sm font-mono">https://api.autocontentflow.com/v1</code>
                </div>
                
                <div className="p-4 border rounded-md">
                  <div className="flex items-center mb-2">
                    <Code className="h-5 w-5 mr-2 text-primary" />
                    <h3 className="font-medium">Authentication</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Use your API key in the Authorization header:</p>
                  <code className="block bg-neutral-100 p-2 rounded mt-2 text-sm font-mono">Authorization: Bearer YOUR_API_KEY</code>
                </div>
                
                <div className="p-4 border rounded-md">
                  <div className="flex items-center mb-2">
                    <GitBranch className="h-5 w-5 mr-2 text-primary" />
                    <h3 className="font-medium">API Versions</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Current version: <strong>v1</strong></p>
                  <p className="text-sm text-muted-foreground mt-2">We use semantic versioning for all API releases.</p>
                </div>
              </div>
              
              <div className="p-4 border rounded-md bg-blue-50">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-800">Rate Limiting</h3>
                    <p className="text-sm text-blue-700">
                      Our API has rate limits based on your subscription plan. Free tier accounts are limited to 60 requests per hour. 
                      Rate limit information is included in the response headers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* API Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>API Endpoints</CardTitle>
                <CardDescription>Browse by category</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="px-4 pb-4">
                  <ul className="space-y-1">
                    {filteredEndpoints.map((category) => (
                      <li 
                        key={category.category} 
                        className={`px-3 py-2 rounded-md cursor-pointer text-sm font-medium ${
                          activeCategory === category.category 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-neutral-100"
                        }`}
                        onClick={() => setActiveCategory(category.category)}
                      >
                        {category.category}
                        <span className="ml-2 text-xs opacity-70">({category.endpoints.length})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* API Documentation */}
          <div className="lg:col-span-3">
            {filteredEndpoints.map((category) => (
              category.category === activeCategory && (
                <div key={category.category}>
                  <h2 className="text-2xl font-bold mb-4">{category.category}</h2>
                  
                  {category.endpoints.map((endpoint, index) => (
                    <Card key={endpoint.endpoint} className={`mb-6 ${endpoint.method === 'GET' ? 'border-green-200' : 'border-blue-200'}`}>
                      <CardHeader className={`${endpoint.method === 'GET' ? 'bg-green-50' : 'bg-blue-50'} border-b`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center">
                              <span className={`text-xs font-bold px-2 py-1 rounded ${
                                endpoint.method === 'GET' 
                                  ? 'bg-green-200 text-green-800' 
                                  : 'bg-blue-200 text-blue-800'
                              }`}>
                                {endpoint.method}
                              </span>
                              <code className="ml-2 font-mono text-sm">{endpoint.endpoint}</code>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="ml-2" 
                                onClick={() => copyToClipboard(endpoint.endpoint)}
                              >
                                {copiedText === endpoint.endpoint ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            <CardDescription className="mt-2">
                              {endpoint.description}
                            </CardDescription>
                          </div>
                          <Button variant="outline" size="sm">Try It</Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <Tabs defaultValue="parameters">
                          <TabsList>
                            <TabsTrigger value="parameters">Parameters</TabsTrigger>
                            <TabsTrigger value="responses">Responses</TabsTrigger>
                            <TabsTrigger value="examples">Examples</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="parameters" className="mt-4">
                            {endpoint.parameters.length > 0 ? (
                              <div className="border rounded-md overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-neutral-50">
                                    <tr>
                                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Parameter</th>
                                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Type</th>
                                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Required</th>
                                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {endpoint.parameters.map((param) => (
                                      <tr key={param.name}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-neutral-900">{param.name}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-600">{param.type}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-600">
                                          {param.required ? 
                                            <span className="text-red-600">Yes</span> : 
                                            <span className="text-neutral-400">No</span>
                                          }
                                        </td>
                                        <td className="px-4 py-3 text-sm text-neutral-600">{param.description}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="text-muted-foreground">No parameters required</p>
                            )}
                          </TabsContent>
                          
                          <TabsContent value="responses" className="mt-4">
                            <div className="space-y-4">
                              {endpoint.responses.map((response) => (
                                <div key={response.code} className="border rounded-md overflow-hidden">
                                  <div className={`px-4 py-2 ${
                                    response.code.startsWith('2') 
                                      ? 'bg-green-50 border-b border-green-200' 
                                      : 'bg-amber-50 border-b border-amber-200'
                                  }`}>
                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                                      response.code.startsWith('2') 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-amber-100 text-amber-800'
                                    }`}>
                                      {response.code}
                                    </span>
                                    <span className="ml-2 text-sm">{response.description}</span>
                                  </div>
                                  <div className="p-4 bg-neutral-50">
                                    <pre className="text-sm overflow-x-auto font-mono">{response.example}</pre>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="examples" className="mt-4">
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">cURL</h4>
                                <div className="bg-neutral-900 text-neutral-50 p-4 rounded-md">
                                  <div className="flex justify-between">
                                    <pre className="text-sm overflow-x-auto font-mono">{`curl -X ${endpoint.method} \\
  https://api.autocontentflow.com/v1${endpoint.endpoint} \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    ${endpoint.parameters
      .filter(p => p.required)
      .map(p => `"${p.name}": "${p.type === 'array' ? '[]' : p.type === 'object' ? '{}' : 'value'}"`)
      .join(',\n    ')}
  }'`}</pre>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="text-white" 
                                      onClick={() => copyToClipboard(`curl -X ${endpoint.method} https://api.autocontentflow.com/v1${endpoint.endpoint} -H "Authorization: Bearer YOUR_API_KEY"`)}
                                    >
                                      {copiedText === `curl -X ${endpoint.method} https://api.autocontentflow.com/v1${endpoint.endpoint} -H "Authorization: Bearer YOUR_API_KEY"` ? (
                                        <Check className="h-4 w-4" />
                                      ) : (
                                        <Copy className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-medium mb-2">JavaScript</h4>
                                <div className="bg-neutral-900 text-neutral-50 p-4 rounded-md">
                                  <div className="flex justify-between">
                                    <pre className="text-sm overflow-x-auto font-mono">{`const response = await fetch('https://api.autocontentflow.com/v1${endpoint.endpoint}', {
  method: '${endpoint.method}',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    ${endpoint.parameters
      .filter(p => p.required)
      .map(p => `${p.name}: ${p.type === 'array' ? '[]' : p.type === 'object' ? '{}' : '"value"'}`)
      .join(',\n    ')}
  })
});

const data = await response.json();`}</pre>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="text-white" 
                                      onClick={() => copyToClipboard(`const response = await fetch('https://api.autocontentflow.com/v1${endpoint.endpoint}')`)}
                                    >
                                      {copiedText === `const response = await fetch('https://api.autocontentflow.com/v1${endpoint.endpoint}')` ? (
                                        <Check className="h-4 w-4" />
                                      ) : (
                                        <Copy className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}