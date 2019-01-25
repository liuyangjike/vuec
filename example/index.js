import Vue from 'vue'
import App from './App'
import router from './router'
import center from './center'

console.log(this, 'oppokjjhh')
new Vue({
  el: '#app',
  router,
  center,
  template: '<App/>',
  components: {App}
})

if (module.hot) {
  module.hot.accept()
}