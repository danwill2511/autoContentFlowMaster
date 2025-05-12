import { execSync } from 'child_process';
import fs from 'fs';

// Check if environment variables are set
if (!process.env.EXPO_USERNAME || !process.env.EXPO_PASSWORD) {
  console.error('Error: EXPO_USERNAME and EXPO_PASSWORD environment variables must be set');
  process.exit(1);
}

const username = process.env.EXPO_USERNAME;
const password = process.env.EXPO_PASSWORD;
const projectId = 'f4f327b3-ec8a-453f-b0f1-453396821379';

console.log('Logging in to Expo...');
try {
  // Create a temporary .npmrc file with credentials
  const npmrcContent = `//registry.npmjs.org/:_authToken=\nnpm.disableStrictSsl=true\n`;
  fs.writeFileSync('.npmrc', npmrcContent);
  
  // Create a temporary file with credentials for eas login
  const tempCredFile = '.temp-creds.json';
  fs.writeFileSync(tempCredFile, JSON.stringify({ username, password }));
  
  // Login to Expo using environment variables - using newer syntax
  execSync(`echo ${password} | npx eas login ${username}`, { stdio: 'inherit' });
  
  console.log('Initializing EAS project...');
  execSync(`npx eas init --id=${projectId} --non-interactive`, { stdio: 'inherit' });
  
  // Clean up temporary files
  if (fs.existsSync(tempCredFile)) {
    fs.unlinkSync(tempCredFile);
  }
  
  console.log('EAS project initialized successfully!');
} catch (error) {
  console.error('Error initializing EAS project:', error.message);
  process.exit(1);
}