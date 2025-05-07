import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateContent({
  contentType,
  contentTone,
  topics,
  platforms,
  length = "medium",
}: {
  contentType: string;
  contentTone: string;
  topics: string;
  platforms: string[];
  length?: "short" | "medium" | "long";
}): Promise<string> {
  const platformsJoined = platforms.join(", ");
  
  const lengthGuide = {
    short: "Keep it concise, ideal for social media (under 280 characters for Twitter).",
    medium: "Around 2-3 paragraphs, suitable for a LinkedIn post or short blog.",
    long: "Comprehensive content with 5+ paragraphs, ideal for in-depth articles."
  }[length];

  const prompt = `
    Create ${contentType} content about ${topics} with a ${contentTone} tone.
    This content will be posted on: ${platformsJoined}.
    ${lengthGuide}
    
    Generate content that is original, engaging, and tailored specifically for these platforms.
    Include relevant hashtags where appropriate.
    Format the content properly based on the platform requirements.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500,
    });

    return response.choices[0].message.content || "Failed to generate content";
  } catch (error) {
    console.error("Error generating content with OpenAI:", error);
    throw new Error("Failed to generate content. Please try again later.");
  }
}

export async function generatePlatformSpecificContent(
  generalContent: string,
  platform: string
): Promise<string> {
  const platformGuidelines = {
    "Twitter": "Format for Twitter with maximum 280 characters. Include relevant hashtags.",
    "LinkedIn": "Format for LinkedIn with professional tone. Can be longer and more detailed.",
    "Facebook": "Format for Facebook with engaging tone. Include call to action.",
    "Pinterest": "Format as a compelling description for a Pinterest pin. Include relevant hashtags.",
    "YouTube": "Format as a YouTube video description with timestamps and links if relevant."
  };

  const guideline = platformGuidelines[platform as keyof typeof platformGuidelines] || 
    "Adapt this content appropriately for the platform";

  const prompt = `
    Adapt the following content specifically for ${platform}:
    
    ${generalContent}
    
    Guidelines:
    ${guideline}
    
    Return only the reformatted content without explanations.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
    });

    return response.choices[0].message.content || generalContent;
  } catch (error) {
    console.error(`Error adapting content for ${platform}:`, error);
    return generalContent; // Return original content if adaptation fails
  }
}

export async function findTrendingTopics(category: string): Promise<string[]> {
  const prompt = `
    What are the current trending topics in ${category}?
    
    Please return a JSON array of 5 topics as strings.
    Format: ["Topic 1", "Topic 2", "Topic 3", "Topic 4", "Topic 5"]
    
    Make these topics specific and relevant to current discussions in the field.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    const result = content ? JSON.parse(content) : { topics: [] };
    return result.topics || [];
  } catch (error) {
    console.error("Error finding trending topics:", error);
    return ["Failed to fetch trending topics"];
  }
}
