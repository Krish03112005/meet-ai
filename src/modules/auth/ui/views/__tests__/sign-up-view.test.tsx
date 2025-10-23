import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignUpView } from '../sign-up-view'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

// Mock the auth client and router
jest.mock('@/lib/auth-client')
jest.mock('next/navigation')

const mockPush = jest.fn()
const mockSignUpEmail = jest.fn()
const mockSignInSocial = jest.fn()

describe('SignUpView Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    ;(authClient.signUp.email as jest.Mock) = mockSignUpEmail
    ;(authClient.signIn.social as jest.Mock) = mockSignInSocial
  })

  describe('Rendering', () => {
    it('should render all form elements', () => {
      render(<SignUpView />)
      
      expect(screen.getByText("Let's get started.")).toBeInTheDocument()
      expect(screen.getByText('Create your account')).toBeInTheDocument()
      expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    })

    it('should render submit button', () => {
      render(<SignUpView />)
      
      // Note: The button text says "Sign In" but it's on the sign-up page (potential bug)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      expect(submitButton).toBeInTheDocument()
    })

    it('should render social login buttons', () => {
      render(<SignUpView />)
      
      const buttons = screen.getAllByRole('button')
      // Submit button + Google + GitHub
      expect(buttons).toHaveLength(3)
    })

    it('should render link to sign in page', () => {
      render(<SignUpView />)
      
      expect(screen.getByText("Don't have an account?")).toBeInTheDocument()
      const signInLink = screen.getByRole('link', { name: /sign in/i })
      expect(signInLink).toHaveAttribute('href', '/sign-in')
    })

    it('should render terms and privacy policy links', () => {
      render(<SignUpView />)
      
      expect(screen.getByText(/terms of service/i)).toBeInTheDocument()
      expect(screen.getByText(/privacy policy/i)).toBeInTheDocument()
    })

    it('should not show error alert initially', () => {
      render(<SignUpView />)
      
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('Form Validation - Name Field', () => {
    it('should show error for empty name', async () => {
      const user = userEvent.setup()
      render(<SignUpView />)
      
      const nameInput = screen.getByLabelText(/^name$/i)
      const emailInput = screen.getByLabelText(/email/i)
      
      await user.click(nameInput)
      await user.click(emailInput) // Move focus away
      
      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument()
      })
    })

    it('should accept valid name', async () => {
      const user = userEvent.setup()
      render(<SignUpView />)
      
      const nameInput = screen.getByLabelText(/^name$/i)
      await user.type(nameInput, 'John Doe')
      
      expect(nameInput).toHaveValue('John Doe')
    })

    it('should accept names with special characters', async () => {
      const user = userEvent.setup()
      render(<SignUpView />)
      
      const nameInput = screen.getByLabelText(/^name$/i)
      await user.type(nameInput, "O'Connor-Smith")
      
      expect(nameInput).toHaveValue("O'Connor-Smith")
    })
  })

  describe('Form Validation - Email Field', () => {
    it('should show error for empty email', async () => {
      const user = userEvent.setup()
      render(<SignUpView />)
      
      const emailInput = screen.getByLabelText(/email/i)
      await user.click(emailInput)
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
      })
    })

    it('should show error for invalid email format', async () => {
      const user = userEvent.setup()
      render(<SignUpView />)
      
      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'not-an-email')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
      })
    })

    it('should accept valid email', async () => {
      const user = userEvent.setup()
      render(<SignUpView />)
      
      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'john@example.com')
      
      expect(emailInput).toHaveValue('john@example.com')
    })
  })

  describe('Form Validation - Password Fields', () => {
    it('should show error for empty password', async () => {
      const user = userEvent.setup()
      render(<SignUpView />)
      
      const nameInput = screen.getByLabelText(/^name$/i)
      const emailInput = screen.getByLabelText(/email/i)
      
      await user.type(nameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument()
      })
    })

    it('should show error for empty confirm password', async () => {
      const user = userEvent.setup()
      render(<SignUpView />)
      
      const nameInput = screen.getByLabelText(/^name$/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      
      await user.type(nameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      await user.type(passwordInput, 'password123')
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/confirm password is required/i)).toBeInTheDocument()
      })
    })

    it('should show error when passwords do not match', async () => {
      const user = userEvent.setup()
      render(<SignUpView />)
      
      const nameInput = screen.getByLabelText(/^name$/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      
      await user.type(nameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password456')
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
      })
    })

    it('should accept matching passwords', async () => {
      const user = userEvent.setup()
      
      mockSignUpEmail.mockImplementation((data, callbacks) => {
        callbacks.onSuccess()
      })
      
      render(<SignUpView />)
      
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      
      expect(passwordInput).toHaveValue('password123')
      expect(confirmPasswordInput).toHaveValue('password123')
    })
  })

  describe('Email/Password Sign Up - Success', () => {
    it('should call authClient.signUp.email with correct data', async () => {
      const user = userEvent.setup()
      
      mockSignUpEmail.mockImplementation((data, callbacks) => {
        callbacks.onSuccess()
      })

      render(<SignUpView />)
      
      await user.type(screen.getByLabelText(/^name$/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /sign in/i }))
      
      await waitFor(() => {
        expect(mockSignUpEmail).toHaveBeenCalledWith(
          {
            name: 'John Doe',
            email: 'john@example.com',
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
      const user = userEvent.setup()
      
      mockSignUpEmail.mockImplementation((data, callbacks) => {
        callbacks.onSuccess()
      })

      render(<SignUpView />)
      
      await user.type(screen.getByLabelText(/^name$/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /sign in/i }))
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/')
      })
    })

    it('should disable submit button while pending', async () => {
      const user = userEvent.setup()
      
      mockSignUpEmail.mockImplementation(() => {
        // Never resolve to keep pending
      })

      render(<SignUpView />)
      
      await user.type(screen.getByLabelText(/^name$/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(submitButton).toBeDisabled()
      })
    })
  })

  describe('Email/Password Sign Up - Failure', () => {
    it('should display error message on sign up failure', async () => {
      const user = userEvent.setup()
      
      mockSignUpEmail.mockImplementation((data, callbacks) => {
        callbacks.onError({ error: { message: 'Email already exists' } })
      })

      render(<SignUpView />)
      
      await user.type(screen.getByLabelText(/^name$/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /sign in/i }))
      
      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument()
      })
    })

    it('should clear previous error when submitting again', async () => {
      const user = userEvent.setup()
      
      mockSignUpEmail
        .mockImplementationOnce((data, callbacks) => {
          callbacks.onError({ error: { message: 'Server error' } })
        })
        .mockImplementationOnce((data, callbacks) => {
          callbacks.onSuccess()
        })

      render(<SignUpView />)
      
      await user.type(screen.getByLabelText(/^name$/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /sign in/i }))
      
      await waitFor(() => {
        expect(screen.getByText('Server error')).toBeInTheDocument()
      })
      
      await user.click(screen.getByRole('button', { name: /sign in/i }))
      
      await waitFor(() => {
        expect(screen.queryByText('Server error')).not.toBeInTheDocument()
      })
    })
  })

  describe('Social Sign In - Google', () => {
    it('should call authClient.signIn.social with google provider', async () => {
      const user = userEvent.setup()
      
      mockSignInSocial.mockImplementation((data, callbacks) => {
        callbacks.onSuccess()
      })

      render(<SignUpView />)
      
      const buttons = screen.getAllByRole('button')
      const googleButton = buttons[1]
      
      await user.click(googleButton)
      
      await waitFor(() => {
        expect(mockSignInSocial).toHaveBeenCalledWith(
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

    it('should display error on Google sign in failure', async () => {
      const user = userEvent.setup()
      
      mockSignInSocial.mockImplementation((data, callbacks) => {
        callbacks.onError({ error: { message: 'Google OAuth failed' } })
      })

      render(<SignUpView />)
      
      const buttons = screen.getAllByRole('button')
      await user.click(buttons[1])
      
      await waitFor(() => {
        expect(screen.getByText('Google OAuth failed')).toBeInTheDocument()
      })
    })
  })

  describe('Social Sign In - GitHub', () => {
    it('should call authClient.signIn.social with github provider', async () => {
      const user = userEvent.setup()
      
      mockSignInSocial.mockImplementation((data, callbacks) => {
        callbacks.onSuccess()
      })

      render(<SignUpView />)
      
      const buttons = screen.getAllByRole('button')
      const githubButton = buttons[2]
      
      await user.click(githubButton)
      
      await waitFor(() => {
        expect(mockSignInSocial).toHaveBeenCalledWith(
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

    it('should disable social buttons while pending', async () => {
      const user = userEvent.setup()
      
      mockSignInSocial.mockImplementation(() => {
        // Never resolve
      })

      render(<SignUpView />)
      
      const buttons = screen.getAllByRole('button')
      await user.click(buttons[2])
      
      await waitFor(() => {
        buttons.forEach(button => {
          expect(button).toBeDisabled()
        })
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid form submissions', async () => {
      const user = userEvent.setup()
      
      mockSignUpEmail.mockImplementation((data, callbacks) => {
        setTimeout(() => callbacks.onSuccess(), 100)
      })

      render(<SignUpView />)
      
      await user.type(screen.getByLabelText(/^name$/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)
      await user.click(submitButton)
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockSignUpEmail).toHaveBeenCalledTimes(1)
      })
    })

    it('should handle special characters in all fields', async () => {
      const user = userEvent.setup()
      
      mockSignUpEmail.mockImplementation((data, callbacks) => {
        callbacks.onSuccess()
      })

      render(<SignUpView />)
      
      const specialName = "O'Brien-José"
      const specialEmail = 'test+tag@example.co.uk'
      const specialPassword = 'p@$$w0rd!#$%^&*()'
      
      await user.type(screen.getByLabelText(/^name$/i), specialName)
      await user.type(screen.getByLabelText(/email/i), specialEmail)
      await user.type(screen.getByLabelText(/^password$/i), specialPassword)
      await user.type(screen.getByLabelText(/confirm password/i), specialPassword)
      await user.click(screen.getByRole('button', { name: /sign in/i }))
      
      await waitFor(() => {
        expect(mockSignUpEmail).toHaveBeenCalledWith(
          expect.objectContaining({
            name: specialName,
            email: specialEmail,
            password: specialPassword,
          }),
          expect.any(Object)
        )
      })
    })

    it('should handle very long inputs', async () => {
      const user = userEvent.setup()
      render(<SignUpView />)
      
      const longName = 'A'.repeat(100)
      const longEmail = 'a'.repeat(50) + '@' + 'b'.repeat(50) + '.com'
      
      await user.type(screen.getByLabelText(/^name$/i), longName)
      await user.type(screen.getByLabelText(/email/i), longEmail)
      
      expect(screen.getByLabelText(/^name$/i)).toHaveValue(longName)
      expect(screen.getByLabelText(/email/i)).toHaveValue(longEmail)
    })

    it('should handle password with only spaces (edge case)', async () => {
      const user = userEvent.setup()
      render(<SignUpView />)
      
      await user.type(screen.getByLabelText(/^name$/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/^password$/i), '   ')
      await user.type(screen.getByLabelText(/confirm password/i), '   ')
      
      // Password field accepts it (min length is 1)
      expect(screen.getByLabelText(/^password$/i)).toHaveValue('   ')
    })

    it('should handle case-sensitive password confirmation', async () => {
      const user = userEvent.setup()
      render(<SignUpView />)
      
      await user.type(screen.getByLabelText(/^name$/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'Password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for all form inputs', () => {
      render(<SignUpView />)
      
      expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    })

    it('should have proper button types', () => {
      render(<SignUpView />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons[1]).toHaveAttribute('type', 'button')
      expect(buttons[2]).toHaveAttribute('type', 'button')
    })

    it('should show validation errors in accessible manner', async () => {
      const user = userEvent.setup()
      render(<SignUpView />)
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        const errors = screen.getAllByRole('alert')
        expect(errors.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Password Security', () => {
    it('should use password input type for password fields', () => {
      render(<SignUpView />)
      
      expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('type', 'password')
      expect(screen.getByLabelText(/confirm password/i)).toHaveAttribute('type', 'password')
    })

    it('should not send confirmPassword to API', async () => {
      const user = userEvent.setup()
      
      mockSignUpEmail.mockImplementation((data, callbacks) => {
        callbacks.onSuccess()
      })

      render(<SignUpView />)
      
      await user.type(screen.getByLabelText(/^name$/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /sign in/i }))
      
      await waitFor(() => {
        expect(mockSignUpEmail).toHaveBeenCalledWith(
          expect.not.objectContaining({
            confirmPassword: expect.anything()
          }),
          expect.any(Object)
        )
      })
    })
  })
})