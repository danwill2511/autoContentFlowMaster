// Content Templates for the Library with animation preview URLs
// Each template includes a preview animation that demonstrates the workflow

export interface ContentTemplate {
  id: number;
  title: string;
  description: string;
  category: string;
  platforms: string[];
  downloads: number;
  rating: number;
  dateCreated: string;
  tags: string[];
  premium: boolean;
  template: string;
  animationPreview?: string; // URL or path to the animation preview
  workflowSteps?: string[]; // Steps in the workflow process
}

export const contentTemplates: ContentTemplate[] = [
  {
    id: 1,
    title: "Product Launch Announcement",
    description: "Template for announcing new product launches across platforms",
    category: "Marketing",
    platforms: ["Twitter", "LinkedIn", "Facebook"],
    downloads: 1248,
    rating: 4.8,
    dateCreated: "2023-03-15",
    tags: ["product", "launch", "announcement"],
    premium: false,
    template: "Excited to announce our new [Product]! 🚀\n\n[Product] helps you [benefit] without [pain point]. Learn more at [link] #ProductLaunch #[Industry]",
    animationPreview: "/assets/animations/product-launch.gif",
    workflowSteps: [
      "Draft product announcement",
      "AI enhancement for platform-specific versions",
      "Schedule across platforms",
      "Track engagement analytics"
    ]
  },
  {
    id: 2,
    title: "Weekly Industry Insights",
    description: "Regular post format for sharing industry news and trends",
    category: "Thought Leadership",
    platforms: ["LinkedIn", "Twitter"],
    downloads: 879,
    rating: 4.6,
    dateCreated: "2023-04-20",
    tags: ["insights", "industry", "weekly"],
    premium: false,
    template: "📊 This week in [Industry]: \n\n1. [Trend 1] is changing how companies approach [topic]\n2. [Company] announced [news] that will impact [audience]\n3. New research shows [statistic] about [topic]\n\nYour thoughts? #[Industry]Insights",
    animationPreview: "/assets/animations/weekly-insights.gif",
    workflowSteps: [
      "Research industry trends",
      "AI summary generation",
      "Format for social media",
      "Schedule for optimal engagement time"
    ]
  },
  {
    id: 3,
    title: "Customer Success Story",
    description: "Showcase happy customers and their results",
    category: "Social Proof",
    platforms: ["LinkedIn", "Facebook", "Instagram"],
    downloads: 1532,
    rating: 4.9,
    dateCreated: "2023-02-28",
    tags: ["testimonial", "customer", "success"],
    premium: false,
    template: "💬 Customer Spotlight: [Company/Person]\n\n\"[Testimonial quote highlighting the problem and solution]\"\n\nResults: [Specific metrics or improvements]\n\nLearn how we can help you achieve similar results: [Link] #CustomerSuccess",
    animationPreview: "/assets/animations/customer-story.gif",
    workflowSteps: [
      "Collect customer testimonial",
      "Create visual template",
      "Generate platform variations",
      "Schedule coordinated release"
    ]
  },
  {
    id: 4,
    title: "Webinar Promotion Series",
    description: "Multi-post series to promote upcoming webinars",
    category: "Event Marketing",
    platforms: ["LinkedIn", "Twitter", "Facebook", "Instagram"],
    downloads: 745,
    rating: 4.7,
    dateCreated: "2023-05-10",
    tags: ["webinar", "event", "promotion"],
    premium: true,
    template: "Join us for our upcoming webinar: \"[Title]\" 📆\n\nLearn how to [benefit/outcome] from our expert [Speaker Name].\n\nDate: [Date]\nTime: [Time]\nRegister: [Link]\n\n#Webinar #[Industry]",
    animationPreview: "/assets/animations/webinar-series.gif",
    workflowSteps: [
      "Create announcement post",
      "Schedule reminder posts",
      "Generate speaker highlight post",
      "Set up post-event follow-up"
    ]
  },
  {
    id: 5,
    title: "Inspirational Quote Series",
    description: "Shareable quotes with branded visuals",
    category: "Engagement",
    platforms: ["Instagram", "Facebook", "Pinterest"],
    downloads: 1867,
    rating: 4.5,
    dateCreated: "2023-03-25",
    tags: ["quote", "inspiration", "motivation"],
    premium: false,
    template: "\"[Quote]\" - [Author]\n\n#[Industry]Inspiration #[Relevant]Quote",
    animationPreview: "/assets/animations/quote-template.gif",
    workflowSteps: [
      "Select relevant quote",
      "Generate branded visual with AI",
      "Schedule for optimal engagement",
      "Set up for recurring series"
    ]
  },
  {
    id: 6,
    title: "Product Feature Highlight",
    description: "Showcase individual features with use cases",
    category: "Product Marketing",
    platforms: ["LinkedIn", "Twitter", "Facebook"],
    downloads: 912,
    rating: 4.6,
    dateCreated: "2023-06-05",
    tags: ["product", "feature", "highlight"],
    premium: false,
    template: "🔍 Feature Spotlight: [Feature Name]\n\n[Brief description of what the feature does]\n\nHow it helps: [Specific benefit or use case]\n\nTry it now: [Link] #ProductTip",
    animationPreview: "/assets/animations/feature-highlight.gif",
    workflowSteps: [
      "Select product feature",
      "Generate benefits list",
      "Create visual demonstration",
      "Schedule across platforms"
    ]
  },
  {
    id: 7,
    title: "How-To Tutorial Series",
    description: "Step-by-step guides for common tasks",
    category: "Education",
    platforms: ["LinkedIn", "Instagram", "YouTube"],
    downloads: 1356,
    rating: 4.8,
    dateCreated: "2023-04-12",
    tags: ["tutorial", "how-to", "guide"],
    premium: true,
    template: "📝 How to [Accomplish Task] in [Number] Simple Steps:\n\n1. [Step 1]\n2. [Step 2]\n3. [Step 3]\n...\n\nFor the complete guide: [Link] #HowTo #[Industry]Tips",
    animationPreview: "/assets/animations/tutorial-series.gif",
    workflowSteps: [
      "Break down process into steps",
      "Create visual guides for each step",
      "Generate platform-specific formats",
      "Schedule series with proper spacing"
    ]
  },
  {
    id: 8,
    title: "Industry Report Summary",
    description: "Highlight key findings from industry reports",
    category: "Research",
    platforms: ["LinkedIn", "Twitter"],
    downloads: 645,
    rating: 4.7,
    dateCreated: "2023-05-18",
    tags: ["report", "research", "insights"],
    premium: true,
    template: "📊 Key findings from our latest [Industry] Report:\n\n• [Statistic 1]: [Brief context]\n• [Statistic 2]: [Brief context]\n• [Statistic 3]: [Brief context]\n\nDownload the full report: [Link] #[Industry]Research",
    animationPreview: "/assets/animations/report-summary.gif",
    workflowSteps: [
      "Extract key data points",
      "Generate visual data representations",
      "Create executive summary",
      "Schedule with lead generation tracking"
    ]
  },
  {
    id: 9,
    title: "FAQ Series",
    description: "Answer common customer questions",
    category: "Customer Support",
    platforms: ["Twitter", "Facebook", "Instagram"],
    downloads: 892,
    rating: 4.5,
    dateCreated: "2023-03-30",
    tags: ["FAQ", "questions", "customer support"],
    premium: false,
    template: "❓ #FAQ: \"[Question]\"\n\n[Answer that provides value and showcases expertise]\n\nMore questions? [Link to FAQ page or contact] #[Industry]Help",
    animationPreview: "/assets/animations/faq-series.gif",
    workflowSteps: [
      "Compile common questions",
      "Generate concise answers",
      "Create visual Q&A format",
      "Schedule periodic releases"
    ]
  },
  {
    id: 10,
    title: "Team Member Spotlight",
    description: "Highlight team members and their expertise",
    category: "Company Culture",
    platforms: ["LinkedIn", "Instagram", "Facebook"],
    downloads: 723,
    rating: 4.6,
    dateCreated: "2023-06-10",
    tags: ["team", "employee", "spotlight"],
    premium: false,
    template: "🌟 Team Spotlight: Meet [Name], our [Position]\n\n[Brief bio and accomplishment]\n\n[Fun fact or personal insight]\n\n[How they contribute to customer success]\n\n#TeamThursday #[Company]Team",
    animationPreview: "/assets/animations/team-spotlight.gif",
    workflowSteps: [
      "Collect team member information",
      "Create consistent visual template",
      "Generate personalized content",
      "Schedule recurring team features"
    ]
  },
  {
    id: 11,
    title: "Daily Tip Series",
    description: "Quick, actionable tips for your audience",
    category: "Education",
    platforms: ["Twitter", "Instagram", "Facebook"],
    downloads: 1458,
    rating: 4.7,
    dateCreated: "2023-02-15",
    tags: ["tips", "daily", "advice"],
    premium: false,
    template: "💡 Daily [Industry] Tip: [Tip title]\n\n[Brief, actionable tip that provides immediate value]\n\nWant more tips? Follow us or visit [Link] #DailyTip #[Industry]Advice",
    animationPreview: "/assets/animations/daily-tips.gif",
    workflowSteps: [
      "Generate tip series with AI",
      "Create visual design system",
      "Schedule for consistency",
      "Track engagement patterns"
    ]
  },
  {
    id: 12,
    title: "Case Study Summary",
    description: "Showcase detailed client success stories",
    category: "Social Proof",
    platforms: ["LinkedIn", "Facebook"],
    downloads: 673,
    rating: 4.9,
    dateCreated: "2023-05-22",
    tags: ["case study", "success story", "results"],
    premium: true,
    template: "📈 Case Study: How [Company] achieved [Result]\n\nChallenge: [Brief description of their problem]\nSolution: [Brief description of your solution]\nResults: [Specific metrics and improvements]\n\nRead the full case study: [Link] #CustomerSuccess #CaseStudy",
    animationPreview: "/assets/animations/case-study.gif",
    workflowSteps: [
      "Document client results",
      "Structure problem-solution narrative",
      "Create visual result highlights",
      "Schedule with sales pipeline integration"
    ]
  },
  {
    id: 13,
    title: "Behind-the-Scenes Content",
    description: "Show your company culture and processes",
    category: "Company Culture",
    platforms: ["Instagram", "Facebook", "LinkedIn"],
    downloads: 936,
    rating: 4.6,
    dateCreated: "2023-04-05",
    tags: ["behind the scenes", "company culture", "team"],
    premium: false,
    template: "📸 Behind the scenes at [Company Name]!\n\n[Description of what's happening and why it matters]\n\n#BehindTheScenes #[Company]Culture #[Industry]Life",
    animationPreview: "/assets/animations/behind-scenes.gif",
    workflowSteps: [
      "Capture authentic moments",
      "Create content narrative",
      "Optimize for each platform",
      "Schedule with team approval workflow"
    ]
  },
  {
    id: 14,
    title: "Industry News Commentary",
    description: "Share your take on recent industry developments",
    category: "Thought Leadership",
    platforms: ["LinkedIn", "Twitter"],
    downloads: 582,
    rating: 4.5,
    dateCreated: "2023-06-18",
    tags: ["news", "commentary", "industry"],
    premium: true,
    template: "🔍 Industry Update: [News headline]\n\nWhat happened: [Brief summary of news]\n\nOur take: [Your company's perspective or analysis]\n\nWhat this means for you: [Impact on audience]\n\nSource: [Link] #[Industry]News",
    animationPreview: "/assets/animations/news-commentary.gif",
    workflowSteps: [
      "Monitor industry news sources",
      "Generate expert commentary",
      "Format for thought leadership",
      "Track engagement metrics"
    ]
  },
  {
    id: 15,
    title: "Product Comparison",
    description: "Compare your product with alternatives",
    category: "Product Marketing",
    platforms: ["LinkedIn", "Facebook"],
    downloads: 731,
    rating: 4.7,
    dateCreated: "2023-03-08",
    tags: ["comparison", "product", "features"],
    premium: true,
    template: "🔄 [Product] vs. Alternatives: What's right for you?\n\n✅ [Your product]: [Key benefits]\n⚠️ Others: [Limitations]\n\nWhy customers choose us: [Unique value proposition]\n\nLearn more: [Link] #ProductComparison",
    animationPreview: "/assets/animations/product-comparison.gif",
    workflowSteps: [
      "Conduct competitive analysis",
      "Create comparison matrix",
      "Generate fair but favorable content",
      "Schedule for product interest spikes"
    ]
  },
  {
    id: 16,
    title: "Holiday/Seasonal Promotion",
    description: "Special offers tied to holidays or seasons",
    category: "Promotions",
    platforms: ["Instagram", "Facebook", "Twitter", "LinkedIn"],
    downloads: 1243,
    rating: 4.8,
    dateCreated: "2023-05-01",
    tags: ["holiday", "seasonal", "promotion"],
    premium: false,
    template: "🎉 [Holiday] Special Offer!\n\nCelebrate [Holiday] with [Discount/Offer details]\n\nValid until: [End date]\nUse code: [Promo code]\n\nShop now: [Link] #[Holiday]Sale #SpecialOffer",
    animationPreview: "/assets/animations/holiday-promo.gif",
    workflowSteps: [
      "Create holiday theme",
      "Set up promotional details",
      "Develop platform-specific variations",
      "Schedule with reminder sequences"
    ]
  },
  {
    id: 17,
    title: "Poll/Question Post",
    description: "Engage audience with interactive polls",
    category: "Engagement",
    platforms: ["Twitter", "LinkedIn", "Instagram"],
    downloads: 1078,
    rating: 4.5,
    dateCreated: "2023-04-15",
    tags: ["poll", "question", "engagement"],
    premium: false,
    template: "🤔 [Engaging question related to your industry/audience interests]?\n\n• [Option A]\n• [Option B]\n• [Option C]\n• [Option D]\n\nWeigh in below! #[Industry]Poll",
    animationPreview: "/assets/animations/poll-engagement.gif",
    workflowSteps: [
      "Generate relevant questions",
      "Format for native platform polls",
      "Schedule for peak engagement times",
      "Plan follow-up content based on results"
    ]
  },
  {
    id: 18,
    title: "Industry Myth Debunked",
    description: "Correct common misconceptions in your field",
    category: "Education",
    platforms: ["LinkedIn", "Twitter", "Facebook"],
    downloads: 835,
    rating: 4.6,
    dateCreated: "2023-06-20",
    tags: ["myth", "debunked", "facts"],
    premium: false,
    template: "⚠️ Industry Myth: \"[Common misconception]\"\n\n✅ Reality: [Correct information with brief explanation]\n\nWhy it matters: [Impact of the misconception and benefit of knowing the truth]\n\nLearn more: [Link] #MythBusted #[Industry]Facts",
    animationPreview: "/assets/animations/myth-debunked.gif",
    workflowSteps: [
      "Identify common misconceptions",
      "Research factual information",
      "Create educational content series",
      "Schedule with engagement tracking"
    ]
  },
  {
    id: 19,
    title: "New Blog Post Promotion",
    description: "Share your latest blog content",
    category: "Content Marketing",
    platforms: ["LinkedIn", "Twitter", "Facebook"],
    downloads: 963,
    rating: 4.7,
    dateCreated: "2023-03-17",
    tags: ["blog", "article", "content"],
    premium: false,
    template: "📝 New on our blog: \"[Blog Post Title]\"\n\n[Brief summary or key takeaway]\n\nRead the full post to discover [benefit/what they'll learn]: [Link]\n\n#NewPost #[Industry]Blog",
    animationPreview: "/assets/animations/blog-promotion.gif",
    workflowSteps: [
      "Extract key points from blog",
      "Generate platform-specific promotions",
      "Schedule initial and follow-up posts",
      "Track click-through rates"
    ]
  },
  {
    id: 20,
    title: "Infographic Share",
    description: "Visual data presentations with key insights",
    category: "Visual Content",
    platforms: ["LinkedIn", "Pinterest", "Twitter", "Facebook"],
    downloads: 1124,
    rating: 4.8,
    dateCreated: "2023-05-05",
    tags: ["infographic", "data", "visual"],
    premium: true,
    template: "📊 [Infographic Title/Topic]\n\nKey insights:\n• [Data point 1]\n• [Data point 2]\n• [Data point 3]\n\nSee the full infographic: [Link] #Infographic #[Industry]Data",
    animationPreview: "/assets/animations/infographic-share.gif",
    workflowSteps: [
      "Compile data points",
      "Generate visual infographic",
      "Create platform-specific crops",
      "Schedule with data source attribution"
    ]
  },
  {
    id: 21,
    title: "User-Generated Content Spotlight",
    description: "Showcase content created by your customers",
    category: "Community",
    platforms: ["Instagram", "Facebook", "Twitter"],
    downloads: 842,
    rating: 4.6,
    dateCreated: "2023-04-25",
    tags: ["UGC", "customer content", "community"],
    premium: false,
    template: "💫 Customer Showcase: @[Customer Handle]\n\n[Brief description of their content and why you're featuring it]\n\n[Message encouraging others to share their experiences]\n\n#CustomerSpotlight #[BrandHashtag]",
    animationPreview: "/assets/animations/ugc-spotlight.gif",
    workflowSteps: [
      "Collect user permissions",
      "Format user content",
      "Add branded elements",
      "Schedule with user notification"
    ]
  },
  {
    id: 22,
    title: "Event Recap",
    description: "Summary of company events or industry conferences",
    category: "Event Marketing",
    platforms: ["LinkedIn", "Instagram", "Facebook"],
    downloads: 583,
    rating: 4.7,
    dateCreated: "2023-06-15",
    tags: ["event", "recap", "conference"],
    premium: false,
    template: "🎯 Event Recap: [Event Name]\n\nTop moments:\n• [Highlight 1]\n• [Highlight 2]\n• [Highlight 3]\n\nThank you to all who attended! [Optional: info about next event]\n\nMore photos: [Link] #[EventHashtag] #[Industry]Events",
    animationPreview: "/assets/animations/event-recap.gif",
    workflowSteps: [
      "Collect event highlights",
      "Create visual recap collage",
      "Generate summary content",
      "Schedule post-event sequence"
    ]
  },
  {
    id: 23,
    title: "Product Update Announcement",
    description: "Share news about product improvements or updates",
    category: "Product Marketing",
    platforms: ["LinkedIn", "Twitter", "Facebook"],
    downloads: 756,
    rating: 4.6,
    dateCreated: "2023-03-22",
    tags: ["update", "product", "features"],
    premium: false,
    template: "🆕 Product Update: [Version/Update Name]\n\nNew features:\n• [Feature 1]: [Brief benefit]\n• [Feature 2]: [Brief benefit]\n• [Feature 3]: [Brief benefit]\n\nUpdate now: [Link] #ProductUpdate #NewFeatures",
    animationPreview: "/assets/animations/product-update.gif",
    workflowSteps: [
      "Compile feature updates",
      "Create demonstration visuals",
      "Generate announcement copy",
      "Schedule with user notification integration"
    ]
  },
  {
    id: 24,
    title: "Industry Challenge Solution",
    description: "Present your solution to a common industry problem",
    category: "Thought Leadership",
    platforms: ["LinkedIn", "Twitter"],
    downloads: 692,
    rating: 4.8,
    dateCreated: "2023-05-12",
    tags: ["solution", "challenge", "problem-solving"],
    premium: true,
    template: "⚡ [Industry] Challenge: [Common problem]\n\nOur approach to solving it:\n1. [Step/element of solution]\n2. [Step/element of solution]\n3. [Step/element of solution]\n\nHow we've helped others: [Brief success example]\n\nLearn more: [Link] #[Industry]Solutions",
    animationPreview: "/assets/animations/challenge-solution.gif",
    workflowSteps: [
      "Identify industry pain points",
      "Develop solution framework",
      "Create process visualization",
      "Schedule with lead generation tracking"
    ]
  },
  {
    id: 25,
    title: "Job Opening Announcement",
    description: "Share new positions at your company",
    category: "Recruitment",
    platforms: ["LinkedIn", "Twitter", "Facebook"],
    downloads: 487,
    rating: 4.5,
    dateCreated: "2023-06-02",
    tags: ["job", "career", "hiring"],
    premium: false,
    template: "🔍 We're Hiring: [Job Title]\n\nAbout the role: [Brief description]\nLocation: [Location/Remote status]\nIdeal candidate: [Key qualifications/traits]\n\nApply now: [Link] #NowHiring #[Industry]Jobs #JoinOurTeam",
    animationPreview: "/assets/animations/job-opening.gif",
    workflowSteps: [
      "Format job requirements",
      "Create team culture highlights",
      "Generate platform-specific versions",
      "Schedule with application tracking"
    ]
  },
  {
    id: 26,
    title: "PDF Resource Promotion",
    description: "Promote downloadable guides, ebooks, or whitepapers",
    category: "Lead Generation",
    platforms: ["LinkedIn", "Twitter", "Facebook"],
    downloads: 876,
    rating: 4.7,
    dateCreated: "2023-04-10",
    tags: ["ebook", "whitepaper", "resource"],
    premium: true,
    template: "📚 Free [Resource Type]: \"[Title]\"\n\nLearn about:\n• [Topic 1]\n• [Topic 2]\n• [Topic 3]\n\nDownload now (no email required): [Link]\n\n#FreeResource #[Industry]Guide",
    animationPreview: "/assets/animations/pdf-resource.gif",
    workflowSteps: [
      "Extract resource highlights",
      "Create visual preview",
      "Generate lead magnet promotion",
      "Schedule multi-platform distribution"
    ]
  },
  {
    id: 27,
    title: "Weekly Challenge",
    description: "Engage audience with regular challenges",
    category: "Engagement",
    platforms: ["Instagram", "Twitter", "Facebook"],
    downloads: 934,
    rating: 4.6,
    dateCreated: "2023-03-05",
    tags: ["challenge", "weekly", "participation"],
    premium: false,
    template: "🏆 This Week's [Industry/Topic] Challenge:\n\n[Description of the challenge and how to participate]\n\nShare your results with #[ChallengeHashtag]!\n\nPrize/Benefit: [What participants get]\n\nDeadline: [Date] #WeeklyChallenge",
    animationPreview: "/assets/animations/weekly-challenge.gif",
    workflowSteps: [
      "Design challenge parameters",
      "Create participation instructions",
      "Set up response monitoring",
      "Schedule with follow-up engagement"
    ]
  },
  {
    id: 28,
    title: "Service Spotlight",
    description: "Highlight individual services your company offers",
    category: "Service Marketing",
    platforms: ["LinkedIn", "Facebook", "Instagram"],
    downloads: 645,
    rating: 4.5,
    dateCreated: "2023-05-28",
    tags: ["service", "spotlight", "offering"],
    premium: false,
    template: "✨ Service Spotlight: [Service Name]\n\nWhat it is: [Brief service description]\n\nIdeal for: [Target audience/use case]\n\nKey benefits:\n• [Benefit 1]\n• [Benefit 2]\n• [Benefit 3]\n\nLearn more: [Link] #[Service]Spotlight",
    animationPreview: "/assets/animations/service-spotlight.gif",
    workflowSteps: [
      "Identify service highlights",
      "Create visual service overview",
      "Generate benefit-focused content",
      "Schedule service rotation series"
    ]
  },
  {
    id: 29,
    title: "Milestone Celebration",
    description: "Celebrate company achievements and milestones",
    category: "Company News",
    platforms: ["LinkedIn", "Facebook", "Twitter", "Instagram"],
    downloads: 542,
    rating: 4.7,
    dateCreated: "2023-04-30",
    tags: ["milestone", "celebration", "achievement"],
    premium: false,
    template: "🎉 We're celebrating [Milestone]!\n\n[Brief reflection on the journey/achievement]\n\nThank you to our amazing [customers/partners/team] for making this possible!\n\n[Optional: special offer to celebrate] #[Company]Milestone #Celebration",
    animationPreview: "/assets/animations/milestone-celebration.gif",
    workflowSteps: [
      "Document achievement metrics",
      "Create celebration visuals",
      "Generate gratitude messaging",
      "Schedule announcement with follow-ups"
    ]
  },
  {
    id: 30,
    title: "Expert Interview Highlights",
    description: "Share insights from interviews with industry experts",
    category: "Thought Leadership",
    platforms: ["LinkedIn", "Twitter", "Facebook"],
    downloads: 687,
    rating: 4.8,
    dateCreated: "2023-06-08",
    tags: ["interview", "expert", "insights"],
    premium: true,
    template: "🎙️ Expert Insights: [Expert Name], [Title/Company]\n\nOn [topic]: \"[Notable quote from interview]\"\n\nKey takeaways:\n• [Insight 1]\n• [Insight 2]\n• [Insight 3]\n\nFull interview: [Link] #ExpertInterview #[Industry]Insights",
    animationPreview: "/assets/animations/expert-interview.gif",
    workflowSteps: [
      "Extract interview highlights",
      "Generate quote graphics",
      "Create multi-format content pieces",
      "Schedule distribution sequence"
    ]
  },
  {
    id: 31,
    title: "Data Visualization",
    description: "Share interesting data points with visual charts",
    category: "Research",
    platforms: ["LinkedIn", "Twitter", "Instagram"],
    downloads: 783,
    rating: 4.6,
    dateCreated: "2023-03-20",
    tags: ["data", "visualization", "statistics"],
    premium: true,
    template: "📈 [Data Topic] Visualized:\n\n[Brief insight about what the data shows]\n\nSource: [Data source]\nMethodology: [Brief methodology note]\n\nMore insights: [Link] #DataViz #[Industry]Stats",
    animationPreview: "/assets/animations/data-visualization.gif",
    workflowSteps: [
      "Clean and analyze data",
      "Generate visual charts",
      "Create key insight callouts",
      "Schedule with source attribution"
    ]
  },
  {
    id: 32,
    title: "Partnership Announcement",
    description: "Announce new business partnerships or collaborations",
    category: "Company News",
    platforms: ["LinkedIn", "Twitter", "Facebook"],
    downloads: 512,
    rating: 4.7,
    dateCreated: "2023-05-15",
    tags: ["partnership", "collaboration", "announcement"],
    premium: false,
    template: "🤝 Exciting News: [Company] + [Partner Company]\n\nWe're thrilled to announce our partnership with [Partner] to [brief description of collaboration purpose].\n\nWhat this means for you: [Benefits to customers/audience]\n\nLearn more: [Link] #Partnership #[Industry]Collaboration",
    animationPreview: "/assets/animations/partnership-announce.gif",
    workflowSteps: [
      "Coordinate with partner marketing",
      "Create co-branded materials",
      "Generate announcement copy",
      "Schedule synchronized release"
    ]
  },
  {
    id: 33,
    title: "Problem-Solution Series",
    description: "Highlight common problems and your solutions",
    category: "Product Marketing",
    platforms: ["LinkedIn", "Facebook", "Instagram"],
    downloads: 865,
    rating: 4.6,
    dateCreated: "2023-04-18",
    tags: ["problem", "solution", "pain points"],
    premium: false,
    template: "❓ Common Problem: [Problem statement]\n\n😩 Impact: [Brief description of the negative effects]\n\n✅ Our Solution: [How your product/service solves it]\n\n🔍 See how it works: [Link] #ProblemSolved #[Industry]Solutions",
    animationPreview: "/assets/animations/problem-solution.gif",
    workflowSteps: [
      "Identify customer pain points",
      "Create before/after scenario",
      "Generate solution demonstration",
      "Schedule with conversion tracking"
    ]
  },
  {
    id: 34,
    title: "Industry Award/Recognition",
    description: "Share company awards and recognition",
    category: "Company News",
    platforms: ["LinkedIn", "Twitter", "Facebook", "Instagram"],
    downloads: 435,
    rating: 4.9,
    dateCreated: "2023-06-25",
    tags: ["award", "recognition", "achievement"],
    premium: false,
    template: "🏆 Honored to announce: [Company] has been recognized as [Award/Recognition]!\n\n[Brief statement about what this means and thanks]\n\nThis recognition reflects our commitment to [relevant value/mission]\n\n#[Award]Winner #[Industry]Excellence",
    animationPreview: "/assets/animations/award-recognition.gif",
    workflowSteps: [
      "Document award details",
      "Create celebration visuals",
      "Generate gratitude messaging",
      "Schedule announcement series"
    ]
  },
  {
    id: 35,
    title: "Seasonal Content Calendar",
    description: "Themed content ideas for different seasons",
    category: "Content Planning",
    platforms: ["All Platforms"],
    downloads: 1542,
    rating: 4.8,
    dateCreated: "2023-04-02",
    tags: ["calendar", "seasonal", "planning"],
    premium: true,
    template: "🗓️ [Season] Content Calendar for [Industry]\n\nKey dates and content themes:\n• [Date/Event 1]: [Content idea]\n• [Date/Event 2]: [Content idea]\n• [Date/Event 3]: [Content idea]\n\nFull calendar: [Link] #ContentPlanning #[Season]Content",
    animationPreview: "/assets/animations/seasonal-calendar.gif",
    workflowSteps: [
      "Research seasonal events",
      "Create themed content concepts",
      "Generate campaign structure",
      "Schedule with automated publishing"
    ]
  },
  {
    id: 36,
    title: "Quick Tip Carousel",
    description: "Multiple tips in swipeable carousel format",
    category: "Education",
    platforms: ["Instagram", "LinkedIn", "Facebook"],
    downloads: 1236,
    rating: 4.7,
    dateCreated: "2023-03-12",
    tags: ["tips", "carousel", "swipeable"],
    premium: false,
    template: "👆 Swipe for [Number] Quick Tips on [Topic]!\n\n[Brief introduction to why these tips are valuable]\n\nWhich tip is your favorite? Let us know in the comments!\n\n#QuickTips #[Industry]Advice #Swipe",
    animationPreview: "/assets/animations/tip-carousel.gif",
    workflowSteps: [
      "Compile related tip series",
      "Create visual slide templates",
      "Generate cohesive carousel",
      "Schedule with engagement prompts"
    ]
  },
  {
    id: 37,
    title: "Office Tour",
    description: "Virtual tour of your workspace",
    category: "Company Culture",
    platforms: ["Instagram", "Facebook", "LinkedIn"],
    downloads: 378,
    rating: 4.5,
    dateCreated: "2023-05-08",
    tags: ["office", "tour", "workspace"],
    premium: false,
    template: "🏢 Welcome to our [Location] office!\n\n[Brief description of what makes your workspace special]\n\nInterested in joining our team? Check out our open positions: [Link]\n\n#OfficeLife #[Company]Culture #WorkplaceWednesday",
    animationPreview: "/assets/animations/office-tour.gif",
    workflowSteps: [
      "Capture office highlights",
      "Create visual tour sequence",
      "Generate descriptive content",
      "Schedule with recruitment messaging"
    ]
  },
  {
    id: 38,
    title: "Newsletter Signup Promotion",
    description: "Encourage newsletter subscriptions",
    category: "Lead Generation",
    platforms: ["LinkedIn", "Twitter", "Facebook", "Instagram"],
    downloads: 654,
    rating: 4.5,
    dateCreated: "2023-06-12",
    tags: ["newsletter", "subscription", "email"],
    premium: false,
    template: "📬 Never miss an update!\n\nSubscribe to our [frequency] newsletter to get:\n• [Benefit 1]\n• [Benefit 2]\n• [Benefit 3]\n\nJoin [number] subscribers: [Signup link]\n\n#StayInformed #[Industry]Newsletter",
    animationPreview: "/assets/animations/newsletter-signup.gif",
    workflowSteps: [
      "Highlight newsletter benefits",
      "Create subscription form",
      "Generate promotional content",
      "Schedule with conversion tracking"
    ]
  },
  {
    id: 39,
    title: "Product Demonstration",
    description: "Show your product in action",
    category: "Product Marketing",
    platforms: ["LinkedIn", "Instagram", "Facebook"],
    downloads: 947,
    rating: 4.8,
    dateCreated: "2023-04-08",
    tags: ["demo", "product", "how it works"],
    premium: true,
    template: "👀 See [Product/Feature] in action!\n\n[Brief description of what the demo shows and the key value it demonstrates]\n\nWant to see more? [Call to action]: [Link]\n\n#ProductDemo #HowItWorks #[Industry]Solutions",
    animationPreview: "/assets/animations/product-demo.gif",
    workflowSteps: [
      "Create demonstration scenario",
      "Record feature walkthrough",
      "Add explanatory captions",
      "Schedule with product page links"
    ]
  },
  {
    id: 40,
    title: "Customer Question Series",
    description: "Answer real questions from customers",
    category: "Customer Support",
    platforms: ["Twitter", "Facebook", "Instagram"],
    downloads: 724,
    rating: 4.6,
    dateCreated: "2023-03-28",
    tags: ["questions", "answers", "customer support"],
    premium: false,
    template: "❓ You Asked: \"[Customer question]\"\n\n💬 Our Answer: [Detailed, helpful response that showcases expertise]\n\nHave a question? Ask us in the comments or at [support handle/link] #YouAskedWeAnswered #[Industry]Help",
    animationPreview: "/assets/animations/customer-questions.gif",
    workflowSteps: [
      "Collect customer questions",
      "Research comprehensive answers",
      "Create Q&A format visuals",
      "Schedule regular series"
    ]
  },
  {
    id: 41,
    title: "Testimonial Video Share",
    description: "Share customer video testimonials",
    category: "Social Proof",
    platforms: ["LinkedIn", "Facebook", "Instagram"],
    downloads: 683,
    rating: 4.8,
    dateCreated: "2023-05-25",
    tags: ["testimonial", "video", "customer"],
    premium: true,
    template: "📹 Hear from [Customer Name] at [Company]:\n\n\"[Short quote from the testimonial]\"\n\nWatch the full testimonial to learn how [Your Product/Service] helped them [achieve result]: [Link]\n\n#CustomerStories #[Industry]Testimonial",
    animationPreview: "/assets/animations/testimonial-video.gif",
    workflowSteps: [
      "Edit customer video",
      "Create caption overlay",
      "Generate platform-specific formats",
      "Schedule with social proof sequence"
    ]
  },
  {
    id: 42,
    title: "Industry Trend Prediction",
    description: "Share insights about future industry trends",
    category: "Thought Leadership",
    platforms: ["LinkedIn", "Twitter"],
    downloads: 562,
    rating: 4.7,
    dateCreated: "2023-06-28",
    tags: ["trends", "predictions", "future"],
    premium: true,
    template: "🔮 [Industry] Trend Prediction: [Trend Title]\n\nWe're seeing [observation about current situation]\n\nWe predict: [Your prediction and reasoning]\n\nHow to prepare: [Actionable advice]\n\nMore insights: [Link] #FutureTrends #[Industry]Predictions",
    animationPreview: "/assets/animations/trend-prediction.gif",
    workflowSteps: [
      "Research market signals",
      "Generate forecast content",
      "Create visual trend graphics",
      "Schedule with thought leadership positioning"
    ]
  },
  {
    id: 43,
    title: "Before & After Results",
    description: "Show transformation with your product/service",
    category: "Social Proof",
    platforms: ["Instagram", "Facebook", "LinkedIn"],
    downloads: 908,
    rating: 4.9,
    dateCreated: "2023-04-22",
    tags: ["before after", "results", "transformation"],
    premium: false,
    template: "👀 Before & After: [Brief description of transformation]\n\nBefore: [Description of initial state/problem]\nAfter: [Description of improved state/solution]\n\nHow we helped: [Brief explanation of your role in the transformation]\n\nSimilar results await: [Link] #BeforeAndAfter #[Industry]Results",
    animationPreview: "/assets/animations/before-after.gif",
    workflowSteps: [
      "Document result measurements",
      "Create side-by-side comparisons",
      "Generate results narrative",
      "Schedule with case study links"
    ]
  },
  {
    id: 44,
    title: "Company Anniversary",
    description: "Celebrate company founding anniversary",
    category: "Company News",
    platforms: ["LinkedIn", "Facebook", "Instagram", "Twitter"],
    downloads: 324,
    rating: 4.7,
    dateCreated: "2023-03-10",
    tags: ["anniversary", "celebration", "milestone"],
    premium: false,
    template: "🎂 Celebrating [Number] Years of [Company Name]!\n\nFrom [brief origin story] to [current achievement], it's been an amazing journey.\n\nThank you to our [clients/customers/partners/team] for being part of our story.\n\n[Optional: special anniversary offer] #[Company]Anniversary #[Number]Years",
    animationPreview: "/assets/animations/company-anniversary.gif",
    workflowSteps: [
      "Compile company timeline",
      "Create celebration visuals",
      "Generate gratitude messaging",
      "Schedule anniversary campaign"
    ]
  },
  {
    id: 45,
    title: "Listicle Content",
    description: "Numbered lists of tips, ideas, or resources",
    category: "Education",
    platforms: ["LinkedIn", "Twitter", "Facebook"],
    downloads: 1124,
    rating: 4.6,
    dateCreated: "2023-05-03",
    tags: ["list", "tips", "listicle"],
    premium: false,
    template: "📋 [Number] [Type of Items] for [Desired Outcome/Situation]\n\n1️⃣ [Item 1]: [Brief description]\n2️⃣ [Item 2]: [Brief description]\n3️⃣ [Item 3]: [Brief description]\n...\n\nSave this post for future reference!\n\nFull list: [Link] #[Industry]Tips",
    animationPreview: "/assets/animations/listicle-content.gif",
    workflowSteps: [
      "Research list items",
      "Create numbered graphics",
      "Generate concise descriptions",
      "Schedule with save/share prompts"
    ]
  },
  {
    id: 46,
    title: "Free Resource/Tool Promotion",
    description: "Share free tools or resources you offer",
    category: "Lead Generation",
    platforms: ["LinkedIn", "Twitter", "Facebook"],
    downloads: 843,
    rating: 4.7,
    dateCreated: "2023-06-05",
    tags: ["free", "tool", "resource"],
    premium: false,
    template: "🔧 Free [Resource/Tool] Alert!\n\nWe've created a [description of resource] to help you [benefit].\n\nHow to use it:\n1. [Step 1]\n2. [Step 2]\n3. [Step 3]\n\nGet it now: [Link] #FreeTool #[Industry]Resources",
    animationPreview: "/assets/animations/free-resource.gif",
    workflowSteps: [
      "Create resource access flow",
      "Develop visual tutorial",
      "Generate promotional content",
      "Schedule with email capture integration"
    ]
  },
  {
    id: 47,
    title: "Customer Review Highlight",
    description: "Showcase positive reviews and ratings",
    category: "Social Proof",
    platforms: ["Facebook", "Instagram", "LinkedIn"],
    downloads: 756,
    rating: 4.8,
    dateCreated: "2023-04-05",
    tags: ["review", "rating", "testimonial"],
    premium: false,
    template: "⭐⭐⭐⭐⭐ Customer Review\n\n\"[Review text]\"\n- [Customer name/identifier], [Location/Company]\n\nThank you for your kind words! We're committed to [relevant value proposition].\n\nSee more reviews: [Link] #CustomerReviews #[Industry]Excellence",
    animationPreview: "/assets/animations/review-highlight.gif",
    workflowSteps: [
      "Format verified reviews",
      "Create consistent visual templates",
      "Generate gratitude responses",
      "Schedule regular spotlight series"
    ]
  },
  {
    id: 48,
    title: "Process Breakdown",
    description: "Explain your business processes step by step",
    category: "Education",
    platforms: ["LinkedIn", "Instagram", "Facebook"],
    downloads: 632,
    rating: 4.6,
    dateCreated: "2023-05-17",
    tags: ["process", "how we work", "behind the scenes"],
    premium: true,
    template: "⚙️ Our [Process Name] Process: How We [Outcome]\n\nStep 1: [Brief description]\nStep 2: [Brief description]\nStep 3: [Brief description]\n...\n\nWhy this matters for you: [Client benefit]\n\nLearn more: [Link] #OurProcess #[Industry]Excellence",
    animationPreview: "/assets/animations/process-breakdown.gif",
    workflowSteps: [
      "Document workflow steps",
      "Create process flow diagram",
      "Generate step explanations",
      "Schedule with transparency messaging"
    ]
  },
  {
    id: 49,
    title: "A Day in the Life",
    description: "Show what a typical day looks like at your company",
    category: "Company Culture",
    platforms: ["Instagram", "Facebook", "LinkedIn"],
    downloads: 489,
    rating: 4.5,
    dateCreated: "2023-03-25",
    tags: ["day in the life", "behind the scenes", "team"],
    premium: false,
    template: "⏰ A Day in the Life: [Role/Department]\n\n[Morning routine/tasks]\n[Midday activities/meetings]\n[Afternoon responsibilities]\n[End of day wrap-up]\n\nInterested in joining our team? [CTA]: [Link] #DayInTheLife #[Company]Culture",
    animationPreview: "/assets/animations/day-in-life.gif",
    workflowSteps: [
      "Document typical daily schedule",
      "Create time-based visual sequence",
      "Generate authentic narrative",
      "Schedule with recruiting integration"
    ]
  },
  {
    id: 50,
    title: "Industry Glossary Terms",
    description: "Explain complex industry terminology",
    category: "Education",
    platforms: ["LinkedIn", "Twitter", "Facebook"],
    downloads: 567,
    rating: 4.6,
    dateCreated: "2023-06-22",
    tags: ["glossary", "terms", "definitions"],
    premium: false,
    template: "📚 [Industry] Term Explained: \"[Term]\"\n\n🔍 Definition: [Clear, concise definition]\n\n💡 Why it matters: [Brief explanation of relevance]\n\n🔄 Related terms: [Other terms in your glossary]\n\nFull glossary: [Link] #[Industry]Terms #Glossary",
    animationPreview: "/assets/animations/glossary-terms.gif",
    workflowSteps: [
      "Research terminology definitions",
      "Create educational graphics",
      "Generate simplified explanations",
      "Schedule recurring term series"
    ]
  },
  {
    id: 51,
    title: "Interactive Quiz/Trivia",
    description: "Engage audience with industry-related questions",
    category: "Engagement",
    platforms: ["Instagram", "Twitter", "Facebook"],
    downloads: 752,
    rating: 4.7,
    dateCreated: "2023-04-28",
    tags: ["quiz", "trivia", "interactive"],
    premium: false,
    template: "🧠 [Industry] Trivia Time!\n\nQuestion: [Interesting industry question]\n\nA. [Option A]\nB. [Option B]\nC. [Option C]\nD. [Option D]\n\nAnswer in the comments! We'll share the correct answer tomorrow. #[Industry]Trivia #QuizTime",
    animationPreview: "/assets/animations/interactive-quiz.gif",
    workflowSteps: [
      "Research interesting facts",
      "Create quiz format graphics",
      "Generate question sequences",
      "Schedule with answer follow-ups"
    ]
  },
  {
    id: 52,
    title: "Industry Resource Roundup",
    description: "Curate useful industry resources and tools",
    category: "Education",
    platforms: ["LinkedIn", "Twitter", "Facebook"],
    downloads: 687,
    rating: 4.6,
    dateCreated: "2023-03-18",
    tags: ["resources", "roundup", "tools"],
    premium: true,
    template: "🧰 [Number] Essential [Industry] Resources\n\n1. [Resource name]: [Brief description and link]\n2. [Resource name]: [Brief description and link]\n3. [Resource name]: [Brief description and link]\n...\n\nSave this post for future reference! #[Industry]Resources #UsefulTools",
    animationPreview: "/assets/animations/resource-roundup.gif",
    workflowSteps: [
      "Research quality resources",
      "Create resource directory",
      "Generate descriptive content",
      "Schedule with resource links"
    ]
  },
  {
    id: 53,
    title: "Feature vs. Feature Comparison",
    description: "Compare different features or products",
    category: "Product Marketing",
    platforms: ["LinkedIn", "Facebook"],
    downloads: 542,
    rating: 4.5,
    dateCreated: "2023-05-20",
    tags: ["comparison", "features", "decision guide"],
    premium: true,
    template: "⚖️ [Feature A] vs. [Feature B]: Which is right for you?\n\n[Feature A]:\n• [Benefit/characteristic]\n• [Benefit/characteristic]\n• [Use case]\n\n[Feature B]:\n• [Benefit/characteristic]\n• [Benefit/characteristic]\n• [Use case]\n\nNeed help deciding? [Link] #FeatureComparison",
    animationPreview: "/assets/animations/feature-comparison.gif",
    workflowSteps: [
      "Create comparison matrix",
      "Generate use case scenarios",
      "Create visual comparison table",
      "Schedule with decision guide links"
    ]
  },
  {
    id: 54,
    title: "User Tip Series",
    description: "Share tips from users for users",
    category: "Community",
    platforms: ["Twitter", "Facebook", "LinkedIn"],
    downloads: 612,
    rating: 4.6,
    dateCreated: "2023-06-15",
    tags: ["tips", "users", "community"],
    premium: false,
    template: "💡 User Tip from @[Username]:\n\n\"[Tip content from user]\"\n\nOur take: [Your brief addition or context]\n\nHave a tip to share? Comment below or tag us with #[YourProduct]Tip #UserTips #[Industry]Community",
    animationPreview: "/assets/animations/user-tips.gif",
    workflowSteps: [
      "Collect user permissions",
      "Format user contributions",
      "Add branded elements",
      "Schedule with community engagement"
    ]
  },
  {
    id: 55,
    title: "Productivity Hack",
    description: "Share efficiency tips related to your industry",
    category: "Education",
    platforms: ["LinkedIn", "Twitter", "Instagram"],
    downloads: 897,
    rating: 4.7,
    dateCreated: "2023-04-15",
    tags: ["productivity", "hack", "efficiency"],
    premium: false,
    template: "⚡ [Industry] Productivity Hack #[Number]:\n\n[Brief description of the hack/tip]\n\nTime saved: [Estimated time/efficiency gain]\nDifficulty: [Easy/Medium/Hard]\n\nTry it and let us know your results! #ProductivityHack #[Industry]Tips",
    animationPreview: "/assets/animations/productivity-hack.gif",
    workflowSteps: [
      "Research efficiency techniques",
      "Create step-by-step guide",
      "Generate quick-win content",
      "Schedule with engagement tracking"
    ]
  }
];