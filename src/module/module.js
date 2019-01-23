import {forEachValue} from '../utils'
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
  forEachChild (fn) {
    forEachValue(this._children, fn)
  }
  forEachMutation (fn) {
    if (this._rawModule.mutations) {
      forEachValue(this._rawModule.mutations, fn)
    }
  }
  forEachAction (fn) {
    if (this._rawModule.actions) {
      forEachValue(this._rawModule.actions, fn)
    }
  }
}