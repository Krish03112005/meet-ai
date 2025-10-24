import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Layout from '../layout'

// Mock the components
vi.mock('@/components/ui/sidebar', () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-provider">{children}</div>
  ),
}))

vi.mock('@/modules/dashboard/ui/components/dashboard-sidebar', () => ({
  DashboardSidebar: () => <div data-testid="dashboard-sidebar">Sidebar</div>,
}))

describe('Dashboard Layout', () => {
  describe('Component Rendering', () => {
    it('should render layout with children', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      )
      
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should render SidebarProvider', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      )
      
      expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument()
    })

    it('should render DashboardSidebar', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      )
      
      expect(screen.getByTestId('dashboard-sidebar')).toBeInTheDocument()
    })

    it('should wrap children in main element', () => {
      const { container } = render(
        <Layout>
          <div>Main Content</div>
        </Layout>
      )
      
      const main = container.querySelector('main')
      expect(main).toBeInTheDocument()
      expect(main).toHaveTextContent('Main Content')
    })
  })

  describe('Layout Structure', () => {
    it('should have correct component hierarchy', () => {
      const { container } = render(
        <Layout>
          <div>Content</div>
        </Layout>
      )
      
      const provider = screen.getByTestId('sidebar-provider')
      const sidebar = screen.getByTestId('dashboard-sidebar')
      const main = container.querySelector('main')
      
      expect(provider).toContainElement(sidebar)
      expect(provider).toContainElement(main!)
    })

    it('should render sidebar before main content', () => {
      const { container } = render(
        <Layout>
          <div>Content</div>
        </Layout>
      )
      
      const provider = screen.getByTestId('sidebar-provider')
      const children = Array.from(provider.children)
      
      expect(children[0]).toHaveAttribute('data-testid', 'dashboard-sidebar')
      expect(children[1].tagName.toLowerCase()).toBe('main')
    })
  })

  describe('Styling', () => {
    it('should apply flex layout classes to main', () => {
      const { container } = render(
        <Layout>
          <div>Content</div>
        </Layout>
      )
      
      const main = container.querySelector('main')
      expect(main).toHaveClass('flex', 'flex-col')
    })

    it('should apply full screen dimensions to main', () => {
      const { container } = render(
        <Layout>
          <div>Content</div>
        </Layout>
      )
      
      const main = container.querySelector('main')
      expect(main).toHaveClass('h-screen', 'w-screen')
    })

    it('should apply muted background to main', () => {
      const { container } = render(
        <Layout>
          <div>Content</div>
        </Layout>
      )
      
      const main = container.querySelector('main')
      expect(main).toHaveClass('bg-muted')
    })
  })

  describe('Props Handling', () => {
    it('should handle single child element', () => {
      render(
        <Layout>
          <div>Single Child</div>
        </Layout>
      )
      
      expect(screen.getByText('Single Child')).toBeInTheDocument()
    })

    it('should handle multiple child elements', () => {
      render(
        <Layout>
          <div>First Child</div>
          <div>Second Child</div>
        </Layout>
      )
      
      expect(screen.getByText('First Child')).toBeInTheDocument()
      expect(screen.getByText('Second Child')).toBeInTheDocument()
    })

    it('should handle complex nested children', () => {
      render(
        <Layout>
          <div>
            <header>Header</header>
            <section>Section</section>
            <footer>Footer</footer>
          </div>
        </Layout>
      )
      
      expect(screen.getByText('Header')).toBeInTheDocument()
      expect(screen.getByText('Section')).toBeInTheDocument()
      expect(screen.getByText('Footer')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      const { container } = render(<Layout>{null}</Layout>)
      
      const main = container.querySelector('main')
      expect(main).toBeInTheDocument()
    })

    it('should handle text-only children', () => {
      render(<Layout>Plain text content</Layout>)
      
      expect(screen.getByText('Plain text content')).toBeInTheDocument()
    })

    it('should handle fragments as children', () => {
      render(
        <Layout>
          <>
            <div>Fragment Child 1</div>
            <div>Fragment Child 2</div>
          </>
        </Layout>
      )
      
      expect(screen.getByText('Fragment Child 1')).toBeInTheDocument()
      expect(screen.getByText('Fragment Child 2')).toBeInTheDocument()
    })

    it('should handle conditional children', () => {
      const showContent = true
      
      render(
        <Layout>
          {showContent && <div>Conditional Content</div>}
        </Layout>
      )
      
      expect(screen.getByText('Conditional Content')).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('should properly integrate sidebar with content', () => {
      render(
        <Layout>
          <div data-testid="page-content">Page Content</div>
        </Layout>
      )
      
      expect(screen.getByTestId('dashboard-sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('page-content')).toBeInTheDocument()
    })

    it('should maintain layout consistency with different content', () => {
      const { rerender, container } = render(
        <Layout>
          <div>Content 1</div>
        </Layout>
      )
      
      const initialMain = container.querySelector('main')
      const initialClasses = initialMain?.className
      
      rerender(
        <Layout>
          <div>Content 2</div>
        </Layout>
      )
      
      const updatedMain = container.querySelector('main')
      expect(updatedMain?.className).toBe(initialClasses)
    })
  })

  describe('Accessibility', () => {
    it('should use semantic main element', () => {
      const { container } = render(
        <Layout>
          <div>Content</div>
        </Layout>
      )
      
      const main = container.querySelector('main')
      expect(main).toBeInTheDocument()
    })

    it('should maintain proper document structure', () => {
      const { container } = render(
        <Layout>
          <article>
            <h1>Article Title</h1>
            <p>Article content</p>
          </article>
        </Layout>
      )
      
      expect(screen.getByRole('article')).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })
  })

  describe('TypeScript Props Validation', () => {
    it('should accept valid React.ReactNode as children', () => {
      expect(() =>
        render(
          <Layout>
            <div>Valid children</div>
          </Layout>
        )
      ).not.toThrow()
    })

    it('should handle array of children', () => {
      const children = [
        <div key="1">Child 1</div>,
        <div key="2">Child 2</div>,
      ]
      
      render(<Layout>{children}</Layout>)
      
      expect(screen.getByText('Child 1')).toBeInTheDocument()
      expect(screen.getByText('Child 2')).toBeInTheDocument()
    })
  })
})