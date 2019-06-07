
import SVGInjector from 'svg-injector'

async function svgInject(singleSVG, options) {
  return new Promise(resolve => {
    SVGInjector(singleSVG, {
      ...options,
      each (svg) {
        if (options.each) options.each(svg)
        resolve()
      }
    })
  })
}

export default () => ({
  name: 'SVG',

  async enrichSlideDeck(slides) {
    // TODO: could do it parallel
    for (let s of slides) {
      let toInject = s.contentElement.querySelectorAll(this.opts.core.selectors.svg)
      // TODO: here also could do it in parallel
      for (let singleSVG of toInject) {
        await svgInject(singleSVG, {
          each (svg) {
            console.log("INJECTED", svg)
          }
        })
      }
      if (toInject.length > 0) {
        console.log("CONTENT", s.contentElement.innerHTML)
      }
    }
  }
})
