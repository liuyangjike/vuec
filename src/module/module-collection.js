import Module from './module'
import {forEachValue} from '../utils'

export default class ModuleCollection {
  constructor (rawRootModule) {
    this.register([], rawRootModule)
  }

  get (path) {   // path有几个代表向里找几层结构, 找到当前对应的module
    return path.reduce((module, key) => {
      return module.getChild(key)
    }, this.root)
  }

  register (path, rawModule) {
    let newModule = new Module(rawModule)
    if (!path.length) {
      this.root = newModule
    } else {
      const parent = this.get(path.slice(0, -1))
      parent.addChild(path[path.length - 1], newModule)
    }
    if (rawModule.modules) {  // 遍历子模块
      forEachValue(rawModule.modules, (rawModuleChild, key) => {
        this.register(path.concat(key), rawModuleChild)
      })
    }
  }
}