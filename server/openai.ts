
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

const isOpenAIConfigured = !!process.env.OPENAI_API_KEY;

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

interface ContentGenerationOptions {
  contentType: string;
  contentTone: string;
  topics: string;
  platforms: string[];
  length?: string;
}

async function retryWithExponentialBackoff<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryWithExponentialBackoff(operation, retries - 1, delay * 2);
  }
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
      model: "gpt-4",
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
      max_tokens: 500,
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
    const trends = await findTrendingTopics(topics);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional content creator specializing in multi-platform content."
        },
        {
          role: "user",
          content: `Create ${contentType} content with a ${contentTone} tone about ${topics}.
          Consider these trending subtopics: ${trends.topics.join(", ")}
          Target platforms: ${platforms.join(", ")}
          Length: ~${wordCount} words
          Make it engaging and incorporate current trends naturally.
          Format with clear structure and SEO-friendly elements.`
        }
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    return response.choices[0].message.content?.trim() || 
      "Could not generate content. Please try again with different parameters.";
  };

  return retryWithExponentialBackoff(operation);
}

const platformFormatting = {
  LinkedIn: {
    maxLength: 3000,
    hashtags: true,
    format: "professional",
    sections: ["hook", "context", "value", "cta"]
  },
  Twitter: {
    maxLength: 280,
    hashtags: true,
    format: "concise",
    sections: ["hook", "content", "cta"]
  },
  Facebook: {
    maxLength: 5000,
    hashtags: false,
    format: "conversational",
    sections: ["story", "content", "engagement"]
  },
  Pinterest: {
    maxLength: 500,
    hashtags: true,
    format: "visual",
    sections: ["description", "keywords", "link"]
  },
  YouTube: {
    maxLength: 5000,
    hashtags: true,
    format: "detailed",
    sections: ["title", "description", "timestamps", "links"]
  },
  Instagram: {
    maxLength: 2200,
    hashtags: true,
    format: "visual",
    sections: ["caption", "hashtags"]
  }
};

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
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a ${platform} content optimization specialist.`
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
          
          Maintain the core message while optimizing for ${platform}'s best practices.`
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0].message.content?.trim() || 
      `Could not adapt content for ${platform}. Please try again.`;
  };

  return retryWithExponentialBackoff(operation);
}

import { z } from "zod";
export { openai };
