<template>
  <div class="slide-number">
    {{ $parent.vars.venue }} |
    {{ $parent.vars.author }} |
    {{ $parent.vars.date }} |
    {{ $parent.renderSlide + 1 }} / {{ $parent.$parent.slideCount }}
  </div>
</template>

<script>
export default {
  name: 'StatusBar',
  props: {
  }
}
</script>

<style scoped>
</style>
