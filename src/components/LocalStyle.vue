<script>
export default {
  name: 'LocalStyle',
  render (createElement) {
    return createElement('style', this.$slots.default)
  },
}
</script>
