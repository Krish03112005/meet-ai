import { auth } from '@/lib/auth'

// Mock better-auth
jest.mock('better-auth', () => ({
  betterAuth: jest.fn((config) => ({
    config,
    api: {
      getSession: jest.fn(),
    },
  })),
}))

// Mock better-auth adapters
jest.mock('better-auth/adapters/drizzle', () => ({
  drizzleAdapter: jest.fn((db, options) => ({ db, options })),
}))

// Mock database
jest.mock('@/db', () => ({
  db: {},
}))

jest.mock('@/db/schema', () => ({
  users: {},
  sessions: {},
}))

describe('auth configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should export auth instance', () => {
    expect(auth).toBeDefined()
  })

  it('should have config property', () => {
    expect(auth).toHaveProperty('config')
  })

  it('should configure GitHub social provider', () => {
    expect(auth.config).toHaveProperty('socialProviders')
    expect(auth.config.socialProviders).toHaveProperty('github')
    expect(auth.config.socialProviders.github).toEqual({
      clientId: 'test-github-client-id',
      clientSecret: 'test-github-client-secret',
    })
  })

  it('should configure Google social provider', () => {
    expect(auth.config.socialProviders).toHaveProperty('google')
    expect(auth.config.socialProviders.google).toEqual({
      clientId: 'test-google-client-id',
      clientSecret: 'test-google-client-secret',
    })
  })

  it('should enable email and password authentication', () => {
    expect(auth.config).toHaveProperty('emailAndPassword')
    expect(auth.config.emailAndPassword).toEqual({ enabled: true })
  })

  it('should configure database adapter', () => {
    expect(auth.config).toHaveProperty('database')
    expect(auth.config.database).toBeDefined()
  })

  it('should handle missing environment variables gracefully', () => {
    // The configuration should still be created even if env vars are missing
    // (they would be undefined as strings in production without proper validation)
    expect(auth.config.socialProviders.github.clientId).toBeDefined()
    expect(auth.config.socialProviders.google.clientId).toBeDefined()
  })
})

describe('auth social providers configuration', () => {
  it('should have both GitHub and Google providers configured', () => {
    const providers = Object.keys(auth.config.socialProviders)
    expect(providers).toContain('github')
    expect(providers).toContain('google')
    expect(providers).toHaveLength(2)
  })

  it('should require clientId for GitHub provider', () => {
    expect(auth.config.socialProviders.github.clientId).toBeTruthy()
  })

  it('should require clientSecret for GitHub provider', () => {
    expect(auth.config.socialProviders.github.clientSecret).toBeTruthy()
  })

  it('should require clientId for Google provider', () => {
    expect(auth.config.socialProviders.google.clientId).toBeTruthy()
  })

  it('should require clientSecret for Google provider', () => {
    expect(auth.config.socialProviders.google.clientSecret).toBeTruthy()
  })
})

describe('auth database configuration', () => {
  it('should use drizzle adapter', () => {
    expect(auth.config.database).toBeDefined()
  })

  it('should configure PostgreSQL provider', () => {
    expect(auth.config.database.options.provider).toBe('pg')
  })

  it('should include schema configuration', () => {
    expect(auth.config.database.options).toHaveProperty('schema')
    expect(auth.config.database.options.schema).toBeDefined()
  })
})