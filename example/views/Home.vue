<template>
  <div>
    <h2>例子</h2>
    <h4>{{$center.state.name}} <span class='explain'>----> $center.state.name</span></h4>
    <h4>{{$center.state.a.nameA}} <span class='explain'>---> $center.state.a.nameA</span></h4>
    <h4>{{$center.getters.getJoin}} <span class='explain'>---> $center.getters.getJoin</span></h4>
    <h4>{{name}} <span class='explain'> ---->...mapState(['name'])</span></h4>
    <h4>{{getJoin}}<span class='explain'> ---> ...mapGetters(['getJoin'])</span></h4>
    <button @click='mutationName'>mutationName</button>
    <button @click='actionName'>actionName</button>
    <button @click="mapMutationsName('mapMutation')">mapMutationsName</button>
    <button @click='mapActionsName("mapActions")'>mapActionsName</button>
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
    mutationName () {
      this.$center.commit('changeName', 'mutation')
    },
    actionName () {
      this.$center.dispatch('changeName', 'action')
    },
    changeState () {
      // this.$center.commit('changeName', 'jiekeknff')
      // this.changeNameK('huehuehu')
      this.changeName('actions')
    },
    ...mapMutations({
      mapMutationsName: 'changeName'
    }),
    // ...mapMutations(['changeName'])  // 映射关系
    // ...mapMutations({
    //   changeNameK: function (commit, payload) {
    //     commit('changeName', 'poijhh')
    //   }
    // }),
    // ...mapActions(['changeName'])
    ...mapActions({
      mapActionsName: 'changeName'
    })

  }
}
</script>

<style  scoped>
  .explain{
    font-weight: 300;
    color: #555
  }
</style>