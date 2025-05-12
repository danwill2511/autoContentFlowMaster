# AutoContentFlow Test Suite

This directory contains automated tests for the AutoContentFlow application using Playwright.

## Test Structure

- `setup.ts` - Contains the global setup function for all tests
- `auth.spec.ts` - Tests for authentication functionality
- `subscription.spec.ts` - Tests for subscription management
- `workflow.spec.ts` - Tests for workflow creation and management
- `ui-components.spec.ts` - Tests for UI components
- `ai-assistant.spec.ts` - Tests for AI Assistant functionality
- `gamification.spec.ts` - Tests for gamification features

## Running Tests

You can run all tests with the provided script:

```bash
./run-tests.sh
```

Or manually with:

```bash
# Install Playwright browsers if not already installed
npx playwright install --with-deps

# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/ui-components.spec.ts

# Run tests with UI mode
npx playwright test --ui
```

## Test Data Setup

The `setup.ts` file includes a `setupTestData()` function that:

1. Clears existing test data
2. Creates a test user with credentials:
   - Email: test@example.com
   - Password: testPassword123

This setup is executed automatically before running tests through the global setup.

## Debugging Tests

For debugging tests:

1. Use the `--headed` option to run tests in a visible browser:
   ```bash
   npx playwright test --headed
   ```

2. Use the `--debug` option for step-by-step debugging:
   ```bash
   npx playwright test --debug
   ```

3. Add `page.pause()` in your test code to pause execution at a specific point.

## Generating Test Reports

Generate a test report after a test run:

```bash
npx playwright show-report
```