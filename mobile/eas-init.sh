#!/bin/bash

# Check if environment variables are set
if [ -z "$EXPO_USERNAME" ] || [ -z "$EXPO_PASSWORD" ]; then
  echo "Error: EXPO_USERNAME and EXPO_PASSWORD environment variables must be set"
  exit 1
fi

# Set the project ID
PROJECT_ID="f4f327b3-ec8a-453f-b0f1-453396821379"

# Create a .npmrc file with credentials
echo "//registry.npmjs.org/:_authToken=\nnpm.disableStrictSsl=true" > .npmrc

# Login to Expo using environment variables
echo "$EXPO_PASSWORD" | npx eas-cli login "$EXPO_USERNAME"

if [ $? -ne 0 ]; then
  echo "Failed to login to Expo"
  exit 1
fi

# Initialize EAS project with the specific ID
npx eas-cli init --id=$PROJECT_ID --non-interactive

if [ $? -ne 0 ]; then
  echo "Failed to initialize EAS project"
  exit 1
fi

echo "EAS project initialized successfully!"