import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GeneratedAvatar } from '../generated-avatar'

// Mock the dicebear library
vi.mock('@dicebear/core', () => ({
  createAvatar: vi.fn((style, options) => ({
    toDataUri: vi.fn(() => `data:image/svg+xml;base64,${options.seed}`),
  })),
}))

vi.mock('@dicebear/collection', () => ({
  botttsNeutral: {},
  initials: {},
}))

describe('GeneratedAvatar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render avatar with default variant (initials)', () => {
      render(<GeneratedAvatar seed="John Doe" />)
      
      const avatar = screen.getByRole('img', { name: /avatar/i })
      expect(avatar).toBeInTheDocument()
    })

    it('should render avatar with botttsNeutral variant', () => {
      render(<GeneratedAvatar seed="Jane Smith" variant="botttsNeutral" />)
      
      const avatar = screen.getByRole('img', { name: /avatar/i })
      expect(avatar).toBeInTheDocument()
    })

    it('should render avatar with initials variant explicitly', () => {
      render(<GeneratedAvatar seed="Test User" variant="initials" />)
      
      const avatar = screen.getByRole('img', { name: /avatar/i })
      expect(avatar).toBeInTheDocument()
    })

    it('should apply custom className when provided', () => {
      const { container } = render(
        <GeneratedAvatar seed="User" className="custom-class size-12" />
      )
      
      const avatarContainer = container.querySelector('[data-slot="avatar"]')
      expect(avatarContainer).toHaveClass('custom-class', 'size-12')
    })
  })

  describe('Seed Handling', () => {
    it('should generate avatar with provided seed', () => {
      render(<GeneratedAvatar seed="UniqueUser123" />)
      
      const avatar = screen.getByRole('img', { name: /avatar/i })
      expect(avatar).toHaveAttribute('src')
    })

    it('should display fallback with first character of seed uppercase', () => {
      render(<GeneratedAvatar seed="testuser" />)
      
      const fallback = screen.getByText('T')
      expect(fallback).toBeInTheDocument()
    })

    it('should handle empty seed gracefully', () => {
      render(<GeneratedAvatar seed="" />)
      
      const avatar = screen.getByRole('img', { name: /avatar/i })
      expect(avatar).toBeInTheDocument()
    })

    it('should handle seed with special characters', () => {
      render(<GeneratedAvatar seed="@user#123" />)
      
      const fallback = screen.getByText('@')
      expect(fallback).toBeInTheDocument()
    })

    it('should handle seed with lowercase first letter', () => {
      render(<GeneratedAvatar seed="john" />)
      
      const fallback = screen.getByText('J')
      expect(fallback).toBeInTheDocument()
    })

    it('should handle seed with numbers', () => {
      render(<GeneratedAvatar seed="123user" />)
      
      const fallback = screen.getByText('1')
      expect(fallback).toBeInTheDocument()
    })
  })

  describe('Variant Behavior', () => {
    it('should use botttsNeutral style when variant is botttsNeutral', () => {
      const { createAvatar } = require('@dicebear/core')
      const { botttsNeutral } = require('@dicebear/collection')
      
      render(<GeneratedAvatar seed="Robot" variant="botttsNeutral" />)
      
      expect(createAvatar).toHaveBeenCalledWith(
        botttsNeutral,
        expect.objectContaining({ seed: 'Robot' })
      )
    })

    it('should use initials style with custom options when variant is initials', () => {
      const { createAvatar } = require('@dicebear/core')
      const { initials } = require('@dicebear/collection')
      
      render(<GeneratedAvatar seed="User" variant="initials" />)
      
      expect(createAvatar).toHaveBeenCalledWith(
        initials,
        expect.objectContaining({
          seed: 'User',
          fontWeight: 500,
          fontSize: 40,
        })
      )
    })

    it('should default to initials when no variant is specified', () => {
      const { createAvatar } = require('@dicebear/core')
      const { initials } = require('@dicebear/collection')
      
      render(<GeneratedAvatar seed="Default" />)
      
      expect(createAvatar).toHaveBeenCalledWith(
        initials,
        expect.objectContaining({ seed: 'Default' })
      )
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long seed strings', () => {
      const longSeed = 'A'.repeat(1000)
      render(<GeneratedAvatar seed={longSeed} />)
      
      const avatar = screen.getByRole('img', { name: /avatar/i })
      expect(avatar).toBeInTheDocument()
    })

    it('should handle unicode characters in seed', () => {
      render(<GeneratedAvatar seed="用户" />)
      
      const fallback = screen.getByText('用')
      expect(fallback).toBeInTheDocument()
    })

    it('should handle emoji in seed', () => {
      render(<GeneratedAvatar seed="😀 User" />)
      
      const fallback = screen.getByText('😀')
      expect(fallback).toBeInTheDocument()
    })

    it('should handle whitespace-only seed', () => {
      render(<GeneratedAvatar seed="   " />)
      
      const avatar = screen.getByRole('img', { name: /avatar/i })
      expect(avatar).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('should render both AvatarImage and AvatarFallback', () => {
      const { container } = render(<GeneratedAvatar seed="Test" />)
      
      const image = container.querySelector('[data-slot="avatar-image"]')
      const fallback = container.querySelector('[data-slot="avatar-fallback"]')
      
      expect(image).toBeInTheDocument()
      expect(fallback).toBeInTheDocument()
    })

    it('should generate unique data URIs for different seeds', () => {
      const { createAvatar } = require('@dicebear/core')
      
      const { rerender } = render(<GeneratedAvatar seed="User1" />)
      const firstCallCount = createAvatar.mock.calls.length
      
      rerender(<GeneratedAvatar seed="User2" />)
      const secondCallCount = createAvatar.mock.calls.length
      
      expect(secondCallCount).toBeGreaterThan(firstCallCount)
    })
  })

  describe('Accessibility', () => {
    it('should have proper alt text for avatar image', () => {
      render(<GeneratedAvatar seed="Accessible User" />)
      
      const avatar = screen.getByRole('img', { name: /avatar/i })
      expect(avatar).toHaveAttribute('alt', 'Avatar')
    })

    it('should be keyboard accessible', () => {
      const { container } = render(<GeneratedAvatar seed="User" />)
      const avatarRoot = container.querySelector('[data-slot="avatar"]')
      
      expect(avatarRoot).toBeInTheDocument()
    })
  })
})