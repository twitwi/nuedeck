<template>
  <div class="slide-number">
    {{ p.vars.venue }} |
    {{ p.vars.author }} |
    {{ p.vars.date }} |
    {{ current + 1 }} / {{ p.slideCount }} <span v-if="p.stepCount>1">({{ p.currentStep }}/{{ p.stepCount }})</span>
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
    current: {
      default () { return this.$parent.renderSlide }
    }
  }
}
</script>

<style scoped>
</style>
