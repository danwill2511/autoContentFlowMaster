import OpenAI from "openai";
import { logger, monitorError } from "./logger";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

const isOpenAIConfigured = !!process.env.OPENAI_API_KEY;

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 2000; // ms
const MAX_RETRY_DELAY = 15000; // ms
const BACKOFF_FACTOR = 1.5;

interface RetryStats {
  attempts: number;
  lastError: Error | null;
  totalDelay: number;
}

const retryStats: Record<string, RetryStats> = {};

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: any) => boolean;
}

async function retryWithExponentialBackoff<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = MAX_RETRIES,
    initialDelay = INITIAL_RETRY_DELAY,
    maxDelay = MAX_RETRY_DELAY,
    shouldRetry = (error) => {
      // Retry on rate limits, temporary OpenAI issues, or network errors
      if (error.response?.status) {
        return [429, 500, 502, 503, 504].includes(error.response.status);
      }
      return error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT';
    }
  } = options;

  let lastError: any;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      attempt++;

      if (attempt > maxRetries || !shouldRetry(error)) {
        monitorError(error, {
          service: 'openai',
          attempt,
          maxRetries,
        });
        throw lastError;
      }

      const delay = Math.min(initialDelay * Math.pow(2, attempt - 1), maxDelay);
      console.log(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

export async function findTrendingTopics(category: string, region = "global"): Promise<{
  topics: string[];
  insights: string;
}> {
  if (!isOpenAIConfigured) {
    throw new Error("OpenAI API key not configured");
  }

  const operation = async () => {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a trend analysis expert who identifies current trends and provides insights."
        },
        {
          role: "user",
          content: `Analyze current trends in ${category} for ${region}. Provide:
          1. Top 5 trending topics
          2. Brief insight into why these are trending
          Format as JSON with 'topics' array and 'insights' string.`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000, // Increased max tokens for more detailed responses
      temperature: 0.7,
    });

    const result = z.object({
      topics: z.array(z.string()),
      insights: z.string()
    }).parse(JSON.parse(response.choices[0].message.content || "{}"));

    return result;
  };

  return retryWithExponentialBackoff(operation);
}

// Define content generation options interface
interface ContentGenerationOptions {
  contentType: string;
  contentTone: string;
  topics: string;
  platforms: string[];
  length?: 'short' | 'medium' | 'long';
}

export async function generateContent(options: ContentGenerationOptions): Promise<string> {
  if (!isOpenAIConfigured) {
    throw new Error("OpenAI API key not configured");
  }

  const { contentType, contentTone, topics, platforms, length = "medium" } = options;

  const wordCount = {
    short: 150,
    medium: 300,
    long: 600
  }[length] || 300;

  const operation = async () => {
    try {
      const trends = await findTrendingTopics(topics);

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a professional content creator specializing in multi-platform content. Create high-quality, engaging, and well-structured content that follows best practices for the target platforms."
          },
          {
            role: "user",
            content: `Create ${contentType} content with a ${contentTone} tone about ${topics}.
            Consider these trending subtopics: ${trends.topics.join(", ")}
            Target platforms: ${platforms.join(", ")}
            Length: ~${wordCount} words
            
            Requirements:
            - Make it engaging and incorporate current trends naturally
            - Format with clear structure and SEO-friendly elements
            - Include appropriate hashtags where relevant
            - Add a compelling hook at the beginning
            - Include a clear call-to-action
            - Use appropriate formatting for different sections (headers, bullet points, etc.)
            - Make it shareable and optimized for social media engagement`
          }
        ],
        max_tokens: 1500, // Increased for more detailed content
        temperature: 0.7,
      });

      return response.choices[0].message.content?.trim() || 
        "Could not generate content. Please try again with different parameters.";
    } catch (error) {
      logger.error("Error generating content:", error);
      // If trend analysis fails, attempt to generate content without trends
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("trending topics")) {
        logger.info("Retrying content generation without trend analysis");
        
        const fallbackResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a professional content creator specializing in multi-platform content."
            },
            {
              role: "user",
              content: `Create ${contentType} content with a ${contentTone} tone about ${topics}.
              Target platforms: ${platforms.join(", ")}
              Length: ~${wordCount} words
              Make it engaging and well-structured, with SEO-friendly elements.`
            }
          ],
          max_tokens: 1200,
          temperature: 0.7,
        });
        
        return fallbackResponse.choices[0].message.content?.trim() || 
          "Could not generate content. Please try again with different parameters.";
      }
      
      throw error; // Re-throw if it's not a trend analysis error
    }
  };

  return retryWithExponentialBackoff(operation);
}

interface PlatformFormat {
  maxLength: number;
  hashtags: boolean;
  format: string;
  sections: string[];
  formatContent: (content: string, options?: any) => string;
}

const platformFormatting: Record<string, PlatformFormat> = {
  LinkedIn: {
    maxLength: 3000,
    hashtags: true,
    format: "professional",
    sections: ["hook", "context", "value", "cta"],
    formatContent: (content: string, options?: any) => {
      // Format for professional audience
      let formatted = content.trim();
      
      // Add line breaks between paragraphs
      formatted = formatted.replace(/\n/g, '\n\n');
      
      // Add relevant emojis for professional content
      formatted = formatted.replace(/^(.*?)$/m, '🎯 $1');
      
      // Add hashtags if enabled
      if (options?.hashtags) {
        const hashtags = generateProfessionalHashtags(content);
        formatted += `\n\n${hashtags}`;
      }
      
      return truncateWithEllipsis(formatted, 3000);
    }
  },
  Twitter: {
    maxLength: 280,
    hashtags: true,
    format: "concise",
    sections: ["hook", "content", "cta"],
    formatContent: (content: string, options?: any) => {
      // Format for Twitter's brief style
      let formatted = content.trim();
      
      // Remove excessive line breaks
      formatted = formatted.replace(/\n\s*\n/g, '\n');
      
      // Add hashtags if enabled
      if (options?.hashtags) {
        const hashtags = generateTrendingHashtags(content);
        const remainingLength = 280 - formatted.length - 2;
        if (remainingLength > 0) {
          formatted += `\n${hashtags.slice(0, remainingLength)}`;
        }
      }
      
      return truncateWithEllipsis(formatted, 280);
    }
  },
  Facebook: {
    maxLength: 5000,
    hashtags: false,
    format: "conversational",
    sections: ["story", "content", "engagement"],
    formatContent: (content: string, options?: any) => {
      // Format for Facebook's conversational style
      let formatted = content.trim();
      
      // Add eye-catching emoji at the start
      formatted = `👋 ${formatted}`;
      
      // Add line breaks for readability
      formatted = formatted.replace(/\. /g, '.\n\n');
      
      // Add engagement question at the end
      formatted += '\n\nWhat do you think? Let me know in the comments! 💭';
      
      return truncateWithEllipsis(formatted, 5000);
    }
  },
  Pinterest: {
    maxLength: 500,
    hashtags: true,
    format: "visual",
    sections: ["description", "keywords", "link"],
    formatContent: (content: string, options?: any) => {
      // Format for Pinterest's visual focus
      let formatted = content.trim();
      
      // Add relevant emojis
      formatted = formatted.replace(/^/m, '📌 ');
      
      // Add hashtags if enabled
      if (options?.hashtags) {
        const hashtags = generateVisualHashtags(content);
        formatted += `\n\n${hashtags}`;
      }
      
      return truncateWithEllipsis(formatted, 500);
    }
  },
  YouTube: {
    maxLength: 5000,
    hashtags: true,
    format: "detailed",
    sections: ["title", "description", "timestamps", "links"],
    formatContent: (content: string, options?: any) => {
      // Format for YouTube's detailed description
      let formatted = content.trim();
      
      // Add video structure
      formatted = `🎥 ${formatted}\n\n` +
        '⏱️ Timestamps:\n' +
        '00:00 - Introduction\n' +
        '00:30 - Main Content\n' +
        '05:00 - Summary\n\n' +
        '🔗 Important Links:\n' +
        '• Website: [Your Website]\n' +
        '• Social Media: [Links]\n\n' +
        '👋 Connect With Me:\n' +
        '[Social Media Links]\n\n' +
        '#YouTubeContent #Creator';
      
      return truncateWithEllipsis(formatted, 5000);
    }
  },
  Instagram: {
    maxLength: 2200,
    hashtags: true,
    format: "visual",
    sections: ["caption", "hashtags"],
    formatContent: (content: string, options?: any) => {
      // Format for Instagram's visual style
      let formatted = content.trim();
      
      // Add engaging emoji and line breaks
      formatted = `✨ ${formatted}`;
      formatted = formatted.replace(/\. /g, '.\n\n');
      
      // Add hashtags if enabled
      if (options?.hashtags) {
        const hashtags = generateVisualHashtags(content);
        formatted += '\n\n.\n.\n.\n' + hashtags;
      }
      
      return truncateWithEllipsis(formatted, 2200);
    }
  }
};

// Helper functions for formatting
function truncateWithEllipsis(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

function generateProfessionalHashtags(content: string): string {
  const words = content.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3)
    .map(word => word.replace(/[^a-z0-9]/g, ''));
  
  const professionalTags = ['innovation', 'leadership', 'business', 'professional'];
  const uniqueWords = Array.from(new Set([...words, ...professionalTags]));
  return uniqueWords.slice(0, 5).map(word => `#${word}`).join(' ');
}

function generateTrendingHashtags(content: string): string {
  const words = content.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3)
    .map(word => word.replace(/[^a-z0-9]/g, ''));
  
  return words.slice(0, 3).map(word => `#${word}`).join(' ');
}

function generateVisualHashtags(content: string): string {
  const words = content.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3)
    .map(word => word.replace(/[^a-z0-9]/g, ''));
  
  const visualTags = ['photooftheday', 'instagood', 'picoftheday'];
  const uniqueWords = Array.from(new Set([...words, ...visualTags]));
  return uniqueWords.slice(0, 10).map(word => `#${word}`).join(' ');
}

export async function generatePlatformSpecificContent(
  content: string,
  platform: string
): Promise<string> {
  if (!isOpenAIConfigured) {
    throw new Error("OpenAI API key not configured");
  }

  const platformConfig = platformFormatting[platform as keyof typeof platformFormatting] || {
    maxLength: 1000,
    hashtags: true,
    format: "standard",
    sections: ["content"]
  };

  const operation = async () => {
    // First try using the platform-specific formatter
    try {
      if (platformFormatting[platform]) {
        const formattedContent = platformFormatting[platform].formatContent(content, { 
          hashtags: platformFormatting[platform].hashtags 
        });
        
        // If we have successfully formatted content, return it
        if (formattedContent) {
          logger.info(`Formatted content for ${platform} using built-in formatter`);
          return formattedContent;
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.warn(`Error using built-in formatter for ${platform}: ${errorMessage}`);
      // Continue to use AI-based formatting as fallback
    }
    
    // If built-in formatter failed or doesn't exist, use OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a ${platform} content optimization specialist with extensive knowledge of social media best practices, optimal content structure, and platform-specific engagement patterns.`
        },
        {
          role: "user",
          content: `Adapt this content for ${platform}:

          ${content}

          Requirements:
          - Maximum length: ${platformConfig.maxLength} characters
          - Format: ${platformConfig.format}
          - Include ${platformConfig.hashtags ? "relevant hashtags" : "no hashtags"}
          - Structure using sections: ${platformConfig.sections.join(", ")}
          - Add platform-specific engagement prompts
          - Include appropriate emojis for ${platform}'s audience
          - Format according to ${platform}'s conventions (line breaks, paragraph length, etc.)
          - Optimize for algorithm visibility and engagement
          
          Maintain the core message while optimizing for ${platform}'s best practices.`
        }
      ],
      max_tokens: 1000, // Increased for more detailed formatting
      temperature: 0.7,
    });

    return response.choices[0].message.content?.trim() || 
      `Could not adapt content for ${platform}. Please try again.`;
  };

  return retryWithExponentialBackoff(operation);
}

import { z } from "zod";

// Function to generate preview images for content templates using OpenAI
export async function generateTemplatePreviewImage(
  templateTitle: string, 
  description: string,
  category: string
): Promise<string> {
  if (!isOpenAIConfigured) {
    throw new Error("OpenAI API key not configured");
  }

  const operation = async () => {
    try {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Create a professional, high-quality content workflow image for a template titled "${templateTitle}" 
          in the category "${category}". This image should visually represent the following description: "${description}".
          The image should be clean, modern, and suitable for a professional content management application. 
          Include visual elements that suggest content workflow and social media publishing. 
          Use a clean, professional color scheme with blues, purples, and whites.
          Do not include any text or words in the image.`,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        response_format: "url",
      });

      return response.data && response.data.length > 0 ? response.data[0].url || "" : "";
    } catch (error) {
      logger.error("Error generating template preview image:", error);
      throw error;
    }
  };

  return retryWithExponentialBackoff(operation);
}

export { openai };