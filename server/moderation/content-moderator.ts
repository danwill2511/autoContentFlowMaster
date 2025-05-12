
import { OpenAI } from 'openai';
import { storage } from '../storage';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export class ContentModerator {
  static async moderateContent(content: string): Promise<{
    isAppropriate: boolean;
    reason?: string;
  }> {
    try {
      const response = await openai.moderations.create({
        input: content
      });

      const result = response.results[0];
      return {
        isAppropriate: !result.flagged,
        reason: result.flagged ? Object.keys(result.categories)
          .filter(key => result.categories[key as keyof typeof result.categories])
          .join(', ') : undefined
      };
    } catch (error) {
      console.error('Moderation failed:', error);
      return { isAppropriate: false, reason: 'Moderation service unavailable' };
    }
  }

  static async moderatePost(postId: number): Promise<boolean> {
    const post = await storage.getPost(postId);
    if (!post) return false;

    const result = await this.moderateContent(post.content);
    if (!result.isAppropriate) {
      await storage.updatePostStatus(postId, 'flagged');
      return false;
    }
    return true;
  }
}
