import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import Page from '../page'

// Mock the dependencies
vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation')
  return {
    ...actual,
    redirect: vi.fn(),
  }
})

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}))

const mockGetSession = vi.fn()
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: mockGetSession,
    },
  },
}))

vi.mock('@/modules/home/ui/views/home-view', () => ({
  HomeView: () => <div data-testid="home-view">Home View Content</div>,
}))

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(headers).mockResolvedValue(new Headers())
  })

  describe('Authentication Check', () => {
    it('should redirect to sign-in when session is null', async () => {
      mockGetSession.mockResolvedValue(null)

      await Page()

      expect(mockGetSession).toHaveBeenCalled()
      expect(redirect).toHaveBeenCalledWith('/sign-in')
    })

    it('should redirect to sign-in when session is undefined', async () => {
      mockGetSession.mockResolvedValue(undefined)

      await Page()

      expect(redirect).toHaveBeenCalledWith('/sign-in')
    })

    it('should not redirect when valid session exists', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: '1', name: 'Test User' },
        session: { id: 'session-1' },
      })

      const result = await Page()
      render(result)

      expect(redirect).not.toHaveBeenCalled()
      expect(screen.getByTestId('home-view')).toBeInTheDocument()
    })
  })

  describe('Session Validation', () => {
    it('should call getSession with headers', async () => {
      const mockHeaders = new Headers()
      vi.mocked(headers).mockResolvedValue(mockHeaders)
      mockGetSession.mockResolvedValue({
        user: { id: '1' },
        session: { id: 'session-1' },
      })

      await Page()

      expect(headers).toHaveBeenCalled()
      expect(mockGetSession).toHaveBeenCalledWith({
        headers: mockHeaders,
      })
    })

    it('should handle session with minimal user data', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: '123' },
        session: { id: 'session-123' },
      })

      const result = await Page()
      render(result)

      expect(screen.getByTestId('home-view')).toBeInTheDocument()
    })

    it('should handle session with complete user data', async () => {
      mockGetSession.mockResolvedValue({
        user: {
          id: '456',
          name: 'Complete User',
          email: 'complete@example.com',
          image: 'https://example.com/avatar.jpg',
        },
        session: {
          id: 'session-456',
          expiresAt: new Date('2024-12-31'),
        },
      })

      const result = await Page()
      render(result)

      expect(screen.getByTestId('home-view')).toBeInTheDocument()
    })
  })

  describe('HomeView Rendering', () => {
    it('should render HomeView when authenticated', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: '1', name: 'User' },
        session: { id: 'session-1' },
      })

      const result = await Page()
      render(result)

      expect(screen.getByTestId('home-view')).toBeInTheDocument()
      expect(screen.getByText('Home View Content')).toBeInTheDocument()
    })

    it('should pass through to HomeView without props', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: '1' },
        session: { id: 'session-1' },
      })

      const result = await Page()
      const { container } = render(result)

      expect(container.firstChild).toHaveAttribute('data-testid', 'home-view')
    })
  })

  describe('Error Handling', () => {
    it('should handle getSession throwing an error', async () => {
      mockGetSession.mockRejectedValue(new Error('Auth error'))

      await expect(Page()).rejects.toThrow('Auth error')
    })

    it('should handle headers throwing an error', async () => {
      vi.mocked(headers).mockRejectedValue(new Error('Headers error'))

      await expect(Page()).rejects.toThrow('Headers error')
    })

    it('should handle malformed session data gracefully', async () => {
      mockGetSession.mockResolvedValue({
        user: null,
        session: { id: 'session-1' },
      })

      await Page()

      // Should still redirect if user is null
      expect(redirect).toHaveBeenCalledWith('/sign-in')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty session object', async () => {
      mockGetSession.mockResolvedValue({})

      await Page()

      expect(redirect).toHaveBeenCalledWith('/sign-in')
    })

    it('should handle session with false value', async () => {
      mockGetSession.mockResolvedValue(false as any)

      await Page()

      expect(redirect).toHaveBeenCalledWith('/sign-in')
    })

    it('should handle session with empty user object', async () => {
      mockGetSession.mockResolvedValue({
        user: {},
        session: { id: 'session-1' },
      })

      const result = await Page()
      render(result)

      // Empty object is truthy, so should render HomeView
      expect(screen.getByTestId('home-view')).toBeInTheDocument()
    })

    it('should handle very long session IDs', async () => {
      const longSessionId = 'a'.repeat(10000)
      mockGetSession.mockResolvedValue({
        user: { id: '1' },
        session: { id: longSessionId },
      })

      const result = await Page()
      render(result)

      expect(screen.getByTestId('home-view')).toBeInTheDocument()
    })
  })

  describe('Redirect Behavior', () => {
    it('should redirect to exactly "/sign-in" path', async () => {
      mockGetSession.mockResolvedValue(null)

      await Page()

      expect(redirect).toHaveBeenCalledWith('/sign-in')
      expect(redirect).toHaveBeenCalledTimes(1)
    })

    it('should not redirect multiple times', async () => {
      mockGetSession.mockResolvedValue(null)

      await Page()

      expect(redirect).toHaveBeenCalledTimes(1)
    })
  })

  describe('Async Behavior', () => {
    it('should wait for headers promise to resolve', async () => {
      const headersPromise = Promise.resolve(new Headers())
      vi.mocked(headers).mockReturnValue(headersPromise as any)
      mockGetSession.mockResolvedValue({
        user: { id: '1' },
        session: { id: 'session-1' },
      })

      await Page()

      expect(headers).toHaveBeenCalled()
    })

    it('should wait for getSession promise to resolve', async () => {
      mockGetSession.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  user: { id: '1' },
                  session: { id: 'session-1' },
                }),
              10
            )
          )
      )

      const result = await Page()
      render(result)

      expect(screen.getByTestId('home-view')).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('should complete full authentication flow for valid session', async () => {
      const mockHeaders = new Headers()
      mockHeaders.set('authorization', 'Bearer token')
      vi.mocked(headers).mockResolvedValue(mockHeaders)

      mockGetSession.mockResolvedValue({
        user: {
          id: 'user-123',
          name: 'Integration Test User',
          email: 'integration@test.com',
        },
        session: {
          id: 'session-123',
        },
      })

      const result = await Page()
      render(result)

      expect(headers).toHaveBeenCalled()
      expect(mockGetSession).toHaveBeenCalledWith({
        headers: mockHeaders,
      })
      expect(redirect).not.toHaveBeenCalled()
      expect(screen.getByTestId('home-view')).toBeInTheDocument()
    })

    it('should complete full authentication flow for invalid session', async () => {
      const mockHeaders = new Headers()
      vi.mocked(headers).mockResolvedValue(mockHeaders)
      mockGetSession.mockResolvedValue(null)

      await Page()

      expect(headers).toHaveBeenCalled()
      expect(mockGetSession).toHaveBeenCalledWith({
        headers: mockHeaders,
      })
      expect(redirect).toHaveBeenCalledWith('/sign-in')
    })
  })

  describe('TypeScript Type Safety', () => {
    it('should handle properly typed session data', async () => {
      mockGetSession.mockResolvedValue({
        user: {
          id: 'typed-user',
          name: 'Typed User',
          email: 'typed@example.com',
        },
        session: {
          id: 'typed-session',
          expiresAt: new Date(),
        },
      })

      const result = await Page()
      expect(result).toBeDefined()
    })
  })
})