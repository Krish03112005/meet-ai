import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DashboardUserButton } from '../dashboard-user-button'
import { useRouter } from 'next/navigation'

// Mock the auth client
const mockSignOut = vi.fn()
const mockUseSession = vi.fn()

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: () => mockUseSession(),
    signOut: mockSignOut,
  },
}))

vi.mock('@/components/generated-avatar', () => ({
  GeneratedAvatar: ({ seed, variant, className }: any) => (
    <div data-testid="generated-avatar" data-seed={seed} data-variant={variant} className={className}>
      Avatar: {seed}
    </div>
  ),
}))

describe('DashboardUserButton', () => {
  const mockPush = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    } as any)
  })

  describe('Loading and Null States', () => {
    it('should return null when session is pending', () => {
      mockUseSession.mockReturnValue({
        data: null,
        isPending: true,
      })

      const { container } = render(<DashboardUserButton />)
      expect(container.firstChild).toBeNull()
    })

    it('should return null when user data is not available', () => {
      mockUseSession.mockReturnValue({
        data: null,
        isPending: false,
      })

      const { container } = render(<DashboardUserButton />)
      expect(container.firstChild).toBeNull()
    })

    it('should return null when session exists but user is missing', () => {
      mockUseSession.mockReturnValue({
        data: { user: null },
        isPending: false,
      })

      const { container } = render(<DashboardUserButton />)
      expect(container.firstChild).toBeNull()
    })
  })

  describe('User Display with Image', () => {
    const mockUserWithImage = {
      data: {
        user: {
          name: 'John Doe',
          email: 'john@example.com',
          image: 'https://example.com/avatar.jpg',
        },
      },
      isPending: false,
    }

    it('should render user button with user image when available', () => {
      mockUseSession.mockReturnValue(mockUserWithImage)

      render(<DashboardUserButton />)
      
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
    })

    it('should display user image with correct src', () => {
      mockUseSession.mockReturnValue(mockUserWithImage)

      const { container } = render(<DashboardUserButton />)
      
      const avatarImage = container.querySelector('[data-slot="avatar-image"]')
      expect(avatarImage).toHaveAttribute('src', 'https://example.com/avatar.jpg')
    })

    it('should not render GeneratedAvatar when user has image', () => {
      mockUseSession.mockReturnValue(mockUserWithImage)

      render(<DashboardUserButton />)
      
      expect(screen.queryByTestId('generated-avatar')).not.toBeInTheDocument()
    })
  })

  describe('User Display without Image', () => {
    const mockUserWithoutImage = {
      data: {
        user: {
          name: 'Jane Smith',
          email: 'jane@example.com',
          image: null,
        },
      },
      isPending: false,
    }

    it('should render GeneratedAvatar when user has no image', () => {
      mockUseSession.mockReturnValue(mockUserWithoutImage)

      render(<DashboardUserButton />)
      
      const avatar = screen.getByTestId('generated-avatar')
      expect(avatar).toBeInTheDocument()
      expect(avatar).toHaveAttribute('data-seed', 'Jane Smith')
      expect(avatar).toHaveAttribute('data-variant', 'initials')
    })

    it('should use initials variant for generated avatar', () => {
      mockUseSession.mockReturnValue(mockUserWithoutImage)

      render(<DashboardUserButton />)
      
      const avatar = screen.getByTestId('generated-avatar')
      expect(avatar).toHaveAttribute('data-variant', 'initials')
    })

    it('should apply correct className to generated avatar', () => {
      mockUseSession.mockReturnValue(mockUserWithoutImage)

      render(<DashboardUserButton />)
      
      const avatar = screen.getByTestId('generated-avatar')
      expect(avatar).toHaveClass('size-9', 'mr-3')
    })
  })

  describe('Dropdown Menu Interaction', () => {
    const mockUser = {
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
          image: null,
        },
      },
      isPending: false,
    }

    it('should toggle dropdown menu on button click', async () => {
      mockUseSession.mockReturnValue(mockUser)

      render(<DashboardUserButton />)
      
      const trigger = screen.getByRole('button')
      fireEvent.click(trigger)
      
      await waitFor(() => {
        const dropdownItems = screen.getAllByText('Test User')
        expect(dropdownItems.length).toBeGreaterThan(1)
      })
    })

    it('should display user info in dropdown menu label', async () => {
      mockUseSession.mockReturnValue(mockUser)

      render(<DashboardUserButton />)
      
      const trigger = screen.getByRole('button')
      fireEvent.click(trigger)
      
      await waitFor(() => {
        const nameElements = screen.getAllByText('Test User')
        const emailElements = screen.getAllByText('test@example.com')
        expect(nameElements.length).toBeGreaterThan(0)
        expect(emailElements.length).toBeGreaterThan(0)
      })
    })

    it('should show Billing menu item', async () => {
      mockUseSession.mockReturnValue(mockUser)

      render(<DashboardUserButton />)
      
      const trigger = screen.getByRole('button')
      fireEvent.click(trigger)
      
      await waitFor(() => {
        expect(screen.getByText('Billing')).toBeInTheDocument()
      })
    })

    it('should show Logout menu item', async () => {
      mockUseSession.mockReturnValue(mockUser)

      render(<DashboardUserButton />)
      
      const trigger = screen.getByRole('button')
      fireEvent.click(trigger)
      
      await waitFor(() => {
        expect(screen.getByText('Logout')).toBeInTheDocument()
      })
    })
  })

  describe('Logout Functionality', () => {
    const mockUser = {
      data: {
        user: {
          name: 'Logout Test',
          email: 'logout@example.com',
          image: null,
        },
      },
      isPending: false,
    }

    it('should call signOut when logout is clicked', async () => {
      mockUseSession.mockReturnValue(mockUser)
      mockSignOut.mockImplementation(({ fetchOptions }: any) => {
        fetchOptions.onSuccess()
      })

      render(<DashboardUserButton />)
      
      const trigger = screen.getByRole('button')
      fireEvent.click(trigger)
      
      await waitFor(() => {
        const logoutButton = screen.getByText('Logout')
        fireEvent.click(logoutButton)
      })
      
      expect(mockSignOut).toHaveBeenCalled()
    })

    it('should redirect to sign-in page after successful logout', async () => {
      mockUseSession.mockReturnValue(mockUser)
      mockSignOut.mockImplementation(({ fetchOptions }: any) => {
        fetchOptions.onSuccess()
      })

      render(<DashboardUserButton />)
      
      const trigger = screen.getByRole('button')
      fireEvent.click(trigger)
      
      await waitFor(() => {
        const logoutButton = screen.getByText('Logout')
        fireEvent.click(logoutButton)
      })
      
      expect(mockPush).toHaveBeenCalledWith('/sign-in')
    })

    it('should pass correct options to signOut', async () => {
      mockUseSession.mockReturnValue(mockUser)

      render(<DashboardUserButton />)
      
      const trigger = screen.getByRole('button')
      fireEvent.click(trigger)
      
      await waitFor(() => {
        const logoutButton = screen.getByText('Logout')
        fireEvent.click(logoutButton)
      })
      
      expect(mockSignOut).toHaveBeenCalledWith(
        expect.objectContaining({
          fetchOptions: expect.objectContaining({
            onSuccess: expect.any(Function),
          }),
        })
      )
    })
  })

  describe('UI Elements and Styling', () => {
    const mockUser = {
      data: {
        user: {
          name: 'Style Test',
          email: 'style@example.com',
          image: null,
        },
      },
      isPending: false,
    }

    it('should render ChevronDown icon', () => {
      mockUseSession.mockReturnValue(mockUser)

      const { container } = render(<DashboardUserButton />)
      
      const chevron = container.querySelector('.lucide-chevron-down')
      expect(chevron).toBeInTheDocument()
    })

    it('should apply correct styling classes to trigger button', () => {
      mockUseSession.mockReturnValue(mockUser)

      render(<DashboardUserButton />)
      
      const trigger = screen.getByRole('button')
      expect(trigger).toHaveClass('rounded-lg')
      expect(trigger).toHaveClass('border')
    })

    it('should truncate long user names', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            name: 'Very Long User Name That Should Be Truncated',
            email: 'long@example.com',
            image: null,
          },
        },
        isPending: false,
      })

      const { container } = render(<DashboardUserButton />)
      
      const nameElement = container.querySelector('.truncate')
      expect(nameElement).toBeInTheDocument()
    })

    it('should truncate long email addresses', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            name: 'User',
            email: 'very.long.email.address@example.com',
            image: null,
          },
        },
        isPending: false,
      })

      render(<DashboardUserButton />)
      
      const email = screen.getByText('very.long.email.address@example.com')
      expect(email.parentElement).toHaveClass('truncate')
    })
  })

  describe('Edge Cases', () => {
    it('should handle user with empty name', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            name: '',
            email: 'empty@example.com',
            image: null,
          },
        },
        isPending: false,
      })

      render(<DashboardUserButton />)
      
      expect(screen.getByText('empty@example.com')).toBeInTheDocument()
    })

    it('should handle user with empty email', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            name: 'No Email User',
            email: '',
            image: null,
          },
        },
        isPending: false,
      })

      render(<DashboardUserButton />)
      
      expect(screen.getByText('No Email User')).toBeInTheDocument()
    })

    it('should handle user with undefined image', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            name: 'Undefined Image',
            email: 'undefined@example.com',
            image: undefined,
          },
        },
        isPending: false,
      })

      render(<DashboardUserButton />)
      
      expect(screen.getByTestId('generated-avatar')).toBeInTheDocument()
    })

    it('should handle user with special characters in name', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            name: 'User <script>alert("xss")</script>',
            email: 'user@example.com',
            image: null,
          },
        },
        isPending: false,
      })

      expect(() => render(<DashboardUserButton />)).not.toThrow()
    })
  })

  describe('Accessibility', () => {
    const mockUser = {
      data: {
        user: {
          name: 'Accessible User',
          email: 'accessible@example.com',
          image: null,
        },
      },
      isPending: false,
    }

    it('should have accessible button role', () => {
      mockUseSession.mockReturnValue(mockUser)

      render(<DashboardUserButton />)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should have clickable menu items', async () => {
      mockUseSession.mockReturnValue(mockUser)

      render(<DashboardUserButton />)
      
      const trigger = screen.getByRole('button')
      fireEvent.click(trigger)
      
      await waitFor(() => {
        const logoutItem = screen.getByText('Logout')
        expect(logoutItem.closest('[role="menuitem"]')).toBeInTheDocument()
      })
    })

    it('should display icons with proper classes', async () => {
      mockUseSession.mockReturnValue(mockUser)

      render(<DashboardUserButton />)
      
      const trigger = screen.getByRole('button')
      fireEvent.click(trigger)
      
      await waitFor(() => {
        const { container } = render(<DashboardUserButton />)
        const icons = container.querySelectorAll('svg')
        expect(icons.length).toBeGreaterThan(0)
      })
    })
  })
})