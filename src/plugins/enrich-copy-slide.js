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
    let byId = {}
    for (let s of slides) {
      byId[s.key] = s.contentElement
    }
    let toRemove = []
    for (let i in slides) {
      let s = slides[i]
      // remove elements that were just here to be copiable
      if (s.contentElement.matches('[data-for-copy]')) {
        toRemove.unshift(i)
      }
      // replace content
      let toReplace = selfAndAll(s.contentElement, 'div[data-special][data-copy]')
      for (let old of toReplace) {
        let toCopy = old.getAttribute('data-copy')
        if (byId[toCopy] === undefined) {
          // TODO option to not alert (as in old deckjs)
          alert(`In @copy, could not find id '${toCopy}' \n in ${Object.keys(byId)}`)
          continue
        }
        let replacement = byId[toCopy].cloneNode(true)
        replacement.removeAttribute('id')
        for (let a of old.getAttributeNames().filter(a => a !== 'data-copy' && a !== 'data-special')) {
          replacement.setAttribute(a, old.getAttribute(a))
        }
        replace(s, old, replacement)
      }
    }
    for (let i of toRemove) {
      slides.splice(i, 1)
    }
  },
})
