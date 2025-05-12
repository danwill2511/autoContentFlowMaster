import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, HelpCircle, MailQuestion, MessageCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import Layout from "@/components/layout/layout";

// FAQ content by category
const faqCategories = [
  {
    id: "general",
    name: "General",
    faqs: [
      {
        question: "What is AutoContentFlow?",
        answer: "AutoContentFlow is a comprehensive AI-powered content management platform that enables digital creators to streamline social media content generation across multiple platforms with intelligent, adaptive content creation tools."
      },
      {
        question: "How do I get started with AutoContentFlow?",
        answer: "Getting started is easy! After creating an account, you'll be guided through a quick onboarding process that helps you connect your social media platforms, set up your first workflow, and generate your first piece of content. Check out our Quick Start Guide in the Documentation section for detailed steps."
      },
      {
        question: "What platforms does AutoContentFlow support?",
        answer: "We currently support Twitter (X), Facebook, Instagram, LinkedIn, Pinterest, and TikTok. We're constantly adding new platform integrations based on user feedback and demand."
      },
      {
        question: "Is there a mobile app available?",
        answer: "Yes! We offer mobile apps for both iOS and Android devices, allowing you to manage your content workflows on the go. You can download them from the respective app stores."
      },
      {
        question: "How does pricing work?",
        answer: "AutoContentFlow offers tiered subscription plans including Free, Essential, Pro, and Business levels. Each tier provides increasing access to features, content generation limits, platforms, and analytics capabilities. View our Subscription page for detailed pricing information."
      }
    ]
  },
  {
    id: "content-generation",
    name: "AI Content Generation",
    faqs: [
      {
        question: "How does the AI content generation work?",
        answer: "Our AI content generation uses advanced language models (powered by OpenAI's GPT-4o) to create content based on your specified parameters such as topic, tone, content type, and target platforms. The AI analyzes your inputs, current trends, and best practices to generate relevant, engaging content tailored to your needs."
      },
      {
        question: "Can I edit the AI-generated content?",
        answer: "Absolutely! All AI-generated content is fully editable. We recommend reviewing and personalizing the content before publishing to ensure it aligns perfectly with your brand voice and objectives."
      },
      {
        question: "Is there a limit to how much content I can generate?",
        answer: "Content generation limits vary based on your subscription tier. Free accounts can generate a limited number of pieces per month, while paid tiers offer progressively higher limits. You can view your current usage and limits in your account dashboard."
      },
      {
        question: "What languages are supported for content generation?",
        answer: "Currently, we support English, Spanish, French, German, Italian, Portuguese, and Japanese. We're actively working on adding more languages based on user demand."
      },
      {
        question: "How does AutoContentFlow ensure the content is original?",
        answer: "Our AI is designed to generate unique content based on your inputs. While the model draws from its training data, it creates new content rather than copying existing materials. We also have built-in originality checks to ensure freshness and uniqueness."
      }
    ]
  },
  {
    id: "workflows",
    name: "Workflow Automation",
    faqs: [
      {
        question: "What is a workflow in AutoContentFlow?",
        answer: "A workflow is a customizable sequence of actions that automates your content creation and publishing process. Workflows can include generating content, scheduling posts across platforms, applying approval processes, and tracking performance—all automatically."
      },
      {
        question: "How do I create a workflow?",
        answer: "Navigate to the Workflows section, click 'Create New Workflow', and follow the step-by-step guide to define your content parameters, select platforms, set scheduling preferences, and configure any additional automations like approval steps or performance tracking."
      },
      {
        question: "Can I use different schedules for different platforms?",
        answer: "Yes! Each platform within a workflow can have its own unique scheduling settings. This allows you to optimize posting times based on when your audience is most active on each platform."
      },
      {
        question: "Is there a limit to how many workflows I can create?",
        answer: "The number of workflows you can create depends on your subscription tier. Free users can create up to 3 workflows, while higher tiers allow for more. Check your subscription details for specific limits."
      },
      {
        question: "Can workflows be paused or modified?",
        answer: "Yes, workflows can be paused, resumed, or modified at any time. Changes to active workflows will apply to future content generation and publishing, not to already scheduled posts."
      }
    ]
  },
  {
    id: "analytics",
    name: "Analytics & Reporting",
    faqs: [
      {
        question: "What metrics does the Analytics Dashboard track?",
        answer: "Our Analytics Dashboard tracks engagement metrics (likes, comments, shares, clicks), audience growth, content performance by type and platform, optimal posting times, and conversion rates. Pro and Business tiers get access to more advanced analytics including sentiment analysis and competitor benchmarking."
      },
      {
        question: "How frequently is analytics data updated?",
        answer: "Basic engagement metrics are updated in near real-time, while more complex analytics like sentiment analysis and audience insights are updated daily. Historical data is maintained for 12 months on paid plans."
      },
      {
        question: "Can I export analytics reports?",
        answer: "Yes, you can export analytics data in CSV, PDF, or Excel formats. This feature is available on all paid subscription tiers."
      },
      {
        question: "How does the posting time optimizer work?",
        answer: "Our posting time optimizer analyzes historical engagement data from your posts to identify when your audience is most active and responsive on each platform. It then recommends optimal posting times to maximize engagement for future content."
      },
      {
        question: "Can I set up custom alerts based on analytics?",
        answer: "Yes, Pro and Business subscribers can configure custom alerts based on performance thresholds. For example, you can receive notifications when a post exceeds certain engagement levels or when performance drops below expected metrics."
      }
    ]
  },
  {
    id: "account",
    name: "Account & Billing",
    faqs: [
      {
        question: "How do I upgrade or downgrade my subscription?",
        answer: "You can change your subscription at any time by going to Account Settings > Subscription. Changes to higher tiers take effect immediately, while downgrades take effect at the end of your current billing cycle."
      },
      {
        question: "What payment methods are accepted?",
        answer: "We accept all major credit cards and PayPal. Business tier customers also have the option for invoice-based payments."
      },
      {
        question: "Is there a refund policy?",
        answer: "We offer a 14-day money-back guarantee for new subscribers. If you're not satisfied with our service within the first 14 days, contact our support team for a full refund."
      },
      {
        question: "How do I cancel my subscription?",
        answer: "You can cancel your subscription anytime by going to Account Settings > Subscription > Cancel Subscription. Your access will continue until the end of your current billing period."
      },
      {
        question: "Can I transfer my subscription to another account?",
        answer: "Subscription transfers between accounts are not supported automatically. Please contact our support team for assistance with special circumstances."
      }
    ]
  }
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("general");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<{[key: string]: boolean}>({});
  
  // Filter FAQs based on search
  const allFaqs = faqCategories.flatMap(category => 
    category.faqs.map(faq => ({
      ...faq,
      category: category.id
    }))
  );
  
  const filteredFaqs = searchQuery === "" 
    ? [] 
    : allFaqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
  const handleFeedback = (questionId: string, isHelpful: boolean) => {
    // In a real app, this would send feedback to an API
    console.log(`FAQ feedback: ${questionId} was ${isHelpful ? 'helpful' : 'not helpful'}`);
    setFeedbackSubmitted({...feedbackSubmitted, [questionId]: true});
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center text-center mb-8">
          <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
          <p className="text-muted-foreground max-w-2xl mt-2">
            Find answers to the most common questions about AutoContentFlow
          </p>
          
          <div className="w-full max-w-2xl mt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for answers..."
                className="pl-10 py-6 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {searchQuery ? (
          // Search results
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">
              Search Results {filteredFaqs.length > 0 && `(${filteredFaqs.length})`}
            </h2>
            
            {filteredFaqs.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {filteredFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`search-${index}`}>
                    <AccordionTrigger className="hover:bg-neutral-100 px-4 text-left">
                      <div className="flex items-start">
                        <HelpCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-1 text-primary" />
                        <span>{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="ml-7">
                        <p className="text-neutral-700">{faq.answer}</p>
                        
                        <div className="mt-4 flex items-center text-sm text-neutral-500">
                          <span className="mr-4">Was this helpful?</span>
                          {!feedbackSubmitted[`search-${index}`] ? (
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8"
                                onClick={() => handleFeedback(`search-${index}`, true)}
                              >
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                Yes
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8"
                                onClick={() => handleFeedback(`search-${index}`, false)}
                              >
                                <ThumbsDown className="h-4 w-4 mr-1" />
                                No
                              </Button>
                            </div>
                          ) : (
                            <span className="text-green-600 font-medium">
                              Thank you for your feedback!
                            </span>
                          )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-neutral-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">No results found</h3>
                <p className="text-muted-foreground mb-6">
                  We couldn't find any FAQs matching your search query.
                </p>
                <Button onClick={() => setSearchQuery("")}>
                  Browse all categories
                </Button>
              </div>
            )}
          </div>
        ) : (
          // FAQ categories and accordions
          <div className="max-w-4xl mx-auto">
            <Tabs 
              value={activeCategory} 
              onValueChange={setActiveCategory} 
              className="space-y-6"
            >
              <div className="overflow-auto">
                <TabsList className="mb-6 flex w-max">
                  {faqCategories.map((category) => (
                    <TabsTrigger 
                      key={category.id} 
                      value={category.id}
                      className="px-6"
                    >
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              
              {faqCategories.map((category) => (
                <TabsContent key={category.id} value={category.id}>
                  <h2 className="text-2xl font-bold mb-6">{category.name} FAQs</h2>
                  
                  <Accordion type="single" collapsible className="w-full">
                    {category.faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`${category.id}-${index}`}>
                        <AccordionTrigger className="hover:bg-neutral-100 px-4 text-left">
                          <div className="flex items-start">
                            <HelpCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-1 text-primary" />
                            <span>{faq.question}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="ml-7">
                            <p className="text-neutral-700">{faq.answer}</p>
                            
                            <div className="mt-4 flex items-center text-sm text-neutral-500">
                              <span className="mr-4">Was this helpful?</span>
                              {!feedbackSubmitted[`${category.id}-${index}`] ? (
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8"
                                    onClick={() => handleFeedback(`${category.id}-${index}`, true)}
                                  >
                                    <ThumbsUp className="h-4 w-4 mr-1" />
                                    Yes
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8"
                                    onClick={() => handleFeedback(`${category.id}-${index}`, false)}
                                  >
                                    <ThumbsDown className="h-4 w-4 mr-1" />
                                    No
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-green-600 font-medium">
                                  Thank you for your feedback!
                                </span>
                              )}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}
        
        <div className="max-w-3xl mx-auto mt-16 bg-blue-50 rounded-lg p-8">
          <div className="flex flex-col sm:flex-row items-center">
            <div className="mb-6 sm:mb-0 sm:mr-8">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                <MailQuestion className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-bold text-blue-900 mb-2">Still have questions?</h3>
              <p className="text-blue-700 mb-4">
                Our support team is here to help. Reach out to us and we'll get back to you as soon as possible.
              </p>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
                <Button variant="outline" className="border-blue-600 text-blue-600">
                  View Documentation
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}