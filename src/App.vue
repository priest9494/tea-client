<template>
  <div id="app">
    <TeaView/>
  </div>
</template>

<script>
import TeaView from './components/Tea'

export default {
  name: 'App',
  components: {
    TeaView
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
}
</style>
