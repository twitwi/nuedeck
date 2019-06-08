
import { selfAndAll } from './tools'
import Katex from 'katex'

export default () => ({
  name: 'Katex',
  /*async*/ enrichSlideDeck(slides) {
    let byId = {}
    for (let s of slides) {
      byId[s.key] = s.contentElement
    }
    for (let i in slides) {
      let s = slides[i]
      let toProcess = selfAndAll(s.contentElement, 'span[data-special][latex]')
      for (let span of toProcess) {
        span.removeAttribute('data-special')
        span.removeAttribute('latex')
        let v = `\\displaystyle ${span.textContent}`
        Katex.render(v, span, {
          throwOnError: false, // fail silently
          errorColor: '#ff0077',
          //breakOnUnsupportedCmds: false
        });
      }
    }
  }
})
