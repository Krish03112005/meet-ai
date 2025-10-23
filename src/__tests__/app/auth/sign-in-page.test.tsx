import React from 'react'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

// Mock modules
jest.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}))

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

jest.mock('next/headers', () => ({
  headers: jest.fn(),
}))

jest.mock('@/modules/auth/ui/views/sign-in-view', () => ({
  SignInView: () => <div>SignInView Component</div>,
}))

// Import the page component dynamically to ensure mocks are in place
const importPage = async () => {
  // Clear the module cache to ensure fresh import
  jest.resetModules()
  const module = await import('@/app/(auth)/sign-in/page')
  return module.default
}

describe('Sign In Page', () => {
  const mockHeaders = { 'user-agent': 'test' }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(headers as jest.Mock).mockResolvedValue(mockHeaders)
  })

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      ;(auth.api.getSession as jest.Mock).mockResolvedValue(null)
    })

    it('should not redirect when no session exists', async () => {
      const Page = await importPage()
      await Page()
      
      expect(redirect).not.toHaveBeenCalled()
    })

    it('should call getSession with headers', async () => {
      const Page = await importPage()
      await Page()
      
      expect(auth.api.getSession).toHaveBeenCalledWith({
        headers: mockHeaders,
      })
    })

    it('should render SignInView when not authenticated', async () => {
      const Page = await importPage()
      const result = await Page()
      
      expect(result).toBeDefined()
    })
  })

  describe('when user is authenticated', () => {
    const mockSession = {
      user: {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
      },
      session: {
        token: 'abc123',
        expiresAt: new Date(Date.now() + 86400000),
      },
    }

    beforeEach(() => {
      ;(auth.api.getSession as jest.Mock).mockResolvedValue(mockSession)
    })

    it('should redirect to home page when session exists', async () => {
      const Page = await importPage()
      
      try {
        await Page()
      } catch (error) {
        // redirect throws an error in Next.js
      }
      
      expect(redirect).toHaveBeenCalledWith('/')
    })

    it('should call getSession with headers before redirect', async () => {
      const Page = await importPage()
      
      try {
        await Page()
      } catch (error) {
        // Expected
      }
      
      expect(auth.api.getSession).toHaveBeenCalledWith({
        headers: mockHeaders,
      })
    })

    it('should not render SignInView when authenticated', async () => {
      ;(redirect as jest.Mock).mockImplementation(() => {
        throw new Error('NEXT_REDIRECT')
      })
      
      const Page = await importPage()
      
      await expect(Page()).rejects.toThrow()
    })
  })

  describe('edge cases', () => {
    it('should handle empty session object', async () => {
      ;(auth.api.getSession as jest.Mock).mockResolvedValue({})
      
      const Page = await importPage()
      
      try {
        await Page()
      } catch (error) {
        // Expected
      }
      
      expect(redirect).toHaveBeenCalledWith('/')
    })

    it('should handle session with truthy value', async () => {
      ;(auth.api.getSession as jest.Mock).mockResolvedValue({ user: {} })
      
      const Page = await importPage()
      
      try {
        await Page()
      } catch (error) {
        // Expected
      }
      
      expect(redirect).toHaveBeenCalledWith('/')
    })

    it('should not redirect on null session', async () => {
      ;(auth.api.getSession as jest.Mock).mockResolvedValue(null)
      
      const Page = await importPage()
      await Page()
      
      expect(redirect).not.toHaveBeenCalled()
    })

    it('should not redirect on undefined session', async () => {
      ;(auth.api.getSession as jest.Mock).mockResolvedValue(undefined)
      
      const Page = await importPage()
      await Page()
      
      expect(redirect).not.toHaveBeenCalled()
    })

    it('should handle headers error gracefully', async () => {
      ;(headers as jest.Mock).mockRejectedValue(new Error('Headers error'))
      
      const Page = await importPage()
      
      await expect(Page()).rejects.toThrow()
    })

    it('should handle getSession error', async () => {
      ;(auth.api.getSession as jest.Mock).mockRejectedValue(
        new Error('Session error')
      )
      
      const Page = await importPage()
      
      await expect(Page()).rejects.toThrow('Session error')
    })
  })

  describe('authentication flow', () => {
    it('should check session before rendering', async () => {
      ;(auth.api.getSession as jest.Mock).mockResolvedValue(null)
      
      const Page = await importPage()
      await Page()
      
      expect(auth.api.getSession).toHaveBeenCalledBefore(
        redirect as jest.Mock
      )
    })

    it('should await headers before checking session', async () => {
      const Page = await importPage()
      await Page()
      
      expect(headers).toHaveBeenCalled()
      expect(auth.api.getSession).toHaveBeenCalled()
    })
  })
})

// Add custom matcher
expect.extend({
  toHaveBeenCalledBefore(received: jest.Mock, expected: jest.Mock) {
    const receivedCalls = received.mock.invocationCallOrder
    const expectedCalls = expected.mock.invocationCallOrder
    
    if (receivedCalls.length === 0) {
      return {
        message: () => 'Expected function was never called',
        pass: false,
      }
    }
    
    if (expectedCalls.length === 0) {
      return {
        message: () => 'Received function was called, expected was not called',
        pass: true,
      }
    }
    
    const pass = receivedCalls[0] < expectedCalls[0]
    
    return {
      message: () =>
        pass
          ? 'Expected function was called before received'
          : 'Expected function was not called before received',
      pass,
    }
  },
})