import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignUpView } from '@/modules/auth/ui/views/sign-up-view'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

// Mock dependencies
jest.mock('@/lib/auth-client', () => ({
  authClient: {
    signUp: {
      email: jest.fn(),
    },
    signIn: {
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

describe('SignUpView', () => {
  const mockPush = jest.fn()
  const mockEmailSignUp = authClient.signUp.email as jest.Mock
  const mockSocialSignIn = authClient.signIn.social as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
  })

  describe('rendering', () => {
    it('should render the sign up form', () => {
      render(<SignUpView />)
      expect(screen.getByText("Let's get started.")).toBeInTheDocument()
      expect(screen.getByText('Create your account')).toBeInTheDocument()
    })

    it('should render name input field', () => {
      render(<SignUpView />)
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument()
    })

    it('should render email input field', () => {
      render(<SignUpView />)
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('m@example.com')).toBeInTheDocument()
    })

    it('should render password input field', () => {
      render(<SignUpView />)
      const passwordLabels = screen.getAllByText('Password')
      expect(passwordLabels.length).toBeGreaterThan(0)
    })

    it('should render confirm password field', () => {
      render(<SignUpView />)
      expect(screen.getByText('Confirm Password')).toBeInTheDocument()
    })

    it('should render sign up button', () => {
      render(<SignUpView />)
      const buttons = screen.getAllByRole('button')
      // Note: The button text says "Sign In" but it should be "Sign Up" (bug in original code)
      expect(buttons.some(btn => btn.textContent === 'Sign In')).toBeTruthy()
    })

    it('should render social sign up buttons', () => {
      render(<SignUpView />)
      expect(screen.getByText('Google Icon')).toBeInTheDocument()
      expect(screen.getByText('GitHub Icon')).toBeInTheDocument()
    })

    it('should render link to sign in page', () => {
      render(<SignUpView />)
      expect(screen.getByText('Sign In')).toBeInTheDocument()
      const link = screen.getByText('Sign In').closest('a')
      expect(link).toHaveAttribute('href', '/sign-in')
    })

    it('should not show error alert initially', () => {
      render(<SignUpView />)
      expect(screen.queryByTestId('alert')).not.toBeInTheDocument()
    })
  })

  describe('email sign up', () => {
    it('should call signUp.email with correct data on form submit', async () => {
      mockEmailSignUp.mockImplementation((data, callbacks) => {
        callbacks.onSuccess()
      })

      render(<SignUpView />)
      
      const nameInput = screen.getByPlaceholderText('John Doe')
      const emailInput = screen.getByPlaceholderText('m@example.com')
      const passwordInputs = screen.getAllByPlaceholderText(/pass/)
      
      await userEvent.type(nameInput, 'Test User')
      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInputs[0], 'password123')
      await userEvent.type(passwordInputs[1], 'password123')
      
      const form = nameInput.closest('form')
      fireEvent.submit(form!)
      
      await waitFor(() => {
        expect(mockEmailSignUp).toHaveBeenCalledWith(
          {
            name: 'Test User',
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

    it('should redirect to home page on successful sign up', async () => {
      mockEmailSignUp.mockImplementation((data, callbacks) => {
        callbacks.onSuccess()
      })

      render(<SignUpView />)
      
      const nameInput = screen.getByPlaceholderText('John Doe')
      const emailInput = screen.getByPlaceholderText('m@example.com')
      const passwordInputs = screen.getAllByPlaceholderText(/pass/)
      
      await userEvent.type(nameInput, 'Test User')
      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInputs[0], 'password123')
      await userEvent.type(passwordInputs[1], 'password123')
      
      const form = nameInput.closest('form')
      fireEvent.submit(form!)
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/')
      })
    })

    it('should display error message on sign up failure', async () => {
      mockEmailSignUp.mockImplementation((data, callbacks) => {
        callbacks.onError({ error: { message: 'Email already exists' } })
      })

      render(<SignUpView />)
      
      const nameInput = screen.getByPlaceholderText('John Doe')
      const emailInput = screen.getByPlaceholderText('m@example.com')
      const passwordInputs = screen.getAllByPlaceholderText(/pass/)
      
      await userEvent.type(nameInput, 'Test User')
      await userEvent.type(emailInput, 'existing@example.com')
      await userEvent.type(passwordInputs[0], 'password123')
      await userEvent.type(passwordInputs[1], 'password123')
      
      const form = nameInput.closest('form')
      fireEvent.submit(form!)
      
      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument()
      })
    })

    it('should disable submit button while signing up', async () => {
      mockEmailSignUp.mockImplementation(() => {
        // Don't call callbacks to simulate pending
      })

      render(<SignUpView />)
      
      const nameInput = screen.getByPlaceholderText('John Doe')
      const emailInput = screen.getByPlaceholderText('m@example.com')
      const passwordInputs = screen.getAllByPlaceholderText(/pass/)
      
      await userEvent.type(nameInput, 'Test User')
      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInputs[0], 'password123')
      await userEvent.type(passwordInputs[1], 'password123')
      
      const form = nameInput.closest('form')
      const buttons = screen.getAllByRole('button')
      const submitButton = buttons.find(btn => btn.getAttribute('type') === 'submit')
      
      fireEvent.submit(form!)
      
      await waitFor(() => {
        expect(submitButton).toBeDisabled()
      })
    })
  })

  describe('social sign up', () => {
    it('should call signIn.social with google provider', async () => {
      mockSocialSignIn.mockImplementation((data, callbacks) => {
        callbacks.onSuccess()
      })

      render(<SignUpView />)
      
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

      render(<SignUpView />)
      
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

    it('should display error on social sign up failure', async () => {
      mockSocialSignIn.mockImplementation((data, callbacks) => {
        callbacks.onError({ error: { message: 'Social auth failed' } })
      })

      render(<SignUpView />)
      
      const buttons = screen.getAllByRole('button')
      const googleButton = buttons.find(btn => 
        btn.textContent?.includes('Google Icon')
      )
      
      fireEvent.click(googleButton!)
      
      await waitFor(() => {
        expect(screen.getByText('Social auth failed')).toBeInTheDocument()
      })
    })
  })

  describe('form validation', () => {
    it('should have text type for name input', () => {
      render(<SignUpView />)
      const nameInput = screen.getByPlaceholderText('John Doe')
      expect(nameInput).toHaveAttribute('type', 'text')
    })

    it('should have email type for email input', () => {
      render(<SignUpView />)
      const emailInput = screen.getByPlaceholderText('m@example.com')
      expect(emailInput).toHaveAttribute('type', 'email')
    })

    it('should have password type for password inputs', () => {
      render(<SignUpView />)
      const passwordInputs = screen.getAllByPlaceholderText(/pass/)
      passwordInputs.forEach(input => {
        expect(input).toHaveAttribute('type', 'password')
      })
    })

    it('should require all fields', () => {
      render(<SignUpView />)
      
      const form = screen.getByPlaceholderText('John Doe').closest('form')
      fireEvent.submit(form!)
      
      // Should not submit with empty fields
      expect(mockEmailSignUp).not.toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('should handle long names', async () => {
      mockEmailSignUp.mockImplementation((data, callbacks) => {
        callbacks.onSuccess()
      })

      render(<SignUpView />)
      
      const nameInput = screen.getByPlaceholderText('John Doe')
      const emailInput = screen.getByPlaceholderText('m@example.com')
      const passwordInputs = screen.getAllByPlaceholderText(/pass/)
      
      const longName = 'A'.repeat(100)
      await userEvent.type(nameInput, longName)
      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInputs[0], 'password123')
      await userEvent.type(passwordInputs[1], 'password123')
      
      const form = nameInput.closest('form')
      fireEvent.submit(form!)
      
      await waitFor(() => {
        expect(mockEmailSignUp).toHaveBeenCalledWith(
          expect.objectContaining({
            name: longName,
          }),
          expect.anything()
        )
      })
    })

    it('should handle special characters in name', async () => {
      mockEmailSignUp.mockImplementation((data, callbacks) => {
        callbacks.onSuccess()
      })

      render(<SignUpView />)
      
      const nameInput = screen.getByPlaceholderText('John Doe')
      const emailInput = screen.getByPlaceholderText('m@example.com')
      const passwordInputs = screen.getAllByPlaceholderText(/pass/)
      
      await userEvent.type(nameInput, "O'Brien-Smith")
      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInputs[0], 'password123')
      await userEvent.type(passwordInputs[1], 'password123')
      
      const form = nameInput.closest('form')
      fireEvent.submit(form!)
      
      await waitFor(() => {
        expect(mockEmailSignUp).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "O'Brien-Smith",
          }),
          expect.anything()
        )
      })
    })

    it('should handle network errors', async () => {
      mockEmailSignUp.mockImplementation((data, callbacks) => {
        callbacks.onError({ error: { message: 'Network error' } })
      })

      render(<SignUpView />)
      
      const nameInput = screen.getByPlaceholderText('John Doe')
      const emailInput = screen.getByPlaceholderText('m@example.com')
      const passwordInputs = screen.getAllByPlaceholderText(/pass/)
      
      await userEvent.type(nameInput, 'Test')
      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInputs[0], 'pass')
      await userEvent.type(passwordInputs[1], 'pass')
      
      const form = nameInput.closest('form')
      fireEvent.submit(form!)
      
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })
    })
  })

  describe('accessibility', () => {
    it('should have proper labels for all inputs', () => {
      render(<SignUpView />)
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getAllByText('Password').length).toBeGreaterThan(0)
      expect(screen.getByText('Confirm Password')).toBeInTheDocument()
    })

    it('should have submit button with proper type', () => {
      render(<SignUpView />)
      const buttons = screen.getAllByRole('button')
      const submitButton = buttons.find(btn => btn.getAttribute('type') === 'submit')
      expect(submitButton).toBeDefined()
    })

    it('should have social buttons with button type', () => {
      render(<SignUpView />)
      const buttons = screen.getAllByRole('button')
      const socialButtons = buttons.filter(btn => 
        btn.textContent?.includes('Icon') && btn.textContent !== 'Alert Icon'
      )
      socialButtons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button')
      })
    })
  })

  describe('password matching', () => {
    it('should accept matching passwords', async () => {
      mockEmailSignUp.mockImplementation((data, callbacks) => {
        callbacks.onSuccess()
      })

      render(<SignUpView />)
      
      const nameInput = screen.getByPlaceholderText('John Doe')
      const emailInput = screen.getByPlaceholderText('m@example.com')
      const passwordInputs = screen.getAllByPlaceholderText(/pass/)
      
      await userEvent.type(nameInput, 'Test User')
      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInputs[0], 'SamePassword123')
      await userEvent.type(passwordInputs[1], 'SamePassword123')
      
      const form = nameInput.closest('form')
      fireEvent.submit(form!)
      
      await waitFor(() => {
        expect(mockEmailSignUp).toHaveBeenCalled()
      })
    })
  })
})