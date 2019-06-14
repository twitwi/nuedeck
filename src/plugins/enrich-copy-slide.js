
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
      s.contentElement.querySelectorAll('section:not(.no-libyli):not(.title-slide):not(.overview)>*>li:not(.no)').forEach( el => el.classList.add('step'))
    }

    let byId = {}
    for (let s of slides) {
      byId[s.key] = s.contentElement
    }
    for (let i in slides) {
      let s = slides[i]
      let toReplace = selfAndAll(s.contentElement, 'div[data-special][copy]')
      for (let old of toReplace) {
        let replacement = byId[old.getAttribute('copy')].cloneNode(true)
        replacement.removeAttribute('id')
        for (let a of old.getAttributeNames().filter(a => a !== 'copy' && a !== 'data-special')) {
          replacement.setAttribute(a, old.getAttribute(a))
        }
        replace(s, old, replacement)
      }
    }
  }
})
