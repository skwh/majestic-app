<template>
  <footer>
    &copy; {{ this.currentYear }} <a href="http://du.edu/">University of Denver</a>. 
    
    Run by Prof. Brian Majestic of the Chemistry Department.
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
  border-top: 1px solid rgba(0, 0, 0, 0.5);
  width: 100%;
  padding: 1%;
  position: fixed;
  bottom: 0;
}
</style>