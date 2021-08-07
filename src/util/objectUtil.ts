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
