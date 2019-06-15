
import { selfAndAll } from './tools'

function replace(s, old, replacement) {
  if (old === s.contentElement) {
    s.contentElement = replacement
  } else {
    old.parentNode.replaceChild(replacement, old)
  }
}

export default () => ({
  name: 'CopySlide',
  /*async*/ enrichSlideDeck(slides) {

    for (let s of slides) {
      console.log(s.contentElement)
      let filter = '[data-root].libyli:not(.no-libyli)'
      let sel = filter + '>*>li:nth-of-type(n+1)'
      let cls = 'step'
      s.contentElement.querySelectorAll(sel).forEach(el => el.classList.add(cls))
    }
  }
})
