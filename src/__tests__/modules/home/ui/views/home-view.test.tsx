import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { HomeView } from '@/modules/home/ui/views/home-view'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

// Mock dependencies
jest.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: jest.fn(),
    signOut: jest.fn(),
  },
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}))

describe('HomeView', () => {
  const mockPush = jest.fn()
  const mockSignOut = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    ;(authClient.signOut as jest.Mock).mockImplementation((options) => {
      if (options?.fetchOptions?.onSuccess) {
        options.fetchOptions.onSuccess()
      }
      return Promise.resolve()
    })
  })

  describe('when session is loading', () => {
    beforeEach(() => {
      ;(authClient.useSession as jest.Mock).mockReturnValue({
        data: null,
      })
    })

    it('should render loading state', () => {
      render(<HomeView />)
      expect(screen.getByText('...Loading')).toBeInTheDocument()
    })

    it('should not render user info when loading', () => {
      render(<HomeView />)
      expect(screen.queryByText(/Logged in as/)).not.toBeInTheDocument()
    })

    it('should not render sign out button when loading', () => {
      render(<HomeView />)
      expect(screen.queryByText('Sign Out')).not.toBeInTheDocument()
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
      ;(authClient.useSession as jest.Mock).mockReturnValue({
        data: mockSession,
      })
    })

    it('should render user name', () => {
      render(<HomeView />)
      expect(screen.getByText('Logged in as John Doe')).toBeInTheDocument()
    })

    it('should render sign out button', () => {
      render(<HomeView />)
      expect(screen.getByText('Sign Out')).toBeInTheDocument()
    })

    it('should call signOut when button is clicked', () => {
      render(<HomeView />)
      const signOutButton = screen.getByText('Sign Out')
      fireEvent.click(signOutButton)
      expect(authClient.signOut as any).toHaveBeenCalled()
    })

    it('should redirect to sign-in page after successful sign out', async () => {
      render(<HomeView />)
      const signOutButton = screen.getByText('Sign Out')
      fireEvent.click(signOutButton)
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/sign-in')
      })
    })

    it('should pass correct options to signOut', () => {
      render(<HomeView />)
      const signOutButton = screen.getByText('Sign Out')
      fireEvent.click(signOutButton)
      
      expect(mockSignOut).toHaveBeenCalledWith({
        fetchOptions: {
          onSuccess: expect.any(Function),
        },
      })
    })

    it('should render container with proper styling', () => {
      const { container } = render(<HomeView />)
      const mainDiv = container.querySelector('.flex.flex-col.p-4.gap-y-4')
      expect(mainDiv).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('should handle session with null user name', () => {
      ;(authClient.useSession as jest.Mock).mockReturnValue({
        data: {
          user: { id: '123', name: null, email: 'test@example.com' },
        },
      })
      
      render(<HomeView />)
      expect(screen.getByText('Logged in as')).toBeInTheDocument()
    })

    it('should handle session with undefined user name', () => {
      ;(authClient.useSession as jest.Mock).mockReturnValue({
        data: {
          user: { id: '123', email: 'test@example.com' },
        },
      })
      
      render(<HomeView />)
      expect(screen.getByText(/Logged in as/)).toBeInTheDocument()
    })

    it('should handle undefined session gracefully', () => {
      ;(authClient.useSession as jest.Mock).mockReturnValue({
        data: undefined,
      })
      
      render(<HomeView />)
      expect(screen.getByText('...Loading')).toBeInTheDocument()
    })

    it('should handle empty session object', () => {
      ;(authClient.useSession as jest.Mock).mockReturnValue({
        data: {},
      })
      
      render(<HomeView />)
      expect(screen.getByText('...Loading')).toBeInTheDocument()
    })
  })

  describe('signOut error handling', () => {
    it('should handle signOut errors gracefully', async () => {
      const mockError = new Error('Sign out failed')
      ;(authClient.signOut as jest.Mock).mockRejectedValue(mockError)
      
      ;(authClient.useSession as jest.Mock).mockReturnValue({
        data: {
          user: { id: '123', name: 'John Doe', email: 'john@example.com' },
        },
      })
      
      render(<HomeView />)
      const signOutButton = screen.getByText('Sign Out')
      
      fireEvent.click(signOutButton)
      
      // Component should not crash
      expect(screen.getByText('Sign Out')).toBeInTheDocument()
    })
  })
})