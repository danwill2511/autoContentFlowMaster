import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  Award, 
  TrendingUp, 
  Lightbulb, 
  Target, 
  Heart, 
  Globe, 
  Zap, 
  Shield, 
  Briefcase,
  Twitter,
  Linkedin,
  Github
} from "lucide-react";
import Layout from "@/components/layout/layout";

// Team member data
const founder = {
  name: "Danny Willems",
  role: "Founder & CEO",
  bio: "Visionary entrepreneur and tech innovator. Founded AutoContentFlow to revolutionize content creation and empower creators worldwide.",
  social: {
    linkedin: "https://linkedin.com/in/dannywillems"
  }
};

// Company values
const companyValues = [
  {
    icon: <Lightbulb className="h-8 w-8 text-amber-500" />,
    title: "Innovation",
    description: "We push the boundaries of what's possible with AI and content creation, constantly evolving our platform with cutting-edge technology."
  },
  {
    icon: <Users className="h-8 w-8 text-blue-500" />,
    title: "Customer Centricity",
    description: "Our customers' success is our success. We listen attentively to feedback and build solutions that solve real problems for content creators."
  },
  {
    icon: <Shield className="h-8 w-8 text-green-500" />,
    title: "Integrity",
    description: "We're committed to ethical AI practices, data privacy, and transparent business operations. We earn trust through consistency and honesty."
  },
  {
    icon: <Heart className="h-8 w-8 text-red-500" />,
    title: "Passion",
    description: "We love what we do and believe in the transformative power of great content. This passion drives us to create exceptional experiences."
  },
  {
    icon: <Globe className="h-8 w-8 text-indigo-500" />,
    title: "Inclusivity",
    description: "We build for diverse creators across the globe, celebrating unique perspectives and ensuring our platform works for everyone."
  },
  {
    icon: <Zap className="h-8 w-8 text-yellow-500" />,
    title: "Impact",
    description: "We measure success by the real impact we have on our users' content strategies, productivity, and business outcomes."
  }
];

// Company milestones
const companyMilestones = [
  {
    year: "2021",
    title: "Company Founded",
    description: "AutoContentFlow founded by Sarah Johnson and Michael Chen to address the growing need for intelligent content automation."
  },
  {
    year: "2021",
    title: "Seed Funding",
    description: "Secured $2.5M in seed funding to build the initial product and assemble our core team of AI and content strategy experts."
  },
  {
    year: "2022",
    title: "Beta Launch",
    description: "Released our closed beta to 500 early adopters who helped shape our product with invaluable feedback and feature requests."
  },
  {
    year: "2022",
    title: "Series A Funding",
    description: "Raised $10M Series A to scale our platform and expand platform integrations beyond the initial social media channels."
  },
  {
    year: "2023",
    title: "Public Launch",
    description: "Official public launch of AutoContentFlow, allowing anyone to sign up and start creating automated content workflows."
  },
  {
    year: "2023",
    title: "10,000 Users",
    description: "Reached our first major milestone of 10,000 active users across diverse industries and content creation needs."
  },
  {
    year: "2024",
    title: "Mobile App Launch",
    description: "Released our mobile apps for iOS and Android, allowing users to manage content on the go and receive real-time performance alerts."
  },
  {
    year: "2024",
    title: "Advanced Analytics",
    description: "Launched our comprehensive analytics suite with AI-powered performance insights and cross-platform reporting."
  },
  {
    year: "2025",
    title: "Enterprise Solution",
    description: "Introduced AutoContentFlow Enterprise with advanced team collaboration, approval workflows, and custom integrations."
  }
];

export default function AboutUsPage() {
  return (
    <Layout>
      <div className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-primary/90 to-indigo-700 text-white py-24">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <Badge variant="secondary" className="mb-4">About Us</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                We're simplifying content creation with AI
              </h1>
              <p className="text-xl mb-8 text-white/90">
                AutoContentFlow is on a mission to empower creators, marketers, and businesses to produce exceptional content across platforms without the complexity and time investment.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button className="bg-white text-primary hover:bg-white/90">
                  Join Our Team
                </Button>
                <Button variant="outline" className="text-white border-white hover:bg-white/10">
                  Learn Our Story
                </Button>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-full md:w-1/2 h-full opacity-10">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path fill="currentColor" d="M45.7,-70.5C58.9,-62.5,69.3,-49.4,75.9,-34.7C82.4,-20,85,-3.8,81.5,11C78,25.8,68.3,39.2,56.5,49.4C44.7,59.6,30.9,66.5,15.8,70.3C0.7,74.1,-15.7,74.7,-29.5,69.1C-43.4,63.5,-54.6,51.7,-62.6,38.1C-70.5,24.6,-75.1,9.4,-74.3,-5.6C-73.5,-20.6,-67.3,-35.3,-57.5,-45.9C-47.8,-56.5,-34.5,-62.9,-21,-69.4C-7.4,-75.8,6.3,-82.3,21.1,-81.3C35.9,-80.4,51.9,-72,72.3,-59.9C92.7,-47.8,117.4,-32,123.8,-12.8C130.1,6.4,118.1,29,102.7,45.6C87.3,62.2,68.5,72.9,49.5,77C30.4,81,11.2,78.5,-6.5,74.9C-24.2,71.3,-40.4,66.7,-53.2,57.6C-66,48.5,-75.5,35,-79.6,19.9C-83.8,4.8,-82.7,-11.8,-75.4,-24.2C-68.1,-36.6,-54.6,-44.8,-41.4,-52.2C-28.3,-59.5,-15.3,-66,0.2,-66.4C15.6,-66.7,31.3,-61,45.7,-52.8C60.2,-44.7,73.3,-34.3,80.1,-20.6C87,-6.9,87.5,10.1,81.8,24.9C76.1,39.6,64.2,52.2,50.1,61.1C36,70,19.8,75.2,3.7,74.6C-12.5,73.9,-28.6,67.3,-41.9,57.5C-55.2,47.7,-65.8,34.7,-72.4,19.3C-79.1,3.9,-81.9,-13.9,-77.5,-29.5C-73.1,-45.1,-61.5,-58.5,-47.2,-67.2C-32.9,-76,-16.4,-80.1,-0.3,-79.7C15.9,-79.3,31.7,-74.3,45.7,-70.5Z" transform="translate(100 100)" />
            </svg>
          </div>
        </section>
        
        {/* Our Mission Section */}
        <section className="py-20 container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-2">Our Mission</Badge>
              <h2 className="text-3xl font-bold mb-6">Democratizing AI-powered content creation</h2>
              <p className="text-lg text-neutral-700 mb-6">
                At AutoContentFlow, we believe that creating high-quality, engaging content shouldn't require an entire marketing team or hours of daily work. Our mission is to democratize access to advanced content creation tools powered by artificial intelligence.
              </p>
              <p className="text-lg text-neutral-700 mb-6">
                We're building technology that understands your brand voice, audience preferences, and platform requirements to help you create content that resonates and drives engagement—all while saving you valuable time and resources.
              </p>
              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">50,000+</div>
                  <div className="text-neutral-600">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">12M+</div>
                  <div className="text-neutral-600">Posts Generated</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">500K+</div>
                  <div className="text-neutral-600">Hours Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">15+</div>
                  <div className="text-neutral-600">Platforms Supported</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/20 rounded-full"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-full"></div>
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                alt="Team collaboration" 
                className="rounded-lg shadow-xl relative z-10 w-full h-auto"
              />
            </div>
          </div>
        </section>
        
        {/* Our Values Section */}
        <section className="py-20 bg-neutral-100">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge className="mb-2">Our Values</Badge>
              <h2 className="text-3xl font-bold mb-4">The principles that guide us</h2>
              <p className="text-lg text-neutral-700">
                Our values define how we build our products, work together as a team, and serve our customers. They're the foundation of everything we do at AutoContentFlow.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {companyValues.map((value, index) => (
                <Card key={index} className="bg-white border-none">
                  <CardContent className="pt-6">
                    <div className="rounded-full bg-neutral-100 w-16 h-16 flex items-center justify-center mb-4">
                      {value.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                    <p className="text-neutral-700">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* Leadership Section */}
        <section className="py-20 container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-2">Leadership</Badge>
            <h2 className="text-3xl font-bold mb-4">Meet our Founder</h2>
            <p className="text-lg text-neutral-700">
              The visionary behind AutoContentFlow's mission to revolutionize content creation.
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <Card className="border-none shadow-md">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold">{founder.name}</h3>
                <p className="text-primary font-medium mb-3">{founder.role}</p>
                <p className="text-neutral-700 mb-4">{founder.bio}</p>
                <div className="flex justify-center">
                  <a href={founder.social.linkedin} className="text-neutral-600 hover:text-primary">
                    <Linkedin className="h-6 w-6" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
        
        {/* Our Journey Section */}
        <section className="py-20 bg-neutral-100">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge className="mb-2">Our Journey</Badge>
              <h2 className="text-3xl font-bold mb-4">The story of AutoContentFlow</h2>
              <p className="text-lg text-neutral-700">
                From a simple idea to an all-in-one content platform used by thousands of creators and businesses worldwide.
              </p>
            </div>
            
            <div className="relative">
              {/* Vertical timeline line */}
              <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-neutral-300 transform md:translate-x-px"></div>
              
              {/* Timeline events */}
              <div className="relative z-10">
                {companyMilestones.map((milestone, index) => (
                  <div key={index} className={`flex flex-col md:flex-row items-start mb-12 ${
                    index % 2 === 0 ? 'md:flex-row-reverse' : ''
                  }`}>
                    <div className="md:w-1/2 md:px-8">
                      <Card className="border-none shadow-md">
                        <CardContent className="p-6">
                          <Badge variant="outline" className="mb-2">{milestone.year}</Badge>
                          <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                          <p className="text-neutral-700">{milestone.description}</p>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="md:w-1/2 flex justify-center md:justify-start md:px-8 relative left-timeline">
                      <div className="w-4 h-4 bg-primary rounded-full mt-4 border-4 border-white"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to revolutionize your content strategy?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto text-white/90">
              Join thousands of creators and businesses who are saving time and creating better content with AutoContentFlow.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button className="bg-white text-primary hover:bg-white/90">
                Get Started Free
              </Button>
              <Button variant="outline" className="text-white border-white hover:bg-white/10">
                Schedule a Demo
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}