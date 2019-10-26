<template>
  <div id="app">
    <header>
      <app-navigation></app-navigation>
    </header>
    <main>
      <router-view />
    </main>
    <app-footer></app-footer>
  </div>
</template>

<script>
import AppNavigation from './components/Navigation.vue';
import AppFooter from './components/Footer.vue';

export default {
  name: 'app',
  components: {
    AppNavigation,
    AppFooter
  }
}
</script>

<style lang="scss">
html, body {
  margin: 0;
  padding: 0;
}

div#app {
  font-family: sans-serif;
}

main {
  margin: auto;
  width: 75%;
}
</style>