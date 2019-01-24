import applyMixin from './mixins'
import {isObject, forEachValue, assert} from './utils'
import ModuleCollection from './module/module-collection'

let Vue // 全局变量, 保存install里的Vue

export class Center {
  constructor (options= {}) {

    const {strict = false} = options
    this._mutations = options.mutations
    this._actions = options.actions
    this._modules = new ModuleCollection(options)
    this._wrappedGetters = Object.create(null)
    this._committing = false  // 在严格模式下的只能通过mutation变更
    this.strict = strict
    const state = this._modules.root.state
    // installModule(this, state, [], this._modules.root)
    const center = this
    // observeState(center, options.state)
    const {dispatch, commit} = this  // 取出原型上的commit, dispatch
    this.dispatch = function boundDispatch(type, payload) {  // //local的dispatch的this无法指向Center
      return dispatch.call(center, type, payload)
    }
    this.commit = function boundCommit (type, payload, options) { //local的commit的this无法指向Center
      return commit.call(center, type, payload, options)
    }
    installModule(this, state, [], this._modules.root)
    resetCenterVM(center, state)

  }
  get state () {  // 代理了this.$center.state的最终访问值
    return this._vm.$data.$$state
  }
  commit (_type, _payload) {  // 原型属性commit
    const {type, payload} = unifyObjectStyle(_type, _payload)

    const entry = this._mutations[type]
    if (!entry) {
      console.error(`[vuec] unkown mutation type: ${type}`)
      return
    }
    this._withCommit(()=> {
      entry.forEach(handler => {
        handler(payload)
      })
    })
  }
  /* 在 mutation 中混合异步调用会导致你的程序很难调试。
  例如，当你调用了两个包含异步回调的 mutation 来改变状态，
  你怎么知道什么时候回调和哪个先回调呢？这就是为什么我们要区分这两个概念*/
  dispatch (_type, _payload) { // tong
    const {type, payload} = unifyObjectStyle(_type, _payload)
    const entry = this._actions[type]
    if (!entry) {
      console.error(`[vuec] unkown actions type: ${type}`)
      return
    }
    const result = Promise.all(entry.map(handler =>  //一个type对应多个action, 可能含有多个异步
      handler(payload)
    ))
    return result
  }
  _withCommit (fn) {
    const _committing = this._committing
    this._committing = true
    fn()
    this._committing = _committing
  }
}



function installModule(center, rootState, path, module) {
  const isRoot = !path.length
  if (!isRoot) {
    const parentState =  getNestedState(rootState, path.slice(0, -1))
    const moduleName = path[path.length - 1]  // 模块名
    parentState[moduleName] = module.state
  }

  // 构建一个本地的环境
  const local = module.context = makeLocalContext(center, path)
  // console.log(local)
  // 循环构建state, mutations, actions
  module.forEachMutation((mutation, key) => {
    registerMutation(center, key, mutation, local)
  })
  module.forEachAction((action, key) => {
    registerAction(center, key, action, local)    
  })

  module.forEachGetter((getter, key) => {
    registerGetter(center, key, getter, local)
  })
  module.forEachChild((child, key) => {
    installModule(center, rootState, path.concat(key), child)
  })

}

function registerMutation (center, type, handler, local) {
  const entry = center._mutations[type] = []
  entry.push(function wrappedMutationHanlder (payload) {
    handler( local.state, payload)
  })
}


function registerAction (center, type, handler, local) {
  const entry = center._actions[type] = []
  entry.push(function wrappedActionHanlder (payload) {
    handler(local, payload)
  })
}

function registerGetter(center, type, rawGetter, local) {
  center._wrappedGetters[type] = function wrappedGetter(center) {
    return rawGetter(
      local.state,
      local.getters,
      center.state,
      center.getters
    )
  }
}

// 实例化
function resetCenterVM(center, state) {
  // const oldVm = center._vm
  center.getters = {} // 外部访问的就是它
  const wrappedGetters = center._wrappedGetters
  const computed = {}
  forEachValue(wrappedGetters, (fn, key) => {
    computed[key] = () => fn(center)  // 构造成对象的形式, 然后直接用计算属性来注册getters
    Object.defineProperty(center.getters, key, {
      get: () => center._vm[key],
      enumerable: true  // for
    })
  })

  // 利用Vue的响应系统形成data和computed
  center._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  })
  
  if (center.strict) {
    enableStrictMode(center)
  }
}


function enableStrictMode(center) {
  center._vm.$watch(function () { return this._data.$$state}, () => {
    console.log(center._committing)
    assert(center._committing, `do not mutate vuex center state outside mutation handlers`)
  }, {deep: true, sync: true})
}

function makeLocalContext(center, path) {
  const local = {
    dispatch: center.dispatch,
    commit: center.commit,
  }
  // 将local的state定义成惰性求值,因为这时的center.state还不存在, center.getter这时也不存在
  Object.defineProperties(local, {
    getters: {
      get: center.getters
    },
    state: {
      get: function () {
        return getNestedState(center.state, path)
      }
    }
  })
  return local
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