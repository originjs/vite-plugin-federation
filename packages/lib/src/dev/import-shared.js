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

    const getSharedFromLocal = async (name) => {
      if (globalThis.moduleMap[name]?.import) {
        let module = await (await globalThis.moduleMap[name].get())()
        return flattenModule(module, name)
      }
    }
    const flattenModule = (module, name) => {
      if (typeof module.default === 'function') {
        Object.keys(module).forEach((key) => {
          if (key !== 'default') {
            module.default[key] = module[key]
          }
        })
        return module.default
      }
      if (module.default) module = Object.assign({}, module.default, module)
      return module
    }
    globalThis.importShared = async (name, shareScope = 'default') => {
      try {
        return moduleCache[name]
          ? new Promise((r) => r(moduleCache[name]))
          : (await getSharedFromRuntime(name, shareScope)) ||
              getSharedFromLocal(name)
      } catch (ex) {
        console.log(ex)
      }
    }
  }
}
