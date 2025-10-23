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

jest.mock('@/modules/home/ui/views/home-view', () => ({
  HomeView: () => <div>HomeView Component</div>,
}))

const importPage = async () => {
  jest.resetModules()
  const module = await import('@/app/page')
  return module.default
}

describe('Home Page', () => {
  const mockHeaders = { 'user-agent': 'test' }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(headers as jest.Mock).mockResolvedValue(mockHeaders)
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

    it('should not redirect when session exists', async () => {
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

    it('should render HomeView when authenticated', async () => {
      const Page = await importPage()
      const result = await Page()
      
      expect(result).toBeDefined()
    })
  })

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      ;(auth.api.getSession as jest.Mock).mockResolvedValue(null)
    })

    it('should redirect to sign-in page when no session exists', async () => {
      const Page = await importPage()
      
      try {
        await Page()
      } catch (error) {
        // redirect throws
      }
      
      expect(redirect).toHaveBeenCalledWith('/sign-in')
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

    it('should not render HomeView when not authenticated', async () => {
      ;(redirect as jest.Mock).mockImplementation(() => {
        throw new Error('NEXT_REDIRECT')
      })
      
      const Page = await importPage()
      
      await expect(Page()).rejects.toThrow()
    })
  })

  describe('edge cases', () => {
    it('should redirect when session is undefined', async () => {
      ;(auth.api.getSession as jest.Mock).mockResolvedValue(undefined)
      
      const Page = await importPage()
      
      try {
        await Page()
      } catch (error) {
        // Expected
      }
      
      expect(redirect).toHaveBeenCalledWith('/sign-in')
    })

    it('should redirect when session is false', async () => {
      ;(auth.api.getSession as jest.Mock).mockResolvedValue(false)
      
      const Page = await importPage()
      
      try {
        await Page()
      } catch (error) {
        // Expected
      }
      
      expect(redirect).toHaveBeenCalledWith('/sign-in')
    })

    it('should not redirect when session is empty object', async () => {
      ;(auth.api.getSession as jest.Mock).mockResolvedValue({})
      
      const Page = await importPage()
      await Page()
      
      expect(redirect).not.toHaveBeenCalled()
    })

    it('should not redirect when session has user', async () => {
      ;(auth.api.getSession as jest.Mock).mockResolvedValue({ user: {} })
      
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
      ;(auth.api.getSession as jest.Mock).mockResolvedValue({ user: {} })
      
      const Page = await importPage()
      await Page()
      
      expect(auth.api.getSession).toHaveBeenCalled()
    })

    it('should await headers before checking session', async () => {
      ;(auth.api.getSession as jest.Mock).mockResolvedValue({ user: {} })
      
      const Page = await importPage()
      await Page()
      
      expect(headers).toHaveBeenCalled()
      expect(auth.api.getSession).toHaveBeenCalled()
    })
  })

  describe('protected route behavior', () => {
    it('should act as protected route by redirecting unauthenticated users', async () => {
      ;(auth.api.getSession as jest.Mock).mockResolvedValue(null)
      
      const Page = await importPage()
      
      try {
        await Page()
      } catch (error) {
        // Expected
      }
      
      expect(redirect).toHaveBeenCalledWith('/sign-in')
    })

    it('should allow authenticated users to access', async () => {
      ;(auth.api.getSession as jest.Mock).mockResolvedValue({
        user: { id: '1', name: 'Test' },
      })
      
      const Page = await importPage()
      await Page()
      
      expect(redirect).not.toHaveBeenCalled()
    })
  })
})