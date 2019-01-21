<template>
  <div>
    <h2>Home</h2>
    <div>{{$center.state.name}}</div>
    <button @click='changeState'>change</button>
    <button @click="()=> {this.$router.push('/foo')}">foo</button>
    <router-view></router-view>
  </div>
</template>


<script>
export default {
  data () {
    return {
      name: 'Home'
    }
  },
  created () {
    console.log(this.$center.state)
    // this.$center.state = '222'
  },
  methods: {
    changeState () {
      this.$center.state.name = '222'
    }
  }
}
</script>