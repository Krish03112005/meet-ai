import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignInView } from '../sign-in-view'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

// Mock the auth client and router
jest.mock('@/lib/auth-client')
jest.mock('next/navigation')

const mockPush = jest.fn()
const mockSignInEmail = jest.fn()
const mockSignInSocial = jest.fn()

describe('SignInView Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    ;(authClient.signIn.email as jest.Mock) = mockSignInEmail
    ;(authClient.signIn.social as jest.Mock) = mockSignInSocial
  })

  describe('Rendering', () => {
    it('should render all form elements', () => {
      render(<SignInView />)
      
      expect(screen.getByText('Welcome Back')).toBeInTheDocument()
      expect(screen.getByText('Login to your account')).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('should render social login buttons', () => {
      render(<SignInView />)
      
      const buttons = screen.getAllByRole('button')
      // Sign In button + Google + GitHub
      expect(buttons).toHaveLength(3)
    })

    it('should render link to sign up page', () => {
      render(<SignInView />)
      
      expect(screen.getByText("Don't have an account?")).toBeInTheDocument()
      const signUpLink = screen.getByRole('link', { name: /sign up/i })
      expect(signUpLink).toHaveAttribute('href', '/sign-up')
    })

    it('should render terms and privacy policy links', () => {
      render(<SignInView />)
      
      expect(screen.getByText(/terms of service/i)).toBeInTheDocument()
      expect(screen.getByText(/privacy policy/i)).toBeInTheDocument()
    })

    it('should not show error alert initially', () => {
      render(<SignInView />)
      
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('Form Validation - Email Field', () => {
    it('should show error for empty email', async () => {
      const user = userEvent.setup()
      render(<SignInView />)
      
      const emailInput = screen.getByLabelText(/email/i)
      await user.click(emailInput)
      await user.tab() // Move focus away
      
      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
      })
    })

    it('should show error for invalid email format', async () => {
      const user = userEvent.setup()
      render(<SignInView />)
      
      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'invalid-email')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
      })
    })

    it('should accept valid email', async () => {
      const user = userEvent.setup()
      render(<SignInView />)
      
      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'test@example.com')
      
      expect(emailInput).toHaveValue('test@example.com')
    })
  })

  describe('Form Validation - Password Field', () => {
    it('should show error for empty password', async () => {
      const user = userEvent.setup()
      render(<SignInView />)
      
      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'test@example.com')
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument()
      })
    })

    it('should accept any non-empty password', async () => {
      const user = userEvent.setup()
      render(<SignInView />)
      
      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(passwordInput, 'test123')
      
      expect(passwordInput).toHaveValue('test123')
    })
  })

  describe('Email/Password Sign In - Success', () => {
    it('should call authClient.signIn.email with correct data on valid submission', async () => {
      const user = userEvent.setup()
      
      mockSignInEmail.mockImplementation((data, callbacks) => {
        callbacks.onSuccess()
      })

      render(<SignInView />)
      
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /sign in/i }))
      
      await waitFor(() => {
        expect(mockSignInEmail).toHaveBeenCalledWith(
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
      const user = userEvent.setup()
      
      mockSignInEmail.mockImplementation((data, callbacks) => {
        callbacks.onSuccess()
      })

      render(<SignInView />)
      
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /sign in/i }))
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/')
      })
    })

    it('should disable submit button while pending', async () => {
      const user = userEvent.setup()
      
      let resolveSignIn: () => void
      mockSignInEmail.mockImplementation((data, callbacks) => {
        return new Promise((resolve) => {
          resolveSignIn = () => {
            callbacks.onSuccess()
            resolve(undefined)
          }
        })
      })

      render(<SignInView />)
      
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)
      
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Email/Password Sign In - Failure', () => {
    it('should display error message on sign in failure', async () => {
      const user = userEvent.setup()
      
      mockSignInEmail.mockImplementation((data, callbacks) => {
        callbacks.onError({ error: { message: 'Invalid credentials' } })
      })

      render(<SignInView />)
      
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
      await user.click(screen.getByRole('button', { name: /sign in/i }))
      
      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      })
    })

    it('should clear previous error when submitting again', async () => {
      const user = userEvent.setup()
      
      mockSignInEmail
        .mockImplementationOnce((data, callbacks) => {
          callbacks.onError({ error: { message: 'First error' } })
        })
        .mockImplementationOnce((data, callbacks) => {
          callbacks.onSuccess()
        })

      render(<SignInView />)
      
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password')
      await user.click(screen.getByRole('button', { name: /sign in/i }))
      
      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument()
      })
      
      await user.click(screen.getByRole('button', { name: /sign in/i }))
      
      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument()
      })
    })
  })

  describe('Social Sign In - Google', () => {
    it('should call authClient.signIn.social with google provider', async () => {
      const user = userEvent.setup()
      
      mockSignInSocial.mockImplementation((data, callbacks) => {
        callbacks.onSuccess()
      })

      render(<SignInView />)
      
      const buttons = screen.getAllByRole('button')
      const googleButton = buttons[1] // Assuming Google is the first social button
      
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

    it('should disable social buttons while pending', async () => {
      const user = userEvent.setup()
      
      mockSignInSocial.mockImplementation(() => {
        // Never resolve to keep pending state
      })

      render(<SignInView />)
      
      const buttons = screen.getAllByRole('button')
      const googleButton = buttons[1]
      
      await user.click(googleButton)
      
      await waitFor(() => {
        buttons.forEach(button => {
          expect(button).toBeDisabled()
        })
      })
    })

    it('should display error on Google sign in failure', async () => {
      const user = userEvent.setup()
      
      mockSignInSocial.mockImplementation((data, callbacks) => {
        callbacks.onError({ error: { message: 'Google auth failed' } })
      })

      render(<SignInView />)
      
      const buttons = screen.getAllByRole('button')
      const googleButton = buttons[1]
      
      await user.click(googleButton)
      
      await waitFor(() => {
        expect(screen.getByText('Google auth failed')).toBeInTheDocument()
      })
    })
  })

  describe('Social Sign In - GitHub', () => {
    it('should call authClient.signIn.social with github provider', async () => {
      const user = userEvent.setup()
      
      mockSignInSocial.mockImplementation((data, callbacks) => {
        callbacks.onSuccess()
      })

      render(<SignInView />)
      
      const buttons = screen.getAllByRole('button')
      const githubButton = buttons[2] // Assuming GitHub is the second social button
      
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

    it('should display error on GitHub sign in failure', async () => {
      const user = userEvent.setup()
      
      mockSignInSocial.mockImplementation((data, callbacks) => {
        callbacks.onError({ error: { message: 'GitHub auth failed' } })
      })

      render(<SignInView />)
      
      const buttons = screen.getAllByRole('button')
      const githubButton = buttons[2]
      
      await user.click(githubButton)
      
      await waitFor(() => {
        expect(screen.getByText('GitHub auth failed')).toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid form submissions', async () => {
      const user = userEvent.setup()
      
      mockSignInEmail.mockImplementation((data, callbacks) => {
        setTimeout(() => callbacks.onSuccess(), 100)
      })

      render(<SignInView />)
      
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)
      await user.click(submitButton)
      await user.click(submitButton)
      
      // Should only be called once due to disabled state
      await waitFor(() => {
        expect(mockSignInEmail).toHaveBeenCalledTimes(1)
      })
    })

    it('should handle special characters in email and password', async () => {
      const user = userEvent.setup()
      
      mockSignInEmail.mockImplementation((data, callbacks) => {
        callbacks.onSuccess()
      })

      render(<SignInView />)
      
      const specialEmail = 'test+tag@example.com'
      const specialPassword = 'p@$$w0rd!#$%'
      
      await user.type(screen.getByLabelText(/email/i), specialEmail)
      await user.type(screen.getByLabelText(/password/i), specialPassword)
      await user.click(screen.getByRole('button', { name: /sign in/i }))
      
      await waitFor(() => {
        expect(mockSignInEmail).toHaveBeenCalledWith(
          expect.objectContaining({
            email: specialEmail,
            password: specialPassword,
          }),
          expect.any(Object)
        )
      })
    })

    it('should handle very long email addresses', async () => {
      const user = userEvent.setup()
      render(<SignInView />)
      
      const longEmail = 'a'.repeat(50) + '@' + 'b'.repeat(50) + '.com'
      const emailInput = screen.getByLabelText(/email/i)
      
      await user.type(emailInput, longEmail)
      
      expect(emailInput).toHaveValue(longEmail)
    })

    it('should handle network timeout gracefully', async () => {
      const user = userEvent.setup()
      
      mockSignInEmail.mockImplementation((data, callbacks) => {
        callbacks.onError({ error: { message: 'Network timeout' } })
      })

      render(<SignInView />)
      
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /sign in/i }))
      
      await waitFor(() => {
        expect(screen.getByText('Network timeout')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for form inputs', () => {
      render(<SignInView />)
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    })

    it('should have proper button types', () => {
      render(<SignInView />)
      
      const buttons = screen.getAllByRole('button')
      // Check that social buttons have type="button" to prevent form submission
      expect(buttons[1]).toHaveAttribute('type', 'button')
      expect(buttons[2]).toHaveAttribute('type', 'button')
    })
  })
})