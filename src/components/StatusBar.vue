<template>
  <div class="slide-number">
    {{ nd.vars.venue }} |
    {{ nd.vars.author }} |
    {{ nd.vars.date }} |
    {{ current + 1 }} / {{ nd.slideCount }} <span v-if="nd.stepCount>1">({{ nd.currentStep }}/{{ nd.stepCount }})</span>
  </div>
</template>

<script>
export default {
  name: 'StatusBar',
  inject: {nd: 'nd', renderSlide: {from: 'renderSlide', default: -42}}, // receiving the nuedeck object ($parent.$parent actually)
  props: {
    current: {
      default () { return this.renderSlide }
    }
  }
}
</script>

<style scoped>
</style>
