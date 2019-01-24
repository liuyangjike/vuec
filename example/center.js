import Vue from 'vue'
import Vuec from '../src/index'

Vue.use(Vuec)

export default new Vuec.Center({
  state: {
    name: 'liuyang',
    job: 'IT'
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
  },
  getters: {
    getJoin(state) {
      return state.name + state.job
    }
  },
  modules: {
    a: {
      state: {nameA: 'a'},
      mutations: {
        changeNameA (state, payload) {
          console.log(state)
          // state.name = payload
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