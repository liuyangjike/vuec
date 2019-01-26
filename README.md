## vuec

![](https://img.shields.io/badge/vuec-1.0.0-blue.svg)


## 介绍

学习`vuex`造的一个`vue`的状态管理的轮子


## 说明
>启动
1. `npm install`
2. `npm run serve`
> 觉得对你有帮助,请点右上角的`Star`支持一下</br>
> 推荐一下我的另一个项目“用console.log看vue源码” [点这里](https://github.com/liuyangjike/vue-console)

## 解析

### 目的

不同组件共享的某些状态

![](http://ww1.sinaimg.cn/large/b44313e1ly1fzjsg3h9jbj20j10e4t9b.jpg)

逻辑图

![](http://ww1.sinaimg.cn/large/b44313e1ly1fzjverkl6yj20w80pb0we.jpg)

### 插件安装
`vuec`作为`vue`的一个插件, 具有`install`方法
```js
export function install (_Vue) {
  if (!Vue) {
    _Vue.mixin({
      beforeCreate: applyMixin // 这里不能箭头函数, 因为箭头函数会`this`会指向`center`
    })
  }
  Vue = _Vue
}
```
混入`beforeCreated`钩子, 是的每个组件实例化时, 执行该方法`applyMixin`

### 实例化Center
`$centet`实例将挂载`state`、`mutations`、`actions`、`getters`
实例化开始
```js
export default new Vuec.Center({
  state: {
    name: 'liuyang',
    job: 'IT'
  },
  // strict: true,
  mutations: {
    changeName (state, payload) {
      state.name = payload
    }
  },
  actions: {
    changeName (context, payload) {
      setTimeout(()=> context.commit('changeName', payload), 1000)
    }
  },
  getters: {
    getJoin(state, getters, cState, cGetters) {
      return state.name + state.job
    }
  },
  modules: {
    a: {
      state: {nameA: 'liuA'},
      mutations: {
        changeNameA (state, payload) {
          console.log(state, payload)
          state.nameA = payload
          console.log(state)
        }
      },
      modules: {
        a1: { state: {nameA1: 'a1'}}
      },
    },
    b: {
      state: {nameB: 'b'}
    }
  }
})
```
**接着构建`_modules`模块树**

`center`可以以模块为节点形成树状结构, 会递归`options`选项, 根据模块父子关系, 从`root`往下构建
```js
this._modules = new ModuleCollection(options)
```
**安装模块**

1. 根据模块树,完成对`state`树的构建
2. 当前模块本地上下文构建`local`
3. 在`center`实例的`_muattions[type]`上注册`wrappedMutationHandler`
4. 在`center`实例的`_actions[type]`上注册`wrappedActionHandler`
5. 在center实例的`_wrappedGetters[type]`上注册`wrappedGetter`

`wrappedMutationHandler`里面包含用户写的`mutation`, 往里传入当前模块的`state`, 用户就能获得`state`进行更改,其它`actions`等也是类似的
```js
const state = this._modules.root.state
installModule(this, state, [], this._modules.root)
```
**初始化center._vm**

会在`center`实例上添加`_vm`属性, 值`new Vue({})`,
```js
  // 利用Vue的响应系统形成data和computed
  center._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  })
```

而`center`上的`state`指向`center._vm.$data.$$state`
```js
get state () {  // 代理了this.$center.state的最终访问值
    return this._vm.$data.$$state
}
```
1. 利用`new Vue({})`转化成响应式
2. 将`state`转化成`data`属性
3. 将`getter`转化成`computed`

### 实例化Vue组件
```js
new Vue({
  el: '#app',
  router,
  center,
  template: '<App/>',
  components: {App}
})
```
执行到`beforeCreate`,  会执行`appluMixin`,
`vueInit`中会在每个组件上注册`$center`属性,指向`root`上的`center`

```js
export default function applyMixin() {
  vuecInit.call(this)
}

function vuecInit () {
  const options = this.$options
  // vue的实例化是从外往内, 所以父组件的$center一定是root上的$center
  this.$center = options.parent?options.parent.$center: options.center
}
```

### API

**commit**

这里传入的 `_type` 就是 `mutation` 的 type，我们可以从 `store._mutations `找到对应的函数数组，遍历它们执行获取到每个 `handler` 然后执行，实际上就是执行了 `wrappedMutationHandler(playload)`，接着会执行我们定义的 `mutation` 函数，并传入当前模块的`state`，所以我们的 `mutation` 函数也就是对当前模块的 `state `做修改。
```js
commit (_type, _payload) {  // 原型属性commit
  const {type, payload} = unifyObjectStyle(_type, _payload)

  const entry = this._mutations[type]
  if (!entry) {
    console.error(`[vuec] unkown mutation type: ${type}`)
    return
  }
  this._withCommit(()=> {  // 开关效果,严格模式下有用
    entry.forEach(handler => {
      handler(payload)  // handler就是
    })
  })
}
```
**dispatch**

这里传入的 `_type` 就是 `action` 的 `type`，我们可以从 `store._actions` 找到对应的函数数组，遍历它们执行获取到每个 `handler` 然后执行，实际上就是执行了 `wrappedActionHandler(payload)`，接着会执行我们定义的 `action` 函数，并传入一个对象，包含了当前模块下的 `dispatch、commit、getters、state`，以及全局的 `rootState `和 `rootGetters`，所以我们定义的 `action` 函数能拿到当前模块下的 `commit` 方法。

```js
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
```
**mapState**
`map**`有两种输入形式
```js
computed: {
  ...mapState(['name']),  // 数组
  ...mapState({
      name: state => state.name  // 对象
  })
},
methods: {
  ...mapMutations({
    mapMutationsName: 'changeName'
  }),
  // ...mapMutations(['changeName'])  // 映射关系
}
```
其实就是将执行`mapState()`返回一个对象, 通过`...`添加到计算属性中, 函数时: `val.call(this, this.$center.state, this.$center.getters)`传入`state`使得用户能访问`state`,

`getters`, 数组时: `this.$center.state[val]`直接返回对应值;

`mapMutations()`也是类似的, 返回一个对象,通过`...`添加到`methods`里,一般`val`都是`function`,
执行`center`实例上的`commit.apply(this.$center, [val].concat(args))`, `val`就成为`type`, `args`就时`payload`,

**`mapGetter`类似`mapState``mapActions`类似`mapMutations`**

```js

export const mapState = function (states) {
  const res = {}
  normalizeMap(states).forEach(({key, val}) => {
    res[key] = function mappedState () {
      return typeof val === 'function'  // 判断用户输入的数组还是对象
        ? val.call(this, this.$center.state, this.$center.getters)
        : this.$center.state[val]
    }
  })
  return res
}

export const mapMutations = function (mutations) {
  const res = {}
  normalizeMap(mutations).forEach(({key, val}) => {
    res[key] = function mappedMutation (...args) {
      let commit = this.$center.commit  // this指向当前组件实例
      return typeof val === 'function'
        ? val.apply(this, [commit].concat(args))
        : commit.apply(this.$center, [val].concat(args))  // type, payload
    }
  })
  return res
}

// 格式化用户输入
function normalizeMap (map) {
  return Array.isArray(map)
    ? map.map(key => ({key, val: key}))
    : Object.keys(map).map(key => ({key, val: map[key]}))
}
```
## 参考
[vuex](https://github.com/vuejs/vuex)
[Vue.js技术揭秘](https://ustbhuangyi.github.io/vue-analysis/)