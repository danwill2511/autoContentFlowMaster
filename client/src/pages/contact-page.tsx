import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageSquare, 
  Users, 
  Building, 
  HelpCircle,
  Check,
  AlertCircle
} from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

interface FormState {
  name: string;
  email: string;
  company: string;
  phone: string;
  subject: string;
  message: string;
  inquiryType: string;
  howDidYouHear: string;
  marketingConsent: boolean;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormState>({
    name: "",
    email: "",
    company: "",
    phone: "",
    subject: "",
    message: "",
    inquiryType: "general",
    howDidYouHear: "",
    marketingConsent: false
  });
  
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRadioChange = (name: string, value: boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      
      // if (!response.ok) throw new Error('Failed to submit form');
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success
      setFormSubmitted(true);
      setFormData({
        name: "",
        email: "",
        company: "",
        phone: "",
        subject: "",
        message: "",
        inquiryType: "general",
        howDidYouHear: "",
        marketingConsent: false
      });
    } catch (err) {
      setError("An error occurred while submitting the form. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-lg text-neutral-700 max-w-2xl mx-auto">
              Have questions or need assistance? Our team is here to help. Reach out through the form below or use our direct contact details.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <Card>
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Email Us</h3>
                <p className="text-neutral-700 mb-3">For general inquiries and support questions:</p>
                <a href="mailto:hello@autocontentflow.com" className="text-primary font-medium hover:underline">
                  hello@autocontentflow.com
                </a>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Call Us</h3>
                <p className="text-neutral-700 mb-3">Mon-Fri from 9am to 6pm ET:</p>
                <a href="tel:+18005551234" className="text-primary font-medium hover:underline">
                  +1 (800) 555-1234
                </a>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Visit Us</h3>
                <p className="text-neutral-700 mb-3">Our headquarters location:</p>
                <address className="not-italic text-primary font-medium">
                  123 Content Ave<br />
                  San Francisco, CA 94105
                </address>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Get in Touch</CardTitle>
                  <CardDescription>
                    Fill out the form and our team will get back to you within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="sales">
                    <TabsList className="grid grid-cols-3 mb-6">
                      <TabsTrigger value="sales">Sales</TabsTrigger>
                      <TabsTrigger value="support">Support</TabsTrigger>
                      <TabsTrigger value="other">Other</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="sales">
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <Users className="h-5 w-5 mr-2 text-primary mt-0.5" />
                          <div>
                            <h4 className="font-medium">Talk to Sales</h4>
                            <p className="text-sm text-neutral-600">
                              Interested in AutoContentFlow for your business? Our sales team is ready to discuss your needs and find the right solution.
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-sm">
                          <p className="font-medium">Email:</p>
                          <a href="mailto:sales@autocontentflow.com" className="text-primary hover:underline">
                            sales@autocontentflow.com
                          </a>
                        </div>
                        
                        <div className="text-sm">
                          <p className="font-medium">Direct Line:</p>
                          <a href="tel:+18005551235" className="text-primary hover:underline">
                            +1 (800) 555-1235
                          </a>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="support">
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <HelpCircle className="h-5 w-5 mr-2 text-primary mt-0.5" />
                          <div>
                            <h4 className="font-medium">Customer Support</h4>
                            <p className="text-sm text-neutral-600">
                              Need help with your account or have technical questions? Our support team is here to assist you.
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-sm">
                          <p className="font-medium">Email:</p>
                          <a href="mailto:support@autocontentflow.com" className="text-primary hover:underline">
                            support@autocontentflow.com
                          </a>
                        </div>
                        
                        <div className="text-sm">
                          <p className="font-medium">Support Portal:</p>
                          <a href="https://support.autocontentflow.com" className="text-primary hover:underline">
                            support.autocontentflow.com
                          </a>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="other">
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <Building className="h-5 w-5 mr-2 text-primary mt-0.5" />
                          <div>
                            <h4 className="font-medium">Partnerships & Media</h4>
                            <p className="text-sm text-neutral-600">
                              For partnership opportunities, media inquiries, or other business matters, please contact our team.
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-sm">
                          <p className="font-medium">Partnerships:</p>
                          <a href="mailto:partners@autocontentflow.com" className="text-primary hover:underline">
                            partners@autocontentflow.com
                          </a>
                        </div>
                        
                        <div className="text-sm">
                          <p className="font-medium">Media Inquiries:</p>
                          <a href="mailto:press@autocontentflow.com" className="text-primary hover:underline">
                            press@autocontentflow.com
                          </a>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
              
              <div className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-1">What are your support hours?</h4>
                      <p className="text-sm text-neutral-700">
                        Our support team is available Monday through Friday, 9am to 6pm Eastern Time.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-1">How quickly can I expect a response?</h4>
                      <p className="text-sm text-neutral-700">
                        We aim to respond to all inquiries within 24 hours during business days.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-1">Do you offer demos?</h4>
                      <p className="text-sm text-neutral-700">
                        Yes! You can request a personalized demo through the contact form or by emailing sales@autocontentflow.com.
                      </p>
                    </div>
                    
                    <Button variant="link" className="px-0 text-primary" asChild>
                      <a href="/faq">View all FAQs</a>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Form</CardTitle>
                  <CardDescription>
                    Please fill out the form below with your inquiry details.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {formSubmitted ? (
                    <div className="text-center py-8">
                      <div className="rounded-full bg-green-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <Check className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                      <p className="text-neutral-700 mb-6 max-w-md mx-auto">
                        Thank you for reaching out. We've received your message and will get back to you within 24 hours.
                      </p>
                      <Button onClick={() => setFormSubmitted(false)}>
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your name"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your.email@example.com"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="company">Company</Label>
                          <Input
                            id="company"
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                            placeholder="Your company name"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+1 (123) 456-7890"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <Label>Inquiry Type *</Label>
                        <Select 
                          value={formData.inquiryType}
                          onValueChange={(value) => handleSelectChange('inquiryType', value)}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select inquiry type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Inquiry</SelectItem>
                            <SelectItem value="sales">Sales Question</SelectItem>
                            <SelectItem value="support">Technical Support</SelectItem>
                            <SelectItem value="partnership">Partnership Opportunity</SelectItem>
                            <SelectItem value="billing">Billing Issue</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <Label htmlFor="subject">Subject *</Label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="Brief subject of your inquiry"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Please provide details about your inquiry..."
                          rows={5}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <Label>How did you hear about us?</Label>
                        <Select 
                          value={formData.howDidYouHear}
                          onValueChange={(value) => handleSelectChange('howDidYouHear', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="search">Search Engine</SelectItem>
                            <SelectItem value="social">Social Media</SelectItem>
                            <SelectItem value="referral">Referral</SelectItem>
                            <SelectItem value="blog">Blog or Article</SelectItem>
                            <SelectItem value="event">Event or Conference</SelectItem>
                            <SelectItem value="advertisement">Advertisement</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-4 mb-6">
                        <Label>Marketing Communications</Label>
                        <RadioGroup defaultValue="yes">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem 
                              value="yes" 
                              id="consent-yes"
                              onClick={() => handleRadioChange('marketingConsent', true)}
                            />
                            <Label htmlFor="consent-yes" className="font-normal">
                              Yes, I'd like to receive updates and offers from AutoContentFlow.
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem 
                              value="no" 
                              id="consent-no"
                              onClick={() => handleRadioChange('marketingConsent', false)}
                            />
                            <Label htmlFor="consent-no" className="font-normal">
                              No, please only contact me about my inquiry.
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      {error && (
                        <div className="bg-red-50 text-red-700 px-4 py-3 rounded flex items-start mb-6">
                          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                          <div>{error}</div>
                        </div>
                      )}
                      
                      <Button type="submit" className="w-full" disabled={submitting}>
                        {submitting ? "Sending..." : "Send Message"}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}