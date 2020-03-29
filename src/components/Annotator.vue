<template>
  <div class="annotator" ref="root">
    <div class="pages">
      <span v-for="(p,i) in pages" :key="i"
      @click.prevent="setPage(i)"
      :class="{currentpage: currentPage == i}">[{{i+1}}]</span>
      <span class="new-page" @click.prevent="addPage">(+)</span>
      <span v-html="nd.NR.functionsDollarF.renderShortcut('toggleAnnotator')" @click.prevent="nd.$emit('toggleAnnotator')"></span>
    </div>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
export default {
  name: 'Annotator',
  inject: {nd: 'nd'},
  props: {
    current: {default: ''}
  },
  data: () => ({
    slidePages: {}, // slideId -> list of pages
    currentPage: -1,
  }),
  computed: {
    pages () {
      if (this.slidePages[this.current] == null) {
        return []
      }
      return this.slidePages[this.current]
    },
  },
  methods: {
    addPage () {
      if (this.slidePages[this.current] == null) {
        this.$set(this.slidePages, this.current, [])
      }
      this.slidePages[this.current].push([this.slidePages[this.current].length*20]) // TODO [] and tools to add
      this.currentPage = this.slidePages[this.current].length - 1
      this.repaintCanvas()
    },
    setPage (i) {
      this.currentPage = i
      this.repaintCanvas()
    },
    repaintCanvas () {
      let canvas = this.$refs.canvas
      let topStyle = window.getComputedStyle(this.$refs.root.parentElement)
      canvas.width = topStyle.width.replace('px', '')
      canvas.height = topStyle.height.replace('px', '')
      console.log(canvas.width, canvas.height)
      let ctx = canvas.getContext('2d')
      ctx.lineWidth = 10
      ctx.strokeStyle = 'orange'
      ctx.moveTo(20, this.pages[this.currentPage][0])
      ctx.lineTo(160, 20)
      ctx.stroke()
    },
  },
}
</script>

<style scoped>
</style>
