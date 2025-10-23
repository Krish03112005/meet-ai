import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignInView } from '@/modules/auth/ui/views/sign-in-view'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

// Mock dependencies
jest.mock('@/lib/auth-client', () => ({
  authClient: {
    signIn: {
      email: jest.fn(),
      social: jest.fn(),
    },
  },
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }) => <a href={href}>{children}</a>,
}))

// Mock UI components
jest.mock('@/components/ui/input', () => ({
  Input: React.forwardRef((props, ref) => <input ref={ref} {...props} />),
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, type, disabled, ...props }) => (
    <button onClick={onClick} type={type} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}))

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }) => <div data-testid="card" {...props}>{children}</div>,
  CardContent: ({ children, ...props }) => <div data-testid="card-content" {...props}>{children}</div>,
}))

jest.mock('@/components/ui/alert', () => ({
  Alert: ({ children, ...props }) => <div data-testid="alert" {...props}>{children}</div>,
  AlertTitle: ({ children, ...props }) => <div data-testid="alert-title" {...props}>{children}</div>,
}))

jest.mock('@/components/ui/form', () => ({
  Form: ({ children, ...props }) => <div {...props}>{children}</div>,
  FormControl: ({ children, ...props }) => <div {...props}>{children}</div>,
  FormField: ({ render, control, name }) => {
    const field = { value: '', onChange: jest.fn(), name }
    return render({ field })
  },
  FormItem: ({ children, ...props }) => <div {...props}>{children}</div>,
  FormLabel: ({ children, ...props }) => <label {...props}>{children}</label>,
  FormMessage: ({ ...props }) => <span {...props} />,
}))

jest.mock('react-icons/fa', () => ({
  FaGithub: () => <span>GitHub Icon</span>,
  FaGoogle: () => <span>Google Icon</span>,
}))

jest.mock('lucide-react', () => ({
  OctagonAlertIcon: () => <span>Alert Icon</span>,
}))

describe('SignInView', () => {
  const mockPush = jest.fn()
  const mockEmailSignIn = authClient.signIn.email as jest.Mock
  const mockSocialSignIn = authClient.signIn.social as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
  })

  describe('rendering', () => {
    it('should render the sign in form', () => {
      render(<SignInView />)
      expect(screen.getByText('Welcome Back')).toBeInTheDocument()
      expect(screen.getByText('Login to your account')).toBeInTheDocument()
    })

    it('should render email input field', () => {
      render(<SignInView />)
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('m@example.com')).toBeInTheDocument()
    })

    it('should render password input field', () => {
      render(<SignInView />)
      expect(screen.getByText('Password')).toBeInTheDocument()
    })

    it('should render sign in button', () => {
      render(<SignInView />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.some(btn => btn.textContent === 'Sign In')).toBeTruthy()
    })

    it('should render social sign in buttons', () => {
      render(<SignInView />)
      expect(screen.getByText('Google Icon')).toBeInTheDocument()
      expect(screen.getByText('GitHub Icon')).toBeInTheDocument()
    })

    it('should render link to sign up page', () => {
      render(<SignInView />)
      expect(screen.getByText('Sign Up')).toBeInTheDocument()
      const link = screen.getByText('Sign Up').closest('a')
      expect(link).toHaveAttribute('href', '/sign-up')
    })

    it('should render terms and privacy policy links', () => {
      render(<SignInView />)
      expect(screen.getByText('Terms of Service')).toBeInTheDocument()
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
    })

    it('should not show error alert initially', () => {
      render(<SignInView />)
      expect(screen.queryByTestId('alert')).not.toBeInTheDocument()
    })
  })

  describe('email sign in', () => {
    it('should call signIn.email with correct data on form submit', async () => {
      mockEmailSignIn.mockImplementation((data, callbacks) => {
        callbacks.onSuccess()
      })

      render(<SignInView />)
      
      const emailInput = screen.getByPlaceholderText('m@example.com')
      const passwordInputs = screen.getAllByPlaceholderText(/pass/)
      const passwordInput = passwordInputs[0]
      
      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'password123')
      
      const form = emailInput.closest('form')
      fireEvent.submit(form!)
      
      await waitFor(() => {
        expect(mockEmailSignIn).toHaveBeenCalledWith(
          {
            email: 'test@example.com',
            password: 'password123',
            callbackURL: '/',
          },
          expect.objectContaining({
            onSuccess: expect.any(Function),
            onError: expect.any(Function),
          })
        )
      })
    })

    it('should redirect to home page on successful sign in', async () => {
      mockEmailSignIn.mockImplementation((data, callbacks) => {
        callbacks.onSuccess()
      })

      render(<SignInView />)
      
      const emailInput = screen.getByPlaceholderText('m@example.com')
      const passwordInputs = screen.getAllByPlaceholderText(/pass/)
      const passwordInput = passwordInputs[0]
      
      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'password123')
      
      const form = emailInput.closest('form')
      fireEvent.submit(form!)
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/')
      })
    })

    it('should display error message on sign in failure', async () => {
      mockEmailSignIn.mockImplementation((data, callbacks) => {
        callbacks.onError({ error: { message: 'Invalid credentials' } })
      })

      render(<SignInView />)
      
      const emailInput = screen.getByPlaceholderText('m@example.com')
      const passwordInputs = screen.getAllByPlaceholderText(/pass/)
      const passwordInput = passwordInputs[0]
      
      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'wrongpassword')
      
      const form = emailInput.closest('form')
      fireEvent.submit(form!)
      
      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      })
    })

    it('should disable submit button while signing in', async () => {
      mockEmailSignIn.mockImplementation((data, callbacks) => {
        // Don't call callbacks to simulate pending state
      })

      render(<SignInView />)
      
      const emailInput = screen.getByPlaceholderText('m@example.com')
      const passwordInputs = screen.getAllByPlaceholderText(/pass/)
      const passwordInput = passwordInputs[0]
      
      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'password123')
      
      const form = emailInput.closest('form')
      const submitButtons = screen.getAllByRole('button')
      const signInButton = submitButtons.find(btn => btn.textContent === 'Sign In')
      
      fireEvent.submit(form!)
      
      await waitFor(() => {
        expect(signInButton).toBeDisabled()
      })
    })

    it('should clear error on new submission', async () => {
      mockEmailSignIn
        .mockImplementationOnce((data, callbacks) => {
          callbacks.onError({ error: { message: 'First error' } })
        })
        .mockImplementationOnce((data, callbacks) => {
          callbacks.onSuccess()
        })

      render(<SignInView />)
      
      const emailInput = screen.getByPlaceholderText('m@example.com')
      const passwordInputs = screen.getAllByPlaceholderText(/pass/)
      const passwordInput = passwordInputs[0]
      
      // First submission with error
      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'wrong')
      
      const form = emailInput.closest('form')
      fireEvent.submit(form!)
      
      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument()
      })
      
      // Second submission should clear error
      await userEvent.clear(passwordInput)
      await userEvent.type(passwordInput, 'correct')
      fireEvent.submit(form!)
      
      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument()
      })
    })
  })

  describe('social sign in', () => {
    it('should call signIn.social with google provider', async () => {
      mockSocialSignIn.mockImplementation((data, callbacks) => {
        callbacks.onSuccess()
      })

      render(<SignInView />)
      
      const buttons = screen.getAllByRole('button')
      const googleButton = buttons.find(btn => 
        btn.textContent?.includes('Google Icon')
      )
      
      fireEvent.click(googleButton!)
      
      await waitFor(() => {
        expect(mockSocialSignIn).toHaveBeenCalledWith(
          {
            provider: 'google',
            callbackURL: '/',
          },
          expect.objectContaining({
            onSuccess: expect.any(Function),
            onError: expect.any(Function),
          })
        )
      })
    })

    it('should call signIn.social with github provider', async () => {
      mockSocialSignIn.mockImplementation((data, callbacks) => {
        callbacks.onSuccess()
      })

      render(<SignInView />)
      
      const buttons = screen.getAllByRole('button')
      const githubButton = buttons.find(btn => 
        btn.textContent?.includes('GitHub Icon')
      )
      
      fireEvent.click(githubButton!)
      
      await waitFor(() => {
        expect(mockSocialSignIn).toHaveBeenCalledWith(
          {
            provider: 'github',
            callbackURL: '/',
          },
          expect.objectContaining({
            onSuccess: expect.any(Function),
            onError: expect.any(Function),
          })
        )
      })
    })

    it('should display error on social sign in failure', async () => {
      mockSocialSignIn.mockImplementation((data, callbacks) => {
        callbacks.onError({ error: { message: 'Social auth failed' } })
      })

      render(<SignInView />)
      
      const buttons = screen.getAllByRole('button')
      const googleButton = buttons.find(btn => 
        btn.textContent?.includes('Google Icon')
      )
      
      fireEvent.click(googleButton!)
      
      await waitFor(() => {
        expect(screen.getByText('Social auth failed')).toBeInTheDocument()
      })
    })

    it('should disable social buttons while signing in', async () => {
      mockSocialSignIn.mockImplementation((data, callbacks) => {
        // Don't call callbacks to simulate pending
      })

      render(<SignInView />)
      
      const buttons = screen.getAllByRole('button')
      const googleButton = buttons.find(btn => 
        btn.textContent?.includes('Google Icon')
      )
      const githubButton = buttons.find(btn => 
        btn.textContent?.includes('GitHub Icon')
      )
      
      fireEvent.click(googleButton!)
      
      await waitFor(() => {
        expect(googleButton).toBeDisabled()
        expect(githubButton).toBeDisabled()
      })
    })
  })

  describe('form validation', () => {
    it('should have email type for email input', () => {
      render(<SignInView />)
      const emailInput = screen.getByPlaceholderText('m@example.com')
      expect(emailInput).toHaveAttribute('type', 'email')
    })

    it('should have password type for password input', () => {
      render(<SignInView />)
      const passwordInputs = screen.getAllByPlaceholderText(/pass/)
      expect(passwordInputs[0]).toHaveAttribute('type', 'password')
    })
  })

  describe('edge cases', () => {
    it('should handle empty email submission', async () => {
      render(<SignInView />)
      
      const form = screen.getByPlaceholderText('m@example.com').closest('form')
      fireEvent.submit(form!)
      
      // Form should not submit with empty fields due to validation
      expect(mockEmailSignIn).not.toHaveBeenCalled()
    })

    it('should handle network errors gracefully', async () => {
      mockEmailSignIn.mockImplementation((data, callbacks) => {
        callbacks.onError({ error: { message: 'Network error' } })
      })

      render(<SignInView />)
      
      const emailInput = screen.getByPlaceholderText('m@example.com')
      const passwordInputs = screen.getAllByPlaceholderText(/pass/)
      
      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInputs[0], 'password')
      
      const form = emailInput.closest('form')
      fireEvent.submit(form!)
      
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })
    })

    it('should handle special characters in password', async () => {
      mockEmailSignIn.mockImplementation((data, callbacks) => {
        callbacks.onSuccess()
      })

      render(<SignInView />)
      
      const emailInput = screen.getByPlaceholderText('m@example.com')
      const passwordInputs = screen.getAllByPlaceholderText(/pass/)
      
      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInputs[0], 'P@ssw0rd!#$%')
      
      const form = emailInput.closest('form')
      fireEvent.submit(form!)
      
      await waitFor(() => {
        expect(mockEmailSignIn).toHaveBeenCalledWith(
          expect.objectContaining({
            password: 'P@ssw0rd!#$%',
          }),
          expect.anything()
        )
      })
    })
  })

  describe('accessibility', () => {
    it('should have proper labels for inputs', () => {
      render(<SignInView />)
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Password')).toBeInTheDocument()
    })

    it('should have submit button with proper type', () => {
      render(<SignInView />)
      const buttons = screen.getAllByRole('button')
      const signInButton = buttons.find(btn => btn.textContent === 'Sign In')
      expect(signInButton).toHaveAttribute('type', 'submit')
    })

    it('should have social buttons with button type', () => {
      render(<SignInView />)
      const buttons = screen.getAllByRole('button')
      const socialButtons = buttons.filter(btn => 
        btn.textContent?.includes('Icon') && btn.textContent !== 'Alert Icon'
      )
      socialButtons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button')
      })
    })
  })
})