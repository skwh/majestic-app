<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>

export default {
  name: 'app'
}
</script>

<style lang="scss">
#app {
  h1 {
    text-transform: uppercase;
  }
  p {
    font-size: 1.25em;
  }
}
</style>