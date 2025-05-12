
import { storage } from '../server/storage';
import { hashPassword } from '../server/auth';

export async function setupTestData() {
  // Clear existing test data
  await storage.clearTestData();
  
  // Create test user
  const hashedPassword = await hashPassword('testPassword123');
  await storage.createUser({
    username: 'testuser',
    email: 'test@example.com',
    password: hashedPassword,
    subscription: 'free'
  });
}
