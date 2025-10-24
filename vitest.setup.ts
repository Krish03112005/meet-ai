import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock Next.js modules
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  redirect: vi.fn(),
}))

vi.mock('next/image', () => ({
  default: ({ src, alt, width, height, className }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} width={width} height={height} className={className} />
  },
}))

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}))

vi.mock('next/link', () => ({
  default: ({ children, href, className }: any) => {
    return <a href={href} className={className}>{children}</a>
  },
}))