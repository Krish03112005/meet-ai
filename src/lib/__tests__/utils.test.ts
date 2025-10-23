import { cn } from '../utils'

describe('cn utility function', () => {
  describe('Happy paths', () => {
    it('should merge single class name', () => {
      expect(cn('foo')).toBe('foo')
    })

    it('should merge multiple class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('should merge conditional classes', () => {
      expect(cn('foo', true && 'bar', false && 'baz')).toBe('foo bar')
    })

    it('should handle tailwind conflicting classes correctly', () => {
      // tailwind-merge should prioritize the last class
      const result = cn('px-2', 'px-4')
      expect(result).toBe('px-4')
    })

    it('should merge classes from objects', () => {
      expect(cn({ foo: true, bar: false })).toBe('foo')
    })

    it('should handle arrays of classes', () => {
      expect(cn(['foo', 'bar'])).toBe('foo bar')
    })
  })

  describe('Edge cases', () => {
    it('should handle undefined values', () => {
      expect(cn('foo', undefined, 'bar')).toBe('foo bar')
    })

    it('should handle null values', () => {
      expect(cn('foo', null, 'bar')).toBe('foo bar')
    })

    it('should handle empty strings', () => {
      expect(cn('foo', '', 'bar')).toBe('foo bar')
    })

    it('should handle no arguments', () => {
      expect(cn()).toBe('')
    })

    it('should handle only falsy values', () => {
      expect(cn(false, null, undefined, '')).toBe('')
    })

    it('should handle complex tailwind merge scenarios', () => {
      // Should merge conflicting padding classes
      expect(cn('p-4', 'px-8')).toBe('p-4 px-8')
      expect(cn('px-4', 'p-8')).toBe('p-8')
    })

    it('should handle complex nested structures', () => {
      expect(cn(
        'base-class',
        ['array-class-1', 'array-class-2'],
        { conditional: true, hidden: false },
        undefined,
        null
      )).toBe('base-class array-class-1 array-class-2 conditional')
    })
  })

  describe('Tailwind-specific merging', () => {
    it('should prioritize later background colors', () => {
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500')
    })

    it('should prioritize later text colors', () => {
      expect(cn('text-black', 'text-white')).toBe('text-white')
    })

    it('should handle responsive variants correctly', () => {
      expect(cn('text-sm', 'md:text-lg', 'text-base')).toBe('md:text-lg text-base')
    })

    it('should merge multiple utility types', () => {
      const result = cn(
        'p-4 m-2 bg-red-500',
        'p-8 text-white'
      )
      expect(result).toContain('p-8')
      expect(result).toContain('m-2')
      expect(result).toContain('bg-red-500')
      expect(result).toContain('text-white')
    })
  })

  describe('Performance and type safety', () => {
    it('should handle large number of classes', () => {
      const classes = Array.from({ length: 100 }, (_, i) => `class-${i}`)
      const result = cn(...classes)
      expect(result).toContain('class-0')
      expect(result).toContain('class-99')
    })

    it('should handle mixed types', () => {
      expect(cn(
        'string-class',
        123 as any, // Invalid but should not crash
        true && 'conditional-class',
        { obj: true }
      )).toBeTruthy()
    })
  })
})