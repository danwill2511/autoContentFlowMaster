import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Search, 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  Building, 
  Users, 
  Heart,
  Coffee,
  Rocket,
  Brain,
  Smile,
  Zap,
  ArrowRight
} from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

// Sample job openings
// In a real app, this would come from an API or CMS
const jobOpenings = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    department: "Engineering",
    location: "Remote (US/Canada)",
    type: "Full-time",
    experience: "3+ years",
    salary: "$120,000 - $150,000",
    description: "We're looking for a skilled Senior Frontend Developer to join our product team. In this role, you'll work on building and improving our web application using React, TypeScript, and modern frontend tools.",
    responsibilities: [
      "Design, develop, and maintain high-performance, reusable frontend components",
      "Collaborate with backend engineers to integrate frontend with API services",
      "Implement responsive designs that work across desktop and mobile devices",
      "Write clean, well-tested code following best practices and coding standards",
      "Optimize applications for maximum speed and scalability"
    ],
    requirements: [
      "3+ years of professional experience with React and TypeScript",
      "Strong understanding of frontend fundamentals (HTML, CSS, JavaScript)",
      "Experience with state management solutions (Redux, Context API, etc.)",
      "Familiarity with modern frontend tooling (Webpack, Vite, etc.)",
      "Knowledge of responsive design and cross-browser compatibility issues",
      "Excellent problem-solving skills and attention to detail"
    ],
    niceToHave: [
      "Experience with Next.js or similar frameworks",
      "Understanding of web accessibility standards",
      "Experience with CSS-in-JS libraries",
      "Familiarity with design tools like Figma"
    ],
    featured: true
  },
  {
    id: 2,
    title: "Machine Learning Engineer",
    department: "AI Team",
    location: "San Francisco, CA (Hybrid)",
    type: "Full-time",
    experience: "4+ years",
    salary: "$140,000 - $180,000",
    description: "Join our AI team to build and improve the machine learning models that power our content generation platform. You'll work on enhancing our content quality, personalization, and optimization algorithms.",
    responsibilities: [
      "Design and implement machine learning models for content analysis and generation",
      "Collaborate with product and engineering teams to integrate ML capabilities",
      "Improve model performance, accuracy, and efficiency through experimentation",
      "Develop systems to evaluate and validate model outputs",
      "Stay up-to-date with the latest research and advancements in NLP and ML"
    ],
    requirements: [
      "4+ years of experience in applied machine learning",
      "Strong understanding of NLP techniques and transformer-based models",
      "Experience with ML frameworks like PyTorch or TensorFlow",
      "Solid Python programming skills",
      "Background in deploying ML models to production",
      "MS or PhD in Computer Science, Machine Learning, or related field"
    ],
    niceToHave: [
      "Experience with GPT models and their applications",
      "Background in content or text analytics",
      "Knowledge of distributed training systems",
      "Publications in NLP or ML conferences/journals"
    ],
    featured: true
  },
  {
    id: 3,
    title: "Product Marketing Manager",
    department: "Marketing",
    location: "New York, NY (Hybrid)",
    type: "Full-time",
    experience: "3+ years",
    salary: "$100,000 - $130,000",
    description: "We're seeking a Product Marketing Manager to help us communicate the value of our AI-powered content platform to potential customers. You'll develop positioning, messaging, and go-to-market strategies for new features and products.",
    responsibilities: [
      "Develop positioning and messaging for product features and updates",
      "Create compelling marketing materials including website content, emails, and product collateral",
      "Work with product teams to understand new features and their benefits",
      "Collaborate with content marketing to develop educational resources",
      "Analyze market trends and competitor offerings"
    ],
    requirements: [
      "3+ years of product marketing experience, preferably in SaaS",
      "Strong writing and communication skills",
      "Experience developing go-to-market strategies",
      "Ability to translate technical features into customer benefits",
      "Data-driven approach to measuring marketing effectiveness",
      "Bachelor's degree in Marketing, Business, or related field"
    ],
    niceToHave: [
      "Experience marketing AI or content-related products",
      "Background in content creation or social media management",
      "Familiarity with product-led growth strategies",
      "Experience with marketing automation tools"
    ],
    featured: false
  },
  {
    id: 4,
    title: "Customer Success Manager",
    department: "Customer Success",
    location: "Remote (Global)",
    type: "Full-time",
    experience: "2+ years",
    salary: "$70,000 - $90,000",
    description: "As a Customer Success Manager, you'll work directly with our customers to ensure they get maximum value from our platform. You'll help customers implement effective content strategies, provide training, and drive adoption and renewal.",
    responsibilities: [
      "Onboard new customers and provide training on platform features",
      "Develop and maintain strong relationships with assigned customers",
      "Monitor customer health metrics and proactively address concerns",
      "Identify upsell and expansion opportunities within accounts",
      "Collaborate with product team to share customer feedback"
    ],
    requirements: [
      "2+ years of customer success experience, preferably in SaaS",
      "Strong communication and relationship-building skills",
      "Experience with customer success platforms (Gainsight, etc.)",
      "Problem-solving mindset and ability to prioritize customer needs",
      "Enthusiasm for content creation and social media"
    ],
    niceToHave: [
      "Background in content marketing or social media management",
      "Experience with AI or automation tools",
      "Knowledge of content performance analytics",
      "Experience with change management methodologies"
    ],
    featured: false
  },
  {
    id: 5,
    title: "Backend Engineer",
    department: "Engineering",
    location: "Remote (US/Canada)",
    type: "Full-time",
    experience: "3+ years",
    salary: "$120,000 - $160,000",
    description: "We're looking for a Backend Engineer to help build and scale our API services and infrastructure. You'll work on designing and implementing robust, scalable backend systems that power our content platform.",
    responsibilities: [
      "Design and develop scalable, reliable API services",
      "Optimize database models and queries for performance",
      "Implement data processing pipelines for content analytics",
      "Work with frontend engineers to ensure seamless integration",
      "Build and maintain infrastructure for service reliability"
    ],
    requirements: [
      "3+ years of backend development experience",
      "Strong knowledge of Node.js and TypeScript",
      "Experience with database systems (PostgreSQL, MongoDB, etc.)",
      "Familiarity with cloud infrastructure (AWS, Azure, GCP)",
      "Understanding of API design principles and best practices",
      "Knowledge of security best practices"
    ],
    niceToHave: [
      "Experience with serverless architectures",
      "Knowledge of containerization (Docker, Kubernetes)",
      "Background in real-time data processing",
      "Experience with CI/CD pipelines"
    ],
    featured: false
  },
  {
    id: 6,
    title: "UX/UI Designer",
    department: "Design",
    location: "Remote (Global)",
    type: "Full-time",
    experience: "2+ years",
    salary: "$90,000 - $120,000",
    description: "Join our design team to create intuitive, beautiful interfaces for our content platform. You'll collaborate with product and engineering teams to design experiences that make content creation easy and enjoyable for our users.",
    responsibilities: [
      "Design user interfaces for web and mobile applications",
      "Create wireframes, prototypes, and high-fidelity mockups",
      "Conduct user research and usability testing",
      "Develop and maintain our design system",
      "Collaborate with engineers to ensure proper implementation"
    ],
    requirements: [
      "2+ years of experience in product design for digital products",
      "Proficiency with design tools like Figma or Sketch",
      "Strong portfolio showcasing UX process and UI skills",
      "Understanding of accessibility standards",
      "Excellent visual design sense and attention to detail",
      "Ability to translate user needs into design solutions"
    ],
    niceToHave: [
      "Experience designing for content creation tools",
      "Knowledge of frontend development (HTML, CSS)",
      "Background in design systems",
      "Motion design experience"
    ],
    featured: false
  }
];

// Company benefits
const companyBenefits = [
  {
    icon: <Heart className="h-8 w-8 text-red-500" />,
    title: "Comprehensive Healthcare",
    description: "Full medical, dental, and vision coverage for you and your dependents. We cover 100% of employee premiums."
  },
  {
    icon: <Clock className="h-8 w-8 text-blue-500" />,
    title: "Flexible Work",
    description: "We support remote work and flexible schedules. Focus on results, not hours spent at a desk."
  },
  {
    icon: <Coffee className="h-8 w-8 text-amber-700" />,
    title: "Unlimited PTO",
    description: "Take the time you need to rest, recharge, and maintain a healthy work-life balance."
  },
  {
    icon: <Rocket className="h-8 w-8 text-primary" />,
    title: "Career Growth",
    description: "Regular feedback, dedicated learning budgets, and clear paths for advancement."
  },
  {
    icon: <Zap className="h-8 w-8 text-yellow-500" />,
    title: "Modern Equipment",
    description: "Choose your preferred setup with a generous tech allowance to ensure you have the tools you need."
  },
  {
    icon: <Brain className="h-8 w-8 text-purple-500" />,
    title: "Learning Stipend",
    description: "$1,500 annual budget for courses, books, conferences, and other professional development."
  }
];

// Department filters
const departments = ["All Departments", ...new Set(jobOpenings.map(job => job.department))];
const locations = ["All Locations", ...new Set(jobOpenings.map(job => job.location))];

export default function CareersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  
  // Filter jobs based on search, department, and location
  const filteredJobs = jobOpenings.filter(job => {
    const matchesSearch = searchQuery === "" || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesDepartment = selectedDepartment === "All Departments" || job.department === selectedDepartment;
    
    const matchesLocation = selectedLocation === "All Locations" || job.location === selectedLocation;
    
    return matchesSearch && matchesDepartment && matchesLocation;
  });
  
  // Featured jobs
  const featuredJobs = jobOpenings.filter(job => job.featured);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-indigo-600 text-white py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Join Our Team
              </h1>
              <p className="text-xl mb-8 text-white/90">
                Build the future of content creation with us. We're looking for talented individuals who are passionate about AI, content, and making creators' lives easier.
              </p>
              <Button className="bg-white text-primary hover:bg-white/90">
                View Open Positions
              </Button>
            </div>
          </div>
        </section>
        
        {/* Team Culture Section */}
        <section className="py-20 container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge className="mb-2">Our Culture</Badge>
            <h2 className="text-3xl font-bold mb-4">A team united by shared values</h2>
            <p className="text-lg text-neutral-700">
              We're building a team of passionate individuals who care deeply about our mission to revolutionize content creation. Our culture is built on collaboration, innovation, and a commitment to excellence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Collaboration</h3>
              <p className="text-neutral-700">
                We believe the best ideas come from diverse perspectives working together. We foster a culture of open communication and teamwork.
              </p>
            </div>
            
            <div className="text-center">
              <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Rocket className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Innovation</h3>
              <p className="text-neutral-700">
                We're constantly pushing the boundaries of what's possible with content creation and AI. We encourage experimentation and creative thinking.
              </p>
            </div>
            
            <div className="text-center">
              <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Smile className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Balance</h3>
              <p className="text-neutral-700">
                We value work that matters, but we also respect life outside of work. We believe in sustainable pace and prioritizing wellbeing.
              </p>
            </div>
          </div>
        </section>
        
        {/* Benefits Section */}
        <section className="py-20 bg-neutral-100">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <Badge className="mb-2">Benefits</Badge>
              <h2 className="text-3xl font-bold mb-4">Why you'll love working here</h2>
              <p className="text-lg text-neutral-700">
                We believe in taking care of our team members with competitive compensation and comprehensive benefits designed to support your whole self.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {companyBenefits.map((benefit, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="rounded-full bg-white w-16 h-16 flex items-center justify-center mb-4">
                      {benefit.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                    <p className="text-neutral-700">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* Open Positions Section */}
        <section className="py-20 container mx-auto px-4" id="open-positions">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
              <div>
                <Badge className="mb-2">Open Positions</Badge>
                <h2 className="text-3xl font-bold mb-2">Join our mission</h2>
                <p className="text-neutral-700">
                  Explore our current openings and find your place on the team.
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 w-full md:w-auto flex flex-col md:flex-row gap-4">
                <div className="relative w-full md:w-auto">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search positions..."
                    className="pl-8 w-full md:w-[200px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(department => (
                      <SelectItem key={department} value={department}>
                        {department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(location => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {featuredJobs.length > 0 && (
              <div className="mb-12">
                <h3 className="text-lg font-semibold mb-4">Featured Positions</h3>
                <div className="space-y-4">
                  {featuredJobs.map((job) => (
                    <Card key={job.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <div className="flex items-center mb-2">
                              <Badge variant="secondary" className="mr-2">{job.department}</Badge>
                              <Badge variant="outline">{job.type}</Badge>
                            </div>
                            <h3 className="text-xl font-bold mb-1">{job.title}</h3>
                            <div className="flex flex-wrap text-sm text-neutral-500">
                              <div className="flex items-center mr-4">
                                <MapPin className="h-4 w-4 mr-1" />
                                {job.location}
                              </div>
                              <div className="flex items-center mr-4">
                                <DollarSign className="h-4 w-4 mr-1" />
                                {job.salary}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {job.experience}
                              </div>
                            </div>
                          </div>
                          <Button className="mt-4 md:mt-0" asChild>
                            <a href={`/careers/${job.id}`}>View Position</a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {filteredJobs.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold mb-4">All Open Positions</h3>
                <div className="space-y-4">
                  {filteredJobs.map((job) => (
                    <Card key={job.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <div className="flex items-center mb-2">
                              <Badge variant="secondary" className="mr-2">{job.department}</Badge>
                              <Badge variant="outline">{job.type}</Badge>
                            </div>
                            <h3 className="text-xl font-bold mb-1">{job.title}</h3>
                            <div className="flex flex-wrap text-sm text-neutral-500">
                              <div className="flex items-center mr-4">
                                <MapPin className="h-4 w-4 mr-1" />
                                {job.location}
                              </div>
                              <div className="flex items-center mr-4">
                                <DollarSign className="h-4 w-4 mr-1" />
                                {job.salary}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {job.experience}
                              </div>
                            </div>
                          </div>
                          <Button className="mt-4 md:mt-0" asChild>
                            <a href={`/careers/${job.id}`}>View Position</a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-neutral-100 rounded-lg">
                <div className="mx-auto w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-neutral-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">No positions found</h3>
                <p className="text-muted-foreground mb-6">
                  We couldn't find any positions matching your search criteria.
                </p>
                <Button onClick={() => {
                  setSearchQuery("");
                  setSelectedDepartment("All Departments");
                  setSelectedLocation("All Locations");
                }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </section>
        
        {/* Job Application Process Section */}
        <section className="py-20 bg-neutral-100">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <Badge className="mb-2">Application Process</Badge>
              <h2 className="text-3xl font-bold mb-4">How to join our team</h2>
              <p className="text-lg text-neutral-700">
                We've designed a straightforward hiring process that helps us get to know you while respecting your time.
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="step-1">
                  <AccordionTrigger className="text-lg font-semibold">
                    1. Application Review
                  </AccordionTrigger>
                  <AccordionContent className="text-neutral-700">
                    After submitting your application, our recruiting team will review your qualifications against the role requirements. We aim to respond to all applicants within one week, whether moving forward or not.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="step-2">
                  <AccordionTrigger className="text-lg font-semibold">
                    2. Initial Conversation
                  </AccordionTrigger>
                  <AccordionContent className="text-neutral-700">
                    If your experience aligns with the role, we'll schedule a 30-minute call with a recruiter to discuss your background, interest in AutoContentFlow, and answer any initial questions you have about the position or company.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="step-3">
                  <AccordionTrigger className="text-lg font-semibold">
                    3. Technical or Skills Assessment
                  </AccordionTrigger>
                  <AccordionContent className="text-neutral-700">
                    Depending on the role, we may ask you to complete a brief assessment that helps us understand your skills. For technical roles, this might be a coding exercise. For other positions, it could be a written assignment or case study. We design these to be completed in 2-3 hours maximum.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="step-4">
                  <AccordionTrigger className="text-lg font-semibold">
                    4. Team Interviews
                  </AccordionTrigger>
                  <AccordionContent className="text-neutral-700">
                    You'll meet with 3-4 team members for conversations about your experience, skills, and how you approach problems. We value diverse perspectives, so you'll speak with potential teammates, cross-functional partners, and a hiring manager.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="step-5">
                  <AccordionTrigger className="text-lg font-semibold">
                    5. Final Conversation
                  </AccordionTrigger>
                  <AccordionContent className="text-neutral-700">
                    The final step is a conversation with a senior leader, which focuses less on skills and more on mutual alignment around values, career aspirations, and ensuring AutoContentFlow is the right environment for you to thrive.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="step-6">
                  <AccordionTrigger className="text-lg font-semibold">
                    6. Offer & Onboarding
                  </AccordionTrigger>
                  <AccordionContent className="text-neutral-700">
                    If we decide to move forward, we'll extend an offer and answer any questions about compensation, benefits, and next steps. Once you accept, our People team will guide you through the onboarding process to ensure a smooth transition to your new role.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Don't see a perfect fit?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto text-white/90">
              We're always looking for talented individuals to join our team. Send us your resume and we'll keep you in mind for future opportunities.
            </p>
            <Button className="bg-white text-primary hover:bg-white/90">
              Submit Your Resume
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}