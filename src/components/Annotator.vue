<template>
  <div class="annotator" ref="root">
    <div class="tools">
      <span v-for="(p, i) in pages" :key="i" @click.prevent="setPage(i)" :class="{ currentpage: currentPage == i }">[{{ i + 1 }}]</span>
      <span class="new-page" @click.prevent="addPage">(+)</span>
      <span v-for="c in colors" :key="c" :class="{ 'tool-color': true, active: currentColor == c }" @click="currentColor = c" :style="{ color: c }"
        >.</span
      >
      <span v-for="s in sizes" :key="s" :class="{ 'tool-size': true, active: currentWidth == s }" @click="currentWidth = s">{{ s }}</span>
      <span v-html="nd.NR.functionsDollarF.renderShortcut('toggleAnnotator')" @click.prevent="nd.$emit('toggleAnnotator')"></span>
      <span @click="save()">[S]</span>
      <span @click="load()">[L]</span>
    </div>
    <canvas ref="canvas" @mousedown="mDown($event)" @mouseup="mUp($event)" @mousemove="mMove($event)"></canvas>
  </div>
</template>

<script>
export default {
  name: 'Annotator',
  inject: { nd: 'nd' },
  props: {
    current: { default: '' },
    colors: { default: () => ['blue', 'black', 'red', 'green', 'cyan', 'magenta', 'yellow'] },
    sizes: { default: () => [1, 3, 5, 10, 20] },
    lsKey: { default: 'nuedeck-annotator' },
  },
  data: () => ({
    //slidePages: {}, // slideId -> list of pages
    currentPage: -1,
    currentColor: 'blue',
    currentWidth: 3,
  }),
  computed: {
    pages() {
      if (this.nd.ext.annotate[this.current] == null) {
        return []
      }
      return this.nd.ext.annotate[this.current]
    },
  },
  mounted() {
    let topStyle = window.getComputedStyle(this.$refs.root.parentElement)
    this.$refs.canvas.width = topStyle.width.replace('px', '')
    this.$refs.canvas.height = topStyle.height.replace('px', '')
    if (this.nd.ext.annotate[this.current] != null) {
      this.currentPage = this.nd.ext.annotate[this.current].length - 1
      this.repaintCanvas()
    }
  },
  methods: {
    addPage() {
      if (this.nd.ext.annotate[this.current] == null) {
        this.$set(this.nd.ext.annotate, this.current, [])
      }
      this.nd.ext.annotate[this.current].push([])
      this.currentPage = this.nd.ext.annotate[this.current].length - 1
      this.repaintCanvas()
    },
    setPage(i) {
      this.currentPage = i
      this.repaintCanvas()
    },
    repaintCanvas() {
      let canvas = this.$refs.canvas
      let topStyle = window.getComputedStyle(this.$refs.root.parentElement)
      canvas.width = topStyle.width.replace('px', '')
      canvas.height = topStyle.height.replace('px', '')
      let ctx = canvas.getContext('2d')
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      let objects = this.nd.ext.annotate[this.current][this.currentPage]
      for (let o of objects) {
        ctx.beginPath()
        if (o[0].type == 'line') {
          let [{ color, width }, ...points] = o
          ctx.lineWidth = width
          ctx.strokeStyle = color
          for (let pi in points) {
            let p = points[pi]
            ctx[pi == 0 ? 'moveTo' : 'lineTo'](p.x, p.y)
          }
          ctx.stroke()
        } else {
          this.$console.log('UNSUPPORTED type for annotator object', o)
        }
      }
    },
    pos(ev) {
      return [ev.offsetX, ev.offsetY]
    },
    mDown(ev) {
      window.sp = this.nd.ext.annotate
      if (this.nd.ext.annotate[this.current] == null) {
        this.addPage()
      }
      let color = this.currentColor
      let width = this.currentWidth
      let [x, y] = this.pos(ev)
      let line = [
        { type: 'line', color, width },
        { x, y },
      ]
      this.nd.ext.annotate[this.current][this.currentPage].push(line)
    },
    mMove(ev) {
      if (ev.buttons == 1) {
        let objects = this.nd.ext.annotate[this.current][this.currentPage]
        let line = objects[objects.length - 1]
        let [x, y] = this.pos(ev)
        line.push({ x, y })
        this.repaintCanvas()
      }
    },
    mUp(ev) {
      let objects = this.nd.ext.annotate[this.current][this.currentPage]
      let line = objects[objects.length - 1]
      if (line.length == 2) {
        let [x, y] = this.pos(ev)
        line.push({ x, y })
        this.repaintCanvas()
      }
      this.nd.addLog('annotator-dump', this.nd.ext.annotate)
    },
    save() {
      localStorage.setItem(this.lsKey, JSON.stringify(this.nd.ext.annotate))
    },
    load() {
      let ls = localStorage.getItem(this.lsKey)
      if (ls == null) {
        return null
      }
      this.nd.$set(this.nd.ext, 'annotate', JSON.parse(ls))
      if (this.nd.ext.annotate[this.current] != null) {
        this.currentPage = this.nd.ext.annotate[this.current].length - 1
        this.repaintCanvas()
      }
    },
  },
}
</script>

<style scoped></style>
