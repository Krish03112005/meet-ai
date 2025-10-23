import { user, session, account, verification } from '../schema'

describe('Database Schema Validation', () => {
  describe('User Table Schema', () => {
    it('should have all required fields defined', () => {
      expect(user).toBeDefined()
      expect(user.id).toBeDefined()
      expect(user.name).toBeDefined()
      expect(user.email).toBeDefined()
      expect(user.emailVerified).toBeDefined()
      expect(user.image).toBeDefined()
      expect(user.createdAt).toBeDefined()
      expect(user.updatedAt).toBeDefined()
    })

    it('should have correct field types', () => {
      expect(user.id.dataType).toBe('string')
      expect(user.name.dataType).toBe('string')
      expect(user.email.dataType).toBe('string')
      expect(user.emailVerified.dataType).toBe('boolean')
      expect(user.image.dataType).toBe('string')
    })

    it('should have id as primary key', () => {
      expect(user.id.primary).toBe(true)
    })

    it('should have email as unique', () => {
      expect(user.email.unique).toBe(true)
    })

    it('should have not null constraints on required fields', () => {
      expect(user.name.notNull).toBe(true)
      expect(user.email.notNull).toBe(true)
      expect(user.emailVerified.notNull).toBe(true)
    })

    it('should have default value for emailVerified', () => {
      expect(user.emailVerified.hasDefault).toBe(true)
    })

    it('should use snake_case for database column names', () => {
      expect(user.emailVerified.name).toBe('email_verified')
      expect(user.createdAt.name).toBe('created_at')
      expect(user.updatedAt.name).toBe('updated_at')
    })
  })

  describe('Session Table Schema', () => {
    it('should have all required fields defined', () => {
      expect(session).toBeDefined()
      expect(session.id).toBeDefined()
      expect(session.expiresAt).toBeDefined()
      expect(session.token).toBeDefined()
      expect(session.userId).toBeDefined()
    })

    it('should have correct field types', () => {
      expect(session.id.dataType).toBe('string')
      expect(session.token.dataType).toBe('string')
      expect(session.userId.dataType).toBe('string')
    })

    it('should have id as primary key', () => {
      expect(session.id.primary).toBe(true)
    })

    it('should have token as unique', () => {
      expect(session.token.unique).toBe(true)
    })

    it('should have not null constraints', () => {
      expect(session.expiresAt.notNull).toBe(true)
      expect(session.token.notNull).toBe(true)
      expect(session.userId.notNull).toBe(true)
    })
  })

  describe('Account Table Schema', () => {
    it('should have all required fields defined', () => {
      expect(account).toBeDefined()
      expect(account.id).toBeDefined()
      expect(account.accountId).toBeDefined()
      expect(account.providerId).toBeDefined()
      expect(account.userId).toBeDefined()
    })

    it('should have id as primary key', () => {
      expect(account.id.primary).toBe(true)
    })

    it('should have not null constraints on required fields', () => {
      expect(account.accountId.notNull).toBe(true)
      expect(account.providerId.notNull).toBe(true)
      expect(account.userId.notNull).toBe(true)
    })
  })

  describe('Verification Table Schema', () => {
    it('should have all required fields defined', () => {
      expect(verification).toBeDefined()
      expect(verification.id).toBeDefined()
      expect(verification.identifier).toBeDefined()
      expect(verification.value).toBeDefined()
      expect(verification.expiresAt).toBeDefined()
    })

    it('should have id as primary key', () => {
      expect(verification.id.primary).toBe(true)
    })

    it('should have not null constraints', () => {
      expect(verification.identifier.notNull).toBe(true)
      expect(verification.value.notNull).toBe(true)
      expect(verification.expiresAt.notNull).toBe(true)
    })
  })
})