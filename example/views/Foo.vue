<template>
  <div>
    <h2>Foo</h2>
    <span>{{$center.state.a.nameA}}</span>
    <button @click="()=> {this.$router.push('/')}">Home</button>
  </div>
</template>