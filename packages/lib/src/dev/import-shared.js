export const importShared = function () {
  if (!globalThis.importShared) {
    const moduleCache = Object.create(null)
    const getSharedFromRuntime = async (name, shareScope) => {
      let module = null
      if (globalThis?.__federation_shared__?.[shareScope]?.[name]) {
        const versionObj = globalThis.__federation_shared__[shareScope][name]
        const versionValue = Object.values(versionObj)[0]
        module = await (await versionValue.get())()
      }
      if (module) {
        return flattenModule(module, name)
      }
    }
    const flattenModule = (module, name) => {
      // use a shared module which export default a function will getting error 'TypeError: xxx is not a function'
      if (typeof module.default === 'function') {
        Object.keys(module).forEach((key) => {
          if (key !== 'default') {
            module.default[key] = module[key]
          }
        })
        moduleCache[name] = module.default
        return module.default
      }
      if (module.default) module = Object.assign({}, module.default, module)
      moduleCache[name] = module
      return module
    }
    globalThis.importShared = async (name, shareScope = 'default') => {
      try {
        return moduleCache[name]
          ? new Promise((r) => r(moduleCache[name]))
          : (await getSharedFromRuntime(name, shareScope)) || null
      } catch (ex) {
        console.log(ex)
      }
    }
  }
}
