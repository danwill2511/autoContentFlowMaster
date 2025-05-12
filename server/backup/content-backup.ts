
import { storage } from '../storage';
import { createWriteStream, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { gzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);

export class ContentBackupSystem {
  private static backupDir = join(process.cwd(), 'backups');

  static async initializeBackupSystem() {
    if (!existsSync(this.backupDir)) {
      mkdirSync(this.backupDir, { recursive: true });
    }

    // Run daily backups
    setInterval(() => this.performBackup(), 24 * 60 * 60 * 1000);
  }

  static async performBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `content-backup-${timestamp}.gz`;
    const filepath = join(this.backupDir, filename);

    try {
      const posts = await storage.getAllPosts();
      const workflows = await storage.getAllWorkflows();
      
      const backupData = JSON.stringify({
        posts,
        workflows,
        timestamp
      });

      const compressed = await gzipAsync(Buffer.from(backupData));
      const writeStream = createWriteStream(filepath);
      writeStream.write(compressed);
      writeStream.end();
    } catch (error) {
      console.error('Backup failed:', error);
    }
  }
}
