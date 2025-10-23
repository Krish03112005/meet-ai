describe('Configuration File Validation', () => {
  describe('TypeScript Configuration', () => {
    let tsconfig: any

    beforeAll(() => {
      tsconfig = require('../../tsconfig.json')
    })

    it('should have required compiler options', () => {
      expect(tsconfig.compilerOptions).toBeDefined()
      expect(tsconfig.compilerOptions.strict).toBe(true)
    })

    it('should configure path mapping for imports', () => {
      expect(tsconfig.compilerOptions.paths).toBeDefined()
      expect(tsconfig.compilerOptions.paths['@/*']).toEqual(['./src/*'])
    })

    it('should include necessary lib files', () => {
      expect(tsconfig.compilerOptions.lib).toBeDefined()
      expect(tsconfig.compilerOptions.lib).toContain('dom')
      expect(tsconfig.compilerOptions.lib).toContain('esnext')
    })
  })

  describe('Package Configuration', () => {
    let packageJson: any

    beforeAll(() => {
      packageJson = require('../../package.json')
    })

    it('should have required scripts', () => {
      expect(packageJson.scripts.dev).toBeDefined()
      expect(packageJson.scripts.build).toBeDefined()
      expect(packageJson.scripts.test).toBeDefined()
    })

    it('should have Next.js and React', () => {
      expect(packageJson.dependencies.next).toBeDefined()
      expect(packageJson.dependencies.react).toBeDefined()
    })

    it('should have authentication library', () => {
      expect(packageJson.dependencies['better-auth']).toBeDefined()
    })

    it('should have form libraries', () => {
      expect(packageJson.dependencies['react-hook-form']).toBeDefined()
      expect(packageJson.dependencies.zod).toBeDefined()
    })

    it('should have testing dependencies', () => {
      expect(packageJson.devDependencies.jest).toBeDefined()
      expect(packageJson.devDependencies['@testing-library/react']).toBeDefined()
    })
  })
})