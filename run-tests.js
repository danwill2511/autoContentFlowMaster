#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for prettier output
const RESET = '\x1b[0m';
const BRIGHT = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';

console.log(`${BRIGHT}${CYAN}===== AutoContentFlow Test Runner =====${RESET}\n`);

try {
  // Count unit tests
  const unitTestDir = path.join(__dirname, 'tests', 'unit');
  const unitTestFiles = fs.existsSync(unitTestDir) 
    ? fs.readdirSync(unitTestDir).filter(file => file.match(/\.test\.(ts|tsx)$/))
    : [];
  
  console.log(`${BRIGHT}Found ${unitTestFiles.length} unit test files${RESET}`);
  
  // Run Jest tests
  console.log(`\n${YELLOW}Running Jest unit tests...${RESET}`);
  try {
    // Execute the Jest command
    execSync('npx jest', { stdio: 'inherit' });
    console.log(`\n${GREEN}✅ Unit tests completed successfully!${RESET}`);
  } catch (error) {
    console.error(`\n${RED}❌ Some unit tests failed${RESET}`);
    process.exit(1);
  }
  
  console.log(`\n${BRIGHT}${GREEN}All tests completed successfully!${RESET}`);

} catch (error) {
  console.error(`\n${RED}Error running tests: ${error.message}${RESET}`);
  process.exit(1);
}