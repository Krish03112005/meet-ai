import { renderHook, act, waitFor } from '@testing-library/react'
import { useIsMobile } from '../use-mobile'

describe('useIsMobile hook', () => {
  let matchMediaMock: jest.Mock
  let addEventListenerMock: jest.Mock
  let removeEventListenerMock: jest.Mock

  beforeEach(() => {
    addEventListenerMock = jest.fn()
    removeEventListenerMock = jest.fn()
    matchMediaMock = jest.fn()

    // Default mock: desktop
    window.matchMedia = matchMediaMock.mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
      dispatchEvent: jest.fn(),
    }))

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Happy paths - Desktop', () => {
    it('should return false for desktop viewport (>=768px)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })

      const { result } = renderHook(() => useIsMobile())
      
      expect(result.current).toBe(false)
    })

    it('should return false for exactly 768px width', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })

      const { result } = renderHook(() => useIsMobile())
      
      expect(result.current).toBe(false)
    })
  })

  describe('Happy paths - Mobile', () => {
    it('should return true for mobile viewport (<768px)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      const { result } = renderHook(() => useIsMobile())
      
      expect(result.current).toBe(true)
    })

    it('should return true for 767px width (boundary)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 767,
      })

      const { result } = renderHook(() => useIsMobile())
      
      expect(result.current).toBe(true)
    })
  })

  describe('Event listener behavior', () => {
    it('should register event listener on mount', () => {
      renderHook(() => useIsMobile())
      
      expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function))
    })

    it('should clean up event listener on unmount', () => {
      const { unmount } = renderHook(() => useIsMobile())
      
      unmount()
      
      expect(removeEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function))
    })

    it('should update when window is resized from desktop to mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })

      const { result } = renderHook(() => useIsMobile())
      expect(result.current).toBe(false)

      // Simulate resize to mobile
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 500,
        })
        
        // Trigger the change event
        const changeHandler = addEventListenerMock.mock.calls[0][1]
        changeHandler()
      })

      expect(result.current).toBe(true)
    })

    it('should update when window is resized from mobile to desktop', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      })

      const { result } = renderHook(() => useIsMobile())
      expect(result.current).toBe(true)

      // Simulate resize to desktop
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1024,
        })
        
        const changeHandler = addEventListenerMock.mock.calls[0][1]
        changeHandler()
      })

      expect(result.current).toBe(false)
    })
  })

  describe('Edge cases', () => {
    it('should handle very small screen widths', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320, // iPhone SE width
      })

      const { result } = renderHook(() => useIsMobile())
      
      expect(result.current).toBe(true)
    })

    it('should handle very large screen widths', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 3840, // 4K width
      })

      const { result } = renderHook(() => useIsMobile())
      
      expect(result.current).toBe(false)
    })

    it('should handle zero width', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 0,
      })

      const { result } = renderHook(() => useIsMobile())
      
      expect(result.current).toBe(true)
    })

    it('should handle multiple rapid resize events', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })

      const { result } = renderHook(() => useIsMobile())

      act(() => {
        const changeHandler = addEventListenerMock.mock.calls[0][1]
        
        // Rapidly change sizes
        Object.defineProperty(window, 'innerWidth', { value: 500, writable: true })
        changeHandler()
        
        Object.defineProperty(window, 'innerWidth', { value: 900, writable: true })
        changeHandler()
        
        Object.defineProperty(window, 'innerWidth', { value: 600, writable: true })
        changeHandler()
      })

      expect(result.current).toBe(true)
    })
  })

  describe('Media query matching', () => {
    it('should use correct media query breakpoint', () => {
      renderHook(() => useIsMobile())
      
      expect(matchMediaMock).toHaveBeenCalledWith('(max-width: 767px)')
    })
  })

  describe('Initial state', () => {
    it('should initialize with correct value based on window width', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 400,
      })

      const { result } = renderHook(() => useIsMobile())

      // Wait for the effect to complete
      await waitFor(() => {
        expect(result.current).toBe(true)
      })
    })
  })
})