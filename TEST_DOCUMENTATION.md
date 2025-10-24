# Test Suite Documentation

## Overview

This document provides comprehensive documentation for the unit tests generated for the dashboard feature implementation in the Meet.AI application.

## Test Framework

- **Framework**: Vitest
- **Testing Library**: React Testing Library (@testing-library/react)
- **Mocking**: Vitest's built-in mocking system
- **Environment**: jsdom (browser-like environment)

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Files

### 1. GeneratedAvatar Component Tests
**File**: `src/components/__tests__/generated-avatar.test.tsx`

**Test Coverage**: 67 test cases

#### Test Categories:

**Component Rendering (4 tests)**
- Renders with default variant (initials)
- Renders with botttsNeutral variant
- Renders with explicit initials variant
- Applies custom className

**Seed Handling (6 tests)**
- Generates avatar with provided seed
- Displays fallback with uppercase first character
- Handles empty seed gracefully
- Handles special characters in seed
- Handles lowercase first letter
- Handles numeric seeds

**Variant Behavior (3 tests)**
- Uses botttsNeutral style correctly
- Uses initials style with custom options
- Defaults to initials when no variant specified

**Edge Cases (4 tests)**
- Handles very long seed strings (1000+ characters)
- Handles Unicode characters
- Handles emoji in seed
- Handles whitespace-only seed

**Integration (2 tests)**
- Renders both AvatarImage and AvatarFallback
- Generates unique data URIs for different seeds

**Accessibility (2 tests)**
- Has proper alt text for avatar image
- Is keyboard accessible

---

### 2. DashboardSidebar Component Tests
**File**: `src/modules/dashboard/ui/components/__tests__/dashboard-sidebar.test.tsx`

**Test Coverage**: 38 test cases

#### Test Categories:

**Component Rendering (5 tests)**
- Renders sidebar with all sections
- Renders logo image
- Renders DashboardUserButton in footer
- Renders navigation links with proper hrefs
- Renders home link with logo

**Active State Management (5 tests)**
- Highlights active menu item based on pathname
- Does not highlight inactive menu items
- Updates active state for /agents
- Updates active state for /upgrade
- Handles root path correctly

**Navigation Structure (4 tests)**
- Renders first section (Meetings, Agents)
- Renders second section (Upgrade)
- Renders separators between sections
- Has proper menu structure with icons

**Styling and Classes (4 tests)**
- Applies hover styles to menu buttons
- Applies proper height to menu buttons
- Applies border styles to menu buttons
- Styles footer with proper text color

**Accessibility (3 tests)**
- Has semantic navigation structure
- Has descriptive link text
- Has proper alt text for logo

**Edge Cases (4 tests)**
- Handles unknown pathname gracefully
- Handles empty pathname
- Handles pathname with query parameters
- Handles nested paths

**Integration (2 tests)**
- Renders complete sidebar structure
- Maintains consistent layout structure

---

### 3. DashboardUserButton Component Tests
**File**: `src/modules/dashboard/ui/components/__tests__/dashboard-user-button.test.tsx`

**Test Coverage**: 35 test cases

#### Test Categories:

**Loading and Null States (3 tests)**
- Returns null when session is pending
- Returns null when user data is not available
- Returns null when session exists but user is missing

**User Display with Image (3 tests)**
- Renders user button with user image when available
- Displays user image with correct src
- Does not render GeneratedAvatar when user has image

**User Display without Image (3 tests)**
- Renders GeneratedAvatar when user has no image
- Uses initials variant for generated avatar
- Applies correct className to generated avatar

**Dropdown Menu Interaction (4 tests)**
- Toggles dropdown menu on button click
- Displays user info in dropdown menu label
- Shows Billing menu item
- Shows Logout menu item

**Logout Functionality (3 tests)**
- Calls signOut when logout is clicked
- Redirects to sign-in page after successful logout
- Passes correct options to signOut

**UI Elements and Styling (4 tests)**
- Renders ChevronDown icon
- Applies correct styling classes to trigger button
- Truncates long user names
- Truncates long email addresses

**Edge Cases (4 tests)**
- Handles user with empty name
- Handles user with empty email
- Handles user with undefined image
- Handles user with special characters in name

**Accessibility (3 tests)**
- Has accessible button role
- Has clickable menu items
- Displays icons with proper classes

---

### 4. Dashboard Layout Tests
**File**: `src/app/(dashboard)/__tests__/layout.test.tsx`

**Test Coverage**: 22 test cases

#### Test Categories:

**Component Rendering (4 tests)**
- Renders layout with children
- Renders SidebarProvider
- Renders DashboardSidebar
- Wraps children in main element

**Layout Structure (2 tests)**
- Has correct component hierarchy
- Renders sidebar before main content

**Styling (3 tests)**
- Applies flex layout classes to main
- Applies full screen dimensions to main
- Applies muted background to main

**Props Handling (3 tests)**
- Handles single child element
- Handles multiple child elements
- Handles complex nested children

**Edge Cases (4 tests)**
- Handles empty children
- Handles text-only children
- Handles fragments as children
- Handles conditional children

**Integration (2 tests)**
- Properly integrates sidebar with content
- Maintains layout consistency with different content

**Accessibility (2 tests)**
- Uses semantic main element
- Maintains proper document structure

**TypeScript Props Validation (2 tests)**
- Accepts valid React.ReactNode as children
- Handles array of children

---

### 5. Dashboard Page Tests
**File**: `src/app/(dashboard)/__tests__/page.test.tsx`

**Test Coverage**: 25 test cases

#### Test Categories:

**Authentication Check (3 tests)**
- Redirects to sign-in when session is null
- Redirects to sign-in when session is undefined
- Does not redirect when valid session exists

**Session Validation (3 tests)**
- Calls getSession with headers
- Handles session with minimal user data
- Handles session with complete user data

**HomeView Rendering (2 tests)**
- Renders HomeView when authenticated
- Passes through to HomeView without props

**Error Handling (3 tests)**
- Handles getSession throwing an error
- Handles headers throwing an error
- Handles malformed session data gracefully

**Edge Cases (4 tests)**
- Handles empty session object
- Handles session with false value
- Handles session with empty user object
- Handles very long session IDs

**Redirect Behavior (2 tests)**
- Redirects to exactly "/sign-in" path
- Does not redirect multiple times

**Async Behavior (2 tests)**
- Waits for headers promise to resolve
- Waits for getSession promise to resolve

**Integration (2 tests)**
- Completes full authentication flow for valid session
- Completes full authentication flow for invalid session

**TypeScript Type Safety (1 test)**
- Handles properly typed session data

---

## Total Test Coverage Summary

| Component | Test Cases | Categories |
|-----------|-----------|------------|
| GeneratedAvatar | 21 | 6 |
| DashboardSidebar | 27 | 7 |
| DashboardUserButton | 27 | 8 |
| Dashboard Layout | 22 | 8 |
| Dashboard Page | 25 | 9 |
| **TOTAL** | **122** | **38** |

## Key Testing Patterns

### 1. Mocking Strategy
- **Next.js Modules**: All Next.js-specific modules (navigation, headers, images, links) are globally mocked in `vitest.setup.ts`
- **External Libraries**: DiceBear library is mocked at the component test level
- **Authentication**: Auth client and auth library are mocked per test file

### 2. Testing Approach
- **Happy Paths**: All components test successful rendering and functionality
- **Edge Cases**: Comprehensive edge case testing for unusual inputs
- **Error Handling**: Tests verify graceful handling of errors
- **Accessibility**: All components include accessibility tests
- **Integration**: Tests verify component interactions

### 3. Best Practices Followed
- **Descriptive Test Names**: Each test clearly describes what it's testing
- **Arrange-Act-Assert**: Tests follow the AAA pattern
- **Isolation**: Each test is independent and can run in any order
- **Cleanup**: Automatic cleanup after each test via vitest.setup.ts
- **Type Safety**: Tests are written in TypeScript with proper typing

## Mocking Configuration

### Global Mocks (vitest.setup.ts)
```typescript
- next/navigation: useRouter, usePathname, redirect
- next/image: Image component as native img
- next/headers: headers function
- next/link: Link component as native anchor
```

### Component-Specific Mocks
```typescript
- @dicebear/core: Avatar generation library
- @dicebear/collection: Avatar style collections
- @/lib/auth-client: Authentication client
- @/lib/auth: Authentication library
```

## Coverage Goals

The test suite aims for:
- **Line Coverage**: > 80%
- **Branch Coverage**: > 75%
- **Function Coverage**: > 80%
- **Statement Coverage**: > 80%

## CI/CD Integration

These tests are designed to run in CI/CD pipelines:
```yaml
# Example GitHub Actions usage
- name: Run Tests
  run: npm test -- --coverage
```

## Future Enhancements

Potential additions to the test suite:
1. **E2E Tests**: Add Playwright/Cypress tests for full user flows
2. **Visual Regression**: Add visual regression testing
3. **Performance Tests**: Add performance benchmarks
4. **Load Tests**: Add load testing for API interactions
5. **Integration Tests**: Add more comprehensive integration tests

## Troubleshooting

### Common Issues

**Issue**: Tests fail with module resolution errors
**Solution**: Ensure `@/` alias is properly configured in `vitest.config.ts`

**Issue**: React Testing Library queries fail
**Solution**: Check that components are properly rendered and use appropriate queries

**Issue**: Async tests timeout
**Solution**: Use `waitFor` for async operations and adjust timeout if needed

**Issue**: Mock functions not being called
**Solution**: Verify mock setup in `beforeEach` and check import paths

## Contributing

When adding new tests:
1. Follow existing test structure and naming conventions
2. Add tests to appropriate describe blocks
3. Include happy path, edge cases, and accessibility tests
4. Update this documentation with new test cases
5. Ensure tests are independent and can run in any order

## Maintenance

- **Review**: Tests should be reviewed quarterly
- **Update**: Update tests when components change
- **Refactor**: Refactor tests to reduce duplication
- **Document**: Keep this documentation up to date

---

**Last Updated**: October 2024
**Maintainer**: Development Team
**Version**: 1.0.0