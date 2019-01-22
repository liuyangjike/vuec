export default class Module {
  constructor (rawModule) {
    this._children = Object.create(null)
    this._rawModule = rawModule
    this.state = rawModule.state
  }
  addChild (key, module) {
    this._children[key] = module
  }
  getChild (key) {
    return this._children[key]
  }
}