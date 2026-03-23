import { describe, expect, it } from 'vitest'

/**
 * flattenModule is a runtime template (federation_fn_import.js) that gets
 * injected into the build output. We replicate the logic here to unit-test
 * the Proxy behaviour without requiring a full build.
 */

// Simulates the moduleCache used by the runtime
const moduleCache: Record<string, unknown> = {}

// This is the patched flattenModule (Proxy-based)
const flattenModule = (module: any, name: string) => {
  if (typeof module.default === 'function') {
    Object.keys(module).forEach((key) => {
      if (key !== 'default') {
        module.default[key] = module[key]
      }
    })
    moduleCache[name] = module.default
    return module.default
  }
  if (module.default) {
    const originalModule = module
    module = new Proxy(module.default, {
      get(target, prop) {
        if (prop !== 'default' && prop in originalModule)
          return originalModule[prop]
        return target[prop]
      },
      has(target, prop) {
        return prop in originalModule || prop in target
      },
      ownKeys(target) {
        const keys = new Set([
          ...Reflect.ownKeys(target),
          ...Reflect.ownKeys(originalModule)
        ])
        keys.delete('default')
        return [...keys]
      }
    })
  }
  moduleCache[name] = module
  return module
}

describe('flattenModule — Proxy preserves live bindings', () => {
  it('should preserve mutable state on default export (React hooks dispatcher pattern)', () => {
    // Simulates React's module structure: __CLIENT_INTERNALS...H is null at
    // load time and only set during render.
    const internals = { H: null as (() => void) | null }
    const reactModule = {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      default: { __INTERNALS: internals, createElement: () => {} },
      __esModule: true
    }

    const result = flattenModule(reactModule, 'react-mutable')

    // At load time, H is null
    expect(result.__INTERNALS.H).toBeNull()

    // Simulate render — React sets H at runtime
    internals.H = () => 'dispatcher active'

    // The Proxy should reflect the live value, NOT a snapshot
    expect(result.__INTERNALS.H).not.toBeNull()
    expect(result.__INTERNALS.H!()).toBe('dispatcher active')
  })

  it('should expose named exports alongside default export properties', () => {
    const module = {
      default: { defaultProp: 'from-default' },
      namedExport: 'from-named',
      anotherExport: 42
    }

    const result = flattenModule(module, 'mixed-exports')

    expect(result.defaultProp).toBe('from-default')
    expect(result.namedExport).toBe('from-named')
    expect(result.anotherExport).toBe(42)
  })

  it('should prioritise named exports over default export properties', () => {
    const module = {
      default: { shared: 'from-default' },
      shared: 'from-named'
    }

    const result = flattenModule(module, 'priority-test')

    // Named export takes precedence (prop in originalModule check)
    expect(result.shared).toBe('from-named')
  })

  it('should not expose "default" key in ownKeys', () => {
    const module = {
      default: { a: 1 },
      b: 2
    }

    const result = flattenModule(module, 'no-default-key')
    const keys = Reflect.ownKeys(result)

    expect(keys).not.toContain('default')
    expect(keys).toContain('a')
    expect(keys).toContain('b')
  })

  it('should handle function default exports by copying named exports onto it', () => {
    const fn = () => 'hello'
    const module = {
      default: fn,
      helper: 'util'
    }

    const result = flattenModule(module, 'fn-default')

    expect(typeof result).toBe('function')
    expect(result()).toBe('hello')
    expect(result.helper).toBe('util')
  })

  it('should not cause infinite recursion (regression: Proxy traps calling themselves)', () => {
    const module = {
      default: { value: 'test' },
      extra: true
    }

    // This would stack overflow if `module` was used instead of
    // `originalModule` in the Proxy traps
    expect(() => {
      const result = flattenModule(module, 'recursion-guard')
      // Trigger has trap
      'value' in result
      'extra' in result
      'nonexistent' in result
      // Trigger ownKeys trap
      Object.keys(result)
      Reflect.ownKeys(result)
    }).not.toThrow()
  })

  it('should return module as-is when there is no default export', () => {
    const module = { a: 1, b: 2 }

    const result = flattenModule(module, 'no-default')

    expect(result).toBe(module)
    expect(result.a).toBe(1)
    expect(result.b).toBe(2)
  })
})
