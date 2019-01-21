import Vue from 'vue'
import Vuec from '../src/index'

Vue.use(Vuec)

export default new Vuec.Center({
  state: {
    name: 'liuyang'
  },
  mutations: {
    changeName (state, payload) {
      state.name = payload
    }
  },
  actions: {
    changeName (context, payload) {
      setTimeout(()=> context.commit('changeName', payload), 1000)
    }
  }
})