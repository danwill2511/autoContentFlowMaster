#!/bin/bash

# Install Playwright browsers if not already installed
echo "Installing Playwright browsers if needed..."
npx playwright install --with-deps chromium

# Run the tests
echo "Running Playwright tests..."
npx playwright test

# Check the exit code
if [ $? -eq 0 ]; then
  echo "✅ All tests passed!"
else
  echo "❌ Some tests failed. Check the output above for details."
fi