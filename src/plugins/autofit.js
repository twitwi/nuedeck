
function autofit() {
  let o = this.opts
  let r = {width: this.$refs.nuedeck.clientWidth, height: this.$refs.nuedeck.clientHeight}
  let m = o.core.fitMargin
  let dw = o.core.designWidth
  let dh = o.core.designHeight
  let sx = r.width / (dw + m[1] + m[3])
  let sy = r.height / (dh + m[0] + m[2])
  let s = Math.min(sx, sy)

  let tx = m[3] + (r.width/s - (dw + m[1] + m[3])) / 2
  let ty = m[0] + (r.height/s - (dh + m[0] + m[2])) / 2
  this.$refs.fit.style.width = `${dw}px`
  this.$refs.fit.style.height = `${dh}px`
  this.$refs.fit.style.transform = `translate(-50%,-50%) scale(${s}, ${s}) translate(50%, 50%) translate(${tx}px, ${ty}px)`
}

export default () => ({
  name: 'Autofit',

  mounted () {
    autofit.bind(this)()
    window.addEventListener('resize', autofit.bind(this))
    // TMP
    this.$refs.nuedeck.onmouseup = autofit.bind(this)
  },

})
