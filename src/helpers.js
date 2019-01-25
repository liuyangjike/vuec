import {forEachValue} from './utils'


export const mapState = function (obj) {
  const res = {}
  forEachValue(obj, (map, key) => {
    res[key] = function () {
      return map.call(this, this.$center.state)
    }
  })
  return res
}