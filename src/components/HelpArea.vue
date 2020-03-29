<template>
  <div class="help-area">
    <h3>Help, Tools and Configuration</h3>
    <h4>Key bindings</h4>
    <div class="helpkeys">
      <div v-for="(v,k) in nd.opts.keys" :key="k">
        <span v-html="nd.NR.functionsDollarF.renderShortcut(k)"></span>: {{k}}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HelpArea',
  inject: {nd: 'nd'},
  props: {
  }
}
</script>

<style scoped>
</style>
