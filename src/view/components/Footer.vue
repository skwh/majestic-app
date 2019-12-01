<template>
  <footer>
    Prof. Brian Majestic, PhD.
  </footer>
</template>

<script>
const currentYear = () => (new Date()).getFullYear();

export default {
  name: 'AppFooter',
  data() {
    return {
      currentYear: currentYear()
    }
  }
}
</script>

<style lang="scss" scoped>
footer {
  text-align: center;
}
</style>