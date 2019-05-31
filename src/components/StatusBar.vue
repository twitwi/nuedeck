<template>
  <div class="slide-number">
    {{ p.vars.venue }} |
    {{ p.vars.author }} |
    {{ p.vars.date }} |
    {{ $parent.renderSlide + 1 }} / {{ p.slideCount }}
  </div>
</template>

<script>
export default {
  name: 'StatusBar',
  computed: {
    p () {
      return this.$parent.$parent
    }
  },
  props: {
  }
}
</script>

<style scoped>
</style>
