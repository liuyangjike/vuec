import applyMixin from './mixins'
import {isObject} from './utils'
let Vue // 全局变量, 保存install里的Vue

export function install (_Vue) {
  if (!Vue) {
    _Vue.mixin({
      beforeCreate: applyMixin // 这里不能箭头函数, 因为箭头函数会自动绑定作用域
    })
  }
  Vue = _Vue
}

export class Center {
  constructor (options= {}) {
    let center = this
    this.mutations = options.mutations
    this.actions = options.actions
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


function observeState(center, state) { // 响应式state
  center._vm = new Vue({
    data: {
      $$state: state
    }
  })
}

function unifyObjectStyle (type, payload) {
  if (isObject(type) && type.type) {
    payload = type
    type = type.type
  }
  return {type, payload}
}