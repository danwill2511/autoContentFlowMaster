
import { storage } from '../storage';
import { randomBytes } from 'crypto';
import { Platform } from '@shared/schema';

const KEY_ROTATION_INTERVAL = 30 * 24 * 60 * 60 * 1000; // 30 days

export class KeyRotationManager {
  static async rotateApiKey(platform: Platform): Promise<string> {
    const newKey = randomBytes(32).toString('hex');
    const oldKey = platform.apiKey;
    
    // Store the new key
    await storage.updatePlatform(platform.id, {
      apiKey: newKey,
      previousApiKey: oldKey,
      keyRotationDate: new Date()
    });
    
    return newKey;
  }

  static async startKeyRotation() {
    setInterval(async () => {
      const platforms = await storage.getAllPlatforms();
      for (const platform of platforms) {
        const lastRotation = platform.keyRotationDate;
        if (!lastRotation || (Date.now() - lastRotation.getTime() > KEY_ROTATION_INTERVAL)) {
          await this.rotateApiKey(platform);
        }
      }
    }, 24 * 60 * 60 * 1000); // Check daily
  }
}
