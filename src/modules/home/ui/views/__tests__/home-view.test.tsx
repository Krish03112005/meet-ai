import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HomeView } from '../home-view'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

jest.mock('@/lib/auth-client')
jest.mock('next/navigation')

const mockPush = jest.fn()
const mockSignOut = jest.fn()
const mockUseSession = jest.fn()

describe('HomeView Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    ;(authClient.signOut as jest.Mock) = mockSignOut
    ;(authClient.useSession as jest.Mock) = mockUseSession
  })

  describe('Loading State', () => {
    it('should show loading message when session is null', () => {
      mockUseSession.mockReturnValue({ data: null })
      
      render(<HomeView />)
      
      expect(screen.getByText('...Loading')).toBeInTheDocument()
    })

    it('should show loading message when session is undefined', () => {
      mockUseSession.mockReturnValue({ data: undefined })
      
      render(<HomeView />)
      
      expect(screen.getByText('...Loading')).toBeInTheDocument()
    })
  })

  describe('Authenticated State', () => {
    const mockSession = {
      user: {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        image: null,
      },
      session: {
        id: 'session-123',
        userId: '123',
        expiresAt: new Date(Date.now() + 86400000),
      },
    }

    it('should display user name when authenticated', () => {
      mockUseSession.mockReturnValue({ data: mockSession })
      
      render(<HomeView />)
      
      expect(screen.getByText('Logged in as John Doe')).toBeInTheDocument()
    })

    it('should render sign out button when authenticated', () => {
      mockUseSession.mockReturnValue({ data: mockSession })
      
      render(<HomeView />)
      
      expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
    })

    it('should not show loading message when authenticated', () => {
      mockUseSession.mockReturnValue({ data: mockSession })
      
      render(<HomeView />)
      
      expect(screen.queryByText('...Loading')).not.toBeInTheDocument()
    })
  })

  describe('Sign Out Functionality', () => {
    const mockSession = {
      user: {
        id: '123',
        name: 'Jane Smith',
        email: 'jane@example.com',
        image: null,
      },
      session: {
        id: 'session-456',
        userId: '123',
        expiresAt: new Date(Date.now() + 86400000),
      },
    }

    it('should call authClient.signOut when sign out button is clicked', async () => {
      const user = userEvent.setup()
      mockUseSession.mockReturnValue({ data: mockSession })
      
      mockSignOut.mockImplementation(({ fetchOptions }) => {
        fetchOptions.onSuccess()
      })
      
      render(<HomeView />)
      
      const signOutButton = screen.getByRole('button', { name: /sign out/i })
      await user.click(signOutButton)
      
      expect(mockSignOut).toHaveBeenCalledWith(
        expect.objectContaining({
          fetchOptions: expect.objectContaining({
            onSuccess: expect.any(Function),
          }),
        })
      )
    })

    it('should redirect to sign-in page after successful sign out', async () => {
      const user = userEvent.setup()
      mockUseSession.mockReturnValue({ data: mockSession })
      
      mockSignOut.mockImplementation(({ fetchOptions }) => {
        fetchOptions.onSuccess()
      })
      
      render(<HomeView />)
      
      const signOutButton = screen.getByRole('button', { name: /sign out/i })
      await user.click(signOutButton)
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/sign-in')
      })
    })

    it('should handle rapid sign out button clicks', async () => {
      const user = userEvent.setup()
      mockUseSession.mockReturnValue({ data: mockSession })
      
      mockSignOut.mockImplementation(({ fetchOptions }) => {
        setTimeout(() => fetchOptions.onSuccess(), 100)
      })
      
      render(<HomeView />)
      
      const signOutButton = screen.getByRole('button', { name: /sign out/i })
      await user.click(signOutButton)
      await user.click(signOutButton)
      await user.click(signOutButton)
      
      // Sign out can be called multiple times (no protection in component)
      expect(mockSignOut).toHaveBeenCalled()
    })
  })

  describe('Different User Names', () => {
    it('should display user with single word name', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '1', name: 'Madonna', email: 'madonna@example.com', image: null },
          session: { id: 's1', userId: '1', expiresAt: new Date() },
        },
      })
      
      render(<HomeView />)
      
      expect(screen.getByText('Logged in as Madonna')).toBeInTheDocument()
    })

    it('should display user with long name', () => {
      const longName = 'Jean-Baptiste Emanuel Zorg'
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '2', name: longName, email: 'long@example.com', image: null },
          session: { id: 's2', userId: '2', expiresAt: new Date() },
        },
      })
      
      render(<HomeView />)
      
      expect(screen.getByText(`Logged in as ${longName}`)).toBeInTheDocument()
    })

    it('should display user with special characters in name', () => {
      const specialName = "O'Brien-José María"
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '3', name: specialName, email: 'special@example.com', image: null },
          session: { id: 's3', userId: '3', expiresAt: new Date() },
        },
      })
      
      render(<HomeView />)
      
      expect(screen.getByText(`Logged in as ${specialName}`)).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string as user name', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '4', name: '', email: 'noname@example.com', image: null },
          session: { id: 's4', userId: '4', expiresAt: new Date() },
        },
      })
      
      render(<HomeView />)
      
      expect(screen.getByText('Logged in as')).toBeInTheDocument()
    })

    it('should handle session with all required fields', () => {
      const completeSession = {
        user: {
          id: '5',
          name: 'Complete User',
          email: 'complete@example.com',
          emailVerified: true,
          image: 'https://example.com/avatar.jpg',
          createdAt: new Date().toISOString(),
        },
        session: {
          id: 's5',
          userId: '5',
          expiresAt: new Date(Date.now() + 86400000),
          token: 'token-123',
          createdAt: new Date().toISOString(),
        },
      }
      
      mockUseSession.mockReturnValue({ data: completeSession })
      
      render(<HomeView />)
      
      expect(screen.getByText('Logged in as Complete User')).toBeInTheDocument()
    })
  })

  describe('Layout and Structure', () => {
    it('should render with correct container classes', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '6', name: 'Test User', email: 'test@example.com', image: null },
          session: { id: 's6', userId: '6', expiresAt: new Date() },
        },
      })
      
      const { container } = render(<HomeView />)
      
      const mainDiv = container.querySelector('.flex.flex-col.p-4.gap-y-4')
      expect(mainDiv).toBeInTheDocument()
    })

    it('should have accessible button', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '7', name: 'Test User', email: 'test@example.com', image: null },
          session: { id: 's7', userId: '7', expiresAt: new Date() },
        },
      })
      
      render(<HomeView />)
      
      const button = screen.getByRole('button', { name: /sign out/i })
      expect(button).toBeEnabled()
    })
  })

  describe('Session Hook Integration', () => {
    it('should call useSession hook', () => {
      mockUseSession.mockReturnValue({ data: null })
      
      render(<HomeView />)
      
      expect(mockUseSession).toHaveBeenCalled()
    })

    it('should handle session data changes', () => {
      const { rerender } = render(<HomeView />)
      
      mockUseSession.mockReturnValue({ data: null })
      rerender(<HomeView />)
      expect(screen.getByText('...Loading')).toBeInTheDocument()
      
      mockUseSession.mockReturnValue({
        data: {
          user: { id: '8', name: 'Updated User', email: 'updated@example.com', image: null },
          session: { id: 's8', userId: '8', expiresAt: new Date() },
        },
      })
      rerender(<HomeView />)
      expect(screen.getByText('Logged in as Updated User')).toBeInTheDocument()
    })
  })
})