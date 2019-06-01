<script>
// TODO: make it actually local? + allow it to be in the nd-source not in a slide
// the simplest solution is probably to tag all elements from a nd-source with the same class (or better to allow a classname on the nd-source, that is added to all and the locality is the user's problem, until scoped css are standard)
export default {
  name: 'LocalStyle',
  render (createElement) {
    return createElement('style', this.$slots.default)
  },
}
</script>
