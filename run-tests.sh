#!/bin/bash

# ANSI color codes for prettier output
RESET='\033[0m'
BRIGHT='\033[1m'
GREEN='\033[32m'
RED='\033[31m'
YELLOW='\033[33m'
CYAN='\033[36m'

echo -e "${BRIGHT}${CYAN}===== AutoContentFlow Test Runner =====${RESET}\n"

# Count unit tests
UNIT_TEST_COUNT=$(find tests/unit -name "*.test.tsx" | wc -l)
echo -e "${BRIGHT}Found ${UNIT_TEST_COUNT} unit test files${RESET}"

# Run Jest tests
echo -e "\n${YELLOW}Running Jest unit tests...${RESET}"
npx jest --config=jest.config.cjs

if [ $? -eq 0 ]; then
  echo -e "\n${GREEN}✅ Unit tests completed successfully!${RESET}"
  echo -e "\n${BRIGHT}${GREEN}All tests completed successfully!${RESET}"
  exit 0
else
  echo -e "\n${RED}❌ Some unit tests failed${RESET}"
  exit 1
fi