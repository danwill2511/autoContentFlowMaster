
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// Check if OpenAI API key is set
const isOpenAIConfigured = !!process.env.OPENAI_API_KEY;

interface ContentGenerationOptions {
  contentType: string;
  contentTone: string;
  topics: string;
  platforms: string[];
  length?: string;
}

// Generate content based on user specifications
export async function generateContent(options: ContentGenerationOptions): Promise<string> {
  if (!isOpenAIConfigured) {
    return "OpenAI API key is not configured. Please add your API key to continue generating content.";
  }

  const { contentType, contentTone, topics, platforms, length = "medium" } = options;
  
  // Format platforms for better prompt
  const platformsList = platforms.join(", ");
  
  // Determine length constraints
  let wordCount = 300; // Default medium length
  if (length === "short") wordCount = 150;
  if (length === "long") wordCount = 600;
  
  try {
    // The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional content creator who specializes in creating engaging digital content."
        },
        {
          role: "user",
          content: `Create ${contentType} content with a ${contentTone} tone about ${topics}. 
          This content will be adapted for the following platforms: ${platformsList}.
          Make it approximately ${wordCount} words.
          The content should be engaging, informative, and tailored to trending interests.
          Format with appropriate paragraphs, headings, and structure.`
        }
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    return response.choices[0].message.content?.trim() || 
      "Could not generate content. Please try again with different parameters.";
  } catch (error) {
    console.error("Error generating content with OpenAI:", error);
    return "An error occurred while generating content. Please try again later.";
  }
}

// Adapt general content for specific platforms
export async function generatePlatformSpecificContent(
  content: string,
  platform: string
): Promise<string> {
  if (!isOpenAIConfigured) {
    return "OpenAI API key is not configured. Please add your API key to continue generating content.";
  }

  // Platform-specific formatting instructions
  const platformInstructions: Record<string, string> = {
    "LinkedIn": "professional, business-oriented with appropriate hashtags",
    "Twitter": "concise (under 280 characters), engaging, with hashtags",
    "Facebook": "conversational, engaging, with a call to action",
    "Pinterest": "descriptive, visual-oriented, with keywords for SEO",
    "YouTube": "engaging video description with timestamps, keywords, and call to action",
    "Instagram": "visual, concise, with popular hashtags and emoji"
  };

  const instruction = platformInstructions[platform] || "appropriate for social media";

  try {
    // The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a social media content specialist who adapts content for different platforms."
        },
        {
          role: "user",
          content: `Adapt the following content for ${platform}. Make it ${instruction}:
          
          ${content}
          
          The adapted content should maintain the core message but be optimized for ${platform}'s format and audience.`
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0].message.content?.trim() || 
      `Could not adapt content for ${platform}. Please try again.`;
  } catch (error) {
    console.error(`Error adapting content for ${platform}:`, error);
    return `An error occurred while adapting content for ${platform}. Please try again later.`;
  }
}

// Find trending topics in a specific category
export async function findTrendingTopics(category: string): Promise<string[]> {
  if (!isOpenAIConfigured) {
    return ["OpenAI API key is not configured"];
  }

  try {
    // The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a trend researcher who identifies current popular topics."
        },
        {
          role: "user",
          content: `What are the top 5 trending topics in ${category} right now? Provide them as a comma-separated list without numbering or additional context.`
        }
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    const topicsText = response.choices[0].message.content?.trim() || "";
    return topicsText.split(",").map((topic: string) => topic.trim());
  } catch (error) {
    console.error("Error finding trending topics:", error);
    return ["Failed to fetch trending topics"];
  }
}
