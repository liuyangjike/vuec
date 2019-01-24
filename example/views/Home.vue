<template>
  <div>
    <h2>Home</h2>
    <h3>{{$center.getters.getJoin}}</h3>
    <div>{{$center.state.a.nameA}}</div>
    <h4>{{nameMap}}</h4>
    <button @click='changeState'>change</button>
    <button @click="()=> {this.$router.push('/foo')}">foo</button>
    <router-view></router-view>
  </div>
</template>


<script>
import vuec from '@/index'
const mapState = vuec.mapState

export default {
  data () {
    return {
      name: 'Home'
    }
  },
  created () {
    console.log(this.$center.state)
    const res = mapState({
      nameMap: function (state) {
        console.log(this)
        console.log(state.name)
        return state.name
      },
    })
    console.log(res, 'ppp')
    // this.$center.state = '222'
  },
  computed: {
    ...mapState({
      nameMap: function (state) {
        console.log(this)
        console.log(state.name)
        return state.name
      },
    })
  },
  methods: {
    changeState () {
      // this.$center.state.name ='strict'
      this.$center.commit('changeNameA', 'jiekeknff')
    }
  }
}
</script>