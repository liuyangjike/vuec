<template>
  <div>
    <h2>Home</h2>
    <h3>{{$center.getters.getJoin}}</h3>
    <div>{{$center.state.a.nameA}}</div>
    <h4>{{nameMap}}COm</h4>
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
    // this.$center.state = '222'
    // console.log(this)
  },
  computed: {
    ...mapState({
      nameMap: function (state) {
        return state.name
      },
    })
  },
  methods: {
    changeState () {
      this.$center.commit('changeName', 'jiekeknff')
    }
  }
}
</script>