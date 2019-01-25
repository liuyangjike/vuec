import {forEachValue} from './utils'


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

export const mapGetters = function (getters) {
  const res = {}
  normalizeMap(getters).forEach(({key, val}) => {
    res[key] = function mappedGetter () {
      return this.$center.getters[val]
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


export const mapActions = function (actions) {
  const res = {}
  normalizeMap(actions).forEach(({key, val}) => {
    res[key] = function mappedAction (...args) {
      let dispatch = this.$center.dispatch
      return typeof val === 'funciton'
        ? val.apply(this, [dispatch].concat(args))
        : dispatch.apply(this.$center, [val].concat(args))
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