# Testing in AutoContentFlow

This document provides an overview of the testing infrastructure for the AutoContentFlow application.

## Test Structure

Tests are organized as follows:

- `tests/unit/`: Contains unit tests for React components and utilities
- `tests/setup.ts`: Contains setup code for test environment

## Running Tests

### Running All Tests

```bash
./run-tests.sh
```

### Running Specific Tests

To run a specific test file:

```bash
npx jest --config=jest.config.cjs tests/unit/simple.test.js
```

Replace `simple.test.js` with the name of your test file.

## Test Configuration

- **Jest**: We use Jest as our test runner
- **Testing Library**: We use React Testing Library for testing React components
- **Config Files**:
  - `jest.config.cjs`: Main Jest configuration
  - `jest.setup.cjs`: Setup file for Jest with DOM mocks

## Component Tests

We have implemented tests for the following components:

1. **achievement-badge**: Tests for the gamification achievement badge component
2. **theme-switcher**: Tests for theme switching functionality
3. **animated-counter**: Tests for animated counter, progress bar, and charts
4. **shopify-integration**: Tests for Shopify store integration component
5. **skeleton-loader**: Tests for loading skeleton UI component
6. **user-engagement-tracker**: Tests for user engagement metrics tracking
7. **ai-assistant**: Tests for AI chat assistant component

## Mocking

Tests use mocks for external dependencies and complex components:

- UI components like buttons, cards, etc. are mocked
- External API calls are mocked
- Browser APIs (localStorage, matchMedia, etc.) are mocked

## Test Utilities

The `clearTestData` method is implemented in both storage classes to ensure tests start with a clean database state:

- `MemStorage.clearTestData()`: Clears all data from memory maps
- `DatabaseStorage.clearTestData()`: Clears all data from database tables

## Continuous Integration

Run tests before deploying to ensure all components function as expected.