import {forEachValue} from './utils'


export const mapState = function (obj) {
  console.log(obj)
  console.log(this)
  const res = {}
  forEachValue(obj, (map, key) => {
    res[key] = function () {
      console.log(this.$center.state)
      map.call(this, this.$center.state)
    }
  })
  return res
}