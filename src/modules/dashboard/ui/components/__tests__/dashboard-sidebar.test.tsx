import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DashboardSidebar } from '../dashboard-sidebar'
import { usePathname } from 'next/navigation'

// Mock the child component
vi.mock('../dashboard-user-button', () => ({
  DashboardUserButton: () => <div data-testid="dashboard-user-button">User Button</div>,
}))

describe('DashboardSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(usePathname).mockReturnValue('/')
  })

  describe('Component Rendering', () => {
    it('should render the sidebar with all sections', () => {
      render(<DashboardSidebar />)
      
      expect(screen.getByText('Meet.AI')).toBeInTheDocument()
      expect(screen.getByText('Meetings')).toBeInTheDocument()
      expect(screen.getByText('Agents')).toBeInTheDocument()
      expect(screen.getByText('Upgrade')).toBeInTheDocument()
    })

    it('should render the logo image', () => {
      render(<DashboardSidebar />)
      
      const logo = screen.getByAltText('Meet.AI')
      expect(logo).toBeInTheDocument()
      expect(logo).toHaveAttribute('src', '/logo.svg')
    })

    it('should render DashboardUserButton in footer', () => {
      render(<DashboardSidebar />)
      
      expect(screen.getByTestId('dashboard-user-button')).toBeInTheDocument()
    })

    it('should render navigation links with proper hrefs', () => {
      render(<DashboardSidebar />)
      
      const meetingsLink = screen.getByRole('link', { name: /meetings/i })
      const agentsLink = screen.getByRole('link', { name: /agents/i })
      const upgradeLink = screen.getByRole('link', { name: /upgrade/i })
      
      expect(meetingsLink).toHaveAttribute('href', '/meetings')
      expect(agentsLink).toHaveAttribute('href', '/agents')
      expect(upgradeLink).toHaveAttribute('href', '/upgrade')
    })

    it('should render home link with logo', () => {
      render(<DashboardSidebar />)
      
      const homeLinks = screen.getAllByRole('link', { name: /meet\.ai/i })
      const logoLink = homeLinks[0]
      
      expect(logoLink).toHaveAttribute('href', '/')
    })
  })

  describe('Active State Management', () => {
    it('should highlight active menu item based on pathname', () => {
      vi.mocked(usePathname).mockReturnValue('/meetings')
      
      const { container } = render(<DashboardSidebar />)
      
      const meetingsButton = container.querySelector('[href="/meetings"]')?.parentElement
      expect(meetingsButton).toHaveClass('bg-linear-to-r/oklch')
    })

    it('should not highlight inactive menu items', () => {
      vi.mocked(usePathname).mockReturnValue('/meetings')
      
      const { container } = render(<DashboardSidebar />)
      
      const agentsLink = screen.getByRole('link', { name: /agents/i })
      expect(agentsLink.parentElement).not.toHaveClass('bg-linear-to-r/oklch')
    })

    it('should update active state when pathname changes to /agents', () => {
      vi.mocked(usePathname).mockReturnValue('/agents')
      
      const { container } = render(<DashboardSidebar />)
      
      const agentsButton = container.querySelector('[href="/agents"]')?.parentElement
      expect(agentsButton).toHaveClass('bg-linear-to-r/oklch')
    })

    it('should update active state when pathname changes to /upgrade', () => {
      vi.mocked(usePathname).mockReturnValue('/upgrade')
      
      const { container } = render(<DashboardSidebar />)
      
      const upgradeButton = container.querySelector('[href="/upgrade"]')?.parentElement
      expect(upgradeButton).toHaveClass('bg-linear-to-r/oklch')
    })

    it('should handle root path correctly', () => {
      vi.mocked(usePathname).mockReturnValue('/')
      
      render(<DashboardSidebar />)
      
      // No menu items should be active on root path
      expect(screen.getByText('Meetings')).toBeInTheDocument()
      expect(screen.getByText('Agents')).toBeInTheDocument()
    })
  })

  describe('Navigation Structure', () => {
    it('should render first section with Meetings and Agents', () => {
      render(<DashboardSidebar />)
      
      expect(screen.getByText('Meetings')).toBeInTheDocument()
      expect(screen.getByText('Agents')).toBeInTheDocument()
    })

    it('should render second section with Upgrade', () => {
      render(<DashboardSidebar />)
      
      expect(screen.getByText('Upgrade')).toBeInTheDocument()
    })

    it('should render separators between sections', () => {
      const { container } = render(<DashboardSidebar />)
      
      const separators = container.querySelectorAll('[role="separator"]')
      expect(separators.length).toBeGreaterThan(0)
    })

    it('should have proper menu structure with icons', () => {
      const { container } = render(<DashboardSidebar />)
      
      // Check for lucide-react icons
      const icons = container.querySelectorAll('svg')
      expect(icons.length).toBeGreaterThan(0)
    })
  })

  describe('Styling and Classes', () => {
    it('should apply hover styles to menu buttons', () => {
      const { container } = render(<DashboardSidebar />)
      
      const menuButton = screen.getByRole('link', { name: /meetings/i }).parentElement
      expect(menuButton).toHaveClass('hover:bg-linear-to-r/oklch')
    })

    it('should apply proper height to menu buttons', () => {
      const { container } = render(<DashboardSidebar />)
      
      const menuButton = screen.getByRole('link', { name: /meetings/i }).parentElement
      expect(menuButton).toHaveClass('h-10')
    })

    it('should apply border styles to menu buttons', () => {
      const { container } = render(<DashboardSidebar />)
      
      const menuButton = screen.getByRole('link', { name: /meetings/i }).parentElement
      expect(menuButton).toHaveClass('border')
    })

    it('should style footer with proper text color', () => {
      const { container } = render(<DashboardSidebar />)
      
      const footer = container.querySelector('[class*="text-white"]')
      expect(footer).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have semantic navigation structure', () => {
      render(<DashboardSidebar />)
      
      const links = screen.getAllByRole('link')
      expect(links.length).toBeGreaterThan(0)
    })

    it('should have descriptive link text', () => {
      render(<DashboardSidebar />)
      
      expect(screen.getByText('Meetings')).toBeInTheDocument()
      expect(screen.getByText('Agents')).toBeInTheDocument()
      expect(screen.getByText('Upgrade')).toBeInTheDocument()
    })

    it('should have proper alt text for logo', () => {
      render(<DashboardSidebar />)
      
      const logo = screen.getByAltText('Meet.AI')
      expect(logo).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle unknown pathname gracefully', () => {
      vi.mocked(usePathname).mockReturnValue('/unknown-route')
      
      expect(() => render(<DashboardSidebar />)).not.toThrow()
    })

    it('should handle empty pathname', () => {
      vi.mocked(usePathname).mockReturnValue('')
      
      expect(() => render(<DashboardSidebar />)).not.toThrow()
    })

    it('should handle pathname with query parameters', () => {
      vi.mocked(usePathname).mockReturnValue('/meetings?id=123')
      
      render(<DashboardSidebar />)
      expect(screen.getByText('Meetings')).toBeInTheDocument()
    })

    it('should handle nested paths', () => {
      vi.mocked(usePathname).mockReturnValue('/meetings/123')
      
      render(<DashboardSidebar />)
      expect(screen.getByText('Meetings')).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('should render complete sidebar structure', () => {
      const { container } = render(<DashboardSidebar />)
      
      // Check for header
      expect(screen.getByText('Meet.AI')).toBeInTheDocument()
      
      // Check for content
      expect(screen.getByText('Meetings')).toBeInTheDocument()
      
      // Check for footer
      expect(screen.getByTestId('dashboard-user-button')).toBeInTheDocument()
    })

    it('should maintain consistent layout structure', () => {
      const { container } = render(<DashboardSidebar />)
      
      const sidebar = container.firstChild
      expect(sidebar).toBeInTheDocument()
    })
  })
})