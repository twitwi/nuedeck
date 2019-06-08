
function selfAndAll(el, selector) {
  let res = []
  if (el.matches(selector)) res.push(el)
  res = [...res, ...el.querySelectorAll(selector)]
  return res
}

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
      console.log(s)
      byId[s.key] = s.contentElement
    }
    console.log("BID", byId)
    for (let i in slides) {
      let s = slides[i]
      let toReplace = selfAndAll(s.contentElement, 'div[data-special][copy]')
      if (i==9) console.log(i, toReplace, s.contentElement)
      for (let old of toReplace) {
        console.log(old, old.getAttribute('copy'), byId[old.getAttribute('copy')].innerHTML)
        let replacement = byId[old.getAttribute('copy')].cloneNode(true)
        replacement.removeAttribute('id')
        replace(s, old, replacement)
      }
    }
  }
})
