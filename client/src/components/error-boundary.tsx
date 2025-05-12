
import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  componentStack?: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Capture component stack trace for better debugging
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      errorInfo,
      componentStack: errorInfo.componentStack
    });
  }

  handleReset = () => {
    this.setState({ hasError: false });
  }

  handleHomeNavigation = () => {
    window.location.href = '/';
  }

  render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="flex items-center justify-center min-h-screen bg-neutral-50 p-4">
          <Card className="w-full max-w-2xl shadow-lg">
            <CardHeader className="border-b bg-rose-50 text-rose-900">
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-rose-600" />
                Application Error
              </CardTitle>
              <CardDescription className="text-rose-700">
                Something went wrong in the application. This error has been logged.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-neutral-500">Error Message:</h3>
                  <p className="mt-1 text-sm bg-neutral-100 p-3 rounded-md text-neutral-900 font-mono">
                    {this.state.error?.message || 'An unexpected error occurred'}
                  </p>
                </div>
                
                {this.state.componentStack && (
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500">Component Stack:</h3>
                    <pre className="mt-1 text-xs bg-neutral-100 p-3 rounded-md text-neutral-900 font-mono overflow-auto max-h-56">
                      {this.state.componentStack}
                    </pre>
                  </div>
                )}
                
                <Alert variant="warning" className="mt-4">
                  <AlertTitle className="font-semibold">Troubleshooting Tips</AlertTitle>
                  <AlertDescription className="text-sm">
                    <ul className="list-disc pl-5 space-y-1 mt-2">
                      <li>Try refreshing the page</li>
                      <li>Clear your browser cache</li>
                      <li>Make sure you're logged in</li>
                      <li>Try going back to the home page</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between bg-neutral-50 border-t">
              <Button variant="outline" onClick={this.handleReset}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button variant="default" onClick={this.handleHomeNavigation}>
                <Home className="h-4 w-4 mr-2" />
                Go to Home
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    // When there's no error, render children normally
    return this.props.children;
  }
}
