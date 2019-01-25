<template>
  <div>
    <h2>Home</h2>
    <h3>{{$center.getters.getJoin}}</h3>
    <div>{{$center.state.a.nameA}}</div>
    <h4>{{name}}COm</h4>
    <h4>{{getJoin}}-m</h4>

    <button @click='changeState'>change</button>
    <button @click="()=> {this.$router.push('/foo')}">foo</button>
    <router-view></router-view>
  </div>
</template>


<script>
import vuec from '@/index'
const mapState = vuec.mapState
const mapMutations = vuec.mapMutations
const mapActions = vuec.mapActions
const mapGetters = vuec.mapGetters

export default {
  data () {
    return {
      // name: 'Home'
    }
  },
  created () {
    // this.$center.state = '222'
    // console.log(this)
  },
  computed: {
    ...mapState(['name']),
    ...mapGetters(['getJoin'])
  },
  methods: {
    changeState () {
      // this.$center.commit('changeName', 'jiekeknff')
      // this.changeNameK('huehuehu')
      this.changeName('actions')
    },
    // ...mapMutation({
    //   changeNameK: 'changeName'
    // })
    // ...mapMutation(['changeName'])  // 映射关系
    // ...mapMutations({
    //   changeNameK: function (commit, payload) {
    //     commit('changeName', 'poijhh')
    //   }
    // }),
    ...mapActions(['changeName'])
  }
}
</script>