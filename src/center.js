import applyMixin from './mixins'
import {isObject} from './utils'
import ModuleCollection from './module/module-collection'

let Vue // 全局变量, 保存install里的Vue

export class Center {
  constructor (options= {}) {
    this.mutations = options.mutations
    this.actions = options.actions
    this._modules = new ModuleCollection(options)
    const state = this._modules.root.state
    installModule(this, state, [], this._modules.root)
    const center = this
    observeState(center, options.state)
  }
  get state () {  // 代理了this.$center.state的最终访问值
    return this._vm.$data.$$state
  }
  commit (_type, _payload) {
    const {type, payload} = unifyObjectStyle(_type, _payload)
    const entry = this.mutations[type]
    if (!entry) {
      console.error(`[vuec] unkown mutation type: ${type}`)
      return
    }
    entry(this.state, payload)
  }
  /* 在 mutation 中混合异步调用会导致你的程序很难调试。
  例如，当你调用了两个包含异步回调的 mutation 来改变状态，
  你怎么知道什么时候回调和哪个先回调呢？这就是为什么我们要区分这两个概念*/
  dispatch (_type, _payload) { // tong
    const {type, payload} = unifyObjectStyle(_type, _payload)
    const entry = this.actions[type]
    if (!entry) {
      console.error(`[vuec] unkown actions type: ${type}`)
      return
    }
    const result = new Promise(
      (resolve) => {
        entry(this, payload)
        resolve()
      }
    )
    return result
  }
}


function installModule(center, rootState, path, module) {
  const isRoot = !path.length
  if (!isRoot) {
    const parentState =  getNestedState(rootState, path.slice(0, -1))
    const moduleName = path[path.length - 1]  // 模块名
    parentState[moduleName] = module.state
  }
  Object.keys(module._children).forEach(key => {
    installModule(center, rootState, path.concat(key), module._children[key])
  })
}

function observeState(center, state) { // 响应式state
  center._vm = new Vue({
    data: {
      $$state: state
    }
  })
}

function getNestedState (state, path) { // 根据路径path去一层层寻找模块, 返回path数组的最后元素对应的模块
  return path.length
    ? path.reduce((state, key) => state[key], state)
    : state
}


function unifyObjectStyle (type, payload) {
  if (isObject(type) && type.type) {
    payload = type
    type = type.type
  }
  return {type, payload}
}


export function install (_Vue) {
  if (!Vue) {
    _Vue.mixin({
      beforeCreate: applyMixin // 这里不能箭头函数, 因为箭头函数会自动绑定作用域
    })
  }
  Vue = _Vue
}