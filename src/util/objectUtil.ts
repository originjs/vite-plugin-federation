import { SharedObject, SharedConfig } from '../../types'

export function sharedAssign(
  shared: (string | SharedObject)[] | SharedObject
): Map<string, Map<string, string>> {
  shared = shared || []
  const assign: Map<string, Map<string, string>> = new Map()
  if (!Array.isArray(shared)) {
    shared = [shared]
  }
  shared.forEach((item) => {
    if (typeof item === 'string') {
      assign.set(item, new Map<string, string>())
    } else {
      // type is SharedObject
      for (const key in item) {
        if (Object.prototype.hasOwnProperty.call(item, key) && item[key]) {
          const paramMap: Map<string, string> = new Map()
          if (typeof item[key] === 'string') {
            paramMap.set('version', item[key] as string)
          } else {
            for (const itemElementKey in item[key] as SharedConfig) {
              paramMap.set(itemElementKey, item[key][itemElementKey])
            }
          }
          assign.set(key, paramMap)
        }
      }
    }
  })

  return assign
}

export function sharedScopeCode(
  shared: Map<string, Map<string, any>>,
  modules: string[]
): string[] {
  const res: string[] = []
  if (shared.size) {
    shared.forEach((value, key) => {
      let str = ''
      value.forEach((innerValue, innerkey) => {
        str += `${innerkey}:${JSON.stringify(innerValue)}, \n`
      })
      const searchElement = `__ROLLUP_FEDERATION_SHARED_PREFIX__\${${key}}`
      if (modules.indexOf(searchElement) >= 0) {
        str += `get: ()=> import('${searchElement}')`
      }
      res.push(`'${key}':{${str}}`)
    })
  }
  return res
}
