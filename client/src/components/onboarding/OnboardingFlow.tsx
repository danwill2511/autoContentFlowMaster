
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const steps = [
  {
    title: 'Welcome to AutoContentFlow',
    description: 'Let\'s get you started with automated content creation',
  },
  {
    title: 'Connect Your Platforms',
    description: 'Add your social media accounts to start posting',
  },
  {
    title: 'Create Your First Workflow',
    description: 'Set up automated content generation and posting',
  },
];

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = React.useState(0);
  const { toast } = useToast();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      toast({
        title: 'Onboarding Complete!',
        description: 'You\'re ready to start creating content.',
      });
    }
  };

  return (
    <Card className="p-6 max-w-lg mx-auto">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">{steps[currentStep].title}</h2>
        <p className="text-gray-600">{steps[currentStep].description}</p>
        <Button onClick={handleNext}>
          {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
        </Button>
      </div>
    </Card>
  );
}
