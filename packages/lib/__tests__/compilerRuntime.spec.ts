import { describe, expect, it } from 'vitest'

/**
 * These functions are defined in remote-production.ts and used to patch
 * compiler-runtime chunks at build time. We replicate them here to test
 * in isolation without a full Rollup build.
 */

// --- Replicated from remote-production.ts ---

const findImportSharedExportName = (code: string): string | null => {
  const unminifiedExport = /export\s*\{[^}]*\bas\s+importShared\b[^}]*\}/
  if (unminifiedExport.test(code)) {
    return 'importShared'
  }

  const asyncFnRe = /async\s+function\s+(\w+)\s*\(\s*(\w+)/g
  let fnMatch: RegExpExecArray | null

  while ((fnMatch = asyncFnRe.exec(code)) !== null) {
    const window = code.substring(
      fnMatch.index,
      Math.min(fnMatch.index + 300, code.length)
    )
    if (window.includes('moduleCache') || window.includes('Promise')) {
      const internalName = fnMatch[1]!

      const exportRe = new RegExp(
        `export\\s*\\{[^}]*\\b${internalName}\\s+as\\s+(\\w+)`
      )
      const exportMatch = exportRe.exec(code)
      if (exportMatch) {
        return exportMatch[1]!
      }

      const directExportRe = new RegExp(
        `export\\s*\\{[^}]*\\b${internalName}\\b`
      )
      if (directExportRe.test(code)) {
        return internalName
      }
    }
  }

  return null
}

const computeRelativePath = (from: string, to: string): string => {
  const fromParts = from.split('/')
  const toParts = to.split('/')

  fromParts.pop()

  let common = 0
  while (
    common < fromParts.length &&
    common < toParts.length &&
    fromParts[common] === toParts[common]
  ) {
    common++
  }

  const ups = fromParts.length - common
  const remaining = toParts.slice(common)
  const prefix = ups > 0 ? '../'.repeat(ups) : './'

  return prefix + remaining.join('/')
}

const patchCompilerRuntime = (
  code: string,
  federationImportFile: string,
  runtimeFile: string,
  importSharedName: string
): string => {
  if (!code.includes('useMemoCache') || !code.includes('export{')) {
    return code
  }

  const relPath = computeRelativePath(runtimeFile, federationImportFile)

  return [
    `import{${importSharedName} as __s}from"${relPath}";`,
    `var __react=await __s("react");`,
    `var __internals=__react.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;`,
    `var __obj={c:function(n){return __internals.H.useMemoCache(n)}};`,
    `export{__obj as c};`
  ].join('')
}

// --- Tests ---

describe('findImportSharedExportName', () => {
  it('should detect unminified importShared export', () => {
    const code = `async function importShared(name, shareScope) {
      return moduleCache[name] ? new Promise((r) => r(moduleCache[name])) : null;
    }
    export{importShared, getSharedFromRuntime as importSharedRuntime}`

    expect(findImportSharedExportName(code)).toBe('importShared')
  })

  it('should detect minified importShared export (renamed)', () => {
    const code = `async function xe(e,t="default"){return moduleCache[e]?new Promise((r)=>r(moduleCache[e])):null}export{xe as i,ye as j}`

    expect(findImportSharedExportName(code)).toBe('i')
  })

  it('should detect direct export (not renamed)', () => {
    const code = `async function myImport(n,s="default"){return moduleCache[n]?new Promise((r)=>r(moduleCache[n])):null}export{myImport}`

    expect(findImportSharedExportName(code)).toBe('myImport')
  })

  it('should return null when no importShared-like function found', () => {
    const code = `function hello(){return "world"}export{hello}`

    expect(findImportSharedExportName(code)).toBeNull()
  })
})

describe('computeRelativePath', () => {
  it('should compute same-directory path', () => {
    expect(
      computeRelativePath(
        'assets/compiler-runtime-abc.js',
        'assets/__federation_fn_import-xyz.js'
      )
    ).toBe('./__federation_fn_import-xyz.js')
  })

  it('should compute parent-directory path', () => {
    expect(
      computeRelativePath(
        'assets/chunks/compiler-runtime-abc.js',
        'assets/__federation_fn_import-xyz.js'
      )
    ).toBe('../__federation_fn_import-xyz.js')
  })

  it('should compute path for files at root level', () => {
    expect(
      computeRelativePath(
        'compiler-runtime-abc.js',
        '__federation_fn_import-xyz.js'
      )
    ).toBe('./__federation_fn_import-xyz.js')
  })
})

describe('patchCompilerRuntime', () => {
  const SAMPLE_CHUNK = `import{r as R}from"./index-XYZ.js";var i={exports:{}},o={};var u;function m(){if(u)return o;u=1;var r=R().__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;return o.c=function(e){return r.H.useMemoCache(e)},o}var s=m();export{s as c};`

  it('should rewrite compiler-runtime chunk to use importShared', () => {
    const patched = patchCompilerRuntime(
      SAMPLE_CHUNK,
      'assets/__federation_fn_import-xyz.js',
      'assets/compiler-runtime-abc.js',
      'importShared'
    )

    expect(patched).toContain('import{importShared as __s}')
    expect(patched).toContain('await __s("react")')
    expect(patched).toContain(
      '__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE'
    )
    expect(patched).toContain('useMemoCache')
    expect(patched).toContain('export{__obj as c}')
    // Should NOT contain the original direct import
    expect(patched).not.toContain('./index-XYZ.js')
  })

  it('should use correct relative path to federation import chunk', () => {
    const patched = patchCompilerRuntime(
      SAMPLE_CHUNK,
      'assets/__federation_fn_import-xyz.js',
      'assets/compiler-runtime-abc.js',
      'i'
    )

    expect(patched).toContain(
      'import{i as __s}from"./__federation_fn_import-xyz.js"'
    )
  })

  it('should not patch code without useMemoCache', () => {
    const code = `import{r as R}from"./index.js";export{R as react};`
    const result = patchCompilerRuntime(
      code,
      'assets/__federation_fn_import.js',
      'assets/some-chunk.js',
      'importShared'
    )

    expect(result).toBe(code)
  })

  it('should not patch code without export statement', () => {
    const code = `var r = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE; r.H.useMemoCache(1);`
    const result = patchCompilerRuntime(
      code,
      'assets/__federation_fn_import.js',
      'assets/some-chunk.js',
      'importShared'
    )

    expect(result).toBe(code)
  })
})
