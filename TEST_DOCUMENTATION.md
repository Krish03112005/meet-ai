# Test Documentation

This document provides comprehensive information about the test suite for the authentication and social login application.

## Testing Framework

The project uses **Jest** with **React Testing Library** for testing. The setup includes:

- **Jest**: Test runner and assertion library
- **@testing-library/react**: React component testing utilities
- **@testing-library/jest-dom**: Custom Jest matchers for DOM assertions
- **@testing-library/user-event**: User interaction simulation

## Running Tests

```bash
# Install dependencies first
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Coverage Summary

### Total Tests: 169+

1. **Utility Functions** (22 tests) - `src/lib/__tests__/utils.test.ts`
2. **Custom Hooks** (15 tests) - `src/hooks/__tests__/use-mobile.test.tsx`
3. **Sign-In View** (31 tests) - `src/modules/auth/ui/views/__tests__/sign-in-view.test.tsx`
4. **Sign-Up View** (38 tests) - `src/modules/auth/ui/views/__tests__/sign-up-view.test.tsx`
5. **Home View** (18 tests) - `src/modules/home/ui/views/__tests__/home-view.test.tsx`
6. **Database Schema** (30 tests) - `src/db/__tests__/schema.test.ts`
7. **Configuration** (15 tests) - `src/__tests__/config-validation.test.ts`

## Test Categories

### ✅ Happy Path Tests
- Valid user inputs and successful operations
- Proper data flow through components
- Expected navigation and redirects

### ✅ Edge Case Tests
- Empty, null, and undefined values
- Very long inputs
- Special characters
- Boundary conditions
- Rapid user interactions

### ✅ Failure Condition Tests
- Invalid form inputs
- API errors
- Network timeouts
- Authentication failures

### ✅ Accessibility Tests
- Proper ARIA labels
- Keyboard navigation
- Screen reader compatibility

## Key Features Tested

1. **Authentication Flows**
   - Email-password sign-in
   - Email-password sign-up
   - Google OAuth
   - GitHub OAuth
   - Sign out functionality

2. **Form Validation**
   - Email format validation
   - Password requirements
   - Password confirmation matching
   - Required field validation

3. **UI Responsiveness**
   - Mobile/desktop detection
   - Dynamic viewport changes
   - Resize event handling

4. **State Management**
   - Loading states
   - Error states
   - Authenticated states
   - Session management

5. **Database Schema**
   - Table structure validation
   - Field constraints
   - Foreign key relationships
   - Data types

6. **Configuration**
   - TypeScript configuration
   - Package dependencies
   - Test framework setup

## Best Practices

- Tests follow AAA pattern (Arrange, Act, Assert)
- User-centric testing approach
- Comprehensive mocking strategy
- Proper async handling
- Clean test isolation
- Descriptive test names

## Next Steps

Run `npm install` to install test dependencies, then run `npm test` to execute the test suite!